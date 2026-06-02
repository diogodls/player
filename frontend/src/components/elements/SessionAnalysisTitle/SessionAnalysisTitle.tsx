import styles from "./SessionAnalysisTitle.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router";

type Props = {
  sessionId: string;
  onBack?: () => void;
};

const SessionAnalysisTitle = ({ sessionId, onBack }: Props) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate(`/sessions/${sessionId}`);
  };
  
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.back} onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2 className={styles.title}>Análise da sessão</h2>
      </div>
    </header>
  );
};

export default SessionAnalysisTitle;
