import { useMemo, useState } from "react";
import styles from "./SaveSessionModal.module.scss";
import type { SessionMeta, SessionType } from "../../../pages/Sessions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import Select from "../../elements/Select/Select.tsx";

type SaveSessionModal = {
  isOpen: boolean;
  onClose: () => void;
  initialMeta?: SessionMeta | null;
  mode?: "create" | "edit";
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toInputDate(value?: string) {
  if (!value) return todayISO();
  if (value.includes("-")) return value;

  const [day, month, year] = value.split("/");
  if (!day || !month || !year) return todayISO();
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function getInitialFormState(initialMeta?: SessionMeta | null) {
  if (!initialMeta) {
    return {
      type: "Treino" as SessionType,
      date: todayISO(),
      local: "",
      description: "",
      opponent: "",
    };
  }

  return {
    type: initialMeta.type,
    date: toInputDate(initialMeta.date),
    local: initialMeta.local ?? "",
    description: initialMeta.description ?? "",
    opponent: initialMeta.opponent ?? "",
  };
}

const SaveSessionModal = ({ isOpen, onClose, initialMeta, mode = "create" }: SaveSessionModal) => {
  const [initialState] = useState(() => getInitialFormState(initialMeta));
  const [type, setType] = useState<SessionType>(initialState.type);
  const [date, setDate] = useState<string>(initialState.date);
  const [local, setLocal] = useState(initialState.local);
  const [description, setDescription] = useState(initialState.description);
  const [opponent, setOpponent] = useState(initialState.opponent);

  const canSubmit = useMemo(() => {
    if (!date.trim() || !local.trim()) return false;
    if (type === "Treino") return description.trim().length > 0;
    return opponent.trim().length > 0;
  }, [type, date, local, description, opponent]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{mode === "edit" ? "Editar Treino/Jogo" : "Novo Treino/Jogo"}</h2>
          <button className={styles.close} onClick={onClose} aria-label="Fechar">
            <FontAwesomeIcon icon={faX} />
          </button>
        </div>

        <div className={styles.form}>
          <Select<SessionType>
            className={styles.field}
            label="Tipo *"
            name="session-type"
            value={type}
            options={[
              { value: "Treino", label: "Treino" },
              { value: "Jogo", label: "Jogo" },
            ]}
            onChange={(value) => {
              if (value) setType(value);
            }}
          />

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
            onClick={onClose}
            disabled={!canSubmit}
          >
            {mode === "edit" ? "Salvar" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveSessionModal;
