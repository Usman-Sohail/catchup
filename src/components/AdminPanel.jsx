import { useState, useEffect, useCallback } from 'react';
import { X, Check, Trash2, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const API = import.meta.env.VITE_API_URL ?? '';

function MiniCard({ meme, onApprove, onReject, busy }) {
  const placeholder = `https://placehold.co/400x250/e2e8f0/94a3b8?text=${encodeURIComponent(meme.title)}`;
  return (
    <div className="flex gap-3 p-3 rounded-lg border border-border bg-background">
      <div className="shrink-0 w-24 h-16 rounded-md overflow-hidden bg-muted">
        <img
          src={meme.imageUrl || placeholder}
          alt={meme.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = placeholder; }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{meme.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{meme.meaning}</p>
        {meme.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {meme.tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-xs px-1.5 py-0">#{t}</Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <Button size="sm" className="h-7 px-2" onClick={() => onApprove(meme._id)} disabled={busy}>
          <Check size={13} className="mr-1" /> Approve
        </Button>
        <Button size="sm" variant="outline" className="h-7 px-2 text-red-500 hover:text-red-600 hover:border-red-300" onClick={() => onReject(meme._id)} disabled={busy}>
          <Trash2 size={13} className="mr-1" /> Reject
        </Button>
      </div>
    </div>
  );
}

export function AdminPanel({ onClose }) {
  const [step, setStep] = useState('login'); // 'login' | 'panel'
  const [keyInput, setKeyInput] = useState('');
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('catchup-admin-key') || '');
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState('');

  const fetchPending = useCallback(async (key) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/admin/memes?status=pending`, {
        headers: { 'x-admin-key': key },
      });
      if (res.status === 401) throw new Error('Wrong admin key.');
      if (!res.ok) throw new Error('Failed to load.');
      const data = await res.json();
      setMemes(data.memes);
      setStep('panel');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-login if key is in sessionStorage
  useEffect(() => {
    if (adminKey) fetchPending(adminKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogin(e) {
    e.preventDefault();
    const key = keyInput.trim();
    if (!key) return;
    sessionStorage.setItem('catchup-admin-key', key);
    setAdminKey(key);
    await fetchPending(key);
    setKeyInput('');
  }

  async function handleApprove(id) {
    setActionBusy(true);
    try {
      const res = await fetch(`${API}/api/admin/memes/${id}/approve`, {
        method: 'PATCH',
        headers: { 'x-admin-key': adminKey },
      });
      if (!res.ok) throw new Error('Failed to approve.');
      setMemes((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionBusy(false);
    }
  }

  async function handleReject(id) {
    setActionBusy(true);
    try {
      const res = await fetch(`${API}/api/admin/memes/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });
      if (!res.ok) throw new Error('Failed to reject.');
      setMemes((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionBusy(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('catchup-admin-key');
    setAdminKey('');
    setStep('login');
    setMemes([]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card shadow-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <h2 className="font-semibold text-foreground">Admin Panel</h2>
            {step === 'panel' && (
              <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
                {memes.length} pending
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step === 'panel' && (
              <button onClick={handleLogout} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Logout
              </button>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Login step */}
        {step === 'login' && (
          <form onSubmit={handleLogin} className="p-5 flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Enter your admin key to review pending memes.</p>
            <input
              type="password"
              placeholder="Admin key"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Enter
            </Button>
          </form>
        )}

        {/* Panel step */}
        {step === 'panel' && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-muted-foreground" />
              </div>
            )}
            {error && <p className="text-xs text-red-500 px-1">{error}</p>}
            {!loading && memes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm font-medium text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">No pending memes to review.</p>
              </div>
            )}
            {memes.map((meme) => (
              <MiniCard
                key={meme._id}
                meme={meme}
                onApprove={handleApprove}
                onReject={handleReject}
                busy={actionBusy}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
