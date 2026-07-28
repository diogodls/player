import { QueryRunner } from 'typeorm';
import { FixGolMglImpact1784188800000 } from './1784188800000-FixGolMglImpact';

describe('FixGolMglImpact migration', () => {
  it('updates existing Gol MGL records to positive without inserting actions', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await new FixGolMglImpact1784188800000().up({
      query,
    } as unknown as QueryRunner);

    const statement = query.mock.calls.map(([sql]: [string]) => sql).join('\n');
    expect(statement).toContain("acao.sigla = 'Gol MGL'");
    expect(statement).toContain("impacto.nome = 'Positiva'");
    expect(statement).toContain('IS DISTINCT FROM');
    expect(statement).not.toMatch(/INSERT\s+INTO\s+acoes_catalogo/i);
  });
});
