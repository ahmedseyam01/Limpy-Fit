# LIMBY FIT

Coach admin platform for building weekly diet & workout plans, plus a trainee portal
to view the plan and log weight. React 18 + TypeScript + Vite + Tailwind.

## Scripts

```bash
npm run dev        # dev server on http://localhost:3000
npm run build      # type-check + production build
npm run typecheck  # type-check only
```

## Project structure

```
api/sync.ts                 Vercel function: shared cloud store used to sync all devices
src/
  App.tsx                   Auth gate → login / trainee portal / coach admin
  hooks/
    useAuth.ts              Role + logged-in trainee (persisted)
    useAppData.ts           Trainees, plans, coach profile: localStorage + cloud sync
  lib/
    cloudSync.ts            Debounced, serialized uploads + polling for remote changes
    firebase.ts             Optional Firestore sync (SDK loaded lazily only when configured)
    storage.ts              Safe localStorage helpers
  features/
    auth/                   Login screen
    trainees/               Trainees list, trainee card, add-trainee modal
    plan-builder/           7-day meals & exercises editor
    portal/                 Trainee portal
    pdf/                    Printable plan (lazy-loaded)
    settings/               Coach profile & Firebase settings (lazy-loaded)
  components/
    layout/                 Navbar, Footer, Logo
    ui/                     Shared UI (confirm dialog)
  constants/                Storage keys, week days, goal labels
  utils/                    Nutrition calculator, plan & trainee helpers
  types/                    Domain types
  data/                     Default coach profile
```

## Sync model

Every local change is saved to `localStorage` immediately and uploaded to `/api/sync`
after a short debounce (only the latest state is sent). Other devices poll every few
seconds while visible and on focus. Remote data is never applied while local edits are
still pending upload, and deleted trainee IDs are tracked so stale devices can't bring
them back.
