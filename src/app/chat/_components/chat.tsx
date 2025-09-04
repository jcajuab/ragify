"use client"

import { type UIMessage, useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { EllipsisIcon, PaperclipIcon, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useChatMutation } from "@/hooks/use-chat-mutation"
import type { Chat as ChatType } from "@/server/db/types"

type ChatProps = {
  chat: ChatType
  initialMessages: UIMessage[]
}

export function Chat({ chat, initialMessages }: ChatProps) {
  const router = useRouter()
  const [text, setText] = useState<string>("")

  const { messages, sendMessage, status } = useChat({
    id: chat.id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => {
        const lastMessage = messages[messages.length - 1]
        return {
          body: {
            message: lastMessage,
            chatId: chat.id,
          },
        }
      },
    }),
  })

  const { deleteChat } = useChatMutation()

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    sendMessage({ text })
    setText("")
  }

  const handleDelete = () => {
    toast.promise(deleteChat.mutateAsync(chat.id), {
      loading: `Deleting chat...`,
      success: () => {
        router.push("/chat/new")
        return "Deleted successfully!"
      },
      error: "Uh oh, something went wrong. Try again later!",
    })
  }

  return (
    <main className="flex h-svh flex-1 flex-col">
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="font-medium">{chat.title}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger className="ml-auto" asChild>
            <Button size="icon" variant="ghost">
              <EllipsisIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom">
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onClick={handleDelete}
            >
              <TrashIcon />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <Conversation className="relative mx-auto w-full max-w-3xl">
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
                      return null
                  }
                })}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="mx-auto w-full max-w-3xl p-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea rows={3} value={text} onChange={handleChange} />
          <PromptInputToolbar className="border-t">
            <PromptInputTools>
              <PromptInputButton disabled>
                <PaperclipIcon />
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit status={status} disabled={!text.trim()} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </main>
  )
}
