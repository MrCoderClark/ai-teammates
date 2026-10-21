"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { bots, insertBotSchema, type InsertBot } from "@/db/schema"

export async function createBot(input: InsertBot) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) throw new Error("Unauthorized")

  const values = insertBotSchema.parse(input)
  const [bot] = await db
    .insert(bots)
    .values({ ...values, userId })
    .returning()

  revalidatePath("/")
  return bot
}
