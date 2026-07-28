import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodeCompare, faFutbol } from "@fortawesome/free-solid-svg-icons";
import styles from "./HeaderSessionScreen.module.scss";

type HeaderSessionScreenProps = {
  onAddSession: () => void;
  onCompareSessions: () => void;
};

const HeaderSessionScreen = ({
  onAddSession,
  onCompareSessions,
}: HeaderSessionScreenProps) => {
  return(
    <div className={styles.headerContainer}>
      <div className={styles.headerText}>
        <div className={styles.icon}>
          <FontAwesomeIcon icon={faFutbol} className={styles.titleIcon} />
        </div>
        <div className={styles.text}>
          <span className={styles.title}>
            TREINOS E JOGOS
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.compareButton} onClick={onCompareSessions}>
          <FontAwesomeIcon icon={faCodeCompare} />
          Comparar período
        </button>
        <button className={styles.addButton} onClick={onAddSession}>
          Adicionar treino/jogo
        </button>
      </div>
    </div>
  );
};

export default HeaderSessionScreen;
