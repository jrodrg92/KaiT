import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Database instance is initialized using process.env (loaded by entry point)
console.log("🔌 [DB-Package] Initializing Pool with URL:", process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 20)}...` : "UNDEFINED");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});




export const db = drizzle(pool, { schema });
export * from "./schema";


