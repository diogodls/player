# README.md (English)
# Player

Web platform for athlete and futsal session performance analysis, developed in partnership with the UFSM Futsal team.<br>
The project will be validated in real-world scenarios alongside a predominantly university-based team competing at the highest professional futsal level in the state, the Série Ouro of Rio Grande do Sul. The team is also a four-time champion of the Jogos Universitários Gaúchos (JUGS), reinforcing the platform’s competitive and practical environment of use.

Built with React, TypeScript, and Vite, the application provides dashboards, athlete comparison tools, session analysis, and action tagging workflows for coaches and analysts.

---

## Features

* Athlete performance dashboard
* Training and match session management
* Radar comparison between players
* Session summaries and statistics
* Video-based individual analysis
* Action tagging workflow
* Position and action filters
* Toast notification system

---

## Tech Stack

* React 19
* TypeScript
* Vite
* React Router
* Axios
* SWR
* Sass / CSS Modules
* Material UI & MUI X Charts
* Font Awesome
* rc-select
* react-cookie
* json-server
* Docker & Docker Compose

---

## Architecture

The application follows a modular frontend architecture based on:

* React + TypeScript
* Feature-oriented components
* SWR for server state management
* Axios for HTTP requests
* Context API for shared state
* CSS Modules with Sass

---

## Project Structure

```text
src
├── assets
├── components
├── contexts
├── hooks
├── pages
├── utils
└── constants
```

---

## Running Locally

### Prerequisites

* Node.js 20+
* npm

### Installation

```bash
npm install
```

### Start mock server

```bash
npm run mock
```

### Start frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Mock API:

```text
http://localhost:3001
```

---

## Docker

Start the entire environment with:

```bash
docker compose up
```

The additional session-comparison demo data is optional. With the database
running, load it explicitly with:

```bash
docker compose exec postgres psql -U player -d player -f /demo-data/seeds-comparison.sql
```

---

## Main Routes

| Route                               | Description         |
| ----------------------------------- | ------------------- |
| `/`                                 | Home page           |
| `/coach-dashboard`                  | Coach dashboard     |
| `/player/:id`                       | Athlete view        |
| `/sessions`                         | Sessions list       |
| `/sessions/:id`                     | Session details     |
| `/sessions/:id/analysis/individual` | Individual analysis |

---

## Development Notes

* The project currently uses `json-server` as a local mock backend.
* Frontend workflows are functional with mocked data.
* Backend persistence is planned for future integration.
* Some features shown in the interface are still under development.

---

## Roadmap

* Real backend integration
* Persistent session and action storage
* Team analysis flow
* Video timestamp synchronization
* Automated tests
* Better loading and error states
* Environment variable support

---

