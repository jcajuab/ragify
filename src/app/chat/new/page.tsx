import { redirect } from "next/navigation"
import { NewChat } from "@/app/chat/_components/new-chat"
import { getSession } from "@/server/auth/utils"

export default async function Page() {
  const session = await getSession()
  if (!session) redirect("/")

  return <NewChat />
}
