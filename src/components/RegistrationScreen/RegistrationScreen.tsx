import { useEffect, useMemo, useState } from "react";
import styles from "./RegistrationScreen.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-regular-svg-icons";
import { faCalendar, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import SessionCard from "./SessionCard/SessionCard.tsx";
import type { Session } from "../../pages/SessionView";

const ITEMS_PER_PAGE = 5;

type RegistrationScreen = {
  sessions: Session[];
  onEditSession: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
};

const RegistrationScreen = ({ sessions, onEditSession, onDeleteSession }: RegistrationScreen) => {
  const [currentPage, setCurrentPage] = useState(1);
  const total = sessions.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const pagedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, sessions]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleGoToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleGoToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const hasMultiplePages = totalPages > 1;

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

            {hasMultiplePages && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.paginationButton}
                  onClick={handleGoToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                  Anterior
                </button>

                <span className={styles.pageIndicator}>
                  Pagina {currentPage} de {totalPages}
                </span>

                <button
                  type="button"
                  className={styles.paginationButton}
                  onClick={handleGoToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Proxima
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RegistrationScreen;
