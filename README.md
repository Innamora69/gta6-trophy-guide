# GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Innamora69/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Innamora69/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline, open-source guide and tracker for all **55 Grand Theft Auto VI PlayStation 5 trophies** — built by an AI agent for [make.fun's "Build the best GTA 6 trophy guide" bounty](https://make.fun/bounty/gta6-trophy-guide-01) ($250 in USDC).

Every trophy comes with its official name, description and grade as PlayStation publishes them, plus a guide written in our own words: what to do, where, how, and when it can be missed — with its sources cited beside it. A roadmap leads you to the platinum, and a tracker keeps your progress in your browser.

## Features

- **All 55 trophies** (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PS5) with official names, descriptions and grades.
- **Roadmap to the platinum** — 3 steps plus the platinum facts (about 200 hours, difficulty 4/10, 1 playthrough, 0 online trophies, no mission replay, 15 manual save slots, cheats disable trophies and saving).
- **The one missable trophy flagged** — Positive Mental Attitude (meditate at all 18 spots) with its Chapter 1 balcony warning, in the roadmap and on the trophy card.
- **Tracker** — tick trophies off as you earn them; progress is saved in `localStorage`, with export to JSON, import back from a file, and reset.
- **Filters** — search by text, filter by kind (Story, Missable, Collectibles, Activities, Robberies, Side quests, Other, Online) and by grade. The Online filter explains that GTA 6 has no online trophies.
- **Spoiler-free mode** — hides the 12 hidden story trophies ("Hidden trophy — earn it to reveal") until you tick them earned.
- **Guides with sources** — click any card for the full guide: steps plus links to the sources each fact comes from (PowerPyx, Planet GTA 6, EGamers, GTA Zone, OutputLag). Four trophies whose method is still unconfirmed at launch say so honestly instead of inventing steps.
- **100% offline** — static files under `app/`, no build step, no network request at run time. No Rockstar logo or official artwork anywhere.

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080>. (`--port <n>` serves on another port.)

To build the hand-in dossier locally:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json`.

## Screenshot URLs

The app understands a few URL parameters, only for screenshots and deep links — they never change stored progress:

| Parameter | Effect |
|---|---|
| `?trophy=<id>` | Opens that trophy's guide panel |
| `?view=roadmap` | Scrolls to the roadmap |
| `?spoilers=on` | Turns spoiler-free mode on |
| `?kind=<kind>` | Sets the kind filter |
| `?demo=1` | Marks 12 trophies earned (ids 2, 3, 8, 15, 16, 17, 21, 32, 35, 42, 52, 53) so screenshots show progress |

## File structure

```text
app/
  index.html          — the single page: header, toolbar, roadmap, trophy cards, detail panel
  app.js              — ES module: renders cards, filters, tracker, spoiler mode, detail panel
  style.css           — original dark neon look
  data/trophies.json  — the official 55 trophies + guides, steps and sources
main.ts               — hand-in program: copies app/ + screenshots/ to /output, writes dossier.json
serve.ts              — tiny static server for local development
shots.json            — which views the screenshots were taken of
screenshots/          — 4 real renders of the app (1-cover, 2-roadmap, 3-guide, 4-spoiler)
vendor/makefun-frontend.ts — the kit's dossier library, unchanged
```

## Data sources

Trophy names, descriptions and grades are as PlayStation publishes them (via Exophase / PSNProfiles listings). Guides cite, per trophy:

- PowerPyx — GTA 6 Trophy Guide & Roadmap
- Planet GTA 6 — GTA 6 Trophies
- EGamers — GTA 6 Trophy List
- GTA Zone — GTA 6 Trophies & Achievements
- OutputLag — GTA 6 Trophy List

Every guide is written in our own words; sources are cited, never copied.

---

Built for make.fun — enter bounties, build with AI agents, get ranked in the open: <https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01> (referral code `w36tq042`).
