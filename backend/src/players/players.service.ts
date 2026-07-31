import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Repository } from 'typeorm';
import { PlayerEntity, TeamEntity } from '../entities';
import { PlayerFiltersDto } from './dto/player-filters.dto';
import { PlayerListResponseDto } from './dto/player-list-response.dto';
import { PlayerPerformanceDto } from './dto/player-performance.dto';
import { PlayerDto } from './dto/player.dto';
import type {
  PlayerIndexKey,
  PlayerRankingOptionDto,
  PlayerRankingKey,
  PlayerRankingResponseDto,
} from './dto/player-ranking-response.dto';
import type { PlayerIndexesDto } from './dto/player-performance.dto';
import { PlayerResponseDto } from './dto/player-response.dto';
import {
  emptyPlayerPerformance,
  PlayerStatisticsService,
} from './player-statistics.service';

@Injectable()
export class PlayersService {
  private static readonly INDEX_RANKING_RULES: Record<
    PlayerRankingKey,
    { name: string; sortDirection: 'ASC' | 'DESC' }
  > = {
    overall: { name: 'Ranking Geral', sortDirection: 'DESC' },
    radj: { name: 'Ranking RADJ', sortDirection: 'DESC' },
    goalsRelations: { name: 'Relação de Gols', sortDirection: 'DESC' },
    actionsRelations: {
      name: 'Relação de Ações',
      sortDirection: 'DESC',
    },
    atd: { name: 'Ranking ATD', sortDirection: 'DESC' },
    dto: { name: 'Ranking DTO', sortDirection: 'DESC' },
    pgj: { name: 'Ranking PGJ', sortDirection: 'DESC' },
    ic: { name: 'Ranking IC', sortDirection: 'DESC' },
    tio: { name: 'Ranking TIO', sortDirection: 'DESC' },
    gtj: { name: 'Ranking GTJ', sortDirection: 'ASC' },
    rf: { name: 'Ranking RF', sortDirection: 'DESC' },
    tid: { name: 'Ranking TID', sortDirection: 'DESC' },
  };

  private static readonly PLAYER_INDEX_KEYS = Object.keys(
    emptyPlayerPerformance().indexes,
  ) as PlayerIndexKey[];

  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playersRepository: Repository<PlayerEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamsRepository: Repository<TeamEntity>,
    private readonly playerStatisticsService: PlayerStatisticsService,
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
    const performances =
      players.length > 0
        ? await this.playerStatisticsService.findByTeamId(players[0].equipeId)
        : new Map<string, PlayerPerformanceDto>();

    return {
      data: players.map((player) =>
        this.toResponse(player, performances.get(player.id)),
      ),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<PlayerResponseDto> {
    const player = await this.findEntity(id);
    const performances = await this.playerStatisticsService.findByTeamId(
      player.equipeId,
    );
    return this.toResponse(player, performances.get(player.id));
  }

  findRankingOptions(): PlayerRankingOptionDto[] {
    return (
      Object.entries(PlayersService.INDEX_RANKING_RULES) as Array<
        [
          PlayerRankingKey,
          (typeof PlayersService.INDEX_RANKING_RULES)[PlayerRankingKey],
        ]
      >
    ).map(([key, rule]) => ({ key, ...rule }));
  }

  async findRanking(indexKey: string): Promise<PlayerRankingResponseDto> {
    const rankingKey = indexKey as PlayerRankingKey;
    const rule = PlayersService.INDEX_RANKING_RULES[rankingKey];
    if (!rule) throw new BadRequestException('Índice de ranking inválido');

    const players = await this.findActiveRankingPlayers();
    return this.buildRankingForPlayers(players, rankingKey);
  }

  async buildRankingForPlayers(
    players: PlayerEntity[],
    indexKey: string,
    sessionId?: string,
  ): Promise<PlayerRankingResponseDto> {
    const rankingKey = indexKey as PlayerRankingKey;
    const rule = PlayersService.INDEX_RANKING_RULES[rankingKey];
    if (!rule) throw new BadRequestException('Índice de ranking inválido');

    if (players.length === 0) {
      return { index: { key: rankingKey, ...rule }, ranking: [] };
    }
    const performances = await this.playerStatisticsService.findByTeamId(
      players[0].equipeId,
      sessionId,
    );
    return rankingKey === 'overall'
      ? this.buildOverallRanking(players, performances, rule)
      : this.buildIndexRanking(players, performances, rankingKey, rule);
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

  protected getIndexes(
    playerId: string,
    performances: Map<string, PlayerPerformanceDto>,
  ): PlayerIndexesDto {
    return (performances.get(playerId) ?? emptyPlayerPerformance()).indexes;
  }

  private async findActiveRankingPlayers(): Promise<PlayerEntity[]> {
    const players = await this.playersRepository.find({
      where: { deletedAt: IsNull() },
      relations: { posicao: true },
    });
    return players.filter((player) => player.deletedAt == null);
  }

  private buildIndexRanking(
    players: PlayerEntity[],
    performances: Map<string, PlayerPerformanceDto>,
    indexKey: PlayerIndexKey,
    rule: { name: string; sortDirection: 'ASC' | 'DESC' },
  ): PlayerRankingResponseDto {
    const ranking = players
      .map((player) => ({
        player: this.toRankingPlayer(player),
        value: this.getIndexes(player.id, performances)[indexKey],
      }))
      .sort((left, right) => this.compareRankingItems(left, right, rule));
    return {
      index: { key: indexKey, ...rule },
      ranking: this.assignRankingPositions(ranking),
    };
  }

  private buildOverallRanking(
    players: PlayerEntity[],
    performances: Map<string, PlayerPerformanceDto>,
    rule: { name: string; sortDirection: 'ASC' | 'DESC' },
  ): PlayerRankingResponseDto {
    const playersWithIndexes = players.map((player) => ({
      player: this.toRankingPlayer(player),
      indexes: this.getIndexes(player.id, performances),
    }));
    const ranges = new Map<
      PlayerIndexKey,
      {
        minimum: number;
        maximum: number;
        sortDirection: 'ASC' | 'DESC';
      }
    >();

    for (const indexKey of PlayersService.PLAYER_INDEX_KEYS) {
      const values = playersWithIndexes
        .map(({ indexes }) => indexes[indexKey])
        .filter(this.isValidIndexValue);
      if (values.length === 0) continue;
      ranges.set(indexKey, {
        minimum: Math.min(...values),
        maximum: Math.max(...values),
        sortDirection:
          PlayersService.INDEX_RANKING_RULES[indexKey].sortDirection,
      });
    }

    const ranking = playersWithIndexes
      .map(({ player, indexes }) => {
        const normalizedValues: number[] = [];
        for (const [indexKey, range] of ranges) {
          const value = indexes[indexKey];
          if (!this.isValidIndexValue(value)) continue;
          normalizedValues.push(this.normalizeIndex(value, range));
        }
        if (normalizedValues.length === 0) return null;
        const average =
          normalizedValues.reduce((sum, value) => sum + value, 0) /
          normalizedValues.length;
        return {
          player,
          value: Math.min(99, Math.max(0, Math.round(average))),
        };
      })
      .filter((item) => item !== null)
      .sort((left, right) => this.compareRankingItems(left, right, rule));

    return {
      index: { key: 'overall', ...rule },
      ranking: this.assignRankingPositions(ranking),
    };
  }

  private normalizeIndex(
    value: number,
    range: { minimum: number; maximum: number; sortDirection: 'ASC' | 'DESC' },
  ): number {
    const difference = range.maximum - range.minimum;
    if (difference === 0) return 50;
    const distanceFromWorst =
      range.sortDirection === 'DESC'
        ? value - range.minimum
        : range.maximum - value;
    return Math.min(99, Math.max(0, (99 * distanceFromWorst) / difference));
  }

  private readonly isValidIndexValue = (
    value: number | null | undefined,
  ): value is number => typeof value === 'number' && Number.isFinite(value);

  private toRankingPlayer(player: PlayerEntity) {
    if (!player.posicao)
      throw new Error('Relação de posição do jogador não foi carregada');
    return { id: player.id, name: player.nome, position: player.posicao.nome };
  }

  private compareRankingItems(
    left: { player: { name: string }; value: number | null },
    right: { player: { name: string }; value: number | null },
    rule: { sortDirection: 'ASC' | 'DESC' },
  ): number {
    if (left.value === null) return right.value === null ? 0 : 1;
    if (right.value === null) return -1;
    const valueComparison = left.value - right.value;
    if (valueComparison !== 0)
      return rule.sortDirection === 'ASC' ? valueComparison : -valueComparison;
    return left.player.name.localeCompare(right.player.name, 'pt-BR', {
      sensitivity: 'base',
    });
  }

  private assignRankingPositions<
    T extends {
      player: { id: string; name: string; position: string };
      value: number | null;
    },
  >(items: T[]) {
    let previousValue: number | null | undefined;
    let previousPosition = 0;
    return items.map((item, itemIndex) => {
      const position =
        itemIndex > 0 && item.value === previousValue
          ? previousPosition
          : itemIndex + 1;
      previousValue = item.value;
      previousPosition = position;
      return { position, ...item };
    });
  }
  private async findTeam(): Promise<TeamEntity> {
    const [team] = await this.teamsRepository.find({ take: 1 });

    if (!team) {
      throw new BadRequestException('Equipe não encontrada');
    }

    return team;
  }

  private toResponse(
    player: PlayerEntity,
    performance = emptyPlayerPerformance(),
  ): PlayerResponseDto {
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
      ...performance,
    };
  }
}
