---
title: Satranç tahtalarında yorumlar ve varyantlar
lang: tr
mathjax: no
author: Deniz
description: Tahta PGN yorumlarını nasıl okur ve varyantlar V tuşuyla nasıl oynatılır
---

# Satranç tahtalarında yorumlar ve varyantlar

Tahta PGN'deki yorumları okur ve hamleden sonra sesli söyler. Alternatif bir dizi
doğrudan yorumun içine dolar köşeli parantezle yazılır — o hamlenin yerine geçer ve
V tuşuyla oynatılır.

## Varyantlı İtalyan açılışı

```chess
pgn=https://cdn.jsdelivr.net/gh/denizsincar29/chessjax@v0.8.7/examples/variations.pgn
move=3
```

Denemeye değer:

- **Ctrl+← ve Ctrl+→** — önceki ve sonraki hamle; yorumlu bir hamleden sonra
  ekran okuyucu “Yorum: …” der ve V tuşunu hatırlatır.
- **V** — varyantı oynatır, tekrar **V** — varyantın sonu, **Esc** — partiye döner.
- Varyant hamlelerinin kareleri turuncu çerçeveyle işaretlenir.

## İşaretlemede nasıl görünür

Bütün parti bir PGN bağlantısıyla verilir, hamle numarası tahtanın nerede
açılacağını belirler:

```
pgn=https://…/variations.pgn
move=3
```

Varyantlar ve yorumlar PGN'de hamlenin yanında durur:

```
1. e4 e5 2. Nf3 { $[Bc4 Nc6] İtalyan açılışı — fil f7'yi hedefliyor } Nc6 …
```

Yorum, hamleden sonraki konuma bağlanır; varyant ise hamlenin kendisini değiştirir
ve ondan önceki konumdan başlar.
