# Supabase Setup — American Nails & Spa

## One-time setup (takes ~5 minutes)

### 1. Create free Supabase project
1. Go to https://supabase.com → Sign in → New Project
2. Name: `american-nails-spa`
3. Database Password: generate a strong one (save it)
4. Region: `US East (N. Virginia)` — closest to Stephens City, VA
5. Wait ~2 minutes for provisioning

### 2. Run migrations in order
Go to **Project → SQL Editor → New Query**, paste each file and click **Run**:

1. `supabase/migrations/001_schema.sql` — all 20 tables
2. `supabase/migrations/002_rls.sql`    — Row Level Security policies
3. `supabase/migrations/003_seed.sql`   — demo data

### 3. Copy credentials
Go to **Project Settings → API**:

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ keep secret, never expose client-side

Paste into `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 4. Create demo accounts
In Supabase → **Authentication → Users → Add User**:

| Email | Password | Role (metadata) |
|---|---|---|
| `owner@demo.ans` | `OwnerDemo2024!` | `owner` |
| `customer1@demo.ans` | `Customer2024!` | `customer` |
| `customer2@demo.ans` | `Customer2024!` | `customer` |

After creating, run this SQL to set the role on the owner:
```sql
update profiles set role = 'owner' where email = 'owner@demo.ans';
```

### 5. Keep-alive cron (prevents dormancy on free tier)
Vercel will ping `/api/ping` every 3 days automatically once `vercel.json` is deployed.
To test locally: `GET http://localhost:3000/api/ping` should return `{ ok: true }`.

## Production checklist (before going live)
- [ ] Replace `manuj.automation.ssn@gmail.com` with owner's real email in DB and `.env`
- [ ] Change demo account passwords
- [ ] Set `demo_mode = false` in settings table
- [ ] Set `NEXT_PUBLIC_DEMO_MODE=false` in Vercel env vars
- [ ] Enable real email (Resend), SMS (Twilio), payments (Stripe)
- [ ] Set `robots: { index: true }` in locale layout metadata
