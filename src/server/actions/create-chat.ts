"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/server/auth/utils"
import { db } from "@/server/db/index"
import * as schema from "@/server/db/schema"

export async function createChat(title: string): Promise<string> {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized!")

  const [{ id }] = await db
    .insert(schema.chats)
    .values({ userId: session.user.id, title })
    .returning({ id: schema.chats.id })

  revalidatePath("/chat")
  return id
}
