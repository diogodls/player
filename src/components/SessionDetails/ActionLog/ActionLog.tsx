import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import styles from "./ActionLog.module.scss";
import SessionAnalysisActionCard from "../SessionAnalysisActions/SessionAnalysisActionCard/SessionAnalysisActionCard";
import type {
  ActionTypeFilter,
  SessionAnalysisItem,
  SessionDetailsViewSection, SessionEntity,
  SessionOption, ViewMode
} from "../../../pages/SessionView";

type Props = {
  viewMode: ViewMode;
  view?: SessionDetailsViewSection;
  athleteOptions?: SessionOption[];
};

function toSessionAnalysisItem(athlete: SessionEntity): SessionAnalysisItem {
  return {
    name: athlete.title,
    totalOffensiveActions: athlete.metrics.offensive,
    totalDefensiveActions: athlete.metrics.defensive,
    actions: athlete.actions.map((action) => ({
      key: action.subtitle ?? action.title,
      label: action.title,
      time: action.time ?? "",
      category: action.subtitle ?? "Sem categoria",
      goodAction: action.type === "good",
    })),
  };
}
//todo: renomear esse componente ActionLog > SessionAnalysisActionCard > SessionAnalysisActionView
const ActionLog = ({ viewMode, view, athleteOptions = [] }: Props) => {
  const [actionTypeFilter, setActionTypeFilter] = useState<ActionTypeFilter>("all");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categoryOptions = view?.categoryOptions ?? [];

  useEffect(() => {
    if (selectedCategory === "all") return;
    if (!categoryOptions.some((option) => option.value === selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [categoryOptions, selectedCategory]);

  const visibleCards = useMemo(() => {
    const sourceCards = view?.athletes ?? [];
    const cardsByAthlete =
      viewMode === "individual" && selectedAthleteId !== "all"
        ? sourceCards.filter((athlete) => athlete.id === selectedAthleteId)
        : sourceCards;

    return cardsByAthlete
      .map((athlete) => ({
        ...athlete,
        actions: athlete.actions.filter((action) => {
          const matchesType = actionTypeFilter === "all" || action.type === actionTypeFilter;
          const matchesCategory = selectedCategory === "all" || action.subtitle === selectedCategory;
          return matchesType && matchesCategory;
        }),
      }))
      .filter((athlete) => athlete.actions.length > 0);
  }, [actionTypeFilter, selectedAthleteId, selectedCategory, view?.athletes, viewMode]);

  const hasBaseAnalysisForView = (view?.athletes.length ?? 0) > 0;
  const hasAnalysisForView = visibleCards.length > 0;
  const hasActiveFilters =
    actionTypeFilter !== "all" ||
    selectedCategory !== "all" ||
    (viewMode === "individual" && selectedAthleteId !== "all");

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
                className={`${styles.typeFilterButton} ${actionTypeFilter === "good" ? styles.typeFilterActive : ""}`}
                onClick={() => setActionTypeFilter("good")}
              >
                Positivas
              </button>
              <button
                type="button"
                className={`${styles.typeFilterButton} ${actionTypeFilter === "bad" ? styles.typeFilterActive : ""}`}
                onClick={() => setActionTypeFilter("bad")}
              >
                Negativas
              </button>
            </div>
          </div>

          {viewMode === "individual" && (
            <label className={styles.filterField}>
              <span className={styles.filterLabel}>Atleta</span>
              <select value={selectedAthleteId} onChange={(event) => setSelectedAthleteId(event.target.value)}>
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
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
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
          {visibleCards.map((athlete, index) => (
            <SessionAnalysisActionCard
              key={athlete.id}
              item={toSessionAnalysisItem(athlete)}
              entityType={athlete.entityType}
              defaultOpen={index === 0}
            />
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

export default ActionLog;
