# Drinks Roulette

Drinks Roulette is a static browser app that spins between two menu sets:

- a cocktail wheel with 16 popular cocktails
- a shot wheel with 8 popular shots

The page uses vanilla HTML, CSS, and JavaScript. There is no build step, backend, or API dependency.

## What is included

- A switchable roulette wheel controlled by a dropdown
- 16 cocktail entries with short style notes
- 8 shot entries with short style notes
- Animated spin selection with a fixed top pointer
- A result panel and full lineup list that update with the winning drink
- Responsive layout for desktop and mobile

## File structure

- `index.html`
- `styles.css`
- `js/main.js`

## How to run locally

No install step is required.

### Fastest option

1. Open `index.html` in a browser.
2. Choose `Cocktails` or `Shots`.
3. Press `Spin the wheel`.

### Local static server option

If you prefer a local server, run this from `C:\Users\work\Desktop\Projects\fish pie`:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Notes

- The cocktail wheel contains 16 drinks.
- The shot wheel contains 8 drinks.
- Switching the dropdown redraws the wheel immediately.
