import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Client } from 'pg';
import { QueryRunner } from 'typeorm';
import { SeedRussoPreto1786233600000 } from '../migrations/1786233600000-SeedRussoPreto';
import { PRESENTATION_DEMO_SEED_SQL } from './presentation-demo-seed';

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
): Promise<void> {
  await client.query('BEGIN');
  const previousFlag = process.env.RUN_LEGACY_MIGRATION_SEEDS;
  try {
    await client.query(unwrapSeedSql(baseSeedSql));
    process.env.RUN_LEGACY_MIGRATION_SEEDS = 'true';
    await new SeedRussoPreto1786233600000().up({
      query: (sql: string) => client.query(sql),
    } as unknown as QueryRunner);
    await client.query(PRESENTATION_DEMO_SEED_SQL);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    if (previousFlag === undefined)
      delete process.env.RUN_LEGACY_MIGRATION_SEEDS;
    else process.env.RUN_LEGACY_MIGRATION_SEEDS = previousFlag;
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
