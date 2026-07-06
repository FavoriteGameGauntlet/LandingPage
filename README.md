# Favorite Game Gauntlet — Landing Page

Landing page for the **Favorite Game Gauntlet (FGG)** — a private gaming event where participants compete across their favorite games across multiple seasons.

Built with **Vue 3**, **TypeScript**, and **Vite**.

## Features

- **Glitch intro screen** — animated logo with CSS glitch effects on entry
- **Rules** — season rules written in Markdown, rendered in-app
- **Tools** — randomizer widgets for use during the event:
  - Dice roller, coin flip, spinning wheel
  - Random movie picker, card deck, fortune ball
  - Tarot card draw, hash-based image generator, game cover viewer
- **Games** — catalog of all games that have participated in the event
- **Seasons** — history and rosters of all past seasons

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment

| Variable | Description |
|---|---|
| `VITE_S3_BASE_URL` | Base URL for S3-hosted assets (posters, logos, images, game rules Markdown) |
| `VITE_HF_TOKEN` | Hugging Face API token for the game cover image generator (FLUX.1-schnell) |
| `VITE_TMDB_API_KEY` | TMDB API key for the random movie picker |
