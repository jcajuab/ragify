import type { UIMessage } from "ai"
import { generateId } from "ai"
import {
  boolean,
  index,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  vector,
} from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

export const users = pgTable("users", {
  id: text()
    .primaryKey()
    .$default(() => nanoid()),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean()
    .notNull()
    .$default(() => false),
  image: text(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
})

export const sessions = pgTable(
  "sessions",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text().notNull().unique(),
    expiresAt: timestamp().notNull(),
    ipAddress: text(),
    userAgent: text(),
    createdAt: timestamp().notNull(),
    updatedAt: timestamp().notNull(),
  },
  (table) => [index().on(table.userId), index().on(table.token)],
)

export const accounts = pgTable(
  "accounts",
  {
    id: text()
      .primaryKey()
      .$default(() => nanoid()),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text().notNull(),
    providerId: text().notNull(),
    accessToken: text(),
    refreshToken: text(),
    accessTokenExpiresAt: timestamp(),
    refreshTokenExpiresAt: timestamp(),
    scope: text(),
    idToken: text(),
    password: text(),
    createdAt: timestamp().notNull(),
    updatedAt: timestamp().notNull(),
  },
  (table) => [index().on(table.userId)],
)

export const verifications = pgTable(
  "verifications",
  {
    id: text()
      .primaryKey()
      .$default(() => nanoid()),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp().notNull(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  (table) => [index().on(table.identifier)],
)

export const chats = pgTable(
  "chats",
  {
    id: text()
      .primaryKey()
      .$default(() => generateId()),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [index().on(table.userId)],
)

export const messages = pgTable(
  "messages",
  {
    id: text()
      .primaryKey()
      .$default(() => generateId()),
    chatId: text()
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    role: text().notNull().$type<UIMessage["role"]>(),

    // FIXME: This is for the MVP only
    parts: jsonb().notNull().$type<UIMessage["parts"]>(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [index().on(table.chatId), index().on(table.createdAt)],
)

export const embeddings = pgTable(
  "embeddings",
  {
    id: serial().primaryKey(),
    chatId: text()
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    chunk: text().notNull(),
    embedding: vector({ dimensions: 768 }).notNull(),
  },
  (table) => [index().using("hnsw", table.embedding.op("vector_cosine_ops"))],
)
