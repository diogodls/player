export type PlayerIndexes = {
  radj: number | null;
  goalsRelations: number | null;
  actionsRelations: number | null;
  atd: number | null;
  dto: number | null;
  pgj: number | null;
  ic: number | null;
  tio: number | null;
  gtj: number | null;
  rf: number | null;
  tid: number | null;
};

export type PlayerViewData = {
  id: string;
  name: string;
  age: number;
  positionId: number;
  position: string;
  preferredSideId: number;
  preferredSide: string;
  teamName: string;
  minutes: number;
  goals: number;
  goalsTaken: number;
  offensiveActions: number;
  defensiveActions: number;
  indexes: PlayerIndexes | null;
};
