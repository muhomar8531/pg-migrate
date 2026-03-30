import * as dotenv from 'dotenv'
import { Pool } from 'pg';

dotenv.config();

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function ensureMigrationsTable(): Promise<void> {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS _migrations (
        id  SERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        run_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        `);
}