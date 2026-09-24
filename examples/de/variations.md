---
title: Kommentare und Varianten auf Schachbrettern
lang: de
mathjax: no
author: Deniz
description: Wie das Brett PGN-Kommentare liest und Varianten mit der V-Taste abspielt
---

# Kommentare und Varianten auf Schachbrettern

Das Brett liest Kommentare aus der PGN und spricht sie nach dem Zug. Eine
Alternative steht direkt im Kommentar in Dollar-Klammern — sie ersetzt den Zug
und wird mit der V-Taste abgespielt.

## Italienische Partie mit Varianten

```chess
pgn=https://cdn.jsdelivr.net/gh/denizsincar29/chessjax@v0.8.6/examples/variations.pgn
move=3
```

Was man ausprobieren kann:

- **Strg+← und Strg+→** — vorheriger und nächster Zug; nach einem Zug mit
  Kommentar sagt der Screenreader „Kommentar: …“ und weist auf die V-Taste hin.
- **V** — die Variante abspielen, **V** erneut — das Variantenende, **Esc** — zurück
  zur Partie.
- Die Züge der Variante bekommen einen orange Rahmen.

## Wie das im Markup aussieht

Eine ganze Partie wird über einen PGN-Link angegeben, und die Zugnummer
entscheidet, wo das Brett aufgeht:

```
pgn=https://…/variations.pgn
move=3
```

Varianten und Kommentare stehen in der PGN neben dem Zug:

```
1. e4 e5 2. Nf3 { $[Bc4 Nc6] Italienische Partie — der Läufer zielt auf f7 } Nc6 …
```

Ein Kommentar hängt an der Stellung nach seinem Zug; eine Variante ersetzt den Zug
selbst und startet aus der Stellung davor.
