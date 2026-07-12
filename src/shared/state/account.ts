// v2 account state: Supabase session + profile + couple membership.
import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { sb } from "../services/supabase";

export interface Profile {
  user_id: string;
  couple_id: string | null;
  side: "A" | "B" | null;
  name: string;
  emoji: string;
  lang: string;
  tz: string;
  city: string;
}

export interface AccountState {
  ready: boolean;           // initial session check finished
  session: Session | null;
  profile: Profile | null;
  inviteCode: string | null; // present when the couple has a free slot
}

let state: AccountState = { ready: false, session: null, profile: null, inviteCode: null };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(fn => fn());

function set(patch: Partial<AccountState>) {
  state = { ...state, ...patch };
  emit();
}

export function useAccount(): AccountState {
  return useSyncExternalStore(
    fn => (listeners.add(fn), () => listeners.delete(fn)),
    () => state,
  );
}

async function loadProfile(): Promise<void> {
  if (!state.session) { set({ profile: null, inviteCode: null }); return; }
  const { data } = await sb.from("profiles").select("*").eq("user_id", state.session.user.id).maybeSingle();
  let inviteCode: string | null = null;
  if (data?.couple_id) {
    const { data: couple } = await sb.from("couples").select("invite_code").eq("id", data.couple_id).maybeSingle();
    const { data: members } = await sb.from("profiles").select("user_id").eq("couple_id", data.couple_id);
    if ((members?.length ?? 0) < 2) inviteCode = couple?.invite_code ?? null;
  }
  set({ profile: (data as Profile) ?? null, inviteCode });
}

// Initialize once at module load.
void sb.auth.getSession().then(({ data }) => {
  set({ session: data.session, ready: true });
  void loadProfile();
});
sb.auth.onAuthStateChange((_event, session) => {
  set({ session });
  void loadProfile();
});

export async function signInWithEmail(email: string): Promise<boolean> {
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${location.origin}/account` },
  });
  return !error;
}

export async function signOut(): Promise<void> {
  await sb.auth.signOut();
}

export async function createCouple(): Promise<string | null> {
  const { data, error } = await sb.rpc("create_couple");
  if (error) return null;
  await loadProfile();
  return data?.invite_code ?? null;
}

export async function joinCouple(code: string): Promise<"ok" | "not_found" | "full" | "error"> {
  const { data, error } = await sb.rpc("join_couple", { code: code.trim() });
  if (error) return "error";
  if (data?.error) return data.error as "not_found" | "full";
  await loadProfile();
  return "ok";
}

export async function updateProfile(patch: Partial<Pick<Profile, "name" | "emoji" | "lang" | "tz" | "city">>): Promise<void> {
  if (!state.session) return;
  await sb.from("profiles").update(patch).eq("user_id", state.session.user.id);
  await loadProfile();
}
