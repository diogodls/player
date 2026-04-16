import { useState } from "react";
import styles from "./SessionActionCard.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faArrowTrendUp,
  faArrowTrendDown,
  faPeopleGroup,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import SessionActionView from "./SessionEntityActions/SessionEntityActions.tsx";
import type { SessionEntity } from "../../../pages/SessionView";

type Props = {
  entity: SessionEntity;
};

const SessionActionCard = ({ entity }: Props) => {
  const [open, setOpen] = useState(false);
  const actionsCount = entity.stats.total;
  const isTeam = entity.type === "team";
  const positiveActions = entity.stats.positive;
  const negativeActions = entity.stats.negative;
  const performance = entity.metrics.performance;

  return (
    <article className={`${styles.card} ${styles.card_yellow}`}>
      <div className={styles.topRow}>
        <div className={styles.left}>
          <div className={styles.playerIcon}>
            <FontAwesomeIcon icon={isTeam ? faPeopleGroup : faUser} />
          </div>

          <div className={styles.meta}>
            <div className={styles.title}>{entity.title}</div>
            <div className={styles.sub}>{actionsCount} acoes exibidas</div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.counts}>
            <span className={styles.count}>
              <FontAwesomeIcon icon={faArrowTrendUp} className={styles.posIco} />
              <span className={styles.posTxt}>{positiveActions}</span>
            </span>

            <span className={styles.count}>
              <FontAwesomeIcon icon={faArrowTrendDown} className={styles.negIco} />
              <span className={styles.negTxt}>{negativeActions}</span>
            </span>
          </div>

          <div className={styles.totalBadge}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>{actionsCount}</span>
          </div>
        </div>
      </div>

      <div className={styles.metrics}>
        <MiniMetric label="OFENSIVO" value={entity.metrics.offensive} tone="blue" />
        <MiniMetric label="DEFENSIVO" value={entity.metrics.defensive} tone="yellow" />
        <MiniMetric label="PERFORMANCE" value={performance} tone="green" />
      </div>

      <button
        type="button"
        className={styles.bottomRowBtn}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className={styles.viewLink}>Ver acoes ({actionsCount})</span>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className={styles.chevron} />
      </button>

      {open && (
        <div className={styles.expandArea}>
          <SessionActionView actions={entity.actions} />
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
        <div className={`${styles.fill} ${styles[`fill_${tone}`]}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

export default SessionActionCard;
