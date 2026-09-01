// Математический редактор: Monaco + Markdown + MathJax 4 (LaTeX/AsciiMath) + Desmos.
//
// Рендер markdown с математикой и графиками, предпросмотр по Ctrl+Enter на
// строке курсора, помощники вставки формул, доступность для скринридера.

// Шахматные доски: fenced-блок ```chess ... ``` рендерится в <chessjax-board>.
// Импорт с CDN (jsdelivr, GH-тег v0.6.1) по side-effect: регистрирует
// кастомный элемент и document-level делегат для кнопок <button chess="id" move="N">.
import "https://cdn.jsdelivr.net/gh/denizsincar29/chessjax@v0.6.1/chessjax.js";

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

// --- YAML frontmatter --------------------------------------------------------
//
// В начале markdown-документа можно объявить метаданные и какие модули грузить
// в готовом HTML (экспорт / ?preview=html):
//   ---
//   title: Морфи
//   lang: ru
//   mathjax: no            # не грузить MathJax в этом экспорте
//   chessjax: yes          # подключить шахматный компонент (по умолчанию нет)
//   desmos: yes            # подключить Desmos (по умолчанию нет)
//   author: Дениз
//   description: Партия Морфи
//   css: https://…/style.css
//   mathjax:               # вложенные настройки MathJax (мержатся в конфиг)
//     tex:
//       inlineMath: ...
//   desmos:                # опции Desmos.Calculator
//     expressions: false
//   chess:                 # атрибуты по умолчанию для всех досок
//     lang: ru
//     tone: off
//   ---
let fmState = null; // data последнего разобранного frontmatter (для chessSlot)

function parseScalar(v) {
  const s = String(v).trim();
  if (!s) return "";
  if (/^(yes|true|on)$/i.test(s)) return true;
  if (/^(no|false|off)$/i.test(s)) return false;
  // Массивы/объекты в одну строку — как JSON: inlineMath: [["$", "$"], ...].
  if (s[0] === "[" || s[0] === "{") {
    try {
      return JSON.parse(s);
    } catch (_) {
      /* не JSON — читаем как строку */
    }
  }
  const n = Number(s);
  if (Number.isFinite(n)) return n;
  return s.replace(/^["']|["']$/g, "");
}

// Парсер YAML-подмножества для frontmatter: ключи по отступу вкладываются
// в объекты (включая произвольную вложенность для mathjax/desmos-конфигов),
// комментарии # отрезаются, скаляры проходят parseScalar.
function parseFrontmatter(md) {
  if (!/^---\r?\n/.test(md)) return { data: {}, body: md };
  const lines = md.split(/\r?\n/);
  let i = 1;
  const fm = [];
  let closed = false;
  while (i < lines.length) {
    if (/^\s*---\s*$/.test(lines[i])) {
      closed = true;
      i += 1;
      break;
    }
    fm.push(lines[i]);
    i += 1;
  }
  if (!closed) return { data: {}, body: md };
  const data = {};
  // Стек контейнеров по отступу: первый элемент — корень документа.
  const stack = [{ indent: -1, obj: data }];
  for (const raw of fm) {
    if (!raw.trim()) continue;
    const trimmed = raw.replace(/^\s+/, "");
    const indent = raw.length - trimmed.length;
    const line = trimmed.replace(/\s*#.*$/, "").trimEnd();
    if (!line) continue;
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2].trim();
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    if (val === "") {
      const child = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
    } else {
      parent[key] = parseScalar(val);
    }
  }
  return { data, body: lines.slice(i).join("\n") };
}

// Глубокий мерж вложенных настроек (массивы заменяются, объекты сливаются).
function deepMerge(base, extra) {
  if (!extra || typeof extra !== "object") return base;
  const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
  for (const k of Object.keys(extra)) {
    const bv = out[k];
    const ev = extra[k];
    if (bv && ev && typeof bv === "object" && typeof ev === "object" && !Array.isArray(ev)) {
      out[k] = deepMerge(bv, ev);
    } else {
      out[k] = ev;
    }
  }
  return out;
}

// Значение атрибута из YAML: булевы «off/on» для tone/sound/controls и т.п.
function yamlAttr(v) {
  if (v === false) return "off";
  if (v === true) return "on";
  return String(v);
}

// Экранирование для вставки в HTML-атрибуты и текст мета-тегов.
function escHtml(v) {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
  const merged = Object.assign({}, attrs);
  // Дефолты из frontmatter (chess: { lang, tone, sound, controls, ... }) —
  // id доске всегда свой, его не мержим.
  if (fmState && fmState.chess && typeof fmState.chess === "object") {
    for (const k of Object.keys(fmState.chess)) {
      if (k === "id" || k in merged) continue;
      merged[k] = yamlAttr(fmState.chess[k]);
    }
  }
  const id = merged.id || "chessjax-" + (idx + 1);
  const attrHtml = Object.entries({ id, ...merged })
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

// Рендер тела markdown (frontmatter уже снят): вынимаем chess/desmos-блоки,
// гоним через showdown, подставляем слоты.
function renderMarkdownBody(body, live) {
  body = extractDesmos(extractChess(body)).replace(/`([^`\n]+)`/g, (m, expr) => ASM_OPEN + expr + ASM_CLOSE);
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

function renderMarkdown(md, live) {
  const parsed = parseFrontmatter(md);
  fmState = parsed.data;
  return renderMarkdownBody(parsed.body, live);
}

// Живой рендер (пока печатаешь) не грузит тяжёлый SDK Desmos на каждый тик —
// вместо графика показываем подсказку; график пересоздаётся по Ctrl+Enter.
function desmosSlot(idx, live) {
  if (live) {
    return `<div class="desmos-placeholder" data-desmos-idx="${idx}">График Desmos обновится по Ctrl+Enter.</div>`;
  }
  // В готовом HTML массива desmosBlocks нет — тело графика кладём прямо в DOM
  // (encodeURIComponent), его разберёт init-скрипт документа.
  const body = desmosBlocks[idx] || "";
  return `<div class="desmos" data-desmos-idx="${idx}" data-desmos-body="${encodeURIComponent(body)}"></div>`;
}

function initDesmosGraphs() {
  if (!window.Desmos || typeof Desmos.Calculator !== "function") {
    document.querySelectorAll(".desmos[data-desmos-idx]").forEach((el) => {
      el.innerHTML = "<span class='desmos-fallback'>График Desmos недоступен — не удалось загрузить API.</span>";
    });
    return;
  }
  document.querySelectorAll(".desmos[data-desmos-idx]").forEach((el) => {
    // В предпросмотре тело из массива; в готовом HTML (экспорт) — из data-атрибута.
    const body = el.dataset.desmosBody
      ? decodeURIComponent(el.dataset.desmosBody)
      : desmosBlocks[parseInt(el.dataset.desmosIdx, 10)];
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
//
// Сниппет = { label, face, latex, asciimath } — вставляется в текущем синтаксисе
// (LaTeX или AsciiMath); либо { label, face, formula } — формула с делимитерами
// из режима вставки (inline/multiline). {cursor} в шаблоне — позиция курсора.
// Если курсор уже внутри формулы, делимитеры повторно не вставляются.

// Текущие режимы: синтаксис формул и тип формулы (строка/блок).
let syntax = "latex";        // "latex" | "asciimath"
let formulaMode = "inline";  // "inline" | "multiline"

// Внутри формулы текущего синтаксиса? Сканируем текст от начала до курсора и
// следим за открытыми делимитерами ($…$/$$…$$ для LaTeX, `…`/``…`` для AsciiMath).
function isInsideFormula() {
  const model = editor.getModel();
  const pos = editor.getPosition();
  const before = model.getValue().slice(0, model.getOffsetAt({ lineNumber: pos.lineNumber, column: pos.column }));
  const d1 = syntax === "latex" ? "$" : "`";
  const d2 = syntax === "latex" ? "$$" : "``";
  let open = null;
  for (let i = 0; i < before.length; i++) {
    if (before[i] === "\\") { i += 1; continue; } // \$, \` — экранированы
    const two = before.slice(i, i + 2);
    if (open === null) {
      if (two === d2) { open = d2; i += 1; }
      else if (before[i] === d1) { open = d1; }
    } else if (open === d1 && before[i] === d1) {
      open = null;
    } else if (open === d2 && two === d2) {
      open = null;
      i += 1;
    }
  }
  return open !== null;
}

// Шаблон и wrap для сниппета в текущих режимах синтаксиса/формулы.
function currentSnippet(item) {
  if (item.formula) {
    const [open, close] = item.formula[formulaMode];
    return { template: open + "{cursor}" + close, wrap: (s) => open + s + close };
  }
  return { template: item[syntax], wrap: null };
}

// Вставка сниппета; возвращает вставленный текст или null, если вставки не
// было (курсор уже внутри формулы). Если есть выделение и задан wrap — текст
// оборачивается; иначе вставляется шаблон с {cursor}.
function insertSnippet(item) {
  const sel = editor.getSelection();
  const model = editor.getModel();
  const selectedText = model.getValueInRange(sel);
  if (item.formula && isInsideFormula()) {
    speak("Вы уже внутри формулы.");
    return null;
  }
  const { template, wrap } = currentSnippet(item);
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
  return text;
}

// Объявление после вставки: «Вставлено: <метка>: <что вставлено>». Для формулы
// называем режим (строка/блок), т.к. сама вставка — только делимитеры.
function speakInserted(item, insertedText) {
  if (item.formula) {
    speak("Вставлено: формула, " + (formulaMode === "inline" ? "строка" : "блок") + ".");
    return;
  }
  const t = (insertedText || "").replace(/\{cursor\}/g, "").replace(/\s+/g, " ").trim();
  speak("Вставлено: " + item.label + (t ? ": " + t : "") + ".");
}

// Кнопки тулбара. Первые 12 кнопок получают хоткеи Alt+1..Alt+= (порядок в
// TOOLBAR_GROUPS): Digit1..Digit9, Digit0, Minus, Equal. Каждый сниппет имеет
// формы latex и asciimath — вставляется та, что соответствует текущему синтаксису.
const TOOLBAR_GROUPS = [
  {
    title: "Математика",
    items: [
      {
        label: "Формула",
        face: "f(x)",
        formula: {
          inline: ["$", "$"],
          multiline: ["$$\n", "\n$$"],
        },
      },
      { label: "Дробь", face: "a/b", latex: "\\frac{a}{b}{cursor}", asciimath: "(a)/(b){cursor}" },
      { label: "Степень", face: "x²", latex: "x^{2}{cursor}", asciimath: "x^2{cursor}" },
      { label: "Корень", face: "√", latex: "\\sqrt{{cursor}}", asciimath: "sqrt({cursor})" },
      { label: "Сумма", face: "Σ", latex: "\\sum_{i=1}^{n} {cursor}", asciimath: "sum_(i=1)^n {cursor}" },
      { label: "Интеграл", face: "∫", latex: "\\int_{a}^{b} {cursor}", asciimath: "int {cursor}" },
      { label: "Предел", face: "lim", latex: "\\lim_{x \\to 0} {cursor}", asciimath: "lim_(x->0) {cursor}" },
      { label: "Матрица", face: "▦", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}{cursor}", asciimath: "[[a,b],[c,d]]{cursor}" },
      { label: "Альфа", face: "α", latex: "\\alpha {cursor}", asciimath: "alpha {cursor}" },
      { label: "Пи", face: "π", latex: "\\pi {cursor}", asciimath: "pi {cursor}" },
      { label: "Бета", face: "β", latex: "\\beta {cursor}", asciimath: "beta {cursor}" },
      { label: "Больше или равно", face: "≥", latex: "\\ge {cursor}", asciimath: ">= {cursor}" },
    ],
  },
  {
    title: "Греческие буквы",
    items: [
      ["Гамма", "γ", "\\gamma", "gamma"],
      ["Дельта", "δ", "\\delta", "delta"],
      ["Сигма", "Σ", "\\Sigma", "Sigma"],
      ["Лямбда", "λ", "\\lambda", "lambda"],
      ["Мю", "μ", "\\mu", "mu"],
      ["Фи", "φ", "\\phi", "phi"],
      ["Тета", "θ", "\\theta", "theta"],
      ["Омега", "ω", "\\omega", "omega"],
    ].map(([label, face, latex, asciimath]) => ({ label, face, latex, asciimath })),
  },
  {
    title: "Символы",
    items: [
      ["Меньше или равно", "≤", "\\le", "<="],
      ["Не равно", "≠", "\\ne", "!="],
      ["Приблизительно", "≈", "\\approx", "~="],
      ["Бесконечность", "∞", "\\infty", "oo"],
      ["Принадлежит", "∈", "\\in", "in"],
      ["Подмножество", "⊆", "\\subseteq", "sube"],
      ["Объединение", "∪", "\\cup", "uu"],
      ["Пересечение", "∩", "\\cap", "nn"],
      ["Стрелка вправо", "→", "\\to", "->"],
      ["Набла", "∇", "\\nabla", "grad"],
    ].map(([label, face, latex, asciimath]) => ({ label, face, latex, asciimath })),
  },
  {
    title: "Шахматы",
    items: [
      {
        label: "Шахматная доска (fenced-блок chess)",
        face: "♟",
        latex: "```chess\nfen=\"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1\"\n```\n{cursor}",
        asciimath: "```chess\nfen=\"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1\"\n```\n{cursor}",
      },
    ],
  },
];

// Хоткеи вставки: Alt+1..Alt+9, Alt+0, Alt+-, Alt+= (e.code не зависит от раскладки).
const HOTKEY_CODES = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal"];
const HOTKEY_FACES = ["Alt+1", "Alt+2", "Alt+3", "Alt+4", "Alt+5", "Alt+6", "Alt+7", "Alt+8", "Alt+9", "Alt+0", "Alt+-", "Alt+="];

function buildToolbar() {
  // Первые 12 кнопок получают хоткеи Alt+1..Alt+= (порядок в TOOLBAR_GROUPS).
  let hotkey = 0;
  for (const group of TOOLBAR_GROUPS) {
    const span = document.createElement("span");
    span.className = "toolbar-group";
    span.textContent = group.title + ": ";
    toolbarEl.appendChild(span);
    for (const item of group.items) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = item.face;
      btn.setAttribute("aria-label", item.label);
      btn.addEventListener("click", () => {
        const inserted = insertSnippet(item);
        if (inserted !== null) speakInserted(item, inserted);
      });
      if (hotkey < HOTKEY_CODES.length) {
        const badge = document.createElement("span");
        badge.className = "hotkey";
        badge.textContent = HOTKEY_FACES[hotkey];
        btn.appendChild(badge);
        hotkey += 1;
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

// Полный самодостаточный HTML-документ из текущего markdown: используется и
// для скачивания (exportHtml), и для показа по ?preview=html. Шахматные доски
// остаются живыми <chessjax-board> — документ подключает компонент с CDN, а
// CSS (включая fullscreen) встроен в <style>.
//
// Какие модули грузить решает frontmatter:
//   mathjax  — по умолчанию включён (выкл: mathjax: no)
//   chessjax — по умолчанию выключен (вкл: chessjax: yes)
//   desmos   — по умолчанию выключен (вкл: desmos: yes)
// Вложенные настройки (mathjax: {…}, desmos: {…}, chess: {…}) мержатся
// глубоко в конфиг MathJax, опции Desmos.Calculator и атрибуты досок.
function buildDocumentHtml() {
  const bodyHtml = renderMarkdown(editor.getValue());
  const fm = fmState || {};

  // Модуль включён, если флаг true ИЛИ задан объектом настроек: `desmos: yes`
  // и `desmos:` (вложенные опции) оба включают модуль.
  const modOn = (v) => v === true || (v && typeof v === "object" && !Array.isArray(v));
  const mods = {
    mathjax: fm.mathjax !== false,
    chessjax: modOn(fm.chessjax),
    desmos: modOn(fm.desmos),
  };

  // Если в тексте есть блоки, а модуль отключён — честная подсказка в документе.
  const chessNote = chessBlocks.length && !mods.chessjax
    ? '<div class="module-off">Шахматные доски не подключены — добавьте в начало файла: <code>chessjax: yes</code></div>'
    : "";
  const desmosNote = desmosBlocks.length && !mods.desmos
    ? '<div class="module-off">Графики Desmos не подключены — добавьте в начало файла: <code>desmos: yes</code></div>'
    : "";

  const title = fm.title || "Математический документ";
  const lang = fm.lang || "ru";
  const author = fm.author ? `<meta name="author" content="${escHtml(fm.author)}">\n` : "";
  const description = fm.description ? `<meta name="description" content="${escHtml(fm.description)}">\n` : "";
  const extraCss = fm.css ? `<link rel="stylesheet" href="${escHtml(fm.css)}">\n` : "";

  // MathJax: конфиг из frontmatter мержится поверх дефолтного.
  let mjBlock = "";
  if (mods.mathjax) {
    const mjConfig = deepMerge(
      {
        loader: { load: ["input/tex", "input/asciimath", "output/chtml"] },
        tex: { inlineMath: [["$", "$"], ["\\(", "\\)"]], displayMath: [["$$", "$$"], ["\\[", "\\]"]] },
        options: { enableMenu: false },
      },
      fm.mathjax && typeof fm.mathjax === "object" ? fm.mathjax : {}
    );
    mjBlock = `<script>
window.MathJax = ${JSON.stringify(mjConfig)};
</script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@4/tex-chtml.js"></script>
`;
  }

  let chessBlock = "";
  if (mods.chessjax) {
    chessBlock = `<script type="module" src="https://cdn.jsdelivr.net/gh/denizsincar29/chessjax@v0.6.1/chessjax.js"></script>
`;
  }

  // Desmos: тело каждого графика лежит в data-desmos-body (см. desmosSlot).
  let desmosBlock = "";
  let desmosInit = "";
  if (mods.desmos) {
    desmosBlock = `<script src="https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"></script>
`;
    const dOpts = deepMerge(
      { expressions: true, settingsMenu: false, border: false, projectorMode: true },
      fm.desmos && typeof fm.desmos === "object" ? fm.desmos : {}
    );
    desmosInit = `<script>
document.querySelectorAll(".desmos[data-desmos-idx]").forEach(function (el) {
  var body = el.getAttribute("data-desmos-body");
  if (!body) return;
  var calc = Desmos.Calculator(el, ${JSON.stringify(dOpts)});
  decodeURIComponent(body).split("\\n").map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (expr, i) {
    try { calc.setExpression({ id: "e" + i, latex: expr }); }
    catch (err) { console.warn("Desmos:", expr, err); }
  });
});
</script>
`;
  }

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escHtml(title)}</title>
${author}${description}${extraCss}<style>
  body { max-width: 900px; margin: 0 auto; padding: 1rem; font-family: system-ui, sans-serif; line-height: 1.6; color: #111; }
  h1 { border-bottom: 1px solid #ddd; padding-bottom: .3rem; }
  pre { background: #f5f5f5; padding: .75rem; overflow-x: auto; }
  code { background: #f5f5f5; padding: .1rem .3rem; }
  blockquote { border-left: 3px solid #888; margin: 0 0 .5rem; padding-left: .75rem; color: #555; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid #ccc; padding: .3rem .6rem; }
  .desmos { width: 100%; height: 380px; margin: .5rem 0; }
  .chessjax { margin: .5rem 0; }
  .module-off { border: 1px dashed #c57; border-radius: 6px; padding: .4rem .7rem; margin: .5rem 0; color: #844; font-size: .9rem; }
  .chessjax-board { display: grid; grid-template-columns: repeat(8, 48px); width: max-content; background: #fff; border: 1px solid #ccc; }
  .chessjax-cell { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
  .chessjax-cell.square-dark { background: #769656; }
  .chessjax-cell.square-light { background: #eeeed2; }
  .chessjax-cell.piece-w { color: #fff; text-shadow: 0 0 2px #000; }
  .chessjax-cell.piece-b { color: #000; text-shadow: 0 0 2px #fff; }
  .chessjax-cell.variant-highlight { box-shadow: inset 0 0 0 3px #f59e0b; }
  .chessjax-cell.analysis-move { box-shadow: inset 0 0 0 3px #3b82f6; }
  .chessjax-summary { color: #555; font-size: .9rem; max-width: 420px; }
  .chessjax-controls { display: flex; gap: .4rem; margin-top: .5rem; }
  .chessjax-btn { min-width: 44px; min-height: 38px; font-size: .9rem; }
  .chessjax-btn:disabled { opacity: .4; }
  .chessjax-live { min-height: 1.2em; margin: .4rem 0 0; color: #555; font-size: .9rem; max-width: 420px; }
  .chessjax-error { color: #b00020; border: 1px solid #b00020; border-radius: 6px; padding: .5rem .7rem; font-size: .9rem; }
  .chessjax-help { margin: .5rem 0 0; color: #555; font-size: .9rem; border-left: 3px solid #888; padding: .25rem .6rem; }
  chessjax-board:fullscreen { background: #14181c; padding: 1rem; display: flex; flex-direction: column; justify-content: center; }
  chessjax-board:fullscreen .chessjax-board { width: min(86vh, 92vw); margin: 0 auto; grid-template-columns: repeat(8, 1fr); border-width: 2px; border-color: #2c3640; background: #1b2127; }
  chessjax-board:fullscreen .chessjax-cell { width: auto; height: auto; aspect-ratio: 1/1; font-size: min(6vh, 6vw); }
  chessjax-board:fullscreen .chessjax-summary,
  chessjax-board:fullscreen .chessjax-live,
  chessjax-board:fullscreen .chessjax-help { max-width: min(86vh, 92vw); margin-left: auto; margin-right: auto; text-align: center; font-size: 1.1rem; color: #e2e8f0; }
  chessjax-board:fullscreen .chessjax-controls { justify-content: center; }
  chessjax-board:fullscreen .chessjax-btn { min-width: 56px; min-height: 48px; font-size: 1.4rem; }
</style>
${mjBlock}${chessBlock}${desmosBlock}</head>
<body>
${chessNote}
${bodyHtml}
${desmosNote}
${desmosInit}</body>
</html>`;
}

function exportHtml() {
  download("math.html", buildDocumentHtml(), "text/html;charset=utf-8");
  speak("HTML сохранён.", fileStatusEl);
}

function saveMd() {
  download("document.md", editor.getValue());
  speak("Файл markdown скачан.", fileStatusEl);
}

function openMd() {
  document.getElementById("open-input").click();
}

// Открыть пример из examples/: загрузить в редактор и сразу показать
// предпросмотр. Имя — простой файл (латиница/цифры/_-), без путей.
async function openExample(name) {
  const safe = String(name).replace(/\.md$/i, "");
  if (!/^[a-z0-9_-]+$/i.test(safe)) {
    speak("Некорректное имя примера.", fileStatusEl);
    return;
  }
  const res = await fetch("examples/" + safe + ".md");
  if (!res.ok) {
    speak("Пример " + safe + " не найден.", fileStatusEl);
    return;
  }
  editor.setValue(await res.text());
  showPreviewAndFocus(1);
  speak("Пример " + safe + " открыт, предпросмотр показан.", fileStatusEl);
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
// ?example=<имя>.md&preview=html — вместо редактора открыть готовый HTML
//                            (тот же самодостаточный документ, что и экспорт).
// ?example=<имя>.md&preview=on — загрузить пример и сразу показать предпросмотр.
//
// Имя — простой файл: латиница, цифры, подчёркивание, дефис и опционально .md.
// Всё остальное (пути, "..", пробелы) отклоняем сразу — никакого обхода
// каталога. В URL можно писать example=morphy или example=morphy.md.
// ?preview=html: заменить страницу готовым HTML. Monaco обязан быть уничтожен
// ДО document.open() — иначе его ResizeObserver и фоновый токенайзер продолжают
// работать в перезаписанном документе и падают о пустой body (g.document.body
// is null, modelLineProjections undefined).
function openStandaloneHtml() {
  const doc = buildDocumentHtml();
  const model = editor.getModel();
  editor.dispose();
  if (model) model.dispose();
  document.open();
  document.write(doc);
  document.close();
}

async function loadFromUrl() {
  const params = new URLSearchParams(location.search);
  const name = params.get("example");
  if (name) {
    if (!/^[a-z0-9_-]+(\.md)?$/i.test(name)) {
      speak("Некорректное имя примера: " + name, fileStatusEl);
      return;
    }
    const safe = name.replace(/\.md$/i, "");
    const res = await fetch("examples/" + safe + ".md");
    if (!res.ok) {
      speak("Пример " + safe + " не найден.", fileStatusEl);
      return;
    }
    const md = await res.text();
    editor.setValue(md);
    const preview = params.get("preview");
    if (preview === "html" || preview === "readyhtml") {
      openStandaloneHtml();
      return;
    }
    if (params.get("preview") === "on") {
      showPreviewAndFocus(1);
    } else {
      speak("Пример " + safe + " загружен. Покажите предпросмотр: Alt+ё.", fileStatusEl);
    }
    return;
  }

  // ?url=https://... — загрузить markdown по произвольному адресу. Браузер
  // применяет CORS: сервер обязан разрешать кросс-доменный запрос
  // (raw.githubusercontent.com и gist-сырцы это позволяют).
  const raw = params.get("url");
  if (!raw) return;
  let url;
  try {
    url = new URL(raw);
  } catch (_) {
    url = null;
  }
  if (!url || (url.protocol !== "http:" && url.protocol !== "https:")) {
    speak("Некорректный URL: допустим только http/https.", fileStatusEl);
    return;
  }
  try {
    const res = await fetch(url.href);
    if (!res.ok) {
      speak("Не удалось загрузить URL: HTTP " + res.status + ".", fileStatusEl);
      return;
    }
    const md = await res.text();
    editor.setValue(md);
  } catch (e) {
    speak("Не удалось загрузить URL: " + e.message + ". Сервер должен разрешать CORS.", fileStatusEl);
    return;
  }
  if (params.get("preview") === "html" || params.get("preview") === "readyhtml") {
    openStandaloneHtml();
    return;
  }
  if (params.get("preview") === "on") {
    showPreviewAndFocus(1);
  } else {
    speak("Markdown загружен по URL. Покажите предпросмотр: Alt+ё.", fileStatusEl);
  }
}

// --- Автодополнения Монако ---------------------------------------------------
//
// Контекстные сниппеты для markdown: внутри --- frontmatter — ключи; внутри
// ```chess — атрибуты chessjax; внутри ```desmos — выражения Desmos; в
// формулах — LaTeX-команды; в обычном тексте — заготовки блоков и формул.
function registerMarkdownCompletions() {
  const KM = monaco.languages.CompletionItemKind;
  const RULES = monaco.languages.CompletionItemInsertTextRule;
  const wordAt = (model, pos) => model.getWordUntilPosition(pos);
  const one = (model, pos) => ({
    startLineNumber: pos.lineNumber,
    startColumn: pos.column,
    endLineNumber: pos.lineNumber,
    endColumn: pos.column,
  });

  // Внутри ли ```<язык> блока сидит курсор? kind = тег или null.
  function fenceContext(model, pos) {
    const startFence = /^\s*```(\w*)\s*$/;
    let inside = null;
    for (let l = 1; l < pos.lineNumber; l++) {
      const m = startFence.exec(model.getLineContent(l));
      if (m) inside = inside ? null : (m[1] || "fence");
    }
    return inside;
  }

  // Курсор в frontmatter: строка 1 = "---", закрывающего "---" ещё нет.
  function inFrontmatter(model, pos) {
    if (model.getLineContent(1).trim() !== "---") return false;
    for (let l = 2; l <= pos.lineNumber; l++) {
      if (model.getLineContent(l).trim() === "---" && l !== pos.lineNumber) return false;
    }
    return true;
  }

  const FRONTMATTER = [
    { label: "title", detail: "Заголовок документа", doc: "Идёт в <title> экспортированного HTML.", insert: "title: ${1:Название}" },
    { label: "lang", detail: "Язык документа", doc: "lang=<…> в <html>. Например ru, en.", insert: "lang: ${1|ru,en|}" },
    { label: "mathjax", detail: "Загружать MathJax (по умолчанию да)", doc: "no — не подключать MathJax в экспорте.", insert: "mathjax: ${1|yes,no|}" },
    { label: "chessjax", detail: "Шахматные доски (по умолчанию нет)", doc: "yes — подключить chessjax и включить блоки ```chess.", insert: "chessjax: ${1|yes,no|}" },
    { label: "desmos", detail: "Графики Desmos (по умолчанию нет)", doc: "yes — подключить Desmos и включить блоки ```desmos.", insert: "desmos: ${1|yes,no|}" },
    { label: "author", detail: "Автор", insert: "author: ${1:Автор}" },
    { label: "description", detail: "Описание документа", insert: "description: ${1:Описание}" },
    { label: "css", detail: "Дополнительный CSS", doc: "URL стиля, подключается в экспорт.", insert: "css: ${1:https://…/style.css}" },
    { label: "mathjax …", detail: "Настройки MathJax (вложенно)", insert: "mathjax:\n  tex:\n    inlineMath: [[\"$\", \"$\"]]\n  options:\n    enableMenu: false" },
    { label: "desmos …", detail: "Опции Desmos.Calculator (вложенно)", insert: "desmos:\n  expressions: true\n  border: false" },
    { label: "chess …", detail: "Атрибуты досок по умолчанию", insert: "chess:\n  lang: ru\n  tone: on" },
  ];

  const FENCE = [
    { label: "chess", detail: "Шахматная доска (блок)", doc: "```chess, атрибуты как у <chessjax-board>.", insert: "```chess\nfen=\"${1:rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1}\"\n```" },
    { label: "desmos", detail: "График Desmos (блок)", doc: "Каждая строка — LaTeX-выражение.", insert: "```desmos\ny=${1:x^2}\n```" },
    { label: "latex", detail: "LaTeX (блок)", insert: "```latex\n${1}\n```" },
    { label: "asciimath", detail: "AsciiMath (блок)", insert: "```asciimath\n${1}\n```" },
  ];

  const MATH = [
    { label: "$…$", detail: "Инлайн-формула LaTeX", insert: "$${1:формула}$" },
    { label: "$$…$$", detail: "Формула на отдельной строке", insert: "$$${1:формула}$$" },
    { label: "`…`", detail: "AsciiMath в строке", insert: "`${1:sqrt(x+1)}`" },
    { label: "\\frac", detail: "Дробь", insert: "\\frac{${1:numerator}}{${2:denominator}}" },
    { label: "\\sqrt", detail: "Корень", insert: "\\sqrt{${1:x}}" },
    { label: "\\sum", detail: "Сумма", insert: "\\sum_{${1:i}=0}^{${2:n}} ${3:x_i}" },
    { label: "\\int", detail: "Интеграл", insert: "\\int_{${1:a}}^{${2:b}} ${3:f(x)} dx" },
    { label: "\\alpha", detail: "Греческая альфа", insert: "\\alpha" },
    { label: "\\beta", detail: "Бета", insert: "\\beta" },
    { label: "\\pi", detail: "Пи", insert: "\\pi" },
    { label: "\\theta", detail: "Тета", insert: "\\theta" },
    { label: "\\infty", detail: "Бесконечность", insert: "\\infty" },
    { label: "\\cdot", detail: "Умножение точкой", insert: "\\cdot" },
    { label: "\\times", detail: "Умножение крестиком", insert: "\\times" },
    { label: "\\leq", detail: "Меньше или равно", insert: "\\leq" },
    { label: "\\geq", detail: "Больше или равно", insert: "\\geq" },
  ];

  const CHESS_ATTR = [
    { label: "fen", detail: "Начальная позиция FEN", insert: "fen=\"${1}\"" },
    { label: "pgn", detail: "URL партии в PGN", doc: "Можно jsdelivr-CDN, как в примерах.", insert: "pgn=\"${1:https://…/part.pgn}\"" },
    { label: "move", detail: "Ход, с которого начать", insert: "move=\"${1:1}\"" },
    { label: "lang", detail: "Язык озвучки (ru/en/…)", insert: "lang=\"${1|ru,en|}\"" },
    { label: "controls", detail: "Кнопки управления (по умолчанию on)", insert: "controls=\"${1|on,off|}\"" },
    { label: "tone", detail: "Тон преимущества (по умолчанию on)", insert: "tone=\"${1|on,off|}\"" },
    { label: "sound", detail: "Звуки ходов (по умолчанию on)", insert: "sound=\"${1|on,off|}\"" },
    { label: "id", detail: "id доски для ссылок", insert: "id=\"${1:board}\"" },
  ];

  const DESMOS = [
    { label: "y = x^2", insert: "y = ${1:x^2}" },
    { label: "y = sin(x)", insert: "y = \\sin(${1:x})" },
    { label: "y = cos(x)", insert: "y = \\cos(${1:x})" },
    { label: "y = tan(x)", insert: "y = \\tan(${1:x})" },
    { label: "y = sqrt(x)", insert: "y = \\sqrt{${1:x}}" },
    { label: "y = log(x)", insert: "y = \\log_{${1:10}}(${2:x})" },
    { label: "y = |x|", insert: "y = \\left|${1:x}\\right|" },
  ];

  const toItems = (list) =>
    list.map((s) => ({
      label: s.label,
      kind: KM.Snippet,
      detail: s.detail,
      documentation: s.doc,
      insertText: s.insert,
      insertTextRules: RULES.InsertAsSnippet,
    }));

  monaco.languages.registerCompletionItemProvider("markdown", {
    triggerCharacters: ["`", "$", "\\", ":", "-", " ", "\n"],
    provideCompletionItems(model, position) {
      const word = wordAt(model, position);
      const range =
        word && word.word.length
          ? {
              startLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endLineNumber: position.lineNumber,
              endColumn: word.endColumn,
            }
          : one(model, position);
      const withRange = (list) => toItems(list).map((s) => ({ ...s, range }));

      if (inFrontmatter(model, position)) return { suggestions: withRange(FRONTMATTER) };
      const fence = fenceContext(model, position);
      if (fence === "chess") return { suggestions: withRange(CHESS_ATTR) };
      if (fence === "desmos") return { suggestions: withRange(DESMOS.concat(MATH)) };
      if (fence && fence !== "fence") return { suggestions: withRange(MATH) };
      return { suggestions: withRange(FENCE.concat(MATH)) };
    },
  });
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

  registerMarkdownCompletions();
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
      // Alt+M — режим формулы (строка/блок), Alt+L — синтаксис (LaTeX/AsciiMath),
      // Alt+1..Alt+= — вставка сниппетов в текущем синтаксисе.
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        if (e.code === "KeyM") {
          e.preventDefault();
          e.stopImmediatePropagation();
          formulaMode = formulaMode === "inline" ? "multiline" : "inline";
          speak("Режим вставки формулы: " + (formulaMode === "inline" ? "строка" : "блок") + ".");
          return;
        }
        if (e.code === "KeyL") {
          e.preventDefault();
          e.stopImmediatePropagation();
          syntax = syntax === "latex" ? "asciimath" : "latex";
          speak("Синтаксис формул: " + (syntax === "latex" ? "LaTeX" : "AsciiMath") + ".");
          return;
        }
        const hi = HOTKEY_CODES.indexOf(e.code);
        if (hi !== -1) {
          e.preventDefault();
          e.stopImmediatePropagation();
          const all = TOOLBAR_GROUPS.flatMap((g) => g.items);
          const item = all[hi];
          if (item) {
            const inserted = insertSnippet(item);
            if (inserted !== null) speakInserted(item, inserted);
          }
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
  const exampleSelect = document.getElementById("example-select");
  exampleSelect.addEventListener("change", () => {
    const name = exampleSelect.value;
    exampleSelect.value = "";
    if (name) openExample(name);
  });
  document.getElementById("open-input").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      editor.setValue(String(reader.result));
      showPreviewAndFocus(1);
      speak("Файл " + file.name + " открыт, предпросмотр показан.", fileStatusEl);
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
