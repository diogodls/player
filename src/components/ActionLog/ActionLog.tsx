import styles from "./ActionLog.module.scss"
import {useEffect, useState} from "react";
import { useToast} from "../../contexts/ToastContext.tsx";
import { useCookies } from "react-cookie";


type TaggedAction = {
  id: string;
  time: string;
  title: string;
  type: "good" | "bad" | "neutral";
  player?: string;
};

const COOKIE_KEY = "ufsm_action_log";

const actionsMock: TaggedAction[] = [
  {
    id: "a1",
    time: "00:12",
    title: "Pressão alta bem executada",
    type: "good",
    player: "Ala",
  },
  {
    id: "a2",
    time: "00:27",
    title: "Passe errado na saída",
    type: "bad",
    player: "Fixo",
  },
  {
    id: "a3",
    time: "01:05",
    title: "Finalização perigosa",
    type: "good",
    player: "Pivô",
  },
  {
    id: "a4",
    time: "01:34",
    title: "Falha de cobertura",
    type: "bad",
    player: "Ala",
  },
  {
    id: "a5",
    time: "02:10",
    title: "Reposição rápida",
    type: "good",
    player: "Goleiro",
  },
  {
    id: "a6",
    time: "03:02",
    title: "Falta tática",
    type: "neutral",
    player: "Fixo",
  },
];

const ActionLog = () => {
  const toast = useToast();
  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_KEY]);
  const [actions, setActions] = useState<TaggedAction[]>(actionsMock);

  const handleClear = () => {
    setActions([]);
    removeCookie(COOKIE_KEY, { path: "/" });
  };

  useEffect(() => {
    const raw = cookies[COOKIE_KEY];
    if (!raw) return;

    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) setActions(parsed);
    } catch {

    }
  }, [cookies]);

  const handleSave = () => {
    console.table(actions);
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
    setCookie(COOKIE_KEY, JSON.stringify(actions), {
      path: "/",
      expires,
      sameSite: "lax",
    });

    setActions([]);
    toast.success("Salvo com sucesso!");
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
                <div className={styles.itemTop}>
                  <span>{action.title}</span>
                  {action.player && (
                    <span className={styles.playerTag}>{action.player}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionLog