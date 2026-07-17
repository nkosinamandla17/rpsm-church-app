# Royal Priesthood Solution Ministries — Web App

A React + Vite application with two parts in one codebase:

- **Public website** — the Glory All-Night event site: hero + countdown, registration, plan-your-visit (accommodation / visas / travel), one-on-one booking, watch, bookstore + cart, giving, email/SMS signup, and a live chatbot.
- **Admin dashboard** — overview with charts, registrations, bookings, subscribers, bulk **messaging** (email + automated SMS), bookstore/orders, event & content control, and integration settings.

Toggle between them with the **Admin** button in the site nav (top right) and **View public site** in the dashboard sidebar.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

## Where things live

- `src/App.jsx` — the whole app (public site + dashboard) in one self-contained file.
- `src/main.jsx` — React entry.
- Styles are in a `<style>` block near the bottom of `App.jsx` (design tokens under `:root`).

## Set the event date

In `src/App.jsx` change:

```js
const EVENT_DATE = new Date("2026-09-25T18:00:00+02:00"); // ← confirmed all-night date
```

The Event & Content page in the dashboard is the intended place to edit this once wired to a backend.

## Images

Every image uses an Unsplash photo with an automatic photographic fallback, so nothing renders broken. To use real ministry photos, edit the `IMG` map at the top of `App.jsx` (swap the Unsplash id, or point `src()` at your own hosted images).

## Connecting the backend

The forms, cart, giving, messaging and chatbot are wired on the front end and marked where server calls go. To make them live:

| Feature | What to connect |
|---|---|
| Registration / bookings / subscribers | POST to your API → database (e.g. Node/Express + Postgres or Firebase) |
| Books & giving payments | **Paynow / EcoCash** and **Visa (Stripe)** checkout |
| Bulk email | Brevo / SendGrid / Mailchimp |
| Automated SMS | Twilio or a Zimbabwean SMS gateway; trigger on register, booking confirm, reminders |
| Chatbot | Proxy the Anthropic API call through your Node backend so the API key stays server-side |

> The chatbot's direct API call works only inside the Claude artifact preview (keyless). In your own deployment it must go through a backend proxy that holds the key.

## Note on the current live site

The existing WordPress site (rpsmchurch.com) is serving injected casino spam and should be taken down or cleaned before launch. This app is a clean replacement.
