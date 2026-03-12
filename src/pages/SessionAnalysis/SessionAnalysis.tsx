import styles from "./SessionAnalysis.module.scss";
import {Navigate, useParams} from "react-router";
import { useApi } from "../../hooks/useApi";
import type {
  SessionAnalysisAthlete,
  SessionAnalysisByIdData,
  SessionAnalysisData,
  SessionAnalysisSummary as SessionAnalysisSummaryData,
} from "./index";
import SessionAnalysisHeader from "../../components/SessionAnalysis/SessionAnalysisHeader/SessionAnalysisHeader";
import SessionAnalysisDetails from "../../components/SessionAnalysis/SessionAnalysisDetails/SessionAnalysisDetails";
import SessionAnalysisSummary from "../../components/SessionAnalysis/SessionAnalysisSummary/SessionAnalysisSummary.tsx";
import SessionAnalysisActionCard from "../../components/SessionAnalysis/SessionAnalysisActions/SessionAnalysisActionCard/SessionAnalysisActionCard.tsx";
import { useSessions } from "../../contexts/SessionsContext/SessionsContext";

function safePercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

const SessionAnalysis = () => {
  const { id } = useParams<{ id: string }>();
  const { data: analysisData } = useApi<SessionAnalysisData>("session-analysis");
  const { sessions } = useSessions();
  const analysisById: SessionAnalysisByIdData | undefined = id ? analysisData?.[id] : undefined;
  const session = sessions.find((item) => item.id === id);

  const summary: SessionAnalysisSummaryData = analysisById?.players.reduce(
    (acc, athlete) => ({
      positives: acc.positives + athlete.positive,
      negatives: acc.negatives + athlete.negative,
    }),
    { positives: 0, negatives: 0 }
  ) ?? { positives: 0, negatives: 0 };

  const teamTotalActions = analysisById?.team?.actions.length ?? 0;
  const teamCard: SessionAnalysisAthlete | null = analysisById?.team
    ? {
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
      }
    : null;

  if (!id || !session) {
    return <Navigate to="/session-screen" replace />;
  }

  return (
    <div className={styles.container}>
      <SessionAnalysisHeader active="team" sessionId={session.id} />
      <SessionAnalysisDetails session={session} />

      {analysisById ? (
        <>
          <SessionAnalysisSummary summary={summary} />

          <h3 className={styles.sectionTitle}>Ações da Equipe</h3>
          <div className={styles.cardsList}>
            {teamCard && <SessionAnalysisActionCard {...teamCard} />}
          </div>
        </>
      ) : (
        <section className={styles.emptyState}>
          <h3>Nenhuma análise de equipe encontrada</h3>
          <p>Esta sessão ainda não possui dados consolidados para exibição.</p>
        </section>
      )}
    </div>
  );
};

export default SessionAnalysis;
