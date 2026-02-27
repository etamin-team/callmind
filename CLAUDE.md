        # CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a monorepo using Bun and Turbo. Work from the root directory.

```bash
# Run development server (web app on :3000)
bun dev

# Run build for all apps
bun run build

# Lint all apps
bun run lint

# Format all code
bun run format
```

For web app specific commands:
```bash
cd apps/web
bun dev          # Start dev server on port 3000
bun build        # Production build
bun test         # Run tests
bun check        # Biome lint + format check
```

## Adding shadcn Components

Use the latest shadcn CLI (not pnpm, use bun):
```bash
bun dlx shadcn@latest add <component-name>
```

Components are added to `apps/web/src/components/ui/`.

## Architecture

### Tech Stack
- **Framework**: TanStack Start (React SSR with file-based routing)
- **Router**: TanStack Router with file-based routes in `apps/web/src/routes/`
- **State**: TanStack Query + TanStack Store
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Auth**: better-auth
- **Linting/Formatting**: Biome (not Prettier or ESLint)

### Monorepo Structure
- `apps/web` - Main web application
- `apps/api` - API backend (Nitro)
- `packages/*` - Shared packages

### Routing
Routes are file-based in `apps/web/src/routes/`. The router is auto-generated (`routeTree.gen.ts`).

- `__root.tsx` - Root layout with providers (Theme, TanStack Query, Devtools)
- `index.tsx` - Landing page (`/`)
- Create new routes by adding files like `pricing.tsx` for `/pricing`

### Styling System
- Global CSS variables defined in `apps/web/src/styles.css`
- Use CSS variables, not hardcoded colors: `bg-background`, `text-foreground`, `border-border`, `bg-muted`, `text-muted-foreground`
- Theme switching via `.dark` class on HTML element
- Components in `apps/web/src/features/marketing/` should use these variables

### Key Integrations
- `src/integrations/tanstack-query/root-provider.tsx` - Query client provider
- `src/integrations/better-auth/` - Authentication
- `src/components/theme-provider.tsx` - Dark/light theme context

### Import Aliases
`#/*` maps to `apps/web/src/*` - use this for internal imports.

### Biome Configuration
- Uses tabs for indentation
- Double quotes for JavaScript
- Organizes imports on save
- Ignores `routeTree.gen.ts` and `styles.css`
