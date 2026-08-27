export type TierId = "rookie" | "podium" | "constructor";

export type Plan = {
  id: TierId;
  /** podium finishing position — drives the watermark numeral */
  position: 1 | 2 | 3;
  name: string;
  tagline: string;
  priceIDR: number;
  accent: string;
  accentName: "cyan" | "red" | "papaya";
  durationDays: number;
  features: string[];
};

export const ACCENTS = {
  cyan: "#00f5d4",
  red: "#ff1801",
  papaya: "#ff8000",
} as const;

/**
 * Tier 2 ("podium") is P1 / pole position — the centre card.
 * Tier 1 ("rookie") is the red flanking card, Tier 3 ("constructor") is papaya.
 */
export const PLANS: Record<TierId, Plan> = {
  rookie: {
    id: "rookie",
    position: 2,
    name: "Rookie",
    tagline: "Get on the grid",
    priceIDR: 149_000,
    accent: ACCENTS.red,
    accentName: "red",
    durationDays: 30,
    features: [
      "Daily signal briefing",
      "VIP Telegram channel access",
      "Entry & exit alerts",
      "Weekly recap report",
    ],
  },
  podium: {
    id: "podium",
    position: 1,
    name: "Podium",
    tagline: "Pole position",
    priceIDR: 349_000,
    accent: ACCENTS.cyan,
    accentName: "cyan",
    durationDays: 30,
    features: [
      "Everything in Rookie",
      "Real-time high-conviction calls",
      "Position sizing guidance",
      "Priority analyst Q&A",
      "Risk-management playbook",
    ],
  },
  constructor: {
    id: "constructor",
    position: 3,
    name: "Constructor",
    tagline: "Run the whole garage",
    priceIDR: 899_000,
    accent: ACCENTS.papaya,
    accentName: "papaya",
    durationDays: 30,
    features: [
      "Everything in Podium",
      "Portfolio review calls",
      "Custom watchlist tuning",
      "Direct line to lead strategist",
    ],
  },
};

export const PLAN_LIST: Plan[] = [PLANS.rookie, PLANS.podium, PLANS.constructor];

export function isTierId(v: string): v is TierId {
  return v === "rookie" || v === "podium" || v === "constructor";
}

/** Leaderboard feature matrix — ranks continue from the podium (4, 5, 6…). */
export const LEADERBOARD: { feature: string; tiers: Record<TierId, boolean> }[] = [
  { feature: "VIP Telegram channel", tiers: { rookie: true, podium: true, constructor: true } },
  { feature: "Daily signal briefing", tiers: { rookie: true, podium: true, constructor: true } },
  { feature: "Real-time conviction calls", tiers: { rookie: false, podium: true, constructor: true } },
  { feature: "Position sizing guidance", tiers: { rookie: false, podium: true, constructor: true } },
  { feature: "Priority analyst Q&A", tiers: { rookie: false, podium: true, constructor: true } },
  { feature: "Portfolio review calls", tiers: { rookie: false, podium: false, constructor: true } },
  { feature: "Custom watchlist tuning", tiers: { rookie: false, podium: false, constructor: true } },
  { feature: "Direct strategist line", tiers: { rookie: false, podium: false, constructor: true } },
];

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}
