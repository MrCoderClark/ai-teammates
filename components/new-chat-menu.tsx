"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { PlusIcon, UsersIcon } from "lucide-react"

import { BotDialog } from "@/components/bot-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"

function NewChatMenu() {
  // The dialog lives outside the menu so it stays mounted after the menu closes
  const [botDialog] = React.useState(() => DialogPrimitive.createHandle())

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          // A menu button like the rest of the sidebar, so it matches them when collapsed
          render={
            <SidebarMenuButton
              aria-label="New"
              className="size-8 justify-center"
            />
          }
        >
          <PlusIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          <DropdownMenuItem onClick={() => botDialog.open(null)}>
            <PlusIcon />
            Create new bot
          </DropdownMenuItem>
          <DropdownMenuItem>
            <UsersIcon />
            Create group chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <BotDialog handle={botDialog} />
    </>
  )
}

export { NewChatMenu }
