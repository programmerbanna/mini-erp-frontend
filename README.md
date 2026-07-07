# Mini ERP Frontend

Frontend application for the Mini ERP Inventory & Sales Management System.

Tech stack: React, TypeScript, Vite, React Router, Tailwind CSS, shadcn/ui-style components, Redux Toolkit, TanStack Query, Axios, Socket.IO client, and Zod-compatible API patterns.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The Vite dev server starts on:

```text
http://localhost:5173
```

The backend must also be running. By default, the frontend talks to:

```text
http://localhost:5000/api
```

Make sure the backend `CORS_ORIGIN` matches the frontend origin, usually:

```text
http://localhost:5173
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend REST API base URL, including `/api` | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Backend root origin for Socket.IO and uploaded image URLs, without `/api` | `http://localhost:5000` |

Example `.env`:

```text
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint over frontend TypeScript and TSX files |
| `npm run format` | Format frontend TS, TSX, and CSS files with Prettier |

## Frontend Structure

The frontend uses a modular feature-based structure.

```text
src/
  App.tsx
  main.tsx
  index.css
  app/
    AppRouter.tsx
    hooks.ts
    queryClient.ts
    store.ts
  components/
    layout/
      AppShell.tsx
      ProtectedRoute.tsx
    ui/
      avatar.tsx
      badge.tsx
      button.tsx
      card.tsx
      dialog.tsx
      input.tsx
      label.tsx
      select.tsx
      separator.tsx
      table.tsx
  features/
    auth/
    dashboard/
    products/
    roles/
    sales/
    users/
  lib/
    axios.ts
    permissions.ts
    socket.ts
    utils.ts
  types/
    api.ts
```

## Core Frontend Features

- Login page.
- Protected routes.
- Permission-aware navigation.
- Dashboard statistics cards.
- Low-stock product table.
- Live low-stock Socket.IO notifications.
- Product listing.
- Product create, edit, and delete flows.
- Product image upload and preview.
- Product search and category filter.
- Product pagination.
- Create-sale page with multiple line items.
- Product picker with duplicate product prevention.
- Quantity input per sale line item.
- Automatic client-side estimated total.
- Server-side total remains authoritative.
- Admin-only user management.
- Admin-only role and permission management.
- Axios JWT interceptor.
- Automatic logout on `401`.
- TanStack Query cache invalidation after mutations.
- Redux Toolkit auth state persisted to `localStorage`.
- shadcn/ui-style reusable UI primitives.

## Routing And Permissions

Routes are declared in `src/app/AppRouter.tsx`.

| Route | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/` | Dashboard | Requires `dashboard:read` |
| `/products` | Product list and product dialogs | Requires `product:read` |
| `/sales` | Create sale | Requires `sale:create` |
| `/users` | User management | Requires `user:manage` |
| `/roles` | Role and permission management | Requires `role:manage` |

`ProtectedRoute` checks whether a token exists. When a route has `requiredPermission`, it also checks whether the authenticated user has that permission.

The main navigation in `AppShell` hides links when the user does not have the matching permission.

## Authentication Flow

1. User logs in from `/login`.
2. `POST /auth/login` returns a JWT and user object.
3. Redux stores the token and user.
4. Auth state is mirrored to `localStorage` so refreshes preserve the session.
5. Axios attaches `Authorization: Bearer <token>` to API requests.
6. If an API request returns `401`, the Axios interceptor logs the user out.

Default seeded admin credentials from the backend:

```text
Email: admin@example.com
Password: Admin@123
```

## State Management

Redux Toolkit is used only for auth state:

- Token.
- Current user.
- Role and permission data returned at login.
- Local storage persistence.

TanStack Query is used for server data:

- Dashboard stats.
- Products.
- Product mutations.
- Sales.
- Users.
- Roles.
- Permissions.

Mutations invalidate related query keys so affected lists refetch automatically.

## API Client

The Axios instance lives in:

```text
src/lib/axios.ts
```

It uses `VITE_API_URL` as the base URL and adds the JWT bearer token to outgoing requests when available.

Shared API envelope types live in:

```text
src/types/api.ts
```

## Dashboard Page

Route:

```text
/
```

Permission:

```text
dashboard:read
```

Displays:

- Total products.
- Total sales.
- Total revenue.
- Low stock count.
- Low stock products table.

The dashboard also subscribes to the `low-stock` Socket.IO event. When the event arrives, the app shows a toast and invalidates the dashboard query so the latest low-stock data is fetched.

## Products Page

Route:

```text
/products
```

Base permission:

```text
product:read
```

Features:

- Product table.
- Product image display.
- Search by product name or SKU.
- Category filter.
- Pagination.
- Low-stock badge.
- Add product dialog.
- Edit product dialog.
- Delete confirmation.
- Image upload.
- Image preview.
- Loading, empty, and error states.

Inline actions are permission-aware:

| Action | Required permission |
|---|---|
| View products | `product:read` |
| Add product | `product:create` |
| Edit product | `product:update` |
| Delete product | `product:delete` |

Create product validation:

- Name is required.
- SKU is required.
- Category is required.
- Purchase price must be non-negative.
- Selling price must be non-negative.
- Stock quantity must be non-negative.
- Image is required for create.

Edit product validation:

- Same product fields are validated.
- Image is optional; omit it to keep the existing image.

## Sales Page

Route:

```text
/sales
```

Permission:

```text
sale:create
```

Features:

- Multiple sale line items.
- Product selector per line.
- Quantity input per line.
- Prevents selecting the same product twice in the same sale draft.
- Add/remove line item controls.
- Estimated total preview based on current selling prices.
- Submit sale to the backend.
- Loading, empty, and error states.

Important behavior:

- The frontend preview total is for user convenience.
- The backend calculates and stores the authoritative sale total.
- Backend validation still prevents unavailable or insufficient stock.

## Users Page

Route:

```text
/users
```

Permission:

```text
user:manage
```

Admin-only user management supports:

- Listing users.
- Creating users.
- Assigning roles.
- Updating user name.
- Updating user role.
- Activating or deactivating accounts.

There is no public self-registration flow.

## Roles Page

Route:

```text
/roles
```

Permission:

```text
role:manage
```

Admin-only role management supports:

- Listing roles.
- Listing available permission keys.
- Creating roles.
- Editing role name and description.
- Editing permission arrays.
- Deleting roles when no users are assigned.

This UI pairs with the backend database-driven RBAC model.

## Socket.IO

Socket helper:

```text
src/lib/socket.ts
```

Default socket URL:

```text
http://localhost:5000
```

Low-stock event:

```text
low-stock
```

Expected payload:

```json
{
  "productId": "...",
  "name": "Widget",
  "sku": "WID-001",
  "stockQuantity": 2
}
```

The dashboard hook listens for this event, shows a toast warning, and refreshes dashboard stats.

## Styling

Styling is built with Tailwind CSS and shadcn/ui-style primitives.

Important files:

| File | Purpose |
|---|---|
| `tailwind.config.ts` | Tailwind content paths, design tokens, radius, animation plugin |
| `src/index.css` | Global Tailwind layers and CSS variables |
| `src/components/ui/*` | Reusable UI primitives |
| `src/lib/utils.ts` | `cn()` class merge helper |

## Frontend Assessment Coverage

| Requirement | Frontend implementation/documentation |
|---|---|
| React | React app under `src/` |
| React Router | `src/app/AppRouter.tsx` |
| TypeScript | TS/TSX source and `tsconfig` |
| Tailwind CSS / shadcn | Tailwind config plus reusable UI primitives |
| Redux / TanStack Query | Redux for auth, TanStack Query for server state |
| Login | `/login` |
| Protected routes | `ProtectedRoute` |
| Dashboard statistics cards | Dashboard page cards |
| Low stock products | Dashboard low-stock table |
| Product list | Products page table |
| Add product | Product create dialog |
| Edit product | Product edit dialog |
| Delete product | Product delete action |
| Image upload | Product form file input and `multipart/form-data` API |
| Search | Product search input |
| Pagination | Product previous/next controls |
| Create sale page | `/sales` |
| Multiple product selection | Sale line items |
| Quantity input | Quantity field per sale line |
| Automatic total calculation | Estimated total preview |
| Error handling | Loading/error states and toast errors |
| Permission-aware UI | Navigation and action gating by permission |
| Bonus: dynamic role UI | Roles page |
| Bonus: user management | Users page |
| Bonus: Socket.IO | Dashboard low-stock notifications |
