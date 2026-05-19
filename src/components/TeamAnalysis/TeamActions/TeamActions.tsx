import styles from './TeamActions.module.scss';
import {useContext} from "react";
import type {Action} from "../../../pages/Analysis";
import {ActionsContext} from "../../../contexts/ActionsContext/ActionsContext.tsx";
import type {ActionTagged} from "../../../pages/Analysis";
import { uid } from 'uid';
import ActionsList from "../../elements/ActionsList/ActionsList.tsx";
import type {Session} from "../../../pages/Sessions";
import {ToastContext} from "../../../contexts/ToastContext/ToastContext.tsx";

type TeamActions = {
  actions: Action[];
  session: Session;
}

const TeamActions = ({actions, session}: TeamActions) => {
  const {setTeamActions, currentVideoTime, videoRef} = useContext(ActionsContext);
  const {error} = useContext(ToastContext);

  const handleActionClick = (action: Action) => {
    if (!videoRef.current) {
      error("O vídeo precisa estar definido");
      return;
    }

    const actionTagged = {
      id: uid(),
      sessionId: session.id,
      goodAction: action.goodAction,
      title: action.label,
      key: action.key,
      category: action.category,
      time: currentVideoTime,
      type: 'team'
    } as ActionTagged;

    setTeamActions((actions) => [...actions, actionTagged]);
  }

  return (
    <ActionsList actions={actions} handleActionClick={handleActionClick} className={styles.actionsListPadding}/>
  );
};

export default TeamActions;