import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Drizzle runs outside Next.js, so load `.env.local` the same way the app does.
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required to run Drizzle commands. Copy .env.example to .env.local and fill it in.",
  );
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
