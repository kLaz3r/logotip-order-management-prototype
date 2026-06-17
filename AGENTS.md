<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Stack

- Next.js 16 (App Router, `src/` directory)
- Prisma + better-sqlite3 adapter (SQLite, file-based: `dev.db`)
- Tailwind CSS v4 with `@tailwindcss/postcss`
- Custom auth (HMAC-signed cookie), NOT next-auth

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # eslint

# Database (not in package.json scripts)
npx prisma generate                # regenerate client to src/generated/prisma/
npx prisma db push                 # push schema to dev.db
npx prisma migrate dev             # create/apply migrations
npx tsx prisma/seed.ts            # seed DB with admin user + products
```

## Architecture

### Proxy (middleware)

Next.js 16 renamed Middleware to **Proxy**. The file is `proxy.ts` at the project root (NOT `middleware.ts`). It protects `/dashboard`, `/orders`, `/customers`, `/pricing`, `/users` and redirects to `/login` if no session cookie.

### Auth

Custom session auth in `src/lib/auth.ts`. Uses `logotip_session` HTTP-only cookie signed with HMAC-SHA256. `getSession()` / `getCurrentUser()` are server-only (import from `next/headers`). All API routes check `getSession()` before proceeding.

Seed accounts: `admin@logotip.md` / `admin123`, `angajat@logotip.md` / `angajat123`.

`next-auth` is a dead dependency — not used anywhere.

### Database

Prisma schema at `prisma/schema.prisma`, client generated to `src/generated/prisma/`. The generated client path is `.gitignore`'d. Database adapter requires `new PrismaBetterSqlite3(...)` — see `src/lib/db.ts`.

### File uploads

Files are stored locally in `uploads/<orderId>/` with UUID filenames. Served via `/api/files/serve/[...path]` (auth-protected). No cloud storage.

### UI

Custom components in `src/components/ui/` — **not** shadcn/ui (that dependency is unused). Formatting uses `ro-RO` locale (Romanian). Kanban board uses `@dnd-kit`.

### Key conventions

- `@/` path alias maps to `./src/*`
- Server components by default; add `"use client"` for interactivity
- `AppLayout` wrapper in `src/components/layout/app-layout.tsx` — include in all authenticated pages
- `.env` contains `DATABASE_URL` and `AUTH_SECRET` (committed — dev only)
- No test framework, no CI configured
