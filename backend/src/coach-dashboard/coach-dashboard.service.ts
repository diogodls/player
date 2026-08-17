import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TEAM_ANALYSIS_TYPE_ID } from '../catalog/catalog.constants';
import {
  isTeamCatalogV2CategoryKey,
  TEAM_CATALOG_V2_ACTION_KEYS,
  TEAM_CATALOG_V2_CONTEXT_KEYS,
} from '../catalog/team-catalog-v2.constants';
import { TaggedActionEntity, TeamEntity } from '../entities';
import { PlayersService } from '../players/players.service';
import {
  CoachDashboardResponseDto,
  TeamIndexDto,
} from './dto/coach-dashboard-response.dto';
import { CoachDashboardFiltersDto } from './dto/coach-dashboard-filters.dto';

type CountRow = {
  actionKey: string;
  categoryKey: string;
  contextKey: string | null;
  count: string;
};
type WeightedAction = {
  actionKey: string;
  weight: number;
  positive: boolean;
};
type CardConfig = Omit<TeamIndexDto, 'value' | 'maxValue'> & {
  contextKey: string;
  actions: readonly WeightedAction[];
};
type ContextActionCounts = Record<string, number>;

const ATTACK_ACTIONS: readonly WeightedAction[] = [
  {
    actionKey: TEAM_CATALOG_V2_ACTION_KEYS.ATTACK.GOAL,
    weight: 4,
    positive: true,
  },
  {
    actionKey: TEAM_CATALOG_V2_ACTION_KEYS.ATTACK.SHOT,
    weight: 3,
    positive: true,
  },
  {
    actionKey: TEAM_CATALOG_V2_ACTION_KEYS.ATTACK.POSSESSION_MAINTAINED,
    weight: 2,
    positive: true,
  },
  {
    actionKey: TEAM_CATALOG_V2_ACTION_KEYS.ATTACK.POSSESSION_LOST,
    weight: 1,
    positive: false,
  },
] as const;
const DEFENSE_ACTIONS: readonly WeightedAction[] = [
  {
    actionKey: TEAM_CATALOG_V2_ACTION_KEYS.DEFENSE.RECOVERY,
    weight: 4,
    positive: true,
  },
  {
    actionKey: TEAM_CATALOG_V2_ACTION_KEYS.DEFENSE.INTERCEPTION,
    weight: 3,
    positive: true,
  },
  {
    actionKey: TEAM_CATALOG_V2_ACTION_KEYS.DEFENSE.SHOT_CONCEDED,
    weight: 2,
    positive: false,
  },
  {
    actionKey: TEAM_CATALOG_V2_ACTION_KEYS.DEFENSE.GOAL_CONCEDED,
    weight: 1,
    positive: false,
  },
] as const;
const SET_PIECE_ACTIONS: readonly WeightedAction[] = [
  {
    actionKey: TEAM_CATALOG_V2_ACTION_KEYS.SET_PIECE.GOAL,
    weight: 4,
    positive: true,
  },
  {
    actionKey: TEAM_CATALOG_V2_ACTION_KEYS.SET_PIECE.WELL_EXECUTED,
    weight: 3,
    positive: true,
  },
  {
    actionKey: TEAM_CATALOG_V2_ACTION_KEYS.SET_PIECE.POORLY_EXECUTED,
    weight: 2,
    positive: false,
  },
  {
    actionKey: TEAM_CATALOG_V2_ACTION_KEYS.SET_PIECE.NOT_EXECUTED,
    weight: 1,
    positive: false,
  },
] as const;

const card = (
  id: string,
  title: string,
  phase: TeamIndexDto['phase'],
  contextKey: string,
  actions: readonly WeightedAction[],
): CardConfig => ({ id, title, phase, contextKey, actions });

export const TEAM_INDEX_CONFIG: readonly CardConfig[] = [
  card(
    'offensive-transition',
    'Transição ofensiva',
    'offensive',
    TEAM_CATALOG_V2_CONTEXT_KEYS.OFFENSIVE_TRANSITION,
    ATTACK_ACTIONS,
  ),
  card(
    'playing-out-pressure',
    'Saída de pressão',
    'offensive',
    TEAM_CATALOG_V2_CONTEXT_KEYS.PRESSURE_EXIT,
    ATTACK_ACTIONS,
  ),
  card(
    'positional-attack',
    'Ataque posicional',
    'offensive',
    TEAM_CATALOG_V2_CONTEXT_KEYS.POSITIONAL_ATTACK,
    ATTACK_ACTIONS,
  ),
  card(
    'fly-goalkeeper',
    'Goleiro linha',
    'offensive',
    TEAM_CATALOG_V2_CONTEXT_KEYS.FLY_GOALKEEPER,
    ATTACK_ACTIONS,
  ),
  card(
    'defensive-fly-goalkeeper',
    'Goleiro linha defensivo',
    'defensive',
    TEAM_CATALOG_V2_CONTEXT_KEYS.DEFENSIVE_FLY_GOALKEEPER,
    DEFENSE_ACTIONS,
  ),
  card(
    'variable-pressing',
    'Marcação variando pra pressão',
    'defensive',
    TEAM_CATALOG_V2_CONTEXT_KEYS.VARIABLE_PRESSING,
    DEFENSE_ACTIONS,
  ),
  card(
    'pressing',
    'Pressão',
    'defensive',
    TEAM_CATALOG_V2_CONTEXT_KEYS.PRESSING,
    DEFENSE_ACTIONS,
  ),
  card(
    'low-block',
    'Marcação baixa',
    'defensive',
    TEAM_CATALOG_V2_CONTEXT_KEYS.LOW_BLOCK,
    DEFENSE_ACTIONS,
  ),
  card(
    'defensive-transition',
    'Transição defensiva',
    'defensive',
    TEAM_CATALOG_V2_CONTEXT_KEYS.DEFENSIVE_TRANSITION,
    DEFENSE_ACTIONS,
  ),
  card(
    'corner',
    'Canto',
    'set-piece',
    TEAM_CATALOG_V2_CONTEXT_KEYS.CORNER,
    SET_PIECE_ACTIONS,
  ),
  card(
    'offensive-kick-in',
    'Lateral ofensivo',
    'set-piece',
    TEAM_CATALOG_V2_CONTEXT_KEYS.OFFENSIVE_KICK_IN,
    SET_PIECE_ACTIONS,
  ),
  card(
    'defensive-kick-in',
    'Lateral defensivo',
    'set-piece',
    TEAM_CATALOG_V2_CONTEXT_KEYS.DEFENSIVE_KICK_IN,
    SET_PIECE_ACTIONS,
  ),
  card(
    'free-kick',
    'Falta',
    'set-piece',
    TEAM_CATALOG_V2_CONTEXT_KEYS.FREE_KICK,
    SET_PIECE_ACTIONS,
  ),
  card(
    'goal-clearance',
    'Arremesso de meta',
    'set-piece',
    TEAM_CATALOG_V2_CONTEXT_KEYS.GOAL_CLEARANCE,
    SET_PIECE_ACTIONS,
  ),
] as const;

const legacy = (contextKey: string, actionKey: string) => ({
  contextKey,
  actionKey,
});
const C = TEAM_CATALOG_V2_CONTEXT_KEYS;
const A = TEAM_CATALOG_V2_ACTION_KEYS;
const LEGACY_ACTION_MAPPINGS: Readonly<
  Record<string, { contextKey: string; actionKey: string }>
> = {
  GAP: legacy(C.POSITIONAL_ATTACK, A.ATTACK.GOAL),
  FAP: legacy(C.POSITIONAL_ATTACK, A.ATTACK.SHOT),
  PMAP: legacy(C.POSITIONAL_ATTACK, A.ATTACK.POSSESSION_MAINTAINED),
  PPAP: legacy(C.POSITIONAL_ATTACK, A.ATTACK.POSSESSION_LOST),
  GSP: legacy(C.PRESSURE_EXIT, A.ATTACK.GOAL),
  FSP: legacy(C.PRESSURE_EXIT, A.ATTACK.SHOT),
  PMSP: legacy(C.PRESSURE_EXIT, A.ATTACK.POSSESSION_MAINTAINED),
  PPSP: legacy(C.PRESSURE_EXIT, A.ATTACK.POSSESSION_LOST),
  GGL: legacy(C.FLY_GOALKEEPER, A.ATTACK.GOAL),
  FGL: legacy(C.FLY_GOALKEEPER, A.ATTACK.SHOT),
  PMGL: legacy(C.FLY_GOALKEEPER, A.ATTACK.POSSESSION_MAINTAINED),
  PPGL: legacy(C.FLY_GOALKEEPER, A.ATTACK.POSSESSION_LOST),
  GT: legacy(C.OFFENSIVE_TRANSITION, A.ATTACK.GOAL),
  FT: legacy(C.OFFENSIVE_TRANSITION, A.ATTACK.SHOT),
  PMT: legacy(C.OFFENSIVE_TRANSITION, A.ATTACK.POSSESSION_MAINTAINED),
  PPT: legacy(C.OFFENSIVE_TRANSITION, A.ATTACK.POSSESSION_LOST),
  MBRP: legacy(C.LOW_BLOCK, A.DEFENSE.RECOVERY),
  MBJI: legacy(C.LOW_BLOCK, A.DEFENSE.INTERCEPTION),
  MBFS: legacy(C.LOW_BLOCK, A.DEFENSE.SHOT_CONCEDED),
  MBGT: legacy(C.LOW_BLOCK, A.DEFENSE.GOAL_CONCEDED),
  VRP: legacy(C.VARIABLE_PRESSING, A.DEFENSE.RECOVERY),
  VJI: legacy(C.VARIABLE_PRESSING, A.DEFENSE.INTERCEPTION),
  VFS: legacy(C.VARIABLE_PRESSING, A.DEFENSE.SHOT_CONCEDED),
  VGT: legacy(C.VARIABLE_PRESSING, A.DEFENSE.GOAL_CONCEDED),
  PRP: legacy(C.PRESSING, A.DEFENSE.RECOVERY),
  PJI: legacy(C.PRESSING, A.DEFENSE.INTERCEPTION),
  PFS: legacy(C.PRESSING, A.DEFENSE.SHOT_CONCEDED),
  PRGT: legacy(C.PRESSING, A.DEFENSE.GOAL_CONCEDED),
  TRP: legacy(C.DEFENSIVE_TRANSITION, A.DEFENSE.RECOVERY),
  TFS: legacy(C.DEFENSIVE_TRANSITION, A.DEFENSE.SHOT_CONCEDED),
  TGT: legacy(C.DEFENSIVE_TRANSITION, A.DEFENSE.GOAL_CONCEDED),
};

const countKey = (contextKey: string, actionKey: string) =>
  `${contextKey}:${actionKey}`;

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

export function calculateContextEfficiency(
  contextKey: string,
  actions: readonly WeightedAction[],
  counts: ContextActionCounts,
): number | null {
  let positiveScore = 0;
  let negativeScore = 0;
  let actionCount = 0;
  for (const action of actions) {
    const count = counts[countKey(contextKey, action.actionKey)] ?? 0;
    actionCount += count;
    if (action.positive) positiveScore += count * action.weight;
    else negativeScore += count * action.weight;
  }
  if (actionCount === 0) return null;
  const total = positiveScore + negativeScore;
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
    [input.goals, input.shots, input.maintainedPossessions],
    [input.possessionLosses],
    { positive: [4, 3, 2], negative: [1] },
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
    { positive: [4, 3], negative: [2, 1] },
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
    ) {
      throw new BadRequestException(
        'Data inicial deve ser anterior à data final',
      );
    }
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
    counts: ContextActionCounts,
  ): TeamIndexDto {
    return {
      id: config.id,
      title: config.title,
      phase: config.phase,
      maxValue: 100,
      value: calculateContextEfficiency(
        config.contextKey,
        config.actions,
        counts,
      ),
    };
  }

  private async findCollectiveActionCounts(
    teamId: string,
    filters: CoachDashboardFiltersDto,
  ): Promise<ContextActionCounts> {
    const query = this.taggedActionsRepository
      .createQueryBuilder('taggedAction')
      .innerJoin('taggedAction.sessao', 'session')
      .innerJoin('taggedAction.acaoCatalogo', 'catalogAction')
      .innerJoin('catalogAction.categoriaAcao', 'category')
      .leftJoin('taggedAction.contextoAcaoEquipe', 'teamContext')
      .select('catalogAction.sigla', 'actionKey')
      .addSelect('category.chave', 'categoryKey')
      .addSelect('teamContext.chave', 'contextKey')
      .addSelect('COUNT(taggedAction.id)', 'count')
      .where('taggedAction.jogadorId IS NULL')
      .andWhere('taggedAction.deletedAt IS NULL')
      .andWhere('session.deletedAt IS NULL')
      .andWhere('catalogAction.deletedAt IS NULL')
      .andWhere('category.deletedAt IS NULL')
      .andWhere('teamContext.deletedAt IS NULL')
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
      .addGroupBy('category.chave')
      .addGroupBy('teamContext.chave')
      .getRawMany<CountRow>();
    return this.normalizeCounts(rows);
  }

  private normalizeCounts(rows: CountRow[]): ContextActionCounts {
    const counts: ContextActionCounts = {};
    for (const row of rows) {
      const target =
        isTeamCatalogV2CategoryKey(row.categoryKey) && row.contextKey
          ? { contextKey: row.contextKey, actionKey: row.actionKey }
          : LEGACY_ACTION_MAPPINGS[row.actionKey];
      if (!target) continue;
      const key = countKey(target.contextKey, target.actionKey);
      counts[key] = (counts[key] ?? 0) + Number(row.count);
    }
    return counts;
  }
}
