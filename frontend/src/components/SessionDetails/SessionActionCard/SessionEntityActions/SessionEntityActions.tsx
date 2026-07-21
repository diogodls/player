import styles from "./SessionEntityActions.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import type { SessionEntityAction } from "../../../../pages/SessionView";
import {formatVideoTime} from "../../../../utils/videoTime.ts";

type Props = {
  actions: SessionEntityAction[];
};

function iconByType(outcome: SessionEntityAction["outcome"]) {
  return outcome === "positive" ? faCircleCheck : faCircleXmark;
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
            <div className={styles.title}>{action.title}</div>
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
