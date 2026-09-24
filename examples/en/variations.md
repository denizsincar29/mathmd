---
title: Comments and variations on chessboards
lang: en
mathjax: no
author: Deniz
description: How the board reads PGN comments and plays alternative lines with the V key
---

# Comments and variations on chessboards

The board reads comments out of the PGN and speaks them after the move. An
alternative line is written right inside the comment in dollar brackets — it
replaces the move and is played back with the V key.

## Italian Game with variations

```chess
pgn=https://cdn.jsdelivr.net/gh/denizsincar29/chessjax@v0.8.5/examples/variations.pgn
move=3
```

What to try:

- **Ctrl+← and Ctrl+→** — previous and next move; after a move with a comment the
  screen reader says “Comment: …” and hints “a variation is available — press V”.
- **V** — play the variation, **V** again — the final line, **Esc** — back to the game.
- Variation moves get an orange outline.

## What it looks like in the markup

A whole game is pointed at with a PGN link, and the move number decides where the
board opens:

```
pgn=https://…/variations.pgn
move=3
```

Variations and comments live in the PGN next to the move:

```
1. e4 e5 2. Nf3 { $[Bc4 Nc6] Italian game — the bishop hits f7 } Nc6 …
```

A comment is attached to the position after its move; a variation replaces the
move itself and starts from the position before it.
