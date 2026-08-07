import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TEAM_ANALYSIS_TYPE_ID } from '../catalog/catalog.constants';
import { TaggedActionEntity, TeamEntity } from '../entities';
import { PlayersService } from '../players/players.service';
import {
  CoachDashboardResponseDto,
  TeamIndexDto,
} from './dto/coach-dashboard-response.dto';
import { CoachDashboardFiltersDto } from './dto/coach-dashboard-filters.dto';
type CountRow = { acronym: string; count: string };
type CardConfig = Omit<TeamIndexDto, 'value' | 'maxValue'> & {
  positiveActionKeys: readonly string[];
  negativeActionKeys: readonly string[];
};
export const TEAM_INDEX_CONFIG: readonly CardConfig[] = [
  {
    id: 'positional-attack',
    title: 'Ataque posicional',
    phase: 'offensive',
    positiveActionKeys: ['GAP', 'FAP'],
    negativeActionKeys: ['PPAP', 'PMAP'],
  },
  {
    id: 'playing-out-pressure',
    title: 'Saída de pressão',
    phase: 'offensive',
    positiveActionKeys: ['GSP', 'FSP'],
    negativeActionKeys: ['PPSP', 'PMSP'],
  },
  {
    id: 'fly-goalkeeper',
    title: 'Goleiro linha',
    phase: 'offensive',
    positiveActionKeys: ['GGL', 'FGL'],
    negativeActionKeys: ['PPGL', 'PMGL'],
  },
  {
    id: 'offensive-transition',
    title: 'Transição ofensiva',
    phase: 'offensive',
    positiveActionKeys: ['GT', 'FT'],
    negativeActionKeys: ['PPT', 'PMT'],
  },
  {
    id: 'low-block',
    title: 'Marcação baixa',
    phase: 'defensive',
    positiveActionKeys: ['MBRP', 'MBJI'],
    negativeActionKeys: ['MBFS', 'MBGT'],
  },
  {
    id: 'variable-defense',
    title: 'Marcação variável',
    phase: 'defensive',
    positiveActionKeys: ['VRP', 'VJI'],
    negativeActionKeys: ['VFS', 'VGT'],
  },
  {
    id: 'pressing',
    title: 'Pressing',
    phase: 'defensive',
    positiveActionKeys: ['PRP', 'PJI'],
    negativeActionKeys: ['PFS', 'PRGT'],
  },
  {
    id: 'defensive-transition',
    title: 'Transição defensiva',
    phase: 'defensive',
    positiveActionKeys: ['TRP'],
    negativeActionKeys: ['TFS', 'TGT'],
  },
  {
    id: 'set-piece',
    title: 'Bolas paradas',
    phase: 'set-piece',
    positiveActionKeys: ['BPBE', 'GBP'],
    negativeActionKeys: ['BPSE', 'BPME'],
  },
] as const;
const TEAM_INDEX_WEIGHTS = {
  positive: [4, 3],
  negative: [2, 1],
} as const;
export function calculateWeightedEfficiency(
  positives: readonly number[],
  negatives: readonly number[],
  weights: { positive: readonly number[]; negative: readonly number[] },
): number | null {
  const positiveScore = positives.reduce(
    (sum, value, index) => sum + value * (weights.positive[index] ?? 0),
    0,
  );
  const negativeScore = negatives.reduce(
    (sum, value, index) => sum + value * (weights.negative[index] ?? 0),
    0,
  );
  const total = positiveScore + negativeScore;
  if (total === 0) return null;
  return (
    Math.round(Math.min(100, Math.max(0, (positiveScore / total) * 100)) * 10) /
    10
  );
}
export function calculateOffensiveEfficiency(input: {
  goals: number;
  shots: number;
  possessionLosses: number;
  maintainedPossessions: number;
}) {
  return calculateWeightedEfficiency(
    [input.goals, input.shots],
    [input.possessionLosses, input.maintainedPossessions],
    TEAM_INDEX_WEIGHTS,
  );
}
export function calculateDefensiveEfficiency(input: {
  recoveries: number;
  interceptions: number;
  shotsConceded: number;
  goalsConceded: number;
}) {
  return calculateWeightedEfficiency(
    [input.recoveries, input.interceptions],
    [input.shotsConceded, input.goalsConceded],
    TEAM_INDEX_WEIGHTS,
  );
}
@Injectable()
export class CoachDashboardService {
  constructor(
    @InjectRepository(TaggedActionEntity)
    private readonly taggedActionsRepository: Repository<TaggedActionEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamsRepository: Repository<TeamEntity>,
    private readonly playersService: PlayersService,
  ) {}
  async getDashboard(
    filters: CoachDashboardFiltersDto = {},
  ): Promise<CoachDashboardResponseDto> {
    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    )
      throw new BadRequestException(
        'Data inicial deve ser anterior à data final',
      );
    const [team] = await this.teamsRepository.find({ take: 1 });
    if (!team) throw new BadRequestException('Equipe não encontrada');
    const [counts, players] = await Promise.all([
      this.findCollectiveActionCounts(team.id, filters),
      this.playersService.findDashboardPlayers(team.id, filters),
    ]);
    return {
      metrics: [
        'Minutagem',
        'Gols em quadra',
        'Gols tomados em quadra',
        'Ações ofensivas',
        'Ações defensivas',
      ],
      players,
      teamIndexes: TEAM_INDEX_CONFIG.map((config) =>
        this.buildCard(config, counts),
      ),
    };
  }
  private buildCard(
    config: CardConfig,
    counts: Record<string, number>,
  ): TeamIndexDto {
    const count = (key: string) => counts[key] ?? 0;
    return {
      id: config.id,
      title: config.title,
      phase: config.phase,
      maxValue: 100,
      value: calculateWeightedEfficiency(
        config.positiveActionKeys.map(count),
        config.negativeActionKeys.map(count),
        TEAM_INDEX_WEIGHTS,
      ),
    };
  }
  private async findCollectiveActionCounts(
    teamId: string,
    filters: CoachDashboardFiltersDto,
  ): Promise<Record<string, number>> {
    const query = this.taggedActionsRepository
      .createQueryBuilder('taggedAction')
      .innerJoin('taggedAction.sessao', 'session')
      .innerJoin('taggedAction.acaoCatalogo', 'catalogAction')
      .innerJoin('catalogAction.categoriaAcao', 'category')
      .select('catalogAction.sigla', 'acronym')
      .addSelect('COUNT(taggedAction.id)', 'count')
      .where('taggedAction.jogadorId IS NULL')
      .andWhere('taggedAction.deletedAt IS NULL')
      .andWhere('session.deletedAt IS NULL')
      .andWhere('catalogAction.deletedAt IS NULL')
      .andWhere('category.deletedAt IS NULL')
      .andWhere('session.equipeId = :teamId', { teamId })
      .andWhere('category.tipoAnaliseId = :teamAnalysisTypeId', {
        teamAnalysisTypeId: TEAM_ANALYSIS_TYPE_ID,
      });
    if (filters.sessionId)
      query.andWhere('session.id = :sessionId', {
        sessionId: filters.sessionId,
      });
    if (filters.startDate)
      query.andWhere('session.data >= :startDate', {
        startDate: filters.startDate,
      });
    if (filters.endDate)
      query.andWhere('session.data <= :endDate', { endDate: filters.endDate });
    const rows = await query
      .groupBy('catalogAction.sigla')
      .getRawMany<CountRow>();
    return Object.fromEntries(
      rows.map(({ acronym, count }) => [acronym, Number(count)]),
    );
  }
}
