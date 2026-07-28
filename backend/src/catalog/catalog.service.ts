import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionCategoryEntity } from '../entities';
import {
  IMPACT_NAMES,
  INDIVIDUAL_ANALYSIS_TYPE_ID,
  TEAM_ANALYSIS_TYPE_ID,
} from './catalog.constants';
import {
  CatalogGroupDto,
  CatalogImpact,
  IndividualCatalogResponseDto,
  TeamCatalogResponseDto,
} from './dto/catalog-response.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(ActionCategoryEntity)
    private readonly categoriesRepository: Repository<ActionCategoryEntity>,
  ) {}

  async getIndividualCatalog(): Promise<IndividualCatalogResponseDto> {
    const groups = await this.getCatalogGroups(INDIVIDUAL_ANALYSIS_TYPE_ID);
    return { analysisType: 'INDIVIDUAL', groups };
  }

  async getTeamCatalog(): Promise<TeamCatalogResponseDto> {
    const groups = await this.getCatalogGroups(TEAM_ANALYSIS_TYPE_ID);
    return { analysisType: 'TEAM', groups };
  }

  private async getCatalogGroups(tipoAnaliseId: number) {
    const categories = await this.categoriesRepository.find({
      where: { tipoAnaliseId },
      relations: { acoes: { impacto: true } },
      order: {
        ordem: 'ASC',
        acoes: {
          ordem: 'ASC',
          sigla: 'ASC',
        },
      },
    });

    const groups: CatalogGroupDto[] = [];
    for (const category of categories) {
      const isIndividualOffensiveGroup =
        tipoAnaliseId === INDIVIDUAL_ANALYSIS_TYPE_ID &&
        this.normalizeGroupName(category.nome) === 'ACOES OFENSIVAS';
      const groupKey = isIndividualOffensiveGroup
        ? 'OFFENSIVE_ACTIONS'
        : category.chave;
      const groupTitle = isIndividualOffensiveGroup
        ? 'Ações ofensivas'
        : category.nome;
      const groupOrder = isIndividualOffensiveGroup ? 1 : category.ordem;

      if (!groupKey || groupOrder === null) {
        throw new Error(
          `Catalog category ${category.nome} has incomplete grouping metadata`,
        );
      }

      const actions = (category.acoes ?? []).map((action) => {
        const impact = action.impacto?.nome;
        if (action.ordem === null) {
          throw new Error(`Catalog action ${action.sigla} has no order`);
        }
        if (!impact || !(impact in IMPACT_NAMES)) {
          throw new Error(
            `Catalog action ${action.sigla} has an unsupported impact`,
          );
        }
        return {
          id: action.id,
          key: action.sigla,
          name: action.nome,
          impact: IMPACT_NAMES[impact] as CatalogImpact,
          order: action.ordem,
        };
      });
      const existingGroup = groups.find((group) => group.key === groupKey);

      if (existingGroup) {
        const existingActionIds = new Set(
          existingGroup.actions.map((action) => action.id),
        );
        existingGroup.actions.push(
          ...actions.filter((action) => !existingActionIds.has(action.id)),
        );
        existingGroup.actions.sort(
          (left, right) =>
            left.order - right.order || left.key.localeCompare(right.key),
        );
        continue;
      }

      groups.push({
        key: groupKey,
        title: groupTitle,
        order: groupOrder,
        actions,
      });
    }

    return groups;
  }

  private normalizeGroupName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase();
  }
}
