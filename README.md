# What Should I Do? — Activity Suggester

A simple, dependency-free web app that suggests activities to beat boredom,
powered by the [Bored API](https://bored-api.appbrewery.com).

## Features

- One-click random activity suggestions (auto-suggests on load)
- Filters: **type**, **participants**, **budget**, and **kid-friendly only**
- Clean, responsive dark UI
- No build step, no dependencies — just open `index.html`

## Running it

Open `index.html` in any modern browser. The app calls the Bored API
directly from your browser, so an internet connection is required.

Or serve it locally:

```bash
# Python
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure and filter controls |
| `styles.css` | Styling (dark, responsive) |
| `app.js` | Fetches from the Bored API and renders suggestions |

## API

- No filters → `GET /random` (single activity)
- Any filter → `GET /filter?type=...&participants=...&minprice=...&maxprice=...` (array)

Activities courtesy of the [Bored API](https://bored-api.appbrewery.com).
