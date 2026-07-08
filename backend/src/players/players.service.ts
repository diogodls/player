import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { PlayerEntity, TeamEntity } from '../entities';
import { PlayerFiltersDto } from './dto/player-filters.dto';
import { PlayerDto } from './dto/player.dto';
import { PlayerResponseDto } from './dto/player-response.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playersRepository: Repository<PlayerEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamsRepository: Repository<TeamEntity>,
  ) {}

  async findAll(filters: PlayerFiltersDto = {}): Promise<PlayerResponseDto[]> {
    const players = await this.playersRepository.find({
      where: {
        ...(filters.name ? { nome: ILike(`%${filters.name}%`) } : {}),
        ...(filters.positionId ? { posicaoId: filters.positionId } : {}),
      },
      relations: {
        equipe: true,
        posicao: true,
        ladoPreferencial: true,
      },
      order: { nome: 'ASC' },
    });

    return players.map((player) => this.toResponse(player));
  }

  async findOne(id: string): Promise<PlayerResponseDto> {
    return this.toResponse(await this.findEntity(id));
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
    };
  }
}
