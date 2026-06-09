# README.pt-BR.md (Português)

# Player

Plataforma web para análise de desempenho de atletas e sessões de futsal, desenvolvida em parceria com a equipe UFSM Futsal.

Construída com React, TypeScript e Vite, a aplicação oferece dashboards, comparação entre atletas, análise de sessões e fluxos de tagueamento de ações para treinadores e analistas.

O projeto será validado na prática junto à equipe da UFSM Futsal, formada majoritariamente por atletas universitários que competem no mais alto nível estadual de futsal profissional, na Série Ouro do futsal gaúcho. A equipe também é tetracampeã dos Jogos Universitários Gaúchos (JUGS), reforçando o contexto competitivo e real de utilização da plataforma.

---

## Funcionalidades

* Dashboard de desempenho de atletas
* Gerenciamento de treinos e jogos
* Comparação de atletas com gráfico radar
* Resumo e estatísticas de sessões
* Análise individual baseada em vídeo
* Fluxo de tagueamento de ações
* Filtros por posição e ações
* Sistema de notificações toast

---

## Tecnologias

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

## Arquitetura

A aplicação segue uma arquitetura frontend modular baseada em:

* React + TypeScript
* Componentes organizados por feature
* SWR para gerenciamento de estado servidor
* Axios para requisições HTTP
* Context API para estados compartilhados
* CSS Modules com Sass

---

## Estrutura do Projeto

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

## Executando Localmente

### Pré-requisitos

* Node.js 20+
* npm

### Instalação

```bash
npm install
```

### Iniciar mock

```bash
npm run mock
```

### Iniciar frontend

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

Inicie todo o ambiente com:

```bash
docker compose up
```

---

## Principais Rotas

| Rota                                | Descrição              |
| ----------------------------------- | ---------------------- |
| `/`                                 | Página inicial         |
| `/coach-dashboard`                  | Dashboard do treinador |
| `/player/:id`                       | Visualização do atleta |
| `/sessions`                         | Lista de sessões       |
| `/sessions/:id`                     | Detalhes da sessão     |
| `/sessions/:id/analysis/individual` | Análise individual     |

---

## Notas de Desenvolvimento

* O projeto utiliza `json-server` como backend mock local.
* Os fluxos do frontend funcionam com dados mockados.
* A persistência real com backend será integrada futuramente.
* Algumas funcionalidades exibidas na interface ainda estão em desenvolvimento.

---

## Roadmap

* Integração com backend real
* Persistência de sessões e ações
* Fluxo de análise coletiva
* Sincronização de timestamp do vídeo
* Testes automatizados
* Melhor tratamento de loading e erros
* Configuração via variáveis de ambiente

---