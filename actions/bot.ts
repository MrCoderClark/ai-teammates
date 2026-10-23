"use server"

import { auth } from "@clerk/nextjs/server"
import { and, eq, inArray } from "drizzle-orm"
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

export async function updateBot(id: string, input: InsertBot) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) throw new Error("Unauthorized")

  const values = insertBotSchema.parse(input)

  // Scoped to the owner so one user can't edit another's bot by ID
  const [bot] = await db
    .update(bots)
    .set(values)
    .where(and(eq(bots.id, id), eq(bots.userId, userId)))
    .returning()
  if (!bot) throw new Error("Bot not found")

  // The bot's name and face show in the sidebar as well as the chat
  revalidatePath("/", "layout")
  return bot
}

export async function deleteBot(id: string) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) throw new Error("Unauthorized")

  // Its direct chats go too, since they'd be empty without it. Group chats
  // just lose a member through the cascade. Chats go first, while the
  // memberships that find them still exist; the batch is one transaction.
  const [, [bot]] = await db.batch([
    db
      .delete(chats)
      .where(
        and(
          eq(chats.userId, userId),
          eq(chats.kind, "direct"),
          inArray(
            chats.id,
            db
              .select({ id: chatMembers.chatId })
              .from(chatMembers)
              .where(eq(chatMembers.botId, id))
          )
        )
      ),
    db
      .delete(bots)
      .where(and(eq(bots.id, id), eq(bots.userId, userId)))
      .returning(),
  ])
  if (!bot) throw new Error("Bot not found")

  revalidatePath("/", "layout")
  return bot
}
