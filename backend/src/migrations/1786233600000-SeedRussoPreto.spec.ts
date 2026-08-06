import { QueryRunner } from 'typeorm';
import { SeedRussoPreto1786233600000 } from './1786233600000-SeedRussoPreto';

describe('SeedRussoPreto1786233600000', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    delete process.env.RUN_LEGACY_MIGRATION_SEEDS;
  });

  it('does not override the global transaction and does not run in production', async () => {
    const migration = new SeedRussoPreto1786233600000();
    const query = jest.fn();
    process.env.NODE_ENV = 'production';

    expect(migration.transaction).toBeUndefined();
    await migration.up({ query } as unknown as QueryRunner);
    expect(query).not.toHaveBeenCalled();
  });

  it('looks up configuration and actions without fixed catalog IDs', async () => {
    const migration = new SeedRussoPreto1786233600000();
    const query = jest.fn().mockResolvedValue(undefined);
    process.env.NODE_ENV = 'development';
    process.env.RUN_LEGACY_MIGRATION_SEEDS = 'true';

    await migration.up({ query } as unknown as QueryRunner);

    const sql = query.mock.calls[0][0] as string;
    expect(sql).toContain("lower(nome) = lower('Jogo')");
    expect(sql).toContain("lower(nome) = lower('Casa')");
    expect(sql).toContain("lower(nome) = lower('Grande')");
    expect(sql).toContain('lower(action.sigla) = lower(event.sigla)');
    expect(sql).toContain('ON CONFLICT (id) DO UPDATE');
    expect(sql).toContain('DELETE FROM acoes_taggeadas');
  });

  it('creates one entry and exit plus every raw action unit', async () => {
    const migration = new SeedRussoPreto1786233600000();
    const query = jest.fn().mockResolvedValue(undefined);
    process.env.NODE_ENV = 'development';
    process.env.RUN_LEGACY_MIGRATION_SEEDS = 'true';

    await migration.up({ query } as unknown as QueryRunner);
    const sql = query.mock.calls[0][0] as string;

    expect((sql.match(/'ENTROU'/g) ?? []).length / 2).toBe(12);
    expect((sql.match(/'SAIU'/g) ?? []).length / 2).toBe(12);
    expect((sql.match(/::uuid, 'PP',/g) ?? []).length / 2).toBe(41);
  });

  it('removes dependent actions before session and players on rollback', async () => {
    const migration = new SeedRussoPreto1786233600000();
    const query = jest.fn().mockResolvedValue(undefined);
    process.env.NODE_ENV = 'development';
    process.env.RUN_LEGACY_MIGRATION_SEEDS = 'true';

    await migration.down({ query } as unknown as QueryRunner);
    const sql = query.mock.calls[0][0] as string;

    expect(sql.indexOf('DELETE FROM acoes_taggeadas')).toBeLessThan(
      sql.indexOf('DELETE FROM sessoes'),
    );
    expect(sql.indexOf('DELETE FROM sessoes')).toBeLessThan(
      sql.indexOf('DELETE FROM jogadores'),
    );
  });
});
