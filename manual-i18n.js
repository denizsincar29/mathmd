// manual-i18n.js — тексты полного руководства (manual.html).
//
// Отдельным файлом, а не в i18n.js: руководство длинное, а i18n.js грузится
// на каждой странице редактора. Здесь только ru и en — на de/tr I18N.t
// отдаёт английский (запасной язык в цепочке t()).
//
// Подключать после i18n.js: ключи доливаются в общий словарь через I18N.add,
// поэтому разметка руководства использует обычный data-i18n.
(function () {
  "use strict";
  if (!window.I18N || !window.I18N.add) return;

  window.I18N.add({
    "manual.pageTitle": {
      ru: "Руководство — математический редактор mathmd",
      en: "Manual — the mathmd math editor",
    },
    "manual.h1": {
      ru: "Полное руководство",
      en: "Complete manual",
    },
    "manual.lead": {
      ru: "Всё, что умеет редактор: markdown, формулы двумя языками, графики Desmos и шахматные доски. Написано простыми словами — читай по порядку или переходи к нужному разделу через содержание.",
      en: "Everything the editor can do: markdown, formulas in two languages, Desmos graphs and chessboards. Written in plain words — read it in order or jump to a section from the table of contents.",
    },
    "manual.backToEditor": {
      ru: "Вернуться к редактору",
      en: "Back to the editor",
    },
    "manual.tocHeading": {
      ru: "Содержание",
      en: "Contents",
    },
    "manual.toc.intro": { ru: "Введение", en: "Introduction" },
    "manual.toc.markdown": { ru: "Обычный текст и markdown", en: "Plain text and markdown" },
    "manual.toc.formulas": { ru: "Два языка формул: AsciiMath и LaTeX", en: "Two formula languages: AsciiMath and LaTeX" },
    "manual.toc.asciimath": { ru: "AsciiMath: как писать", en: "AsciiMath: how to write" },
    "manual.toc.latex": { ru: "LaTeX: как писать", en: "LaTeX: how to write" },
    "manual.toc.desmos": { ru: "Графики Desmos", en: "Desmos graphs" },
    "manual.toc.chess": { ru: "Шахматные доски", en: "Chessboards" },
    "manual.toc.keys": { ru: "Кнопки, клавиши и подсказки", en: "Buttons, keys and suggestions" },
    "manual.toc.frontmatter": { ru: "Настройки документа", en: "Document settings" },
    "manual.toc.files": { ru: "Файлы, примеры и экспорт", en: "Files, examples and export" },
    "manual.example": { ru: "Пример:", en: "Example:" },
    "manual.chessHeadAttrs": { ru: "Атрибуты", en: "Attributes" },
    "manual.chessHeadKeys": { ru: "Клавиши", en: "Keys" },
    "manual.chessHeadExport": { ru: "В готовой странице", en: "In the exported page" },

    // --- Введение -----------------------------------------------------------
    "manual.introText1": {
      ru: "mathmd — редактор в браузере. Сверху панель кнопок для вставки формул, под ней поле редактора, ниже предпросмотр: набираешь текст и сразу видишь результат. Устанавливать ничего не нужно, всё работает на обычной странице сайта.",
      en: "mathmd is an editor that runs in the browser. The formula button panel is at the top, the editor field below it, and the preview under that: you type and see the result right away. Nothing to install — it all runs on an ordinary web page.",
    },
    "manual.introText2": {
      ru: "Документ — это обычный текстовый файл <code>.md</code> с разметкой markdown. Внутри него можно писать формулы, рисовать графики и ставить шахматные доски. Файл можно скачать, открыть заново и отправить кому угодно.",
      en: "A document is a plain text <code>.md</code> file with markdown markup. It can hold formulas, graphs and chessboards. You can download it, open it again later and send it to anyone.",
    },
    "manual.introText3": {
      ru: "Кнопка «Сохранить готовый HTML» делает из документа отдельную страницу: она открывается в любом браузере, формулы и доски в ней работают, а исходный код не нужен. Это то, что стоит отдавать читателю.",
      en: "The “Export HTML” button turns the document into a standalone page: it opens in any browser with formulas and boards working, and needs no source code. This is what you hand to a reader.",
    },
    "manual.introText4": {
      ru: "Редактор рассчитан на работу с программой экранного доступа: вставки и переключения озвучиваются, формул в предпросмотре читаются как математика, а не как набор символов.",
      en: "The editor is built for screen reader use: insertions and toggles are announced, and formulas in the preview are read as mathematics, not as a jumble of characters.",
    },
    "manual.introText5": {
      ru: "Кнопка «Справка» — короткая шпаргалка на восемь пунктов. Эта страница — полное руководство.",
      en: "The “Help” button is a short eight-point cheat sheet. This page is the complete manual.",
    },

    // --- markdown -----------------------------------------------------------
    "manual.markdownIntro": {
      ru: "Markdown — это разметка обычным текстом: чтобы сделать заголовок, поставь решётку, чтобы выделить слово — звёздочки. Специальных программ не нужно, файл остаётся читаемым сам по себе.",
      en: "Markdown is markup written in plain text: put a hash for a heading, asterisks to emphasise a word. No special software — the file stays readable on its own.",
    },
    "manual.markdownList": {
      ru: "<ul>" +
        "<li><strong># Заголовок</strong> в начале строки — крупный заголовок, <code>##</code> — подзаголовок, <code>###</code> — ещё мельче.</li>" +
        "<li><strong>Пустая строка</strong> разделяет абзацы. Одна строка без пустой — продолжение того же абзаца.</li>" +
        "<li><strong>**жирный**</strong> и <strong>*курсив*</strong> — двумя и одной звёздочкой.</li>" +
        "<li><strong>Список</strong> — дефис в начале строки. Нумерованный — просто пиши <code>1.</code>, <code>2.</code>, <code>3.</code></li>" +
        "<li><strong>Ссылка</strong> — <code>[текст](адрес)</code>. Голый адрес в тексте тоже становится ссылкой.</li>" +
        "<li><strong>Цитата</strong> — знак <code>&gt;</code> в начале строки. <strong>Таблица</strong>, зачёркнутый текст и списки задач тоже работают.</li>" +
        "<li><strong>Код</strong> — обратные кавычки вокруг слова, три кавычки — целый блок.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><strong># Heading</strong> at the start of a line — a big heading, <code>##</code> — a subheading, <code>###</code> — smaller still.</li>" +
        "<li><strong>A blank line</strong> separates paragraphs. A single line break continues the same paragraph.</li>" +
        "<li><strong>**bold**</strong> and <strong>*italic*</strong> — two and one asterisk.</li>" +
        "<li><strong>A list</strong> — a dash at the start of a line. Numbered — just write <code>1.</code>, <code>2.</code>, <code>3.</code></li>" +
        "<li><strong>A link</strong> — <code>[text](address)</code>. A bare address in the text becomes a link too.</li>" +
        "<li><strong>A quote</strong> — <code>&gt;</code> at the start of a line. <strong>Tables</strong>, strikethrough and task lists work as well.</li>" +
        "<li><strong>Code</strong> — backticks around a word, three backticks around a whole block.</li>" +
        "</ul>",
    },
    "manual.markdownNote": {
      ru: "Важно: внутри формул и блоков кода markdown не действует — там символы означают сами себя. И наоборот: звёздочка в обычном тексте может случайно включить курсив, если её не экранировать обратным слэшем.",
      en: "Important: markdown does not apply inside formulas or code blocks — there the characters mean themselves. And the other way round: an asterisk in ordinary text may accidentally start italics unless you escape it with a backslash.",
    },

    // --- Два языка формул ---------------------------------------------------
    "manual.formulasIntro": {
      ru: "Формулу можно записать двумя языками: <strong>AsciiMath</strong> и <strong>LaTeX</strong>. Оба превращаются в одну и ту же аккуратную вёрстку — выбирай тот, что удобнее, и смешивай их в одном документе сколько угодно.",
      en: "A formula can be written in two languages: <strong>AsciiMath</strong> and <strong>LaTeX</strong>. Both produce the same clean typeset result — pick whichever suits you and mix them freely in one document.",
    },
    "manual.prosAscii": {
      ru: "<strong>Чем хорош AsciiMath.</strong> Он пишется почти как обычный текст: <code>sqrt(2)</code>, <code>x^2</code>, <code>(a)/(b)</code>. Нет обратных слэшей и фигурных скобок — набирать быстрее и труднее ошибиться. Экранному доступу такая формула читается короче и чище: меньше служебных символов на слух, а значит легче проверять себя.",
      en: "<strong>Why AsciiMath is good.</strong> It reads almost like plain text: <code>sqrt(2)</code>, <code>x^2</code>, <code>(a)/(b)</code>. No backslashes or curly braces — faster to type and harder to get wrong. A screen reader also speaks it more briefly: fewer service symbols to listen through, which makes proofreading easier.",
    },
    "manual.prosLatex": {
      ru: "<strong>Чем хорош LaTeX.</strong> Он полнее и точнее: сложная вёрстка, многострочные формулы, выравнивание по знаку равенства, матрицы в скобках любого вида. Это тот же язык, что в научных статьях и на Overleaf, поэтому формулу можно перенести оттуда сюда и обратно без переделки.",
      en: "<strong>Why LaTeX is good.</strong> It is fuller and more precise: complex layout, multi-line formulas, alignment on the equals sign, matrices in any kind of bracket. It is the same language used in papers and on Overleaf, so a formula can be moved in and out without rewriting.",
    },
    "manual.formulasRule": {
      ru: "Простое правило: для учёбы, конспекта и быстрых записей бери AsciiMath, для публикации и сложной вёрстки — LaTeX.",
      en: "A simple rule: for notes, study and quick writing use AsciiMath; for publication and complex layout use LaTeX.",
    },

    // --- AsciiMath ----------------------------------------------------------
    "manual.asciiIntro": {
      ru: "Формула в строке записывается в обратных кавычках: <code>`sqrt(2)`</code>. Всё, что внутри, AsciiMath понимает как математику.",
      en: "An inline formula is written between backticks: <code>`sqrt(2)`</code>. Everything inside is read as mathematics by AsciiMath.",
    },
    "manual.asciiList": {
      ru: "<ul>" +
        "<li><strong>Дробь</strong> — скобками: <code>`(a+b)/(c+d)`</code>. Скобки говорят, что стоит в числителе и знаменателе.</li>" +
        "<li><strong>Степень</strong> — крышкой: <code>`x^2`</code>, а для длинного показателя — <code>`x^(n+1)`</code>.</li>" +
        "<li><strong>Корень</strong> — <code>`sqrt(x)`</code>; корень третьей степени — <code>`root(3)(x)`</code>.</li>" +
        "<li><strong>Сумма, интеграл, предел</strong> — <code>`sum_(i=1)^n i`</code>, <code>`int_(0)^(1) x dx`</code>, <code>`lim_(x-&gt;0)`</code>. Нижний и верхний пределы — в скобках.</li>" +
        "<li><strong>Матрица</strong> — двойные квадратные скобки: <code>`[[a,b],[c,d]]`</code>. Строки разделяются запятыми внутри внешних скобок.</li>" +
        "<li><strong>Греческие буквы</strong> — словом: <code>alpha</code>, <code>beta</code>, <code>pi</code>, <code>theta</code>, <code>omega</code>, большая сигма — <code>Sigma</code>.</li>" +
        "<li><strong>Знаки</strong> — обычными символами: <code>&gt;=</code>, <code>&lt;=</code>, <code>!=</code>, <code>~=</code>, бесконечность <code>oo</code>, стрелка <code>-&gt;</code>, принадлежность <code>in</code>.</li>" +
        "<li><strong>Пробел</strong> разделяет части формулы: <code>`int x dx`</code> — так интеграл не слипнется с подынтегральным выражением.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><strong>A fraction</strong> uses brackets: <code>`(a+b)/(c+d)`</code>. The brackets say what is on top and what is below.</li>" +
        "<li><strong>A power</strong> uses a caret: <code>`x^2`</code>, and for a long exponent <code>`x^(n+1)`</code>.</li>" +
        "<li><strong>A root</strong> — <code>`sqrt(x)`</code>; a cube root — <code>`root(3)(x)`</code>.</li>" +
        "<li><strong>A sum, integral or limit</strong> — <code>`sum_(i=1)^n i`</code>, <code>`int_(0)^(1) x dx`</code>, <code>`lim_(x-&gt;0)`</code>. Lower and upper bounds go in brackets.</li>" +
        "<li><strong>A matrix</strong> — double square brackets: <code>`[[a,b],[c,d]]`</code>. Rows are separated by commas inside the outer brackets.</li>" +
        "<li><strong>Greek letters</strong> — by name: <code>alpha</code>, <code>beta</code>, <code>pi</code>, <code>theta</code>, <code>omega</code>, capital sigma is <code>Sigma</code>.</li>" +
        "<li><strong>Signs</strong> — as ordinary characters: <code>&gt;=</code>, <code>&lt;=</code>, <code>!=</code>, <code>~=</code>, infinity <code>oo</code>, arrow <code>-&gt;</code>, member of <code>in</code>.</li>" +
        "<li><strong>A space</strong> separates parts of a formula: <code>`int x dx`</code> keeps the integral from sticking to what follows.</li>" +
        "</ul>",
    },
    "manual.asciiButtons": {
      ru: "Кнопки на панели умеют вставлять и AsciiMath: переключи синтаксис по <strong>Alt+L</strong> — и кнопки будут подставлять аскиматовскую запись вместо латеховской.",
      en: "The panel buttons can insert AsciiMath too: switch the syntax with <strong>Alt+L</strong> and the buttons will insert AsciiMath forms instead of LaTeX ones.",
    },

    // --- LaTeX --------------------------------------------------------------
    "manual.latexIntro": {
      ru: "Формула в строке пишется в долларах: <code>$x^2$</code>. Формула на отдельной строке, по центру — в двойных долларах: <code>$$…$$</code>. То же самое можно записать скобками <code>\\(…\\)</code> и <code>\\[…\\]</code>.",
      en: "An inline formula goes between dollar signs: <code>$x^2$</code>. A formula on its own centred line goes between double dollars: <code>$$…$$</code>. The same works with <code>\\(…\\)</code> and <code>\\[…\\]</code>.",
    },
    "manual.latexList": {
      ru: "<ul>" +
        "<li><strong>Дробь</strong> — <code>\\frac{a}{b}</code>: первая скобка числитель, вторая знаменатель.</li>" +
        "<li><strong>Степень</strong> — <code>x^{2}</code>. Показатель длиннее одного символа всегда бери в фигурные скобки.</li>" +
        "<li><strong>Корень</strong> — <code>\\sqrt{x}</code>, корень третьей степени — <code>\\sqrt[3]{x}</code>.</li>" +
        "<li><strong>Сумма, интеграл, предел</strong> — <code>\\sum_{i=1}^{n}</code>, <code>\\int_{a}^{b}</code>, <code>\\lim_{x \\to 0}</code>.</li>" +
        "<li><strong>Матрица</strong> — <code>\\begin{pmatrix} a &amp; b \\\\ c &amp; d \\end{pmatrix}</code>. Амперсанд разделяет столбцы, двойной слэш — строки.</li>" +
        "<li><strong>Греческие буквы</strong> — с обратным слэшем: <code>\\alpha</code>, <code>\\beta</code>, <code>\\pi</code>, <code>\\theta</code>, <code>\\omega</code>, <code>\\Sigma</code>.</li>" +
        "<li><strong>Знаки</strong> — <code>\\ge</code>, <code>\\le</code>, <code>\\ne</code>, <code>\\approx</code>, <code>\\infty</code>, <code>\\in</code>, <code>\\subseteq</code>, <code>\\cup</code>, <code>\\cap</code>, <code>\\to</code>, <code>\\nabla</code>.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><strong>A fraction</strong> — <code>\\frac{a}{b}</code>: the first brace is the numerator, the second the denominator.</li>" +
        "<li><strong>A power</strong> — <code>x^{2}</code>. An exponent longer than one character always goes in curly braces.</li>" +
        "<li><strong>A root</strong> — <code>\\sqrt{x}</code>, a cube root — <code>\\sqrt[3]{x}</code>.</li>" +
        "<li><strong>A sum, integral or limit</strong> — <code>\\sum_{i=1}^{n}</code>, <code>\\int_{a}^{b}</code>, <code>\\lim_{x \\to 0}</code>.</li>" +
        "<li><strong>A matrix</strong> — <code>\\begin{pmatrix} a &amp; b \\\\ c &amp; d \\end{pmatrix}</code>. An ampersand separates columns, a double backslash separates rows.</li>" +
        "<li><strong>Greek letters</strong> — with a backslash: <code>\\alpha</code>, <code>\\beta</code>, <code>\\pi</code>, <code>\\theta</code>, <code>\\omega</code>, <code>\\Sigma</code>.</li>" +
        "<li><strong>Signs</strong> — <code>\\ge</code>, <code>\\le</code>, <code>\\ne</code>, <code>\\approx</code>, <code>\\infty</code>, <code>\\in</code>, <code>\\subseteq</code>, <code>\\cup</code>, <code>\\cap</code>, <code>\\to</code>, <code>\\nabla</code>.</li>" +
        "</ul>",
    },
    "manual.latexTips": {
      ru: "Две частые ошибки: забытый закрывающий доллар (формула тогда тянется до конца документа) и степень без фигурных скобок — <code>x^10</code> даст икс в первой степени и ноль рядом, правильно <code>x^{10}</code>. Подсказки сами появляются внутри формулы: начни печатать <code>\\fr</code> и увидишь <code>\\frac</code>. Кнопка формулы на панели всегда вставляет доллары, то есть LaTeX.",
      en: "Two common mistakes: a forgotten closing dollar (the formula then runs to the end of the document), and a power without braces — <code>x^10</code> gives x to the first power with a zero after it; write <code>x^{10}</code>. Suggestions appear by themselves inside a formula: start typing <code>\\fr</code> and you will see <code>\\frac</code>. The formula button on the panel always inserts dollars, that is LaTeX.",
    },

    // --- Desmos -------------------------------------------------------------
    "manual.desmosIntro": {
      ru: "График рисуется блоком <code>```desmos</code>. Каждая строка внутри — отдельное выражение, ровно как в калькуляторе Desmos: можно задать функцию, точку, неравенство или окружность.",
      en: "A graph is drawn with a <code>```desmos</code> block. Each line inside is a separate expression, exactly as in the Desmos calculator: a function, a point, an inequality or a circle.",
    },
    "manual.desmosAttrs": {
      ru: "Блок без лишних атрибутов: всё, что нужно, — выражения. В предпросмотре график можно рассматривать и тянуть мышью, он живой. Чтобы графики работали в сохранённом HTML, включи в настройках документа модуль <code>desmos: yes</code> — иначе в готовой странице останется пустое место.",
      en: "The block needs no extra attributes: the expressions are all it takes. In the preview the graph is live and can be dragged with the mouse. For graphs to work in the exported HTML, switch the module on in the document settings with <code>desmos: yes</code> — otherwise the saved page keeps an empty space.",
    },
    "manual.desmosRefresh": {
      ru: "Если график не появился или замер, нажми <strong>Alt+ё</strong> — полный предпросмотр пересоздаёт графики заново.",
      en: "If a graph does not appear or freezes, press <strong>Alt+`</strong> — the full preview rebuilds the graphs from scratch.",
    },

    // --- Шахматы ------------------------------------------------------------
    "manual.chessIntro": {
      ru: "Доска ставится блоком <code>```chess</code>. Позицию можно задать расстановкой (<code>fen</code>), а можно целой партией из PGN-файла (<code>pgn</code>) с переходом на нужный ход (<code>move</code>).",
      en: "A board is placed with a <code>```chess</code> block. The position can be given as a layout (<code>fen</code>) or as a whole game from a PGN file (<code>pgn</code>) with a jump to a given move (<code>move</code>).",
    },
    "manual.chessAttrs": {
      ru: "<ul>" +
        "<li><code>fen=\"…\"</code> — позиция. Расстановка вроде <code>rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1</code> — начальная.</li>" +
        "<li><code>pgn=\"адрес\"</code> — партия из файла, <code>move=\"10\"</code> — сразу перейти к десятому ходу.</li>" +
        "<li><code>id=\"имя\"</code> — имя доски. По нему из текста можно сделать кнопку «перейти к ходу»: <code>&lt;button chess=\"имя\" move=\"29\"&gt;</code> (в экспорт кнопки не попадают, они для предпросмотра).</li>" +
        "<li><code>lang=\"ru\"</code> — язык доски: ru, en, de, tr.</li>" +
        "<li><code>controls=\"off\"</code> — убрать кнопки под доской, <code>sound=\"off\"</code> — без звуков, <code>tone=\"off\"</code> — без тональных отметок в разборе.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><code>fen=\"…\"</code> — a position. <code>rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1</code> is the starting one.</li>" +
        "<li><code>pgn=\"address\"</code> — a game from a file, <code>move=\"10\"</code> — jump straight to move ten.</li>" +
        "<li><code>id=\"name\"</code> — the board's name. Text can then link a button to it: <code>&lt;button chess=\"name\" move=\"29\"&gt;</code> (buttons do not survive export; they are for the preview).</li>" +
        "<li><code>lang=\"ru\"</code> — the board language: ru, en, de, tr.</li>" +
        "<li><code>controls=\"off\"</code> — hide the buttons under the board, <code>sound=\"off\"</code> — no sounds, <code>tone=\"off\"</code> — no pitch marks during analysis.</li>" +
        "</ul>",
    },
    "manual.chessKeys": {
      ru: "Доска — обычная таблица с фокусом на клетке, поэтому читается экранным доступом. Стрелки ходят по клеткам и называют их («чёрная пешка b7», пустая — «e5»). Дальше: <strong>Ctrl+←/→</strong> — назад и вперёд по ходу партии, <strong>Space</strong> — продолжить или пауза, <strong>Ctrl+Space</strong> — автопроигрывание с начала, <strong>Ctrl+↑/↓</strong> — быстрее и медленнее, <strong>V</strong> — вариант из комментария, <strong>Esc</strong> — выйти из варианта, <strong>F</strong> — во весь экран, <strong>B</strong> — лучший ход по Stockfish, <strong>A</strong> — разбор всей партии, <strong>H</strong> — помощь по разделам. Удержание <strong>A</strong> две секунды включает шутливые оценки.",
      en: "The board is an ordinary table with focus on a square, so a screen reader can read it. Arrows move across the squares and name them (“black pawn b7”; an empty square is “e5”). Then: <strong>Ctrl+←/→</strong> — back and forward through the game, <strong>Space</strong> — continue or pause, <strong>Ctrl+Space</strong> — auto-play from the start, <strong>Ctrl+↑/↓</strong> — faster and slower, <strong>V</strong> — a variation from a comment, <strong>Esc</strong> — leave the variation, <strong>F</strong> — fullscreen, <strong>B</strong> — best move by Stockfish, <strong>A</strong> — analyse the whole game, <strong>H</strong> — section-by-section help. Holding <strong>A</strong> for two seconds turns on informal verdicts.",
    },
    "manual.chessExport": {
      ru: "Чтобы доски работали в сохранённой странице, включи в настройках документа <code>chessjax: yes</code>. Комментарии из PGN читаются вместе с ходом, а вариант в комментарии записывается в квадратных скобках после знака доллара: <code>$[Bc4 Nc6]</code>.",
      en: "For boards to work in the exported page, switch on <code>chessjax: yes</code> in the document settings. Comments from the PGN are spoken together with the move, and a variation inside a comment is written in square brackets after a dollar sign: <code>$[Bc4 Nc6]</code>.",
    },

    // --- Клавиши ------------------------------------------------------------
    "manual.keysList": {
      ru: "<ul>" +
        "<li><strong>Alt+ё</strong> — полный предпросмотр: пересоздать графики и перейти к тому месту, где стоит курсор. <strong>Ctrl+Shift+Enter</strong> — спрятать предпросмотр.</li>" +
        "<li><strong>Alt+M</strong> — следующая формула будет в строке или отдельным блоком. <strong>Alt+L</strong> — синтаксис: LaTeX или AsciiMath.</li>" +
        "<li><strong>Alt+1 … Alt+9, Alt+0, Alt+-, Alt+=</strong> — вставить дробь, корень, сумму и другие заготовки. Те же номера написаны на кнопках.</li>" +
        "<li><strong>Ctrl+Space</strong> — подсказки: делимитеры, блоки, ключи настроек, разметка markdown. Внутри формулы подсказки появляются сами.</li>" +
        "<li><strong>F1</strong> — палитра команд: там собраны все действия редактора, включая предпросмотр, экспорт и смену языка. Если браузер перехватывает F1 (некоторые сборки открывают по ней свою справку) — есть Ctrl+Alt+P, его не занимает никто. А Ctrl+Shift+P лучше не привыкать: в Firefox это приватное окно.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><strong>Alt+`</strong> — full preview: rebuild the graphs and jump to the cursor line. <strong>Ctrl+Shift+Enter</strong> — hide the preview.</li>" +
        "<li><strong>Alt+M</strong> — the next formula goes inline or as a separate block. <strong>Alt+L</strong> — the syntax: LaTeX or AsciiMath.</li>" +
        "<li><strong>Alt+1 … Alt+9, Alt+0, Alt+-, Alt+=</strong> — insert a fraction, a root, a sum and other templates. The same numbers are printed on the buttons.</li>" +
        "<li><strong>Ctrl+Space</strong> — suggestions: delimiters, blocks, settings keys, markdown markup. Inside a formula they appear by themselves.</li>" +
        "<li><strong>F1</strong> — the command palette: every editor action lives there, including preview, export and language switching. If your browser takes F1 for its own help, use Ctrl+Alt+P — no browser claims it. And do not get used to Ctrl+Shift+P: in Firefox it opens a private window.</li>" +
        "</ul>",
    },
    "manual.keysButtons": {
      ru: "Кнопки работают с выделением: выдели текст и нажми кнопку — выделение обернётся в формулу. Без выделения кнопка вставит заготовку и поставит курсор в нужное место.",
      en: "The buttons work with a selection: select text and press a button — the selection is wrapped in a formula. Without a selection the button inserts a template and puts the cursor where it belongs.",
    },

    // --- Frontmatter --------------------------------------------------------
    "manual.fmIntro": {
      ru: "Настройки документа пишутся в самом начале файла, между двумя строками с тремя дефисами. Так задаётся заголовок страницы, язык и то, какие модули подключать в готовый HTML.",
      en: "Document settings go at the very top of the file, between two lines of three dashes. This is where the page title, the language and the modules to load into the exported HTML are set.",
    },
    "manual.fmList": {
      ru: "<ul>" +
        "<li><code>title</code> — заголовок документа, <code>author</code> и <code>description</code> — автор и описание.</li>" +
        "<li><code>lang</code> — язык документа: ru, en, de, tr.</li>" +
        "<li><code>mathjax</code> — включён по умолчанию; <code>mathjax: no</code> оставит формулы как есть, без вёрстки.</li>" +
        "<li><code>chessjax: yes</code> и <code>desmos: yes</code> — подключить шахматные доски и графики к сохранённой странице (по умолчанию выключены).</li>" +
        "<li><code>css: адрес</code> — подключить свой файл стилей к готовой странице.</li>" +
        "<li><code>chess:</code> с отступом — общие настройки всех досок: <code>lang</code>, <code>tone</code>, <code>sound</code>, <code>controls</code>. У <code>desmos:</code> и <code>mathjax:</code> вложенно пишутся их собственные опции.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><code>title</code> — the document title; <code>author</code> and <code>description</code> — author and description.</li>" +
        "<li><code>lang</code> — the document language: ru, en, de, tr.</li>" +
        "<li><code>mathjax</code> — on by default; <code>mathjax: no</code> leaves formulas as they are, untypeset.</li>" +
        "<li><code>chessjax: yes</code> and <code>desmos: yes</code> — load chessboards and graphs into the exported page (off by default).</li>" +
        "<li><code>css: address</code> — attach your own stylesheet to the exported page.</li>" +
        "<li><code>chess:</code> with indentation — settings for every board: <code>lang</code>, <code>tone</code>, <code>sound</code>, <code>controls</code>. Under <code>desmos:</code> and <code>mathjax:</code> their own options go the same way.</li>" +
        "</ul>",
    },
    "manual.fmHow": {
      ru: "Быстрее всего не печатать блок руками, а вставить его командой из палитры (<strong>F1</strong>, «Вставить frontmatter») — заготовка появится сама и курсор встанет на нужное место. Если начать документ с трёх дефисов, блок развернётся и закроется автоматически.",
      en: "The quickest way is not to type the block by hand but to insert it from the palette (<strong>F1</strong>, “Insert frontmatter”) — the template appears with the cursor in the right place. If you start a document with three dashes, the block unfolds and closes by itself.",
    },

    // --- Файлы --------------------------------------------------------------
    "manual.filesList": {
      ru: "<ul>" +
        "<li><strong>Показать предпросмотр</strong> — то же, что Alt+ё.</li>" +
        "<li><strong>Сохранить готовый HTML</strong> — страница для чтения и раздачи, с формулами и, если включено, с досками и графиками.</li>" +
        "<li><strong>Скачать .md</strong> — сохранить исходник, чтобы вернуться к работе позже.</li>" +
        "<li><strong>Открыть .md</strong> — открыть файл с диска.</li>" +
        "<li><strong>Пример:</strong> — готовые документы: демо редактора, партия Морфи и пример с комментариями и вариантами.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><strong>Show preview</strong> — the same as Alt+`.</li>" +
        "<li><strong>Export HTML</strong> — a page for reading and sharing, with formulas and, if switched on, boards and graphs.</li>" +
        "<li><strong>Download .md</strong> — save the source to come back to later.</li>" +
        "<li><strong>Open .md</strong> — open a file from disk.</li>" +
        "<li><strong>Example:</strong> — ready-made documents: the editor demo, Morphy's game, and a sample with comments and variations.</li>" +
        "</ul>",
    },

    // --- Документы и история ------------------------------------------------
    "manual.toc.docs": {
      ru: "Документы, автосохранение и история",
      en: "Documents, autosave and history",
    },
    "manual.docsIntro": {
      ru: "Документы живут в самом браузере и никуда не отправляются. Список " +
        "<strong>Документ:</strong> в панели «Файл и вывод» открывает сохранённое, " +
        "последний его пункт — <strong>Новый документ</strong>. Пока документ не " +
        "сохранён под своим именем, он называется untitled1.md, untitled2.md и так " +
        "далее. Когда вы первый раз скачиваете безымянный документ, редактор " +
        "спрашивает имя — дальше файл и документ называются одинаково.",
      en: "Documents live in your own browser and are never sent anywhere. The " +
        "<strong>Document:</strong> list in the “File and output” panel opens a " +
        "saved document; its last item is <strong>New document</strong>. Until you " +
        "save a document under your own name it is called untitled1.md, untitled2.md " +
        "and so on. The first time you download an unnamed document the editor asks " +
        "for a name — from then on the file and the document share it.",
    },
    "manual.docsAutosave": {
      ru: "Текст сохраняется сам: через пять секунд тишины после правки и сразу при " +
        "закрытии вкладки. Возвращаетесь на сайт — документ открывается на том же " +
        "месте. Если страницу открыли по ссылке с примером (<code>?example=…</code>), " +
        "пример загрузится только тогда, когда документ пуст: иначе он не станет " +
        "затирать написанное.",
      en: "The text saves itself: five seconds after you stop typing, and " +
        "immediately when the tab closes. Come back to the site and the document opens " +
        "where you left it. If the page was opened through an example link " +
        "(<code>?example=…</code>), the example loads only when the document is empty — " +
        "it will not overwrite what you have written.",
    },
    "manual.docsHistory": {
      ru: "История правок хранится снимками: примерно один на каждые две минуты " +
        "работы, не больше тридцати на документ. <strong>Ctrl+Alt+Z</strong> — шаг " +
        "назад по этим снимкам, <strong>Ctrl+Alt+Y</strong> — шаг вперёд. В отличие " +
        "от обычного Ctrl+Z, который действует только внутри текущего сеанса, снимки " +
        "переживают перезагрузку страницы. Переименовать документ, удалить его или " +
        "стереть всё хранилище можно из палитры команд (F1).",
      en: "The edit history is kept as snapshots: roughly one per two minutes of " +
        "work, at most thirty per document. <strong>Ctrl+Alt+Z</strong> steps back " +
        "through them, <strong>Ctrl+Alt+Y</strong> steps forward. Unlike plain Ctrl+Z, " +
        "which only works inside the current session, these snapshots survive a page " +
        "reload. You can rename a document, delete it, or wipe the whole store from the " +
        "command palette (F1).",
    },
  });
})();
