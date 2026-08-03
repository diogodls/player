# Player

Web platform for athlete and futsal-session performance analysis, built with a React/Vite frontend, a NestJS backend, and PostgreSQL persistence.

## Stack

- React 19, TypeScript, Vite
- NestJS and TypeORM
- PostgreSQL 16
- Docker and Docker Compose

## Running locally

Requirements: Node.js 20+, npm, PostgreSQL 16, and Docker when using the containerized environment.

The frontend consumes the NestJS API. Override its URL with `VITE_BACKEND_URL` when the API is not available at `http://localhost:3000`.

```bash
cd backend
npm install
npm run start:dev
```

```bash
cd frontend
npm install
npm run dev
```

## Docker

Start PostgreSQL, backend, and frontend:

```bash
docker compose up -d --build
```

Services:

- PostgreSQL: `localhost:5432`
- NestJS backend: `http://localhost:3000`
- React frontend: `http://localhost:5173`

`backend/seeds.sql` is initialized with the database and contains only required structural catalogs and the base team. `backend/seeds-comparison.sql` is a manual demonstration file and is not mounted or executed by Docker Compose.

## Validation

```bash
cd frontend
npm run build
npm test

cd ../backend
npm run build
npm test -- --runInBand

cd ..
docker compose config
docker compose ps
```
