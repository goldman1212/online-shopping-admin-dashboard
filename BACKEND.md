# Admin backend

Zero-dependency Node API (Node >= 22.5, uses built-in `node:sqlite`). It serves every `/api/admin/*` route the dashboard calls.

## Run it
```bash
npm install
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='at-least-10-chars' npm run seed:demo   # admin + sample data (omit :demo for admin only)
npm run server        # API on http://localhost:4000
npm run dev           # Vite on :5173, proxies /api to :4000
```
Open the dashboard and sign in. Leave "API base URL" empty in Settings (same origin).

Production: `npm run build && npm start` (serves `dist/` and the API from one port, cookies get `Secure`, so use HTTPS).

## Env vars
`PORT` (4000), `DB_FILE` (./data/shop.db), `NODE_ENV=production`, `CORS_ORIGIN` (only if frontend is on another origin; switches cookie to SameSite=None; Secure).

## Endpoints (all under /api/admin, session cookie required except login/logout)
- POST `/login`, POST `/logout`, GET `/me`
- GET `/overview`, `/users`, `/sellers`, `/products`, `/orders`, `/payments`, `/delivery`, `/tryon`, `/ads`, `/analytics`, `/support`, `/notifications`, `/notifications/unread-count` (list routes take `limit`, `offset`; some take `q`, `status`, `role`)
- PATCH `/users/:id`, `/sellers/:id`, `/products/:id`, `/ads/:id`, `/support/:id` with `{"status": ...}`; PATCH `/orders/:id` with `{"deliveryStatus": ...}`; POST `/notifications/read-all`

## Security notes
scrypt password hashing; random session tokens stored hashed, HttpOnly cookie, 8h expiry; login rate limit (8 fails / 15 min per IP+email, in memory); parameterized SQL only; status values whitelisted; JSON-only + Origin check on writes; audit_log table records admin actions. Not included: multi-admin roles, password reset, HTTPS termination (use a reverse proxy).
