import { useState, useRef } from 'react';
import { X, ImageUp, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const API = import.meta.env.VITE_API_URL ?? '';

function buildForm(meme) {
  return {
    title:    meme?.title    ?? '',
    imageUrl: meme?.imageUrl ?? '',
    meaning:  meme?.meaning  ?? '',
    example:  meme?.example  ?? '',
    tagInput: '',
    tags:     meme?.tags     ? [...meme.tags] : [],
  };
}

// meme prop = edit mode; null/undefined = add mode
export function AddMemeModal({ open, onClose, onSaved, meme }) {
  const isEdit = !!meme;

  const [form, setForm] = useState(() => buildForm(meme));
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(meme?.imageUrl || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setError('Image must be under 500 KB. Try compressing it at squoosh.app first.');
      fileInputRef.current.value = '';
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('image', file);
      const res = await fetch(`${API}/api/upload`, { method: 'POST', body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Upload failed (${res.status})`);
      set('imageUrl', json.imageUrl);
    } catch (err) {
      setError(err.message);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function addTag() {
    const tag = form.tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!tag || form.tags.includes(tag)) return;
    setForm((f) => ({ ...f, tags: [...f.tags, tag], tagInput: '' }));
  }

  function removeTag(tag) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.meaning || !form.example) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const url    = isEdit ? `${API}/api/memes/${meme._id}` : `${API}/api/memes`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:    form.title.trim(),
          imageUrl: form.imageUrl.trim(),
          meaning:  form.meaning.trim(),
          example:  form.example.trim(),
          tags:     form.tags,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const saved = await res.json();
      onSaved(saved);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setForm(buildForm(meme));
    setPreview(meme?.imageUrl || null);
    setError('');
    onClose();
  }

  const busy = uploading || submitting;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Suggest an Edit' : 'Add a Meme'}</DialogTitle>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </DialogHeader>

        {isEdit && (
          <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
            Your changes will be reviewed by an admin before going live.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="Image">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            {preview ? (
              <div className="relative rounded-md overflow-hidden border border-border aspect-video bg-muted">
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 size={24} className="text-white animate-spin" />
                  </div>
                )}
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => { setPreview(null); set('imageUrl', ''); fileInputRef.current.value = ''; }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/40 hover:bg-muted/70 transition-colors py-8 text-muted-foreground hover:text-foreground"
              >
                <ImageUp size={22} />
                <span className="text-sm font-medium">Click to upload image</span>
                <span className="text-xs">PNG, JPG, GIF, WEBP · max 500 KB</span>
              </button>
            )}

            <Input
              placeholder="Or paste an image URL"
              value={form.imageUrl}
              onChange={(e) => { set('imageUrl', e.target.value); setPreview(e.target.value || null); }}
              disabled={uploading}
            />
          </Field>

          <Field label="Title *">
            <Input placeholder="e.g. Brain Rot" value={form.title} onChange={(e) => set('title', e.target.value)} />
          </Field>

          <Field label="Meaning *">
            <Textarea placeholder="What does this meme mean?" rows={2} value={form.meaning} onChange={(e) => set('meaning', e.target.value)} />
          </Field>

          <Field label="Example Usage *">
            <Textarea placeholder='"Example sentence using this meme..."' rows={2} value={form.example} onChange={(e) => set('example', e.target.value)} />
          </Field>

          <Field label="Tags">
            <div className="flex gap-2">
              <Input
                placeholder="Type a tag and press Enter"
                value={form.tagInput}
                onChange={(e) => set('tagInput', e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((tag) => (
                  <Badge key={tag} className="cursor-pointer gap-1 pr-1.5" onClick={() => removeTag(tag)}>
                    #{tag} <X size={10} className="opacity-60" />
                  </Badge>
                ))}
              </div>
            )}
          </Field>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleClose} disabled={busy}>Cancel</Button>
            <Button type="submit" disabled={busy}>
              {submitting ? <><Loader2 size={14} className="animate-spin mr-1" /> Saving…</>
               : uploading ? <><Loader2 size={14} className="animate-spin mr-1" /> Uploading…</>
               : isEdit ? 'Submit Edit' : 'Add Meme'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
