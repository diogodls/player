import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import {
  PlayerEntity,
  SessionEntity,
  TaggedActionEntity,
  TeamEntity,
} from '../entities';
import type { PlayerRankingResponseDto } from '../players/dto/player-ranking-response.dto';
import { calculateSessionPlayerPerformances } from '../players/player-statistics.service';
import {
  countActionsByCategoryKeys,
  isPerformanceAction,
  PLAYER_ACTION_CATEGORY_KEYS,
} from '../players/player-performance-actions';
import { PlayersService } from '../players/players.service';
import { SESSION_TYPES } from './sessions.constants';
import { SessionFiltersDto } from './dto/session-filters.dto';
import { SessionComparisonFiltersDto } from './dto/session-comparison-filters.dto';
import {
  SessionComparisonAthleteDto,
  SessionComparisonResponseDto,
} from './dto/session-comparison-response.dto';
import { SessionListResponseDto } from './dto/session-list-response.dto';
import { SessionDto } from './dto/session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
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
    private readonly playersService: PlayersService,
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

  async compare(
    filters: SessionComparisonFiltersDto,
  ): Promise<SessionComparisonResponseDto> {
    const startDate = new Date(`${filters.startDate}T00:00:00.000Z`);
    const endDate = new Date(`${filters.endDate}T00:00:00.000Z`);

    if (startDate >= endDate) {
      throw new BadRequestException(
        'Data inicial deve ser anterior a data final',
      );
    }

    const sessions = await this.sessionsRepository.find({
      where: {
        data: Between(startDate, endDate),
        ...(filters.typeId ? { sessionTypeId: filters.typeId } : {}),
      },
      relations: {
        sessionType: true,
      },
      order: {
        data: 'ASC',
        createdAt: 'ASC',
        id: 'ASC',
      },
    });

    const comparisonSessions = sessions.map((session) => {
      if (!session.sessionType) {
        throw new Error('Tipo da sessao nao foi carregado');
      }

      const description = session.descricao ?? null;
      return {
        id: session.id,
        date: this.formatDate(session.data),
        type: session.sessionType.nome,
        description,
        opponent:
          session.sessionTypeId === SESSION_TYPES.Jogo ? description : null,
      };
    });

    if (sessions.length === 0) {
      return {
        period: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          typeId: filters.typeId ?? null,
        },
        sessions: [],
        athletes: [],
      };
    }

    const actions = await this.taggedActionsRepository.find({
      where: {
        sessaoId: In(sessions.map((session) => session.id)),
        jogadorId: Not(IsNull()),
      },
      relations: {
        acaoCatalogo: {
          categoriaAcao: true,
          impacto: true,
        },
        jogador: {
          posicao: true,
        },
      },
      order: {
        sessaoId: 'ASC',
        timestampSegundos: 'ASC',
      },
    });

    return {
      period: {
        startDate: filters.startDate,
        endDate: filters.endDate,
        typeId: filters.typeId ?? null,
      },
      sessions: comparisonSessions,
      athletes: this.buildComparisonAthletes(
        actions,
        sessions.map((session) => session.id),
      ),
    };
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

  async update(id: string, dto: UpdateSessionDto): Promise<SessionResponseDto> {
    if (dto.id !== id) {
      throw new BadRequestException(
        'Id da sessão deve ser igual ao identificador da rota',
      );
    }

    await this.findEntity(id);
    await this.sessionsRepository.update(id, {
      ...(dto.typeId !== undefined ? { sessionTypeId: dto.typeId } : {}),
      ...(dto.locationId !== undefined
        ? { sessionLocationId: dto.locationId }
        : {}),
      ...(dto.courtSizeId !== undefined
        ? { sessionCourtSizeId: dto.courtSizeId }
        : {}),
      ...(dto.date !== undefined ? { data: new Date(dto.date) } : {}),
      ...(dto.description !== undefined ? { descricao: dto.description } : {}),
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
    const performanceActions = actions.filter(isPerformanceAction);
    const positive = performanceActions.filter((action) =>
      this.isPositive(action),
    ).length;
    const negative = performanceActions.filter(
      (action) => action.acaoCatalogo?.impactoId === NEGATIVE_IMPACT_ID,
    ).length;
    const total = performanceActions.length;

    return {
      positive,
      negative,
      neutral: total - positive - negative,
      total,
    };
  }

  private buildComparisonAthletes(
    actions: TaggedActionEntity[],
    orderedSessionIds: string[],
  ): SessionComparisonAthleteDto[] {
    const actionsBySession = new Map<string, TaggedActionEntity[]>();
    actions.forEach((action) => {
      const sessionActions = actionsBySession.get(action.sessaoId) ?? [];
      sessionActions.push(action);
      actionsBySession.set(action.sessaoId, sessionActions);
    });
    const indexesBySession = new Map(
      orderedSessionIds.map((sessionId) => [
        sessionId,
        calculateSessionPlayerPerformances(
          actionsBySession.get(sessionId) ?? [],
        ),
      ]),
    );

    const grouped = new Map<
      string,
      {
        athlete: SessionComparisonAthleteDto;
        actionsBySession: Map<string, TaggedActionEntity[]>;
      }
    >();

    actions.forEach((action) => {
      if (!action.jogador) return;
      if (!action.jogador.posicao) {
        throw new Error('Posicao do jogador nao foi carregada');
      }

      const current = grouped.get(action.jogador.id) ?? {
        athlete: {
          id: action.jogador.id,
          name: action.jogador.nome,
          position: action.jogador.posicao.nome,
          points: [],
        },
        actionsBySession: new Map<string, TaggedActionEntity[]>(),
      };
      const sessionActions =
        current.actionsBySession.get(action.sessaoId) ?? [];
      sessionActions.push(action);
      current.actionsBySession.set(action.sessaoId, sessionActions);
      grouped.set(action.jogador.id, current);
    });

    return Array.from(grouped.values())
      .map(({ athlete, actionsBySession }) => ({
        ...athlete,
        points: orderedSessionIds.flatMap((sessionId) => {
          const sessionActions = actionsBySession.get(sessionId);
          if (!sessionActions) return [];
          const performance = indexesBySession.get(sessionId)?.get(athlete.id);
          if (!performance) {
            throw new Error(
              'Indices do jogador nao foram calculados para a sessao',
            );
          }

          const stats = this.buildStats(sessionActions);
          return [
            {
              sessionId,
              metrics: {
                positiveActions: stats.positive,
                negativeActions: stats.negative,
                offensiveActions: this.countOffensiveActions(sessionActions),
                defensiveActions: this.countDefensiveActions(sessionActions),
                totalActions: stats.total,
                performancePercentage: this.calculatePercentage(
                  stats.positive,
                  stats.total,
                ),
              },
              indexes: performance.indexes,
            },
          ];
        }),
      }))
      .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
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
    return countActionsByCategoryKeys(
      actions,
      PLAYER_ACTION_CATEGORY_KEYS.offensive,
    );
  }

  private countDefensiveActions(actions: TaggedActionEntity[]) {
    return countActionsByCategoryKeys(
      actions,
      PLAYER_ACTION_CATEGORY_KEYS.defensive,
    );
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
