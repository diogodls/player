import styles from "./ActionLog.module.scss";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../../contexts/ToastContext.tsx";
import { useCookies } from "react-cookie";
import type { Player } from "../../pages/CoachDashboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faXmark } from "@fortawesome/free-solid-svg-icons";

type TaggedAction = {
  id: string;
  time: string;
  title: string;
  type: "good" | "bad" | "neutral";
  player: Player;
};

const COOKIE_KEY = "ufsm_action_log";

// TODO: apagar aqui @diogoddls
const actionsMock: TaggedAction[] = [
  {
    id: "a1",
    time: "00:12",
    title: "Pressão alta bem executada",
    type: "good",
    player: {
      id: 1,
      name: "Guedes",
      overall: 96,
      position: "Ala",
      minutes: 36,
      defensiveActions: 42,
      offensiveActions: 46,
      goalsTaken: 28,
      goals: 10,
    },
  },
  {
    id: "a2",
    time: "00:27",
    title: "Passe errado na saída",
    type: "bad",
    player: {
      id: 2,
      name: "Guga",
      overall: 76,
      position: "Ala",
      minutes: 36,
      defensiveActions: 42,
      offensiveActions: 46,
      goalsTaken: 28,
      goals: 10,
    },
  },
];

const ActionLog = () => {
  const toast = useToast();
  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_KEY]);
  const [actions, setActions] = useState<TaggedAction[]>(actionsMock);
  const hasLoadedCookie = useRef(false);

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

    if (actions.length === 0) {
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
    toast.success("Log limpo com sucesso!");
  };

  const handleRemoveAction = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
    toast.info("Ação removida");
  };

  const handleSave = async () => {
    try {
      // futuro: mandar pro backend
      console.table(actions);
      setActions([]);
      toast.success("Salvo com sucesso!");
    } catch {
      toast.error("Falha ao salvar no banco");
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
              className={`${styles.item} ${
                action.type === "good"
                  ? styles.good
                  : action.type === "bad"
                    ? styles.bad
                    : ""
              }`}
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
