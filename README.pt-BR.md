# Player

Plataforma web de gestão e análise de desempenho no futsal, atualmente utilizada pela equipe masculina de futsal da UFSM. O Player permite cadastrar atletas, gerenciar treinos e jogos e realizar análises individuais e coletivas.

O sistema já está disponível para uso online e utiliza Railway, onde estão hospedados o backend e o banco PostgreSQL. Também pode ser executado localmente, com ou sem Docker Compose.

## Funcionalidades

- Login com autenticação JWT e refresh tokens.
- Cadastro, edição e visualização do desempenho individual de atletas.
- Cadastro e edição de treinos e jogos, com comparação entre sessões.
- Registro de ações individuais e coletivas durante a análise de vídeo.
- Minutagem por jogador e sessão, com edição manual e cronômetro.
- Dashboard do treinador, rankings, métricas e estatísticas.

## Tecnologias

- React 19, TypeScript e Vite
- NestJS 11, TypeScript e TypeORM
- PostgreSQL 16
- Jest para testes do backend; Vitest e Testing Library para testes do frontend
- Docker e Docker Compose

## Estrutura do projeto

```text
frontend/                 Aplicação React e testes do frontend
backend/src/              Módulos NestJS, entidades e testes unitários do backend
backend/src/migrations/   Migrations e dados iniciais de referência
backend/src/scripts/      Seeds de desenvolvimento e manutenção do banco
backend/test/             Testes de ponta a ponta do backend
backend/schema.sql        Estrutura inicial usada pelo Docker Compose
backend/seeds.sql         Catálogo-base usado pelo Docker Compose e pelos seeds
docker/                   Dockerfiles do frontend e do backend
docker-compose.yml        Serviços locais de PostgreSQL, backend e frontend
```

## Execução local

Requisitos: Node.js 20.19+ na linha 20.x, 22.13+ na linha 22.x ou 24.x; npm; e PostgreSQL 16. Como alternativa, utilize Docker com Docker Compose, conforme a seção abaixo.

Antes de iniciar qualquer uma das opções locais:

1. Copie `backend/.env.example` para `backend/.env`.
2. Defina `NODE_ENV=development` e `FRONTEND_URL=http://localhost:5173`; o arquivo de exemplo contém valores voltados à produção.
3. Substitua `JWT_SECRET` e `JWT_REFRESH_SECRET` por segredos aleatórios distintos. O arquivo de exemplo inclui um comando para gerá-los.
4. Copie `frontend/.env.example` para `frontend/.env.local`. Mantenha `VITE_BACKEND_URL=http://localhost:3000` para a API local padrão.

O backend utiliza `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD` e `DATABASE_NAME` para acessar o PostgreSQL, além de `PORT` para a porta HTTP. Fora do Docker, configure esses valores para um banco já criado. O exemplo usa banco, usuário e senha `player` em `localhost:5432`.

Não versione arquivos `.env` nem segredos. As variáveis `VITE_*` do frontend são públicas e não devem conter informações secretas.

Inicie o backend a partir da raiz do repositório:

```bash
cd backend
npm install
npm run start:dev
```

Em outro terminal, também a partir da raiz do repositório:

```bash
cd frontend
npm install
npm run dev
```

O backend aplica as migrations pendentes ao iniciar, incluindo a estrutura inicial e os dados de referência. O frontend fica disponível em `http://localhost:5173` e a API em `http://localhost:3000`.

O login exige um usuário no banco. A migration da tabela de usuários cria uma conta padrão; consulte [CreateUsersTable](backend/src/migrations/1786406400000-CreateUsersTable.ts) para as credenciais iniciais e substitua-as antes de disponibilizar uma instalação online. Não existe endpoint público de cadastro de usuários.

## Docker

Após preparar os arquivos de ambiente acima, inicie PostgreSQL, backend e frontend a partir da raiz do repositório:

```bash
docker compose up -d --build
```

Serviços:

- PostgreSQL: `localhost:5432`
- Backend NestJS: `http://localhost:3000`
- Frontend React: `http://localhost:5173`

O Compose sobrescreve as configurações de banco do backend para conectar ao serviço `postgres` e fixa a porta do backend em `3000`. O navegador continua acessando a API por `localhost:3000`.

Na primeira inicialização do banco, o PostgreSQL executa `backend/schema.sql` e `backend/seeds.sql`. Depois, o backend aplica as migrations pendentes. Os dados persistem no volume `postgres_data`; os scripts SQL de inicialização não são executados novamente em um volume existente.

Essa configuração do Compose executa servidores de desenvolvimento com o código-fonte montado nos contêineres. Para encerrar os serviços preservando o volume do banco:

```bash
docker compose down
```

## Migrations e seeds

As alterações de estrutura ficam em `backend/src/migrations/`. O TypeORM executa as migrations pendentes automaticamente ao iniciar o backend; a sincronização automática de estrutura está desabilitada.

Para executar migrations manualmente, use os comandos abaixo em `backend/`, com as variáveis de banco definidas no ambiente do terminal:

```bash
npm run migration:run
npm run migration:revert
```

`migration:revert` desfaz a última migration. Diferentemente da aplicação NestJS, a CLI de migrations e os scripts de desenvolvimento não carregam `backend/.env` automaticamente.

Para carregar dados opcionais de demonstração após as migrations, execute em `backend/`, usando um banco de desenvolvimento descartável:

```bash
npm run seed
```

Defina também `NODE_ENV=development` nesse terminal. **Esse seed substitui os dados existentes de equipes, jogadores, sessões, ações e minutagem**; não é uma etapa de inicialização de produção. O script bloqueia a execução quando `NODE_ENV=production`. Os dados de referência necessários ao funcionamento já são fornecidos pelas migrations.

## Validação

Execute os testes do frontend (Vitest), os testes unitários do backend (Jest) e verifique os builds, começando pela raiz do repositório:

```bash
cd frontend
npm run build
npm test

cd ../backend
npm run build
npm test -- --runInBand
```

Para o ambiente Docker, valide a configuração e consulte os serviços em execução a partir da raiz do repositório:

```bash
docker compose config
docker compose ps
```

## Hospedagem

O Player já pode ser acessado e utilizado online e utiliza Railway para o backend e o banco PostgreSQL.

O backend disponibiliza `npm run build` e `npm run start:prod` para produção. Configure as variáveis do banco, os segredos JWT, `NODE_ENV=production` e `FRONTEND_URL` com a origem real do frontend. O servidor HTTP utiliza a variável `PORT`, com `3000` como valor padrão.

O build do frontend (`npm run build` em `frontend/`) gera `frontend/dist/`. Defina `VITE_BACKEND_URL` com a URL HTTPS da API publicada antes do build; em produção não há valor padrão apontando para localhost. Alterar essa variável exige um novo build do frontend. Mantenha a origem do frontend e as configurações de cookies do backend compatíveis com o fluxo de login por refresh token.