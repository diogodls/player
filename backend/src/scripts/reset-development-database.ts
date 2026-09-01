import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  assertDevelopmentCleanupAllowed,
  cleanDevelopmentData,
  type DatabaseClient,
} from './clean-development-data';
import { createSeedClient, seedDevelopmentData } from './seed-development-data';

export async function resetDevelopmentDatabase(
  client: DatabaseClient,
  baseSeedSql: string,
) {
  await client.query('BEGIN');
  try {
    const cleanup = await cleanDevelopmentData(client, false);
    await seedDevelopmentData(client, baseSeedSql, false);
    await client.query('COMMIT');
    return cleanup;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function main() {
  assertDevelopmentCleanupAllowed(process.env);
  const client = createSeedClient();
  const baseSeedSql = await readFile(
    resolve(process.cwd(), 'seeds.sql'),
    'utf8',
  );
  await client.connect();
  try {
    await resetDevelopmentDatabase(client as DatabaseClient, baseSeedSql);
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
