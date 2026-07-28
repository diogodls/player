import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import styles from "./SessionActions.module.scss";
import SessionActionCard from "../SessionActionCard/SessionActionCard.tsx";
import SessionSummary from "../SessionSummary/SessionSummary.tsx";
import type {
  SessionViewData,
  SessionViewFilters,
  ViewMode,
} from "../../../pages/SessionView";
import Select from "../../elements/Select/Select.tsx";
import { useApi } from "../../../hooks/useApi.ts";
import type { TeamCatalog } from "../../../pages/Analysis";

const emptyFilters: SessionViewFilters = {
  outcome: "all",
  athleteId: "all",
  categoryCode: "all",
  phaseKey: "all",
};

type Props = {
  sessionId?: string;
  viewMode: ViewMode;
};

const SessionActions = ({ sessionId, viewMode }: Props) => {
  const [filters, setFilters] = useState<SessionViewFilters>(emptyFilters);
  const { data: teamCatalog } = useApi<TeamCatalog>(
    viewMode === "team" ? "/catalog/actions/team" : null,
  );

  const filteredSessionViewEndpoint = useMemo(() => {
    if (!sessionId) return null;

    const searchParams = new URLSearchParams();
    if (filters.outcome !== "all") searchParams.set("outcome", filters.outcome);
    if (viewMode === "individual" && filters.athleteId && filters.athleteId !== "all") {
      searchParams.set("playerId", filters.athleteId);
    }
    if (filters.categoryCode && filters.categoryCode !== "all") {
      searchParams.set("categoryCode", filters.categoryCode);
    }
    if (viewMode === "team" && filters.phaseKey !== "all") {
      searchParams.set("phaseKey", filters.phaseKey);
    }

    const queryString = searchParams.toString();
    return `/sessions/${sessionId}/view${queryString ? `?${queryString}` : ""}`;
  }, [filters, sessionId, viewMode]);

  const {
    data: filteredSessionView,
    error: sessionViewError,
    isLoading,
    isValidating,
  } = useApi<SessionViewData>(filteredSessionViewEndpoint);

  const view = filteredSessionView?.analysis?.[viewMode];
  const filterOptions = filteredSessionView?.filters?.[viewMode] ?? {
    athletes: [],
    categories: [],
  };
  const visibleEntities = view?.entities ?? [];
  const isRefreshing = isValidating && Boolean(view);
  const hasAnalysisForView = visibleEntities.length > 0;
  const hasActiveFilters =
    filters.outcome !== "all" ||
    filters.categoryCode !== "all" ||
    (viewMode === "team" && filters.phaseKey !== "all") ||
    (viewMode === "individual" && filters.athleteId !== "all");

  const handleResetFilters = () => {
    setFilters(emptyFilters);
  };

  return (
    <>
      <section className={styles.filtersCard} aria-busy={isRefreshing}>
        <div className={styles.filtersTitleRow}>
          <FontAwesomeIcon icon={faFilter} />
          <h4>Filtros de ações</h4>
          {isRefreshing && <span className={styles.refreshingLabel}>Atualizando...</span>}
        </div>

        <div className={styles.filtersGrid}>
          <div className={styles.filterBlock}>
            <span className={styles.filterLabel}>Resultado</span>
            <div className={styles.typeFilters}>
              <button
                type="button"
                className={`${styles.typeFilterButton} ${filters.outcome === "all" ? styles.typeFilterActive : ""}`}
                onClick={() => setFilters({ ...filters, outcome: "all" })}
              >
                Todas
              </button>
              <button
                type="button"
                className={`${styles.typeFilterButton} ${filters.outcome === "positive" ? styles.typeFilterActive : ""}`}
                onClick={() => setFilters({ ...filters, outcome: "positive" })}
              >
                Positivas
              </button>
              <button
                type="button"
                className={`${styles.typeFilterButton} ${filters.outcome === "negative" ? styles.typeFilterActive : ""}`}
                onClick={() => setFilters({ ...filters, outcome: "negative" })}
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
              onChange={(value) => setFilters({ ...filters, athleteId: value || "all" })}
            />
          )}

          {viewMode === "team" && (
            <Select
              label="Fase"
              name="phase-filter"
              value={filters.phaseKey}
              options={[
                { value: "all", label: "Todas as fases" },
                ...(teamCatalog?.groups.map((group) => ({
                  value: group.key,
                  label: group.title,
                })) ?? []),
              ]}
              onChange={(value) =>
                setFilters({ ...filters, phaseKey: value || "all" })
              }
            />
          )}

          <Select
            label="Categoria"
            name="category-filter"
            value={filters.categoryCode}
            options={[{ value: "all", label: "Todas as categorias" }, ...filterOptions.categories]}
            onChange={(value) => setFilters({ ...filters, categoryCode: value || "all" })}
          />
        </div>
      </section>

      {isLoading && !view ? (
        <section className={styles.emptyState}>
          <h3>Carregando ações...</h3>
        </section>
      ) : sessionViewError || !view ? (
        <section className={styles.emptyState}>
          <h3>Não foi possível carregar as ações desta sessão.</h3>
        </section>
      ) : (
        <>
          <SessionSummary
            positives={view.summary.positives}
            negatives={view.summary.negatives}
            positivePercentage={view.summary.positivePercentage}
            negativePercentage={view.summary.negativePercentage}
          />

          <h3 className={styles.sectionTitle}>
            {viewMode === "individual" ? "Ações Individuais" : "Ações da Equipe"}
          </h3>

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
      )}
    </>
  );
};

export default SessionActions;
