"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getSession } from "@/server/auth/utils"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

export async function deleteChat(chatId: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized!")

  const [{ id }] = await db
    .delete(schema.chats)
    .where(eq(schema.chats.id, chatId))
    .returning({ id: schema.chats.id })

  revalidatePath("/chat")
  return id
}
