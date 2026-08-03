import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaggedActionEntity } from '../entities';
import { PlayerPerformanceDto } from './dto/player-performance.dto';

const PLAYERS_ON_COURT = 4;
export const PLAYER_ENTERED_COURT_CODE = 'ENTROU';
export const PLAYER_LEFT_COURT_CODE = 'SAIU';

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

export type PlayerCourtEvent = {
  id: string;
  playerId: string;
  sessionId: string;
  code: typeof PLAYER_ENTERED_COURT_CODE | typeof PLAYER_LEFT_COURT_CODE;
  timestampSeconds: number;
};

type RawPlayerCourtEvent = {
  id: string;
  playerId: string;
  sessionId: string;
  code: PlayerCourtEvent['code'];
  timestampSeconds: string;
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

    const courtEventsQuery = this.taggedActionsRepository
      .createQueryBuilder('taggedAction')
      .innerJoin('taggedAction.sessao', 'session')
      .innerJoin('taggedAction.jogador', 'player')
      .innerJoin('taggedAction.acaoCatalogo', 'catalogAction')
      .select('taggedAction.id', 'id')
      .addSelect('taggedAction.jogadorId', 'playerId')
      .addSelect('taggedAction.sessaoId', 'sessionId')
      .addSelect('catalogAction.sigla', 'code')
      .addSelect('taggedAction.timestampSegundos', 'timestampSeconds')
      .where('catalogAction.sigla IN (:...courtEventCodes)', {
        courtEventCodes: [PLAYER_ENTERED_COURT_CODE, PLAYER_LEFT_COURT_CODE],
      })
      .andWhere('taggedAction.jogadorId IS NOT NULL')
      .andWhere('taggedAction.deletedAt IS NULL')
      .andWhere('session.deletedAt IS NULL')
      .andWhere('player.deletedAt IS NULL')
      .andWhere('catalogAction.deletedAt IS NULL')
      .andWhere('session.equipeId = :teamId', { teamId })
      .andWhere('player.equipeId = :teamId', { teamId });
    if (sessionId) {
      courtEventsQuery.andWhere('session.id = :sessionId', { sessionId });
    }
    if (period?.startDate)
      courtEventsQuery.andWhere('session.data >= :startDate', {
        startDate: period.startDate,
      });
    if (period?.endDate)
      courtEventsQuery.andWhere('session.data <= :endDate', {
        endDate: period.endDate,
      });
    const courtEventRows = await courtEventsQuery
      .orderBy('taggedAction.timestampSegundos', 'ASC')
      .addOrderBy('taggedAction.id', 'ASC')
      .getRawMany<RawPlayerCourtEvent>();

    const secondsPlayedByPlayer = calculatePlayingSeconds(
      courtEventRows.map(toPlayerCourtEvent),
    );

    return calculatePlayerPerformances(
      aggregateRows.map((row) =>
        toPlayerActionAggregate(
          row,
          secondsPlayedByPlayer.get(row.playerId) ?? 0,
        ),
      ),
    );
  }
}

export function calculateSessionPlayerPerformances(
  actions: TaggedActionEntity[],
): Map<string, PlayerPerformanceDto> {
  const countsByPlayer = new Map<string, ActionCounts>();
  const courtEvents: PlayerCourtEvent[] = [];

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

    if (code === PLAYER_ENTERED_COURT_CODE || code === PLAYER_LEFT_COURT_CODE) {
      courtEvents.push({
        id: action.id,
        playerId: action.jogadorId,
        sessionId: action.sessaoId,
        code,
        timestampSeconds: action.timestampSegundos,
      });
    }
  });

  const secondsByPlayer = calculatePlayingSeconds(courtEvents);
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
  const pgj = divide(goalParticipations, minutes);
  const gtj = divide(goalsTaken, minutes);

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
  row: RawPlayerActionAggregate,
  secondsPlayed: number,
): PlayerActionAggregate {
  return {
    playerId: row.playerId,
    secondsPlayed,
    actions: Object.fromEntries(
      ACTION_CODES.map((code) => [code, Number(row[code] ?? 0)]),
    ) as ActionCounts,
  };
}

function minutesFor(aggregate: PlayerActionAggregate) {
  return aggregate.secondsPlayed / 60;
}

export function calculatePlayingSeconds(
  events: PlayerCourtEvent[],
): Map<string, number> {
  const eventsByPlayerAndSession = new Map<string, PlayerCourtEvent[]>();

  events.forEach((event) => {
    const key = `${event.playerId}:${event.sessionId}`;
    const current = eventsByPlayerAndSession.get(key) ?? [];
    current.push(event);
    eventsByPlayerAndSession.set(key, current);
  });

  const secondsByPlayer = new Map<string, number>();
  eventsByPlayerAndSession.forEach((sessionEvents) => {
    sessionEvents.sort(
      (left, right) =>
        left.timestampSeconds - right.timestampSeconds ||
        left.id.localeCompare(right.id),
    );

    let enteredAt: number | null = null;
    let sessionSeconds = 0;
    sessionEvents.forEach((event) => {
      if (event.code === PLAYER_ENTERED_COURT_CODE) {
        if (enteredAt === null) enteredAt = event.timestampSeconds;
        return;
      }

      if (enteredAt === null || event.timestampSeconds < enteredAt) return;
      sessionSeconds += event.timestampSeconds - enteredAt;
      enteredAt = null;
    });

    const playerId = sessionEvents[0]?.playerId;
    if (!playerId) return;
    secondsByPlayer.set(
      playerId,
      (secondsByPlayer.get(playerId) ?? 0) + sessionSeconds,
    );
  });

  return secondsByPlayer;
}

function toPlayerCourtEvent(row: RawPlayerCourtEvent): PlayerCourtEvent {
  return {
    id: row.id,
    playerId: row.playerId,
    sessionId: row.sessionId,
    code: row.code,
    timestampSeconds: Number(row.timestampSeconds),
  };
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
