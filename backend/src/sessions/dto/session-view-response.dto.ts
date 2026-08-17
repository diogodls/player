import { SessionResponseDto } from './session-response.dto';

export type SessionViewMode = 'individual' | 'team';
export type SessionViewEntityType = 'player' | 'team';
export type SessionViewActionOutcome = 'positive' | 'negative' | 'neutral';
export type SessionViewActionImpact = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export class SessionViewActionCategoryDto {
  code!: string;
  label!: string;
}

export class SessionViewSummaryDto {
  positives!: number;
  negatives!: number;
  positivePercentage!: number;
  negativePercentage!: number;
}

export class SessionViewActionDto {
  id!: string;
  catalogActionId!: string;
  actionKey!: string;
  actionName!: string;
  groupKey!: string;
  groupName!: string;
  impact!: SessionViewActionImpact;
  teamContextId!: string | null;
  contextKey!: string | null;
  contextName!: string | null;
  timestampSeconds!: number;
  title!: string;
  category!: SessionViewActionCategoryDto;
  time!: string;
  outcome!: SessionViewActionOutcome;
}

export class SessionViewEntityMetricsDto {
  overall!: number;
  offensive!: number;
  defensive!: number;
  performance!: number;
}

export class SessionViewEntityStatsDto {
  positive!: number;
  negative!: number;
  neutral!: number;
  total!: number;
}

export class SessionViewEntityDto {
  id!: string;
  type!: SessionViewEntityType;
  title!: string;
  metrics!: SessionViewEntityMetricsDto;
  stats!: SessionViewEntityStatsDto;
  actions!: SessionViewActionDto[];
}

export class SessionViewFilterOptionDto {
  value!: string;
  label!: string;
}

export class SessionViewFilterOptionsDto {
  athletes!: SessionViewFilterOptionDto[];
  categories!: SessionViewFilterOptionDto[];
  outcomes!: SessionViewFilterOptionDto[];
  phases!: SessionViewFilterOptionDto[];
}

export class SessionViewAnalysisSectionDto {
  summary!: SessionViewSummaryDto;
  entities!: SessionViewEntityDto[];
}

export class SessionViewResponseDto {
  session!: SessionResponseDto;
  analysis!: Record<SessionViewMode, SessionViewAnalysisSectionDto>;
  filters!: Record<SessionViewMode, SessionViewFilterOptionsDto>;
}
