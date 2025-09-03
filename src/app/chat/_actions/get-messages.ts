"use server"

import type { UIMessage } from "ai"
import { eq } from "drizzle-orm"
import { getSession } from "@/server/auth/utils"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

export async function getMessages(chatId: string): Promise<UIMessage[]> {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized!")

  return await db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.chatId, chatId))
    .orderBy(schema.messages.createdAt)
}
