import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Add your Supabase URL and anon key to .env.local.");

  return createServerClient(url, key, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set(name: string, value: string, options: any) {
        try { cookieStore.set({ name, value, ...options }); } catch { /* Server Components cannot write cookies. */ }
      },
      remove(name: string, options: any) {
        try { cookieStore.set({ name, value: "", ...options }); } catch { /* Middleware refreshes the session. */ }
      },
    },
  });
}
