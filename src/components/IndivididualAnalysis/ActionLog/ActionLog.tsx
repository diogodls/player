import styles from "./ActionLog.module.scss";
import {useContext, useEffect, useRef} from "react";
import {ToastContext} from "../../../contexts/ToastContext/ToastContext.tsx";
import { useCookies } from "react-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faXmark } from "@fortawesome/free-solid-svg-icons";
import {ActionsContext} from "../../../contexts/ActionsContext/ActionsContext.tsx";
import type { Session } from "../../../pages/SessionView";

const COOKIE_KEY_PREFIX = "ufsm_action_log_session_";

type ActionLogProps = {
  session: Session;
};

const ActionLog = ({ session }: ActionLogProps) => {
  const {actions, setActions} = useContext(ActionsContext);
  const {success, info, error} = useContext(ToastContext);
  const cookieKey = `${COOKIE_KEY_PREFIX}${session.id}`;
  const [cookies, setCookie, removeCookie] = useCookies([cookieKey]);
  const hasLoadedCookie = useRef(false);

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

  const handleClear = () => {
    setActions([]);
    info("Log limpo com sucesso!");
  };

  const handleRemoveAction = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
    info("Ação removida");
  };

  const handleSubmitSession = async () => {
    if (actions.length === 0) {
      info("Adicione ao menos uma ação antes de salvar");
      return;
    }

    try {
      const payload = {
        sessionId: session.id,
        sessionType: session.type,
        actions,
        savedAt: new Date().toISOString(),
      };

      // futuro: mandar pro backend
      console.log("PAYLOAD SALVO:", payload);
      console.table(actions);

      setActions([]);
      success(`Análise salva para ${session.type.toLowerCase()} ${session.date}`);
    } catch {
      error("Falha ao salvar no banco");
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
          <button className={styles.save} onClick={handleSubmitSession}>
            Salvar
          </button>
          <button className={styles.clear} onClick={handleClear}>
            Limpar
          </button>
        </div>
      </div>

      {actions.length === 0 ? (
        <div className={styles.emptyState}>
          <span>Sem ações taggeadas. Comece a taggear ações e elas aparecerão aqui.</span>
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
                  aria-label="Remover ação"
                  title="Remover"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionLog;
