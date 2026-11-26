# Bead Studio

A pattern designer for bead weaving.

**Live app:** https://claude.ai/artifact/4EG9pswomLY5Pnju9wecEA (private to the owner)

- **Layouts:** loom / square stitch, peyote (offset columns) and brick stitch (offset rows).
- **Size:** type the finished width and height in cm or inches and the app works out beads and rows (up to 400 × 400), or enter beads and rows directly.
- **Beads:** 15/0, 11/0, 8/0, 6/0 seed beads, 11/0 and 10/0 Delica cylinders, and 4, 6 and 8 mm pearls. Each one is drawn as a cylinder, round, pearl or square bead, at its real proportions.
- **Drawing:** bead (brush 1, 2, 3, 5 or 9 beads wide), remove, fill, colour picker, shapes (moon, star, heart, circle, triangle, diamond, square; filled, outline or cut out, adjustable until you tap Done), mirror (left/right, top/bottom, 4-way), undo/redo, pinch-zoom.
- **Colours:** editable named palette, plus "swap all beads of one colour to another".
- **Bead count:** beads per colour, +10% spare, grams (or pearl strands) to buy, finished size, loom warp-thread length. You can copy it as a shopping list.
- **Rows:** a row-by-row word chart ("3 Red, 2 White…") and a tracker that outlines the current row on the chart and fades the rows you've finished.
- **Photo → pattern:** fits a picture to the grid and reduces it to N colours (k-means), or to your current palette.
- **Export:** a PNG chart with a colour key.

`index.html` is published as a Claude artifact with the `db` + `user` capabilities: patterns are saved under `data/users/<id>/<patternId>`, which is private to the signed-in owner. `downloads` saves the exported image. Opened outside Claude, the page saves to browser storage instead.
