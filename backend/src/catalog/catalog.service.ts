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
  CatalogImpact,
  IndividualCatalogResponseDto,
  TeamCatalogResponseDto,
} from './dto/individual-catalog-response.dto';

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

    const groups: IndividualCatalogResponseDto['groups'] = [];

    for (const category of categories) {
      if (!category.chave || category.ordem === null) {
        throw new Error(
          `Catalog category ${category.nome} has incomplete grouping metadata`,
        );
      }

      groups.push({
        key: category.chave,
        title: category.nome,
        order: category.ordem,
        actions: (category.acoes ?? []).map((action) => {
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
        }),
      });
    }

    return groups;
  }
}
