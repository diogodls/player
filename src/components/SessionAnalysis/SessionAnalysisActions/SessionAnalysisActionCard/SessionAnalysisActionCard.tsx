import styles from "./SessionAnalysisActionCard.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faArrowTrendUp,
  faArrowTrendDown,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  initials?: string;          // letra dentro do círculo (ex: "R")
  title?: string;             // ex: "RW2 - Ferreira"
  actionsCount?: number;      // ex: 1

  positives?: number;         // ex: 1
  negatives?: number;         // ex: 0
  neutrals?: number;          // ex: 0

  overall?: number;           // ex: 50
  overallLabel?: string;      // ex: "GER"

  offensive?: number;         // 0-100
  defensive?: number;         // 0-100
  aproveitamento?: number;    // 0-100

  variant?: "yellow" | "red"; // pra trocar o “clima” do card (igual no print)
};

const clamp01 = (n: number) => Math.max(0, Math.min(100, n));

const SessionAnalysisActionCard = ({
                                     initials = "R",
                                     title = "RW2 - Ferreira",
                                     actionsCount = 1,
                                     positives = 1,
                                     negatives = 0,
                                     neutrals = 0,
                                     overall = 50,
                                     overallLabel = "GER",
                                     offensive = 50,
                                     defensive = 0,
                                     aproveitamento = 100,
                                     variant = "yellow",
                                   }: Props) => {
  const verAcoesText = `Ver ações (${actionsCount})`;

  return (
    <article className={`${styles.card} ${styles[`card_${variant}`]}`}>
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
              <span className={styles.posTxt}>{positives}</span>
            </span>

            <span className={styles.count}>
              <FontAwesomeIcon
                icon={faArrowTrendDown}
                className={styles.negIco}
              />
              <span className={styles.negTxt}>{negatives}</span>
            </span>

            <span className={styles.count}>
              <FontAwesomeIcon icon={faMinus} className={styles.neuIco} />
              <span className={styles.neuTxt}>{neutrals}</span>
            </span>
          </div>

          <div className={styles.overallBadge}>
            <div className={styles.overallValue}>{overall}</div>
            <div className={styles.overallLabel}>{overallLabel}</div>
          </div>
        </div>
      </div>

      <div className={styles.metrics}>
        <MiniMetric label="OFENSIVO" value={offensive} tone="blue" />
        <MiniMetric label="DEFENSIVO" value={defensive} tone="yellow" />
        <MiniMetric label="APROVEIT." value={aproveitamento} tone="green" />
      </div>

      <div className={styles.bottomRow}>
        <span className={styles.viewLink}>{verAcoesText}</span>
        <FontAwesomeIcon icon={faChevronDown} className={styles.chevron} />
      </div>
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