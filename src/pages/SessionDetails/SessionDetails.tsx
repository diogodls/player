import { useEffect, useMemo, useState } from "react";
import styles from "./SessionDetails.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPeopleGroup, faUser, faFilter } from "@fortawesome/free-solid-svg-icons";
import { Navigate, useNavigate, useParams } from "react-router";
import { useSessions } from "../../contexts/SessionsContext/SessionsContext.tsx";
import SessionAnalysisDetails from "../../components/SessionAnalysis/SessionAnalysisDetails/SessionAnalysisDetails.tsx";
import SessionAnalysisSummary from "../../components/SessionAnalysis/SessionAnalysisSummary/SessionAnalysisSummary.tsx";
import SessionAnalysisActionCard from "../../components/SessionAnalysis/SessionAnalysisActions/SessionAnalysisActionCard/SessionAnalysisActionCard.tsx";
import { useApi } from "../../hooks/useApi.ts";
import type { SessionAnalysisAthlete, SessionDetailsView, SessionDetailsViewData } from "../SessionAnalysis";

type ViewMode = "individual" | "team";
type ActionTypeFilter = "all" | "good" | "bad";

const SessionDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { sessions } = useSessions();
  const { data: detailsData } = useApi<SessionDetailsViewData>("session-details-view");
  const [viewMode, setViewMode] = useState<ViewMode>("individual");
  const [actionTypeFilter, setActionTypeFilter] = useState<ActionTypeFilter>("all");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const session = sessions.find((item) => item.id === id);
  const sessionView: SessionDetailsView | undefined = id ? detailsData?.[id] : undefined;
  const activeView = viewMode === "individual" ? sessionView?.individual : sessionView?.team;

  useEffect(() => {
    setActionTypeFilter("all");
    setSelectedCategory("all");
    setSelectedAthleteId("all");
  }, [viewMode]);

  const categoryOptions = activeView?.categoryOptions ?? [];
  const athleteOptions = sessionView?.individual.athleteOptions ?? [];

  useEffect(() => {
    if (selectedCategory === "all") return;
    if (!categoryOptions.some((option) => option.value === selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [categoryOptions, selectedCategory]);

  const visibleCards = useMemo(() => {
    const sourceCards = activeView?.athletes ?? [];
    const cardsByAthlete =
      viewMode === "individual" && selectedAthleteId !== "all"
        ? sourceCards.filter((athlete) => athlete.id === selectedAthleteId)
        : sourceCards;

    return cardsByAthlete
      .map((athlete) => {
        const actions = athlete.actions.filter((action) => {
          const matchesType = actionTypeFilter === "all" || action.type === actionTypeFilter;
          const matchesCategory = selectedCategory === "all" || action.subtitle === selectedCategory;
          return matchesType && matchesCategory;
        });

        return {
          ...athlete,
          actions,
        };
      })
      .filter((athlete) => athlete.actions.length > 0);
  }, [actionTypeFilter, activeView?.athletes, selectedAthleteId, selectedCategory, viewMode]);

  const hasBaseAnalysisForView = (activeView?.athletes.length ?? 0) > 0;
  const hasAnalysisForView = visibleCards.length > 0;
  const hasActiveFilters =
    actionTypeFilter !== "all" ||
    selectedCategory !== "all" ||
    (viewMode === "individual" && selectedAthleteId !== "all");

  const handleResetFilters = () => {
    setActionTypeFilter("all");
    setSelectedCategory("all");
    setSelectedAthleteId("all");
  };

  if (!id || !session) {
    return <Navigate to="/session-screen" replace />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrap}>
        <header className={styles.sessionHeader}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={() => navigate("/session-screen")}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>

            <div className={styles.headerText}>
              <span className={styles.eyebrow}>Treino/Jogo selecionado</span>
              <h1 className={styles.title}>Detalhes da sessão</h1>
              <p className={styles.subtitle}>Acesse o fluxo de análise e acompanhe os dados desta sessão.</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              className={`${styles.actionButton} ${styles.individualButton}`}
              onClick={() => navigate(`/sessions/${session.id}/analysis/individual`)}
            >
              <div className={styles.actionIconWrap}>
                <FontAwesomeIcon icon={faUser} />
              </div>

              <div className={styles.actionText}>
                <strong>Fazer análise individual</strong>
              </div>
            </button>

            <button className={`${styles.actionButton} ${styles.teamButton}`}>
              <div className={styles.actionIconWrap}>
                <FontAwesomeIcon icon={faPeopleGroup} />
              </div>

              <div className={styles.actionText}>
                <strong>Fazer análise de equipe</strong>
              </div>
            </button>
          </div>
        </header>

        <SessionAnalysisDetails session={session} />

        <section className={styles.viewerCard}>
          <div className={styles.viewerSwitch}>
            <button
              type="button"
              className={`${styles.switchButton} ${viewMode === "individual" ? styles.switchActive : ""}`}
              onClick={() => setViewMode("individual")}
            >
              Ver análise individual
            </button>
            <button
              type="button"
              className={`${styles.switchButton} ${viewMode === "team" ? styles.switchActive : ""}`}
              onClick={() => setViewMode("team")}
            >
              Ver análise de equipe
            </button>
          </div>

          {activeView && <SessionAnalysisSummary summary={activeView.summary} />}

          <h3 className={styles.sectionTitle}>
            {viewMode === "individual" ? "Acoes Individuais" : "Acoes da Equipe"}
          </h3>

          <section className={styles.filtersCard}>
            <div className={styles.filtersTitleRow}>
              <FontAwesomeIcon icon={faFilter} />
              <h4>Filtros de ações</h4>
            </div>

            <div className={styles.filtersGrid}>
              <div className={styles.filterBlock}>
                <span className={styles.filterLabel}>Resultado</span>
                <div className={styles.typeFilters}>
                  <button
                    type="button"
                    className={`${styles.typeFilterButton} ${actionTypeFilter === "all" ? styles.typeFilterActive : ""}`}
                    onClick={() => setActionTypeFilter("all")}
                  >
                    Todas
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeFilterButton} ${actionTypeFilter === "good" ? styles.typeFilterActive : ""}`}
                    onClick={() => setActionTypeFilter("good")}
                  >
                    Positivas
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeFilterButton} ${actionTypeFilter === "bad" ? styles.typeFilterActive : ""}`}
                    onClick={() => setActionTypeFilter("bad")}
                  >
                    Negativas
                  </button>
                </div>
              </div>

              {viewMode === "individual" && (
                <label className={styles.filterField}>
                  <span className={styles.filterLabel}>Atleta</span>
                  <select value={selectedAthleteId} onChange={(event) => setSelectedAthleteId(event.target.value)}>
                    <option value="all">Todos os atletas</option>
                    {athleteOptions.map((athlete) => (
                      <option key={athlete.value} value={athlete.value}>
                        {athlete.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className={styles.filterField}>
                <span className={styles.filterLabel}>Categoria</span>
                <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                  <option value="all">Todas as categorias</option>
                  {categoryOptions.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {hasAnalysisForView ? (
            <div className={`${styles.cardsList} ${viewMode === "individual" ? styles.cardsGrid : ""}`}>
              {visibleCards.map((athlete: SessionAnalysisAthlete) => (
                <SessionAnalysisActionCard key={athlete.id} {...athlete} />
              ))}
            </div>
          ) : (
            <section className={styles.emptyState}>
              <h3>
                {hasBaseAnalysisForView
                  ? "Nenhuma acao encontrada com os filtros atuais."
                  : "Esta sessão ainda não possui ações para esta visualização."}
              </h3>
              {hasActiveFilters && (
                <button type="button" className={styles.switchButton} onClick={handleResetFilters}>
                  Limpar filtros
                </button>
              )}
            </section>
          )}
        </section>
      </div>
    </div>
  );
};

export default SessionDetails;
