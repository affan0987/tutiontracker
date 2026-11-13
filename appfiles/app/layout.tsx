import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Feesly — Tuition Fee Tracker",
  description: "A calmer way to track tuition fees and send WhatsApp reminders.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body className="font-sans antialiased">{children}</body></html>;
}
