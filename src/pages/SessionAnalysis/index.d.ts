export type SessionType = "Treino" | "Jogo";

export type SessionAnalysisActionType = "good" | "bad";
export type SessionAnalysisRawActionType = "positive" | "negative";

export type SessionAnalysisSession = {
  id: string;
  type: SessionType;
  date: string;
  local: string;
  description?: string;
  opponent?: string;
  videoUrl?: string;
};

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
  createdAt?: string;
  type: SessionAnalysisActionType;
};

export type SessionAnalysisAthleteMetrics = {
  overall: number;
  overallLabel: string;
  offensive: number;
  defensive: number;
  aproveitamento: number;
};

export type SessionAnalysisAthlete = {
  id: string;
  entityType: "team" | "player";
  title: string;
  variant?: "yellow" | "red";
  defaultOpen?: boolean;
  metrics: SessionAnalysisAthleteMetrics;
  counters: {
    positive: number;
    negative: number;
  };
  actions: SessionAnalysisAthleteAction[];
};

export type SessionAnalysis = {
  sessionId: string;
  session?: SessionAnalysisSession | null;
  summary: SessionAnalysisSummary;
  athletes: SessionAnalysisAthlete[];
};

export type SessionAnalysisViewData = Record<string, SessionAnalysis>;

export type SessionDetailsViewSection = {
  summary: SessionAnalysisSummary;
  athletes: SessionAnalysisAthlete[];
  athleteOptions: Array<{
    value: string;
    label: string;
  }>;
  categoryOptions: Array<{
    value: string;
    label: string;
  }>;
};

export type SessionDetailsView = {
  individual: SessionDetailsViewSection;
  team: SessionDetailsViewSection;
};

export type SessionDetailsViewData = Record<string, SessionDetailsView>;

export type SessionAnalysisRawAction = {
  time: string;
  key: string;
  label: string;
  type: SessionAnalysisRawActionType;
};

export type SessionAnalysisRawPlayer = {
  playerId: number | string;
  offensive: number;
  defensive: number;
  positive: number;
  negative: number;
  actions: SessionAnalysisRawAction[];
};

export type SessionAnalysisRawTeam = {
  offensive: number;
  defensive: number;
  positive: number;
  negative: number;
  actions: SessionAnalysisRawAction[];
};

export type SessionAnalysisByIdData = {
  players: SessionAnalysisRawPlayer[];
  team?: SessionAnalysisRawTeam;
};

export type SessionAnalysisData = Record<string, SessionAnalysisByIdData>;
