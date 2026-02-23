import styles from "./HeaderSessionScreen.module.scss";

const HeaderSessionScreen = () => {
  return(
    <div className={styles.headerText}>
      <span className={styles.title}>
        TREINOS & JOGOS
      </span>
      <span>
        Gerencie treinos e jogos
      </span>
    </div>
  );
};

export default HeaderSessionScreen;