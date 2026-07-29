import { BadRequestException } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PlayerEntity, TeamEntity } from '../entities';
import { PlayerDto } from './dto/player.dto';
import {
  emptyPlayerPerformance,
  PlayerStatisticsService,
} from './player-statistics.service';
import { PlayersService } from './players.service';

const PLAYER_ID = '79fbbbe8-39b1-4b25-bd11-236a0f228cb0';
const OTHER_PLAYER_ID = '9828b90e-6aa0-4d75-985d-f286802c3086';
const TEAM_ID = 'd62ec1e1-f762-45bd-a1e9-09ba8ef8d461';

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
});
