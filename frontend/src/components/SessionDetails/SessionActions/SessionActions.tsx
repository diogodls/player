import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import styles from "./SessionActions.module.scss";
import SessionActionCard from "../SessionActionCard/SessionActionCard.tsx";
import type {
  SessionAnalysisSection,
  SessionViewFilterOptions,
  SessionViewFilters,
  ViewMode,
} from "../../../pages/SessionView";
import Select from "../../elements/Select/Select.tsx";

type Props = {
  viewMode: ViewMode;
  view: SessionAnalysisSection;
  filters: SessionViewFilters;
  filterOptions: SessionViewFilterOptions;
  onFiltersChange: (filters: SessionViewFilters) => void;
};

const SessionActions = ({
  viewMode,
  view,
  filters,
  filterOptions,
  onFiltersChange,
}: Props) => {
  const visibleEntities = view.entities;
  const hasAnalysisForView = visibleEntities.length > 0;
  const hasActiveFilters =
    filters.outcome !== "all" ||
    filters.categoryCode !== "all" ||
    (viewMode === "individual" && filters.athleteId !== "all");

  const handleResetFilters = () => {
    onFiltersChange({
      outcome: "all",
      athleteId: "all",
      categoryCode: "all",
    });
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
                className={`${styles.typeFilterButton} ${filters.outcome === "all" ? styles.typeFilterActive : ""}`}
                onClick={() => onFiltersChange({ ...filters, outcome: "all" })}
              >
                Todas
              </button>
              <button
                type="button"
                className={`${styles.typeFilterButton} ${filters.outcome === "positive" ? styles.typeFilterActive : ""}`}
                onClick={() => onFiltersChange({ ...filters, outcome: "positive" })}
              >
                Positivas
              </button>
              <button
                type="button"
                className={`${styles.typeFilterButton} ${filters.outcome === "negative" ? styles.typeFilterActive : ""}`}
                onClick={() => onFiltersChange({ ...filters, outcome: "negative" })}
              >
                Negativas
              </button>
            </div>
          </div>

          {viewMode === "individual" && (
            <Select
              label="Atleta"
              name="athlete-filter"
              value={filters.athleteId}
              options={[{ value: "all", label: "Todos os atletas" }, ...filterOptions.athletes]}
              onChange={(value) => onFiltersChange({ ...filters, athleteId: value })}
            />
          )}

          <Select
            label="Categoria"
            name="category-filter"
            value={filters.categoryCode}
            options={[{ value: "all", label: "Todas as categorias" }, ...filterOptions.categories]}
            onChange={(value) => onFiltersChange({ ...filters, categoryCode: value })}
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
            {hasActiveFilters
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
