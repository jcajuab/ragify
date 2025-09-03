import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { Sidebar } from "@/app/chat/_components/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { getSession } from "@/server/auth/utils"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

export default async function Layout({ children }: LayoutProps<"/">) {
  const session = await getSession()
  if (!session) redirect("/")

  const chats = await db
    .select()
    .from(schema.chats)
    .where(eq(schema.chats.userId, session.user.id))

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Sidebar chats={chats} />
      {children}
    </SidebarProvider>
  )
}
