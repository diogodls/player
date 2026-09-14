# Player

Web platform for futsal management and performance analysis, currently used by the UFSM men's futsal team. Player supports athlete registration, training and match management, and individual and team analysis.

The system is available online and currently uses Railway, where the backend and PostgreSQL database are hosted. It can also run locally, with or without Docker Compose.

## Features

- Login with JWT authentication and refresh tokens.
- Athlete registration, editing, and individual performance views.
- Training and match registration, editing, and session comparisons.
- Individual and team action tagging during video analysis.
- Per-player session minutes, with manual editing and a timer.
- Coach dashboard, rankings, metrics, and statistics.

## Stack

- React 19, TypeScript, Vite
- NestJS 11, TypeScript, and TypeORM
- PostgreSQL 16
- Jest for backend tests; Vitest and Testing Library for frontend tests
- Docker and Docker Compose

## Project structure

```text
frontend/                 React application and frontend tests
backend/src/              NestJS modules, entities, and backend unit tests
backend/src/migrations/   Database migrations and initial reference data
backend/src/scripts/      Development seed and database maintenance scripts
backend/test/             Backend end-to-end tests
backend/schema.sql        Initial schema used by Docker Compose
backend/seeds.sql         Base catalog data used by Docker Compose and seeds
docker/                   Frontend and backend Dockerfiles
docker-compose.yml        Local PostgreSQL, backend, and frontend services
```

## Running locally

Requirements: Node.js 20.19+ on the 20.x branch, 22.13+ on the 22.x branch, or 24.x; npm; and PostgreSQL 16. Alternatively, use Docker with Docker Compose as described below.

Before starting either local setup:

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `NODE_ENV=development` and `FRONTEND_URL=http://localhost:5173`; the example file contains production-oriented values.
3. Replace `JWT_SECRET` and `JWT_REFRESH_SECRET` with separate random secrets. The example file includes a command to generate them.
4. Copy `frontend/.env.example` to `frontend/.env.local`. Keep `VITE_BACKEND_URL=http://localhost:3000` for the default local API.

The backend uses `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, and `DATABASE_NAME` for PostgreSQL, and `PORT` for its HTTP port. For execution outside Docker, configure these values for an existing database. The example defaults use database/user/password `player` at `localhost:5432`.

Keep `.env` files and secrets out of version control. Frontend `VITE_*` variables are public and must not contain secrets.

Start the backend from the repository root:

```bash
cd backend
npm install
npm run start:dev
```

In another terminal, also from the repository root:

```bash
cd frontend
npm install
npm run dev
```

The backend applies pending migrations on startup, including the initial schema and reference data. The frontend is available at `http://localhost:5173` and the API at `http://localhost:3000`.

Login requires a database user. The user-table migration creates a default account; see [CreateUsersTable](backend/src/migrations/1786406400000-CreateUsersTable.ts) for the initial credentials and replace them before exposing an installation. There is no public user-registration endpoint.

## Docker

After preparing the environment files above, start PostgreSQL, backend, and frontend from the repository root:

```bash
docker compose up -d --build
```

Services:

- PostgreSQL: `localhost:5432`
- NestJS backend: `http://localhost:3000`
- React frontend: `http://localhost:5173`

Compose overrides the backend database settings to connect to the `postgres` service and fixes the backend port at `3000`. The browser still accesses the API through `localhost:3000`.

On the first database initialization, PostgreSQL runs `backend/schema.sql` and `backend/seeds.sql`. The backend then applies pending migrations. Database files persist in the `postgres_data` volume; initialization SQL is not rerun for an existing volume.

This Compose setup runs development servers with source mounts. To stop the services while keeping the database volume:

```bash
docker compose down
```

## Migrations and seeds

Schema changes live in `backend/src/migrations/`. TypeORM runs pending migrations automatically when the backend starts; automatic schema synchronization is disabled.

For manual migration commands, run from `backend/` with the database variables exported in the terminal environment:

```bash
npm run migration:run
npm run migration:revert
```

`migration:revert` undoes the latest migration. Unlike the NestJS application, the migration CLI and development scripts do not automatically load `backend/.env`.

To load optional demonstration data after migrations, run from `backend/` against a disposable development database:

```bash
npm run seed
```

Set `NODE_ENV=development` in that terminal as well. **This seed replaces existing team, player, session, action, and minutes data**; it is not a production initialization step. The script refuses to run when `NODE_ENV=production`. Initial reference data for normal operation is already supplied by migrations.

## Validation

Run frontend tests (Vitest) and backend unit tests (Jest), and check both builds, starting from the repository root:

```bash
cd frontend
npm run build
npm test

cd ../backend
npm run build
npm test -- --runInBand
```

For the Docker setup, validate the configuration and inspect running services from the repository root:

```bash
docker compose config
docker compose ps
```

## Hosting

Player is currently accessible online and uses Railway for the backend and PostgreSQL database.

The backend provides `npm run build` and `npm run start:prod` for production. Configure its database variables, JWT secrets, `NODE_ENV=production`, and `FRONTEND_URL` for the actual frontend origin. The HTTP server reads `PORT` from the environment, falling back to `3000`.

The frontend build (`npm run build` from `frontend/`) generates `frontend/dist/`. Set `VITE_BACKEND_URL` to the deployed API's HTTPS URL before building; production has no localhost fallback. Changing this value requires a new frontend build. Keep the frontend origin and backend cookie settings compatible with the refresh-token login flow.

The repository still contains frontend configuration and example comments referring to Vercel. These do not describe the current Railway backend/database hosting.
