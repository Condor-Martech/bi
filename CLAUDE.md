# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`legacy/` is a **standalone git repository** that pairs the old Business Intelligence stack with its replacement frontend. It lives inside the parent `new-bi` monorepo on disk but is **NOT** a Turborepo workspace and is **NOT** built by `new-bi`'s `pnpm`/`turbo` commands. Two independent apps:

| Path | What | Stack | Per-app docs |
|------|------|-------|--------------|
| [`app/`](app/) | `power-bi` — multi-tenant gateway in front of Microsoft Power BI. Azure AD per tenant, RBAC, row-level filters, audit, notifications. Brazilian Portuguese codebase + Swagger. | NestJS 9 + MongoDB + Bull/Redis | [`app/CLAUDE.md`](app/CLAUDE.md) |
| [`web-next/`](web-next/) | Next.js 16 dashboard built to replace the archived Angular frontend, consuming `app/` over HTTPS. Twenty-CRM-inspired UI. | Next 16 + React 19 + Tailwind v4 + shadcn | [`web-next/CLAUDE.md`](web-next/CLAUDE.md) |

The two apps use **different package managers** (`npm` for `app/`, `pnpm` for `web-next/`) and have **separate lockfiles, node_modules, and deploys**. They do not share dependencies.

Per the parent monorepo's own CLAUDE.md, `legacy/` is archived reference, but active work continues on `web-next/` as the new frontend for the still-running legacy NestJS API.

## Commands

Always `cd` into the relevant subdirectory first — there is no root-level package manifest.

### Backend ([`app/`](app/) — NestJS, npm)

```bash
cd app
npm install --legacy-peer-deps         # peer-dep conflicts; see Dockerfile
npm run start:dev                      # watch mode on :3000
npm run build                          # nest build -> dist/
npm run lint
npm run test                           # jest unit
npm run test -- <pattern>              # single test file/pattern
npm run test:e2e                       # ./test/jest-e2e.json
npm run test:cov

docker-compose up                      # app :5524→3000, mongo, mongo-express :5525, redis, redis-commander :5521
```

Swagger UI on `/api`, Bull Board on `/admin/queues`.

### Frontend ([`web-next/`](web-next/) — Next.js, pnpm)

```bash
cd web-next
pnpm install --ignore-workspace        # MANDATORY: the parent new-bi root has pnpm-workspace.yaml
                                       # pnpm 10 walks up and captures this app unless --ignore-workspace is passed.
                                       # The local .npmrc declares ignore-workspace=true but pnpm 10 doesn't always honor it.
pnpm dev                               # next dev :3002
pnpm typecheck                         # tsc --noEmit
pnpm lint
pnpm build
pnpm ladle                             # component explorer
```

## Architecture (big picture across both apps)

### How they connect

```
browser  ──▶  web-next  (:3002, Next.js BFF)  ──▶  app  (:3000, NestJS)  ──▶  Mongo / Redis / Azure AD / Power BI REST
            cookie: bi_token (httpOnly)         Authorization: Bearer <JWT>
```

- `web-next/app/api/**/route.ts` are **BFF route handlers**. They read the `bi_token` httpOnly cookie, attach `Authorization: Bearer <jwt>` server-side, and proxy to `app/` via `lib/api/proxy.ts`. The legacy URL is **never** exposed to the client (do not use `NEXT_PUBLIC_API_URL`).
- The NestJS backend itself has no refresh-token flow exposed — `bi_token`'s TTL is derived from `JWT.exp`. 401 → redirect to `/login`.
- Special-case BFF handlers: `/api/notifications/stream` translates header-auth into a query-param JWT for `EventSource` SSE; `/api/maps/upload` uses `duplex: 'half'` to preserve multipart boundaries.

### Backend internals worth knowing (full detail in [`app/CLAUDE.md`](app/CLAUDE.md))

- Global guards are wired in `app/src/app.config.ts` (`PROVIDER`): `JwtAuthGuard` then `RolesGuard`, both run on every request. Opt out per-handler with `@SkipAuth()`; opt into roles with `@Roles(...)`. Roles enum (`manager`, `admin`, `user`) lives in `modules/users/dto/create-user.dto.ts`.
- Power BI integration: one `Account` per Azure AD tenant; OAuth password-grant tokens stored encrypted; `RefreshToken.refresh(email)` refreshes on demand when <3min left. Always call `AccountsService.getIdAccount` / `getBiAccount` / `findAllAccounts` — never the Mongo model directly — when you need a usable bearer token.
- `MongoDB connection is hardcoded** in `app/src/app.config.ts` (`MONGO_URL`). `MONGO_DSN` env var exists but is unused — change the constant to retarget.
- `tsconfig` runs loose: `strictNullChecks: false`, `noImplicitAny: false`.
- New feature modules MUST be registered in `app/src/app/modules/mod.module.ts` to load.
- Two bcrypt libs are installed (`bcrypt` + `bcryptjs`); password hashing goes through `core/utils/hash.manager.ts` — match the surrounding file.

### Frontend internals worth knowing (full detail in [`web-next/CLAUDE.md`](web-next/CLAUDE.md))

- TypeScript strict + `noUncheckedIndexedAccess` — indexed access yields `T | undefined`.
- Tailwind v4 is **CSS-first**: no `tailwind.config.ts`; theme tokens in `app/globals.css` (Twenty-inspired, mirrored in `lib/theme/twenty-tokens.ts`).
- IDs from the legacy are Mongo `ObjectId` (24-hex, regex `/^[0-9a-f]{24}$/`) — not UUIDs.
- Validate legacy responses with `zod` in the BFF: the legacy mixes `_id`/`id` and has inconsistent shapes.
- Power BI client is browser-only — wrap in `'use client'`, use `next/dynamic({ ssr: false })` if needed.
- The legacy preserves **typos in its routes** (`POST /reports/syncronize`, `PATCH /filters/upadate/:id`, `inclued`). Keep them — don't "fix" them in BFF paths.
- BFF proxy must forward `searchParams` (the sibling `new-bi/apps/web` historically dropped them — known bug). Strip `Set-Cookie` from upstream before returning to avoid leaking legacy cookies. Forward `req.signal` to upstream `fetch` in SSE handlers so legacy doesn't accumulate orphan subscribers.

## Cookies, ports, coexistence

`legacy/web-next` and `new-bi/apps/web` are designed to coexist on the same dev host. They use **different cookie names** to avoid collision:

| App | Port | Auth cookie(s) |
|-----|------|----------------|
| `legacy/app` (NestJS) | `:3000` (host) / `:5524`→`:3000` (docker) | — (JWT in `Authorization` header) |
| `legacy/web-next` | `:3002` | `bi_token` |
| `new-bi/apps/web` | `:3001` | `bi_access`, `bi_refresh` |

## Conventions

- **Backend** uses **absolute imports** (`src/app/...`, enabled by `baseUrl: "./"`) mixed with relative — match the surrounding file. Brazilian Portuguese in identifiers and Swagger.
- **Frontend** uses `@/*` alias (see `web-next/tsconfig.json`). One catch-all `[[...path]]/route.ts` per legacy module under `app/api/`, delegating to `lib/api/proxy.ts`. SSE and multipart have dedicated handlers.
- **Tests** live only in `app/` (Jest); `web-next/` has no test suite.

## Gotchas

- Do not run `pnpm` from `legacy/web-next/` without `--ignore-workspace` — the parent `new-bi` workspace will capture it.
- Do not run `pnpm` or `turbo` from `legacy/` root — there is no manifest there; this directory is just a container for two independent projects.
- The parent `new-bi/CLAUDE.md` declares `legacy/` as "do not edit or build" — that statement is **out of date** for `web-next/`, which is the active new frontend for the still-running NestJS backend. Treat the per-app CLAUDE.md inside `app/` and `web-next/` as the source of truth.
- Swagger at `http://localhost:3000/api` is the **only reliable contract** between the two apps. Verify shapes there before assuming.

## Resources

- Backend deep-dive: [`app/CLAUDE.md`](app/CLAUDE.md)
- Frontend deep-dive: [`web-next/CLAUDE.md`](web-next/CLAUDE.md)
- Frontend project skill: [`web-next/.claude/skills/legacy-web-next/SKILL.md`](web-next/.claude/skills/legacy-web-next/SKILL.md)
