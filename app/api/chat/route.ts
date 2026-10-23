import { auth } from "@clerk/nextjs/server"
import { openrouter } from "@openrouter/ai-sdk-provider"
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai"

import { getChat } from "@/queries/chats"

export async function POST(req: Request) {
  // Signed-in users only, so the OpenRouter key can't be spent by anyone
  const { isAuthenticated } = await auth()
  if (!isAuthenticated) return new Response("Unauthorized", { status: 401 })

  // useChat sends the chat's id alongside the messages
  const { id, messages }: { id: string; messages: UIMessage[] } =
    await req.json()

  const chat = await getChat(id)
  if (!chat) return new Response("Not found", { status: 404 })

  const { bot } = chat

  const result = streamText({
    model: openrouter(process.env.OPENROUTER_MODEL!),
    instructions: [
      `You are ${bot.name}. Your job: ${bot.job}.`,
      bot.instructions,
    ]
      .filter(Boolean)
      .join("\n\n"),
    messages: await convertToModelMessages(messages),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
