import { useMemo, useState } from "react";
import RankingSection from "../../components/elements/RankingSection/RankingSection.tsx";
import Select from "../../components/elements/Select/Select.tsx";
import sessionActionStyles from "../../components/SessionDetails/SessionActions/SessionActions.module.scss";
import { useApi } from "../../hooks/useApi.ts";
import {
  getGeneralRankingEndpoint,
  getSessionRankingEndpoint,
  RANKING_OPTIONS_ENDPOINT,
  RANKING_SESSIONS_ENDPOINT,
} from "../../services/rankings.ts";
import type { Session, SessionListResponse } from "../Sessions";
import type {
  RankingIndexKey,
  RankingOption,
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
  >("overall");
  const [selectedSessionId, setSelectedSessionId] =
    useState(ALL_SESSIONS_VALUE);
  const {
    data: rankingOptions,
    isLoading: areRankingOptionsLoading,
    isError: rankingOptionsError,
  } = useApi<RankingOption[]>(RANKING_OPTIONS_ENDPOINT);
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
      { value: ALL_SESSIONS_VALUE, label: "Ranking geral do elenco" },
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
  const isRating = rankingResponse?.index.key === "rating";
  const renderRankingContent = () => {
    if (rankingOptionsError)
      return (
        <div className={styles.feedback}>
          Não foi possível carregar os índices.
        </div>
      );
    if (rankingOptions && rankingOptions.length === 0)
      return <div className={styles.emptyState}>Nenhum índice disponível.</div>;
    if (!selectedIndexKey)
      return (
        <div className={styles.emptyState}>
          Selecione um índice no filtro para começar a visualizar
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
          title={rankingResponse.index.name}
          players={rankingPlayers}
          metricLabel={rankingResponse.index.name || rankingResponse.index.key}
          valueFormatter={
            isRating
              ? (value) =>
                  value === null
                    ? "—"
                    : value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })
              : undefined
          }
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
            {sessionsError && (
              <span className={styles.sessionError}>
                Não foi possível carregar as sessões.
              </span>
            )}
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
              options={(rankingOptions ?? []).map((item) => ({
                value: item.key,
                label: item.name,
              }))}
              placeholder="Selecione um índice"
              disabled={
                areRankingOptionsLoading || Boolean(rankingOptionsError)
              }
            />
          </label>
        </div>
      </section>
      {areRankingOptionsLoading ? (
        <div className={styles.feedback}>Carregando índices...</div>
      ) : (
        renderRankingContent()
      )}
    </main>
  );
};
export default Rankings;
