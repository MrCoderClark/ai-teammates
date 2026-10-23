"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { SidebarMenuButton } from "@/components/ui/sidebar"

// A sidebar menu link that marks itself active when its page is open
function SidebarLinkButton({
  href,
  ...props
}: Omit<React.ComponentProps<typeof SidebarMenuButton>, "render" | "isActive"> & {
  href: string
}) {
  const pathname = usePathname()

  return (
    <SidebarMenuButton
      {...props}
      isActive={pathname === href}
      render={<Link href={href} />}
    />
  )
}

export { SidebarLinkButton }
