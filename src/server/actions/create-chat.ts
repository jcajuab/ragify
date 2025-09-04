"use server"

import * as cheerio from "cheerio"
import { revalidatePath } from "next/cache"
import { generateEmbeddings } from "@/server/ai/embedding"
import { getSession } from "@/server/auth/utils"
import { db } from "@/server/db/index"
import * as schema from "@/server/db/schema"

export async function createChat(url: string): Promise<string> {
  try {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized!")

    const { title, content } = await scrapeWebContent(url)

    const embeddings = await generateEmbeddings(content)

    const id = await db.transaction(async (tx) => {
      try {
        const [{ id: chatId }] = await tx
          .insert(schema.chats)
          .values({ userId: session.user.id, title })
          .returning({ id: schema.chats.id })

        await tx.insert(schema.embeddings).values(
          embeddings.map(({ chunk, embedding }) => ({
            chatId,
            chunk,
            embedding,
          })),
        )

        return chatId
      } catch (error) {
        console.log(error)
        throw new Error("Failed to create chat")
      }
    })

    revalidatePath("/chat")
    return id
  } catch (error) {
    console.error("Error scraping web content:", error)
    throw new Error("Error scraping web content:")
  }
}

async function scrapeWebContent(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ChatBotInducer/1.0)",
      },
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const html = await response.text()
    const $ = cheerio.load(html)

    const title =
      $("title").text().trim() ||
      $("h1").first().text().trim() ||
      "Untitled Page"

    $("script, style, nav, header, footer, aside").remove()

    const content = $("body")
      .text()
      .replace(/\s+/g, " ")
      .replace(/\n+/g, "\n")
      .trim()
      .substring(0, 10000)

    return { title, content }
  } catch (error) {
    console.error("Error scraping web content:", error)
    throw new Error("Error scraping web content:")
  }
}
