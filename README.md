# Daily Rhythm

A personal daily tracker for habits, extras, food, mood and weight. Claude estimates calories and finds patterns between what you do, what you eat and how you feel.

**Live app:** https://claude.ai/artifact/9cZ21xQ7GeJ6zrV8511QMT (private to the owner)

## Tabs

- **Today:** check off daily habits (with streaks), and tap extras such as Stretch Lab, sauna or ballet when you do them. Extras are never counted as missed.
- **Food:** describe a meal, or add a photo, and Claude estimates calories and protein. You can edit any number yourself.
- **Check-in:** rate mood and energy (1–5), tap feeling tags, write notes, and log your weight (lb or kg).
- **Insights:** Claude reads your last 30 days and points out patterns. The tab also has a done-vs-skipped mood table, a weight trend chart, a weekly grid for fixing missed check-ins, and streaks.
- **Habits:** add, edit, reorder or delete habits and extras, and add suggested habits.

## Schedules

- *Every day*
- *Weekdays only*, e.g. no sugar, or no alcohol on weeknights. Weekends never break the streak.
- *N times per week*, e.g. run once a week. The streak counts in weeks.

## How it works

`index.html` is a single-file page published as a Claude artifact. It uses these artifact runtime capabilities:

- `db` + `user`: each day is one private document under `data/users/<id>/YYYY-MM-DD`, plus `config` and `insights` documents. Data syncs across devices and only the signed-in owner can read it.
- `sample` (with images): calorie estimates and pattern insights. These run on the viewer's own Claude account.

Opened outside Claude, the page falls back to browser storage and manual calorie entry.

To update the live app, edit `index.html` and republish it to the same artifact URL.
