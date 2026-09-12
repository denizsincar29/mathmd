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
    "manual.toc.start": { ru: "С чего начать", en: "Getting started" },
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
    "manual.chessHeadExport": { ru: "Что в готовом документе", en: "What the exported document contains" },

    // --- Введение -----------------------------------------------------------
    "manual.introText1": {
      ru: "mathmd — доступный математический редактор в браузере. Он нужен, чтобы писать и публиковать математические тексты: статьи и конспекты, задачи с решениями, разборы партий. Текст, формулы, графики и шахматные доски собираются в одном документе, а готовую работу можно отдать читателю ссылкой или файлом.",
      en: "mathmd is an accessible mathematical editor in the browser. It is made for writing and publishing mathematical texts: articles and notes, problems with solutions, game analyses. Text, formulas, graphs and chessboards come together in one document, and the finished work can be handed to a reader as a link or a file.",
    },
    "manual.introText2": {
      ru: "Главное в нём — доступность. Редактор рассчитан на автора, который работает с программой экранного доступа: всё делается с клавиатуры, формулы читаются на слух, график можно прослушать, а шахматная доска называет клетки голосом. Зрячему автору он тоже подходит: на выходе получается аккуратно свёрстанная страница.",
      en: "Accessibility is its main point. The editor is designed for an author who works with a screen reader: everything is done from the keyboard, formulas are read aloud, a graph can be listened to, and the chessboard names its squares by voice. It suits a sighted author as well: the result is a neatly typeset page.",
    },
    "manual.introText3": {
      ru: "Вторая задача — оформление. Написанное здесь превращается в аккуратно свёрстанную страницу: заголовки, списки, формулы, графики и шахматные доски выглядят так, как их принято видеть в публикации. Программа вёрстки для этого не нужна.",
      en: "Its second purpose is presentation. What you write here becomes a properly typeset page: headings, lists, formulas, graphs and chessboards look the way they are expected to look in a publication. No typesetting program is required.",
    },
    "manual.introText4": {
      ru: "Устроен редактор просто: сверху панель кнопок для вставки формул, под ней поле редактора, ниже предпросмотр. Изменения видны сразу. Клавиша <strong>Alt+ё</strong> открывает предпросмотр и возвращает обратно в редактор. Устанавливать ничего не нужно — это обычная страница сайта.",
      en: "The editor itself is simple: a formula button panel at the top, the editor field below it, the preview under that. Changes are visible at once. <strong>Alt+`</strong> opens the preview and returns you to the editor. Nothing has to be installed — it is an ordinary web page.",
    },
    "manual.introText5": {
      ru: "Документ — обычный текстовый файл <code>.md</code> с разметкой markdown. Внутри него могут быть формулы, графики и шахматные доски. Файл можно скачать, открыть заново, править в любом текстовом редакторе и передать другому человеку. Кнопка «Сохранить готовый HTML» делает из него отдельную страницу для чтения: она открывается в любом браузере, а исходный код читателю не нужен. Кнопка «Справка» в редакторе — краткая справка, эта страница — полное руководство.",
      en: "A document is a plain text <code>.md</code> file with markdown markup. It can hold formulas, graphs and chessboards. You can download it, open it again, edit it in any text editor and hand it to someone else. The “Export HTML” button turns it into a standalone page for reading: it opens in any browser, and the reader needs no source code. The “Help” button in the editor is a short reference; this page is the complete manual.",
    },

    // --- С чего начать ------------------------------------------------------
    "manual.startLead": {
      ru: "Шесть шагов, которые стоит пройти один раз, — дальше всё будет понятно само.",
      en: "Six steps worth taking once; after that everything falls into place by itself.",
    },
    "manual.startList": {
      ru: "<ol>" +
        "<li>Откройте сайт редактора.</li>" +
        "<li>Вы попадёте в поле редактора — это место, где набирается текст. Если курсор туда не встал, найдите редактор клавишами быстрой навигации: <strong>E</strong> и <strong>Shift+E</strong> в NVDA и JAWS, либо <strong>Tab</strong> и <strong>Shift+Tab</strong>.</li>" +
        "<li>Изучите пример, который уже написан в редакторе, и его разметку: заголовки, формулы, списки.</li>" +
        "<li>Нажмите <strong>Alt+ё</strong> — откроется предпросмотр, и вы услышите, как этот пример выглядит в готовом документе.</li>" +
        "<li>Нажмите <strong>Alt+ё</strong> ещё раз — вы вернётесь в редактор на ту же строку. Правьте пример по своему усмотрению и снова проверяйте предпросмотром.</li>" +
        "<li>Когда текст готов, найдите кнопку <strong>Сохранить готовый HTML</strong> и сохраните страницу. Рядом кнопки <strong>Скачать .md</strong> — исходник для правки — и <strong>Открыть .md</strong> — вернуть сохранённый файл.</li>" +
        "</ol>",
      en: "<ol>" +
        "<li>Open the editor site.</li>" +
        "<li>You land in the editor field — the place where the text is written. If the cursor did not go there, find the editor with quick navigation keys: <strong>E</strong> and <strong>Shift+E</strong> in NVDA and JAWS, or <strong>Tab</strong> and <strong>Shift+Tab</strong>.</li>" +
        "<li>Study the example already written in the editor and its markup: headings, formulas, lists.</li>" +
        "<li>Press <strong>Alt+`</strong> — the preview opens, and you can hear how that example looks in a finished document.</li>" +
        "<li>Press <strong>Alt+`</strong> again — you return to the editor on the same line. Edit the example as you like and check it in the preview again.</li>" +
        "<li>When the text is ready, find the <strong>Export HTML</strong> button and save the page. Next to it are <strong>Download .md</strong> — the source for editing — and <strong>Open .md</strong> — to bring a saved file back.</li>" +
        "</ol>",
    },
    "manual.startKeys": {
      ru: "Кнопки файла работают и по горячим клавишам: <strong>Ctrl+S</strong> — сохранить готовый HTML, <strong>Ctrl+Shift+S</strong> — скачать .md, <strong>Ctrl+O</strong> — открыть .md. Браузер тоже умеет эти сочетания, но редактор перехватывает их первым, поэтому его действие и срабатывает. Функциональные клавиши: <strong>F1</strong> — справка, <strong>Shift+F1</strong> — палитра команд, <strong>F2</strong> — переименовать документ, <strong>Shift+F2</strong> — удалить, <strong>F9</strong> — новый документ.",
      en: "The file buttons also have hotkeys: <strong>Ctrl+S</strong> — save the ready HTML, <strong>Ctrl+Shift+S</strong> — download the .md, <strong>Ctrl+O</strong> — open a .md. The browser knows these combinations too, but the editor catches them first, so its action is the one that runs. Function keys: <strong>F1</strong> — help, <strong>Shift+F1</strong> — the command palette, <strong>F2</strong> — rename the document, <strong>Shift+F2</strong> — delete, <strong>F9</strong> — a new document.",
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
        "<li><strong>Ссылка.</strong> Чтобы сделать ссылку, в квадратных скобках напишите текст ссылки, а затем без пробела в круглых скобках — сам адрес ссылки или заголовок через решётку: <code>[текст](адрес)</code>, <code>[текст](#заголовок)</code>.</li>" +
        "<li><strong>Цитата.</strong> Знак <code>&gt;</code> в начале строки. Так же набирается зачёркнутый текст и списки задач.</li>" +
        "<li><strong>Код.</strong> Код пишется только тройными обратными кавычками — вокруг целого блока. Одиночная кавычка занята AsciiMath: <code>`x^2`</code> — это формула, а не код. Под каждым блоком кода в предпросмотре и в готовой странице есть кнопка <strong>Скопировать код</strong>.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><strong>A heading.</strong> To write a heading, put the character <code>#</code> before the line. One character is a first-level heading, two a second-level, five a fifth-level.</li>" +
        "<li><strong>A paragraph.</strong> Paragraphs are separated by a blank line. Without a blank line the following lines continue the same paragraph.</li>" +
        "<li><strong>Emphasis.</strong> <code>**bold**</code> — two <code>*</code> characters on either side of the word, <code>*italic*</code> — one character.</li>" +
        "<li><strong>A list.</strong> Each item starts with a dash and a space. A numbered list starts with a figure and a dot: <code>1.</code>, <code>2.</code>, <code>3.</code></li>" +
        "<li><strong>A link.</strong> To make a link, write the link text in square brackets and then, without a space, the address in round brackets — either a web address or a heading reference after a hash sign: <code>[text](address)</code>, <code>[text](#heading)</code>.</li>" +
        "<li><strong>A quote.</strong> The character <code>&gt;</code> at the start of a line. Strikethrough and task lists are written the same way.</li>" +
        "<li><strong>Code.</strong> Code is written with triple backticks only — around a whole block. A single backtick belongs to AsciiMath: <code>`x^2`</code> is a formula, not code. Under every code block, in the preview and in the exported page, there is a <strong>Copy code</strong> button.</li>" +
        "</ul>",
    },
    "manual.markdownNote": {
      ru: "Внутри формул и блоков кода markdown не действует: там символы означают сами себя. В обычном тексте знак <code>*</code> может случайно начать курсив — в этом случае перед ним ставят обратный слэш. Одиночная обратная кавычка тоже не код, а формула AsciiMath: <code>`x^2`</code>.",
      en: "Inside formulas and code blocks markdown does not apply: there the characters mean themselves. In ordinary text the character <code>*</code> may accidentally start italics; in that case a backslash is placed before it. A single backtick is not code either, but an AsciiMath formula: <code>`x^2`</code>.",
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
        "<li><strong>Сумма, интеграл, предел</strong> — <code>`sum_(i=1)^n`</code>, <code>`int_(0)^(1) x dx`</code>, <code>`lim_(x-&gt;0)`</code>. Нижний и верхний пределы — в скобках.</li>" +
        "<li><strong>Матрица</strong> — двойные квадратные скобки: <code>`[[a,b],[c,d]]`</code>. Строки разделяются запятыми внутри внешних скобок.</li>" +
        "<li><strong>Греческие буквы</strong> — словом: <code>alpha</code>, <code>beta</code>, <code>pi</code>, <code>theta</code>, <code>omega</code>, большая сигма — <code>Sigma</code>.</li>" +
        "<li><strong>Знаки</strong> — обычными символами: <code>&gt;=</code>, <code>&lt;=</code>, <code>!=</code>, <code>~=</code>, бесконечность <code>oo</code>, стрелка <code>-&gt;</code>, принадлежность <code>in</code>.</li>" +
        "<li><strong>Пробел</strong> разделяет части формулы: <code>`int x dx`</code> — подынтегральное выражение не присоединяется к знаку интеграла.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><strong>A fraction</strong> uses brackets: <code>`(a+b)/(c+d)`</code>. The brackets say what is on top and what is below.</li>" +
        "<li><strong>A power</strong> uses a caret: <code>`x^2`</code>, and for a long exponent <code>`x^(n+1)`</code>.</li>" +
        "<li><strong>A root</strong> — <code>`sqrt(x)`</code>; a cube root — <code>`root(3)(x)`</code>.</li>" +
        "<li><strong>A sum, integral or limit</strong> — <code>`sum_(i=1)^n`</code>, <code>`int_(0)^(1) x dx`</code>, <code>`lim_(x-&gt;0)`</code>. Lower and upper bounds go in brackets.</li>" +
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
    "manual.latexSkip": {
      ru: "Если LaTeX вам не нужен, пропустите этот раздел и переходите к следующему.",
      en: "If you do not need LaTeX, skip this section and go on to the next one.",
    },
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
      ru: "Перед каждым графиком стоит невидимая кнопка входа. Читайте страницу стрелкой вниз — вы услышите «<strong>График Desmos — перейти к списку выражений, кнопка</strong>». Нажмите на ней <strong>пробел</strong> или <strong>Enter</strong>, и вы сразу окажетесь в списке выражений: там перечислены строки графика. Из списка нажмите <strong>Alt+T</strong> — откроется плоскость координат, доступная программе экранного доступа. На ней стрелки влево и вправо ведут по оси X, высота тона сообщает значение Y, а клавиша <strong>H</strong> проводит по всему графику слева направо звуком. Запасной путь, если кнопки почему-то нет: стрелкой вниз дойдите до надписи <strong>Desmos Graphing Calculator</strong>, нажмите на ней пробел и жмите <strong>Tab</strong>, пока не попадёте в список выражений.",
      en: "Before every graph there is an invisible entrance button. Read the page with the down arrow and you hear “<strong>Desmos graph — go to the expression list, button</strong>”. Press <strong>space</strong> or <strong>Enter</strong> on it and you are straight in the list of expressions: it lists the lines of the graph. From the list press <strong>Alt+T</strong> — a coordinate plane opens, accessible to a screen reader. On it the left and right arrows move along the X axis, the pitch of the tone reports the value of Y, and the <strong>H</strong> key sweeps the whole graph from left to right in sound. A reserve way in, if the button is missing for some reason: with the down arrow reach the words <strong>Desmos Graphing Calculator</strong>, press space on them and press <strong>Tab</strong> until you reach the list of expressions.",
    },
    "manual.desmosBack": {
      ru: "Вернуться в руководство можно двумя способами. <strong>Shift+Tab</strong> ведёт назад по элементам калькулятора, пока вы не выйдете из его панели. Быстрее — <strong>NVDA+Ctrl+Space</strong>: эта команда сразу выводит из области калькулятора, и дальше страница снова читается стрелками.",
      en: "There are two ways back to the manual. <strong>Shift+Tab</strong> walks back through the calculator's elements until you leave its panel. Faster is <strong>NVDA+Ctrl+Space</strong>: that command takes you straight out of the calculator's area, and the page can be read with the arrows again.",
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
      ru: "<p>Доска — не обычная таблица, а отдельный объект со своим набором клавиш. Поэтому стрелки начинают работать не сразу: нужно перейти в режим форм (редактирования) — <strong>NVDA+Space</strong> в NVDA, режим форм в JAWS.</p>" +
        "<p>Проще всего ничего не переключать вручную: листая документ стрелками, перед доской вы услышите «Шахматная доска, область. Нажмите Enter, чтобы взаимодействовать с доской». Нажмите <strong>Enter</strong> (годится и клик по доске) — нужный режим включится сам, а фокус встанет на клетку. Дальше стрелки называют клетки: «чёрная пешка b7», пустая клетка — «e5».</p>" +
        "<ul>" +
        "<li><strong>Стрелки</strong> — перейти по клеткам и услышать, что на клетке.</li>" +
        "<li><strong>Ctrl+←</strong> и <strong>Ctrl+→</strong> — назад и вперёд по ходу партии.</li>" +
        "<li><strong>Space</strong> — продолжить или пауза.</li>" +
        "<li><strong>Ctrl+Space</strong> — автопроигрывание с начала.</li>" +
        "<li><strong>Ctrl+↑</strong> и <strong>Ctrl+↓</strong> — быстрее и медленнее.</li>" +
        "<li><strong>V</strong> — войти в вариант из комментария, <strong>Esc</strong> — выйти из варианта.</li>" +
        "<li><strong>F</strong> — во весь экран.</li>" +
        "<li><strong>B</strong> — лучший ход по Stockfish.</li>" +
        "<li><strong>A</strong> — разбор всей партии; удержание <strong>A</strong> две секунды — шутливые оценки.</li>" +
        "<li><strong>H</strong> — помощь по разделам.</li>" +
        "</ul>",
      en: "<p>The board is not an ordinary table but an object of its own with its own keys. That is why the arrows do not work straight away: you have to switch into focus (forms) mode — <strong>NVDA+Space</strong> in NVDA, forms mode in JAWS.</p>" +
        "<p>Easier still: switch nothing by hand. Browsing the document with the arrow keys, before the board you hear “Chessboard, region. Press Enter to interact with the board.” Press <strong>Enter</strong> (clicking the board works too) — the right mode turns on by itself and focus lands on a square. From there the arrows name the squares: “black pawn b7”, an empty square is “e5”.</p>" +
        "<ul>" +
        "<li><strong>Arrows</strong> — move to a square and hear what stands on it.</li>" +
        "<li><strong>Ctrl+←</strong> and <strong>Ctrl+→</strong> — back and forward through the game.</li>" +
        "<li><strong>Space</strong> — continue or pause.</li>" +
        "<li><strong>Ctrl+Space</strong> — auto-play from the start.</li>" +
        "<li><strong>Ctrl+↑</strong> and <strong>Ctrl+↓</strong> — faster and slower.</li>" +
        "<li><strong>V</strong> — enter a variation from a comment, <strong>Esc</strong> — leave the variation.</li>" +
        "<li><strong>F</strong> — fullscreen.</li>" +
        "<li><strong>B</strong> — best move by Stockfish.</li>" +
        "<li><strong>A</strong> — analyse the whole game; holding <strong>A</strong> for two seconds gives informal verdicts.</li>" +
        "<li><strong>H</strong> — section-by-section help.</li>" +
        "</ul>",
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
        "<li><strong>F1</strong> — справка, <strong>Shift+F1</strong> — палитра команд (она же <strong>Ctrl+Alt+P</strong>). F1 привычнее видеть справкой, поэтому палитра переехала.</li>" +
        "<li><strong>F2</strong> — переименовать документ, <strong>Shift+F2</strong> — удалить документ, <strong>F9</strong> — новый документ. То же самое делают кнопки рядом со списком документов.</li>" +
        "<li><strong>Ctrl+S</strong> — сохранить готовый HTML, <strong>Ctrl+Shift+S</strong> — скачать .md, <strong>Ctrl+O</strong> — открыть .md с диска.</li>" +
        "<li><strong>F8</strong> и <strong>Shift+F8</strong> — следующая и предыдущая ошибка в документе: курсор переходит на строку, а редактор сообщает, что не так. Alt+ё с ошибками показывает их списком вместо предпросмотра. Когда курсор сам встаёт на строку с ошибкой, звучит короткий сигнал.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><strong>Alt+`</strong> — a switch between the editor and the preview. From the editor it opens the preview, rebuilds the graphs and moves the focus to the cursor's place; from the preview it returns to the editor on the same line. <strong>Ctrl+Shift+Enter</strong> — hide the preview.</li>" +
        "<li><strong>Alt+M</strong> — the next formula goes inline or as a separate block. <strong>Alt+L</strong> — the syntax: LaTeX or AsciiMath.</li>" +
        "<li><strong>Alt+1 … Alt+9, Alt+0, Alt+-, Alt+=</strong> — insert a fraction, a root, a sum and other templates. The same numbers are printed on the buttons.</li>" +
        "<li><strong>Ctrl+Space</strong> — suggestions: delimiters, blocks, settings keys, markdown markup. Inside a formula they appear by themselves.</li>" +
        "<li><strong>F1</strong> — help, <strong>Shift+F1</strong> — the command palette (also <strong>Ctrl+Alt+P</strong>). F1 is more usually expected to bring up help, so the palette moved.</li>" +
        "<li><strong>F2</strong> — rename the document, <strong>Shift+F2</strong> — delete it, <strong>F9</strong> — a new document. The buttons next to the document list do the same.</li>" +
        "<li><strong>Ctrl+S</strong> — save the ready HTML, <strong>Ctrl+Shift+S</strong> — download the .md, <strong>Ctrl+O</strong> — open a .md from disk.</li>" +
        "<li><strong>F8</strong> and <strong>Shift+F8</strong> — the next and the previous error in the document: the cursor moves to the line and the editor says what is wrong. Alt+` with errors shows them as a list instead of the preview. When the cursor lands on a line with an error, a short signal sounds.</li>" +
        "</ul>",
    },
    "manual.keysButtons": {
      ru: "Кнопки работают с выделением: выдели текст и нажми кнопку — выделение обернётся в формулу. Без выделения кнопка вставит заготовку и поставит курсор в нужное место.",
      en: "The buttons work with a selection: select text and press a button — the selection is wrapped in a formula. Without a selection the button inserts a template and puts the cursor where it belongs.",
    },

    // --- Frontmatter --------------------------------------------------------
    "manual.fmIntro": {
      ru: "Настройки документа пишутся в самом начале файла, между двумя строками с тремя дефисами. Это <strong>продвинутая настройка</strong>: обычному документу она не нужна. Заголовок страницы берётся из первого заголовка первого уровня, а язык документа определяется сам — по кириллице как русский, иначе по языку браузера. Frontmatter нужен, когда хочется задать это вручную или подключить к странице что-то своё.",
      en: "Document settings go at the very top of the file, between two lines of three dashes. This is an <strong>advanced setting</strong>: an ordinary document does not need it. The page title is taken from the first first-level heading, and the document language is detected by itself — Cyrillic means Russian, otherwise the browser language. Frontmatter is for setting these by hand or attaching something of your own to the page.",
    },
    "manual.fmList": {
      ru: "<ul>" +
        "<li><code>title</code> — заголовок документа. Без него берётся первый заголовок первого уровня; <code>author</code> и <code>description</code> — автор и описание.</li>" +
        "<li><code>lang</code> — язык документа: ru, en, de, tr. Определяется сам по тексту и браузеру; здесь его можно задать вручную.</li>" +
        "<li><code>mathjax</code> — включён по умолчанию; <code>mathjax: no</code> оставит формулы как есть, без вёрстки.</li>" +
        "<li><code>chessjax: no</code> и <code>desmos: no</code> — не подключать шахматные доски и графики к сохранённой странице. По умолчанию подключать их не нужно: модуль включается сам, если в документе есть его блок.</li>" +
        "<li><code>css: адрес</code> — подключить свой файл стилей к готовой странице.</li>" +
        "<li><code>chess:</code> с отступом — общие настройки всех досок: <code>lang</code>, <code>tone</code>, <code>sound</code>, <code>controls</code>. У <code>desmos:</code> и <code>mathjax:</code> вложенно пишутся их собственные опции.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><code>title</code> — the document title. Without it the first first-level heading is used; <code>author</code> and <code>description</code> — author and description.</li>" +
        "<li><code>lang</code> — the document language: ru, en, de, tr. It is detected from the text and the browser; here you can set it by hand.</li>" +
        "<li><code>mathjax</code> — on by default; <code>mathjax: no</code> leaves formulas as they are, untypeset.</li>" +
        "<li><code>chessjax: no</code> and <code>desmos: no</code> — do not load chessboards and graphs into the exported page. Normally you do not need to switch them on: a module loads by itself when the document contains its block.</li>" +
        "<li><code>css: address</code> — attach your own stylesheet to the exported page.</li>" +
        "<li><code>chess:</code> with indentation — settings for every board: <code>lang</code>, <code>tone</code>, <code>sound</code>, <code>controls</code>. Under <code>desmos:</code> and <code>mathjax:</code> their own options go the same way.</li>" +
        "</ul>",
    },
    "manual.fmHow": {
      ru: "Быстрее всего не печатать блок руками, а вставить его командой из палитры (<strong>Ctrl+Alt+P</strong>, «Вставить frontmatter») — заготовка появится сама и курсор встанет на нужное место. Если начать документ с трёх дефисов, блок развернётся и закроется автоматически.",
      en: "The quickest way is not to type the block by hand but to insert it from the palette (<strong>Ctrl+Alt+P</strong>, “Insert frontmatter”) — the template appears with the cursor in the right place. If you start a document with three dashes, the block unfolds and closes by itself.",
    },

    // --- Файлы --------------------------------------------------------------
    "manual.filesList": {
      ru: "<ul>" +
        "<li><strong>Показать предпросмотр</strong> — то же, что Alt+ё.</li>" +
        "<li><strong>Сохранить готовый HTML</strong> — страница для чтения и раздачи, с формулами и, если включено, с досками и графиками.</li>" +
        "<li><strong>Скачать .md</strong> — сохранить исходник, чтобы вернуться к работе позже.</li>" +
        "<li><strong>Открыть .md</strong> — открыть файл с диска.</li>" +
        "<li><strong>Пример:</strong> — готовые документы: демо редактора, партия Морфи и пример с комментариями и вариантами.</li>" +
        "<li><strong>Переименовать</strong> и <strong>Удалить</strong> — про текущий, открытый документ. Стоят рядом со списком документов; то же делают F2 и Shift+F2.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><strong>Show preview</strong> — the same as Alt+`.</li>" +
        "<li><strong>Export HTML</strong> — a page for reading and sharing, with formulas and, if switched on, boards and graphs.</li>" +
        "<li><strong>Download .md</strong> — save the source to come back to later.</li>" +
        "<li><strong>Open .md</strong> — open a file from disk.</li>" +
        "<li><strong>Example:</strong> — ready-made documents: the editor demo, Morphy's game, and a sample with comments and variations.</li>" +
        "<li><strong>Rename</strong> and <strong>Delete</strong> act on the current, open document. They sit next to the document list; F2 and Shift+F2 do the same.</li>" +
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
        "спрашивает имя — дальше файл и документ называются одинаково. Тут же " +
        "рядом со списком стоят кнопки <strong>Переименовать</strong> и " +
        "<strong>Удалить</strong>: они действуют на открытый документ, и то же " +
        "самое делают F2 и Shift+F2.",
      en: "Documents live in your own browser and are never sent anywhere. The " +
        "<strong>Document:</strong> list in the “File and output” panel opens a " +
        "saved document; its last item is <strong>New document</strong>. Until you " +
        "save a document under your own name it is called untitled1.md, untitled2.md " +
        "and so on. The first time you download an unnamed document the editor asks " +
        "for a name — from then on the file and the document share it. Right next " +
        "to the list are the <strong>Rename</strong> and <strong>Delete</strong> " +
        "buttons: they act on the open document, and F2 and Shift+F2 do the same.",
    },
    "manual.docsAutosave": {
      ru: "Текст сохраняется сам: через пять секунд тишины после правки и сразу при " +
        "закрытии вкладки. Возвращаетесь на сайт — документ открывается на том же " +
        "месте. Если открыть пример — по ссылке (<code>?example=…</code>) или из " +
        "списка «Пример:», — он приходит отдельным документом: прежний черновик " +
        "ничего не теряет и ждёт вас в списке <strong>Документ:</strong>. Пустой " +
        "редактор пример просто заполняет.",
      en: "The text saves itself: five seconds after you stop typing, and " +
        "immediately when the tab closes. Come back to the site and the document opens " +
        "where you left it. When you open an example — through a link " +
        "(<code>?example=…</code>) or from the “Example:” list — it arrives as a " +
        "separate document: your previous draft loses nothing and waits for you in " +
        "the <strong>Document:</strong> list. An empty editor is simply filled by " +
        "the example.",
    },
    "manual.docsHistory": {
      ru: "История правок хранится снимками: примерно один на каждые две минуты " +
        "работы, не больше тридцати на документ. <strong>Ctrl+Alt+Z</strong> — шаг " +
        "назад по этим снимкам, <strong>Ctrl+Alt+Y</strong> — шаг вперёд. В отличие " +
        "от обычного Ctrl+Z, который действует только внутри текущего сеанса, снимки " +
        "переживают перезагрузку страницы. Переименовать документ или удалить его " +
        "можно кнопками рядом со списком документов (F2 и Shift+F2), а из палитры " +
        "команд (Ctrl+Alt+P или Shift+F1) — ещё и стереть всё хранилище.",
      en: "The edit history is kept as snapshots: roughly one per two minutes of " +
        "work, at most thirty per document. <strong>Ctrl+Alt+Z</strong> steps back " +
        "through them, <strong>Ctrl+Alt+Y</strong> steps forward. Unlike plain Ctrl+Z, " +
        "which only works inside the current session, these snapshots survive a page " +
        "reload. You can rename or delete a document with the buttons next to the " +
        "document list (F2 and Shift+F2), and wipe the whole store from the command " +
        "palette (Ctrl+Alt+P or Shift+F1).",
    },
  });
})();
