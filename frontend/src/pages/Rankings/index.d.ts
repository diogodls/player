export type RankingIndexKey =
  | "overall"
  | "rating"
  | "radj"
  | "goalsRelations"
  | "actionsRelations"
  | "atd"
  | "dto"
  | "pgj"
  | "ic"
  | "tio"
  | "gtj"
  | "rf"
  | "tid";
export type RankingOption = {
  key: RankingIndexKey;
  name: string;
  sortDirection: "ASC" | "DESC";
};
export type RankingResponse = {
  index: { key: RankingIndexKey; name: string; sortDirection: "ASC" | "DESC" };
  ranking: RankingResponseItem[];
};
export type RankingResponseItem = {
  position: number;
  player: { id: string; name: string; position: string };
  value: number | null;
};
export type RankingPlayerBase = RankingResponseItem["player"] & {
  rankingPosition: number;
  rankingValue: number | null;
};
