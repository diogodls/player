import styles from "./RegistrationScreen.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-regular-svg-icons";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import SessionCard from "../../components/SessionCard/SessionCard";
import type { SessionRecord } from "../../pages/SessionScreen";

type Props = {
  sessions: SessionRecord[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
};

type SessionItemForCard = {
  id: string;
  type: "Jogo" | "Treino";
  date: string;
  location: string;
  rival?: string;
  trainingDescription?: string;
};

function toCardItem(s: SessionRecord): SessionItemForCard {
  return {
    id: s.id,
    type: s.type,
    date: s.date,
    location: s.local,
    rival: s.opponent,
    trainingDescription: s.description,
  };
}

const RegistrationScreen = ({ sessions, onDelete, onEdit }: Props) => {
  const total = sessions.length;

  const handleEdit = (id: string) => {
    onEdit?.(id);
  };

  const handleDelete = (id: string) => {
    onDelete?.(id);
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
            {sessions.map((s) => {
              const item = toCardItem(s);
              return (
                <SessionCard
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationScreen;
