# SnipURL ⚡

> Modern, production-ready, edge-deployed URL shortener and analytics platform.

SnipURL is a full-featured URL shortening platform — shorten links, protect them with passwords, set expiration dates, create one-time links, and shorten in bulk with CSV upload. Built on Cloudflare Workers + D1 + KV for sub-10ms redirects worldwide.

---

## 🏗️ Architecture

```
Client → Cloudflare Worker (Hono) → KV Cache (10ms) → D1 SQL (fallback)
Frontend (Next.js) → Worker API → D1 / Supabase Auth
```

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Zustand
- **Backend**: Cloudflare Workers, Hono, Drizzle ORM
- **Data**: Cloudflare D1 (SQL), Cloudflare KV (edge cache)
- **Auth**: Supabase (Google OAuth + email/password)

---

## ⚡ Features

- **URL Shortening** — Minimal sequential short codes (`a`, `b`, ..., `z`, `aa`, `ab`...)
- **Custom Aliases** — Pick your own short code
- **Password Protection** — Links secured with a password
- **Expiration** — Set a date/time when the link stops working
- **One-Time Links** — Self-destruct after the first visit
- **Bulk CSV Shortening** — Drag-and-drop CSV upload, up to 100 URLs at once, results downloadable as CSV
- **Batch Grouping** — Bulk-created links grouped in the dashboard with expand/collapse
- **Link Claiming** — Unauthenticated users can claim their link by signing up — link transfers to their dashboard
- **QR Codes** — Dynamically generated, downloadable as PNG
- **Analytics Dashboard** — Clicks timeline, unique visitors, countries, devices, browsers, referrers
- **User Settings** — Name, date of birth, password set/change (persisted in Cloudflare D1)
- **Auth** — Google OAuth and email/password via Supabase
- **Dark / Light Theme** — Toggle in settings
- **API Key Management** — Create and revoke API keys for programmatic access
- **Spam Filtering** — Blocks known spam domains and URL shorteners
- **Responsive Layout** — Full-width on all screen sizes

---

## 🚀 Getting Started Locally

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Available at `http://localhost:8787`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Available at `http://localhost:3000`.

---

## 🌐 Production Deployment

### 1. Cloudflare Setup

```bash
npx wrangler login
npx wrangler d1 create snapurl-db
npx wrangler kv:namespace create KV
```

Update `backend/wrangler.toml` with the IDs.

### 2. Apply Migrations

```bash
cd backend
npx wrangler d1 migrations apply snapurl-db --remote
```

### 3. Deploy

```bash
cd backend
npm run deploy
```

Frontend can be deployed to Vercel or Cloudflare Pages pointing to your GitHub repo.
