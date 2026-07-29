import { BadRequestException } from '@nestjs/common';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { PlayerEntity, TeamEntity } from '../entities';
import { PlayerDto } from './dto/player.dto';
import { PlayersService } from './players.service';

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
    deletedAt,
    posicao: { id: 3, nome: 'Ala' },
  }) as PlayerEntity;

const buildRankingService = (players: PlayerEntity[]) => {
  const find = jest.fn().mockResolvedValue(players);
  return {
    find,
    service: new PlayersService(
      { find } as unknown as Repository<PlayerEntity>,
      {} as Repository<TeamEntity>,
    ),
  };
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
    );

    const response = await playersService.findAll({ page: 4, limit: 8 });

    expect(receivedFindOptions?.skip).toBe(8);
    expect(response.page).toBe(2);
    expect(response.totalPages).toBe(2);
  });

  it('returns deterministic test indexes selected by player id', async () => {
    const player = {
      id: '00000000-0000-0000-0000-000000000201',
      equipeId: TEAM_ID,
      posicaoId: 3,
      ladoPreferencialId: 2,
      nome: 'Ana Silva',
      idade: 21,
      equipe: { id: TEAM_ID, nome: 'Equipe Principal' },
      posicao: { id: 3, nome: 'Ala' },
      ladoPreferencial: { id: 2, nome: 'Canhoto' },
    } as PlayerEntity;
    const findOne = jest.fn().mockResolvedValue(player);
    const service = new PlayersService(
      { findOne } as unknown as Repository<PlayerEntity>,
      {} as Repository<TeamEntity>,
    );

    const response = await service.findOne(player.id);

    expect(findOne).toHaveBeenCalledWith({
      where: { id: player.id },
      relations: { equipe: true, posicao: true, ladoPreferencial: true },
    });
    expect(response).toEqual({
      id: player.id,
      name: 'Ana Silva',
      age: 21,
      positionId: 3,
      position: 'Ala',
      preferredSideId: 2,
      preferredSide: 'Canhoto',
      teamName: 'Equipe Principal',
      indexes: {
        radj: 1.35,
        goalsRelations: 1.2,
        actionsRelations: 3.4,
        atd: 72,
        dto: 68,
        pgj: 1.1,
        ic: 74,
        tio: 78,
        gtj: 0.8,
        rf: 2.4,
        tid: 81,
      },
    });
  });

  it('returns deterministic default test indexes for other players', async () => {
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
    );

    await expect(service.findOne(PLAYER_ID)).resolves.toMatchObject({
      indexes: {
        radj: 1.25,
        goalsRelations: 0.9,
        actionsRelations: 2.2,
        atd: 70,
        dto: 70,
        pgj: 1.2,
        ic: 75,
        tio: 75,
        gtj: 1,
        rf: 2.5,
        tid: 75,
      },
    });
  });

  it('rejects an invalid ranking index', async () => {
    const { service } = buildRankingService([]);
    await expect(service.findRanking('overall')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('sorts descending indexes from highest to lowest', async () => {
    const { service } = buildRankingService([
      buildRankingPlayer('00000000-0000-0000-0000-000000000201', 'João'),
      buildRankingPlayer('00000000-0000-0000-0000-000000000204', 'Senna'),
      buildRankingPlayer('00000000-0000-0000-0000-000000000203', 'Guedes'),
    ]);
    const response = await service.findRanking('radj');
    expect(response.index).toEqual({
      key: 'radj',
      name: 'Relação Ataque-Defesa por jogo',
      sortDirection: 'DESC',
    });
    expect(response.ranking.map((item) => item.value)).toEqual([
      1.74, 1.35, 1.18,
    ]);
  });

  it('sorts gtj ascending from lowest to highest', async () => {
    const { service } = buildRankingService([
      buildRankingPlayer('00000000-0000-0000-0000-000000000205', 'Balk'),
      buildRankingPlayer('00000000-0000-0000-0000-000000000201', 'João'),
      buildRankingPlayer('00000000-0000-0000-0000-000000000203', 'Guedes'),
    ]);
    const response = await service.findRanking('gtj');
    expect(response.index.sortDirection).toBe('ASC');
    expect(response.ranking.map((item) => item.value)).toEqual([
      0.65, 0.8, 1.35,
    ]);
  });

  it('uses competition positions for tied values', async () => {
    const { service } = buildRankingService([
      buildRankingPlayer('11111111-1111-1111-1111-111111111111', 'Carlos'),
      buildRankingPlayer('22222222-2222-2222-2222-222222222222', 'Bruno'),
      buildRankingPlayer('00000000-0000-0000-0000-000000000203', 'Guedes'),
    ]);
    const response = await service.findRanking('radj');
    expect(response.ranking.map((item) => item.position)).toEqual([1, 1, 3]);
  });

  it('sorts tied players alphabetically by name', async () => {
    const { service } = buildRankingService([
      buildRankingPlayer('11111111-1111-1111-1111-111111111111', 'Carlos'),
      buildRankingPlayer('22222222-2222-2222-2222-222222222222', 'Ana'),
      buildRankingPlayer('33333333-3333-3333-3333-333333333333', 'Bruno'),
    ]);
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
    const { find, service } = buildRankingService([
      removedPlayer,
      activePlayer,
    ]);
    const response = await service.findRanking('radj');
    expect(find).toHaveBeenCalledWith({
      where: { deletedAt: IsNull() },
      relations: { posicao: true },
    });
    expect(response.ranking).toHaveLength(1);
    expect(response.ranking[0].player.name).toBe('Ativo');
  });
});
