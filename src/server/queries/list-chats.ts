import { desc, eq } from "drizzle-orm"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

export async function listChats(userId: string) {
  return await db
    .select()
    .from(schema.chats)
    .where(eq(schema.chats.userId, userId))
    .orderBy(desc(schema.chats.createdAt))
}
