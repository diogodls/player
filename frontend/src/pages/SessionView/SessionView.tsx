import { useMemo, useState } from "react";
import styles from "./SessionView.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPeopleGroup, faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router";
import SessionDetails from "../../components/elements/SessionDetails/SessionDetails.tsx";
import SessionSummary from "../../components/SessionDetails/SessionSummary/SessionSummary.tsx";
import SessionActions from "../../components/SessionDetails/SessionActions/SessionActions.tsx";
import { useApi } from "../../hooks/useApi";
import type { SessionViewData, SessionViewFilters, ViewMode } from "./index";

const emptyFilters: SessionViewFilters = {
  outcome: "all",
  athleteId: "all",
  categoryCode: "all",
};

const SessionView = () => {
  const navigate = useNavigate();
  const { id: sessionId } = useParams<{ id: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>("individual");
  const [filters, setFilters] = useState<SessionViewFilters>(emptyFilters);

  const sessionViewEndpoint = useMemo(() => {
    if (!sessionId) return null;

    const searchParams = new URLSearchParams();
    if (filters.outcome !== "all") searchParams.set("outcome", filters.outcome);
    if (viewMode === "individual" && filters.athleteId !== "all") {
      searchParams.set("playerId", filters.athleteId);
    }
    if (filters.categoryCode !== "all") {
      searchParams.set("categoryCode", filters.categoryCode);
    }

    const queryString = searchParams.toString();
    return `/sessions/${sessionId}/view${queryString ? `?${queryString}` : ""}`;
  }, [filters, sessionId, viewMode]);

  const { data: sessionView, error: sessionViewError, isLoading: isSessionLoading } =
    useApi<SessionViewData>(sessionViewEndpoint);

  const activeView = sessionView?.analysis?.[viewMode];
  const activeFilterOptions = sessionView?.filters?.[viewMode] ?? {
    athletes: [],
    categories: [],
  };

  const handleChangeViewMode = (nextViewMode: ViewMode) => {
    setViewMode(nextViewMode);
    setFilters((currentFilters) => ({
      ...currentFilters,
      athleteId: "all",
    }));
  };

  if (isSessionLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrap}>Carregando sessao...</div>
      </div>
    );
  }

  if (sessionViewError || !sessionView || !activeView) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrap}>Sessao nao encontrada.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrap}>
        <header className={styles.sessionHeader}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={() => navigate("/sessions")}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>

            <div className={styles.headerText}>
              <span className={styles.eyebrow}>Treino/Jogo selecionado</span>
              <h1 className={styles.title}>Detalhes da Sessao</h1>
              <p className={styles.subtitle}>Acesse o fluxo de analise e acompanhe os dados desta sessao.</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              className={`${styles.actionButton} ${styles.individualButton}`}
              onClick={() => navigate(`/sessions/${sessionId}/analysis/individual`)}
            >
              <div className={styles.actionIconWrap}>
                <FontAwesomeIcon icon={faUser} />
              </div>

              <div className={styles.actionText}>
                <strong>Fazer analise individual</strong>
              </div>
            </button>

            <button
              className={`${styles.actionButton} ${styles.teamButton}`}
              onClick={() => navigate(`/sessions/${sessionId}/analysis/team`)}
            >
              <div className={styles.actionIconWrap}>
                <FontAwesomeIcon icon={faPeopleGroup} />
              </div>

              <div className={styles.actionText}>
                <strong>Fazer analise de equipe</strong>
              </div>
            </button>
          </div>
        </header>

        <SessionDetails session={sessionView.session} />

        <section className={styles.viewerCard}>
          <div className={styles.viewerSwitch}>
            <button
              type="button"
              className={`${styles.switchButton} ${viewMode === "individual" ? styles.switchActive : ""}`}
              onClick={() => handleChangeViewMode("individual")}
            >
              Ver analise individual
            </button>
            <button
              type="button"
              className={`${styles.switchButton} ${viewMode === "team" ? styles.switchActive : ""}`}
              onClick={() => handleChangeViewMode("team")}
            >
              Ver analise de equipe
            </button>
          </div>

          <SessionSummary
            positives={activeView.summary.positives}
            negatives={activeView.summary.negatives}
            positivePercentage={activeView.summary.positivePercentage}
            negativePercentage={activeView.summary.negativePercentage}
          />

          <h3 className={styles.sectionTitle}>
            {viewMode === "individual" ? "Acoes Individuais" : "Acoes da Equipe"}
          </h3>

          <SessionActions
            viewMode={viewMode}
            view={activeView}
            filters={filters}
            filterOptions={activeFilterOptions}
            onFiltersChange={setFilters}
          />
        </section>
      </div>
    </div>
  );
};

export default SessionView;
