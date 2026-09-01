import { BadRequestException } from '@nestjs/common';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { PlayerEntity, TeamEntity } from '../entities';
import type { PlayerIndexKey } from './dto/player-ranking-response.dto';
import type { PlayerIndexesDto } from './dto/player-performance.dto';
import { PlayerDto } from './dto/player.dto';
import {
  emptyPlayerPerformance,
  PlayerStatisticsService,
} from './player-statistics.service';
import {
  calculateOverall,
  calculateOverallIndexPoints,
  PlayersService,
} from './players.service';

const PLAYER_ID = '79fbbbe8-39b1-4b25-bd11-236a0f228cb0';
const OTHER_PLAYER_ID = '9828b90e-6aa0-4d75-985d-f286802c3086';
const TEAM_ID = 'd62ec1e1-f762-45bd-a1e9-09ba8ef8d461';

const buildRankingPlayer = (
  id: string,
  name: string,
  deletedAt: Date | null = null,
): PlayerEntity =>
  ({
    id,
    nome: name,
    equipeId: TEAM_ID,
    deletedAt,
    posicao: { id: 3, nome: 'Ala' },
  }) as PlayerEntity;

type TestIndexes = Partial<Record<PlayerIndexKey, number | null | undefined>>;

const indexes = (values: TestIndexes): TestIndexes => ({
  radj: null,
  goalsRelations: null,
  actionsRelations: null,
  atd: null,
  dto: null,
  pgj: null,
  ic: null,
  tio: null,
  gtj: null,
  rf: null,
  tid: null,
  ...values,
});

const completeIndexes = (value: number): PlayerIndexesDto => ({
  radj: value,
  goalsRelations: value,
  actionsRelations: value,
  atd: value,
  dto: value,
  pgj: value,
  ic: value,
  tio: value,
  gtj: value,
  rf: value,
  tid: value,
});

describe('overall positional formula', () => {
  it('converts fifth place among twelve participants to eight points', () => {
    expect(calculateOverallIndexPoints(12, 5)).toBe(8);
  });

  it('uses the specified denominator and rounds only the final result', () => {
    expect(calculateOverall(105, 12)).toBe(80);
  });

  it('avoids division by zero, NaN and Infinity', () => {
    expect(calculateOverall(0, 0)).toBe(0);
    expect(calculateOverall(Number.NaN, 12)).toBe(0);
    expect(calculateOverall(Number.POSITIVE_INFINITY, 12)).toBe(0);
  });
});

const buildRankingService = (
  players: PlayerEntity[],
  indexesByPlayerId: Record<string, TestIndexes> = {},
  minutesByPlayerId: Record<string, number> = {},
) => {
  const find = jest.fn().mockResolvedValue(players);
  const performances = new Map(
    Object.entries(indexesByPlayerId).map(([playerId, playerIndexes]) => [
      playerId,
      {
        ...emptyPlayerPerformance(),
        minutes: minutesByPlayerId[playerId] ?? 1,
        indexes: playerIndexes as PlayerIndexesDto,
      },
    ]),
  );
  const findByTeamId = jest.fn().mockResolvedValue(performances);
  const findByTeamIdGroupedBySession = jest.fn().mockResolvedValue(
    new Map([
      [
        'session-1',
        new Map(
          Array.from(performances, ([playerId, performance]) => [
            playerId,
            {
              performance,
              ratingData: {
                goals: 0,
                assists: 0,
                positiveActions: 0,
                negativeActions: 0,
                positiveGoals: 0,
                negativeGoals: 0,
                tio: 0,
                tid: 0,
              },
            },
          ]),
        ),
      ],
    ]),
  );
  return {
    find,
    findByTeamId,
    findByTeamIdGroupedBySession,
    service: new PlayersService(
      { find } as unknown as Repository<PlayerEntity>,
      {} as Repository<TeamEntity>,
      {
        findByTeamId,
        findByTeamIdGroupedBySession,
      } as unknown as PlayerStatisticsService,
    ),
  };
};

const buildOverallService = (
  players: PlayerEntity[],
  indexesByPlayerId: Record<string, TestIndexes>,
) => {
  return buildRankingService(players, indexesByPlayerId);
};
const buildPlayerDto = (id: string | null): PlayerDto => ({
  id,
  name: 'Ana Silva',
  age: 21,
  positionId: 3,
  preferredSideId: 2,
});

describe('PlayersService id validation', () => {
  const service = new PlayersService(
    {} as Repository<PlayerEntity>,
    {} as Repository<TeamEntity>,
    {} as PlayerStatisticsService,
  );

  it('rejects a non-null id when creating a player', async () => {
    await expect(service.create(buildPlayerDto(PLAYER_ID))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects an update when body and route ids differ', async () => {
    await expect(
      service.update(PLAYER_ID, buildPlayerDto(OTHER_PLAYER_ID)),
    ).rejects.toThrow(BadRequestException);
  });

  it('assigns the only available team when creating a player', async () => {
    const player = {
      id: PLAYER_ID,
      equipeId: TEAM_ID,
      posicaoId: 3,
      ladoPreferencialId: 2,
      nome: 'Ana Silva',
      idade: 21,
      equipe: { id: TEAM_ID, nome: 'Equipe Principal' },
      posicao: { id: 3, nome: 'Ala' },
      ladoPreferencial: { id: 2, nome: 'Canhoto' },
    } as PlayerEntity;
    const createPlayer = jest.fn((data: Partial<PlayerEntity>) => data);
    const findTeam = jest.fn().mockResolvedValue([player.equipe]);
    const playersRepository = {
      create: createPlayer,
      save: jest.fn().mockResolvedValue(player),
      findOne: jest.fn().mockResolvedValue(player),
    } as unknown as Repository<PlayerEntity>;
    const teamsRepository = {
      find: findTeam,
    } as unknown as Repository<TeamEntity>;
    const playersService = new PlayersService(
      playersRepository,
      teamsRepository,
      {
        findByTeamId: jest.fn().mockResolvedValue(new Map()),
      } as unknown as PlayerStatisticsService,
    );

    await playersService.create(buildPlayerDto(null));

    expect(findTeam).toHaveBeenCalledWith({ take: 1 });
    expect(createPlayer).toHaveBeenCalledWith(
      expect.objectContaining({ equipeId: TEAM_ID }),
    );
  });

  it('filters and paginates players when listing players', async () => {
    let receivedFindOptions: Parameters<Repository<PlayerEntity>['find']>[0];
    const countPlayers = jest.fn().mockResolvedValue(17);
    const findPlayers = jest.fn(
      (findOptions: Parameters<Repository<PlayerEntity>['find']>[0]) => {
        receivedFindOptions = findOptions;
        return Promise.resolve([]);
      },
    );
    const playersRepository = {
      count: countPlayers,
      find: findPlayers,
    } as unknown as Repository<PlayerEntity>;
    const playersService = new PlayersService(
      playersRepository,
      {} as Repository<TeamEntity>,
      {
        findByTeamId: jest.fn().mockResolvedValue(new Map()),
      } as unknown as PlayerStatisticsService,
    );

    const response = await playersService.findAll({
      name: 'Ana',
      positionId: 3,
      page: 2,
      limit: 8,
    });

    expect(countPlayers).toHaveBeenCalledTimes(1);
    expect(findPlayers).toHaveBeenCalledTimes(1);
    const where = receivedFindOptions?.where as FindOptionsWhere<PlayerEntity>;
    expect(where.nome).toBeDefined();
    expect(where.posicaoId).toBe(3);
    expect(receivedFindOptions?.skip).toBe(8);
    expect(receivedFindOptions?.take).toBe(8);
    expect(response).toEqual({
      data: [],
      total: 17,
      page: 2,
      limit: 8,
      totalPages: 3,
    });
  });

  it('uses the last available page when the requested page is too high', async () => {
    let receivedFindOptions: Parameters<Repository<PlayerEntity>['find']>[0];
    const playersRepository = {
      count: jest.fn().mockResolvedValue(9),
      find: jest.fn(
        (findOptions: Parameters<Repository<PlayerEntity>['find']>[0]) => {
          receivedFindOptions = findOptions;
          return Promise.resolve([]);
        },
      ),
    } as unknown as Repository<PlayerEntity>;
    const playersService = new PlayersService(
      playersRepository,
      {} as Repository<TeamEntity>,
      {
        findByTeamId: jest.fn().mockResolvedValue(new Map()),
      } as unknown as PlayerStatisticsService,
    );

    const response = await playersService.findAll({ page: 4, limit: 8 });

    expect(receivedFindOptions?.skip).toBe(8);
    expect(response.page).toBe(2);
    expect(response.totalPages).toBe(2);
  });

  it('includes cumulative metrics and indexes in the player response', async () => {
    const player = {
      id: PLAYER_ID,
      equipeId: TEAM_ID,
      posicaoId: 3,
      ladoPreferencialId: 2,
      nome: 'Ana Silva',
      idade: 21,
      equipe: { id: TEAM_ID, nome: 'Equipe Principal' },
      posicao: { id: 3, nome: 'Ala' },
      ladoPreferencial: { id: 2, nome: 'Canhoto' },
    } as PlayerEntity;
    const performance = {
      minutes: 80,
      goals: 4,
      goalsTaken: 2,
      offensiveActions: 9,
      defensiveActions: 7,
      indexes: {
        radj: 0.03,
        goalsRelations: 3,
        actionsRelations: 2,
        atd: 0.01,
        dto: -0.01,
        pgj: 0.05,
        ic: 2,
        tio: 25,
        gtj: 0.03,
        rf: 3,
        tid: 20,
      },
    };
    const findByTeamId = jest
      .fn()
      .mockResolvedValue(new Map([[PLAYER_ID, performance]]));
    const service = new PlayersService(
      {
        findOne: jest.fn().mockResolvedValue(player),
      } as unknown as Repository<PlayerEntity>,
      {} as Repository<TeamEntity>,
      { findByTeamId } as unknown as PlayerStatisticsService,
    );

    const response = await service.findOne(PLAYER_ID);

    expect(findByTeamId).toHaveBeenCalledTimes(1);
    expect(findByTeamId).toHaveBeenCalledWith(TEAM_ID);
    expect(response).toEqual({
      id: PLAYER_ID,
      name: 'Ana Silva',
      age: 21,
      positionId: 3,
      position: 'Ala',
      preferredSideId: 2,
      preferredSide: 'Canhoto',
      teamName: 'Equipe Principal',
      ...performance,
    });
  });

  it('returns zeroed performance for a player without tagged actions', async () => {
    const player = {
      id: PLAYER_ID,
      equipeId: TEAM_ID,
      posicaoId: 3,
      ladoPreferencialId: 2,
      nome: 'Ana Silva',
      idade: 21,
      equipe: { id: TEAM_ID, nome: 'Equipe Principal' },
      posicao: { id: 3, nome: 'Ala' },
      ladoPreferencial: { id: 2, nome: 'Canhoto' },
    } as PlayerEntity;
    const service = new PlayersService(
      {
        findOne: jest.fn().mockResolvedValue(player),
      } as unknown as Repository<PlayerEntity>,
      {} as Repository<TeamEntity>,
      {
        findByTeamId: jest.fn().mockResolvedValue(new Map()),
      } as unknown as PlayerStatisticsService,
    );
    const response = await service.findOne(PLAYER_ID);

    expect(response).toEqual({
      id: PLAYER_ID,
      name: 'Ana Silva',
      age: 21,
      positionId: 3,
      position: 'Ala',
      preferredSideId: 2,
      preferredSide: 'Canhoto',
      teamName: 'Equipe Principal',
      ...emptyPlayerPerformance(),
    });
  });

  it('uses statistics indexes for the same player in every ranking context', async () => {
    const player = buildRankingPlayer(PLAYER_ID, 'Ana');
    const { service } = buildRankingService([], {
      [PLAYER_ID]: indexes({ radj: 1.25 }),
    });

    const generalRanking = await service.buildRankingForPlayers(
      [player],
      'radj',
    );
    const sessionRanking = await service.buildRankingForPlayers(
      [player],
      'radj',
      'session-id',
    );

    expect(sessionRanking.ranking[0].value).toBe(
      generalRanking.ranking[0].value,
    );
  });
  it('uses the session participant group for relative overall normalization', async () => {
    const first = buildRankingPlayer(PLAYER_ID, 'Ana');
    const second = buildRankingPlayer(OTHER_PLAYER_ID, 'Bia');
    const { service } = buildRankingService([], {
      [PLAYER_ID]: indexes({ radj: 1 }),
      [OTHER_PLAYER_ID]: indexes({ radj: 2 }),
    });
    const response = await service.buildRankingForPlayers(
      [first, second],
      'overall',
    );
    expect(response.index.key).toBe('overall');
    expect(response.ranking).toHaveLength(2);
    expect(response.ranking.every(({ value }) => Number.isInteger(value))).toBe(
      true,
    );
  });

  it('normalizes a session overall using only participants with valid statistics', async () => {
    const missing = buildRankingPlayer('missing', 'Sem dados');
    const worst = buildRankingPlayer('worst', 'Participante pior');
    const best = buildRankingPlayer('best', 'Participante melhor');
    const { findByTeamIdGroupedBySession, service } = buildRankingService(
      [],
      {
        worst: indexes({ radj: 2 }),
        best: indexes({ radj: 6 }),
      },
      { worst: 10, best: 10 },
    );

    const response = await service.buildRankingForPlayers(
      [missing, worst, best],
      'overall',
      'session-id',
    );

    expect(findByTeamIdGroupedBySession).toHaveBeenCalledWith(
      TEAM_ID,
      'session-id',
      { startDate: undefined, endDate: undefined },
    );
    expect(
      response.ranking.map(({ player, value }) => [player.id, value]),
    ).toEqual([
      ['best', 9],
      ['worst', 5],
    ]);
  });

  it('isolates overall positions between sessions', async () => {
    const ana = buildRankingPlayer(PLAYER_ID, 'Ana');
    const bia = buildRankingPlayer(OTHER_PLAYER_ID, 'Bia');
    const performance = (radj: number) => ({
      ...emptyPlayerPerformance(),
      minutes: 40,
      indexes: { ...emptyPlayerPerformance().indexes, radj },
    });
    const findByTeamIdGroupedBySession = jest.fn(
      (_teamId: string, sessionId?: string) =>
        Promise.resolve(
          new Map([
            [
              sessionId ?? 'session-2',
              new Map(
                (sessionId === 'session-1'
                  ? [
                      [ana.id, performance(10)],
                      [bia.id, performance(1)],
                    ]
                  : [
                      [ana.id, performance(1)],
                      [bia.id, performance(10)],
                    ]
                ).map(([playerId, playerPerformance]) => [
                  playerId,
                  { performance: playerPerformance },
                ]),
              ),
            ],
          ]),
        ),
    );
    const service = new PlayersService(
      {} as Repository<PlayerEntity>,
      {} as Repository<TeamEntity>,
      { findByTeamIdGroupedBySession } as unknown as PlayerStatisticsService,
    );

    const first = await service.buildRankingForPlayers(
      [ana, bia],
      'overall',
      'session-1',
    );
    const second = await service.buildRankingForPlayers(
      [ana, bia],
      'overall',
      'session-2',
    );

    expect(first.ranking[0].player.id).toBe(ana.id);
    expect(second.ranking[0].player.id).toBe(bia.id);
    expect(findByTeamIdGroupedBySession).toHaveBeenNthCalledWith(
      1,
      TEAM_ID,
      'session-1',
      { startDate: undefined, endDate: undefined },
    );
    expect(findByTeamIdGroupedBySession).toHaveBeenNthCalledWith(
      2,
      TEAM_ID,
      'session-2',
      { startDate: undefined, endDate: undefined },
    );
  });

  it('returns every ranking option from the centralized ranking rules', () => {
    const { service } = buildRankingService([]);

    expect(service.findRankingOptions()).toEqual([
      { key: 'overall', name: 'Ranking Geral', sortDirection: 'DESC' },
      { key: 'rating', name: 'Nota', sortDirection: 'DESC' },
      { key: 'radj', name: 'Ranking RADJ', sortDirection: 'DESC' },
      {
        key: 'goalsRelations',
        name: 'Relação de Gols',
        sortDirection: 'DESC',
      },
      {
        key: 'actionsRelations',
        name: 'Relação de Ações',
        sortDirection: 'DESC',
      },
      { key: 'atd', name: 'Ranking ATD', sortDirection: 'DESC' },
      { key: 'dto', name: 'Ranking DTO', sortDirection: 'ASC' },
      { key: 'pgj', name: 'Ranking PGJ', sortDirection: 'DESC' },
      { key: 'ic', name: 'Ranking IC', sortDirection: 'DESC' },
      { key: 'tio', name: 'Ranking TIO', sortDirection: 'DESC' },
      { key: 'gtj', name: 'Ranking GTJ', sortDirection: 'ASC' },
      { key: 'rf', name: 'Ranking RF', sortDirection: 'DESC' },
      { key: 'tid', name: 'Ranking TID', sortDirection: 'DESC' },
    ]);
  });
  it('rejects an invalid ranking index', async () => {
    const { service } = buildRankingService([]);
    await expect(service.findRanking('unknown')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('sorts descending indexes from highest to lowest', async () => {
    const players = [
      buildRankingPlayer('00000000-0000-0000-0000-000000000201', 'João'),
      buildRankingPlayer('00000000-0000-0000-0000-000000000204', 'Senna'),
      buildRankingPlayer('00000000-0000-0000-0000-000000000203', 'Guedes'),
    ];
    const { service } = buildRankingService(players, {
      '00000000-0000-0000-0000-000000000201': indexes({ radj: 1.35 }),
      '00000000-0000-0000-0000-000000000204': indexes({ radj: 1.74 }),
      '00000000-0000-0000-0000-000000000203': indexes({ radj: 1.18 }),
    });
    const response = await service.findRanking('radj');
    expect(response.index).toEqual({
      key: 'radj',
      name: 'Ranking RADJ',
      sortDirection: 'DESC',
    });
    expect(response.ranking.map((item) => item.value)).toEqual([
      1.74, 1.35, 1.18,
    ]);
  });

  it('sorts gtj ascending from lowest to highest', async () => {
    const players = [
      buildRankingPlayer('00000000-0000-0000-0000-000000000205', 'Balk'),
      buildRankingPlayer('00000000-0000-0000-0000-000000000201', 'João'),
      buildRankingPlayer('00000000-0000-0000-0000-000000000203', 'Guedes'),
    ];
    const { service } = buildRankingService(players, {
      '00000000-0000-0000-0000-000000000205': indexes({ gtj: 1.35 }),
      '00000000-0000-0000-0000-000000000201': indexes({ gtj: 0.8 }),
      '00000000-0000-0000-0000-000000000203': indexes({ gtj: 0.65 }),
    });
    const response = await service.findRanking('gtj');
    expect(response.index.sortDirection).toBe('ASC');
    expect(response.ranking.map((item) => item.value)).toEqual([
      0.65, 0.8, 1.35,
    ]);
  });

  it('uses competition positions for tied values', async () => {
    const players = [
      buildRankingPlayer('carlos', 'Carlos'),
      buildRankingPlayer('bruno', 'Bruno'),
      buildRankingPlayer('guedes', 'Guedes'),
    ];
    const { service } = buildOverallService(players, {
      carlos: indexes({ radj: 10 }),
      bruno: indexes({ radj: 10 }),
      guedes: indexes({ radj: 5 }),
    });
    const response = await service.findRanking('radj');
    expect(response.ranking.map((item) => item.position)).toEqual([1, 1, 3]);
  });

  it('sorts tied players alphabetically by name', async () => {
    const players = [
      buildRankingPlayer('carlos', 'Carlos'),
      buildRankingPlayer('ana', 'Ana'),
      buildRankingPlayer('bruno', 'Bruno'),
    ];
    const { service } = buildOverallService(players, {
      carlos: indexes({ radj: 10 }),
      ana: indexes({ radj: 10 }),
      bruno: indexes({ radj: 10 }),
    });
    const response = await service.findRanking('radj');
    expect(response.ranking.map((item) => item.player.name)).toEqual([
      'Ana',
      'Bruno',
      'Carlos',
    ]);
  });

  it('returns an empty ranking when there are no active players', async () => {
    const { service } = buildRankingService([]);
    await expect(service.findRanking('radj')).resolves.toMatchObject({
      ranking: [],
    });
  });

  it('excludes soft-deleted players from the ranking', async () => {
    const activePlayer = buildRankingPlayer(
      '00000000-0000-0000-0000-000000000201',
      'Ativo',
    );
    const removedPlayer = buildRankingPlayer(
      '00000000-0000-0000-0000-000000000204',
      'Removido',
      new Date(),
    );
    const { find, service } = buildRankingService(
      [removedPlayer, activePlayer],
      { [activePlayer.id]: indexes({ radj: 0 }) },
    );
    const response = await service.findRanking('radj');
    expect(find).toHaveBeenCalledWith({
      where: { deletedAt: IsNull() },
      relations: { posicao: true },
    });
    expect(response.ranking).toHaveLength(1);
    expect(response.ranking[0].player.name).toBe('Ativo');
  });

  describe('overall ranking', () => {
    it('gives more positional points to the best higher-is-better index', async () => {
      const worst = buildRankingPlayer('worst', 'Pior');
      const middle = buildRankingPlayer('middle', 'Meio');
      const best = buildRankingPlayer('best', 'Melhor');
      const { service } = buildOverallService([middle, worst, best], {
        worst: indexes({ radj: 10 }),
        middle: indexes({ radj: 15 }),
        best: indexes({ radj: 20 }),
      });

      const response = await service.findRanking('overall');

      expect(response.index).toEqual({
        key: 'overall',
        name: 'Ranking Geral',
        sortDirection: 'DESC',
      });
      expect(
        response.ranking.map(({ player, value }) => [player.id, value]),
      ).toEqual([
        ['best', 9],
        ['middle', 6],
        ['worst', 3],
      ]);
    });

    it('uses the centralized ascending direction to invert gtj normalization', async () => {
      const low = buildRankingPlayer('low', 'Menor GTJ');
      const high = buildRankingPlayer('high', 'Maior GTJ');
      const { service } = buildOverallService([high, low], {
        low: indexes({ gtj: 1 }),
        high: indexes({ gtj: 3 }),
      });

      const response = await service.findRanking('overall');

      expect(
        response.ranking.map(({ player, value }) => [player.id, value]),
      ).toEqual([
        ['low', 9],
        ['high', 5],
      ]);
    });

    it('ranks a higher ATD ahead and gives it more overall points', async () => {
      const high = buildRankingPlayer('high', 'Maior ATD');
      const low = buildRankingPlayer('low', 'Menor ATD');
      const { service } = buildOverallService([low, high], {
        high: indexes({ atd: 3 }),
        low: indexes({ atd: 1 }),
      });

      const response = await service.findRanking('overall');

      expect(
        response.ranking.map(({ player, value }) => [player.id, value]),
      ).toEqual([
        ['high', 9],
        ['low', 5],
      ]);
    });

    it('calculates all eleven indexes for twelve session participants', async () => {
      const players = Array.from({ length: 12 }, (_, index) =>
        buildRankingPlayer(`player-${index + 1}`, `Jogador ${index + 1}`),
      );
      const values = Object.fromEntries(
        players.map((player, index) => {
          const descendingValue = 12 - index;
          return [
            player.id,
            {
              ...completeIndexes(descendingValue),
              dto: index + 1,
              gtj: index + 1,
            },
          ];
        }),
      );
      const { service } = buildOverallService(players, values);

      const response = await service.findRanking('overall');
      const byPlayer = new Map(
        response.ranking.map(({ player, value }) => [player.id, value]),
      );

      expect(byPlayer.get('player-1')).toBe(100);
      expect(byPlayer.get('player-5')).toBe(67);
      expect(byPlayer.get('player-12')).toBe(8);
    });

    it('uses the centralized ascending direction to invert dto normalization', async () => {
      const best = buildRankingPlayer('best', 'Melhor defesa');
      const worst = buildRankingPlayer('worst', 'Pior defesa');
      const { service } = buildOverallService([worst, best], {
        best: indexes({ dto: -2 }),
        worst: indexes({ dto: 3 }),
      });

      const response = await service.findRanking('overall');

      expect(
        response.ranking.map(({ player, value }) => [player.id, value]),
      ).toEqual([
        ['best', 9],
        ['worst', 5],
      ]);
    });

    it('assigns the same best position and points when index values tie', async () => {
      const first = buildRankingPlayer('first', 'Ana');
      const second = buildRankingPlayer('second', 'Bruno');
      const { service } = buildOverallService([second, first], {
        first: indexes({ radj: 7 }),
        second: indexes({ radj: 7 }),
      });

      const response = await service.findRanking('overall');

      expect(response.ranking.map(({ value }) => value)).toEqual([9, 9]);
    });

    it('uses equal positional weights and rounds only the final overall', async () => {
      const minimum = buildRankingPlayer('minimum', 'Mínimo');
      const target = buildRankingPlayer('target', 'Alvo');
      const maximum = buildRankingPlayer('maximum', 'Máximo');
      const { service } = buildOverallService([target, maximum, minimum], {
        minimum: indexes({ radj: 0, goalsRelations: 0 }),
        target: indexes({ radj: 24.6, goalsRelations: 73.6 }),
        maximum: indexes({ radj: 100, goalsRelations: 100 }),
      });

      const response = await service.findRanking('overall');
      const values = Object.fromEntries(
        response.ranking.map((item) => [item.player.id, item.value]),
      );

      expect(values).toMatchObject({ maximum: 18, target: 12, minimum: 6 });
      expect(
        response.ranking.every(
          ({ value }) => value !== null && value >= 0 && value <= 100,
        ),
      ).toBe(true);
    });

    it('ignores missing, null and non-numeric indexes and excludes players without valid values', async () => {
      const minimum = buildRankingPlayer('minimum', 'Mínimo');
      const partial = buildRankingPlayer('partial', 'Parcial');
      const invalid = buildRankingPlayer('invalid', 'Inválido');
      const { service } = buildOverallService([invalid, partial, minimum], {
        minimum: indexes({ radj: 0 }),
        partial: indexes({ radj: 10, goalsRelations: Number.NaN }),
        invalid: indexes({ radj: Number.NaN, goalsRelations: undefined }),
      });

      const response = await service.findRanking('overall');

      expect(response.ranking.map(({ player }) => player.id)).toEqual([
        'partial',
        'minimum',
        'invalid',
      ]);
      expect(response.ranking.map(({ value }) => value)).toEqual([9, 6, 0]);
    });

    it('sorts descending and preserves competition ties with alphabetical order', async () => {
      const bruno = buildRankingPlayer('bruno', 'Bruno');
      const ana = buildRankingPlayer('ana', 'Ana');
      const carlos = buildRankingPlayer('carlos', 'Carlos');
      const { service } = buildOverallService([bruno, carlos, ana], {
        bruno: indexes({ radj: 10 }),
        ana: indexes({ radj: 10 }),
        carlos: indexes({ radj: 0 }),
      });

      const response = await service.findRanking('overall');

      expect(response.ranking.map(({ player }) => player.name)).toEqual([
        'Ana',
        'Bruno',
        'Carlos',
      ]);
      expect(response.ranking.map(({ position }) => position)).toEqual([
        1, 1, 3,
      ]);
      expect(response.ranking.map(({ value }) => value)).toEqual([9, 9, 3]);
    });

    it('excludes soft-deleted players from both ranking and normalization', async () => {
      const minimum = buildRankingPlayer('minimum', 'Mínimo');
      const activeBest = buildRankingPlayer('active-best', 'Melhor ativo');
      const removed = buildRankingPlayer('removed', 'Removido', new Date());
      const { find, service } = buildOverallService(
        [removed, minimum, activeBest],
        {
          minimum: indexes({ radj: 0 }),
          'active-best': indexes({ radj: 5 }),
          removed: indexes({ radj: 10 }),
        },
      );

      const response = await service.findRanking('overall');

      expect(find).toHaveBeenCalledWith({
        where: { deletedAt: IsNull() },
        relations: { posicao: true },
      });
      expect(
        response.ranking.map(({ player, value }) => [player.id, value]),
      ).toEqual([
        ['active-best', 9],
        ['minimum', 5],
      ]);
    });

    it('recalculates relative normalization when the active roster changes', async () => {
      const minimum = buildRankingPlayer('minimum', 'Mínimo');
      const middle = buildRankingPlayer('middle', 'Meio');
      const maximum = buildRankingPlayer('maximum', 'Máximo');
      const values = {
        minimum: indexes({ radj: 0 }),
        middle: indexes({ radj: 5 }),
        maximum: indexes({ radj: 10 }),
      };
      const fullRoster = buildOverallService(
        [minimum, middle, maximum],
        values,
      );
      const reducedRoster = buildOverallService([minimum, middle], values);

      const fullResponse = await fullRoster.service.findRanking('overall');
      const reducedResponse =
        await reducedRoster.service.findRanking('overall');
      const fullMiddle = fullResponse.ranking.find(
        ({ player }) => player.id === 'middle',
      );
      const reducedMiddle = reducedResponse.ranking.find(
        ({ player }) => player.id === 'middle',
      );

      expect(fullMiddle?.value).toBe(6);
      expect(reducedMiddle?.value).toBe(9);
    });
  });

  it('excludes missing and non-participating players while preserving a real zero', async () => {
    const missing = buildRankingPlayer('missing', 'Sem dados');
    const noParticipation = buildRankingPlayer('bench', 'Sem participaÃ§Ã£o');
    const realZero = buildRankingPlayer('zero', 'Zero real');
    const { service } = buildRankingService(
      [missing, noParticipation, realZero],
      {
        bench: indexes({ gtj: 0 }),
        zero: indexes({ gtj: 0 }),
      },
      { bench: 0, zero: 12 },
    );

    const response = await service.findRanking('gtj');

    expect(response.ranking).toHaveLength(1);
    expect(response.ranking[0]).toMatchObject({
      player: { id: 'zero' },
      value: 0,
    });
  });

  it('sorts dto ascending so the best defensive performance ranks first', async () => {
    const best = buildRankingPlayer('best', 'Melhor defesa');
    const worst = buildRankingPlayer('worst', 'Pior defesa');
    const { service } = buildRankingService([worst, best], {
      best: indexes({ dto: -1.5 }),
      worst: indexes({ dto: 2 }),
    });

    const response = await service.findRanking('dto');

    expect(response.index.sortDirection).toBe('ASC');
    expect(
      response.ranking.map(({ player, value }) => [player.id, value]),
    ).toEqual([
      ['best', -1.5],
      ['worst', 2],
    ]);
  });
});

describe('rating ranking', () => {
  const ratingStats = (radj: number, goals: number) => ({
    performance: {
      ...emptyPlayerPerformance(),
      minutes: 40,
      indexes: { ...emptyPlayerPerformance().indexes, radj },
    },
    ratingData: {
      goals,
      assists: 0,
      positiveActions: goals,
      negativeActions: 0,
      positiveGoals: goals,
      negativeGoals: 0,
      tio: 0,
      tid: 0,
    },
  });

  const setup = (
    sessions: Map<string, Map<string, ReturnType<typeof ratingStats>>>,
  ) => {
    const players = [
      buildRankingPlayer(PLAYER_ID, 'Ana'),
      buildRankingPlayer(OTHER_PLAYER_ID, 'Bia'),
    ];
    const findByTeamIdGroupedBySession = jest.fn().mockResolvedValue(sessions);
    const service = new PlayersService(
      {
        find: jest.fn().mockResolvedValue(players),
      } as unknown as Repository<PlayerEntity>,
      {} as Repository<TeamEntity>,
      {
        findByTeamId: jest.fn(),
        findByTeamIdGroupedBySession,
      } as unknown as PlayerStatisticsService,
    );
    return { service, findByTeamIdGroupedBySession };
  };

  it('sorts by highest rating and returns the selected session rating', async () => {
    const { service, findByTeamIdGroupedBySession } = setup(
      new Map([
        [
          'session-1',
          new Map([
            [PLAYER_ID, ratingStats(0, 0)],
            [OTHER_PLAYER_ID, ratingStats(10, 3)],
          ]),
        ],
      ]),
    );

    const response = await service.findRanking('rating', {
      sessionId: 'session-1',
    });

    expect(findByTeamIdGroupedBySession).toHaveBeenCalledWith(
      TEAM_ID,
      'session-1',
      { startDate: undefined, endDate: undefined },
    );
    expect(response.ranking.map((item) => item.player.id)).toEqual([
      OTHER_PLAYER_ID,
      PLAYER_ID,
    ]);
  });

  it('uses the corrected positional overall in the existing rating formula', async () => {
    const { service } = setup(
      new Map([
        [
          'session-1',
          new Map([
            [PLAYER_ID, ratingStats(10, 0)],
            [OTHER_PLAYER_ID, ratingStats(1, 0)],
          ]),
        ],
      ]),
    );

    const response = await service.findRanking('rating', {
      sessionId: 'session-1',
    });

    expect(
      response.ranking.map(({ player, value }) => [player.id, value]),
    ).toEqual([
      [PLAYER_ID, 3],
      [OTHER_PLAYER_ID, 2.9],
    ]);
  });

  it('averages session ratings after calculating each session separately', async () => {
    const { service } = setup(
      new Map([
        [
          'session-1',
          new Map([
            [PLAYER_ID, ratingStats(0, 0)],
            [OTHER_PLAYER_ID, ratingStats(10, 5)],
          ]),
        ],
        [
          'session-2',
          new Map([
            [PLAYER_ID, ratingStats(10, 5)],
            [OTHER_PLAYER_ID, ratingStats(0, 0)],
          ]),
        ],
      ]),
    );

    const response = await service.findRanking('rating');

    expect(response.ranking).toHaveLength(2);
    expect(response.ranking[0].value).toBe(response.ranking[1].value);
  });

  it('does not fail or rank a player without session data', async () => {
    const { service } = setup(new Map());
    await expect(service.findRanking('rating')).resolves.toMatchObject({
      ranking: [],
    });
  });
});
