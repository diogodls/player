import styles from "./SessionEntityActions.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleInfo,
  faCircleXmark,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import type { SessionEntityAction } from "../../../../pages/SessionView";

type Props = {
  actions: SessionEntityAction[];
  deletingActionId: string | null;
  onDeleteAction: (action: SessionEntityAction) => void;
};

function iconByType(outcome: SessionEntityAction["outcome"]) {
  if (outcome === "positive") return faCircleCheck;
  if (outcome === "negative") return faCircleXmark;
  return faCircleInfo;
}

const SessionEntityActions = ({
  actions,
  deletingActionId,
  onDeleteAction,
}: Props) => {
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
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => onDeleteAction(action)}
              disabled={deletingActionId === action.id}
              aria-label={`Excluir ação ${action.title}`}
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionEntityActions;
