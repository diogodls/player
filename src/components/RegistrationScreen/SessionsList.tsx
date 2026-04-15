import { useMemo, useState } from "react";
import styles from "./SessionsList.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-regular-svg-icons";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import SessionCard from "./SessionCard/SessionCard.tsx";
import type { Session } from "../../pages/Sessions";
import Pagination from "../elements/Pagination/Pagination.tsx";

const ITEMS_PER_PAGE = 5;

type SessionsListProps = {
  sessions: Session[];
  onEditSession: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
};

const SessionsList = ({
                              sessions,
                              onEditSession,
                              onDeleteSession,
                            }: SessionsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const total = sessions.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedSessions = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return sessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [safeCurrentPage, sessions]);

  const handlePageChange = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);
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

        {total === 0 ? (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faCalendar} className={styles.emptyIcon} />
            <span className={styles.emptyTitle}>Nenhum registro encontrado</span>
            <span className={styles.emptySub}>
              Comece criando seu primeiro treino ou jogo
            </span>
          </div>
        ) : (
          <>
            <div className={styles.list}>
              {pagedSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  item={session}
                  onEdit={onEditSession}
                  onDelete={onDeleteSession}
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
