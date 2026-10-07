# Admin Dashboard (`apps/web`)

Admin CMS for SANTMAT SATSANG PARCHAR, served at
`https://santmatsatsangparchar.in/admin`.

## Commands

```bash
npm install
npm run dev     # dev server on http://localhost:3000/admin/
npm run lint    # tsc --noEmit
npm run test    # vitest
npm run build   # production bundle (base: /admin/)
```

## Architecture

- React 19 + TypeScript + Vite + Tailwind v4.
- Firebase (Auth, Firestore, Storage, Functions) backend.
- Canonical domain config: `src/config/siteConfig.ts` → `shared/siteConfig.ts`.
- The admin bundle is assembled into `dist/admin/` by `npm run build:hosting`
  (repo root) together with the public website (`apps/website`).
