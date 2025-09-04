import { notFound, redirect } from "next/navigation"
import { Chat } from "@/app/chat/_components/chat"
import { getSession } from "@/server/auth/utils"
import { getChat } from "@/server/queries/get-chat"
import { listMessages } from "@/server/queries/list-messages"

export default async function Page({ params }: PageProps<"/chat/[chatId]">) {
  const session = await getSession()
  if (!session) redirect("/")

  const { chatId } = await params

  const chat = await getChat(chatId, session.user.id)
  if (!chat) notFound()

  const initialMessages = await listMessages(chat.id)

  return <Chat chat={chat} initialMessages={initialMessages} />
}
