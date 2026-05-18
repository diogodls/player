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
  age: number;
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

export type Metrics = { //todo: aplicar em jogador em nova task
  minutes: number;
  defensiveActions: number;
  offensiveActions: number;
  goalsTaken: number;
  goals: number;
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

export type IndexType = 'general' | 'offensive' | 'deffensive'
