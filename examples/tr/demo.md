---
title: mathmd demosu
lang: tr
mathjax: yes
author: Deniz
description: Tek belgede formüller, bir Desmos grafiği ve satranç tahtası
---

# mathmd demosu

Hepsi tek belgede: formüller, bir grafik ve bir satranç tahtası. Üç çizgi
arasındaki ilk satırlar frontmatter'dır — sayfanın başlığı, dili ve yazarı.
Modüller kendilerini yükler: formül varsa MathJax, desmos bloğu varsa grafik,
chess bloğu varsa tahta gelir.

## Formüller

Satır içi formül dolar işaretleri arasına yazılır: $x^2 + y^2 = z^2$, yanında bir
karekök: $\sqrt{2} \approx 1.41$.

Ayrı satırdaki formül aynı dolar çiftini kullanır, çevresinde boş satırlarla:

$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

AsciiMath ters tırnak içine yazılır: `sqrt(2x + 3) = 5`.

## Grafik

Bloğun her satırı bir LaTeX ifadesidir:

```desmos
y = x^2 - 2
y = \sin(x)
y = -x^2 + 4
```

## Satranç tahtası

Konumdan tahta: İtalyan açılışının beyazın dördüncü hamlesinden sonraki FEN'i.

```chess
fen="r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 1 5"
```

Bu da Morphy'nin Opera Partisi'nin sonu — PGN'den bir tahta, son hamlede açılmış:

```chess
pgn=https://cdn.jsdelivr.net/gh/denizsincar29/chessjax@v0.8.1/examples/morphy.pgn
move=17
```

## Sıradan markdown

**Kalın**, *eğik*, bir [bağlantı](https://example.com) ve bir alıntı:

> Alıntının solunda gri bir şerit olur.

- birinci madde;
- ikinci madde.

| Ne | Neyle yazılır |
| --- | --- |
| Formül | bir dolar çifti |
| Grafik | bir desmos bloğu |
| Tahta | bir chess bloğu |
