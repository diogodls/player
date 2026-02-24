export type TeamAnalysisData = {
  actions: Action[];
}

export type TeamActionTagged = {
  id: string;
  time: string;
  title: string;
  goodAction: boolean;
}

export type Action = {
  key: string;
  label: string,
  category: string,
  goodAction: boolean,
};