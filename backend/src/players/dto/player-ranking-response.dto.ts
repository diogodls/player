import type { PlayerIndexesResponseDto } from './player-response.dto';

export type PlayerIndexKey = keyof PlayerIndexesResponseDto;

export type PlayerIndexSortDirection = 'ASC' | 'DESC';

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
    key: PlayerIndexKey;
    name: string;
    sortDirection: PlayerIndexSortDirection;
  };
  ranking!: PlayerRankingItemDto[];
}
