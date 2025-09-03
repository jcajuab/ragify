"use server"

import { eq } from "drizzle-orm"
import { getSession } from "@/server/auth/utils"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

export async function getChats() {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized!")

  return await db
    .select()
    .from(schema.chats)
    .where(eq(schema.chats.userId, session.user.id))
}
