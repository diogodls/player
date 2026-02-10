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
  radj: string,
  goalsRelations: string,
  actionsRelations: string,
  atd: string,
  dto: string,
};

export type OffensiveIndexes = {
  pgj: string;
  ic: string;
  tio: string;
};

export type DeffensiveIndexes = {
  gtj: string;
  rf: string;
  tid: string;
};
