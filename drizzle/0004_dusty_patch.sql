CREATE TABLE "embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"chunk" text NOT NULL,
	"embedding" vector(768) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "embeddings_embedding_index" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);