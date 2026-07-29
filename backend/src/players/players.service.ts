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
import { PlayerDto } from './dto/player.dto';
import type {
  PlayerIndexKey,
  PlayerRankingOptionDto,
  PlayerRankingKey,
  PlayerRankingResponseDto,
} from './dto/player-ranking-response.dto';
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
  private static readonly INDEX_RANKING_RULES: Record<
    PlayerRankingKey,
    { name: string; sortDirection: 'ASC' | 'DESC' }
  > = {
    overall: { name: 'Ranking Geral', sortDirection: 'DESC' },
    radj: { name: 'Ranking RADJ', sortDirection: 'DESC' },
    goalsRelations: { name: 'Ranking Goals Relations', sortDirection: 'DESC' },
    actionsRelations: {
      name: 'Ranking Actions Relations',
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
    PlayersService.DEFAULT_TEST_INDEXES,
  ) as PlayerIndexKey[];

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
      indexes: this.getIndexes(player.id),
    };
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
    return rankingKey === 'overall'
      ? this.buildOverallRanking(players, rule)
      : this.buildIndexRanking(players, rankingKey, rule);
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

  protected getIndexes(playerId: string): PlayerIndexesResponseDto {
    return (
      PlayersService.TEST_INDEXES_BY_PLAYER_ID[playerId] ??
      PlayersService.DEFAULT_TEST_INDEXES
    );
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
    indexKey: PlayerIndexKey,
    rule: { name: string; sortDirection: 'ASC' | 'DESC' },
  ): PlayerRankingResponseDto {
    const ranking = players
      .map((player) => ({
        player: this.toRankingPlayer(player),
        value: this.getIndexes(player.id)[indexKey],
      }))
      .sort((left, right) => this.compareRankingItems(left, right, rule));
    return {
      index: { key: indexKey, ...rule },
      ranking: this.assignRankingPositions(ranking),
    };
  }

  private buildOverallRanking(
    players: PlayerEntity[],
    rule: { name: string; sortDirection: 'ASC' | 'DESC' },
  ): PlayerRankingResponseDto {
    const playersWithIndexes = players.map((player) => ({
      player: this.toRankingPlayer(player),
      indexes: this.getIndexes(player.id),
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
