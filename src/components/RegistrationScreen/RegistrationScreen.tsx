import styles from "./RegistrationScreen.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-regular-svg-icons";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";

const RegistrationScreen = () => {
  const total = 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <FontAwesomeIcon icon={faCalendarDays} className={styles.headerIcon} />
          <div className={styles.headerText}>
            <span className={styles.headerTitle}>Registros Salvos</span>
            <span className={styles.headerSub}>{total} registros encontrados</span>
          </div>
        </div>

        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faCalendar} className={styles.emptyIcon} />
          <span className={styles.emptyTitle}>Nenhum registro encontrado</span>
          <span className={styles.emptySub}>Comece criando seu primeiro treino ou jogo</span>
        </div>
      </div>
    </div>
  );
};

export default RegistrationScreen;
