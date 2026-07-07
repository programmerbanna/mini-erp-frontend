# Mini ERP — Frontend

React + TypeScript + Vite + Tailwind CSS + shadcn/ui + TanStack Query + Redux Toolkit + React Router.

## Setup

```bash
npm install
cp .env.example .env   # point at your backend if not using the default
npm run dev             # http://localhost:5173
```

The backend must be running (see [`../backend/README.md`](../backend/README.md)) and its `CORS_ORIGIN`
must match this app's origin.

## Environment variables

| Variable | Description | Default (`.env.example`) |
|---|---|---|
| `VITE_API_URL` | Backend REST base URL (includes `/api`) | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Backend origin for the Socket.IO connection (no `/api`) | `http://localhost:5000` |

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

## Structure

Feature-based, not type-based:

```
src/
  app/                        # store (Redux), queryClient (TanStack Query), AppRouter
  components/
    ui/                         # shadcn/ui primitives (button, input, dialog, table, select, ...)
    layout/                     # AppShell (nav + user menu), ProtectedRoute
  features/
    auth/                       # login page, auth slice (token + user), auth API hooks
    products/                   # list/search/pagination, add/edit dialog with image upload
    sales/                      # create-sale page (line items, live total preview)
    dashboard/                  # stat cards, low-stock table, Socket.IO live-update hook
    users/                      # admin-only user management (create accounts, assign roles, deactivate)
    roles/                      # admin-only role management (create/edit/delete roles, toggle permissions)
  lib/                        # axios instance (JWT interceptor), socket client, permission helper
  types/                      # shared API envelope types
```

## Pages & required permissions

| Route | Page | Required permission |
| --- | --- | --- |
| `/login` | Login | public |
| `/` | Dashboard (stat cards, low-stock table, live updates) | `dashboard:read` |
| `/products` | Product list + add/edit/delete dialogs | `product:read` (write actions further gated per button) |
| `/sales` | Create sale (multi-product line items, auto total) | `sale:create` |
| `/users` | User management (Admin) | `user:manage` |
| `/roles` | Role & permission management (Admin) | `role:manage` |

Routes are gated by `ProtectedRoute requiredPermission="..."`; nav links a user lacks permission for
are hidden entirely.

## State management split

- **TanStack Query** owns all server data — products, sales, dashboard stats. Mutations invalidate the
  relevant query keys on success so lists refetch automatically; nothing server-derived is duplicated
  into Redux.
- **Redux Toolkit** is scoped to auth only — the JWT and current user, mirrored to `localStorage` so a
  refresh doesn't log you out. See `features/auth/authSlice.ts`.

## Permission-aware UI

`hasPermission(user, 'product:create')` (in `lib/permissions.ts`) drives both route-level gating
(`ProtectedRoute requiredPermission="..."`) and inline UI (e.g. the "Add Product" button is hidden
entirely, not just disabled, for users lacking `product:create`). Permissions come from the JWT-verified
`/auth/login` response, mirroring exactly what the backend's `requirePermission` middleware checks.
