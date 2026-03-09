import styles from "./SessionAnalysis.module.scss";
import { useParams } from "react-router";
import { useApi } from "../../hooks/useApi";
import type { SessionAnalysisData } from "./index";
import SessionAnalysisHeader from "../../components/SessionAnalysis/SessionAnalysisHeader/SessionAnalysisHeader";
import SessionAnalysisDetails from "../../components/SessionAnalysis/SessionAnalysisDetails/SessionAnalysisDetails";
import SessionAnalysisSummary from "../../components/SessionAnalysis/SessionAnalysisSummary/SessionAnalysisSummary.tsx";
import SessionAnalysisActionCard from "../../components/SessionAnalysis/SessionAnalysisActions/SessionAnalysisActionCard/SessionAnalysisActionCard.tsx";

const SessionAnalysis = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useApi<SessionAnalysisData>("session-analysis");

  const analysis = data?.sessionsAnalysis?.find(
    (sessionAnalysis) => sessionAnalysis.sessionId === id
  );

  return (
    <div className={styles.container}>
      <SessionAnalysisHeader />
      <SessionAnalysisDetails session={analysis?.session} />
      <SessionAnalysisSummary
        summary={analysis?.summary ?? { positives: 0, negatives: 0, neutrals: 0 }}
      />
      {analysis?.athletes.map((athlete) => (
        <SessionAnalysisActionCard key={athlete.id} {...athlete} />
      ))}
    </div>
  );
};

export default SessionAnalysis;
