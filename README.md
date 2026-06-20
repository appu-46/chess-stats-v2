# Chess-stats

A multi-platform chess statistics and analytics web app. Pull your game history from Chess.com (with Lichess support on the way), break it down by time period, and track favourite players across platforms, all in a fast, cached, type-safe React app.

> **Status:** Active development. Chess.com integration is functional; Lichess integration and a multi-platform schema redesign are in progress.

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

Chess-stats lets a player look up any Chess.com username, select a month, and get a full analytical breakdown of every game played in that window: opponents, results, ratings, time controls, and move counts, rendered in a clean, dashboard-style UI. Players you care about can be bookmarked as **Favourites** for quick re-analysis later.

The project is built with platform-agnostic design from day one: the schema, routing, and data layer are structured so that Lichess (and potentially other platforms) can be added without reworking the core app.

## Features

- **Player lookup**: search any Chess.com username and pull their public profile (avatar, title, country, join date).
- **Month picker**: custom year/month navigation UI, bounded by the player's join date and the current month.
- **Dashboard**: win/loss/draw breakdown, rating trends, and game-level detail for the selected range.
- **Smart time ranges**: 7D / 30D / 90D / 1Y / All, with shared caching to avoid redundant fetches.
- **Favourites**: track players across platforms for quick access, backed by Supabase.
- **Google Sign-In**: implicit OAuth flow with idle-timeout session expiry.
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
| Auth                  | Google OAuth 2.0 (implicit flow)               |
| External Data         | Chess.com Public API, Lichess API (planned)    |

## Architecture

```
+---------------------+
|   Chess.com API      |
|  (public REST API)   |--+
+---------------------+  |
+---------------------+  |          +--------------------------+
|   Lichess API         |--+----->  |  Data Layer              |
|   (planned)            |  |       |  (TanStack Query hooks)  |
+---------------------+  |          +------------+------------+
                             |                   |
+---------------------+  |                          v
|  Google OAuth         |--+            +-----------------------+
|  (implicit flow)       |              |   React Components      |
+---------------------+                 |  (Games / Dashboard /   |
                                        |   Favourites / Profile) |
+---------------------+                 +------------+------------+
|     Supabase           |<----------------------------+
| (favourites, sessions) |
+---------------------+
```

**Key principles:**

- **Single source of truth for auth state.** Token expiry is checked once at the root of the app rather than in every consumer component. This was an explicit simplification over a more "defensive" per-component check.
- **Cache-first, platform-agnostic data layer.** Hooks like `useGames` and `useProfile` abstract over the underlying platform so the UI doesn't need to know whether data came from Chess.com or Lichess.
- **Protected routes are minimal.** Rather than wrapping every route in guard logic, only routes that strictly require auth (e.g. Favourites) redirect via a `beforeLoad` check.

## Authentication

Chess-stats uses **Google OAuth 2.0 implicit flow**:

1. User signs in with Google; the access token is returned directly in the redirect fragment (no auth code exchange).
2. `processAndClearAccessToken` extracts the token from the URL, stores `access_token` and `token_expiry` in `sessionStorage`, and clears the fragment from the URL.
3. A root-level `setTimeout` watches the stored expiry and triggers idle logout. There's no per-component expiry polling.
4. Routes that require a signed-in user (currently `favouritesRoute`) perform a `beforeLoad` check and redirect to login if no valid token is present.

This flow is intentionally lightweight since the app doesn't need server-side session management. Supabase Row Level Security policies use the Google `sub` claim (`user_sub`) to scope each user's data.

## Data Fetching & Caching Strategy

All remote data goes through **TanStack Query**, with a caching scheme tuned to how people actually browse:

- **7D / 30D / 90D ranges share a single cache key (`'90D'`).** Since 90 days is the largest of the three "short" ranges, fetching it once covers all three views without re-fetching when a user toggles between them.
- **1Y / All ranges are fetched lazily**, and when a user navigates back to a shorter range, `getQueryData` is used to read from the existing cache rather than triggering a new request.
- **Variant games are filtered out.** Chess.com's API returns bughouse/crazyhouse/other variant games with undefined PGNs; only `chess` and `chess960` rule types are kept to avoid downstream FEN-parsing errors.

## Database Schema

Supabase is used for persistent app data (currently: favourites, and session-related metadata). The schema is being actively redesigned to support multiple platforms cleanly:

**Current vs. planned changes:**

| Column      | Current                                                           | Planned                                                    |
| ----------- | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| `player_id` | `int8` (Chess.com numeric ID)                                     | string-compatible type (Lichess IDs aren't purely numeric) |
| `platform`  | _(not present)_                                                   | new column, e.g. `'chess.com'` or `'lichess'`              |
| `user_sub`  | Google OAuth subject claim, used to scope rows per signed-in user | unchanged                                                  |

This redesign is driven by the need to store the same logical favourite (a player) independently of which platform their data came from, without collisions between platforms that might reuse similar IDs/usernames.

## API Integrations

### Chess.com (active)

- Public REST API, no auth required for profile/game data.
- Used for: player profiles, monthly game archives, avatars, titles, country flags.

### Lichess (planned)

- Lichess API integration is the next major milestone.
- Username autocomplete will use Lichess's autocomplete endpoint:
  ```
  https://lichess.org/api/player/autocomplete?term={query}&object=true
  ```
- Autocomplete UX is intentionally deferred until this integration lands, rather than building a Chess.com-only version first.

> **Note:** There is no documented Chess.com search/autocomplete endpoint at this time. Autocomplete is being built around Lichess first for that reason.

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
    ├── helpers/             # DateFormat, RecordPercentageCalc,
    │                        # TransformGames, gamesDateWise, urlUtility
    ├── hooks/               # Data-fetching & mutation hooks
    │   ├── useGames.tsx / useGamesRecentdays.tsx
    │   ├── useProfile.tsx / useCountry.tsx
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
    │   ├── apiFlags.tsx
    │   ├── apiStats.tsx
    │   ├── apiUser.ts
    │   └── supabase.ts
    ├── styles/              # GlobalStyle
    ├── styles.css
    └── ui/                  # Shared/presentational components
        ├── AppLayout.tsx / Form.tsx / Button.tsx / Input.tsx
        ├── PlayerAvatar.tsx / Profilething.tsx
        ├── AreaGraph.tsx / PieGraph.tsx
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
```

> Update env var names above to match what's actually read in `services/supabase.ts` and `services/OAuth.tsx`.

## Roadmap

- [ ] Lichess API integration
- [ ] Username autocomplete (Lichess-first)
- [ ] Schema migration: `player_id` to string type, add `platform` column
- [ ] Extend Dashboard analytics (opening trends, rating graphs over time)

---

_Built solo, with an eye toward clean architecture that scales to more chess platforms over time._
