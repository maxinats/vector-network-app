# Early Adopters (Next.js + Supabase)

Current flow:
- `/` - landing + magic link access request
- `/auth` - magic link login and auto-redirect by profile status
- `/onboarding` - profile form for new users
- `/pending` - application review state (`pending` or `rejected`)
- `/members` - approved members-only page

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

3. Create Supabase table/policies:
   - open SQL editor in Supabase
   - run [supabase/member_profiles.sql](./supabase/member_profiles.sql)

4. Start dev server:
```bash
npm run dev
```

## Approval logic

- User without profile -> redirected to `/onboarding`
- After profile submit -> status is `pending`, redirect to `/pending`
- Admin can set `review_status` in Supabase (`approved` / `rejected`)
- `approved` users get access to `/members`
- Non-approved users cannot access members list
