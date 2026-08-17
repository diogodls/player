import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import type {
  CatalogAction,
  CatalogGroup,
  TeamActionContext,
} from "../../../pages/Analysis";
import styles from "./TeamActionContextModal.module.scss";

type TeamActionContextModalProps = {
  action: CatalogAction;
  group: CatalogGroup;
  onClose: () => void;
  onSelect: (context: TeamActionContext) => void;
};

const TeamActionContextModal = ({
  action,
  group,
  onClose,
  onSelect,
}: TeamActionContextModalProps) => {
  const contexts = [...(group.contexts ?? [])].sort(
    (left, right) => left.order - right.order,
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-context-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h2 id="team-context-modal-title">Selecionar contexto</h2>
            <p>
              {group.title} · <strong>{action.name}</strong>
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar modal de contexto"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>

        <div className={styles.contexts}>
          {contexts.map((context) => (
            <button
              type="button"
              className={styles.contextButton}
              key={context.id}
              onClick={() => onSelect(context)}
            >
              {context.name}
            </button>
          ))}
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Cancelar
          </button>
        </footer>
      </section>
    </div>
  );
};

export default TeamActionContextModal;
