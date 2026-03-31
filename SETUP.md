# PayMo MVP – Setup & Deployment Guide

**Stack:** React + Vite · Tailwind CSS · Supabase · Vercel
**Monthly cost:** $0 (all free tiers)

---

## Step 1: Set Up Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New project"** — name it `paymo`, choose a strong password, pick the **US East** region
3. Once the project is ready, open the **SQL Editor** (left sidebar)
4. Paste the entire contents of `supabase/schema.sql` and click **Run**
5. Go to **Project Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **Anon / Public key**

---

## Step 2: Configure Environment Variables

In the `paymo-app/` folder, copy the example env file:

```bash
cp .env.example .env
```

Then open `.env` and fill in your values:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 3: Run Locally

```bash
cd paymo-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the landing page will load.
Sign up at [http://localhost:3000/signup](http://localhost:3000/signup) to test the app.

---

## Step 4: Deploy to Vercel (Free)

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Add New Project"** and import your repo
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` → your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
5. Click **Deploy** — done! You'll get a free `.vercel.app` URL

---

## Features Included

| Screen | Description |
|---|---|
| Landing Page | Hero, features, how it works, waitlist signup |
| Sign Up / Login | Supabase Auth with email + password |
| Dashboard | Wallet balance (hide/show), quick actions, transaction history |
| Send Money | Search users by name/phone, numpad, confirm screen |
| QR Pay | Generate personal QR code · Scan QR to pay |
| Bill Payments | TSTT, Digicel, FLOW, WASA, T&TEC, NHDC |

---

## Pilot Checklist

- [ ] Deploy to Vercel
- [ ] Share the URL with 5–20 pilot users
- [ ] Monitor waitlist signups in Supabase → Table Editor → `waitlist`
- [ ] Review transactions in Table Editor → `transactions`
- [ ] Each new user starts with **$1,000 TTD demo balance**

---

## Cost Breakdown (Free Tier Limits)

| Service | Free Limit | PayMo Usage |
|---|---|---|
| Supabase DB | 500 MB | ~1 MB per 10K transactions |
| Supabase Auth | 50,000 monthly active users | Pilot: <100 users |
| Vercel Hosting | 100 GB bandwidth | Pilot: <1 GB |
| **Total** | | **$0/month** |

Upgrade to Supabase Pro ($25/mo) only when you hit 50K+ MAU.

---

## Next Steps After Pilot

1. Integrate **real payment rails** (First Citizens, RBC T&T, or Stripe)
2. Add **KYC/identity verification** (required for AML compliance)
3. Implement **PCI DSS** controls for card data
4. Build **native iOS/Android apps** using React Native (code reuse ~70%)
5. Launch **PayMo for Business** — merchant dashboard, payroll, invoicing

---

*PayMo – Powering cashless payments in the Caribbean*
