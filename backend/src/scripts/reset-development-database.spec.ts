import { resetDevelopmentDatabase } from './reset-development-database';

describe('development database reset', () => {
  const originalEnvironment = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnvironment;
    delete process.env.RUN_LEGACY_MIGRATION_SEEDS;
  });

  it('cleans dependents and recreates only the two real games on every run', async () => {
    process.env.NODE_ENV = 'development';
    const statements: string[] = [];
    const query = jest.fn((sql: string) => {
      statements.push(sql.trim());
      if (sql.includes('SELECT') && sql.includes('count(*)')) {
        return Promise.resolve({
          rows: [
            {
              jogadores: 16,
              sessoes: 2,
              minutagens: 24,
              equipes: 1,
              acoes_taggeadas: 529,
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });
    const client = { query } as Parameters<typeof resetDevelopmentDatabase>[0];
    const baseSeed =
      "BEGIN; INSERT INTO tipos_analise (id, nome) VALUES (1, 'Individual') ON CONFLICT DO NOTHING; COMMIT;";

    await resetDevelopmentDatabase(client, baseSeed);
    await resetDevelopmentDatabase(client, baseSeed);

    expect(statements.join(' ')).toContain('Russo Preto');
    expect(statements.join(' ')).toContain('Passo Fundo');
    expect(statements.join(' ')).toContain('player_session_minutes');
    expect(
      statements.filter((sql) => sql === 'DELETE FROM sessoes'),
    ).toHaveLength(2);
    expect(
      statements.filter((sql) => sql === 'DELETE FROM jogadores'),
    ).toHaveLength(2);
    expect(statements.join(' ')).not.toContain('DELETE FROM migrations');
    expect(statements.join(' ')).not.toContain('ENTROU');
    expect(statements.join(' ')).not.toContain('jogador_id IS NULL');
  });
});
