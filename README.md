# Early Adopters (Next.js + Supabase)

Initial step completed:
- main page `/` built from provided React example
- auth page `/auth` with magic-link login
- magic-link access flow from `/` (also via Supabase)

## Run locally

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill values:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Start dev server:
```bash
npm run dev
```

## Auth flow

- On `/` user enters email and gets magic link (`shouldCreateUser: true`)
- On `/auth` user logs in via magic link (`shouldCreateUser: false`)
- Redirect after clicking magic link goes to `/auth`
