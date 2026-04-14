import styles from './SessionAnalysisHeader.module.scss';
import type {Session} from "../../../pages/Sessions";
import SessionAnalysisDetails from "../SessionAnalysisDetails/SessionAnalysisDetails.tsx";
import SessionAnalysisTitle from "../SessionAnalysisTitle/SessionAnalysisTitle.tsx";

type SessionAnalysisHeaderProps = {
  session: Session;
}

const SessionAnalysisHeader = ({session}: SessionAnalysisHeaderProps) => {
  return (
    <div className={styles.header}>
      <SessionAnalysisTitle sessionId={session.id} />
      <SessionAnalysisDetails session={session} />
    </div>
  );
};

export default SessionAnalysisHeader;