import styles from "./ActionLog.module.scss";
import { useContext, useEffect, useRef, useState } from "react";
import { ToastContext } from "../../../contexts/ToastContext/ToastContext.tsx";
import { Cookies } from "react-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faXmark } from "@fortawesome/free-solid-svg-icons";
import { ActionsContext } from "../../../contexts/ActionsContext/ActionsContext.tsx";
import type { Session } from "../../../pages/Sessions";
import { useNavigate } from "react-router";
import ActionLogConfirmModal from "../ActionLog/ActionLogConfirmModal.tsx";

const COOKIE_KEY_PREFIX = "ufsm_action_log_session_";
const REDIRECT_DELAY_MS = 1000;

type ActionLog = {
  logType: 'team' | 'individual';
  session: Session;
};

const ActionLog = ({logType, session}: ActionLog) => {
  const {individualActions, teamActions, setIndividualActions, setTeamActions} = useContext(ActionsContext);
  const navigate = useNavigate();
  const cookieKey = `${COOKIE_KEY_PREFIX}${logType}${session.id}`;
  const cookiesRef = useRef(new Cookies());
  const isInitialMount = useRef(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const redirectTimeoutRef = useRef<number | null>(null);
  const selectedActions = (logType === 'individual' ? individualActions : teamActions).filter((action) => action.sessionId === session.id);
  const setActions = logType === 'individual' ? setIndividualActions : setTeamActions;
  const {success, info, error} = useContext(ToastContext);

  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    const saved = cookiesRef.current.get(cookieKey);
    if (saved) {
      try {
        const parsed = typeof saved === "string" ? JSON.parse(saved) : saved;
        if (Array.isArray(parsed)) {
          setActions(parsed);
        }
      } catch {
        // Invalid cookie, ignore silently
      }
    }
  }, [cookieKey, setActions]);

  useEffect(() => {
    if (selectedActions.length === 0) {
      cookiesRef.current.remove(cookieKey, { path: "/" });
      return;
    }

    const expires = new Date(Date.now() + 12 * 60 * 60 * 1000);

    cookiesRef.current.set(cookieKey, JSON.stringify(selectedActions), {
      path: "/",
      expires,
      sameSite: "lax",
    });
  }, [selectedActions, cookieKey]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    setActions([]);
    info("Log limpo com sucesso!");
  };

  const handleRemoveAction = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
    info("Ação removida");
  };

  const showSuccessAndRedirect = (sessionId: string) => {
    success("Ações salvas com sucesso!");
    setActions([]);
    cookiesRef.current.remove(cookieKey, { path: "/" });

    redirectTimeoutRef.current = window.setTimeout(() => {
      navigate(`/sessions/${sessionId}`);
    }, REDIRECT_DELAY_MS);
  };

  const handleSaveActions = () => {
    if (selectedActions.length === 0) {
      info("Adicione ao menos uma ação antes de salvar");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleCancelConfirmation = () => {
    if (isSaving) return;
    setIsConfirmModalOpen(false);
  };

  const handleConfirmSaveActions = async () => {
    setIsConfirmModalOpen(false);
    setIsSaving(true);

    try {
      showSuccessAndRedirect(session.id);
    } catch {
      setIsSaving(false);
      error("Falha ao salvar ações");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span>Linha do tempo de ações</span>
          <span className={styles.badge}>{selectedActions.length}</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.save} onClick={handleSaveActions} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
          <button className={styles.clear} onClick={handleClear} disabled={isSaving}>
            Limpar
          </button>
        </div>
      </div>

      {selectedActions.length === 0 ? (
        <div className={styles.emptyState}>
          <span>Sem ações taggeadas. Comece a taggear açõess e elas aparecerão aqui.</span>
        </div>
      ) : (
        <div className={styles.list}>
          {selectedActions.map((action) => (
            <div
              key={action.id}
              className={`${styles.item} ${action.goodAction ? styles.good : styles.bad}`}
            >
              <div className={styles.itemLeft}>
                <span className={styles.time}>{action.time}</span>
              </div>

              <div className={styles.itemBody}>
                <span className={styles.actionTitle}>
                  <FontAwesomeIcon icon={faBullseye} />
                  {action.title}
                </span>

                {action.player && (
                  <span className={styles.playerTag}>
                    {action.player.name} - {action.player.position}
                  </span>
                )}

                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemoveAction(action.id)}
                  aria-label="Remover ação"
                  title="Remover"
                  disabled={isSaving}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ActionLogConfirmModal
        isOpen={isConfirmModalOpen}
        isSaving={isSaving}
        onCancel={handleCancelConfirmation}
        onConfirm={handleConfirmSaveActions}
      />
    </div>
  );
};

export default ActionLog;
