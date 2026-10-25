# LIMBY FIT

Coach admin platform for building weekly diet & workout plans, plus a trainee portal
to view the plan and log weight. React 18 + TypeScript + Vite + Tailwind.

## Setup (required before deploying)

The API needs these environment variables. They are kept in the git-ignored `.env.local`
(see `.env.example`), which `npm run dev` reads automatically. To copy them to Vercel:

```bash
npx vercel login
npm run setup:vercel
```

Then redeploy. Variables already set on Vercel are never overwritten.

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | Long random string. Signs login tokens and encrypts stored data. **Never change it after going live.** |
| `COACH_PASSWORD` | The coach (admin) password. |
| `COACH_EMAIL` | Optional, defaults to `coachahmed123@limbyfit.com`. |
| `SYNC_STORE_URL` | Optional restful-api.dev object URL. Locally, empty = temporary in-memory store. |

## Scripts

```bash
npm run dev        # dev server on http://localhost:3000
npm run build      # type-check + production build
npm run typecheck  # type-check only
```

## Project structure

```
api/
  auth.ts                   POST login → signed token (coach or trainee), verified on the server
  sync.ts                   GET/POST data (requires token; trainees only see/edit their own data)
  _lib/                     Token signing, encrypted store, HTTP helpers
shared/sync.ts              Merge rules used by both browser and server
src/
  App.tsx                   Auth gate → login / trainee portal / coach admin
  hooks/
    useAuth.ts              Server login, session token, per-account local cache
    useAppData.ts           Trainees, plans, coach profile: localStorage + cloud sync
  lib/
    api.ts                  HTTP client for /api
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

- Data lives on the server (encrypted at rest). Any device that logs in with the coach account
  gets the same trainees; a new device shows a loading state, then the full list.
- Data is merged **per trainee / per plan by last-edit time**, never replaced as a whole list,
  so a device with an old or empty cache can't wipe what others saved. Deletions travel as
  tombstones, so a stale device can't bring a deleted trainee back.
- Edits are cached in `localStorage` and uploaded after a short debounce; failed uploads retry,
  and edits made offline are uploaded when the connection returns.
- Logging out removes that account's cached data from the device (after uploading pending edits).
