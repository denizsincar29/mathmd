// Математический редактор: Monaco + Markdown + MathJax 4 (LaTeX/AsciiMath) + Desmos.
//
// Рендер markdown с математикой и графиками, предпросмотр по Ctrl+Enter на
// строке курсора, помощники вставки формул, доступность для скринридера.

// Шахматные доски: fenced-блок ```chess ... ``` рендерится в <chessjax-board>.
// Импорт с CDN (jsdelivr, GH-тег v0.1.2) по side-effect: регистрирует
// кастомный элемент и document-level делегат для кнопок <button chess="id" move="N">.
import "https://cdn.jsdelivr.net/gh/denizsincar29/chessjax@v0.1.2/chessjax.js";

const previewEl = document.getElementById("preview");
const previewStatusEl = document.getElementById("preview-status");
const previewSection = document.getElementById("preview-section");
const fileStatusEl = document.getElementById("file-status");
const toolbarEl = document.getElementById("toolbar");

// --- Скринридерные объявления ----------------------------------------------

let speakTimer = null;
function speak(text, target) {
  const el = target || previewStatusEl;
  el.textContent = "";
  clearTimeout(speakTimer);
  // Чистим, чтобы одинаковый текст проговаривался повторно.
  speakTimer = setTimeout(() => {
    el.textContent = text;
  }, 60);
}

// --- Markdown-рендер --------------------------------------------------------
// AsciiMath использует обратную кавычку как делимитер (`sqrt(2)`). Чтобы
// showdown не превращал кавычки в <code>, до конвертации меняем их на
// маркеры, а после — возвращаем обратно кавычками уже в готовом HTML.
// LaTeX $...$ и $$...$$ showdown не трогает — их обрабатывает MathJax.
//
// Предпросмотр строится по сегментам markdown (блоки, разделённые пустыми
// строками, со склейкой списков/цитат/кода). Каждый сегмент получает
// data-line — номер первой строки исходника, — чтобы по хоткею находить
// блок, соответствующий строке курсора. Рендер по сегментам (а не всего
// документа с разметкой строк комментариями) не ломает markdown-парсинг.

const ASM_OPEN = "⁣¶ASMOPEN¶⁣";
const ASM_CLOSE = "⁣¶ASMCLOSE¶⁣";

const converter = new showdown.Converter({
  tables: true,
  tasklists: true,
  strikethrough: true,
  simplifiedAutoLink: true,
  ghCodeBlocks: true,
  headerLevelStart: 1,
});

// Fenced-блоки ```desmos ... ``` вынимаем до showdown и подставляем
// контейнеры для интерактивных графиков Desmos.
let desmosBlocks = [];

function extractDesmos(md) {
  desmosBlocks = [];
  return md.replace(/```desmos\s*\n([\s\S]*?)```/g, (match, body) => {
    const idx = desmosBlocks.length;
    desmosBlocks.push(body);
    return `@@DESMOS${idx}@@`;
  });
}

// Шахматные доски: ```chess ... ```, тело — атрибуты <chessjax-board>:
//   ```chess fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
//   ```chess pgn="morphy.pgn" move="10"
//   ```chess id="carlsen" pgn="Carlsen.pgn" move="25"
// Поддерживаются fen, pgn/pgn-src, move, lang, controls, id (по умолчанию
// id = chessjax-<номер доски> — на него можно вешать кнопки в тексте).
// Значения с пробелами (FEN целиком) — обязательно в кавычках.
let chessBlocks = [];

function extractChess(md) {
  chessBlocks = [];
  return md.replace(/```chess[ \t]*\n?([\s\S]*?)```/g, (match, body) => {
    const attrs = {};
    const re = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
    let m;
    while ((m = re.exec(body)) !== null) {
      attrs[m[1]] = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4];
    }
    chessBlocks.push(attrs);
    return `@@CHESS${chessBlocks.length - 1}@@`;
  });
}

function chessSlot(idx) {
  const attrs = chessBlocks[idx];
  if (!attrs) return "";
  const id = attrs.id || "chessjax-" + (idx + 1);
  const attrHtml = Object.entries({ id, ...attrs })
    .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, "&quot;")}"`)
    .join("");
  return `<chessjax-board${attrHtml}></chessjax-board>`;
}

function lineClass(line) {
  if (/^\s*```/.test(line)) return "fence";
  if (/^\s*[-+*]\s+/.test(line)) return "bullet";
  if (/^\s*\d+[.)]\s+/.test(line)) return "ordered";
  if (/^\s*>\s?/.test(line)) return "quote";
  if (/^\s*#{1,6}\s+/.test(line)) return "heading";
  if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)) return "hr";
  if (/^\s*\|.*\|\s*$/.test(line)) return "table";
  return "text";
}

function canContinue(seg, line) {
  if (line === "fence") return seg === "text";
  switch (seg) {
    case "heading":
    case "hr":
      return false;
    case "bullet":
      return line === "bullet" || line === "ordered" || line === "text";
    case "ordered":
      return line === "ordered" || line === "text";
    case "quote":
      return line !== "hr" && line !== "fence";
    default:
      return line === "text" || line === "table";
  }
}

function segmentMarkdown(md) {
  const lines = md.split("\n");
  const segments = [];
  let i = 0;
  while (i < lines.length) {
    while (i < lines.length && lines[i].trim() === "") i++;
    if (i >= lines.length) break;
    const start = i;
    const cls = lineClass(lines[i]);
    // Первая строка сегмента всегда входит в него (для заголовков/hr
    // canContinue возвращает false на любой строке, включая первую).
    const buf = [lines[i]];
    i++;
    let inFence = cls === "fence";
    while (i < lines.length) {
      const line = lines[i];
      if (inFence) {
        buf.push(line);
        if (/^\s*```/.test(line)) inFence = false;
        i++;
        continue;
      }
      if (line.trim() === "") break;
      const lc = lineClass(line);
      if (canContinue(cls, lc)) {
        buf.push(line);
        if (lc === "fence") inFence = true;
        i++;
      } else {
        break;
      }
    }
    segments.push({ start, lines: buf.join("\n") });
  }
  return segments;
}

function renderMarkdown(md, live) {
  const body = extractDesmos(extractChess(md)).replace(/`([^`\n]+)`/g, (m, expr) => ASM_OPEN + expr + ASM_CLOSE);
  const segments = segmentMarkdown(body);
  let html = "";
  for (const seg of segments) {
    // data-line — 1-based номер строки Monaco, чтобы совпадал с lineNumber.
    html += `<div class="preview-block" data-line="${seg.start + 1}" tabindex="0">${converter.makeHtml(seg.lines)}</div>\n`;
  }
  html = html.split(ASM_OPEN).join("`").split(ASM_CLOSE).join("`");
  // Плейсхолдеры showdown заворачивает в <p> — блочные элементы внутри p
  // невалидны, поэтому вырываем их из абзаца и подставляем разметку.
  html = html.replace(/<p>@@CHESS(\d+)@@<\/p>/g, (m, i) => chessSlot(Number(i)));
  html = html.replace(/@@CHESS(\d+)@@/g, (m, i) => chessSlot(Number(i)));
  html = html.replace(/<p>@@DESMOS(\d+)@@<\/p>/g, (m, i) => desmosSlot(i, live));
  html = html.replace(/@@DESMOS(\d+)@@/g, (m, i) => desmosSlot(i, live));
  return html;
}

// Живой рендер (пока печатаешь) не грузит тяжёлый SDK Desmos на каждый тик —
// вместо графика показываем подсказку; график пересоздаётся по Ctrl+Enter.
function desmosSlot(idx, live) {
  if (live) {
    return `<div class="desmos-placeholder" data-desmos-idx="${idx}">График Desmos обновится по Ctrl+Enter.</div>`;
  }
  return `<div class="desmos" data-desmos-idx="${idx}"></div>`;
}

function initDesmosGraphs() {
  if (!window.Desmos || typeof Desmos.Calculator !== "function") {
    document.querySelectorAll(".desmos[data-desmos-idx]").forEach((el) => {
      el.innerHTML = "<span class='desmos-fallback'>График Desmos недоступен — не удалось загрузить API.</span>";
    });
    return;
  }
  document.querySelectorAll(".desmos[data-desmos-idx]").forEach((el) => {
    const body = desmosBlocks[parseInt(el.dataset.desmosIdx, 10)];
    if (!body) return;
    try {
      const calc = Desmos.Calculator(el, {
        expressions: true,
        settingsMenu: false,
        border: false,
        projectorMode: true,
      });
      body
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((expr, i) => {
          try {
            calc.setExpression({ id: "e" + i, latex: expr });
          } catch (err) {
            console.warn("[mathmd] выражение Desmos не распознано:", expr, err);
          }
        });
    } catch (err) {
      console.error("[mathmd] не удалось создать график Desmos:", err);
    }
  });
}

async function typesetMath() {
  const mj = window.MathJax;
  if (mj && typeof mj.typesetPromise === "function") {
    try {
      await mj.typesetPromise([previewEl]);
    } catch (err) {
      console.warn("[mathmd] MathJax:", err);
    }
  }
}

async function renderPreview(live) {
  try {
    const html = renderMarkdown(editor.getValue(), live);
    // Ничего не изменилось — не дёргаем MathJax/Desmos впустую.
    if (html === previewEl.dataset.lastHtml) return;
    previewEl.dataset.lastHtml = html;
    previewEl.innerHTML = html;
    if (!live) initDesmosGraphs();
    await typesetMath();
  } catch (err) {
    console.error("[mathmd] рендер предпросмотра:", err);
  }
}

// Живой предпросмотр: при наборе рендер откладывается на 800 мс, чтобы
// каждое нажатие не грузило процессор (MathJax). Формулы обновляются сами;
// графики Desmos пересоздаются только по Ctrl+Enter.
let liveTimer = null;
function scheduleLivePreview() {
  if (previewSection.hidden) return;
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => renderPreview(true), 800);
}

// --- Предпросмотр на строке курсора ----------------------------------------

function findBlockForLine(line) {
  const blocks = Array.from(previewEl.querySelectorAll(".preview-block"));
  let best = null;
  for (const b of blocks) {
    const l = parseInt(b.dataset.line, 10);
    if (l === line) return b;
    if (l < line && (!best || l > parseInt(best.dataset.line, 10))) best = b;
  }
  return best || blocks[0] || null;
}

function cleanText(text) {
  return text.replace(/\s+/g, " ").trim().slice(0, 400);
}

function focusPreviewAtLine(line) {
  const block = findBlockForLine(line);
  document.querySelectorAll(".preview-block--active").forEach((el) => el.classList.remove("preview-block--active"));
  if (block) {
    block.classList.add("preview-block--active");
    block.scrollIntoView({ block: "start", behavior: "smooth" });
    block.focus({ preventScroll: true });
    const label = cleanText(block.textContent);
    speak(`Строка ${line}. ` + (label || "Пустой блок."));
    // MathJax мог изменить высоту блоков после typeset — доводим скролл.
    setTimeout(() => block.scrollIntoView({ block: "start", behavior: "smooth" }), 250);
  } else {
    speak("Нет предпросмотра для этой строки.");
  }
}

function showPreviewAndFocus(line) {
  previewSection.hidden = false;
  renderPreview().then(() => focusPreviewAtLine(line));
}

// --- Вставка сниппетов ------------------------------------------------------

// snippet — строка (шаблон с {cursor}) или объект { template, wrap }. Если
// в редакторе есть выделение и задан wrap — выделенный текст оборачивается
// (инлайн $...$, блочная $$...$$, AsciiMath `...`); иначе вставляется шаблон.
function insertSnippet(snippet) {
  const sel = editor.getSelection();
  const model = editor.getModel();
  const selectedText = model.getValueInRange(sel);
  const isObj = typeof snippet === "object";
  const template = isObj ? snippet.template : snippet;
  const wrap = isObj ? snippet.wrap : null;

  const text = selectedText && wrap ? wrap(selectedText) : template.replace(/\{cursor\}/g, "");
  const range = new monaco.Range(sel.startLineNumber, sel.startColumn, sel.endLineNumber, sel.endColumn);
  editor.executeEdits("mathmd-snippet", [{ range, text }]);
  // Курсор — на место {cursor} в шаблоне: offset старта вставки + индекс маркера.
  // Считаем по offset, а не по column, чтобы корректно работали многострочные шаблоны.
  const startOffset = model.getOffsetAt({ lineNumber: sel.startLineNumber, column: sel.startColumn });
  let target;
  if (selectedText && wrap) {
    target = startOffset + text.length;
  } else {
    const cursorIdx = template.indexOf("{cursor}");
    target = cursorIdx === -1 ? startOffset + text.length : startOffset + cursorIdx;
  }
  editor.setPosition(model.getPositionAt(target));
  editor.focus();
}

// Кнопки тулбара: [метка для скринридера, сниппет, текст кнопки]
const TOOLBAR_GROUPS = [
  {
    title: "Математика",
    items: [
      ["Формула LaTeX в строке", { template: "$x^2{cursor}$", wrap: (s) => `$${s}$` }, "$x^2$"],
      ["Формула на отдельной строке", { template: "$$\n{cursor}\n$$", wrap: (s) => `$$\n${s}\n$$` }, "$$ ... $$"],
      ["Формула AsciiMath", { template: "`sqrt(2){cursor}`", wrap: (s) => "`" + s + "`" }, "`sqrt(2)`"],
      ["Дробь", "\\frac{a}{b}{cursor}", "Дробь"],
      ["Степень", "x^{2}{cursor}", "Степень"],
      ["Корень", "\\sqrt{{cursor}}", "Корень"],
      ["Сумма", "\\sum_{i=1}^{n} {cursor}", "Сумма"],
      ["Интеграл", "\\int_{a}^{b} {cursor}", "Интеграл"],
      ["Предел", "\\lim_{x \\to 0} {cursor}", "Предел"],
      ["Матрица", "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}{cursor}", "Матрица"],
    ],
  },
  {
    title: "Греческие буквы",
    items: [
      ["альфа", "\\alpha {cursor}", "α"],
      ["бета", "\\beta {cursor}", "β"],
      ["гамма", "\\gamma {cursor}", "γ"],
      ["дельта", "\\Delta {cursor}", "Δ"],
      ["пи", "\\pi {cursor}", "π"],
      ["сигма", "\\Sigma {cursor}", "Σ"],
      ["лямбда", "\\lambda {cursor}", "λ"],
      ["мю", "\\mu {cursor}", "μ"],
      ["фи", "\\phi {cursor}", "φ"],
      ["тета", "\\theta {cursor}", "θ"],
      ["омега", "\\omega {cursor}", "ω"],
    ],
  },
  {
    title: "Символы",
    items: [
      ["больше или равно", "\\ge {cursor}", "≥"],
      ["меньше или равно", "\\le {cursor}", "≤"],
      ["не равно", "\\ne {cursor}", "≠"],
      ["приблизительно", "\\approx {cursor}", "≈"],
      ["бесконечность", "\\infty {cursor}", "∞"],
      ["принадлежит", "\\in {cursor}", "∈"],
      ["подмножество", "\\subseteq {cursor}", "⊆"],
      ["объединение", "\\cup {cursor}", "∪"],
      ["пересечение", "\\cap {cursor}", "∩"],
      ["стрелка вправо", "\\to {cursor}", "→"],
      ["набла", "\\nabla {cursor}", "∇"],
    ],
  },
  {
    title: "Шахматы",
    items: [
      [
        "Шахматная доска (fenced-блок chess)",
        "```chess\nfen=\"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1\"\n```\n{cursor}",
        "♟",
      ],
    ],
  },
];

function buildToolbar() {
  // Первые 9 кнопок получают хоткей Alt+1..9 (порядок в TOOLBAR_GROUPS).
  let hotkey = 0;
  for (const group of TOOLBAR_GROUPS) {
    const span = document.createElement("span");
    span.className = "toolbar-group";
    span.textContent = group.title + ": ";
    toolbarEl.appendChild(span);
    for (const [label, snippet, face] of group.items) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = face;
      btn.setAttribute("aria-label", label);
      btn.addEventListener("click", () => insertSnippet(snippet));
      if (hotkey < 9) {
        hotkey += 1;
        const badge = document.createElement("span");
        badge.className = "hotkey";
        badge.textContent = "Alt+" + hotkey;
        btn.appendChild(badge);
      }
      toolbarEl.appendChild(btn);
    }
  }
}

// --- Файлы: открыть / скачать / экспорт HTML --------------------------------

function download(filename, text, mime) {
  const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// Экспорт делает документ самодостаточным: доски встают статичным снимком
// (семантическая таблица + резюме), без JS-компонента и без субмодуля.
function chessExportSnapshot(id) {
  const live = document.getElementById(id);
  if (!live) return "";
  const table = live.querySelector(".chessjax-board-wrap .chessjax-board");
  const summary = live.querySelector(".chessjax-summary");
  const liveText = live.querySelector(".chessjax-live");
  const parts = [];
  if (table) parts.push(table.outerHTML);
  if (summary && summary.textContent.trim()) parts.push(`<p class="chessjax-summary">${summary.textContent}</p>`);
  if (liveText && liveText.textContent.trim()) parts.push(`<p class="chessjax-live">${liveText.textContent}</p>`);
  if (!parts.length) return "";
  return `<div class="chessjax-export">\n${parts.join("\n")}\n</div>`;
}

// Ждём, пока все доски предпросмотра отрисовали таблицу или ошибку
// (рендер асинхронный — доски грузят FEN/PGN через движок).
function waitForBoards(timeoutMs = 3000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      const boards = document.querySelectorAll("#preview chessjax-board");
      const done = Array.from(boards).every((b) =>
        b.querySelector(".chessjax-board-wrap .chessjax-board") || b.querySelector(".chessjax-board-wrap .chessjax-error"));
      if (done || Date.now() - start > timeoutMs) resolve();
      else setTimeout(check, 60);
    };
    check();
  });
}

// Полный самодостаточный HTML-документ из текущего markdown: используется и
// для скачивания (exportHtml), и для показа по ?preview=readyhtml. Доски
// встают статичным снимком div-сетки (CSS скопирован из chessjax/style.css).
async function buildDocumentHtml() {
  const bodyHtml = renderMarkdown(editor.getValue()).replace(
    /<chessjax-board\b([^>]*)><\/chessjax-board>/g,
    (m, attrs) => {
      const idMatch = /id="([^"]+)"/.exec(attrs);
      return idMatch ? chessExportSnapshot(idMatch[1]) : "";
    }
  );
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Математический документ</title>
<style>
  body { max-width: 900px; margin: 0 auto; padding: 1rem; font-family: system-ui, sans-serif; line-height: 1.6; color: #111; }
  h1 { border-bottom: 1px solid #ddd; padding-bottom: .3rem; }
  pre { background: #f5f5f5; padding: .75rem; overflow-x: auto; }
  code { background: #f5f5f5; padding: .1rem .3rem; }
  blockquote { border-left: 3px solid #888; margin: 0 0 .5rem; padding-left: .75rem; color: #555; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid #ccc; padding: .3rem .6rem; }
  .desmos { width: 100%; height: 380px; margin: .5rem 0; }
  .chessjax-board { display: grid; grid-template-columns: repeat(8, 48px); width: max-content; margin: .5rem 0; background: #fff; }
  .chessjax-cell { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
  .chessjax-cell.square-dark { background: #769656; }
  .chessjax-cell.square-light { background: #eeeed2; }
  .chessjax-cell.piece-w { color: #fff; text-shadow: 0 0 2px #000; }
  .chessjax-cell.piece-b { color: #000; text-shadow: 0 0 2px #fff; }
  .chessjax-summary, .chessjax-live { color: #555; font-size: .9rem; }
</style>
<script>
window.MathJax = {
  loader: { load: ["input/tex", "input/asciimath", "output/chtml"] },
  tex: { inlineMath: [["$", "$"], ["\\\\(", "\\\\)"]], displayMath: [["$$", "$$"], ["\\\\[", "\\\\]"]] },
  options: { enableMenu: false }
};
</script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@4/tex-chtml.js"></script>
<script src="https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"></script>
</head>
<body>
${bodyHtml}
<script>
document.querySelectorAll(".desmos").forEach(function (el) {
  var body = el.getAttribute("data-desmos-idx") ? "" : "";
  var calc = Desmos.Calculator(el, { expressions: true, border: false });
});
</script>
</body>
</html>`;
}

async function exportHtml() {
  // Сначала доводим предпросмотр и доски до отрисованного состояния, потом
  // снимаем снимки с живых досок — иначе в экспорт попадут пустые теги.
  await renderPreview();
  await waitForBoards();
  download("math.html", await buildDocumentHtml(), "text/html;charset=utf-8");
  speak("HTML сохранён.", fileStatusEl);
}

function saveMd() {
  download("document.md", editor.getValue());
  speak("Файл markdown скачан.", fileStatusEl);
}

function openMd() {
  document.getElementById("open-input").click();
}

// --- Инициализация ----------------------------------------------------------

const DEFAULT_MD = [
  "# Пример документа",
  "",
  "## Формулы",
  "",
  "LaTeX в строке: $x^2 + y^2 = z^2$.",
  "",
  "Формула на отдельной строке:",
  "",
  "$$",
  "\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}",
  "$$",
  "",
  "AsciiMath через обратные кавычки: `sqrt(2x+3) = 5`.",
  "",
  "## График Desmos",
  "",
  "```desmos",
  "y=x^2",
  "y=sin(x)",
  "```",
  "",
  "## Обычный markdown",
  "",
  "**Жирный текст**, *курсив*, [ссылка](https://example.com).",
  "",
].join("\n");

let editor = null;

// --- URL-параметры -----------------------------------------------------------
//
// ?example=<имя>.md         — загрузить examples/<имя>.md в редактор.
// ?example=<имя>.md&preview=readyhtml — вместо редактора открыть готовый HTML
//                              (тот же самодостаточный документ, что и экспорт).
// ?example=<имя>.md&preview=on — загрузить пример и сразу показать предпросмотр.
//
// Имя санитизируется: разрешены только латиница, цифры, подчёркивание, дефис;
// расширение .md добавляется автоматически, так что в URL можно писать
// example=morphy или example=morphy.md — результат одинаковый.
async function loadFromUrl() {
  const params = new URLSearchParams(location.search);
  const name = params.get("example");
  if (!name) return;
  const safe = name.replace(/\.md$/i, "").replace(/[^a-z0-9_-]/gi, "");
  if (!safe) {
    speak("Некорректное имя примера: " + name, fileStatusEl);
    return;
  }
  const res = await fetch("examples/" + safe + ".md");
  if (!res.ok) {
    speak("Пример " + safe + " не найден.", fileStatusEl);
    return;
  }
  const md = await res.text();
  editor.setValue(md);
  if (params.get("preview") === "readyhtml") {
    // Доводим предпросмотр и доски до отрисованного состояния, затем заменяем
    // страницу готовым HTML — «перенаправляет» на отрендеренный документ.
    await renderPreview();
    await waitForBoards();
    const doc = await buildDocumentHtml();
    document.open();
    document.write(doc);
    document.close();
    return;
  }
  if (params.get("preview") === "on") {
    showPreviewAndFocus(1);
  } else {
    speak("Пример " + safe + " загружен. Покажите предпросмотр: Alt+ё.", fileStatusEl);
  }
}

require.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" },
});

require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.getElementById("editor"), {
    value: DEFAULT_MD,
    language: "markdown",
    theme: "vs-dark",
    accessibilitySupport: "on",
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 15,
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
    wordWrap: "on",
    ariaLabel: "Редактор математики. Пишите markdown, LaTeX или AsciiMath.",
  });

  buildToolbar();

  // Живой предпросмотр: формулы обновляются по мере набора (с дебаунсом).
  editor.onDidChangeModelContent(() => scheduleLivePreview());

  // Хоткеи на уровне window в capture-фазе: это самая ранняя точка, в которую
  // доходит событие, — раньше Monaco, раньше любых обработчиков на document.
  // Монако не увидит эти клавиши (stopImmediatePropagation).
  window.addEventListener(
    "keydown",
    (e) => {
      // Alt+ё (та же клавиша, что и `) — полный предпросмотр: показать секцию,
      // пересоздать графики Desmos и объявить содержимое строки курсора.
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.code === "Backquote") {
        e.preventDefault();
        e.stopImmediatePropagation();
        const line = editor.getPosition().lineNumber;
        showPreviewAndFocus(line);
        return;
      }
      // Ctrl+Shift+Enter — скрыть предпросмотр.
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.shiftKey && e.code === "Enter") {
        e.preventDefault();
        e.stopImmediatePropagation();
        previewSection.hidden = true;
        speak("Предпросмотр скрыт.");
        return;
      }
      // Alt+1..9 — вставка шаблонов (e.code от раскладки не зависит).
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.code.startsWith("Digit")) {
        const n = Number(e.code.slice(5));
        if (n >= 1 && n <= 9) {
          e.preventDefault();
          e.stopImmediatePropagation();
          const all = TOOLBAR_GROUPS.flatMap((g) => g.items);
          insertSnippet(all[n - 1][1]);
          // Скринридеру важно знать, что хоткей сработал.
          speak("Вставлено: " + all[n - 1][0]);
        }
      }
    },
    true,
  );

  document.getElementById("btn-preview").addEventListener("click", () => {
    const line = editor.getPosition().lineNumber;
    showPreviewAndFocus(line);
  });
  // Клик по блоку предпросмотра (удобно зрячему): курсор редактора прыгает
  // на строку этого блока, и можно сразу править markdown.
  previewEl.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    const block = e.target.closest(".preview-block");
    if (!block) return;
    const line = parseInt(block.dataset.line, 10);
    if (!Number.isInteger(line)) return;
    editor.setPosition({ lineNumber: line, column: 1 });
    editor.revealLineInCenter(line);
    editor.focus();
  });
  document.getElementById("btn-export").addEventListener("click", exportHtml);
  document.getElementById("btn-save").addEventListener("click", saveMd);
  document.getElementById("btn-open").addEventListener("click", openMd);
  document.getElementById("open-input").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      editor.setValue(String(reader.result));
      speak("Файл " + file.name + " открыт.", fileStatusEl);
    };
    reader.readAsText(file, "utf-8");
    event.target.value = "";
  });

  speak("Редактор готов. Нажмите Ctrl+Enter для предпросмотра на строке курсора.");

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.warn("[mathmd] service worker:", err);
    });
  }

  // URL-параметры должны сработать уже после инициализации редактора.
  loadFromUrl();
});
