import {useContext} from "react";
import type {Action} from "../../../pages/Analysis";
import {ActionsContext} from "../../../contexts/ActionsContext/ActionsContext.tsx";
import type {ActionTagged} from "../../../pages/Analysis";
import { uid } from 'uid';
import ActionsList from "../../elements/ActionsList/ActionsList.tsx";

type TeamActions = {
  actions: Action[];
}

const TeamActions = ({actions}: TeamActions) => {
  const {setActions, currentVideoTime} = useContext(ActionsContext);

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
    <ActionsList actions={actions} handleActionClick={handleActionClick} />
  );
};

export default TeamActions;