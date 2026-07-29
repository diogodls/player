import type { RankingIndexKey } from "../pages/Rankings";
export type RankingConfig = { title: string; key: RankingIndexKey };
export const rankingConfigs: RankingConfig[] = [
  { title: "Ranking RADJ", key: "radj" },
  { title: "Ranking Goals Relations", key: "goalsRelations" },
  { title: "Ranking Actions Relations", key: "actionsRelations" },
  { title: "Ranking ATD", key: "atd" },
  { title: "Ranking DTO", key: "dto" },
  { title: "Ranking PGJ", key: "pgj" },
  { title: "Ranking IC", key: "ic" },
  { title: "Ranking TIO", key: "tio" },
  { title: "Ranking GTJ", key: "gtj" },
  { title: "Ranking RF", key: "rf" },
  { title: "Ranking TID", key: "tid" },
];
