import { Repository } from 'typeorm';
import { PlayerSessionMinutesEntity, TaggedActionEntity } from '../entities';
import {
  calculateOfficialPlayingSeconds,
  calculatePlayerRating,
  calculatePlayerPerformances,
  calculateSessionPlayerPerformances,
  emptyPlayerPerformance,
  PlayerActionAggregate,
  PlayerSessionMinutes,
  PlayerStatisticsService,
} from './player-statistics.service';

describe('calculatePlayerRating', () => {
  const base = {
    goals: 0,
    assists: 0,
    overall: 0,
    positiveActions: 0,
    negativeActions: 0,
    positiveGoals: 0,
    negativeGoals: 0,
    tio: 0,
    tid: 0,
  };

  it('limits goals and assists to 40 points', () => {
    expect(calculatePlayerRating({ ...base, goals: 5 })).toBe(
      calculatePlayerRating({ ...base, goals: 50 }),
    );
  });

  it('limits overall to 30 points', () => {
    expect(calculatePlayerRating({ ...base, overall: 100 })).toBe(
      calculatePlayerRating({ ...base, overall: 500 }),
    );
  });

  it('limits the combined balances to 30 points', () => {
    expect(calculatePlayerRating({ ...base, positiveActions: 10 })).toBe(
      calculatePlayerRating({ ...base, positiveActions: 100 }),
    );
  });

  it('never returns less than zero or more than ten', () => {
    expect(
      calculatePlayerRating({
        ...base,
        negativeActions: 100,
        negativeGoals: 100,
      }),
    ).toBe(0);
    expect(
      calculatePlayerRating({
        ...base,
        goals: 100,
        overall: 100,
        positiveActions: 100,
        tio: 100,
        tid: 100,
      }),
    ).toBe(10);
  });

  it('calculates a session without rounding intermediate components', () => {
    expect(
      calculatePlayerRating({
        ...base,
        goals: 1,
        assists: 1,
        overall: 80,
        positiveActions: 5,
        negativeActions: 2,
        positiveGoals: 2,
        negativeGoals: 1,
        tio: 60,
        tid: 40,
      }),
    ).toBe(10);
  });
});

describe('calculateOfficialPlayingSeconds', () => {
  it('uses only the new source and sums multiple sessions', () => {
    const seconds = calculateOfficialPlayingSeconds([
      minutesRecord('player-1', 'session-1', 600),
      minutesRecord('player-1', 'session-2', 900),
      minutesRecord('player-2', 'session-1', 300),
    ]);

    expect(seconds.get('player-1')).toBe(1500);
    expect(seconds.get('player-2')).toBe(300);
  });
});

describe('calculateSessionPlayerPerformances', () => {
  it('uses official minutes and never derives time from legacy actions', () => {
    const actions = [
      taggedAction('entered', 'player-1', 'ENTROU', 0),
      taggedAction('goal', 'player-1', 'GM', 100),
      taggedAction('assist', 'player-1', 'ASS', 200),
      taggedAction('left', 'player-1', 'SAIU', 2400),
    ];

    const withoutMinutes =
      calculateSessionPlayerPerformances(actions).get('player-1');
    const withMinutes = calculateSessionPlayerPerformances(actions, [
      minutesRecord('player-1', 'session-1', 1200),
    ]).get('player-1');

    expect(withoutMinutes?.minutes).toBe(0);
    expect(withMinutes?.minutes).toBe(20);
    expect(withMinutes?.offensiveActions).toBe(2);
    expect(withMinutes?.indexes.pgj).toBe(2.5);
  });
});

describe('calculatePlayerPerformances', () => {
  it.each([
    {
      name: 'applies weight two to RB in the normal case',
      actions: { RB: 1, DIA: 8 },
      expected: 12.5,
    },
    {
      name: 'calculates RF without RB',
      actions: { RB: 0, DIA: 1 },
      expected: 1.25,
    },
    {
      name: 'returns zero without positive defensive actions',
      actions: { RB: 0, DIA: 0 },
      expected: 0,
    },
  ])('$name', ({ actions, expected }) => {
    const performance = calculatePlayerPerformances([
      aggregate('player-1', 1500, actions),
    ]).get('player-1');

    expect(performance?.indexes.rf).toBe(expected);
  });

  it('does not use GP or FD in RF', () => {
    const performances = calculatePlayerPerformances([
      aggregate('player-a', 1500, { RB: 1, DIA: 8, GP: 0, FD: 0 }),
      aggregate('player-b', 1500, { RB: 1, DIA: 8, GP: 3, FD: 10 }),
    ]);

    expect(performances.get('player-a')?.indexes.rf).toBe(12.5);
    expect(performances.get('player-b')?.indexes.rf).toBe(12.5);
  });

  it('uses one equivalent game for 25 minutes played', () => {
    const performance = calculatePlayerPerformances([
      aggregate('player-1', 1500, { GM: 1 }),
    ]).get('player-1');

    expect(performance?.minutes).toBe(25);
    expect(performance?.indexes.pgj).toBe(1);
  });

  it('does not treat a 40-minute match duration as one equivalent game', () => {
    const performance = calculatePlayerPerformances([
      aggregate('player-1', 2400, { GM: 1 }),
    ]).get('player-1');

    expect(performance?.minutes).toBe(40);
    expect(performance?.indexes.pgj).toBe(0.63);
  });

  it('calculates time-dependent indexes using 25-minute equivalents', () => {
    const performance = calculatePlayerPerformances([
      aggregate('player-1', 2400, {
        'Gol TO': 1,
        'GS TO': 2,
        GM: 2,
        ASS: 1,
        AD: 1,
        CC: 2,
        PP: 2,
        GP: 1,
        FD: 1,
        RB: 3,
        DIA: 2,
      }),
    ]).get('player-1');

    expect(performance).toMatchObject({
      minutes: 40,
      indexes: {
        pgj: 2.5,
        gtj: 1.88,
        radj: 0.63,
        atd: 0,
        dto: 0,
        tio: 25,
        tid: 25,
      },
    });
  });

  it('returns zero minutes and safe indexes without a minutes record', () => {
    expect(
      calculatePlayerPerformances([aggregate('player-1', 0)]).get('player-1'),
    ).toEqual(emptyPlayerPerformance());
  });

  it('preserves indexes when migrated seconds equal the legacy result', () => {
    const migratedSeconds = 2400;
    const actions = {
      'Gol TO': 1,
      'GS TO': 2,
      GM: 2,
      ASS: 1,
      PP: 1,
      GP: 1,
      RB: 2,
      DIA: 1,
    };
    const beforeMigration = calculatePlayerPerformances([
      aggregate('player-1', 2400, actions),
    ]).get('player-1');
    const afterMigration = calculatePlayerPerformances([
      aggregate('player-1', migratedSeconds, actions),
    ]).get('player-1');

    expect(migratedSeconds).toBe(2400);
    expect(afterMigration).toEqual(beforeMigration);
    expect(afterMigration?.indexes).toEqual(
      expect.objectContaining({
        pgj: expect.any(Number),
        gtj: expect.any(Number),
        radj: expect.any(Number),
        atd: expect.any(Number),
        dto: expect.any(Number),
        tio: expect.any(Number),
        tid: expect.any(Number),
      }),
    );
  });
});

describe('PlayerStatisticsService', () => {
  it('loads actions and official minutes in two batch queries', async () => {
    const { service, taggedActionsRepository, minutesRepository } =
      buildService({
        aggregateRows: [{ playerId: 'player-1', GM: '3' }],
        minutesRows: [
          {
            playerId: 'player-1',
            sessionId: 'session-1',
            totalSeconds: '2130',
          },
        ],
      });

    const performance = (await service.findByTeamId('team-1')).get('player-1');

    expect(taggedActionsRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(minutesRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(performance?.minutes).toBe(35.5);
    expect(performance?.offensiveActions).toBe(3);
  });

  it('returns zero when only ENTROU and SAIU exist and no official row exists', async () => {
    const { service } = buildService({
      aggregateRows: [{ playerId: 'player-1' }],
    });

    expect((await service.findByTeamId('team-1')).get('player-1')).toEqual(
      emptyPlayerPerformance(),
    );
  });

  it('does not duplicate official seconds when actions also exist', async () => {
    const { service } = buildService({
      aggregateRows: [{ playerId: 'player-1', GM: '1' }],
      minutesRows: [
        { playerId: 'player-1', sessionId: 'session-1', totalSeconds: '600' },
      ],
    });

    expect(
      (await service.findByTeamId('team-1')).get('player-1')?.minutes,
    ).toBe(10);
  });

  it('applies a session filter to actions and official minutes', async () => {
    const { service, queryBuilders } = buildService();

    await service.findByTeamId('team-1', 'session-1');

    queryBuilders.forEach((query) =>
      expect(query.andWhere).toHaveBeenCalledWith('session.id = :sessionId', {
        sessionId: 'session-1',
      }),
    );
  });

  it('applies date filters to actions and official minutes', async () => {
    const { service, queryBuilders } = buildService();

    await service.findByTeamId('team-1', undefined, {
      startDate: '2026-08-01',
      endDate: '2026-08-31',
    });

    queryBuilders.forEach((query) => {
      expect(query.andWhere).toHaveBeenCalledWith(
        'session.data >= :startDate',
        { startDate: '2026-08-01' },
      );
      expect(query.andWhere).toHaveBeenCalledWith('session.data <= :endDate', {
        endDate: '2026-08-31',
      });
    });
  });
});

function buildService(
  rows: { aggregateRows?: unknown[]; minutesRows?: unknown[] } = {},
) {
  const actionsQuery = chainableQueryBuilder(rows.aggregateRows ?? []);
  const minutesQuery = chainableQueryBuilder(rows.minutesRows ?? []);
  const taggedActionsRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(actionsQuery),
  } as unknown as Repository<TaggedActionEntity>;
  const minutesRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(minutesQuery),
  } as unknown as Repository<PlayerSessionMinutesEntity>;
  return {
    service: new PlayerStatisticsService(
      taggedActionsRepository,
      minutesRepository,
    ),
    taggedActionsRepository,
    minutesRepository,
    queryBuilders: [actionsQuery, minutesQuery],
  };
}

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

function minutesRecord(
  playerId: string,
  sessionId: string,
  totalSeconds: number,
): PlayerSessionMinutes {
  return { playerId, sessionId, totalSeconds };
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

function chainableQueryBuilder(rows: unknown[]) {
  const queryBuilder = {
    innerJoin: jest.fn(),
    select: jest.fn(),
    addSelect: jest.fn(),
    setParameter: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    groupBy: jest.fn(),
    getRawMany: jest.fn().mockResolvedValue(rows),
  };
  Object.values(queryBuilder).forEach((method) => {
    if (method !== queryBuilder.getRawMany)
      method.mockReturnValue(queryBuilder);
  });
  return queryBuilder;
}
