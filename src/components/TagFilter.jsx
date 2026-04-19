import { Button } from './ui/button';

export function TagFilter({ tags, activeTag, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={activeTag === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect(null)}
      >
        All
      </Button>
      {tags.map((tag) => (
        <Button
          key={tag}
          variant={activeTag === tag ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(tag)}
        >
          #{tag}
        </Button>
      ))}
    </div>
  );
}
