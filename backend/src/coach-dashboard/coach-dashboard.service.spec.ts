import { Repository, SelectQueryBuilder } from 'typeorm';
import { TEAM_CATALOG_V2_CATEGORIES } from '../catalog/team-catalog-v2.constants';
import { TaggedActionEntity, TeamEntity } from '../entities';
import { PlayersService } from '../players/players.service';
import {
  calculateDefensiveEfficiency,
  calculateOffensiveEfficiency,
  CoachDashboardService,
  TEAM_INDEX_CONFIG,
} from './coach-dashboard.service';

const TEAM_ID = 'd62ec1e1-f762-45bd-a1e9-09ba8ef8d461';
const SESSION_ID = '79fbbbe8-39b1-4b25-bd11-236a0f228cb0';
type Row = {
  actionKey: string;
  categoryKey: string;
  contextKey: string | null;
  count: string;
};

const v2 = (actionKey: string, contextKey: string, count = 1): Row => ({
  actionKey,
  contextKey,
  count: String(count),
  categoryKey: actionKey.startsWith('AT_')
    ? TEAM_CATALOG_V2_CATEGORIES.ATTACK.key
    : actionKey.startsWith('DF_')
      ? TEAM_CATALOG_V2_CATEGORIES.DEFENSE.key
      : TEAM_CATALOG_V2_CATEGORIES.SET_PIECE.key,
});
const legacy = (actionKey: string, count = 1): Row => ({
  actionKey,
  categoryKey: 'OFFENSIVE_ORGANIZATION',
  contextKey: null,
  count: String(count),
});

const setup = (rows: Row[] = []) => {
  const where = jest.fn().mockReturnThis();
  const andWhere = jest.fn().mockReturnThis();
  const groupBy = jest.fn().mockReturnThis();
  const addGroupBy = jest.fn().mockReturnThis();
  const getRawMany = jest.fn().mockResolvedValue(rows);
  const query = {
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where,
    andWhere,
    groupBy,
    addGroupBy,
    getRawMany,
  } as unknown as SelectQueryBuilder<TaggedActionEntity>;
  const taggedActionsRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(query),
  } as unknown as Repository<TaggedActionEntity>;
  const teamsRepository = {
    find: jest.fn().mockResolvedValue([{ id: TEAM_ID }]),
  } as unknown as Repository<TeamEntity>;
  const playersService = {
    findDashboardPlayers: jest.fn().mockResolvedValue([]),
  } as unknown as PlayersService;
  return {
    queryMocks: { query, where, andWhere, groupBy, addGroupBy, getRawMany },
    service: new CoachDashboardService(
      taggedActionsRepository,
      teamsRepository,
      playersService,
    ),
  };
};

const values = async (rows: Row[]) => {
  const result = await setup(rows).service.getDashboard();
  return Object.fromEntries(
    result.teamIndexes.map(({ id, value }) => [id, value]),
  );
};

describe('CoachDashboardService V2 team indexes', () => {
  it('returns the 14 context cards in the required group order', async () => {
    const result = await setup().service.getDashboard();
    expect(result.teamIndexes).toHaveLength(14);
    expect(result.teamIndexes.map(({ id }) => id)).toEqual([
      'offensive-transition',
      'playing-out-pressure',
      'positional-attack',
      'fly-goalkeeper',
      'defensive-fly-goalkeeper',
      'variable-pressing',
      'pressing',
      'low-block',
      'defensive-transition',
      'corner',
      'offensive-kick-in',
      'defensive-kick-in',
      'free-kick',
      'goal-clearance',
    ]);
    expect(result.teamIndexes.every(({ value }) => value === null)).toBe(true);
    expect(TEAM_INDEX_CONFIG.map(({ phase }) => phase)).toEqual([
      ...Array(4).fill('offensive'),
      ...Array(5).fill('defensive'),
      ...Array(5).fill('set-piece'),
    ]);
  });

  it.each([
    ['OFFENSIVE_TRANSITION', 'offensive-transition'],
    ['PRESSURE_EXIT', 'playing-out-pressure'],
    ['POSITIONAL_ATTACK', 'positional-attack'],
    ['FLY_GOALKEEPER', 'fly-goalkeeper'],
  ])('isolates attack context %s', async (contextKey, cardId) => {
    const result = await values([
      v2('AT_GOL', contextKey),
      v2('AT_POSSE_PERDIDA', contextKey),
    ]);
    expect(result[cardId]).toBe(80);
    expect(
      Object.entries(result).filter(([, value]) => value !== null),
    ).toEqual([[cardId, 80]]);
  });

  it('uses attack weights 4, 3, 2 and 1', async () => {
    expect(
      (
        await values([
          v2('AT_GOL', 'POSITIONAL_ATTACK'),
          v2('AT_POSSE_PERDIDA', 'POSITIONAL_ATTACK'),
        ])
      )['positional-attack'],
    ).toBe(80);
    expect(
      (
        await values([
          v2('AT_FINALIZACAO', 'POSITIONAL_ATTACK'),
          v2('AT_POSSE_PERDIDA', 'POSITIONAL_ATTACK'),
        ])
      )['positional-attack'],
    ).toBe(75);
    expect(
      (
        await values([
          v2('AT_POSSE_MANTIDA', 'POSITIONAL_ATTACK'),
          v2('AT_POSSE_PERDIDA', 'POSITIONAL_ATTACK'),
        ])
      )['positional-attack'],
    ).toBe(66.7);
    expect(
      (await values([v2('AT_POSSE_PERDIDA', 'POSITIONAL_ATTACK')]))[
        'positional-attack'
      ],
    ).toBe(0);
  });

  it.each([
    ['DEFENSIVE_FLY_GOALKEEPER', 'defensive-fly-goalkeeper'],
    ['VARIABLE_PRESSING', 'variable-pressing'],
    ['PRESSING', 'pressing'],
    ['LOW_BLOCK', 'low-block'],
    ['DEFENSIVE_TRANSITION', 'defensive-transition'],
  ])('isolates defense context %s', async (contextKey, cardId) => {
    const result = await values([
      v2('DF_RECUPERACAO', contextKey),
      v2('DF_GOL_SOFRIDO', contextKey),
    ]);
    expect(result[cardId]).toBe(80);
    expect(
      Object.values(result).filter((value) => value !== null),
    ).toHaveLength(1);
  });

  it('uses defense weights 4, 3, 2 and 1', () => {
    expect(
      calculateDefensiveEfficiency({
        recoveries: 1,
        interceptions: 1,
        shotsConceded: 1,
        goalsConceded: 1,
      }),
    ).toBe(70);
    expect(
      calculateDefensiveEfficiency({
        recoveries: 1,
        interceptions: 0,
        shotsConceded: 1,
        goalsConceded: 0,
      }),
    ).toBe(66.7);
    expect(
      calculateDefensiveEfficiency({
        recoveries: 0,
        interceptions: 1,
        shotsConceded: 0,
        goalsConceded: 1,
      }),
    ).toBe(75);
  });

  it.each([
    ['CORNER', 'corner'],
    ['OFFENSIVE_KICK_IN', 'offensive-kick-in'],
    ['DEFENSIVE_KICK_IN', 'defensive-kick-in'],
    ['FREE_KICK', 'free-kick'],
    ['GOAL_CLEARANCE', 'goal-clearance'],
  ])('isolates set-piece context %s', async (contextKey, cardId) => {
    const result = await values([
      v2('BP_GOL', contextKey),
      v2('BP_SEM_EXEC', contextKey),
    ]);
    expect(result[cardId]).toBe(80);
    expect(
      Object.values(result).filter((value) => value !== null),
    ).toHaveLength(1);
  });

  it('uses set-piece weights and rounds to one decimal within 0-100', async () => {
    const result = await values([
      v2('BP_GOL', 'CORNER'),
      v2('BP_BEM_EXEC', 'CORNER'),
      v2('BP_MAL_EXEC', 'CORNER'),
      v2('BP_SEM_EXEC', 'CORNER', 2),
    ]);
    expect(result.corner).toBe(63.6);
    expect(result.corner).toBeGreaterThanOrEqual(0);
    expect(result.corner).toBeLessThanOrEqual(100);
  });

  it('combines V2 and safely equivalent legacy rows without duplicating either', async () => {
    const result = await values([
      v2('AT_GOL', 'POSITIONAL_ATTACK'),
      legacy('GAP'),
      v2('AT_POSSE_PERDIDA', 'POSITIONAL_ATTACK'),
      legacy('PPAP'),
      legacy('BPBE'),
      legacy('GBP'),
    ]);
    expect(result['positional-attack']).toBe(80);
    expect(result.corner).toBeNull();
    expect(result['defensive-fly-goalkeeper']).toBeNull();
  });

  it('uses the new offensive formula with maintained possession as positive weight 2', () => {
    expect(
      calculateOffensiveEfficiency({
        goals: 1,
        shots: 1,
        maintainedPossessions: 1,
        possessionLosses: 1,
      }),
    ).toBe(90);
    expect(
      calculateOffensiveEfficiency({
        goals: 0,
        shots: 0,
        maintainedPossessions: 0,
        possessionLosses: 0,
      }),
    ).toBeNull();
  });

  it('applies all filters and aggregates action, category and context in one query', async () => {
    const { queryMocks, service } = setup([v2('AT_GOL', 'POSITIONAL_ATTACK')]);
    await service.getDashboard({
      sessionId: SESSION_ID,
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });
    expect(queryMocks.query.leftJoin).toHaveBeenCalledWith(
      'taggedAction.contextoAcaoEquipe',
      'teamContext',
    );
    expect(queryMocks.where).toHaveBeenCalledWith(
      'taggedAction.jogadorId IS NULL',
    );
    expect(queryMocks.andWhere).toHaveBeenCalledWith(
      'taggedAction.deletedAt IS NULL',
    );
    expect(queryMocks.andWhere).toHaveBeenCalledWith(
      'teamContext.deletedAt IS NULL',
    );
    expect(queryMocks.andWhere).toHaveBeenCalledWith(
      'session.id = :sessionId',
      { sessionId: SESSION_ID },
    );
    expect(queryMocks.andWhere).toHaveBeenCalledWith(
      'session.data >= :startDate',
      { startDate: '2026-01-01' },
    );
    expect(queryMocks.andWhere).toHaveBeenCalledWith(
      'session.data <= :endDate',
      { endDate: '2026-01-31' },
    );
    expect(queryMocks.groupBy).toHaveBeenCalledWith('catalogAction.sigla');
    expect(queryMocks.addGroupBy).toHaveBeenCalledWith('category.chave');
    expect(queryMocks.addGroupBy).toHaveBeenCalledWith('teamContext.chave');
    expect(queryMocks.getRawMany).toHaveBeenCalledTimes(1);
  });
});
