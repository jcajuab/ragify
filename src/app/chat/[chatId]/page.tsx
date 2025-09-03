import { notFound, redirect } from "next/navigation"
import { getChat } from "@/app/chat/_actions/get-chat"
import { getMessages } from "@/app/chat/_actions/get-messages"
import { Chat } from "@/app/chat/_components/chat"
import { getSession } from "@/server/auth/utils"

export default async function Page({ params }: PageProps<"/chat/[chatId]">) {
  const session = await getSession()
  if (!session) redirect("/")

  const { chatId } = await params

  const chat = await getChat(chatId)
  if (!chat) notFound()

  const messages = await getMessages(chat.id)

  return <Chat chat={chat} initialMessages={messages} />
}
