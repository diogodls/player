export type CoachDashboardResponse = Partial<{
  averageTeamCards: AverageCard[];
  players: Array<Partial<Player>>;
  metrics: string[];
  teamIndexes: TeamIndex[];
}>;
export type AverageCard = {
  name: string;
  color: string;
  value: string | number;
  icon: string;
};
export type Player = {
  id: string;
  name: string;
  overall: number;
  position: string;
  minutes: number;
  defensiveActions: number;
  offensiveActions: number;
  goalsTaken: number;
  goals: number;
  indexes: Indexes;
};
export type TeamIndexPhase = "offensive" | "defensive" | "set-piece";
export type TeamIndexTrend = "up" | "stable" | "down";
export type TeamIndex = {
  id: string;
  title: string;
  phase: TeamIndexPhase;
  value: number | null;
  maxValue: number;
  trend: TeamIndexTrend;
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
