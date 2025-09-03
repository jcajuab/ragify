import { createSelectSchema } from "drizzle-zod"
import type { z } from "zod"
import * as schema from "@/server/db/schema"

export const selectChatSchema = createSelectSchema(schema.chats)
export type Chat = z.infer<typeof selectChatSchema>
