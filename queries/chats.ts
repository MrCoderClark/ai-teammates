import { auth } from "@clerk/nextjs/server"
import { and, asc, eq } from "drizzle-orm"

import { db } from "@/db"
import { chatMembers, chats } from "@/db/schema"

// One of the signed-in user's chats with the bot that fronts it, or null if it isn't theirs
export async function getChat(chatId: string) {
  // Redirects signed-out visitors to sign-in
  const { userId } = await auth.protect()

  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
    with: {
      // Direct chats have one bot; group chats fall back to the first to join
      members: {
        orderBy: asc(chatMembers.joinedAt),
        limit: 1,
        with: { bot: true },
      },
    },
  })

  if (!chat) return null

  const { members, ...rest } = chat
  const bot = members[0]?.bot
  return bot ? { ...rest, bot } : null
}
