# legacy/web-next

Frontend Next.js 16 (App Router) para el **backend legacy NestJS** ([`legacy/app/`](../app/)). Estética inspirada en [Twenty CRM](https://github.com/twentyhq/twenty), implementada con Tailwind v4 + shadcn.

> **App independiente.** No es parte del Turborepo de `new-bi`. Tiene su propio `node_modules`, su propio `pnpm-lock.yaml`, su propio deploy. No depende de `@new-bi/*`.

## Stack

| Capa | Tech |
|---|---|
| Framework | Next.js 16 App Router |
| React | 19 |
| TypeScript | strict + `noUncheckedIndexedAccess` |
| Estilos | Tailwind v4 (CSS-first, sin `tailwind.config.ts`) |
| Componentes | shadcn (preset Nova, Radix base) en `components/ui/` |
| Fuentes | Inter + IBM Plex Mono |
| Datos | TanStack Query + TanStack Table |
| Toasts | sonner |
| Iconos | lucide-react |
| Power BI | powerbi-client |
| Validación | zod |

## Quickstart

```bash
# Una vez, desde el root del repo new-bi
cd legacy/web-next
pnpm install --ignore-workspace          # OBLIGATORIO: --ignore-workspace
cp .env.example .env.local                # ajustar API_URL si hace falta

# Día a día
pnpm dev          # next dev en http://localhost:3002
pnpm typecheck    # tsc --noEmit
pnpm lint
pnpm build
```

> **Por qué `--ignore-workspace`**: este proyecto vive dentro de `new-bi/legacy/` que está bajo un `pnpm-workspace.yaml` (en el root de `new-bi`). Aunque `legacy/web-next/` NO está en los globs del workspace, pnpm walkea hacia arriba y trata todo como workspace si no le decimos lo contrario. La flag fuerza a pnpm a tratar este directorio como un proyecto standalone.

## Arquitectura (resumen)

- **Backend**: el NestJS 9 legacy en `../app/`, MongoDB, JWT por header `Authorization: Bearer`. Corre en `:3000` (sin Docker) o `:5524` (Docker, mapea a `:3000`).
- **Auth**: cookie httpOnly `bi_token` con TTL derivado del `exp` del JWT. Sin refresh (el backend no expone uno). 401 → redirect a `/login`.
- **BFF**: route handlers en `app/api/**/route.ts` proxean al legacy adjuntando el bearer del cookie. La URL del legacy NUNCA se filtra al cliente.
- **SSE**: `/api/notifications/stream` lee el cookie, le inyecta el JWT como query param al legacy (`?token=`) y stremea de vuelta al browser.
- **Multipart**: `/api/maps/upload` pasa el body con `duplex: 'half'` preservando el boundary.
- **Estilado**: tokens de Twenty en `app/globals.css` (`:root` + `.dark`) consumidos por shadcn via CSS variables. Mirror TS en `lib/theme/twenty-tokens.ts`.

## Puertos

| App | Puerto |
|---|---|
| legacy/web-next (esto) | 3002 |
| new-bi/apps/web | 3001 |
| legacy/app (NestJS) | 3000 (sin docker) / 5524 (docker) |

## Plan completo

`~/.claude/plans/quiero-hacer-el-front-wobbly-flurry.md` o ver memoria engram: `architecture/legacy-web-next-frontend`.
