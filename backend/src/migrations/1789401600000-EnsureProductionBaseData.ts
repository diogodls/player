import { MigrationInterface, QueryRunner } from 'typeorm';

type BaseRow = Record<string, string | number>;
// Frozen snapshot: do not import mutable application constants or development seeds.
const BASE_DATA: Record<string, BaseRow[]> = {
  session_types: [
    {
      id: 1,
      nome: 'Treino',
    },
    {
      id: 2,
      nome: 'Jogo',
    },
  ],
  session_locations: [
    {
      id: 1,
      nome: 'Casa',
    },
    {
      id: 2,
      nome: 'Fora',
    },
  ],
  session_court_sizes: [
    {
      id: 1,
      nome: 'Pequena',
    },
    {
      id: 2,
      nome: 'Grande',
    },
  ],
  posicoes: [
    {
      id: 2,
      nome: 'Fixo',
    },
    {
      id: 3,
      nome: 'Ala',
    },
    {
      id: 4,
      nome: 'Pivo',
    },
  ],
  lados_preferenciais: [
    {
      id: 1,
      nome: 'Destro',
    },
    {
      id: 2,
      nome: 'Canhoto',
    },
  ],
  tipos_analise: [
    {
      id: 1,
      nome: 'Individual',
    },
    {
      id: 2,
      nome: 'Equipe',
    },
  ],
  impactos: [
    {
      id: 1,
      nome: 'Positiva',
    },
    {
      id: 2,
      nome: 'Negativa',
    },
    {
      id: 3,
      nome: 'Neutra',
    },
  ],
  categorias_acao: [
    {
      id: '00000000-0000-0000-0000-000000000301',
      tipo_analise_id: 1,
      nome: 'Ações ofensivas',
      chave: 'OFFENSIVE_ACTIONS',
      ordem: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000302',
      tipo_analise_id: 1,
      nome: 'Ações defensivas',
      chave: 'DEFENSIVE_ACTIONS',
      ordem: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000303',
      tipo_analise_id: 1,
      nome: 'Gols em quadra',
      chave: 'COURT_GOALS',
      ordem: 3,
    },
    {
      id: '00000000-0000-0000-0000-000000000304',
      tipo_analise_id: 1,
      nome: 'Gols tomados em quadra',
      chave: 'COURT_GOALS_CONCEDED',
      ordem: 4,
    },
    {
      id: '00000000-0000-0000-0000-000000000311',
      tipo_analise_id: 1,
      nome: 'Minutagem',
      chave: 'PLAYING_TIME',
      ordem: 5,
    },
    {
      id: '00000000-0000-0000-0000-000000000701',
      tipo_analise_id: 2,
      nome: 'Bola parada - novo catálogo',
      chave: 'TEAM_V2_SET_PIECE',
      ordem: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000702',
      tipo_analise_id: 2,
      nome: 'Ataque',
      chave: 'TEAM_V2_ATTACK',
      ordem: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000703',
      tipo_analise_id: 2,
      nome: 'Defesa',
      chave: 'TEAM_V2_DEFENSE',
      ordem: 3,
    },
  ],
  acoes_catalogo: [
    {
      id: '00000000-0000-0000-0000-000000000401',
      categoria_acao_id: '00000000-0000-0000-0000-000000000303',
      impacto_id: 1,
      nome: 'Gol transicao ofensiva',
      sigla: 'Gol TO',
      ordem: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000402',
      categoria_acao_id: '00000000-0000-0000-0000-000000000303',
      impacto_id: 1,
      nome: 'Gol organizacao ofensiva',
      sigla: 'Gol OO',
      ordem: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000403',
      categoria_acao_id: '00000000-0000-0000-0000-000000000303',
      impacto_id: 1,
      nome: 'Gol bola parada',
      sigla: 'Gol BP',
      ordem: 3,
    },
    {
      id: '00000000-0000-0000-0000-000000000404',
      categoria_acao_id: '00000000-0000-0000-0000-000000000303',
      impacto_id: 1,
      nome: 'Gol goleiro linha',
      sigla: 'Gol GL',
      ordem: 4,
    },
    {
      id: '00000000-0000-0000-0000-000000000405',
      categoria_acao_id: '00000000-0000-0000-0000-000000000303',
      impacto_id: 1,
      nome: 'Gol marcacao de goleiro linha',
      sigla: 'Gol MGL',
      ordem: 5,
    },
    {
      id: '00000000-0000-0000-0000-000000000406',
      categoria_acao_id: '00000000-0000-0000-0000-000000000304',
      impacto_id: 2,
      nome: 'Gol sofrido transicao defensiva',
      sigla: 'GS TO',
      ordem: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000407',
      categoria_acao_id: '00000000-0000-0000-0000-000000000304',
      impacto_id: 2,
      nome: 'Gol sofrido organizacao defensiva',
      sigla: 'GS OO',
      ordem: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000408',
      categoria_acao_id: '00000000-0000-0000-0000-000000000304',
      impacto_id: 2,
      nome: 'Gol sofrido bola parada',
      sigla: 'GS BP',
      ordem: 3,
    },
    {
      id: '00000000-0000-0000-0000-000000000409',
      categoria_acao_id: '00000000-0000-0000-0000-000000000304',
      impacto_id: 2,
      nome: 'Gol sofrido goleiro linha adversario',
      sigla: 'GS GLA',
      ordem: 4,
    },
    {
      id: '00000000-0000-0000-0000-000000000410',
      categoria_acao_id: '00000000-0000-0000-0000-000000000304',
      impacto_id: 2,
      nome: 'Gol sofrido usando goleiro linha ofensivo',
      sigla: 'GS GLO',
      ordem: 5,
    },
    {
      id: '00000000-0000-0000-0000-000000000411',
      categoria_acao_id: '00000000-0000-0000-0000-000000000301',
      impacto_id: 1,
      nome: 'Gol marcado',
      sigla: 'GM',
      ordem: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000412',
      categoria_acao_id: '00000000-0000-0000-0000-000000000301',
      impacto_id: 1,
      nome: 'Assistencia',
      sigla: 'ASS',
      ordem: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000413',
      categoria_acao_id: '00000000-0000-0000-0000-000000000301',
      impacto_id: 1,
      nome: 'Acao decisiva',
      sigla: 'AD',
      ordem: 3,
    },
    {
      id: '00000000-0000-0000-0000-000000000414',
      categoria_acao_id: '00000000-0000-0000-0000-000000000301',
      impacto_id: 1,
      nome: 'Chance criada',
      sigla: 'CC',
      ordem: 4,
    },
    {
      id: '00000000-0000-0000-0000-000000000415',
      categoria_acao_id: '00000000-0000-0000-0000-000000000301',
      impacto_id: 2,
      nome: 'Perda de posse',
      sigla: 'PP',
      ordem: 5,
    },
    {
      id: '00000000-0000-0000-0000-000000000416',
      categoria_acao_id: '00000000-0000-0000-0000-000000000302',
      impacto_id: 2,
      nome: 'Gol pago',
      sigla: 'GP',
      ordem: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000417',
      categoria_acao_id: '00000000-0000-0000-0000-000000000302',
      impacto_id: 2,
      nome: 'Falha defensiva',
      sigla: 'FD',
      ordem: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000418',
      categoria_acao_id: '00000000-0000-0000-0000-000000000302',
      impacto_id: 1,
      nome: 'Roubada de bola',
      sigla: 'RB',
      ordem: 3,
    },
    {
      id: '00000000-0000-0000-0000-000000000419',
      categoria_acao_id: '00000000-0000-0000-0000-000000000302',
      impacto_id: 1,
      nome: 'Desarme, interceptacao e antecipacao',
      sigla: 'DIA',
      ordem: 4,
    },
    {
      id: '00000000-0000-0000-0000-000000000711',
      categoria_acao_id: '00000000-0000-0000-0000-000000000701',
      impacto_id: 1,
      nome: 'Gol',
      sigla: 'BP_GOL',
      ordem: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000712',
      categoria_acao_id: '00000000-0000-0000-0000-000000000701',
      impacto_id: 1,
      nome: 'Jogada bem executada',
      sigla: 'BP_BEM_EXEC',
      ordem: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000713',
      categoria_acao_id: '00000000-0000-0000-0000-000000000701',
      impacto_id: 2,
      nome: 'Jogada mal executada',
      sigla: 'BP_MAL_EXEC',
      ordem: 3,
    },
    {
      id: '00000000-0000-0000-0000-000000000714',
      categoria_acao_id: '00000000-0000-0000-0000-000000000701',
      impacto_id: 2,
      nome: 'Sem execução',
      sigla: 'BP_SEM_EXEC',
      ordem: 4,
    },
    {
      id: '00000000-0000-0000-0000-000000000715',
      categoria_acao_id: '00000000-0000-0000-0000-000000000702',
      impacto_id: 1,
      nome: 'Gol',
      sigla: 'AT_GOL',
      ordem: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000716',
      categoria_acao_id: '00000000-0000-0000-0000-000000000702',
      impacto_id: 1,
      nome: 'Finalização',
      sigla: 'AT_FINALIZACAO',
      ordem: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000717',
      categoria_acao_id: '00000000-0000-0000-0000-000000000702',
      impacto_id: 1,
      nome: 'Posse mantida',
      sigla: 'AT_POSSE_MANTIDA',
      ordem: 3,
    },
    {
      id: '00000000-0000-0000-0000-000000000718',
      categoria_acao_id: '00000000-0000-0000-0000-000000000702',
      impacto_id: 2,
      nome: 'Posse perdida',
      sigla: 'AT_POSSE_PERDIDA',
      ordem: 4,
    },
    {
      id: '00000000-0000-0000-0000-000000000719',
      categoria_acao_id: '00000000-0000-0000-0000-000000000703',
      impacto_id: 2,
      nome: 'Gol sofrido',
      sigla: 'DF_GOL_SOFRIDO',
      ordem: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000720',
      categoria_acao_id: '00000000-0000-0000-0000-000000000703',
      impacto_id: 2,
      nome: 'Finalização sofrida',
      sigla: 'DF_FINALIZACAO_SOFRIDA',
      ordem: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000721',
      categoria_acao_id: '00000000-0000-0000-0000-000000000703',
      impacto_id: 1,
      nome: 'Jogada interceptada',
      sigla: 'DF_JOGADA_INTERCEPTADA',
      ordem: 3,
    },
    {
      id: '00000000-0000-0000-0000-000000000722',
      categoria_acao_id: '00000000-0000-0000-0000-000000000703',
      impacto_id: 1,
      nome: 'Recuperação de bola',
      sigla: 'DF_RECUPERACAO',
      ordem: 4,
    },
    {
      id: '00000000-0000-0000-0000-000000000440',
      categoria_acao_id: '00000000-0000-0000-0000-000000000311',
      impacto_id: 3,
      nome: 'Entrou em quadra',
      sigla: 'ENTROU',
      ordem: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000441',
      categoria_acao_id: '00000000-0000-0000-0000-000000000311',
      impacto_id: 3,
      nome: 'Saiu de quadra',
      sigla: 'SAIU',
      ordem: 2,
    },
  ],
  contextos_acao_equipe: [
    {
      id: '00000000-0000-0000-0000-000000000731',
      categoria_acao_id: '00000000-0000-0000-0000-000000000701',
      nome: 'Canto',
      chave: 'CORNER',
      ordem: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000732',
      categoria_acao_id: '00000000-0000-0000-0000-000000000701',
      nome: 'Lateral ofensivo',
      chave: 'OFFENSIVE_KICK_IN',
      ordem: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000733',
      categoria_acao_id: '00000000-0000-0000-0000-000000000701',
      nome: 'Falta',
      chave: 'FREE_KICK',
      ordem: 3,
    },
    {
      id: '00000000-0000-0000-0000-000000000734',
      categoria_acao_id: '00000000-0000-0000-0000-000000000701',
      nome: 'Lateral defensivo',
      chave: 'DEFENSIVE_KICK_IN',
      ordem: 4,
    },
    {
      id: '00000000-0000-0000-0000-000000000735',
      categoria_acao_id: '00000000-0000-0000-0000-000000000701',
      nome: 'Arremesso de meta',
      chave: 'GOAL_CLEARANCE',
      ordem: 5,
    },
    {
      id: '00000000-0000-0000-0000-000000000736',
      categoria_acao_id: '00000000-0000-0000-0000-000000000702',
      nome: 'Transição ofensiva',
      chave: 'OFFENSIVE_TRANSITION',
      ordem: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000737',
      categoria_acao_id: '00000000-0000-0000-0000-000000000702',
      nome: 'Saída de pressão',
      chave: 'PRESSURE_EXIT',
      ordem: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000738',
      categoria_acao_id: '00000000-0000-0000-0000-000000000702',
      nome: 'Goleiro linha',
      chave: 'FLY_GOALKEEPER',
      ordem: 3,
    },
    {
      id: '00000000-0000-0000-0000-000000000739',
      categoria_acao_id: '00000000-0000-0000-0000-000000000702',
      nome: 'Ataque posicional',
      chave: 'POSITIONAL_ATTACK',
      ordem: 4,
    },
    {
      id: '00000000-0000-0000-0000-000000000740',
      categoria_acao_id: '00000000-0000-0000-0000-000000000703',
      nome: 'Transição defensiva',
      chave: 'DEFENSIVE_TRANSITION',
      ordem: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000741',
      categoria_acao_id: '00000000-0000-0000-0000-000000000703',
      nome: 'Marcação variando pra pressão',
      chave: 'VARIABLE_PRESSING',
      ordem: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000742',
      categoria_acao_id: '00000000-0000-0000-0000-000000000703',
      nome: 'Marcação baixa',
      chave: 'LOW_BLOCK',
      ordem: 3,
    },
    {
      id: '00000000-0000-0000-0000-000000000743',
      categoria_acao_id: '00000000-0000-0000-0000-000000000703',
      nome: 'Pressão',
      chave: 'PRESSING',
      ordem: 4,
    },
    {
      id: '00000000-0000-0000-0000-000000000744',
      categoria_acao_id: '00000000-0000-0000-0000-000000000703',
      nome: 'Goleiro linha defensivo',
      chave: 'DEFENSIVE_FLY_GOALKEEPER',
      ordem: 5,
    },
  ],
};

export class EnsureProductionBaseData1789401600000 implements MigrationInterface {
  name = 'EnsureProductionBaseData1789401600000';

  async up(runner: QueryRunner): Promise<void> {
    // Reuse TypeORM's transaction; direct invocation also remains atomic.
    const ownsTransaction = !runner.isTransactionActive;
    if (ownsTransaction) await runner.startTransaction();
    try {
      // Serialize concurrent bootstrap attempts and writes to reference tables.
      await runner.query(
        `LOCK TABLE equipes, ${Object.keys(BASE_DATA).join(', ')} IN SHARE ROW EXCLUSIVE MODE`,
      );
      for (const [table, rows] of Object.entries(BASE_DATA)) {
        for (const row of rows) await this.ensureRow(runner, table, row);
      }
      const teams = await runner.query(
        'SELECT id, nome, deleted_at FROM equipes',
      );
      if (
        !teams.some((team: { deleted_at: unknown }) => team.deleted_at === null)
      ) {
        if (teams.length)
          throw new Error(
            'Base data conflict: equipes contains only deleted teams; explicit resolution required',
          );
        await this.ensureRow(runner, 'equipes', {
          id: '00000000-0000-0000-0000-000000000001',
          nome: 'Equipe Principal',
        });
      }
      if (ownsTransaction) await runner.commitTransaction();
    } catch (error) {
      if (ownsTransaction) await runner.rollbackTransaction();
      throw error;
    }
  }

  private async ensureRow(
    runner: QueryRunner,
    table: string,
    expected: BaseRow,
  ) {
    const scope =
      'tipo_analise_id' in expected
        ? 'tipo_analise_id'
        : 'categoria_acao_id' in expected
          ? 'categoria_acao_id'
          : undefined;
    const keys = ['nome', 'chave', 'sigla'].filter((key) => key in expected);
    const values: (string | number)[] = [expected.id];
    const identities = keys.map((key) => {
      values.push(expected[key]);
      let condition = `${key} = $${values.length}`;
      if (scope) {
        values.push(expected[scope]);
        condition = `(${condition} AND ${scope} = $${values.length})`;
      }
      return condition;
    });
    const existing = await runner.query(
      `SELECT * FROM ${table} WHERE id = $1 OR ${identities.join(' OR ')}`,
      values,
    );
    if (existing.length) {
      const row = existing[0];
      // Historical migrations only changed accents in some display names.
      const name = (value: unknown) =>
        String(value)
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
      const matches =
        existing.length === 1 &&
        row.deleted_at == null &&
        Object.entries(expected).every(([key, value]) =>
          key === 'nome' ? name(row[key]) === name(value) : row[key] === value,
        );
      if (!matches)
        throw new Error(
          `Base data conflict: ${table} id=${expected.id}; existing ID/key/name or metadata differs`,
        );
      return;
    }
    const columns = Object.keys(expected);
    const inserted = await runner.query(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map((_, index) => '$' + (index + 1)).join(', ')}) ON CONFLICT DO NOTHING RETURNING id`,
      Object.values(expected),
    );
    if (inserted.length !== 1) {
      throw new Error(
        `Base data conflict: ${table} id=${expected.id}; insertion rejected`,
      );
    }
  }

  async down(): Promise<void> {
    // Reference data may already be used by real history. Never delete it.
  }
}
