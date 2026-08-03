export type CoachDashboardResponse = {
  players: Player[];
  metrics: string[];
  teamIndexes: TeamIndex[];
};
export type Player = {
  id: string;
  name: string;
  overall: number | null;
  position: string;
  minutes: number;
  defensiveActions: number;
  offensiveActions: number;
  goalsTaken: number;
  goals: number;
  indexes: Indexes;
};
export type TeamIndexPhase = "offensive" | "defensive" | "set-piece";
export type TeamIndex = {
  id: string;
  title: string;
  phase: TeamIndexPhase;
  value: number | null;
  maxValue: number;
};
export interface Indexes
  extends GeneralIndexes, OffensiveIndexes, DeffensiveIndexes {}
export type GeneralIndexes = {
  radj: number;
  goalsRelations: number;
  actionsRelations: number;
  atd: number;
  dto: number;
};
export type OffensiveIndexes = { pgj: number; ic: number; tio: number };
export type DeffensiveIndexes = { gtj: number; rf: number; tid: number };
