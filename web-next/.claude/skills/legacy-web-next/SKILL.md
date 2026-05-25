---
name: legacy-web-next
description: >
  Contexto del frontend Next.js 16 que consume el backend legacy NestJS (../app/).
  Trigger: cuando trabajes en archivos bajo /Users/editor2/project/2026/new-bi/legacy/web-next/,
  o cuando el usuario mencione el frontend legacy, los BFF route handlers que proxean
  al NestJS legacy, la cookie bi_token, el embed de Power BI, el preset radix-nova de
  shadcn, o la estética Twenty.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Antes que nada

La fuente de verdad es [CLAUDE.md](../../../CLAUDE.md). Este skill **no la duplica** — solo agarra las trampas que se olvidan al estar tipeando código. Si dudás de algo estructural (puertos, stack, mapa de endpoints), volvé al CLAUDE.md.

## Reglas que se olvidan al codear

1. **Nunca `fetch` directo al backend desde un componente.** Todo pasa por `app/api/**/route.ts`. El JWT vive en cookie `httpOnly` `bi_token`, el browser no lo ve.

2. **Cookie es `bi_token`. No `bi_access` ni `bi_refresh`** — esos son de `apps/web` (otro proyecto, otro stack). Confundirlos rompe ambas apps en dev.

3. **No hay refresh.** El legacy no expone endpoint. 401 → redirect a `/login` con toast. Banner T-5min decodificando `JWT.exp` client-side.

4. **Forward `searchParams` en el proxy.** Bug histórico de `apps/web` que NO se repite. El legacy usa `?page=&limit=`.

5. **Strippear `Set-Cookie` del upstream** antes de devolverle al cliente. No leakear cookies del backend.

6. **SSE → JWT por query, no header.** `EventSource` no acepta headers. El handler Next lee `bi_token` del cookie y lo inyecta como `?token=`. Y **forwardear `req.signal`** — sin eso el legacy acumula subscribers fantasma.

7. **Multipart = passthrough.** Pasar `req.body` con `duplex: 'half'` y preservar `Content-Type` boundary. **Nunca** parsear `FormData` en el handler.

8. **Power BI es browser-only.** `'use client'` + `next/dynamic({ ssr: false })`. Si SSR sigue rompiendo: `serverExternalPackages: ['powerbi-client']` en `next.config.ts`.

9. **Validar TODA respuesta del legacy con Zod en el BFF.** Mongo `_id` → `id`, shapes inconsistentes (`{message}` vs `{error}` vs string). Normalizar UNA vez en la frontera; el cliente recibe shapes limpios.

10. **IDs son ObjectId, no UUID.** Regex de validación: `/^[0-9a-f]{24}$/`.

11. **Imports**: `@/*` only. **Nunca** `@new-bi/*` — esta app está afuera del Turborepo, esos paquetes no existen acá.

12. **Typos del backend a preservar**: `syncronize`, `upadate`, `inclued`. Son estables y Swagger los refleja. No los "corrijas".

## Cuando agregás una feature nueva

Checklist mental por feature:

- [ ] ¿El módulo del legacy existe? Mirá la tabla del [CLAUDE.md](../../../CLAUDE.md#mapa-de-endpoints-del-backend). Si no estás seguro del shape, abrí Swagger en `http://localhost:3000/api`.
- [ ] BFF handler en `app/api/<modulo>/.../route.ts` que delega en `lib/api/proxy.ts`.
- [ ] Wrapper tipado en `lib/api/<modulo>.ts` con schemas Zod (server-only).
- [ ] Hook React Query en `lib/queries/<modulo>.ts` consumiendo el wrapper (client-side).
- [ ] Componentes shadcn en `components/ui/` agregados con `pnpm dlx shadcn@latest add <componente>` — preset `radix-nova`.
- [ ] `pnpm typecheck` antes de cerrar el cambio. **No buildees.**

## Instalación de deps

```bash
pnpm install --ignore-workspace
```

Sin el `--ignore-workspace`, el `pnpm-workspace.yaml` del root de `new-bi` captura esta app. El `.npmrc` local lo declara, pero pnpm 10 no siempre lo honra sin el flag CLI.

## Comandos día a día

```bash
pnpm dev          # next dev -p 3002
pnpm typecheck    # tsc --noEmit  ← preferí esto al build
pnpm lint
```

## Recursos

- [CLAUDE.md](../../../CLAUDE.md) — guía completa del proyecto.
- [AGENTS.md](../../../AGENTS.md) — recordatorio de que Next 16 ≠ tu training data.
- Backend: `../../../../app/CLAUDE.md` + Swagger en `:3000/api`.
- Plan de fases: `~/.claude/plans/quiero-hacer-el-front-wobbly-flurry.md`.
- Memoria engram: topic `architecture/legacy-web-next-frontend`.
