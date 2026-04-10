import type {Player} from "../pages/CoachDashboard";

export type RankingMetricPlayer = Player & {
  rankingValue: number;
};

type PlayerRankingKey = keyof Pick<Player, "overall" | "offensiveActions" | "defensiveActions" | "minutes" | "goals" | "goalsTaken">;
type IndexRankingKey = keyof Player["indexes"];

export type RankingConfig = {
  title: string;
  key: PlayerRankingKey | IndexRankingKey;
};

export const rankingConfigs: RankingConfig[] = [
  {title: "Ranking Geral", key: "overall"},
  {title: "Ranking Ofensivo", key: "offensiveActions"},
  {title: "Ranking Defensivo", key: "defensiveActions"},
  {title: "Ranking de Minutagem", key: "minutes"},
  {title: "Ranking de Gols", key: "goals"},
  {title: "Ranking de Gols Sofridos", key: "goalsTaken"},
  {title: "Ranking RADJ", key: "radj"},
  {title: "Ranking Goals Relations", key: "goalsRelations"},
  {title: "Ranking Actions Relations", key: "actionsRelations"},
  {title: "Ranking ATD", key: "atd"},
  {title: "Ranking DTO", key: "dto"},
  {title: "Ranking IC", key: "ic"},
];

const playerRankingKeys = new Set<PlayerRankingKey>([
  "overall",
  "offensiveActions",
  "defensiveActions",
  "minutes",
  "goals",
  "goalsTaken",
]);

const isPlayerMetricKey = (
  key: RankingConfig["key"],
): key is PlayerRankingKey => playerRankingKeys.has(key as PlayerRankingKey);

export const buildRankingPlayers = (
  players: Player[],
  key: RankingConfig["key"],
): RankingMetricPlayer[] => {
  return players.map((player) => ({
    ...player,
    rankingValue: isPlayerMetricKey(key)
      ? player[key]
      : player.indexes[key],
  }));
};
