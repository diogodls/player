import { useEffect, useMemo, useState } from "react";
import styles from "./SaveSessionModal.module.scss";
import type {
  SessionCourtSize,
  SessionLocation,
  SessionMeta,
  SessionType,
} from "../../../pages/Sessions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import Select from "../../elements/Select/Select.tsx";
import {
  SESSION_COURT_SIZES,
  SESSION_LOCATIONS,
  SESSION_TYPES,
} from "../../../constants/sessions.ts";

type SaveSessionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: SessionMeta) => Promise<void>;
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

function getInitialFormState(initialMeta?: SessionMeta | null): SessionMeta {
  if (!initialMeta) {
    return {
      type: SESSION_TYPES[0],
      date: todayISO(),
      local: SESSION_LOCATIONS[0],
      courtSize: SESSION_COURT_SIZES[0],
      description: "",
    };
  }

  return {
    type: initialMeta.type,
    date: toInputDate(initialMeta.date),
    local: initialMeta.local,
    courtSize: initialMeta.courtSize,
    description: initialMeta.description ?? "",
  };
}

const SaveSessionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialMeta,
  mode = "create",
}: SaveSessionModalProps) => {
  const initialState = useMemo(
    () => getInitialFormState(initialMeta),
    [initialMeta],
  );
  const [type, setType] = useState<SessionType>(initialState.type);
  const [date, setDate] = useState<string>(initialState.date);
  const [local, setLocal] = useState<SessionLocation>(initialState.local);
  const [courtSize, setCourtSize] = useState<SessionCourtSize>(
    initialState.courtSize,
  );
  const [description, setDescription] = useState(initialState.description);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setType(initialState.type);
    setDate(initialState.date);
    setLocal(initialState.local);
    setCourtSize(initialState.courtSize);
    setDescription(initialState.description);
  }, [initialState, isOpen]);

  const canSubmit = useMemo(() => {
    return Boolean(date.trim() && local && courtSize && description.trim());
  }, [date, local, courtSize, description]);

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        date,
        local,
        courtSize,
        description: description.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === "edit" ? "Editar Treino/Jogo" : "Novo Treino/Jogo"}
          </h2>
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
            options={SESSION_TYPES.map((sessionType) => ({
              value: sessionType,
              label: sessionType,
            }))}
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

          <Select<SessionLocation>
            className={styles.field}
            label="Local *"
            name="session-location"
            value={local}
            options={SESSION_LOCATIONS.map((sessionLocation) => ({
              value: sessionLocation,
              label: sessionLocation,
            }))}
            onChange={(value) => {
              if (value) setLocal(value);
            }}
          />

          <Select<SessionCourtSize>
            className={styles.field}
            label="Tamanho da quadra *"
            name="session-court-size"
            value={courtSize}
            options={SESSION_COURT_SIZES.map((sessionCourtSize) => ({
              value: sessionCourtSize,
              label: sessionCourtSize,
            }))}
            onChange={(value) => {
              if (value) setCourtSize(value);
            }}
          />

          <div className={styles.field}>
            <label className={styles.label}>
              {type === "Treino" ? "Descricao do treino *" : "Adversario *"}
            </label>
            <input
              className={styles.input}
              placeholder={
                type === "Treino"
                  ? "Ex: saida de pressao, bolas paradas..."
                  : "Ex: Atlantico, ACBF..."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            disabled={!canSubmit || isSubmitting}
          >
            {mode === "edit" ? "Salvar" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveSessionModal;
