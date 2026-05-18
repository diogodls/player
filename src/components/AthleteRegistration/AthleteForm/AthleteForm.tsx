import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PLAYERS_POSITIONS } from "../../../constants/players";
import styles from "./AthleteForm.module.scss";

const requiredAgeMessage = "Idade deve ser um número inteiro maior que zero";

const athleteFormSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  age: z.number().int(requiredAgeMessage).min(1, requiredAgeMessage),
  position: z
    .string()
    .refine((value) => PLAYERS_POSITIONS.includes(value), "Posição é obrigatoria"),
});

export type AthleteFormValues = z.infer<typeof athleteFormSchema>;

type AthleteFormProps = {
  isOpen: boolean;
  mode?: "create" | "edit";
  initialValues?: AthleteFormValues;
  onClose: () => void;
  onSubmit: (values: AthleteFormValues) => void;
};

const emptyValues: AthleteFormValues = {
  name: "",
  age: 1,
  position: PLAYERS_POSITIONS[0],
};

const AthleteForm = ({
  isOpen,
  mode = "create",
  initialValues,
  onClose,
  onSubmit,
}: AthleteFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AthleteFormValues>({
    resolver: zodResolver(athleteFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) return;

    reset(initialValues ?? emptyValues);
  }, [initialValues, isOpen, reset]);

  if (!isOpen) return null;

  const submitForm = handleSubmit((values) => {
    onSubmit({
      ...values,
      name: values.name.trim(),
    });
    reset(emptyValues);
  });

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {mode === "edit" ? "Editar atleta" : "Cadastrar atleta"}
            </h2>
            <p className={styles.subtitle}>
              {mode === "edit"
                ? "Atualize os dados principais do atleta selecionado."
                : "Preencha os dados principais para criar um novo atleta."}
            </p>
          </div>

          <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Fechar">
            <FontAwesomeIcon icon={faX} />
          </button>
        </div>

        <form className={styles.form} onSubmit={submitForm}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Nome *
            </label>
            <input
              id="name"
              className={styles.input}
              type="text"
              placeholder="Ex: Matheus Silva"
              {...register("name")}
            />
            {errors.name?.message && <span className={styles.error}>{errors.name.message}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="age">
                Idade *
              </label>
              <input
                id="age"
                className={styles.input}
                type="number"
                min="1"
                placeholder="Ex: 19"
                {...register("age", { valueAsNumber: true })}
              />
              {errors.age?.message && <span className={styles.error}>{errors.age.message}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="position">
                Posição *
              </label>
              <select
                id="position"
                className={styles.select}
                {...register("position")}
              >
                {PLAYERS_POSITIONS.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              {errors.position?.message && <span className={styles.error}>{errors.position.message}</span>}
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.secondaryButton} type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className={styles.primaryButton} type="submit">
              {mode === "edit" ? "Salvar alteracoes" : "Salvar atleta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AthleteForm;
