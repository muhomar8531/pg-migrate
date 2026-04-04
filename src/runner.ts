import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { pool, ensureMigrationsTable } from './db'

const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

async function getPendingMigrations(): Promise<string[]> {
    const files = fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort();

    const { rows } = await pool.query('SELECT filename FROM _migrations');

    const ran = new Set(rows.map((r: any) => r.filename));

    return files.filter(f => !ran.has(f));   
}

export async function runMigrations(): Promise<void> {
    await ensureMigrationsTable();
    const pending = await getPendingMigrations();

    if (pending.length === 0) {
        console.log(chalk.green('Nothing to migrate.'));
        return;
    }

    for (const file of pending) {
        const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(sql);
            await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
            await client.query('COMMIT');
            console.log(chalk.green('  applied ' + file));
        }
        catch (err) {
            await client.query('ROLLBACK');
            console.log(chalk.red('  failed ' + file));
            throw err;
        }
        finally {
            client.release();
        }
    }
}