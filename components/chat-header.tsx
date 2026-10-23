import { MonitorIcon } from "lucide-react"

import { BotDialog } from "@/components/bot-dialog"
import { ChatAvatar } from "@/components/chat-avatar"
import { Button } from "@/components/ui/button"
import type { InsertBot } from "@/db/schema"

function ChatHeader({
  name,
  bot,
}: {
  name: string
  bot: InsertBot & { id: string }
}) {
  return (
    <header className="flex h-10 shrink-0 items-center gap-2 border-b px-4">
      {/* Opens the bot's settings; pulled left so the face lines up with the edge */}
      <h1 className="-ml-2.5 min-w-0">
        <BotDialog
          bot={bot}
          triggerProps={{
            variant: "ghost",
            size: "sm",
            className: "max-w-full",
          }}
        >
          <ChatAvatar seed={bot.avatar} className="size-5" />
          <span className="truncate text-sm font-medium">{name}</span>
        </BotDialog>
      </h1>
      {/* Does nothing yet */}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Desktop"
        className="ml-auto"
      >
        <MonitorIcon />
      </Button>
    </header>
  )
}

export { ChatHeader }
