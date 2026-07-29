import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaggedActionEntity } from '../entities';
import { PlayerPerformanceDto } from './dto/player-performance.dto';

const MINUTES_PER_SESSION = 40;
const PLAYERS_ON_COURT = 4;

const ACTION_CODES = [
  'Gol TO',
  'Gol OO',
  'Gol BP',
  'Gol GL',
  'Gol MGL',
  'GS TO',
  'GS OO',
  'GS BP',
  'GS GLA',
  'GS GLO',
  'GM',
  'ASS',
  'AD',
  'CC',
  'PP',
  'GP',
  'FD',
  'RB',
  'DIA',
] as const;

type ActionCode = (typeof ACTION_CODES)[number];
type ActionCounts = Record<ActionCode, number>;

export type PlayerActionAggregate = {
  playerId: string;
  sessionCount: number;
  actions: ActionCounts;
};

type RawPlayerActionAggregate = {
  playerId: string;
  sessionCount: string;
} & Record<ActionCode, string>;

const COURT_GOAL_CODES: ActionCode[] = [
  'Gol TO',
  'Gol OO',
  'Gol BP',
  'Gol GL',
  'Gol MGL',
];
const COURT_GOAL_CONCEDED_CODES: ActionCode[] = [
  'GS TO',
  'GS OO',
  'GS BP',
  'GS GLA',
  'GS GLO',
];
const OFFENSIVE_ACTION_CODES: ActionCode[] = ['GM', 'ASS', 'AD', 'CC', 'PP'];
const DEFENSIVE_ACTION_CODES: ActionCode[] = ['GP', 'FD', 'RB', 'DIA'];

@Injectable()
export class PlayerStatisticsService {
  constructor(
    @InjectRepository(TaggedActionEntity)
    private readonly taggedActionsRepository: Repository<TaggedActionEntity>,
  ) {}

  async findByTeamId(
    teamId: string,
  ): Promise<Map<string, PlayerPerformanceDto>> {
    const query = this.taggedActionsRepository
      .createQueryBuilder('taggedAction')
      .innerJoin('taggedAction.sessao', 'session')
      .innerJoin('taggedAction.jogador', 'player')
      .innerJoin('taggedAction.acaoCatalogo', 'catalogAction')
      .select('taggedAction.jogadorId', 'playerId')
      .addSelect('COUNT(DISTINCT taggedAction.sessaoId)', 'sessionCount');

    ACTION_CODES.forEach((code, index) => {
      query
        .addSelect(
          `SUM(CASE WHEN catalogAction.sigla = :actionCode${index} THEN 1 ELSE 0 END)`,
          code,
        )
        .setParameter(`actionCode${index}`, code);
    });

    const rows = await query
      .where('taggedAction.jogadorId IS NOT NULL')
      .andWhere('taggedAction.deletedAt IS NULL')
      .andWhere('session.deletedAt IS NULL')
      .andWhere('player.deletedAt IS NULL')
      .andWhere('catalogAction.deletedAt IS NULL')
      .andWhere('session.equipeId = :teamId', { teamId })
      .andWhere('player.equipeId = :teamId', { teamId })
      .groupBy('taggedAction.jogadorId')
      .getRawMany<RawPlayerActionAggregate>();

    return calculatePlayerPerformances(rows.map(toPlayerActionAggregate));
  }
}

export function calculatePlayerPerformances(
  aggregates: PlayerActionAggregate[],
): Map<string, PlayerPerformanceDto> {
  const participants = aggregates.filter(
    (aggregate) => aggregate.sessionCount > 0,
  );
  if (participants.length === 0) return new Map();

  const totalMinutes = participants.reduce(
    (total, aggregate) => total + minutesFor(aggregate),
    0,
  );
  const teamOffensiveInfluence = participants.reduce(
    (total, aggregate) =>
      total + sumActions(aggregate.actions, ['GM', 'ASS', 'AD', 'CC']),
    0,
  );
  const teamDefensiveInfluence = participants.reduce(
    (total, aggregate) => total + sumActions(aggregate.actions, ['RB', 'DIA']),
    0,
  );
  const averageAtd =
    participants.reduce((total, aggregate) => total + atdBase(aggregate), 0) /
    participants.length;
  const averageDto =
    participants.reduce((total, aggregate) => total + dtoBase(aggregate), 0) /
    participants.length;

  return new Map(
    participants.map((aggregate) => [
      aggregate.playerId,
      calculatePerformance(aggregate, {
        totalMinutes,
        teamOffensiveInfluence,
        teamDefensiveInfluence,
        averageAtd,
        averageDto,
      }),
    ]),
  );
}

export function emptyPlayerPerformance(): PlayerPerformanceDto {
  return {
    minutes: 0,
    goals: 0,
    goalsTaken: 0,
    offensiveActions: 0,
    defensiveActions: 0,
    indexes: {
      radj: 0,
      goalsRelations: 0,
      actionsRelations: 0,
      atd: 0,
      dto: 0,
      pgj: 0,
      ic: 0,
      tio: 0,
      gtj: 0,
      rf: 0,
      tid: 0,
    },
  };
}

function calculatePerformance(
  aggregate: PlayerActionAggregate,
  team: {
    totalMinutes: number;
    teamOffensiveInfluence: number;
    teamDefensiveInfluence: number;
    averageAtd: number;
    averageDto: number;
  },
): PlayerPerformanceDto {
  const { actions } = aggregate;
  const minutes = minutesFor(aggregate);
  const goals = sumActions(actions, COURT_GOAL_CODES);
  const goalsTaken = sumActions(actions, COURT_GOAL_CONCEDED_CODES);
  const offensiveActions = sumActions(actions, OFFENSIVE_ACTION_CODES);
  const defensiveActions = sumActions(actions, DEFENSIVE_ACTION_CODES);
  const goalParticipations = actions.GM + actions.ASS + actions.AD;
  const offensiveInfluence = actions.GM + actions.ASS + actions.AD + actions.CC;
  const defensiveInfluence = actions.RB + actions.DIA;
  const pgj = divide(goalParticipations, minutes);
  const gtj = divide(goalsTaken, minutes);

  return {
    minutes,
    goals,
    goalsTaken,
    offensiveActions,
    defensiveActions,
    indexes: {
      radj: round(pgj - gtj),
      goalsRelations: round(
        divide(goals + actions.GM + actions.ASS + actions.AD, goalsTaken),
      ),
      actionsRelations: round(
        divide(
          actions.GM +
            actions.ASS +
            actions.AD +
            actions.CC +
            actions.RB +
            actions.DIA,
          actions.PP + actions.GP + actions.FD,
        ),
      ),
      atd: round(team.averageAtd - atdBase(aggregate)),
      dto: round(team.averageDto - dtoBase(aggregate)),
      pgj: round(pgj),
      ic: round(
        divide(actions.CC + actions.GM + actions.ASS + actions.AD, actions.PP),
      ),
      tio: round(
        divide(
          offensiveInfluence * (team.totalMinutes / PLAYERS_ON_COURT) * 100,
          minutes * team.teamOffensiveInfluence,
        ),
      ),
      gtj: round(gtj),
      rf: round(divide(2 * actions.RB + actions.DIA, actions.GP + actions.FD)),
      tid: round(
        divide(
          defensiveInfluence * (team.totalMinutes / PLAYERS_ON_COURT) * 100,
          minutes * team.teamDefensiveInfluence,
        ),
      ),
    },
  };
}

function toPlayerActionAggregate(
  row: RawPlayerActionAggregate,
): PlayerActionAggregate {
  return {
    playerId: row.playerId,
    sessionCount: Number(row.sessionCount),
    actions: Object.fromEntries(
      ACTION_CODES.map((code) => [code, Number(row[code] ?? 0)]),
    ) as ActionCounts,
  };
}

function minutesFor(aggregate: PlayerActionAggregate) {
  return aggregate.sessionCount * MINUTES_PER_SESSION;
}

function atdBase(aggregate: PlayerActionAggregate) {
  return divide(
    aggregate.actions.PP + aggregate.actions['GS TO'],
    minutesFor(aggregate),
  );
}

function dtoBase(aggregate: PlayerActionAggregate) {
  return divide(
    (2 * aggregate.actions.RB + aggregate.actions.DIA) / 3 +
      aggregate.actions['Gol TO'],
    minutesFor(aggregate),
  );
}

function sumActions(actions: ActionCounts, codes: ActionCode[]) {
  return codes.reduce((total, code) => total + actions[code], 0);
}

function divide(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator;
}

function round(value: number) {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}
