import {useContext, useMemo} from "react";
import type {Action} from "../../../pages/Analysis";
import styles from "./TeamActions.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBullseye, faMinus} from "@fortawesome/free-solid-svg-icons";
import {agroupActions} from "../../../utils/agroupActions.ts";
import {ActionsContext} from "../../../contexts/ActionsContext/ActionsContext.tsx";
import type {ActionTagged} from "../../../pages/Analysis";
import { uid } from 'uid';

type TeamActions = {
  actions: Action[];
}

const TeamActions = ({actions}: TeamActions) => {
  const {setActions, currentVideoTime} = useContext(ActionsContext);
  const groupedActions = useMemo( () => agroupActions(actions), [actions]);

  const handleActionClick = (action: Action) => {
    const actionTagged = {
      id: uid(),
      goodAction: action.goodAction,
      title: action.label,
      time: currentVideoTime,
      type: 'team'
    } as ActionTagged;

    setActions((actions) => [...actions, actionTagged]);
  }

  return (
    <div className={styles.actions}>
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
                <span
                  className={`${styles.action} ${action.goodAction ? styles.goodAction : styles.badAction}`}
                  title={action.key}
                  key={action.key}
                  onClick={() => handleActionClick(actionTag)}
                >
                  <FontAwesomeIcon icon={action.goodAction ? faBullseye : faMinus}/>
                  <span>{action.label}</span>
                </span>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamActions;