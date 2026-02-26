import styles from "./SessionAnalysisDetails.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faLocationDot, faVideo } from "@fortawesome/free-solid-svg-icons";
import type { Session } from "../../../pages/SessionView/index";

type Props = {
  session: Session;
};

function formatDateBR(dateStr: string) {
  if (dateStr.includes("/")) return dateStr;
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

const SessionAnalysisDetails = ({ session }: Props) => {
  const isGame = session.type === "Jogo";
  const topTitle = isGame ? (session.opponent ?? "N/D") : (session.description ?? "Treino");
  const videoText = (session as any).videoUrl ? "Anexado" : "Não anexado";

  return (
    <section className={styles.wrapper}>
      <div className={styles.topRow}>
        <span className={`${styles.badge} ${isGame ? styles.badgeGame : styles.badgeTraining}`}>
          {session.type}
        </span>
        <span className={styles.opponent}>{topTitle}</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.infoCard}>
          <div className={styles.labelRow}>
            <FontAwesomeIcon icon={faCalendarDays} className={styles.icon} />
            <span className={styles.label}>Data</span>
          </div>
          <span className={styles.value}>{formatDateBR(session.date)}</span>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.labelRow}>
            <FontAwesomeIcon icon={faLocationDot} className={styles.icon} />
            <span className={styles.label}>Local</span>
          </div>
          <span className={styles.value}>{session.local}</span>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.labelRow}>
            <FontAwesomeIcon icon={faVideo} className={styles.icon} />
            <span className={styles.label}>Vídeo</span>
          </div>
          <span className={styles.valueMuted}>{videoText}</span>
        </div>
      </div>
    </section>
  );
};

export default SessionAnalysisDetails;