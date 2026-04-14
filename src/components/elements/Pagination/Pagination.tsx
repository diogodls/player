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
  siblingCount?: number;
  boundaryCount?: number;
};

// Guarantees page numbers are always inside the valid [1..totalPages] range.
function clampPage(page: number, totalPages: number) {
  if (totalPages <= 0) return 1;
  return Math.min(Math.max(page, 1), totalPages);
}

function createRange(start: number, end: number): number[] {
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function buildPageItems(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number
): PaginationItem[] {
  // Small collections render all pages without ellipsis.
  if (totalPages <= 0) return [];
  const safeSiblingCount = Math.max(0, siblingCount);
  const safeBoundaryCount = Math.max(1, boundaryCount);
  const maxVisibleNumbers = safeBoundaryCount * 2 + safeSiblingCount * 2 + 1;

  if (totalPages <= maxVisibleNumbers) {
    return createRange(1, totalPages);
  }

  const firstPages = createRange(1, safeBoundaryCount);
  const lastPages = createRange(totalPages - safeBoundaryCount + 1, totalPages);

  // Center window around current page and then clamp it away from boundaries.
  const minCenter = safeBoundaryCount + 1;
  const maxCenter = totalPages - safeBoundaryCount;
  let windowStart = Math.max(currentPage - safeSiblingCount, minCenter);
  let windowEnd = Math.min(currentPage + safeSiblingCount, maxCenter);

  // Keep window width stable near the edges for predictable UX.
  const windowSize = safeSiblingCount * 2 + 1;
  const currentWindowSize = windowEnd - windowStart + 1;
  if (currentWindowSize < windowSize) {
    const missing = windowSize - currentWindowSize;
    const canGrowRight = maxCenter - windowEnd;
    const growRight = Math.min(missing, canGrowRight);
    const growLeft = missing - growRight;

    windowStart = Math.max(minCenter, windowStart - growLeft);
    windowEnd = Math.min(maxCenter, windowEnd + growRight);
  }

  const items: PaginationItem[] = [...firstPages];

  // Left bridge between boundary and center window.
  if (windowStart > minCenter + 1) {
    items.push("ellipsis-left");
  } else {
    items.push(...createRange(minCenter, windowStart - 1));
  }

  items.push(...createRange(windowStart, windowEnd));

  // Right bridge between center window and ending boundary.
  if (windowEnd < maxCenter - 1) {
    items.push("ellipsis-right");
  } else {
    items.push(...createRange(windowEnd + 1, maxCenter));
  }

  items.push(...lastPages);
  return items;
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
  siblingCount = 1,
  boundaryCount = 1,
}: PaginationProps) => {
  // Normalize external values to keep rendering logic predictable.
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = clampPage(currentPage, safeTotalPages);
  const safeSiblingCount = Math.max(0, siblingCount);
  const safeBoundaryCount = Math.max(1, boundaryCount);

  const pageItems = useMemo(
    () => buildPageItems(safeCurrentPage, safeTotalPages, safeSiblingCount, safeBoundaryCount),
    [safeCurrentPage, safeTotalPages, safeSiblingCount, safeBoundaryCount]
  );

  const rootClassName = [
    styles.pagination,
    styles[`size${size.toUpperCase()}`],
    disabled ? styles.disabled : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  // Single entry-point for page transitions avoids duplicated checks in click handlers.
  const goToPage = (page: number) => {
    if (disabled) return;

    const nextPage = clampPage(page, safeTotalPages);
    if (nextPage === safeCurrentPage) return;
    onPageChange(nextPage);
  };

  if (safeTotalPages <= 1 || (!showPrevNext && !showPageNumbers)) {
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
