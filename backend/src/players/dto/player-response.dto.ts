import { PlayerPerformanceDto } from './player-performance.dto';

export class PlayerResponseDto extends PlayerPerformanceDto {
  id!: string;
  name!: string;
  age!: number;
  positionId!: number;
  position!: string;
  preferredSideId!: number;
  preferredSide!: string;
  teamName!: string;
}
