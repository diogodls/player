import type {Player} from "../CoachDashboard";

export type ActionTagged = {
  id: string;
  time: string;
  title: string;
  key?: string;
  category?: string;
  goodAction: boolean;
  player: Player;
};

export type IndividualAnalysisData = {
  players: Player[];
  actions: Action[];
};

export type Action = {
  key: string;
  label: string,
  category: string,
  goodAction: boolean,
};
