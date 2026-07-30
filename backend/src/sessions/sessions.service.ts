import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  PlayerEntity,
  SessionEntity,
  TaggedActionEntity,
  TeamEntity,
} from '../entities';
import type { PlayerRankingResponseDto } from '../players/dto/player-ranking-response.dto';
import { PlayersService } from '../players/players.service';
import { SESSION_TYPES } from './sessions.constants';
import { SessionFiltersDto } from './dto/session-filters.dto';
import { SessionListResponseDto } from './dto/session-list-response.dto';
import { SessionDto } from './dto/session.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { SessionViewFiltersDto } from './dto/session-view-filters.dto';
import {
  SessionViewActionDto,
  SessionViewAnalysisSectionDto,
  SessionViewEntityDto,
  SessionViewEntityType,
  SessionViewFilterOptionsDto,
  SessionViewResponseDto,
} from './dto/session-view-response.dto';

const POSITIVE_IMPACT_ID = 1;
const NEGATIVE_IMPACT_ID = 2;
const TEAM_ENTITY_ID = 'team';
const TEAM_ENTITY_TITLE = 'Equipe';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionsRepository: Repository<SessionEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamsRepository: Repository<TeamEntity>,
    @InjectRepository(TaggedActionEntity)
    private readonly taggedActionsRepository: Repository<TaggedActionEntity>,
    private readonly playersService: PlayersService = null as unknown as PlayersService,
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

  async findRanking(
    id: string,
    indexKey: string,
  ): Promise<PlayerRankingResponseDto> {
    await this.findEntity(id);
    const actions = await this.taggedActionsRepository.find({
      where: { sessaoId: id },
      relations: { jogador: { posicao: true } },
    });
    const playersById = new Map<string, PlayerEntity>();
    for (const action of actions) {
      const player = action.jogador;
      if (action.jogadorId && player && player.deletedAt == null) {
        playersById.set(player.id, player);
      }
    }
    return this.playersService.buildRankingForPlayers(
      [...playersById.values()],
      indexKey,
      id,
    );
  }

  async findView(
    id: string,
    filters: SessionViewFiltersDto = {},
  ): Promise<SessionViewResponseDto> {
    const session = await this.findEntity(id);
    const actions = await this.taggedActionsRepository.find({
      where: { sessaoId: id },
      relations: {
        acaoCatalogo: {
          categoriaAcao: true,
          impacto: true,
        },
        jogador: true,
      },
      order: { timestampSegundos: 'ASC' },
    });

    const individualActions = actions.filter(
      (action) => action.jogadorId !== null,
    );
    const teamActions = actions.filter((action) => action.jogadorId === null);
    const filteredIndividualActions = this.applyViewFilters(
      individualActions,
      filters,
      true,
    );
    const filteredTeamActions = this.applyViewFilters(
      teamActions,
      filters,
      false,
    );

    return {
      session: this.toResponse(session),
      analysis: {
        individual: this.buildAnalysisSection(
          filteredIndividualActions,
          'player',
        ),
        team: this.buildAnalysisSection(filteredTeamActions, 'team'),
      },
      filters: this.buildViewFilters(actions),
    };
  }

  async findViewFilters(
    id: string,
  ): Promise<Record<'individual' | 'team', SessionViewFilterOptionsDto>> {
    const actions = await this.taggedActionsRepository.find({
      where: { sessaoId: id },
      relations: {
        acaoCatalogo: true,
        jogador: true,
      },
      order: { timestampSegundos: 'ASC' },
    });
    return this.buildViewFilters(actions);
  }

  private buildViewFilters(actions: TaggedActionEntity[]) {
    const individualActions = actions.filter(
      (action) => action.jogadorId !== null,
    );
    const teamActions = actions.filter((action) => action.jogadorId === null);

    return {
      individual: this.buildFilterOptions(individualActions),
      team: this.buildFilterOptions(teamActions),
    };
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
      throw new Error('Relações da sessão não foram carregadas');
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

  private buildAnalysisSection(
    actions: TaggedActionEntity[],
    entityType: SessionViewEntityType,
  ): SessionViewAnalysisSectionDto {
    return {
      summary: this.buildSummary(actions),
      entities:
        entityType === 'team'
          ? this.buildTeamEntities(actions)
          : this.buildPlayerEntities(actions),
    };
  }

  private buildTeamEntities(
    actions: TaggedActionEntity[],
  ): SessionViewEntityDto[] {
    if (actions.length === 0) return [];

    return [
      this.buildEntity({
        id: TEAM_ENTITY_ID,
        type: 'team',
        title: TEAM_ENTITY_TITLE,
        actions,
      }),
    ];
  }

  private buildPlayerEntities(
    actions: TaggedActionEntity[],
  ): SessionViewEntityDto[] {
    const groupedActions = new Map<string, TaggedActionEntity[]>();

    actions.forEach((action) => {
      if (!action.jogador) return;
      const current = groupedActions.get(action.jogador.id) ?? [];
      current.push(action);
      groupedActions.set(action.jogador.id, current);
    });

    return Array.from(groupedActions.values()).map((playerActions) => {
      const [firstAction] = playerActions;
      if (!firstAction?.jogador) {
        throw new Error('Acao individual sem jogador carregado');
      }

      return this.buildEntity({
        id: firstAction.jogador.id,
        type: 'player',
        title: firstAction.jogador.nome,
        actions: playerActions,
      });
    });
  }

  private buildEntity({
    id,
    type,
    title,
    actions,
  }: {
    id: string;
    type: SessionViewEntityType;
    title: string;
    actions: TaggedActionEntity[];
  }): SessionViewEntityDto {
    const stats = this.buildStats(actions);

    return {
      id,
      type,
      title,
      stats,
      metrics: {
        overall: stats.total,
        offensive: this.countOffensiveActions(actions),
        defensive: this.countDefensiveActions(actions),
        performance: this.calculatePercentage(
          stats.positive,
          stats.positive + stats.negative,
        ),
      },
      actions: actions.map((action) => this.toViewAction(action)),
    };
  }

  private buildSummary(actions: TaggedActionEntity[]) {
    const stats = this.buildStats(actions);

    return {
      positives: stats.positive,
      negatives: stats.negative,
      positivePercentage: this.calculatePercentage(
        stats.positive,
        stats.positive + stats.negative,
      ),
      negativePercentage: this.calculatePercentage(
        stats.negative,
        stats.positive + stats.negative,
      ),
    };
  }

  private buildStats(actions: TaggedActionEntity[]) {
    const positive = actions.filter((action) => this.isPositive(action)).length;
    const negative = actions.filter(
      (action) => action.acaoCatalogo?.impactoId === NEGATIVE_IMPACT_ID,
    ).length;
    const total = actions.length;

    return {
      positive,
      negative,
      neutral: total - positive - negative,
      total,
    };
  }

  private toViewAction(action: TaggedActionEntity): SessionViewActionDto {
    if (!action.acaoCatalogo || !action.acaoCatalogo.categoriaAcao) {
      throw new Error('Relações da acao taggeada nao foram carregadas');
    }

    return {
      id: action.id,
      title: action.acaoCatalogo.nome,
      category: {
        code: action.acaoCatalogo.sigla,
        label: action.acaoCatalogo.sigla,
      },
      time: this.formatTimestamp(action.timestampSegundos),
      outcome: this.getOutcome(action),
    };
  }

  private countOffensiveActions(actions: TaggedActionEntity[]) {
    return this.countByCategory(actions, ['ofens', 'gols em quadra']);
  }

  private countDefensiveActions(actions: TaggedActionEntity[]) {
    return this.countByCategory(actions, ['defens', 'gols tomados']);
  }

  private countByCategory(actions: TaggedActionEntity[], needles: string[]) {
    return actions.filter((action) =>
      needles.some((needle) =>
        action.acaoCatalogo?.categoriaAcao?.nome
          .toLocaleLowerCase()
          .includes(needle),
      ),
    ).length;
  }

  private isPositive(action: TaggedActionEntity) {
    return action.acaoCatalogo?.impactoId === POSITIVE_IMPACT_ID;
  }

  private applyViewFilters(
    actions: TaggedActionEntity[],
    filters: SessionViewFiltersDto,
    shouldFilterPlayer: boolean,
  ) {
    return actions.filter((action) => {
      const matchesOutcome =
        !filters.outcome || filters.outcome === this.getOutcome(action);
      const matchesPlayer =
        !shouldFilterPlayer ||
        !filters.playerId ||
        action.jogadorId === filters.playerId ||
        action.jogador?.id === filters.playerId;
      const matchesCategory =
        !filters.categoryCode ||
        action.acaoCatalogo?.sigla === filters.categoryCode;
      const matchesPhase =
        shouldFilterPlayer ||
        !filters.phaseKey ||
        action.acaoCatalogo?.categoriaAcao?.chave === filters.phaseKey;

      return matchesOutcome && matchesPlayer && matchesCategory && matchesPhase;
    });
  }

  private buildFilterOptions(actions: TaggedActionEntity[]) {
    const athletes = new Map<string, string>();
    const categories = new Map<string, string>();

    actions.forEach((action) => {
      if (action.jogador) athletes.set(action.jogador.id, action.jogador.nome);
      if (action.acaoCatalogo) {
        categories.set(action.acaoCatalogo.sigla, action.acaoCatalogo.sigla);
      }
    });

    return {
      athletes: Array.from(athletes.entries()).map(([value, label]) => ({
        value,
        label,
      })),
      categories: Array.from(categories.entries()).map(([value, label]) => ({
        value,
        label,
      })),
    };
  }

  private calculatePercentage(value: number, total: number) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  private getOutcome(action: TaggedActionEntity) {
    if (this.isPositive(action)) return 'positive' as const;
    if (action.acaoCatalogo?.impactoId === NEGATIVE_IMPACT_ID) {
      return 'negative' as const;
    }
    return 'neutral' as const;
  }

  private formatTimestamp(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`;
  }
}
