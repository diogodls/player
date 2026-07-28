import styles from "./DeleteSessionModal.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import type { Session } from "../../../pages/Sessions";

type DeleteSessionModalProps = {
  isOpen: boolean;
  session: Session | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const DeleteSessionModal = ({
  isOpen,
  session,
  onClose,
  onConfirm,
}: DeleteSessionModalProps) => {
  if (!isOpen || !session) return null;

  const detail =
    session.type === "Treino"
      ? session.description
      : session.opponent ?? session.description;

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.modal}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <FontAwesomeIcon icon={faTrashCan} />
          </div>

          <button
            className={styles.close}
            onClick={onClose}
            aria-label="Fechar"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.content}>
          <h2>Remover treino/jogo</h2>
          <p>
            Esta ação excluirá o registro selecionado e não poderá ser desfeita.
          </p>

          <div className={styles.sessionCard}>
            <strong>{session.type}</strong>
            <span>{session.date}</span>
            <span>{session.local}</span>
            {detail && <span>{detail}</span>}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancel} onClick={onClose}>
            Cancelar
          </button>

          <button className={styles.confirm} onClick={onConfirm}>
            <FontAwesomeIcon icon={faTrashCan} />
            Confirmar exclusão
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSessionModal;
