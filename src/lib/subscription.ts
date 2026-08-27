import type { TierId } from "@/lib/plans";

export type SubStatus = "pending" | "active";

/** One row in `public.subscriptions` — one lifetime VIP purchase. */
export type SubscriptionRow = {
  id: string;
  email: string;
  tier: TierId | null;
  status: SubStatus;
  invite_link: string | null;
  xendit_invoice_id: string | null;
  xendit_external_id: string;
  amount: number | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(v: unknown): v is string {
  return typeof v === "string" && v.length <= 254 && EMAIL_RE.test(v);
}
