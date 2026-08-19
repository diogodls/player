import type { PlayerIndexesDto } from './player-performance.dto';

export type PlayerIndexKey = keyof PlayerIndexesDto;

export type PlayerRankingKey = PlayerIndexKey | 'overall' | 'rating';

export type PlayerIndexSortDirection = 'ASC' | 'DESC';

export class PlayerRankingOptionDto {
  key!: PlayerRankingKey;
  name!: string;
  sortDirection!: PlayerIndexSortDirection;
}

export class PlayerRankingItemDto {
  position!: number;
  player!: {
    id: string;
    name: string;
    position: string;
  };
  value!: number | null;
}

export class PlayerRankingResponseDto {
  index!: {
    key: PlayerRankingKey;
    name: string;
    sortDirection: PlayerIndexSortDirection;
  };
  ranking!: PlayerRankingItemDto[];
}
