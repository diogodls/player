import styles from "../SessionAnalysisSummary/SessionAnalysisSummary.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartColumn } from "@fortawesome/free-solid-svg-icons";
import type { SessionAnalysisSummary as SessionAnalysisSummaryData } from "../../../pages/SessionAnalysis";

type Props = {
  summary: SessionAnalysisSummaryData;
};

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

const SessionAnalysisSummary = ({ summary }: Props) => {
  const positives = summary.positives;
  const negatives = summary.negatives;
  const total = positives + negatives;

  const pPos = pct(positives, total);
  const pNeg = Math.max(0, 100 - pPos);

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <FontAwesomeIcon icon={faChartColumn} className={styles.headerIcon} />
        <span className={styles.headerTitle}>Resumo Geral das ações</span>
      </header>

      <div className={styles.cards}>
        <div className={`${styles.card} ${styles.cardPositive}`}>
          <div className={styles.value}>{positives}</div>
          <div className={styles.label}>Positivas</div>
        </div>

        <div className={`${styles.card} ${styles.cardNegative}`}>
          <div className={styles.value}>{negatives}</div>
          <div className={styles.label}>Negativas</div>
        </div>
      </div>

      <div className={styles.progressRow}>
        <div className={styles.progressMeta}>
          <span className={styles.metaLeft}>{pPos}% positivas</span>
          <span className={styles.metaRight}>{pNeg}% negativas</span>
        </div>

        <div className={styles.progressTrack} aria-label="Distribuição das ações">

          <div
            className={`${styles.progressSeg} ${styles.segPositive}`}
            style={{ width: `${pPos}%` }}
            aria-hidden
          />
          <div
            className={`${styles.progressSeg} ${styles.segNegative}`}
            style={{ width: `${pNeg}%` }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
};

export default SessionAnalysisSummary;
