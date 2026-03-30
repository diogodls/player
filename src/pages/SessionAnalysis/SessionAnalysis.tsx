import styles from "./SessionAnalysis.module.scss";
import { Navigate, useParams } from "react-router";
import { useApi } from "../../hooks/useApi";
import type { SessionAnalysis as SessionAnalysisView, SessionAnalysisViewData } from "./index";
import SessionAnalysisHeader from "../../components/SessionAnalysis/SessionAnalysisHeader/SessionAnalysisHeader";
import SessionAnalysisDetails from "../../components/SessionAnalysis/SessionAnalysisDetails/SessionAnalysisDetails";
import SessionAnalysisSummary from "../../components/SessionAnalysis/SessionAnalysisSummary/SessionAnalysisSummary.tsx";
import SessionAnalysisActionCard from "../../components/SessionAnalysis/SessionAnalysisActions/SessionAnalysisActionCard/SessionAnalysisActionCard.tsx";
import { useSessions } from "../../contexts/SessionsContext/SessionsContext";

const SessionAnalysis = () => {
  const { id } = useParams<{ id: string }>();
  const { data: analysisData } = useApi<SessionAnalysisViewData>("session-analysis-view");
  const { sessions } = useSessions();
  const session = sessions.find((item) => item.id === id);
  const analysisView: SessionAnalysisView | undefined = id ? analysisData?.[id] : undefined;

  if (!id || !session) {
    return <Navigate to="/session-screen" replace />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrap}>
        <SessionAnalysisHeader sessionId={session.id} />
        <SessionAnalysisDetails session={session} />

        {analysisView ? (
          <>
            <SessionAnalysisSummary summary={analysisView.summary} />

            <h3 className={styles.sectionTitle}>Ações da Equipe</h3>
            <div className={styles.cardsList}>
              {analysisView.athletes.map((athlete) => (
                <SessionAnalysisActionCard key={athlete.id} {...athlete} />
              ))}
            </div>
          </>
        ) : (
          <section className={styles.emptyState}>
            <h3>Nenhuma análise de equipe encontrada</h3>
            <p>Esta sessão ainda não possui dados consolidados para exibição.</p>
          </section>
        )}
      </div>
    </div>
  );
};

export default SessionAnalysis;
