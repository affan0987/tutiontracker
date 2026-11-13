import Link from "next/link";
import { ArrowDown, ArrowRight, Check, CheckCircle2, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

const benefits = [
  { icon: CheckCircle2, title: "Know exactly what’s due", copy: "See every student’s payment status and your monthly totals at a glance." },
  { icon: MessageCircle, title: "Remind with one tap", copy: "Send a kind, ready-to-go WhatsApp message when a fee is pending." },
  { icon: ShieldCheck, title: "Your records stay yours", copy: "A private workspace for your students, protected by secure sign-in." },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Feesly home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-green-600 text-white"><span className="text-lg font-black">f.</span></span>
          <span className="text-lg font-bold tracking-tight">feesly<span className="text-green-600">.</span></span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="focus-ring rounded-xl px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-canvas sm:px-4">Log in</Link>
          <Link href="/dashboard" className="focus-ring inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 sm:px-5">Get started <ArrowRight size={15} /></Link>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-12 lg:pb-32 lg:pt-24">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3.5 py-2 text-xs font-semibold text-green-700"><Sparkles size={14} /> Made for independent tutors in India</div>
          <h1 className="max-w-2xl text-[2.8rem] font-semibold leading-[1.09] tracking-[-0.055em] text-ink sm:text-6xl lg:text-[4.25rem]">Track Tuition Fees &amp; Send WhatsApp Reminders Effortlessly</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">Keep monthly payments organized and send thoughtful reminders in just a few taps.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/dashboard" className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-600/15 transition hover:-translate-y-0.5 hover:bg-green-700">Start tracking for free <ArrowRight size={16} /></Link>
            <a href="#how-it-works" className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-ink transition hover:bg-canvas">See how it works <ArrowDown size={15} /></a>
          </div>
          <p className="mt-5 text-xs text-muted">Simple, private, and built around the way you teach.</p>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="absolute -inset-8 rounded-[2.5rem] bg-green-50/80 blur-2xl" />
          <div className="relative rounded-[1.65rem] border border-line bg-white p-4 shadow-float sm:rounded-[2rem] sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
              <div><p className="text-xs font-medium text-muted">MONTHLY OVERVIEW</p><h2 className="mt-1 text-lg font-semibold tracking-tight">Your teaching, at a glance</h2></div>
              <span className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink">November 2026</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5 py-5 sm:gap-3">
              {[{ label: "Expected", amount: "₹24,000", style: "text-ink" }, { label: "Collected", amount: "₹16,000", style: "text-green-700" }, { label: "Pending", amount: "₹8,000", style: "text-rose-600" }].map((metric) => <div key={metric.label} className="rounded-xl bg-canvas p-3 sm:p-4"><p className="text-[10px] font-medium text-muted sm:text-xs">{metric.label}</p><p className={`mt-2 text-sm font-bold tracking-tight sm:text-lg ${metric.style}`}>{metric.amount}</p></div>)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 rounded-xl px-2 py-3 sm:px-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f5e8da] text-xs font-bold text-[#88634a]">AS</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Aarav Sharma</p><p className="mt-0.5 text-xs text-muted">Class 10 · ₹4,000 / month</p></div><span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700 sm:text-xs">Paid</span></div>
              <div className="flex items-center gap-3 rounded-xl bg-[#fcfdfc] px-2 py-3 sm:px-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e5eefa] text-xs font-bold text-[#52749a]">SI</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Siya Iyer</p><p className="mt-0.5 text-xs text-muted">Class 8 · ₹4,000 / month</p></div><span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-600 sm:text-xs">Pending</span></div>
              <div className="flex items-center gap-3 rounded-xl px-2 py-3 sm:px-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f1e7f6] text-xs font-bold text-[#805c91]">RK</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Rohan Kumar</p><p className="mt-0.5 text-xs text-muted">Class 12 · ₹4,000 / month</p></div><span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700 sm:text-xs">Paid</span></div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#dcefe1] bg-green-50/70 p-3 text-xs text-green-700"><MessageCircle size={16} className="shrink-0" /><span>A friendly reminder is ready to send to Siya’s parent.</span></div>
          </div>
          <div className="absolute -bottom-6 -left-4 hidden items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-xs font-semibold shadow-card sm:flex"><Check size={15} className="text-green-600" /> No spreadsheets needed</div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-line bg-canvas/70 px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-xl text-center"><p className="text-xs font-bold uppercase tracking-[0.15em] text-green-700">Less admin, more teaching</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Your fees, all in one place.</h2><p className="mt-4 text-sm leading-6 text-muted sm:text-base">Everything you need to keep tuition payments moving smoothly, without the busywork.</p></div>
          <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-5">{benefits.map(({ icon: Icon, title, copy }, index) => <article key={title} className="rounded-2xl border border-line bg-white p-6 sm:p-7"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700"><Icon size={20} /></div><p className="mt-6 text-xs font-semibold text-green-700">0{index + 1}</p><h3 className="mt-2 text-base font-semibold tracking-tight">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{copy}</p></article>)}</div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-7 text-xs text-muted sm:flex-row sm:px-8 lg:px-12"><Link href="/" className="font-semibold text-ink">feesly<span className="text-green-600">.</span></Link><p>Made to make teaching days a little easier.</p><Link href="/login" className="focus-ring rounded-lg px-2 py-1 font-medium hover:text-green-700">Log in to your account <ArrowRight size={13} className="ml-1 inline" /></Link></footer>
    </main>
  );
}
