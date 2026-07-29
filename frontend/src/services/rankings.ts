import type { RankingIndexKey } from "../pages/Rankings";
export const RANKING_OPTIONS_ENDPOINT = "/players/rankings";
export const RANKING_SESSIONS_ENDPOINT = "/sessions?limit=100";
export const getGeneralRankingEndpoint = (indexKey: RankingIndexKey) =>
  `/players/rankings/${indexKey}`;
// O backend ainda não possui contrato para ranking filtrado por sessão.
export const getSessionRankingEndpoint = (
  indexKey: RankingIndexKey,
  sessionId: string,
): null => {
  void indexKey;
  void sessionId;
  return null;
};
