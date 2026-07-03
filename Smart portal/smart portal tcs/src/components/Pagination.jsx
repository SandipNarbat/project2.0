export default function Pagination({
  currentPage,
  totalPages,
  onNext,
  onPrev,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "15px",
      }}
    >
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
