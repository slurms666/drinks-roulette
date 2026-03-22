# 3310 Game Hub

3310 Game Hub is a static retro web project by Pebbs.app that recreates the feel of a monochrome late-1990s mobile game hub in the browser. The site uses a Nokia-3310-inspired phone shell, a zoomed LCD-style screen viewport, original CSS art, original Web Audio bleeps, and 10 playable HTML5 canvas mini-games.

## What is included

- A single-page retro phone interface with a main menu and game shelf
- 10 playable mini-games:
  - Snake
  - Star Blaster
  - Seed Pits
  - Memory Match
  - Quick Tap
  - Block Stack
  - Spring Dot
  - Road Dodge
  - Tone Tap
  - Wall Breaker
- Shared keyboard controls across the whole site
- A visible sound toggle plus in-menu sound control
- First-play instruction overlays and clean exit back to the menu
- No backend, no APIs, no build step, and no external copyrighted assets

## File structure

- `index.html`
- `styles.css`
- `js/core.js`
- `js/audio.js`
- `js/main.js`
- `js/games/snake.js`
- `js/games/shooter.js`
- `js/games/mancala.js`
- `js/games/memory.js`
- `js/games/reaction.js`
- `js/games/blocks.js`
- `js/games/bounce.js`
- `js/games/racer.js`
- `js/games/simon.js`
- `js/games/breaker.js`

## How to run locally

No install step is required.

### Fastest option

1. Open `index.html` in a desktop browser.
2. Click once anywhere or press a key to unlock browser audio.
3. Play with the keyboard.

### Local static server option

If you prefer a local server, run one of these commands from `C:\Users\work\Desktop\Projects\fish pie`:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Controls

- `Arrow keys`: navigate menus and move in games
- `Enter`: confirm, start, or use the primary action
- `Space`: secondary action where a game uses one
- `Escape` or `Backspace`: go back, close the current screen, or quit the active game
- `M`: mute or unmute
- `R`: restart the active game
- `I`: reopen the current game's help overlay

## Game notes

- Every game has a start state, active play state, and win or game-over state.
- Each game can be restarted with `R`.
- Each game can be exited cleanly with `Escape` or `Backspace`.
- The first launch of each game shows an instruction overlay automatically.

## Deployment on Vercel

This project is already static and deploys cleanly as a standalone frontend site.

### Deploy steps

1. Push this repo to GitHub.
2. In Vercel, choose **Add New Project**.
3. Import the GitHub repository.
4. Keep the project as a static site. No backend configuration is needed.
5. Leave the build command empty if Vercel offers that option, or let Vercel detect the root `index.html`.
6. Set the root directory to the repository root.
7. Deploy.

### Assign the custom domain

1. Open the deployed Vercel project.
2. Go to **Settings > Domains**.
3. Add `3310.pebbs.app`.
4. Follow the DNS instructions Vercel gives you for the Pebbs.app DNS provider.
5. Confirm the domain resolves to the new static deployment.

## Design and legal note

This project is inspired by the era of early mobile phone gaming, but it does not use official Nokia logos, copyrighted sprites, copyrighted game code, or scraped nostalgia artwork. The art direction, sound, UI chrome, and gameplay implementations in this repo are original.
