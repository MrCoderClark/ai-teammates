import { openrouter } from "@openrouter/ai-sdk-provider"
import { chat } from "@trigger.dev/sdk/ai"
import { asc, eq } from "drizzle-orm"

import { db } from "@/db"
import { chatMembers } from "@/db/schema"

// The conversation is kept by the default transcript storage, keyed by chatId
export const chatAgent = chat.agent({
  id: "chat",
  run: async ({ chatId, messages, signal, streamText }) => {
    // Direct chats have one bot; group chats fall back to the first to join
    const member = await db.query.chatMembers.findFirst({
      where: eq(chatMembers.chatId, chatId),
      orderBy: asc(chatMembers.joinedAt),
      with: { bot: true },
    })
    if (!member) throw new Error(`No bot in chat ${chatId}`)

    const { bot } = member

    return streamText({
      model: openrouter(process.env.OPENROUTER_MODEL!),
      instructions: [
        `You are ${bot.name}. Your job: ${bot.job}.`,
        bot.instructions,
      ]
        .filter(Boolean)
        .join("\n\n"),
      messages,
      abortSignal: signal,
    })
  },
})
