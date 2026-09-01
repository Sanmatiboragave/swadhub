# 🍔 SwadHub — Food Ordering Webapp Deployment Guide

> This guide is for the **food ordering app** in the `webapp/` folder
> (React + Vite + Tailwind). Anyone who opens your link can browse kitchens,
> add food to the cart, check out, and watch the live order tracking.

> ⚠️ The other `QUICK_DEPLOY.md` and `DEPLOYMENT_GUIDE.md` files are for the
> **Support Ticket Triage Agent** (a different project in this repo). Do not
> follow those for the food app.

---

## What gets deployed

| Piece | Where | Hosted by |
|-------|-------|-----------|
| Food ordering UI (React) | `webapp/` | Vercel / Netlify (static) |
| Food photos | Unsplash CDN (remote) | — |
| Orders | Stored in the visitor's browser (localStorage) | — |

There is **no backend server needed** for this demo. Ordering, checkout, and
tracking all run in the browser.

---

## ✅ Option 1 — Vercel (recommended, ~3 minutes, free)

1. Go to https://vercel.com and sign in with GitHub.
2. Click **Add New… → Project**.
3. **Import** your repository `Sanmatiboragave/swadhub`.
4. In the "Configure Project" screen, set:
   - **Root Directory:** `webapp`
   - Framework Preset: **Vite** (auto-detected)
   - Build Command: `npm run build` (auto)
   - Output Directory: `dist` (auto)
5. Leave environment variables empty (the demo app needs none).
6. Click **Deploy**.
7. After ~1 minute you get a URL like `https://swadhub-webapp-xxxx.vercel.app`.

**Share that URL — anyone can open it and order food.**

### Redeploying after code changes
In Vercel, the project auto-deploys on every `git push` to `main`.

---

## ✅ Option 2 — Netlify Drop (no GitHub needed, 30 seconds)

The `dist/` build folder is already committed to the repo, so:

1. Run a fresh build: `cd webapp` → `npm run build` (need Node 18+)
2. Go to https://app.netlify.com/drop
3. **Drag the `webapp/dist` folder** onto the page.
4. Netlify reserves a subdomain for you immediately.

---

## ✅ Option 3 — GitHub Pages

Works too, but React Router needs a single-page app fallback:

1. In `webapp/vite.config.js`, set `base: './'`.
2. Add a `public/404.html` that copies the built `index.html` so routes
   like `/checkout` don't 404.
3. Push to `main` and enable Pages → Deploy from branch (folder `/webapp/dist`).

---

## Troubleshooting

- **Blank page after deploy** → make sure Vercel Root Directory is `webapp`
  (not the repo root, which contains a different Flask app).
- **Login/Signup "email"** → emails are simulated; no real message is sent.
- **Orders not saved** → orders live in each visitor's own browser
  (localStorage). Refresh keeps your cart/order on that same device only.

---

## Limits of this demo (important to know)

- The order never reaches a restaurant. It is a **front-end demo**: cart,
  checkout and tracking all run in the browser.
- No real payment is taken (the "Pay" button is simulated).
- To accept **real orders** you'd need a backend (e.g. Flask/FastAPI + a
  database), a restaurant-facing dashboard, email/SMS notifications, and a
  payment gateway (Razorpay/Stripe). That is a separate build.

---

## Security note 🔒

Your git remote URL in this repo contains a **GitHub personal access token**
(`git remote -v` shows it). Anyone who sees that string can push to your repo.
After deployment, rotate it:

- https://github.com/settings/tokens → **Revoke** the old token.
- Then clean the remote:
  ```bash
  git remote set-url origin https://github.com/Sanmatiboragave/swadhub.git
  ```