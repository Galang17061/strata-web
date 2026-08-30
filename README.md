# Strata Web

The web app for Strata, a tool that scores how likely an engineered system still works after a given number of running hours, layer by layer, using reliability block diagrams.

It talks to Strata API and needs only one address to find it.

## What it does

- A public landing page that explains the idea and lets a visitor play with a live reliability curve before signing in.
- Sign in with a username and password; the seat is kept across reloads and closed when the service says the token has expired.
- A dashboard with the number of projects, systems and parts, the average score, the latest projects and every system with its band and trend.
- Projects that hold systems; each system opens in a workspace with a layered tree, a canvas to wire blocks in series, parallel or k-out-of-n, and a formula that follows the wiring.
- A component sheet for every part: distribution, running hours, redundancy, failure log, Weibull or exponential fit and its own curve.
- Recalculation at new running hours, a history of every score a layer was given, and plots with bands, comparison, full preview and PNG or SVG export.
- Master data: vendors with logos, and a catalogue of parts with search, sorting, paging, spreadsheet template, import with a row check, and export.
- Account management for administrators: people, roles, password resets and a grid of rights per module.
- Light and dark themes, a command palette, keyboard-friendly forms and a phone-sized layout for every page.

## Run it for development

```
cp .env.example .env
npm install
npm run dev
```

The app expects Strata API to answer at the address in `.env`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_FILES_BASE_URL=
NEXT_PUBLIC_ACCESS_TOKEN_NAME=strata_token
```

`NEXT_PUBLIC_FILES_BASE_URL` may stay empty; logos are then fetched from the same host as the API without the `/api` suffix. The three values are read at build time, so a change needs a new build.

## Check it

```
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run build` writes a static site to `out/`; every page is pre-rendered and the workspace reads its project and system from the query string.

## Ship it

The `Dockerfile` builds the static site and serves it from a small web server with the right fallbacks. Point it at the service while building:

```
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://strata.example.com/api \
  -t strata-web .
docker run -p 3000:80 strata-web
```

The Strata API repository carries a `strata-web` service in its `docker-compose.yml`, so `docker compose up -d --build` there brings the database, the service and this app up together. Its `.env` knows where this checkout lives (`STRATA_WEB_DIR`), which port to publish (`STRATA_WEB_PORT`) and which API address to bake in (`STRATA_WEB_API_BASE_URL`).

## Where things live

```
src/app            routes: the landing page, sign in, and the signed-in area
src/components     brand marks and loader, motion helpers, reliability badges, the shared UI kit
src/features       one folder per part of the product: auth, shell, dashboard, projects, workspace, master-data, account, landing
src/lib            the API client, file addresses, formatting, reliability maths, query keys
src/styles         colour, radius, shadow and motion tokens for both themes
public/brand       the mark, wordmark and social image
```

Numbers are written in a monospaced face with tabular figures; a reliability figure is truncated to four decimals in lists and eight in detail panels, and always wears the same band colour wherever it shows.
