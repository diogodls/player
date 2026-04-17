import styles from "./ActionLogConfirmModal.module.scss";

type ActionLogConfirmModalProps = {
  isOpen: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const ActionLogConfirmModal = ({
  isOpen,
  isSaving,
  onCancel,
  onConfirm,
}: ActionLogConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className={styles.confirmOverlay} onMouseDown={onCancel}>
      <div className={styles.confirmModal} onMouseDown={(event) => event.stopPropagation()}>
        <h3>Deseja confirmar envio?</h3>
        <p>As ações desta sessão serão salvas para a visualização de análise.</p>

        <div className={styles.confirmActions}>
          <button type="button" className={styles.confirmCancel} onClick={onCancel}>
            Cancelar
          </button>

          <button
            type="button"
            className={styles.confirmSubmit}
            onClick={onConfirm}
            disabled={isSaving}
          >
            Confirmar envio
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionLogConfirmModal;