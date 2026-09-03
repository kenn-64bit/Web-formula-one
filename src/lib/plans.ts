export type TierId = "rookie" | "podium" | "constructor";

export type Plan = {
  id: TierId;
  /** podium finishing position — drives the watermark numeral */
  position: 1 | 2 | 3;
  name: string;
  tagline: string;
  /** one-time payment amount in Philippine pesos */
  price: number;
  accent: string;
  accentName: "cyan" | "red" | "papaya";
  features: string[];
};

// Key names kept (rookie/podium/constructor still map to red/cyan/papaya) so the
// swap stays churn-free; the values now follow the logo's gold/bronze palette.
export const ACCENTS = {
  cyan: "#e4b24a", // gold — podium / "pole position"
  red: "#c0763a", // copper — rookie
  papaya: "#8f7a4e", // khaki bronze — constructor
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
    price: 1_000,
    accent: ACCENTS.red,
    accentName: "red",
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
    price: 2_500,
    accent: ACCENTS.cyan,
    accentName: "cyan",
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
    price: 3_000,
    accent: ACCENTS.papaya,
    accentName: "papaya",
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

/** e.g. 1000 -> "1,000" (PHP) */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    amount,
  );
}
