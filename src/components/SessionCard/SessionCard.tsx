import styles from "./SessionCard.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCalendarDays, faLocationDot, faHandshake, faClipboardList} from "@fortawesome/free-solid-svg-icons";

type SessionType = "Jogo" | "Treino";

type SessionItem = {
  id: string;
  type: SessionType;
  date: string;
  location: string;
  rival?: string;
  trainingDescription?: string;
};

type Props = {
  item: SessionItem;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export default function SessionCard({ item}: Props) {
  const badgeClass =
    item.type === "Jogo" ? styles.badgeGame : styles.badgeTraining;

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <span className={`${styles.badge} ${badgeClass}`}>
          {item.type}
        </span>
      </div>

      <div className={styles.info}>
        <div className={styles.row}>
          <FontAwesomeIcon icon={faCalendarDays} className={styles.icon} />
          <span className={styles.primary}>{item.date}</span>
        </div>

        {item.type === "Jogo" && item.rival && (
          <div className={styles.row}>
            <FontAwesomeIcon icon={faHandshake} className={styles.icon} />
            <span className={styles.text}>{item.rival}</span>
          </div>
        )}

        <div className={styles.row}>
          <FontAwesomeIcon icon={faLocationDot} className={styles.icon} />
          <span className={styles.text}>{item.location}</span>
        </div>

        {item.type === "Treino" && item.trainingDescription && (
          <div className={styles.row}>
            <FontAwesomeIcon icon={faClipboardList} className={styles.icon} />
            <span className={styles.text}>
              {item.trainingDescription}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
