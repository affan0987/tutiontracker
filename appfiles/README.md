# Feesly — Tuition Fee Tracker

A mobile-first tuition fee tracker for independent tutors. It uses Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres, and WhatsApp click-to-chat links.

## Get started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key.
3. Run the SQL in `schema.sql` in the Supabase SQL Editor.
4. In Supabase Authentication settings, enable Email and Google providers. Add your local and deployed app URLs to the allowed redirect URLs (for example, `http://localhost:3000/auth/callback`).
5. Start the app with `npm run dev`.

Use `npm run typecheck` to check TypeScript and `npm run build` to create a production build.

## Included

- Public landing page and responsive tutor dashboard.
- Email/password sign-in and sign-up, Google OAuth, auth callback, protected dashboard, and sign-out.
- Tutor-owned student and monthly payment records, enforced by row-level security.
- Month-specific fee summaries, optimistic payment updates, student search, add/remove flows, and prefilled WhatsApp reminders.

WhatsApp reminders open in a new tab for the tutor to review and send. The app does not send messages automatically.
