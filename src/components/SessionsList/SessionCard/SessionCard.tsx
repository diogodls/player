import styles from "./SessionCard.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCalendarDays, faLocationDot, faHandshake, faClipboardList, faPencil, faTrash} from "@fortawesome/free-solid-svg-icons";
import type {Session} from "../../../pages/Sessions";
import {useNavigate} from "react-router";

type SessionCardProps = {
  item: Session;
  onEdit: (session: Session) => void;
  onDelete: (session: Session) => void;
};

const SessionCard = ({item, onEdit, onDelete}: SessionCardProps) => {
  const badgeClass = item.type === "Jogo" ? styles.badgeGame : styles.badgeTraining;
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/sessions/${item.id}`);
  };

  return (
    <div className={styles.card}>
      <button className={styles.openArea} onClick={handleOpen}>
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

          {item.type === "Jogo" && item.opponent && (
            <div className={styles.row}>
              <FontAwesomeIcon icon={faHandshake} className={styles.icon} />
              <span className={styles.text}>{item.opponent}</span>
            </div>
          )}

          <div className={styles.row}>
            <FontAwesomeIcon icon={faLocationDot} className={styles.icon} />
            <span className={styles.text}>{item.local}</span>
          </div>

          {item.type === "Treino" && item.description && (
            <div className={styles.row}>
              <FontAwesomeIcon icon={faClipboardList} className={styles.icon} />
              <span className={styles.text}>
                {item.description}
              </span>
            </div>
          )}
        </div>
      </button>

      <div className={styles.cardActions}>
        <button className={styles.editBtn} onClick={() => onEdit(item)}>
          <FontAwesomeIcon icon={faPencil} />
          Editar
        </button>

        <button className={styles.deleteBtn} onClick={() => onDelete(item)}>
          <FontAwesomeIcon icon={faTrash} />
          Apagar
        </button>
      </div>
    </div>
  );
}

export default SessionCard;
