# AGENTS.md

Guidance for coding agents working in `/Users/cxnner05/Documents/projects/SE-Website`.
Use this file as the canonical repo-specific instruction set.

## Rule Sources

- No `.cursor/rules/` directory exists.
- No `.cursorrules` file exists.
- No `.github/copilot-instructions.md` file exists.
- There are no extra Cursor/Copilot rules to merge; follow this file.

## Stack

- TanStack Start + TanStack Router
- React 19 + React Compiler
- TanStack Query
- TanStack Form
- Convex + `@convex-dev/react-query`
- Better Auth
- Tailwind CSS v4
- Biome
- Vitest + Testing Library

## Project Shape

```text
src/
  components/        shared UI primitives
  feature/           feature code (note: singular `feature`)
  integrations/      form/query/auth integration code
  lib/               shared helpers
  routes/            TanStack Router files
  router.tsx         router + Convex Query setup

convex/
  schema.ts          root schema composer
  schema/            per-table schema modules
  todos.ts           public facade, keeps api.todos.* stable
  posts.ts           public facade, keeps api.posts.* stable
  rbac.ts            public facade, keeps api.rbac.* stable
  modules/           domain function implementations
  platform/          auth, RLS, triggers
  _generated/        generated, never edit manually
```

## Commands

Use Bun consistently.

```bash
# dev server
bun run dev
# production build
bun run build
# preview production build
bun run preview
# all tests
bun run test
# single test file
bunx vitest run src/path/to/file.test.tsx
# single test by name
bunx vitest run -t "test name"
# tests in a folder
bunx vitest run src/feature/todos
# typecheck
bunx tsc --noEmit
# lint
bun run lint
# format
bun run format
# lint + format check
bun run check
# apply Biome fixes
bunx biome check --write .
# Convex dev / typegen
bunx convex dev
# one-off Convex codegen
bunx convex codegen
```

## Verification Expectations

- Run `bunx tsc --noEmit` before finishing non-trivial changes.
- Run `bun run check` when touching frontend/shared TS files if practical.
- Run `bunx convex codegen` after changing Convex schema, public facades, or function signatures.
- If you add tests, run the affected tests directly.

## Formatting

- Biome is the only formatter/linter. Do not add ESLint or Prettier.
- Tabs for indentation.
- Double quotes for strings.
- Let Biome organize imports.
- `src/routeTree.gen.ts` and `src/styles.css` are excluded from Biome.

## TypeScript

- `strict` mode is enabled.
- `verbatimModuleSyntax` is enabled: use `import type` for type-only imports.
- `noUnusedLocals` and `noUnusedParameters` are enabled.
- Avoid `any`; prefer `unknown` or explicit types.
- Prefer generated Convex types over handwritten duplicates.

## Validation Strategy

- Use Zod as the primary business/domain validation layer.
- Reuse Zod schemas for form validation, DTOs, server inputs, and other shared contracts.
- Prefer `z.infer<typeof Schema>` for DTO and input types.
- Keep Convex `v.*` as the persistence/schema layer for `defineTable(...)` and Convex-native IDs.
- Do not try to replace Convex table schemas with Zod; use a hybrid approach instead.
- If a shape is shared between frontend and backend, prefer defining it once in a domain validator module.
- If a schema is purely UI-specific, keep it near the feature in `src/feature/*`.
- If a schema is backend/domain-shared, keep it in `convex/modules/*/validators.ts`.

## Imports and Aliases

- Use `@/*` for `src/*` imports.
- Use `#convex/*` for `convex/*` imports.
- Do not introduce `#/*` imports for `src/*`.
- Prefer direct file imports over barrels.
  Example:

```ts
import type { Doc } from "#convex/_generated/dataModel";
import { api } from "#convex/_generated/api";
import { useAppForm } from "@/integrations/tanstack-form/form-hooks";
```

## Naming

- Components: `PascalCase.tsx`
- Hooks/utilities: `camelCase.ts`
- Route export: always `Route`
- Convex functions: named `camelCase` exports
- Event handlers: `handle*`
- Booleans: `is*`, `has*`, `can*`

## React / Frontend Conventions

- Prefer named function components over top-level arrow components.
- Keep route files thin; move reusable UI into `src/feature/`.
- Use Tailwind utilities; do not add CSS Modules or styled-components.
- Use TanStack Query for async state.
- Use TanStack Form through the existing `useAppForm` wrapper.
- `FieldWrapper` is internal only; do not register it as a field component.
- `CalendarField` values are `Date | null`.
- `ComboboxField` empty state is `null`, not `""`.

## Routing

- Routes live in `src/routes/`.
- Use folder-based routing, not dotted filenames.
- `src/routeTree.gen.ts` is generated; never edit it manually.
- `src/router.tsx` owns router creation and Convex Query client setup.

## Authorization

- Frontend route guards are UX only.
- Real authorization must happen in Convex backend code.
- App roles are `student`, `admin`, and `superadmin`.
- Frontend auth helpers live in `src/lib/authorization.ts`.
- Backend auth/RLS helpers live in `convex/platform/auth.ts` and `convex/platform/rls.ts`.
- Prefer `requireAuthenticated(...)` and `requireRole(...)` for backend enforcement.

## Convex Architecture

- Keep public API facades at the Convex root: `todos.ts`, `posts.ts`, `rbac.ts`.
- Put implementations in `convex/modules/*/functions.ts`.
- Put shared Zod business/input schemas in `convex/modules/*/validators.ts` when they are backend/domain-facing.
- Put shared backend infra in `convex/platform/*`.
- Put per-table schema in `convex/schema/*` and compose them in `convex/schema.ts`.
- Default RLS policy is deny-first; do not bypass it casually.
- Trigger/audit behavior is centralized in `convex/platform/triggers.ts`.

## Convex Data / Storage

- Use `v` validators for schema definitions and Convex-native persistence constraints.
- Prefer Zod-backed validators for shared function input contracts when the same shape is reused elsewhere.
- Do not include `_id` or `_creationTime` in schema definitions.
- Use ownership fields like `ownerAuthUserId` / `authorAuthUserId` for user-scoped records.
- For uploads, generate upload URLs in mutations and store `Id<"_storage">` on documents.
- If deleting a record with owned storage, handle storage cleanup too.

## Zod Conventions

- Schema names should be explicit: `CreatePostInputSchema`, `UpdateTodoInputSchema`, `RoleAssignmentSchema`.
- Keep persistence-only fields out of user-facing form schemas unless the UI truly edits them.
- Do not use raw Convex `Doc<...>` types as form models unless the document shape exactly matches the UI.
- Prefer a thin mapping layer between Zod DTOs and stored Convex documents when the shapes differ.
- Centralize reusable refinements/transforms in schema modules rather than duplicating ad hoc validation.

## Error Handling

- Throw `new Error("...")` for forbidden, invalid-state, and not-found cases.
- Use descriptive messages like `"Todo not found"`.
- Guard null results before patch/delete operations.
- Form validators should return a string or `undefined`.
- Do not silently swallow backend failures.

## Testing

- No tests currently exist under `src/`.
- When adding tests, prefer colocated `*.test.ts` / `*.test.tsx` files.
- Use Testing Library queries by role/label/text instead of implementation details.
- For a single file: `bunx vitest run <path>`.
- For a single test name: `bunx vitest run -t "name"`.

## Environment Variables

- Client-visible vars must use `VITE_`.
- Server-only secrets must not use `VITE_`.
- `VITE_CONVEX_URL` is required by the router setup.
- `VITE_CONVEX_SITE_URL` is required by the Better Auth React Start integration.
- `VITE_SITE_URL` is read by Convex Better Auth config and should match the app origin.
- `CONVEX_DEPLOYMENT` is required for Convex tooling/local setup.
- Never hardcode or commit secrets.

## Generated / Do Not Edit

- `convex/_generated/*`
- `src/routeTree.gen.ts`

## Practical Agent Rules

- Match existing code patterns before introducing new abstractions.
- Prefer small, surgical edits over broad rewrites.
- Do not rename public Convex facades unless explicitly asked.
- If Convex signatures change, regenerate codegen before finishing.
- If repo conventions drift, update code and this file together.
