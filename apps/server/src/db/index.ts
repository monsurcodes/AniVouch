import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { env } from "@/lib/config";

const pool = new Pool({ connectionString: env.DATABASE_URL });
const db = drizzle({ client: pool });

export { db };
