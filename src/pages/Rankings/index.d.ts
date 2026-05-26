export type RankingMetric = "rankingValue";

export type RankingPlayerBase = {
  id?: number | string;
  name: string;
  position: string;
  rankingValue?: number;
};
