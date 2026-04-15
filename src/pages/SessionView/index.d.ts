import type {Session} from "../Sessions";

export type ViewMode = "individual" | "team";
export type ActionTypeFilter = "all" | "good" | "bad";
export type EntityType = "player" | "team";

export type SessionSummary = {
  positives: number;
  negatives: number;
  positivePercentage: number;
  negativePercentage: number;
};

export type SessionEntityAction = {
  id: string;
  title: string;
  subtitle?: string;
  time?: string;
  type: "good" | "bad";
  createdAt?: string;
};

export type SessionEntity = {
  id: string;
  entityType: "player" | "team";
  title: string;
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
  actions: SessionEntityAction[];
};

export type SessionOption = {
  value: string;
  label: string;
};

export type SessionDetailsViewSection = {
  summary: SessionSummary;
  athletes: SessionEntity[];
  athleteOptions: SessionOption[];
  categoryOptions: SessionOption[];
};

export type SessionDetails = {
  individual: SessionDetailsViewSection;
  team: SessionDetailsViewSection;
};

export interface SessionViewData extends Session, SessionDetails {}

export type SessionViewRecordData = Record<string, SessionViewData>; //todo: remover isso daqui quando tiver back

//////////////////////////////////////////

export interface SessionAnalysisItem extends Item {
  actions: SessionItemAction[];
}

export type SessionItemAction = {
  key: string;
  label: string;
  time: string;
  category: string;
  goodAction: boolean;
};

export type Item = {
  name: string;
  totalOffensiveActions: number;
  totalDefensiveActions: number;
};
