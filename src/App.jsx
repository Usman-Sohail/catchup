import { useState, useEffect, useRef } from 'react';
import { Plus, TrendingUp, ShieldCheck } from 'lucide-react';
import { MemeCard } from './components/MemeCard';
import { MemeListItem } from './components/MemeListItem';
import { SkeletonCard, SkeletonListItem } from './components/SkeletonCard';
import { TagFilter } from './components/TagFilter';
import { AddMemeModal } from './components/AddMemeModal';
import { MemeDetailModal } from './components/MemeDetailModal';
import { AdminPanel } from './components/AdminPanel';
import { Controls } from './components/Controls';
import { Pagination } from './components/Pagination';
import { Button } from './components/ui/button';
import { useDebounce } from './hooks/useDebounce';

const API = import.meta.env.VITE_API_URL ?? '';

export default function App() {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [allTags, setAllTags] = useState([]);

  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem('catchup-view') || 'grid'
  );

  const [memeFormOpen, setMemeFormOpen] = useState(false);
  const [editingMeme, setEditingMeme] = useState(null); // null = add, meme = edit
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [pendingNotice, setPendingNotice] = useState(false);

  const debouncedSearch = useDebounce(search, 350);
  const cache = useRef(new Map());

  useEffect(() => {
    localStorage.setItem('catchup-view', viewMode);
  }, [viewMode]);

  // Fetch all tags once on mount
  useEffect(() => {
    fetch(`${API}/api/memes?limit=0`)
      .then((r) => r.json())
      .then((data) => {
        const tags = [...new Set((data.memes ?? []).flatMap((m) => m.tags ?? []))].sort();
        setAllTags(tags);
      })
      .catch(() => {});
  }, []);

  // Reset to page 1 whenever filters or limit change
  const prevFiltersRef = useRef({ search: '', tag: null, limit: 25 });
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (prev.search !== debouncedSearch || prev.tag !== activeTag || prev.limit !== limit) {
      prevFiltersRef.current = { search: debouncedSearch, tag: activeTag, limit };
      setPage(1);
    }
  }, [debouncedSearch, activeTag, limit]);

  // Main fetch
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (activeTag) params.set('tag', activeTag);
    params.set('page', String(page));
    params.set('limit', String(limit));

    const key = params.toString();

    if (cache.current.has(key)) {
      const cached = cache.current.get(key);
      setMemes(cached.memes);
      setTotal(cached.total);
      setTotalPages(cached.totalPages);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${API}/api/memes?${key}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setMemes(data.memes);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        cache.current.set(key, data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [debouncedSearch, activeTag, page, limit]);

  function handleMemeSaved(savedMeme) {
    cache.current.clear();
    if (editingMeme) {
      // Remove the edited meme from the feed — it's now pending again
      setMemes((prev) => prev.filter((m) => m._id !== savedMeme._id));
      setTotal((t) => t - 1);
    }
    setPendingNotice(true);
    setTimeout(() => setPendingNotice(false), 6000);
    if (savedMeme.tags?.length) {
      setAllTags((prev) => [...new Set([...prev, ...savedMeme.tags])].sort());
    }
  }

  function openEdit(meme) {
    setEditingMeme(meme);
    setSelectedMeme(null);
    setMemeFormOpen(true);
  }

  function handleTagClick(tag) {
    setActiveTag((prev) => (prev === tag ? null : tag));
    setSearch('');
  }

  function clearFilters() {
    setSearch('');
    setActiveTag(null);
  }

  const skeletonCount = limit > 0 ? Math.min(limit, 9) : 9;
  const hasFilters = !!debouncedSearch || !!activeTag;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">
              catch<span className="text-primary">up</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              Understand the internet, one meme at a time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Admin panel"
            >
              <ShieldCheck size={17} />
            </button>
            <Button size="sm" onClick={() => { setEditingMeme(null); setMemeFormOpen(true); }}>
              <Plus size={15} className="mr-1.5" />
              Add Meme
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Pending approval notice */}
        {pendingNotice && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 px-4 py-3 flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">
              ✓ Meme submitted! It will appear after admin approval.
            </span>
          </div>
        )}

        {/* Section heading */}
        <div className="flex items-center gap-2.5">
          <TrendingUp size={20} className="text-primary shrink-0" />
          <h2 className="text-xl font-semibold text-foreground">Trending Memes</h2>
          {!loading && (
            <span className="text-sm text-muted-foreground">— {total} total</span>
          )}
        </div>

        {/* Controls */}
        <Controls
          search={search}
          onSearch={setSearch}
          viewMode={viewMode}
          onViewMode={setViewMode}
          limit={limit}
          onLimit={setLimit}
        />

        {/* Tag filter */}
        {allTags.length > 0 && (
          <TagFilter tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-8 text-center">
            <p className="text-base font-semibold text-red-700 dark:text-red-400">
              Something went wrong
            </p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Make sure the backend is running on{' '}
              <code className="font-mono">localhost:3001</code>
            </p>
          </div>
        )}

        {/* Grid view */}
        {!error && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {loading
              ? Array.from({ length: skeletonCount }).map((_, i) => <SkeletonCard key={i} />)
              : memes.map((meme) => (
                  <MemeCard
                    key={meme._id}
                    meme={meme}
                    onTagClick={handleTagClick}
                    onClick={() => setSelectedMeme(meme)}
                  />
                ))}
          </div>
        )}

        {/* List view */}
        {!error && viewMode === 'list' && (
          <div className="flex flex-col gap-3">
            {loading
              ? Array.from({ length: skeletonCount }).map((_, i) => <SkeletonListItem key={i} />)
              : memes.map((meme) => (
                  <MemeListItem
                    key={meme._id}
                    meme={meme}
                    onTagClick={handleTagClick}
                    onClick={() => setSelectedMeme(meme)}
                  />
                ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && memes.length === 0 && (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🤔</p>
            <p className="text-lg font-semibold text-foreground">No memes found</p>
            <p className="text-sm text-muted-foreground mt-1.5">
              {debouncedSearch
                ? `No results for "${debouncedSearch}"`
                : activeTag
                ? `No memes tagged #${activeTag}`
                : 'Nothing here yet — add the first one!'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:underline">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-16 py-6">
        <p className="text-center text-xs text-muted-foreground">
          catchup — stay in the loop
        </p>
      </footer>

      <AddMemeModal
        key={editingMeme?._id || 'new'}
        open={memeFormOpen}
        meme={editingMeme}
        onClose={() => { setMemeFormOpen(false); setEditingMeme(null); }}
        onSaved={handleMemeSaved}
      />

      <MemeDetailModal
        meme={selectedMeme}
        onClose={() => setSelectedMeme(null)}
        onTagClick={handleTagClick}
        onEdit={() => openEdit(selectedMeme)}
      />

      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </div>
  );
}
