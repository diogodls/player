type ActionType = "team" | "individual";

export type AnalysisPlayer = {
  id: string | number;
  name: string;
  age: number;
  position: string;
};

export type ActionTagged = {
  id: string;
  sessionId: string;
  catalogActionId?: string;
  teamContextId?: string;
  type: ActionType;
  time: string;
  title: string;
  key?: string;
  category?: string;
  contextName?: string;
  goodAction: boolean;
  impact?: CatalogImpact;
  player?: AnalysisPlayer;
};

export type AnalysisPlayerListResponse = {
  data: AnalysisPlayer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CatalogImpact = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

export type CatalogAction = {
  id: string;
  key: string;
  name: string;
  impact: CatalogImpact;
  order: number;
};

export type TeamActionContext = {
  id: string;
  key: string;
  name: string;
  order: number;
};

export type CatalogGroup = {
  key: string;
  title: string;
  order: number;
  actions: CatalogAction[];
  contexts?: TeamActionContext[];
};

export type IndividualCatalog = {
  analysisType: "INDIVIDUAL";
  groups: CatalogGroup[];
};

export type TeamCatalog = {
  analysisType: "TEAM";
  groups: CatalogGroup[];
};
