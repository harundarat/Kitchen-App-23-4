# KitchenCraft

KitchenCraft is a recipe application with a React frontend and a TypeScript
Express API. The administrator portal is part of the frontend at
`/admin/login`; there is no separate admin application.

## Local development

Start the backend before the frontend so the browser client has an API to call:

```bash
cd backend
npm ci
cp .env.example .env
docker compose up -d mongo
npm run dev
```

In a second terminal:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

Set `VITE_BASE_URL` in `frontend/.env` to the backend API root, for example
`http://localhost:3000/api`.

## Administrator access

Configure `ADMIN_USERNAME`, `ADMIN_FULL_NAME`, `ADMIN_EMAIL`, and
`ADMIN_PASSWORD` in `backend/.env`, then seed the administrator:

```bash
cd backend
npm run seed:admin
```

Open `/admin/login` directly. The application uses one HTTP-only `token`
cookie, so signing in as an administrator replaces any active user session and
vice versa. Deploy the backend before the frontend because the frontend relies
on the protected admin API routes.

## Validation

```bash
cd backend
npm ci
npm run check
npm run build
npm audit --audit-level=high
```

```bash
cd frontend
npm ci
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
npm audit --audit-level=high
```
