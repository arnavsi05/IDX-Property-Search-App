// Renders at most 7 page-number slots. Four cases, in order: everything
// fits with no ellipsis; current page is near the start (show 1-5, then
// jump to the end); current page is near the end (mirror of the above);
// current page is in the middle (show first, last, and a window around
// current). The near-start and near-end branches always name exactly 5
// distinct numbers plus the opposite end, so the same page can never be
// listed twice — that double-counting was the Week 7 debug challenge bug.
function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="pagination" aria-label="Property pages">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>

      {pageNumbers.map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`}>...</span>
        ) : (
          <button
            key={page}
            type="button"
            className={page === currentPage ? "active" : ""}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;