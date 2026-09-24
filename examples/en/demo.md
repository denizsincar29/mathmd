---
title: mathmd demo
lang: en
mathjax: yes
author: Deniz
description: Formulas, a Desmos graph and a chessboard in one document
---

# mathmd demo

Everything in one document: formulas, a graph and a chessboard. The opening lines
between the three dashes are the frontmatter — the page title, language and
author. Modules load themselves: a formula pulls in MathJax, a desmos block pulls
in the graph, a chess block pulls in the board.

## Formulas

An inline formula is written in dollar signs: $x^2 + y^2 = z^2$, with a root next
to it: $\sqrt{2} \approx 1.41$.

A display formula uses the same pair of dollars, with blank lines around it:

$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

AsciiMath goes in backticks: `sqrt(2x + 3) = 5`.

## Graph

Every line of the block is a LaTeX expression:

```desmos
y = x^2 - 2
y = \sin(x)
y = -x^2 + 4
```

## Chessboard

A board from a position: the FEN of the Italian Game after White's fourth move.

```chess
fen="r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 1 5"
```

And this is the end of Morphy's Opera Game — a board from PGN, opened on the last
move:

```chess
pgn=https://cdn.jsdelivr.net/gh/denizsincar29/chessjax@v0.8.4/examples/morphy.pgn
move=17
```

## Ordinary markdown

**Bold**, *italic*, a [link](https://example.com) and a quote:

> A quote gets a grey bar on the left.

- the first item;
- the second item.

| What | Set with |
| --- | --- |
| Formula | a pair of dollars |
| Graph | a desmos block |
| Board | a chess block |
