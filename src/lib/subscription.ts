import type { TierId } from "@/lib/plans";

export type SubStatus = "inactive" | "active" | "expired";

export type SubscriptionRow = {
  id: string;
  user_id: string;
  tier: TierId | null;
  status: SubStatus;
  current_period_end: string | null;
  telegram_user_id: number | null;
  invite_link: string | null;
  usage_count: number;
  usage_limit: number;
  xendit_invoice_id: string | null;
  created_at: string;
  updated_at: string;
};

const DAY_MS = 86_400_000;

/**
 * New period end after a successful payment: extend from whichever is later —
 * now, or the existing (still-active) period end.
 */
export function extendPeriod(
  currentEnd: string | null,
  durationDays: number,
  from: Date = new Date(),
): Date {
  const base =
    currentEnd && new Date(currentEnd) > from ? new Date(currentEnd) : from;
  return new Date(base.getTime() + durationDays * DAY_MS);
}

export function daysRemaining(currentEnd: string | null): number {
  if (!currentEnd) return 0;
  const ms = new Date(currentEnd).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / DAY_MS));
}

/** Parse "userId:tier:timestamp" back out of a Xendit external_id. */
export function parseExternalId(
  externalId: string,
): { userId: string; tier: string } | null {
  const [userId, tier] = externalId.split(":");
  if (!userId || !tier) return null;
  return { userId, tier };
}
