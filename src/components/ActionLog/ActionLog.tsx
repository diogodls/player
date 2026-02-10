import styles from "./ActionLog.module.scss"
//fazer: definir tamanho limite da div, ações boas(verde), ruins(vermelha)
type TaggedAction = {
  id: string;
  time: string; // "mm:ss"
  title: string;
  description?: string;
  type: "good" | "bad" | "neutral";
  player?: string;
};

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
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span>Linha do tempo de ações</span>
          <span className={styles.badge}>{actionsMock.length}</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.save}>Salvar</button>
          <button className={styles.clear}>Limpar</button>
        </div>
      </div>

      {actionsMock.length === 0 ? (
      <div className={styles.emptyState}>
        <span>Sem ações taggeadas. Comece a taggear ações e elas aparecerão aqui.</span>
      </div>
      ) : (
        <div className={styles.list}>
          {actionsMock.map((action) => (
            <div
              key={action.id}
              className={`${styles.item} ${
                action.type === "good"
                  ? styles.good
                  : action.type === "bad"
                    ? styles.bad
                    : styles.neutral
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