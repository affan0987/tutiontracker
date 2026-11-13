import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/components/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-canvas px-5 py-12">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-green-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-[#e8f1ea] blur-3xl" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="focus-ring mb-8 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-muted transition hover:text-ink"><ArrowLeft size={15} /> Back to home</Link>
        <section className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-9">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Feesly home"><span className="grid h-9 w-9 place-items-center rounded-xl bg-green-600 text-white"><span className="text-lg font-black">f.</span></span><span className="text-lg font-bold tracking-tight">feesly<span className="text-green-600">.</span></span></Link>
          <div className="mt-8"><p className="text-xs font-bold uppercase tracking-[0.14em] text-green-700">Your teaching, in order</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Welcome to Feesly</h1><p className="mt-2 text-sm leading-6 text-muted">Log in or create your tutor account to get started.</p></div>
          <div className="mt-7"><LoginForm /></div>
        </section>
        <p className="mt-6 text-center text-xs text-muted">Private by design. Your student details belong to you.</p>
      </div>
    </main>
  );
}
