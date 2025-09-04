import { google } from "@ai-sdk/google"
import { embedMany } from "ai"
import { split } from "llm-splitter"

export const embeddingModel = google.textEmbeddingModel("text-embedding-004")

export function createChunks(
  text: string,
  options?: {
    chunkSize?: number
    chunkOverlap?: number
  },
) {
  const rawChunks = split(text, {
    chunkSize: options?.chunkSize || 800,
    chunkOverlap: options?.chunkOverlap || 100,
    chunkStrategy: "paragraph",
    splitter: (t) => t.split(/\s+/),
  })

  return rawChunks.map((rawChunk) => {
    let text: string
    if (typeof rawChunk.text === "string") {
      text = rawChunk.text
    } else if (Array.isArray(rawChunk.text)) {
      text = rawChunk.text.join(" ")
    } else {
      text = String(rawChunk.text || "")
    }

    return {
      text,
      start: rawChunk.start || 0,
      end: rawChunk.end || text.length,
    }
  })
}

export async function generateEmbeddings(text: string) {
  const chunks = createChunks(text)

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks.map(({ text }) => text),
  })

  return embeddings.map((embedding, index) => ({
    chunk: chunks[index].text,
    embedding,
  }))
}
