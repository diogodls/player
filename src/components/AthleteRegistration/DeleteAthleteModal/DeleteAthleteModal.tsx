import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import styles from "./DeleteAthleteModal.module.scss";

type DeleteAthleteModalProps = {
  athleteName?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteAthleteModal = ({
  athleteName,
  isOpen,
  onClose,
  onConfirm,
}: DeleteAthleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.icon}>
              <FontAwesomeIcon icon={faTrash} />
            </span>
            <div>
              <h2 className={styles.title}>Excluir atleta</h2>
              <p className={styles.subtitle}>Essa ação remove o jogador da lista local.</p>
            </div>
          </div>

          <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Fechar">
            <FontAwesomeIcon icon={faX} />
          </button>
        </div>

        <p className={styles.message}>
          Tem certeza que deseja excluir {athleteName ? <strong>{athleteName}</strong> : "este atleta"}?
        </p>

        <div className={styles.actions}>
          <button className={styles.secondaryButton} type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.dangerButton} type="button" onClick={onConfirm}>
            Excluir atleta
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAthleteModal;
