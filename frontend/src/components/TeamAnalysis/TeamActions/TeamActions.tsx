import styles from "./TeamActions.module.scss";
import { useContext } from "react";
import type { CatalogAction, CatalogGroup } from "../../../pages/Analysis";
import { ActionsContext } from "../../../contexts/ActionsContext/ActionsContext.tsx";
import type { ActionTagged } from "../../../pages/Analysis";
import { uid } from "uid";
import ActionsList from "../../elements/ActionsList/ActionsList.tsx";
import type { Session } from "../../../pages/Sessions";
import { ToastContext } from "../../../contexts/ToastContext/ToastContext.tsx";

type TeamActions = {
  groups: CatalogGroup[];
  session: Session;
};

const TeamActions = ({ groups, session }: TeamActions) => {
  const { setTeamActions, currentVideoTime, isVideoLoaded } =
    useContext(ActionsContext);
  const { error } = useContext(ToastContext);

  const handleActionClick = (action: CatalogAction, category: string) => {
    if (!isVideoLoaded) {
      error("O vídeo precisa estar definido");
      return;
    }

    const actionTagged = {
      id: uid(),
      sessionId: session.id,
      catalogActionId: action.id,
      goodAction: action.impact === "POSITIVE",
      impact: action.impact,
      title: action.name,
      key: action.key,
      category,
      time: currentVideoTime,
      type: "team",
    } as ActionTagged;

    setTeamActions((actions) => [...actions, actionTagged]);
  };

  return (
    <ActionsList
      groups={groups}
      handleActionClick={handleActionClick}
      className={styles.actionsListPadding}
    />
  );
};

export default TeamActions;
