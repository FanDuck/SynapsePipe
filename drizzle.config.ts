import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.SYNAPSE_DB_PATH ?? "./data/synapsepipe.db",
  },
  verbose: true,
  strict: true,
});
