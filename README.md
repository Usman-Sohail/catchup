# catchup

> Understand the internet, one meme at a time.

A full-stack web app that helps users quickly understand recent internet memes and trends — with meanings, examples, tags, and images.

**Live:** [catchup-woad.vercel.app](https://catchup-woad.vercel.app)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express |
| Database | MongoDB (Atlas) |
| Image hosting | Cloudinary |
| Deployment | Vercel (frontend) · Railway (backend) |

---

## Features

- **Meme feed** — grid and list view, toggle between them, preference saved to localStorage
- **Search** — debounced search across title, meaning, and tags
- **Tag filter** — click any tag to filter the feed
- **Pagination** — 25 / 50 / 75 / All per page
- **Meme detail view** — click any card to open a full-size image with all details
- **Add meme** — form with Cloudinary image upload (drag or click) or paste a URL; images capped at 500 KB
- **Admin approval** — submitted memes are pending by default; admin reviews and approves/rejects via a key-protected panel
- **Loading skeletons** — grid and list variants while fetching
- **Empty & error states** — friendly messages with clear-filter actions

---

## Project Structure

```
catchup/
├── src/                        # React frontend
│   ├── App.jsx
│   ├── hooks/
│   │   └── useDebounce.js
│   ├── components/
│   │   ├── MemeCard.jsx        # Grid card
│   │   ├── MemeListItem.jsx    # List row
│   │   ├── MemeDetailModal.jsx # Full detail view
│   │   ├── AddMemeModal.jsx    # Submit form
│   │   ├── AdminPanel.jsx      # Approval queue
│   │   ├── Controls.jsx        # Search + view toggle + per-page
│   │   ├── TagFilter.jsx
│   │   ├── Pagination.jsx
│   │   ├── SearchBar.jsx
│   │   ├── SkeletonCard.jsx
│   │   └── ui/                 # badge, button, card, dialog, input, skeleton, textarea
│   └── lib/
│       └── utils.js
├── public/                     # Favicons + webmanifest
├── server/
│   ├── server.js
│   ├── seed.js
│   ├── models/
│   │   └── Meme.js
│   ├── routes/
│   │   ├── memes.js            # GET + POST /api/memes
│   │   ├── upload.js           # POST /api/upload (Cloudinary)
│   │   └── admin.js            # Admin approval routes
│   ├── middleware/
│   │   └── adminAuth.js
│   └── utils/
│       └── cloudinary.js
├── .env.example
└── railway.toml
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally **or** a MongoDB Atlas connection string
- A [Cloudinary](https://cloudinary.com) account (free tier works)

---

### 1. Clone

```bash
git clone https://github.com/Usman-Sohail/catchup.git
cd catchup
```

### 2. Backend

```bash
cd server
cp .env.example .env   # then fill in your values
npm install
```

**`server/.env`**

```env
MONGO_URI=mongodb://localhost:27017/catchup
PORT=3001
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_KEY=your-secret-admin-key
```

Seed the database with 10 starter memes:

```bash
npm run seed
```

Start the server:

```bash
npm run dev      # uses node --watch (auto-restarts)
# or
npm start        # production
```

API runs on `http://localhost:3001`.

---

### 3. Frontend

In the project root:

```bash
npm install
npm run dev
```

App runs on `http://localhost:5173`. The Vite dev server proxies `/api/*` to the backend automatically — no extra config needed locally.

---

## API Reference

### Public

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/memes` | List approved memes |
| `POST` | `/api/memes` | Submit a meme (starts as pending) |
| `POST` | `/api/upload` | Upload image to Cloudinary, returns `{ imageUrl }` |

**GET /api/memes query params:**

| Param | Default | Description |
|---|---|---|
| `search` | — | Full-text search on title, meaning, tags |
| `tag` | — | Filter by exact tag |
| `page` | `1` | Page number |
| `limit` | `25` | Results per page (`0` = all) |

**Response shape:**
```json
{
  "memes": [...],
  "total": 42,
  "page": 1,
  "totalPages": 2
}
```

### Admin (requires `x-admin-key` header)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/memes?status=pending` | List memes by status |
| `PATCH` | `/api/admin/memes/:id/approve` | Approve a meme |
| `DELETE` | `/api/admin/memes/:id` | Reject and delete a meme |

---

## Deployment

### Backend → Railway

1. Push to GitHub
2. Create a new Railway project → link the repo
3. Set **Root Directory** to `server`
4. Add environment variables in Railway's **Variables** tab (same keys as `.env`)
5. Railway auto-deploys on every push

### Frontend → Vercel

1. Import the repo in Vercel
2. Leave **Root Directory** blank (project root)
3. Framework preset: **Vite**
4. Add one environment variable:
   ```
   VITE_API_URL = https://your-app.up.railway.app
   ```
5. Deploy — Vercel rebuilds on every push

---

## Meme Schema

```js
{
  title:     String,   // required
  imageUrl:  String,   // optional, defaults to placeholder
  meaning:   String,   // required
  example:   String,   // required
  tags:      [String],
  status:    'pending' | 'approved',  // default: 'pending'
  createdAt: Date
}
```

---

## Image Upload Limits

- **Max file size:** 500 KB (enforced client-side and server-side)
- **Accepted types:** PNG, JPG, GIF, WEBP
- **Storage:** Cloudinary free tier — 25 GB bandwidth / 25 GB storage
- If the free tier is exhausted, the upload route returns a clear error and users can paste a public image URL instead

---

## Admin Panel

The admin panel is accessible via the **shield icon** in the top-right of the header.

- Enter your `ADMIN_KEY` (from `.env`) to log in
- Session is stored in `sessionStorage` — no re-entry needed until you close the tab
- Approve memes to make them visible in the public feed
- Reject memes to permanently delete them
