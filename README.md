# Coy Discover

A swipe-based discovery feature for Coy, built as a standalone app for the Coy SDE Intern assignment (Part B). It provides a tab bar with a blank **Home** placeholder and a fully working **Discover** tab.

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React 18, Vite (mobile-first)       |
| Backend  | Node.js, Express                    |
| Data     | JSON file (no external auth, single logged-in user) |

## Requirements coverage

**1. Profile data**
- 32 seeded profiles, each with name, age, photo, short bio, city or college, and interests.
- 13 seeded profiles have already liked the logged-in user, so matches can happen during a demo.

**2. Swipe experience**
- One profile card at a time. Swipe right to like and left to pass: drag gestures on mobile, buttons (and ← / → keys) on desktop.
- Animated cards with LIKE / NOPE stamps and a toast on every swipe.
- A swiped profile never appears again, including after a reload or restart.
- A clear empty state when no profiles are left.

**3. Matching**
- A match is created only when both users have liked each other, and an "It's a match!" screen is shown at that moment.
- A Matches view lists all mutual matches.
- Nobody is told who liked them unless it is mutual (see [Privacy](#privacy)).

**4. Backend APIs**
- `GET /feed`, `POST /swipe` and `GET /matches`, with swipes and matches persisted across reloads.

## Getting started

Requires Node.js 18 or later.

```bash
npm run install:all
npm run dev
```

Open http://localhost:5173 (the API runs on port 4100).

| Command         | Purpose                                              |
| --------------- | ---------------------------------------------------- |
| `npm run dev`   | Start the API and the web app with hot reload        |
| `npm start`     | Build the client and serve everything from port 4100 |
| `npm test`      | Run the backend test suite                           |

## API

| Method | Endpoint   | Description                                                                              |
| ------ | ---------- | ---------------------------------------------------------------------------------------- |
| GET    | `/feed`    | Profiles the user has not swiped on yet                                                  |
| POST   | `/swipe`   | Body `{ "profileId": "p1", "action": "like" \| "pass" }`. Returns `{ match, profile }`   |
| GET    | `/matches` | The user's mutual matches, newest first                                                  |
| POST   | `/reset`   | Clears all swipes (development helper)                                                   |

Errors: `400` invalid action or JSON, `404` unknown profile, `409` profile already swiped. Endpoints are also served under the `/api` prefix.

## Privacy

Coy's core promise is that nobody learns who liked them unless it is mutual. The implementation enforces this on the server:

- Whether a profile liked the user is stored server-side only and is never sent to the client. Every response is built from an explicit allow-list of fields.
- It is checked at one moment only: when the user likes that profile. Passing reveals nothing.
- `/feed` and `/matches` contain no information about who liked the user.
- A profile can be swiped only once. A repeat swipe returns `409`, which prevents passing and then re-liking to discover who liked the user.

## Testing

The backend suite (Node's built-in test runner) covers: seed data validity, no leakage of like data in any response, passes and one-way likes never producing a match, mutual likes producing a match, swiped profiles leaving the feed, `409` on repeat swipes, input validation, an empty feed once everyone is swiped, persistence across a restart, and recovery from a corrupt data file.

## Project structure

```
client/   React app: Discover tab, swipe card, match overlay, matches list
server/   Express API, matching logic, seed data, JSON store, tests
```
