# Public Website (`apps/website`)

Official public business landing and legal website for SANTMAT SATSANG PARCHAR, served at
`https://santmatsatsangparchar.in/`.

---

## Commands

```bash
npm install
npm run dev     # dev server on http://localhost:3001/
npm run lint    # tsc --noEmit
npm run test    # vitest
npm run build   # production bundle (base: /)
```

---

## Architecture

- React 19 + TypeScript + Vite + Tailwind v4.
- Static content and public information pages (Home, About, Services, Mobile App, Contact, Privacy Policy, Terms, Account Deletion).
- Central configuration source: `shared/siteConfig.ts` (business registration, GSTIN, Udyam, contact data).
- The public website bundle is assembled into `dist/` by `npm run build:hosting` (repo root) together with the admin dashboard (`apps/web` into `dist/admin/`).
