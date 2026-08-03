import { DashboardPlayerDto } from '../../players/dto/player-performance.dto';
export type TeamIndexPhase = 'offensive' | 'defensive' | 'set-piece';
export class TeamIndexDto {
  id!: string;
  title!: string;
  phase!: TeamIndexPhase;
  value!: number | null;
  maxValue!: number;
}
export class CoachDashboardResponseDto {
  metrics!: string[];
  players!: DashboardPlayerDto[];
  teamIndexes!: TeamIndexDto[];
}
