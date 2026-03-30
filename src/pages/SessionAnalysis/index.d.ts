import type { SessionType } from "../SessionView";

export type Session = {
  id: number;
  type: SessionType;
  date: string;
  local: string;
  description?: string;
  opponent?: string;
  players: SessionAnalysisItem[];
  totalIndividualPositiveActions: number;
  totalIndividualNegativeActions: number;
  team: SessionAnalysisItem;
  totalTeamPositiveActions: number;
  totalTeamNegativeActions: number;
};

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

export type SessionAnalysisData = Record<string, Session>;