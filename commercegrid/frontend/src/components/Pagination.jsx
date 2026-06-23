export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const range = 2;
  for (let i = Math.max(1, page - range); i <= Math.min(totalPages, page + range); i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button
        className="pagination__btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      {pages[0] > 1 && (
        <>
          <button className="pagination__btn" onClick={() => onPageChange(1)}>1</button>
          {pages[0] > 2 && <span style={{ color: 'var(--gray-light)', padding: '0 4px' }}>…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`pagination__btn${p === page ? ' pagination__btn--active' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span style={{ color: 'var(--gray-light)', padding: '0 4px' }}>…</span>
          )}
          <button className="pagination__btn" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        className="pagination__btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}
