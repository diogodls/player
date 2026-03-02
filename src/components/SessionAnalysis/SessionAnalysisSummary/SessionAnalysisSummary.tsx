import styles from "../SessionAnalysisSummary/SessionAnalysisSummary.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartColumn } from "@fortawesome/free-solid-svg-icons";

type Props = {
  positives?: number;
  negatives?: number;
  neutrals?: number;
};

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

const SessionAnalysisSummary = ({positives = 10, negatives = 1, neutrals = 0}: Props) => {
  const total = positives + negatives + neutrals;

  const pPos = pct(positives, total);
  const pNeg = pct(negatives, total);
  const pNeu = Math.max(0, 100 - pPos - pNeg); // garante 100%

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <FontAwesomeIcon icon={faChartColumn} className={styles.headerIcon} />
        <span className={styles.headerTitle}>Resumo Geral das Ações</span>
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

        <div className={`${styles.card} ${styles.cardNeutral}`}>
          <div className={styles.value}>{neutrals}</div>
          <div className={styles.label}>Neutras</div>
        </div>
      </div>

      <div className={styles.progressRow}>
        <div className={styles.progressMeta}>
          <span className={styles.metaLeft}>{pPos}% positivas</span>
          <span className={styles.metaRight}>{pNeg}% negativas</span>
        </div>

        <div className={styles.progressTrack} aria-label="Distribuição das ações">
          <div className={styles.progressCenter}>{total} ações totais</div>

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
          <div
            className={`${styles.progressSeg} ${styles.segNeutral}`}
            style={{ width: `${pNeu}%` }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
};

export default SessionAnalysisSummary;