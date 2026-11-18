# Tava Labs Web Platform (Next.js + TypeScript + React)

The signed-in web platform for tavalabs.app — an exact mirror of the
mobile app's Today / Orders / Shop / Lab / Support for a signed-in user,
linked to the app **by email**: the web signs in with Supabase Auth
(email code / magic link), and the `web-account` edge function (in the
tava-labs-serum repo) serves that verified email's profile, quiz
answers/plan, orders, and routine history from the shared Supabase
project. Same data, same features, web or app.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- `@supabase/supabase-js` for Auth + the web-account call
- **Static export only** (`output: "export"` in next.config.ts) —
  hosting is GitHub Pages at tavalabs.app, which serves static files
  only. No Node server, no hosting move.

## Routes

- `/login` → exported as `login.html` (sign-in / sign-up, email OTP +
  magic link, claim-code explainer)
- `/app` → exported as `app.html` (the signed-in mirror; redirects to
  login when there is no session)
- `/` → dev-only forwarder to login. Its export is **not** deployed:
  the site root already has the marketing `index.html`.

## Build & deploy (GitHub Pages)

```bash
cd platform
npm install
npm run build        # emits platform/out/
```

Deploy = copy three things from `out/` to the **landing repo root**
(the folder GitHub Pages serves), committing alongside the existing
static pages:

- `out/login.html` → `login.html`
- `out/app.html` → `app.html`
- `out/_next/` → `_next/`

Nothing else at the root changes: `index.html` (checkout modal →
funnel-intake → Stripe, 15 data-buy hooks), `quiz.html`,
`checkout/success` + `cancel`, the five legal pages, and the newsletter
wiring stay plain static and untouched — they are the live
marketing/funnel surface and are out of scope for this app.

## Backend dependency

`app.html` reads everything through the `web-account` Supabase edge
function (serum repo, `supabase/functions/web-account/`), which must be
deployed with verify_jwt ON, and Supabase Auth must have the email
provider on with `https://tavalabs.app` as Site URL and
`https://tavalabs.app/app.html` as a redirect URL. The OTP email
template must include `{{ .Token }}` for the 6-digit code flow.
