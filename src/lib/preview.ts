/**
 * Frontend-design preview mode.
 *
 * When on, `/dashboard` renders with mock data and no Supabase auth so the UI can
 * be styled without real credentials. Double-gated: it has no effect in a
 * production build, so it cannot leak live even if the env var is set on Vercel.
 */
export const PREVIEW_MODE =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_PREVIEW_MODE === "1";
