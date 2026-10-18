import "server-only";

import { z } from "zod/v4";

const googleSchema = z
  .object({
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  })
  .refine(
    (value) =>
      (!value.GOOGLE_CLIENT_ID && !value.GOOGLE_CLIENT_SECRET) ||
      (Boolean(value.GOOGLE_CLIENT_ID) && Boolean(value.GOOGLE_CLIENT_SECRET)),
    {
      message:
        "Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or neither to disable Google sign-in.",
      path: ["GOOGLE_CLIENT_ID"],
    },
  );

const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string."),
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "BETTER_AUTH_SECRET must be at least 32 characters."),
    BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL."),
    BLOB_READ_WRITE_TOKEN: z.string().min(1, "BLOB_READ_WRITE_TOKEN is required."),
  })
  .and(googleSchema);

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");

  throw new Error(
    `Invalid environment configuration:\n${details}\n\n` +
      "Copy .env.example to .env.local and fill in the values.",
  );
}

/**
 * Validated, typed server environment.
 *
 * Import only from server code. Public values (NEXT_PUBLIC_*) are read where they
 * are used so Next.js can inline them at build time.
 */
export const env = parsed.data;

export const isGoogleAuthEnabled = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
);
