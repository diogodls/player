import styles from "./ActionLog.module.scss";
import {useContext, useEffect, useRef, useState} from "react";
import {ToastContext} from "../../../contexts/ToastContext/ToastContext.tsx";
import { useCookies } from "react-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faXmark } from "@fortawesome/free-solid-svg-icons";
import {ActionsContext} from "../../../contexts/ActionsContext/ActionsContext.tsx";
import SaveSessionModal from "../SaveSessionModal/SaveSessionModal";
import type { SessionMeta } from "../../../pages/SessionScreen/index";

const COOKIE_KEY = "ufsm_action_log";

const ActionLog = () => {
  const {actions, setActions} = useContext(ActionsContext);
  const {success, info, error} = useContext(ToastContext);
  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_KEY]);
  const hasLoadedCookie = useRef(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useEffect(() => {
    const raw = cookies[COOKIE_KEY];

    hasLoadedCookie.current = true;
    if (!raw) return;
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) setActions(parsed);
    } catch {
      removeCookie(COOKIE_KEY, { path: "/" });
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedCookie.current) return;

    // if (actions.length === 0) { pra quando n tiver acoes apagar os cookies, deixei -1 pra testar
    if (actions.length === -1) {
      removeCookie(COOKIE_KEY, { path: "/" });
      return;
    }

    const expires = new Date(Date.now() + 12 * 60 * 60 * 1000);

    setCookie(COOKIE_KEY, JSON.stringify(actions), {
      path: "/",
      expires,
      sameSite: "lax",
    });
  }, [actions, setCookie, removeCookie]);

  const handleClear = () => {
    setActions([]);
    info("Log limpo com sucesso!");
  };

  const handleRemoveAction = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
    info("Ação removida");
  };

  const handleSave = async () => {
    try {
      // futuro: mandar pro backend
      console.table(actions);
      setIsSaveModalOpen(true);
    } catch {
      error("Falha ao salvar no banco");
    }
  };

  const handleSubmitSession = async (meta: SessionMeta) => {
    try {
      const payload = {
        session: meta,
        actions,
        savedAt: new Date().toISOString(),
      };

      // futuro: mandar pro backend
      console.log("PAYLOAD SALVO:", payload);
      console.table(actions);

      setActions([]);
      success("Salvo com sucesso!");
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
          <button className={styles.save} onClick={handleSave}>
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
      <SaveSessionModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSubmit={handleSubmitSession}
        title="Novo Treino/Jogo"
      />
    </div>
  );
};

export default ActionLog;
