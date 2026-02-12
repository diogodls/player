export type CoachDashboardData = {
  averageTeamCards: AverageCard[];
  players: Player[];
  metrics: string[];
};

export type AverageCard = {
  name: string;
  color: string;
  value: string;
  icon: string;
};

export type Player = {
  id: number;
  name: string;
  overall: number;
  position: string;
  //todo: separar metricas
  minutes: number;
  defensiveActions: number;
  offensiveActions: number;
  goalsTaken: number;
  goals: number;
  indexes: Indexes;
};

export type Team = {
  indexes: Indexes;
};

export interface Indexes extends GeneralIndexes, OffensiveIndexes, DeffensiveIndexes {}

export type GeneralIndexes = {
  radj: number,
  goalsRelations: number,
  actionsRelations: number,
  atd: number,
  dto: number,
};

export type OffensiveIndexes = {
  pgj: number,
  ic: number,
  tio: number,
};

export type DeffensiveIndexes = {
  gtj: number,
  rf: number,
  tid: number,
};
