# Chess-stats

A multi-platform chess statistics and analytics web app. Pull your game history from Chess.com or Lichess, break it down by time period, and track favourite players across platforms, all in a fast, cached, type-safe React app.

> **Status:** Active development. Chess.com and Lichess are both supported end to end (profile, stats, dashboard, games, favourites).

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Authentication](#authentication)
- [Data Fetching & Caching Strategy](#data-fetching--caching-strategy)
- [Database Schema](#database-schema)
- [API Integrations](#api-integrations)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Roadmap](#roadmap)

---

## Overview

Chess-stats lets a player look up any Chess.com or Lichess username, select a month, and get a full analytical breakdown of every game played in that window: opponents, results, ratings, time controls, and move counts, rendered in a clean, dashboard-style UI. Players you care about can be bookmarked as **Favourites** for quick re-analysis later.

The project is built with platform-agnostic design: the schema, routing, and data layer normalize every platform into one shape, so adding another platform means writing an adapter, not reworking the app.

## Features

- **Player lookup**: search any Chess.com or Lichess username and pull their public profile (avatar, title, country, join date).
- **Username autocomplete**: Lichess usernames are suggested as you type (debounced, with titles and online status).
- **Month picker**: custom year/month navigation UI, bounded by the player's join date and the current month.
- **Dashboard**: win/loss/draw breakdown, rating trends, streaks, win rate by color, how games end, and game-level detail for the selected range.
- **Rating over time**: every time control on one chart, bucketed daily/weekly/monthly by the span shown, with a table view.
- **Opening trends**: most-played openings per color with W/D/L split, score, best/toughest opening, and whether each opening is being played more or less often lately.
- **Smart time ranges**: 7D / 30D / 90D / 1Y / All, with shared caching to avoid redundant fetches.
- **Favourites**: track players across platforms for quick access, backed by Supabase.
- **Google Sign-In**: Supabase Auth (PKCE) with per-user Row Level Security.
- **Light/dark theme support** throughout.

## Tech Stack

| Layer                 | Technology                                     |
| --------------------- | ---------------------------------------------- |
| Build Tool            | [Vite](https://vitejs.dev/)                    |
| UI Framework          | React + TypeScript                             |
| Routing               | [TanStack Router](https://tanstack.com/router) |
| Data Fetching / Cache | [TanStack Query](https://tanstack.com/query)   |
| Styling               | styled-components                              |
| Component Library     | [Mantine UI](https://mantine.dev/) v8          |
| Backend / DB          | [Supabase](https://supabase.com/)              |
| Auth                  | Supabase Auth, Google provider (PKCE)          |
| External Data         | Chess.com Public API, Lichess API              |

## Architecture

```
+----------------------------------+
|                                  |
|                                  |
|         Chess.com API            +-----------+
|       (public REST API)          |           |
|                                  |           |
|                                  |           |            +-----------------------------+
+----------------------------------+           |            |                             |
                                               |            |      Data Layer             |
                                               +------------>    (TanStack Query hooks)   |
+----------------------------------+           |            |                             |
|                                  |           |            |                             |
|                                  |           |            +--------------+--------------+
|          Lichess                 |           |                           |
|       (public REST API)          +-----------+                           |
|                                  |           |                           |
|                                  |           |                           |
+----------------------------------+           |                           |
                                               |                           |
                                               |            +--------------v--------------+
                                               |            |                             |
+----------------------------------+           |            |       React Components      |
|                                  |           |            |   (Games /Dashboard /       |
|                                  |           |            |         Favourites/Profile) |
|          Google Oath             |           |            |                             |
|        (Supabase Auth)           +-----------+            +--------------+--------------+
|                                  |                                       |
|                                  |                                       |
+----------------------------------+                                       |
                                                                           |
                                                                           |
+----------------------------------+                                       |
|                                  |                                       |
|                                  |                                       |
|          Supabase                |                                       |
|   (favourites, sessions)         <---------------------------------------+
|                                  |
|                                  |
+----------------------------------+
```

**Key principles:**

- **Single source of truth for auth state.** Token expiry is checked once at the root of the app rather than in every consumer component. This was an explicit simplification over a more "defensive" per-component check.
- **Cache-first, platform-agnostic data layer.** Hooks like `useGames` and `useProfile` take a platform and return normalized data (`PlayerProfile`, `PlayerStats`, `TransformedGame`), so the UI doesn't need to know whether data came from Chess.com or Lichess. `services/apiPlayer.tsx` dispatches per platform; the adapters live in `helpers/normalizePlayer.ts` and `helpers/transformGame.ts`.
- **Platform lives in the URL.** Player routes take an optional `?platform=lichess` search param (`usePlatform()` reads it). Chess.com is the default and is left out of the URL, so existing links keep working.
- **Protected routes are minimal.** Rather than wrapping every route in guard logic, only routes that strictly require auth (e.g. Favourites) redirect via a `beforeLoad` check.

## Authentication

Chess-stats signs in through **Supabase Auth** with the Google provider (PKCE flow):

1. `signInWithGoogle` (`src/services/OAuth.tsx`) redirects to Google via Supabase; Google returns to the app with `?code=...`.
2. The Supabase client exchanges the code for a session when it loads, strips the code from the URL, and keeps the session refreshed.
3. Every Supabase request carries the user's JWT. A listener in `main.tsx` refetches the signed-in user on sign-in and sign-out.
4. Routes that require a signed-in user (currently `favouritesRoute`) check `supabase.auth.getSession()` in `beforeLoad`.

The Google account id (`sub`) stays the app's user key (`"user".sub`, `favourite_players.user_sub`). Row Level Security maps the session to it with `public.current_google_sub()`, which reads `auth.identities` (written only by the auth server), so each user can read and write only their own rows. See `supabase/migrations/20261021000000_supabase_auth_rls.sql`.

## Data Fetching & Caching Strategy

All remote data goes through **TanStack Query**, with a caching scheme tuned to how people actually browse:

- **7D / 30D / 90D ranges share a single cache key (`'90D'`).** Since 90 days is the largest of the three "short" ranges, fetching it once covers all three views without re-fetching when a user toggles between them.
- **1Y / All ranges are fetched lazily**, and when a user navigates back to a shorter range, `getQueryData` is used to read from the existing cache rather than triggering a new request.
- **Variant games are filtered out.** Chess.com's API returns bughouse/crazyhouse/other variant games with undefined PGNs; only standard `chess` games are analyzed. Lichess exports are requested for standard speeds only (`bullet,blitz,rapid,classical,correspondence`).
- **Every query key includes the platform**, so the same username on Chess.com and Lichess never shares a cache entry.
- **Lichess exports are capped.** Lichess streams game exports at ~20 games/second for anonymous clients, so each export is capped to the most recent 1,000 games (`LICHESS_MAX_GAMES`) and the dashboard says so when the cap is hit.

## Database Schema

Supabase is used for persistent app data (currently: favourites, and session-related metadata). The schema stores players from both platforms side by side:

| Column                     | Type / meaning                                                                 |
| -------------------------- | ------------------------------------------------------------------------------ |
| `player_id`                | `text`: Chess.com numeric IDs stringified, Lichess IDs (lowercase usernames)   |
| `platform`                 | `'chess.com'` or `'lichess'` (check constraint), on `chess_profile` and `favourite_players` |
| `user_sub`                 | Google OAuth subject claim, used to scope rows per signed-in user              |
| `user."chessPlatform"`     | which platform the signed-in user's saved username (`chessUserId`) belongs to  |

Uniqueness is platform-scoped: `chess_profile (platform, player_id)` and `favourite_players (user_sub, platform, player_id)`, which are also the app's upsert conflict targets. This keeps the same logical favourite independent of which platform it came from, with no collisions between platforms that reuse similar IDs/usernames.

The migration lives in `supabase/migrations/20261020000000_multi_platform_players.sql`. **Apply it before deploying the app version that ships with it**, since the new upserts fail against the old constraints. Paste it into the Supabase SQL editor or run `supabase db push`. It discovers and replaces the existing `player_id` keys itself and is safe to re-run.

## API Integrations

### Chess.com (active)

- Public REST API, no auth required for profile/game data.
- Used for: player profiles, monthly game archives, avatars, titles, country flags.

### Lichess (active)

- Public REST API, no auth required.
- `GET /api/user/{username}`: profile, flag, play time, per-speed game counts.
- `GET /api/user/{username}/perf/{perf}`: current/peak rating and W/L/D per speed. Fetched one at a time (Lichess asks API clients not to parallelize), only for speeds the player has played.
- `GET /api/games/user/{username}` (NDJSON): game export with openings, capped as described above. Lichess answers `404` on this endpoint to clients it treats as bots (curl's default user agent, headless Chrome), so drive it from a real browser when testing.
- Username autocomplete uses:
  ```
  https://lichess.org/api/player/autocomplete?term={query}&object=true
  ```

> **Note:** There is no documented Chess.com search/autocomplete endpoint, so autocomplete is Lichess-only; on Chess.com the same input works as a plain text field.

## Project Structure

```
├── public/
│   ├── favicon.ico
│   ├── knight.svg / knight-dark.svg
│   ├── logo192.png / logo512.png
│   ├── manifest.json
│   └── robots.txt
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── components/          # Footer, Header, SideBar
    ├── contexts/            # TabContext
    ├── css/                 # CSS modules (FloatingTab, NavbarMinimal)
    ├── helpers/             # platform, timeControls, normalizePlayer,
    │                        # transformGame, openings, calculateOpeningStats,
    │                        # calculateRatingHistory, calculateStreaks,
    │                        # calculateWinRateBreakdown, DateFormat, ...
    ├── hooks/               # Data-fetching & mutation hooks
    │   ├── useGames.tsx / useGamesRecentdays.tsx
    │   ├── useProfile.tsx / usePlatform.tsx / useLichessAutocomplete.tsx
    │   ├── useGetUser.tsx / useGetUserFromChessId.tsx
    │   ├── useGoogleUser.tsx
    │   ├── useFetchChessProfileBulk.tsx / useFetchChessprofileFromSupa.tsx
    │   ├── useUpsertChessUser.tsx / userUpseretUser.tsx / useUpdateChessUsername.tsx
    │   ├── useGetFavsofUser.tsx / useUpsertFav.tsx / useDeleteFav.tsx
    │   └── useStats.tsx
    ├── pages/               # Top-level route views
    │   ├── Games.tsx
    │   ├── DashBoard.tsx
    │   ├── Favorites.tsx
    │   ├── Profile.tsx
    │   ├── Stats.tsx
    │   └── Login.tsx
    ├── services/            # External API & backend clients
    │   ├── OAuth.tsx
    │   ├── apiPlayer.tsx    # per-platform dispatch (profile, stats, games)
    │   ├── apiLichess.tsx
    │   ├── apiFlags.tsx
    │   ├── apiStats.tsx
    │   ├── apiUser.ts
    │   └── supabase.ts
    ├── styles/              # GlobalStyle
    ├── styles.css
    └── ui/                  # Shared/presentational components
        ├── AppLayout.tsx / Form.tsx / Button.tsx / Input.tsx
        ├── PlayerAvatar.tsx / Profilething.tsx
        ├── AreaGraph.tsx / PieGraph.tsx / RatingHistoryGraph.tsx
        ├── OpeningTrends.tsx / WinRateBreakdown.tsx
        ├── PlatformToggle.tsx / UsernameAutocomplete.tsx
        ├── DarkModeToggle.tsx / FloatingTab.tsx
        └── Spinner.tsx / ErrorMessage.tsx / PageNotFound.tsx
```

Built on **Vite** + **TypeScript**, with the data layer (`hooks/`) and external clients (`services/`) kept as separate layers: pages consume hooks, hooks consume services.

## Getting Started

```bash
# Clone and install
git clone https://github.com/appu-46/chess-stats-v2.git
cd chess-stats
npm install

# Environment variables
cp .env.example .env
# Fill in: Supabase URL/anon key, Google OAuth client ID

# Run locally (Vite dev server)
npm run dev

# Unit tests (Vitest)
npm test
```

> Update env var names above to match what's actually read in `services/supabase.ts` and `services/OAuth.tsx`.

## Roadmap

- [x] Lichess API integration
- [x] Username autocomplete (Lichess-first)
- [x] Schema migration: `player_id` to string type, add `platform` column
- [x] Extend Dashboard analytics (opening trends, rating graphs over time)
- [ ] Stream Lichess exports progressively instead of waiting for the full (capped) download
- [ ] More platforms behind the same adapter layer

---

_Built solo, with an eye toward clean architecture that scales to more chess platforms over time._
