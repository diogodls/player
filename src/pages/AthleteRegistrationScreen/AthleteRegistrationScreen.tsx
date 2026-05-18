import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import AthleteForm, { type AthleteFormValues } from "../../components/AthleteRegistration/AthleteForm/AthleteForm";
import DeleteAthleteModal from "../../components/AthleteRegistration/DeleteAthleteModal/DeleteAthleteModal";
import PlayerCard from "../../components/CoachDashboard/PlayersSection/PlayerCard/PlayerCard";
import Pagination from "../../components/elements/Pagination/Pagination";
import { PLAYERS_POSITIONS } from "../../constants/players";
import { useApi } from "../../hooks/useApi";
import type { CoachDashboardData, Player } from "../CoachDashboard";
import styles from "./AthleteRegistrationScreen.module.scss";

type Athlete = {
  id: string;
  name: string;
  age: Player["age"];
  position: (typeof PLAYERS_POSITIONS)[number];
  isPersisted: boolean;
};

const ATHLETES_PER_PAGE = 8;

const AthleteRegistrationScreen = () => {
  const navigate = useNavigate();
  const { data } = useApi<CoachDashboardData>("coach-dashboard");
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [hasLocalAthleteChanges, setHasLocalAthleteChanges] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [athleteToDelete, setAthleteToDelete] = useState<Athlete | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const mockAthletes = useMemo<Athlete[]>(
    () =>
      data?.players.map((player) => ({
        id: String(player.id),
        name: player.name,
        age: player.age,
        position: player.position as (typeof PLAYERS_POSITIONS)[number],
        isPersisted: true,
      })) ?? [],
    [data?.players],
  );

  const displayedAthletes = hasLocalAthleteChanges ? athletes : mockAthletes;
  const totalPages = Math.max(1, Math.ceil(displayedAthletes.length / ATHLETES_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedAthletes = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ATHLETES_PER_PAGE;
    return displayedAthletes.slice(startIndex, startIndex + ATHLETES_PER_PAGE);
  }, [displayedAthletes, safeCurrentPage]);

  const formInitialValues = useMemo<AthleteFormValues | undefined>(
    () =>
      editingAthlete
        ? {
            name: editingAthlete.name,
            age: editingAthlete.age,
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
          athlete.id === editingAthlete.id
            ? { ...athlete, ...values, isPersisted: false }
            : athlete,
        ),
      );
    } else {
      setAthletes([
        {
          id: crypto.randomUUID(),
          ...values,
          isPersisted: false,
        },
        ...displayedAthletes,
      ]);
      setCurrentPage(1);
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
              Abra o modal para salvar o primeiro atleta e começar a montar a lista local.
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {pagedAthletes.map((athlete) => {
              const playerPath = `/player/${athlete.id}`;
              const handleOpenPlayer = () => {
                if (athlete.isPersisted) {
                  navigate(playerPath);
                }
              };

              return (
                <PlayerCard
                  key={athlete.id}
                  size="compact"
                  disabled={!athlete.isPersisted}
                  player={{
                    id: athlete.id,
                    name: athlete.position,
                    position: `${athlete.age} anos`,
                  }}
                  onClick={athlete.isPersisted ? handleOpenPlayer : undefined}
                  onKeyDown={athlete.isPersisted ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleOpenPlayer();
                    }
                  } : undefined}
                >
                  <div className={styles.cardInfo}>
                    <span className={styles.cardName}>
                      {athlete.name}
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
                </PlayerCard>
              );
            })}
            <Pagination
              className={styles.pagination}
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              size="sm"
            />
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
