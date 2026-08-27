import "server-only";
import { env, siteUrl } from "@/lib/env";
import { PLANS, type TierId } from "@/lib/plans";

/**
 * Send the VIP Telegram invite link via Resend. Raw fetch — no SDK dependency.
 * Throws on a non-2xx response so the caller can log it (delivery is
 * best-effort; the link is also shown on /success and /status).
 */
export async function sendInviteEmail(
  to: string,
  { tier, inviteLink }: { tier: TierId; inviteLink: string },
): Promise<void> {
  const e = env();
  const planName = PLANS[tier].name;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#0b0e17">
      <h2 style="margin:0 0 8px">Your APEX Signals VIP access is live</h2>
      <p style="margin:0 0 16px">Plan: <strong>${planName}</strong> — lifetime access.</p>
      <p style="margin:0 0 8px">Single-use invite link to the VIP Signals channel:</p>
      <p style="margin:0 0 20px"><a href="${inviteLink}">${inviteLink}</a></p>
      <p style="margin:0;color:#8b93a7;font-size:13px">
        Keep this email — you can also retrieve your link any time at
        <a href="${siteUrl}/status">${siteUrl}/status</a>.
      </p>
    </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${e.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: e.RESEND_FROM,
      to,
      subject: "Your APEX Signals VIP invite link",
      html,
      text:
        `Your APEX Signals VIP access is live.\n\n` +
        `Plan: ${planName} — lifetime access.\n\n` +
        `Single-use invite link:\n${inviteLink}\n\n` +
        `Retrieve it any time at ${siteUrl}/status`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}
