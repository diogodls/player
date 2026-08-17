import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import type { SessionEntityAction } from "../../../pages/SessionView";
import styles from "./DeleteSessionActionModal.module.scss";

type Props = {
  action: SessionEntityAction | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const DeleteSessionActionModal = ({
  action,
  isDeleting,
  onClose,
  onConfirm,
}: Props) => {
  useEffect(() => {
    if (!action) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [action, isDeleting, onClose]);

  if (!action) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={() => !isDeleting && onClose()}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-session-action-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <FontAwesomeIcon icon={faTrashCan} />
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Fechar"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.content}>
          <h2 id="delete-session-action-title">Excluir ação?</h2>
          <p>
            Tem certeza que deseja excluir <strong>“{action.title}”</strong>?
          </p>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancel}
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.confirm}
            onClick={() => void onConfirm()}
            disabled={isDeleting}
          >
            <FontAwesomeIcon icon={faTrashCan} />
            {isDeleting ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default DeleteSessionActionModal;
