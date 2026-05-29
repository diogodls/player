import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import styles from "./SessionActions.module.scss";
import SessionActionCard from "../SessionActionCard/SessionActionCard.tsx";
import type {
  ActionTypeFilter,
  SessionAnalysisSection,
  ViewMode,
} from "../../../pages/SessionView";
import Select from "../../elements/Select/Select.tsx";

type Props = {
  viewMode: ViewMode;
  view: SessionAnalysisSection;
};

const SessionActions = ({ viewMode, view }: Props) => {
  const [actionTypeFilter, setActionTypeFilter] = useState<ActionTypeFilter>("all");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const sourceEntities = view.entities;

  const athleteOptions = useMemo(
    () =>
      sourceEntities
        .filter((entity) => entity.type === "player")
        .map((entity) => ({ value: entity.id, label: entity.title })),
    [sourceEntities]
  );

  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();

    return sourceEntities.flatMap((entity) =>
      entity.actions.flatMap((action) => {
        if (seen.has(action.category.code)) return [];
        seen.add(action.category.code);

        return {
          value: action.category.code,
          label: action.category.label,
        };
      })
    );
  }, [sourceEntities]);

  const activeAthleteId =
    viewMode === "individual" && athleteOptions.some((option) => option.value === selectedAthleteId)
      ? selectedAthleteId
      : "all";

  const activeCategory =
    categoryOptions.some((option) => option.value === selectedCategory) ? selectedCategory : "all";

  const visibleEntities = useMemo(() => {
    const entitiesByAthlete =
      viewMode === "individual" && activeAthleteId !== "all"
        ? sourceEntities.filter((athlete) => athlete.id === activeAthleteId)
        : sourceEntities;

    return entitiesByAthlete
      .map((athlete) => ({
        ...athlete,
        actions: athlete.actions.filter((action) => {
          const matchesType = actionTypeFilter === "all" || action.outcome === actionTypeFilter;
          const matchesCategory = activeCategory === "all" || action.category.code === activeCategory;
          return matchesType && matchesCategory;
        }),
      }))
      .filter((athlete) => athlete.actions.length > 0);
  }, [actionTypeFilter, activeAthleteId, activeCategory, sourceEntities, viewMode]);

  const hasBaseAnalysisForView = sourceEntities.length > 0;
  const hasAnalysisForView = visibleEntities.length > 0;
  const hasActiveFilters =
    actionTypeFilter !== "all" ||
    activeCategory !== "all" ||
    (viewMode === "individual" && activeAthleteId !== "all");

  const handleResetFilters = () => {
    setActionTypeFilter("all");
    setSelectedCategory("all");
    setSelectedAthleteId("all");
  };

  return (
    <>
      <section className={styles.filtersCard}>
        <div className={styles.filtersTitleRow}>
          <FontAwesomeIcon icon={faFilter} />
          <h4>Filtros de ações</h4>
        </div>

        <div className={styles.filtersGrid}>
          <div className={styles.filterBlock}>
            <span className={styles.filterLabel}>Resultado</span>
            <div className={styles.typeFilters}>
              <button
                type="button"
                className={`${styles.typeFilterButton} ${actionTypeFilter === "all" ? styles.typeFilterActive : ""}`}
                onClick={() => setActionTypeFilter("all")}
              >
                Todas
              </button>
              <button
                type="button"
                className={`${styles.typeFilterButton} ${actionTypeFilter === "positive" ? styles.typeFilterActive : ""}`}
                onClick={() => setActionTypeFilter("positive")}
              >
                Positivas
              </button>
              <button
                type="button"
                className={`${styles.typeFilterButton} ${actionTypeFilter === "negative" ? styles.typeFilterActive : ""}`}
                onClick={() => setActionTypeFilter("negative")}
              >
                Negativas
              </button>
            </div>
          </div>

          {viewMode === "individual" && (
            <Select
              label="Atleta"
              name="athlete-filter"
              value={activeAthleteId}
              options={[{ value: "all", label: "Todos os atletas" }, ...athleteOptions]}
              onChange={(value) => setSelectedAthleteId(value)}
            />
          )}

          <Select
            label="Categoria"
            name="category-filter"
            value={activeCategory}
            options={[{ value: "all", label: "Todas as categorias" }, ...categoryOptions]}
            onChange={(value) => setSelectedCategory(value)}
          />
        </div>
      </section>

      {hasAnalysisForView ? (
        <div className={`${styles.cardsList} ${viewMode === "individual" ? styles.cardsGrid : ""}`}>
          {visibleEntities.map((athlete) => (
            <SessionActionCard key={athlete.id} entity={athlete} />
          ))}
        </div>
      ) : (
        <section className={styles.emptyState}>
          <h3>
            {hasBaseAnalysisForView
              ? "Nenhuma ação encontrada com os filtros atuais."
              : "Esta sessão ainda não possui ações para esta visualização."}
          </h3>
          {hasActiveFilters && (
            <button type="button" className={styles.resetButton} onClick={handleResetFilters}>
              Limpar filtros
            </button>
          )}
        </section>
      )}
    </>
  );
};

export default SessionActions;
