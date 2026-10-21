import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
import { nanoid } from "nanoid"
import type { z } from "zod"

export const bots = pgTable(
  "bots",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id").notNull(), // Clerk user ID
    name: text("name").notNull(),
    avatar: text("avatar")
      .notNull()
      .$defaultFn(() => nanoid()), // Seed for the bot's face
    job: text("job").notNull(), // What the bot is for, in a phrase
    instructions: text("instructions"), // How it should go about the job
    sandboxId: text("sandbox_id"), // Created lazily later
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("bots_user_id_idx").on(table.userId)]
)

// What a user can set when creating a bot; userId comes from the session
export const insertBotSchema = createInsertSchema(bots, {
  name: (schema) =>
    schema
      .trim()
      .min(1, "Give it a name.")
      .max(50, "Keep it under 50 characters."),
  avatar: (schema) => schema.min(1),
  job: (schema) =>
    schema
      .trim()
      .min(1, "Give it a job.")
      .max(80, "Keep it under 80 characters."),
  instructions: (schema) =>
    schema.trim().max(2000, "Keep it under 2000 characters."),
}).pick({ name: true, avatar: true, job: true, instructions: true })

export type InsertBot = z.infer<typeof insertBotSchema>
