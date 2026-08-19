import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Client } from 'pg';
import { REAL_GAMES_SEED_SQL } from './real-games-seed';

type Environment = Record<string, string | undefined>;
export type SeedClient = {
  connect(): Promise<void>;
  end(): Promise<void>;
  query(sql: string, parameters?: readonly unknown[]): Promise<unknown>;
};

export function assertDevelopmentSeedAllowed(environment: Environment): void {
  if (environment.NODE_ENV === 'production') {
    throw new Error('Seed de demonstração bloqueado em produção.');
  }
}

export function unwrapSeedSql(sql: string): string {
  return sql
    .replace(/^\s*BEGIN;\s*/i, '')
    .replace(/\s*COMMIT;\s*$/i, '')
    .trim();
}

export async function seedDevelopmentData(
  client: Pick<SeedClient, 'query'>,
  baseSeedSql: string,
  manageTransaction = true,
): Promise<void> {
  if (manageTransaction) await client.query('BEGIN');
  try {
    await client.query(unwrapSeedSql(baseSeedSql));
    await client.query(REAL_GAMES_SEED_SQL);
    if (manageTransaction) await client.query('COMMIT');
  } catch (error) {
    if (manageTransaction) await client.query('ROLLBACK');
    throw error;
  }
}

export function createSeedClient(): SeedClient {
  return new Client({
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    user: process.env.DATABASE_USER ?? 'player',
    password: process.env.DATABASE_PASSWORD ?? 'player',
    database: process.env.DATABASE_NAME ?? 'player',
  }) as unknown as SeedClient;
}

async function main() {
  assertDevelopmentSeedAllowed(process.env);
  const client = createSeedClient();
  const baseSeedSql = await readFile(
    resolve(process.cwd(), 'seeds.sql'),
    'utf8',
  );
  await client.connect();
  try {
    await seedDevelopmentData(client, baseSeedSql);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
