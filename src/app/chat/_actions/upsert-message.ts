"use server"

import type { UIMessage } from "ai"
import { getSession } from "@/server/auth/utils"
import { db } from "@/server/db/index"
import * as schema from "@/server/db/schema"

export async function upsertMessage(chatId: string, message: UIMessage) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized!")

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
