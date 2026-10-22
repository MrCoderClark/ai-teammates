import { auth } from "@clerk/nextjs/server"
import { asc, desc, eq } from "drizzle-orm"

import { db } from "@/db"
import { chatMembers, chats } from "@/db/schema"

// The signed-in user's chats, most recent first, each with the bot that fronts it
export async function getChats() {
  // Redirects signed-out visitors to sign-in rather than erroring the layout
  const { userId } = await auth.protect()

  const rows = await db.query.chats.findMany({
    where: eq(chats.userId, userId),
    orderBy: desc(chats.lastMessageAt),
    with: {
      // Direct chats have one bot; group chats fall back to the first to join
      members: {
        orderBy: asc(chatMembers.joinedAt),
        limit: 1,
        with: { bot: true },
      },
    },
  })

  return rows.flatMap(({ members, ...chat }) => {
    const bot = members[0]?.bot
    return bot ? [{ ...chat, bot }] : []
  })
}
