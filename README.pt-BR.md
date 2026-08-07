# Player

Plataforma web para análise de desempenho de atletas e sessões de futsal, composta por frontend React/Vite, backend NestJS e persistência PostgreSQL.

## Tecnologias

- React 19, TypeScript e Vite
- NestJS e TypeORM
- PostgreSQL 16
- Docker e Docker Compose

## Execução local

Requisitos: Node.js 20+, npm, PostgreSQL 16 e Docker para o ambiente em contêineres.

O frontend consome a API NestJS. Use `VITE_BACKEND_URL` quando a API não estiver disponível em `http://localhost:3000`.

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

Inicie PostgreSQL, backend e frontend:

```bash
docker compose up -d --build
```

Serviços:

- PostgreSQL: `localhost:5432`
- Backend NestJS: `http://localhost:3000`
- Frontend React: `http://localhost:5173`


## Validação

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
