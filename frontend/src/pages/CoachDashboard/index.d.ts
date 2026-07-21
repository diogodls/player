export type CoachDashboardData = {
  averageTeamCards: AverageCard[];
  players: Player[];
  metrics: string[];
  teamIndexes: TeamIndex[];
};

export type AverageCard = {
  name: string;
  color: string;
  value: string;
  icon: string;
};

export type Player = {
  id: string | number;
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

export type TeamIndexPhase = 'offensive' | 'defensive' | 'set-piece';

export type TeamIndexTrend = 'up' | 'stable' | 'down';

export type TeamIndex = {
  id: string;
  title: string;
  phase: TeamIndexPhase;
  value: number;
  maxValue: number;
  trend: TeamIndexTrend;
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
