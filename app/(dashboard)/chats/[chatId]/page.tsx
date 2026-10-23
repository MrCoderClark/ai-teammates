import { notFound } from "next/navigation"

import { Chat } from "@/components/chat"
import { ChatHeader } from "@/components/chat-header"
import { getChat } from "@/queries/chats"

export default async function Page(props: PageProps<"/chats/[chatId]">) {
  const { chatId } = await props.params
  const chat = await getChat(chatId)
  if (!chat) notFound()

  const name = chat.name ?? chat.bot.name

  return (
    // A fixed height so the conversation scrolls instead of the page
    <div className="flex h-svh flex-col">
      <ChatHeader name={name} bot={chat.bot} />
      <Chat chatId={chatId} name={name} />
    </div>
  )
}
