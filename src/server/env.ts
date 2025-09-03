import { z } from "zod";

const envSchema = z.object({
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_URL: z.string(),

  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.url(),

  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),

  GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  throw new Error(z.prettifyError(result.error));
}

export const env = result.data;
