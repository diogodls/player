import styles from "./ActionLog.module.scss"

//fazer: definir tamanho limite da div, ações boas(verde), ruins(vermelha)


const ActionLog = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span>Linha do tempo de ações</span>
          <span className={styles.badge}>0</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.save}>Salvar</button>
          <button className={styles.clear}>Limpar</button>
        </div>
      </div>

      <div className={styles.emptyState}>
        <span>Sem ações taggeadas. Comece a taggear ações e elas aparecerão aqui.</span>
      </div>
    </div>
  );
};

export default ActionLog