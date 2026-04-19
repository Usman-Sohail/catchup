import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { MemeCard } from './components/MemeCard';
import { SkeletonCard } from './components/SkeletonCard';
import { TagFilter } from './components/TagFilter';
import { AddMemeModal } from './components/AddMemeModal';
import { Button } from './components/ui/button';

export default function App() {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/memes')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setMemes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const allTags = useMemo(() => {
    const set = new Set(memes.flatMap((m) => m.tags ?? []));
    return [...set].sort();
  }, [memes]);

  const filtered = activeTag ? memes.filter((m) => m.tags?.includes(activeTag)) : memes;

  function handleMemeAdded(newMeme) {
    setMemes((prev) => [newMeme, ...prev]);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              catch<span className="text-primary">up</span>
            </h1>
            <p className="text-xs text-muted-foreground">Understand the internet, one meme at a time</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {!loading && `${filtered.length} meme${filtered.length !== 1 ? 's' : ''}`}
            </span>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus size={15} className="mr-1" />
              Add Meme
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {!loading && allTags.length > 0 && (
          <div className="mb-6">
            <TagFilter tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-6 text-center">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              Failed to load memes
            </p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Make sure the backend server is running on{' '}
              <code className="font-mono">localhost:3001</code>
            </p>
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : filtered.map((meme) => (
                  <MemeCard key={meme._id} meme={meme} onTagClick={setActiveTag} />
                ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No memes found</p>
            <p className="text-sm mt-1">Try a different tag or clear the filter.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-16 py-6">
        <p className="text-center text-xs text-muted-foreground">
          catchup — stay in the loop
        </p>
      </footer>

      <AddMemeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={handleMemeAdded}
      />
    </div>
  );
}
