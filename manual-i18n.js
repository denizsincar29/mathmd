// manual-i18n.js — тексты полного руководства (manual.html).
//
// Отдельным файлом, а не в i18n.js: руководство длинное, а i18n.js грузится
// на каждой странице редактора. Здесь есть ru, en, tr и de — переключатель
// языка в шапке руководства открывает нужный сразу.
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
      tr: "Kılavuz — mathmd matematik editörü",
      de: "Anleitung — der mathmd-Mathe-Editor",
    },
    "manual.h1": {
      ru: "Полное руководство",
      en: "Complete manual",
      tr: "Tam kılavuz",
      de: "Vollständige Anleitung",
    },
    "manual.lead": {
      ru: "Всё, что умеет редактор: markdown, формулы двумя языками, графики Desmos и шахматные доски. Написано простыми словами — читайте по порядку или переходите к нужному разделу через содержание.",
      en: "Everything the editor can do: markdown, formulas in two languages, Desmos graphs and chessboards. Written in plain words — read it in order or jump to a section from the table of contents.",
      tr: "Editörün yapabildiği her şey: markdown, iki dilde formül, Desmos grafikleri ve satranç tahtaları. Basit bir dille yazıldı — sırayla okuyun veya içindekiler bölümünden istediğiniz kısma geçin.",
      de: "Alles, was der Editor kann: Markdown, Formeln in zwei Sprachen, Desmos-Diagramme und Schachbretter. Einfach geschrieben — lesen Sie der Reihe nach oder springen Sie über das Inhaltsverzeichnis zum gewünschten Abschnitt.",
    },
    "manual.backToEditor": {
      ru: "Вернуться к редактору",
      en: "Back to the editor",
      tr: "Editöre dön",
      de: "Zurück zum Editor",
    },
    // Подсказка сверху страницы: Escape закрывает руководство и возвращает в
    // редактор (из редактора руководство открывают новой вкладкой — её и закрываем).
    "manual.escapeHint": {
      ru: "<strong>Escape</strong> — вернуться в редактор.",
      en: "<strong>Escape</strong> — back to the editor.",
      tr: "<strong>Escape</strong> — editöre dön.",
      de: "<strong>Escape</strong> — zurück zum Editor.",
    },
    // Подсказка над живым примером: из графика или доски Escape возвращает
    // к тексту руководства, на кнопку входа в интерактив.
    "manual.previewEscape": {
      ru: "Нажмите Escape, чтобы вернуться к руководству.",
      en: "Press Escape to return to the manual.",
      tr: "Kılavuza dönmek için Escape tuşuna basın.",
      de: "Drücken Sie Escape, um zur Anleitung zurückzukehren.",
    },
    "manual.tocHeading": {
      ru: "Содержание",
      en: "Contents",
      tr: "İçindekiler",
      de: "Inhalt",
    },
    "manual.toc.intro": { ru: "Введение", en: "Introduction", tr: "Giriş", de: "Einführung" },
    "manual.toc.start": { ru: "С чего начать", en: "Getting started", tr: "Nereden başlamalı", de: "Erste Schritte" },
    "manual.toc.markdown": { ru: "Обычный текст и markdown", en: "Plain text and markdown", tr: "Düz metin ve markdown", de: "Klartext und Markdown" },
    "manual.toc.formulas": { ru: "Два языка формул: AsciiMath и LaTeX", en: "Two formula languages: AsciiMath and LaTeX", tr: "İki formül dili: AsciiMath ve LaTeX", de: "Zwei Formelsprachen: AsciiMath und LaTeX" },
    "manual.toc.asciimath": { ru: "AsciiMath: как писать", en: "AsciiMath: how to write", tr: "AsciiMath: nasıl yazılır", de: "AsciiMath: wie man schreibt" },
    "manual.toc.latex": { ru: "LaTeX: как писать", en: "LaTeX: how to write", tr: "LaTeX: nasıl yazılır", de: "LaTeX: wie man schreibt" },
    "manual.toc.desmos": { ru: "Графики Desmos", en: "Desmos graphs", tr: "Desmos grafikleri", de: "Desmos-Diagramme" },
    "manual.toc.chess": { ru: "Шахматные доски", en: "Chessboards", tr: "Satranç tahtaları", de: "Schachbretter" },
    "manual.toc.keys": { ru: "Кнопки, клавиши и подсказки", en: "Buttons, keys and suggestions", tr: "Düğmeler, tuşlar ve öneriler", de: "Schaltflächen, Tasten und Vorschläge" },
    "manual.toc.frontmatter": { ru: "Настройки документа", en: "Document settings", tr: "Belge ayarları", de: "Dokumenteinstellungen" },
    "manual.toc.files": { ru: "Файлы, примеры и экспорт", en: "Files, examples and export", tr: "Dosyalar, örnekler ve dışa aktarma", de: "Dateien, Beispiele und Export" },
    "manual.example": { ru: "Пример:", en: "Example:", tr: "Örnek:", de: "Beispiel:" },
    "manual.copyCode": { ru: "Скопировать код", en: "Copy code", tr: "Kodu kopyala", de: "Code kopieren" },
    "manual.copied": { ru: "Код скопирован в буфер обмена.", en: "Code copied to the clipboard.", tr: "Kod panoya kopyalandı.", de: "Code in die Zwischenablage kopiert." },
    "manual.copyFailed": { ru: "Не удалось скопировать. Выделите код и скопируйте вручную.", en: "Could not copy. Select the code and copy it by hand.", tr: "Kopyalanamadı. Kodu seçip elle kopyalayın.", de: "Kopieren fehlgeschlagen. Code markieren und manuell kopieren." },
    "manual.previewLabel": { ru: "Предпросмотр", en: "Preview", tr: "Önizleme", de: "Vorschau" },
    "manual.markdownExample": {
      ru: "Ниже собрана вся разметка сразу. Это и код, и результат: после кода показано, как он выглядит в готовом документе.",
      en: "Below, all the markup is collected in one place. It is both code and result: after the code you see how it looks in a finished document.",
      tr: "Aşağıda tüm biçimlendirme bir arada toplanmıştır. Hem kod hem de sonuç: kodun ardından, tamamlanmış belgede nasıl göründüğü gösterilir.",
      de: "Unten ist die gesamte Formatierung auf einmal zusammengestellt. Das ist Code und Ergebnis zugleich: nach dem Code wird gezeigt, wie er im fertigen Dokument aussieht.",
    },
    "manual.chessHeadAttrs": { ru: "Атрибуты", en: "Attributes", tr: "Öznitelikler", de: "Attribute" },
    "manual.chessHeadKeys": { ru: "Клавиши", en: "Keys", tr: "Tuşlar", de: "Tasten" },
    "manual.chessHeadExport": { ru: "Что в готовом документе", en: "What the exported document contains", tr: "Hazır belgede neler var", de: "Was im fertigen Dokument steckt" },

    // --- Введение -----------------------------------------------------------
    "manual.introText1": {
      ru: "mathmd — доступный математический редактор в браузере. Он нужен, чтобы писать и публиковать математические тексты: статьи и конспекты, задачи с решениями, разборы партий. Текст, формулы, графики и шахматные доски собираются в одном документе, а готовую работу можно отдать читателю ссылкой или файлом.",
      en: "mathmd is an accessible mathematical editor in the browser. It is made for writing and publishing mathematical texts: articles and notes, problems with solutions, game analyses. Text, formulas, graphs and chessboards come together in one document, and the finished work can be handed to a reader as a link or a file.",
      tr: "mathmd, tarayıcıda çalışan, erişilebilir bir matematik editörüdür. Matematiksel metinler yazmak ve yayımlamak için kullanılır: makaleler ve notlar, çözümlü problemler, oyun analizleri. Metin, formüller, grafikler ve satranç tahtaları tek bir belgede birleşir; hazır çalışma okuyucuya bir bağlantı veya dosya olarak verilebilir.",
      de: "mathmd ist ein barrierefreier mathematischer Editor im Browser. Er dient zum Schreiben und Veröffentlichen mathematischer Texte: Artikel und Notizen, Aufgaben mit Lösungen, Partieanalysen. Text, Formeln, Diagramme und Schachbretter werden in einem Dokument zusammengeführt, und die fertige Arbeit lässt sich dem Leser als Link oder Datei übergeben.",
    },
    "manual.introText2": {
      ru: "Главное в нём — доступность. Редактор рассчитан на автора, который работает с программой экранного доступа: всё делается с клавиатуры, формулы читаются на слух, график можно прослушать, а шахматная доска называет клетки голосом. Зрячему автору он тоже подходит: на выходе получается аккуратно свёрстанная страница.",
      en: "Accessibility is its main point. The editor is designed for an author who works with a screen reader: everything is done from the keyboard, formulas are read aloud, a graph can be listened to, and the chessboard names its squares by voice. It suits a sighted author as well: the result is a neatly typeset page.",
      tr: "En önemli özelliği erişilebilirliktir. Editör, ekran okuyucu programı kullanan bir yazar için tasarlanmıştır: her şey klavyeden yapılır, formüller sesli okunur, grafik dinlenebilir, satranç tahtası ise kareleri sesli olarak adlandırır. Gören bir yazar için de uygundur: sonuçta düzgün biçimlendirilmiş bir sayfa ortaya çıkar.",
      de: "Das Wichtigste daran ist die Barrierefreiheit. Der Editor ist für einen Autor ausgelegt, der mit einem Screenreader arbeitet: Alles geschieht über die Tastatur, Formeln werden vorgelesen, ein Diagramm lässt sich anhören, und das Schachbrett benennt die Felder per Sprachausgabe. Auch für einen sehenden Autor eignet er sich: Am Ende entsteht eine sauber gesetzte Seite.",
    },
    "manual.introText3": {
      ru: "Вторая задача — оформление. Написанное здесь превращается в аккуратно свёрстанную страницу: заголовки, списки, формулы, графики и шахматные доски выглядят так, как их принято видеть в публикации. Программа вёрстки для этого не нужна.",
      en: "Its second purpose is presentation. What you write here becomes a properly typeset page: headings, lists, formulas, graphs and chessboards look the way they are expected to look in a publication. No typesetting program is required.",
      tr: "İkinci amaç ise biçimdir. Burada yazılanlar düzgün biçimlendirilmiş bir sayfaya dönüşür: başlıklar, listeler, formüller, grafikler ve satranç tahtaları bir yayında görülmesi beklendiği gibi görünür. Bunun için ayrı bir dizgi programına gerek yoktur.",
      de: "Die zweite Aufgabe ist die Gestaltung. Was hier geschrieben wird, verwandelt sich in eine sauber gesetzte Seite: Überschriften, Listen, Formeln, Diagramme und Schachbretter sehen so aus, wie man es in einer Publikation erwartet. Ein Layoutprogramm ist dafür nicht nötig.",
    },
    "manual.introText4": {
      ru: "Устроен редактор просто: сверху панель кнопок для вставки формул, под ней поле редактора, ниже предпросмотр. Изменения видны сразу. Клавиша <strong>Alt+ё</strong> открывает предпросмотр и возвращает обратно в редактор. Устанавливать ничего не нужно — это обычная страница сайта.",
      en: "The editor itself is simple: a formula button panel at the top, the editor field below it, the preview under that. Changes are visible at once. <strong>Alt+`</strong> opens the preview and returns you to the editor. Nothing has to be installed — it is an ordinary web page.",
      tr: "Editörün yapısı basittir: üstte formül eklemek için düğme paneli, altında düzenleme alanı, onun altında da önizleme bulunur. Değişiklikler hemen görünür. <strong>Alt+`</strong> tuşu önizlemeyi açar ve tekrar editöre döndürür. Hiçbir şey kurmaya gerek yok — bu sıradan bir web sayfasıdır.",
      de: "Der Editor ist einfach aufgebaut: oben eine Schaltflächenleiste zum Einfügen von Formeln, darunter das Editorfeld, darunter die Vorschau. Änderungen sind sofort sichtbar. Die Taste <strong>Alt+`</strong> öffnet die Vorschau und bringt Sie zurück zum Editor. Es muss nichts installiert werden — das ist eine gewöhnliche Webseite.",
    },
    "manual.introText5": {
      ru: "Документ — обычный текстовый файл <code>.md</code> с разметкой markdown. Внутри него могут быть формулы, графики и шахматные доски. Файл можно скачать, открыть заново, править в любом текстовом редакторе и передать другому человеку. Кнопка «Сохранить готовый HTML» делает из него отдельную страницу для чтения: она открывается в любом браузере, а исходный код читателю не нужен. Кнопка «Справка» в редакторе — краткая справка, эта страница — полное руководство.",
      en: "A document is a plain text <code>.md</code> file with markdown markup. It can hold formulas, graphs and chessboards. You can download it, open it again, edit it in any text editor and hand it to someone else. The “Export HTML” button turns it into a standalone page for reading: it opens in any browser, and the reader needs no source code. The “Help” button in the editor is a short reference; this page is the complete manual.",
      tr: "Belge, markdown biçimlendirmesi içeren sıradan bir <code>.md</code> metin dosyasıdır. İçinde formüller, grafikler ve satranç tahtaları bulunabilir. Dosya indirilebilir, yeniden açılabilir, herhangi bir metin düzenleyicide değiştirilebilir ve başka birine gönderilebilir. «Hazır HTML'yi kaydet» düğmesi ondan okumaya yönelik ayrı bir sayfa oluşturur: bu sayfa herhangi bir tarayıcıda açılır ve okuyucunun kaynak koda ihtiyacı olmaz. Editördeki «Yardım» düğmesi kısa bir başvurudur; bu sayfa ise tam kılavuzdur.",
      de: "Ein Dokument ist eine gewöhnliche <code>.md</code>-Textdatei mit Markdown-Auszeichnung. Sie kann Formeln, Diagramme und Schachbretter enthalten. Die Datei lässt sich herunterladen, erneut öffnen, in jedem Texteditor bearbeiten und an eine andere Person weitergeben. Die Schaltfläche „Fertiges HTML speichern“ erzeugt daraus eine eigenständige Seite zum Lesen: Sie öffnet sich in jedem Browser, und der Leser braucht keinen Quellcode. Die Schaltfläche „Hilfe“ im Editor ist eine Kurzreferenz, diese Seite ist die vollständige Anleitung.",
    },

    // --- С чего начать ------------------------------------------------------
    "manual.startLead": {
      ru: "Шесть шагов, которые стоит пройти один раз, — дальше всё будет понятно само.",
      en: "Six steps worth taking once; after that everything falls into place by itself.",
      tr: "Bir kez uygulanması yeterli olan altı adım — sonrasında her şey kendiliğinden anlaşılır hale gelir.",
      de: "Sechs Schritte, die man einmal durchgeht — danach ergibt sich alles von selbst.",
    },
    "manual.startList": {
      ru: "<ol>" +
        "<li>Откройте сайт редактора.</li>" +
        "<li>Вы попадёте в поле редактора — это место, где набирается текст. Если курсор туда не встал, найдите редактор клавишами быстрой навигации: <strong>E</strong> и <strong>Shift+E</strong> в NVDA и JAWS, либо <strong>Tab</strong> и <strong>Shift+Tab</strong>.</li>" +
        "<li>Изучите пример, который уже написан в редакторе, и его разметку: заголовки, формулы, списки.</li>" +
        "<li>Нажмите <strong>Alt+ё</strong> — откроется предпросмотр, и вы услышите, как этот пример выглядит в готовом документе.</li>" +
        "<li>Нажмите <strong>Alt+ё</strong> ещё раз — вы вернётесь в редактор на ту же строку. Правьте пример по своему усмотрению и снова проверяйте предпросмотром.</li>" +
        "<li>Когда текст готов, сохраните его: <strong>Ctrl+S</strong> пишет в файл .md — тот самый, из которого вы открывали документ, — а если файла ещё нет, спросит, куда его положить. Кнопка <strong>Сохранить готовый HTML</strong> делает страницу для раздачи, кнопка <strong>Открыть .md</strong> возвращает сохранённый файл.</li>" +
        "</ol>",
      en: "<ol>" +
        "<li>Open the editor site.</li>" +
        "<li>You land in the editor field — the place where the text is written. If the cursor did not go there, find the editor with quick navigation keys: <strong>E</strong> and <strong>Shift+E</strong> in NVDA and JAWS, or <strong>Tab</strong> and <strong>Shift+Tab</strong>.</li>" +
        "<li>Study the example already written in the editor and its markup: headings, formulas, lists.</li>" +
        "<li>Press <strong>Alt+`</strong> — the preview opens, and you can hear how that example looks in a finished document.</li>" +
        "<li>Press <strong>Alt+`</strong> again — you return to the editor on the same line. Edit the example as you like and check it in the preview again.</li>" +
        "<li>When the text is ready, save it: <strong>Ctrl+S</strong> writes into the .md file — the very one you opened — and if there is no file yet it asks where to put it. The <strong>Export HTML</strong> button makes a page for sharing, and <strong>Open .md</strong> brings a saved file back.</li>" +
        "</ol>",
      tr: "<ol>" +
        "<li>Editör sitesini açın.</li>" +
        "<li>Editör alanına yönlendirilirsiniz — metnin yazıldığı yer burasıdır. İmleç oraya gelmediyse editörü hızlı gezinme tuşlarıyla bulun: NVDA ve JAWS'ta <strong>E</strong> ve <strong>Shift+E</strong>, ya da <strong>Tab</strong> ve <strong>Shift+Tab</strong>.</li>" +
        "<li>Editörde zaten yazılmış olan örneği ve biçimlendirmesini inceleyin: başlıklar, formüller, listeler.</li>" +
        "<li><strong>Alt+`</strong> tuşuna basın — önizleme açılır ve bu örneğin hazır belgede nasıl göründüğünü duyarsınız.</li>" +
        "<li><strong>Alt+`</strong> tuşuna tekrar basın — aynı satırda editöre geri dönersiniz. Örneği dilediğiniz gibi düzenleyin ve tekrar önizlemeden kontrol edin.</li>" +
        "<li>Metin hazır olduğunda kaydedin: <strong>Ctrl+S</strong> belgeyi açtığınız .md dosyasına yazar; dosya henüz yoksa nereye kaydedileceğini sorar. <strong>Hazır HTML'yi kaydet</strong> düğmesi paylaşım için bir sayfa oluşturur, <strong>.md aç</strong> düğmesi ise kaydedilmiş dosyayı geri getirir.</li>" +
        "</ol>",
      de: "<ol>" +
        "<li>Öffnen Sie die Editor-Website.</li>" +
        "<li>Sie landen im Editorfeld — dort wird der Text eingegeben. Ist der Cursor nicht dorthin gesprungen, finden Sie den Editor mit den Schnellnavigationstasten: <strong>E</strong> und <strong>Shift+E</strong> in NVDA und JAWS, oder <strong>Tab</strong> und <strong>Shift+Tab</strong>.</li>" +
        "<li>Sehen Sie sich das bereits im Editor stehende Beispiel und seine Auszeichnung an: Überschriften, Formeln, Listen.</li>" +
        "<li>Drücken Sie <strong>Alt+`</strong> — die Vorschau öffnet sich, und Sie hören, wie dieses Beispiel im fertigen Dokument aussieht.</li>" +
        "<li>Drücken Sie <strong>Alt+`</strong> erneut — Sie kehren in derselben Zeile zum Editor zurück. Bearbeiten Sie das Beispiel nach Belieben und prüfen Sie es wieder in der Vorschau.</li>" +
        "<li>Wenn der Text fertig ist, speichern Sie ihn: <strong>Strg+S</strong> schreibt in die .md-Datei, aus der Sie das Dokument geöffnet haben — gibt es noch keine Datei, wird gefragt, wohin sie gespeichert werden soll. Die Schaltfläche <strong>Fertiges HTML speichern</strong> erstellt eine Seite zum Weitergeben, <strong>.md öffnen</strong> holt eine gespeicherte Datei zurück.</li>" +
        "</ol>",
    },
    "manual.startKeys": {
      ru: "Кнопки файла работают и по горячим клавишам: <strong>Ctrl+S</strong> — сохранить .md, <strong>Ctrl+Alt+S</strong> — сохранить .md как новый файл, <strong>Ctrl+Shift+S</strong> — сохранить готовый HTML, <strong>Ctrl+O</strong> — открыть .md. Функциональные клавиши: <strong>F1</strong> — справка, <strong>Shift+F1</strong> — палитра команд, <strong>F2</strong> — переименовать документ, <strong>Shift+F2</strong> — удалить, <strong>F9</strong> — новый документ.",
      en: "The file buttons also have hotkeys: <strong>Ctrl+S</strong> — save the .md, <strong>Ctrl+Alt+S</strong> — save the .md as a new file, <strong>Ctrl+Shift+S</strong> — save the ready HTML, <strong>Ctrl+O</strong> — open a .md. Function keys: <strong>F1</strong> — help, <strong>Shift+F1</strong> — the command palette, <strong>F2</strong> — rename the document, <strong>Shift+F2</strong> — delete, <strong>F9</strong> — a new document.",
      tr: "Dosya düğmeleri kısayol tuşlarıyla da çalışır: <strong>Ctrl+S</strong> — .md kaydet, <strong>Ctrl+Alt+S</strong> — .md dosyasını yeni bir dosya olarak kaydet, <strong>Ctrl+Shift+S</strong> — hazır HTML'yi kaydet, <strong>Ctrl+O</strong> — .md aç. İşlev tuşları: <strong>F1</strong> — yardım, <strong>Shift+F1</strong> — komut paleti, <strong>F2</strong> — belgeyi yeniden adlandır, <strong>Shift+F2</strong> — sil, <strong>F9</strong> — yeni belge.",
      de: "Die Dateischaltflächen funktionieren auch über Tastenkombinationen: <strong>Strg+S</strong> — .md speichern, <strong>Strg+Alt+S</strong> — .md als neue Datei speichern, <strong>Strg+Umschalt+S</strong> — fertiges HTML speichern, <strong>Strg+O</strong> — .md öffnen. Funktionstasten: <strong>F1</strong> — Hilfe, <strong>Umschalt+F1</strong> — Befehlspalette, <strong>F2</strong> — Dokument umbenennen, <strong>Umschalt+F2</strong> — löschen, <strong>F9</strong> — neues Dokument.",
    },

    // --- markdown -----------------------------------------------------------
    "manual.markdownIntro": {
      ru: "Markdown — это разметка обычным текстом. Специальных программ не нужно, файл остаётся читаемым сам по себе, а разметка состоит из обычных символов: <code>#</code>, <code>*</code>, <code>-</code>, <code>&gt;</code>.",
      en: "Markdown is markup written in plain text. No special software is needed, the file stays readable on its own, and the markup consists of ordinary characters: <code>#</code>, <code>*</code>, <code>-</code>, <code>&gt;</code>.",
      tr: "Markdown, düz metinle yapılan bir biçimlendirmedir. Özel bir programa gerek yoktur, dosya kendi başına okunabilir kalır ve biçimlendirme sıradan karakterlerden oluşur: <code>#</code>, <code>*</code>, <code>-</code>, <code>&gt;</code>.",
      de: "Markdown ist eine Auszeichnung in reinem Text. Es ist keine spezielle Software nötig, die Datei bleibt für sich genommen lesbar, und die Auszeichnung besteht aus gewöhnlichen Zeichen: <code>#</code>, <code>*</code>, <code>-</code>, <code>&gt;</code>.",
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
      tr: "<ul>" +
        "<li><strong>Başlık.</strong> Bir başlık yazmak için satırın önüne <code>#</code> işareti konur. Bir işaret birinci düzey başlık, iki işaret ikinci düzey, beş işaret beşinci düzey anlamına gelir.</li>" +
        "<li><strong>Paragraf.</strong> Paragraflar boş bir satırla ayrılır. Boş satır yoksa sonraki satırlar aynı paragrafın devamı sayılır.</li>" +
        "<li><strong>Vurgu.</strong> <code>**kalın**</code> — kelimenin iki yanına ikişer <code>*</code> işareti, <code>*italik*</code> — tek işaret.</li>" +
        "<li><strong>Liste.</strong> Her madde bir tire ve boşlukla başlar. Numaralı liste ise bir sayı ve nokta ile başlar: <code>1.</code>, <code>2.</code>, <code>3.</code></li>" +
        "<li><strong>Bağlantı.</strong> Bağlantı oluşturmak için köşeli parantez içine bağlantı metnini, hemen ardından boşluksuz olarak yuvarlak parantez içine adresi veya diyez işaretiyle bir başlığı yazın: <code>[metin](adres)</code>, <code>[metin](#başlık)</code>.</li>" +
        "<li><strong>Alıntı.</strong> Satırın başına <code>&gt;</code> işareti konur. Üstü çizili metin ve görev listeleri de benzer şekilde yazılır.</li>" +
        "<li><strong>Kod.</strong> Kod yalnızca üçlü ters tırnak işaretiyle yazılır — tüm blok bunlarla çevrilir. Tek tırnak işareti AsciiMath için ayrılmıştır: <code>`x^2`</code> bir formüldür, kod değil. Önizlemede ve hazır sayfada her kod bloğunun altında <strong>Kodu kopyala</strong> düğmesi bulunur.</li>" +
        "</ul>",
      de: "<ul>" +
        "<li><strong>Überschrift.</strong> Um eine Überschrift zu schreiben, wird vor die Zeile das Zeichen <code>#</code> gesetzt. Ein Zeichen ergibt eine Überschrift erster Ebene, zwei die zweite, fünf die fünfte.</li>" +
        "<li><strong>Absatz.</strong> Absätze werden durch eine Leerzeile getrennt. Fehlt die Leerzeile, setzen die folgenden Zeilen denselben Absatz fort.</li>" +
        "<li><strong>Hervorhebung.</strong> <code>**fett**</code> — zwei <code>*</code>-Zeichen auf beiden Seiten des Wortes, <code>*kursiv*</code> — ein Zeichen.</li>" +
        "<li><strong>Liste.</strong> Jeder Punkt beginnt mit einem Bindestrich und einem Leerzeichen. Eine nummerierte Liste beginnt mit einer Zahl und einem Punkt: <code>1.</code>, <code>2.</code>, <code>3.</code></li>" +
        "<li><strong>Link.</strong> Um einen Link zu erstellen, schreiben Sie den Linktext in eckige Klammern und direkt danach, ohne Leerzeichen, in runden Klammern die Adresse oder einen Überschriftenverweis mit Raute: <code>[Text](Adresse)</code>, <code>[Text](#Überschrift)</code>.</li>" +
        "<li><strong>Zitat.</strong> Das Zeichen <code>&gt;</code> am Zeilenanfang. Auf dieselbe Weise werden durchgestrichener Text und Aufgabenlisten geschrieben.</li>" +
        "<li><strong>Code.</strong> Code wird ausschließlich mit drei rückwärtigen Anführungszeichen geschrieben — um den ganzen Block herum. Ein einzelnes solches Zeichen ist für AsciiMath reserviert: <code>`x^2`</code> ist eine Formel, kein Code. Unter jedem Codeblock gibt es in der Vorschau und auf der fertigen Seite eine Schaltfläche <strong>Code kopieren</strong>.</li>" +
        "</ul>",
    },
    "manual.markdownNote": {
      ru: "Внутри формул и блоков кода markdown не действует: там символы означают сами себя. В обычном тексте знак <code>*</code> может случайно начать курсив — в этом случае перед ним ставят обратный слэш. Одиночная обратная кавычка тоже не код, а формула AsciiMath: <code>`x^2`</code>.",
      en: "Inside formulas and code blocks markdown does not apply: there the characters mean themselves. In ordinary text the character <code>*</code> may accidentally start italics; in that case a backslash is placed before it. A single backtick is not code either, but an AsciiMath formula: <code>`x^2`</code>.",
      tr: "Formüllerin ve kod bloklarının içinde markdown geçerli değildir: orada karakterler kendilerini ifade eder. Sıradan metinde <code>*</code> işareti yanlışlıkla italiği başlatabilir — bu durumda önüne bir ters eğik çizgi konur. Tek bir ters tırnak da kod değil, bir AsciiMath formülüdür: <code>`x^2`</code>.",
      de: "Innerhalb von Formeln und Codeblöcken gilt Markdown nicht: Dort bedeuten die Zeichen sich selbst. Im gewöhnlichen Text kann das Zeichen <code>*</code> versehentlich Kursivschrift auslösen — in diesem Fall setzt man davor einen umgekehrten Schrägstrich. Ein einzelnes rückwärtiges Anführungszeichen ist ebenfalls kein Code, sondern eine AsciiMath-Formel: <code>`x^2`</code>.",
    },

    // --- Два языка формул ---------------------------------------------------
    "manual.formulasIntro": {
      ru: "Формулу можно записать двумя языками: <strong>AsciiMath</strong> и <strong>LaTeX</strong>. Оба превращаются в одну и ту же аккуратную вёрстку — выбирайте тот, что удобнее, и смешивайте их в одном документе сколько угодно.",
      en: "A formula can be written in two languages: <strong>AsciiMath</strong> and <strong>LaTeX</strong>. Both produce the same clean typeset result — pick whichever suits you and mix them freely in one document.",
      tr: "Bir formül iki dilde yazılabilir: <strong>AsciiMath</strong> ve <strong>LaTeX</strong>. İkisi de aynı düzgün biçime dönüşür — hangisi uygunsa onu seçin ve tek bir belgede istediğiniz kadar karıştırın.",
      de: "Eine Formel lässt sich in zwei Sprachen schreiben: <strong>AsciiMath</strong> und <strong>LaTeX</strong>. Beide führen zum selben sauberen Ergebnis — wählen Sie, was Ihnen liegt, und mischen Sie sie beliebig in einem Dokument.",
    },
    "manual.prosAscii": {
      ru: "<strong>Чем хорош AsciiMath.</strong> Он пишется почти как обычный текст: <code>sqrt(2)</code>, <code>x^2</code>, <code>(a)/(b)</code>. Нет обратных слэшей и фигурных скобок — набирать быстрее и труднее ошибиться. Экранному доступу такая формула читается короче и чище: меньше служебных символов на слух, а значит легче проверять себя.",
      en: "<strong>Why AsciiMath is good.</strong> It reads almost like plain text: <code>sqrt(2)</code>, <code>x^2</code>, <code>(a)/(b)</code>. No backslashes or curly braces — faster to type and harder to get wrong. A screen reader also speaks it more briefly: fewer service symbols to listen through, which makes proofreading easier.",
      tr: "<strong>AsciiMath'in artıları.</strong> Neredeyse sıradan metin gibi yazılır: <code>sqrt(2)</code>, <code>x^2</code>, <code>(a)/(b)</code>. Ters eğik çizgi veya süslü parantez yoktur — yazması daha hızlı, hata yapması daha zordur. Ekran okuyucu bu formülü daha kısa ve sade okur: kulakla takip edilecek daha az yardımcı sembol vardır, bu da kendini kontrol etmeyi kolaylaştırır.",
      de: "<strong>Warum AsciiMath gut ist.</strong> Es liest sich fast wie gewöhnlicher Text: <code>sqrt(2)</code>, <code>x^2</code>, <code>(a)/(b)</code>. Keine Backslashes oder geschweiften Klammern — schneller zu tippen und schwerer falsch zu machen. Ein Screenreader spricht es auch kürzer aus: weniger Hilfszeichen zum Anhören, was das Gegenlesen erleichtert.",
    },
    "manual.prosLatex": {
      ru: "<strong>Чем хорош LaTeX.</strong> Он полнее и точнее: сложная вёрстка, многострочные формулы, выравнивание по знаку равенства, матрицы в скобках любого вида. Это тот же язык, что в научных статьях и на Overleaf, поэтому формулу можно перенести оттуда сюда и обратно без переделки.",
      en: "<strong>Why LaTeX is good.</strong> It is fuller and more precise: complex layout, multi-line formulas, alignment on the equals sign, matrices in any kind of bracket. It is the same language used in papers and on Overleaf, so a formula can be moved in and out without rewriting.",
      tr: "<strong>LaTeX'in artıları.</strong> Daha kapsamlı ve daha kesindir: karmaşık dizgi, çok satırlı formüller, eşittir işaretine göre hizalama, her türlü parantezle matrisler. Bilimsel makalelerde ve Overleaf'te kullanılan dilin aynısıdır, bu yüzden bir formül oradan buraya ve geri, yeniden yazmadan taşınabilir.",
      de: "<strong>Warum LaTeX gut ist.</strong> Es ist umfassender und präziser: komplexes Layout, mehrzeilige Formeln, Ausrichtung am Gleichheitszeichen, Matrizen in jeder Art von Klammer. Es ist dieselbe Sprache wie in wissenschaftlichen Artikeln und auf Overleaf, sodass eine Formel ohne Umschreiben hin- und herbewegt werden kann.",
    },
    "manual.formulasRule": {
      ru: "Простое правило: для учёбы, конспекта и быстрых записей используйте AsciiMath, для публикации и сложной вёрстки — LaTeX.",
      en: "A simple rule: for notes, study and quick writing use AsciiMath; for publication and complex layout use LaTeX.",
      tr: "Basit bir kural: ders çalışma, not tutma ve hızlı yazım için AsciiMath, yayın ve karmaşık dizgi için LaTeX kullanın.",
      de: "Eine einfache Regel: Für Notizen, zum Lernen und für schnelles Schreiben AsciiMath, für Veröffentlichungen und komplexes Layout LaTeX.",
    },

    // --- AsciiMath ----------------------------------------------------------
    "manual.asciiIntro": {
      ru: "Формула в строке записывается в обратных кавычках: <code>`sqrt(2)`</code>. Всё, что внутри, AsciiMath понимает как математику.",
      en: "An inline formula is written between backticks: <code>`sqrt(2)`</code>. Everything inside is read as mathematics by AsciiMath.",
      tr: "Satır içi bir formül ters tırnaklar arasına yazılır: <code>`sqrt(2)`</code>. İçindeki her şey AsciiMath tarafından matematik olarak okunur.",
      de: "Eine Inline-Formel wird zwischen rückwärtigen Anführungszeichen geschrieben: <code>`sqrt(2)`</code>. Alles darin wird von AsciiMath als Mathematik gelesen.",
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
      tr: "<ul>" +
        "<li><strong>Kesir</strong> parantezlerle yazılır: <code>`(a+b)/(c+d)`</code>. Parantezler payda ve paydada ne olduğunu belirtir.</li>" +
        "<li><strong>Üs</strong> <code>^</code> işaretiyle: <code>`x^2`</code>, uzun bir üs için <code>`x^(n+1)`</code>.</li>" +
        "<li><strong>Kök</strong> — <code>`sqrt(x)`</code>; küp kök — <code>`root(3)(x)`</code>.</li>" +
        "<li><strong>Toplam, integral, limit</strong> — <code>`sum_(i=1)^n`</code>, <code>`int_(0)^(1) x dx`</code>, <code>`lim_(x-&gt;0)`</code>. Alt ve üst sınırlar parantez içine yazılır.</li>" +
        "<li><strong>Matris</strong> — çift köşeli parantez: <code>`[[a,b],[c,d]]`</code>. Satırlar dış parantezlerin içinde virgülle ayrılır.</li>" +
        "<li><strong>Yunan harfleri</strong> — isimleriyle: <code>alpha</code>, <code>beta</code>, <code>pi</code>, <code>theta</code>, <code>omega</code>, büyük sigma — <code>Sigma</code>.</li>" +
        "<li><strong>İşaretler</strong> — sıradan karakterlerle: <code>&gt;=</code>, <code>&lt;=</code>, <code>!=</code>, <code>~=</code>, sonsuz <code>oo</code>, ok <code>-&gt;</code>, aittir <code>in</code>.</li>" +
        "<li><strong>Boşluk</strong> formülün parçalarını ayırır: <code>`int x dx`</code> — integral işareti kendisinden sonrakine yapışmaz.</li>" +
        "</ul>",
      de: "<ul>" +
        "<li><strong>Ein Bruch</strong> mit Klammern: <code>`(a+b)/(c+d)`</code>. Die Klammern zeigen, was oben und was unten steht.</li>" +
        "<li><strong>Eine Potenz</strong> mit einem Dach: <code>`x^2`</code>, bei einem längeren Exponenten <code>`x^(n+1)`</code>.</li>" +
        "<li><strong>Eine Wurzel</strong> — <code>`sqrt(x)`</code>; eine Kubikwurzel — <code>`root(3)(x)`</code>.</li>" +
        "<li><strong>Summe, Integral, Grenzwert</strong> — <code>`sum_(i=1)^n`</code>, <code>`int_(0)^(1) x dx`</code>, <code>`lim_(x-&gt;0)`</code>. Unter- und Obergrenze stehen in Klammern.</li>" +
        "<li><strong>Eine Matrix</strong> — doppelte eckige Klammern: <code>`[[a,b],[c,d]]`</code>. Zeilen werden durch Kommas innerhalb der äußeren Klammern getrennt.</li>" +
        "<li><strong>Griechische Buchstaben</strong> — beim Namen: <code>alpha</code>, <code>beta</code>, <code>pi</code>, <code>theta</code>, <code>omega</code>, das große Sigma ist <code>Sigma</code>.</li>" +
        "<li><strong>Zeichen</strong> — als gewöhnliche Zeichen: <code>&gt;=</code>, <code>&lt;=</code>, <code>!=</code>, <code>~=</code>, Unendlich <code>oo</code>, Pfeil <code>-&gt;</code>, Element von <code>in</code>.</li>" +
        "<li><strong>Ein Leerzeichen</strong> trennt Teile einer Formel: <code>`int x dx`</code> verhindert, dass das Integral am Folgenden klebt.</li>" +
        "</ul>",
    },
    "manual.asciiButtons": {
      ru: "Кнопки панели умеют вставлять формулы и в записи AsciiMath. Чтобы переключить язык формул, нажмите <strong>Alt+L</strong>: после этого кнопки вставляют AsciiMath вместо LaTeX.",
      en: "The panel buttons can insert formulas in AsciiMath notation as well. To switch the formula language, press <strong>Alt+L</strong>: from then on the buttons insert AsciiMath instead of LaTeX.",
      tr: "Panel düğmeleri formülleri AsciiMath gösteriminde de ekleyebilir. Formül dilini değiştirmek için <strong>Alt+L</strong> tuşuna basın: bundan sonra düğmeler LaTeX yerine AsciiMath ekler.",
      de: "Die Schaltflächen der Leiste können Formeln auch in AsciiMath-Notation einfügen. Um die Formelsprache umzuschalten, drücken Sie <strong>Alt+L</strong>: Danach fügen die Schaltflächen AsciiMath statt LaTeX ein.",
    },

    // --- LaTeX --------------------------------------------------------------
    "manual.latexSkip": {
      ru: "Если LaTeX вам не нужен, пропустите этот раздел и переходите к следующему.",
      en: "If you do not need LaTeX, skip this section and go on to the next one.",
      tr: "LaTeX'e ihtiyacınız yoksa bu bölümü atlayıp sonrakine geçebilirsiniz.",
      de: "Wenn Sie LaTeX nicht benötigen, überspringen Sie diesen Abschnitt und gehen Sie zum nächsten über.",
    },
    "manual.latexIntro": {
      ru: "Формула в строке пишется в долларах: <code>$x^2$</code>. Формула на отдельной строке, по центру — в двойных долларах: <code>$$…$$</code>. То же самое можно записать скобками <code>\\(…\\)</code> и <code>\\[…\\]</code>.",
      en: "An inline formula goes between dollar signs: <code>$x^2$</code>. A formula on its own centred line goes between double dollars: <code>$$…$$</code>. The same works with <code>\\(…\\)</code> and <code>\\[…\\]</code>.",
      tr: "Satır içi formül dolar işaretleri arasına yazılır: <code>$x^2$</code>. Ayrı, ortalanmış bir satırdaki formül ise çift dolar arasına: <code>$$…$$</code>. Aynısı <code>\\(…\\)</code> ve <code>\\[…\\]</code> ile de yazılabilir.",
      de: "Eine Inline-Formel steht zwischen Dollarzeichen: <code>$x^2$</code>. Eine Formel in einer eigenen, zentrierten Zeile steht zwischen doppelten Dollarzeichen: <code>$$…$$</code>. Dasselbe funktioniert mit <code>\\(…\\)</code> und <code>\\[…\\]</code>.",
    },
    "manual.latexList": {
      ru: "<ul>" +
        "<li><strong>Дробь</strong> — <code>\\frac{a}{b}</code>: первая скобка числитель, вторая знаменатель.</li>" +
        "<li><strong>Степень</strong> — <code>x^{2}</code>. Показатель длиннее одного символа всегда берётся в фигурные скобки.</li>" +
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
      tr: "<ul>" +
        "<li><strong>Kesir</strong> — <code>\\frac{a}{b}</code>: ilk parantez pay, ikincisi paydadır.</li>" +
        "<li><strong>Üs</strong> — <code>x^{2}</code>. Bir karakterden uzun üs her zaman süslü parantez içine alınır.</li>" +
        "<li><strong>Kök</strong> — <code>\\sqrt{x}</code>, küp kök — <code>\\sqrt[3]{x}</code>.</li>" +
        "<li><strong>Toplam, integral, limit</strong> — <code>\\sum_{i=1}^{n}</code>, <code>\\int_{a}^{b}</code>, <code>\\lim_{x \\to 0}</code>.</li>" +
        "<li><strong>Matris</strong> — <code>\\begin{pmatrix} a &amp; b \\\\ c &amp; d \\end{pmatrix}</code>. Ampersand sütunları, çift ters eğik çizgi satırları ayırır.</li>" +
        "<li><strong>Yunan harfleri</strong> — ters eğik çizgiyle: <code>\\alpha</code>, <code>\\beta</code>, <code>\\pi</code>, <code>\\theta</code>, <code>\\omega</code>, <code>\\Sigma</code>.</li>" +
        "<li><strong>İşaretler</strong> — <code>\\ge</code>, <code>\\le</code>, <code>\\ne</code>, <code>\\approx</code>, <code>\\infty</code>, <code>\\in</code>, <code>\\subseteq</code>, <code>\\cup</code>, <code>\\cap</code>, <code>\\to</code>, <code>\\nabla</code>.</li>" +
        "</ul>",
      de: "<ul>" +
        "<li><strong>Ein Bruch</strong> — <code>\\frac{a}{b}</code>: die erste Klammer ist der Zähler, die zweite der Nenner.</li>" +
        "<li><strong>Eine Potenz</strong> — <code>x^{2}</code>. Ein Exponent, der länger als ein Zeichen ist, kommt immer in geschweifte Klammern.</li>" +
        "<li><strong>Eine Wurzel</strong> — <code>\\sqrt{x}</code>, eine Kubikwurzel — <code>\\sqrt[3]{x}</code>.</li>" +
        "<li><strong>Summe, Integral, Grenzwert</strong> — <code>\\sum_{i=1}^{n}</code>, <code>\\int_{a}^{b}</code>, <code>\\lim_{x \\to 0}</code>.</li>" +
        "<li><strong>Eine Matrix</strong> — <code>\\begin{pmatrix} a &amp; b \\\\ c &amp; d \\end{pmatrix}</code>. Ein Et-Zeichen trennt Spalten, ein doppelter Backslash trennt Zeilen.</li>" +
        "<li><strong>Griechische Buchstaben</strong> — mit Backslash: <code>\\alpha</code>, <code>\\beta</code>, <code>\\pi</code>, <code>\\theta</code>, <code>\\omega</code>, <code>\\Sigma</code>.</li>" +
        "<li><strong>Zeichen</strong> — <code>\\ge</code>, <code>\\le</code>, <code>\\ne</code>, <code>\\approx</code>, <code>\\infty</code>, <code>\\in</code>, <code>\\subseteq</code>, <code>\\cup</code>, <code>\\cap</code>, <code>\\to</code>, <code>\\nabla</code>.</li>" +
        "</ul>",
    },
    "manual.latexTips": {
      ru: "Две частые ошибки: забытый закрывающий доллар (тогда формула продолжается до конца документа) и степень без фигурных скобок — <code>x^10</code> даст икс в первой степени и ноль рядом, правильно <code>x^{10}</code>. Подсказки сами появляются внутри формулы: начните печатать <code>\\fr</code> и появится <code>\\frac</code>. Кнопка формулы на панели всегда вставляет доллары, то есть LaTeX.",
      en: "Two common mistakes: a forgotten closing dollar (the formula then runs to the end of the document), and a power without braces — <code>x^10</code> gives x to the first power with a zero after it; write <code>x^{10}</code>. Suggestions appear by themselves inside a formula: start typing <code>\\fr</code> and you will see <code>\\frac</code>. The formula button on the panel always inserts dollars, that is LaTeX.",
      tr: "İki sık hata: unutulan kapanış doları (bu durumda formül belgenin sonuna kadar devam eder) ve süslü parantezsiz üs — <code>x^10</code>, x'in birinci kuvvetini ve yanında bir sıfırı verir; doğrusu <code>x^{10}</code>'dur. Öneriler formülün içinde kendiliğinden belirir: <code>\\fr</code> yazmaya başlayın, <code>\\frac</code> önerisini göreceksiniz. Paneldeki formül düğmesi her zaman dolar, yani LaTeX ekler.",
      de: "Zwei häufige Fehler: ein vergessenes schließendes Dollarzeichen (dann läuft die Formel bis zum Ende des Dokuments) und eine Potenz ohne Klammern — <code>x^10</code> ergibt x hoch eins mit einer Null daneben; richtig ist <code>x^{10}</code>. Vorschläge erscheinen von selbst innerhalb einer Formel: Tippen Sie <code>\\fr</code>, und <code>\\frac</code> wird vorgeschlagen. Die Formel-Schaltfläche in der Leiste fügt immer Dollarzeichen ein, also LaTeX.",
    },

    // --- Desmos -------------------------------------------------------------
    "manual.desmosIntro": {
      ru: "График рисуется блоком <code>```desmos</code>. Каждая строка внутри — отдельное выражение, ровно как в калькуляторе Desmos: можно задать функцию, точку, неравенство или окружность.",
      en: "A graph is drawn with a <code>```desmos</code> block. Each line inside is a separate expression, exactly as in the Desmos calculator: a function, a point, an inequality or a circle.",
      tr: "Bir grafik <code>```desmos</code> bloğuyla çizilir. İçindeki her satır ayrı bir ifadedir, tıpkı Desmos hesap makinesinde olduğu gibi: bir fonksiyon, bir nokta, bir eşitsizlik veya bir çember tanımlanabilir.",
      de: "Ein Diagramm wird mit einem <code>```desmos</code>-Block gezeichnet. Jede Zeile darin ist ein eigener Ausdruck, genau wie im Desmos-Rechner: eine Funktion, ein Punkt, eine Ungleichung oder ein Kreis.",
    },
    "manual.desmosAttrs": {
      ru: "Блок не требует атрибутов: всё, что нужно, — выражения. В предпросмотре график живой, его можно тянуть мышью. В готовую страницу Desmos подключается сам, как только в документе есть хотя бы один такой блок.",
      en: "The block needs no attributes: the expressions are all it takes. In the preview the graph is live and can be dragged with the mouse. In the exported page Desmos is loaded by itself as soon as the document contains at least one such block.",
      tr: "Blok herhangi bir özniteliğe ihtiyaç duymaz: gereken tek şey ifadelerdir. Önizlemede grafik canlıdır ve fareyle sürüklenebilir. Hazır sayfada, belgede en az bir bu tür blok olduğunda Desmos kendiliğinden yüklenir.",
      de: "Der Block braucht keine Attribute: Die Ausdrücke reichen aus. In der Vorschau ist das Diagramm lebendig und kann mit der Maus gezogen werden. Auf der exportierten Seite lädt sich Desmos von selbst, sobald das Dokument mindestens einen solchen Block enthält.",
    },
    "manual.desmosKeys": {
      ru: "Перед каждым графиком стоит невидимая кнопка входа. Читайте страницу стрелкой вниз — вы услышите «<strong>График Desmos — перейти к списку выражений, кнопка</strong>». Нажмите на ней <strong>пробел</strong> или <strong>Enter</strong>, и вы сразу окажетесь в списке выражений: там перечислены строки графика. Из списка нажмите <strong>Alt+T</strong> — откроется плоскость координат, доступная программе экранного доступа. На ней стрелки влево и вправо ведут по оси X, высота тона сообщает значение Y, а клавиша <strong>H</strong> проводит по всему графику слева направо звуком. Запасной путь, если кнопки почему-то нет: стрелкой вниз дойдите до надписи <strong>Desmos Graphing Calculator</strong>, нажмите на ней пробел и жмите <strong>Tab</strong>, пока не попадёте в список выражений.",
      en: "Before every graph there is an invisible entrance button. Read the page with the down arrow and you hear “<strong>Desmos graph — go to the expression list, button</strong>”. Press <strong>space</strong> or <strong>Enter</strong> on it and you are straight in the list of expressions: it lists the lines of the graph. From the list press <strong>Alt+T</strong> — a coordinate plane opens, accessible to a screen reader. On it the left and right arrows move along the X axis, the pitch of the tone reports the value of Y, and the <strong>H</strong> key sweeps the whole graph from left to right in sound. A reserve way in, if the button is missing for some reason: with the down arrow reach the words <strong>Desmos Graphing Calculator</strong>, press space on them and press <strong>Tab</strong> until you reach the list of expressions.",
      tr: "Her grafikten önce görünmez bir giriş düğmesi bulunur. Sayfayı aşağı ok tuşuyla okuduğunuzda «<strong>Desmos grafiği — ifade listesine git, düğme</strong>» duyulur. Bu düğmede <strong>boşluk</strong> veya <strong>Enter</strong> tuşuna basın; doğrudan ifade listesine geçersiniz: burada grafiğin satırları sıralanır. Listeden <strong>Alt+T</strong> tuşuna basın — ekran okuyucuya erişilebilir bir koordinat düzlemi açılır. Bu düzlemde sol ve sağ oklar X ekseninde ilerler, tonun perdesi Y değerini bildirir, <strong>H</strong> tuşu ise tüm grafiği soldan sağa sesle tarar. Düğme herhangi bir nedenle yoksa yedek yol: aşağı ok tuşuyla <strong>Desmos Graphing Calculator</strong> yazısına ulaşın, üzerinde boşluk tuşuna basın ve ifade listesine ulaşana kadar <strong>Tab</strong> tuşuna basın.",
      de: "Vor jedem Diagramm steht eine unsichtbare Einstiegsschaltfläche. Lesen Sie die Seite mit der Pfeiltaste nach unten, hören Sie „<strong>Desmos-Diagramm — zur Ausdrucksliste, Schaltfläche</strong>“. Drücken Sie darauf <strong>Leertaste</strong> oder <strong>Enter</strong>, und Sie gelangen direkt in die Ausdrucksliste: Dort sind die Zeilen des Diagramms aufgeführt. Drücken Sie aus der Liste <strong>Alt+T</strong> — eine für den Screenreader zugängliche Koordinatenebene öffnet sich. Darauf bewegen die Pfeiltasten links und rechts entlang der X-Achse, die Tonhöhe gibt den Y-Wert an, und die Taste <strong>H</strong> fährt das ganze Diagramm von links nach rechts akustisch ab. Ein Ausweichweg, falls die Schaltfläche aus irgendeinem Grund fehlt: Erreichen Sie mit der Pfeiltaste nach unten den Text <strong>Desmos Graphing Calculator</strong>, drücken Sie darauf die Leertaste und drücken Sie <strong>Tab</strong>, bis Sie die Ausdrucksliste erreichen.",
    },
    "manual.desmosBack": {
      ru: "Вернуться из графика проще всего клавишей <strong>Escape</strong>: фокус возвращается на невидимую кнопку входа, и страница снова читается стрелками. Запасные пути, если Escape не сработал: <strong>Shift+Tab</strong> ведёт назад по элементам калькулятора, пока вы не выйдете из его панели; <strong>NVDA+Ctrl+Space</strong> переключает в режим чтения и сразу выводит из области калькулятора.",
      en: "The easiest way back from a graph is <strong>Escape</strong>: the focus returns to the invisible entrance button and the page can be read with the arrows again. Reserve ways, if Escape does not work: <strong>Shift+Tab</strong> walks back through the calculator's elements until you leave its panel; <strong>NVDA+Ctrl+Space</strong> switches to browse mode and takes you straight out of the calculator's area.",
      tr: "Grafikten geri dönmenin en kolay yolu <strong>Escape</strong> tuşudur: odak görünmez giriş düğmesine geri döner ve sayfa yeniden oklarla okunabilir. Escape işe yaramazsa yedek yollar: <strong>Shift+Tab</strong>, hesap makinesinin panelinden çıkana kadar öğeleri geriye doğru gezdirir; <strong>NVDA+Ctrl+Space</strong> gezinme moduna geçirir ve doğrudan hesap makinesi alanından çıkarır.",
      de: "Der einfachste Weg zurück aus einem Diagramm ist <strong>Escape</strong>: Der Fokus kehrt zur unsichtbaren Einstiegsschaltfläche zurück, und die Seite lässt sich wieder mit den Pfeiltasten lesen. Ausweichwege, falls Escape nicht funktioniert: <strong>Umschalt+Tab</strong> geht rückwärts durch die Elemente des Rechners, bis Sie sein Panel verlassen; <strong>NVDA+Strg+Leertaste</strong> schaltet in den Lesemodus und führt sofort aus dem Bereich des Rechners heraus.",
    },
    "manual.desmosRefresh": {
      ru: "Если график не появился или перестал отвечать, нажмите <strong>Alt+ё</strong> — полный предпросмотр пересоздаёт графики заново.",
      en: "If a graph does not appear or freezes, press <strong>Alt+`</strong> — the full preview rebuilds the graphs from scratch.",
      tr: "Grafik görünmüyorsa veya yanıt vermiyorsa <strong>Alt+`</strong> tuşuna basın — tam önizleme grafikleri baştan yeniden oluşturur.",
      de: "Erscheint ein Diagramm nicht oder reagiert es nicht mehr, drücken Sie <strong>Alt+`</strong> — die vollständige Vorschau baut die Diagramme neu auf.",
    },

    // --- Шахматы ------------------------------------------------------------
    "manual.chessIntro": {
      ru: "Доска ставится блоком <code>```chess</code>. Позицию можно задать расстановкой (<code>fen</code>), а можно целой партией из PGN-файла (<code>pgn</code>) с переходом на нужный ход (<code>move</code>).",
      en: "A board is placed with a <code>```chess</code> block. The position can be given as a layout (<code>fen</code>) or as a whole game from a PGN file (<code>pgn</code>) with a jump to a given move (<code>move</code>).",
      tr: "Bir tahta <code>```chess</code> bloğuyla yerleştirilir. Konum bir dizilim (<code>fen</code>) olarak veya belirli bir hamleye atlamayla (<code>move</code>) birlikte bir PGN dosyasından tüm bir parti (<code>pgn</code>) olarak verilebilir.",
      de: "Ein Brett wird mit einem <code>```chess</code>-Block platziert. Die Stellung lässt sich als Aufstellung (<code>fen</code>) angeben oder als ganze Partie aus einer PGN-Datei (<code>pgn</code>) mit einem Sprung zu einem bestimmten Zug (<code>move</code>).",
    },
    "manual.chessAttrs": {
      ru: "<ul>" +
        "<li><code>fen=\"…\"</code> — позиция. Расстановка вроде <code>rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1</code> — начальная. Кавычки нужны не для красоты: без них значение обрывается на первом пробеле, и доска не построится.</li>" +
        "<li><code>pgn=\"адрес\"</code> — партия из файла, <code>move=\"10\"</code> — сразу перейти к десятому ходу.</li>" +
        "<li><code>id=\"имя\"</code> — имя доски. По нему из текста делается кнопка перехода к ходу: <code>&lt;button chess=\"имя\" move=\"29\"&gt;</code>. Кнопка работает и в предпросмотре, и в готовой странице.</li>" +
        "<li><code>lang=\"ru\"</code> — язык доски: ru, en, de, tr.</li>" +
        "<li><code>controls=\"off\"</code> — убрать кнопки под доской, <code>sound=\"off\"</code> — без звуков, <code>tone=\"off\"</code> — без тональных отметок в разборе.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><code>fen=\"…\"</code> — a position. <code>rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1</code> is the starting one. The quotes are not decoration: without them the value stops at the first space and the board will not build.</li>" +
        "<li><code>pgn=\"address\"</code> — a game from a file, <code>move=\"10\"</code> — jump straight to move ten.</li>" +
        "<li><code>id=\"name\"</code> — the board's name. Text can then link a button to it: <code>&lt;button chess=\"name\" move=\"29\"&gt;</code>. The button works both in the preview and in the exported page.</li>" +
        "<li><code>lang=\"ru\"</code> — the board language: ru, en, de, tr.</li>" +
        "<li><code>controls=\"off\"</code> — hide the buttons under the board, <code>sound=\"off\"</code> — no sounds, <code>tone=\"off\"</code> — no pitch marks during analysis.</li>" +
        "</ul>",
      tr: "<ul>" +
        "<li><code>fen=\"…\"</code> — konum. <code>rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1</code> başlangıç dizilimidir. Tırnak işaretleri süs değildir: onlar olmadan değer ilk boşlukta kesilir ve tahta oluşturulamaz.</li>" +
        "<li><code>pgn=\"adres\"</code> — dosyadan bir parti, <code>move=\"10\"</code> — doğrudan onuncu hamleye geçer.</li>" +
        "<li><code>id=\"ad\"</code> — tahtanın adı. Bu ada göre metinden hamleye geçen bir düğme yapılabilir: <code>&lt;button chess=\"ad\" move=\"29\"&gt;</code>. Düğme hem önizlemede hem hazır sayfada çalışır.</li>" +
        "<li><code>lang=\"tr\"</code> — tahtanın dili: ru, en, de, tr.</li>" +
        "<li><code>controls=\"off\"</code> — tahtanın altındaki düğmeleri kaldırır, <code>sound=\"off\"</code> — sessiz, <code>tone=\"off\"</code> — analizde tonal işaretler olmadan.</li>" +
        "</ul>",
      de: "<ul>" +
        "<li><code>fen=\"…\"</code> — eine Stellung. <code>rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1</code> ist die Ausgangsstellung. Die Anführungszeichen sind keine Dekoration: Ohne sie bricht der Wert am ersten Leerzeichen ab, und das Brett wird nicht aufgebaut.</li>" +
        "<li><code>pgn=\"Adresse\"</code> — eine Partie aus einer Datei, <code>move=\"10\"</code> — springt direkt zum zehnten Zug.</li>" +
        "<li><code>id=\"Name\"</code> — der Name des Bretts. Damit lässt sich aus Text eine Schaltfläche zum Zug erstellen: <code>&lt;button chess=\"Name\" move=\"29\"&gt;</code>. Die Schaltfläche funktioniert sowohl in der Vorschau als auch auf der exportierten Seite.</li>" +
        "<li><code>lang=\"de\"</code> — die Sprache des Bretts: ru, en, de, tr.</li>" +
        "<li><code>controls=\"off\"</code> — blendet die Schaltflächen unter dem Brett aus, <code>sound=\"off\"</code> — ohne Töne, <code>tone=\"off\"</code> — ohne Tonhöhenmarkierungen bei der Analyse.</li>" +
        "</ul>",
    },
    "manual.chessKeys": {
      ru: "<p>Доска — не обычная таблица, а отдельный объект со своим набором клавиш, помеченный как панель инструментов. Начиная с версии chessjax 0.6.5 режим форм (редактирования) включается сам, как только фокус попадает на клетку доски: переключать его вручную в NVDA не нужно, а старая команда принудительного переключения, наоборот, вернёт в режим чтения и отнимет у доски стрелки. Запасной путь остаётся только для JAWS: если стрелки не заработали, включите в нём режим форм вручную.</p>" +
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
      en: "<p>The board is not an ordinary table but an object of its own with its own keys, marked as a toolbar. From chessjax version 0.6.5 onward, focus (forms) mode switches on by itself as soon as focus lands on a square of the board: there is no need to switch it by hand in NVDA, and the old command that forced the switch would instead switch back to browse mode and take the arrows away from the board. A reserve way remains only for JAWS: if the arrows do not work, switch on forms mode there by hand.</p>" +
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
      tr: "<p>Tahta sıradan bir tablo değil, kendi tuş kümesine sahip ve araç çubuğu olarak işaretlenmiş ayrı bir nesnedir. chessjax 0.6.5 sürümünden itibaren odak (form) modu, odak tahtanın bir karesine geldiği anda kendiliğinden açılır: NVDA'da elle değiştirmeye gerek yoktur, zorla geçiş yapan eski komut ise tam tersine gezinme moduna döndürür ve tahtadan ok tuşlarını alır. Yedek yol yalnızca JAWS için kalır: ok tuşları çalışmazsa orada form modunu elle açın.</p>" +
        "<p>En kolayı elle hiçbir şey değiştirmemektir: belgede ok tuşlarıyla gezinirken tahtadan önce «Satranç tahtası, bölge. Tahtayla etkileşim için Enter'a basın» duyulur. <strong>Enter</strong> tuşuna basın (tahtaya tıklamak da işe yarar) — gerekli mod kendiliğinden açılır ve odak bir kareye yerleşir. Bundan sonra ok tuşları kareleri adlandırır: «siyah piyon b7», boş kare ise «e5».</p>" +
        "<ul>" +
        "<li><strong>Ok tuşları</strong> — karelere geçmek ve üzerinde ne olduğunu duymak.</li>" +
        "<li><strong>Ctrl+←</strong> ve <strong>Ctrl+→</strong> — partide geri ve ileri.</li>" +
        "<li><strong>Space</strong> — devam ettir veya duraklat.</li>" +
        "<li><strong>Ctrl+Space</strong> — baştan otomatik oynatma.</li>" +
        "<li><strong>Ctrl+↑</strong> ve <strong>Ctrl+↓</strong> — daha hızlı ve daha yavaş.</li>" +
        "<li><strong>V</strong> — yorumdaki bir varyanta girmek, <strong>Esc</strong> — varyanttan çıkmak.</li>" +
        "<li><strong>F</strong> — tam ekran.</li>" +
        "<li><strong>B</strong> — Stockfish'e göre en iyi hamle.</li>" +
        "<li><strong>A</strong> — tüm partinin analizi; <strong>A</strong> tuşunu iki saniye basılı tutmak esprili değerlendirmeler verir.</li>" +
        "<li><strong>H</strong> — bölüm bölüm yardım.</li>" +
        "</ul>",
      de: "<p>Das Brett ist keine gewöhnliche Tabelle, sondern ein eigenständiges Objekt mit eigenen Tasten, das als Symbolleiste ausgezeichnet ist. Ab chessjax Version 0.6.5 schaltet sich der Fokus-(Formular-)Modus von selbst ein, sobald der Fokus auf ein Feld des Bretts fällt: Ein manuelles Umschalten in NVDA ist nicht nötig, und der alte Befehl zum erzwungenen Umschalten würde stattdessen in den Lesemodus zurückschalten und dem Brett die Pfeiltasten nehmen. Ein Ausweichweg bleibt nur für JAWS: Funktionieren die Pfeiltasten nicht, schalten Sie dort den Formularmodus von Hand ein.</p>" +
        "<p>Am einfachsten ist es, nichts von Hand umzuschalten: Beim Durchblättern des Dokuments mit den Pfeiltasten hören Sie vor dem Brett „Schachbrett, Region. Enter drücken, um mit dem Brett zu interagieren.“ Drücken Sie <strong>Enter</strong> (ein Klick auf das Brett funktioniert auch) — der richtige Modus schaltet sich von selbst ein, und der Fokus landet auf einem Feld. Von dort an benennen die Pfeiltasten die Felder: „schwarzer Bauer b7“, ein leeres Feld ist „e5“.</p>" +
        "<ul>" +
        "<li><strong>Pfeiltasten</strong> — zu einem Feld gehen und hören, was darauf steht.</li>" +
        "<li><strong>Strg+←</strong> und <strong>Strg+→</strong> — zurück und vor in der Partie.</li>" +
        "<li><strong>Leertaste</strong> — fortsetzen oder pausieren.</li>" +
        "<li><strong>Strg+Leertaste</strong> — automatisches Abspielen von Anfang an.</li>" +
        "<li><strong>Strg+↑</strong> und <strong>Strg+↓</strong> — schneller und langsamer.</li>" +
        "<li><strong>V</strong> — eine Variante aus einem Kommentar öffnen, <strong>Esc</strong> — die Variante verlassen.</li>" +
        "<li><strong>F</strong> — Vollbild.</li>" +
        "<li><strong>B</strong> — bester Zug nach Stockfish.</li>" +
        "<li><strong>A</strong> — die ganze Partie analysieren; <strong>A</strong> zwei Sekunden gedrückt halten liefert scherzhafte Bewertungen.</li>" +
        "<li><strong>H</strong> — Hilfe nach Abschnitten.</li>" +
        "</ul>",
    },
    "manual.chessExport": {
      ru: "В готовую страницу шахматный компонент подключается сам, как только в документе есть хотя бы один блок <code>```chess</code>. Комментарии из PGN читаются вместе с ходом, а вариант в комментарии записывается в квадратных скобках после знака доллара: <code>$[Bc4 Nc6]</code>.",
      en: "In the exported page the chess component is loaded by itself as soon as the document contains at least one <code>```chess</code> block. Comments from the PGN are spoken together with the move, and a variation inside a comment is written in square brackets after a dollar sign: <code>$[Bc4 Nc6]</code>.",
      tr: "Hazır sayfada, belgede en az bir <code>```chess</code> bloğu olduğunda satranç bileşeni kendiliğinden yüklenir. PGN'deki yorumlar hamleyle birlikte okunur, yorum içindeki bir varyant ise dolar işaretinden sonra köşeli parantez içine yazılır: <code>$[Bc4 Nc6]</code>.",
      de: "Auf der exportierten Seite lädt sich die Schachkomponente von selbst, sobald das Dokument mindestens einen <code>```chess</code>-Block enthält. Kommentare aus der PGN werden zusammen mit dem Zug vorgelesen, und eine Variante innerhalb eines Kommentars wird nach einem Dollarzeichen in eckigen Klammern geschrieben: <code>$[Bc4 Nc6]</code>.",
    },

    // --- Клавиши ------------------------------------------------------------
    "manual.keysList": {
      ru: "<ul>" +
        "<li><strong>Alt+ё</strong> — переключатель между редактором и предпросмотром. Из редактора открывает предпросмотр, пересоздаёт графики и переносит фокус на место курсора; из предпросмотра возвращает в редактор на ту же строку. <strong>Ctrl+Shift+Enter</strong> — спрятать предпросмотр.</li>" +
        "<li><strong>Alt+M</strong> — следующая формула будет в строке или отдельным блоком. <strong>Alt+L</strong> — синтаксис: LaTeX или AsciiMath.</li>" +
        "<li><strong>Alt+1 … Alt+9, Alt+0, Alt+-, Alt+=</strong> — вставить дробь, корень, сумму и другие заготовки. Те же номера написаны на кнопках.</li>" +
        "<li><strong>Ctrl+Space</strong> — подсказки: делимитеры, блоки, ключи настроек, разметка markdown. Внутри формулы подсказки появляются сами.</li>" +
        "<li><strong>Escape</strong> — выйти из редактора: фокус уходит на кнопку предпросмотра, и дальше Tab идёт по странице обычным порядком. Внутри редактора Tab вставляет отступ и из редактора не выводит — выход именно по Escape.</li>" +
        "<li><strong>F1</strong> — справка, <strong>Shift+F1</strong> — палитра команд (она же <strong>Ctrl+Alt+P</strong>). F1 привычнее видеть справкой, поэтому палитра переехала.</li>" +
        "<li><strong>F2</strong> — переименовать документ, <strong>Shift+F2</strong> — удалить документ, <strong>F9</strong> — новый документ. То же самое делают кнопки рядом со списком документов.</li>" +
        "<li><strong>Ctrl+S</strong> — сохранить .md, <strong>Ctrl+Alt+S</strong> — сохранить как новый файл, <strong>Ctrl+Shift+S</strong> — готовый HTML, <strong>Ctrl+O</strong> — открыть .md с диска.</li>" +
        "<li><strong>F8</strong> и <strong>Shift+F8</strong> — следующая и предыдущая ошибка в документе: курсор переходит на строку, а редактор сообщает, что не так. Alt+ё с ошибками показывает их списком вместо предпросмотра. Когда курсор сам встаёт на строку с ошибкой, звучит короткий сигнал.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><strong>Alt+`</strong> — a switch between the editor and the preview. From the editor it opens the preview, rebuilds the graphs and moves the focus to the cursor's place; from the preview it returns to the editor on the same line. <strong>Ctrl+Shift+Enter</strong> — hide the preview.</li>" +
        "<li><strong>Alt+M</strong> — the next formula goes inline or as a separate block. <strong>Alt+L</strong> — the syntax: LaTeX or AsciiMath.</li>" +
        "<li><strong>Alt+1 … Alt+9, Alt+0, Alt+-, Alt+=</strong> — insert a fraction, a root, a sum and other templates. The same numbers are printed on the buttons.</li>" +
        "<li><strong>Ctrl+Space</strong> — suggestions: delimiters, blocks, settings keys, markdown markup. Inside a formula they appear by themselves.</li>" +
        "<li><strong>Escape</strong> — leave the editor: the focus moves to the preview button and from there Tab goes through the page in the usual order. Inside the editor Tab inserts indentation and does not take you out — Escape is the way out.</li>" +
        "<li><strong>F1</strong> — help, <strong>Shift+F1</strong> — the command palette (also <strong>Ctrl+Alt+P</strong>). F1 is more usually expected to bring up help, so the palette moved.</li>" +
        "<li><strong>F2</strong> — rename the document, <strong>Shift+F2</strong> — delete it, <strong>F9</strong> — a new document. The buttons next to the document list do the same.</li>" +
        "<li><strong>Ctrl+S</strong> — save the .md, <strong>Ctrl+Alt+S</strong> — save as a new file, <strong>Ctrl+Shift+S</strong> — the ready HTML, <strong>Ctrl+O</strong> — open a .md from disk.</li>" +
        "<li><strong>F8</strong> and <strong>Shift+F8</strong> — the next and the previous error in the document: the cursor moves to the line and the editor says what is wrong. Alt+` with errors shows them as a list instead of the preview. When the cursor lands on a line with an error, a short signal sounds.</li>" +
        "</ul>",
      tr: "<ul>" +
        "<li><strong>Alt+`</strong> — editör ile önizleme arasında geçiş. Editörden basıldığında önizlemeyi açar, grafikleri yeniden oluşturur ve odağı imlecin bulunduğu yere taşır; önizlemeden basıldığında aynı satırda editöre döner. <strong>Ctrl+Shift+Enter</strong> — önizlemeyi gizler.</li>" +
        "<li><strong>Alt+M</strong> — sıradaki formül satır içinde mi yoksa ayrı bir blok olarak mı eklenecek. <strong>Alt+L</strong> — sözdizimi: LaTeX veya AsciiMath.</li>" +
        "<li><strong>Alt+1 … Alt+9, Alt+0, Alt+-, Alt+=</strong> — kesir, kök, toplam ve diğer hazır şablonları ekler. Aynı numaralar düğmelerin üzerinde de yazılıdır.</li>" +
        "<li><strong>Ctrl+Space</strong> — öneriler: sınırlayıcılar, bloklar, ayar anahtarları, markdown biçimlendirmesi. Bir formülün içinde öneriler kendiliğinden belirir.</li>" +
        "<li><strong>Escape</strong> — editörden çıkar: odak önizleme düğmesine geçer ve bundan sonra Tab sayfada olağan sırayla ilerler. Editörün içinde Tab girinti ekler ve dışarı çıkarmaz — çıkış tuşu Escape'tir.</li>" +
        "<li><strong>F1</strong> — yardım, <strong>Shift+F1</strong> — komut paleti (aynı zamanda <strong>Ctrl+Alt+P</strong>). F1'in yardımı açması daha alışılmış olduğu için palet başka bir tuşa taşınmıştır.</li>" +
        "<li><strong>F2</strong> — belgeyi yeniden adlandırır, <strong>Shift+F2</strong> — belgeyi siler, <strong>F9</strong> — yeni belge oluşturur. Belge listesinin yanındaki düğmeler de aynısını yapar.</li>" +
        "<li><strong>Ctrl+S</strong> — .md kaydeder, <strong>Ctrl+Alt+S</strong> — yeni bir dosya olarak kaydeder, <strong>Ctrl+Shift+S</strong> — hazır HTML, <strong>Ctrl+O</strong> — diskten bir .md açar.</li>" +
        "<li><strong>F8</strong> ve <strong>Shift+F8</strong> — belgedeki sonraki ve önceki hata: imleç satıra geçer ve editör neyin yanlış olduğunu bildirir. Hatalarla birlikte Alt+`, önizleme yerine hataları liste olarak gösterir. İmleç hatalı bir satıra kendiliğinden geldiğinde kısa bir sinyal duyulur.</li>" +
        "</ul>",
      de: "<ul>" +
        "<li><strong>Alt+`</strong> — wechselt zwischen Editor und Vorschau. Aus dem Editor öffnet es die Vorschau, baut die Diagramme neu auf und verschiebt den Fokus an die Stelle des Cursors; aus der Vorschau kehrt es in derselben Zeile zum Editor zurück. <strong>Strg+Umschalt+Enter</strong> — blendet die Vorschau aus.</li>" +
        "<li><strong>Alt+M</strong> — die nächste Formel wird inline oder als eigener Block eingefügt. <strong>Alt+L</strong> — die Syntax: LaTeX oder AsciiMath.</li>" +
        "<li><strong>Alt+1 … Alt+9, Alt+0, Alt+-, Alt+=</strong> — fügt einen Bruch, eine Wurzel, eine Summe und andere Vorlagen ein. Dieselben Zahlen stehen auf den Schaltflächen.</li>" +
        "<li><strong>Strg+Leertaste</strong> — Vorschläge: Trennzeichen, Blöcke, Einstellungsschlüssel, Markdown-Auszeichnung. Innerhalb einer Formel erscheinen sie von selbst.</li>" +
        "<li><strong>Escape</strong> — verlässt den Editor: Der Fokus wandert zur Vorschau-Schaltfläche, und von dort geht Tab in der gewohnten Reihenfolge durch die Seite. Innerhalb des Editors fügt Tab eine Einrückung ein und führt nicht hinaus — Escape ist der Weg hinaus.</li>" +
        "<li><strong>F1</strong> — Hilfe, <strong>Umschalt+F1</strong> — die Befehlspalette (auch <strong>Strg+Alt+P</strong>). F1 wird üblicher als Hilfe erwartet, deshalb ist die Palette umgezogen.</li>" +
        "<li><strong>F2</strong> — Dokument umbenennen, <strong>Umschalt+F2</strong> — löschen, <strong>F9</strong> — neues Dokument. Die Schaltflächen neben der Dokumentliste tun dasselbe.</li>" +
        "<li><strong>Strg+S</strong> — .md speichern, <strong>Strg+Alt+S</strong> — als neue Datei speichern, <strong>Strg+Umschalt+S</strong> — fertiges HTML, <strong>Strg+O</strong> — .md von der Festplatte öffnen.</li>" +
        "<li><strong>F8</strong> und <strong>Umschalt+F8</strong> — der nächste und der vorherige Fehler im Dokument: Der Cursor springt zur Zeile, und der Editor meldet, was falsch ist. Alt+` zeigt bei Fehlern eine Liste statt der Vorschau. Landet der Cursor von selbst auf einer fehlerhaften Zeile, ertönt ein kurzes Signal.</li>" +
        "</ul>",
    },
    "manual.keysButtons": {
      ru: "Кнопки работают с выделением: выделите текст и нажмите кнопку — выделение обернётся в формулу. Без выделения кнопка вставит заготовку и поставит курсор в нужное место.",
      en: "The buttons work with a selection: select text and press a button — the selection is wrapped in a formula. Without a selection the button inserts a template and puts the cursor where it belongs.",
      tr: "Düğmeler seçili metinle çalışır: metni seçin ve bir düğmeye basın — seçili kısım bir formülün içine alınır. Seçim yoksa düğme hazır bir şablon ekler ve imleci uygun yere yerleştirir.",
      de: "Die Schaltflächen arbeiten mit einer Auswahl: Markieren Sie Text und drücken Sie eine Schaltfläche — die Auswahl wird in eine Formel eingeschlossen. Ohne Auswahl fügt die Schaltfläche eine Vorlage ein und setzt den Cursor an die passende Stelle.",
    },

    // --- Frontmatter --------------------------------------------------------
    "manual.fmIntro": {
      ru: "Настройки документа пишутся в самом начале файла, между двумя строками с тремя дефисами. Это <strong>продвинутая настройка</strong>: обычному документу она не нужна. Заголовок страницы берётся из первого заголовка первого уровня, а язык документа определяется сам — по кириллице как русский, иначе по языку браузера. Frontmatter нужен, когда хочется задать это вручную или подключить к странице что-то своё.",
      en: "Document settings go at the very top of the file, between two lines of three dashes. This is an <strong>advanced setting</strong>: an ordinary document does not need it. The page title is taken from the first first-level heading, and the document language is detected by itself — Cyrillic means Russian, otherwise the browser language. Frontmatter is for setting these by hand or attaching something of your own to the page.",
      tr: "Belge ayarları dosyanın en başına, üçer tireden oluşan iki satır arasına yazılır. Bu bir <strong>gelişmiş ayardır</strong>: sıradan bir belgeye gerek yoktur. Sayfa başlığı ilk birinci düzey başlıktan alınır, belge dili ise kendiliğinden belirlenir — Kiril alfabesi Rusça anlamına gelir, aksi halde tarayıcı dili kullanılır. Frontmatter, bunları elle ayarlamak veya sayfaya kendi eklentilerinizi bağlamak istediğinizde işe yarar.",
      de: "Die Dokumenteinstellungen stehen ganz am Anfang der Datei, zwischen zwei Zeilen mit drei Bindestrichen. Das ist eine <strong>fortgeschrittene Einstellung</strong>: Ein gewöhnliches Dokument braucht sie nicht. Der Seitentitel wird aus der ersten Überschrift erster Ebene übernommen, und die Dokumentsprache wird automatisch erkannt — Kyrillisch bedeutet Russisch, sonst die Browsersprache. Frontmatter dient dazu, dies von Hand festzulegen oder der Seite etwas Eigenes hinzuzufügen.",
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
      tr: "<ul>" +
        "<li><code>title</code> — belgenin başlığı. Bu olmadan ilk birinci düzey başlık kullanılır; <code>author</code> ve <code>description</code> — yazar ve açıklama.</li>" +
        "<li><code>lang</code> — belgenin dili: ru, en, de, tr. Metne ve tarayıcıya göre kendiliğinden belirlenir; burada elle ayarlanabilir.</li>" +
        "<li><code>mathjax</code> — varsayılan olarak açıktır; <code>mathjax: no</code> formülleri dizgisiz, oldukları gibi bırakır.</li>" +
        "<li><code>chessjax: no</code> ve <code>desmos: no</code> — satranç tahtalarını ve grafikleri kaydedilen sayfaya dahil etmez. Normalde bunları açmaya gerek yoktur: belgede ilgili bloğu içerdiğinde modül kendiliğinden yüklenir.</li>" +
        "<li><code>css: adres</code> — hazır sayfaya kendi stil dosyanızı bağlar.</li>" +
        "<li>Girintili <code>chess:</code> — tüm tahtaların ortak ayarları: <code>lang</code>, <code>tone</code>, <code>sound</code>, <code>controls</code>. <code>desmos:</code> ve <code>mathjax:</code> altında ise kendi seçenekleri aynı şekilde yazılır.</li>" +
        "</ul>",
      de: "<ul>" +
        "<li><code>title</code> — der Dokumenttitel. Ohne ihn wird die erste Überschrift erster Ebene verwendet; <code>author</code> und <code>description</code> — Autor und Beschreibung.</li>" +
        "<li><code>lang</code> — die Dokumentsprache: ru, en, de, tr. Sie wird anhand des Texts und des Browsers erkannt; hier kann sie von Hand festgelegt werden.</li>" +
        "<li><code>mathjax</code> — standardmäßig aktiv; <code>mathjax: no</code> belässt Formeln unverändert, ohne Satz.</li>" +
        "<li><code>chessjax: no</code> und <code>desmos: no</code> — Schachbretter und Diagramme nicht in die exportierte Seite laden. Normalerweise müssen Sie sie nicht einschalten: Ein Modul lädt sich von selbst, wenn das Dokument seinen Block enthält.</li>" +
        "<li><code>css: Adresse</code> — ein eigenes Stylesheet an die exportierte Seite anhängen.</li>" +
        "<li>Eingerücktes <code>chess:</code> — gemeinsame Einstellungen für alle Bretter: <code>lang</code>, <code>tone</code>, <code>sound</code>, <code>controls</code>. Unter <code>desmos:</code> und <code>mathjax:</code> stehen deren eigene Optionen auf dieselbe Weise.</li>" +
        "</ul>",
    },
    "manual.fmHow": {
      ru: "Быстрее всего не печатать блок руками, а вставить его командой из палитры (<strong>Ctrl+Alt+P</strong>, «Вставить frontmatter») — заготовка появится сама и курсор встанет на нужное место. Если начать документ с трёх дефисов, блок развернётся и закроется автоматически.",
      en: "The quickest way is not to type the block by hand but to insert it from the palette (<strong>Ctrl+Alt+P</strong>, “Insert frontmatter”) — the template appears with the cursor in the right place. If you start a document with three dashes, the block unfolds and closes by itself.",
      tr: "En hızlı yol bloğu elle yazmak değil, komut paletinden eklemektir (<strong>Ctrl+Alt+P</strong>, «Frontmatter ekle») — şablon kendiliğinden belirir ve imleç doğru yere yerleşir. Belgeye üç tireyle başlanırsa blok kendiliğinden açılır ve kapanır.",
      de: "Am schnellsten geht es, den Block nicht von Hand zu tippen, sondern ihn über die Befehlspalette einzufügen (<strong>Strg+Alt+P</strong>, „Frontmatter einfügen“) — die Vorlage erscheint mit dem Cursor an der richtigen Stelle. Beginnt man ein Dokument mit drei Bindestrichen, entfaltet und schließt sich der Block von selbst.",
    },

    // --- Файлы --------------------------------------------------------------
    "manual.filesList": {
      ru: "<ul>" +
        "<li><strong>Показать предпросмотр</strong> — то же, что Alt+ё.</li>" +
        "<li><strong>Сохранить готовый HTML</strong> — страница для чтения и раздачи, с формулами и, если включено, с досками и графиками.</li>" +
        "<li><strong>Сохранить .md</strong> — записать исходник: в тот же файл на диске, а если его ещё нет — спросить, куда. Браузеры без доступа к файлам (Firefox, Safari) кладут копию в «Загрузки» и говорят об этом.</li>" +
        "<li><strong>Открыть .md</strong> — открыть файл с диска.</li>" +
        "<li><strong>Пример:</strong> — готовые документы: демо редактора, партия Морфи и пример с комментариями и вариантами.</li>" +
        "<li><strong>Переименовать</strong> и <strong>Удалить</strong> — про текущий, открытый документ. Стоят рядом со списком документов; то же делают F2 и Shift+F2.</li>" +
        "</ul>",
      en: "<ul>" +
        "<li><strong>Show preview</strong> — the same as Alt+`.</li>" +
        "<li><strong>Export HTML</strong> — a page for reading and sharing, with formulas and, if switched on, boards and graphs.</li>" +
        "<li><strong>Save .md</strong> — write the source: into the same file on disk, or ask where if there is none yet. Browsers without file access (Firefox, Safari) put a copy into “Downloads” and say so.</li>" +
        "<li><strong>Open .md</strong> — open a file from disk.</li>" +
        "<li><strong>Example:</strong> — ready-made documents: the editor demo, Morphy's game, and a sample with comments and variations.</li>" +
        "<li><strong>Rename</strong> and <strong>Delete</strong> act on the current, open document. They sit next to the document list; F2 and Shift+F2 do the same.</li>" +
        "</ul>",
      tr: "<ul>" +
        "<li><strong>Önizlemeyi göster</strong> — Alt+` ile aynı.</li>" +
        "<li><strong>Hazır HTML'yi kaydet</strong> — okumak ve paylaşmak için formüllerle, açıksa tahtalar ve grafiklerle birlikte bir sayfa.</li>" +
        "<li><strong>.md kaydet</strong> — kaynağı yazar: diskteki aynı dosyaya, henüz yoksa nereye kaydedileceğini sorarak. Dosya erişimi olmayan tarayıcılar (Firefox, Safari) bir kopyayı «İndirilenler» klasörüne koyar ve bunu belirtir.</li>" +
        "<li><strong>.md aç</strong> — diskten bir dosya açar.</li>" +
        "<li><strong>Örnek:</strong> — hazır belgeler: editör demosu, Morphy'nin partisi ve yorum ile varyant içeren bir örnek.</li>" +
        "<li><strong>Yeniden adlandır</strong> ve <strong>Sil</strong> — geçerli, açık belge içindir. Belge listesinin yanında yer alır; F2 ve Shift+F2 de aynısını yapar.</li>" +
        "</ul>",
      de: "<ul>" +
        "<li><strong>Vorschau anzeigen</strong> — dasselbe wie Alt+`.</li>" +
        "<li><strong>Fertiges HTML speichern</strong> — eine Seite zum Lesen und Weitergeben, mit Formeln und, falls aktiviert, mit Brettern und Diagrammen.</li>" +
        "<li><strong>.md speichern</strong> — schreibt die Quelle: in dieselbe Datei auf der Festplatte, oder fragt, wohin, wenn es noch keine gibt. Browser ohne Dateizugriff (Firefox, Safari) legen eine Kopie in „Downloads“ ab und weisen darauf hin.</li>" +
        "<li><strong>.md öffnen</strong> — öffnet eine Datei von der Festplatte.</li>" +
        "<li><strong>Beispiel:</strong> — fertige Dokumente: die Editor-Demo, Morphys Partie und ein Beispiel mit Kommentaren und Varianten.</li>" +
        "<li><strong>Umbenennen</strong> und <strong>Löschen</strong> — betreffen das aktuelle, geöffnete Dokument. Sie stehen neben der Dokumentliste; F2 und Umschalt+F2 tun dasselbe.</li>" +
        "</ul>",
    },

    // --- Документы и история ------------------------------------------------
    "manual.toc.docs": {
      ru: "Документы, автосохранение и история",
      en: "Documents, autosave and history",
      tr: "Belgeler, otomatik kaydetme ve geçmiş",
      de: "Dokumente, automatisches Speichern und Verlauf",
    },
    "manual.toc.practice": { ru: "Практика", en: "Practice", tr: "Uygulama", de: "Übung" },
    "manual.practiceWrite": {
      ru: "Освоить редактор быстрее всего за работой. Откройте редактор и напишите то, что уже разобрано: заголовок, абзац с выделением, список, формулу, а если нужно — блок графика или шахматную доску.",
      en: "The quickest way to learn the editor is to work in it. Open the editor and write what you have already read about: a heading, a paragraph with emphasis, a list, a formula and, if you need them, a graph block or a chessboard.",
      tr: "Editörü öğrenmenin en hızlı yolu onunla çalışmaktır. Editörü açın ve şimdiye kadar öğrendiklerinizi yazın: bir başlık, vurgulu bir paragraf, bir liste, bir formül ve gerekiyorsa bir grafik bloğu veya satranç tahtası.",
      de: "Der schnellste Weg, den Editor zu lernen, ist die Arbeit mit ihm. Öffnen Sie den Editor und schreiben Sie, was Sie bereits kennengelernt haben: eine Überschrift, einen Absatz mit Hervorhebung, eine Liste, eine Formel und, falls nötig, einen Diagrammblock oder ein Schachbrett.",
    },
    "manual.practiceLoop": {
      ru: "Потом нажмите <strong>Alt+ё</strong> — откроется предпросмотр, и можно прочитать или прослушать, что получилось. Ещё одно нажатие <strong>Alt+ё</strong> возвращает в редактор на ту же строку: исправьте и снова проверьте. Цикл «написал — проверил — поправил» и есть основной способ работы здесь.",
      en: "Then press <strong>Alt+`</strong> — the preview opens, and you can read or listen to the result. Pressing <strong>Alt+`</strong> again returns you to the editor on the same line: fix it and check again. This loop — write, check, correct — is the main way of working here.",
      tr: "Ardından <strong>Alt+`</strong> tuşuna basın — önizleme açılır ve sonucu okuyabilir veya dinleyebilirsiniz. <strong>Alt+`</strong> tuşuna tekrar basmak aynı satırda editöre döndürür: düzeltin ve tekrar kontrol edin. «Yaz — kontrol et — düzelt» döngüsü burada çalışmanın temel yoludur.",
      de: "Drücken Sie dann <strong>Alt+`</strong> — die Vorschau öffnet sich, und Sie können das Ergebnis lesen oder anhören. Erneutes Drücken von <strong>Alt+`</strong> bringt Sie in derselben Zeile zum Editor zurück: korrigieren Sie und prüfen Sie erneut. Dieser Kreislauf aus Schreiben, Prüfen und Korrigieren ist hier die grundlegende Arbeitsweise.",
    },
    "manual.practiceNext": {
      ru: "Дальше можно взять готовый документ из списка <strong>Пример:</strong>, разобрать его и переделать под свою задачу. Когда документ готов, кнопка <strong>Сохранить готовый HTML</strong> делает из него страницу, которую можно отправить читателю.",
      en: "After that, take a ready-made document from the <strong>Example:</strong> list, study it and rework it for your own task. When the document is ready, the <strong>Export HTML</strong> button turns it into a page you can send to a reader.",
      tr: "Ardından <strong>Örnek:</strong> listesinden hazır bir belge alıp inceleyebilir ve kendi işiniz için yeniden düzenleyebilirsiniz. Belge hazır olduğunda <strong>Hazır HTML'yi kaydet</strong> düğmesi ondan bir okuyucuya gönderebileceğiniz bir sayfa oluşturur.",
      de: "Danach können Sie ein fertiges Dokument aus der Liste <strong>Beispiel:</strong> nehmen, es studieren und für Ihre eigene Aufgabe umarbeiten. Wenn das Dokument fertig ist, erstellt die Schaltfläche <strong>Fertiges HTML speichern</strong> daraus eine Seite, die Sie an einen Leser senden können.",
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
      tr: "Belgeler tarayıcınızın kendisinde bulunur ve hiçbir yere gönderilmez. " +
        "«Dosya ve çıktı» panelindeki <strong>Belge:</strong> listesi kaydedilmiş " +
        "bir belgeyi açar; son maddesi <strong>Yeni belge</strong>'dir. Bir belge " +
        "kendi adıyla kaydedilene kadar untitled1.md, untitled2.md ve benzeri " +
        "şekilde adlandırılır. İsimsiz bir belgeyi ilk kez indirdiğinizde editör " +
        "bir ad sorar — bundan sonra dosya ve belge aynı adı paylaşır. Listenin " +
        "hemen yanında <strong>Yeniden adlandır</strong> ve <strong>Sil</strong> " +
        "düğmeleri bulunur: bunlar açık belge üzerinde çalışır, F2 ve Shift+F2 de " +
        "aynısını yapar.",
      de: "Dokumente leben allein im Browser und werden nirgendwohin gesendet. Die " +
        "Liste <strong>Dokument:</strong> im Panel „Datei und Ausgabe“ öffnet ein " +
        "gespeichertes Dokument; ihr letzter Eintrag ist <strong>Neues Dokument</strong>. " +
        "Solange ein Dokument nicht unter einem eigenen Namen gespeichert ist, heißt es " +
        "untitled1.md, untitled2.md und so weiter. Beim ersten Herunterladen eines " +
        "unbenannten Dokuments fragt der Editor nach einem Namen — von da an tragen " +
        "Datei und Dokument denselben Namen. Direkt neben der Liste stehen die " +
        "Schaltflächen <strong>Umbenennen</strong> und <strong>Löschen</strong>: Sie " +
        "wirken auf das geöffnete Dokument, und F2 sowie Umschalt+F2 tun dasselbe.",
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
      tr: "Metin kendiliğinden kaydedilir: yazmayı bıraktıktan beş saniye sonra ve " +
        "sekme kapatıldığında hemen. Siteye geri döndüğünüzde belge kaldığı yerden " +
        "açılır. Bir örneği bağlantıyla (<code>?example=…</code>) veya «Örnek:» " +
        "listesinden açtığınızda, ayrı bir belge olarak gelir: önceki taslağınız " +
        "hiçbir şey kaybetmez ve <strong>Belge:</strong> listesinde sizi bekler. " +
        "Boş bir editörü ise örnek olduğu gibi doldurur.",
      de: "Der Text speichert sich von selbst: fünf Sekunden nach dem letzten " +
        "Tastendruck und sofort beim Schließen des Tabs. Kehren Sie zur Website " +
        "zurück, öffnet sich das Dokument genau dort, wo Sie aufgehört haben. Öffnen " +
        "Sie ein Beispiel — über einen Link (<code>?example=…</code>) oder aus der " +
        "Liste „Beispiel:“ —, kommt es als eigenständiges Dokument an: Ihr bisheriger " +
        "Entwurf geht dabei nicht verloren und wartet in der Liste " +
        "<strong>Dokument:</strong> auf Sie. Ein leerer Editor wird vom Beispiel " +
        "einfach ausgefüllt.",
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
      tr: "Düzenleme geçmişi anlık görüntüler olarak tutulur: yaklaşık her iki " +
        "dakikalık çalışma için bir tane, belge başına en fazla otuz tane. " +
        "<strong>Ctrl+Alt+Z</strong> bunlarda geri gider, <strong>Ctrl+Alt+Y</strong> " +
        "ileri gider. Yalnızca geçerli oturum içinde çalışan sıradan Ctrl+Z'nin " +
        "aksine, bu anlık görüntüler sayfa yeniden yüklendiğinde de kalır. Belgeyi " +
        "belge listesinin yanındaki düğmelerle (F2 ve Shift+F2) yeniden " +
        "adlandırabilir veya silebilir, komut paletinden (Ctrl+Alt+P veya Shift+F1) " +
        "ise tüm depoyu da temizleyebilirsiniz.",
      de: "Der Bearbeitungsverlauf wird als Schnappschüsse gespeichert: etwa einer " +
        "pro zwei Minuten Arbeit, höchstens dreißig pro Dokument. " +
        "<strong>Strg+Alt+Z</strong> geht durch sie zurück, <strong>Strg+Alt+Y</strong> " +
        "geht vorwärts. Anders als das gewöhnliche Strg+Z, das nur innerhalb der " +
        "aktuellen Sitzung wirkt, überstehen diese Schnappschüsse ein Neuladen der " +
        "Seite. Ein Dokument lässt sich mit den Schaltflächen neben der " +
        "Dokumentliste umbenennen oder löschen (F2 und Umschalt+F2), und über die " +
        "Befehlspalette (Strg+Alt+P oder Umschalt+F1) auch der gesamte Speicher " +
        "leeren.",
    },
  });
})();
