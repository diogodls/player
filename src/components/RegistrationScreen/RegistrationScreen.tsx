import styles from "./RegistrationScreen.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-regular-svg-icons";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import SessionCard from "../../components/SessionCard/SessionCard";
import sessionsMock from "../../../mock/session-mock.json";

type SessionType = "Jogo" | "Treino";

type SessionItem = {
  id: string;
  type: SessionType;
  date: string;
  location: string;
  rival?: string;
  trainingDescription?: string;
};

const RegistrationScreen = () => {
  const sessions = sessionsMock as SessionItem[];
  const total = sessions.length;

  const handleEdit = (id: string) => {
    console.log("edit", id);
  };

  const handleDelete = (id: string) => {
    console.log("delete", id);
  };

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
            {sessions.map((item) => (
              <SessionCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationScreen;