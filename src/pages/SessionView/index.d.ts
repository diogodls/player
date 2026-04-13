import type {Session} from "../Sessions";

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
    performance: number;
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

export type SessionDetails = {
  individual: SessionDetailsViewSection;
  team: SessionDetailsViewSection;
};

export interface SessionViewData extends Session, SessionDetails {}

export type SessionViewRecordData = Record<string, SessionViewData>; //todo: remover isso daqui quando tiver back
