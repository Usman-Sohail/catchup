import { X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Dialog, DialogContent } from './ui/dialog';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function MemeDetailModal({ meme, onClose, onTagClick }) {
  if (!meme) return null;

  const placeholder = `https://placehold.co/800x500/e2e8f0/94a3b8?text=${encodeURIComponent(meme.title)}`;

  function handleTagClick(tag) {
    onTagClick?.(tag);
    onClose();
  }

  return (
    <Dialog open={!!meme} onClose={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        {/* Image */}
        <div className="relative w-full bg-muted" style={{ maxHeight: '420px' }}>
          <img
            src={meme.imageUrl || placeholder}
            alt={meme.title}
            className="w-full object-contain"
            style={{ maxHeight: '420px' }}
            onError={(e) => { e.target.src = placeholder; }}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold text-foreground leading-tight">{meme.title}</h2>
            <span className="text-xs text-muted-foreground shrink-0 mt-1">
              {formatDate(meme.createdAt)}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              What it means
            </p>
            <p className="text-sm text-foreground leading-relaxed">{meme.meaning}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Example usage
            </p>
            <p className="text-sm italic text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
              {meme.example}
            </p>
          </div>

          {meme.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {meme.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="cursor-pointer hover:bg-primary/20 transition-colors text-xs px-3 py-1"
                  onClick={() => handleTagClick(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
