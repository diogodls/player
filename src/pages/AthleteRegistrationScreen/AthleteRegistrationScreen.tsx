import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import AthleteForm, { type AthleteFormValues } from "../../components/AthleteRegistration/AthleteForm/AthleteForm";
import DeleteAthleteModal from "../../components/AthleteRegistration/DeleteAthleteModal/DeleteAthleteModal";
import { PLAYERS_POSITIONS } from "../../constants/players";
import { useApi } from "../../hooks/useApi";
import type { CoachDashboardData } from "../CoachDashboard";
import styles from "./AthleteRegistrationScreen.module.scss";

type Athlete = {
  id: string;
  name: string;
  age?: number;
  position: (typeof PLAYERS_POSITIONS)[number];
};

const AthleteRegistrationScreen = () => {
  const navigate = useNavigate();
  const { data } = useApi<CoachDashboardData>("coach-dashboard");
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [hasLocalAthleteChanges, setHasLocalAthleteChanges] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [athleteToDelete, setAthleteToDelete] = useState<Athlete | null>(null);

  const mockAthletes = useMemo<Athlete[]>(
    () =>
      data?.players.map((player) => ({
        id: String(player.id),
        name: player.name,
        age: player.age,
        position: player.position as (typeof PLAYERS_POSITIONS)[number],
      })) ?? [],
    [data?.players],
  );

  const displayedAthletes = hasLocalAthleteChanges ? athletes : mockAthletes;

  const formInitialValues = useMemo<AthleteFormValues | undefined>(
    () =>
      editingAthlete
        ? {
            name: editingAthlete.name,
            age: editingAthlete.age ?? 1,
            position: editingAthlete.position,
          }
        : undefined,
    [editingAthlete],
  );

  const handleOpenCreateModal = () => {
    setEditingAthlete(null);
    setIsModalOpen(true);
  };

  const handleSubmitAthlete = (values: AthleteFormValues) => {
    if (editingAthlete) {
      setAthletes(
        displayedAthletes.map((athlete) =>
          athlete.id === editingAthlete.id ? { ...athlete, ...values } : athlete,
        ),
      );
    } else {
      setAthletes([
        {
          id: crypto.randomUUID(),
          ...values,
        },
        ...displayedAthletes,
      ]);
    }

    setHasLocalAthleteChanges(true);
    setIsModalOpen(false);
    setEditingAthlete(null);
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setEditingAthlete(null);
  };

  const handleConfirmDelete = () => {
    if (!athleteToDelete) return;

    setAthletes(displayedAthletes.filter((athlete) => athlete.id !== athleteToDelete.id));
    setHasLocalAthleteChanges(true);
    setAthleteToDelete(null);
  };

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Atletas</h1>
            <p className={styles.description}>
              Cadastre novos atletas
            </p>
          </div>

          <button className={styles.openButton} type="button" onClick={handleOpenCreateModal}>
            Novo atleta
          </button>
        </div>

        {displayedAthletes.length === 0 ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>Nenhum atleta cadastrado</h2>
            <p className={styles.emptyDescription}>
              Abra o modal para salvar o primeiro atleta e comecar a montar a lista local.
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {displayedAthletes.map((athlete) => (
              <article
                key={athlete.id}
                className={styles.card}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/player/${athlete.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/player/${athlete.id}`);
                  }
                }}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <h2 className={styles.cardTitle}>{athlete.name}</h2>
                    <span className={styles.cardPosition}>{athlete.position}</span>
                  </div>
                  <span className={styles.cardAge}>
                    {typeof athlete.age === "number" ? `${athlete.age} anos` : "Idade nao informada"}
                  </span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.secondaryAction}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditingAthlete(athlete);
                      setIsModalOpen(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className={styles.dangerAction}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setAthleteToDelete(athlete);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <AthleteForm
        isOpen={isModalOpen}
        mode={editingAthlete ? "edit" : "create"}
        initialValues={formInitialValues}
        onClose={handleCloseForm}
        onSubmit={handleSubmitAthlete}
      />

      <DeleteAthleteModal
        athleteName={athleteToDelete?.name}
        isOpen={Boolean(athleteToDelete)}
        onClose={() => setAthleteToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
};

export default AthleteRegistrationScreen;
