# Frontend no Vercel

Somente `frontend/` deve ser publicado. NestJS e PostgreSQL continuam em infraestrutura externa.

## Configuração manual do projeto

Importe o repositório pela integração Git do Vercel e configure:

| Opção | Valor |
| --- | --- |
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci` |
| Node.js | 24.x (validação local: 24.20.0) |
| Production Branch | `main` |

Mantenha deploys Git habilitados para todas as branches. Não configure filtros que aceitem somente `main`, nem um Ignored Build Step que cancele previews. Se quiser um deploy para cada push mesmo sem alterações no frontend, desabilite a opção de pular projetos não afetados no monorepo. Verifique permissões da integração Git, acesso dos autores e eventuais aprovações para PRs de forks. Deployment Protection pode exigir login dos revisores para abrir previews.

O `vercel.json` está dentro da Root Directory. Não é necessário um workflow de deploy no GitHub Actions. O CI existente só executa em pushes na `main` e PRs destinados a ela; essa restrição não controla a integração Git do Vercel. Configurações do painel Vercel não foram consultadas nem modificadas nesta preparação.

## Variáveis

| Ambiente Vercel | Variável | Valor a cadastrar |
| --- | --- | --- |
| Production | `VITE_BACKEND_URL` | URL HTTPS real e pública da API NestJS |
| Preview | `VITE_BACKEND_URL` | URL HTTPS real da API usada nos previews |
| Development | `VITE_BACKEND_URL` | `http://localhost:3000`, se a API for local |

A URL do backend ainda não foi definida. Não use localhost em Production/Preview. Os dois ambientes podem usar inicialmente a mesma API, mas compartilharão dados e os previews poderão alterá-los conforme as permissões dos usuários. Prefira um backend de homologação quando disponível.

Não há outra variável de ambiente exigida pelo frontend atual. Não cadastre JWT secrets ou credenciais PostgreSQL no frontend: `VITE_*` é incorporado ao JavaScript público durante o build. Após alterar uma variável no Vercel, gere um novo deployment. Não sobrescreva `NODE_ENV` para development nos previews: eles também são builds de produção do Vite.

Localmente, copie `.env.example` para `.env.local` se precisar definir a API. O fallback para `http://localhost:3000` existe exclusivamente com `import.meta.env.DEV`. Sem a variável, o build estático ainda compila, mas a aplicação publicada interrompe a inicialização com um erro explícito de configuração; não usa localhost nem a própria origem como API. A variável deve estar cadastrada antes do deploy.

## Rotas e assets

O rewrite `/(.*)` para `/index.html` permite abertura direta e atualização das rotas do BrowserRouter em qualquer domínio do deployment:

- `/`, `/login`, `/coach-dashboard`, `/player/:id`, `/rankings`;
- `/sessions`, `/sessions/comparison`, `/sessions/:id`, `/sessions/:id/minutes`;
- `/sessions/:id/analysis/individual`, `/sessions/:id/analysis/team`;
- `/athlete-registration`.

Os arquivos estáticos existentes continuam sendo servidos pelo Vercel. O Vite usa a base padrão `/`, gera assets em `dist/assets`, e o frontend usa caminhos internos sem domínio fixo. Não há necessidade de um basename no BrowserRouter. As rotas protegidas redirecionam para `/login` sem sessão: isso é comportamento da aplicação, não um 404 do Vercel.

## Backend: pendências para autenticação funcionar

Nenhum arquivo do backend foi alterado. Há dois bloqueios concretos no código atual:

1. `backend/src/main.ts`: CORS usa uma única string em `FRONTEND_URL`, com fallback local. Configure a origem exata de produção. Para atender também várias URLs de preview, será necessário ajustar o backend para uma allowlist de origens exatas, atualizada com os previews autorizados, ou uma validação estrita vinculada ao projeto/equipe. A variável atual não interpreta uma lista separada por vírgulas. Considere tanto aliases de branch quanto URLs únicas de deployment que serão abertas. Não aceite indiscriminadamente `*.vercel.app`, qualquer `Origin`, ou `*`. Mantenha `credentials: true`, responda aos preflights e permita `Authorization` e `Content-Type` para as origens autorizadas.
2. `backend/src/auth/auth.controller.ts`: o cookie `refresh_token` é HttpOnly, tem `path=/auth`, usa `SameSite=Strict` e só recebe `Secure` com `NODE_ENV=production`. Para frontend e API em sites distintos, será necessário `SameSite=None; Secure`, API em HTTPS e proteção CSRF apropriada (incluindo validação de Origin nos endpoints que usam cookies). Revise também os atributos usados na remoção do cookie. Isso exige alteração futura no backend: somente configurar `FRONTEND_URL` não resolve.

Mesmo `SameSite=None; Secure` pode ser bloqueado pelas políticas de cookies de terceiros do navegador. Teste login, refresh após atualizar a página e logout nos navegadores suportados, em produção e preview. Se necessário, avalie uma arquitetura same-site com domínios próprios ou proxy controlado; essa mudança não faz parte desta preparação. Não defina `Domain=.vercel.app`: o cookie deve pertencer à API.

O frontend já envia `withCredentials: true`. O access token JWT permanece em memória no `AuthContext`, é enviado como Bearer pelo `useAxiosInterceptor` e é recuperado via `/auth/refresh` após recarregar. Assim, um login inicial bem-sucedido não comprova que a sessão persistirá: o cookie precisa funcionar. Usar a mesma API nos ambientes também pode compartilhar a sessão da API conforme as políticas do navegador.

`ActionLog.tsx` guarda rascunhos em cookies locais com `SameSite=Lax`, sem Domain e sem Secure explícito. Esses cookies não são os de autenticação e ficam restritos a cada hostname; os rascunhos não migram automaticamente entre URLs de preview.

## Mocks, localhost e arquivos de ambiente

Não foram encontrados `mockApi`, `localhost:3001` ou JSON Server no código, scripts, dependências diretas e documentação analisados desta branch. Mocks dos testes Vitest não são backend de produção.

Referências a localhost:

- `frontend/src/utils/api.ts`: fallback exclusivo para desenvolvimento;
- `frontend/.env.example`: configuração local de exemplo;
- `frontend/src/utils/api.test.ts`: teste do fallback local;
- `README.md` e `README.pt-BR.md`: URLs locais do frontend, API e PostgreSQL;
- `backend/src/main.ts`: origem CORS local;
- `backend/src/app.module.ts`, `backend/src/data-source.ts`, `backend/src/scripts/seed-development-data.ts`, `backend/src/scripts/clean-development-data.ts`: host local do PostgreSQL;
- `backend/.env.example`: host de banco local; `backend/.env` já existe e é rastreado pelo Git (valores não reproduzidos).

Não havia `.env` ou `.env.example` no frontend. O novo `.gitignore` do frontend ignora arquivos reais de ambiente e `.vercel`, preservando `.env.example`. O `.env` do backend foi mantido intacto; se contiver credenciais reais, precisa de tratamento separado, incluindo rotação de credenciais expostas. Nenhum secret foi copiado para esta documentação ou para o frontend.

## Fluxo Git

- Push/merge na `main`: Production Deployment usando variáveis de Production.
- Push em outra branch ativa: Preview Deployment usando variáveis de Preview, com URL de deployment e alias de branch conforme o Vercel.
- PR: preview associado à integração Git; novos commits atualizam o preview.

As alterações desta preparação existem somente na branch de trabalho `feat-otimizar-banco-de-dados`. `origin/HEAD` e a consulta remota apontam para `main`. Nenhuma branch foi criada, alterada de nome, excluída ou trocada. Após revisão, as alterações precisam ser integradas à `main` e incorporadas às demais branches ativas que devam usar esta configuração. A preparação não modifica automaticamente o conteúdo dessas outras branches.

## Validação e limites

- `npm run build`: passou; aviso de chunk principal maior que 500 kB (aproximadamente 962 kB, 308 kB gzip). Não impede o deploy.
- `npm test`: 26 arquivos e 105 testes existentes passaram.
- `npm test -- src/utils/api.test.ts`: 5 testes novos passaram, cobrindo configuração remota, credentials, ausência da variável e fallback local.
- `npm run lint`: 2 erros preexistentes, em `src/components/SessionDetails/SessionActions/SessionActions.test.tsx:10` (`no-explicit-any`) e `src/contexts/AuthContext/AuthContext.tsx:133` (`react-refresh/only-export-components`). Esses arquivos não foram alterados.
- Verificação estática: as 12 rotas concretas de exemplo correspondem ao rewrite; `dist/index.html` existe; o JavaScript gerado não contém o fallback `http://localhost:3000`. Isso não substitui a validação HTTP no Vercel.

## Arquivos analisados e mudanças

Analisados: `frontend/package.json` e lockfile, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/utils/api.ts`, `src/services/auth.ts`, `src/contexts/AuthContext/AuthContext.tsx`, `src/hooks/useAxiosInterceptor.ts`, `src/components/layout/ProtectedRoute/ProtectedRoute.tsx` e `src/components/elements/ActionLog/ActionLog.tsx`. Foram pesquisados os demais fontes para uso da API, variáveis, assets, URLs e mocks. Também foram inspecionados estrutura Git, `.github/workflows/ci.yml`, `.gitignore`, READMEs, configuração Docker, `backend/src/main.ts`, `backend/src/auth/auth.controller.ts`, `backend/src/auth/jwt.strategy.ts`, `backend/.env.example` e apenas os nomes das variáveis do `backend/.env`.

Alterado: `frontend/src/utils/api.ts`.

Criados: `frontend/vercel.json`, `frontend/.env.example`, `frontend/.gitignore`, `frontend/src/utils/api.test.ts` e este guia.

O build não acessa a API. Não houve deploy real, commit, push ou teste de autenticação contra backend remoto. Após configurar API/CORS/cookies e Vercel, valide todas as rotas por acesso direto e refresh, carregamento de assets, login, renovação de sessão, logout e chamadas autenticadas em produção e preview.

## Referências

- [Vite no Vercel e fallback SPA](https://vercel.com/docs/frameworks/frontend/vite)
- [Integração Git e ambientes](https://vercel.com/docs/git)
- [Ignored Build Step](https://vercel.com/kb/guide/how-do-i-use-the-ignored-build-step-field-on-vercel)
- [Cookies e SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
- [Restrições de cookies de terceiros](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Third-party_cookies)
