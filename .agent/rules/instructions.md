---
trigger: always_on
---

# Onboarding Instructions

These instructions help an automated coding agent work efficiently in this repository. Trust these steps first; only
search the codebase when something here is missing or proves inaccurate.

---

## 1. Repository Summary

- Frontend React 19 + Vite + TanStack Router / React Query / (React Start SSR plugin) + Tailwind CSS v4 + Shadcn UI
  patterns.
- TypeScript (strict) with path alias `@/*` → `src/*`.
- Code generation:
    - `routeTree.gen.ts` (TanStack Router) generated automatically by dev/build.
    - OpenAPI client & React Query hooks generated into `src/client/**` via `pnpm openapi-ts`.
- Linting/formatting via Biome.
- Unit tests: Vitest + @testing-library/react (jsdom).
- E2E tests: Playwright (in `e2e/`).
- Quality: SonarCloud (see `sonar-project.properties`).
- Auth using AWS Amplify

---

## 2. Toolchain & Conventions

- Use PNPM exclusively (no npm/yarn). Always run `pnpm install` after dependency changes.
- Recommended Node: >= 20 (for React 19 + modern ESM). If issues occur, prefer LTS 20.x.
- ESM project (`"type": "module"`). Avoid CommonJS `require` unless dynamically imported.
- Do not manually edit generated files: `src/routeTree.gen.ts`, everything under `src/client/`.
- Git hooks: Husky + lint-staged run Biome check autofixes on staged `*.{js,ts,jsx,tsx}`.
- `.editorconfig` defines consistent indentation & line endings; follow it.

---

## 3. Scripts (from package.json)

| Purpose               | Command            | Notes                                                                                   |
|-----------------------|--------------------|-----------------------------------------------------------------------------------------|
| Install deps          | `pnpm install`     | Always first step.                                                                      |
| Dev server            | `pnpm dev`         | Generates `routeTree.gen.ts` if missing. Port 3000.                                     |
| Build                 | `pnpm build`       | Produces production output (`.output/` via react-start). Also (re)generates route tree. |
| Preview               | `pnpm serve`       | Serves built app. Requires prior `pnpm build`.                                          |
| Unit tests            | `pnpm test`        | Non-watch run (CI friendly).                                                            |
| E2E tests             | `pnpm test:e2e`    | Auto-starts dev server via Playwright config. Browsers must be installed.               |
| E2E UI mode           | `pnpm test:e2e:ui` | Local debugging.                                                                        |
| Lint                  | `pnpm lint`        | Biome lint only.                                                                        |
| Format check          | `pnpm format`      | Non-writing format (use `format:fix` to write).                                         |
| Full check (lint+fmt) | `pnpm check`       | Biome aggregated check.                                                                 |
| OpenAPI generate      | `pnpm openapi-ts`  | Reads `openapi.yaml`, writes `src/client/**`. Commit results.                           |
| Prepare (husky)       | `pnpm prepare`     | Auto run on install (Git hooks).                                                        |

Additional implicit commands:

- Type checking: use `pnpm exec tsc --noEmit` (there is no dedicated script). Ensure route tree exists (run `pnpm dev`
  or `pnpm build` beforehand if first run).

---

## 4. Typical Local Workflow

1. `pnpm install`
2. (If openapi spec changed) `pnpm openapi-ts`
3. Generate router artifacts (only if missing): `pnpm dev` (terminate after first successful compile if you just need
   artifacts) OR rely on build.
4. `pnpm exec tsc --noEmit` (optional explicit type check)
5. `pnpm lint` / `pnpm check`
6. `pnpm test` (produces coverage, requires route tree)
7. `pnpm build`
8. `pnpm serve` (optional preview)

Fast iteration: keep `pnpm dev` running; Vitest can be run in watch mode by adding `--watch` if needed (not default
script).

Clean rebuild (if cache corruption):

```
rm -rf node_modules pnpm-lock.yaml .turbo .vite && pnpm store prune || true
pnpm install
pnpm dev
```

(Adjust `rm` to Windows `rmdir /s /q` if needed.)

---

## 5. CI / Validation Guidance

Recommended job ordering for PRs to `main` or `develop` (parallel where safe):

- Setup (cache PNPM store via lockfile). Always run `pnpm install --frozen-lockfile`.
- Generate (if API spec changed): `pnpm openapi-ts` (can be skipped if no diff in `openapi.yaml`).
- Build (produces route tree) can run in parallel with lint & unit tests IF you first generate route tree by invoking a
  lightweight `pnpm dev` warm-up or just run `pnpm build` once; simplest: let build depend only on install.
- Lint / Type Check / Unit tests in parallel after install (they require routeTree; if missing, pre-run
  `pnpm dev -- --clearScreen false` headless or share build's artifact). Alternative: add a tiny pre-step:
  `node -e "require('fs').existsSync('src/routeTree.gen.ts')||process.exit(1)"` and if missing run
  `pnpm dev & sleep 5 && pkill -f vite`.
- E2E tests can be separate / optional (slower) executed after successful build.
- SonarCloud scan: after unit tests & coverage (`pnpm test` must produce `coverage/lcov.info`). Allow failure without
  failing pipeline if desired (wrap sonar in `|| true`).

Quality Gate Non-blocking pattern:

```
sonar-scanner || echo "Sonar scan failed (non-blocking)"
```

If you see error "Expected URL scheme" verify `sonar.host.url=https://sonarcloud.io` and that environment
variables/token are set.

---

## 6. Testing Details

- Unit test config: `vitest.config.ts` (jsdom, globals enabled, setup file `src/test/setup.ts`).
- Place test files as `*.test.ts(x)` or `*.spec.ts(x)` alongside source OR under `src/**/__tests__/`.
- Coverage excludes generated files & UI library primitives.
- Avoid implementation-detail assertions; prefer DOM queries via Testing Library.
- For React Query tests, wrap components with a QueryClientProvider (you can define a helper in `src/test/utils.tsx`).
- E2E tests located in `e2e/` use Playwright; they start dev server automatically (command `pnpm dev`). Ensure port 3000
  free.

---

## 7. OpenAPI & Generated Code

- Source spec: `openapi.yaml` (root). Run `pnpm openapi-ts` after changes.
- Output: `src/client/` (TS types + React Query hook generators). Commit generated output to avoid CI divergence.
- Do not edit generated files; extend behavior via wrapper functions placed elsewhere (e.g., `src/lib/api/`).

---

## 8. Linting & Formatting

- Biome config: `biome.json` (ignores generated router tree & client code for certain operations).
- Use `pnpm check` in CI (combines formatting + lint rules). For autofix locally: `pnpm format:fix`.

---

## 9. SonarCloud

- Config: `sonar-project.properties`.
- Requires env var `SONAR_TOKEN` (in CI). Minimal scan command:

```
sonar-scanner \
  -Dsonar.projectKey=blitzfilter_blitzfilter-frontend \
  -Dsonar.organization=blitzfilter \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.token=$SONAR_TOKEN || true
```

- Make sure coverage report exists (`coverage/lcov.info`). Run unit tests before scan.

---

## 10. Key Project Layout

```
/ (repo root)
  package.json            (scripts & deps)
  vite.config.ts          (Vite + TanStack Start + Tailwind plugin)
  vitest.config.ts        (Unit test config)
  playwright.config.ts    (E2E config)
  tsconfig.json           (TS settings, path alias)
  biome.json              (Lint/format rules)
  openapi.yaml            (API spec)
  openapi-ts.config.ts    (OpenAPI codegen config)
  sonar-project.properties
  .editorconfig           (editor defaults)
  .husky/                 (git hooks)
  .github/                (CI/workflow + this instructions file)
  components.json         (Shadcn component registry/config)
  src/
    env.ts                (runtime env typing via t3-env)
    router.tsx            (Router creation / route imports)
    routeTree.gen.ts      (GENERATED)
    components/           (UI & shared components)
    routes/               (File-based routes; `__root.tsx` root layout)
    client/               (GENERATED OpenAPI + React Query helpers)
    lib/                  (Utility functions)
    test/                 (Test utilities & setup)
    styles.css            (Tailwind entry)
```

Ephemeral/Generated runtime build artifacts: `.output/`, `.tanstack/`, `.nitro/` — do not hand-edit.

---

## 11. Architectural Notes

- Routing: TanStack Router file-based. Add new routes via new files under `src/routes/`. Root route defines layout &
  `<Outlet />` areas.
- Data fetching: Optionally via route loaders or React Query; prefer loaders for SSR-friendly prefetch; React Query for
  client cache patterns.
- Styling: Tailwind (classes in JSX) + optional Shadcn component patterns (components/ui). Keep utility composition
  consistent.
- Environment variables: defined & validated in `src/env.ts`; import via `import { env } from '@/env'`.

---

## 12. Common Pitfalls & Remedies

| Issue                          | Symptom                                | Fix                                                                         |
|--------------------------------|----------------------------------------|-----------------------------------------------------------------------------|
| Missing routeTree.gen.ts       | Type errors on import                  | Run `pnpm dev` or `pnpm build` once. Commit not required (generated).       |
| Type check before generation   | `Cannot find module './routeTree.gen'` | Ensure generation step (above).                                             |
| Sonar scan URL error           | "Expected URL scheme"                  | Confirm `sonar.host.url` includes https:// and working token.               |
| E2E timeout                    | Playwright webServer timeout           | Increase timeout in config or ensure build/route tree not blocking startup. |
| Path alias resolution in tests | Module not found '@/'                  | Ensure vitest config includes `viteTsConfigPaths` (already present).        |

---

## 13. Adding / Modifying Code

- Prefer co-located test file: `ComponentName.test.tsx` next to implementation.
- Export React components as named exports unless a default pattern already exists; maintain existing style.
- Avoid introducing new global dependencies; add to `dependencies` only if required at runtime, otherwise
  `devDependencies`.
- When changing OpenAPI types: update `openapi.yaml` then regenerate.

---

## 14. Validation Checklist Before Committing

1. `pnpm install`
2. `pnpm openapi-ts` (if spec changed)
3. `pnpm lint`
4. `pnpm test` (ensure all pass; update snapshots if you add them—none by default)
5. `pnpm build` (succeeds without errors)
6. (Optional) `pnpm test:e2e` if relevant UX changes
7. (CI) Sonar scan (non-blocking) after coverage produced

---

## 15. Agent Guidance

- Always use PNPM commands provided; do not switch package managers.
- Generate artifacts (route tree, OpenAPI) before relying on them.
- For type errors in generated code, re-run the generator rather than editing output.
- Limit scope: only modify files necessary for the task; avoid broad refactors unless explicitly requested.
- Trust these instructions; only perform additional repository search when a required detail is absent or conflicting.

---
(End of instructions)

