import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please configure it in your .env file."
  );
}

// Parse DATABASE_URL to handle SSL requirements
let sslConfig: boolean | object = false;

if (databaseUrl.includes("sslmode=require") || databaseUrl.includes("ssl=true")) {
  sslConfig = { rejectUnauthorized: false };
} else if (
  databaseUrl.includes("render.com")
) {
  sslConfig = { rejectUnauthorized: false };
}

const queryClient = postgres(databaseUrl, {
  ssl: sslConfig,
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient);

console.log("Database connection initialized");
