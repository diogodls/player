import styles from "./AnalysisExitModal.module.scss";

type AnalysisExitModalProps = {
  onCancel: () => void;
  onDiscard: () => void;
  onSave: () => void;
};

const AnalysisExitModal = ({
  onCancel,
  onDiscard,
  onSave,
}: AnalysisExitModalProps) => {

  return (
    <div className={styles.overlay} onMouseDown={onCancel}>
      <div className={styles.modal} onMouseDown={(event) => event.stopPropagation()}>
        <h3>Deseja salvar antes de sair?</h3>
        <p>
          As ações desta análise ainda não foram finalizadas. Você pode salvar
          agora ou sair sem manter as alterações.
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onCancel}>
            Continuar editando
          </button>
          <button type="button" className={styles.discard} onClick={onDiscard}>
            Sair sem salvar
          </button>
          <button type="button" className={styles.save} onClick={onSave}>
            Salvar e sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisExitModal;
