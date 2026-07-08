import { PlayerResponseDto } from './player-response.dto';

export class PlayerListResponseDto {
  data!: PlayerResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
