import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "@/server/db/schema"
import { env } from "@/server/env"

export const db = drizzle(env.POSTGRES_URL, {
  schema,
  casing: "snake_case",
})
