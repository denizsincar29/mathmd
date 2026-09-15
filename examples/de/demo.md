---
title: mathmd-Demo
lang: de
mathjax: yes
author: Deniz
description: Formeln, ein Desmos-Diagramm und ein Schachbrett in einem Dokument
---

# mathmd-Demo

Alles in einem Dokument: Formeln, ein Diagramm und ein Schachbrett. Die ersten
Zeilen zwischen den drei Strichen sind das Frontmatter — Titel, Sprache und Autor
der Seite. Die Module laden sich selbst: eine Formel holt MathJax, ein
desmos-Block das Diagramm, ein chess-Block das Brett.

## Formeln

Eine Formel in der Zeile steht in Dollarzeichen: $x^2 + y^2 = z^2$, daneben eine
Wurzel: $\sqrt{2} \approx 1.41$.

Eine abgesetzte Formel nutzt dasselbe Dollarpaar, mit leeren Zeilen drumherum:

$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

AsciiMath steht in Backticks: `sqrt(2x + 3) = 5`.

## Diagramm

Jede Zeile des Blocks ist ein LaTeX-Ausdruck:

```desmos
y = x^2 - 2
y = \sin(x)
y = -x^2 + 4
```

## Schachbrett

Ein Brett aus einer Stellung: die FEN der Italienischen Partie nach dem vierten
Zug von Weiß.

```chess
fen="r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 1 5"
```

Und das ist das Ende von Morphys Opernpartie — ein Brett aus einer PGN, geöffnet
beim letzten Zug:

```chess
pgn=https://cdn.jsdelivr.net/gh/denizsincar29/chessjax@v0.8.1/examples/morphy.pgn
move=17
```

## Gewöhnliches Markdown

**Fett**, *kursiv*, ein [Link](https://example.com) und ein Zitat:

> Ein Zitat bekommt links einen grauen Balken.

- der erste Punkt;
- der zweite Punkt.

| Was | Womit gesetzt |
| --- | --- |
| Formel | ein Dollarpaar |
| Diagramm | ein desmos-Block |
| Brett | ein chess-Block |
