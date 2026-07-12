import { useEffect, useState } from "react";
import { useT } from "../../shared/i18n";
import {
  useAccount, signInWithEmail, signOut, createCouple, joinCouple,
} from "../../shared/state/account";

const inputStyle: React.CSSProperties = {
  width: "100%", font: "inherit", fontSize: 16,
  color: "var(--ink)", background: "rgba(255,255,255,.09)",
  border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px",
};

export function AccountPage() {
  const t = useT();
  const acc = useAccount();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // Auto-join when opened via an invite link (/account?join=CODE)
  useEffect(() => {
    const joinParam = new URLSearchParams(location.search).get("join");
    if (joinParam) setCode(joinParam);
  }, []);

  const sendLink = async () => {
    setBusy(true);
    const ok = await signInWithEmail(email.trim());
    setBusy(false);
    setMsg(ok ? t.accLinkSent : t.aiError);
  };

  const doCreate = async () => {
    setBusy(true);
    const invite = await createCouple();
    setBusy(false);
    if (!invite) setMsg(t.aiError);
  };

  const doJoin = async () => {
    setBusy(true);
    const r = await joinCouple(code);
    setBusy(false);
    setMsg(r === "ok" ? t.accJoined : r === "not_found" ? t.accCodeNotFound : r === "full" ? t.accCoupleFull : t.aiError);
  };

  const copyInvite = async () => {
    const url = `${location.origin}/account?join=${acc.inviteCode}`;
    try { await navigator.clipboard.writeText(url); setMsg(t.shareCopied); } catch { prompt("URL", url); }
  };

  if (!acc.ready) {
    return <main className="page"><p className="muted">…</p></main>;
  }

  return (
    <main className="page">
      <h1 className="page-title">👤 {t.accTitle}</h1>

      {!acc.session ? (
        <section className="card">
          <p className="label">{t.accSignIn}</p>
          <p className="muted" style={{ margin: "0 0 10px" }}>{t.accSignInNote}</p>
          <input type="email" inputMode="email" autoComplete="email" placeholder="you@example.com"
            value={email} style={inputStyle} onChange={e => setEmail(e.target.value)} />
          <div className="row" style={{ marginTop: 10 }}>
            <button disabled={busy || !email.includes("@")} onClick={sendLink}>{t.accSendLink}</button>
            <span className="muted">{msg}</span>
          </div>
        </section>
      ) : !acc.profile?.couple_id ? (
        <>
          <section className="card">
            <p className="label">{t.accCreateLabel}</p>
            <p className="muted" style={{ margin: "0 0 10px" }}>{t.accCreateNote}</p>
            <button disabled={busy} onClick={doCreate}>💞 {t.accCreateBtn}</button>
          </section>
          <section className="card">
            <p className="label">{t.accJoinLabel}</p>
            <div className="row">
              <input type="text" placeholder={t.accCodePh} value={code}
                style={{ ...inputStyle, width: "auto", flex: 1 }} onChange={e => setCode(e.target.value)} />
              <button disabled={busy || !code.trim()} onClick={doJoin}>{t.accJoinBtn}</button>
            </div>
            <p className="muted" style={{ marginTop: 8 }}>{msg}</p>
          </section>
        </>
      ) : (
        <>
          <section className="card">
            <p className="label">{t.accCoupleLabel}</p>
            <p style={{ margin: 0 }}>
              {t.accSignedInAs}: <strong>{acc.session.user.email}</strong>（{acc.profile.side === "A" ? "🗼 A" : "🏔️ B"}）
            </p>
            {acc.inviteCode ? (
              <>
                <p className="muted" style={{ margin: "10px 0 6px" }}>{t.accInviteNote}</p>
                <div className="row">
                  <code style={{ fontSize: "1.2rem", letterSpacing: ".1em" }}>{acc.inviteCode}</code>
                  <button onClick={copyInvite}>{t.accCopyInvite}</button>
                  <span className="muted">{msg}</span>
                </div>
              </>
            ) : (
              <p className="muted" style={{ margin: "10px 0 0" }}>✅ {t.accPaired}</p>
            )}
          </section>
          <section className="card">
            <button onClick={() => { void signOut(); }}>{t.accSignOut}</button>
          </section>
        </>
      )}
    </main>
  );
}
