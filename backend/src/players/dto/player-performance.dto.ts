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

export class PlayerPerformanceDto {
  minutes!: number;
  goals!: number;
  goalsTaken!: number;
  offensiveActions!: number;
  defensiveActions!: number;
  indexes!: PlayerIndexesDto;
}

export class DashboardPlayerDto extends PlayerPerformanceDto {
  id!: string;
  name!: string;
  position!: string;
  overall!: number | null;
}
