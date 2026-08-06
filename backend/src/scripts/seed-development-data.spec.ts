import {
  assertDevelopmentSeedAllowed,
  seedDevelopmentData,
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

  it('runs base and demonstration seeds in one transaction', async () => {
    process.env.NODE_ENV = 'development';
    const query = jest.fn().mockResolvedValue({ rows: [] });
    await seedDevelopmentData(
      { query },
      "BEGIN; INSERT INTO tipos_analise (id, nome) VALUES (1, 'Individual') ON CONFLICT DO NOTHING; COMMIT;",
    );

    expect(query.mock.calls[0][0]).toBe('BEGIN');
    expect(query.mock.calls[1][0]).not.toMatch(/BEGIN|COMMIT/);
    expect(query.mock.calls[1][0]).toContain('ON CONFLICT DO NOTHING');
    expect(query.mock.calls[2][0]).toContain('ON CONFLICT (id) DO UPDATE');
    expect(query.mock.calls[3][0]).toContain('Russo Preto — retorno');
    expect(query.mock.calls[3][0]).toContain('jogador_id IS NULL');
    expect(query.mock.calls.at(-1)?.[0]).toBe('COMMIT');
  });

  it('rolls back the complete load after a failure', async () => {
    process.env.NODE_ENV = 'development';
    const query = jest
      .fn()
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
