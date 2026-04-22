# Alpha Queue

Alpha Queue is organized as a modular full-stack project with a separate Next.js frontend, Express backend, a reserved `shared/` space for truly cross-layer code, and room for project documentation.

## Structure

```text
alpha-queue/
├── frontend/      # Next.js app, UI components, frontend services, hooks, lib
├── backend/       # Express API, config, middleware, models, modules, seeds
├── shared/        # Cross-layer constants, schemas, and types when needed
├── docs/          # Architecture and project notes
└── README.md
```

## Frontend

- App Router pages live in `frontend/app`
- Reusable UI lives in `frontend/components`
- API helpers live in `frontend/services`
- Frontend utilities live in `frontend/lib`

Run it with:

```bash
cd frontend
npm run dev
```

## Backend

- API entrypoint: `backend/src/server.js`
- App setup: `backend/src/app.js`
- Shared config: `backend/src/config`
- Middleware: `backend/src/middleware`
- Domain modules: `backend/src/modules`
- Database models: `backend/src/models`

Run it with:

```bash
cd backend
npm run dev
```

## Shared

`shared/` is currently reserved for code that needs to be consumed by both the frontend and backend.
Frontend-only mock data now lives in `frontend/lib/mock-data`.

## Notes

- The frontend defaults to `http://localhost:3000`
- The backend defaults to `http://localhost:5000`
- Backend environment variables live in `backend/.env`
