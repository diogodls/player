import { QueryRunner } from 'typeorm';
import { ExpandTeamCatalog1785484800000 } from './1785484800000-ExpandTeamCatalog';

describe('ExpandTeamCatalog migration', () => {
  it('inserts all 15 new actions idempotently', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    await new ExpandTeamCatalog1785484800000().up({
      query,
    } as unknown as QueryRunner);
    const sql = query.mock.calls.map(([value]: [string]) => value);
    expect(sql).toHaveLength(2);
    expect(sql[0]).toContain("('OFFENSIVE_ORGANIZATION', 'PPSP', 4)");
    for (const sigla of [
      'FSP',
      'PMSP',
      'FAP',
      'PMAP',
      'FGL',
      'PMGL',
      'FT',
      'PMT',
      'MBJI',
      'MBFS',
      'VJI',
      'VFS',
      'PJI',
      'PFS',
      'TFS',
    ]) {
      expect(sql[1]).toContain(`'${sigla}'`);
    }
    expect(sql[1]).toContain('WHERE NOT EXISTS');
  });

  it('removes only its IDs and restores old orders', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    await new ExpandTeamCatalog1785484800000().down({
      query,
    } as unknown as QueryRunner);
    const sql = query.mock.calls.map(([value]: [string]) => value);
    expect(sql).toHaveLength(2);
    expect(sql[0]).toMatch(/DELETE\s+FROM\s+acoes_catalogo/i);
    expect(sql[0]).toContain('00000000-0000-0000-0000-000000000601');
    expect(sql[0]).toContain('00000000-0000-0000-0000-000000000615');
    expect(sql[1]).toContain("('DEFENSIVE_TRANSITION', 'TGT', 2)");
  });
});
