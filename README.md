# LEGACY FC — Online

משחק קריירת כדורגל בסגנון RPG דו־ממדי, עם שרת אונליין: חשבונות, שמירה בענן, סנכרון בין מכשירים, היסטוריית גרסאות וטבלת מובילים.
A 2D football-career RPG with an online backend: accounts, cloud saves, cross-device sync, version history and a leaderboard.

---

## מבנה / Architecture

```
game/       the game itself (vanilla JS on canvas). build.py → frontend/public/game/index.html
frontend/   React 18 + Vite + TypeScript shell: login, cloud sync, leaderboard, account, PWA
backend/    FastAPI + SQLAlchemy (SQLite or PostgreSQL), argon2 passwords, JWT
e2e/        browser tests (Puppeteer): full online flow + game movement/regression/perf
Dockerfile  one image: builds game + frontend, FastAPI serves API and static site
```

The game runs inside an iframe. The shell talks to it over a same-origin `postMessage` bridge
(`export` / `import` / `lang` / `focus`; the game sends `ready` / `saved`). The game still works
fully offline on its own — the save stays in the browser (`localStorage`) and the shell uploads it.

Cloud saves use optimistic concurrency: every upload sends `base_version`; if another device
uploaded in between, the server answers **409** and the player chooses which copy to keep.
The previous versions are kept (default 15) and can be restored.

## שחקנים וחנות / Players and store (v9)

- **Accounts in a hosted database**: every user has a username (argon2id password hash), cloud saves with history, and a place on the leaderboard (can be hidden).
- **Players linked to players** (`backend/app/social.py`, shell *Friends* panel): search by name, friend requests, accept/decline/remove, block, public profile cards,
  and a ranking among friends. Privacy: opted-out players are only visible to friends; a blocked person cannot find or see the blocker; searching needs 2+ letters.
- **Store with real payments** (`backend/app/store.py`): Stripe Checkout, prices fixed on the server (`catalog.json` exported from the game), items unlocked only by a signed webhook
  or a server-side Stripe lookup, refunds/disputes take items back, every webhook processed once. The game's *Buy* opens checkout through the shell and the game replaces its owned items with the
  server's list (`game/src/p10k.js`). Items are cosmetic only. Payments are off until Stripe keys are configured. See [DEPLOY.md](DEPLOY.md).

## הרצה מקומית / Run locally

Requirements: Python 3.11+, Node 20+.

```bash
# 1. backend
cd backend
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000        # http://localhost:8000/docs (dev only)

# 2. game + frontend (second terminal)
python3 game/build.py --check                    # builds frontend/public/game/index.html
cd frontend && npm ci && npm run dev             # http://localhost:5173 (proxies /api → :8000)
```

Single-server mode (what production does): `cd frontend && npm run build`, then
`STATIC_DIR=../frontend/dist uvicorn app.main:app --port 8000` from `backend/` and open http://localhost:8000.

The game alone, with no server: open `frontend/public/game/index.html` in a browser.

## Docker

```bash
cp .env.example .env          # set SECRET_KEY and POSTGRES_PASSWORD
docker compose up -d --build  # app on :8000 + PostgreSQL 16
```

Without compose (SQLite in a volume):

```bash
docker build -t legacy-fc .
docker run -d -p 8000:8000 -e SECRET_KEY=... -v lfc-data:/data legacy-fc
```

## העלאה לאינטרנט / Deploying online

Any host that runs a Docker image works. Put HTTPS in front (most platforms do it for you).

| Option | Notes |
|---|---|
| Render / Railway / Fly.io | Point at this repo's Dockerfile, add a managed Postgres, set `DATABASE_URL` and `SECRET_KEY`. |
| VPS (any Linux server) | `docker compose up -d`, then a reverse proxy with TLS — e.g. Caddy: `yourdomain.com { reverse_proxy localhost:8000 }`. |

**Production needs a hosted PostgreSQL** (the app refuses to start with SQLite when `APP_ENV=production`) and migrates its own schema (Alembic) on start.
The full step-by-step guide, including Stripe setup, is in **[DEPLOY.md](DEPLOY.md)**.

Run **one** app process per database unless you add a shared rate limiter (see Security).

### Environment variables

| Name | Default | Meaning |
|---|---|---|
| `APP_ENV` | `development` | `production` disables /docs and requires a strong `SECRET_KEY` |
| `SECRET_KEY` | — | ≥32 random chars in production. Signs login tokens. |
| `DATABASE_URL` | `sqlite:///./data/legacy_fc.db` | e.g. `postgresql+psycopg://user:pw@host:5432/db` |
| `TOKEN_TTL_HOURS` | `720` | login lifetime |
| `CORS_ORIGINS` | empty | only if the web app is on another origin |
| `STATIC_DIR` | empty | folder of the built frontend to serve |
| `MAX_SAVE_BYTES` | `2097152` | largest accepted save |
| `SAVE_BACKUPS_KEPT` | `15` | history versions per slot |
| `AUTH_RATE_PER_MINUTE` | `20` | login/register attempts per IP per minute |
| `ALLOW_REGISTRATION` | `true` | close sign-ups |

## משחק חי / Live match (v9)

League and cup matches are played in real time on a 105 × 68 m pitch (`game/src/p10a.js` simulation, `p10b.js` stadium art, HUD and input).
You control Eli; the other 21 players are AI that keep formation, press, mark goal-side, make runs, stay onside and pass by openness.
The ball is a physical object (height, bounce, friction, wind, wet pitch). Goals, corners, throw-ins, goal kicks, fouls, cards, offside,
extra time and penalties follow the laws. Every number on the half-time / full-time screens is counted from events in the match.

| Action | Keys (default) | Touch |
|---|---|---|
| Move | WASD / arrows | D-pad |
| Sprint | Shift | RUN |
| Pass · without the ball: tackle / call for it | J (also Space, Enter, Z) | A |
| Shoot (hold for power, Up/Down to aim) · slide tackle | K (also X) | B |
| Through ball | L (also C) | — |
| Pass to a spot | click the pitch | — |
| Pause · tactics · simulate the rest | Esc / P | tap the scoreboard |

Settings → *Match controls* rebinds J / K / L / Shift; *Matches* switches back to the classic turn-based engine; *Live match length* is 4–12 minutes.

## חדרים / Interiors (v9)

The Club HQ, gyms, Training ground, Sports shop / Mall and your own home (once you own one) open walk-in rooms (`game/src/p10d.js`).
Walk with WASD / arrows, press E (or click) at a highlighted object, leave through EXIT. Every object runs the facility's existing action
(rest, wardrobe, drills, gym sessions, shop menus, Career Market, league table, squad, team dinner). The home grows with the property
you own (studio → mansion) and shows earned items: trophies, a first-goal photo, a framed shirt after a trophy.
Furniture is illustrated by `game/src/p10i.js` (drawing only, no change to actions or costs): treadmills with live consoles,
weight bench and barbell, dumbbell rack, punching bag on a stand, medicine balls, water cooler, reception desk with the club crest,
laid team-dinner table, manager's desk, home desk / kitchen / media wall with a news ticker, changing-room benches with kit and boots,
treatment beds with a drip stand and curtain, the agent's executive desk, shop counter and ball bin. Free wall space gets a clock that
follows the time of day, framed pictures, pennants or signs, and every room has ceiling lights with light cones (warm at night).

## טלפון / Phone layout (v9)

On a phone held upright (portrait, ≤640 px wide) the game view fills the width and a touch panel below it
(`game/src/p10g.js`) shows menus, dialogs, list screens and the player status as large HTML text (15–17 px)
with finger-sized buttons (≥48 px): tap a menu row to choose it, Next/Continue for dialogs, Back/Close,
an "E · …" button for the nearest door or object, plus Menu / Map (or Leave room) / Sound. Long menus scroll
inside the panel, so Back stays on screen. Hebrew switches the panel to right-to-left.
In landscape the game fills the screen height and the D-pad / A-B buttons sit in the side margins.
Matches, drills and mini-games stay on the canvas (with a short touch-controls hint in the panel).
Checked in Chrome's phone emulation (390×844 and 844×390, touch), not yet on a physical phone.

## מצגת / Presentation (v9, `game/src/p10h.js`)

Drawing only: no match result, economy or save logic changes. Stadium: grass grain, light/depth gradient, worn touchlines and
goalmouths, line shadows, shaded stands with club-coloured parapets, waving corner flags and supporters' flags (an away end in the
visitors' colours), rain splashes, floodlight glare, four-way floodlight shadows and camera flashes at night. The radar is smaller,
sits in the corner opposite the commentary line and fades when the ball or Eli is underneath. Match messages use team names in the
current language. City speech bubbles are drawn above the world and moved clear of HUD panels (or skipped if there is no room).
On a phone in portrait the touch panel shows a large live scoreboard (score, clock, possession, stamina); tap it to pause.

## אנימציות / Character animations (v9, `game/src/p10j.js`)

Drawing and animation state only: the same seeded match ends in exactly the same state with the layer on or off (`game-anim.cjs`).
New poses on the existing posed-sprite renderer (`p8e.js`): the keeper's dive (stretched, straining, instead of the old rotated
celebration pose), then he lies for a moment and gets up; a fouled player falls, lies and gets up (sooner if he has to run);
slide tacklers get up after the slide; the throw-in taker holds the ball over his head and throws with both hands; a keeper
standing with the ball holds it at his chest. Walking arms swing more. Room staff turn to face Eli when he comes close and glance
around now and then; the gym trainer does jumping jacks and stretches. `ANIM10.off` switches the layer off if it ever throws.
`node game-sheet.cjs … prefix` also renders the new poses (`prefix-anim.png`).

## מוזיקה / Music (v10, `game/src/p10l.js`)

The old square-wave loops are replaced by a small composer: soft plucks, bells, electric piano and harp over pads, a gentle bass and
quiet drums. Every place has a mood (title, city by day and by night, street, park, beach, cafe, stadium, sport, club, shop, clinic,
home, travel, lounge, live match, battle). Walking somewhere else fades the old track out and a new one in; every visit composes a
new tune from a seeded random walk over the mood's chords, and each tune keeps varying every 8 bars. Music has its own random stream
and never touches the match engine's. `MUS10.off` switches it off if it ever throws. `game-music.cjs` tests the composer (valid,
in-scale, deterministic), the place-to-mood mapping, fades, new tunes per visit and mute. Whether it sounds good is a matter of taste:
the tests cannot judge that.

## התחברות עם גוגל / Sign in with Google (v10)

`POST /api/auth/google` verifies Google's ID token on the server (RS256 signature from Google's published keys, issuer, audience = your
client ID, expiry, verified e-mail) and signs the player in, creating the account on first use. Only Google's account id is stored;
the account has no usable password. Needs `GOOGLE_CLIENT_ID` (public). The page loads Google's script only when the server says it is
configured, and the CSP then allows exactly Google's button script/frame/style. Tests: `backend/tests/test_google.py` (real signatures,
a throw-away key) and `e2e/online-google.cjs` (browser + a local stand-in for Google's servers only). A real Google client ID and a
real Google sign-in have not been exercised: setup steps are in DEPLOY.md section 4b.

## טאבלט / Tablets (v10, `game/src/p10m.js`)

Touch screens wider than 640 px keep the normal layout but get a bigger picture (portrait: full width; landscape: as tall as fits) and
finger-sized buttons at the bottom. Phones keep the touch panel / floating controls (v9).

## איזון / Balance (v9)

Live match (`LMBAL` in `game/src/p10a.js`): after the usual attribute compression, the gap between the two teams' averages is
soft-capped (`cap` 3 per side for outfield attributes, `gkCap` 4 for keepers, via tanh), so near-equal teams are untouched while
top-vs-bottom keeps a clear but beatable edge; every player keeps his place relative to his own team-mates, so Eli's own progress
counts in full. Each team gets a small match-day form swing (`form`). Matches Eli is not in use `sim2` (base.html), slope 12.
Measured with `game-balance.cjs` (192 AI-driven matches, clubs 7/0, 6/1, 3/4 both ways): the stronger side won 66%, drew 18%,
lost 16% (before: ~80% / 11% / 9%, and 0-2 points out of 16 for the weakest club vs the strongest); `sim2` top-vs-bottom 71/22/7;
simulated seasons: strongest club takes the title 45% of the time (was 53%). Eli's side still loses more often in even matches
while he is the weakest player in his squad (a teenager at ~34 overall); with a team-mate's attributes (EQ=1) even matches are level.

## בדיקות / Tests

```bash
cd backend && pytest -q                               # API tests (SQLite)
TEST_DATABASE_URL=postgresql+psycopg://... pytest -q  # same tests on PostgreSQL
cd frontend && npx tsc --noEmit && npm test           # types + sync logic
cd e2e && npm i && npm run game:store && npm run game:movement && npm run game:regression && npm run game:live && npm run game:city && npm run game:interiors && npm run game:drills && npm run game:career && npm run game:phone && npm run game:keys && npm run game:present && npm run game:fairness && npm run game:anim
node game-shots.cjs "$PWD/../frontend/public/game/index.html"   # reference screenshots → e2e/shots/
node game-sheet.cjs "$PWD/../frontend/public/game/index.html" v9   # character sprite sheets → e2e/shots/
node game-city.cjs "$PWD/../frontend/public/game/index.html" after 2   # city views (2 = superstar career) → e2e/shots/
node game-balance.cjs "$PWD/../frontend/public/game/index.html" 10 6   # live-match balance report (120 AI matches, ~2 min)
# balance switches: SYM=1 same tactic+formation, EQ=1 Eli gets a team-mate's attributes, TAC1 / FM1 / TACJ force the opponent's tactic / formation
npm run online                                        # needs the server on :8000 with STATIC_DIR set
node online-google.cjs                                # Continue with Google, browser + a stand-in for Google's servers
node game-music.cjs "$PWD/../frontend/public/game/index.html"   # music composer, moods, fades
node online-store.cjs                                 # full stack: backend + shell + game + friends + purchases (Stripe replaced by a local mock); needs backend/.venv and `npm run build` in frontend/
npm run catalog:check                                 # fails if backend/app/catalog.json differs from what the game sells
```
Set `CHROME_PATH` to a Chrome/Chromium binary for the browser tests. On Windows: `C:/Program Files/Google/Chrome/Application/chrome.exe` (Edge also works when it is not mid-update).

## אבטחה ומגבלות ידועות / Security & known limits

- Passwords: argon2id. Tokens: JWT HS256 with a per-user `token_version` ("log out everywhere", password change revokes old tokens).
- Saves are validated (type, size, depth, numeric ranges) but **the game runs on the client**, so the
  leaderboard is player-reported and **not anti-cheat verified**. It is labeled that way in the UI.
- The rate limiter is in-process. With several replicas, add one at the proxy or in Redis.
- **Payments** go through Stripe Checkout and are off until `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` are set (`/api/config` shows `payments.enabled`
  and `mode: test|live`). Prices live on the server; items are granted only by a verified webhook or a server-side Stripe lookup; the client cannot grant anything.
  Without a provider the game keeps its local TEST MODE, whose items are labelled TEST and never count as paid. Details, limits and what was and was not verified: [DEPLOY.md](DEPLOY.md).
- No real-time multiplayer (players are linked by accounts, friends, profiles and rankings).
- Back up the hosted PostgreSQL (provider backups / point-in-time recovery).
- All clubs, brands and players are fictional.
