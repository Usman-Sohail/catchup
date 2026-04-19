import { useState } from 'react';
import { X } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
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
    setLoading(true);
    try {
      const res = await fetch('/api/memes', {
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
      setForm(EMPTY_FORM);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setError('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
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
          <Field label="Title *">
            <Input
              placeholder="e.g. Brain Rot"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </Field>

          <Field label="Image URL *">
            <Input
              placeholder="https://i.imgflip.com/..."
              value={form.imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)}
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
                    #{tag}
                    <X size={10} className="opacity-60" />
                  </Badge>
                ))}
              </div>
            )}
          </Field>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Add Meme'}
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
