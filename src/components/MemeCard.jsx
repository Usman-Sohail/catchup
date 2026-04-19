import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function MemeCard({ meme, onTagClick }) {
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <img
          src={meme.imageUrl}
          alt={meme.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.src = `https://placehold.co/600x338/e2e8f0/94a3b8?text=${encodeURIComponent(meme.title)}`;
          }}
        />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{meme.title}</CardTitle>
          <span className="shrink-0 text-xs text-muted-foreground mt-0.5">
            {formatDate(meme.createdAt)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            What it means
          </p>
          <p className="text-sm text-foreground leading-relaxed">{meme.meaning}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Example
          </p>
          <p className="text-sm italic text-muted-foreground leading-relaxed">{meme.example}</p>
        </div>

        {meme.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
            {meme.tags.map((tag) => (
              <Badge
                key={tag}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => onTagClick?.(tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
