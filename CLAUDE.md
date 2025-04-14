# Chimera Discord Bot Development Guidelines

## Build Commands
- **Backend**: `cd apps/backend && pnpm build` - Build NestJS backend
- **Frontend**: `cd apps/frontend && pnpm build` - Build Next.js frontend
- **Dev Mode**: 
  - Backend: `cd apps/backend && pnpm start:dev`
  - Frontend: `cd apps/frontend && pnpm dev`

## Testing
- **Run all tests**: `cd apps/backend && pnpm test`
- **Single test**: `cd apps/backend && pnpm test pattern-to-match`
- **E2E tests**: `cd apps/backend && pnpm test:e2e`

## Linting/Formatting
- **Backend**: `cd apps/backend && pnpm lint`
- **Frontend**: `cd apps/frontend && pnpm lint`
- **Format**: `cd apps/backend && pnpm format` (uses Prettier)

## Code Style Guidelines
- **Naming**: PascalCase for components/types/interfaces, camelCase for variables/functions
- **Imports**: Use path aliases defined in tsconfig.json (`@/` for src directory)
- **Types**: Always use explicit return types for functions, prefer interface over type
- **Error Handling**: Use try/catch for async code, handle promise rejections
- **Structure**: Follow modular architecture patterns with separation of concerns
- **Documentation**: Document complex functions and components with JSDoc comments