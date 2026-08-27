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
 * The bot must be an admin with "invite users via link" permission.
 */
export async function issueInviteLink(label: string): Promise<string> {
  const link = await getBot().telegram.createChatInviteLink(chatId(), {
    member_limit: 1,
    name: label.slice(0, 32),
  });
  return link.invite_link;
}
