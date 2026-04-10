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
- **Breadcrumbs**: All routes using `useBreadcrumbStore` must update the page and path inside a `useEffect` to avoid side effects during render. Use `useBreadcrumbStore.getState().setPage()` and `useBreadcrumbStore.getState().setPath()` inside the effect.

## Business Logic

### Term Calculation

The current term is derived from the system date:

- **Term format**: `YYYY-1` or `YYYY-2`
- **Term 1**: January – June
- **Term 2**: July – December
- Example: a date of 2026-04-10 → current term is `2026-1`

### Main Workflows

#### 1. Admin creates a course and group

1. `POST /courses` — create a course
2. `POST /groups` — create a group associated to that course, with a `term` (e.g. `2026-1`), schedule, and `open: false` by default
3. `POST /groups/:id/dictations` — assign a user as dictante (professor) of the group

#### 2. Student enrolls in a group

- A group is **available for inscription** if:
  - `open: true`
  - `term` matches the current term (calculated from system date)
- `GET /groups/available` — returns groups meeting both conditions
- `POST /groups/:id/inscriptions` — authenticated user self-enrolls (only if group is open and term is current)

#### 3. Student withdraws from a group

- `DELETE /groups/:id/inscriptions/me` — only allowed while `open: true`

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
