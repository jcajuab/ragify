"use client"

import { useRouter } from "next/navigation"
import { createChat } from "@/app/chat/_actions/create-chat"
import { Button } from "@/components/ui/button"

export function NewChat() {
  const router = useRouter()

  const handleClick = async () => {
    const chatId = await createChat("Vorp")
    router.push(
      `/chat/${chatId}?initialMessage=${encodeURIComponent("Bogus binted?")}`,
    )
  }

  return <Button onClick={handleClick}>New Chat</Button>
}
