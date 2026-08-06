import { resetDevelopmentDatabase } from './reset-development-database';

describe('development database reset', () => {
  const originalEnvironment = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnvironment;
    delete process.env.RUN_LEGACY_MIGRATION_SEEDS;
  });

  it('cleans dependents and then recreates demonstration data on every run', async () => {
    process.env.NODE_ENV = 'development';
    const statements: string[] = [];
    const query = jest.fn(async (sql: string) => {
      statements.push(sql.trim());
      if (sql.includes('SELECT') && sql.includes('count(*)')) {
        return {
          rows: [{ jogadores: 12, sessoes: 1, acoes_taggeadas: 250 }],
        };
      }
      return { rows: [] };
    });
    const client = { query } as Parameters<typeof resetDevelopmentDatabase>[0];
    const baseSeed =
      "BEGIN; INSERT INTO tipos_analise (id, nome) VALUES (1, 'Individual') ON CONFLICT DO NOTHING; COMMIT;";

    await resetDevelopmentDatabase(client, baseSeed);
    await resetDevelopmentDatabase(client, baseSeed);

    expect(
      statements.filter((sql) => sql === 'DELETE FROM acoes_taggeadas'),
    ).toHaveLength(2);
    expect(
      statements.filter((sql) => sql === 'DELETE FROM sessoes'),
    ).toHaveLength(2);
    expect(
      statements.filter((sql) => sql === 'DELETE FROM jogadores'),
    ).toHaveLength(2);
    expect(statements.join(' ')).not.toContain('DELETE FROM migrations');
    expect(
      statements.filter((sql) => sql.includes('ON CONFLICT (id) DO UPDATE')),
    ).toHaveLength(2);
  });
});
