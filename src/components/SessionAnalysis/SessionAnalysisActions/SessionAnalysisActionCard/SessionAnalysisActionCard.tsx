import { useMemo, useState } from "react";
import styles from "./SessionAnalysisActionCard.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faArrowTrendUp,
  faArrowTrendDown,
} from "@fortawesome/free-solid-svg-icons";
import SessionAnalysisActionView from "../SessionAnalysisActionView.tsx";
import type { SessionAnalysisAthlete } from "../../../../pages/SessionAnalysis";

type Props = SessionAnalysisAthlete;

const clamp01 = (n: number) => Math.max(0, Math.min(100, n));

const SessionAnalysisActionCard = ({
  initials,
  title,
  actions,
  metrics,
  variant = "yellow",
  defaultOpen = false,
}: Props) => {
  const [open, setOpen] = useState(defaultOpen);

  const counts = useMemo(() => {
    const pos = actions.filter((a) => a.type === "good").length;
    const neg = actions.filter((a) => a.type === "bad").length;
    return { pos, neg };
  }, [actions]);

  const actionsCount = actions.length;

  return (
    <article className={`${styles.card} ${styles[`card_${variant}`]}`}>
      <div className={styles.topRow}>
        <div className={styles.left}>
          <div className={styles.avatar}>{initials}</div>

          <div className={styles.meta}>
            <div className={styles.title}>{title}</div>
            <div className={styles.sub}>{actionsCount} acoes registradas</div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.counts}>
            <span className={styles.count}>
              <FontAwesomeIcon icon={faArrowTrendUp} className={styles.posIco} />
              <span className={styles.posTxt}>{counts.pos}</span>
            </span>

            <span className={styles.count}>
              <FontAwesomeIcon icon={faArrowTrendDown} className={styles.negIco} />
              <span className={styles.negTxt}>{counts.neg}</span>
            </span>
          </div>

          <div className={styles.overallBadge}>
            <div className={styles.overallValue}>{metrics.overall}</div>
            <div className={styles.overallLabel}>{metrics.overallLabel}</div>
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
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.viewLink}>Ver acoes ({actionsCount})</span>
        <FontAwesomeIcon
          icon={open ? faChevronUp : faChevronDown}
          className={styles.chevron}
        />
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
  const v = clamp01(value);

  return (
    <div className={styles.metricBox}>
      <div className={styles.metricHeader}>
        <span className={`${styles.metricLabel} ${styles[`tone_${tone}`]}`}>
          {label}
        </span>
        <span className={styles.metricValue}>{v}</span>
      </div>

      <div className={styles.track}>
        <div
          className={`${styles.fill} ${styles[`fill_${tone}`]}`}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

export default SessionAnalysisActionCard;
