import { Client } from 'pg';

const TEMPORARY_DATA_MIGRATIONS = [
  'SeedTestePlanilhaRussoPreto1785974400000',
  'FixTestePlanilhaPlayerUuids1786060800000',
  'FixTestePlanilhaSessionUuid1786147200000',
] as const;

type Environment = Record<string, string | undefined>;
type QueryResult = { rows: Array<Record<string, unknown>> };
type DatabaseClient = {
  connect(): Promise<void>;
  end(): Promise<void>;
  query(sql: string, parameters?: readonly unknown[]): Promise<QueryResult>;
};

export function assertDevelopmentCleanupAllowed(
  environment: Environment,
): void {
  if (environment.NODE_ENV === 'production') {
    throw new Error(
      'Limpeza bloqueada: este comando nao pode ser executado em producao.',
    );
  }
  if (environment.ALLOW_DEV_DATA_CLEANUP !== 'true') {
    throw new Error(
      'Limpeza bloqueada: defina ALLOW_DEV_DATA_CLEANUP=true explicitamente.',
    );
  }
}

export async function cleanDevelopmentData(
  client: DatabaseClient,
): Promise<{ before: Record<string, number>; after: Record<string, number> }> {
  const counts = async () => {
    const result = await client.query(`
      SELECT
        (SELECT count(*)::integer FROM jogadores) AS jogadores,
        (SELECT count(*)::integer FROM sessoes) AS sessoes,
        (SELECT count(*)::integer FROM acoes_taggeadas) AS acoes_taggeadas
    `);
    return result.rows[0] as Record<string, number>;
  };

  const before = await counts();
  await client.query('BEGIN');
  try {
    await client.query('DELETE FROM acoes_taggeadas');
    await client.query(`
      DO $$
      BEGIN
        IF to_regclass('public.indices_jogadores') IS NOT NULL THEN
          DELETE FROM indices_jogadores;
        END IF;
      END $$;
    `);
    await client.query('DELETE FROM sessoes');
    await client.query('DELETE FROM jogadores');
    await client.query(
      'DELETE FROM migrations WHERE name = ANY($1::varchar[])',
      [TEMPORARY_DATA_MIGRATIONS],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }

  return { before, after: await counts() };
}

async function main() {
  assertDevelopmentCleanupAllowed(process.env);
  const client = new Client({
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    user: process.env.DATABASE_USER ?? 'player',
    password: process.env.DATABASE_PASSWORD ?? 'player',
    database: process.env.DATABASE_NAME ?? 'player',
  }) as unknown as DatabaseClient;

  await client.connect();
  try {
    const result = await cleanDevelopmentData(client);
    console.log(JSON.stringify(result, null, 2));
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
