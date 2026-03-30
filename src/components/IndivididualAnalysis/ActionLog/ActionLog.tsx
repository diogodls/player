import styles from "./ActionLog.module.scss";
import { useContext, useEffect, useRef, useState } from "react";
import { ToastContext } from "../../../contexts/ToastContext/ToastContext.tsx";
import { useCookies } from "react-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faXmark } from "@fortawesome/free-solid-svg-icons";
import { ActionsContext } from "../../../contexts/ActionsContext/ActionsContext.tsx";
import type { Session } from "../../../pages/SessionView";
import type { ActionTagged } from "../../../pages/IndividualAnalysis";
import type {
  SessionAnalysisByIdData,
  SessionAnalysisData,
  SessionAnalysisRawAction,
  SessionAnalysisRawPlayer,
  SessionAnalysisRawTeam,
} from "../../../pages/SessionAnalysis";
import { useNavigate } from "react-router";
import { useSWRConfig } from "swr";

const COOKIE_KEY_PREFIX = "ufsm_action_log_session_";
const REDIRECT_DELAY_MS = 1000;

type ActionLogProps = {
  session: Session;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function classifyMetricBucket(action: ActionTagged): "offensive" | "defensive" {
  const normalizedCategory = normalizeText(action.category ?? "");
  const hasDefensiveHint =
    normalizedCategory.includes("defens") || normalizedCategory.includes("gols tomados");

  return hasDefensiveHint ? "defensive" : "offensive";
}

function toRawAction(action: ActionTagged): SessionAnalysisRawAction {
  return {
    time: action.time,
    key: action.key ?? action.title,
    label: action.title,
    type: action.goodAction ? "positive" : "negative",
  };
}

function buildSessionAnalysisById(actions: ActionTagged[]): SessionAnalysisByIdData {
  const playersById = new Map<string, SessionAnalysisRawPlayer>();
  const teamActions: SessionAnalysisRawAction[] = [];

  let teamOffensive = 0;
  let teamDefensive = 0;
  let teamPositive = 0;
  let teamNegative = 0;

  actions.forEach((action) => {
    if (!action.player?.id) return;

    const playerId = String(action.player.id);
    const metricBucket = classifyMetricBucket(action);
    const rawAction = toRawAction(action);

    teamActions.push(rawAction);
    if (metricBucket === "offensive") teamOffensive += 1;
    if (metricBucket === "defensive") teamDefensive += 1;
    if (rawAction.type === "positive") teamPositive += 1;
    if (rawAction.type === "negative") teamNegative += 1;

    const current = playersById.get(playerId) ?? {
      playerId,
      offensive: 0,
      defensive: 0,
      positive: 0,
      negative: 0,
      actions: [],
    };

    current.actions.push(rawAction);
    if (metricBucket === "offensive") current.offensive += 1;
    if (metricBucket === "defensive") current.defensive += 1;
    if (rawAction.type === "positive") current.positive += 1;
    if (rawAction.type === "negative") current.negative += 1;

    playersById.set(playerId, current);
  });

  const team: SessionAnalysisRawTeam = {
    offensive: teamOffensive,
    defensive: teamDefensive,
    positive: teamPositive,
    negative: teamNegative,
    actions: teamActions,
  };

  return {
    players: Array.from(playersById.values()),
    team,
  };
}

const ActionLog = ({ session }: ActionLogProps) => {
  const { actions, setActions } = useContext(ActionsContext);
  const { success, info, error } = useContext(ToastContext);
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const cookieKey = `${COOKIE_KEY_PREFIX}${session.id}`;
  const [cookies, setCookie, removeCookie] = useCookies([cookieKey]);
  const hasLoadedCookie = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const redirectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const raw = cookies[cookieKey];

    hasLoadedCookie.current = true;
    if (!raw) {
      setActions([]);
      return;
    }

    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) setActions(parsed);
    } catch {
      removeCookie(cookieKey, { path: "/" });
      setActions([]);
    }
  }, [cookieKey, cookies, removeCookie, setActions]);

  useEffect(() => {
    if (!hasLoadedCookie.current) return;

    if (actions.length === 0) {
      removeCookie(cookieKey, { path: "/" });
      return;
    }

    const expires = new Date(Date.now() + 12 * 60 * 60 * 1000);

    setCookie(cookieKey, JSON.stringify(actions), {
      path: "/",
      expires,
      sameSite: "lax",
    });
  }, [actions, cookieKey, setCookie, removeCookie]);

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
    info("Acao removida");
  };

  const persistSessionAnalysis = async (sessionId: string, currentActions: ActionTagged[]) => {
    const sessionAnalysisById = buildSessionAnalysisById(currentActions);

    await mutate<SessionAnalysisData>(
      "session-analysis",
      (currentData) => ({
        ...(currentData ?? {}),
        [sessionId]: sessionAnalysisById,
      }),
      false
    );
  };

  const showSuccessAndRedirect = (sessionId: string) => {
    success("Ações salvas com sucesso!");
    setActions([]);
    removeCookie(cookieKey, { path: "/" });

    redirectTimeoutRef.current = window.setTimeout(() => {
      navigate(`/sessions/${sessionId}`);
    }, REDIRECT_DELAY_MS);
  };

  const handleSaveActions = () => {
    if (actions.length === 0) {
      info("Adicione ao menos uma acao antes de salvar");
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
      await persistSessionAnalysis(session.id, actions);
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
          <span className={styles.badge}>{actions.length}</span>
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

      {actions.length === 0 ? (
        <div className={styles.emptyState}>
          <span>Sem ações taggeadas. Comece a taggear ações e elas aparecerao aqui.</span>
        </div>
      ) : (
        <div className={styles.list}>
          {actions.map((action) => (
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
                  aria-label="Remover acao"
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

      {isConfirmModalOpen && (
        <div className={styles.confirmOverlay} onMouseDown={handleCancelConfirmation}>
          <div className={styles.confirmModal} onMouseDown={(event) => event.stopPropagation()}>
            <h3>Deseja confirmar envio?</h3>
            <p>As ações desta sessão serão salvas para a visualização de analise.</p>

            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.confirmCancel}
                onClick={handleCancelConfirmation}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.confirmSubmit}
                onClick={handleConfirmSaveActions}
                disabled={isSaving}
              >
                Confirmar envio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionLog;
