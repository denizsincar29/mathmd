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
    return `<div class="desmos-placeholder" data-desmos-idx="${idx}">${I18N.t("msg.desmosLive")}</div>`;
  }
  // В готовом HTML массива desmosBlocks нет — тело графика кладём прямо в DOM
  // (encodeURIComponent), его разберёт init-скрипт документа.
  const body = desmosBlocks[idx] || "";
  return `<div class="desmos" data-desmos-idx="${idx}" data-desmos-body="${encodeURIComponent(body)}"></div>`;
}

function initDesmosGraphs() {
  if (!window.Desmos || typeof Desmos.Calculator !== "function") {
    document.querySelectorAll(".desmos[data-desmos-idx]").forEach((el) => {
      el.innerHTML = "<span class='desmos-fallback'>" + I18N.t("msg.desmosFallback") + "</span>";
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
    speak(I18N.t("msg.line", { n: line }) + " " + (label || I18N.t("msg.emptyBlock")));
    // MathJax мог изменить высоту блоков после typeset — доводим скролл.
    setTimeout(() => block.scrollIntoView({ block: "start", behavior: "smooth" }), 250);
  } else {
    speak(I18N.t("msg.noPreview"));
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
    speak(I18N.t("msg.insideFormula"));
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
  const label = I18N.t(item.labelKey);
  if (item.formula) {
    speak(I18N.t("msg.insertedFormula", { mode: I18N.t(formulaMode === "inline" ? "msg.modeInline" : "msg.modeBlock") }));
    return;
  }
  const t = (insertedText || "").replace(/\{cursor\}/g, "").replace(/\s+/g, " ").trim();
  speak(t ? I18N.t("msg.insertedWith", { label, text: t }) : I18N.t("msg.inserted", { label }));
}

// Кнопки тулбара. Первые 12 кнопок получают хоткеи Alt+1..Alt+= (порядок в
// TOOLBAR_GROUPS): Digit1..Digit9, Digit0, Minus, Equal. Каждый сниппет имеет
// формы latex и asciimath — вставляется та, что соответствует текущему синтаксису.
const TOOLBAR_GROUPS = [
  {
    titleKey: "tool.groupMath",
    items: [
      {
        labelKey: "tool.formula",
        face: "f(x)",
        formula: {
          inline: ["$", "$"],
          multiline: ["$$\n", "\n$$"],
        },
      },
      { labelKey: "tool.fraction", face: "a/b", latex: "\\frac{a}{b}{cursor}", asciimath: "(a)/(b){cursor}" },
      { labelKey: "tool.power", face: "x²", latex: "x^{2}{cursor}", asciimath: "x^2{cursor}" },
      { labelKey: "tool.root", face: "√", latex: "\\sqrt{{cursor}}", asciimath: "sqrt({cursor})" },
      { labelKey: "tool.sum", face: "Σ", latex: "\\sum_{i=1}^{n} {cursor}", asciimath: "sum_(i=1)^n {cursor}" },
      { labelKey: "tool.integral", face: "∫", latex: "\\int_{a}^{b} {cursor}", asciimath: "int {cursor}" },
      { labelKey: "tool.limit", face: "lim", latex: "\\lim_{x \\to 0} {cursor}", asciimath: "lim_(x->0) {cursor}" },
      { labelKey: "tool.matrix", face: "▦", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}{cursor}", asciimath: "[[a,b],[c,d]]{cursor}" },
      { labelKey: "tool.alpha", face: "α", latex: "\\alpha {cursor}", asciimath: "alpha {cursor}" },
      { labelKey: "tool.pi", face: "π", latex: "\\pi {cursor}", asciimath: "pi {cursor}" },
      { labelKey: "tool.beta", face: "β", latex: "\\beta {cursor}", asciimath: "beta {cursor}" },
      { labelKey: "tool.ge", face: "≥", latex: "\\ge {cursor}", asciimath: ">= {cursor}" },
    ],
  },
  {
    titleKey: "tool.groupGreek",
    items: [
      ["tool.gamma", "γ", "\\gamma", "gamma"],
      ["tool.delta", "δ", "\\delta", "delta"],
      ["tool.sigma", "Σ", "\\Sigma", "Sigma"],
      ["tool.lambda", "λ", "\\lambda", "lambda"],
      ["tool.mu", "μ", "\\mu", "mu"],
      ["tool.phi", "φ", "\\phi", "phi"],
      ["tool.theta", "θ", "\\theta", "theta"],
      ["tool.omega", "ω", "\\omega", "omega"],
    ].map(([labelKey, face, latex, asciimath]) => ({ labelKey, face, latex, asciimath })),
  },
  {
    titleKey: "tool.groupSymbols",
    items: [
      ["tool.le", "≤", "\\le", "<="],
      ["tool.ne", "≠", "\\ne", "!="],
      ["tool.approx", "≈", "\\approx", "~="],
      ["tool.infty", "∞", "\\infty", "oo"],
      ["tool.in", "∈", "\\in", "in"],
      ["tool.subseteq", "⊆", "\\subseteq", "sube"],
      ["tool.cup", "∪", "\\cup", "uu"],
      ["tool.cap", "∩", "\\cap", "nn"],
      ["tool.to", "→", "\\to", "->"],
      ["tool.nabla", "∇", "\\nabla", "grad"],
    ].map(([labelKey, face, latex, asciimath]) => ({ labelKey, face, latex, asciimath })),
  },
  {
    titleKey: "tool.groupChess",
    items: [
      {
        labelKey: "tool.chess",
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
    span.textContent = I18N.t(group.titleKey) + ": ";
    toolbarEl.appendChild(span);
    for (const item of group.items) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = item.face;
      btn.setAttribute("aria-label", I18N.t(item.labelKey));
      btn.title = I18N.t(item.labelKey);
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
    ? '<div class="module-off">' + I18N.t("doc.chessOff") + "</div>"
    : "";
  const desmosNote = desmosBlocks.length && !mods.desmos
    ? '<div class="module-off">' + I18N.t("doc.desmosOff") + "</div>"
    : "";

  const title = fm.title || I18N.t("doc.exportTitle");
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
        options: {
          // Активные a11y-настройки MathJax 4 — в menuOptions.settings:
          // скрытый MathML (assistiveMml) вместо англоязычной речи (speech:false).
          menuOptions: { settings: { enrich: true, assistiveMml: true, speech: false, braille: false } },
          a11y: { speech: false, assistiveMml: true },
          enableMenu: false,
        },
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
  chessjax-board:fullscreen { background: #14181c; padding: 1rem; display: flex; flex-direction: column; justify-content: flex-start; overflow-y: auto; }
  chessjax-board:fullscreen .chessjax-board { width: min(72vh, 92vw); margin: 0 auto; grid-template-columns: repeat(8, 1fr); border-width: 2px; border-color: #2c3640; background: #1b2127; }
  chessjax-board:fullscreen .chessjax-cell { width: auto; height: auto; aspect-ratio: 1/1; font-size: min(6vh, 6vw); }
  chessjax-board:fullscreen .chessjax-summary,
  chessjax-board:fullscreen .chessjax-live,
  chessjax-board:fullscreen .chessjax-help { max-width: min(72vh, 92vw); margin-left: auto; margin-right: auto; text-align: center; font-size: 1.1rem; color: #e2e8f0; }
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
  speak(I18N.t("msg.htmlSaved"), fileStatusEl);
}

function saveMd() {
  download("document.md", editor.getValue());
  speak(I18N.t("msg.mdSaved"), fileStatusEl);
}

function openMd() {
  document.getElementById("open-input").click();
}

// Открыть пример из examples/: загрузить в редактор и сразу показать
// предпросмотр. Имя — простой файл (латиница/цифры/_-), без путей.
async function openExample(name) {
  const safe = String(name).replace(/\.md$/i, "");
  if (!/^[a-z0-9_-]+$/i.test(safe)) {
    speak(I18N.t("msg.badExample"), fileStatusEl);
    return;
  }
  const res = await fetch("examples/" + safe + ".md");
  if (!res.ok) {
    speak(I18N.t("msg.exampleNotFound", { name: safe }), fileStatusEl);
    return;
  }
  editor.setValue(await res.text());
  showPreviewAndFocus(1);
  speak(I18N.t("msg.exampleOpened", { name: safe }), fileStatusEl);
}

// --- Инициализация ----------------------------------------------------------

const DEFAULT_MD = [
  "# " + I18N.t("demo.title"),
  "",
  "## " + I18N.t("demo.formulas"),
  "",
  I18N.t("demo.inline") + ": $x^2 + y^2 = z^2$.",
  "",
  I18N.t("demo.display"),
  "",
  "$$",
  "\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}",
  "$$",
  "",
  I18N.t("demo.asciimath") + ": `sqrt(2x+3) = 5`.",
  "",
  "## " + I18N.t("demo.graph"),
  "",
  "```desmos",
  "y=x^2",
  "y=sin(x)",
  "```",
  "",
  "## " + I18N.t("demo.markdown"),
  "",
  "**" + I18N.t("demo.bold") + "**, *" + I18N.t("demo.italic") + "*, [" + I18N.t("demo.link") + "](https://example.com).",
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
      speak(I18N.t("msg.badExample") + ": " + name, fileStatusEl);
      return;
    }
    const safe = name.replace(/\.md$/i, "");
    const res = await fetch("examples/" + safe + ".md");
    if (!res.ok) {
      speak(I18N.t("msg.exampleNotFound", { name: safe }), fileStatusEl);
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
      speak(I18N.t("msg.exampleLoaded", { name: safe }), fileStatusEl);
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
    speak(I18N.t("msg.badUrl"), fileStatusEl);
    return;
  }
  try {
    const res = await fetch(url.href);
    if (!res.ok) {
      speak(I18N.t("msg.urlHttp", { status: res.status }), fileStatusEl);
      return;
    }
    const md = await res.text();
    editor.setValue(md);
  } catch (e) {
    speak(I18N.t("msg.urlError", { error: e.message }), fileStatusEl);
    return;
  }
  if (params.get("preview") === "html" || params.get("preview") === "readyhtml") {
    openStandaloneHtml();
    return;
  }
  if (params.get("preview") === "on") {
    showPreviewAndFocus(1);
  } else {
    speak(I18N.t("msg.urlLoaded"), fileStatusEl);
  }
}

// --- Автодополнения Монако ---------------------------------------------------
//
// Два режима: авто (на вводе символа, TriggerCharacter) и по Ctrl+Space
// (Invoke). Авто работает где ясно, что нужна подсказка:
//   - внутри математики: `$…$`/`\(…\)`/`$$…$$`/`\[…\]` — LaTeX,
//     `` `…` `` — AsciiMath; в ```latex/```tex — LaTeX, в ```asciimath — AsciiMath;
//   - в frontmatter — ключи (title, lang, …) при наборе букв;
//   - внутри ```chess — атрибуты доски, внутри ```desmos — выражения;
//   - после ``` — вставить блок целиком (chess-with-fen/pgn, desmos).
// Буквы вне этих мест авто-попап не открывают (пустой список → виджет скрыт).
// Контексты для автодополнений. Объявлены на уровне модуля, чтобы их могли
// использовать и completion-провайдер, и продолжение списков по Enter.
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

// Курсор внутри математики? Возвращает "tex" | "ascii" | null.
// Сканирует делимитеры вне ```-блоков: `$…$`, `$$…$$`, `\(…\)`, `\[…\]`,
// `` `…` ``. Внутри ```latex/```tex — tex, внутри ```asciimath — ascii.
function mathContext(model, pos) {
  const fenceRe = /^\s*```(\w*)\s*$/;
  let fence = null;
  const stack = [];
  const cur = pos.lineNumber;
  const scan = (text) => {
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const top = stack[stack.length - 1];
      if (top === "tex") {
        if (ch === "\\" && (text[i + 1] === ")" || text[i + 1] === "]")) { stack.pop(); i++; continue; }
        if (ch === "\\" && text[i + 1] === "$") { i++; continue; }
        if (ch === "$" && text[i + 1] === "$") { stack.pop(); i++; continue; }
        if (ch === "$") { stack.pop(); continue; }
        continue;
      }
      if (ch === "`") {
        if (top === "ascii") stack.pop(); else stack.push("ascii");
        continue;
      }
      if (top === "ascii") continue;
      if (ch === "\\" && (text[i + 1] === "(" || text[i + 1] === "[")) { stack.push("tex"); i++; continue; }
      if (ch === "\\" && text[i + 1] === "$") { i++; continue; }
      if (ch === "$" && text[i + 1] === "$") { stack.push("tex"); i++; continue; }
      if (ch === "$") { stack.push("tex"); continue; }
    }
  };
  for (let l = 1; l <= cur; l++) {
    const line = model.getLineContent(l);
    const fm = fenceRe.exec(line);
    if (fm) {
      if (l === cur) return null;
      fence = fence ? null : (fm[1] || "fence");
      continue;
    }
    if (fence) {
      if (l === cur) {
        if (fence === "asciimath") return "ascii";
        if (fence === "latex" || fence === "tex") return "tex";
        return null;
      }
      continue;
    }
    scan(l === cur ? line.slice(0, pos.column - 1) : line);
    if (l === cur) break;
  }
  return stack.length ? stack[stack.length - 1] : null;
}

// Делимитеры, разметка markdown — только по Ctrl+Space.
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

  const FRONTMATTER = [
    { label: "title", detailKey: "sugg.title", docKey: "sugg.titleDoc", insertPrefix: "title: ", insertKey: "sugg.titleInsert" },
    { label: "lang", detailKey: "sugg.lang", docKey: "sugg.langDoc", insert: "lang: ${1|ru,en,de,tr|}" },
    { label: "mathjax", detailKey: "sugg.mathjax", docKey: "sugg.mathjaxDoc", insert: "mathjax: ${1|yes,no|}" },
    { label: "chessjax", detailKey: "sugg.chessjax", docKey: "sugg.chessjaxDoc", insert: "chessjax: ${1|yes,no|}" },
    { label: "desmos", detailKey: "sugg.desmos", docKey: "sugg.desmosDoc", insert: "desmos: ${1|yes,no|}" },
    { label: "author", detailKey: "sugg.author", insertPrefix: "author: ", insertKey: "sugg.authorInsert" },
    { label: "description", detailKey: "sugg.description", insertPrefix: "description: ", insertKey: "sugg.descriptionInsert" },
    { label: "css", detailKey: "sugg.css", docKey: "sugg.cssDoc", insert: "css: ${1:https://…/style.css}" },
    { label: "mathjax …", detailKey: "sugg.mathjaxNested", insert: "mathjax:\n  tex:\n    inlineMath: [[\"$\", \"$\"]]\n  options:\n    enableMenu: false" },
    { label: "desmos …", detailKey: "sugg.desmosNested", insert: "desmos:\n  expressions: true\n  border: false" },
    { label: "chess …", detailKey: "sugg.chessNested", insert: "chess:\n  lang: ru\n  tone: on" },
  ];

  // ```latex/```asciimath блоков в FENCE нет: showdown рендерит их как обычный
  // код, математикой они не становятся. Делимитеры LaTeX/AsciiMath — инлайновые.
  const FENCE = [
    { label: "chess with fen", detailKey: "sugg.fenDetail", docKey: "sugg.fenDoc", insert: "```chess\nfen=\"${1:rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1}\"\n```" },
    { label: "chess with pgn", detailKey: "sugg.pgnDetail", docKey: "sugg.pgnDoc", insert: "```chess\npgn=\"${1:https://…/partida.pgn}\"\n```" },
    { label: "desmos", detailKey: "sugg.desmosBlock", docKey: "sugg.desmosBlockDoc", insert: "```desmos\ny=${1:x^2}\n```" },
  ];

  // Заготовки, показываются только по Ctrl+Space (Invoke): делимитеры, блоки,
  // разметка. На каждый ввод символа они не выскакивают.
  const PROSE = [
    { label: "$…$", detailKey: "sugg.dollar", insertKey: "sugg.dollarInsert" },
    { label: "$$…$$", detailKey: "sugg.dollardd", insertKey: "sugg.dollarddInsert" },
    { label: "`…`", detailKey: "sugg.backtick", insert: "`${1:sqrt(x+1)}`" },
    { labelKey: "sugg.headingLabel", detailKey: "sugg.heading", insertKey: "sugg.headingInsert" },
    { labelKey: "sugg.linkLabel", detailKey: "sugg.link", insertKey: "sugg.linkInsert" },
    { labelKey: "sugg.boldLabel", detailKey: "sugg.bold", insertKey: "sugg.boldInsert" },
    { labelKey: "sugg.italicLabel", detailKey: "sugg.italic", insertKey: "sugg.italicInsert" },
  ];

  // Авто-дополнения LaTeX — только внутри математики.
  const TEX_MATH = [
    { label: "\\frac{}{}", detailKey: "sugg.tex.fraction", insertKey: "sugg.tex.fractionInsert" },
    { label: "\\sqrt{}", detailKey: "sugg.tex.sqrt", insert: "\\sqrt{${1:x}}" },
    { label: "\\sqrt[]{}", detailKey: "sugg.tex.sqrtn", insert: "\\sqrt[${1:n}]{${2:x}}" },
    { label: "\\sum_{}^{}", detailKey: "sugg.tex.sum", insert: "\\sum_{${1:i}=1}^{${2:n}} ${3:x_i}" },
    { label: "\\int_{}^{}", detailKey: "sugg.tex.integral", insert: "\\int_{${1:a}}^{${2:b}} ${3:f(x)}\\,dx" },
    { label: "\\lim_{}", detailKey: "sugg.tex.limit", insert: "\\lim_{${1:x \\to ${2:\\infty}}} ${3:f(x)}" },
    { label: "\\begin{pmatrix}", detailKey: "sugg.tex.pmatrix", insert: "\\begin{pmatrix}\n  ${1:a} & ${2:b} \\\\\n  ${3:c} & ${4:d}\n\\end{pmatrix}" },
    { label: "\\begin{aligned}", detailKey: "sugg.tex.aligned", insert: "\\begin{aligned}\n  ${1:y} &= ${2:x} \\\\\n  ${3:y} &= ${4:x^2}\n\\end{aligned}" },
    { label: "\\left( \\right)", detailKey: "sugg.tex.leftparen", insertKey: "sugg.tex.leftparenInsert" },
    { label: "\\left[ \\right]", detailKey: "sugg.tex.leftbracket", insertKey: "sugg.tex.leftbracketInsert" },
    { label: "\\left\\{ \\right\\}", detailKey: "sugg.tex.leftbrace", insertKey: "sugg.tex.leftbraceInsert" },
    { label: "\\left| \\right|", detailKey: "sugg.tex.leftpipe", insertKey: "sugg.tex.leftpipeInsert" },
    { label: "^{}", detailKey: "sugg.tex.sup", insertKey: "sugg.tex.supInsert" },
    { label: "_{}", detailKey: "sugg.tex.sub", insertKey: "sugg.tex.subInsert" },
    { label: "\\text{}", detailKey: "sugg.tex.text", insertKey: "sugg.tex.textInsert" },
    { label: "\\alpha", detailKey: "tool.alpha", insert: "\\alpha" },
    { label: "\\beta", detailKey: "tool.beta", insert: "\\beta" },
    { label: "\\gamma", detailKey: "sugg.tex.gamma", insert: "\\gamma" },
    { label: "\\delta", detailKey: "sugg.tex.delta", insert: "\\delta" },
    { label: "\\Delta", detailKey: "sugg.tex.Delta", insert: "\\Delta" },
    { label: "\\lambda", detailKey: "sugg.tex.lambda", insert: "\\lambda" },
    { label: "\\mu", detailKey: "sugg.tex.mu", insert: "\\mu" },
    { label: "\\sigma", detailKey: "sugg.tex.sigma", insert: "\\sigma" },
    { label: "\\theta", detailKey: "sugg.tex.theta", insert: "\\theta" },
    { label: "\\pi", detailKey: "sugg.tex.pi", insert: "\\pi" },
    { label: "\\phi", detailKey: "sugg.tex.phi", insert: "\\phi" },
    { label: "\\infty", detailKey: "tool.infty", insert: "\\infty" },
    { label: "\\cdot", detailKey: "sugg.tex.cdot", insert: "\\cdot" },
    { label: "\\times", detailKey: "sugg.tex.times", insert: "\\times" },
    { label: "\\pm", detailKey: "sugg.tex.pm", insert: "\\pm" },
    { label: "\\leq", detailKey: "sugg.tex.leq", insert: "\\leq" },
    { label: "\\geq", detailKey: "sugg.tex.geq", insert: "\\geq" },
    { label: "\\neq", detailKey: "sugg.tex.neq", insert: "\\neq" },
    { label: "\\approx", detailKey: "sugg.tex.approx", insert: "\\approx" },
    { label: "\\rightarrow", detailKey: "sugg.tex.rightarrow", insert: "\\rightarrow" },
    { label: "\\in", detailKey: "sugg.tex.in", insert: "\\in" },
    { label: "\\sin", detailKey: "sugg.tex.sin", insert: "\\sin ${1:x}" },
    { label: "\\cos", detailKey: "sugg.tex.cos", insert: "\\cos ${1:x}" },
    { label: "\\tan", detailKey: "sugg.tex.tan", insert: "\\tan ${1:x}" },
    { label: "\\log", detailKey: "sugg.tex.log", insert: "\\log_{${1:10}} ${2:x}" },
    { label: "\\ln", detailKey: "sugg.tex.ln", insert: "\\ln ${1:x}" },
    { label: "\\vec{}", detailKey: "sugg.tex.vec", insert: "\\vec{${1:v}}" },
    { label: "\\hat{}", detailKey: "sugg.tex.hat", insert: "\\hat{${1:x}}" },
    { label: "\\binom{}{}", detailKey: "sugg.tex.binom", insert: "\\binom{${1:n}}{${2:k}}" },
  ];

  // Авто-дополнения AsciiMath — только внутри математики (бэктик, asciimath-фенс).
  const ASCII_MATH = [
    { label: "frac", detailKey: "sugg.ascii.fraction", insert: "(${1:a})/(${2:b})" },
    { label: "sqrt", detailKey: "sugg.ascii.sqrt", insert: "sqrt(${1:x})" },
    { label: "root", detailKey: "sugg.ascii.root", insert: "root(${1:n})(${2:x})" },
    { label: "sum", detailKey: "sugg.ascii.sum", insert: "sum_(${1:i}=1)^(${2:n}) ${3:x_i}" },
    { label: "int", detailKey: "sugg.ascii.int", insert: "int_(${1:a})^(${2:b}) ${3:f(x)} dx" },
    { label: "lim", detailKey: "sugg.ascii.lim", insert: "lim_(${1:x -> oo}) ${2:f(x)}" },
    { label: "x^2", detailKey: "sugg.ascii.power", insert: "${1:x}^(${2:2})" },
    { label: "x_n", detailKey: "sugg.ascii.index", insert: "${1:x}_(${2:n})" },
    { label: "abs", detailKey: "sugg.ascii.abs", insert: "abs(${1:x})" },
    { label: "alpha", detailKey: "sugg.ascii.alpha", insert: "alpha" },
    { label: "beta", detailKey: "sugg.ascii.beta", insert: "beta" },
    { label: "gamma", detailKey: "sugg.ascii.gamma", insert: "gamma" },
    { label: "delta", detailKey: "sugg.ascii.delta", insert: "delta" },
    { label: "Delta", detailKey: "sugg.ascii.Delta", insert: "Delta" },
    { label: "lambda", detailKey: "sugg.ascii.lambda", insert: "lambda" },
    { label: "mu", detailKey: "sugg.ascii.mu", insert: "mu" },
    { label: "sigma", detailKey: "sugg.ascii.sigma", insert: "sigma" },
    { label: "theta", detailKey: "sugg.ascii.theta", insert: "theta" },
    { label: "pi", detailKey: "sugg.ascii.pi", insert: "pi" },
    { label: "phi", detailKey: "sugg.ascii.phi", insert: "phi" },
    { label: "oo", detailKey: "sugg.ascii.oo", insert: "oo" },
    { label: "->", detailKey: "sugg.ascii.arrow", insert: "->" },
    { label: ">=", detailKey: "sugg.ascii.ge", insert: ">=" },
    { label: "<=", detailKey: "sugg.ascii.le", insert: "<=" },
    { label: "!=", detailKey: "sugg.ascii.ne", insert: "!=" },
    { label: "~~", detailKey: "sugg.ascii.approx", insert: "~~" },
    { label: "+-", detailKey: "sugg.ascii.pm", insert: "+-" },
    { label: "cdot", detailKey: "sugg.ascii.cdot", insert: "cdot" },
    { label: "sin", detailKey: "sugg.ascii.sin", insert: "sin ${1:x}" },
    { label: "cos", detailKey: "sugg.ascii.cos", insert: "cos ${1:x}" },
    { label: "tan", detailKey: "sugg.ascii.tan", insert: "tan ${1:x}" },
    { label: "log", detailKey: "sugg.ascii.log", insert: "log_(${1:10}) ${2:x}" },
    { label: "ln", detailKey: "sugg.ascii.ln", insert: "ln ${1:x}" },
    { label: "vec", detailKey: "sugg.ascii.vec", insert: "vec(${1:v})" },
    { label: "hat", detailKey: "sugg.ascii.hat", insert: "hat(${1:x})" },
  ];

  const CHESS_ATTR = [
    { label: "fen", detailKey: "sugg.attr.fen", insert: "fen=\"${1}\"" },
    { label: "pgn", detailKey: "sugg.attr.pgn", docKey: "sugg.attr.pgnDoc", insert: "pgn=\"${1:https://…/part.pgn}\"" },
    { label: "move", detailKey: "sugg.attr.move", insert: "move=\"${1:1}\"" },
    { label: "lang", detailKey: "sugg.attr.lang", insert: "lang=\"${1|ru,en,de,tr|}\"" },
    { label: "controls", detailKey: "sugg.attr.controls", insert: "controls=\"${1|on,off|}\"" },
    { label: "tone", detailKey: "sugg.attr.tone", insert: "tone=\"${1|on,off|}\"" },
    { label: "sound", detailKey: "sugg.attr.sound", insert: "sound=\"${1|on,off|}\"" },
    { label: "id", detailKey: "sugg.attr.id", insert: "id=\"${1:board}\"" },
  ];

  // Авто-вставка заменяет слово, которое только что набрали («y», «si») — поэтому
  // вставка это правая часть выражения; Desmos понимает и голое «x^2» (y1 = x^2),
  // и «\sin(x)». Иначе из «y = si» получилось бы «y = y = \sin(x)».
  const DESMOS = [
    { label: "y = x^2", detailKey: "sugg.desmosExpr.parabola", insert: "${1:x}^2" },
    { label: "y = sin(x)", detailKey: "sugg.desmosExpr.sin", insert: "\\sin(${1:x})" },
    { label: "y = cos(x)", detailKey: "sugg.desmosExpr.cos", insert: "\\cos(${1:x})" },
    { label: "y = tan(x)", detailKey: "sugg.desmosExpr.tan", insert: "\\tan(${1:x})" },
    { label: "y = sqrt(x)", detailKey: "sugg.desmosExpr.sqrt", insert: "\\sqrt{${1:x}}" },
    { label: "y = log(x)", detailKey: "sugg.desmosExpr.log", insert: "\\log_{${1:10}}(${2:x})" },
    { label: "y = |x|", detailKey: "sugg.desmosExpr.abs", insert: "\\left|${1:x}\\right|" },
  ];

  const toItems = (list) =>
    list.map((s) => {
      const insert = s.insert != null ? s.insert : (s.insertPrefix || "") + I18N.t(s.insertKey);
      return {
        label: s.labelKey ? I18N.t(s.labelKey) : s.label,
        kind: KM.Snippet,
        detail: I18N.t(s.detailKey),
        documentation: s.docKey ? I18N.t(s.docKey) : undefined,
        insertText: insert,
        insertTextRules: RULES.InsertAsSnippet,
      };
    });

  // Ручной Ctrl+Space от авто-подсказок quickSuggestions отличить в провайдере
  // нельзя: оба приходят с triggerKind=Invoke. Отличаем по клавиатуре: нажатие
  // Ctrl+Space ставит флаг, любая другая клавиша его снимает. По флагу решаем,
  // показывать ли заготовки (делимитеры/блоки/разметку) в обычном тексте.
  let manualSuggest = false;
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && (e.code === "Space" || e.key === " ")) manualSuggest = true;
    else manualSuggest = false;
  }, true);

  monaco.languages.registerCompletionItemProvider("markdown", {
    triggerCharacters: ["$", "`", "\\"],
    provideCompletionItems(model, position, context) {
      const manual = !!context && context.triggerKind === monaco.languages.CompletionTriggerKind.Invoke && manualSuggest;
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

      // ``` или ```che — курсор на строке-открывашке блока → вставить блок
      // целиком. Диапазон покрывает бэктики (и слово после них), чтобы вставка
      // заменила их, а не добавилась после.
      const lineUpTo = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
      const fenceOpen = /^\s*`{3,}(\w*)$/.exec(lineUpTo);
      if (fenceOpen) {
        const fenceRange = {
          startLineNumber: position.lineNumber,
          startColumn: lineUpTo.indexOf("`") + 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        };
        // Monaco фильтрует саджесты по тексту, который покрывает range («```» или
        // «```ch»), а не по набранному слову. Без filterText все блоки отсеиваются:
        // «chess with fen» не фаззи-матчится с бэктиками. Подкладываем ровно тот
        // текст, что покрывает диапазон, — точное совпадение, блоки видны всегда.
        const fenceText = lineUpTo.slice(lineUpTo.indexOf("`"));
        return { suggestions: toItems(FENCE).map((s) => ({ ...s, range: fenceRange, filterText: fenceText })) };
      }

      // Внутри математики — команды по-любому; markdown-заготовки (PROSE) тут
      // не нужны: разделители/заголовок/жирный внутри формулы бессмысленны.
      const math = mathContext(model, position);
      if (math === "tex") {
        return { suggestions: withRange(TEX_MATH) };
      }
      if (math === "ascii") {
        return { suggestions: withRange(ASCII_MATH) };
      }
      // Ключи frontmatter — и при наборе букв, и по Ctrl+Space.
      if (inFrontmatter(model, position)) return { suggestions: withRange(FRONTMATTER) };

      // Атрибуты/выражения внутри блоков — при наборе букв и по Ctrl+Space.
      // markdown-разметка в блоках не предлагается (это не проза).
      const fence = fenceContext(model, position);
      if (fence === "chess") {
        return { suggestions: withRange(CHESS_ATTR) };
      }
      if (fence === "desmos") {
        // Целые выражения, а не LaTeX-фрагменты: \sin из TEX_MATH обгонял
        // «y = sin(x)» при фильтре по «sin» и вставлял не то.
        return { suggestions: withRange(DESMOS) };
      }
      if (fence === "latex" || fence === "tex") return { suggestions: withRange(TEX_MATH) };
      if (fence === "asciimath") return { suggestions: withRange(ASCII_MATH) };
      if (fence) return { suggestions: [] };

      // Вне математики, frontmatter и блоков авто-ввод не открывает попап.
      if (!manual) return { suggestions: [] };
      return { suggestions: withRange(FENCE.concat(PROSE)) };
    },
  });
}

// Сигнатурные подсказки — как signal help в VS Code: после открывающей скобки
// показывается команда с именами аргументов (числитель, знаменатель, пределы…),
// чтобы писать LaTeX/AsciiMath, не зная языка. Каждая часть — [префикс, скобка,
// i18n-ключ имени]; скобка { или ( и есть автозакрывающаяся пара оператора.
const SIG_PARTS = {
  // LaTeX: \frac{}{}, \int_{}^{}, x^{}, …
  "\\frac": [["", "{", "sig.fracNum"], ["", "{", "sig.fracDen"]],
  "\\sqrt": [["", "{", "sig.sqrtArg"]],
  "\\int": [["_", "{", "sig.intLo"], ["^", "{", "sig.intHi"]],
  "\\sum": [["_", "{", "sig.sumLo"], ["^", "{", "sig.sumHi"]],
  "\\prod": [["_", "{", "sig.sumLo"], ["^", "{", "sig.sumHi"]],
  "\\lim": [["_", "{", "sig.limUnder"]],
  "\\binom": [["", "{", "sig.binomTop"], ["", "{", "sig.binomBottom"]],
  "\\text": [["", "{", "sig.text"]],
  "\\vec": [["", "{", "sig.vec"]],
  "\\hat": [["", "{", "sig.hat"]],
  "\\log": [["_", "{", "sig.logBase"], ["", "(", "sig.logArg"]],
  "\\sin": [["", "(", "sig.arg"]],
  "\\cos": [["", "(", "sig.arg"]],
  "\\tan": [["", "(", "sig.arg"]],
  "\\ln": [["", "(", "sig.arg"]],
  "^": [["", "{", "sig.sup"]],
  "_": [["", "{", "sig.sub"]],
  // AsciiMath: frac()/(), sqrt(), sum_()^(), …
  "frac": [["", "(", "sig.fracNum"], ["/", "(", "sig.fracDen"]],
  "sqrt": [["", "(", "sig.sqrtArg"]],
  "root": [["", "(", "sig.rootN"], ["", "(", "sig.rootArg"]],
  "sum": [["_", "(", "sig.sumLo"], ["^", "(", "sig.sumHi"]],
  "int": [["_", "(", "sig.intLo"], ["^", "(", "sig.intHi"]],
  "lim": [["_", "(", "sig.limUnder"]],
  "abs": [["", "(", "sig.arg"]],
  "log": [["_", "(", "sig.logBase"], ["", "(", "sig.logArg"]],
  "sin": [["", "(", "sig.arg"]],
  "cos": [["", "(", "sig.arg"]],
  "tan": [["", "(", "sig.arg"]],
  "vec": [["", "(", "sig.vec"]],
  "hat": [["", "(", "sig.hat"]],
};

// Сигнатуры для fenced-блоков, атрибутов chess и ключей frontmatter. Параметр —
// [префикс, i18n-ключ имени, i18n-ключ описания]; имя в label (диапазон) — то,
// что пользователь должен заполнить.
const SIG_ATTR = {
  fen: { doc: "sugg.attr.fen" },
  pgn: { doc: "sugg.attr.pgnDoc" },
  move: { doc: "sugg.attr.move" },
  lang: { doc: "sugg.attr.lang" },
  controls: { doc: "sugg.attr.controls" },
  tone: { doc: "sugg.attr.tone" },
  sound: { doc: "sugg.attr.sound" },
  id: { doc: "sugg.attr.id" },
};

const SIG_BLOCK = {
  chess: {
    label: "```chess ",
    doc: "sig.blockChess",
    parts: [
      ['fen="', "sig.value", "sugg.attr.fen"],
      [' pgn="', "sig.value", "sugg.attr.pgnDoc"],
      [' move="', "sig.value", "sugg.attr.move"],
      [' lang="', "sig.value", "sugg.attr.lang"],
      [' controls="', "sig.value", "sugg.attr.controls"],
      [' tone="', "sig.value", "sugg.attr.tone"],
      [' sound="', "sig.value", "sugg.attr.sound"],
      [' id="', "sig.value", "sugg.attr.id"],
    ],
  },
  desmos: { label: "```desmos ", doc: "sig.blockDesmos", parts: [["y=", "sig.expr", "sugg.desmosBlockDoc"]] },
  latex: { label: "```latex ", doc: "sig.blockLatex", parts: [["", "sig.formula", "sig.blockLatex"]] },
  tex: { label: "```tex ", doc: "sig.blockLatex", parts: [["", "sig.formula", "sig.blockLatex"]] },
  asciimath: { label: "```asciimath ", doc: "sig.blockAscii", parts: [["", "sig.formula", "sig.blockAscii"]] },
};

const SIG_FM = {
  title: { doc: "sugg.titleDoc" },
  lang: { doc: "sugg.langDoc" },
  mathjax: { doc: "sugg.mathjaxDoc" },
  chessjax: { doc: "sugg.chessjaxDoc" },
  desmos: { doc: "sugg.desmosDoc" },
  author: { doc: "sugg.author" },
  description: { doc: "sugg.description" },
  css: { doc: "sugg.css" },
};

// Собрать сигнатуру из частей: label склеивается из префиксов и имён, диапазон
// каждого параметра — позиция имени в label.
function buildSig(label, parts) {
  let l = label;
  const pl = [];
  for (const [pre, nameKey, docKey] of parts) {
    const name = I18N.t(nameKey);
    l += pre + name;
    const start = l.length - name.length;
    pl.push([start, start + name.length]);
  }
  return {
    label: l,
    parameters: parts.map((p, i) => ({ label: pl[i], documentation: I18N.t(p[2]) })),
  };
}

function sigResult(sig, activeParam) {
  return { value: { signatures: [sig], activeSignature: 0, activeParameter: activeParam }, dispose: () => {} };
}

// Определить команду под курсором и уже набранный хвост аргументов.
function findSigCommand(math, lineText) {
  if (math === "tex") {
    // Последняя команда \… + весь хвост без «\» (несколько {…} уже могли быть).
    const m = /(\\[a-zA-Z]+)([^\\]*)$/.exec(lineText);
    if (m && SIG_PARTS[m[1]]) return { command: m[1], brace: "{", rest: m[2] };
    // Степень/индекс без команды: x^{ , x_{  (если выше нет \command — иначе
    // \int_{a}^{ принадлежит интегралу, а не степени).
    if (/\^\{$/.test(lineText)) return { command: "^", brace: "{", rest: "{" };
    if (/_\{$/.test(lineText)) return { command: "_", brace: "{", rest: "{" };
    return null;
  }
  // AsciiMath: последняя функция, перед последней незакрытой «(»; внутри уже
  // закрытые аргументы (root(n)(x, sum_(i=1)^(n) — это ок).
  const m = /([a-zA-Z]+)(?:\([^()]*\)[^(]*)*\(([^()]*)$/.exec(lineText);
  if (m && SIG_PARTS[m[1]]) {
    const rest = lineText.slice(m.index + m[1].length);
    return { command: m[1], brace: "(", rest };
  }
  return null;
}

function registerSignatureHelp() {
  monaco.languages.registerSignatureHelpProvider("markdown", {
    signatureHelpTriggerCharacters: ["{", "(", ",", "^", "_", '"', "`", ":", " ", "="],
    signatureHelpRetriggerCharacters: ["{", "(", ",", '"', "="],
    provideSignatureHelp(model, position) {
      const math = mathContext(model, position);
      const lineText = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
      // LaTeX/AsciiMath: команды с именами аргументов (v34).
      if (math === "tex" || math === "ascii") {
        const found = findSigCommand(math, lineText);
        if (!found) return null;
        const parts = SIG_PARTS[found.command];
        // Сколько частей уже пройдено: число закрытых скобок в хвосте от команды.
        const closer = found.brace === "{" ? "}" : ")";
        const closeCount = (found.rest.match(new RegExp("\\" + closer, "g")) || []).length;
        let label = found.command;
        const paramLabels = [];
        for (const [pre, brace, key] of parts) {
          const name = I18N.t(key);
          const close = brace === "{" ? "}" : ")";
          label += pre + brace + name + close;
          const start = label.length - close.length - name.length;
          paramLabels.push([start, start + name.length]);
        }
        return {
          value: {
            signatures: [
              {
                label,
                parameters: parts.map((p, i) => ({ label: paramLabels[i], documentation: I18N.t(p[2]) })),
              },
            ],
            activeSignature: 0,
            activeParameter: Math.max(0, Math.min(closeCount, parts.length - 1)),
          },
          dispose: () => {},
        };
      }
      if (math !== null) return null;

      // 1. Строка-открывашка fenced-блока: ```chess , ```desmos , ```latex …
      const bm = /^\s*`{3,}(\w*)\s*$/.exec(lineText);
      if (bm) {
        const lang = bm[1].toLowerCase();
        if (!lang) return null;
        const block = Object.keys(SIG_BLOCK).find((k) => k === lang || k.startsWith(lang) || lang.startsWith(k));
        if (!block) return null;
        const sig = buildSig(SIG_BLOCK[block].label, SIG_BLOCK[block].parts);
        sig.documentation = I18N.t(SIG_BLOCK[block].doc);
        return sigResult(sig, 0);
      }

      // 2. Ключ frontmatter: title: , lang: …
      if (inFrontmatter(model, position)) {
        const km = /([A-Za-z0-9_-]+):\s*$/.exec(lineText);
        if (km && SIG_FM[km[1]]) {
          return sigResult(buildSig(km[1] + ": ", [["", "sig.value", SIG_FM[km[1]].doc]]), 0);
        }
        return null;
      }

      // 3. Атрибут chess внутри блока: fen=" , move=" …
      const fence = fenceContext(model, position);
      if (fence === "chess") {
        const am = /([\w-]+)\s*=\s*"?$/.exec(lineText);
        if (am && SIG_ATTR[am[1]]) {
          return sigResult(buildSig(am[1] + '="', [["", "sig.value", SIG_ATTR[am[1]].doc]]), 0);
        }
        return null;
      }
      return null;
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
    // Авто-попап на наборе букв: quickSuggestions запускает провайдер при вводе
    // слова, а тот сам решает, где вернуть список (математика, frontmatter,
    // блоки), а где пусто (обычный текст — пусто на авто = виджет не открыт).
    quickSuggestions: true,
    // Словесные подсказки из документа глобально не нужны: в обычном тексте они
    // открыли бы попап на каждую букву, что и чиним.
    wordBasedSuggestions: "off",
    // Автозакрытие скобок — как в VS Code: \frac{ → \frac{} с курсором внутри,
    // чтобы сигнатурная подсказка (registerSignatureHelp) подхватила аргумент.
    autoClosingBrackets: "always",
    ariaLabel: I18N.t("editor.ariaLabel"),
  });

  registerMarkdownCompletions();
  registerSignatureHelp();
  buildToolbar();

  // Живой предпросмотр: формулы обновляются по мере набора (с дебаунсом).
  editor.onDidChangeModelContent(() => scheduleLivePreview());

  // «---» в начале пустого документа → автоподстановка frontmatter: вставить
  // блок с ключами и закрывающим «---». Только если строка 1 целиком «---» и
  // документ пуст кроме неё — иначе «---» это горизонтальная черта в markdown.
  let expandingFrontmatter = false;
  editor.onDidChangeModelContent(() => {
    if (expandingFrontmatter) return;
    const model = editor.getModel();
    if (!model) return;
    if (model.getLineContent(1) !== "---") return;
    if (model.getValue().trim() !== "---") return;
    const pos = editor.getPosition();
    if (!pos || pos.lineNumber !== 1 || pos.column !== 4) return;
    expandingFrontmatter = true;
    const fmTemplate = "---\ntitle: \nlang: " + I18N.getLang() + "\nmathjax: yes\nchessjax: no\ndesmos: no\n---";
    editor.executeEdits("frontmatter", [{ range: new monaco.Range(1, 1, 1, 4), text: fmTemplate }]);
    editor.setPosition({ lineNumber: 2, column: 8 });
    expandingFrontmatter = false;
    speak(I18N.t("msg.frontmatterExpanded"), fileStatusEl);
  });

  // Продолжение списков markdown как в VS Code: Enter на строке «- item»,
  // «1. item» или «> цитата» переносит на новую строку с маркером (у числовых —
  // со следующим номером, отступ сохраняется). На пустой списочной строке Enter
  // просто выходит из списка. Внутри математики, frontmatter и fenced-блоков
  // не применяем. Открытый саджест: Enter принимает выбор — не трогаем.
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Enter" || e.code !== "Enter") return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (document.querySelector(".suggest-widget.visible")) return;
      const model = editor.getModel();
      if (!model) return;
      const pos = editor.getPosition();
      if (!pos) return;
      if (mathContext(model, pos) || inFrontmatter(model, pos) || fenceContext(model, pos)) return;
      const line = model.getLineContent(pos.lineNumber);
      // Только курсор в конце строки; иначе стандартный перенос.
      if (pos.column !== line.length + 1) return;
      const m =
        /^(\s*)((?:[-+*]|\d+[.)]))(\s+)(.*)$/.exec(line) ||
        /^(\s*)(>)(\s+)(.*)$/.exec(line);
      if (!m) return;
      const indent = m[1];
      let marker = m[2];
      const rest = m[4];
      // Пустая строка после маркера («- ») — выходим из списка обычным переносом.
      if (!rest.trim()) return;
      if (/^\d+/.test(marker)) marker = String(parseInt(marker, 10) + 1) + marker.replace(/^\d+/, "");
      e.preventDefault();
      e.stopImmediatePropagation();
      const cont = indent + marker + " ";
      editor.executeEdits("enter-list", [
        { range: new monaco.Range(pos.lineNumber, line.length + 1, pos.lineNumber, line.length + 1), text: "\n" + cont },
      ]);
      editor.setPosition({ lineNumber: pos.lineNumber + 1, column: cont.length + 1 });
    },
    true,
  );

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
        speak(I18N.t("msg.previewHidden"));
        return;
      }
      // Alt+M — режим формулы (строка/блок), Alt+L — синтаксис (LaTeX/AsciiMath),
      // Alt+1..Alt+= — вставка сниппетов в текущем синтаксисе.
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        if (e.code === "KeyM") {
          e.preventDefault();
          e.stopImmediatePropagation();
          formulaMode = formulaMode === "inline" ? "multiline" : "inline";
          speak(I18N.t("msg.formulaMode", { mode: I18N.t(formulaMode === "inline" ? "msg.modeInline" : "msg.modeBlock") }));
          return;
        }
        if (e.code === "KeyL") {
          e.preventDefault();
          e.stopImmediatePropagation();
          syntax = syntax === "latex" ? "asciimath" : "latex";
          speak(I18N.t("msg.syntaxMode", { syntax: I18N.t(syntax === "latex" ? "msg.syntaxLatex" : "msg.syntaxAscii") }));
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
  // Смена языка интерфейса: пересобрать тулбар и aria-метку редактора на новом
  // языке. Тексты предпросмотра и демо остаются на языке документа — это md.
  const langSelect = document.getElementById("lang-select");
  langSelect.addEventListener("change", () => changeUiLang(langSelect.value));
  document.getElementById("open-input").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      editor.setValue(String(reader.result));
      showPreviewAndFocus(1);
      speak(I18N.t("msg.fileOpened", { name: file.name }), fileStatusEl);
    };
    reader.readAsText(file, "utf-8");
    event.target.value = "";
  });

  // Справка: модальный диалог (native <dialog>), Esc закрывает сам.
  const helpDialog = document.getElementById("help-dialog");
  const helpClose = document.getElementById("help-close");
  document.getElementById("btn-help").addEventListener("click", () => {
    if (!helpDialog.open) {
      helpDialog.showModal();
      speak(I18N.t("msg.helpOpen"), fileStatusEl);
    }
  });
  helpClose.addEventListener("click", () => helpDialog.close());
  helpDialog.addEventListener("close", () => {
    document.getElementById("btn-help").focus();
    speak(I18N.t("msg.helpClosed"), fileStatusEl);
  });

  // Команды в command palette (Ctrl+Shift+P) и контекстное меню. Повседневные
  // действия — только в палитру; вставка формул и структур — в контекстное меню.
  const FORMULA_ITEM = TOOLBAR_GROUPS.flatMap((g) => g.items).find((i) => i.labelKey === "tool.formula");
  let actionDisposables = [];
  function registerEditorActions() {
    actionDisposables.forEach((d) => d.dispose());
    actionDisposables = [];
    const insertItem = (item) => {
      const inserted = insertSnippet(item);
      if (inserted !== null) speakInserted(item, inserted);
    };
    const add = (desc) => actionDisposables.push(editor.addAction(desc));
    add({ id: "mathmd.preview", label: I18N.t("cmd.preview"), run: () => showPreviewAndFocus(editor.getPosition().lineNumber) });
    add({ id: "mathmd.previewHide", label: I18N.t("cmd.previewHide"), run: () => { previewSection.hidden = true; speak(I18N.t("msg.previewHidden"), fileStatusEl); } });
    add({ id: "mathmd.desmosRerender", label: I18N.t("cmd.desmosRerender"), run: () => { previewSection.hidden = false; renderPreview(); } });
    add({ id: "mathmd.frontmatter", label: I18N.t("cmd.frontmatter"), run: insertFrontmatterCmd });
    add({ id: "mathmd.saveMd", label: I18N.t("cmd.saveMd"), run: saveMd });
    add({ id: "mathmd.exportHtml", label: I18N.t("cmd.exportHtml"), run: exportHtml });
    add({ id: "mathmd.help", label: I18N.t("cmd.help"), run: openHelpCmd });
    add({ id: "mathmd.langNext", label: I18N.t("cmd.langNext"), run: () => {
      const langs = ["ru", "en", "de", "tr"];
      const cur = I18N.getLang();
      changeUiLang(langs[(langs.indexOf(cur) + 1) % langs.length]);
    } });
    add({ id: "mathmd.formulaInline", label: I18N.t("cmd.formulaInline"), contextMenuGroupId: "mathmd/formula", contextMenuOrder: 1, run: () => { formulaMode = "inline"; insertItem(FORMULA_ITEM); } });
    add({ id: "mathmd.formulaBlock", label: I18N.t("cmd.formulaBlock"), contextMenuGroupId: "mathmd/formula", contextMenuOrder: 2, run: () => { formulaMode = "multiline"; insertItem(FORMULA_ITEM); } });
    add({ id: "mathmd.syntaxToggle", label: I18N.t("cmd.syntaxToggle"), contextMenuGroupId: "mathmd/formula", contextMenuOrder: 3, run: () => { syntax = syntax === "latex" ? "asciimath" : "latex"; speak(I18N.t("msg.syntaxMode", { syntax: I18N.t(syntax === "latex" ? "msg.syntaxLatex" : "msg.syntaxAscii") }), fileStatusEl); } });
    add({ id: "mathmd.formulaModeToggle", label: I18N.t("cmd.formulaModeToggle"), contextMenuGroupId: "mathmd/formula", contextMenuOrder: 4, run: () => { formulaMode = formulaMode === "inline" ? "multiline" : "inline"; speak(I18N.t("msg.formulaMode", { mode: I18N.t(formulaMode === "inline" ? "msg.modeInline" : "msg.modeBlock") }), fileStatusEl); } });
    TOOLBAR_GROUPS.flatMap((g) => g.items).filter((i) => i !== FORMULA_ITEM).forEach((item, i) => {
      add({ id: "mathmd.insert." + item.labelKey, label: I18N.t(item.labelKey), contextMenuGroupId: "mathmd/insert", contextMenuOrder: i, run: () => insertItem(item) });
    });
  }
  function changeUiLang(lang) {
    I18N.setLang(lang);
    toolbarEl.replaceChildren();
    buildToolbar();
    editor.updateOptions({ ariaLabel: I18N.t("editor.ariaLabel") });
    registerEditorActions();
    speak(I18N.t("msg.langChanged", { lang: I18N.langName(lang) }), fileStatusEl);
    editor.focus();
  }
  function insertFrontmatterCmd() {
    const model = editor.getModel();
    if (!model) return;
    if (model.getLineContent(1).trim() === "---") {
      editor.setPosition({ lineNumber: 2, column: 1 });
      editor.revealLine(2);
      speak(I18N.t("msg.frontmatterExpanded"), fileStatusEl);
      editor.focus();
      return;
    }
    const fm = "---\ntitle: \nlang: " + I18N.getLang() + "\nmathjax: yes\nchessjax: no\ndesmos: no\n---\n\n";
    editor.executeEdits("mathmd-frontmatter", [{ range: new monaco.Range(1, 1, 1, 1), text: fm }]);
    editor.setPosition({ lineNumber: 2, column: 8 });
    speak(I18N.t("msg.frontmatterExpanded"), fileStatusEl);
    editor.focus();
  }
  function openHelpCmd() {
    const dlg = document.getElementById("help-dialog");
    if (dlg && !dlg.open) {
      dlg.showModal();
      speak(I18N.t("msg.helpOpen"), fileStatusEl);
    }
  }
  registerEditorActions();

  speak(I18N.t("msg.editorReady"));

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.warn("[mathmd] service worker:", err);
    });
  }

  // URL-параметры должны сработать уже после инициализации редактора.
  loadFromUrl();
});
