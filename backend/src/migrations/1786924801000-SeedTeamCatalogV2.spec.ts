import { QueryRunner } from 'typeorm';
import { SeedTeamCatalogV21786924801000 } from './1786924801000-SeedTeamCatalogV2';

describe('SeedTeamCatalogV21786924801000', () => {
  it('inserts three categories, twelve actions and fourteen contexts without changing legacy actions', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const migration = new SeedTeamCatalogV21786924801000();

    await migration.up({ query } as unknown as QueryRunner);

    const statements = query.mock.calls
      .map(([sql]: [string]) => sql)
      .join('\n');
    expect(statements).toContain("'TEAM_V2_SET_PIECE'");
    expect(statements).toContain("'TEAM_V2_ATTACK'");
    expect(statements).toContain("'TEAM_V2_DEFENSE'");

    for (let suffix = 711; suffix <= 722; suffix += 1) {
      expect(statements).toContain(String(suffix).padStart(12, '0'));
    }
    for (let suffix = 731; suffix <= 744; suffix += 1) {
      expect(statements).toContain(String(suffix).padStart(12, '0'));
    }

    expect(statements.match(/0000000007(?:1[1-9]|2[0-2])'/g)).toHaveLength(12);
    expect(statements.match(/0000000007(?:3[1-9]|4[0-4])'/g)).toHaveLength(14);
    expect(statements).not.toMatch(/UPDATE\s+acoes_taggeadas/i);
    expect(statements).not.toMatch(/DELETE\s+FROM/i);
  });

  it('removes only the v2 catalog in dependency order', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const migration = new SeedTeamCatalogV21786924801000();

    await migration.down({ query } as unknown as QueryRunner);

    const statements = query.mock.calls.map(([sql]: [string]) => sql);
    expect(statements[0]).toContain('DELETE FROM contextos_acao_equipe');
    expect(statements[1]).toContain('DELETE FROM acoes_catalogo');
    expect(statements[2]).toContain('DELETE FROM categorias_acao');
  });
});
