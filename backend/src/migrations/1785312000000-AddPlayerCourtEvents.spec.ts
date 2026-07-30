import { QueryRunner } from 'typeorm';
import { AddPlayerCourtEvents1785312000000 } from './1785312000000-AddPlayerCourtEvents';

describe('AddPlayerCourtEvents migration', () => {
  it('adds the neutral impact, playing-time group and both court events', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const migration = new AddPlayerCourtEvents1785312000000();

    await migration.up({ query } as unknown as QueryRunner);

    const statements = query.mock.calls.map(([sql]: [string]) => sql);
    expect(statements).toHaveLength(3);
    expect(statements[0]).toContain("VALUES (3, 'Neutra')");
    expect(statements[1]).toContain("'PLAYING_TIME'");
    expect(statements[2]).toContain("'ENTROU'");
    expect(statements[2]).toContain("'SAIU'");
    expect(statements[2]).toContain("'Entrou em quadra'");
    expect(statements[2]).toContain("'Saiu de quadra'");
  });

  it('removes the court events before their group and neutral impact', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const migration = new AddPlayerCourtEvents1785312000000();

    await migration.down({ query } as unknown as QueryRunner);

    const statements = query.mock.calls.map(([sql]: [string]) => sql);
    expect(statements).toHaveLength(3);
    expect(statements[0]).toMatch(/DELETE\s+FROM\s+acoes_catalogo/i);
    expect(statements[1]).toMatch(/DELETE\s+FROM\s+categorias_acao/i);
    expect(statements[2]).toMatch(/DELETE\s+FROM\s+impactos/i);
  });
});
