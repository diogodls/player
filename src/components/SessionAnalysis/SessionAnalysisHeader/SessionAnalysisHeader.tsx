import styles from "./SessionAnalysisHeader.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router";

type Props = {
  sessionId: string;
};

const SessionAnalysisHeader = ({ sessionId }: Props) => {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.back} onClick={() => navigate(`/sessions/${sessionId}`)}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2 className={styles.title}>Análise da sessão</h2>
      </div>
    </header>
  );
};

export default SessionAnalysisHeader;
