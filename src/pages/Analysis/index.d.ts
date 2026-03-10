import type {Player} from "../CoachDashboard";
import type {Session} from "../Sessions";

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
  session: Session;
  players: Player[];
  actions: Action[];
};

export type Action = {
  key: string;
  label: string,
  category: string,
  goodAction: boolean,
};

type ActionType = 'team' | 'individual';
