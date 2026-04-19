import { LayoutGrid, List } from 'lucide-react';
import { SearchBar } from './SearchBar';

export function Controls({ search, onSearch, viewMode, onViewMode, limit, onLimit }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      <SearchBar value={search} onChange={onSearch} className="flex-1 sm:max-w-sm" />

      <div className="flex items-center gap-2 sm:ml-auto shrink-0">
        {/* Per-page selector */}
        <select
          value={limit}
          onChange={(e) => onLimit(Number(e.target.value))}
          className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
        >
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
          <option value={75}>75 / page</option>
          <option value={0}>All</option>
        </select>

        {/* View mode toggle */}
        <div className="flex border border-border rounded-md overflow-hidden">
          <button
            onClick={() => onViewMode('grid')}
            className={`p-2 transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Grid view"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onViewMode('list')}
            className={`p-2 transition-colors border-l border-border ${
              viewMode === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="List view"
          >
            <List size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
