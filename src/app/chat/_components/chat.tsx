"use client"

import { type UIMessage, useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { PaperclipIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Message, MessageContent } from "@/components/ai-elements/message"
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input"
import { Response } from "@/components/ai-elements/response"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

type ChatProps = {
  // FIXME: Optimize props by passing the whole `chat` object
  chatId: string
  title: string
  initialMessages: UIMessage[]
}

export function Chat({ chatId, title, initialMessages }: ChatProps) {
  const [text, setText] = useState<string>("")
  const { messages, sendMessage } = useChat({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => {
        const lastMessage = messages[messages.length - 1]
        return {
          body: {
            message: lastMessage,
            chatId,
          },
        }
      },
    }),
  })

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const initialMessage = searchParams.get("initialMessage")
    if (initialMessage && messages.length === initialMessages.length) {
      sendMessage({ text: initialMessage })

      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete("initialMessage")
      router.replace(`/chat/${chatId}`)
    }
  }, [
    chatId,
    initialMessages.length,
    messages.length,
    router.replace,
    searchParams,
    sendMessage,
  ])

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    sendMessage({ text })
    setText("")
  }

  return (
    <main className="flex h-svh flex-1 flex-col">
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="font-medium">{title}</h1>
      </header>

      <div className="relative mx-auto w-full max-w-3xl flex-1 overflow-y-auto p-4">
        <Conversation>
          <ConversationContent>
            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts.map((part, index) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <Response key={`${message.id}-${index}`}>
                            {part.text}
                          </Response>
                        )
                      default:
                        console.log(part.type)
                        return null
                    }
                  })}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="mx-auto w-full max-w-3xl p-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea rows={3} value={text} onChange={handleChange} />
          <PromptInputToolbar className="border-t">
            <PromptInputTools>
              <PromptInputButton disabled>
                <PaperclipIcon />
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit status="ready" disabled={!text.trim()} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </main>
  )
}
