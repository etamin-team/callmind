# Callmind - Fullstack Monorepo

A modern full-stack monorepo built with Turborepo, TanStack Start (frontend), Fastify (backend), MongoDB, and TypeScript.

## 🚀 Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Frontend**: TanStack Start (React Router + Vite + SSR)
- **Backend**: Fastify with TypeScript
- **Database**: MongoDB with Mongoose
- **Type Safety**: TypeScript with shared types
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui components
- **Package Manager**: pnpm

## 📁 Project Structure

```
├── apps/
│   ├── web/              # TanStack Start frontend app
│   └── api/              # Fastify backend API
├── packages/
│   ├── db/               # Shared database models & connection
│   ├── types/            # Shared TypeScript types & Zod schemas
│   ├── ui/               # Shared React components
│   ├── eslint-config/    # ESLint configurations
│   └── typescript-config/ # TypeScript configurations
├── docker-compose.yml    # MongoDB & Mongo Express
└── turbo.json            # Turborepo pipeline configuration
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose (for MongoDB)

### Installation

1. **Clone and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start MongoDB:**
   ```bash
   pnpm docker:up
   # MongoDB runs on localhost:27017
   # Mongo Express UI at http://localhost:8081
   ```

3. **Set up environment variables:**
   ```bash
   # Root .env
   cp .env.example .env
   
   # API .env (optional)
   cp apps/api/.env.example apps/api/.env
   
   # Frontend .env (for API URL)
   cp apps/web/.env.example apps/web/.env
   ```

4. **Run development servers:**
   ```bash
   # All apps
   pnpm dev
   
   # Frontend only
   pnpm dev:web
   
   # Backend only  
   pnpm dev:api
   ```

   The apps will be available at:
   - **Frontend**: http://localhost:3000
   - **API**: http://localhost:3001
   - **API Docs**: http://localhost:3001/docs

## 📦 Available Scripts

From the root directory:

- `pnpm dev` - Start all apps in development mode
- `pnpm dev:web` - Start only frontend
- `pnpm dev:api` - Start only backend
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all apps and packages
- `pnpm lint:fix` - Lint and fix all issues
- `pnpm format` - Format code with Prettier
- `pnpm check-types` - Type-check all projects
- `pnpm clean` - Remove all build artifacts and node_modules
- `pnpm docker:up` - Start MongoDB and Mongo Express
- `pnpm docker:down` - Stop MongoDB and Mongo Express

## 🔧 Configuration

### TypeScript

Shared TypeScript configs are in `packages/typescript-config/`:
- `base.json` - Base configuration
- `react.json` - React/TanStack Start apps
- `node.json` - Node.js/Fastify apps

### ESLint

Shared ESLint configs in `packages/eslint-config/`:
- `base.js` - Base rules
- `react.js` - React/TanStack Start apps
- `node.js` - Node.js/Fastify apps

## 🗄️ Database

MongoDB runs in Docker. The database package (`@repo/db`) provides:
- Shared Mongoose models
- Database connection utilities
- Type-safe models with TypeScript

### Adding New Models

1. Add Zod schema to `packages/types/src/`
2. Create Mongoose model in `packages/db/src/models/`
3. Export from respective index files
4. Use in both frontend and backend

## 🌍 API Development

The API app (`apps/api`) includes:
- **Fastify** with TypeScript
- **Auto-loading routes** from `src/routes/`
- **Swagger/OpenAPI** documentation at `/docs`
- **Rate limiting** and **Helmet** security
- **CORS** configured for frontend

### Adding New Routes

Create a new file in `apps/api/src/routes/`:

```typescript
import { FastifyPluginAsync } from 'fastify'

const myRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/myroute', async () => {
    return { message: 'Hello' }
  })
}

export default myRoutes
```

Routes are automatically loaded with `/api` prefix.

## 🎨 Frontend Development

The frontend app (`apps/web`) includes:
- **TanStack Start** (React Router + full-stack)
- **TanStack Query** for data fetching
- **TanStack Router** with file-based routing
- **Tailwind CSS v4** for styling
- **shadcn/ui** components

### File-Based Routing

Routes are automatically generated from `src/routes/`:
- `src/routes/index.tsx` → `/`
- `src/routes/about.tsx` → `/about`
- `src/routes/posts/$postId.tsx` → `/posts/:postId`
- `src/routes/posts_.$postId.tsx` → `/posts/:postId` (nested layout)

## 🤝 Shared Packages

### @repo/types

Shared TypeScript types and Zod schemas used by both frontend and backend.

### @repo/db

Shared database models and connection utilities.

### @repo/ui

Shared React components used across apps.

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

### API Start

```bash
cd apps/api
pnpm start
```

### Frontend Start

```bash
cd apps/web
pnpm start
```

## 🐳 Docker Deployment

You can build Docker images for each app:

### API Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm build --filter=api

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

### Frontend Dockerfile

TanStack Start apps can be deployed to any platform supporting Vite/Nitro (Vercel, Netlify, etc.)

## 📚 Useful Links

- [Turborepo](https://turbo.build/repo)
- [TanStack Start](https://tanstack.com/start/latest)
- [Fastify](https://fastify.dev/)
- [MongoDB](https://mongodb.com/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
