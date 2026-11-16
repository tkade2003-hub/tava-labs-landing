# Tava Labs Quiz Funnel

A quiz-style lead funnel for the Glow Brightening Serum. An ad click lands on
`quiz.html`, the visitor answers one question per screen, sees two short
interstitials ("You're not alone" and "Your formula match"), gets a personal
30-day plan, checks out, and is handed off to the app — with everything they
entered carried over.

Files:

- `quiz.html` — the funnel page (this repo, root). Self-contained: inline
  CSS/JS, no build step. Sits alongside the main landing page (`index.html`).
- `backend/funnel-intake.ts` — the Supabase edge function that receives a
  completed funnel submission. It is a draft that deploys into the **serum
  app's** Supabase project (repo `tkade2003-hub/tava-labs-serum`), not this
  repo — see deploy steps below.

## The flow

13 screens, one decision per screen, honest progress bar, back navigation:

1. **Hook** — "One serum. Twice a day. 30 days." + Start.
2. **Q1 Goal** — radiance / fine lines / hydration / even tone.
3. **"You're not alone"** — mirrors the chosen goal. Copy uses only verified
   facts from the real Supliful listing (PDRN, acetyl hexapeptide-8,
   hyaluronic acid, glycerin, panthenol; twice-daily use; 1 fl oz / 30 ml).
   No statistics, review counts, or testimonials are claimed anywhere in the
   funnel.
4. **Q2 Skin type** — dry / oily / combination / sensitive / not sure.
5. **Q3 Main concern** — dullness / fine lines / uneven tone / texture /
   dryness.
6. **"Your formula match"** — shows which verified ingredients speak to the
   visitor's answers, in the listing's cosmetic language only ("appearance
   of", "looking"). No medical or efficacy claims.
7. **Q4 Sensitivity** — often / sometimes / never reacts. This answer
   visibly changes the plan: `often` → gentle ramp, `sometimes` → standard
   ramp, `never` → full twice-daily from day 1.
8. **Q5 Current routine** — just cleanser / a few products / full routine;
   the plan states exactly where the serum slots in.
9. **Q6 Routine times** — AM and PM preset chips or a custom time picker.
10. **Email capture** — "Where should we send your 30-day plan?" with a
    plain note that the same email is how the app will know them.
11. **Plan reveal** — the generated 30-day plan: goal, skin profile, ramp
    schedule, AM/PM times, routine fit.
12. **Offer + checkout** — Subscribe $39 vs one-time $49 (the app's existing
    prices), quantity fixed at 1, then the shipping form.
13. **Thank-you** — order summary, app download section, and the carry-over
    line (below).

## Payload contract

The page assembles exactly this JSON (in both demo and live mode):

```json
{
  "email": "visitor@example.com",
  "source": "quiz-funnel",
  "answers": {
    "goal": "radiance | fine_lines | hydration | even_tone",
    "skinType": "dry | oily | combination | sensitive | not_sure",
    "concern": "dullness | fine_lines | uneven_tone | texture | dryness",
    "sensitivity": "often | sometimes | never",
    "routine": "cleanser_only | few_products | full_routine",
    "amTime": "07:30",
    "pmTime": "22:00"
  },
  "plan": { "rampSchedule": "gentle | standard | full", "summary": "…" },
  "order": {
    "productId": "cbbc7de1-994e-45be-94d8-ac4be3b8cc18",
    "sku": "VASHO-PBS-8FB6",
    "quantity": 1,
    "purchaseType": "subscribe | one_time",
    "price": 39
  },
  "shippingAddress": {
    "firstName": "…", "lastName": "…", "address1": "…", "address2": "",
    "city": "…", "stateCode": "CA", "zip": "…", "countryCode": "US",
    "phone": ""
  }
}
```

The shipping fields are exactly the fields Supliful's create-order endpoint
requires (`firstName`, `lastName`, `address1`, `city`, `zip`, `countryCode`,
plus optional `address2`, `stateCode`, `phone`), so the intake function can
forward them to Supliful unchanged.

## Demo mode vs live mode

`quiz.html` has one config constant at the top of its script:

```js
const FUNNEL_INTAKE_URL = "";
```

- **Empty (demo mode, current state):** the page never pretends to charge.
  A visible "Demo checkout — no charge" banner shows on the checkout and
  thank-you screens. On purchase click it validates the form, assembles the
  full payload, logs it to the browser console, saves it to `localStorage`
  under `tava_funnel_payload`, and shows the thank-you screen.
- **Set (live mode):** the page POSTs the payload to that URL and only
  shows the thank-you screen on a 2xx response; otherwise it shows a plain
  error and keeps the visitor's details in place for a retry.

`FUNNEL_INTAKE_URL` must point to the deployed `funnel-intake` edge
function in the serum app's Supabase project:

```
https://<serum-project-ref>.supabase.co/functions/v1/funnel-intake
```

One addition is required when going live: `funnel-intake` expects a shared
secret header (`x-funnel-secret`), because the endpoint is public and
anonymous. Add that header to the `fetch` call in `quiz.html` at the same
time as setting the URL, and set the matching `FUNNEL_INTAKE_SECRET` env var
on the function (deploy steps below).

## Deploying funnel-intake

Target: the serum app's Supabase project (repo
`tkade2003-hub/tava-labs-serum`). Do not deploy it from this repo.

1. **Run this migration first** (adds the two columns the function writes
   and a case-insensitive email index). Save as the next migration in
   `supabase/migrations/` in the serum repo:

   ```sql
   -- Quiz funnel data on the customer record.
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS quiz_answers jsonb;
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan jsonb;
   CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_idx
     ON profiles (lower(email)) WHERE email IS NOT NULL;
   ```

2. **Copy the function** into the serum repo at
   `supabase/functions/funnel-intake/index.ts`. Its imports
   (`../_shared/auth.ts`, `../_shared/messaging.ts`) resolve against that
   repo's existing shared modules.

3. **Set the function secrets:**

   - `FUNNEL_INTAKE_SECRET` — a long random string; the same value goes
     into the `x-funnel-secret` header in `quiz.html`.
   - `SUPLIFUL_API_KEY` — the Supliful store API key (only read by the
     placement step; see the payment gate below).

4. **Deploy:** `supabase functions deploy funnel-intake` (deploy with JWT
   verification off — the function authenticates via the shared secret, the
   same pattern family as `messaging-cron`'s cron key).

5. **Point the page at it:** set `FUNNEL_INTAKE_URL` in `quiz.html` to the
   deployed function URL, add the `x-funnel-secret` header to its fetch,
   and push `quiz.html`.

## How data carry-over works

Email is the identity bridge between the funnel and the app:

- On submission, `funnel-intake` looks up `profiles` by email. If the
  person already has the app, their existing profile is updated. If not, it
  creates a **lead profile** with id `lead:<uuid>` and that email, so the
  data exists before they ever install the app.
- Quiz answers land in `profiles.quiz_answers`, the plan in
  `profiles.plan`, the AM/PM times in the existing `profiles.morning_time` /
  `profiles.night_time` columns (so the app's reminder machinery uses them
  as-is), the shipping address in `customer_details`, and the purchase as a
  normal `orders` row (`status 0`, `is_subscription` from the purchase
  type, `total` recomputed server-side — the client-sent price is only
  checked, never trusted).
- When the buyer later installs the app and signs in (Apple/Google via
  Rork), the app account carries the same email. The remaining app-side
  step — still to build with the serum integration work — is a one-time
  merge on first sign-in: find the `lead:` profile with the same email,
  re-key its `orders` and `customer_details` rows to the real profile id,
  copy `quiz_answers` / `plan` / routine times across, and delete the lead
  profile. Until that merge ships, the data is safe and queryable by email;
  nothing the buyer entered is lost.
- The thank-you screen tells the buyer exactly this: sign in with the same
  email and their answers, plan, and order are already there.

## Supliful placement and the payment gate

`funnel-intake` is the single server-side point that will place the
Supliful order (POST `https://public-api.supliful.com/v1/orders`, product
`cbbc7de1-994e-45be-94d8-ac4be3b8cc18` / SKU `VASHO-PBS-8FB6`, with our
`orders.id` as the `externalOrderId` so retries can never double-ship).

It is deliberately **not** live yet. Payment architecture (decided
2026-11-16): Stripe for the funnel/landing checkout, Apple Pay in the app
with Stripe behind it. Until the Stripe confirmation exists for an order,
`placeSuplifulOrder()` returns `awaiting_payment_integration` at a clearly
marked `TODO(payment)` gate — an unpaid funnel submission must never become
a real shipment, and nothing in the funnel or the intake fakes a charge.
Wiring the gate means: record the confirmed Stripe payment on the order
row (via the Stripe webhook), then let the gate read it.

Note the account requirement from the Supliful connector doc: live API
order placement needs a Pro or Enterprise Supliful membership (test-mode
orders already succeed; the first live order will confirm entitlement).
Set `SUPLIFUL_TEST_MODE=true` in the function env to rehearse placement
end-to-end without charging or shipping anything.

## Placeholders still to replace

- **App Store link** — the thank-you screen's "Download on the App Store"
  button is `href="#"`, marked with a `PLACEHOLDER` comment in `quiz.html`.
  Swap in the real App Store URL once the app is listed.
- **FUNNEL_INTAKE_URL + secret header** — see live-mode steps above.
- **Payment gate** — see above.
