import { google } from "@ai-sdk/google"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  embed,
  generateId,
  streamText,
  type UIMessage,
} from "ai"
import { cosineDistance, eq } from "drizzle-orm"
import { embeddingModel } from "@/server/ai/embedding"
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

  const messages = message.parts.map((msg) => {
    if (message.role === "user" && msg.type === "text") {
      return msg.text
    }
    return ""
  })

  await upsertMessage(chatId, message)

  const newMessages = await listMessages(chatId)
  const stream = createUIMessageStream({
    originalMessages: newMessages,
    execute: async ({ writer }) => {
      if (message.role === "user") {
        writer.write({
          type: "start",
          messageId: generateId(),
        })
        writer.write({
          type: "start-step",
        })
      }

      const { embedding: queryEmbedding } = await embed({
        model: embeddingModel,
        value: messages[messages.length - 1],
      })

      const embeddings = await db
        .select()
        .from(schema.embeddings)
        .where(eq(schema.embeddings.chatId, chatId))
        .orderBy(cosineDistance(schema.embeddings.embedding, queryEmbedding))
        .limit(5)

      const context = embeddings
        .map((embedding) => `${embedding.chunk}`)
        .join("\n\n")

      const result = streamText({
        model,
        messages: convertToModelMessages(newMessages),
        system: `AI assistant is a brand new, powerful, human-like artificial intelligence.
          The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
          AI is a well-behaved and well-mannered individual.
          AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
          AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
          AI assistant is a big fan of Pinecone and Vercel.
          START CONTEXT BLOCK
          ${context}
          END OF CONTEXT BLOCK
          AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
          If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
          AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
          AI assistant will not invent anything that is not drawn directly from the context.
          `,
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

async function upsertMessage(chatId: string, message: UIMessage) {
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
