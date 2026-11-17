# Coy Discover

A swipe-based discovery tab, built as a standalone app for the Coy SDE Intern assignment. It has a blank **Home** tab (a placeholder for Coy's existing experience) and a working **Discover** tab.

**Stack:** React 18 (Vite, mobile-first) · Node.js + Express · JSON-file storage

## Features

- 32 seeded profiles with name, age, photo, bio, city/college and interests
- Swipe right to like and left to pass: drag on mobile, buttons or ← / → keys on desktop
- Animated cards with LIKE / NOPE feedback, and a toast on every swipe
- "It's a match!" screen when both people have liked each other
- Matches view listing all mutual matches
- Empty, loading and error states
- Swipes and matches persist across reloads and server restarts

## Getting started

Requires Node.js 18+.

```bash
npm run install:all
npm run dev
```

Open http://localhost:5173. The API runs on port 4100.

To run as a single server (serves the built client):

```bash
npm start
```

To run the backend tests:

```bash
npm test
```

## API

| Method | Endpoint   | Description                                                                  |
| ------ | ---------- | ---------------------------------------------------------------------------- |
| GET    | `/feed`    | Profiles the user has not swiped on yet                                      |
| POST   | `/swipe`   | Body: `{ "profileId": "p1", "action": "like" \| "pass" }`. Returns `{ match, profile }` |
| GET    | `/matches` | Mutual matches, newest first                                                 |
| POST   | `/reset`   | Demo helper that clears all swipes                                           |

All endpoints are also available under the `/api` prefix.

## Privacy

Coy's core promise is that nobody learns who liked them unless it is mutual.

- Whether a profile liked the user is stored server-side only and is never sent to the client. Responses use an explicit allow-list of fields.
- It is checked at one moment only: when the user likes that profile. Passing reveals nothing.
- `/feed` and `/matches` contain no hint about who liked the user.
- Each profile can be swiped only once; a repeat swipe returns `409`. This stops anyone passing and then re-liking to find out who liked them.

## Project structure

```
client/   React app (Discover tab, swipe card, match overlay, matches list)
server/   Express API, matching logic, seed data, JSON store, tests
```

## Demo

Aanya, Meera, Ishita, Vihaan, Nisha, Karan, Anika and Diya have all liked you, so liking any of them creates a match. Use **Reset demo** on the empty screen (or `POST /reset`) to start over.
