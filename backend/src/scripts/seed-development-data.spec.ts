import {
  assertDevelopmentSeedAllowed,
  seedDevelopmentData,
  type SeedClient,
  unwrapSeedSql,
} from './seed-development-data';

describe('development seed', () => {
  const originalEnvironment = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnvironment;
    delete process.env.RUN_LEGACY_MIGRATION_SEEDS;
  });

  it('blocks demonstration data in production', () => {
    expect(() =>
      assertDevelopmentSeedAllowed({ NODE_ENV: 'production' }),
    ).toThrow('bloqueado em produção');
  });

  it('runs base and real-game seeds in one transaction', async () => {
    process.env.NODE_ENV = 'development';
    const statements: string[] = [];
    const query = jest.fn((sql: string) => {
      statements.push(sql);
      return Promise.resolve({ rows: [] });
    });
    await seedDevelopmentData(
      { query },
      "BEGIN; INSERT INTO tipos_analise (id, nome) VALUES (1, 'Individual') ON CONFLICT DO NOTHING; COMMIT;",
    );

    expect(statements[0]).toBe('BEGIN');
    expect(statements[1]).not.toMatch(/BEGIN|COMMIT/);
    expect(statements[1]).toContain('ON CONFLICT DO NOTHING');
    expect(statements[2]).toContain('Russo Preto');
    expect(statements[2]).toContain('Passo Fundo');
    expect(statements[2]).toContain('player_session_minutes');
    expect(statements[2]).not.toContain('ENTROU');
    expect(statements[2]).not.toContain('jogador_id IS NULL');
    expect(statements.at(-1)).toBe('COMMIT');
  });

  it('rolls back the complete load after a failure', async () => {
    process.env.NODE_ENV = 'development';
    const query = jest
      .fn<SeedClient['query']>()
      .mockResolvedValueOnce({ rows: [] })
      .mockRejectedValueOnce(new Error('seed failed'))
      .mockResolvedValueOnce({ rows: [] });
    await expect(seedDevelopmentData({ query }, 'SELECT 1;')).rejects.toThrow(
      'seed failed',
    );
    expect(query).toHaveBeenLastCalledWith('ROLLBACK');
  });

  it('removes transaction wrappers from the compatibility SQL file', () => {
    expect(unwrapSeedSql('\nBEGIN;\nSELECT 1;\nCOMMIT;\n')).toBe('SELECT 1;');
  });
});
