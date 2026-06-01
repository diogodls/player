import {useMemo, useState} from "react";
import styles from "./SessionsList.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-regular-svg-icons";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import SessionCard from "./SessionCard/SessionCard.tsx";
import type { Session } from "../../pages/Sessions";
import Pagination from "../elements/Pagination/Pagination.tsx";

const ITEMS_PER_PAGE = 5;

function toInputDate(value: string) {
  if (value.includes("-")) return value;

  const [day, month, year] = value.split("/");
  if (!day || !month || !year) return value;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

type SessionsListProps = {
  sessions: Session[];
  onEdit: (session: Session) => void;
  onDelete: (session: Session) => void;
};

const SessionsList = ({sessions, onEdit, onDelete}: SessionsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<"all" | Session["type"]>("all");
  const [dateFilter, setDateFilter] = useState("");
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesType = typeFilter === "all" || session.type === typeFilter;
      const matchesDate = !dateFilter || toInputDate(session.date) === dateFilter;
      return matchesType && matchesDate;
    });
  }, [dateFilter, sessions, typeFilter]);
  const total = filteredSessions.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedSessions = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredSessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSessions, safeCurrentPage]);

  const handlePageChange = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);
  };

  const handleResetFilters = () => {
    setTypeFilter("all");
    setDateFilter("");
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
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as "all" | Session["type"]);
                setCurrentPage(1);
              }}
            >
              <option value="all">Todos</option>
              <option value="Treino">Treino</option>
              <option value="Jogo">Jogo</option>
            </select>
          </label>

          <label className={styles.filterField}>
            <span>Data</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(event.target.value);
                setCurrentPage(1);
              }}
            />
          </label>

          {(typeFilter !== "all" || !!dateFilter) &&
            <button type="button" className={styles.resetButton} onClick={handleResetFilters}>
              Limpar filtros
            </button>
          }
        </div>

        {total === 0 ? (
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
              {pagedSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  item={session}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>

            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className={styles.pagination}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SessionsList;
