// i18n.js — локализация интерфейса mathmd (ru/en/de/tr).
//
// Классический (не module) скрипт: грузится в <head> синхронно и применяет
// перевод к статической разметке на DOMContentLoaded, до старта Monaco.
// Динамические строки script.js берёт через window.I18N.t(key, vars).
//
// Порядок выбора языка: URL ?lang= → localStorage → язык браузера → ru.
// Смена языка — через <select id="lang-select"> (setLang), сохраняется.

(function () {
  "use strict";

  var LANGS = ["ru", "en", "de", "tr"];
  var LANG_NAMES = { ru: "Русский", en: "English", de: "Deutsch", tr: "Türkçe" };

  var DICT = {
    // --- Документ -----------------------------------------------------------
    "doc.title": {
      ru: "Математический редактор — Markdown, LaTeX, AsciiMath, Desmos, шахматы",
      en: "Math editor — Markdown, LaTeX, AsciiMath, Desmos, chess",
      de: "Mathe-Editor — Markdown, LaTeX, AsciiMath, Desmos, Schach",
      tr: "Matematik editörü — Markdown, LaTeX, AsciiMath, Desmos, satranç",
    },
    "doc.description": {
      ru: "Доступный веб-редактор markdown с математикой MathJax 4, поддержкой LaTeX и AsciiMath, графиками Desmos и шахматными досками chessjax. Для незрячих пользователей.",
      en: "Accessible web markdown editor with MathJax 4 math, LaTeX and AsciiMath support, Desmos graphs and chessjax chessboards. Made for screen reader users.",
      de: "Barrierefreier Web-Markdown-Editor mit MathJax-4-Mathematik, LaTeX- und AsciiMath-Unterstützung, Desmos-Grafiken und chessjax-Schachbrettern. Für blinde Nutzer.",
      tr: "MathJax 4 matematik, LaTeX ve AsciiMath desteği, Desmos grafikleri ve chessjax satranç tahtalarıyla erişilebilir web markdown editörü. Ekran okuyucu kullananlar için.",
    },
    "h1.title": {
      ru: "Математический редактор",
      en: "Math editor",
      de: "Mathe-Editor",
      tr: "Matematik editörü",
    },
    "h1.subtitle": {
      ru: "Markdown + LaTeX, AsciiMath, графики Desmos и шахматные доски. Предпросмотр — <strong>Alt+ё</strong>, вставка формул — кнопки (хоткеи Alt+1..9).",
      en: "Markdown + LaTeX, AsciiMath, Desmos graphs and chessboards. Preview — <strong>Alt+`</strong>, formula insert — buttons (hotkeys Alt+1..9).",
      de: "Markdown + LaTeX, AsciiMath, Desmos-Grafiken und Schachbretter. Vorschau — <strong>Alt+`</strong>, Formeln einfügen — Schaltflächen (Hotkeys Alt+1..9).",
      tr: "Markdown + LaTeX, AsciiMath, Desmos grafikleri ve satranç tahtaları. Önizleme — <strong>Alt+`</strong>, formül ekleme — butonlar (kısayollar Alt+1..9).",
    },

    // --- Статический UI ------------------------------------------------------
    "ui.toolbarHeading": {
      ru: "Панель вставки формул",
      en: "Formula insert panel",
      de: "Formel-Einfügepanel",
      tr: "Formül ekleme paneli",
    },
    "ui.toolbarLabel": {
      ru: "Вставка формул и уравнений",
      en: "Insert formulas and equations",
      de: "Formeln und Gleichungen einfügen",
      tr: "Formül ve denklem ekleme",
    },
    "ui.toolbarHint": {
      ru: "Выделите текст и нажмите кнопку — выделение обернётся в <code>$…$</code>, <code>$$…$$</code> или <code>`…`</code>. Без выделения кнопка вставит шаблон. Хоткеи вставки — на кнопках (Alt+1..9).",
      en: "Select text and press a button — the selection will be wrapped in <code>$…$</code>, <code>$$…$$</code> or <code>`…`</code>. Without a selection the button inserts a template. Insert hotkeys are on the buttons (Alt+1..9).",
      de: "Markieren Sie Text und drücken Sie eine Schaltfläche — die Auswahl wird in <code>$…$</code>, <code>$$…$$</code> oder <code>`…`</code> eingefasst. Ohne Auswahl fügt die Schaltfläche eine Vorlage ein. Einfüge-Hotkeys stehen auf den Schaltflächen (Alt+1..9).",
      tr: "Metin seçin ve bir butona basın — seçim <code>$…$</code>, <code>$$…$$</code> veya <code>`…`</code> içine alınır. Seçim yoksa buton bir şablon ekler. Ekleme kısayolları butonlardadır (Alt+1..9).",
    },
    "ui.editorLabel": {
      ru: "Редактор математики: пишите markdown, LaTeX или AsciiMath",
      en: "Math editor: write markdown, LaTeX or AsciiMath",
      de: "Mathe-Editor: Markdown, LaTeX oder AsciiMath schreiben",
      tr: "Matematik editörü: markdown, LaTeX veya AsciiMath yazın",
    },
    "ui.previewHeading": {
      ru: "Предпросмотр",
      en: "Preview",
      de: "Vorschau",
      tr: "Önizleme",
    },
    "ui.previewHint": {
      ru: "Текст обновляется при наборе. Alt+ё — полный предпросмотр: пересоздать графики и перейти к строке курсора. Ctrl+Shift+Enter — скрыть. Шахматная доска — fenced-блок <code>```chess</code> с атрибутами (например <code>```chess fen=\"…\"</code>).",
      en: "Text updates as you type. Alt+` — full preview: rebuild graphs and jump to the cursor line. Ctrl+Shift+Enter — hide. A chessboard is a fenced block <code>```chess</code> with attributes (e.g. <code>```chess fen=\"…\"</code>).",
      de: "Text aktualisiert sich beim Tippen. Alt+` — volle Vorschau: Diagramme neu aufbauen und zur Cursorzeile springen. Ctrl+Shift+Enter — ausblenden. Ein Schachbrett ist ein Fenced-Block <code>```chess</code> mit Attributen (z. B. <code>```chess fen=\"…\"</code>).",
      tr: "Metin yazdıkça güncellenir. Alt+` — tam önizleme: grafikleri yeniden oluştur ve imleç satırına git. Ctrl+Shift+Enter — gizle. Satranç tahtası, öznitelikli <code>```chess</code> fenced bloğudur (ör. <code>```chess fen=\"…\"</code>).",
    },
    "ui.fileHeading": {
      ru: "Файл и вывод",
      en: "File and output",
      de: "Datei und Ausgabe",
      tr: "Dosya ve çıktı",
    },
    "ui.btnPreview": {
      ru: "Показать предпросмотр (Alt+ё)",
      en: "Show preview (Alt+`)",
      de: "Vorschau anzeigen (Alt+`)",
      tr: "Önizlemeyi göster (Alt+`)",
    },
    "ui.btnExport": {
      ru: "Сохранить готовый HTML",
      en: "Save finished HTML",
      de: "Fertiges HTML speichern",
      tr: "Hazır HTML kaydet",
    },
    "ui.btnSave": {
      ru: "Скачать .md",
      en: "Download .md",
      de: ".md herunterladen",
      tr: ".md indir",
    },
    "ui.btnOpen": {
      ru: "Открыть .md",
      en: "Open .md",
      de: ".md öffnen",
      tr: ".md aç",
    },
    "ui.btnHelp": {
      ru: "Справка",
      en: "Help",
      de: "Hilfe",
      tr: "Yardım",
    },
    "ui.exampleLabel": {
      ru: "Пример:",
      en: "Example:",
      de: "Beispiel:",
      tr: "Örnek:",
    },
    "ui.exampleDemo": {
      ru: "Демо mathmd",
      en: "mathmd demo",
      de: "mathmd-Demo",
      tr: "mathmd demosu",
    },
    "ui.exampleVariations": {
      ru: "Комментарии и варианты",
      en: "Comments and variations",
      de: "Kommentare und Varianten",
      tr: "Yorumlar ve varyantlar",
    },
    "ui.lang": {
      ru: "Язык:",
      en: "Language:",
      de: "Sprache:",
      tr: "Dil:",
    },
    "ui.langSelectAria": {
      ru: "Язык интерфейса",
      en: "Interface language",
      de: "Sprache der Oberfläche",
      tr: "Arayüz dili",
    },
    "ui.exampleSelectAria": {
      ru: "Открыть пример",
      en: "Open example",
      de: "Beispiel öffnen",
      tr: "Örnek aç",
    },

    // --- Справка ------------------------------------------------------------
    "help.title": {
      ru: "Справка: как пользоваться редактором",
      en: "Help: how to use the editor",
      de: "Hilfe: wie benutze ich den Editor",
      tr: "Yardım: editör nasıl kullanılır",
    },
    "help.formulasTitle": {
      ru: "Формулы",
      en: "Formulas",
      de: "Formeln",
      tr: "Formüller",
    },
    "help.formulasText": {
      ru: "LaTeX пишется в долларах: <code>$x^2$</code> — формула в строке, <code>$$...$$</code> — на отдельной строке. Работают и скобки: <code>\\(...\\)</code> и <code>\\[...\\]</code>.",
      en: "LaTeX is written in dollars: <code>$x^2$</code> — inline formula, <code>$$...$$</code> — on its own line. Brackets work too: <code>\\(...\\)</code> and <code>\\[...\\]</code>.",
      de: "LaTeX wird in Dollarzeichen geschrieben: <code>$x^2$</code> — Formel im Text, <code>$$...$$</code> — in einer eigenen Zeile. Auch Klammern funktionieren: <code>\\(...\\)</code> und <code>\\[...\\]</code>.",
      tr: "LaTeX dolar işaretleriyle yazılır: <code>$x^2$</code> — satır içi formül, <code>$$...$$</code> — ayrı bir satırda. Parantezler de çalışır: <code>\\(...\\)</code> ve <code>\\[...\\]</code>.",
    },
    "help.insertTitle": {
      ru: "Вставка формул кнопками",
      en: "Inserting formulas with buttons",
      de: "Formeln per Schaltflächen einfügen",
      tr: "Formülleri butonlarla ekleme",
    },
    "help.insertText": {
      ru: "Выделите текст и нажмите кнопку на панели — выделение обернётся в формулу. Без выделения кнопка вставит шаблон. Хоткеи: Alt+M — строка или блок, Alt+L — синтаксис LaTeX или AsciiMath, Alt+1..9 — вставить дробь, корень, сумму и другие структуры.",
      en: "Select text and press a button on the panel — the selection will be wrapped in a formula. Without a selection the button inserts a template. Hotkeys: Alt+M — inline or block, Alt+L — LaTeX or AsciiMath syntax, Alt+1..9 — insert a fraction, root, sum and other structures.",
      de: "Markieren Sie Text und drücken Sie eine Schaltfläche im Panel — die Auswahl wird in eine Formel eingefasst. Ohne Auswahl fügt die Schaltfläche eine Vorlage ein. Hotkeys: Alt+M — Zeile oder Block, Alt+L — LaTeX- oder AsciiMath-Syntax, Alt+1..9 — Bruch, Wurzel, Summe und andere Strukturen einfügen.",
      tr: "Metin seçin ve paneldeki bir butona basın — seçim formüle dönüştürülür. Seçim yoksa buton bir şablon ekler. Kısayollar: Alt+M — satır veya blok, Alt+L — LaTeX veya AsciiMath sözdizimi, Alt+1..9 — kesir, kök, toplam ve diğer yapıları ekler.",
    },
    "help.completeTitle": {
      ru: "Автодополнение",
      en: "Autocomplete",
      de: "Autovervollständigung",
      tr: "Otomatik tamamlama",
    },
    "help.completeText": {
      ru: "Внутри формулы подсказки появляются сами: в LaTeX-делимитерах — латеховские команды (например, <code>\\frac</code>, <code>\\sqrt</code>), в AsciiMath — аскиматовские (<code>sqrt</code>, <code>sum</code>). Делимитеры, блоки, ключи настроек и разметка markdown — по Ctrl+Space.",
      en: "Inside a formula suggestions appear by themselves: in LaTeX delimiters — LaTeX commands (e.g. <code>\\frac</code>, <code>\\sqrt</code>), in AsciiMath — AsciiMath ones (<code>sqrt</code>, <code>sum</code>). Delimiters, blocks, settings keys and markdown markup — via Ctrl+Space.",
      de: "Innerhalb einer Formel erscheinen Vorschläge von selbst: in LaTeX-Delimitern — LaTeX-Befehle (z. B. <code>\\frac</code>, <code>\\sqrt</code>), in AsciiMath — AsciiMath-Befehle (<code>sqrt</code>, <code>sum</code>). Delimiter, Blöcke, Einstellungsschlüssel und Markdown-Markup — per Ctrl+Space.",
      tr: "Formül içinde öneriler kendiliğinden çıkar: LaTeX sınırlayıcılarında LaTeX komutları (ör. <code>\\frac</code>, <code>\\sqrt</code>), AsciiMath'te AsciiMath komutları (<code>sqrt</code>, <code>sum</code>). Sınırlayıcılar, bloklar, ayar anahtarları ve markdown biçimlendirmesi — Ctrl+Space ile.",
    },
    "help.frontmatterTitle": {
      ru: "Настройки документа (frontmatter)",
      en: "Document settings (frontmatter)",
      de: "Dokumenteinstellungen (Frontmatter)",
      tr: "Belge ayarları (frontmatter)",
    },
    "help.frontmatterText": {
      ru: "Введите <code>---</code> в начале пустого документа — блок настроек развернётся сам и закроется. В нём: <code>title</code> — заголовок, <code>lang</code> — язык (ru, en, de, tr), <code>author</code>, <code>description</code>. Модули: <code>mathjax</code> включён по умолчанию, <code>chessjax</code> и <code>desmos</code> выключены — включить: <code>chessjax: yes</code>.",
      en: "Type <code>---</code> at the start of an empty document — the settings block expands and closes itself. It holds: <code>title</code> — heading, <code>lang</code> — language (ru, en, de, tr), <code>author</code>, <code>description</code>. Modules: <code>mathjax</code> is on by default, <code>chessjax</code> and <code>desmos</code> are off — enable with <code>chessjax: yes</code>.",
      de: "Geben Sie am Anfang eines leeren Dokuments <code>---</code> ein — der Einstellungsblock klappt sich selbst auf und schließt sich. Darin: <code>title</code> — Überschrift, <code>lang</code> — Sprache (ru, en, de, tr), <code>author</code>, <code>description</code>. Module: <code>mathjax</code> ist standardmäßig an, <code>chessjax</code> und <code>desmos</code> sind aus — einschalten: <code>chessjax: yes</code>.",
      tr: "Boş bir belgenin başına <code>---</code> yazın — ayar bloğu kendiliğinden açılır ve kapanır. İçinde: <code>title</code> — başlık, <code>lang</code> — dil (ru, en, de, tr), <code>author</code>, <code>description</code>. Modüller: <code>mathjax</code> varsayılan olarak açık, <code>chessjax</code> ve <code>desmos</code> kapalı — açmak için: <code>chessjax: yes</code>.",
    },
    "help.chessTitle": {
      ru: "Графики и шахматы",
      en: "Graphs and chess",
      de: "Diagramme und Schach",
      tr: "Grafikler ve satranç",
    },
    "help.asciimathText": {
      ru: "AsciiMath пишется в обратных кавычках: <code>`sqrt(2)`</code>. Это упрощённый язык: <code>`sum_(i=1)^n`</code>, греческие буквы — <code>alpha</code>, <code>pi</code>.",
      en: "AsciiMath is written in backticks: <code>`sqrt(2)`</code>. It is a simple language: <code>`sum_(i=1)^n`</code>, Greek letters — <code>alpha</code>, <code>pi</code>.",
      de: "AsciiMath wird in Backticks geschrieben: <code>`sqrt(2)`</code>. Das ist eine einfache Sprache: <code>`sum_(i=1)^n`</code>, griechische Buchstaben — <code>alpha</code>, <code>pi</code>.",
      tr: "AsciiMath ters tırnakla yazılır: <code>`sqrt(2)`</code>. Bu basit bir dildir: <code>`sum_(i=1)^n`</code>, Yunanca harfler — <code>alpha</code>, <code>pi</code>.",
    },
    "help.chessDesmosText": {
      ru: "График Desmos — блок <code>```desmos</code>, каждая строка — выражение, например <code>y=x^2</code>.",
      en: "A Desmos graph — block <code>```desmos</code>, each line an expression, e.g. <code>y=x^2</code>.",
      de: "Ein Desmos-Diagramm — Block <code>```desmos</code>, jede Zeile ein Ausdruck, z. B. <code>y=x^2</code>.",
      tr: "Desmos grafiği — <code>```desmos</code> bloğu, her satır bir ifade, ör. <code>y=x^2</code>.",
    },
    "help.chessBoardText": {
      ru: "Шахматная доска — блок <code>```chess</code> с атрибутами. Минимум: <code>```chess fen=\"начальная позиция\"</code>. Можно партию <code>pgn=\"адрес\"</code> и номер хода <code>move=\"10\"</code>.",
      en: "A chessboard — block <code>```chess</code> with attributes. Minimum: <code>```chess fen=\"starting position\"</code>. You can add a game <code>pgn=\"url\"</code> and a move number <code>move=\"10\"</code>.",
      de: "Ein Schachbrett — Block <code>```chess</code> mit Attributen. Minimum: <code>```chess fen=\"Startposition\"</code>. Möglich: Partie <code>pgn=\"url\"</code> und Zugnummer <code>move=\"10\"</code>.",
      tr: "Satranç tahtası — öznitelikli <code>```chess</code> bloğu. En az: <code>```chess fen=\"başlangıç pozisyonu\"</code>. Bir parti <code>pgn=\"url\"</code> ve hamle numarası <code>move=\"10\"</code> eklenebilir.",
    },
    "help.previewTitle": {
      ru: "Предпросмотр и клавиши",
      en: "Preview and keys",
      de: "Vorschau und Tasten",
      tr: "Önizleme ve tuşlar",
    },
    "help.previewText": {
      ru: "Alt+ё — полный предпросмотр: пересоздать графики и перейти к строке курсора. Ctrl+Shift+Enter — скрыть предпросмотр. Текст предпросмотра обновляется при наборе.",
      en: "Alt+` — full preview: rebuild graphs and jump to the cursor line. Ctrl+Shift+Enter — hide the preview. Preview text updates as you type.",
      de: "Alt+` — volle Vorschau: Diagramme neu aufbauen und zur Cursorzeile springen. Ctrl+Shift+Enter — Vorschau ausblenden. Der Vorschautext aktualisiert sich beim Tippen.",
      tr: "Alt+` — tam önizleme: grafikleri yeniden oluştur ve imleç satırına git. Ctrl+Shift+Enter — önizlemeyi gizle. Önizleme metni yazdıkça güncellenir.",
    },
    "help.fileTitle": {
      ru: "Файл и вывод",
      en: "File and output",
      de: "Datei und Ausgabe",
      tr: "Dosya ve çıktı",
    },
    "help.fileText": {
      ru: "Открыть .md — файл с диска, Скачать .md — сохранить исходник, Сохранить готовый HTML — скачать страницу для раздачи. Примеры открываются из списка «Пример:».",
      en: "Open .md — a file from disk, Download .md — save the source, Save finished HTML — download a page to share. Examples open from the “Example:” list.",
      de: "Open .md — eine Datei von der Festplatte, .md herunterladen — die Quelle speichern, Fertiges HTML speichern — eine Seite zum Teilen herunterladen. Beispiele öffnen sich aus der Liste „Beispiel:“.",
      tr: ".md aç — diskten bir dosya, .md indir — kaynağı kaydet, Hazır HTML kaydet — paylaşmak için bir sayfa indir. Örnekler „Örnek:“ listesinden açılır.",
    },
    "help.close": {
      ru: "Закрыть справку (Esc)",
      en: "Close help (Esc)",
      de: "Hilfe schließen (Esc)",
      tr: "Yardımı kapat (Esc)",
    },

    // --- Объявления скринридера ---------------------------------------------
    "msg.line": { ru: "Строка {n}.", en: "Line {n}.", de: "Zeile {n}.", tr: "Satır {n}." },
    "msg.emptyBlock": { ru: "Пустой блок.", en: "Empty block.", de: "Leerer Block.", tr: "Boş blok." },
    "msg.noPreview": {
      ru: "Нет предпросмотра для этой строки.",
      en: "No preview for this line.",
      de: "Keine Vorschau für diese Zeile.",
      tr: "Bu satır için önizleme yok.",
    },
    "msg.insideFormula": {
      ru: "Вы уже внутри формулы.",
      en: "You are already inside a formula.",
      de: "Sie sind bereits in einer Formel.",
      tr: "Zaten bir formülün içindesiniz.",
    },
    "msg.modeInline": { ru: "строка", en: "inline", de: "Zeile", tr: "satır içi" },
    "msg.modeBlock": { ru: "блок", en: "block", de: "Block", tr: "blok" },
    "msg.insertedFormula": {
      ru: "Вставлено: формула, {mode}.",
      en: "Inserted: formula, {mode}.",
      de: "Eingefügt: Formel, {mode}.",
      tr: "Eklendi: formül, {mode}.",
    },
    "msg.inserted": {
      ru: "Вставлено: {label}.",
      en: "Inserted: {label}.",
      de: "Eingefügt: {label}.",
      tr: "Eklendi: {label}.",
    },
    "msg.insertedWith": {
      ru: "Вставлено: {label}: {text}.",
      en: "Inserted: {label}: {text}.",
      de: "Eingefügt: {label}: {text}.",
      tr: "Eklendi: {label}: {text}.",
    },
    "msg.htmlSaved": { ru: "HTML сохранён.", en: "HTML saved.", de: "HTML gespeichert.", tr: "HTML kaydedildi." },
    "msg.mdSaved": {
      ru: "Файл markdown скачан.",
      en: "Markdown file downloaded.",
      de: "Markdown-Datei heruntergeladen.",
      tr: "Markdown dosyası indirildi.",
    },
    "msg.badExample": {
      ru: "Некорректное имя примера.",
      en: "Invalid example name.",
      de: "Ungültiger Beispielname.",
      tr: "Geçersiz örnek adı.",
    },
    "msg.exampleNotFound": {
      ru: "Пример {name} не найден.",
      en: "Example {name} not found.",
      de: "Beispiel {name} nicht gefunden.",
      tr: "{name} örneği bulunamadı.",
    },
    "msg.exampleOpened": {
      ru: "Пример {name} открыт, предпросмотр показан.",
      en: "Example {name} opened, preview shown.",
      de: "Beispiel {name} geöffnet, Vorschau angezeigt.",
      tr: "{name} örneği açıldı, önizleme gösterildi.",
    },
    "msg.exampleLoaded": {
      ru: "Пример {name} загружен. Покажите предпросмотр: Alt+ё.",
      en: "Example {name} loaded. Show preview: Alt+`.",
      de: "Beispiel {name} geladen. Vorschau anzeigen: Alt+`.",
      tr: "{name} örneği yüklendi. Önizlemeyi göster: Alt+`.",
    },
    "msg.fileOpened": {
      ru: "Файл {name} открыт, предпросмотр показан.",
      en: "File {name} opened, preview shown.",
      de: "Datei {name} geöffnet, Vorschau angezeigt.",
      tr: "{name} dosyası açıldı, önizleme gösterildi.",
    },
    "msg.frontmatterExpanded": {
      ru: "Фронтматтер развёрнут. Введите заголовок.",
      en: "Frontmatter expanded. Enter a title.",
      de: "Frontmatter aufgeklappt. Titel eingeben.",
      tr: "Frontmatter açıldı. Bir başlık girin.",
    },
    "msg.previewHidden": {
      ru: "Предпросмотр скрыт.",
      en: "Preview hidden.",
      de: "Vorschau ausgeblendet.",
      tr: "Önizleme gizlendi.",
    },
    "msg.formulaMode": {
      ru: "Режим вставки формулы: {mode}.",
      en: "Formula insert mode: {mode}.",
      de: "Formel-Einfügemodus: {mode}.",
      tr: "Formül ekleme modu: {mode}.",
    },
    "msg.syntaxMode": {
      ru: "Синтаксис формул: {syntax}.",
      en: "Formula syntax: {syntax}.",
      de: "Formelsyntax: {syntax}.",
      tr: "Formül sözdizimi: {syntax}.",
    },
    "msg.helpOpen": {
      ru: "Справка открыта. Esc — закрыть.",
      en: "Help opened. Esc — close.",
      de: "Hilfe geöffnet. Esc — schließen.",
      tr: "Yardım açıldı. Esc — kapat.",
    },
    "msg.helpClosed": { ru: "Справка закрыта.", en: "Help closed.", de: "Hilfe geschlossen.", tr: "Yardım kapatıldı." },
    "msg.editorReady": {
      ru: "Редактор готов. Нажмите Ctrl+Enter для предпросмотра на строке курсора.",
      en: "Editor ready. Press Ctrl+Enter for preview at the cursor line.",
      de: "Editor bereit. Drücken Sie Ctrl+Enter für die Vorschau an der Cursorzeile.",
      tr: "Editör hazır. İmleç satırında önizleme için Ctrl+Enter'a basın.",
    },
    "msg.badUrl": {
      ru: "Некорректный URL: допустим только http/https.",
      en: "Invalid URL: only http/https allowed.",
      de: "Ungültige URL: nur http/https erlaubt.",
      tr: "Geçersiz URL: yalnızca http/https izinli.",
    },
    "msg.urlHttp": {
      ru: "Не удалось загрузить URL: HTTP {status}.",
      en: "Failed to load URL: HTTP {status}.",
      de: "URL konnte nicht geladen werden: HTTP {status}.",
      tr: "URL yüklenemedi: HTTP {status}.",
    },
    "msg.urlError": {
      ru: "Не удалось загрузить URL: {error}. Сервер должен разрешать CORS.",
      en: "Failed to load URL: {error}. The server must allow CORS.",
      de: "URL konnte nicht geladen werden: {error}. Der Server muss CORS erlauben.",
      tr: "URL yüklenemedi: {error}. Sunucu CORS'a izin vermeli.",
    },
    "msg.urlLoaded": {
      ru: "Markdown загружен по URL. Покажите предпросмотр: Alt+ё.",
      en: "Markdown loaded from URL. Show preview: Alt+`.",
      de: "Markdown von URL geladen. Vorschau anzeigen: Alt+`.",
      tr: "Markdown URL'den yüklendi. Önizlemeyi göster: Alt+`.",
    },
    "msg.langChanged": {
      ru: "Язык интерфейса: {lang}.",
      en: "Interface language: {lang}.",
      de: "Sprache der Oberfläche: {lang}.",
      tr: "Arayüz dili: {lang}.",
    },
    "msg.desmosLive": {
      ru: "График Desmos обновится по Ctrl+Enter.",
      en: "Desmos graph will update on Ctrl+Enter.",
      de: "Desmos-Diagramm wird bei Ctrl+Enter aktualisiert.",
      tr: "Desmos grafiği Ctrl+Enter'da güncellenecek.",
    },
    "msg.desmosFallback": {
      ru: "График Desmos недоступен — не удалось загрузить API.",
      en: "Desmos graph unavailable — failed to load the API.",
      de: "Desmos-Diagramm nicht verfügbar — API konnte nicht geladen werden.",
      tr: "Desmos grafiği kullanılamıyor — API yüklenemedi.",
    },
    "msg.syntaxLatex": { ru: "LaTeX", en: "LaTeX", de: "LaTeX", tr: "LaTeX" },
    "msg.syntaxAscii": { ru: "AsciiMath", en: "AsciiMath", de: "AsciiMath", tr: "AsciiMath" },

    // --- Тулбар -------------------------------------------------------------
    "tool.groupMath": { ru: "Математика", en: "Math", de: "Mathematik", tr: "Matematik" },
    "tool.groupGreek": { ru: "Греческие буквы", en: "Greek letters", de: "Griechische Buchstaben", tr: "Yunan harfleri" },
    "tool.groupSymbols": { ru: "Символы", en: "Symbols", de: "Symbole", tr: "Semboller" },
    "tool.groupChess": { ru: "Шахматы", en: "Chess", de: "Schach", tr: "Satranç" },
    "tool.formula": { ru: "Формула", en: "Formula", de: "Formel", tr: "Formül" },
    "tool.fraction": { ru: "Дробь", en: "Fraction", de: "Bruch", tr: "Kesir" },
    "tool.power": { ru: "Степень", en: "Power", de: "Potenz", tr: "Üs" },
    "tool.root": { ru: "Корень", en: "Root", de: "Wurzel", tr: "Kök" },
    "tool.sum": { ru: "Сумма", en: "Sum", de: "Summe", tr: "Toplam" },
    "tool.integral": { ru: "Интеграл", en: "Integral", de: "Integral", tr: "İntegral" },
    "tool.limit": { ru: "Предел", en: "Limit", de: "Grenzwert", tr: "Limit" },
    "tool.matrix": { ru: "Матрица", en: "Matrix", de: "Matrix", tr: "Matris" },
    "tool.alpha": { ru: "Альфа", en: "Alpha", de: "Alpha", tr: "Alfa" },
    "tool.pi": { ru: "Пи", en: "Pi", de: "Pi", tr: "Pi" },
    "tool.beta": { ru: "Бета", en: "Beta", de: "Beta", tr: "Beta" },
    "tool.ge": { ru: "Больше или равно", en: "Greater than or equal", de: "Größer oder gleich", tr: "Büyük veya eşit" },
    "tool.gamma": { ru: "Гамма", en: "Gamma", de: "Gamma", tr: "Gama" },
    "tool.delta": { ru: "Дельта", en: "Delta", de: "Delta", tr: "Delta" },
    "tool.sigma": { ru: "Сигма", en: "Sigma", de: "Sigma", tr: "Sigma" },
    "tool.lambda": { ru: "Лямбда", en: "Lambda", de: "Lambda", tr: "Lambda" },
    "tool.mu": { ru: "Мю", en: "Mu", de: "Mü", tr: "Mü" },
    "tool.phi": { ru: "Фи", en: "Phi", de: "Phi", tr: "Fi" },
    "tool.theta": { ru: "Тета", en: "Theta", de: "Theta", tr: "Teta" },
    "tool.omega": { ru: "Омега", en: "Omega", de: "Omega", tr: "Omega" },
    "tool.le": { ru: "Меньше или равно", en: "Less than or equal", de: "Kleiner oder gleich", tr: "Küçük veya eşit" },
    "tool.ne": { ru: "Не равно", en: "Not equal", de: "Ungleich", tr: "Eşit değil" },
    "tool.approx": { ru: "Приблизительно", en: "Approximately", de: "Ungefähr", tr: "Yaklaşık" },
    "tool.infty": { ru: "Бесконечность", en: "Infinity", de: "Unendlich", tr: "Sonsuzluk" },
    "tool.in": { ru: "Принадлежит", en: "Element of", de: "Element von", tr: "Elemanı" },
    "tool.subseteq": { ru: "Подмножество", en: "Subset", de: "Teilmenge", tr: "Alt küme" },
    "tool.cup": { ru: "Объединение", en: "Union", de: "Vereinigung", tr: "Birleşim" },
    "tool.cap": { ru: "Пересечение", en: "Intersection", de: "Schnittmenge", tr: "Kesişim" },
    "tool.to": { ru: "Стрелка вправо", en: "Right arrow", de: "Pfeil nach rechts", tr: "Sağ ok" },
    "tool.nabla": { ru: "Набла", en: "Nabla", de: "Nabla", tr: "Nabla" },
    "tool.chess": {
      ru: "Шахматная доска (fenced-блок chess)",
      en: "Chessboard (chess fenced block)",
      de: "Schachbrett (chess-Fenced-Block)",
      tr: "Satranç tahtası (chess fenced bloğu)",
    },

    // --- Автодополнения: frontmatter -----------------------------------------
    "sugg.title": { ru: "Заголовок документа", en: "Document title", de: "Dokumenttitel", tr: "Belge başlığı" },
    "sugg.titleDoc": {
      ru: "Идёт в <title> экспортированного HTML.",
      en: "Goes into the <title> of the exported HTML.",
      de: "Kommt in den <title> des exportierten HTML.",
      tr: "Dışa aktarılan HTML'in <title> öğesine gider.",
    },
    "sugg.titleInsert": { ru: "Название", en: "Title", de: "Titel", tr: "Başlık" },
    "sugg.lang": { ru: "Язык документа", en: "Document language", de: "Dokumentsprache", tr: "Belge dili" },
    "sugg.langDoc": {
      ru: "lang=<…> в <html>. Например ru, en.",
      en: "lang=<…> in <html>. E.g. ru, en.",
      de: "lang=<…> im <html>. Z. B. ru, en.",
      tr: "<html> içinde lang=<…>. Ör. ru, en.",
    },
    "sugg.mathjax": { ru: "Загружать MathJax (по умолчанию да)", en: "Load MathJax (default yes)", de: "MathJax laden (Standard: ja)", tr: "MathJax yükle (varsayılan evet)" },
    "sugg.mathjaxDoc": {
      ru: "no — не подключать MathJax в экспорте.",
      en: "no — do not include MathJax in the export.",
      de: "no — MathJax im Export nicht einbinden.",
      tr: "no — MathJax'ı dışa aktarmaya dahil etme.",
    },
    "sugg.chessjax": { ru: "Шахматные доски (по умолчанию нет)", en: "Chessboards (default no)", de: "Schachbretter (Standard: nein)", tr: "Satranç tahtaları (varsayılan hayır)" },
    "sugg.chessjaxDoc": {
      ru: "yes — подключить chessjax и включить блоки ```chess.",
      en: "yes — load chessjax and enable ```chess blocks.",
      de: "yes — chessjax laden und ```chess-Blöcke aktivieren.",
      tr: "yes — chessjax'ı yükle ve ```chess bloklarını etkinleştir.",
    },
    "sugg.desmos": { ru: "Графики Desmos (по умолчанию нет)", en: "Desmos graphs (default no)", de: "Desmos-Diagramme (Standard: nein)", tr: "Desmos grafikleri (varsayılan hayır)" },
    "sugg.desmosDoc": {
      ru: "yes — подключить Desmos и включить блоки ```desmos.",
      en: "yes — load Desmos and enable ```desmos blocks.",
      de: "yes — Desmos laden und ```desmos-Blöcke aktivieren.",
      tr: "yes — Desmos'u yükle ve ```desmos bloklarını etkinleştir.",
    },
    "sugg.author": { ru: "Автор", en: "Author", de: "Autor", tr: "Yazar" },
    "sugg.authorInsert": { ru: "Автор", en: "Author", de: "Autor", tr: "Yazar" },
    "sugg.description": { ru: "Описание документа", en: "Document description", de: "Dokumentbeschreibung", tr: "Belge açıklaması" },
    "sugg.descriptionInsert": { ru: "Описание", en: "Description", de: "Beschreibung", tr: "Açıklama" },
    "sugg.css": { ru: "Дополнительный CSS", en: "Additional CSS", de: "Zusätzliches CSS", tr: "Ek CSS" },
    "sugg.cssDoc": {
      ru: "URL стиля, подключается в экспорт.",
      en: "Style URL, included in the export.",
      de: "URL des Styles, im Export eingebunden.",
      tr: "Stil URL'si, dışa aktarmaya dahil edilir.",
    },
    "sugg.mathjaxNested": { ru: "Настройки MathJax (вложенно)", en: "MathJax settings (nested)", de: "MathJax-Einstellungen (verschachtelt)", tr: "MathJax ayarları (iç içe)" },
    "sugg.desmosNested": { ru: "Опции Desmos.Calculator (вложенно)", en: "Desmos.Calculator options (nested)", de: "Desmos.Calculator-Optionen (verschachtelt)", tr: "Desmos.Calculator seçenekleri (iç içe)" },
    "sugg.chessNested": { ru: "Атрибуты досок по умолчанию", en: "Default board attributes", de: "Standard-Brettattribute", tr: "Varsayılan tahta öznitelikleri" },

    // --- Автодополнения: блоки ``` -------------------------------------------
    "sugg.fenDetail": { ru: "Доска по начальной позиции", en: "Board from the starting position", de: "Brett von der Startposition", tr: "Başlangıç pozisyonundan tahta" },
    "sugg.fenDoc": {
      ru: "Блок ```chess с атрибутом fen=\"…\".",
      en: "A ```chess block with the fen=\"…\" attribute.",
      de: "Ein ```chess-Block mit dem Attribut fen=\"…\".",
      tr: "fen=\"…\" özniteliğine sahip bir ```chess bloğu.",
    },
    "sugg.pgnDetail": { ru: "Доска по партии", en: "Board from a game", de: "Brett aus einer Partie", tr: "Bir partiden tahta" },
    "sugg.pgnDoc": {
      ru: "Блок ```chess с атрибутом pgn=\"url\", move — ход, с которого начать.",
      en: "A ```chess block with pgn=\"url\", move — the move to start from.",
      de: "Ein ```chess-Block mit pgn=\"url\", move — der Zug, mit dem gestartet wird.",
      tr: "pgn=\"url\" özniteliğine sahip bir ```chess bloğu, move — başlanacak hamle.",
    },
    "sugg.desmosBlock": { ru: "График Desmos (блок)", en: "Desmos graph (block)", de: "Desmos-Diagramm (Block)", tr: "Desmos grafiği (blok)" },
    "sugg.desmosBlockDoc": {
      ru: "Каждая строка — LaTeX-выражение.",
      en: "Each line is a LaTeX expression.",
      de: "Jede Zeile ist ein LaTeX-Ausdruck.",
      tr: "Her satır bir LaTeX ifadesidir.",
    },

    // --- Автодополнения: заготовки (Ctrl+Space) ------------------------------
    "sugg.dollar": { ru: "Разделитель LaTeX внутри строки", en: "Inline LaTeX delimiter", de: "Inline-LaTeX-Trennzeichen", tr: "Satır içi LaTeX ayracı" },
    "sugg.dollardd": { ru: "Разделитель LaTeX на отдельной строке", en: "Display LaTeX delimiter (own line)", de: "LaTeX-Trennzeichen für eigene Zeile", tr: "Ayrı satırda LaTeX ayracı" },
    "sugg.backtick": { ru: "AsciiMath в строке", en: "Inline AsciiMath", de: "AsciiMath im Text", tr: "Satır içi AsciiMath" },
    "sugg.headingLabel": { ru: "# Заголовок", en: "# Heading", de: "# Überschrift", tr: "# Başlık" },
    "sugg.heading": { ru: "Заголовок раздела", en: "Section heading", de: "Abschnittsüberschrift", tr: "Bölüm başlığı" },
    "sugg.linkLabel": { ru: "[текст](url)", en: "[text](url)", de: "[text](url)", tr: "[metin](url)" },
    "sugg.link": { ru: "Ссылка", en: "Link", de: "Link", tr: "Bağlantı" },
    "sugg.boldLabel": { ru: "**жирный**", en: "**bold**", de: "**fett**", tr: "**kalın**" },
    "sugg.bold": { ru: "Жирное выделение", en: "Bold", de: "Fett", tr: "Kalın" },
    "sugg.italicLabel": { ru: "*курсив*", en: "*italic*", de: "*kursiv*", tr: "*italik*" },
    "sugg.italic": { ru: "Курсив", en: "Italic", de: "Kursiv", tr: "İtalik" },

    // --- Автодополнения: LaTeX (детали) ---------------------------------------
    "sugg.tex.fraction": { ru: "Дробь", en: "Fraction", de: "Bruch", tr: "Kesir" },
    "sugg.tex.sqrt": { ru: "Квадратный корень", en: "Square root", de: "Quadratwurzel", tr: "Karekök" },
    "sugg.tex.sqrtn": { ru: "Корень n-й степени", en: "nth root", de: "N-te Wurzel", tr: "n. dereceden kök" },
    "sugg.tex.sum": { ru: "Сумма", en: "Sum", de: "Summe", tr: "Toplam" },
    "sugg.tex.integral": { ru: "Интеграл", en: "Integral", de: "Integral", tr: "İntegral" },
    "sugg.tex.limit": { ru: "Предел", en: "Limit", de: "Grenzwert", tr: "Limit" },
    "sugg.tex.pmatrix": { ru: "Матрица", en: "Matrix", de: "Matrix", tr: "Matris" },
    "sugg.tex.aligned": { ru: "Выравнивание/система", en: "Alignment/system", de: "Ausrichtung/System", tr: "Hizalama/sistem" },
    "sugg.tex.leftparen": { ru: "Скобки по размеру", en: "Size-adjusting brackets", de: "Größenanpassende Klammern", tr: "Boyut uyarlamalı parantezler" },
    "sugg.tex.leftbracket": { ru: "Квадратные скобки", en: "Square brackets", de: "Eckige Klammern", tr: "Köşeli parantezler" },
    "sugg.tex.leftbrace": { ru: "Фигурные скобки", en: "Curly braces", de: "Geschweifte Klammern", tr: "Küme parantezleri" },
    "sugg.tex.leftpipe": { ru: "Модуль по размеру", en: "Size-adjusting absolute value", de: "Größenanpassender Betrag", tr: "Boyut uyarlamalı mutlak değer" },
    "sugg.tex.sup": { ru: "Верхний индекс", en: "Superscript", de: "Hochgestellt", tr: "Üst simge" },
    "sugg.tex.sub": { ru: "Нижний индекс", en: "Subscript", de: "Tiefgestellt", tr: "Alt simge" },
    "sugg.tex.text": { ru: "Текст внутри формулы", en: "Text inside a formula", de: "Text in einer Formel", tr: "Formül içinde metin" },
    "sugg.tex.gamma": { ru: "Гамма", en: "Gamma", de: "Gamma", tr: "Gama" },
    "sugg.tex.delta": { ru: "Дельта", en: "Delta", de: "Delta", tr: "Delta" },
    "sugg.tex.Delta": { ru: "Дельта большая", en: "Capital Delta", de: "Großes Delta", tr: "Büyük delta" },
    "sugg.tex.lambda": { ru: "Лямбда", en: "Lambda", de: "Lambda", tr: "Lambda" },
    "sugg.tex.mu": { ru: "Мю", en: "Mu", de: "Mü", tr: "Mü" },
    "sugg.tex.sigma": { ru: "Сигма", en: "Sigma", de: "Sigma", tr: "Sigma" },
    "sugg.tex.theta": { ru: "Тета", en: "Theta", de: "Theta", tr: "Teta" },
    "sugg.tex.pi": { ru: "Пи", en: "Pi", de: "Pi", tr: "Pi" },
    "sugg.tex.phi": { ru: "Фи", en: "Phi", de: "Phi", tr: "Fi" },
    "sugg.tex.infty": { ru: "Бесконечность", en: "Infinity", de: "Unendlich", tr: "Sonsuzluk" },
    "sugg.tex.cdot": { ru: "Точка умножения", en: "Multiplication dot", de: "Multiplikationspunkt", tr: "Çarpma noktası" },
    "sugg.tex.times": { ru: "Крестик умножения", en: "Multiplication sign", de: "Multiplikationszeichen", tr: "Çarpma işareti" },
    "sugg.tex.pm": { ru: "Плюс-минус", en: "Plus-minus", de: "Plus-Minus", tr: "Artı-eksi" },
    "sugg.tex.leq": { ru: "Меньше или равно", en: "Less than or equal", de: "Kleiner oder gleich", tr: "Küçük veya eşit" },
    "sugg.tex.geq": { ru: "Больше или равно", en: "Greater than or equal", de: "Größer oder gleich", tr: "Büyük veya eşit" },
    "sugg.tex.neq": { ru: "Не равно", en: "Not equal", de: "Ungleich", tr: "Eşit değil" },
    "sugg.tex.approx": { ru: "Приблизительно", en: "Approximately", de: "Ungefähr", tr: "Yaklaşık" },
    "sugg.tex.rightarrow": { ru: "Стрелка вправо", en: "Right arrow", de: "Pfeil nach rechts", tr: "Sağ ok" },
    "sugg.tex.in": { ru: "Принадлежит", en: "Element of", de: "Element von", tr: "Elemanı" },
    "sugg.tex.sin": { ru: "Синус", en: "Sine", de: "Sinus", tr: "Sinüs" },
    "sugg.tex.cos": { ru: "Косинус", en: "Cosine", de: "Kosinus", tr: "Kosinüs" },
    "sugg.tex.tan": { ru: "Тангенс", en: "Tangent", de: "Tangens", tr: "Tanjant" },
    "sugg.tex.log": { ru: "Логарифм", en: "Logarithm", de: "Logarithmus", tr: "Logaritma" },
    "sugg.tex.ln": { ru: "Натуральный логарифм", en: "Natural logarithm", de: "Natürlicher Logarithmus", tr: "Doğal logaritma" },
    "sugg.tex.vec": { ru: "Вектор", en: "Vector", de: "Vektor", tr: "Vektör" },
    "sugg.tex.hat": { ru: "Шляпка (единичный вектор)", en: "Hat (unit vector)", de: "Hut (Einheitsvektor)", tr: "Şapka (birim vektör)" },
    "sugg.tex.binom": { ru: "Биномиальный коэффициент", en: "Binomial coefficient", de: "Binomialkoeffizient", tr: "Binom katsayısı" },
    // Вставки с локализованными плейсхолдерами (tabstop'ы Monaco).
    "sugg.dollarInsert": { ru: "$${1:формула}$", en: "$${1:formula}$", de: "$${1:Formel}$", tr: "$${1:formül}$" },
    "sugg.dollarddInsert": { ru: "$$${1:формула}$$", en: "$$${1:formula}$$", de: "$$${1:Formel}$$", tr: "$$${1:formül}$$" },
    "sugg.headingInsert": { ru: "# ${1:Заголовок}", en: "# ${1:Heading}", de: "# ${1:Überschrift}", tr: "# ${1:Başlık}" },
    "sugg.linkInsert": { ru: "[${1:текст}](https://…)", en: "[${1:text}](https://…)", de: "[${1:Text}](https://…)", tr: "[${1:metin}](https://…)" },
    "sugg.boldInsert": { ru: "**${1:жирный текст}**", en: "**${1:bold text}**", de: "**${1:fetter Text}**", tr: "**${1:kalın metin}**" },
    "sugg.italicInsert": { ru: "*${1:курсив}*", en: "*${1:italic}*", de: "*${1:kursiv}*", tr: "*${1:italik}*" },
    "sugg.tex.fractionInsert": { ru: "\\frac{${1:числитель}}{${2:знаменатель}}", en: "\\frac{${1:numerator}}{${2:denominator}}", de: "\\frac{${1:Zähler}}{${2:Nenner}}", tr: "\\frac{${1:pay}}{${2:payda}}" },
    "sugg.tex.leftparenInsert": { ru: "\\left( ${1:выражение} \\right)", en: "\\left( ${1:expression} \\right)", de: "\\left( ${1:Ausdruck} \\right)", tr: "\\left( ${1:ifade} \\right)" },
    "sugg.tex.leftbracketInsert": { ru: "\\left[ ${1:выражение} \\right]", en: "\\left[ ${1:expression} \\right]", de: "\\left[ ${1:Ausdruck} \\right]", tr: "\\left[ ${1:ifade} \\right]" },
    "sugg.tex.leftbraceInsert": { ru: "\\left\\{ ${1:выражение} \\right\\}", en: "\\left\\{ ${1:expression} \\right\\}", de: "\\left\\{ ${1:Ausdruck} \\right\\}", tr: "\\left\\{ ${1:ifade} \\right\\}" },
    "sugg.tex.leftpipeInsert": { ru: "\\left| ${1:выражение} \\right|", en: "\\left| ${1:expression} \\right|", de: "\\left| ${1:Ausdruck} \\right|", tr: "\\left| ${1:ifade} \\right|" },
    "sugg.tex.supInsert": { ru: "^{${1:степень}}", en: "^{${1:exponent}}", de: "^{${1:Exponent}}", tr: "^{${1:üst}}" },
    "sugg.tex.subInsert": { ru: "_{${1:индекс}}", en: "_{${1:index}}", de: "_{${1:Index}}", tr: "_{${1:indeks}}" },
    "sugg.tex.textInsert": { ru: "\\text{${1:текст}}", en: "\\text{${1:text}}", de: "\\text{${1:Text}}", tr: "\\text{${1:metin}}" },

    // --- Автодополнения: AsciiMath (детали) -----------------------------------
    "sugg.ascii.fraction": { ru: "Дробь (a)/(b)", en: "Fraction (a)/(b)", de: "Bruch (a)/(b)", tr: "Kesir (a)/(b)" },
    "sugg.ascii.sqrt": { ru: "Квадратный корень", en: "Square root", de: "Quadratwurzel", tr: "Karekök" },
    "sugg.ascii.root": { ru: "Корень n-й степени", en: "nth root", de: "N-te Wurzel", tr: "n. dereceden kök" },
    "sugg.ascii.sum": { ru: "Сумма", en: "Sum", de: "Summe", tr: "Toplam" },
    "sugg.ascii.int": { ru: "Интеграл", en: "Integral", de: "Integral", tr: "İntegral" },
    "sugg.ascii.lim": { ru: "Предел", en: "Limit", de: "Grenzwert", tr: "Limit" },
    "sugg.ascii.power": { ru: "Степень", en: "Power", de: "Potenz", tr: "Üs" },
    "sugg.ascii.index": { ru: "Индекс", en: "Index", de: "Index", tr: "İndeks" },
    "sugg.ascii.abs": { ru: "Модуль |x|", en: "Absolute value |x|", de: "Betrag |x|", tr: "Mutlak değer |x|" },
    "sugg.ascii.alpha": { ru: "Альфа", en: "Alpha", de: "Alpha", tr: "Alfa" },
    "sugg.ascii.beta": { ru: "Бета", en: "Beta", de: "Beta", tr: "Beta" },
    "sugg.ascii.gamma": { ru: "Гамма", en: "Gamma", de: "Gamma", tr: "Gama" },
    "sugg.ascii.delta": { ru: "Дельта", en: "Delta", de: "Delta", tr: "Delta" },
    "sugg.ascii.Delta": { ru: "Дельта большая", en: "Capital Delta", de: "Großes Delta", tr: "Büyük delta" },
    "sugg.ascii.lambda": { ru: "Лямбда", en: "Lambda", de: "Lambda", tr: "Lambda" },
    "sugg.ascii.mu": { ru: "Мю", en: "Mu", de: "Mü", tr: "Mü" },
    "sugg.ascii.sigma": { ru: "Сигма", en: "Sigma", de: "Sigma", tr: "Sigma" },
    "sugg.ascii.theta": { ru: "Тета", en: "Theta", de: "Theta", tr: "Teta" },
    "sugg.ascii.pi": { ru: "Пи", en: "Pi", de: "Pi", tr: "Pi" },
    "sugg.ascii.phi": { ru: "Фи", en: "Phi", de: "Phi", tr: "Fi" },
    "sugg.ascii.oo": { ru: "Бесконечность", en: "Infinity", de: "Unendlich", tr: "Sonsuzluk" },
    "sugg.ascii.arrow": { ru: "Стрелка вправо", en: "Right arrow", de: "Pfeil nach rechts", tr: "Sağ ok" },
    "sugg.ascii.ge": { ru: "Больше или равно", en: "Greater than or equal", de: "Größer oder gleich", tr: "Büyük veya eşit" },
    "sugg.ascii.le": { ru: "Меньше или равно", en: "Less than or equal", de: "Kleiner oder gleich", tr: "Küçük veya eşit" },
    "sugg.ascii.ne": { ru: "Не равно", en: "Not equal", de: "Ungleich", tr: "Eşit değil" },
    "sugg.ascii.approx": { ru: "Приблизительно", en: "Approximately", de: "Ungefähr", tr: "Yaklaşık" },
    "sugg.ascii.pm": { ru: "Плюс-минус", en: "Plus-minus", de: "Plus-Minus", tr: "Artı-eksi" },
    "sugg.ascii.cdot": { ru: "Точка умножения", en: "Multiplication dot", de: "Multiplikationspunkt", tr: "Çarpma noktası" },
    "sugg.ascii.sin": { ru: "Синус", en: "Sine", de: "Sinus", tr: "Sinüs" },
    "sugg.ascii.cos": { ru: "Косинус", en: "Cosine", de: "Kosinus", tr: "Kosinüs" },
    "sugg.ascii.tan": { ru: "Тангенс", en: "Tangent", de: "Tangens", tr: "Tanjant" },
    "sugg.ascii.log": { ru: "Логарифм", en: "Logarithm", de: "Logarithmus", tr: "Logaritma" },
    "sugg.ascii.ln": { ru: "Натуральный логарифм", en: "Natural logarithm", de: "Natürlicher Logarithmus", tr: "Doğal logaritma" },
    "sugg.ascii.vec": { ru: "Вектор", en: "Vector", de: "Vektor", tr: "Vektör" },
    "sugg.ascii.hat": { ru: "Шляпка (единичный вектор)", en: "Hat (unit vector)", de: "Hut (Einheitsvektor)", tr: "Şapka (birim vektör)" },

    // --- Автодополнения: атрибуты chess ----------------------------------------
    "sugg.attr.fen": { ru: "Начальная позиция FEN", en: "FEN starting position", de: "FEN-Startposition", tr: "FEN başlangıç pozisyonu" },
    "sugg.attr.pgn": { ru: "URL партии в PGN", en: "Game URL in PGN", de: "Partie-URL in PGN", tr: "PGN formatında parti URL'si" },
    "sugg.attr.pgnDoc": {
      ru: "Можно jsdelivr-CDN, как в примерах.",
      en: "A jsdelivr CDN works, as in the examples.",
      de: "Wie in den Beispielen funktioniert auch ein jsdelivr-CDN.",
      tr: "Örneklerdeki gibi jsdelivr-CDN çalışır.",
    },
    "sugg.attr.move": { ru: "Ход, с которого начать", en: "Move to start from", de: "Zug, mit dem gestartet wird", tr: "Başlanacak hamle" },
    "sugg.attr.lang": { ru: "Язык озвучки (ru/en/…)", en: "Speech language (ru/en/…)", de: "Sprache der Ansage (ru/en/…)", tr: "Seslendirme dili (ru/en/…)" },
    "sugg.attr.controls": { ru: "Кнопки управления (по умолчанию on)", en: "Control buttons (default on)", de: "Steuerungsschaltflächen (Standard: on)", tr: "Kontrol butonları (varsayılan on)" },
    "sugg.attr.tone": { ru: "Тон преимущества (по умолчанию on)", en: "Advantage tone (default on)", de: "Vorteilston (Standard: on)", tr: "Üstünlük tonu (varsayılan on)" },
    "sugg.attr.sound": { ru: "Звуки ходов (по умолчанию on)", en: "Move sounds (default on)", de: "Zuggeräusche (Standard: on)", tr: "Hamle sesleri (varsayılan on)" },
    "sugg.attr.id": { ru: "id доски для ссылок", en: "Board id for links", de: "Brett-id für Links", tr: "Bağlantılar için tahta id" },

    // --- Автодополнения: Desmos (детали) ---------------------------------------
    "sugg.desmosExpr.parabola": { ru: "Парабола", en: "Parabola", de: "Parabel", tr: "Parabol" },
    "sugg.desmosExpr.sin": { ru: "Синус", en: "Sine", de: "Sinus", tr: "Sinüs" },
    "sugg.desmosExpr.cos": { ru: "Косинус", en: "Cosine", de: "Kosinus", tr: "Kosinüs" },
    "sugg.desmosExpr.tan": { ru: "Тангенс", en: "Tangent", de: "Tangens", tr: "Tanjant" },
    "sugg.desmosExpr.sqrt": { ru: "Корень", en: "Root", de: "Wurzel", tr: "Kök" },
    "sugg.desmosExpr.log": { ru: "Логарифм", en: "Logarithm", de: "Logarithmus", tr: "Logaritma" },
    "sugg.desmosExpr.abs": { ru: "Модуль", en: "Absolute value", de: "Betrag", tr: "Mutlak değer" },

    // --- Экспорт и документ ----------------------------------------------------
    "doc.chessOff": {
      ru: "Шахматные доски не подключены — добавьте в начало файла: <code>chessjax: yes</code>",
      en: "Chessboards are not included — add at the top of the file: <code>chessjax: yes</code>",
      de: "Schachbretter sind nicht eingebunden — fügen Sie oben in die Datei ein: <code>chessjax: yes</code>",
      tr: "Satranç tahtaları dahil edilmedi — dosyanın başına ekleyin: <code>chessjax: yes</code>",
    },
    "doc.desmosOff": {
      ru: "Графики Desmos не подключены — добавьте в начало файла: <code>desmos: yes</code>",
      en: "Desmos graphs are not included — add at the top of the file: <code>desmos: yes</code>",
      de: "Desmos-Diagramme sind nicht eingebunden — fügen Sie oben in die Datei ein: <code>desmos: yes</code>",
      tr: "Desmos grafikleri dahil edilmedi — dosyanın başına ekleyin: <code>desmos: yes</code>",
    },
    "doc.exportTitle": { ru: "Математический документ", en: "Math document", de: "Mathedokument", tr: "Matematik belgesi" },

    // --- Редактор ---------------------------------------------------------------
    "editor.ariaLabel": {
      ru: "Редактор математики. Пишите markdown, LaTeX или AsciiMath.",
      en: "Math editor. Write markdown, LaTeX or AsciiMath.",
      de: "Mathe-Editor. Markdown, LaTeX oder AsciiMath schreiben.",
      tr: "Matematik editörü. Markdown, LaTeX veya AsciiMath yazın.",
    },

    // --- Демо-документ ------------------------------------------------------------
    "demo.title": { ru: "Пример документа", en: "Example document", de: "Beispieldokument", tr: "Örnek belge" },
    "demo.formulas": { ru: "Формулы", en: "Formulas", de: "Formeln", tr: "Formüller" },
    "demo.inline": { ru: "LaTeX в строке", en: "LaTeX inline", de: "LaTeX im Text", tr: "Satır içi LaTeX" },
    "demo.display": { ru: "Формула на отдельной строке:", en: "Formula on its own line:", de: "Formel in einer eigenen Zeile:", tr: "Ayrı bir satırda formül:" },
    "demo.asciimath": { ru: "AsciiMath через обратные кавычки", en: "AsciiMath with backticks", de: "AsciiMath mit Backticks", tr: "AsciiMath ters tırnakla" },
    "demo.graph": { ru: "График Desmos", en: "Desmos graph", de: "Desmos-Diagramm", tr: "Desmos grafiği" },
    "demo.markdown": { ru: "Обычный markdown", en: "Plain markdown", de: "Einfaches Markdown", tr: "Düz markdown" },
    "demo.bold": { ru: "Жирный текст", en: "bold text", de: "Fetter Text", tr: "kalın metin" },
    "demo.italic": { ru: "курсив", en: "italic", de: "kursiv", tr: "italik" },
    "demo.link": { ru: "ссылка", en: "link", de: "Link", tr: "bağlantı" },
  };

  function detectLang() {
    try {
      var p = new URLSearchParams(location.search);
      var q = p.get("lang");
      if (q && LANGS.indexOf(q) !== -1) return q;
    } catch (e) {}
    try {
      var s = localStorage.getItem("mathmd-lang");
      if (s && LANGS.indexOf(s) !== -1) return s;
    } catch (e) {}
    var nav = (navigator.language || "ru").toLowerCase();
    for (var i = 0; i < LANGS.length; i++) {
      if (nav.indexOf(LANGS[i]) === 0) return LANGS[i];
    }
    return "ru";
  }

  var current = detectLang();

  function t(key, vars) {
    var entry = DICT[key];
    if (!entry) return key;
    var s = entry[current] != null ? entry[current] : entry.ru != null ? entry.ru : key;
    if (vars) {
      for (var k in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, k)) {
          s = s.split("{" + k + "}").join(vars[k]);
        }
      }
    }
    return s;
  }

  function applyStatic() {
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) els[i].innerHTML = t(els[i].getAttribute("data-i18n"));
    var arias = document.querySelectorAll("[data-i18n-aria]");
    for (var j = 0; j < arias.length; j++) arias[j].setAttribute("aria-label", t(arias[j].getAttribute("data-i18n-aria")));
    var titleEl = document.getElementById("doc-title");
    if (titleEl) document.title = t("doc.title");
    var descEl = document.getElementById("doc-desc");
    if (descEl) descEl.setAttribute("content", t("doc.description"));
    document.documentElement.lang = current;
    var sel = document.getElementById("lang-select");
    if (sel) sel.value = current;
  }

  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) return;
    current = lang;
    try {
      localStorage.setItem("mathmd-lang", lang);
    } catch (e) {}
    applyStatic();
    window.dispatchEvent(new CustomEvent("i18nchange", { detail: lang }));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyStatic);
  } else {
    applyStatic();
  }

  window.I18N = {
    t: t,
    setLang: setLang,
    getLang: function () { return current; },
    langName: function (lang) { return LANG_NAMES[lang] || lang; },
    LANGS: LANGS,
    applyStatic: applyStatic,
  };
})();
