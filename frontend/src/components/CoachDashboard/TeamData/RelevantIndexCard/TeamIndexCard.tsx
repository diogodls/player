import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faArrowTrendDown,
  faArrowTrendUp,
  faMinus
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
  up: { icon: faArrowTrendUp, color: "#86efac", label: "Eficiência acima da média esperada" },
  stable: { icon: faMinus, color: "#facc15", label: "Eficiência estável" },
  down: { icon: faArrowTrendDown, color: "#dc2626", label: "Eficiência abaixo da média esperada" },
};

const percentageFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const TeamIndexCard = ({ index }: IndexCardProps) => {
  const phase = phaseMap[index.phase];
  const trend = trendMap[index.trend];
  const hasValue = index.value !== null;
  const formattedValue = index.value === null
    ? "Nenhum dado registrado"
    : `${percentageFormatter.format(index.value)}%`;

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
          <span className={styles.metricLabel}>Eficiência</span>
          <strong className={styles.metricValue}>{formattedValue}</strong>
        </div>
      </div>

      <div
        className={styles.progressTrack}
        aria-hidden="true"
      >
        <span
          className={`${styles.progressFill} ${styles[phase.className]}`}
          style={{ width: hasValue ? `${index.value}%` : "0%" }}
        />
      </div>
    </article>
  );
};

export default TeamIndexCard;
