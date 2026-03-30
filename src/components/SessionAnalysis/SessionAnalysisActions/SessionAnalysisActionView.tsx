import styles from "./SessionAnalysisActionView.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import type { SessionItemAction } from "../../../pages/SessionAnalysis";

type Props = {
  actions: SessionItemAction[];
};

function iconByType(goodAction: SessionItemAction["goodAction"]) {
  return goodAction ? faCircleCheck : faCircleXmark;
}

export default function SessionAnalysisActionView({ actions }: Props) {
  if (!actions.length) {
    return <div className={styles.empty}>Sem acoes para este item.</div>;
  }

  return (
    <div className={styles.list}>
      {actions.map((action, index) => (
        <div key={`${action.key}-${action.time}-${index}`} className={styles.row}>
          <div className={`${styles.icon} ${styles[`icon_${action.goodAction ? "good" : "bad"}`]}`}>
            <FontAwesomeIcon icon={iconByType(action.goodAction)} />
          </div>

          <div className={styles.main}>
            <div className={styles.title}>{action.label}</div>
            <div className={styles.subtitle}>{action.category}</div>
          </div>

          <div className={styles.meta}>
            <span className={styles.time}>{action.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
