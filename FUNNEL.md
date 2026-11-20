# Tava Labs Quiz Funnel

A quiz-style lead funnel for the PDRN Brightening Serum. An ad click lands on
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
    prices), quantity fixed at 1, then the shipping form. On submit the page
    POSTs the payload to `funnel-intake`, which creates the order and a
    Stripe Checkout Session server-side and returns its URL; the page
    redirects the buyer to Stripe-hosted checkout.
13. **Stripe return pages** — after payment Stripe sends the buyer to
    `checkout/success.html` (order confirmed + get-the-app handoff); if they
    back out, `checkout/cancel.html` (nothing was charged, plan and answers
    are saved, link back here). The in-page thank-you screen remains only as
    a fallback for an intake response without a checkout URL.

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

- **Empty (demo mode):** the page never pretends to charge.
  A visible "Demo checkout — no charge" banner shows on the checkout and
  thank-you screens. On purchase click it validates the form, assembles the
  full payload, logs it to the browser console, saves it to `localStorage`
  under `tava_funnel_payload`, and shows the thank-you screen.
- **Set (live mode — CURRENT state since 2026-11-17):** the page POSTs the
  payload to that URL; on a 2xx response it reads `checkoutUrl` from the
  JSON and redirects the buyer to Stripe-hosted checkout. On failure it
  shows a plain error and keeps the visitor's details in place for a retry.

`FUNNEL_INTAKE_URL` points to the deployed `funnel-intake` edge function
in the serum app's Supabase project:

```
https://evzfibetybqhwikwhfbd.supabase.co/functions/v1/funnel-intake
```

The endpoint is public and anonymous **by design** (deployed with JWT
verification off, no shared-secret header — a secret shipped in a public
page would be no secret at all). What protects it is strict payload
validation plus server-owned pricing: it can only ever create an *unpaid*
order and a Stripe Checkout Session for the one serum product. Nothing
ships from a funnel submission — fulfillment starts only when the Stripe
webhook confirms payment (see the payment gate below).

## Deploying funnel-intake — DONE 2026-11-17

Target: the serum app's Supabase project (repo
`tkade2003-hub/tava-labs-serum`). Do not deploy it from this repo.

1. **Migration applied:** `supabase/migrations/0009_funnel_quiz_data.sql`
   (adds `profiles.quiz_answers`, `profiles.plan`, and the unique
   `profiles_email_lower_idx` on `lower(email)`).
2. **Function live** at `supabase/functions/funnel-intake/index.ts`,
   deployed with JWT verification off. It validates the payload, finds or
   creates the lead profile by email, stores answers/plan/address, then
   creates the order + Stripe Checkout Session **in-process** via
   `_shared/checkout.ts` (`createCheckoutSession`) — the same shared code
   `create-checkout` runs. There is deliberately no HTTP hop to
   `create-checkout`: function-to-function invokes are broken in this
   project (the edge gateway rejects the project's own service keys).
3. **Page wired:** `FUNNEL_INTAKE_URL` in `quiz.html` is set to the URL
   above and the fetch redirects to the returned `checkoutUrl`.

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
  type, `total` computed server-side in `_shared/pricing.ts` — the
  client-sent price is ignored entirely, never trusted).
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

## Supliful placement and the payment gate — WIRED 2026-11-17

`funnel-intake` never places a Supliful order. The gate is the payment
chain itself, and it is fully wired and proven in test mode:

1. `funnel-intake` creates the order row (`payment_status = 'unpaid'`) and
   the Stripe Checkout Session.
2. The buyer pays on Stripe-hosted checkout.
3. `stripe-webhook` receives `checkout.session.completed`, marks the order
   paid (`markOrderPaid`), and hands off to Supliful **in-process**
   (`handoffToSupliful` → `_shared/supliful.ts` `placeSuplifulOrder`, with
   our `orders.id` as the `externalOrderId` so retries can never
   double-ship).

An unpaid funnel submission can never become a shipment: placement reads
the order's `payment_status` and refuses anything not paid. Proven end to
end in test mode on 2026-11-16 (orders TL-25572 and TL-25573: paid →
Supliful test orders created, status NEW).

Note the account requirement from the Supliful connector doc: live API
order placement needs a Pro or Enterprise Supliful membership (test-mode
orders already succeed; the first live order will confirm entitlement).
`SUPLIFUL_TEST_MODE` stays ON in the project until launch.

## Placeholders still to replace

- **App Store link** — the "Download on the App Store" buttons in
  `quiz.html` and `checkout/success.html` are `href="#"`, marked with
  `PLACEHOLDER` comments. Swap in the real App Store URL once the app is
  listed.
- **Hosting** — `checkout/success.html` and `checkout/cancel.html` resolve
  at `https://tavalabs.app/checkout/success` / `/checkout/cancel` (the
  URLs Stripe redirects to, built from `APP_PUBLIC_URL`) only once this
  repo is hosted at that domain. That hosting step is still pending.

## App handoff: claim codes — BUILT 2026-11-17 (test mode)

The app is **not on the App Store yet**, so the handoff does not use a
store link. It uses a claim code:

- When `stripe-webhook` marks a funnel order paid, it issues a claim code
  (migration `0010_app_claims.sql` + `_shared/claims.ts` in the serum repo)
  and best-effort emails it (`claimEmail` template; email sending activates
  when Resend config lands in the Supabase project — it is not set today).
- `checkout/success.html` fetches the same code from the public
  `claim-lookup` function using the Stripe session id in its URL (the
  lookup only answers once the order is paid), and shows: the code, a
  **Copy claim code** button, a **Copy claim link** button
  (`https://tavalabs.app/claim?code=…`), and an **Open in the app**
  deep-link button (`tavalabs://claim?code=…`) labelled "if it's
  installed". Wording is explicit that the app isn't in the App Store
  yet and the code is what carries the purchase over.
- In the app: the deep link (or a code typed into Orders → "Bought on
  our website?") calls `claim-purchase` with the user's sign-in token.
  The server merges the lead profile into the app account — quiz
  answers, plan, routine times, shipping address, Stripe customer /
  subscription state — and re-keys all of the lead's orders to the app
  user. No new order is created, and the Shop refuses a second checkout
  for anyone with a paid order.
- Security: a code is single-use, expires after 90 days, and is the
  proof of purchase — email alone never merges anything (anyone can
  type anyone's email into the quiz). Codes are verified by SHA-256
  hash; the `app_claims` table is service-role only.

Proven in test mode 2026-11-17: funnel order TL-86773 (subscribe, $39)
claimed into a test app account — plan + answers + address + active
subscription transferred, orders total unchanged (no duplicate), replay
by the same account idempotent, claim by a different account refused.
