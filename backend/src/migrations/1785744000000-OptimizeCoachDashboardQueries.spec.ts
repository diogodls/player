import { QueryRunner } from 'typeorm';
import { OptimizeCoachDashboardQueries1785744000000 } from './1785744000000-OptimizeCoachDashboardQueries';
describe('OptimizeCoachDashboardQueries migration', () => {
  it('creates the two partial indexes used by the dashboard query', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    await new OptimizeCoachDashboardQueries1785744000000().up({
      query,
    } as unknown as QueryRunner);
    const sql = query.mock.calls.flat().join(' ');
    expect(sql).toMatch(/sessoes \(equipe_id, data\).*deleted_at IS NULL/);
    expect(sql).toMatch(
      /acoes_taggeadas \(sessao_id, acao_catalogo_id\).*jogador_id IS NULL AND deleted_at IS NULL/,
    );
  });
  it('drops both indexes in reverse order', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    await new OptimizeCoachDashboardQueries1785744000000().down({
      query,
    } as unknown as QueryRunner);
    const statements = query.mock.calls.map(([sql]: [string]) => sql);
    expect(query).toHaveBeenCalledTimes(2);
    expect(statements[0]).toContain(
      'acoes_taggeadas_coletivas_sessao_catalogo_idx',
    );
    expect(statements[1]).toContain('sessoes_equipe_data_ativas_idx');
  });
});
