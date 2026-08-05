import { QueryRunner } from 'typeorm';
import { SeedTestePlanilhaRussoPreto1785974400000 } from './1785974400000-SeedTestePlanilhaRussoPreto';

describe('SeedTestePlanilhaRussoPreto migration', () => {
  it('uses real references and creates the raw events idempotently', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    await new SeedTestePlanilhaRussoPreto1785974400000().up({
      query,
    } as unknown as QueryRunner);

    const sql = query.mock.calls.map(([value]: [string]) => value);
    expect(sql).toHaveLength(3);
    expect(sql[0]).toContain("nome = 'Equipe Principal'");
    expect(sql[0]).toContain("nome = 'Treino'");
    expect(sql[0]).toContain("'Teste planilha Russo Preto'");
    expect(sql[1]).toContain("tipo.nome = 'Individual'");
    expect(sql[1]).toContain('generate_series(1, q.quantidade)');
    expect(sql[1]).toContain('ON CONFLICT (id) DO UPDATE');
    expect(sql[1]).toContain('timestamp_segundos');
    expect(sql[2].match(/'ENTROU', 0/g)).toHaveLength(4);
    expect(sql[2]).toContain("'SAIU', 851");
    expect(sql[2]).toContain("'SAIU', 1561");
    expect(sql[2]).toContain("'SAIU', 1090");
    expect(sql[2]).toContain("'SAIU', 1183");
    expect(sql[2]).not.toContain("'SAIU', 2130");
    expect(sql[2]).toContain('evento.jogador_id');
    expect(sql[2]).toContain("tipo.nome = 'Individual'");
    expect(sql[2]).toContain('ON CONFLICT (id) DO UPDATE');
    expect(sql.join('\n')).not.toMatch(/player_indexes|indices|Ã­ndices/i);
  });

  it('contains every non-zero supplied quantity', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    await new SeedTestePlanilhaRussoPreto1785974400000().up({
      query,
    } as unknown as QueryRunner);
    const eventSql = query.mock.calls[1][0] as string;

    const expectedTotals: Record<string, number> = {
      '70000000-0000-0000-0000-000000000001': 18,
      '70000000-0000-0000-0000-000000000002': 45,
      '70000000-0000-0000-0000-000000000003': 31,
      '70000000-0000-0000-0000-000000000004': 32,
    };
    for (const [playerId, total] of Object.entries(expectedTotals)) {
      const quantities = [
        ...eventSql.matchAll(
          new RegExp(`\\('${playerId}'::uuid, \\d, '[^']+', (\\d+)\\)`, 'g'),
        ),
      ].map((match) => Number(match[1]));
      expect(quantities.reduce((sum, value) => sum + value, 0)).toBe(total);
    }
  });

  it('removes the session events, session and only unused seeded players', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    await new SeedTestePlanilhaRussoPreto1785974400000().down({
      query,
    } as unknown as QueryRunner);

    const sql = query.mock.calls.map(([value]: [string]) => value);
    expect(sql).toHaveLength(3);
    expect(sql[0]).toMatch(/DELETE FROM acoes_taggeadas/);
    expect(sql[1]).toMatch(/DELETE FROM sessoes/);
    expect(sql[2]).toContain('AND NOT EXISTS');
  });
});
