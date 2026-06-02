import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Cookies } from "react-cookie";
import { ActionsContext } from "../contexts/ActionsContext/ActionsContext.tsx";
import { ToastContext } from "../contexts/ToastContext/ToastContext.tsx";

const COOKIE_KEY_PREFIX = "ufsm_action_log_session_";

type UseSessionExitGuardProps = {
  logType: "team" | "individual";
  sessionId: string;
};

export const useSessionExitGuard = ({
  logType,
  sessionId,
}: UseSessionExitGuardProps) => {
  const navigate = useNavigate();
  const cookies = useMemo(() => new Cookies(), []);
  const { success, info } = useContext(ToastContext);
  const {
    individualActions,
    teamActions,
    setIndividualActions,
    setTeamActions,
  } = useContext(ActionsContext);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const cookieKey = `${COOKIE_KEY_PREFIX}${logType}${sessionId}`;
  const actions = logType === "individual" ? individualActions : teamActions;
  const setActions =
    logType === "individual" ? setIndividualActions : setTeamActions;

  const sessionActions = useMemo(
    () => actions.filter((action) => action.sessionId === sessionId),
    [actions, sessionId]
  );

  const hasUnsavedChanges = sessionActions.length > 0;

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const goToSession = () => {
    navigate(`/sessions/${sessionId}`);
  };

  const clearSessionActions = () => {
    setActions((prev) => prev.filter((action) => action.sessionId !== sessionId));
    cookies.remove(cookieKey, { path: "/" });
  };

  const requestExit = () => {
    if (!hasUnsavedChanges) {
      goToSession();
      return;
    }

    setIsExitModalOpen(true);
  };

  const closeExitModal = () => {
    setIsExitModalOpen(false);
  };

  const handleExitWithoutSaving = () => {
    clearSessionActions();
    setIsExitModalOpen(false);
    info("Alterações descartadas");
    goToSession();
  };

  const handleSaveAndExit = () => {
    clearSessionActions();
    setIsExitModalOpen(false);
    success("Ações salvas com sucesso!");
    goToSession();
  };

  return {
    hasUnsavedChanges,
    isExitModalOpen,
    requestExit,
    closeExitModal,
    handleExitWithoutSaving,
    handleSaveAndExit,
  };
};
