import { Repository, SelectQueryBuilder } from 'typeorm';
import { TaggedActionEntity, TeamEntity } from '../entities';
import {
  calculateDefensiveEfficiency,
  calculateOffensiveEfficiency,
  CoachDashboardService,
} from './coach-dashboard.service';

const TEAM_ID = 'd62ec1e1-f762-45bd-a1e9-09ba8ef8d461';
const SESSION_ID = '79fbbbe8-39b1-4b25-bd11-236a0f228cb0';

const setup = (counts: Record<string, number> = {}) => {
  const rows = Object.entries(counts).map(([acronym, count]) => ({
    acronym,
    count: String(count),
  }));
  const where = jest.fn().mockReturnThis();
  const andWhere = jest.fn().mockReturnThis();
  const groupBy = jest.fn().mockReturnThis();
  const getRawMany = jest.fn().mockResolvedValue(rows);
  const query = {
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where,
    andWhere,
    groupBy,
    getRawMany,
  } as unknown as SelectQueryBuilder<TaggedActionEntity>;
  const taggedActionsRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(query),
  } as unknown as Repository<TaggedActionEntity>;
  const teamsRepository = {
    find: jest.fn().mockResolvedValue([{ id: TEAM_ID }]),
  } as unknown as Repository<TeamEntity>;

  return {
    queryMocks: { where, andWhere, groupBy, getRawMany },
    service: new CoachDashboardService(
      taggedActionsRepository,
      teamsRepository,
    ),
  };
};

const valueById = (
  result: Awaited<ReturnType<CoachDashboardService['getDashboard']>>,
  id: string,
) => result.teamIndexes.find((item) => item.id === id)?.value;

describe('CoachDashboardService efficiencies', () => {
  it('calculates the offensive and defensive weighted examples', () => {
    expect(
      calculateOffensiveEfficiency({
        goals: 1,
        shots: 1,
        possessionLosses: 1,
        maintainedPossessions: 0,
      }),
    ).toBeCloseTo(77.777, 2);
    expect(
      calculateDefensiveEfficiency({
        recoveries: 1,
        interceptions: 1,
        shotsConceded: 1,
        goalsConceded: 2,
      }),
    ).toBeCloseTo(63.636, 2);
    expect(
      calculateDefensiveEfficiency({
        recoveries: 1,
        interceptions: 0,
        shotsConceded: 1,
        goalsConceded: 1,
      }),
    ).toBeCloseTo(57.142, 2);
  });

  it('distinguishes no actions, only negative actions and only positive actions', () => {
    expect(
      calculateOffensiveEfficiency({
        goals: 0,
        shots: 0,
        possessionLosses: 0,
        maintainedPossessions: 0,
      }),
    ).toBeNull();
    expect(
      calculateOffensiveEfficiency({
        goals: 0,
        shots: 0,
        possessionLosses: 1,
        maintainedPossessions: 1,
      }),
    ).toBe(0);
    expect(
      calculateOffensiveEfficiency({
        goals: 1,
        shots: 1,
        possessionLosses: 0,
        maintainedPossessions: 0,
      }),
    ).toBe(100);
  });

  it('uses maintained possession only in the denominator with weight one', () => {
    const withoutMaintainedPossession = calculateOffensiveEfficiency({
      goals: 1,
      shots: 0,
      possessionLosses: 1,
      maintainedPossessions: 0,
    });
    const withMaintainedPossession = calculateOffensiveEfficiency({
      goals: 1,
      shots: 0,
      possessionLosses: 1,
      maintainedPossessions: 1,
    });

    expect(withoutMaintainedPossession).toBeCloseTo(66.666, 2);
    expect(withMaintainedPossession).toBeCloseTo(57.142, 2);
  });

  it('maps grouped acronyms to card-ready efficiencies with safe zero fallback', async () => {
    const { service } = setup({
      GAP: 1,
      FAP: 1,
      PPAP: 1,
      MBRP: 1,
      MBJI: 1,
      MBFS: 1,
      MBGT: 2,
      TRP: 1,
      TFS: 1,
      TGT: 1,
    });

    const result = await service.getDashboard();

    expect(Array.isArray(result.averageTeamCards)).toBe(true);
    expect(Array.isArray(result.metrics)).toBe(true);
    expect(Array.isArray(result.players)).toBe(true);
    expect(Array.isArray(result.teamIndexes)).toBe(true);
    expect(typeof result.players[0]?.id).toBe('string');
    expect(typeof result.players[0]?.name).toBe('string');
    expect(typeof result.players[0]?.overall).toBe('number');
    expect(typeof result.players[0]?.indexes).toBe('object');
    expect(valueById(result, 'positional-attack')).toBeCloseTo(77.777, 2);
    expect(valueById(result, 'low-block')).toBeCloseTo(63.636, 2);
    expect(valueById(result, 'defensive-transition')).toBeCloseTo(57.142, 2);
    expect(valueById(result, 'playing-out-pressure')).toBeNull();
    expect(
      result.teamIndexes.filter(({ phase }) => phase === 'set-piece'),
    ).toEqual([
      {
        id: 'set-piece',
        title: 'Bolas paradas',
        phase: 'set-piece',
        value: null,
        maxValue: 100,
        trend: 'stable',
      },
    ]);
    expect(result.teamIndexes.map(({ id }) => id)).not.toEqual(
      expect.arrayContaining([
        'set-piece-fouls',
        'set-piece-offensive-throw-in',
        'set-piece-corners',
      ]),
    );
    expect(
      result.teamIndexes.every(
        ({ value }) =>
          value === null ||
          (Number.isFinite(value) && value >= 0 && value <= 100),
      ),
    ).toBe(true);
  });

  it('returns zero when a phase has recorded actions but none in the numerator', async () => {
    const { service } = setup({ PMAP: 1, PPAP: 1 });
    const result = await service.getDashboard();
    expect(valueById(result, 'positional-attack')).toBe(0);
  });

  it('applies team, collective-action, session and period filters in one grouped query', async () => {
    const { queryMocks, service } = setup({ GAP: 1 });

    await service.getDashboard({
      sessionId: SESSION_ID,
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });

    expect(queryMocks.where).toHaveBeenCalledWith(
      'taggedAction.jogadorId IS NULL',
    );
    expect(queryMocks.andWhere).toHaveBeenCalledWith(
      'session.equipeId = :teamId',
      { teamId: TEAM_ID },
    );
    expect(queryMocks.andWhere).toHaveBeenCalledWith(
      'category.tipoAnaliseId = :teamAnalysisTypeId',
      { teamAnalysisTypeId: 2 },
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
    expect(queryMocks.getRawMany).toHaveBeenCalledTimes(1);
  });
});
