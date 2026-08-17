import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerSessionMinutesEntity, TaggedActionEntity } from '../entities';
import { PlayerPerformanceDto } from './dto/player-performance.dto';

const PLAYERS_ON_COURT = 4;
const GAME_MINUTES = 40;

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
  secondsPlayed: number;
  actions: ActionCounts;
};

type RawPlayerActionAggregate = {
  playerId: string;
} & Record<ActionCode, string>;

export type PlayerSessionMinutes = {
  playerId: string;
  sessionId: string;
  totalSeconds: number;
};

type RawPlayerSessionMinutes = {
  playerId: string;
  sessionId: string;
  totalSeconds: string;
};

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
    @InjectRepository(PlayerSessionMinutesEntity)
    private readonly playerSessionMinutesRepository: Repository<PlayerSessionMinutesEntity>,
  ) {}

  async findByTeamId(
    teamId: string,
    sessionId?: string,
    period?: { startDate?: string; endDate?: string },
  ): Promise<Map<string, PlayerPerformanceDto>> {
    const query = this.taggedActionsRepository
      .createQueryBuilder('taggedAction')
      .innerJoin('taggedAction.sessao', 'session')
      .innerJoin('taggedAction.jogador', 'player')
      .innerJoin('taggedAction.acaoCatalogo', 'catalogAction')
      .select('taggedAction.jogadorId', 'playerId');

    ACTION_CODES.forEach((code, index) => {
      query
        .addSelect(
          `SUM(CASE WHEN catalogAction.sigla = :actionCode${index} THEN 1 ELSE 0 END)`,
          code,
        )
        .setParameter(`actionCode${index}`, code);
    });

    query
      .where('taggedAction.jogadorId IS NOT NULL')
      .andWhere('taggedAction.deletedAt IS NULL')
      .andWhere('session.deletedAt IS NULL')
      .andWhere('player.deletedAt IS NULL')
      .andWhere('catalogAction.deletedAt IS NULL')
      .andWhere('session.equipeId = :teamId', { teamId })
      .andWhere('player.equipeId = :teamId', { teamId });
    if (sessionId) {
      query.andWhere('session.id = :sessionId', { sessionId });
    }
    if (period?.startDate)
      query.andWhere('session.data >= :startDate', {
        startDate: period.startDate,
      });
    if (period?.endDate)
      query.andWhere('session.data <= :endDate', { endDate: period.endDate });
    const aggregateRows = await query
      .groupBy('taggedAction.jogadorId')
      .getRawMany<RawPlayerActionAggregate>();

    const minutesQuery = this.playerSessionMinutesRepository
      .createQueryBuilder('minutes')
      .innerJoin('minutes.session', 'session')
      .innerJoin('minutes.player', 'player')
      .select('minutes.playerId', 'playerId')
      .addSelect('minutes.sessionId', 'sessionId')
      .addSelect('minutes.totalSeconds', 'totalSeconds')
      .where('session.deletedAt IS NULL')
      .andWhere('player.deletedAt IS NULL')
      .andWhere('session.equipeId = :teamId', { teamId })
      .andWhere('player.equipeId = :teamId', { teamId });
    if (sessionId) {
      minutesQuery.andWhere('session.id = :sessionId', { sessionId });
    }
    if (period?.startDate)
      minutesQuery.andWhere('session.data >= :startDate', {
        startDate: period.startDate,
      });
    if (period?.endDate)
      minutesQuery.andWhere('session.data <= :endDate', {
        endDate: period.endDate,
      });
    const minutesRows =
      await minutesQuery.getRawMany<RawPlayerSessionMinutes>();

    const officialMinutes = minutesRows.map(toPlayerSessionMinutes);
    const secondsPlayedByPlayer =
      calculateOfficialPlayingSeconds(officialMinutes);

    const aggregateRowsByPlayer = new Map(
      aggregateRows.map((row) => [row.playerId, row]),
    );
    const playerIds = new Set([
      ...aggregateRowsByPlayer.keys(),
      ...minutesRows.map((row) => row.playerId),
    ]);

    return calculatePlayerPerformances(
      Array.from(playerIds, (playerId) =>
        toPlayerActionAggregate(
          aggregateRowsByPlayer.get(playerId),
          playerId,
          secondsPlayedByPlayer.get(playerId) ?? 0,
        ),
      ),
    );
  }
}

export function calculateSessionPlayerPerformances(
  actions: TaggedActionEntity[],
  minutesRecords: PlayerSessionMinutes[] = [],
): Map<string, PlayerPerformanceDto> {
  const countsByPlayer = new Map<string, ActionCounts>();

  actions.forEach((action) => {
    if (!action.jogadorId || !action.acaoCatalogo) return;

    const counts =
      countsByPlayer.get(action.jogadorId) ??
      (Object.fromEntries(
        ACTION_CODES.map((code) => [code, 0]),
      ) as ActionCounts);
    const code = action.acaoCatalogo.sigla;

    if ((ACTION_CODES as readonly string[]).includes(code)) {
      counts[code as ActionCode] += 1;
    }
    countsByPlayer.set(action.jogadorId, counts);
  });

  minutesRecords.forEach((record) => {
    if (!countsByPlayer.has(record.playerId)) {
      countsByPlayer.set(record.playerId, emptyActionCounts());
    }
  });
  const secondsByPlayer = calculateOfficialPlayingSeconds(minutesRecords);
  return calculatePlayerPerformances(
    Array.from(countsByPlayer, ([playerId, actionCounts]) => ({
      playerId,
      secondsPlayed: secondsByPlayer.get(playerId) ?? 0,
      actions: actionCounts,
    })),
  );
}

export function calculatePlayerPerformances(
  aggregates: PlayerActionAggregate[],
): Map<string, PlayerPerformanceDto> {
  if (aggregates.length === 0) return new Map();
  const participants = aggregates.filter(
    (aggregate) => aggregate.secondsPlayed > 0,
  );

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
    participants.length === 0
      ? 0
      : participants.reduce(
          (total, aggregate) => total + atdBase(aggregate),
          0,
        ) / participants.length;
  const averageDto =
    participants.length === 0
      ? 0
      : participants.reduce(
          (total, aggregate) => total + dtoBase(aggregate),
          0,
        ) / participants.length;

  return new Map(
    aggregates.map((aggregate) => [
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
  const equivalentGames = divide(minutes, GAME_MINUTES);
  const pgj = divide(goalParticipations, equivalentGames);
  const gtj = divide(goalsTaken + actions.GP, equivalentGames);

  return {
    minutes: round(minutes),
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
      atd: minutes === 0 ? 0 : round(team.averageAtd - atdBase(aggregate)),
      dto: minutes === 0 ? 0 : round(team.averageDto - dtoBase(aggregate)),
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
  row: RawPlayerActionAggregate | undefined,
  playerId: string,
  secondsPlayed: number,
): PlayerActionAggregate {
  return {
    playerId,
    secondsPlayed,
    actions: Object.fromEntries(
      ACTION_CODES.map((code) => [code, Number(row?.[code] ?? 0)]),
    ) as ActionCounts,
  };
}

function minutesFor(aggregate: PlayerActionAggregate) {
  return aggregate.secondsPlayed / 60;
}

export function calculateOfficialPlayingSeconds(
  minutesRecords: PlayerSessionMinutes[],
): Map<string, number> {
  const secondsByPlayer = new Map<string, number>();
  minutesRecords.forEach((record) => {
    secondsByPlayer.set(
      record.playerId,
      (secondsByPlayer.get(record.playerId) ?? 0) + record.totalSeconds,
    );
  });
  return secondsByPlayer;
}

function toPlayerSessionMinutes(
  row: RawPlayerSessionMinutes,
): PlayerSessionMinutes {
  return {
    playerId: row.playerId,
    sessionId: row.sessionId,
    totalSeconds: Number(row.totalSeconds),
  };
}

function emptyActionCounts(): ActionCounts {
  return Object.fromEntries(
    ACTION_CODES.map((code) => [code, 0]),
  ) as ActionCounts;
}

function atdBase(aggregate: PlayerActionAggregate) {
  return divide(
    aggregate.actions.PP + aggregate.actions['GS TO'],
    divide(minutesFor(aggregate), GAME_MINUTES),
  );
}

function dtoBase(aggregate: PlayerActionAggregate) {
  return divide(
    (2 * aggregate.actions.RB + aggregate.actions.DIA) / 3 +
      aggregate.actions['Gol TO'],
    divide(minutesFor(aggregate), GAME_MINUTES),
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
