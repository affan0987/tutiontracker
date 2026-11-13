-- Tuition Fee Tracker schema. Run this in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references auth.users(id) on delete cascade,
  student_name text not null,
  parent_name text not null,
  parent_phone text not null,
  monthly_fee numeric not null check (monthly_fee >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  tutor_id uuid not null references auth.users(id) on delete cascade,
  month_year text not null check (month_year ~ '^\d{4}-\d{2}$'),
  is_paid boolean not null default false,
  paid_at timestamptz,
  constraint payments_student_month_unique unique (student_id, month_year)
);

create index if not exists students_tutor_id_idx on public.students(tutor_id);
create index if not exists payments_tutor_month_idx on public.payments(tutor_id, month_year);

alter table public.students enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Tutors manage their own students" on public.students;
create policy "Tutors manage their own students"
  on public.students for all
  using (auth.uid() = tutor_id)
  with check (auth.uid() = tutor_id);

drop policy if exists "Tutors manage their own payments" on public.payments;
create policy "Tutors manage their own payments"
  on public.payments for all
  using (auth.uid() = tutor_id)
  with check (
    auth.uid() = tutor_id
    and exists (
      select 1 from public.students
      where students.id = student_id and students.tutor_id = auth.uid()
    )
  );
