import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Build window of pages around current
  const delta = 2;
  const pages = [];
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        className="w-8 h-8 p-0"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft size={14} />
      </Button>

      {pages[0] > 1 && (
        <>
          <PageBtn n={1} current={page} onClick={onPageChange} />
          {pages[0] > 2 && <Ellipsis />}
        </>
      )}

      {pages.map((n) => (
        <PageBtn key={n} n={n} current={page} onClick={onPageChange} />
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <Ellipsis />}
          <PageBtn n={totalPages} current={page} onClick={onPageChange} />
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-8 h-8 p-0"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight size={14} />
      </Button>
    </div>
  );
}

function PageBtn({ n, current, onClick }) {
  return (
    <Button
      variant={n === current ? 'default' : 'outline'}
      size="sm"
      className="w-8 h-8 p-0"
      onClick={() => onClick(n)}
    >
      {n}
    </Button>
  );
}

function Ellipsis() {
  return <span className="px-1 text-muted-foreground text-sm select-none">…</span>;
}
