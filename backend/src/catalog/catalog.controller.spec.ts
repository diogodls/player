import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import type { TeamCatalogResponseDto } from './dto/catalog-response.dto';

describe('CatalogController', () => {
  it('serves the active v2 team catalog through the existing route handler', async () => {
    const catalog: TeamCatalogResponseDto = {
      analysisType: 'TEAM',
      groups: [
        group('TEAM_V2_SET_PIECE', 4, 5),
        group('TEAM_V2_ATTACK', 4, 4),
        group('TEAM_V2_DEFENSE', 4, 5),
      ],
    };
    const getTeamCatalog = jest.fn().mockResolvedValue(catalog);
    const controller = new CatalogController({
      getTeamCatalog,
    } as unknown as CatalogService);

    const result = await controller.getTeamCatalog();

    expect(getTeamCatalog).toHaveBeenCalledTimes(1);
    expect(result.groups).toHaveLength(3);
    expect(result.groups.flatMap((group) => group.actions)).toHaveLength(12);
    expect(result.groups.flatMap((group) => group.contexts ?? [])).toHaveLength(
      14,
    );
  });
});

function group(key: string, actionCount: number, contextCount: number) {
  return {
    key,
    title: key,
    order: 1,
    actions: Array.from({ length: actionCount }, (_, index) => ({
      id: `${key}-action-${index}`,
      key: `ACTION_${index}`,
      name: `Action ${index}`,
      impact: 'POSITIVE' as const,
      order: index + 1,
    })),
    contexts: Array.from({ length: contextCount }, (_, index) => ({
      id: `${key}-context-${index}`,
      key: `CONTEXT_${index}`,
      name: `Context ${index}`,
      order: index + 1,
    })),
  };
}
