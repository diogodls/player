import {useMemo, useState} from "react";
import styles from "./SaveSessionModal.module.scss";
import type { SessionMeta, SessionType } from "../../../pages/SessionView";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";

type SaveSessionModal = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meta: SessionMeta) => void;
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const SaveSessionModal = ({isOpen, onClose, onSubmit}: SaveSessionModal) => {
  const [type, setType] = useState<SessionType>("Treino");
  const [date, setDate] = useState<string>(todayISO());
  const [local, setLocal] = useState("");
  const [description, setDescription] = useState("");
  const [opponent, setOpponent] = useState("");

  const canSubmit = useMemo(() => {
    if (!date.trim() || !local.trim()) return false;
    if (type === "Treino") return description.trim().length > 0;
    return opponent.trim().length > 0;
  }, [type, date, local, description, opponent]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const meta: SessionMeta = {
      type,
      date,
      local: local.trim(),
      ...(type === "Treino"
        ? {description: description.trim()}
        : {opponent: opponent.trim()}),
    };

    onSubmit(meta);
    onClose();
  };

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Novo Treino/Jogo</h2>
          <button className={styles.close} onClick={onClose} aria-label="Fechar">
            <FontAwesomeIcon icon={faX} />
          </button>
        </div>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Tipo *</label>
            <select
              className={styles.select}
              value={type}
              onChange={(e) => setType(e.target.value as SessionType)}
            >
              <option value="Treino">Treino</option>
              <option value="Jogo">Jogo</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Data *</label>
            <input
              className={styles.input}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {type === "Treino" ? (
            <div className={styles.field}>
              <label className={styles.label}>Descrição do Treino *</label>
              <input
                className={styles.input}
                placeholder="Ex: saída de pressão, bolas paradas..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          ) : (
            <div className={styles.field}>
              <label className={styles.label}>Adversário *</label>
              <input
                className={styles.input}
                placeholder="Ex: Atlântico, ACBF..."
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Local *</label>
            <input
              className={styles.input}
              placeholder="Ex: CEFD 1, CDM"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancel} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.primary}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
//todo: enviar para um endpoint com axios
export default SaveSessionModal;
