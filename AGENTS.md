# AGENTS.md — SE-Website Coding Guidelines

This file provides instructions for agentic coding agents (AI assistants) working in this repository.

---

## Project Overview

A full-stack React app using:

- **TanStack Start** (full-stack framework) + **TanStack Router** (file-based, type-safe)
- **TanStack Query** (server state) + **TanStack Form** (form state)
- **Convex** (serverless backend / real-time DB)
- **React 19** with the React Compiler (auto-memoization via Babel plugin)
- **Tailwind CSS v4** (zero-config, `@tailwindcss/vite` plugin)
- **Biome** (linter + formatter — replaces ESLint and Prettier entirely)
- **Vitest** + **@testing-library/react** (test runner)

---

## Architecture Baseline (C4-Aligned)

This section captures the current high-level architecture so implementation choices stay
consistent across features.

### System Context

- **Primary users:** public visitors, PSSE SE students, alumni, officers, and faculty
- **Primary system:** `PSSE Website` (public site + admin console)
- **External integrations:** maps embeds, social embeds, auth provider, file storage/CDN, and app database
- **Current default stack:** TanStack Start + Convex (DB/functions) + Convex/Auth-compatible auth flow
- **Alternatives (if needed):** Supabase (Postgres/Auth/Storage) or Firebase (Auth/Firestore + UploadThing)

### Container View

- **Public Site container:** public pages, member-only views, reactions, RSVP, and content browsing
- **Admin Console container:** role-gated CRUD for events, posts, merch, partners, sponsors, approvals
- **Server Functions layer:** stable facade between UI and backend (`createServerFn`)
- **Backend services:** domain data, auth checks, and file storage operations
- **Rule:** UI never calls backend directly for protected operations; server functions are the source of truth

### Component / Layering Pattern

Use this architectural sequence for all features:

1. UI layer (routes, pages, components)
2. Query layer (`options.ts`, query keys/options, mutation options)
3. Server layer (`createServerFn`, Zod validation, role checks, audit)
4. Backend layer (Convex first; alternatives only when explicitly adopted)
5. Storage/CDN layer (images/files)

Canonical data flow:

- **Read path:** backend -> server function -> route `beforeLoad`/`loader` -> `ensureQueryData` -> `useSuspenseQuery`
- **Write path:** UI mutation -> server function validation/auth -> backend write -> query invalidation/refetch

### Core Domain Modules

- **Events:** listings, details, scheduling, publish/archive, attendance support
- **Merch:** catalog, variants, stock/preorder visibility, order status (no payments yet)
- **Partners & Sponsors:** directory entries, tiers, spotlight/featured content
- **Posts:** announcements/updates with publish state, tags, media
- **Reactions:** user reactions per post with anti-spam/rate-limit considerations
- **Approvals & Roles:** organization access policy and admin role assignment

### Authorization Model (Minimum)

- Roles: `owner`, `staff`
- Access checks are enforced in server functions (`requireUser`, `requireRole` pattern)
- Route guards can redirect early, but never replace server-side authorization
- Admin/editor access is restricted to approved Software Engineering students

---

## Recommended Project Structure

Prefer feature-based organization and keep server/query/schema code close to each feature.

```text
src/
  components/              # shared UI primitives and app-level layout/navigation
  integrations/            # query client, form setup, convex client, auth adapters
  lib/                     # utilities, constants, helpers
  routes/                  # TanStack file-based routes
    __root.tsx
    home.tsx
    events/
      index.tsx
      $eventId.tsx
    posts/
      index.tsx
      $postSlug.tsx
    merch/
      index.tsx
    partners/
      index.tsx
    sponsors/
      index.tsx
    admin/
      index.tsx
      events.tsx
      posts.tsx
      merch.tsx
      partners.tsx
      sponsors.tsx
      approvals.tsx
  features/
    events/
      components/
      hooks/
      options.ts
      schemas/
      server/
    posts/
      components/
      hooks/
      options.ts
      schemas/
      server/
    merch/
      components/
      hooks/
      options.ts
      schemas/
      server/
    partners/
      components/
      hooks/
      options.ts
      schemas/
      server/
    sponsors/
      components/
      hooks/
      options.ts
      schemas/
      server/
    reactions/
      hooks/
      options.ts
      schemas/
      server/
    auth/
      hooks/
      schemas/
      server/
    approvals/
      components/
      hooks/
      options.ts
      schemas/
      server/
  styles/                  # tokens/theme layers (optional but recommended)
  types/                   # shared app types when not colocated (optional)
  config/                  # env/config/feature flags (optional)

convex/
  schema.ts
  events.ts
  posts.ts
  merch.ts
  partners.ts
  sponsors.ts
  reactions.ts
  approvals.ts
  users.ts
  _generated/             # auto-generated, never edit manually
```

Structure conventions per feature:

- `options.ts`: query keys, query options, mutation options
- `hooks/`: thin wrappers around TanStack Query/TanStack Form usage or other custom hooks related to the feature
- `components/`: feature UI only
- `server/`: TanStack Start server functions (`createServerFn`)
- `schemas/`: Zod DTOs and validation schemas
- `types/`: feature-specific types (optional, prefer inline types where possible)

---

## Build / Lint / Test Commands

```bash
# Development server (port 3000)
bun run dev

# Production build
bun run build

# Preview production build
bun run preview

# Run all tests (vitest run — single pass, no watch)
bun run test

# Run a single test file
bunx vitest run src/path/to/file.test.tsx

# Run tests matching a name pattern
bunx vitest run -t "test name pattern"

# Lint (Biome linter only)
bun run lint

# Format (Biome formatter only)
bun run format

# Check lint + format together (preferred before committing)
bun run check

# Auto-fix lint + format issues
bunx biome check --write .
```

> **No ESLint. No Prettier.** Biome is the sole linter and formatter. Never install or configure ESLint/Prettier.

---

## Convex Backend Commands

```bash
# Start Convex dev server (syncs schema + functions, auto-generates types)
bunx convex dev

# Deploy Convex functions to production
bunx convex deploy
```

> **Never manually edit files in `convex/_generated/`** — they are auto-generated by `bunx convex dev`.  
> **Never manually edit `src/routeTree.gen.ts`** — auto-generated by TanStack Router's Vite plugin.

---

## Code Style

### Formatting (Biome)

- **Indentation: tabs** (not spaces)
- **Quotes: double quotes** in JS/TS strings and JSX attributes
- **Import organization:** Biome auto-sorts imports (`source.organizeImports` enabled); do not manually reorder
- Biome applies to all files in `src/**/*`, `vite.config.ts`, `.vscode/**/*`
- Excluded from Biome: `src/routeTree.gen.ts`, `src/styles.css`

### TypeScript

- **Strict mode** is enabled — `strict: true` in `tsconfig.json`
- `noUnusedLocals` and `noUnusedParameters` are enforced — delete dead code
- `verbatimModuleSyntax` is enabled — **use `import type` for all type-only imports**:
  ```ts
  import type { QueryClient } from "@tanstack/react-query";
  import type { ReactNode } from "react";
  import type { Id } from "../convex/_generated/dataModel";
  ```
- Prefer **inline prop types** over separate `type Props = {...}`:
  ```ts
  function MyComponent({ label }: { label: string; optional?: boolean }) { ... }
  ```
- Use **inline interfaces** for local context/config shapes:
  ```ts
  interface MyRouterContext {
    queryClient: QueryClient;
  }
  ```
- Avoid `any` — use `unknown` or proper generics. The one accepted exception is accessing
  `(import.meta as any).env` for Vite env vars.
- Use generic typed hooks where applicable: `useFieldContext<string>()`

### Imports & Path Aliases

Two path alias systems coexist — prefer the `#/` alias:

| Alias | Resolves To | Defined In                       |
| ----- | ----------- | -------------------------------- |
| `#/*` | `./src/*`   | `package.json` `"imports"` field |
| `@/*` | `./src/*`   | `tsconfig.json` `"paths"`        |

- **Prefer `#/` for cross-directory imports** within `src/`:
  ```ts
  import { useAppForm } from "#/hooks/demo.form";
  import Header from "#/components/Header";
  ```
- Use **relative imports** (`../`, `../../`) within closely related files (e.g., routes importing
  from adjacent `integrations/` or `convex/_generated/`)
- No barrel/index files — import from the direct file path
- External packages first, then internal — Biome enforces this automatically

---

## Naming Conventions

### Files

| Pattern               | Convention                                         | Examples                                  |
| --------------------- | -------------------------------------------------- | ----------------------------------------- |
| React components      | `PascalCase.tsx`                                   | `Header.tsx`                              |
| Route files           | folder-based naming with kebab-case files          | `form/simple.tsx`, `tanstack-query.tsx`   |
| Root route            | `__root.tsx`                                       | double-underscore TanStack convention     |
| Hooks                 | `camelCase.ts`                                     | `form.ts`, `formContext.ts`               |
| Integration providers | `camelCase.tsx`                                    | `provider.tsx`, `root-provider.tsx`       |
| Demo/example files    | place under feature folders with descriptive names | `demo/FormComponents.tsx`                 |
| Auto-generated        | excluded from linting                              | `routeTree.gen.ts`, `convex/_generated/*` |

### Functions & Variables

- **React components:** named function declarations in PascalCase — `function MyComponent()`
  (not arrow functions at the top level)
- **Event handlers:** `handle` + verb + noun — `handleAddTodo`, `handleToggleTodo`
- **Hooks:** `use` prefix — `useAppForm`, `useFieldContext`
- **Factory functions:** `get` + noun — `getRouter()`, `getContext()`
- **Convex functions:** `camelCase` named exports — `list`, `add`, `toggle`, `remove`
- **Environment constants:** `SCREAMING_SNAKE_CASE` — `CONVEX_URL`
- **Boolean state:** descriptive adjective — `isOpen`, `isLoading` (not `open`, `loading`)
- **Count variables:** `nounCount` — `completedCount`, `totalCount`
- **Route exports:** always named `Route` — `export const Route = createFileRoute('/')({...})`

---

## Component Patterns

- One primary component per file; unexported helpers are allowed in the same file
- Use **default exports** for layout/provider components, **named exports** for utilities/hooks
- Components are defined as **named function declarations below** the route/export:

  ```ts
  export const Route = createFileRoute('/')({ component: App })

  function App() {
    return <div>...</div>
  }
  ```

- Use **`useCallback`** for event handlers that call async Convex mutations, with proper deps arrays
- **No CSS Modules, no styled-components** — Tailwind v4 utility classes only
- Complex gradients or dynamic styles that cannot be expressed in Tailwind may use `style={{}}`
- Accessibility: add `aria-label` on icon-only buttons

---

## Routing (TanStack Router)

- File-based routing under `src/routes/`. Every route file must export `Route`:
  ```ts
  export const Route = createFileRoute("/my-path")({ component: MyPage });
  ```
- Use **folder naming for route separation**, not dot notation in filenames:
  - Prefer: `src/routes/form/simple.tsx`, `src/routes/form/address.tsx`
  - Avoid: `src/routes/form.simple.tsx`, `src/routes/form.address.tsx`
- Set `ssr: false` on routes that require client-only APIs (e.g., Convex):
  ```ts
  export const Route = createFileRoute("/demo/convex")({
    ssr: false,
    component: ConvexDemo,
  });
  ```
- Use `activeProps` from TanStack Router's `<Link>` for active nav link styling
- The router type is registered via `declare module '@tanstack/react-router'` in `src/router.tsx` —
  do not duplicate this declaration

---

## Convex Backend

- **Schema** defined in `convex/schema.ts` using `defineSchema` + `defineTable`
- Use `v` (from `convex/values`) for all argument validators:
  `v.string()`, `v.number()`, `v.boolean()`, `v.id('tableName')`, `v.optional(v.string())`,
  `v.union(...)`, `v.object({...})`, `v.array(...)`
- System fields `_id` and `_creationTime` are auto-added — do not include in schema
- Functions pattern:
  ```ts
  export const myFunction = query({
    args: { id: v.id("todos") },
    handler: async (ctx, args) => {
      const item = await ctx.db.get(args.id);
      if (!item) throw new Error("Item not found");
      return item;
    },
  });
  ```
- DB operations: `ctx.db.query()`, `ctx.db.get()`, `ctx.db.insert()`, `ctx.db.patch()`, `ctx.db.delete()`
- Throw `new Error(...)` for not-found or invalid-state cases in mutations
- Import generated types from `convex/_generated/api` and `convex/_generated/dataModel`

---

## State Management

- **Server/async state:** TanStack Query (`useQuery`, `useMutation`, `useQueryClient`)
- **Convex real-time data:** `useQuery` from `convex/react` or the `@convex-dev/react-query` bridge
- **Forms:** TanStack Form with Zod schema validation
  - Schema-level validation: `validators: { onBlur: zodSchema }`
  - Field-level: `onBlur: ({ value }) => value ? undefined : 'Required'`
  - Only show errors when field `isTouched`
- **Local UI state:** `useState` — keep as close to usage as possible
- **No Redux, no Zustand** — not in the stack

---

## Error Handling

- Form field validators return `string` (error message) or `undefined` (valid)
- Convex mutations: `throw new Error('Descriptive message')` for not-found / invalid state
- Missing env variables: `console.error(...)` with a descriptive message
- Loading states: Convex `useQuery` returns `undefined` while loading — always guard with `if (!data)`
  before rendering lists; show a spinner (`animate-spin`) or skeleton during load
- No global error boundaries are set up — consider adding one for production routes

---

## Testing

- **Runner:** Vitest (`npm run test`)
- **Utilities:** `@testing-library/react`, `@testing-library/dom`, `jsdom`
- Test files: `*.test.ts` or `*.test.tsx` co-located with source files (or in a `__tests__/` folder)
- Run a single test file: `npx vitest run src/path/to/component.test.tsx`
- Run by name: `npx vitest run -t "description of test"`
- No tests exist yet in the codebase — when adding tests, follow Testing Library best practices
  (query by role/label, avoid implementation details)

---

## Environment Variables

- Client-side env vars accessed from browser code must be prefixed with `VITE_`:
  ```ts
  const url = import.meta.env.VITE_CONVEX_URL;
  ```
- Server-only env vars must **not** use the `VITE_` prefix (keep secrets server-side):
  ```bash
  DATABASE_URL=...
  API_SECRET=...
  ```
- Never access server-only env vars from client code; only read them in server/runtime contexts
- Defined in `.env.local` (gitignored) — never commit secrets
- Cast `import.meta` as `any` when TS complains about env access: `(import.meta as any).env`
