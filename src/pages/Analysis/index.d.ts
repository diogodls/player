import type {Player, Team} from "../CoachDashboard";
import type {Session} from "../Sessions";

type ActionType = 'team' | 'individual';

export type ActionTagged = {
  id: string;
  sessionId: string;
  type: ActionType;
  time: string;
  title: string;
  key?: string;
  category?: string;
  goodAction: boolean;
  player?: Player;
};

export type IndividualAnalysisData = {
  session: Session;
  players: Player[];
  actions: Action[];
};

export type TeamAnalysisData = {
  session: Session;
  team: Team;
  actions: Action[];
};

export type Action = {
  key: string;
  label: string,
  category: string,
  goodAction: boolean,
};
