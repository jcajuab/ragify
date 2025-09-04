import { and, eq } from "drizzle-orm"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

export async function getChat(chatId: string, userId: string) {
  const [chat] = await db
    .select()
    .from(schema.chats)
    .where(and(eq(schema.chats.id, chatId), eq(schema.chats.userId, userId)))
    .limit(1)

  return chat ?? null
}
