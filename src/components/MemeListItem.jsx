import { Badge } from './ui/badge';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function MemeListItem({ meme, onTagClick, onClick }) {
  const placeholder = `https://placehold.co/160x100/e2e8f0/94a3b8?text=${encodeURIComponent(meme.title)}`;

  return (
    <div className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md hover:-translate-y-px transition-all duration-200 group cursor-pointer" onClick={onClick}>
      <div className="shrink-0 w-40 h-28 rounded-lg overflow-hidden bg-muted">
        <img
          src={meme.imageUrl || placeholder}
          alt={meme.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = placeholder; }}
        />
      </div>

      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-foreground text-base leading-tight">{meme.title}</h3>
          <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{formatDate(meme.createdAt)}</span>
        </div>

        <p className="text-sm text-foreground leading-relaxed line-clamp-2">{meme.meaning}</p>

        <p className="text-xs italic text-muted-foreground line-clamp-1">{meme.example}</p>

        {meme.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-0.5">
            {meme.tags.map((tag) => (
              <Badge
                key={tag}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={(e) => { e.stopPropagation(); onTagClick?.(tag); }}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
