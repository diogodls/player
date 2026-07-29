import { useMemo, useState } from "react";
import RankingSection from "../../components/elements/RankingSection/RankingSection.tsx";
import Select from "../../components/elements/Select/Select.tsx";
import sessionActionStyles from "../../components/SessionDetails/SessionActions/SessionActions.module.scss";
import { rankingConfigs } from "../../constants/rankings.ts";
import { useApi } from "../../hooks/useApi.ts";
import {
  getGeneralRankingEndpoint,
  getSessionRankingEndpoint,
  RANKING_SESSIONS_ENDPOINT,
} from "../../services/rankings.ts";
import type { Session, SessionListResponse } from "../Sessions";
import type {
  RankingIndexKey,
  RankingPlayerBase,
  RankingResponse,
} from "./index";
import styles from "./Rankings.module.scss";
const ALL_SESSIONS_VALUE = "all";
const formatSessionDate = (date: string) => {
  const [year, month, day] = date.slice(0, 10).split("-");
  return day && month && year ? `${day}/${month}/${year}` : date;
};
const getSessionOptionLabel = (session: Session) => {
  const detail =
    session.opponent?.trim() || session.description?.trim() || session.local;
  return `${session.type} — ${detail} — ${formatSessionDate(session.date)}`;
};
const Rankings = () => {
  const [selectedIndexKey, setSelectedIndexKey] = useState<
    RankingIndexKey | ""
  >("");
  const [selectedSessionId, setSelectedSessionId] =
    useState(ALL_SESSIONS_VALUE);
  const {
    data: sessionsResponse,
    isLoading: areSessionsLoading,
    isError: sessionsError,
  } = useApi<SessionListResponse>(RANKING_SESSIONS_ENDPOINT);
  const rankingEndpoint = useMemo(() => {
    if (!selectedIndexKey) return null;
    return selectedSessionId === ALL_SESSIONS_VALUE
      ? getGeneralRankingEndpoint(selectedIndexKey)
      : getSessionRankingEndpoint(selectedIndexKey, selectedSessionId);
  }, [selectedIndexKey, selectedSessionId]);
  const {
    data: rankingResponse,
    isLoading: isRankingLoading,
    isError: rankingError,
  } = useApi<RankingResponse>(rankingEndpoint, { keepPreviousData: false });
  const sessionOptions = useMemo(
    () => [
      { value: ALL_SESSIONS_VALUE, label: "Média geral de todas as sessões" },
      ...(sessionsResponse?.data ?? []).map((session) => ({
        value: session.id,
        label: getSessionOptionLabel(session),
      })),
    ],
    [sessionsResponse?.data],
  );
  const rankingPlayers: RankingPlayerBase[] =
    rankingResponse?.ranking.map((item) => ({
      ...item.player,
      rankingPosition: item.position,
      rankingValue: item.value,
    })) ?? [];
  const isSessionRankingUnavailable =
    selectedSessionId !== ALL_SESSIONS_VALUE && Boolean(selectedIndexKey);
  const renderRankingContent = () => {
    if (sessionsError)
      return (
        <div className={styles.feedback}>
          Não foi possível carregar as sessões.
        </div>
      );
    if (!selectedIndexKey)
      return (
        <div className={styles.emptyState}>
          Selecione um índice no filtro para começar a visualizar
        </div>
      );
    if (isSessionRankingUnavailable)
      return (
        <div className={styles.emptyState}>
          O ranking desta sessão ainda não está disponível.
        </div>
      );
    if (isRankingLoading)
      return <div className={styles.feedback}>Carregando ranking...</div>;
    if (rankingError)
      return (
        <div className={styles.feedback}>
          Não foi possível carregar o ranking.
        </div>
      );
    if (!rankingResponse) return null;
    return (
      <section className={styles.rankingContent}>
        <RankingSection
          title={`Ranking ${rankingResponse.index.name}`}
          players={rankingPlayers}
          metricLabel={rankingResponse.index.name || rankingResponse.index.key}
          highlightTop3
        />
      </section>
    );
  };
  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div className={styles.hero}>
          <h1>Rankings</h1>
          <p>Visualize os principais índices dos atletas por ranking.</p>
        </div>
        <div className={styles.filters}>
          <label
            className={`${sessionActionStyles.filterField} ${styles.filter}`}
            htmlFor="session-filter"
          >
            <span className={sessionActionStyles.filterLabel}>Sessão</span>
            <Select
              id="session-filter"
              value={selectedSessionId}
              onChange={(value) =>
                setSelectedSessionId(value || ALL_SESSIONS_VALUE)
              }
              options={sessionOptions}
              disabled={areSessionsLoading || Boolean(sessionsError)}
            />
          </label>
          <label
            className={`${sessionActionStyles.filterField} ${styles.filter}`}
            htmlFor="ranking-filter"
          >
            <span className={sessionActionStyles.filterLabel}>Índice</span>
            <Select<RankingIndexKey>
              id="ranking-filter"
              value={selectedIndexKey}
              onChange={(value) => setSelectedIndexKey(value)}
              options={rankingConfigs.map((item) => ({
                value: item.key,
                label: item.title,
              }))}
              placeholder="Selecione um índice"
            />
          </label>
        </div>
      </section>
      {areSessionsLoading ? (
        <div className={styles.feedback}>Carregando sessões...</div>
      ) : (
        renderRankingContent()
      )}
    </main>
  );
};
export default Rankings;
