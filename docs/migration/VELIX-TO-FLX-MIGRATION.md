# Velix to FLX v1.0.0 Migration Inventory & Specification

> **Official Release:** FLX v1.0.0  
> **Publisher:** Florynx Labs  
> **Identity:** FLX — The Full-Stack React Framework  
> **Tagline:** Build without limits.  
> **Date:** November 2026  

---

## 1. Executive Summary

This document establishes the official migration blueprint from the legacy **Velix** (v5.3.7) framework to **FLX v1.0.0**, maintained and published by **Florynx Labs**.

The goal of this migration is a full rebrand, monorepo harmonization, developer experience enhancement, comprehensive documentation rebuild, and release preparation for npm and GitHub, while strictly preserving all existing framework architectures, rendering algorithms, bundler mechanics, and runtime behaviors.

---

## 2. Package Architecture & Renaming Inventory

| Legacy Package Name | Target Package Name | Legacy Version | Target Version | Primary Scope & Responsibilities |
|---|---|---|---|---|
| `@teamvelix/velix` | `@florynx-labs/flx` | 5.3.7 | 1.0.0 | Main framework facade, runtime exports, server/client APIs, build entry points, and plugin exports |
| `@teamvelix/velix-core` | `@florynx-labs/flx-core` | 5.3.7 | 1.0.0 | Agnostic routing engine, AST/manifest generators, config parsers, logging, cache abstractions, error hierarchy, and HMR pubsub |
| `@teamvelix/velix-react` | `@florynx-labs/flx-react` | 5.3.7 | 1.0.0 | React 19 bindings, SSR rendering pipeline, Island components, client router, and hydration runtime |
| `@teamvelix/velix-pack` | `@florynx-labs/flx-pack` | 5.3.7 | 1.0.0 | High-performance incremental bundler, module graph, transform pipeline, CSS compilation, and HMR bridge |
| `@teamvelix/cli` | `@florynx-labs/flx-cli` | 5.3.7 | 1.0.0 | Developer CLI providing `flx dev`, `flx build`, `flx start`, `flx doctor`, `flx analyze`, and scaffolding |
| `@teamvelix/cache-redis` | `@florynx-labs/flx-cache-redis` | 5.3.7 | 1.0.0 | Distributed cache adapter implementing `ICacheAdapter` over Redis / ioredis with atomic lua scripts |
| `create-velix-app` | `@florynx-labs/create-flx-app` | 5.3.7 | 1.0.0 | One-command interactive project initialiser with starter templates and toolchain configuration |
| *(None - legacy component)* | `@florynx-labs/flx-router` | N/A | N/A | **Omitted intentionally**: The router is not an isolated package in this monorepo; it resides in `@florynx-labs/flx-core` (`src/router`) and `@florynx-labs/flx`. In accordance with non-negotiable rule #4, no mock package is generated. |

---

## 3. Monorepo Directory Mapping

To ensure structural consistency and eliminate legacy naming friction, monorepo package directories are mapped as follows:

```
packages/
├── flx/                  (formerly packages/velix)
├── flx-core/             (formerly packages/velix-core)
├── flx-react/            (formerly packages/velix-react)
├── flx-pack/             (formerly packages/velix-pack)
├── flx-cli/              (formerly packages/velix-cli)
├── flx-cache-redis/      (formerly packages/cache-redis)
└── create-flx-app/       (formerly packages/create-velix-app)
```

Templates and applications:
```
templates/
└── my-saas/              (Updated to consume @florynx-labs/flx & @florynx-labs/flx-cli)
website/                  (Updated to consume @florynx-labs/* workspace packages)
```

---

## 4. Internal Dependency Graph

The revised dependency structure within the pnpm workspace:

```
@florynx-labs/create-flx-app
  └── standalone scaffolding generator (picocolors, prompts)

@florynx-labs/flx-cache-redis
  └── peer: ioredis >= 5.0.0

@florynx-labs/flx-core
  └── dependencies: chokidar, glob, ioredis, lru-cache, picocolors, ws, zod

@florynx-labs/flx-react
  ├── dependencies: @florynx-labs/flx-core (workspace:*)
  └── peer: react >= 19.0.1, react-dom >= 19.0.1

@florynx-labs/flx-pack
  ├── dependencies: @florynx-labs/flx-core (workspace:*)
  └── dependencies: chokidar, esbuild, picocolors, postcss, postcss-load-config

@florynx-labs/flx
  ├── dependencies: @florynx-labs/flx-core (workspace:*)
  ├── dependencies: @florynx-labs/flx-react (workspace:*)
  ├── dependencies: chokidar, esbuild, lru-cache, picocolors, zod
  └── peer: react >= 19.0.1, react-dom >= 19.0.1

@florynx-labs/flx-cli
  ├── dependencies: @florynx-labs/flx-core (workspace:*)
  ├── dependencies: @florynx-labs/flx (workspace:*)
  └── dependencies: ora, picocolors, prompts
```

---

## 5. CLI & Developer Experience Changes

### 5.1 Binary Commands
- Primary executable: `flx` (packaged in `@florynx-labs/flx-cli`).
- Legacy executable alias: `velix` preserved as a symlink/fallback bin entry point for non-breaking user workflow transitions.
- Application starter executable: `create-flx-app` (packaged in `@florynx-labs/create-flx-app`).
- Recommended creation command:
  ```bash
  npm create flx-app@latest my-app
  # or
  pnpm create flx-app my-app
  # or
  bun create flx-app my-app
  ```

### 5.2 Command Signatures
| Command | Action |
|---|---|
| `flx dev` | Starts local development server with HMR, file watcher, and route compiler |
| `flx build` | Performs production build using FLX Pack with server/client tree-shaking |
| `flx start` | Runs the production-optimized server |
| `flx doctor` | Performs diagnostic health checks on project files, configuration, and environment |
| `flx analyze` | Evaluates bundle chunks, initial JS size, async JS size, and asset distribution |
| `flx generate <type> <name>` | Scaffolds pages, layouts, server actions, or api endpoints |
| `flx pack` | Direct access to the FLX Pack incremental compilation engine |
| `flx ui` | Launches terminal interactive interface |

### 5.3 Configuration Files
- Primary config file: `flx.config.ts` (or `flx.config.js`).
- Backward compatibility: If `flx.config.ts` is absent, the loader looks for `velix.config.ts` / `velix.config.js` and issues a gentle migration suggestion without failing.
- Internal build output directory: `.flx/` (with fallback and cleanup support for `.velix/`).

---

## 6. Backward Compatibility & Public API Preservations

To ensure zero breaking runtime regressions for developers migrating from earlier preview releases:

1. **Type Aliases & Re-exports**:
   - `FlxConfig` is introduced alongside `VelixConfig` (`export type FlxConfig = VelixConfig`).
   - `FlxServer` is introduced alongside `VelixServer` (`export type FlxServer = VelixServer`).
   - `FlxPlugin` is introduced alongside `VelixPlugin` (`export type FlxPlugin = VelixPlugin`).
   - `FlxHttpError` is introduced alongside `VelixHttpError` (`export class FlxHttpError extends VelixHttpError`).
   - `FlxPack` is introduced alongside `VelixPack` (`export class FlxPack extends VelixPack`).
   - `FlxErrorBoundary` is introduced alongside `VelixErrorBoundary`.

2. **Actions & Routing APIs**:
   - `serverAction`, `registerAction`, `executeAction`, `formAction`, `useActionState`, `useOptimistic`, `useFormStatus` preserve identical signatures.
   - Dynamic parameters, catch-all routes (`[...slug]`), and optional catch-alls behave identically.

3. **Rendering & Islands**:
   - Partial hydration strategies (`load="load"`, `load="idle"`, `load="visible"`, `load="media"`) maintain exact DOM contract.

---

## 7. Known Compatibility Fixes Applied During Migration

1. **Windows Path Normalization in `flx-pack` tests**:
   - `Bundler > creates shared browser chunks for client entry points`: Normalized path separators so `file.replace(/\\/g, '/').startsWith('chunks/')` passes cross-platform.
2. **Double-Backslash Regex in `flx/build/index.ts`**:
   - `collectRouteClientAssets` used `replace(/\\.(?:m?js|cjs)$/i, '')` which failed to strip file extensions because `\\.` matched literal backslashes rather than dots. Corrected to `replace(/\.(?:m?js|cjs)$/i, '')`.
3. **Asset Reachability in Production Integration Test**:
   - Resolving the above regex issue ensures `production-build.integration.test.ts` correctly detects route client chunks (`route.clientChunks`).

---

## 8. Documentation Migration Scope

All previous documentation under `docs/` is rewritten and structured into the official FLX documentation system:

- `docs/introduction/`: What is FLX, Core Philosophy, Architecture, Comparison, Quickstart.
- `docs/getting-started/`: Installation, Project Structure, First Route, First Server Action.
- `docs/core-concepts/`: File Routing, Rendering Architecture, Server Actions, Loaders, Caching.
- `docs/rendering/`: SSR, SSG, ISR, Islands Architecture, Client Transitions.
- `docs/flx-pack/`: Incremental Build Engine, Module Graph, Boundary Check, CSS Transform.
- `docs/caching/`: Cache Architecture, Memory Adapter, Redis Adapter, Invalidation.
- `docs/cli/`: Complete Command Reference.
- `docs/api/`: Public API Reference for all exports.
- `docs/guides/`: Authentication, Database, Forms, SEO, Deployment.
- `docs/migration/velix-to-flx.md`: Developer migration guide.

---

## 9. Conclusion

This migration plan guarantees a 100% stable, fully tested, elegantly branded framework ready for its v1.0.0 launch under Florynx Labs.

