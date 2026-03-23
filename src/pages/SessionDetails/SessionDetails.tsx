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
import type {
  SessionAnalysisAthlete,
  SessionAnalysisByIdData,
  SessionAnalysisData,
  SessionAnalysisSummary as SessionAnalysisSummaryData,
} from "../SessionAnalysis";
import type { IndividualAnalysisData } from "../IndividualAnalysis";

type ViewMode = "individual" | "team";
type ActionTypeFilter = "all" | "good" | "bad";

function safePercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

const SessionDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { sessions } = useSessions();
  const { data: analysisData } = useApi<SessionAnalysisData>("session-analysis");
  const { data: individualAnalysisData } = useApi<IndividualAnalysisData>("individual-analysis");
  const [viewMode, setViewMode] = useState<ViewMode>("individual");
  const [actionTypeFilter, setActionTypeFilter] = useState<ActionTypeFilter>("all");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const session = sessions.find((item) => item.id === id);
  const analysisById: SessionAnalysisByIdData | undefined = id ? analysisData?.[id] : undefined;

  const playersById = useMemo(() => {
    const entries = (individualAnalysisData?.players ?? []).map((player) => [
      String(player.id),
      player,
    ] as const);

    return new Map(entries);
  }, [individualAnalysisData?.players]);

  const individualCards: SessionAnalysisAthlete[] = useMemo(
    () =>
      (analysisById?.players ?? []).map((athlete, index) => {
        const playerId = String(athlete.playerId);
        const player = playersById.get(playerId);
        const title = player?.name ?? `Atleta ${playerId}`;
        const totalActions = athlete.actions.length;

        return {
          id: `player-${playerId}`,
          initials: "",
          title,
          variant: index % 2 === 0 ? "yellow" : "red",
          defaultOpen: false,
          metrics: {
            overall: totalActions,
            overallLabel: "TOTAL",
            offensive: athlete.offensive,
            defensive: athlete.defensive,
            aproveitamento: safePercent(athlete.positive, totalActions),
          },
          actions: athlete.actions.map((action, actionIndex) => ({
            id: `player-${playerId}-${action.key}-${action.time}-${actionIndex}`,
            title: action.label,
            subtitle: action.key,
            time: action.time,
            type: action.type === "positive" ? "good" : "bad",
          })),
        };
      }),
    [analysisById?.players, playersById]
  );

  const teamCard: SessionAnalysisAthlete | null = useMemo(() => {
    if (!analysisById?.team) return null;

    const teamTotalActions = analysisById.team.actions.length;

    return {
      id: "team",
      initials: "",
      title: "Equipe",
      variant: "yellow",
      defaultOpen: false,
      metrics: {
        overall: teamTotalActions,
        overallLabel: "TOTAL",
        offensive: analysisById.team.offensive,
        defensive: analysisById.team.defensive,
        aproveitamento: safePercent(analysisById.team.positive, teamTotalActions),
      },
      actions: analysisById.team.actions.map((action, actionIndex) => ({
        id: `team-${action.key}-${action.time}-${actionIndex}`,
        title: action.label,
        subtitle: action.key,
        time: action.time,
        type: action.type === "positive" ? "good" : "bad",
      })),
    };
  }, [analysisById?.team]);

  const individualSummary: SessionAnalysisSummaryData = useMemo(
    () =>
      analysisById?.players.reduce(
        (acc, athlete) => ({
          positives: acc.positives + athlete.positive,
          negatives: acc.negatives + athlete.negative,
        }),
        { positives: 0, negatives: 0 }
      ) ?? { positives: 0, negatives: 0 },
    [analysisById?.players]
  );

  const teamSummary: SessionAnalysisSummaryData = useMemo(
    () => ({
      positives: analysisById?.team?.positive ?? 0,
      negatives: analysisById?.team?.negative ?? 0,
    }),
    [analysisById?.team?.negative, analysisById?.team?.positive]
  );

  useEffect(() => {
    setActionTypeFilter("all");
    setSelectedCategory("all");
    if (viewMode === "team") {
      setSelectedAthleteId("all");
    }
  }, [viewMode]);

  const filteredCardsByAthlete = useMemo(() => {
    if (viewMode !== "individual" || selectedAthleteId === "all") return individualCards;
    return individualCards.filter((athlete) => athlete.id === selectedAthleteId);
  }, [individualCards, selectedAthleteId, viewMode]);

  const availableCategories = useMemo(() => {
    const cardsSource = viewMode === "individual" ? filteredCardsByAthlete : teamCard ? [teamCard] : [];
    const categories = new Set<string>();

    cardsSource.forEach((card) => {
      card.actions.forEach((action) => {
        const category = action.subtitle?.trim() || action.title.trim();
        if (category) categories.add(category);
      });
    });

    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [filteredCardsByAthlete, teamCard, viewMode]);

  useEffect(() => {
    if (selectedCategory === "all") return;
    if (!availableCategories.includes(selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [availableCategories, selectedCategory]);

  const applyActionFilters = (
    actions: SessionAnalysisAthlete["actions"]
  ): SessionAnalysisAthlete["actions"] => {
    return actions.filter((action) => {
      const typeMatches = actionTypeFilter === "all" || action.type === actionTypeFilter;
      const category = action.subtitle?.trim() || action.title.trim();
      const categoryMatches = selectedCategory === "all" || category === selectedCategory;
      return typeMatches && categoryMatches;
    });
  };

  const filteredIndividualCards = useMemo(
    () =>
      filteredCardsByAthlete
        .map((athlete) => ({
          ...athlete,
          actions: applyActionFilters(athlete.actions),
        }))
        .filter((athlete) => athlete.actions.length > 0),
    [actionTypeFilter, filteredCardsByAthlete, selectedCategory]
  );

  const filteredTeamCard = useMemo(() => {
    if (!teamCard) return null;
    return {
      ...teamCard,
      actions: applyActionFilters(teamCard.actions),
    };
  }, [actionTypeFilter, selectedCategory, teamCard]);

  const hasIndividualAnalysis = filteredIndividualCards.length > 0;
  const hasTeamAnalysis = Boolean(filteredTeamCard && filteredTeamCard.actions.length > 0);
  const hasAnalysisForView = viewMode === "individual" ? hasIndividualAnalysis : hasTeamAnalysis;
  const hasBaseIndividualAnalysis = filteredCardsByAthlete.length > 0;
  const hasBaseTeamAnalysis = Boolean(teamCard && teamCard.actions.length > 0);
  const hasBaseAnalysisForView = viewMode === "individual" ? hasBaseIndividualAnalysis : hasBaseTeamAnalysis;
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

            <button
              className={`${styles.actionButton} ${styles.teamButton}`}
            >
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

          <SessionAnalysisSummary summary={viewMode === "individual" ? individualSummary : teamSummary} />

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
                  <select
                    value={selectedAthleteId}
                    onChange={(event) => setSelectedAthleteId(event.target.value)}
                  >
                    <option value="all">Todos os atletas</option>
                    {individualCards.map((athlete) => (
                      <option key={athlete.id} value={athlete.id}>
                        {athlete.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className={styles.filterField}>
                <span className={styles.filterLabel}>Categoria</span>
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                >
                  <option value="all">Todas as categorias</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {hasAnalysisForView ? (
            <div className={`${styles.cardsList} ${viewMode === "individual" ? styles.cardsGrid : ""}`}>
              {viewMode === "individual"
                ? filteredIndividualCards.map((athlete) => (
                    <SessionAnalysisActionCard key={athlete.id} {...athlete} />
                  ))
                : filteredTeamCard && <SessionAnalysisActionCard {...filteredTeamCard} />}
            </div>
          ) : (
            <section className={styles.emptyState}>
              <h3>
                {hasBaseAnalysisForView
                  ? "Nenhuma acao encontrada com os filtros atuais."
                  : "Esta sessão ainda não possui ações para esta visualização."}
              </h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  className={styles.switchButton}
                  onClick={handleResetFilters}
                >
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
