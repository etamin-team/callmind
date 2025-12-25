# Callmind - Agent Development Guide

This document provides guidance for AI agents working on the Callmind monorepo.

## Repository Structure

This is a **Turborepo** monorepo with:
- `apps/` - Application code
  - `web` - TanStack Start frontend (port 3000)
  - `api` - Fastify backend API (port 3001)
- `packages/` - Shared code
  - `db` - Database models & connection (MongoDB/Mongoose)
  - `types` - Shared TypeScript types & Zod schemas
  - `ui` - Shared React components
  - `eslint-config` - ESLint configurations
  - `typescript-config` - TypeScript configurations

## Key Technologies

- **Package Manager**: pnpm
- **Monorepo Tool**: Turborepo
- **Frontend**: TanStack Start (React Router + Vite + SSR)
- **Backend**: Fastify with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **ORM/ODM**: Mongoose
- **Validation**: Zod
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui

## Development Commands

Always use pnpm from the root:

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # All apps
pnpm dev:web          # Frontend only
pnpm dev:api          # Backend only

# Code quality
pnpm lint             # Lint all
pnpm lint:fix         # Lint and fix
pnpm format           # Format code
pnpm check-types      # Type check all

# Build
pnpm build            # Build all

# Database
docker compose up -d  # Start MongoDB
```

## Adding New Code

### New API Routes
1. Create file in `apps/api/src/routes/`
2. Use Fastify plugin pattern with TypeScript
3. Export default plugin function
4. Auto-loaded with `/api` prefix

### New Database Models
1. Add Zod schema to `packages/types/src/`
2. Create Mongoose model in `packages/db/src/models/`
3. Export from index files
4. Use in backend routes

### New Shared Components
1. Place in `packages/ui/src/`
2. Export from `packages/ui/src/index.ts`
3. Import in apps using `@repo/ui`

### New Types
1. Add to `packages/types/src/`
2. Export from `packages/types/src/index.ts`
3. Import in both frontend and backend

## Environment Variables

- Root `.env` - MongoDB connection, JWT secret, CORS
- `apps/api/.env` - API-specific variables
- `apps/web/.env` - Frontend-specific variables (prefixed with VITE_)

## Important Patterns

### TypeScript Configs
- Node.js apps use `extends: "@repo/typescript-config/node.json"`
- React apps use `extends: "@repo/typescript-config/react.json"`
- Library packages use `extends: "@repo/typescript-config/base.json"`

### ESLint Configs
- Node.js: `import { nodeConfig } from '@repo/eslint-config/node.js'`
- React: `import { reactConfig } from '@repo/eslint-config/react.js'`
- Base: `import { config as baseConfig } from '@repo/eslint-config/base.js'`

### Imports
- Use path aliases: `@/...` for app-specific imports
- Use workspace packages: `@repo/...` for shared code

### API Development
- Fastify plugins are auto-loaded from `apps/api/src/routes/`
- Swagger docs auto-generated at `/api/docs`
- Always use async/await with proper error handling
- Request/response validation with Zod

### Database
- MongoDB runs in Docker container
- Connection handled by `@repo/db`
- Models follow Mongoose schema pattern
- Timestamps: `createdAt`, `updatedAt` auto-managed

## Testing

Run tests with filtering:

```bash
pnpm test --filter=web          # Test frontend only
pnpm test --filter=api          # Test backend only
```

## Build Artifacts

- `apps/api/dist` - Compiled backend
- `apps/web/dist` - Built frontend (for production)
- `packages/*/dist` - Compiled shared packages

## Debugging

### Type Errors
1. Run `pnpm check-types` to identify issues
2. Check TypeScript config extends correct base
3. Ensure workspace dependencies are installed

### Module Resolution
1. Verify package.json `exports` map
2. Check file extensions (use `.js` for ESM imports)
3. Ensure tsconfig `paths` are configured

### Database Issues
1. Check MongoDB is running: `docker compose ps`
2. Verify connection string in `.env`
3. Check model schema matches data

## Performance

- Use Turborepo remote caching for CI/CD
- Leverage pnpm workspace dependencies
- Build shared packages before apps
- Use `turbo run build --filter=...` for specific builds

## Security

- Never commit `.env` files (use `.env.example`)
- Use `fastify-helmet` for security headers
- Rate limiting enabled by default
- CORS restricted to configured origins
- JWT secrets should be long and random

## Common Tasks

### Add New Package
1. Create in `packages/`
2. Add to pnpm-workspace.yaml
3. Add package.json with workspace deps
4. Add scripts: lint, check-types, build
5. Update dependsOn in turbo.json if needed

### Add Dependency
```bash
# To specific app/package
pnpm add <package> --filter=<app-name>

# To root
pnpm add -D <package> -w
```

### Update Dependencies
```bash
pnpm update -r --latest
```
