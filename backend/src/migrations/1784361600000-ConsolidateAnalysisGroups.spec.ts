import { QueryRunner } from 'typeorm';
import { ConsolidateAnalysisGroups1784361600000 } from './1784361600000-ConsolidateAnalysisGroups';

describe('ConsolidateAnalysisGroups migration', () => {
  it('moves goalkeeper-line actions into offensive organization before removing the extra group', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const migration = new ConsolidateAnalysisGroups1784361600000();

    await migration.up({ query } as unknown as QueryRunner);

    const statements = query.mock.calls.map(([sql]: [string]) => sql);
    expect(statements).toHaveLength(2);
    expect(statements[0]).toContain(
      "SET categoria_acao_id = '00000000-0000-0000-0000-000000000306'",
    );
    expect(statements[0]).toContain(
      "WHERE categoria_acao_id = '00000000-0000-0000-0000-000000000310'",
    );
    expect(statements[0]).toContain("WHEN 'GGL' THEN 5");
    expect(statements[0]).toContain("WHEN 'PPGL' THEN 6");
    expect(statements[1]).toMatch(/DELETE\s+FROM\s+categorias_acao/i);
  });
});
