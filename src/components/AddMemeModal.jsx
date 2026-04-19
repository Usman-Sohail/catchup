import { useState, useRef } from 'react';

const API = import.meta.env.VITE_API_URL ?? '';
import { X, ImageUp, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const EMPTY_FORM = {
  title: '',
  imageUrl: '',
  meaning: '',
  example: '',
  tagInput: '',
  tags: [],
};

export function AddMemeModal({ open, onClose, onAdded }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Upload file to Cloudinary via /api/upload, store returned URL
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('image', file);

      const res = await fetch(`${API}/api/upload`, { method: 'POST', body: data });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

      const { imageUrl } = await res.json();
      set('imageUrl', imageUrl);
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
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.imageUrl || !form.meaning || !form.example) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/memes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          imageUrl: form.imageUrl.trim(),
          meaning: form.meaning.trim(),
          example: form.example.trim(),
          tags: form.tags,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const newMeme = await res.json();
      onAdded(newMeme);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setPreview(null);
    setError('');
    onClose();
  }

  const busy = uploading || submitting;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a Meme</DialogTitle>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Image upload */}
          <Field label="Image *">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

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
                <span className="text-xs">PNG, JPG, GIF, WEBP</span>
              </button>
            )}

            {/* Fallback: paste URL manually */}
            <Input
              placeholder="Or paste an image URL"
              value={form.imageUrl}
              onChange={(e) => { set('imageUrl', e.target.value); setPreview(e.target.value || null); }}
              disabled={uploading}
            />
          </Field>

          <Field label="Title *">
            <Input
              placeholder="e.g. Brain Rot"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </Field>

          <Field label="Meaning *">
            <Textarea
              placeholder="What does this meme mean?"
              rows={2}
              value={form.meaning}
              onChange={(e) => set('meaning', e.target.value)}
            />
          </Field>

          <Field label="Example Usage *">
            <Textarea
              placeholder='"Example sentence using this meme..."'
              rows={2}
              value={form.example}
              onChange={(e) => set('example', e.target.value)}
            />
          </Field>

          <Field label="Tags">
            <div className="flex gap-2">
              <Input
                placeholder="Type a tag and press Enter"
                value={form.tagInput}
                onChange={(e) => set('tagInput', e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>
                Add
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="cursor-pointer gap-1 pr-1.5"
                    onClick={() => removeTag(tag)}
                  >
                    #{tag} <X size={10} className="opacity-60" />
                  </Badge>
                ))}
              </div>
            )}
          </Field>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {submitting ? (
                <><Loader2 size={14} className="animate-spin mr-1" /> Saving…</>
              ) : uploading ? (
                <><Loader2 size={14} className="animate-spin mr-1" /> Uploading…</>
              ) : (
                'Add Meme'
              )}
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
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}
