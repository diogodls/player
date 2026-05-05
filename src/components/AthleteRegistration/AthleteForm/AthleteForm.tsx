import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { PLAYERS_POSITIONS } from "../../../constants/players";
import styles from "./AthleteForm.module.scss";

type AthleteFormProps = {
  isOpen: boolean;
  mode?: "create" | "edit";
  initialValues?: AthleteFormValues;
  onClose: () => void;
  onSubmit: (values: AthleteFormValues) => void;
};

const athletePositionOptions = PLAYERS_POSITIONS as [
  (typeof PLAYERS_POSITIONS)[number],
  ...(typeof PLAYERS_POSITIONS)[number][],
];

const athleteFormSchema = z.object({
  name: z.string().trim().min(1, "Nome e obrigatorio"),
  age: z.coerce
    .number()
    .int("Idade deve ser um numero inteiro")
    .min(1, "Idade e obrigatoria"),
  position: z.enum(athletePositionOptions, {
    message: "Posicao e obrigatoria",
  }),
});

type AthleteFormInput = z.input<typeof athleteFormSchema>;
export type AthleteFormValues = z.infer<typeof athleteFormSchema>;

const emptyValues: AthleteFormInput = {
  name: "",
  age: undefined,
  position: PLAYERS_POSITIONS[0],
};

const AthleteForm = ({ isOpen, mode = "create", initialValues, onClose, onSubmit }: AthleteFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AthleteFormInput, unknown, AthleteFormValues>({
    resolver: zodResolver(athleteFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) return;

    reset(initialValues ?? emptyValues);
  }, [initialValues, isOpen, reset]);

  if (!isOpen) return null;

  const submitForm = (values: AthleteFormValues) => {
    onSubmit(values);
    reset(emptyValues);
  };

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

        <form className={styles.form} onSubmit={handleSubmit(submitForm)}>
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
            {errors.name && <span className={styles.error}>{errors.name.message}</span>}
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
                {...register("age")}
              />
              {errors.age && <span className={styles.error}>{errors.age.message}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="position">
                Posicao *
              </label>
              <select id="position" className={styles.select} {...register("position")}>
                {PLAYERS_POSITIONS.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              {errors.position && <span className={styles.error}>{errors.position.message}</span>}
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.secondaryButton} type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
              {mode === "edit" ? "Salvar alteracoes" : "Salvar atleta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AthleteForm;
