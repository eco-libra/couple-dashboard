// Shared Supabase config. The anon key is public by design (RLS applies).
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://llllihlioyxffwbuxsjf.supabase.co";
export const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbGxpaGxpb3l4ZmZ3YnV4c2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTczMTIsImV4cCI6MjA5OTA5MzMxMn0.anl9Yx12CMWerCHIyobTwiZJWazL504vhyEZWOz269E";

export const sbHeaders = {
  apikey: SUPABASE_ANON,
  Authorization: `Bearer ${SUPABASE_ANON}`,
};

/** Authenticated Supabase client (v2 multi-tenant surface). */
export const sb = createClient(SUPABASE_URL, SUPABASE_ANON);
