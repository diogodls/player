import { Repository } from 'typeorm';
import { ActionCategoryEntity } from '../entities';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  const find = jest.fn<Repository<ActionCategoryEntity>['find']>();
  const service = new CatalogService({
    find,
  } as unknown as Repository<ActionCategoryEntity>);

  beforeEach(() => find.mockReset());

  it('returns only individual categories, grouped and ordered by database metadata', async () => {
    find.mockResolvedValue([
      category('OFFENSIVE_ACTIONS', 'Ações ofensivas', 1, [
        action('GM', 'Gol marcado', 'Positiva', 1),
      ]),
      category('DEFENSIVE_ACTIONS', 'Ações defensivas', 2, [
        action('GP', 'Gol pago', 'Negativa', 1),
      ]),
      category('COURT_GOALS', 'Gols em quadra', 3, [
        action('Gol MGL', 'Gol marcação de goleiro linha', 'Positiva', 5),
      ]),
      category('COURT_GOALS_CONCEDED', 'Gols tomados em quadra', 4, [
        action('GS BP', 'Gol sofrido bola parada', 'Negativa', 3),
      ]),
      category('PLAYING_TIME', 'Minutagem', 5, [
        action('ENTROU', 'Entrou em quadra', 'Neutra', 1),
        action('SAIU', 'Saiu de quadra', 'Neutra', 2),
      ]),
    ]);

    const result = await service.getIndividualCatalog();

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tipoAnaliseId: 1 } }),
    );
    expect(result.analysisType).toBe('INDIVIDUAL');
    expect(result.groups.map((group) => group.key)).toEqual([
      'OFFENSIVE_ACTIONS',
      'DEFENSIVE_ACTIONS',
      'COURT_GOALS',
      'COURT_GOALS_CONCEDED',
      'PLAYING_TIME',
    ]);
    expect(
      result.groups
        .flatMap((group) => group.actions)
        .map((action) => action.key),
    ).toEqual(['GM', 'GP', 'Gol MGL', 'GS BP', 'ENTROU', 'SAIU']);
    expect(result.groups[2].actions[0].impact).toBe('POSITIVE');
    expect(result.groups[3].actions[0].impact).toBe('NEGATIVE');
    expect(result.groups[4].actions[0].impact).toBe('NEUTRAL');
  });

  it('does not duplicate actions', async () => {
    find.mockResolvedValue([
      category('OFFENSIVE_ACTIONS', 'Ações ofensivas', 1, [
        action('GM', 'Gol marcado', 'Positiva', 1),
        action('ASS', 'Assistência', 'Positiva', 2),
      ]),
    ]);

    const keys = (await service.getIndividualCatalog()).groups.flatMap(
      (group) => group.actions.map((action) => action.key),
    );

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('merges offensive individual groups regardless of case and accents', async () => {
    find.mockResolvedValue([
      category('OFFENSIVE_ACTIONS', 'Ações ofensivas', 1, [
        action('GM', 'Gol marcado', 'Positiva', 1),
      ]),
      category('LEGACY_OFFENSIVE_ACTIONS', 'ACOES OFENSIVAS', 5, [
        action('ASS', 'Assistência', 'Positiva', 2),
      ]),
    ]);

    const result = await service.getIndividualCatalog();

    expect(result.groups).toEqual([
      {
        key: 'OFFENSIVE_ACTIONS',
        title: 'Ações ofensivas',
        order: 1,
        actions: [
          expect.objectContaining({ key: 'GM' }),
          expect.objectContaining({ key: 'ASS' }),
        ],
      },
    ]);
  });

  it('queries only v2 team categories and leaves legacy categories out', async () => {
    find.mockResolvedValue([]);

    await service.getTeamCatalog();

    const options = find.mock.calls[0][0];
    const where = options?.where as unknown as {
      tipoAnaliseId: number;
      chave: { _value: string[] };
    };
    expect(where.tipoAnaliseId).toBe(2);
    expect(where.chave._value).toEqual([
      'TEAM_V2_SET_PIECE',
      'TEAM_V2_ATTACK',
      'TEAM_V2_DEFENSE',
    ]);
    expect(where.chave._value).not.toContain('SET_PIECE');
    expect(where.chave._value).not.toContain('OFFENSIVE_ORGANIZATION');
  });

  it('builds the isolated v2 catalog with 3 groups, 12 actions and 14 contexts', async () => {
    find.mockResolvedValue([
      category(
        'TEAM_V2_SET_PIECE',
        'Bola parada - novo catálogo',
        1,
        [
          action('BP_GOL', 'Gol', 'Positiva', 1),
          action('BP_BEM_EXEC', 'Jogada bem executada', 'Positiva', 2),
          action('BP_MAL_EXEC', 'Jogada mal executada', 'Negativa', 3),
          action('BP_SEM_EXEC', 'Sem execução', 'Negativa', 4),
        ],
        [
          context('CORNER', 'Canto', 1),
          context('OFFENSIVE_KICK_IN', 'Lateral ofensivo', 2),
          context('FREE_KICK', 'Falta', 3),
          context('DEFENSIVE_KICK_IN', 'Lateral defensivo', 4),
          context('GOAL_CLEARANCE', 'Arremesso de meta', 5),
        ],
      ),
      category(
        'TEAM_V2_ATTACK',
        'Ataque',
        2,
        [
          action('AT_GOL', 'Gol', 'Positiva', 1),
          action('AT_FINALIZACAO', 'Finalização', 'Positiva', 2),
          action('AT_POSSE_MANTIDA', 'Posse mantida', 'Positiva', 3),
          action('AT_POSSE_PERDIDA', 'Posse perdida', 'Negativa', 4),
        ],
        [
          context('OFFENSIVE_TRANSITION', 'Transição ofensiva', 1),
          context('PRESSURE_EXIT', 'Saída de pressão', 2),
          context('FLY_GOALKEEPER', 'Goleiro linha', 3),
          context('POSITIONAL_ATTACK', 'Ataque posicional', 4),
        ],
      ),
      category(
        'TEAM_V2_DEFENSE',
        'Defesa',
        3,
        [
          action('DF_GOL_SOFRIDO', 'Gol sofrido', 'Negativa', 1),
          action(
            'DF_FINALIZACAO_SOFRIDA',
            'Finalização sofrida',
            'Negativa',
            2,
          ),
          action(
            'DF_JOGADA_INTERCEPTADA',
            'Jogada interceptada',
            'Positiva',
            3,
          ),
          action('DF_RECUPERACAO', 'Recuperação de bola', 'Positiva', 4),
        ],
        [
          context('DEFENSIVE_TRANSITION', 'Transição defensiva', 1),
          context('VARIABLE_PRESSING', 'Marcação variando pra pressão', 2),
          context('LOW_BLOCK', 'Marcação baixa', 3),
          context('PRESSING', 'Pressão', 4),
          context('DEFENSIVE_FLY_GOALKEEPER', 'Goleiro linha defensivo', 5),
        ],
      ),
    ]);

    const result = await service.getTeamCatalog();

    expect(result.groups.map((group) => group.title)).toEqual([
      'Bola parada',
      'Ataque',
      'Defesa',
    ]);
    expect(result.groups.flatMap((group) => group.actions)).toHaveLength(12);
    expect(result.groups.flatMap((group) => group.contexts ?? [])).toHaveLength(
      14,
    );
    expect(result.groups.map((group) => group.actions.length)).toEqual([
      4, 4, 4,
    ]);
    expect(result.groups.map((group) => group.contexts?.length)).toEqual([
      5, 4, 5,
    ]);
    expect(result.groups[1].contexts?.map(({ key }) => key)).toEqual([
      'OFFENSIVE_TRANSITION',
      'PRESSURE_EXIT',
      'FLY_GOALKEEPER',
      'POSITIONAL_ATTACK',
    ]);
  });
});

function category(
  chave: string,
  nome: string,
  ordem: number,
  acoes: ActionCategoryEntity['acoes'],
  contextosAcaoEquipe?: ActionCategoryEntity['contextosAcaoEquipe'],
): ActionCategoryEntity {
  return {
    chave,
    nome,
    ordem,
    acoes,
    contextosAcaoEquipe,
    tipoAnaliseId: 1,
  } as ActionCategoryEntity;
}

function context(chave: string, nome: string, ordem: number) {
  return {
    id: `id-${chave}`,
    chave,
    nome,
    ordem,
  };
}

function action(sigla: string, nome: string, impacto: string, ordem: number) {
  const impactId = impacto === 'Positiva' ? 1 : impacto === 'Negativa' ? 2 : 3;

  return {
    id: `id-${sigla}`,
    sigla,
    nome,
    ordem,
    impacto: { id: impactId, nome: impacto },
  };
}
