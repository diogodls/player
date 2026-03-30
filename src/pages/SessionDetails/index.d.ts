export type SessionAnalysisSummary = {
  positives: number;
  negatives: number;
  positivePercentage: number;
  negativePercentage: number;
};

export type SessionAnalysisAthleteAction = {
  id: string;
  title: string;
  subtitle?: string;
  time?: string;
  type: "good" | "bad";
  createdAt?: string;
};

export type SessionAnalysisAthlete = {
  id: string;
  entityType: "player" | "team";
  title: string;
  variant?: "yellow" | "red";
  defaultOpen?: boolean;
  metrics: {
    overall: number;
    overallLabel: string;
    offensive: number;
    defensive: number;
    aproveitamento: number;
  };
  counters: {
    positive: number;
    negative: number;
  };
  actions: SessionAnalysisAthleteAction[];
};

export type SessionOption = {
  value: string;
  label: string;
};

export type SessionDetailsViewSection = {
  summary: SessionAnalysisSummary;
  athletes: SessionAnalysisAthlete[];
  athleteOptions: SessionOption[];
  categoryOptions: SessionOption[];
};

export type SessionDetailsView = {
  individual: SessionDetailsViewSection;
  team: SessionDetailsViewSection;
};

export type SessionDetailsViewData = Record<string, SessionDetailsView>;
