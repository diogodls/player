import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { PlayerEntity, TeamEntity } from '../entities';
import { PlayerFiltersDto } from './dto/player-filters.dto';
import { PlayerListResponseDto } from './dto/player-list-response.dto';
import { PlayerDto } from './dto/player.dto';
import {
  PlayerIndexesResponseDto,
  PlayerResponseDto,
} from './dto/player-response.dto';

@Injectable()
export class PlayersService {
  // TEMPORÁRIO: índices determinísticos apenas para validar a tela do jogador.
  private static readonly TEST_INDEXES_BY_PLAYER_ID: Record<
    string,
    PlayerIndexesResponseDto
  > = {
    '00000000-0000-0000-0000-000000000201': {
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
    '00000000-0000-0000-0000-000000000202': {
      radj: 1.62,
      goalsRelations: 2.1,
      actionsRelations: 4.8,
      atd: 84,
      dto: 61,
      pgj: 1.85,
      ic: 86,
      tio: 89,
      gtj: 1.1,
      rf: 1.9,
      tid: 67,
    },
    '00000000-0000-0000-0000-000000000203': {
      radj: 1.18,
      goalsRelations: 0.75,
      actionsRelations: 2.6,
      atd: 69,
      dto: 73,
      pgj: 1.4,
      ic: 81,
      tio: 76,
      gtj: 0.65,
      rf: 2.85,
      tid: 84,
    },
    '00000000-0000-0000-0000-000000000204': {
      radj: 1.74,
      goalsRelations: 2.55,
      actionsRelations: 5.2,
      atd: 88,
      dto: 70,
      pgj: 2.05,
      ic: 91,
      tio: 93,
      gtj: 0.95,
      rf: 2.2,
      tid: 79,
    },
    '00000000-0000-0000-0000-000000000205': {
      radj: 0.96,
      goalsRelations: -0.4,
      actionsRelations: -1.3,
      atd: 63,
      dto: 82,
      pgj: 0.7,
      ic: 66,
      tio: 64,
      gtj: 1.35,
      rf: 3.1,
      tid: 88,
    },
  };

  private static readonly DEFAULT_TEST_INDEXES: PlayerIndexesResponseDto = {
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
  };
  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playersRepository: Repository<PlayerEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamsRepository: Repository<TeamEntity>,
  ) {}

  async findAll(filters?: PlayerFiltersDto): Promise<PlayerListResponseDto> {
    const limit = filters?.limit ?? 8;
    const where = {
      ...(filters?.name ? { nome: ILike(`%${filters.name}%`) } : {}),
      ...(filters?.positionId ? { posicaoId: filters.positionId } : {}),
    };
    const total = await this.playersRepository.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(filters?.page ?? 1, totalPages);
    const players = await this.playersRepository.find({
      where,
      relations: {
        equipe: true,
        posicao: true,
        ladoPreferencial: true,
      },
      order: { nome: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: players.map((player) => this.toResponse(player)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<PlayerResponseDto> {
    const player = await this.findEntity(id);

    return {
      ...this.toResponse(player),
      indexes:
        PlayersService.TEST_INDEXES_BY_PLAYER_ID[player.id] ??
        PlayersService.DEFAULT_TEST_INDEXES,
    };
  }

  async create(dto: PlayerDto): Promise<PlayerResponseDto> {
    if (dto.id !== null) {
      throw new BadRequestException('Id deve ser nulo ao criar um jogador');
    }

    const team = await this.findTeam();

    const player = this.playersRepository.create({
      nome: dto.name,
      idade: dto.age,
      posicaoId: dto.positionId,
      ladoPreferencialId: dto.preferredSideId,
      equipeId: team.id,
    });

    const savedPlayer = await this.playersRepository.save(player);
    return this.findOne(savedPlayer.id);
  }

  async update(id: string, dto: PlayerDto): Promise<PlayerResponseDto> {
    if (dto.id !== id) {
      throw new BadRequestException(
        'Id do jogador deve ser igual ao identificador da rota',
      );
    }

    await this.findEntity(id);

    const changes: Partial<PlayerEntity> = {};
    if (dto.name !== undefined) changes.nome = dto.name;
    if (dto.age !== undefined) changes.idade = dto.age;
    if (dto.positionId !== undefined) changes.posicaoId = dto.positionId;
    if (dto.preferredSideId !== undefined) {
      changes.ladoPreferencialId = dto.preferredSideId;
    }
    if (Object.keys(changes).length > 0) {
      await this.playersRepository.update(id, changes);
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.playersRepository.softRemove(await this.findEntity(id));
  }

  private async findEntity(id: string): Promise<PlayerEntity> {
    const player = await this.playersRepository.findOne({
      where: { id },
      relations: {
        equipe: true,
        posicao: true,
        ladoPreferencial: true,
      },
    });

    if (!player) throw new NotFoundException('Jogador não encontrado');

    return player;
  }

  private async findTeam(): Promise<TeamEntity> {
    const [team] = await this.teamsRepository.find({ take: 1 });

    if (!team) {
      throw new BadRequestException('Equipe não encontrada');
    }

    return team;
  }

  private toResponse(player: PlayerEntity): PlayerResponseDto {
    if (!player.posicao || !player.ladoPreferencial || !player.equipe) {
      throw new Error('Relações do jogador não foram carregadas');
    }

    return {
      id: player.id,
      name: player.nome,
      age: player.idade,
      positionId: player.posicaoId,
      position: player.posicao.nome,
      preferredSideId: player.ladoPreferencialId,
      preferredSide: player.ladoPreferencial.nome,
      teamName: player.equipe.nome,
      indexes: null,
    };
  }
}
