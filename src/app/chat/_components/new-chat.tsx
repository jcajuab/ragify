"use client"

import { nanoid } from "nanoid"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useChatMutation } from "@/hooks/use-chat-mutation"

export function NewChat() {
  const router = useRouter()
  const { createChat } = useChatMutation()

  const handleClick = async () => {
    toast.promise(createChat.mutateAsync(`Nanoid chat: ${nanoid()}`), {
      loading: `Creating chat...`,
      success: (chatId) => {
        router.push(`/chat/${chatId}`)
        return "Created successfully!"
      },
      error: "Uh oh, something went wrong. Try again later!",
    })
  }

  return <Button onClick={handleClick}>New Chat</Button>
}
