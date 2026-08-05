import { QueryRunner } from 'typeorm';
import { FixTestePlanilhaSessionUuid1786147200000 } from './1786147200000-FixTestePlanilhaSessionUuid';

describe('FixTestePlanilhaSessionUuid migration', () => {
  const invalidId = '70000000-0000-0000-0000-000000000010';
  const validId = '70000000-0000-4000-8000-000000000010';

  it('moves the session and all action references to a UUID v4 id', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    await new FixTestePlanilhaSessionUuid1786147200000().up({
      query,
    } as unknown as QueryRunner);

    const sql = query.mock.calls[0][0] as string;
    expect(query).toHaveBeenCalledTimes(1);
    expect(validId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(sql).toContain(invalidId);
    expect(sql).toContain(validId);
    expect(sql).toContain('INSERT INTO sessoes');
    expect(sql).toContain('UPDATE acoes_taggeadas');
    expect(sql).toContain('SET sessao_id');
    expect(sql).toContain('ON CONFLICT (id) DO NOTHING');
    expect(sql).toContain('created_at');
    expect(sql).toContain('deleted_at');
  });

  it('reverses the same relationship-preserving operation', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    await new FixTestePlanilhaSessionUuid1786147200000().down({
      query,
    } as unknown as QueryRunner);

    const sql = query.mock.calls[0][0] as string;
    expect(sql).toContain(validId);
    expect(sql).toContain(invalidId);
    expect(sql).toContain('UPDATE acoes_taggeadas');
    expect(sql).toContain('DELETE FROM sessoes');
  });
});
