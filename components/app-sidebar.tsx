import { UserButton } from "@clerk/nextjs"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* The UserButton trigger fills the menu button so the whole row is clickable */}
            <SidebarMenuButton render={<div />} className="p-0">
              <UserButton
                showName
                appearance={{
                  elements: {
                    rootBox: "flex! w-full!",
                    userButtonTrigger:
                      "w-full! rounded-md! p-2! shadow-none! focus-visible:ring-2! ring-sidebar-ring",
                    userButtonBox:
                      "w-full! flex-row-reverse! justify-end! gap-2! text-sidebar-foreground!",
                    userButtonAvatarBox: "size-4! shrink-0",
                    userButtonOuterIdentifier:
                      "truncate p-0! text-sm! font-normal! text-inherit!",
                  },
                }}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
