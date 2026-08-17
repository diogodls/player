import styles from "./SessionEntityActions.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleInfo,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import type { SessionEntityAction } from "../../../../pages/SessionView";
import { formatVideoTime } from "../../../../utils/videoTime.ts";

type Props = {
  actions: SessionEntityAction[];
};

function iconByType(outcome: SessionEntityAction["outcome"]) {
  if (outcome === "positive") return faCircleCheck;
  if (outcome === "negative") return faCircleXmark;
  return faCircleInfo;
}

const SessionEntityActions = ({ actions }: Props) => {
  if (!actions.length) {
    return <div className={styles.empty}>Sem acoes para este item.</div>;
  }

  return (
    <div className={styles.list}>
      {actions.map((action) => (
        <div key={action.id} className={styles.row}>
          <div className={`${styles.icon} ${styles[`icon_${action.outcome}`]}`}>
            <FontAwesomeIcon icon={iconByType(action.outcome)} />
          </div>

          <div className={styles.main}>
            <div className={styles.title}>
              {action.title}
              {action.contextName && ` · ${action.contextName}`}
            </div>
            <div className={styles.subtitle}>{action.category.label}</div>
          </div>

          <div className={styles.meta}>
            <span className={styles.time}>{formatVideoTime(action.time)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionEntityActions;
