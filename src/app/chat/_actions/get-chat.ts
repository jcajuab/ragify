"use server"

import { and, eq } from "drizzle-orm"
import { getSession } from "@/server/auth/utils"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

export async function getChat(chatId: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized!")

  const result = await db
    .select()
    .from(schema.chats)
    .where(
      and(
        eq(schema.chats.id, chatId),
        eq(schema.chats.userId, session.user.id),
      ),
    )
    .limit(1)

  return result[0] || null
}
