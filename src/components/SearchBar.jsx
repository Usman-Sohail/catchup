import { Search, X } from 'lucide-react';
import { cn } from '../utils/utils';

export function SearchBar({ value, onChange, className }) {
  return (
    <div className={cn('relative', className)}>
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <input
        type="text"
        placeholder="Search memes, meanings, tags…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 pl-9 pr-8 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
