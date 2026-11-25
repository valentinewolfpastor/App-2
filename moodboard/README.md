# Mood Almanac

Moodboards for seasons, events and places. Upload photos and they're laid out as a board, with a colour palette drawn from them and a slow full-screen view for looking at them.

**Live app:** https://claude.ai/artifact/RHCWDNQFaxnSCp83DLDtuV (private to the owner)

## What you can do

- **Boards:** create a board for Spring, Summer, Autumn, Winter, an event (with a date), a place, or anything else. Filter the home page by type.
- **Photos:** add them with the button, by dragging files onto a board, or by pasting an image. Photos are resized to 2000px on the long side before upload.
- **Arrange:** switch between Collage (masonry) and Grid. Make a photo larger, move it earlier or later, set the cover, write a caption, or remove it.
- **Palette:** colours are picked from every photo and merged into a board palette. Tap a swatch to copy its hex code.
- **Contemplate:** a dark full-screen slideshow that opens on the board's name and reflection, then drifts slowly through the photos. Use the arrow keys, space to pause and Esc to close.
- **Reflect with Claude:** Claude looks at up to six photos, plus your notes and captions, and writes a short reflection, a few mood words and a title suggestion.

## How it works

`index.html` is a single-file page published as a Claude artifact. It uses these runtime capabilities:

- `db` + `user`: each board is one private document at `data/users/<id>/board-<id>`.
- `assets`: photos are stored as artifact assets and referenced from the board by asset id.
- `sample` (with images): the Claude reflection, run on the viewer's own Claude account.

Opened outside Claude, the page saves boards in browser storage and photos in IndexedDB.

To update the live app, edit `index.html` and republish it to the same artifact URL.
