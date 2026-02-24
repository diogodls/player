import styles from "./SessionCard.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCalendarDays, faLocationDot, faHandshake, faClipboardList} from "@fortawesome/free-solid-svg-icons";
import type {Session} from "../../../pages/SessionView";

type SessionCard = {
  item: Session;
};

const SessionCard = ({item}: SessionCard) => {
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
    </div>
  );
}

export default SessionCard;