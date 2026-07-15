import styles from "./ActionsList.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBullseye, faMinus} from "@fortawesome/free-solid-svg-icons";
import type {Action} from "../../../pages/Analysis";
import {useMemo} from "react";
import {groupActions} from "../../../utils/groupActions.ts";

type ActionsList = {
  actions: Action[];
  handleActionClick: (action: Action) => void;
  className?: string;
}

const ActionsList = ({actions, handleActionClick, className}: ActionsList) => {
  const groupedActions = useMemo( () => groupActions(actions), [actions]);

  return (
    <div className={`${styles.actions} ${className}`}>
      {Object.entries(groupedActions).map(([title, actions]) => (
        <div className={styles.actionsType} key={title}>
          <span className={styles.actionsTitle}>
            {title}
          </span>
          <div className={styles.tagActions}>
            {actions.map((action) => {
              const actionTag = {
                ...action,
                category: title
              };

              return (
                <button
                  type={"button"}
                  className={`${styles.action} ${action.goodAction ? styles.goodAction : styles.badAction}`}
                  title={action.key}
                  key={action.key}
                  onClick={() => handleActionClick(actionTag)}
                >
                  <FontAwesomeIcon icon={action.goodAction ? faBullseye : faMinus}/>
                  <span>{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActionsList;
