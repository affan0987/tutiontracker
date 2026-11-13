"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage(null);
    try {
      const supabase = createClient();
      const result = mode === "signin"
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` } });
      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) {
        setMessage({ text: "Check your email for a confirmation link, then come back to log in." });
      } else {
        router.replace("/dashboard"); router.refresh();
      }
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Something went wrong. Please try again.", error: true });
    } finally { setLoading(false); }
  }

  async function googleSignIn() {
    setLoading(true); setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` } });
      if (error) throw error;
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Could not connect to Google.", error: true }); setLoading(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 rounded-xl bg-canvas p-1" role="tablist" aria-label="Account access">
        {(["signin", "signup"] as const).map((value) => <button key={value} type="button" role="tab" aria-selected={mode === value} onClick={() => { setMode(value); setMessage(null); }} className={`focus-ring rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === value ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{value === "signin" ? "Log in" : "Create account"}</button>)}
      </div>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block"><span className="mb-1.5 block text-xs font-semibold text-ink">Email address</span><span className="relative block"><Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input className="field pl-10" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></span></label>
        <label className="block"><span className="mb-1.5 block text-xs font-semibold text-ink">Password</span><span className="relative block"><input className="field pr-11" type={showPassword ? "text" : "password"} autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" /><button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Hide password" : "Show password"} className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:text-ink">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>
        <button disabled={loading} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-wait disabled:opacity-70">{loading && <LoaderCircle size={16} className="animate-spin" />}{mode === "signin" ? "Log in" : "Create account"}</button>
      </form>
      <div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-line" /><span className="text-xs text-muted">or</span><div className="h-px flex-1 bg-line" /></div>
      <button type="button" disabled={loading} onClick={googleSignIn} className="focus-ring flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-canvas disabled:opacity-60"><GoogleMark /> Continue with Google</button>
      {message && <p role="status" className={`mt-4 rounded-xl px-3.5 py-3 text-sm leading-5 ${message.error ? "bg-rose-50 text-rose-700" : "bg-green-50 text-green-800"}`}>{message.text}</p>}
      {mode === "signup" && <p className="mt-4 text-center text-xs leading-5 text-muted">By creating an account, you agree to keep your sign-in details secure.</p>}
    </div>
  );
}

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 48 48" className="h-[18px] w-[18px]"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.77 17.74 9.5 24 9.5Z" transform="translate(0 4) scale(.9)"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 38.06 46.98 31.94 46.98 24.55Z" transform="translate(1 0) scale(.95)"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z" transform="translate(3 0) scale(.9)"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.13 1.43-4.86 2.27-8.18 2.27-6.26 0-11.57-4.27-13.47-10.01l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(1 0) scale(.95)"/></svg>;
}
