import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PlayerEntity, TeamEntity } from '../entities';
import { PlayerDto } from './dto/player.dto';
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
});
