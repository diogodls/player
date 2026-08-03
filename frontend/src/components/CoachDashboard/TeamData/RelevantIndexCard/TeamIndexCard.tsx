import styles from "./TeamIndexCard.module.scss";
import type { TeamIndex } from "../../../../pages/CoachDashboard";

type IndexCardProps = {
  index: TeamIndex;
};

const phaseMap: Record<
  TeamIndex["phase"],
  { label: string; className: string }
> = {
  offensive: { label: "Ofensivo", className: "offensive" },
  defensive: { label: "Defensivo", className: "defensive" },
  "set-piece": { label: "Bola parada", className: "setPiece" },
};

const percentageFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const TeamIndexCard = ({ index }: IndexCardProps) => {
  const phase = phaseMap[index.phase];
  const hasValue =
    typeof index.value === "number" && Number.isFinite(index.value);
  const formattedValue = hasValue
    ? `${percentageFormatter.format(index.value)}%`
    : "Nenhum dado registrado";

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <span className={`${styles.phaseBadge} ${styles[phase.className]}`}>
          {phase.label}
        </span>
      </div>

      <h3 className={styles.title}>{index.title}</h3>

      <div className={styles.metrics}>
        <div className={styles.metricGroup}>
          <span className={styles.metricLabel}>Eficiência</span>
          <strong className={styles.metricValue}>{formattedValue}</strong>
        </div>
      </div>

      <div className={styles.progressTrack} aria-hidden="true">
        <span
          className={`${styles.progressFill} ${styles[phase.className]}`}
          style={{ width: hasValue ? `${Math.max(0, Math.min(100, (index.value / index.maxValue) * 100))}%` : "0%" }}
        />
      </div>
    </article>
  );
};

export default TeamIndexCard;
