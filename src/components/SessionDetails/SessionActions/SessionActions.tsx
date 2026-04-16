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
          <h4>Filtros de acoes</h4>
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
            <label className={styles.filterField}>
              <span className={styles.filterLabel}>Atleta</span>
              <select value={activeAthleteId} onChange={(event) => setSelectedAthleteId(event.target.value)}>
                <option value="all">Todos os atletas</option>
                {athleteOptions.map((athlete) => (
                  <option key={athlete.value} value={athlete.value}>
                    {athlete.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className={styles.filterField}>
            <span className={styles.filterLabel}>Categoria</span>
            <select value={activeCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option value="all">Todas as categorias</option>
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
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
              ? "Nenhuma acao encontrada com os filtros atuais."
              : "Esta sessao ainda nao possui acoes para esta visualizacao."}
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
