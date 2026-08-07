import { QueryRunner } from 'typeorm';
import { CreateInitialSchema1784000000000 } from './1784000000000-CreateInitialSchema';

describe('CreateInitialSchema1784000000000', () => {
  it('creates the complete schema before historical migrations', async () => {
    const statements: string[] = [];
    const query = jest.fn((statement: string) => {
      statements.push(statement);
      return Promise.resolve(undefined);
    });
    const hasTable = jest.fn().mockResolvedValue(false);
    await new CreateInitialSchema1784000000000().up({
      query,
      hasTable,
    } as unknown as QueryRunner);

    const sql = statements.join('\n');
    for (const table of [
      'equipes',
      'session_types',
      'session_locations',
      'session_court_sizes',
      'posicoes',
      'lados_preferenciais',
      'jogadores',
      'sessoes',
      'tipos_analise',
      'impactos',
      'categorias_acao',
      'acoes_catalogo',
      'acoes_taggeadas',
    ]) {
      expect(sql).toContain(`CREATE TABLE ${table}`);
    }
    expect(sql).toContain('REFERENCES equipes(id)');
    expect(sql).toContain('deleted_at timestamptz NULL');
    expect(sql).toContain('CREATE TRIGGER acoes_taggeadas_set_updated_at');
    expect(sql).toContain('CREATE INDEX acoes_taggeadas_sessao_tempo_idx');
  });

  it('adopts an existing schema without recreating it', async () => {
    const query = jest.fn();
    await new CreateInitialSchema1784000000000().up({
      query,
      hasTable: jest.fn().mockResolvedValue(true),
    } as unknown as QueryRunner);
    expect(query).not.toHaveBeenCalled();
  });

  it('rolls back only a schema owned by the baseline and drops dependents first', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    await new CreateInitialSchema1784000000000().down({
      query,
      hasTable: jest.fn().mockResolvedValue(true),
    } as unknown as QueryRunner);
    const statements = query.mock.calls.map(([sql]) => String(sql));
    expect(
      statements.indexOf('DROP TABLE IF EXISTS acoes_taggeadas'),
    ).toBeLessThan(statements.indexOf('DROP TABLE IF EXISTS sessoes'));
    expect(statements.at(-1)).toBe('DROP FUNCTION IF EXISTS set_updated_at()');
  });
});
