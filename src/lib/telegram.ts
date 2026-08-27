import "server-only";
import { Telegraf } from "telegraf";
import { env } from "@/lib/env";

let bot: Telegraf | null = null;

function getBot(): Telegraf {
  if (!bot) bot = new Telegraf(env().TELEGRAM_BOT_TOKEN);
  return bot;
}

function chatId(): string | number {
  const raw = env().TELEGRAM_VIP_CHAT_ID;
  return /^-?\d+$/.test(raw) ? Number(raw) : raw;
}

/**
 * Create a single-use invite link to the VIP channel/group.
 * Bot must be an admin with "invite users via link" permission.
 */
export async function issueInviteLink(label: string): Promise<string> {
  const link = await getBot().telegram.createChatInviteLink(chatId(), {
    member_limit: 1,
    name: label.slice(0, 32),
  });
  return link.invite_link;
}

/**
 * Remove a user from the VIP channel without a permanent ban:
 * ban then immediately unban so they can re-join later on renewal.
 */
export async function kickMember(telegramUserId: number): Promise<void> {
  const id = chatId();
  await getBot().telegram.banChatMember(id, telegramUserId);
  await getBot().telegram.unbanChatMember(id, telegramUserId, {
    only_if_banned: true,
  });
}

/** Best-effort DM of the invite link (only works if the user has /start-ed the bot). */
export async function sendInvite(
  telegramUserId: number,
  link: string,
): Promise<void> {
  await getBot().telegram.sendMessage(
    telegramUserId,
    `🏁 Your VIP Signals access is live.\n\nSingle-use invite link:\n${link}`,
  );
}
