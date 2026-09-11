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
    "manual.copyCode": { ru: "Скопировать код", en: "Copy code" },
    "manual.copied": { ru: "Код скопирован в буфер обмена.", en: "Code copied to the clipboard." },
    "manual.copyFailed": { ru: "Не удалось скопировать. Выделите код и скопируйте вручную.", en: "Could not copy. Select the code and copy it by hand." },
    "manual.previewLabel": { ru: "Предпросмотр", en: "Preview" },
    "manual.markdownExample": {
      ru: "Ниже собрана вся разметка сразу. Это и код, и результат: после кода показано, как он выглядит в готовом документе.",
      en: "Below, all the markup is collected in one place. It is both code and result: after the code you see how it looks in a finished document.",
    },
    "manual.chessHeadAttrs": { ru: "Атрибуты", en: "Attributes" },
    "manual.chessHeadKeys": { ru: "Клавиши", en: "Keys" },
    "manual.chessHeadExport": { ru: "В готовой странице", en: "In the exported page" },

    // --- Введение -----------------------------------------------------------
    "manual.introText1": {
      ru: "mathmd существует ради одной задачи: чтобы незрячий автор мог самостоятельно написать и опубликовать документ с математикой. Всё делается в браузере, только с клавиатуры и с опорой на программу экранного доступа. Формулы, графики и шахматные доски доступны на слух, а не только на глаз.",
      en: "mathmd exists for one purpose: to let a blind author write and publish a document with mathematics independently. Everything happens in the browser, from the keyboard alone, with a screen reader as the main instrument. Formulas, graphs and chessboards are available by ear, not only by eye.",
    },
    "manual.introText2": {
      ru: "Вторая задача — оформление. Написанное здесь превращается в аккуратно свёрстанную страницу: заголовки, списки, формулы, графики и шахматные доски выглядят так, как их принято видеть в публикации. Программа вёрстки для этого не нужна.",
      en: "The second purpose is presentation. What you write here becomes a properly typeset page: headings, lists, formulas, graphs and chessboards look the way they are expected to look in a publication. No typesetting program is required.",
    },
    "manual.introText3": {
      ru: "Устроен редактор просто: сверху панель кнопок для вставки формул, под ней поле редактора, ниже предпросмотр. Изменения видны сразу. Устанавливать ничего не нужно — это обычная страница сайта.",
      en: "The editor itself is simple: a formula button panel at the top, the editor field below it, the preview under that. Changes are visible at once. Nothing has to be installed — it is an ordinary web page.",
    },
    "manual.introText4": {
      ru: "Документ — обычный текстовый файл <code>.md</code> с разметкой markdown. Внутри него могут быть формулы, графики и шахматные доски. Файл можно скачать, открыть заново, править в любом текстовом редакторе и передать другому человеку. Кнопка «Сохранить готовый HTML» делает из него отдельную страницу для чтения: она открывается в любом браузере, а исходный код читателю не нужен.",
      en: "A document is a plain text <code>.md</code> file with markdown markup. It can hold formulas, graphs and chessboards. You can download it, open it again, edit it in any text editor and hand it to someone else. The “Export HTML” button turns it into a standalone page for reading: it opens in any browser, and the reader needs no source code.",
    },
    "manual.introText5": {
      ru: "Кнопка «Справка» в редакторе — краткая справка на восемь пунктов. Эта страница — полное руководство.",
      en: "The “Help” button in the editor is a short eight-point reference. This page is the complete manual.",
    },

    // --- markdown -----------------------------------------------------------
    "manual.markdownIntro": {
      ru: "Markdown — это разметка обычным текстом. Специальных программ не нужно, файл остаётся читаемым сам по себе, а разметка состоит из обычных символов: <code>#</code>, <code>*</code>, <code>-</code>, <code>&gt;</code>.",
      en: "Markdown is markup written in plain text. No special software is needed, the file stays readable on its own, and the markup consists of ordinary characters: <code>#</code>, <code>*</code>, <code>-</code>, <code>&gt;</code>.",
    },
    "manual.markdownList": {
      ru: "<ul>" +
        "<li><strong>Заголовок.</strong> Чтобы написать заголовок, перед строкой ставится знак <code>#</code>. Один знак — заголовок первого уровня, два — второго, пять — пятого.</li>" +
        "<li><strong>Абзац.</strong> Абзацы разделяются пустой строкой. Если пустой строки нет, следующие строки продолжают тот же абзац.</li>" +
        "<li><strong>Выделение.</strong> <code>**жирный**</code> — два знака <code>*</code> с обеих сторон слова, <code>*курсив*</code> — один знак.</li>" +
        "<li><strong>Список.</strong> Каждый пункт начинается с дефиса и пробела. Нумерованный список — с числа и точки: <code>1.</code>, <code>2.</code>, <code>3.</code></li>" +
        "<li><strong>Ссылка.</strong> <code>[текст](адрес)</code>. Адрес, написанный в тексте без разметки, тоже становится ссылкой.</li>" +
        "<li><strong>Цитата.</strong> Знак <code>&gt;</code> в начале строки. Так же работают таблицы, зачёркнутый текст и списки задач.</li>" +
        "<li><strong>Код.</strong> Обратные кавычки вокруг слова, три обратные кавычки — вокруг целого блока.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><strong>A heading.</strong> To write a heading, put the character <code>#</code> before the line. One character is a first-level heading, two a second-level, five a fifth-level.</li>" +
        "<li><strong>A paragraph.</strong> Paragraphs are separated by a blank line. Without a blank line the following lines continue the same paragraph.</li>" +
        "<li><strong>Emphasis.</strong> <code>**bold**</code> — two <code>*</code> characters on either side of the word, <code>*italic*</code> — one character.</li>" +
        "<li><strong>A list.</strong> Each item starts with a dash and a space. A numbered list starts with a figure and a dot: <code>1.</code>, <code>2.</code>, <code>3.</code></li>" +
        "<li><strong>A link.</strong> <code>[text](address)</code>. An address written plainly in the text also becomes a link.</li>" +
        "<li><strong>A quote.</strong> The character <code>&gt;</code> at the start of a line. Tables, strikethrough and task lists work the same way.</li>" +
        "<li><strong>Code.</strong> Backticks around a word, three backticks around a whole block.</li>" +
        "</ul>",
    },
    "manual.markdownNote": {
      ru: "Внутри формул и блоков кода markdown не действует: там символы означают сами себя. В обычном тексте знак <code>*</code> может случайно начать курсив — в этом случае перед ним ставят обратный слэш.",
      en: "Inside formulas and code blocks markdown does not apply: there the characters mean themselves. In ordinary text the character <code>*</code> may accidentally start italics; in that case a backslash is placed before it.",
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
        "<li><strong>Степень</strong> — знаком <code>^</code>: <code>`x^2`</code>, а для длинного показателя — <code>`x^(n+1)`</code>.</li>" +
        "<li><strong>Корень</strong> — <code>`sqrt(x)`</code>; корень третьей степени — <code>`root(3)(x)`</code>.</li>" +
        "<li><strong>Сумма, интеграл, предел</strong> — <code>`sum_(i=1)^n i`</code>, <code>`int_(0)^(1) x dx`</code>, <code>`lim_(x-&gt;0)`</code>. Нижний и верхний пределы — в скобках.</li>" +
        "<li><strong>Матрица</strong> — двойные квадратные скобки: <code>`[[a,b],[c,d]]`</code>. Строки разделяются запятыми внутри внешних скобок.</li>" +
        "<li><strong>Греческие буквы</strong> — словом: <code>alpha</code>, <code>beta</code>, <code>pi</code>, <code>theta</code>, <code>omega</code>, большая сигма — <code>Sigma</code>.</li>" +
        "<li><strong>Знаки</strong> — обычными символами: <code>&gt;=</code>, <code>&lt;=</code>, <code>!=</code>, <code>~=</code>, бесконечность <code>oo</code>, стрелка <code>-&gt;</code>, принадлежность <code>in</code>.</li>" +
        "<li><strong>Пробел</strong> разделяет части формулы: <code>`int x dx`</code> — подынтегральное выражение не присоединяется к знаку интеграла.</li>" +
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
      ru: "Кнопки панели умеют вставлять формулы и в записи AsciiMath. Чтобы переключить язык формул, нажми <strong>Alt+L</strong>: после этого кнопки вставляют AsciiMath вместо LaTeX.",
      en: "The panel buttons can insert formulas in AsciiMath notation as well. To switch the formula language, press <strong>Alt+L</strong>: from then on the buttons insert AsciiMath instead of LaTeX.",
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
      ru: "Две частые ошибки: забытый закрывающий доллар (тогда формула продолжается до конца документа) и степень без фигурных скобок — <code>x^10</code> даст икс в первой степени и ноль рядом, правильно <code>x^{10}</code>. Подсказки сами появляются внутри формулы: начни печатать <code>\\fr</code> и увидишь <code>\\frac</code>. Кнопка формулы на панели всегда вставляет доллары, то есть LaTeX.",
      en: "Two common mistakes: a forgotten closing dollar (the formula then runs to the end of the document), and a power without braces — <code>x^10</code> gives x to the first power with a zero after it; write <code>x^{10}</code>. Suggestions appear by themselves inside a formula: start typing <code>\\fr</code> and you will see <code>\\frac</code>. The formula button on the panel always inserts dollars, that is LaTeX.",
    },

    // --- Desmos -------------------------------------------------------------
    "manual.desmosIntro": {
      ru: "График рисуется блоком <code>```desmos</code>. Каждая строка внутри — отдельное выражение, ровно как в калькуляторе Desmos: можно задать функцию, точку, неравенство или окружность.",
      en: "A graph is drawn with a <code>```desmos</code> block. Each line inside is a separate expression, exactly as in the Desmos calculator: a function, a point, an inequality or a circle.",
    },
    "manual.desmosAttrs": {
      ru: "Блок не требует атрибутов: всё, что нужно, — выражения. В предпросмотре график живой, его можно тянуть мышью. В готовую страницу Desmos подключается сам, как только в документе есть хотя бы один такой блок.",
      en: "The block needs no attributes: the expressions are all it takes. In the preview the graph is live and can be dragged with the mouse. In the exported page Desmos is loaded by itself as soon as the document contains at least one such block.",
    },
    "manual.desmosKeys": {
      ru: "График доступен и с клавиатуры. Чтобы войти в калькулятор Desmos, поставь курсор на текст перед графиком и нажми <strong>Tab</strong>. Когда Tab приведёт в список выражений, нажми <strong>Alt+T</strong> — откроется плоскость координат, доступная программе экранного доступа. На ней стрелки влево и вправо перемещают по оси X, а высота тона сообщает значение Y. Клавиша <strong>H</strong> проводит по всему графику слева направо звуком.",
      en: "The graph is reachable from the keyboard as well. To enter the Desmos calculator, put the cursor on the text before the graph and press <strong>Tab</strong>. When Tab brings you into the list of expressions, press <strong>Alt+T</strong> — a coordinate plane opens, accessible to a screen reader. On it the left and right arrows move along the X axis, and the pitch of the tone reports the value of Y. The <strong>H</strong> key sweeps the whole graph from left to right in sound.",
    },
    "manual.desmosRefresh": {
      ru: "Если график не появился или перестал отвечать, нажми <strong>Alt+ё</strong> — полный предпросмотр пересоздаёт графики заново.",
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
        "<li><code>id=\"имя\"</code> — имя доски. По нему из текста делается кнопка перехода к ходу: <code>&lt;button chess=\"имя\" move=\"29\"&gt;</code>. Кнопка работает и в предпросмотре, и в готовой странице.</li>" +
        "<li><code>lang=\"ru\"</code> — язык доски: ru, en, de, tr.</li>" +
        "<li><code>controls=\"off\"</code> — убрать кнопки под доской, <code>sound=\"off\"</code> — без звуков, <code>tone=\"off\"</code> — без тональных отметок в разборе.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><code>fen=\"…\"</code> — a position. <code>rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1</code> is the starting one.</li>" +
        "<li><code>pgn=\"address\"</code> — a game from a file, <code>move=\"10\"</code> — jump straight to move ten.</li>" +
        "<li><code>id=\"name\"</code> — the board's name. Text can then link a button to it: <code>&lt;button chess=\"name\" move=\"29\"&gt;</code>. The button works both in the preview and in the exported page.</li>" +
        "<li><code>lang=\"ru\"</code> — the board language: ru, en, de, tr.</li>" +
        "<li><code>controls=\"off\"</code> — hide the buttons under the board, <code>sound=\"off\"</code> — no sounds, <code>tone=\"off\"</code> — no pitch marks during analysis.</li>" +
        "</ul>",
    },
    "manual.chessKeys": {
      ru: "Доска — обычная таблица с фокусом на клетке, поэтому читается экранным доступом. Стрелки ходят по клеткам и называют их («чёрная пешка b7», пустая — «e5»). Дальше: <strong>Ctrl+←/→</strong> — назад и вперёд по ходу партии, <strong>Space</strong> — продолжить или пауза, <strong>Ctrl+Space</strong> — автопроигрывание с начала, <strong>Ctrl+↑/↓</strong> — быстрее и медленнее, <strong>V</strong> — вариант из комментария, <strong>Esc</strong> — выйти из варианта, <strong>F</strong> — во весь экран, <strong>B</strong> — лучший ход по Stockfish, <strong>A</strong> — разбор всей партии, <strong>H</strong> — помощь по разделам. Удержание <strong>A</strong> две секунды включает шутливые оценки.",
      en: "The board is an ordinary table with focus on a square, so a screen reader can read it. Arrows move across the squares and name them (“black pawn b7”; an empty square is “e5”). Then: <strong>Ctrl+←/→</strong> — back and forward through the game, <strong>Space</strong> — continue or pause, <strong>Ctrl+Space</strong> — auto-play from the start, <strong>Ctrl+↑/↓</strong> — faster and slower, <strong>V</strong> — a variation from a comment, <strong>Esc</strong> — leave the variation, <strong>F</strong> — fullscreen, <strong>B</strong> — best move by Stockfish, <strong>A</strong> — analyse the whole game, <strong>H</strong> — section-by-section help. Holding <strong>A</strong> for two seconds turns on informal verdicts.",
    },
    "manual.chessExport": {
      ru: "В готовую страницу шахматный компонент подключается сам, как только в документе есть хотя бы один блок <code>```chess</code>. Комментарии из PGN читаются вместе с ходом, а вариант в комментарии записывается в квадратных скобках после знака доллара: <code>$[Bc4 Nc6]</code>.",
      en: "In the exported page the chess component is loaded by itself as soon as the document contains at least one <code>```chess</code> block. Comments from the PGN are spoken together with the move, and a variation inside a comment is written in square brackets after a dollar sign: <code>$[Bc4 Nc6]</code>.",
    },

    // --- Клавиши ------------------------------------------------------------
    "manual.keysList": {
      ru: "<ul>" +
        "<li><strong>Alt+ё</strong> — переключатель между редактором и предпросмотром. Из редактора открывает предпросмотр, пересоздаёт графики и переносит фокус на место курсора; из предпросмотра возвращает в редактор на ту же строку. <strong>Ctrl+Shift+Enter</strong> — спрятать предпросмотр.</li>" +
        "<li><strong>Alt+M</strong> — следующая формула будет в строке или отдельным блоком. <strong>Alt+L</strong> — синтаксис: LaTeX или AsciiMath.</li>" +
        "<li><strong>Alt+1 … Alt+9, Alt+0, Alt+-, Alt+=</strong> — вставить дробь, корень, сумму и другие заготовки. Те же номера написаны на кнопках.</li>" +
        "<li><strong>Ctrl+Space</strong> — подсказки: делимитеры, блоки, ключи настроек, разметка markdown. Внутри формулы подсказки появляются сами.</li>" +
        "<li><strong>F1</strong> — палитра команд: там собраны все действия редактора, включая предпросмотр, экспорт и смену языка. Если браузер перехватывает F1 (некоторые сборки открывают по ней свою справку) — есть Ctrl+Alt+P, его не занимает никто. А Ctrl+Shift+P лучше не использовать: в Firefox это приватное окно.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><strong>Alt+`</strong> — a switch between the editor and the preview. From the editor it opens the preview, rebuilds the graphs and moves the focus to the cursor's place; from the preview it returns to the editor on the same line. <strong>Ctrl+Shift+Enter</strong> — hide the preview.</li>" +
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
        "<li><code>chessjax: no</code> и <code>desmos: no</code> — не подключать шахматные доски и графики к сохранённой странице. По умолчанию подключать их не нужно: модуль включается сам, если в документе есть его блок.</li>" +
        "<li><code>css: адрес</code> — подключить свой файл стилей к готовой странице.</li>" +
        "<li><code>chess:</code> с отступом — общие настройки всех досок: <code>lang</code>, <code>tone</code>, <code>sound</code>, <code>controls</code>. У <code>desmos:</code> и <code>mathjax:</code> вложенно пишутся их собственные опции.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><code>title</code> — the document title; <code>author</code> and <code>description</code> — author and description.</li>" +
        "<li><code>lang</code> — the document language: ru, en, de, tr.</li>" +
        "<li><code>mathjax</code> — on by default; <code>mathjax: no</code> leaves formulas as they are, untypeset.</li>" +
        "<li><code>chessjax: no</code> and <code>desmos: no</code> — do not load chessboards and graphs into the exported page. Normally you do not need to switch them on: a module loads by itself when the document contains its block.</li>" +
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
    "manual.toc.practice": { ru: "Практика", en: "Practice" },
    "manual.practiceWrite": {
      ru: "Освоить редактор быстрее всего за работой. Открой редактор и напиши то, что уже разобрано: заголовок, абзац с выделением, список, формулу, а если нужно — блок графика или шахматную доску.",
      en: "The quickest way to learn the editor is to work in it. Open the editor and write what you have already read about: a heading, a paragraph with emphasis, a list, a formula and, if you need them, a graph block or a chessboard.",
    },
    "manual.practiceLoop": {
      ru: "Потом нажми <strong>Alt+ё</strong> — откроется предпросмотр, и можно прочитать или прослушать, что получилось. Ещё одно нажатие <strong>Alt+ё</strong> возвращает в редактор на ту же строку: правь и снова проверяй. Цикл «написал — проверил — поправил» и есть основной способ работы здесь.",
      en: "Then press <strong>Alt+`</strong> — the preview opens, and you can read or listen to the result. Pressing <strong>Alt+`</strong> again returns you to the editor on the same line: fix it and check again. This loop — write, check, correct — is the main way of working here.",
    },
    "manual.practiceNext": {
      ru: "Дальше можно взять готовый документ из списка <strong>Пример:</strong>, разобрать его и переделать под свою задачу. Когда документ готов, кнопка <strong>Сохранить готовый HTML</strong> делает из него страницу, которую можно отправить читателю.",
      en: "After that, take a ready-made document from the <strong>Example:</strong> list, study it and rework it for your own task. When the document is ready, the <strong>Export HTML</strong> button turns it into a page you can send to a reader.",
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
