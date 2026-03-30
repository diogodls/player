import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFutbol } from "@fortawesome/free-solid-svg-icons";
import styles from "./HeaderSessionScreen.module.scss";

type HeaderSessionScreenProps = {
  onAddSession: () => void;
};

const HeaderSessionScreen = ({ onAddSession }: HeaderSessionScreenProps) => {
  return(
    <div className={styles.headerContainer}>
      <div className={styles.headerText}>
        <div className={styles.titleRow}>
          <FontAwesomeIcon icon={faFutbol} className={styles.titleIcon} />
          <span className={styles.title}>
            TREINOS & JOGOS
          </span>
        </div>
        <span className={styles.subtitle}>
          Gerencie treinos e jogos
        </span>
      </div>

      <button className={styles.addButton} onClick={onAddSession}>
        Adicionar treino/jogo
      </button>
    </div>
  );
};

export default HeaderSessionScreen;
