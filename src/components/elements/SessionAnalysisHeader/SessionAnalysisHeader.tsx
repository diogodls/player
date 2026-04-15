import styles from './SessionAnalysisHeader.module.scss';
import type {Session} from "../../../pages/Sessions";
import SessionDetails from "../SessionDetails/SessionDetails.tsx";
import SessionAnalysisTitle from "../SessionAnalysisTitle/SessionAnalysisTitle.tsx";

type SessionAnalysisHeaderProps = {
  session: Session;
}

const SessionAnalysisHeader = ({session}: SessionAnalysisHeaderProps) => {
  return (
    <div className={styles.header}>
      <SessionAnalysisTitle sessionId={session.id} />
      <SessionDetails session={session} />
    </div>
  );
};

export default SessionAnalysisHeader;