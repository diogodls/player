import { OptimizePlayerStatisticsQueries1787011200000 } from './1787011200000-OptimizePlayerStatisticsQueries';

describe('OptimizePlayerStatisticsQueries migration', () => {
  it('creates a covering partial index for active individual actions by session', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await new OptimizePlayerStatisticsQueries1787011200000().up({
      query,
    } as never);

    const sql = query.mock.calls.flat().join('\n');
    expect(sql).toContain(
      'ON acoes_taggeadas (sessao_id, jogador_id, acao_catalogo_id)',
    );
    expect(sql).toContain(
      'WHERE deleted_at IS NULL AND jogador_id IS NOT NULL',
    );
  });

  it('drops the index on rollback', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await new OptimizePlayerStatisticsQueries1787011200000().down({
      query,
    } as never);

    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls.flat().join('\n')).toContain(
      'DROP INDEX IF EXISTS',
    );
  });
});
