import styles from "./TeamActions.module.scss";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CatalogAction, CatalogGroup } from "../../../pages/Analysis";
import { ActionsContext } from "../../../contexts/ActionsContext/ActionsContext.tsx";
import ActionsList from "../../elements/ActionsList/ActionsList.tsx";
import type { Session } from "../../../pages/Sessions";
import { ToastContext } from "../../../contexts/ToastContext/ToastContext.tsx";
import TeamActionContextModal from "../TeamActionContextModal/TeamActionContextModal.tsx";
import { createTeamTaggedAction } from "./createTeamTaggedAction.ts";

type PendingTeamSelection = {
  action: CatalogAction;
  group: CatalogGroup;
  capturedTime: string;
};

type TeamActions = {
  groups: CatalogGroup[];
  session: Session;
};

const TeamActions = ({ groups, session }: TeamActions) => {
  const { setTeamActions, currentVideoTime, isVideoLoaded, setIsTagging } =
    useContext(ActionsContext);
  const { error } = useContext(ToastContext);
  const [selection, setSelection] = useState<PendingTeamSelection | null>(null);

  const orderedGroups = useMemo(
    () =>
      [...groups]
        .sort((left, right) => left.order - right.order)
        .map((group) => ({
          ...group,
          actions: [...group.actions].sort(
            (left, right) => left.order - right.order,
          ),
          contexts: [...(group.contexts ?? [])].sort(
            (left, right) => left.order - right.order,
          ),
        })),
    [groups],
  );

  useEffect(() => {
    setIsTagging(selection !== null);
    return () => setIsTagging(false);
  }, [selection, setIsTagging]);

  const closeContextModal = useCallback(() => setSelection(null), []);

  const handleActionClick = (action: CatalogAction, group: CatalogGroup) => {
    if (!isVideoLoaded) {
      error("O vídeo precisa estar definido");
      return;
    }

    setSelection({ action, group, capturedTime: currentVideoTime });
  };

  const handleContextSelect = (
    context: NonNullable<CatalogGroup["contexts"]>[number],
  ) => {
    if (!selection) return;
    const actionTagged = createTeamTaggedAction(
      selection.action,
      selection.group,
      context,
      session,
      selection.capturedTime,
    );
    setTeamActions((actions) => [...actions, actionTagged]);
    setSelection(null);
  };

  return (
    <>
      <ActionsList
        groups={orderedGroups}
        handleActionClick={handleActionClick}
        className={styles.actionsListPadding}
      />
      {selection && (
        <TeamActionContextModal
          action={selection.action}
          group={selection.group}
          onClose={closeContextModal}
          onSelect={handleContextSelect}
        />
      )}
    </>
  );
};

export default TeamActions;
