/** Normalize an Indian mobile number for WhatsApp's wa.me URL. */
export function sanitizePhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length === 10) return `91${digits}`;

  return null;
}
