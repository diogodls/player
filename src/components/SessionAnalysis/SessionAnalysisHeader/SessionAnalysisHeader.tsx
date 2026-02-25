import styles from "./SessionAnalysisHeader.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUsers } from "@fortawesome/free-solid-svg-icons";

type Tab = "individual" | "team";

type Props = {
  active?: Tab;
  onChange?: (tab: Tab) => void;
};

const SessionAnalysisHeader = ({ active = "individual", onChange }: Props) => {
  return (
    <header className={styles.header}>
      <h2 className={styles.title}>Detalhes</h2>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.pill} ${styles.pillBlue} ${
            active === "individual" ? styles.active : ""
          }`}
          onClick={() => onChange?.("individual")}
        >
          <FontAwesomeIcon icon={faUser} className={styles.icon} />
          Análise Individual
        </button>

        <button
          type="button"
          className={`${styles.pill} ${styles.pillGreen} ${
            active === "team" ? styles.active : ""
          }`}
          onClick={() => onChange?.("team")}
        >
          <FontAwesomeIcon icon={faUsers} className={styles.icon} />
          Análise de Equipe
        </button>
      </div>
    </header>
  );
};

export default SessionAnalysisHeader;