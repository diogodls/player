import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { SessionEntity, TeamEntity } from '../entities';
import { SESSION_TYPES } from './sessions.constants';
import { SessionFiltersDto } from './dto/session-filters.dto';
import { SessionListResponseDto } from './dto/session-list-response.dto';
import { SessionDto } from './dto/session.dto';
import { SessionResponseDto } from './dto/session-response.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionsRepository: Repository<SessionEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamsRepository: Repository<TeamEntity>,
  ) {}

  async findAll(filters?: SessionFiltersDto): Promise<SessionListResponseDto> {
    const limit = filters?.limit ?? 5;
    const where: FindOptionsWhere<SessionEntity> = {
      ...(filters?.typeId ? { sessionTypeId: filters.typeId } : {}),
      ...(filters?.locationId ? { sessionLocationId: filters.locationId } : {}),
      ...(filters?.date ? { data: new Date(filters.date) } : {}),
    };
    const total = await this.sessionsRepository.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(filters?.page ?? 1, totalPages);
    const sessions = await this.sessionsRepository.find({
      where,
      relations: {
        equipe: true,
        sessionType: true,
        sessionLocation: true,
        sessionCourtSize: true,
      },
      order: { data: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: sessions.map((session) => this.toResponse(session)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<SessionResponseDto> {
    return this.toResponse(await this.findEntity(id));
  }

  async create(dto: SessionDto): Promise<SessionResponseDto> {
    if (dto.id !== null) {
      throw new BadRequestException('Id deve ser nulo ao criar uma sessão');
    }

    const team = await this.findTeam();
    const session = this.sessionsRepository.create({
      equipeId: team.id,
      sessionTypeId: dto.typeId,
      sessionLocationId: dto.locationId,
      sessionCourtSizeId: dto.courtSizeId,
      data: new Date(dto.date),
      descricao: dto.description ?? null,
    });

    const savedSession = await this.sessionsRepository.save(session);
    return this.findOne(savedSession.id);
  }

  async update(id: string, dto: SessionDto): Promise<SessionResponseDto> {
    if (dto.id !== id) {
      throw new BadRequestException(
        'Id da sessão deve ser igual ao identificador da rota',
      );
    }

    await this.findEntity(id);

    await this.sessionsRepository.update(id, {
      sessionTypeId: dto.typeId,
      sessionLocationId: dto.locationId,
      sessionCourtSizeId: dto.courtSizeId,
      data: new Date(dto.date),
      descricao: dto.description ?? null,
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.sessionsRepository.softRemove(await this.findEntity(id));
  }

  private async findEntity(id: string): Promise<SessionEntity> {
    const session = await this.sessionsRepository.findOne({
      where: { id },
      relations: {
        equipe: true,
        sessionType: true,
        sessionLocation: true,
        sessionCourtSize: true,
      },
    });

    if (!session) throw new NotFoundException('Sessao nao encontrada');

    return session;
  }

  private async findTeam(): Promise<TeamEntity> {
    const [team] = await this.teamsRepository.find({ take: 1 });

    if (!team) {
      throw new BadRequestException('Equipe nao encontrada');
    }

    return team;
  }

  private toResponse(session: SessionEntity): SessionResponseDto {
    if (
      !session.equipe ||
      !session.sessionType ||
      !session.sessionLocation ||
      !session.sessionCourtSize
    ) {
      throw new Error('Relacoes da sessão não foram carregadas');
    }

    const description = session.descricao ?? null;

    return {
      id: session.id,
      typeId: session.sessionTypeId,
      type: session.sessionType.nome,
      locationId: session.sessionLocationId,
      local: session.sessionLocation.nome,
      courtSizeId: session.sessionCourtSizeId,
      courtSize: session.sessionCourtSize.nome,
      date: this.formatDate(session.data),
      description,
      ...(session.sessionTypeId === SESSION_TYPES.Jogo
        ? { opponent: description }
        : {}),
      teamName: session.equipe.nome,
    };
  }

  private formatDate(date: Date | string): string {
    if (typeof date === 'string') return date.slice(0, 10);
    return date.toISOString().slice(0, 10);
  }
}
