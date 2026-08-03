export class SessionComparisonPeriodDto {
  startDate!: string;
  endDate!: string;
  typeId!: number | null;
}

export class SessionComparisonSessionDto {
  id!: string;
  date!: string;
  type!: string;
  description!: string | null;
  opponent!: string | null;
}

export class SessionComparisonMetricsDto {
  positiveActions!: number;
  negativeActions!: number;
  offensiveActions!: number;
  defensiveActions!: number;
  totalActions!: number;
  performancePercentage!: number;
}

export class SessionComparisonIndexesDto {
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

export class SessionComparisonPointDto {
  sessionId!: string;
  metrics!: SessionComparisonMetricsDto;
  indexes!: SessionComparisonIndexesDto;
}

export class SessionComparisonAthleteDto {
  id!: string;
  name!: string;
  position!: string;
  points!: SessionComparisonPointDto[];
}

export class SessionComparisonResponseDto {
  period!: SessionComparisonPeriodDto;
  sessions!: SessionComparisonSessionDto[];
  athletes!: SessionComparisonAthleteDto[];
}
