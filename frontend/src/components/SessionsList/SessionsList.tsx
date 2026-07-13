import styles from "./SessionsList.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-regular-svg-icons";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import SessionCard from "./SessionCard/SessionCard.tsx";
import type { Session, SessionFilters } from "../../pages/Sessions";
import Pagination from "../elements/Pagination/Pagination.tsx";
import { SESSION_LOCATIONS, SESSION_TYPES } from "../../constants/sessions.ts";

type SessionsListProps = {
  sessions: Session[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoading?: boolean;
  isError?: boolean;
  filters: SessionFilters;
  onFiltersChange: (filters: SessionFilters) => void;
  onPageChange: (page: number) => void;
  onEdit: (session: Session) => void;
  onDelete: (session: Session) => void;
};

const SessionsList = ({
  sessions,
  total,
  currentPage,
  totalPages,
  isLoading = false,
  isError = false,
  filters,
  onFiltersChange,
  onPageChange,
  onEdit,
  onDelete,
}: SessionsListProps) => {
  const hasActiveFilters =
    filters.type !== "all" || Boolean(filters.date) || filters.local !== "all";

  const handleResetFilters = () => {
    onFiltersChange({ type: "all", date: "", local: "all" });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <FontAwesomeIcon icon={faCalendarDays} className={styles.headerIcon} />
          <div className={styles.headerText}>
            <span className={styles.headerTitle}>Registros Salvos</span>
            <span className={styles.headerSub}>{total} registros encontrados</span>
          </div>
        </div>

        <div className={styles.filters}>
          <label className={styles.filterField}>
            <span>Tipo</span>
            <select
              value={filters.type}
              onChange={(event) => {
                onFiltersChange({
                  ...filters,
                  type: event.target.value as SessionFilters["type"],
                });
              }}
            >
              <option value="all">Todos</option>
              {SESSION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterField}>
            <span>Data</span>
            <input
              type="date"
              value={filters.date}
              onChange={(event) => {
                onFiltersChange({ ...filters, date: event.target.value });
              }}
            />
          </label>

          <label className={styles.filterField}>
            <span>Local</span>
            <select
              value={filters.local}
              onChange={(event) => {
                onFiltersChange({
                  ...filters,
                  local: event.target.value as SessionFilters["local"],
                });
              }}
            >
              <option value="all">Todos</option>
              {SESSION_LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>

          {hasActiveFilters && (
            <button type="button" className={styles.resetButton} onClick={handleResetFilters}>
              Limpar filtros
            </button>
          )}
        </div>

        {isLoading ? (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faCalendar} className={styles.emptyIcon} />
            <span className={styles.emptyTitle}>Carregando registros...</span>
          </div>
        ) : isError ? (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faCalendar} className={styles.emptyIcon} />
            <span className={styles.emptyTitle}>Nao foi possivel carregar os registros</span>
            <span className={styles.emptySub}>Verifique se o backend esta disponivel</span>
          </div>
        ) : total === 0 ? (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faCalendar} className={styles.emptyIcon} />
            <span className={styles.emptyTitle}>Nenhum registro encontrado</span>
            <span className={styles.emptySub}>
              Ajuste os filtros ou crie seu primeiro treino ou jogo
            </span>
          </div>
        ) : (
          <>
            <div className={styles.list}>
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  item={session}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              className={styles.pagination}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SessionsList;
