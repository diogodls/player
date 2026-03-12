import styles from "./HeaderSessionScreen.module.scss";

type HeaderSessionScreenProps = {
  onAddSession: () => void;
};

const HeaderSessionScreen = ({ onAddSession }: HeaderSessionScreenProps) => {
  return(
    <div className={styles.headerContainer}>
      <div className={styles.headerText}>
        <span className={styles.title}>
          TREINOS & JOGOS
        </span>
        <span>
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
