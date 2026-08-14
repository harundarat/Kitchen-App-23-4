# Admin-to-Frontend Migration Runbook

Status: **Completed 2026-08-13**

Prepared: **2026-08-13**

Repository: KitchenCraft

Target branch at inspection time: `migrate/admin-into-frontend`

Inspected baseline commit: `f8c3634`

This document is the complete execution plan for merging the standalone `admin`
application into `frontend`. It is intended to be followed by another Codex
agent without access to the conversation that produced it.

Do not treat the old admin application's appearance, dependencies, data shapes,
or architecture as authoritative. Preserve its useful behavior while adapting
it to the current frontend and backend contracts.

## 1. Objective and non-goals

The completed system must provide the existing admin functionality from routes
inside `frontend`, using the frontend's architecture and visual language.

In scope:

- Administrator login and logout.
- Role-protected admin routes inside `frontend`.
- User list, client-side search, detail, edit, and confirmed cascade deletion.
- Recipe list, client-side search, and read-only recipe detail.
- Current backend API integration, including a missing protected endpoint needed
  to restore the old user-edit behavior.
- Automated frontend behavior tests and backend authorization/contract tests.
- Full-stack acceptance against an isolated local database.
- Removal of the standalone `admin` application after acceptance succeeds.

Out of scope:

- A reported-recipes inbox. `GET /api/admin/reports` exists, but the old admin UI
  never exposed it.
- Admin recipe deletion. The backend supports it, but the old admin UI did not.
- Server-side pagination for admin lists. Preserve the existing unpaginated list
  behavior for this migration.
- Simultaneous user and administrator sessions in one browser.
- A new design system, separate admin theme, root workspace manager, or shared
  package extraction.
- Unrelated refactors in the frontend's large recipe input/edit pages.

## 2. Current state

### 2.1 Repository and tooling

The repository contains three independent npm projects. There is no root
`package.json`, npm workspace, pnpm workspace, Turborepo, or Nx configuration.

| Project    | Current role               | Language/build                  | Runtime target |
| ---------- | -------------------------- | ------------------------------- | -------------- |
| `admin`    | Legacy standalone admin UI | JavaScript, Vite 5              | React 18       |
| `frontend` | Authoritative target UI    | Strict TypeScript, Vite 8       | React 19       |
| `backend`  | Shared API                 | TypeScript, Express 5, Mongoose | Node 24        |

Baseline health observed during planning:

- `frontend`: typecheck, zero-warning lint, format check, and production build
  pass.
- `backend`: typecheck, 13 Node tests, and build pass.
- `admin`: production build passes, but lint fails with 13 errors and one hook
  warning.
- `frontend/dist` is tracked. Avoid rewriting it during intermediate phases.
- `frontend/.env` is tracked despite the frontend ignore file. Any acceptance
  edits must be backed up and restored exactly.

### 2.2 Dependency comparison

Authoritative frontend versions from its lockfile:

- React and React DOM `19.2.8`.
- React Router DOM `7.18.2`.
- Tailwind CSS and `@tailwindcss/vite` `4.3.3`.
- Flowbite React `0.12.17`.
- TypeScript `5.9.3`.
- Vite `8.2.0` and React Vite plugin `6.0.5`.
- ESLint `10.8.0`, Prettier `3.9.6`, and Tailwind Prettier plugin `0.8.1`.

Legacy admin versions from its lockfile:

- React and React DOM `18.3.1`.
- React Router DOM `6.23.1`.
- Tailwind CSS `3.4.3`.
- Flowbite React `0.9.0`.
- Vite `5.2.12`.
- Axios `1.7.2`.

The admin manifest also declares Headless UI, Heroicons, json-server,
hamburger-react, react-dragscroll, react-hot-toast, react-scroll,
react-use-draggable-scroll, resize-observer-polyfill, SimpleBar, Iconify, and
the Tailwind forms plugin. The live admin source only imports React, React DOM,
React Router, and Axios. It does not render a Flowbite React component.

The frontend already contains newer compatible versions of the UI/runtime
dependencies it actually needs. Its only observed high-severity audit finding
is the transitive `nanoid@3.3.16` under Vite/PostCSS; the compatible fixed
resolution is `3.3.18`. The old admin tree has 26 audit findings and will be
removed instead of reconciled.

### 2.3 Routing, layouts, and providers

The legacy admin routes are:

- `/` — user list.
- `/ResepMakanan` — recipe list.
- `/DetailResep/:id` — recipe detail.
- `/DetailUser/:id` — user detail/edit.

Its sidebar owns local active-menu state, uses imperative navigation, and sends
the logout menu item to an unimplemented `/logout` route. It has no login page,
auth provider, or route guard.

The frontend uses a single `BrowserRouter`, `UserContextProvider`,
`AdditionalInfoProvider`, a global hot-toast `Toaster`, lazy route pages, and
pathname checks to decide when to hide its navbar/footer. The current public and
consumer routes are:

- `/`, `/search`, `/recipe/:id`.
- `/recipe/input`, `/recipe/edit/:idRecipe`.
- `/about`, `/about/privasi`, `/about/kontak-saran`.
- `/user/:username`, `/profile/:username`, `/profile/edit`.

The migration must replace pathname-based chrome checks with explicit nested
layouts so admin routes do not accumulate special cases.

### 2.4 Authentication and authorization

The backend already has separate login endpoints for users and administrators,
but both issue the same HTTP-only cookie named `token`:

- `POST /api/auth/login` creates a JWT with `role: "user"`.
- `POST /api/admin/login` creates a JWT with `role: "admin"`.
- `GET /api/auth` returns the verified token's `{ id, username, role }`.
- User and admin logout endpoints both clear `token`.

The JWT is accepted from the cookie or an `Authorization: Bearer` header. The
frontend API client already uses `credentials: "include"`, a 15-second timeout,
central JSON/body handling, and typed `ApiError` failures.

Every admin data route uses `authenticate` and `onlyAdmin`; `onlyAdmin` also
checks that the administrator still exists. However:

- `GET /api/auth` only validates the signature and does not check that the
  referenced principal still exists.
- Consumer mutation routes do not consistently reject `role: "admin"` before
  applying user-specific checks.
- The old admin UI has no authentication integration and makes hardcoded Axios
  calls without cookie credentials, so it cannot use the protected routes.

### 2.5 Backend API and data-shape drift

The old user list/detail/delete calls still map to current routes, but old user
editing calls `PUT /api/admin/user/:id`, which the current backend does not
define.

The old recipe detail expects:

- A raw recipe response.
- `total_time`.
- Singular `category`.
- `stepDescription: string[]`.

The backend now returns `{ recipe, nutrition }` and stores:

- `totalTime`.
- `categories: string[]`.
- `steps: Array<{ description, image }>`.
- Optional nutrition.

The migrated UI must consume the current contract. Do not reproduce old field
aliases in page components.

### 2.6 Visual and styling state

Both applications load Outfit, and their color values overlap, but the admin UI
does not consistently use the frontend's visual system. Admin-specific styling
currently includes:

- A dark fixed sidebar with PNG menu/control icons.
- Blue primary buttons and focus states.
- `font-poppins` classes even though Poppins is not loaded correctly.
- Fixed 400px search inputs.
- Raw tables with minimal responsive behavior.
- Legacy dark-mode utility variants despite the target Flowbite configuration
  having dark mode disabled.
- Custom `.bg-Sidebar`, `.fixed`, `.flex-grow`, `.h-screen`, `.duration-500`,
  and `.p-5` CSS that duplicates framework utilities.

The frontend's established language is:

- Outfit typography.
- `primary` charcoal, `bg` off-white, `accent-1` red, and `accent-2` green.
- Responsive content widths, especially `max-w-[1080px]` and `max-w-[720px]`.
- Rounded buttons/inputs/cards, restrained borders and shadows, and mobile-first
  breakpoints.
- Flowbite modals, inputs, checkboxes, pagination, and sidebar components with a
  single application theme.
- Iconify icons and hot-toast feedback.

## 3. Target state

After migration, `frontend` is the only browser application. Admin functionality
lives under `/admin` and uses the same React root, API client, session context,
Flowbite provider, Tailwind v4 theme, typography, icons, feedback system, and
component patterns as consumer functionality.

Target route tree:

```text
BrowserRouter
└── UserContextProvider
    ├── Toaster
    ├── ConsumerLayout + AdditionalInfoProvider
    │   ├── /
    │   ├── /search
    │   ├── /recipe/:id
    │   ├── /about/*
    │   ├── /user/:username
    │   └── /profile/:username
    ├── ConsumerEditorLayout + AdditionalInfoProvider
    │   ├── /profile/edit
    │   ├── /recipe/input
    │   └── /recipe/edit/:idRecipe
    ├── /admin/login
    └── RequireAdmin
        └── AdminLayout
            ├── /admin → /admin/users
            ├── /admin/users
            ├── /admin/users/:id
            ├── /admin/recipes
            ├── /admin/recipes/:id
            └── /admin/* → admin-scoped not-found state
```

The admin shell is dedicated but not separately themed:

- Hide the consumer navbar/footer inside `/admin`.
- Use a responsive Flowbite sidebar with the frontend logo, Iconify icons,
  frontend tokens, `NavLink` active state, desktop collapse, and mobile drawer.
- Use the same page widths, headings, fields, buttons, tables, modal treatment,
  borders, shadows, empty states, and loading feedback as the frontend.
- Keep `/admin/login` unlinked for anonymous visitors. While an admin session is
  active, the normal navbar/profile UI shows an admin-dashboard action.

## 4. Architectural decisions

### AD-1: One active role per browser

Keep the existing single `token` cookie. A successful admin login replaces a
user session, and a successful user login replaces an admin session. Do not add
parallel cookies.

The administrator flow is:

1. Seed an admin account using the backend's `ADMIN_*` variables.
2. Submit `/admin/login` to `POST /api/admin/login`.
3. Let the backend set the HTTP-only cookie.
4. Ignore the token currently included in the JSON body; never store it in
   localStorage or sessionStorage.
5. Call `GET /api/auth` through the shared API client.
6. Permit admin routes only when the returned role is `admin`.
7. Call `POST /api/admin/logout`, refresh/reset session state, and return to
   `/admin/login`.

Because the cookie is shared while React state is tab-local, successful login
and logout flows publish an opaque `session-changed` message through a shared
`BroadcastChannel`. The message never contains a token or principal data;
every receiving `UserContext` resolves the active principal through canonical
`GET /api/auth`. Tabs also revalidate once after a genuine blur/hidden and
focus/visible transition so suspended tabs, missed messages, cookie expiry,
and principal changes outside the current frontend recover before protected
interaction. Session checks are single-flight with one trailing refresh for a
newer signal, and stale responses cannot overwrite newer state. A confirmed
principal is cleared only by a definitive 401; network and 5xx failures retain
the last confirmed principal without authorizing protected interaction until a
later check succeeds.

Frontend route guards are navigation UX, not the security boundary. Every admin
API route remains protected on the backend.

### AD-2: Extend the existing session context

Do not introduce an `AdminContext`. Extend the existing user context to expose:

- `user: SessionUser | null`.
- A clear loading/authenticated/anonymous session status.
- `isUser` and `isAdmin` booleans.
- `refreshSession()`.
- A role-aware `logout()`.

All consumer-only UI actions must require `isUser`. An administrator session
must not expose user recipe creation/editing, like, save, report, or profile
settings actions.

### AD-3: Enforce active principals and user-only mutations on the backend

Keep JWT extraction/signature verification in `authenticate`. Add middleware or
a small shared guard that verifies the referenced principal still exists for
the token's role. Add an `onlyUser` guard analogous to `onlyAdmin`.

Apply `onlyUser` after `authenticate` to:

- `/api/for-you`.
- `/api/auth/authorized/:username`.
- Authenticated saved/liked/edit/delete user routes.
- Recipe create/edit/delete/like/save/report routes.

`GET /api/auth` must accept either role but verify that the corresponding User
or Admin document still exists before returning the session. Optional-auth,
read-only recipe detail may continue accepting either role.

### AD-4: Restore admin user editing with a current contract

Add:

```http
PUT /api/admin/user/:id
Content-Type: application/json

{
  "username": "optional",
  "fullName": "optional",
  "email": "optional"
}
```

Rules:

- Protect it with `authenticate` and `onlyAdmin`.
- Validate `:id` as an ObjectId.
- Use the same username, full-name, and email constraints as normal user profile
  editing.
- Reject unknown fields and an empty update.
- Normalize username/email exactly as the user controller does.
- Let existing duplicate-key handling return HTTP 409.
- Return `{ message, user }`; never select or return `password`.
- Do not add password, image, website, bio, or preference administration in this
  migration because the old UI did not support them.

### AD-5: Use typed admin services over the shared API client

Create a focused frontend admin service module wrapping the existing `api`
client. It must expose typed operations for login/logout, user list/detail/edit/
delete, and recipe list/detail. Do not put URLs directly in page components.

Normalize the admin recipe detail response in the service layer by combining
`{ recipe, nutrition }` into a display DTO. Page components should only see
current camelCase field names.

### AD-6: Reuse presentation, not consumer-only behavior

Extract reusable recipe-detail presentation primitives from the public recipe
page for the hero, metadata, ingredient list, nutrition grid, video, and steps.
Keep fetching and consumer actions in route-level pages. The admin page uses the
same presentation with like/save/share/report/edit/price-check actions disabled.

Extract the existing destructive-confirmation visual into a shared Flowbite
confirmation component and use it for admin user deletion and existing recipe
deletion. Preserve existing consumer behavior while eliminating a new duplicate.

### AD-7: Keep deployment additive and ordered

There is no database migration. Deploy the additive backend endpoint and role
guards before deploying the merged frontend. Remove the old app only after the
full-stack gate passes.

## 5. Dependency reconciliation

### Keep unchanged

- React/React DOM 19 and their React 19 type packages.
- React Router DOM 7.
- Tailwind CSS 4 and `@tailwindcss/vite`.
- Flowbite React 0.12 and the current Vite/CLI-generated integration.
- Current frontend Iconify, hot-toast, hamburger, forms, and other dependencies.

### Add as development-only frontend dependencies

- `vitest`.
- `@testing-library/react`.
- `@testing-library/user-event`.
- `@testing-library/jest-dom`.
- `jsdom`.

Add scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Configure a jsdom test environment and a setup module for jest-dom plus only the
browser APIs Flowbite actually requires in tests, such as `matchMedia` or
`ResizeObserver`. Do not add mocks preemptively.

### Do not add or copy

- Axios.
- Admin's React 18 or type packages.
- Admin's Router 6 or Flowbite 0.9 packages.
- Headless UI or Heroicons.
- json-server.
- react-dragscroll, resize-observer-polyfill, SimpleBar, or SimpleBar React.
- Admin's Tailwind/PostCSS/Autoprefixer configuration.

### Lockfile and audit handling

- Modify only `frontend/package.json` and `frontend/package-lock.json` for
  frontend dependency work.
- Resolve the current transitive `nanoid` finding with a lockfile-compatible
  update to the fixed 3.3.x release; do not add an unnecessary direct runtime
  dependency or run a blanket force audit fix.
- Do not spend migration effort updating the legacy admin dependency tree. Its
  entire manifest and lockfile are removed in the retirement phase.

## 6. React 19 migration considerations

All migrated admin JavaScript must be rewritten as strict `.tsx`; do not copy
`.jsx` and defer typing.

- Keep the modern JSX transform. Remove unnecessary default `React` imports.
- Use the frontend's existing `ReactDOM.createRoot` and `StrictMode`; do not add
  another root or router.
- Type route params as possibly undefined and handle missing/invalid IDs before
  making requests.
- Type form, input, button, and mouse events explicitly.
- Initialize every `useRef` argument, as required by React 19 types.
- Do not use implicit-return ref callbacks that could be interpreted as cleanup
  functions.
- Make effects safe under Strict Mode's development replay:
  - Pass `AbortController.signal` through the existing API client's request
    options.
  - Abort requests during effect cleanup.
  - Ignore `AbortError` rather than displaying a toast.
  - Prevent stale responses from overwriting newer route/search state.
- Keep hook dependency arrays correct; use stable callbacks only when needed.
- Do not use removed APIs, string refs, `react-dom/test-utils`, shallow renderers,
  or `react-test-renderer`. Use React Testing Library.
- Prefer derived booleans (`isUser`, `isAdmin`) over mirrored role state.
- Preserve route-level lazy loading for admin pages so the consumer entry bundle
  does not eagerly load the entire admin area.

Reference: <https://react.dev/blog/2024/04/25/react-19-upgrade-guide>

## 7. Tailwind CSS v4 and Flowbite migration considerations

The target already has the correct setup:

- `@tailwindcss/vite` in `frontend/vite.config.ts`.
- `flowbite-react/plugin/vite` in the same config.
- `@import "tailwindcss"` and the Flowbite plugin/source declarations in
  `frontend/src/index.css`.
- Theme tokens declared with `@theme`.
- One generated Flowbite initializer and one application `ThemeProvider`.
- Flowbite `dark: false`.

Do not run a wholesale Tailwind upgrade command against `frontend`. Author the
new admin UI directly in the target conventions.

Specific v3-to-v4 hazards in the legacy admin code:

- Never copy `@tailwind base/components/utilities`; v4 uses the existing import.
- Replace `bg-opacity-*` combinations with opacity modifiers such as
  `bg-gray-400/10`.
- Do not copy the JavaScript Tailwind config or its duplicate `fontFamily` keys.
- Do not add Poppins. Use the existing Outfit font token.
- Do not copy `bg-Sidebar`, `border-dark-purple`, old blue focus utilities, or
  legacy dark variants.
- Do not recreate built-in utility classes in global CSS.
- Tailwind v4 renamed the visual meaning/name of several shadows, radii,
  outlines, and blur utilities. Match existing frontend source patterns rather
  than attempting mechanical class parity with admin.
- Keep class names statically discoverable. Avoid constructing partial Tailwind
  class names dynamically.
- Reuse literal frontend tokens: `bg-bg`, `text-primary`, `bg-primary`,
  `text-bg`, `bg-accent-2`, and `bg-accent-1`.
- Red is for destructive actions; green is the active/success accent; charcoal
  is the normal primary action color.
- Use existing responsive widths and spacing instead of fixed 400px controls.
- Add Flowbite components through normal imports so its generated class-list
  integration can detect them. Do not create a second Flowbite config or import
  legacy Flowbite CSS.

References:

- <https://tailwindcss.com/docs/upgrade-guide>
- <https://flowbite-react.com/docs/guides/vite>

## 8. UI migration classification

| Legacy admin code                                  | Classification                | Target implementation                                                              |
| -------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------- |
| `SideNav` and PNG icons                            | Replace                       | Responsive Flowbite sidebar/header, frontend logo, Iconify, `NavLink` active state |
| User and recipe search forms                       | Reuse frontend implementation | `InputWbtn`, responsive full-width behavior, same client-side search semantics     |
| Raw user/recipe tables                             | Replace                       | Flowbite Table in responsive overflow container with loading/empty/error states    |
| User detail and edit form                          | Migrate while restyling       | `InputForm`, frontend widths, blank-profile asset, frontend buttons/toasts         |
| Immediate user deletion                            | Replace                       | Shared Flowbite confirmation modal with cascade warning                            |
| Recipe detail                                      | Migrate while restyling       | Shared public recipe presentation primitives without consumer actions              |
| Sidebar collapse state                             | Keep with minor adaptation    | Accessible desktop collapse and mobile drawer state                                |
| Client-side list filtering                         | Keep with minor adaptation    | Case-insensitive username/full-name and title filtering                            |
| Admin global CSS/config                            | Remove                        | Existing frontend Tailwind v4 CSS and tokens only                                  |
| `font-poppins`, blue action palette, dark variants | Remove/replace                | Outfit and frontend charcoal/green/red conventions                                 |
| Commented `pages/Sidebar.jsx`                      | Remove obsolete code          | No replacement                                                                     |
| TheMealDB `recipeService.js`                       | Remove obsolete code          | No replacement                                                                     |
| Duplicate additional-info service/data             | Remove duplicate              | Existing frontend provider/service remains authoritative                           |
| `data.json`, unused Vite assets, admin PNGs        | Remove obsolete assets        | Reuse frontend logo/icons/assets                                                   |

## 9. Execution phases and checkpoints

General execution rules:

- Begin by rerunning the baseline because the repository may have changed since
  this document was written.
- Preserve unrelated working-tree changes. Stop and report if planned files
  overlap unknown user edits.
- Use an atomic local commit at each checkpoint; do not push. If commit creation
  is not authorized in the implementation request, record the current SHA and
  save the phase diff instead.
- Do not remove `admin` until Phase 6 passes.
- Do not run the normal frontend build into tracked `dist` until Phase 7. Use a
  temporary output directory for intermediate build gates.
- Update the progress checklist and decision log in this document as work
  proceeds.

### Phase 0 — Reconfirm baseline

Tasks:

- Record current branch, SHA, and `git status --short` in the decision log.
- Reinspect the three manifests, routing, auth routes/middleware, and Flowbite/
  Tailwind setup for changes since `f8c3634`.
- Confirm that no new admin functionality or target-stack change has appeared.
- Run the baseline checks below.

Validation:

```bash
cd frontend
npm ci
npm run typecheck
npm run lint
npm run format:check
frontend_build_tmp=$(mktemp -d)
./node_modules/.bin/vite build --outDir "$frontend_build_tmp" --emptyOutDir
```

```bash
cd backend
npm ci
npm run check
backend_build_tmp=$(mktemp -d)
./node_modules/.bin/tsc -p tsconfig.build.json --outDir "$backend_build_tmp"
```

```bash
cd admin
npm ci
admin_build_tmp=$(mktemp -d)
./node_modules/.bin/vite build --outDir "$admin_build_tmp" --emptyOutDir
```

The known admin lint failure is informational, not a phase gate.

Checkpoint: `migration-baseline`.

### Phase 1 — Test foundation and dependency cleanup

Tasks:

- Add Vitest/Testing Library development dependencies and scripts.
- Configure jsdom and a shared test setup.
- Add a minimal render test for the existing app/session provider before changing
  routing.
- Update the transitive `nanoid` lockfile resolution to a fixed compatible
  release.
- Confirm no runtime dependency from `admin` was copied.

Validation:

```bash
cd frontend
npm test
npm run typecheck
npm run lint
npm run format:check
npm audit --audit-level=high
frontend_build_tmp=$(mktemp -d)
./node_modules/.bin/vite build --outDir "$frontend_build_tmp" --emptyOutDir
```

Exit gate:

- Existing frontend renders in the test environment.
- All frontend checks pass.
- High-severity frontend audit gate passes.

Checkpoint: `test-foundation`.

### Phase 2 — Backend contract and role-aware session

Tasks:

- Add active-principal validation and `onlyUser` enforcement described in AD-3.
- Add `PUT /api/admin/user/:id` described in AD-4.
- Add backend tests using mocked model methods plus Supertest; do not require a
  live MongoDB for the normal test command.
- Extend frontend session types/context with loading state, `isUser`, `isAdmin`,
  `refreshSession`, and role-aware logout.
- Add typed admin DTOs and the admin service module.
- Ensure abort signals can pass through every read operation used by effects.

Backend test scenarios:

- Missing/tampered JWT returns 401.
- A user token on admin routes returns 403.
- An admin token on consumer-only mutations returns 403.
- Deleted/stale user and admin principals are rejected.
- Invalid user ID, empty update, unknown field, invalid username/email, and
  missing user return the documented errors.
- Duplicate username/email returns 409.
- Successful update returns the wrapper and excludes password.
- Existing admin list/detail/delete routes remain protected.

Frontend test scenarios:

- Session refresh maps anonymous, user, admin, and server-error states.
- Logout uses the correct endpoint for the active role and clears state.
- No token is stored in web storage.

Validation:

```bash
cd backend
npm run check
backend_build_tmp=$(mktemp -d)
./node_modules/.bin/tsc -p tsconfig.build.json --outDir "$backend_build_tmp"
```

```bash
cd frontend
npm test
npm run typecheck
npm run lint
npm run format:check
```

Exit gate:

- Backend tests prove role separation and the user-update contract.
- The frontend has one role-aware session provider and one API client.
- Existing user-session behavior remains covered.

Checkpoint: `admin-auth-api`.

### Phase 3 — Route layouts, admin login, and shell

Tasks:

- Replace pathname-based navbar/footer checks with explicit route layouts.
- Keep `UserContextProvider` and `Toaster` global.
- Scope `AdditionalInfoProvider` to consumer layouts that need it.
- Add lazy-loaded admin pages, `RequireAdmin`, `/admin/login`, and the nested
  admin route tree.
- Preserve the originally requested admin deep link in router location state.
- If a normal user opens admin login, explain that a successful admin login will
  replace the user session.
- Add the dedicated responsive admin shell described in the target state.
- Update normal navbar/profile behavior:
  - Do not fetch a consumer profile for an admin principal.
  - Show the admin dashboard/logout affordance only for `isAdmin`.
  - Keep admin login undiscoverable while anonymous.
- Guard all consumer-only buttons/routes with `isUser`.

Tests:

- Session-loading fallback does not redirect prematurely.
- Anonymous and user sessions are sent to admin login.
- Admin sessions render the requested protected route.
- Successful login returns to a stored deep link; failed login remains in place.
- Refresh preserves access through the cookie-backed session.
- Logout returns to login and protected content disappears.
- Active sidebar state follows the URL rather than private menu state.
- Mobile drawer and desktop collapse controls have labels and `aria-expanded`.
- Consumer routes retain the correct navbar/footer behavior.

Validation:

```bash
cd frontend
npm test
npm run typecheck
npm run lint
npm run format:check
frontend_build_tmp=$(mktemp -d)
./node_modules/.bin/vite build --outDir "$frontend_build_tmp" --emptyOutDir
```

Exit gate:

- All route roles and layouts behave correctly in tests.
- Admin code is lazy-loaded and uses the existing Flowbite theme.
- Consumer route chrome has no regression.

Checkpoint: `admin-shell`.

### Phase 4 — User management

Tasks:

- Implement the admin user list using a Flowbite table.
- Preserve case-insensitive filtering by username or full name.
- Implement user detail and edit against the new typed endpoint.
- Use `InputForm`, frontend spacing/widths, hot-toast, and the blank profile
  fallback.
- Extract/reuse the common confirmation dialog.
- Display a specific cascade warning before deletion because backend deletion
  removes authored recipes, nutrition, likes, saved recipes, and reports.
- On successful list deletion, remove the row locally.
- On successful detail deletion, navigate to `/admin/users`.
- Render explicit loading, empty, not-found, authorization, validation,
  duplicate, server-error, and retry states.

Tests:

- Initial load and empty response.
- Username/full-name filtering, including mixed case.
- Detail fetch and missing ID.
- Edit cancellation and correct update payload.
- 400, 401, 403, 404, 409, and 500 handling.
- Delete confirmation cancellation and success.
- Row removal and post-delete navigation.

Validation:

```bash
cd frontend
npm test -- src/test/admin-users.test.tsx
npm test
npm run typecheck
npm run lint
npm run format:check
```

```bash
cd backend
npm run check
```

Exit gate:

- All old user-management behavior works against current authenticated APIs.
- No immediate destructive action remains.
- The pages use frontend components/tokens rather than copied admin styles.

Checkpoint: `admin-users`.

### Phase 5 — Recipe management and visual integration

Tasks:

- Implement the admin recipe list using a Flowbite table and responsive overflow.
- Preserve case-insensitive filtering by title.
- Implement read-only recipe detail using the normalized current DTO.
- Extract and reuse public recipe presentation primitives where practical.
- Render title, image, description, total time, categories, ingredients,
  structured steps and step images, valid video, and optional nutrition.
- Tolerate missing optional image/video/nutrition/step-image values.
- Do not show consumer-only like/save/share/report/edit/delete/price actions.
- Use the frontend's loading, empty, not-found, and retry patterns.
- Perform visual review at 360px, 768px, and 1280px widths.
- Verify keyboard navigation, focus visibility, labels, contrast, scrolling, and
  sidebar drawer/collapse behavior.

Tests:

- Recipe list load, empty state, and title filtering.
- Current `{ recipe, nutrition }` response normalization.
- Current camelCase fields and structured steps.
- Missing optional data and invalid/missing route IDs.
- 401, 403, 404, and server failures.
- Admin detail contains no consumer mutation controls.

Validation:

```bash
cd frontend
npm test -- src/test/admin-recipes.test.tsx
npm test
npm run typecheck
npm run lint
npm run format:check
frontend_build_tmp=$(mktemp -d)
./node_modules/.bin/vite build --outDir "$frontend_build_tmp" --emptyOutDir
```

Exit gate:

- All old recipe-management behavior works with current backend shapes.
- Admin recipe pages visually align with the public recipe experience.
- No legacy Tailwind class/config or admin-only asset was copied.

Checkpoint: `admin-recipes-ui`.

### Phase 6 — Full-stack acceptance with local `.env` files

Creating and modifying `frontend/.env` and `backend/.env` is explicitly
authorized for this phase.

#### 6.1 Protect existing environment files

From the repository root:

```bash
acceptance_backup_dir=$(mktemp -d)
chmod 700 "$acceptance_backup_dir"
test -f frontend/.env && cp frontend/.env "$acceptance_backup_dir/frontend.env"
test -f backend/.env && cp backend/.env "$acceptance_backup_dir/backend.env"
```

Record in the decision log whether each file existed. Never print existing
values. Do not use Git to restore a user-owned `.env`; restore it from this exact
backup.

Modify the files using the normal repository file-editing mechanism. Use this
isolated local configuration:

```dotenv
# backend/.env acceptance values
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/kitchencraft_admin_merge_acceptance
JWT_SECRET=acceptance-only-jwt-secret-never-use-in-production-2026
JWT_EXPIRES_IN_SECONDS=604800
BCRYPT_ROUNDS=12
CORS_ORIGINS=http://localhost:5173
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
TRUST_PROXY=false
MAX_UPLOAD_SIZE_MB=5
ADMIN_USERNAME=acceptance_admin
ADMIN_FULL_NAME=Acceptance Administrator
ADMIN_EMAIL=acceptance-admin@example.test
ADMIN_PASSWORD=Acceptance-Admin-Only-2026!
```

```dotenv
# frontend/.env acceptance value
VITE_BASE_URL=http://localhost:3000/api
```

Do not introduce or rely on `VITE_BASE_URL_DEV`.

Preserve any existing valid `FB_*` values when editing `backend/.env`; they are
needed for end-to-end image upload. If Firebase is not configured, do not invent
external credentials. Run all other full-stack cases, verify the documented
`STORAGE_NOT_CONFIGURED` response for upload attempts, and rely on automated
frontend/backend tests for the create/edit form behavior. Record this environment
limitation in the decision log.

#### 6.2 Start and seed the isolated stack

```bash
cd backend
docker compose up -d mongo
npm run seed:admin
npm run dev
```

In a second terminal:

```bash
cd frontend
npm run dev
```

Use disposable acceptance users. Create at least two users through the consumer
registration flow. If storage is configured, create a recipe under one user and
like/save/report it from the other so cascade deletion can be verified.

#### 6.3 Acceptance matrix

- Anonymous direct access to every `/admin` deep link.
- Normal user access to `/admin` and the session-replacement warning.
- Invalid and valid administrator login.
- Deep-link return after login.
- Refresh persistence via the HTTP-only cookie.
- Responsive sidebar navigation, active state, drawer, and collapse behavior.
- User list, mixed-case search, detail, edit, edit validation/conflict, delete
  cancellation, and confirmed cascade deletion.
- Recipe list, mixed-case search, detail, optional fields, and current-schema
  rendering.
- Expired/invalid session behavior.
- Administrator logout.
- Role-aware public navbar behavior.
- Representative consumer registration/login/logout, home, search, recipe
  detail, like/save/report, profile, recipe creation, and recipe editing.
- After deleting the disposable author, verify their recipes and associated
  records no longer appear.

Run automated gates again while the stack is configured:

```bash
cd backend
npm run check
```

```bash
cd frontend
npm test
npm run typecheck
npm run lint
```

#### 6.4 Restore local configuration

- Stop development processes gracefully.
- Run `docker compose stop mongo`; do not delete the Mongo volume or acceptance
  database without separate authorization.
- Restore `frontend/.env` and `backend/.env` byte-for-byte from the backup when
  they existed.
- Remove only an `.env` file created solely for acceptance when no original
  existed.
- Confirm `git diff -- frontend/.env` is empty and no credential-bearing file is
  newly tracked.
- Do not remove the temporary backup until restoration has been verified.

Exit gate:

- Every applicable acceptance case passes.
- Any storage-only limitation is explicitly recorded and covered by automated
  tests.
- Original environment files are restored exactly.

Checkpoint: `full-stack-accepted`.

### Phase 7 — Standalone admin retirement and final build

Tasks:

- Update root and frontend documentation with `/admin/login`, the single-session
  role behavior, admin seeding, validation commands, and backend-first deployment
  order.
- Remove the entire `admin` directory, including its app, lockfile, configs,
  services, mocks, and assets.
- Confirm no frontend import or documentation references the removed app.
- Perform the only normal frontend build of the migration, updating tracked
  `frontend/dist` deliberately.
- Review generated asset changes separately from source changes.

Validation:

```bash
cd backend
npm ci
npm run check
npm run build
npm audit --audit-level=high
```

```bash
cd frontend
npm ci
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
npm audit --audit-level=high
```

From the repository root:

```bash
test ! -d admin
rg -n "localhost:3000/api/admin|total_time|stepDescription|font-poppins|bg-Sidebar" frontend/src || true
git diff --check
git status --short
```

Review any `rg` matches; some `stepDescription` references may remain in the
consumer multipart compatibility layer, but migrated admin pages must not use
legacy response fields.

Exit gate:

- All final checks pass from clean installs.
- The full diff contains the merged functionality, documentation, intentional
  generated build changes, and deletion of `admin`, with no credential changes.

Checkpoint: `admin-retired`.

## 10. Rollback strategy

- Keep each phase in an atomic local commit with the checkpoint name above.
- Do not push or deploy partially passing phases.
- Backend changes are additive until retirement and can be reverted independently
  from frontend route/UI changes.
- Keep the standalone admin app intact through the full-stack checkpoint.
- Delete `admin` in its own final commit so it can be restored with one revert.
- There is no production data migration to roll back.
- Deploy backend first and frontend second. If frontend rollout fails, roll back
  only the frontend deployment; the additive backend endpoint may safely remain.
- Environment acceptance changes are rolled back from the permission-restricted
  temporary backup, not from Git.
- Never use `git reset --hard`, broad checkout commands, or volume deletion as a
  rollback shortcut.

## 11. Progress checklist

Update this checklist during implementation. A phase is complete only after its
exit gate passes.

### Preparation

- [x] Current branch/SHA and working tree rechecked.
- [x] Unrelated user changes identified and preserved.
- [x] Baseline frontend checks pass.
- [x] Baseline backend checks pass.
- [x] Legacy admin build behavior reconfirmed.

### Test and contract foundation

- [x] Vitest and React Testing Library configured.
- [x] Existing frontend render/session behavior covered.
- [x] Transitive frontend audit finding resolved without dependency downgrade.
- [x] Active-principal validation implemented.
- [x] `onlyUser` applied to consumer-only backend operations.
- [x] Protected admin user-update endpoint implemented and tested.
- [x] Shared session context is role-aware.
- [x] Typed admin DTOs/service implemented using the existing API client.
- [x] Phase 1 and Phase 2 gates pass.

### Routing and shell

- [x] Consumer, editor, login, and admin layouts are explicit nested routes.
- [x] Admin routes are lazy-loaded and protected.
- [x] Deep-link return works after login.
- [x] Admin login warns before replacing a user session.
- [x] Admin shell is responsive and accessible.
- [x] Public navbar/profile is role-aware.
- [x] Consumer-only UI actions reject/hide for admin sessions.
- [x] Phase 3 gate passes.

### User administration

- [x] User list and case-insensitive search work.
- [x] User detail and current-data loading work.
- [x] User edit works with validation/conflict feedback.
- [x] Cascade deletion requires confirmation.
- [x] Successful deletion updates list/detail navigation.
- [x] Loading, empty, not-found, authorization, and server errors are visible.
- [x] Phase 4 gate passes.

### Recipe administration

- [x] Recipe list and case-insensitive search work.
- [x] Current response shape is normalized in the service layer.
- [x] Recipe detail renders current fields and optional data.
- [x] Public recipe presentation is reused without consumer actions.
- [x] Responsive and accessibility review passes at required widths.
- [x] Phase 5 gate passes.

### Acceptance and retirement

- [x] Existing `.env` files backed up without exposing values.
- [x] Isolated acceptance environment configured and admin seeded.
- [x] Full admin acceptance matrix passes.
- [x] Representative consumer regression matrix passes.
- [x] Environment files restored exactly.
- [x] Phase 6 gate passes.
- [x] Documentation updated.
- [x] Standalone `admin` directory removed.
- [x] Final clean-install checks and audits pass.
- [x] Tracked `frontend/dist` rebuilt and reviewed intentionally.
- [x] Phase 7 gate passes.

## 12. Discoveries and decision log

Keep this section append-only during implementation. Record deviations before
changing the plan.

| Date       | Discovery or decision                                            | Evidence/reason                                       | Effect on execution                                                                   |
| ---------- | ---------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 2026-08-13 | `frontend` is authoritative for stack and design.                | Explicit migration requirement; frontend checks pass. | No frontend dependency downgrade or copied admin design system.                       |
| 2026-08-13 | Repository uses three independent npm projects.                  | No root manifest/workspace configuration found.       | Run validation from each project directory; do not create a workspace.                |
| 2026-08-13 | One active user/admin role was selected.                         | Backend already uses one `token` cookie.              | Extend the shared session context; do not add parallel cookies/providers.             |
| 2026-08-13 | Admin access is role-aware, not publicly advertised.             | Product decision.                                     | `/admin/login` is direct-link only until an admin session exists.                     |
| 2026-08-13 | Dedicated admin shell was selected.                              | Product decision.                                     | Hide consumer navbar/footer under `/admin`, but use frontend tokens/components.       |
| 2026-08-13 | Existing old-admin UI is the functional scope.                   | Product decision.                                     | Migrate user/recipe screens; exclude reports inbox and recipe deletion.               |
| 2026-08-13 | User edit must be restored rather than removed.                  | Old UI calls a route absent from current backend.     | Add protected `PUT /api/admin/user/:id`.                                              |
| 2026-08-13 | Legacy recipe detail uses obsolete fields.                       | Backend controller/model inspection.                  | Normalize current `{ recipe, nutrition }` DTO; do not carry legacy fields into pages. |
| 2026-08-13 | Frontend behavior tests will be added.                           | Product decision; no existing frontend test script.   | Add Vitest/RTL as dev-only dependencies.                                              |
| 2026-08-13 | Standalone admin is removed only after acceptance.               | Product decision and rollback requirement.            | Keep it as comparison source through Phase 6; delete in Phase 7.                      |
| 2026-08-13 | Local `.env` creation/modification is authorized for acceptance. | Explicit user authorization.                          | Back up and restore existing files; use isolated database/configuration.              |
| 2026-08-13 | Frontend has one transitive high audit finding.                  | `npm audit`; `nanoid@3.3.16` under PostCSS.           | Resolve through a compatible lockfile update in Phase 1.                              |
| 2026-08-13 | Phase 0 baseline rerun on `migrate/admin-into-frontend` at `1c6eba3`; worktree was clean. | `npm ci` plus all specified checks in each independent project. | Frontend typecheck/lint/format/temp build, backend check/temp build, and legacy-admin temp build passed. |
| 2026-08-13 | Phase 1 added Vitest 4 with React Testing Library in a dedicated `vitest.config.ts`. | The Flowbite Vite plugin keeps file handles open when loaded by Vitest. | Production Vite config remains unchanged; tests use React plugin, jsdom, jest-dom, and a minimal `matchMedia` shim. |
| 2026-08-13 | Phase 1 resolved the transitive high-severity audit finding to `nanoid@3.3.18`. | `npm audit --audit-level=high` reports no vulnerabilities after the compatible lockfile-only resolution. | No direct runtime dependency or frontend-stack downgrade was introduced. |
| 2026-08-13 | Phase 2 introduced `requireActivePrincipal` for session refresh plus role-specific `onlyUser`/`onlyAdmin` checks. | Supertest covers stale principals, cross-role access, and protected legacy admin endpoints without MongoDB. | Cookie JWT signatures alone no longer retain access after the referenced account is deleted. |
| 2026-08-13 | Phase 2 added `PUT /api/admin/user/:id` with the shared username, name, and email constraints. | Contract tests cover validation, unknown/empty updates, missing users, duplicate keys, normalization, and password exclusion. | Old user-edit behavior is restored against a safe current API contract. |
| 2026-08-13 | Phase 2 made the existing session provider role-aware and added a typed `adminService`. | Frontend tests cover anonymous/user/admin/error refresh states, role-aware logout, and no web-storage token. | Admin pages can use the shared API client with abortable reads and normalized recipe details. |
| 2026-08-13 | Phase 3 replaced pathname chrome checks with consumer/editor/admin nested layouts. | Route tests cover loading, role redirects, deep links, login failure, logout, and admin navigation state. | Navbar/footer logic has no admin pathname exception; `AdditionalInfoProvider` is limited to consumer layouts. |
| 2026-08-13 | Phase 3 shell uses existing Flowbite Sidebar/Drawer primitives with Iconify navigation. | Responsive controls have labels and `aria-expanded`; navigation uses `NavLink` URL state. | The shell shares the existing theme and frontend tokens while remaining independently navigable on mobile and desktop. |
| 2026-08-13 | Phase 4 implemented authenticated user management against `adminService`. | Focused RTL tests cover initial/empty/error loads, case-insensitive filtering, edit cancellation/payload, all documented error classes, and confirmed deletion. | List deletion is optimistic after API success; detail deletion returns to `/admin/users`. |
| 2026-08-13 | Phase 4 extracted `ConfirmDialog` from the consumer recipe card. | Both admin user deletion and existing consumer recipe deletion now call the same Flowbite confirmation component. | Destructive actions require confirmation while retaining the existing consumer delete endpoint and feedback. |
| 2026-08-13 | Phase 5 shares recipe display primitives instead of copying the consumer detail page. | `RecipePresentation` renders the current recipe DTO while consumer mutations remain in `Recipe.tsx`. | Admin detail stays read-only and supports structured steps plus optional media/nutrition without legacy aliases. |
| 2026-08-13 | Phase 5 visual and keyboard review passed at 360px, 768px, and 1280px. | Temporary Playwright checks exercised the responsive table, mobile drawer, active navigation, focus, and no-consumer-controls detail view. | Responsive overflow is retained for compact tables; the admin shell follows frontend tokens and Flowbite patterns. |
| 2026-08-13 | Phase 6 acceptance backed up an existing `frontend/.env`; no original `backend/.env` existed. | The protected temporary backup was compared byte-for-byte after graceful service shutdown; the acceptance-only backend file was removed. | No existing environment value was exposed or retained, and no credential-bearing file became tracked. |
| 2026-08-13 | Isolated Mongo acceptance passed the protected API, cascade, session, and consumer flows. | Disposable users created a recipe, another user liked/saved/reported it, and administrator deletion left recipes, nutrition, likes, saves, and reports all at zero; anonymous/user/invalid-token admin requests returned 401/403/401. | The current backend contract and cascade behavior are accepted before standalone-admin retirement. |
| 2026-08-13 | Firebase storage was not configured in the local acceptance environment. | A real multipart upload returned the documented `503 STORAGE_NOT_CONFIGURED` response; no external credentials were invented. | Upload-only create/edit coverage relies on the automated frontend/backend tests; all non-storage full-stack cases passed. |
| 2026-08-13 | Browser acceptance used temporary Playwright tooling outside repository dependencies. | Direct admin deep links, login return, refresh/logout, drawer/search/detail, keyboard focus, and representative consumer login/search/save/report/profile/editor flows passed in Chromium. | The repository dependency graph remains unchanged; local browser checks used `localhost:5173`, matching the configured CORS origin. |
| 2026-08-13 | Phase 7 removed the standalone `admin` source only after the accepted checkpoint. | `test ! -d admin` passes; root/frontend documentation now describes `/admin/login`, seeding, one active role, validation, and backend-first deployment. | The frontend is the sole browser application and the retirement remains isolated in its own final commit. |
| 2026-08-13 | Final clean installs, checks, audits, and tracked distribution rebuild passed. | Backend check/build/audit and frontend test/typecheck/lint/format/build/audit all passed; the new distribution includes lazy admin chunks. | The generated `frontend/dist` update is intentional; remaining `stepDescription` hits are consumer multipart compatibility only. |
| 2026-08-14 | Shared-cookie session changes use an opaque cross-tab event. | Focused replacement and recovery tests pass.         | UserContext revalidates canonically and resets changed principals only.               |
| YYYY-MM-DD | _Add new discovery/decision_                                     | _Evidence_                                            | _Plan effect_                                                                         |

## 13. Completion criteria

The migration is complete only when all of the following are true:

- Admin functionality runs inside `frontend` at `/admin` and supports refresh
  and direct deep links.
- Administrator login/logout, session refresh, route guards, and backend role
  enforcement work correctly.
- Anonymous users and normal users cannot read or mutate protected admin data.
- Administrator sessions cannot perform consumer-owned mutations.
- User list/search/detail/edit/delete behavior is preserved, with safe confirmed
  cascade deletion.
- Recipe list/search/detail behavior is preserved against the current backend
  response shape.
- Migrated code is strict TypeScript on React 19 and React Router 7.
- Styling uses Tailwind CSS v4, the existing Flowbite React setup, and the
  frontend's existing tokens and responsive conventions.
- Admin pages visually belong to the frontend: same Outfit typography, palette,
  spacing, widths, controls, tables, cards, modals, borders, shadows, and feedback.
- No React 18, Router 6, Flowbite 0.9, Axios, legacy Tailwind/PostCSS config,
  duplicate API client/provider/theme, admin-only design system, or unnecessary
  legacy asset remains.
- Existing consumer home, search, auth, registration, profile, recipe view,
  create/edit, like/save/report, navigation, and responsive behavior do not
  regress.
- Frontend tests, typecheck, lint, format check, production build, and
  high-severity audit gate pass from a clean install.
- Backend tests, typecheck, build, and high-severity audit gate pass from a clean
  install.
- Full-stack acceptance passes against the isolated local database, with any
  unavailable external image-storage limitation explicitly recorded and covered
  by automated tests.
- Acceptance `.env` changes are restored or removed without exposing or
  committing credentials.
- `frontend/dist` is rebuilt only at the final checkpoint and its tracked changes
  are intentionally reviewed.
- The standalone `admin` directory is removed only after all acceptance gates
  pass.
