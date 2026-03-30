import { useState } from "react";
import styles from "./SessionAnalysisActionCard.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faArrowTrendUp,
  faArrowTrendDown,
  faPeopleGroup,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import SessionAnalysisActionView from "../SessionAnalysisActionView.tsx";
import type { SessionAnalysisAthlete } from "../../../../pages/SessionAnalysis";

type Props = SessionAnalysisAthlete;

const SessionAnalysisActionCard = ({
  entityType,
  title,
  actions,
  metrics,
  counters,
  variant = "yellow",
  defaultOpen = false,
}: Props) => {
  const [open, setOpen] = useState(defaultOpen);
  const actionsCount = actions.length;
  const isTeam = entityType === "team";

  return (
    <article className={`${styles.card} ${styles[`card_${variant}`]}`}>
      <div className={styles.topRow}>
        <div className={styles.left}>
          <div className={styles.playerIcon}>
            <FontAwesomeIcon icon={isTeam ? faPeopleGroup : faUser} />
          </div>

          <div className={styles.meta}>
            <div className={styles.title}>{title}</div>
            <div className={styles.sub}>{actionsCount} ações exibidas</div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.counts}>
            <span className={styles.count}>
              <FontAwesomeIcon icon={faArrowTrendUp} className={styles.posIco} />
              <span className={styles.posTxt}>{counters.positive}</span>
            </span>

            <span className={styles.count}>
              <FontAwesomeIcon icon={faArrowTrendDown} className={styles.negIco} />
              <span className={styles.negTxt}>{counters.negative}</span>
            </span>
          </div>

          <div className={styles.totalBadge}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>{metrics.overall}</span>
          </div>
        </div>
      </div>

      <div className={styles.metrics}>
        <MiniMetric label="OFENSIVO" value={metrics.offensive} tone="blue" />
        <MiniMetric label="DEFENSIVO" value={metrics.defensive} tone="yellow" />
        <MiniMetric label="APROVEIT." value={metrics.aproveitamento} tone="green" />
      </div>

      <button
        type="button"
        className={styles.bottomRowBtn}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className={styles.viewLink}>Ver ações ({actionsCount})</span>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className={styles.chevron} />
      </button>

      {open && (
        <div className={styles.expandArea}>
          <SessionAnalysisActionView actions={actions} />
        </div>
      )}
    </article>
  );
};

function MiniMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "yellow" | "green";
}) {
  return (
    <div className={styles.metricBox}>
      <div className={styles.metricHeader}>
        <span className={`${styles.metricLabel} ${styles[`tone_${tone}`]}`}>{label}</span>
        <span className={styles.metricValue}>{value}</span>
      </div>

      <div className={styles.track}>
        <div className={`${styles.fill} ${styles[`fill_${tone}`]}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default SessionAnalysisActionCard;
