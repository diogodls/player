import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TEAM_ANALYSIS_TYPE_ID } from '../catalog/catalog.constants';
import { TaggedActionEntity, TeamEntity } from '../entities';
import {
  CoachDashboardPlayerDto,
  CoachDashboardResponseDto,
} from './dto/coach-dashboard-response.dto';
import { CoachDashboardFiltersDto } from './dto/coach-dashboard-filters.dto';

type OffensiveEfficiencyInput = {
  goals: number;
  shots: number;
  possessionLosses: number;
  maintainedPossessions: number;
};

type DefensiveEfficiencyInput = {
  recoveries: number;
  interceptions: number;
  shotsConceded: number;
  goalsConceded: number;
};

type CollectiveActionCountRow = { acronym: string; count: string };

export function calculateOffensiveEfficiency({
  goals,
  shots,
  possessionLosses,
  maintainedPossessions,
}: OffensiveEfficiencyInput): number | null {
  const positiveScore = goals * 4 + shots * 3;
  const totalScore =
    positiveScore + possessionLosses * 2 + maintainedPossessions;
  return calculateEfficiency(positiveScore, totalScore);
}

export function calculateDefensiveEfficiency({
  recoveries,
  interceptions,
  shotsConceded,
  goalsConceded,
}: DefensiveEfficiencyInput): number | null {
  const positiveScore = recoveries * 4 + interceptions * 3;
  const totalScore = positiveScore + shotsConceded * 2 + goalsConceded;
  return calculateEfficiency(positiveScore, totalScore);
}

function calculateEfficiency(
  positiveScore: number,
  totalScore: number,
): number | null {
  if (totalScore === 0) return null;
  const efficiency = (positiveScore / totalScore) * 100;
  return Number.isFinite(efficiency)
    ? Math.min(100, Math.max(0, efficiency))
    : null;
}

@Injectable()
export class CoachDashboardService {
  constructor(
    @InjectRepository(TaggedActionEntity)
    private readonly taggedActionsRepository: Repository<TaggedActionEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamsRepository: Repository<TeamEntity>,
  ) {}

  async getDashboard(
    filters: CoachDashboardFiltersDto = {},
  ): Promise<CoachDashboardResponseDto> {
    const [team] = await this.teamsRepository.find({ take: 1 });
    if (!team) throw new BadRequestException('Equipe nao encontrada');

    const countsByAcronym = await this.findCollectiveActionCounts(
      team.id,
      filters,
    );
    const getCount = (acronym: string): number => countsByAcronym[acronym] ?? 0;
    const positionalAttack = calculateOffensiveEfficiency({
      goals: getCount('GAP'),
      shots: getCount('FAP'),
      possessionLosses: getCount('PPAP'),
      maintainedPossessions: getCount('PMAP'),
    });
    const pressureExit = calculateOffensiveEfficiency({
      goals: getCount('GSP'),
      shots: getCount('FSP'),
      possessionLosses: getCount('PPSP'),
      maintainedPossessions: getCount('PMSP'),
    });
    const goalkeeperLine = calculateOffensiveEfficiency({
      goals: getCount('GGL'),
      shots: getCount('FGL'),
      possessionLosses: getCount('PPGL'),
      maintainedPossessions: getCount('PMGL'),
    });
    const offensiveTransition = calculateOffensiveEfficiency({
      goals: getCount('GT'),
      shots: getCount('FT'),
      possessionLosses: getCount('PPT'),
      maintainedPossessions: getCount('PMT'),
    });
    const lowBlock = calculateDefensiveEfficiency({
      recoveries: getCount('MBRP'),
      interceptions: getCount('MBJI'),
      shotsConceded: getCount('MBFS'),
      goalsConceded: getCount('MBGT'),
    });
    const variableMarking = calculateDefensiveEfficiency({
      recoveries: getCount('VRP'),
      interceptions: getCount('VJI'),
      shotsConceded: getCount('VFS'),
      goalsConceded: getCount('VGT'),
    });
    const pressureMarking = calculateDefensiveEfficiency({
      recoveries: getCount('PRP'),
      interceptions: getCount('PJI'),
      shotsConceded: getCount('PFS'),
      goalsConceded: getCount('PRGT'),
    });
    const defensiveTransition = calculateDefensiveEfficiency({
      recoveries: getCount('TRP'),
      interceptions: 0,
      shotsConceded: getCount('TFS'),
      goalsConceded: getCount('TGT'),
    });

    return {
      averageTeamCards: [
        {
          name: 'Média Ofensiva Geral',
          color: 'linear-gradient(135deg, #2563eb, #1e40af)',
          value: '10',
          icon: 'faChartColumn',
        },
        {
          name: 'Média Defensiva Geral',
          color: 'linear-gradient(135deg, #f97316, #c2410c)',
          value: '20',
          icon: 'faChartColumn',
        },
        {
          name: 'Média Geral da Equipe',
          color: 'linear-gradient(135deg, #22c55e, #15803d)',
          value: '10',
          icon: 'faTrophy',
        },
      ],
      metrics: [
        'Minutagem',
        'Gols em quadra',
        'Gols tomados em quadra',
        'Ações defensivas',
        'Ações ofensivas',
      ],
      players: [
        this.player(
          '00000000-0000-4000-8000-000000000201',
          'João',
          98,
          'Fixo',
          31,
          68,
          2,
          7,
          1,
        ),
        this.player(
          '00000000-0000-4000-8000-000000000202',
          'Guga',
          97,
          'Pivo',
          40,
          9,
          52,
          31,
          14,
        ),
        this.player(
          '00000000-0000-4000-8000-000000000203',
          'Guedes',
          96,
          'Ala',
          36,
          42,
          46,
          28,
          10,
        ),
        this.player(
          '00000000-0000-4000-8000-000000000204',
          'Senna',
          99,
          'Ala',
          85,
          18,
          42,
          22,
          18,
        ),
        this.player(
          '00000000-0000-4000-8000-000000000205',
          'Balk',
          95,
          'Fixo',
          25,
          39,
          30,
          23,
          2,
        ),
      ],
      teamIndexes: [
        {
          id: 'positional-attack',
          title: 'Ataque posicional',
          value: positionalAttack,
          phase: 'offensive',
          trend: 'up',
          maxValue: 100,
        },
        {
          id: 'playing-out-pressure',
          title: 'Saída de pressão',
          value: pressureExit,
          phase: 'offensive',
          trend: 'up',
          maxValue: 100,
        },
        {
          id: 'fly-goalkeeper',
          title: 'Goleiro linha',
          value: goalkeeperLine,
          phase: 'offensive',
          trend: 'stable',
          maxValue: 100,
        },
        {
          id: 'offensive-transition',
          title: 'Transição ofensiva',
          value: offensiveTransition,
          phase: 'offensive',
          trend: 'up',
          maxValue: 100,
        },
        {
          id: 'low-block',
          title: 'Marcação baixa',
          value: lowBlock,
          phase: 'defensive',
          trend: 'stable',
          maxValue: 100,
        },
        {
          id: 'variable-defense',
          title: 'Marcação variável',
          value: variableMarking,
          phase: 'defensive',
          trend: 'up',
          maxValue: 100,
        },
        {
          id: 'pressing',
          title: 'Pressing',
          value: pressureMarking,
          phase: 'defensive',
          trend: 'up',
          maxValue: 100,
        },
        {
          id: 'defensive-transition',
          title: 'Transição defensiva',
          value: defensiveTransition,
          phase: 'defensive',
          trend: 'down',
          maxValue: 100,
        },
        {
          id: 'set-piece',
          title: 'Bolas paradas',
          value: null,
          phase: 'set-piece',
          trend: 'stable',
          maxValue: 100,
        },
      ],
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

    if (filters.sessionId) {
      query.andWhere('session.id = :sessionId', {
        sessionId: filters.sessionId,
      });
    }
    if (filters.startDate) {
      query.andWhere('session.data >= :startDate', {
        startDate: filters.startDate,
      });
    }
    if (filters.endDate) {
      query.andWhere('session.data <= :endDate', { endDate: filters.endDate });
    }

    const rows = await query
      .groupBy('catalogAction.sigla')
      .getRawMany<CollectiveActionCountRow>();

    return Object.fromEntries(
      rows.map(({ acronym, count }) => [acronym, Number(count)]),
    );
  }

  private player(
    id: string,
    name: string,
    overall: number,
    position: string,
    minutes: number,
    defensiveActions: number,
    offensiveActions: number,
    goalsTaken: number,
    goals: number,
  ): CoachDashboardPlayerDto {
    return {
      id,
      name,
      overall,
      position,
      minutes,
      defensiveActions,
      offensiveActions,
      goalsTaken,
      goals,
      indexes: {
        radj: 2,
        goalsRelations: 2,
        actionsRelations: 2,
        atd: 2,
        dto: 2,
        pgj: 2,
        ic: 2,
        tio: 2,
        gtj: 2,
        rf: 2,
        tid: 2,
      },
    };
  }
}
