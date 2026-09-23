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
  PlayerSessionMinutesEntity,
  SessionEntity,
  TaggedActionEntity,
  TeamEntity,
  CatalogActionEntity,
  TeamActionContextEntity,
} from '../entities';
import type { PlayerRankingResponseDto } from '../players/dto/player-ranking-response.dto';
import { calculateSessionPlayerPerformances } from '../players/player-statistics.service';
import {
  countActionsByCategoryKeys,
  isPerformanceAction,
  PLAYER_ACTION_CATEGORY_KEYS,
} from '../players/player-performance-actions';
import { PlayersService } from '../players/players.service';
import {
  INDIVIDUAL_ANALYSIS_TYPE_ID,
  TEAM_ANALYSIS_TYPE_ID,
} from '../catalog/catalog.constants';
import {
  classifyTeamCatalogV2Action,
  getTeamCatalogV2Title,
  isTeamCatalogV2CategoryKey,
} from '../catalog/team-catalog-v2.constants';
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

export type SessionComparisonCsvKind = 'players' | 'team';

type CsvMeasure = {
  key: string;
  action: CatalogActionEntity;
  context?: TeamActionContextEntity | null;
};

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
    @InjectRepository(PlayerSessionMinutesEntity)
    private readonly playerSessionMinutesRepository?: Repository<PlayerSessionMinutesEntity>,
  ) {}

  async findAll(
    equipeIdOrFilters?: string | SessionFiltersDto,
    maybeFilters?: SessionFiltersDto,
  ): Promise<SessionListResponseDto> {
    const equipeId =
      typeof equipeIdOrFilters === 'string' ? equipeIdOrFilters : undefined;
    const filters =
      typeof equipeIdOrFilters === 'string' ? maybeFilters : equipeIdOrFilters;
    const limit = filters?.limit ?? 5;
    const where: FindOptionsWhere<SessionEntity> = {
      ...(equipeId ? { equipeId, deletedAt: IsNull() } : {}),
      ...(filters?.typeId ? { sessionTypeId: filters.typeId } : {}),
      ...(filters?.locationId ? { sessionLocationId: filters.locationId } : {}),
      ...(filters?.date ? { data: filters.date } : {}),
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

  async findOne(
    equipeIdOrId: string,
    maybeId?: string,
  ): Promise<SessionResponseDto> {
    const equipeId = maybeId ? equipeIdOrId : undefined;
    const id = maybeId ?? equipeIdOrId;
    return this.toResponse(await this.findEntity(equipeId, id));
  }

  async compare(
    equipeIdOrFilters: string | SessionComparisonFiltersDto,
    maybeFilters?: SessionComparisonFiltersDto,
  ): Promise<SessionComparisonResponseDto> {
    const equipeId =
      typeof equipeIdOrFilters === 'string' ? equipeIdOrFilters : undefined;
    const filters =
      typeof equipeIdOrFilters === 'string' ? maybeFilters : equipeIdOrFilters;
    if (!filters) throw new BadRequestException('Filtros não informados');
    this.validateComparisonFilters(filters);

    const availableSessions = await this.findComparisonSessions(
      equipeId,
      filters,
      false,
    );
    const sessions = this.filterSelectedSessions(availableSessions, filters);
    const comparisonSessions = sessions.map((session) =>
      this.toComparisonSession(session),
    );
    const availableComparisonSessions = availableSessions.map((session) =>
      this.toComparisonSession(session),
    );

    if (sessions.length === 0) {
      return {
        period: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          typeId: filters.typeId ?? null,
        },
        sessions: [],
        availableSessions: availableComparisonSessions,
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
    const minutesRecords = await this
      .getPlayerSessionMinutesRepository()
      .find({
        where: {
          sessionId: In(sessions.map((session) => session.id)),
          player: { deletedAt: IsNull() },
        },
      });

    return {
      period: {
        startDate: filters.startDate,
        endDate: filters.endDate,
        typeId: filters.typeId ?? null,
      },
      sessions: comparisonSessions,
      availableSessions: availableComparisonSessions,
      athletes: this.buildComparisonAthletes(
        actions,
        sessions.map((session) => session.id),
        minutesRecords,
      ),
    };
  }

  async exportComparisonCsv(
    equipeId: string,
    filters: SessionComparisonFiltersDto,
    kind: SessionComparisonCsvKind,
  ): Promise<string> {
    this.validateComparisonFilters(filters);
    const sessions = await this.findComparisonSessions(equipeId, filters);

    if (kind === 'players') {
      return this.buildPlayersComparisonCsv(sessions);
    }

    return this.buildTeamComparisonCsv(sessions);
  }

  async findRanking(
    equipeIdOrId: string,
    idOrIndexKey: string,
    maybeIndexKey?: string,
  ): Promise<PlayerRankingResponseDto> {
    const equipeId = maybeIndexKey ? equipeIdOrId : undefined;
    const id = maybeIndexKey ? idOrIndexKey : equipeIdOrId;
    const indexKey = maybeIndexKey ?? idOrIndexKey;
    await this.findEntity(equipeId, id);
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
    equipeIdOrId: string,
    idOrFilters?: string | SessionViewFiltersDto,
    maybeFilters: SessionViewFiltersDto = {},
  ): Promise<SessionViewResponseDto> {
    const equipeId = typeof idOrFilters === 'string' ? equipeIdOrId : undefined;
    const id = typeof idOrFilters === 'string' ? idOrFilters : equipeIdOrId;
    const filters =
      typeof idOrFilters === 'string' ? maybeFilters : (idOrFilters ?? {});
    const session = await this.findEntity(equipeId, id);
    const actions = await this.taggedActionsRepository.find({
      where: { sessaoId: id },
      relations: {
        acaoCatalogo: {
          categoriaAcao: true,
          impacto: true,
        },
        jogador: true,
        contextoAcaoEquipe: true,
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
    equipeIdOrId: string,
    maybeId?: string,
  ): Promise<Record<'individual' | 'team', SessionViewFilterOptionsDto>> {
    const equipeId = maybeId ? equipeIdOrId : undefined;
    const id = maybeId ?? equipeIdOrId;
    await this.findEntity(equipeId, id);
    const actions = await this.taggedActionsRepository.find({
      where: { sessaoId: id },
      relations: {
        acaoCatalogo: {
          categoriaAcao: true,
          impacto: true,
        },
        jogador: true,
        contextoAcaoEquipe: true,
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

  async create(
    equipeIdOrDto: string | SessionDto,
    maybeDto?: SessionDto,
  ): Promise<SessionResponseDto> {
    const equipeId =
      typeof equipeIdOrDto === 'string' ? equipeIdOrDto : undefined;
    const dto = typeof equipeIdOrDto === 'string' ? maybeDto : equipeIdOrDto;
    if (!dto) throw new BadRequestException('Dados da sessão não informados');
    if (dto.id !== null) {
      throw new BadRequestException('Id deve ser nulo ao criar uma sessão');
    }

    const team = await this.findTeam(equipeId);
    const session = this.sessionsRepository.create({
      equipeId: team.id,
      sessionTypeId: dto.typeId,
      sessionLocationId: dto.locationId,
      sessionCourtSizeId: dto.courtSizeId,
      data: dto.date,
      descricao: dto.description ?? null,
    });

    const savedSession = await this.sessionsRepository.save(session);
    return equipeId
      ? this.findOne(equipeId, savedSession.id)
      : this.findOne(savedSession.id);
  }

  async update(
    equipeIdOrId: string,
    idOrDto: string | UpdateSessionDto,
    maybeDto?: UpdateSessionDto,
  ): Promise<SessionResponseDto> {
    const equipeId = maybeDto ? equipeIdOrId : undefined;
    const id = maybeDto ? (idOrDto as string) : equipeIdOrId;
    const dto = maybeDto ?? (idOrDto as UpdateSessionDto);
    if (dto.id !== id) {
      throw new BadRequestException(
        'Id da sessão deve ser igual ao identificador da rota',
      );
    }

    await this.findEntity(equipeId, id);
    const changes = {
      ...(dto.typeId !== undefined ? { sessionTypeId: dto.typeId } : {}),
      ...(dto.locationId !== undefined
        ? { sessionLocationId: dto.locationId }
        : {}),
      ...(dto.courtSizeId !== undefined
        ? { sessionCourtSizeId: dto.courtSizeId }
        : {}),
      ...(dto.date !== undefined ? { data: dto.date } : {}),
      ...(dto.description !== undefined ? { descricao: dto.description } : {}),
    };
    await this.sessionsRepository.update(
      equipeId ? { id, equipeId } : id,
      changes,
    );
    return equipeId ? this.findOne(equipeId, id) : this.findOne(id);
  }

  async remove(equipeIdOrId: string, maybeId?: string): Promise<void> {
    const equipeId = maybeId ? equipeIdOrId : undefined;
    const id = maybeId ?? equipeIdOrId;
    await this.sessionsRepository.softRemove(
      await this.findEntity(equipeId, id),
    );
  }

  private validateComparisonFilters(filters: SessionComparisonFiltersDto) {
    if (!filters) throw new BadRequestException('Filtros não informados');
    if (filters.startDate > filters.endDate) {
      throw new BadRequestException(
        'Data inicial deve ser igual ou anterior a data final',
      );
    }
  }

  private getPlayerSessionMinutesRepository() {
    if (!this.playerSessionMinutesRepository) {
      throw new Error('Repositorio de minutagem nao foi carregado');
    }

    return this.playerSessionMinutesRepository;
  }

  private findComparisonSessions(
    equipeId: string | undefined,
    filters: SessionComparisonFiltersDto,
    shouldApplySelection = true,
  ) {
    return this.sessionsRepository.find({
      where: {
        ...(equipeId ? { equipeId, deletedAt: IsNull() } : {}),
        data: Between(filters.startDate, filters.endDate),
        ...(filters.typeId ? { sessionTypeId: filters.typeId } : {}),
        ...(shouldApplySelection && filters.sessionIds?.length
          ? { id: In(filters.sessionIds) }
          : {}),
      },
      relations: {
        equipe: true,
        sessionType: true,
        sessionLocation: true,
        sessionCourtSize: true,
      },
      order: {
        data: 'ASC',
        createdAt: 'ASC',
        id: 'ASC',
      },
    });
  }

  private filterSelectedSessions(
    sessions: SessionEntity[],
    filters: SessionComparisonFiltersDto,
  ) {
    if (!filters.sessionIds?.length) return sessions;
    const selectedIds = new Set(filters.sessionIds);
    return sessions.filter((session) => selectedIds.has(session.id));
  }

  private toComparisonSession(session: SessionEntity) {
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
  }

  private async buildPlayersComparisonCsv(
    sessions: SessionEntity[],
  ): Promise<string> {
    const catalogActions = await this.findCatalogActions(
      INDIVIDUAL_ANALYSIS_TYPE_ID,
    );
    const columns = this.buildCatalogActionColumns(catalogActions);
    const sessionIds = sessions.map((session) => session.id);
    const actions = sessionIds.length
      ? await this.taggedActionsRepository.find({
          where: {
            sessaoId: In(sessionIds),
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
        })
      : [];
    const minutesRecords = sessionIds.length
      ? await this.getPlayerSessionMinutesRepository().find({
          where: {
            sessionId: In(sessionIds),
            player: { deletedAt: IsNull() },
          },
          relations: {
            player: {
              posicao: true,
            },
          },
        })
      : [];
    const rowsByKey = new Map<
      string,
      {
        session: SessionEntity;
        player: PlayerEntity;
        minutes: number;
        actions: TaggedActionEntity[];
      }
    >();

    const ensureRow = (sessionId: string, player: PlayerEntity) => {
      const session = sessions.find((item) => item.id === sessionId);
      if (!session) throw new Error('Sessao da exportacao nao encontrada');
      const key = `${sessionId}:${player.id}`;
      const current = rowsByKey.get(key);
      if (current) return current;

      const next = { session, player, minutes: 0, actions: [] };
      rowsByKey.set(key, next);
      return next;
    };

    minutesRecords.forEach((record) => {
      if (!record.player) return;
      ensureRow(record.sessionId, record.player).minutes =
        record.totalSeconds / 60;
    });

    actions.forEach((action) => {
      if (!action.jogador || action.jogador.deletedAt) return;
      ensureRow(action.sessaoId, action.jogador).actions.push(action);
    });

    const headers = [
      'session_id',
      'session_date',
      'session_type',
      'session_location',
      'court_size',
      'session_description',
      'player_id',
      'player_name',
      'position',
      'minutes',
      'total_actions',
      'positive_actions',
      'negative_actions',
      'performance_percentage',
      ...columns.map((column) => column.key),
    ];
    const rows = Array.from(rowsByKey.values())
      .sort((left, right) =>
        left.session.data.localeCompare(right.session.data) ||
        left.player.nome.localeCompare(right.player.nome, 'pt-BR'),
      )
      .map(({ session, player, minutes, actions: rowActions }) => {
        const stats = this.buildStats(rowActions);
        const actionsByCatalogId = this.countByCatalogAction(rowActions);

        return [
          session.id,
          this.formatDate(session.data),
          session.sessionType?.nome ?? '',
          session.sessionLocation?.nome ?? '',
          session.sessionCourtSize?.nome ?? '',
          session.descricao ?? '',
          player.id,
          player.nome,
          player.posicao?.nome ?? '',
          this.formatDecimal(minutes),
          rowActions.length,
          stats.positive,
          stats.negative,
          this.calculatePercentage(stats.positive, stats.total),
          ...columns.map(
            (column) => actionsByCatalogId.get(column.action.id) ?? 0,
          ),
        ];
      });

    return this.toCsv(headers, rows);
  }

  private async buildTeamComparisonCsv(
    sessions: SessionEntity[],
  ): Promise<string> {
    const measures = await this.findTeamCsvMeasures();
    const sessionIds = sessions.map((session) => session.id);
    const actions = sessionIds.length
      ? await this.taggedActionsRepository.find({
          where: {
            sessaoId: In(sessionIds),
            jogadorId: IsNull(),
          },
          relations: {
            acaoCatalogo: {
              categoriaAcao: true,
              impacto: true,
            },
            contextoAcaoEquipe: true,
          },
          order: {
            sessaoId: 'ASC',
            timestampSegundos: 'ASC',
          },
        })
      : [];
    const actionsBySession = new Map<string, TaggedActionEntity[]>();
    actions.forEach((action) => {
      const current = actionsBySession.get(action.sessaoId) ?? [];
      current.push(action);
      actionsBySession.set(action.sessaoId, current);
    });

    const headers = [
      'session_id',
      'session_date',
      'session_type',
      'session_location',
      'court_size',
      'session_description',
      'total_actions',
      'positive_actions',
      'negative_actions',
      'performance_percentage',
      ...measures.map((measure) => measure.key),
    ];
    const rows = sessions.map((session) => {
      const sessionActions = actionsBySession.get(session.id) ?? [];
      const stats = this.buildStats(sessionActions);
      const counts = this.countByTeamMeasure(sessionActions);

      return [
        session.id,
        this.formatDate(session.data),
        session.sessionType?.nome ?? '',
        session.sessionLocation?.nome ?? '',
        session.sessionCourtSize?.nome ?? '',
        session.descricao ?? '',
        stats.total,
        stats.positive,
        stats.negative,
        this.calculatePercentage(stats.positive, stats.total),
        ...measures.map((measure) => counts.get(measure.key) ?? 0),
      ];
    });

    return this.toCsv(headers, rows);
  }

  private async findCatalogActions(analysisTypeId: number) {
    const repository =
      this.taggedActionsRepository.manager.getRepository(CatalogActionEntity);
    return repository.find({
      where: {
        deletedAt: IsNull(),
        categoriaAcao: {
          tipoAnaliseId: analysisTypeId,
          deletedAt: IsNull(),
        },
      },
      relations: {
        categoriaAcao: true,
        impacto: true,
      },
      order: {
        categoriaAcao: {
          ordem: 'ASC',
          nome: 'ASC',
        },
        ordem: 'ASC',
        nome: 'ASC',
      },
    });
  }

  private async findTeamCsvMeasures(): Promise<CsvMeasure[]> {
    const catalogActions = await this.findCatalogActions(TEAM_ANALYSIS_TYPE_ID);
    const contextsRepository =
      this.taggedActionsRepository.manager.getRepository(
        TeamActionContextEntity,
      );
    const contexts = await contextsRepository.find({
      where: {
        categoriaAcao: {
          tipoAnaliseId: TEAM_ANALYSIS_TYPE_ID,
          deletedAt: IsNull(),
        },
      },
      relations: {
        categoriaAcao: true,
      },
      order: {
        categoriaAcao: {
          ordem: 'ASC',
          nome: 'ASC',
        },
        ordem: 'ASC',
        nome: 'ASC',
      },
    });
    const contextsByCategory = new Map<string, TeamActionContextEntity[]>();
    contexts.forEach((context) => {
      const current = contextsByCategory.get(context.categoriaAcaoId) ?? [];
      current.push(context);
      contextsByCategory.set(context.categoriaAcaoId, current);
    });

    return catalogActions.flatMap<CsvMeasure>((action) => {
      const categoryKey = action.categoriaAcao?.chave;
      if (!isTeamCatalogV2CategoryKey(categoryKey)) {
        return [
          {
            key: this.buildTeamMeasureKey(action, null),
            action,
            context: null,
          },
        ];
      }

      return (contextsByCategory.get(action.categoriaAcaoId) ?? []).map(
        (context) => ({
          key: this.buildTeamMeasureKey(action, context),
          action,
          context,
        }),
      );
    });
  }

  private buildCatalogActionColumns(actions: CatalogActionEntity[]) {
    const keyCounts = new Map<string, number>();
    const baseKeys = actions.map((action) =>
      this.normalizeCsvColumnName(action.sigla || action.nome),
    );
    baseKeys.forEach((key) => keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1));

    return actions.map((action, index) => {
      const baseKey = baseKeys[index];
      const key =
        (keyCounts.get(baseKey) ?? 0) > 1
          ? `${this.normalizeCsvColumnName(
              action.categoriaAcao?.chave ??
                action.categoriaAcao?.nome ??
                'acao',
            )}_${baseKey}`
          : baseKey;

      return { key, action };
    });
  }

  private countByCatalogAction(actions: TaggedActionEntity[]) {
    const counts = new Map<string, number>();
    actions.forEach((action) => {
      counts.set(
        action.acaoCatalogoId,
        (counts.get(action.acaoCatalogoId) ?? 0) + 1,
      );
    });
    return counts;
  }

  private countByTeamMeasure(actions: TaggedActionEntity[]) {
    const counts = new Map<string, number>();
    actions.forEach((action) => {
      if (!action.acaoCatalogo) return;
      const key = this.buildTeamMeasureKey(
        action.acaoCatalogo,
        action.contextoAcaoEquipe ?? null,
      );
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }

  private buildTeamMeasureKey(
    action: CatalogActionEntity,
    context: TeamActionContextEntity | null,
  ) {
    const categoryKey = action.categoriaAcao?.chave;
    const prefix = isTeamCatalogV2CategoryKey(categoryKey)
      ? (context?.chave ?? categoryKey ?? action.categoriaAcao?.nome ?? 'equipe')
      : (categoryKey ?? action.categoriaAcao?.nome ?? 'equipe');

    return `${this.normalizeCsvColumnName(prefix)}_${this.normalizeCsvColumnName(
      action.sigla || action.nome,
    )}`;
  }

  private normalizeCsvColumnName(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase();
  }

  private formatDecimal(value: number) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  private toCsv(headers: string[], rows: Array<Array<string | number>>) {
    return [headers, ...rows]
      .map((row) => row.map((value) => this.escapeCsv(value)).join(','))
      .join('\n');
  }

  private escapeCsv(value: string | number) {
    const text = String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  private async findEntity(
    equipeId: string | undefined,
    id: string,
  ): Promise<SessionEntity> {
    const session = await this.sessionsRepository.findOne({
      where: {
        id,
        ...(equipeId ? { equipeId, deletedAt: IsNull() } : {}),
      },
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

  private async findTeam(equipeId?: string): Promise<TeamEntity> {
    const [team] = await this.teamsRepository.find({
      ...(equipeId ? { where: { id: equipeId } } : {}),
      take: 1,
    });

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

  private formatDate(date: string): string {
    return date.slice(0, 10);
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
    minutesRecords: PlayerSessionMinutesEntity[],
  ): SessionComparisonAthleteDto[] {
    const actionsBySession = new Map<string, TaggedActionEntity[]>();
    actions.forEach((action) => {
      const sessionActions = actionsBySession.get(action.sessaoId) ?? [];
      sessionActions.push(action);
      actionsBySession.set(action.sessaoId, sessionActions);
    });
    const minutesBySession = new Map<
      string,
      Array<{ playerId: string; sessionId: string; totalSeconds: number }>
    >();
    minutesRecords.forEach((record) => {
      const sessionMinutes = minutesBySession.get(record.sessionId) ?? [];
      sessionMinutes.push({
        playerId: record.playerId,
        sessionId: record.sessionId,
        totalSeconds: record.totalSeconds,
      });
      minutesBySession.set(record.sessionId, sessionMinutes);
    });
    const indexesBySession = new Map(
      orderedSessionIds.map((sessionId) => [
        sessionId,
        calculateSessionPlayerPerformances(
          actionsBySession.get(sessionId) ?? [],
          minutesBySession.get(sessionId) ?? [],
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

    const catalogAction = action.acaoCatalogo;
    const category = catalogAction.categoriaAcao;
    if (!category) {
      throw new Error('Categoria da acao taggeada nao foi carregada');
    }
    const context = action.contextoAcaoEquipe ?? null;

    return {
      id: action.id,
      catalogActionId: catalogAction.id,
      actionKey: catalogAction.sigla,
      actionName: catalogAction.nome,
      groupKey: category.chave ?? '',
      groupName: getTeamCatalogV2Title(category.chave ?? '') ?? category.nome,
      impact: this.getImpact(action),
      teamContextId: action.contextoAcaoEquipeId ?? null,
      contextKey: context?.chave ?? null,
      contextName: context?.nome ?? null,
      timestampSeconds: action.timestampSegundos,
      title: catalogAction.nome,
      category: {
        code: catalogAction.sigla,
        label: catalogAction.sigla,
      },
      time: this.formatTimestamp(action.timestampSegundos),
      outcome: this.getOutcome(action),
    };
  }

  private countOffensiveActions(actions: TaggedActionEntity[]) {
    const legacyAndIndividualCount = countActionsByCategoryKeys(
      actions,
      PLAYER_ACTION_CATEGORY_KEYS.offensive,
    );
    return (
      legacyAndIndividualCount +
      actions.filter((action) => this.getTeamV2Phase(action) === 'offensive')
        .length
    );
  }

  private countDefensiveActions(actions: TaggedActionEntity[]) {
    const legacyAndIndividualCount = countActionsByCategoryKeys(
      actions,
      PLAYER_ACTION_CATEGORY_KEYS.defensive,
    );
    return (
      legacyAndIndividualCount +
      actions.filter((action) => this.getTeamV2Phase(action) === 'defensive')
        .length
    );
  }

  private getTeamV2Phase(action: TaggedActionEntity) {
    return classifyTeamCatalogV2Action(
      action.acaoCatalogo?.categoriaAcao?.chave,
      action.contextoAcaoEquipe?.chave,
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
        this.getViewPhaseKey(action) === filters.phaseKey;

      return matchesOutcome && matchesPlayer && matchesCategory && matchesPhase;
    });
  }

  private buildFilterOptions(actions: TaggedActionEntity[]) {
    const athletes = new Map<string, string>();
    const categories = new Map<string, { label: string; order: number }>();
    const phases = new Map<string, { label: string; order: number }>();
    const outcomes = new Set(actions.map((action) => this.getOutcome(action)));

    actions.forEach((action) => {
      if (action.jogador) athletes.set(action.jogador.id, action.jogador.nome);
      if (action.acaoCatalogo) {
        const catalogAction = action.acaoCatalogo;
        const isV2 = isTeamCatalogV2CategoryKey(
          catalogAction.categoriaAcao?.chave,
        );
        categories.set(catalogAction.sigla, {
          label: isV2 ? catalogAction.nome : catalogAction.sigla,
          order: catalogAction.ordem ?? Number.MAX_SAFE_INTEGER,
        });
        if (action.jogadorId === null) {
          const phaseKey = this.getViewPhaseKey(action);
          const phaseLabel = isV2
            ? action.contextoAcaoEquipe?.nome
            : catalogAction.categoriaAcao?.nome;
          const phaseOrder = isV2
            ? action.contextoAcaoEquipe?.ordem
            : catalogAction.categoriaAcao?.ordem;
          if (phaseKey && phaseLabel) {
            phases.set(phaseKey, {
              label: phaseLabel,
              order: phaseOrder ?? Number.MAX_SAFE_INTEGER,
            });
          }
        }
      }
    });

    const outcomeLabels = {
      positive: 'Positivas',
      negative: 'Negativas',
      neutral: 'Neutras',
    } as const;
    const outcomeOrder = ['positive', 'negative', 'neutral'] as const;

    return {
      athletes: Array.from(athletes.entries())
        .map(([value, label]) => ({ value, label }))
        .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR')),
      categories: Array.from(categories.entries())
        .map(([value, option]) => ({ value, ...option }))
        .sort(
          (left, right) =>
            left.order - right.order ||
            left.label.localeCompare(right.label, 'pt-BR'),
        )
        .map(({ value, label }) => ({ value, label })),
      outcomes: outcomeOrder
        .filter((value) => outcomes.has(value))
        .map((value) => ({ value, label: outcomeLabels[value] })),
      phases: Array.from(phases.entries())
        .map(([value, option]) => ({ value, ...option }))
        .sort(
          (left, right) =>
            left.order - right.order ||
            left.label.localeCompare(right.label, 'pt-BR'),
        )
        .map(({ value, label }) => ({ value, label })),
    };
  }

  private getViewPhaseKey(action: TaggedActionEntity) {
    const categoryKey = action.acaoCatalogo?.categoriaAcao?.chave;
    return isTeamCatalogV2CategoryKey(categoryKey)
      ? (action.contextoAcaoEquipe?.chave ?? null)
      : (categoryKey ?? null);
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

  private getImpact(action: TaggedActionEntity) {
    const outcome = this.getOutcome(action);
    if (outcome === 'positive') return 'POSITIVE' as const;
    if (outcome === 'negative') return 'NEGATIVE' as const;
    return 'NEUTRAL' as const;
  }

  private formatTimestamp(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`;
  }
}
