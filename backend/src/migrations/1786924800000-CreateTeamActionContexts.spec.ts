import { QueryRunner } from 'typeorm';
import { CreateTeamActionContexts1786924800000 } from './1786924800000-CreateTeamActionContexts';

describe('CreateTeamActionContexts1786924800000', () => {
  it('creates the context catalog and adds an optional context to tagged actions', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const migration = new CreateTeamActionContexts1786924800000();

    await migration.up({ query } as unknown as QueryRunner);

    const statements = query.mock.calls
      .map(([sql]: [string]) => sql)
      .join('\n');
    expect(statements).toMatch(/CREATE TABLE contextos_acao_equipe/);
    expect(statements).toMatch(
      /categoria_acao_id uuid NOT NULL[\s\S]*REFERENCES categorias_acao\(id\)/,
    );
    expect(statements).toMatch(/ADD COLUMN contexto_acao_equipe_id uuid NULL/);
    expect(statements).toMatch(
      /FOREIGN KEY \(contexto_acao_equipe_id\) REFERENCES contextos_acao_equipe\(id\)/,
    );
    expect(statements).not.toMatch(/INSERT\s+INTO/i);
  });

  it('removes the tagged-action dependency before dropping the context table', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const migration = new CreateTeamActionContexts1786924800000();

    await migration.down({ query } as unknown as QueryRunner);

    const statements = query.mock.calls.map(([sql]: [string]) => sql);
    const dropColumn = statements.findIndex((sql) =>
      sql.includes('DROP COLUMN IF EXISTS contexto_acao_equipe_id'),
    );
    const dropTable = statements.findIndex((sql) =>
      sql.includes('DROP TABLE IF EXISTS contextos_acao_equipe'),
    );
    expect(dropColumn).toBeGreaterThanOrEqual(0);
    expect(dropTable).toBeGreaterThan(dropColumn);
  });
});
