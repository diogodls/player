import styles from "./RegistrationScreen.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-regular-svg-icons";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import SessionCard from "./SessionCard/SessionCard.tsx";
import type { Session } from "../../pages/SessionView";

type RegistrationScreen = {
  sessions: Session[];
  onEditSession: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
};

const RegistrationScreen = ({ sessions, onEditSession, onDeleteSession }: RegistrationScreen) => {
  const total = sessions.length;

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

        {total === 0 ? (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faCalendar} className={styles.emptyIcon} />
            <span className={styles.emptyTitle}>Nenhum registro encontrado</span>
            <span className={styles.emptySub}>
              Comece criando seu primeiro treino ou jogo
            </span>
          </div>
        ) : (
          <div className={styles.list}>
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                item={session}
                onEdit={onEditSession}
                onDelete={onDeleteSession}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationScreen;
