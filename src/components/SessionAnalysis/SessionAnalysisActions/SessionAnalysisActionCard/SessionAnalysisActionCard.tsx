import { useMemo, useState } from "react";
import styles from "./SessionAnalysisActionCard.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faArrowTrendUp,
  faArrowTrendDown,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import SessionAnalysisActionView, {
  type AthleteAction,
} from "../SessionAnalysisActionView.tsx";

type Props = {
  initials?: string;
  title?: string;
  actions?: AthleteAction[];

  overall?: number;
  overallLabel?: string;

  offensive?: number;
  defensive?: number;
  aproveitamento?: number;

  variant?: "yellow" | "red";
  defaultOpen?: boolean;
};

const clamp01 = (n: number) => Math.max(0, Math.min(100, n));

const SessionAnalysisActionCard = ({
                                     initials = "R",
                                     title = "RW2 - Ferreira",
                                     actions = [],
                                     overall = 50,
                                     overallLabel = "GER",
                                     offensive = 50,
                                     defensive = 0,
                                     aproveitamento = 100,
                                     variant = "yellow",
                                     defaultOpen = false,
                                   }: Props) => {
  const [open, setOpen] = useState(defaultOpen);

  const counts = useMemo(() => {
    const pos = actions.filter((a) => a.type === "good").length;
    const neg = actions.filter((a) => a.type === "bad").length;
    const neu = actions.filter((a) => a.type === "neutral").length;
    return { pos, neg, neu };
  }, [actions]);

  const actionsCount = actions.length;

  return (
    <article className={`${styles.card} ${styles[`card_${variant}`]}`}>
      {/* topo */}
      <div className={styles.topRow}>
        <div className={styles.left}>
          <div className={styles.avatar}>{initials}</div>

          <div className={styles.meta}>
            <div className={styles.title}>{title}</div>
            <div className={styles.sub}>{actionsCount} ações registradas</div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.counts}>
            <span className={styles.count}>
              <FontAwesomeIcon icon={faArrowTrendUp} className={styles.posIco} />
              <span className={styles.posTxt}>{counts.pos}</span>
            </span>

            <span className={styles.count}>
              <FontAwesomeIcon
                icon={faArrowTrendDown}
                className={styles.negIco}
              />
              <span className={styles.negTxt}>{counts.neg}</span>
            </span>

            <span className={styles.count}>
              <FontAwesomeIcon icon={faMinus} className={styles.neuIco} />
              <span className={styles.neuTxt}>{counts.neu}</span>
            </span>
          </div>

          <div className={styles.overallBadge}>
            <div className={styles.overallValue}>{overall}</div>
            <div className={styles.overallLabel}>{overallLabel}</div>
          </div>
        </div>
      </div>

      {/* métricas */}
      <div className={styles.metrics}>
        <MiniMetric label="OFENSIVO" value={offensive} tone="blue" />
        <MiniMetric label="DEFENSIVO" value={defensive} tone="yellow" />
        <MiniMetric label="APROVEIT." value={aproveitamento} tone="green" />
      </div>

      {/* botão/linha */}
      <button
        type="button"
        className={styles.bottomRowBtn}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.viewLink}>Ver ações ({actionsCount})</span>
        <FontAwesomeIcon
          icon={open ? faChevronUp : faChevronDown}
          className={styles.chevron}
        />
      </button>

      {/* view expansível */}
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