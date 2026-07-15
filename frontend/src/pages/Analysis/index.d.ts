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
};

export type CatalogImpact = 'POSITIVE' | 'NEGATIVE';

export type IndividualCatalogAction = {
  id: string;
  key: string;
  name: string;
  impact: CatalogImpact;
  order: number;
};

export type IndividualCatalogGroup = {
  key: string;
  title: string;
  order: number;
  actions: IndividualCatalogAction[];
};

export type IndividualCatalog = {
  analysisType: 'INDIVIDUAL';
  groups: IndividualCatalogGroup[];
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
