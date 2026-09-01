---
title: Демо mathmd
lang: ru
mathjax: yes
chessjax: yes
desmos: yes
author: Дениз
description: Формулы, шахматная доска и график Desmos в одном документе
---

# Демо mathmd

Всё в одном документе: формулы, шахматная доска и график Desmos. Вверху файла —
frontmatter, который решает, какие модули попадут в экспортированный HTML.

## Формулы

LaTeX в строке: $x^2 + y^2 = z^2$.

Формула на отдельной строке:

$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

AsciiMath через обратные кавычки: `sqrt(2x + 3) = 5`.

## График Desmos

Каждая строка блока — выражение LaTeX:

```desmos
y = x^2 - 2
y = \sin(x)
y = -x^2 + 4
```

## Шахматная доска

```chess
fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
```
