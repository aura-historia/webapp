<p align="center">
  <a href="https://aura-historia.com">
    <img src="public/logo-banner.png" alt="Aura Historia — Where your antiques find you" width="600" />
  </a>
</p>

<h1 align="center">Aura Historia — Webapp</h1>

<p align="center">
  <strong>The refined global discovery platform for antiques, art, and design objects.</strong>
</p>

<p align="center">
  Search across dealers, auction houses, shops, and marketplaces in one considered experience.
</p>

<p align="center">
  <a href="https://aura-historia.com"><img src="https://img.shields.io/badge/aura--historia.com-Visit%20Website-8B4513?style=flat" alt="Website" /></a>
  &nbsp;
  <a href="https://docs.api.aura-historia.com/"><img src="https://img.shields.io/badge/OpenAPI-Docs-85EA2D?style=flat&logo=swagger&logoColor=white" alt="OpenAPI Docs" /></a>
  &nbsp;
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey?style=flat" alt="License: CC BY-NC-SA 4.0" /></a>
</p>

<p align="center">
  <a href="https://github.com/aura-historia/webapp/actions/workflows/ci.yml"><img src="https://github.com/aura-historia/webapp/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/aura-historia/webapp/actions/workflows/e2e.yml"><img src="https://github.com/aura-historia/webapp/actions/workflows/e2e.yml/badge.svg" alt="End-to-end tests" /></a>
</p>

<p align="center">
  <a href="https://sonarcloud.io/summary/new_code?id=aura-historia_webapp"><img src="https://sonarcloud.io/api/project_badges/measure?project=aura-historia_webapp&metric=alert_status" alt="SonarCloud Quality Gate" /></a>
  <a href="https://sonarcloud.io/summary/new_code?id=aura-historia_webapp"><img src="https://sonarcloud.io/api/project_badges/measure?project=aura-historia_webapp&metric=coverage" alt="SonarCloud Coverage" /></a>
  <a href="https://sonarcloud.io/summary/new_code?id=aura-historia_webapp"><img src="https://sonarcloud.io/api/project_badges/measure?project=aura-historia_webapp&metric=ncloc" alt="Lines of code" /></a>
</p>

---

## Overview

Aura Historia brings together antiques, art, and design objects from a global network of dealers, auction houses, shops, and marketplaces. It gives collectors and market professionals a single place to discover objects, compare sources, and follow opportunities across languages and currencies.

The webapp supports:

- Search and discovery for objects and shops, including recently added listings.
- Multilingual, localized browsing and SEO in German, English, Spanish, French, and Italian.
- Accounts with watchlists, saved searches, notifications, and matching.
- Partner tools for shop onboarding, product ingestion, access tokens, and OAuth integrations.
- Administrative workflows and privacy-aware account experiences.

## Technology

| Area | Tools |
| --- | --- |
| Application | React 19, TypeScript, Vite |
| Routing & data | TanStack Start, Router, Query, Table |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI |
| Identity | AWS Amplify and Amazon Cognito |
| Internationalization | i18next and react-i18next |
| Quality | Vitest, Playwright, Testing Library, Biome, SonarCloud |
| Deployment | Cloudflare Workers |

## Getting started

### Prerequisites

- Node.js 24
- pnpm 11.17.0 (the version pinned by this repository)

### Install and run

```sh
pnpm install
pnpm dev
```

The development server runs at [http://localhost:3000](http://localhost:3000).

### Environment

The application has sensible local defaults. To enable authenticated and API-backed flows, create a local `.env` file with the values provided for your environment:

```dotenv
VITE_API_URL=https://api.example.com
VITE_APP_URL=http://localhost:3000
VITE_USER_POOL_ID=your-cognito-user-pool-id
VITE_USER_POOL_CLIENT_ID=your-cognito-user-pool-client-id
```

Optional feature flags:

```dotenv
VITE_FEATURE_LOGIN_ENABLED=true
VITE_FEATURE_SEARCH_ENABLED=true
```

Do not commit credentials, tokens, or production configuration.

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Vite development server on port 3000. |
| `pnpm build` | Create a production build. |
| `pnpm preview` | Serve the production build locally. |
| `pnpm test` | Run the Vitest test suite. |
| `pnpm test:e2e` | Run Playwright end-to-end tests. |
| `pnpm lint` | Run Biome linting. |
| `pnpm check` | Run Biome’s full check. |
| `pnpm format:fix` | Format supported files with Biome. |
| `pnpm exec tsc --noEmit` | Type-check without emitting files. |
| `pnpm openapi-ts` | Regenerate the OpenAPI client and partner-products spec. |

Install Playwright browsers before running end-to-end tests locally:

```sh
pnpm exec playwright install
```

## Project structure

```text
src/
├── routes/       # TanStack file routes, loaders, heads, and API routes
├── features/     # Product feature slices
├── components/   # Shared and domain UI components
├── data/         # Internal domain types and API mappings
├── hooks/        # Shared and domain hooks
├── i18n/         # Language setup and locale dictionaries
├── lib/          # Shared libraries, server helpers, and validation
└── client/       # Generated OpenAPI client — do not edit by hand

docs/             # Product, design, privacy, architecture, and hydration guidance
public/           # Static assets and public specifications
```

## Development notes

- Use pnpm; do not use npm or Yarn for project commands.
- `src/client/**` and `src/routeTree.gen.ts` are generated. Change their source configuration, then regenerate them.
- User-facing changes require coverage for all supported locales: `de`, `en`, `es`, `fr`, and `it`.
- Follow the project guidance in [`AGENTS.md`](AGENTS.md) and the topic-specific documents in [`docs/`](docs/).

## Deployment

The application deploys to Cloudflare Workers after CI succeeds:

| Branch | Environment | URL |
| --- | --- | --- |
| `main` | Production | [aura-historia.com](https://aura-historia.com) |
| `develop` | Staging | [stage.aura-historia.com](https://stage.aura-historia.com) |

Manual deployments require `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`:

```sh
# Production
pnpm deploy:production

# Staging
pnpm deploy:staging
```

## Related projects

- [Aura Historia Backend](https://github.com/aura-historia/backend) — Serverless AWS APIs, event pipelines, and data services.
- [API documentation](https://docs.api.aura-historia.com/) — OpenAPI reference for Aura Historia integrations.

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](LICENSE) (CC BY-NC-SA 4.0).

---

<p align="center">
  <a href="https://aura-historia.com">aura-historia.com</a>
</p>
