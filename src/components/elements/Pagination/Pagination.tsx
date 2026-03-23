import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import styles from "./Pagination.module.scss";

type PaginationSize = "sm" | "md";
type PaginationItem = number | "ellipsis-left" | "ellipsis-right";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
  size?: PaginationSize;
  showPrevNext?: boolean;
  showPageNumbers?: boolean;
};

function clampPage(page: number, totalPages: number) {
  if (totalPages <= 0) return 1;
  return Math.min(Math.max(page, 1), totalPages);
}

function buildPageItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis-right", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis-left", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    "ellipsis-left",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-right",
    totalPages,
  ];
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className,
  size = "md",
  showPrevNext = true,
  showPageNumbers = true,
}: PaginationProps) => {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = clampPage(currentPage, safeTotalPages);

  const pageItems = useMemo(
    () => buildPageItems(safeCurrentPage, safeTotalPages),
    [safeCurrentPage, safeTotalPages]
  );

  const rootClassName = [
    styles.pagination,
    styles[`size${size.toUpperCase()}`],
    disabled ? styles.disabled : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const goToPage = (page: number) => {
    if (disabled) return;

    const nextPage = clampPage(page, safeTotalPages);
    if (nextPage === safeCurrentPage) return;
    onPageChange(nextPage);
  };

  if (safeTotalPages <= 1) {
    return null;
  }

  return (
    <nav className={rootClassName} aria-label="Paginacao">
      {showPrevNext && (
        <button
          type="button"
          className={styles.paginationButton}
          onClick={() => goToPage(safeCurrentPage - 1)}
          disabled={disabled || safeCurrentPage === 1}
          aria-label="Pagina anterior"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          Anterior
        </button>
      )}

      {showPageNumbers && (
        <div className={styles.pageNumbers} aria-label={`Pagina ${safeCurrentPage} de ${safeTotalPages}`}>
          {pageItems.map((item, index) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                className={`${styles.pageNumber} ${item === safeCurrentPage ? styles.pageNumberActive : ""}`}
                onClick={() => goToPage(item)}
                disabled={disabled}
                aria-current={item === safeCurrentPage ? "page" : undefined}
                aria-label={`Ir para pagina ${item}`}
              >
                {item}
              </button>
            ) : (
              <span key={`${item}-${index}`} className={styles.ellipsis} aria-hidden="true">
                ...
              </span>
            )
          )}
        </div>
      )}

      {showPrevNext && (
        <button
          type="button"
          className={styles.paginationButton}
          onClick={() => goToPage(safeCurrentPage + 1)}
          disabled={disabled || safeCurrentPage === safeTotalPages}
          aria-label="Proxima pagina"
        >
          Proxima
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      )}
    </nav>
  );
};

export default Pagination;
