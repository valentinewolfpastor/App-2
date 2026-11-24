# Daily Habits

A simple daily habit tracker that works offline. It's a plain HTML/CSS/JS app with no build step and no account. Your data stays in your browser.

## Features

- **Today:** tap each habit as you do it. A ring shows how much of the day is done, and streaks show next to each habit. Use ‹ › to go back and log earlier days.
- **Three kinds of schedule:**
  - *Every day*
  - *Weekdays only*, e.g. no sugar during the workweek. Weekends don't break the streak.
  - *N times per week*, e.g. run once a week. The streak counts in weeks.
- **Progress:** a weekly grid (tap a square to fix a missed check-in), plus your current streak, best streak and recent consistency for each habit.
- **Habits:** add, edit, reorder or delete habits, and add habits from the suggestions with one tap.
- **Backup:** export or import your data as a JSON file, to move it between devices.
- **Installable:** add it to your home screen and it works offline. Supports dark mode.

## Run it

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

To use it on your phone, host the folder on any static host (for example GitHub Pages). Open it in Safari, then choose Share → Add to Home Screen.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | App shell, tab bar, add/edit dialog |
| `styles.css` | Styles (light and dark) |
| `app.js` | Habits, schedules, streaks, rendering, storage |
| `sw.js` | Service worker for offline use |
| `manifest.webmanifest`, `icons/` | Home-screen install |

Default habits and suggestions are defined at the top of `app.js`.
