# BacktestAI

Production-oriented SaaS starter for US retail traders: phone verification (Twilio Verify), Supabase Auth + Postgres, Stripe subscriptions with a 3-day card-required trial, Anthropic Claude commentary, and Next.js 14 (App Router) on Vercel.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill every variable.

3. In Supabase, run the SQL in `supabase/migrations/001_init.sql` (SQL editor or CLI).

4. Configure Supabase Auth redirect URLs to include:

- `http://localhost:3000/auth/callback`
- `https://<your-vercel-domain>/auth/callback`

5. Stripe setup:

- Create a recurring price billed **every 15 days** for **$10** (Billing period: custom, 15 days).
- Copy the price id into `STRIPE_PRICE_ID`.
- Add webhook endpoint `https://<your-domain>/api/webhooks/stripe` listening to `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.
- Enable the Stripe Customer Billing Portal and allow subscription cancellation/update.

6. Twilio: create a **Verify** service, copy `TWILIO_VERIFY_SERVICE_SID`, and keep SMS geo permissions appropriate for US traffic.

7. Run the dev server:

```bash
npm run dev
```

## Deploying to Vercel

- Link the GitHub repo (or deploy with the Vercel CLI), add the same environment variables, and set `NEXT_PUBLIC_APP_URL` to the production origin (no trailing path).
- After the first deploy, point the Stripe webhook to the production URL.
- Ensure the Supabase Auth site URL matches production.

## Product notes

- Signup step three uses **Stripe Checkout** to collect a card before the trial begins (`payment_method_collection: always`).
- New accounts are created after checkout in `src/app/auth/stripe-return/route.ts`, then the user is signed in with a one-time password flow (no magic-link email required for the happy path).
- Returning users who already have a row but need a fresh session still use the Supabase magic link path + `/auth/callback`.
- Historical data is pulled with `yahoo-finance2` when Yahoo responds; otherwise the engine falls back to a deterministic synthetic series so the UX remains functional in constrained environments.

## Security

- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TWILIO_AUTH_TOKEN`, or `ANTHROPIC_API_KEY` to the client.
- `SIGNUP_SESSION_SECRET` should be a long random string and rotated if leaked.
