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
