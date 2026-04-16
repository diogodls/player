import styles from "./SessionEntityActions.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import type { SessionEntityAction } from "../../../../pages/SessionView";

type Props = {
  actions: SessionEntityAction[];
};

function iconByType(type: SessionEntityAction["type"]) {
  return type === "good" ? faCircleCheck : faCircleXmark;
}

const SessionEntityActions = ({ actions }: Props) => {
  if (!actions.length) {
    return <div className={styles.empty}>Sem acoes para este item.</div>;
  }

  return (
    <div className={styles.list}>
      {actions.map((action) => (
        <div key={action.id} className={styles.row}>
          <div className={`${styles.icon} ${styles[`icon_${action.type}`]}`}>
            <FontAwesomeIcon icon={iconByType(action.type)} />
          </div>

          <div className={styles.main}>
            <div className={styles.title}>{action.title}</div>
            <div className={styles.subtitle}>{action.subtitle}</div>
          </div>

          <div className={styles.meta}>
            <span className={styles.time}>{action.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionEntityActions;