import styles from "./SessionSummary.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartColumn } from "@fortawesome/free-solid-svg-icons";

type Props = {
  positives: number;
  negatives: number;
  positivePercentage: number;
  negativePercentage: number;
};

const SessionSummary = ({ positives, negatives, positivePercentage, negativePercentage }: Props) => {
  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <FontAwesomeIcon icon={faChartColumn} className={styles.headerIcon} />
        <span className={styles.headerTitle}>Resumo Geral das acoes</span>
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
          <span className={styles.metaLeft}>{positivePercentage}% positivas</span>
          <span className={styles.metaRight}>{negativePercentage}% negativas</span>
        </div>

        <div className={styles.progressTrack} aria-label="Distribuicao das acoes">
          <div
            className={`${styles.progressSeg} ${styles.segPositive}`}
            style={{ width: `${positivePercentage}%` }}
            aria-hidden
          />
          <div
            className={`${styles.progressSeg} ${styles.segNegative}`}
            style={{ width: `${negativePercentage}%` }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
};

export default SessionSummary;
