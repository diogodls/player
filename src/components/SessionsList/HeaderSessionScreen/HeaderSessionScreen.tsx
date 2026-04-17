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
        <div className={styles.icon}>
          <FontAwesomeIcon icon={faFutbol} className={styles.titleIcon} />
        </div>
        <div className={styles.text}>
          <span className={styles.title}>
            TREINOS & JOGOS
          </span>
          <span className={styles.subtitle}>
            Gerencie treinos e jogos
          </span>
        </div>
      </div>

      <button className={styles.addButton} onClick={onAddSession}>
        Adicionar treino/jogo
      </button>
    </div>
  );
};

export default HeaderSessionScreen;
