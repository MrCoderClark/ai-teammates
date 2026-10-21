"use server"

import { auth } from "@clerk/nextjs/server"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import {
  bots,
  chatMembers,
  chats,
  insertBotSchema,
  type InsertBot,
} from "@/db/schema"

export async function createBot(input: InsertBot) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) throw new Error("Unauthorized")

  const values = insertBotSchema.parse(input)

  // IDs up front so the member row can reference both in one batch
  const botId = nanoid()
  const chatId = nanoid()

  // neon-http runs a batch as a single transaction
  const [[bot]] = await db.batch([
    db
      .insert(bots)
      .values({ ...values, id: botId, userId })
      .returning(),
    db.insert(chats).values({ id: chatId, userId, kind: "direct" }),
    db.insert(chatMembers).values({ chatId, botId }),
  ])

  revalidatePath("/")
  return bot
}
