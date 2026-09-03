import type { TierId } from "@/lib/plans";

export type SubStatus = "pending" | "active";

/** One row in `public.subscriptions` — one lifetime VIP purchase. */
export type SubscriptionRow = {
  id: string;
  email: string;
  tier: TierId | null;
  status: SubStatus;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  invite_link: string | null;
  xendit_invoice_id: string | null;
  xendit_external_id: string;
  amount: number | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{6,19}$/;

export function isValidEmail(v: unknown): v is string {
  return typeof v === "string" && v.length <= 254 && EMAIL_RE.test(v);
}

/** A person's name field: non-empty after trim, at most 80 chars. */
export function isValidName(v: unknown): v is string {
  return typeof v === "string" && v.trim().length >= 1 && v.trim().length <= 80;
}

/** Loose phone check — digits/spaces/dashes, optional leading +, 7–20 chars. */
export function isValidPhone(v: unknown): v is string {
  return typeof v === "string" && PHONE_RE.test(v.trim());
}
