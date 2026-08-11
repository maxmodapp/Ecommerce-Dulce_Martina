# Dulce Martina - Repository Instructions

## Project overview

Dulce Martina is a Spanish-language e-commerce application built with Next.js 16,
React 19, TypeScript, Prisma 7, PostgreSQL, Tailwind CSS, and Cloudinary.

The main domains are:

- Public catalog: categories, subcategories, products, variants, sizes, images, and stock.
- Shopping flow: persistent cart, delivery selection, checkout, and order tracking.
- Accounts: registration, login, profile, sessions, and customer orders.
- Administration: catalog, homepage content, inventory, images, and order status management.

## Repository map

- `app/`: App Router pages and HTTP route handlers.
- `components/`: React UI and feature components.
- `components/ui/`: shared UI primitives; avoid broad rewrites here.
- `lib/`: domain logic, authentication, adapters, Prisma access, and shared types.
- `prisma/schema.prisma`: source of truth for the database model.
- `prisma/migrations/`: immutable migration history.
- `public/`: static assets and fallback product imagery.

## Working rules

- Read the relevant page, API route, domain helper, Prisma model, and shared types before changing a feature.
- Keep changes focused. Preserve unrelated user changes and do not perform opportunistic rewrites.
- Prefer existing adapters and domain helpers over duplicating database-to-UI mapping logic.
- Keep server-only code out of client bundles. Do not import Prisma, secrets, or server authentication helpers into `"use client"` modules.
- Maintain strict TypeScript types. Avoid introducing `any`; validate untrusted request data before use.
- Follow the existing Spanish customer-facing language and vocabulary.
- Save source files as UTF-8 and do not introduce corrupted or double-encoded text.
- Use integer monetary values consistently. Never calculate authoritative prices from client-provided values.
- Do not hardcode business configuration in multiple places. Centralize phone numbers, shipping prices, thresholds, addresses, and similar settings.

## Security and privacy invariants

- The server is authoritative for product prices, shipping cost, discounts, totals, active state, and stock.
- Any inventory decrement and order creation must remain atomic in a database transaction.
- Never expose customer names, email addresses, phone numbers, addresses, or order details from debug or unauthenticated endpoints.
- Do not authorize access using a sequential order ID alone. Account orders must belong to the current user; guest tracking must use a non-guessable public token plus any required verification.
- Every `/api/admin/**` mutation and read must call `requireAdminApiUser()` before accessing protected data.
- Every admin page must call `requireAdminPageUser()` before rendering protected data.
- Authentication cookies must remain `httpOnly`, `sameSite`, scoped to `/`, and `secure` in production.
- Never log passwords, hashes, session cookies, secrets, Cloudinary credentials, or full customer payloads.
- Do not commit `.env` files or real credentials. Update `.env.example` only with safe placeholders.
- Treat login, registration, order lookup, and order creation as rate-limit candidates.

## Database and Prisma

- Update `prisma/schema.prisma` and add a new migration for database changes.
- Never edit an existing applied migration unless the user explicitly requests repair of unreleased migration history.
- Prefer database constraints and Prisma enums for closed sets of values such as roles, order states, delivery methods, and payment methods.
- Preserve referential integrity and explicitly consider `onDelete` behavior for every new relation.
- Serialize Prisma `BigInt` values to strings before returning JSON.
- Consider existing rows and deployment order when adding required columns.

## API conventions

- Parse malformed JSON as a `400` response.
- Validate and normalize all request fields at the boundary, preferably with Zod or an existing shared validator.
- Use `401` for missing authentication, `403` for insufficient permissions, `404` when hiding resource existence, and `409` for stock or uniqueness conflicts.
- Return stable error codes alongside human-readable Spanish messages when clients need to branch on failures.
- Do not return raw internal exception messages in production responses.

## UI and accessibility

- Preserve responsive behavior for mobile and desktop.
- Use existing UI primitives and visual tokens before adding new patterns.
- Keep form labels associated with inputs and retain keyboard navigation and visible focus states.
- Use `next/image` for storefront images unless there is a concrete reason not to.
- Provide useful alt text for meaningful product imagery.
- Keep loading, empty, error, and out-of-stock states explicit.

## Verification

Install dependencies before validation when `node_modules` is absent:

```bash
npm install
```

For normal changes, run the checks relevant to the touched area:

```bash
npx prisma validate
npx tsc --noEmit --incremental false
npm run lint
npm run build
```

On Windows PowerShell, use `npm.cmd` and `npx.cmd` if script execution policy blocks
the `.ps1` shims.

For database changes, also generate the client and inspect migration SQL:

```bash
npx prisma generate
npx prisma migrate dev --name <descriptive_name>
```

Do not claim a check passed unless it was actually run. If dependencies, database
connectivity, credentials, or network access prevent a check, state that limitation.

## Testing priorities

When adding tests, prioritize these business-critical behaviors:

1. Server-side order totals, including shipping.
2. Concurrent stock decrement and insufficient-stock rollback.
3. Guest and authenticated order authorization.
4. Admin authorization for every protected endpoint.
5. Checkout delivery/payment combinations.
6. Login, registration, and session expiration.

## Optional development tools

- Rust Token Killer (RTK) may be used to reduce noisy terminal output when it is already installed and verified as `rtk-ai/rtk` (`rtk gain` must work).
- RTK is an output optimization, not a project dependency; do not require it in application scripts or CI.
- When compressed output hides an actionable error, rerun the original command without RTK and inspect the complete output.
- Graph-based repository tools are optional. Generated indexes must not replace verification against current source code.

## Completion checklist

Before handing off an implementation:

- Confirm the requested behavior is implemented end to end.
- Review authorization, personal-data exposure, stock, and monetary calculations.
- Run the proportionate validation commands and report their results.
- Mention migrations, new environment variables, or manual deployment steps.
- Summarize only files changed for the requested task; do not include unrelated worktree changes.
