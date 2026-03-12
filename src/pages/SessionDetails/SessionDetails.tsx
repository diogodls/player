import { useMemo, useState } from "react";
import styles from "./SessionDetails.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPeopleGroup, faUser } from "@fortawesome/free-solid-svg-icons";
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

function safePercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function getInitials(name: string) {
  const parts = name
    .split(" ")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "AT";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

const SessionDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { sessions } = useSessions();
  const { data: analysisData } = useApi<SessionAnalysisData>("session-analysis");
  const { data: individualAnalysisData } = useApi<IndividualAnalysisData>("individual-analysis");
  const [viewMode, setViewMode] = useState<ViewMode>("individual");

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
          initials: getInitials(title),
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
      initials: "EQ",
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

  const hasIndividualAnalysis = individualCards.length > 0;
  const hasTeamAnalysis = Boolean(teamCard);
  const hasAnalysisForView = viewMode === "individual" ? hasIndividualAnalysis : hasTeamAnalysis;

  if (!id || !session) {
    return <Navigate to="/session-screen" replace />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate("/session-screen")}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <div className={styles.headerContent}>
          <span className={styles.eyebrow}>Treino/Jogo selecionado</span>
          <h1 className={styles.title}>Detalhes da sessao</h1>
          <p className={styles.subtitle}>Acesse o fluxo de analise e acompanhe os dados desta sessao.</p>
        </div>
      </header>

      <SessionAnalysisDetails session={session} />

      <section className={styles.topActionsCard}>
        <div className={styles.actionsHeader}>
          <h2 className={styles.actionsTitle}>Acoes principais</h2>
          <span className={styles.actionsSubtitle}>Use os botoes abaixo para iniciar uma analise.</span>
        </div>

        <div className={styles.actionsGrid}>
          <button
            className={`${styles.actionButton} ${styles.individualButton}`}
            onClick={() => navigate(`/sessions/${session.id}/analysis/individual`)}
          >
            <FontAwesomeIcon icon={faUser} />
            <div>
              <strong>Fazer analise individual</strong>
              <span>Registrar acoes por atleta neste treino/jogo.</span>
            </div>
          </button>

          <button
            className={`${styles.actionButton} ${styles.teamButton}`}
            onClick={() => navigate(`/sessions/${session.id}/analysis/team`)}
          >
            <FontAwesomeIcon icon={faPeopleGroup} />
            <div>
              <strong>Fazer analise de equipe</strong>
              <span>Ir para a tela dedicada de analise de equipe.</span>
            </div>
          </button>
        </div>
      </section>

      <section className={styles.viewerCard}>
        <div className={styles.viewerSwitch}>
          <button
            type="button"
            className={`${styles.switchButton} ${viewMode === "individual" ? styles.switchActive : ""}`}
            onClick={() => setViewMode("individual")}
          >
            Ver analise individual
          </button>
          <button
            type="button"
            className={`${styles.switchButton} ${viewMode === "team" ? styles.switchActive : ""}`}
            onClick={() => setViewMode("team")}
          >
            Ver analise de equipe
          </button>
        </div>

        {hasAnalysisForView ? (
          <>
            <SessionAnalysisSummary summary={viewMode === "individual" ? individualSummary : teamSummary} />

            <h3 className={styles.sectionTitle}>
              {viewMode === "individual" ? "Acoes Individuais" : "Acoes da Equipe"}
            </h3>

            <div className={styles.cardsList}>
              {viewMode === "individual"
                ? individualCards.map((athlete) => (
                    <SessionAnalysisActionCard key={athlete.id} {...athlete} />
                  ))
                : teamCard && <SessionAnalysisActionCard {...teamCard} />}
            </div>
          </>
        ) : (
          <section className={styles.emptyState}>
            <h3>Esse treino ainda não tem análise</h3>
          </section>
        )}
      </section>
    </div>
  );
};

export default SessionDetails;
