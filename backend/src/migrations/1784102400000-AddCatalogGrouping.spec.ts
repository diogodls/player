import { QueryRunner } from 'typeorm';
import { AddCatalogGrouping1784102400000 } from './1784102400000-AddCatalogGrouping';

describe('AddCatalogGrouping migration', () => {
  it('updates existing GS BP records to the negative impact without inserting actions', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const migration = new AddCatalogGrouping1784102400000();

    await migration.up({ query } as unknown as QueryRunner);

    const statements = query.mock.calls
      .map(([sql]: [string]) => sql)
      .join('\n');
    expect(statements).toContain("acao.sigla = 'GS BP'");
    expect(statements).toContain("impacto.nome = 'Negativa'");
    expect(statements).toContain('IS DISTINCT FROM');
    expect(statements).not.toMatch(/INSERT\s+INTO\s+acoes_catalogo/i);
  });
});
