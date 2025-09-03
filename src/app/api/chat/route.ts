import { google } from "@ai-sdk/google"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  streamText,
  type UIMessage,
} from "ai"
import { loadMessages } from "@/app/chat/_actions/load-messages"
import { upsertMessage } from "@/app/chat/_actions/upsert-message"
import { getSession } from "@/server/auth/utils"

export const maxDuration = 30

type Body = {
  chatId: string
  message: UIMessage
}

const model = google("gemini-2.5-flash-lite")

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized!")

  const { chatId, message }: Body = await request.json()

  await upsertMessage(chatId, message)

  const newMessages = await loadMessages(chatId)
  const stream = createUIMessageStream({
    originalMessages: newMessages,
    execute: ({ writer }) => {
      if (message.role === "user") {
        writer.write({
          type: "start",
          messageId: generateId(),
        })
        writer.write({
          type: "start-step",
        })
      }

      const result = streamText({
        model,
        messages: convertToModelMessages(newMessages),
      })

      result.consumeStream()
      writer.merge(result.toUIMessageStream({ sendStart: false }))
    },
    onError: (error) => {
      return error instanceof Error ? error.message : String(error)
    },
    onFinish: async ({ responseMessage }) => {
      try {
        await upsertMessage(chatId, responseMessage)
      } catch (error) {
        console.error(error)
      }
    },
  })

  return createUIMessageStreamResponse({ stream })
}
