import {useContext, useMemo, useState} from "react";
import AthleteForm, {type AthleteFormValues} from "../../components/AthleteRegistration/AthleteForm/AthleteForm";
import AthleteRegistrationCard
  from "../../components/AthleteRegistration/AthleteRegistrationCard/AthleteRegistrationCard";
import DeleteAthleteModal from "../../components/AthleteRegistration/DeleteAthleteModal/DeleteAthleteModal";
import Select from "../../components/elements/Select";
import Pagination from "../../components/elements/Pagination/Pagination";
import {PLAYERS_POSITIONS} from "../../constants/players";
import {useApi} from "../../hooks/useApi";
import type {CoachDashboardData, Player} from "../CoachDashboard";
import styles from "./AthleteRegistrationScreen.module.scss";
import {ToastContext} from "../../contexts/ToastContext/ToastContext.tsx";

type Athlete = {
  id: string;
  name: string;
  age: Player["age"];
  position: (typeof PLAYERS_POSITIONS)[number];
};

const ATHLETES_PER_PAGE = 8;
type PositionFilter = "all" | (typeof PLAYERS_POSITIONS)[number];

const AthleteRegistrationScreen = () => {
  const { data } = useApi<CoachDashboardData>("coach-dashboard"); //todo: mudar para quando vir do back | usar endpoint proprio de atletas
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [athleteToDelete, setAthleteToDelete] = useState<Athlete | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("all");
  const {success, info} = useContext(ToastContext);

  const displayedAthletes = useMemo<Athlete[]>(
    () =>
      data?.players.map((player) => ({
        id: String(player.id),
        name: player.name,
        age: player.age,
        position: player.position as (typeof PLAYERS_POSITIONS)[number],
      })) ?? [],
    [data?.players],
  );

  const filteredAthletes = useMemo(() => {
    const normalizedName = nameFilter.trim().toLocaleLowerCase();

    return displayedAthletes.filter((athlete) => {
      const matchesName = athlete.name.toLocaleLowerCase().includes(normalizedName);
      const matchesPosition =
        positionFilter === "all" || athlete.position === positionFilter;

      return matchesName && matchesPosition;
    });
  }, [displayedAthletes, nameFilter, positionFilter]);

  const hasActiveFilters = Boolean(nameFilter.trim()) || positionFilter !== "all";
  const totalPages = Math.max(1, Math.ceil(filteredAthletes.length / ATHLETES_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedAthletes = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ATHLETES_PER_PAGE;
    return filteredAthletes.slice(startIndex, startIndex + ATHLETES_PER_PAGE);
  }, [filteredAthletes, safeCurrentPage]);

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

  const handleSubmitAthlete = () => {
    setCurrentPage(1);

    success(`Atleta ${editingAthlete ? 'editado' : 'criado'}!`);
    setIsModalOpen(false); //todo: enviar req pro back aqui depois
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    setAthleteToDelete(null);
    info("Atleta deletado!"); //todo: enviar req pro back aqui depois
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

        <div className={styles.filters}>
          <label className={styles.filterGroup} htmlFor="athlete-name-filter">
            <span className={styles.filterLabel}>Nome</span>
            <input
              id="athlete-name-filter"
              className={styles.input}
              type="search"
              value={nameFilter}
              placeholder="Buscar atleta"
              onChange={(event) => {
                setNameFilter(event.target.value);
                setCurrentPage(1);
              }}
            />
          </label>

          <Select<PositionFilter>
            className={styles.filterGroup}
            label="Posição"
            name="athlete-position-filter"
            value={positionFilter}
            options={[
              { value: "all", label: "Todas" },
              ...PLAYERS_POSITIONS.map((position) => ({
                value: position,
                label: position === "Pivo" ? "Pivô" : position,
              })),
            ]}
            onChange={(value) => {
              if (value) {
                setPositionFilter(value);
                setCurrentPage(1);
              }
            }}
          />
        </div>

        {filteredAthletes.length === 0 ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>
              {hasActiveFilters ? "Nenhum atleta encontrado" : "Nenhum atleta cadastrado"}
            </h2>
            <p className={styles.emptyDescription}>
              Abra o modal para salvar o primeiro atleta e começar a montar a lista local.
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {pagedAthletes.map((athlete) => (
              <AthleteRegistrationCard
                key={athlete.id}
                athlete={athlete}
                onEdit={(event) => {
                  event.stopPropagation();
                  setEditingAthlete(athlete);
                  setIsModalOpen(true);
                }}
                onDelete={(event) => {
                  event.stopPropagation();
                  setAthleteToDelete(athlete);
                }}
              />
            ))}
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

      {isModalOpen &&
        <AthleteForm
          mode={editingAthlete ? "edit" : "create"}
          initialValues={formInitialValues}
          onClose={handleCloseForm}
          onSubmit={handleSubmitAthlete}
        />
      }

      {Boolean(athleteToDelete) &&
        <DeleteAthleteModal
          athleteName={athleteToDelete?.name}
          onClose={() => setAthleteToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      }
    </section>
  );
};

export default AthleteRegistrationScreen;
