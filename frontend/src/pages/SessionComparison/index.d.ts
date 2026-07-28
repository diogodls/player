import type { SessionType } from "../Sessions";

export type ComparisonActionMetrics = {
  positiveActions: number;
  negativeActions: number;
  offensiveActions: number;
  defensiveActions: number;
  totalActions: number;
  performancePercentage: number;
};

export type ComparisonIndexes = {
  radj: number;
  goalsRelations: number;
  actionsRelations: number;
  atd: number;
  dto: number;
  pgj: number;
  ic: number;
  tio: number;
  gtj: number;
  rf: number;
  tid: number;
};

export type ComparisonPoint = {
  sessionId: string;
  metrics: ComparisonActionMetrics;
  indexes: ComparisonIndexes | null;
};

export type ComparisonAthlete = {
  id: string;
  name: string;
  position: string;
  points: ComparisonPoint[];
};

export type ComparisonSession = {
  id: string;
  date: string;
  type: SessionType;
  description: string | null;
  opponent: string | null;
};

export type SessionComparisonResponse = {
  period: {
    startDate: string;
    endDate: string;
    typeId: number | null;
  };
  sessions: ComparisonSession[];
  athletes: ComparisonAthlete[];
};
