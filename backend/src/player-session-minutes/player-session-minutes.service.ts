import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import {
  PlayerEntity,
  PlayerSessionMinutesEntity,
  SessionEntity,
} from '../entities';
import { PlayerSessionMinutesResponseDto } from './dto/player-session-minutes-response.dto';
import { UpdatePlayerSessionMinutesDto } from './dto/update-player-session-minutes.dto';

@Injectable()
export class PlayerSessionMinutesService {
  constructor(
    @InjectRepository(PlayerSessionMinutesEntity)
    private readonly minutesRepository: Repository<PlayerSessionMinutesEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionsRepository: Repository<SessionEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playersRepository: Repository<PlayerEntity>,
  ) {}

  async findAll(sessionId: string): Promise<PlayerSessionMinutesResponseDto[]> {
    const session = await this.sessionsRepository.findOneBy({ id: sessionId });
    if (!session) throw new NotFoundException('Sessão não encontrada');

    const [players, records] = await Promise.all([
      this.playersRepository.find({
        where: { equipeId: session.equipeId, deletedAt: IsNull() },
        relations: { posicao: true },
        order: { nome: 'ASC' },
      }),
      this.minutesRepository.find({ where: { sessionId } }),
    ]);
    const recordsByPlayer = new Map(
      records.map((record) => [record.playerId, record]),
    );

    return players.map((player) => {
      const record = recordsByPlayer.get(player.id);
      return this.toResponse(player, record);
    });
  }

  async update(
    sessionId: string,
    playerId: string,
    dto: UpdatePlayerSessionMinutesDto,
  ): Promise<PlayerSessionMinutesResponseDto> {
    this.validateTotalSeconds(dto.totalSeconds);
    return this.withLockedRecord(
      sessionId,
      playerId,
      async (record, player, manager) => {
        if (record.activeSince) {
          throw new ConflictException(
            'Minutagem não pode ser editada enquanto o cronômetro está ativo',
          );
        }
        record.totalSeconds = dto.totalSeconds;
        return this.toResponse(player, await manager.save(record));
      },
    );
  }

  async start(
    sessionId: string,
    playerId: string,
  ): Promise<PlayerSessionMinutesResponseDto> {
    return this.withLockedRecord(
      sessionId,
      playerId,
      async (record, player, manager) => {
        if (record.activeSince) {
          throw new ConflictException('Cronômetro do jogador já está ativo');
        }
        record.activeSince = new Date();
        return this.toResponse(player, await manager.save(record));
      },
    );
  }

  async stop(
    sessionId: string,
    playerId: string,
  ): Promise<PlayerSessionMinutesResponseDto> {
    return this.withLockedRecord(
      sessionId,
      playerId,
      async (record, player, manager) => {
        if (!record.activeSince) {
          throw new ConflictException('Cronômetro do jogador não está ativo');
        }
        const elapsedSeconds = Math.max(
          0,
          Math.floor((Date.now() - record.activeSince.getTime()) / 1000),
        );
        record.totalSeconds += elapsedSeconds;
        record.activeSince = null;
        return this.toResponse(player, await manager.save(record));
      },
    );
  }

  private async withLockedRecord<T>(
    sessionId: string,
    playerId: string,
    operation: (
      record: PlayerSessionMinutesEntity,
      player: PlayerEntity,
      manager: EntityManager,
    ) => Promise<T>,
  ): Promise<T> {
    return this.minutesRepository.manager.transaction(async (manager) => {
      const player = await this.validateSessionAndPlayer(
        manager,
        sessionId,
        playerId,
      );
      await manager
        .createQueryBuilder()
        .insert()
        .into(PlayerSessionMinutesEntity)
        .values({ sessionId, playerId, totalSeconds: 0, activeSince: null })
        .orIgnore()
        .execute();
      const record = await manager.findOne(PlayerSessionMinutesEntity, {
        where: { sessionId, playerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!record) throw new Error('Registro de minutagem não foi criado');
      return operation(record, player, manager);
    });
  }

  private async validateSessionAndPlayer(
    manager: EntityManager,
    sessionId: string,
    playerId: string,
  ): Promise<PlayerEntity> {
    const session = await manager.findOneBy(SessionEntity, { id: sessionId });
    if (!session) throw new NotFoundException('Sessão não encontrada');
    const player = await manager.findOne(PlayerEntity, {
      where: { id: playerId },
      relations: { posicao: true },
    });
    if (!player) throw new NotFoundException('Jogador não encontrado');
    if (player.equipeId !== session.equipeId) {
      throw new BadRequestException(
        'Jogador deve pertencer à mesma equipe da sessão',
      );
    }
    return player;
  }

  private validateTotalSeconds(totalSeconds: number) {
    if (!Number.isInteger(totalSeconds) || totalSeconds < 0) {
      throw new BadRequestException(
        'Minutagem deve ser um número inteiro maior ou igual a zero',
      );
    }
  }

  private toResponse(
    player: PlayerEntity,
    record?: PlayerSessionMinutesEntity,
  ): PlayerSessionMinutesResponseDto {
    const activeSince = record?.activeSince ?? null;
    return {
      playerId: player.id,
      name: player.nome,
      position: player.posicao?.nome ?? null,
      totalSeconds: record?.totalSeconds ?? 0,
      activeSince,
      isActive: activeSince !== null,
    };
  }
}
