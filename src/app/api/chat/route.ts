import { google } from "@ai-sdk/google"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  streamText,
  type UIMessage,
} from "ai"
import { getSession } from "@/server/auth/utils"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { listMessages } from "@/server/queries/list-messages"

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

  const newMessages = await listMessages(chatId)
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
        system: `You are a helpful assistant. Check your knowledge base before answering any questions.
          Only respond to questions using information from tool calls.
          if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
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

export async function upsertMessage(chatId: string, message: UIMessage) {
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.messages)
      .values({
        chatId,
        ...message,
      })
      .onConflictDoUpdate({
        target: schema.messages.id,
        set: {
          parts: message.parts,
          createdAt: new Date(),
        },
      })
  })
}
