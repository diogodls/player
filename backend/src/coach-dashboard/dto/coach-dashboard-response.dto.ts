export class AverageTeamCardDto {
  name!: string;
  color!: string;
  value!: string | number;
  icon!: string;
}
export class PlayerIndexesDto {
  radj!: number;
  goalsRelations!: number;
  actionsRelations!: number;
  atd!: number;
  dto!: number;
  pgj!: number;
  ic!: number;
  tio!: number;
  gtj!: number;
  rf!: number;
  tid!: number;
}
export class CoachDashboardPlayerDto {
  id!: string;
  name!: string;
  overall!: number;
  position!: string;
  minutes!: number;
  defensiveActions!: number;
  offensiveActions!: number;
  goalsTaken!: number;
  goals!: number;
  indexes!: PlayerIndexesDto;
}
export type TeamIndexPhase = 'offensive' | 'defensive' | 'set-piece';
export type TeamIndexTrend = 'up' | 'stable' | 'down';
export class TeamIndexDto {
  id!: string;
  title!: string;
  phase!: TeamIndexPhase;
  value!: number | null;
  maxValue!: number;
  trend!: TeamIndexTrend;
}
export class CoachDashboardResponseDto {
  averageTeamCards!: AverageTeamCardDto[];
  metrics!: string[];
  players!: CoachDashboardPlayerDto[];
  teamIndexes!: TeamIndexDto[];
}
