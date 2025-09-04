"use server"

import type { UIMessage } from "ai"
import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

export async function listMessages(chatId: string): Promise<UIMessage[]> {
  return await db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.chatId, chatId))
    .orderBy(schema.messages.createdAt)
}
