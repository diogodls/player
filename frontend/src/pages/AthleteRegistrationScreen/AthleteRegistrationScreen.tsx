import { useContext, useMemo, useState } from "react";
import AthleteForm, {
  type AthleteFormValues,
} from "../../components/AthleteRegistration/AthleteForm/AthleteForm";
import AthleteRegistrationCard from "../../components/AthleteRegistration/AthleteRegistrationCard/AthleteRegistrationCard";
import DeleteAthleteModal from "../../components/AthleteRegistration/DeleteAthleteModal/DeleteAthleteModal";
import Pagination from "../../components/elements/Pagination/Pagination";
import Select from "../../components/elements/Select/Select.tsx";
import { ToastContext } from "../../contexts/ToastContext/ToastContext.tsx";
import {
  PLAYERS_POSITIONS,
  PLAYER_POSITION_IDS,
  PREFERRED_SIDES,
  PREFERRED_SIDE_IDS,
} from "../../constants/players";
import { useApi } from "../../hooks/useApi.ts";
import { backendApi } from "../../utils/api.ts";
import styles from "./AthleteRegistrationScreen.module.scss";

type Athlete = {
  id: string;
  name: string;
  age: number;
  position: (typeof PLAYERS_POSITIONS)[number];
  preferredSide: (typeof PREFERRED_SIDES)[number];
};

const ATHLETES_PER_PAGE = 8;
type PositionFilter = "all" | (typeof PLAYERS_POSITIONS)[number];

const AthleteRegistrationScreen = () => {
  const {
    data: athletes = [],
    error: athletesError,
    isLoading,
    mutate,
  } = useApi<Athlete[]>("/players");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [athleteToDelete, setAthleteToDelete] = useState<Athlete | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [positionFilter, setPositionFilter] =
    useState<PositionFilter>("all");
  const { success, info, error } = useContext(ToastContext);

  const filteredAthletes = useMemo(() => {
    const normalizedName = nameFilter.trim().toLocaleLowerCase();

    return athletes.filter((athlete) => {
      const matchesName = athlete.name
        .toLocaleLowerCase()
        .includes(normalizedName);
      const matchesPosition =
        positionFilter === "all" || athlete.position === positionFilter;

      return matchesName && matchesPosition;
    });
  }, [athletes, nameFilter, positionFilter]);

  const hasActiveFilters =
    Boolean(nameFilter.trim()) || positionFilter !== "all";
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAthletes.length / ATHLETES_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedAthletes = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ATHLETES_PER_PAGE;
    return filteredAthletes.slice(
      startIndex,
      startIndex + ATHLETES_PER_PAGE,
    );
  }, [filteredAthletes, safeCurrentPage]);

  const formInitialValues = useMemo<AthleteFormValues | undefined>(
    () =>
      editingAthlete
        ? {
            name: editingAthlete.name,
            age: editingAthlete.age,
            position: editingAthlete.position,
            preferredSide: editingAthlete.preferredSide,
          }
        : undefined,
    [editingAthlete],
  );

  const handleOpenCreateModal = () => {
    setEditingAthlete(null);
    setIsModalOpen(true);
  };

  const handleSubmitAthlete = async (values: AthleteFormValues) => {
    const payload = {
      id: editingAthlete?.id ?? null,
      name: values.name,
      age: values.age,
      positionId: PLAYER_POSITION_IDS[values.position],
      preferredSideId: PREFERRED_SIDE_IDS[values.preferredSide],
    };

    try {
      if (editingAthlete) {
        await backendApi.put(`/players/${editingAthlete.id}`, payload);
      } else {
        await backendApi.post("/players", payload);
      }

      await mutate();
      setCurrentPage(1);
      success(`Atleta ${editingAthlete ? "editado" : "criado"}!`);
      setIsModalOpen(false);
      setEditingAthlete(null);
    } catch {
      error("Não foi possível salvar o atleta.");
    }
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setEditingAthlete(null);
  };

  const handleConfirmDelete = async () => {
    if (!athleteToDelete) return;

    try {
      await backendApi.delete(`/players/${athleteToDelete.id}`);
      await mutate();
      setAthleteToDelete(null);
      info("Atleta deletado!");
    } catch {
      error("Não foi possível excluir o atleta.");
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Atletas</h1>
            <p className={styles.description}>Cadastre novos atletas</p>
          </div>

          <button
            className={styles.openButton}
            type="button"
            onClick={handleOpenCreateModal}
          >
            Novo atleta
          </button>
        </div>

        <div className={styles.filters}>
          <label
            className={styles.filterGroup}
            htmlFor="athlete-name-filter"
          >
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

        {isLoading ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>Carregando atletas...</h2>
          </div>
        ) : athletesError ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>
              Não foi possível carregar os atletas
            </h2>
            <p className={styles.emptyDescription}>
              Verifique se o backend está disponível e tente novamente.
            </p>
          </div>
        ) : filteredAthletes.length === 0 ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>
              {hasActiveFilters
                ? "Nenhum atleta encontrado"
                : "Nenhum atleta cadastrado"}
            </h2>
            <p className={styles.emptyDescription}>
              Abra o modal para salvar o primeiro atleta e começar a montar a
              equipe.
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

      {isModalOpen && (
        <AthleteForm
          mode={editingAthlete ? "edit" : "create"}
          initialValues={formInitialValues}
          onClose={handleCloseForm}
          onSubmit={handleSubmitAthlete}
        />
      )}

      {Boolean(athleteToDelete) && (
        <DeleteAthleteModal
          athleteName={athleteToDelete?.name}
          onClose={() => setAthleteToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </section>
  );
};

export default AthleteRegistrationScreen;
