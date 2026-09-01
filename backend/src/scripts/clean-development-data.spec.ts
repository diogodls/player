import {
  assertDevelopmentCleanupAllowed,
  cleanDevelopmentData,
} from './clean-development-data';

describe('development data cleanup', () => {
  it('blocks production even with explicit confirmation', () => {
    expect(() =>
      assertDevelopmentCleanupAllowed({
        NODE_ENV: 'production',
        ALLOW_DEV_DATA_CLEANUP: 'true',
      }),
    ).toThrow('nao pode ser executado em producao');
  });

  it('requires explicit confirmation outside production', () => {
    expect(() =>
      assertDevelopmentCleanupAllowed({ NODE_ENV: 'development' }),
    ).toThrow('ALLOW_DEV_DATA_CLEANUP=true');
    expect(() =>
      assertDevelopmentCleanupAllowed({
        NODE_ENV: 'development',
        ALLOW_DEV_DATA_CLEANUP: 'true',
      }),
    ).not.toThrow();
  });

  it('deletes dependent records in foreign-key order inside a transaction', async () => {
    let countCalls = 0;
    const query = jest.fn((sql: string) => {
      if (!sql.includes('SELECT')) return Promise.resolve({ rows: [] });
      countCalls += 1;
      return Promise.resolve({
        rows: [
          countCalls === 1
            ? {
                jogadores: 20,
                sessoes: 15,
                minutagens: 18,
                equipes: 2,
                acoes_taggeadas: 419,
              }
            : {
                jogadores: 0,
                sessoes: 0,
                minutagens: 0,
                equipes: 0,
                acoes_taggeadas: 0,
              },
        ],
      });
    });
    const client = { query } as Parameters<typeof cleanDevelopmentData>[0];

    const result = await cleanDevelopmentData(client);

    const statements = query.mock.calls.map(([sql]) => String(sql).trim());
    expect(statements).toEqual([
      expect.stringContaining('SELECT'),
      'BEGIN',
      'DELETE FROM acoes_taggeadas',
      'DELETE FROM player_session_minutes',
      expect.stringContaining('DELETE FROM indices_jogadores'),
      'DELETE FROM sessoes',
      'DELETE FROM jogadores',
      'DELETE FROM equipes',
      'COMMIT',
      expect.stringContaining('SELECT'),
    ]);
    expect(result).toEqual({
      before: {
        jogadores: 20,
        sessoes: 15,
        minutagens: 18,
        equipes: 2,
        acoes_taggeadas: 419,
      },
      after: {
        jogadores: 0,
        sessoes: 0,
        minutagens: 0,
        equipes: 0,
        acoes_taggeadas: 0,
      },
    });
    expect(statements.join(' ')).not.toContain('DELETE FROM migrations');
  });

  it('rolls back if any deletion fails', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({
        rows: [{ jogadores: 1, sessoes: 1, acoes_taggeadas: 1 }],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockRejectedValueOnce(new Error('database failure'))
      .mockResolvedValueOnce({ rows: [] });
    const client = { query } as Parameters<typeof cleanDevelopmentData>[0];

    await expect(cleanDevelopmentData(client)).rejects.toThrow(
      'database failure',
    );
    expect(query).toHaveBeenLastCalledWith('ROLLBACK');
  });
});
