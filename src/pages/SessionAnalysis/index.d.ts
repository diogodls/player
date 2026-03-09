export type SessionType = "Treino" | "Jogo";

export type SessionAnalysisActionType = "good" | "bad" | "neutral";

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
  neutrals: number;
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
  initials: string;
  title: string;
  variant?: "yellow" | "red";
  defaultOpen?: boolean;
  metrics: SessionAnalysisAthleteMetrics;
  actions: SessionAnalysisAthleteAction[];
};

export type SessionAnalysis = {
  sessionId: string;
  session: SessionAnalysisSession;
  summary: SessionAnalysisSummary;
  athletes: SessionAnalysisAthlete[];
};

export type SessionAnalysisData = {
  sessionsAnalysis: SessionAnalysis[];
};
