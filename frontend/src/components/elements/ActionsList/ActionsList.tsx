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
  groups?: ActionGroup[];
  sticky?: boolean;
}

export type ActionGroup = {
  title: string;
  actions: Action[];
};

const ActionsList = ({actions, handleActionClick, className = '', groups, sticky = true}: ActionsList) => {
  const groupedActions = useMemo( () => groupActions(actions), [actions]);
  const actionGroups = groups ?? Object.entries(groupedActions).map(([title, actions]) => ({
    title,
    actions: actions.map((action) => ({
      ...action,
      category: title,
    })),
  }));

  return (
    <div className={`${styles.actions} ${!sticky ? styles.staticActions : ''} ${className}`}>
      {actionGroups.map(({title, actions}) => (
        <div className={styles.actionsType} key={title}>
          <span className={styles.actionsTitle}>
            {title}
          </span>
          <div className={styles.tagActions}>
            {actions.map((action) => {
              const actionTag = {
                ...action,
                category: action.category
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
