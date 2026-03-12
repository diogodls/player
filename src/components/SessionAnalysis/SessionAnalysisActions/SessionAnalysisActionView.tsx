import styles from "./SessionAnalysisActionView.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleXmark, faClock } from "@fortawesome/free-solid-svg-icons";
import type { SessionAnalysisAthleteAction } from "../../../pages/SessionAnalysis";

type Props = {
  actions: SessionAnalysisAthleteAction[];
};

function iconByType(type: SessionAnalysisAthleteAction["type"]) {
  if (type === "good") return faCircleCheck;
  return faCircleXmark;
}

export default function SessionAnalysisActionView({ actions }: Props) {
  if (!actions.length) {
    return <div className={styles.empty}>Sem ações para este atleta.</div>;
  }

  return (
    <div className={styles.list}>
      {actions.map((a) => (
        <div key={a.id} className={styles.row}>
          <div className={`${styles.icon} ${styles[`icon_${a.type}`]}`}>
            <FontAwesomeIcon icon={iconByType(a.type)} />
          </div>

          <div className={styles.main}>
            <div className={styles.title}>{a.title}</div>
            {a.subtitle && <div className={styles.subtitle}>{a.subtitle}</div>}
          </div>

          <div className={styles.meta}>
            {a.time && <span className={styles.time}>{a.time}</span>}
            {a.createdAt && (
              <span className={styles.clock}>
                <FontAwesomeIcon icon={faClock} />
                {a.createdAt}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
