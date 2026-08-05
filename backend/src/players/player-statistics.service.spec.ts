import { Repository } from 'typeorm';
import { TaggedActionEntity } from '../entities';
import {
  calculatePlayingSeconds,
  calculatePlayerPerformances,
  calculateSessionPlayerPerformances,
  emptyPlayerPerformance,
  PlayerActionAggregate,
  PlayerCourtEvent,
  PlayerStatisticsService,
} from './player-statistics.service';

describe('calculateSessionPlayerPerformances', () => {
  it('builds real indexes from the actions and court time of one session', () => {
    const actions = [
      taggedAction('entered', 'player-1', 'ENTROU', 0),
      taggedAction('goal', 'player-1', 'GM', 100),
      taggedAction('assist', 'player-1', 'ASS', 200),
      taggedAction('left', 'player-1', 'SAIU', 1200),
    ];

    const performance =
      calculateSessionPlayerPerformances(actions).get('player-1');

    expect(performance?.minutes).toBe(20);
    expect(performance?.offensiveActions).toBe(2);
    expect(performance?.indexes.pgj).toBe(4);
    expect(performance?.indexes.tio).toBe(25);
  });
});

describe('calculatePlayerPerformances', () => {
  it('normalizes PGJ, GTJ and RADJ by equivalent 40-minute games', () => {
    const performance = calculatePlayerPerformances([
      aggregate('player-1', 2400, {
        'GS TO': 2,
        GM: 1,
      }),
    ]).get('player-1');

    expect(performance?.indexes.pgj).toBe(1);
    expect(performance?.indexes.gtj).toBe(2);
    expect(performance?.indexes.radj).toBe(-1);
  });

  it('includes GP in the normalized GTJ numerator', () => {
    const performance = calculatePlayerPerformances([
      aggregate('player-1', 2400, { GP: 1 }),
    ]).get('player-1');

    expect(performance?.goalsTaken).toBe(0);
    expect(performance?.indexes.gtj).toBe(1);
    expect(performance?.indexes.radj).toBe(-1);
  });

  it('uses equivalent 40-minute games in ATD-base and DTO-base', () => {
    const performances = calculatePlayerPerformances([
      aggregate('player-1', 2400, {
        'Gol TO': 1,
        PP: 2,
      }),
      aggregate('player-2', 2400),
    ]);

    expect(performances.get('player-1')?.indexes.atd).toBe(-1);
    expect(performances.get('player-2')?.indexes.atd).toBe(1);
    expect(performances.get('player-1')?.indexes.dto).toBe(-0.5);
    expect(performances.get('player-2')?.indexes.dto).toBe(0.5);
  });
  it('calculates cumulative metrics and every player index', () => {
    const performances = calculatePlayerPerformances([
      aggregate('player-1', 4800, {
        'Gol TO': 4,
        'Gol OO': 1,
        'GS TO': 1,
        'GS OO': 1,
        GM: 2,
        ASS: 1,
        AD: 1,
        CC: 2,
        PP: 2,
        GP: 1,
        FD: 1,
        RB: 6,
        DIA: 3,
      }),
      aggregate('player-2', 2400, {
        'Gol BP': 1,
        'GS TO': 2,
        GM: 1,
        AD: 1,
        CC: 1,
        PP: 1,
        GP: 1,
        RB: 1,
        DIA: 1,
      }),
    ]);

    expect(performances.get('player-1')).toEqual({
      minutes: 80,
      goals: 5,
      goalsTaken: 2,
      offensiveActions: 8,
      defensiveActions: 11,
      indexes: {
        radj: 0.5,
        goalsRelations: 4.5,
        actionsRelations: 3.75,
        atd: 0.75,
        dto: -1.75,
        pgj: 2,
        ic: 3,
        tio: 25,
        gtj: 1.5,
        rf: 7.5,
        tid: 30.68,
      },
    });
    expect(performances.get('player-2')).toEqual({
      minutes: 40,
      goals: 1,
      goalsTaken: 2,
      offensiveActions: 4,
      defensiveActions: 3,
      indexes: {
        radj: -1,
        goalsRelations: 1.5,
        actionsRelations: 2.5,
        atd: -0.75,
        dto: 1.75,
        pgj: 2,
        ic: 3,
        tio: 25,
        gtj: 3,
        rf: 3,
        tid: 13.64,
      },
    });
  });

  it('uses the accumulated court-event duration as minutes played', () => {
    const performance = calculatePlayerPerformances([
      aggregate('player-1', 7200, { GM: 1 }),
    ]).get('player-1');

    expect(performance?.minutes).toBe(120);
    expect(performance?.indexes.pgj).toBe(0.33);
  });

  it('returns zero for indexes with zero denominators', () => {
    const performance = calculatePlayerPerformances([
      aggregate('player-1', 2400),
    ]).get('player-1');

    expect(performance).toEqual({
      ...emptyPlayerPerformance(),
      minutes: 40,
    });
  });

  it('keeps action metrics but zeroes time-based indexes without a complete interval', () => {
    const performances = calculatePlayerPerformances([
      aggregate('player-1', 0, { GM: 10 }),
    ]);

    expect(performances.get('player-1')).toEqual({
      ...emptyPlayerPerformance(),
      offensiveActions: 10,
    });
  });
});

describe('calculatePlayingSeconds', () => {
  it('sums multiple complete entry and exit intervals across sessions', () => {
    const seconds = calculatePlayingSeconds([
      courtEvent('1', 'player-1', 'session-1', 'ENTROU', 30),
      courtEvent('2', 'player-1', 'session-1', 'SAIU', 150),
      courtEvent('3', 'player-1', 'session-1', 'ENTROU', 200),
      courtEvent('4', 'player-1', 'session-1', 'SAIU', 320),
      courtEvent('5', 'player-1', 'session-2', 'ENTROU', 10),
      courtEvent('6', 'player-1', 'session-2', 'SAIU', 70),
    ]);

    expect(seconds.get('player-1')).toBe(300);
  });

  it('ignores unmatched exits, duplicate entries and an open final interval', () => {
    const seconds = calculatePlayingSeconds([
      courtEvent('1', 'player-1', 'session-1', 'SAIU', 10),
      courtEvent('2', 'player-1', 'session-1', 'ENTROU', 20),
      courtEvent('3', 'player-1', 'session-1', 'ENTROU', 40),
      courtEvent('4', 'player-1', 'session-1', 'SAIU', 80),
      courtEvent('5', 'player-1', 'session-1', 'ENTROU', 100),
    ]);

    expect(seconds.get('player-1')).toBe(60);
  });
});

describe('PlayerStatisticsService', () => {
  it('loads team action totals and court events without per-player queries', async () => {
    const aggregateQueryBuilder = chainableQueryBuilder([
      {
        playerId: 'player-1',
        GM: '3',
      },
    ]);
    const courtEventsQueryBuilder = chainableQueryBuilder([
      {
        id: 'event-1',
        playerId: 'player-1',
        sessionId: 'session-1',
        code: 'ENTROU',
        timestampSeconds: '20',
      },
      {
        id: 'event-2',
        playerId: 'player-1',
        sessionId: 'session-1',
        code: 'SAIU',
        timestampSeconds: '140',
      },
    ]);
    const createQueryBuilder = jest
      .fn()
      .mockReturnValueOnce(aggregateQueryBuilder)
      .mockReturnValueOnce(courtEventsQueryBuilder);
    const repository = {
      createQueryBuilder,
    } as unknown as Repository<TaggedActionEntity>;
    const service = new PlayerStatisticsService(repository);

    const performances = await service.findByTeamId('team-1', 'session-1');

    expect(createQueryBuilder).toHaveBeenCalledTimes(2);
    expect(aggregateQueryBuilder.groupBy).toHaveBeenCalledWith(
      'taggedAction.jogadorId',
    );
    expect(aggregateQueryBuilder.andWhere).toHaveBeenCalledWith(
      'taggedAction.deletedAt IS NULL',
    );
    expect(aggregateQueryBuilder.andWhere).toHaveBeenCalledWith(
      'session.deletedAt IS NULL',
    );
    expect(aggregateQueryBuilder.andWhere).toHaveBeenCalledWith(
      'player.deletedAt IS NULL',
    );
    expect(aggregateQueryBuilder.andWhere).toHaveBeenCalledWith(
      'catalogAction.deletedAt IS NULL',
    );
    expect(aggregateQueryBuilder.andWhere).toHaveBeenCalledWith(
      'session.equipeId = :teamId',
      { teamId: 'team-1' },
    );
    expect(aggregateQueryBuilder.andWhere).toHaveBeenCalledWith(
      'session.id = :sessionId',
      { sessionId: 'session-1' },
    );
    expect(courtEventsQueryBuilder.andWhere).toHaveBeenCalledWith(
      'session.id = :sessionId',
      { sessionId: 'session-1' },
    );
    expect(courtEventsQueryBuilder.where).toHaveBeenCalledWith(
      'catalogAction.sigla IN (:...courtEventCodes)',
      { courtEventCodes: ['ENTROU', 'SAIU'] },
    );
    const performance = performances.get('player-1');
    expect(performance?.minutes).toBe(2);
    expect(performance?.offensiveActions).toBe(3);
    expect(performance?.indexes.pgj).toBe(60);
  });
});

function aggregate(
  playerId: string,
  secondsPlayed: number,
  actions: Partial<PlayerActionAggregate['actions']> = {},
): PlayerActionAggregate {
  return {
    playerId,
    secondsPlayed,
    actions: {
      'Gol TO': 0,
      'Gol OO': 0,
      'Gol BP': 0,
      'Gol GL': 0,
      'Gol MGL': 0,
      'GS TO': 0,
      'GS OO': 0,
      'GS BP': 0,
      'GS GLA': 0,
      'GS GLO': 0,
      GM: 0,
      ASS: 0,
      AD: 0,
      CC: 0,
      PP: 0,
      GP: 0,
      FD: 0,
      RB: 0,
      DIA: 0,
      ...actions,
    },
  };
}

function taggedAction(
  id: string,
  playerId: string,
  code: string,
  timestampSeconds: number,
): TaggedActionEntity {
  return {
    id,
    sessaoId: 'session-1',
    jogadorId: playerId,
    timestampSegundos: timestampSeconds,
    acaoCatalogo: { sigla: code },
  } as TaggedActionEntity;
}

function courtEvent(
  id: string,
  playerId: string,
  sessionId: string,
  code: PlayerCourtEvent['code'],
  timestampSeconds: number,
): PlayerCourtEvent {
  return { id, playerId, sessionId, code, timestampSeconds };
}

function chainableQueryBuilder(rows: unknown[]) {
  const queryBuilder = {
    innerJoin: jest.fn(),
    select: jest.fn(),
    addSelect: jest.fn(),
    setParameter: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    groupBy: jest.fn(),
    orderBy: jest.fn(),
    addOrderBy: jest.fn(),
    getRawMany: jest.fn().mockResolvedValue(rows),
  };

  Object.values(queryBuilder).forEach((method) => {
    if (method !== queryBuilder.getRawMany)
      method.mockReturnValue(queryBuilder);
  });

  return queryBuilder;
}
