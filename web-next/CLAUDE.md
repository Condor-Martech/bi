# CLAUDE.md — legacy/web-next

## Qué es esto

Frontend Next.js 16 (App Router) para el backend NestJS legacy en [`../app/`](../app/). **NO es parte del Turborepo de new-bi** — vive en `legacy/` como sibling de la API y del Angular archivado en `../web/`. Lockfile propio. Deploy independiente.

Plan completo: `~/.claude/plans/quiero-hacer-el-front-wobbly-flurry.md`. Memoria engram: `architecture/legacy-web-next-frontend`.

## Comandos

```bash
pnpm install --ignore-workspace       # OBLIGATORIO la primera vez
pnpm dev                              # :3002
pnpm typecheck                        # tsc --noEmit
pnpm lint
pnpm build
```

`--ignore-workspace` es no negociable: el `pnpm-workspace.yaml` del root de new-bi capturaría esta app si no se la excluyera. El `.npmrc` local declara `ignore-workspace=true` pero pnpm 10 no siempre lo respeta sin el flag CLI.

## Stack

- Next 16.2.6, React 19.2.4, TypeScript strict + `noUncheckedIndexedAccess`
- Tailwind v4 (CSS-first, sin `tailwind.config.ts` — tokens en `app/globals.css`)
- shadcn (preset Nova, Radix base) en `components/ui/`
- Fuentes: Inter + IBM Plex Mono
- TanStack Query / Table, sonner, lucide-react, powerbi-client, zod

## Arquitectura

- **Auth**: cookie httpOnly `bi_token` con TTL = JWT.exp - now. Sin refresh (legacy no lo expone). 401 → redirect a `/login`.
- **BFF**: `app/api/**/route.ts` proxean al legacy, adjuntan `Authorization: Bearer <token-del-cookie>`. URL del legacy NUNCA llega al cliente (no usar `NEXT_PUBLIC_API_URL`).
- **SSE**: `/api/notifications/stream` → legacy `/notifications/stream?token=` (EventSource no permite headers; el JWT entra por query del lado server→server).
- **Multipart**: `/api/maps/upload` passthrough con `duplex: 'half'`, preserva Content-Type boundary.
- **Diseño**: estética Twenty reproducida con tokens (paleta, densidad, radii tight 4px). NO se adopta código de Twenty (usa Emotion+Recoil, incompatible).

## Convenciones

- Imports con alias `@/*` (ver `tsconfig.json`).
- BFF: un catch-all `[[...path]]/route.ts` por módulo del legacy, delegando en `lib/api/proxy.ts`. SSE y multipart tienen handlers dedicados.
- Validar respuestas del legacy con zod en el BFF (Mongo `_id` → `id`, shapes inconsistentes).
- IDs del legacy son Mongo ObjectId (24-hex). Regex: `/^[0-9a-f]{24}$/`. NO uuid.
- Power BI client es browser-only: `'use client'` en el wrapper + `next/dynamic` con `ssr: false` si hay quejas.
- Cookies: `bi_token` (distinto de `bi_access`/`bi_refresh` que usa `new-bi/apps/web`, para coexistir en dev en el mismo host).

## Puertos

| App | Puerto |
|---|---|
| este | 3002 |
| `new-bi/apps/web` | 3001 |
| `legacy/app` | 3000 (sin docker) / 5524 (docker → 3000) |

## Gotchas conocidos

- `lib/api/proxy.ts` debe forwardear `searchParams` (apps/web los DROPEA, bug). Legacy usa `?page=&limit=`.
- Strippear `Set-Cookie` del upstream antes de devolver — no leakear cookies del legacy.
- Forward de `req.signal` al fetch upstream en SSE — si no, el legacy acumula subscribers cuando el browser desconecta.
- `pnpm v10` no honra `ignore-workspace` del `.npmrc` solo — siempre pasar `--ignore-workspace` en CLI.

## Mapa de endpoints del backend

Todos los controllers viven en `../app/src/app/modules/<modulo>/<modulo>.controller.ts`. Base path = nombre del módulo en kebab-case. Roles en `ROLE_TYPES`: `manager`, `admin`, `user`.

| Módulo | Base path | Highlights |
|---|---|---|
| `users` | `/users` | `POST /login`, CRUD, `PATCH /change-password`, `PATCH /forget/pass/:email`, `PATCH /:userId/group/:groupId`, `PATCH /:userId/reports` |
| `accounts` | `/accounts` | Power BI tenants (Azure AD). `POST /backup`, `POST /restore`. `:id` colisiona con `/backups` — backend lo declara antes |
| `groups` | `/groups` | Power BI **workspaces** cacheados. `GET /all/:accountId`, `GET /report/:groupIdPB` |
| `reports` | `/reports` | `POST /syncronize` (sí, con typo — mantener), `GET /me`, `GET /all`, `GET /:reportId` (object-level ACL via user-groups) |
| `custom-reports` | `/custom-reports` | Overrides por reporte. Key: `reportIdPB` |
| `favourites` | `/favourites` | Hardeneado: object-level ACL, índice unique compuesto (user+report) |
| `filters` | `/filters` | Row-level. `GET /tabelas/:id`, `GET /get/datasets`, `PATCH /upadate/:id` (typo en backend) |
| `maps` | `/maps` | `POST /upload` multipart |
| `user-groups` | `/user-groups` | Fuente de permisos en vivo para reports |
| `notifications` | `/notifications` | CRUD + `@Sse('stream')` para tiempo real |
| `login-log` | `/login-log` | Audit de logins |
| `analysis` | `/analysis` | IA narrativo (OpenAI + DAX). `POST /report/:reportId`, `GET /report/:reportId/history` |

Swagger en `http://localhost:3000/api` cuando el backend corre. **Verificá ahí antes de asumir shapes** — el legacy tiene typos en rutas (`syncronize`, `upadate`, `inclued`) y los preservamos.

## Recursos

- Backend doc: [`../app/CLAUDE.md`](../app/CLAUDE.md)
- Skill de proyecto: [.claude/skills/legacy-web-next/SKILL.md](.claude/skills/legacy-web-next/SKILL.md) — triggers para Claude
- Plan completo: `~/.claude/plans/quiero-hacer-el-front-wobbly-flurry.md`
- Twenty tokens (referencia visual): `github.com/twentyhq/twenty` → `packages/twenty-front/src/modules/ui/theme/`
