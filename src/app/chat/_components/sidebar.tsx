"use client"

import { LogOutIcon, SquarePenIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar as __Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/authClient"
import type { Chat } from "@/server/db/types"

type SidebarProps = {
  chats: Chat[]
}

export function Sidebar({ chats }: SidebarProps) {
  const router = useRouter()
  const { data } = authClient.useSession()

  const pathname = usePathname()
  const currentChatId =
    pathname?.startsWith("/chat/") && pathname.split("/chat/")[1]?.split("?")[0]

  const handleLogout = async () => {
    toast.promise(authClient.signOut(), {
      loading: "Signing out...",
      success: () => {
        router.push("/")
        return "Signed out successfully!"
      },
      error: "Uh oh, something went wrong. Try again later!",
    })
  }

  return (
    <__Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/chat/new">
                <Image
                  src="/assets/robot-emoji-192x192.png"
                  alt="Ragify logo"
                  width={192}
                  height={192}
                  className="size-6 rounded-lg"
                />
                <span className="font-medium">Ragify</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="New chat" asChild>
                <Link href="/chat/new">
                  <SquarePenIcon />
                  <span>New chat</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarMenu>
            {chats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton isActive={currentChatId === chat.id} asChild>
                  <Link href={`/chat/${chat.id}`}>{chat.title}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="size-6 rounded-lg">
                    <AvatarImage
                      src={data?.user.image ?? undefined}
                      alt={data?.user.name}
                    />
                    <AvatarFallback className="rounded-lg">
                      {data?.user.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {data?.user.name}
                    </span>
                    <span className="truncate text-xs">{data?.user.email}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                side="top"
                className="w-(--radix-dropdown-menu-trigger-width)"
              >
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </__Sidebar>
  )
}
