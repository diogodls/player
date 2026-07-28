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
    ]);
    expect(
      result.groups
        .flatMap((group) => group.actions)
        .map((action) => action.key),
    ).toEqual(['GM', 'GP', 'Gol MGL', 'GS BP']);
    expect(result.groups[2].actions[0].impact).toBe('POSITIVE');
    expect(result.groups[3].actions[0].impact).toBe('NEGATIVE');
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

  it('returns team groups directly from database metadata', async () => {
    find.mockResolvedValue([
      category('SET_PIECE', 'Bola parada', 1, [
        action('BPSE', 'Bola parada sem execução', 'Negativa', 1),
      ]),
      category('OFFENSIVE_ORGANIZATION', 'Organização ofensiva', 2, [
        action('GSP', 'Gol de saída de pressão', 'Positiva', 1),
      ]),
    ]);

    const result = await service.getTeamCatalog();

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tipoAnaliseId: 2 } }),
    );
    expect(result).toEqual({
      analysisType: 'TEAM',
      groups: [
        expect.objectContaining({
          key: 'SET_PIECE',
          title: 'Bola parada',
          actions: [
            expect.objectContaining({ key: 'BPSE', impact: 'NEGATIVE' }),
          ],
        }),
        expect.objectContaining({
          key: 'OFFENSIVE_ORGANIZATION',
          title: 'Organização ofensiva',
          actions: [
            expect.objectContaining({ key: 'GSP', impact: 'POSITIVE' }),
          ],
        }),
      ],
    });
  });
});

function category(
  chave: string,
  nome: string,
  ordem: number,
  acoes: ActionCategoryEntity['acoes'],
): ActionCategoryEntity {
  return {
    chave,
    nome,
    ordem,
    acoes,
    tipoAnaliseId: 1,
  } as ActionCategoryEntity;
}

function action(sigla: string, nome: string, impacto: string, ordem: number) {
  return {
    id: `id-${sigla}`,
    sigla,
    nome,
    ordem,
    impacto: { id: impacto === 'Positiva' ? 1 : 2, nome: impacto },
  };
}
