"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, LoaderCircle, LogOut, MessageCircle, Plus, Trash2, Users, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sanitizePhone } from "@/lib/phone";

type Student = {
  id: string;
  tutor_id: string;
  student_name: string;
  parent_name: string;
  parent_phone: string;
  monthly_fee: number;
  start_month: string;
  created_at: string;
};
type Payment = {
  id?: string;
  student_id: string;
  tutor_id?: string;
  month_year?: string;
  amount?: number;
  is_paid: boolean;
  paid_at: string | null;
};
type StudentForm = {
  student_name: string;
  parent_name: string;
  parent_phone: string;
  monthly_fee: string;
  start_month: string;
};
type Notice = { message: string; error: boolean };

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(value: string): string {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

const emptyForm = (): StudentForm => ({ student_name: "", parent_name: "", parent_phone: "", monthly_fee: "", start_month: currentMonth() });

export default function DashboardClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [month, setMonth] = useState(currentMonth);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Record<string, Payment>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(() => new Set());
  const [signingOut, setSigningOut] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      const supabase = createClient();
      const [studentResult, paymentResult] = await Promise.all([
        supabase.from("students").select("id, tutor_id, student_name, parent_name, parent_phone, monthly_fee, start_month, created_at").eq("tutor_id", userId).order("created_at", { ascending: false }),
        supabase.from("payments").select("id, student_id, tutor_id, month_year, amount, is_paid, paid_at").eq("tutor_id", userId).eq("month_year", month),
      ]);
      if (studentResult.error) throw studentResult.error;
      if (paymentResult.error) throw paymentResult.error;
      setStudents((studentResult.data ?? []) as Student[]);
      const nextPayments: Record<string, Payment> = {};
      for (const row of paymentResult.data ?? []) {
        const payment = row as Payment;
        nextPayments[payment.student_id] = payment;
      }
      setPayments(nextPayments);
    } catch (error) {
      setNotice({ message: errorMessage(error, "Could not load your dashboard."), error: true });
    } finally {
      setLoading(false);
    }
  }, [month, userId]);

  useEffect(() => { void loadData(); }, [loadData]);

  const visibleStudents = useMemo(
    () => students.filter((student) => student.start_month <= month),
    [students, month],
  );
  const feeFor = (student: Student) => Number(payments[student.id]?.amount ?? student.monthly_fee);
  const expected = visibleStudents.reduce((total, student) => total + feeFor(student), 0);
  const collected = visibleStudents.reduce((total, student) => total + (payments[student.id]?.is_paid ? feeFor(student) : 0), 0);
  const pending = expected - collected;

  async function addStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    const phone = sanitizePhone(form.parent_phone);
    if (!phone) {
      setNotice({ message: "Enter a 10-digit number, a 0-prefixed 11-digit number, or a 12-digit number starting with 91.", error: true });
      setSaving(false);
      return;
    }
    const fee = Number(form.monthly_fee);
    if (!Number.isFinite(fee) || fee < 0) {
      setNotice({ message: "Enter a valid monthly fee.", error: true });
      setSaving(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("students").insert({
        tutor_id: userId,
        student_name: form.student_name.trim(),
        parent_name: form.parent_name.trim(),
        parent_phone: phone,
        monthly_fee: fee,
        start_month: form.start_month,
      }).select("id, tutor_id, student_name, parent_name, parent_phone, monthly_fee, start_month, created_at").single();
      if (error) throw error;
      setStudents((current) => [data as Student, ...current]);
      setForm(emptyForm());
      setShowForm(false);
      setNotice({ message: `${form.student_name.trim()} has been added.`, error: false });
    } catch (error) {
      setNotice({ message: errorMessage(error, "Could not add student."), error: true });
    } finally {
      setSaving(false);
    }
  }

  async function togglePayment(student: Student) {
    const oldPayment = payments[student.id];
    const isPaid = !oldPayment?.is_paid;
    const fee = feeFor(student);
    const optimistic: Payment = {
      ...oldPayment,
      student_id: student.id,
      tutor_id: userId,
      month_year: month,
      amount: fee,
      is_paid: isPaid,
      paid_at: isPaid ? new Date().toISOString() : null,
    };
    setPayments((current) => ({ ...current, [student.id]: optimistic }));
    setBusyIds((current) => new Set(current).add(student.id));
    setNotice(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("payments").upsert({
        student_id: student.id,
        tutor_id: userId,
        month_year: month,
        amount: fee,
        is_paid: isPaid,
        paid_at: isPaid ? optimistic.paid_at : null,
      }, { onConflict: "student_id,month_year" }).select("id, student_id, tutor_id, month_year, amount, is_paid, paid_at").single();
      if (error) throw error;
      setPayments((current) => ({ ...current, [student.id]: data as Payment }));
    } catch (error) {
      setPayments((current) => {
        const next = { ...current };
        if (oldPayment) next[student.id] = oldPayment;
        else delete next[student.id];
        return next;
      });
      setNotice({ message: errorMessage(error, "Could not update payment status."), error: true });
    } finally {
      setBusyIds((current) => { const next = new Set(current); next.delete(student.id); return next; });
    }
  }

  async function removeStudent(student: Student) {
    if (!window.confirm(`Remove ${student.student_name} and their payment history? This cannot be undone.`)) return;
    setBusyIds((current) => new Set(current).add(student.id));
    setNotice(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("students").delete().eq("id", student.id).eq("tutor_id", userId);
      if (error) throw error;
      setStudents((current) => current.filter((item) => item.id !== student.id));
      setPayments((current) => { const next = { ...current }; delete next[student.id]; return next; });
      setNotice({ message: `${student.student_name} has been removed.`, error: false });
    } catch (error) {
      setNotice({ message: errorMessage(error, "Could not remove student."), error: true });
    } finally {
      setBusyIds((current) => { const next = new Set(current); next.delete(student.id); return next; });
    }
  }

  async function signOut() {
    setSigningOut(true);
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setNotice({ message: errorMessage(error, "Could not sign out."), error: true });
      setSigningOut(false);
    }
  }

  function reminderUrl(student: Student): string {
    const fee = feeFor(student);
    const message = `Hi ${student.parent_name}, hope you're doing well! Just a gentle reminder that ${student.student_name}'s tuition fee of ₹${money.format(fee).replace(/^₹\s?/, "")} for ${formatMonth(month)} is due. Thank you!`;
    return `https://wa.me/${student.parent_phone}?text=${encodeURIComponent(message)}`;
  }

  return (
    <main className="min-h-screen bg-canvas pb-12">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-7">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Feesly home"><span className="grid h-9 w-9 place-items-center rounded-xl bg-green-600 text-white"><span className="text-lg font-black">f.</span></span><span className="text-lg font-bold tracking-tight">feesly<span className="text-green-600">.</span></span></Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <label className="relative"><span className="sr-only">Select month</span><CalendarDays size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" /><input type="month" value={month} onChange={(event) => setMonth(event.target.value || currentMonth())} className="focus-ring w-[145px] rounded-xl border border-line bg-white py-2.5 pl-8 pr-2 text-xs font-semibold text-ink sm:w-[165px] sm:pl-9 sm:pr-3 sm:text-sm" /></label>
            <button type="button" onClick={() => void signOut()} disabled={signingOut} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink hover:bg-canvas disabled:opacity-60"><LogOut size={15} /><span className="hidden sm:inline">{signingOut ? "Signing out…" : "Sign out"}</span></button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 pt-7 sm:px-7 sm:pt-9">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-muted">Your monthly view</p><h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">Tuition overview</h1><p className="mt-1.5 text-sm text-muted">Fees for <span className="font-medium text-ink">{formatMonth(month)}</span></p></div><button type="button" onClick={() => { setShowForm((value) => !value); setForm((current) => ({ ...current, start_month: month })); }} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"><Plus size={17} /> Add a student</button></div>

        {notice && <div role="alert" className={`mt-5 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${notice.error ? "border-rose-100 bg-rose-50 text-rose-700" : "border-green-100 bg-green-50 text-green-800"}`}><span>{notice.message}</span><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message"><X size={16} /></button></div>}

        {showForm && <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.13em] text-green-700">New student</p><h2 className="mt-1 text-lg font-semibold tracking-tight">Add a student</h2></div><button type="button" onClick={() => setShowForm(false)} className="focus-ring rounded-lg p-1.5 text-muted hover:bg-canvas" aria-label="Close form"><X size={18} /></button></div>
          <form onSubmit={(event) => void addStudent(event)} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Student name" value={form.student_name} placeholder="e.g. Aarav Sharma" onChange={(student_name) => setForm((old) => ({ ...old, student_name }))} required />
            <Field label="Parent name" value={form.parent_name} placeholder="e.g. Priya Sharma" onChange={(parent_name) => setForm((old) => ({ ...old, parent_name }))} required />
            <Field label="Parent WhatsApp number" value={form.parent_phone} placeholder="Mobile number" onChange={(parent_phone) => setForm((old) => ({ ...old, parent_phone }))} inputMode="tel" required />
            <Field label="Monthly fee (₹)" value={form.monthly_fee} placeholder="e.g. 4000" onChange={(monthly_fee) => setForm((old) => ({ ...old, monthly_fee }))} type="number" min="0" step="1" required />
            <Field label="Starting month" value={form.start_month} onChange={(start_month) => setForm((old) => ({ ...old, start_month }))} type="month" required />
            <div className="flex items-center justify-end gap-2 sm:col-span-2 lg:col-span-5"><button type="button" onClick={() => setShowForm(false)} className="focus-ring rounded-xl px-4 py-2.5 text-sm font-semibold text-muted hover:bg-canvas">Cancel</button><button disabled={saving} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">{saving && <LoaderCircle size={15} className="animate-spin" />}Save student</button></div>
          </form>
        </section>}

        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4" aria-label="Fee summary">
          <Metric label="Total Expected" amount={expected} />
          <Metric label="Total Collected" amount={collected} tone="green" />
          <Metric label="Total Pending" amount={pending} tone="rose" />
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-line px-4 py-5 sm:px-6"><div><h2 className="text-base font-semibold tracking-tight">Your students</h2><p className="mt-1 text-xs text-muted">{visibleStudents.length} active for {formatMonth(month)}</p></div></div>
          {loading ? <div className="flex items-center justify-center gap-2 px-4 py-14 text-sm text-muted"><LoaderCircle size={17} className="animate-spin" />Loading students and payments…</div>
            : students.length === 0 ? <div className="px-6 py-14 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-green-50 text-green-700"><Users size={24} /></div><h3 className="mt-4 text-base font-semibold">No students yet, add your first one</h3><p className="mt-2 text-sm text-muted">Keep monthly fees organized and send a reminder when it’s due.</p><button type="button" onClick={() => { setForm((old) => ({ ...old, start_month: month })); setShowForm(true); }} className="focus-ring mt-5 inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"><Plus size={16} />Add your first student</button></div>
            : visibleStudents.length === 0 ? <div className="px-6 py-14 text-center text-sm text-muted">No students had started by {formatMonth(month)}.</div>
            : <div className="divide-y divide-line">{visibleStudents.map((student) => {
              const payment = payments[student.id];
              const isPaid = payment?.is_paid ?? false;
              const fee = feeFor(student);
              const busy = busyIds.has(student.id);
              return <article key={student.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-3"><button type="button" onClick={() => void togglePayment(student)} disabled={busy} aria-label={`Mark ${student.student_name} ${isPaid ? "unpaid" : "paid"} for ${formatMonth(month)}`} aria-pressed={isPaid} className={`focus-ring grid h-6 w-6 shrink-0 place-items-center rounded-lg border transition ${isPaid ? "border-green-600 bg-green-600 text-white" : "border-[#d6dfd9] bg-white text-transparent hover:border-green-500"}`}>{busy ? <LoaderCircle size={15} className="animate-spin text-green-700" /> : isPaid && <Check size={15} strokeWidth={3} />}</button><div className="min-w-0 flex-1"><h3 className={`truncate text-sm font-semibold ${isPaid ? "text-muted line-through" : "text-ink"}`}>{student.student_name}</h3><p className="mt-1 truncate text-xs text-muted">Parent: {student.parent_name} · {student.parent_phone}</p></div></div>
                <div className="flex items-center justify-between gap-3 pl-9 sm:justify-end sm:pl-0"><p className="text-sm font-semibold tabular-nums">{money.format(fee)}</p><div className="flex items-center gap-1">{!isPaid && <a href={reminderUrl(student)} target="_blank" rel="noopener noreferrer" aria-label={`Send WhatsApp reminder to ${student.parent_name}`} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-green-100 bg-green-50 px-2.5 py-2 text-xs font-semibold text-green-700 hover:bg-green-100"><MessageCircle size={15} /><span>WhatsApp Reminder</span></a>}<button type="button" onClick={() => void removeStudent(student)} disabled={busy} aria-label={`Remove ${student.student_name}`} className="focus-ring rounded-lg p-2 text-muted hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"><Trash2 size={16} /><span className="sr-only">Remove</span></button></div></div>
              </article>;
            })}</div>}
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, required, type = "text", min, step, inputMode }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean; type?: string; min?: string; step?: string; inputMode?: "text" | "tel" | "numeric" }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-ink">{label}</span><input className="field" type={type} inputMode={inputMode} min={min} step={step} required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function Metric({ label, amount, tone = "neutral" }: { label: string; amount: number; tone?: "neutral" | "green" | "rose" }) {
  const color = tone === "green" ? "text-green-700" : tone === "rose" ? "text-rose-600" : "text-ink";
  return <article className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5"><p className="text-xs font-medium text-muted sm:text-sm">{label}</p><p className={`mt-3 text-2xl font-semibold tracking-tight tabular-nums sm:text-[1.75rem] ${color}`}>{money.format(amount)}</p></article>;
}
