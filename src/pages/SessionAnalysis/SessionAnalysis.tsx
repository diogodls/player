import styles from "./SessionAnalysis.module.scss";
import { useParams} from "react-router";
import { useApi } from "../../hooks/useApi";
import type { SessionData, Session } from "../SessionView";
import SessionAnalysisHeader from "../../components/SessionAnalysis/SessionAnalysisHeader/SessionAnalysisHeader";
import SessionAnalysisDetails from "../../components/SessionAnalysis/SessionAnalysisDetails/SessionAnalysisDetails";

const SessionAnalysis = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useApi<SessionData>("sessions");

  const session: Session | undefined = data?.sessions?.find((s) => s.id === id);

    return (
    <div className={styles.container}>
      <SessionAnalysisHeader />
      <SessionAnalysisDetails session={session} />
    </div>
  );
};

export default SessionAnalysis;