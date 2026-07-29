import type { PlayerIndexesResponseDto } from './player-response.dto';

export type PlayerIndexKey = keyof PlayerIndexesResponseDto;

export type PlayerRankingKey = PlayerIndexKey | 'overall';

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
