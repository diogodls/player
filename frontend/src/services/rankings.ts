import type { RankingIndexKey } from "../pages/Rankings";
export const RANKING_OPTIONS_ENDPOINT = "/players/rankings";
export const RANKING_SESSIONS_ENDPOINT = "/sessions?limit=100";
export const getGeneralRankingEndpoint = (indexKey: RankingIndexKey) =>
  `/players/rankings/${indexKey}`;
export const getSessionRankingEndpoint = (
  indexKey: RankingIndexKey,
  sessionId: string,
): string => `/sessions/${sessionId}/rankings/${indexKey}`;
