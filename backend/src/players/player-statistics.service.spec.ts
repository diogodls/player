import { Repository } from 'typeorm';
import { TaggedActionEntity } from '../entities';
import {
  calculatePlayerPerformances,
  emptyPlayerPerformance,
  PlayerActionAggregate,
  PlayerStatisticsService,
} from './player-statistics.service';

describe('calculatePlayerPerformances', () => {
  it('calculates cumulative metrics and every player index', () => {
    const performances = calculatePlayerPerformances([
      aggregate('player-1', 2, {
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
      aggregate('player-2', 1, {
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
        radj: 0.03,
        goalsRelations: 4.5,
        actionsRelations: 3.75,
        atd: 0.02,
        dto: -0.04,
        pgj: 0.05,
        ic: 3,
        tio: 25,
        gtj: 0.03,
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
        radj: 0,
        goalsRelations: 1.5,
        actionsRelations: 2.5,
        atd: -0.02,
        dto: 0.04,
        pgj: 0.05,
        ic: 3,
        tio: 25,
        gtj: 0.05,
        rf: 3,
        tid: 13.64,
      },
    });
  });

  it('uses forty minutes for each distinct session count', () => {
    const performance = calculatePlayerPerformances([
      aggregate('player-1', 3, { GM: 1 }),
    ]).get('player-1');

    expect(performance?.minutes).toBe(120);
    expect(performance?.indexes.pgj).toBe(0.01);
  });

  it('returns zero for indexes with zero denominators', () => {
    const performance = calculatePlayerPerformances([
      aggregate('player-1', 1),
    ]).get('player-1');

    expect(performance).toEqual({
      ...emptyPlayerPerformance(),
      minutes: 40,
    });
  });

  it('ignores aggregates without a participating session', () => {
    const performances = calculatePlayerPerformances([
      aggregate('player-1', 0, { GM: 10 }),
    ]);

    expect(performances.size).toBe(0);
  });
});

describe('PlayerStatisticsService', () => {
  it('aggregates the complete team in one query and excludes soft deletes', async () => {
    const queryBuilder = chainableQueryBuilder([
      {
        playerId: 'player-1',
        sessionCount: '2',
        GM: '3',
      },
    ]);
    const createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
    const repository = {
      createQueryBuilder,
    } as unknown as Repository<TaggedActionEntity>;
    const service = new PlayerStatisticsService(repository);

    const performances = await service.findByTeamId('team-1');

    expect(createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(queryBuilder.groupBy).toHaveBeenCalledWith('taggedAction.jogadorId');
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      'COUNT(DISTINCT taggedAction.sessaoId)',
      'sessionCount',
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'taggedAction.deletedAt IS NULL',
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'session.deletedAt IS NULL',
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'player.deletedAt IS NULL',
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'catalogAction.deletedAt IS NULL',
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'session.equipeId = :teamId',
      { teamId: 'team-1' },
    );
    const performance = performances.get('player-1');
    expect(performance?.minutes).toBe(80);
    expect(performance?.offensiveActions).toBe(3);
    expect(performance?.indexes.pgj).toBe(0.04);
  });
});

function aggregate(
  playerId: string,
  sessionCount: number,
  actions: Partial<PlayerActionAggregate['actions']> = {},
): PlayerActionAggregate {
  return {
    playerId,
    sessionCount,
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
