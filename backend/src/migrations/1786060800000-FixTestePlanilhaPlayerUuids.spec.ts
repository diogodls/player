import { QueryRunner } from 'typeorm';
import { FixTestePlanilhaPlayerUuids1786060800000 } from './1786060800000-FixTestePlanilhaPlayerUuids';

describe('FixTestePlanilhaPlayerUuids migration', () => {
  const oldIds = [
    '70000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000002',
    '70000000-0000-0000-0000-000000000003',
    '70000000-0000-0000-0000-000000000004',
  ];
  const newIds = [
    '70000000-0000-4000-8000-000000000001',
    '70000000-0000-4000-8000-000000000002',
    '70000000-0000-4000-8000-000000000003',
    '70000000-0000-4000-8000-000000000004',
  ];

  it('moves players and tagged actions to deterministic UUID v4 IDs', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    await new FixTestePlanilhaPlayerUuids1786060800000().up({
      query,
    } as unknown as QueryRunner);

    const sql = query.mock.calls[0][0] as string;
    expect(query).toHaveBeenCalledTimes(1);
    oldIds.forEach((id) => expect(sql).toContain(id));
    newIds.forEach((id) => {
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(sql).toContain(id);
    });
    expect(sql).toContain('INSERT INTO jogadores');
    expect(sql).toContain('UPDATE acoes_taggeadas');
    expect(sql).toContain('SET jogador_id = id_change.new_id');
    expect(sql).toContain('ON CONFLICT (id) DO NOTHING');
    expect(sql).toContain('created_at');
    expect(sql).toContain('deleted_at');
  });

  it('is reversible while preserving the same relationships', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    await new FixTestePlanilhaPlayerUuids1786060800000().down({
      query,
    } as unknown as QueryRunner);

    const sql = query.mock.calls[0][0] as string;
    expect(query).toHaveBeenCalledTimes(1);
    oldIds.forEach((id) => expect(sql).toContain(id));
    newIds.forEach((id) => expect(sql).toContain(id));
    expect(sql).toContain('UPDATE acoes_taggeadas');
    expect(sql).toContain('DELETE FROM jogadores');
  });
});
