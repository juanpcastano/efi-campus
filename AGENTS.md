# efi-campus

## Commands

- `pnpm dev`: Start development server (port 3000)
- `pnpm build`: Build for production
- `pnpm test`: Run tests with `vitest`
- `pnpm lint`: Run ESLint
- `pnpm format`: Check formatting with `prettier`
- `pnpm check`: Run `prettier --write` and `eslint --fix`

## Conventions

- **Path Aliases**: Use `#/*` to reference `src/*` (e.g., `import X from '#/components/X'`)
- **Tech Stack**: React 19, TypeScript, Vite, TanStack Router, Zustand, Tailwind CSS, shadcn/ui
- **API Client**: All API calls are made using the `apiClient` instance. For each resource, use the corresponding service in `lib/services/` (e.g., `userService`, `courseService`, `groupService`)
- **UI Components**: Always prefer using shadcn/ui components already implemented. If you need a new component, request it first

## API Endpoints

### 1. `users-handler` → `ANY /users/{proxy+}`

- `GET /users`: Admin
- `GET /users/me`: Autenticado
- `PATCH /users/me`: Autenticado
- `DELETE /users/me`: Autenticado
- `GET /users/me/inscriptions`: Autenticado
- `GET /users/me/dictations`: Autenticado
- `GET /users/:id`: Admin
- `PATCH /users/:id`: Admin
- `DELETE /users/:id`: Admin
- `PATCH /users/:id/role`: Admin
- `GET /users/:id/inscriptions`: Admin
- `GET /users/:id/dictations`: Admin

### 2. `courses-handler` → `ANY /courses/{proxy+}`

- `GET /courses`: Público
- `GET /courses/:id`: Público
- `POST /courses`: Admin
- `PATCH /courses/:id`: Admin
- `DELETE /courses/:id`: Admin

### 3. `groups-handler` → `ANY /groups/{proxy+}`

- `GET /groups`: Admin
- `GET /groups/available`: Autenticado
- `GET /groups/:id`: Admin / Inscrito
- `POST /groups`: Admin
- `PATCH /groups/:id`: Admin
- `PATCH /groups/:id/open`: Admin
- `DELETE /groups/:id`: Admin
- `GET /groups/:id/inscriptions`: Admin / Inscrito (solo si open = false)
- `POST /groups/:id/inscriptions`: Admin / Autenticado (si open = true y término actual)
- `DELETE /groups/:id/inscriptions/me`: Autenticado (si open = true)
- `DELETE /groups/:id/inscriptions/:inscriptionId`: Admin
- `GET /groups/:id/dictations`: Admin
- `POST /groups/:id/dictations`: Admin
- `DELETE /groups/:id/dictations/:dictationId`: Admin
