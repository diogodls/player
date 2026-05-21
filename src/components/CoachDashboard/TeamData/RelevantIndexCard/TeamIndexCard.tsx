import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faArrowRightArrowLeft,
  faArrowTrendDown,
  faArrowTrendUp
} from "@fortawesome/free-solid-svg-icons";
import styles from "./TeamIndexCard.module.scss";
import type {TeamIndex} from "../../../../pages/CoachDashboard";

type IndexCardProps = {
  index: TeamIndex;
};

const phaseMap: Record<TeamIndex["phase"], { label: string; className: string }> = {
  offensive: { label: "Ofensivo", className: "offensive" },
  defensive: { label: "Defensivo", className: "defensive" },
  "set-piece": { label: "Bola parada", className: "setPiece" },
};

const trendMap: Record<TeamIndex["trend"], { icon: typeof faArrowTrendUp; color: string; label: string }> = {
  up: { icon: faArrowTrendUp, color: "#86efac", label: "Indice acima da media esperada" },
  stable: { icon: faArrowRightArrowLeft, color: "#facc15", label: "Indice estavel" },
  down: { icon: faArrowTrendDown, color: "#dc2626", label: "Indice abaixo da media esperada" },
};

const TeamIndexCard = ({ index }: IndexCardProps) => {
  const phase = phaseMap[index.phase];
  const trend = trendMap[index.trend];
  const progressValue = Math.max(0, Math.min(100, (index.value / index.maxValue) * 100));

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <span className={`${styles.phaseBadge} ${styles[phase.className]}`}>
          {phase.label}
        </span>
        <span
          className={styles.trend}
          aria-label={trend.label}
          title={trend.label}
        >
          <FontAwesomeIcon icon={trend.icon} style={{ color: trend.color }} />
        </span>
      </div>

      <h3 className={styles.title}>{index.title}</h3>

      <div className={styles.metrics}>
        <div className={styles.metricGroup}>
          <span className={styles.metricLabel}>Indice</span>
          <strong className={styles.metricValue}>{index.value}</strong>
        </div>
      </div>

      <div
        className={styles.progressTrack}
        aria-hidden="true"
      >
        <span
          className={`${styles.progressFill} ${styles[phase.className]}`}
          style={{ width: `${progressValue}%` }}
        />
      </div>
    </article>
  );
};

export default TeamIndexCard;
