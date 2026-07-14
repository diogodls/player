import type { Session } from "../Sessions";

export type ViewMode = "individual" | "team";
export type ActionTypeFilter = "all" | "positive" | "negative";
export type EntityType = "player" | "team";

export type SessionActionCategory = {
  code: string;
  label: string;
};

export type SessionSummary = {
  positives: number;
  negatives: number;
  positivePercentage: number;
  negativePercentage: number;
};

export type SessionEntityAction = {
  id: string;
  title: string;
  category: SessionActionCategory;
  time: string;
  outcome: "positive" | "negative";
};

export type SessionEntityMetrics = {
  overall: number;
  offensive: number;
  defensive: number;
  performance: number;
};

export type SessionEntityStats = {
  positive: number;
  negative: number;
  total: number;
};

export type SessionEntity = {
  id: string;
  type: EntityType;
  title: string;
  metrics: SessionEntityMetrics;
  stats: SessionEntityStats;
  actions: SessionEntityAction[];
};

export type SessionAnalysisSection = {
  summary: SessionSummary;
  entities: SessionEntity[];
};

export type SessionViewFilterOption = {
  value: string;
  label: string;
};

export type SessionViewFilterOptions = {
  athletes: SessionViewFilterOption[];
  categories: SessionViewFilterOption[];
};

export type SessionViewFilters = {
  outcome: ActionTypeFilter;
  athleteId: string;
  categoryCode: string;
};

export type SessionViewData = {
  session: Session;
  analysis: {
    individual: SessionAnalysisSection;
    team: SessionAnalysisSection;
  };
  filters: {
    individual: SessionViewFilterOptions;
    team: SessionViewFilterOptions;
  };
};
