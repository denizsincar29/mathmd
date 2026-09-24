// Математический редактор: Monaco + Markdown + MathJax 4 (LaTeX/AsciiMath) + Desmos.
//
// Рендер markdown с математикой и графиками, предпросмотр по Alt+ё на
// строке курсора, помощники вставки формул, доступность для скринридера.

// Шахматные доски: fenced-блок ```chess ... ``` рендерится в <chessjax-board>.
// Импорт с CDN (jsdelivr, GH-тег v0.6.1) по side-effect: регистрирует
// кастомный элемент и document-level делегат для кнопок <button chess="id" move="N">.
import "https://cdn.jsdelivr.net/gh/denizsincar29/chessjax@v0.8.7/chessjax.js";

const previewEl = document.getElementById("preview");
const previewStatusEl = document.getElementById("preview-status");
const previewSection = document.getElementById("preview-section");
const lintPanel = document.getElementById("lint-panel");
const lintList = document.getElementById("lint-list");
const fileStatusEl = document.getElementById("file-status");
const toolbarEl = document.getElementById("toolbar");

// --- Скринридерные объявления ----------------------------------------------

// Таймер — свой у каждого live-региона. Общий на всех означал бы, что
// объявление в один регион отменяет объявление в другой: например, пример
// открывается отдельным документом (статус файла) и сразу же перестраивается
// предпросмотр со своей строкой — второе объявление стирало первое.
const speakTimers = new WeakMap();
function speak(text, target) {
  const el = target || previewStatusEl;
  clearTimeout(speakTimers.get(el));
  // Чистим, чтобы одинаковый текст проговаривался повторно.
  el.textContent = "";
  speakTimers.set(el, setTimeout(() => {
    el.textContent = text;
  }, 60));
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
//   chessjax: no           # не грузить шахматный компонент (включается сам,
//   desmos: no             #  если в тексте есть блок ```chess / ```desmos)
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

// Код языка документа из frontmatter, если он из тех, что знает chessjax.
function docLangCode() {
  const v = fmState && typeof fmState.lang === "string" ? fmState.lang.trim().toLowerCase() : "";
  const code = v.slice(0, 2);
  return ["ru", "en", "de", "tr"].indexOf(code) !== -1 ? code : "";
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
  // Язык озвучки доски: атрибут блока → chess.lang из frontmatter → язык
  // документа (frontmatter lang). Так доска в немецком документе говорит
  // по-немецки и в предпросмотре, и в готовом HTML.
  if (!("lang" in merged)) {
    const docLang = docLangCode();
    if (docLang) merged.lang = docLang;
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

// Невидимость кнопки входа — инлайном, а не классом: те же стили нужны и в
// готовой странице, где подключён не весь style.css.
const DESMOS_ENTER_STYLE =
  "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap";

// Живой рендер (пока печатаешь) не грузит тяжёлый SDK Desmos на каждый тик —
// вместо графика показываем подсказку; график пересоздаётся по Alt+ё.
function desmosSlot(idx, live) {
  if (live) {
    return `<div class="desmos-placeholder" data-desmos-idx="${idx}">${I18N.t("msg.desmosLive")}</div>`;
  }
  // В готовом HTML массива desmosBlocks нет — тело графика кладём прямо в DOM
  // (encodeURIComponent), его разберёт init-скрипт документа.
  const body = desmosBlocks[idx] || "";
  // Кнопка входа перед графиком. График — чужой iframe: Tab внутрь не доводит,
  // стрелки его не трогают, и без такой кнопки незрячему в калькулятор не
  // попасть. Кнопка невидимая, но стоит в потоке фокуса: скринридер читает её
  // как «График Desmos — перейти к списку выражений, кнопка», а Enter (пробел)
  // переводит фокус внутрь, сразу в список выражений. Пока график не создан,
  // кнопка скрыта — обещать вход в то, чего нет, незачем.
  const enter =
    `<button type="button" class="desmos-enter" hidden style="${DESMOS_ENTER_STYLE}">` +
    `${escHtml(I18N.t("msg.desmosEnter"))}</button>`;
  return enter + `<div class="desmos" data-desmos-idx="${idx}" data-desmos-body="${encodeURIComponent(body)}"></div>`;
}

// Вход в график: штатный метод Desmos ставит фокус в список выражений; если
// версия API его не знает, фокусируем сам iframe — тогда до списка дойдёт Tab.
function enterDesmos(calc, el) {
  if (calc && typeof calc.focusFirstExpression === "function") {
    try {
      calc.focusFirstExpression();
      return;
    } catch (err) {
      console.warn("[mathmd] вход в график Desmos:", err);
    }
  }
  const frame = el.querySelector("iframe");
  if (frame) frame.focus();
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
      // График готов — открываем вход: кнопка перед графиком (см. desmosSlot).
      const enter = el.previousElementSibling;
      if (enter && enter.classList.contains("desmos-enter")) {
        enter.hidden = false;
        enter.addEventListener("click", () => enterDesmos(calc, el));
      }
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
    previewEl.innerHTML = withCopyButtons(html, I18N.t("ui.copyCode"));
    if (!live) initDesmosGraphs();
    await typesetMath();
  } catch (err) {
    console.error("[mathmd] рендер предпросмотра:", err);
  }
}

// Живой предпросмотр: при наборе рендер откладывается на 800 мс, чтобы
// каждое нажатие не грузило процессор (MathJax). Формулы обновляются сами;
// графики Desmos пересоздаются только по Alt+ё.
let liveTimer = null;
function scheduleLivePreview() {
  // В режиме ошибок предпросмотр скрыт — живой рендер только жёг бы процессор
  // впустую.
  if (previewSection.hidden || !lintPanel.hidden) return;
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

// --- Линтер документа --------------------------------------------------------
//
// Проверяем по тексту то, что иначе молчит: незакрытый блок кода или
// frontmatter, незакрытые делимитеры математики, непарные фигурные скобки в
// формулах, ошибки в шахматных блоках и кнопках-ходах, пустой график Desmos.
// Это не компилятор, а сетка на частые опечатки: пустой предпросмотр без
// объяснений хуже всего именно для незрячего — он не видит, что доска молча
// осталась из одной позиции.
//
// Найденное кладём маркерами Монако (`setModelMarkers`): редактор сам рисует
// волнистое подчёркивание и метки на полосе прокрутки. Переходы F8 / Shift+F8
// сделаны своими командами (goToLintError), а не штатным marker.next: только
// так объявление об ошибке гарантированно звучит под скринридером.

// Атрибуты, которые понимает <chessjax-board>: observedAttributes в chessjax.js
// (fen, pgn, move, lang, controls) плюс читаемые вручную pgn-src, sound, tone и
// штатный id. Всё остальное компонент молча игнорирует — в этом и беда: блок с
// `moves = 1. e4 e5` не жалуется, а показывает одну начальную позицию.
const CHESS_KEYS = ["id", "fen", "pgn", "pgn-src", "move", "lang", "controls", "sound", "tone"];

function lintText(err) {
  return I18N.t(err.key, err.vars || {});
}

function lintSignature(errors) {
  return errors.map((e) => e.line + ":" + e.key + ":" + JSON.stringify(e.vars || {})).join("|");
}

// Разбор одного fenced-блока: у шахматного проверяем атрибуты, у графика —
// что тело не пустое. Содержимое прочих блоков (код) не трогаем.
function lintFenceBlock(fence, errors, ctx) {
  if (fence.lang === "chess") {
    const attrs = new Map();
    for (const { line, text } of fence.body) {
      const re = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
      let m;
      while ((m = re.exec(text)) !== null) {
        const key = m[1];
        const value = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4];
        if (!attrs.has(key)) attrs.set(key, { value, line });
        if (!CHESS_KEYS.includes(key)) {
          errors.push({ line, key: key === "moves" ? "lint.chessMoves" : "lint.chessKey", vars: { key } });
        }
      }
      // FEN с пробелами обязан быть в кавычках. Без них парсер берёт только
      // первое поле, а «w KQkq - 0 1» остаётся мусором в теле блока.
      if (/(?:^|\s)fen\s*=\s*([^\s"']+)\s+(?![A-Za-z0-9_-]+\s*=)/.test(text)) {
        errors.push({ line, key: "lint.chessQuote" });
      }
    }
    ctx.count += 1;
    const idAttr = attrs.get("id");
    const id = idAttr ? idAttr.value : "chessjax-" + ctx.count;
    if (ctx.boards.has(id)) {
      errors.push({ line: idAttr ? idAttr.line : fence.line, key: "lint.chessDupId", vars: { id } });
    } else {
      ctx.boards.set(id, fence.line);
    }
    if (!attrs.has("fen") && !attrs.has("pgn") && !attrs.has("pgn-src")) {
      errors.push({ line: fence.line, key: "lint.chessNoPos" });
    }
  } else if (fence.lang === "desmos") {
    if (!fence.body.some((l) => l.text.trim())) errors.push({ line: fence.line, key: "lint.desmosEmpty" });
  }
}

// Делимитеры математики и скобки в формулах — по «маске» документа, где тело
// блоков кода заменено пустыми строками (внутри ``` может лежать что угодно,
// и ругаться на это нечестно). Номера строк в маске те же, что в документе.
function lintMath(lines, errors) {
  let open = null; // { delim, line, braces }
  const closeMath = (frag) => {
    if (frag.delim === "`") return; // в AsciiMath скобки круглые, фигурных нет
    if (frag.braces > 0) errors.push({ line: frag.line, key: "lint.braceOpen" });
    else if (frag.braces < 0) errors.push({ line: frag.line, key: "lint.braceClose" });
  };
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n];
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      const next = line[i + 1];
      if (c === "\\") {
        // \( \) \[ \] — тоже делимитеры математики (MathJax их понимает).
        if (next === "(" || next === "[") {
          if (!open) { open = { delim: "\\" + next, line: n + 1, braces: 0 }; i += 1; continue; }
        } else if (next === ")" || next === "]") {
          const want = "\\" + (next === ")" ? "(" : "[");
          if (open && open.delim === want) { closeMath(open); open = null; i += 1; continue; }
        }
        i += 1; // экранированный символ: \{ \} \$ \` в счёт не идут
        continue;
      }
      if (!open) {
        if (c === "$") {
          const two = next === "$";
          open = { delim: two ? "$$" : "$", line: n + 1, braces: 0 };
          if (two) i += 1;
        } else if (c === "`") {
          open = { delim: "`", line: n + 1, braces: 0 };
        }
        continue;
      }
      if (open.delim === "$" && c === "$") { closeMath(open); open = null; continue; }
      if (open.delim === "$$" && c === "$" && next === "$") { closeMath(open); open = null; i += 1; continue; }
      if (open.delim === "`" && c === "`") { open = null; continue; }
      if (open.delim !== "`") {
        if (c === "{") open.braces += 1;
        else if (c === "}") open.braces -= 1;
      }
    }
  }
  if (open) errors.push({ line: open.line, key: "lint.mathOpen", vars: { delim: open.delim } });
}

// Кнопки-ходы <button chess="id" move="N">: id должен указывать на доску из
// документа, move — быть целым числом в пределах партии. Вне партии проверяем
// только статику: длину партии знает сама доска, и то лишь когда предпросмотр
// уже отрисован (тогда её позиции лежат в boardPositions).
function lintStoryButtons(lines, errors, ctx, boardPositions) {
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n];
    if (line.indexOf("<button") === -1) continue;
    const tags = /<button\b([^>]*)>/gi;
    let tag;
    while ((tag = tags.exec(line)) !== null) {
      const attrs = {};
      const re = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
      let a;
      while ((a = re.exec(tag[1])) !== null) {
        attrs[a[1].toLowerCase()] = a[2] !== undefined ? a[2] : a[3] !== undefined ? a[3] : a[4];
      }
      if (!("chess" in attrs) && !("move" in attrs)) continue; // обычная кнопка
      const id = attrs.chess;
      if (id === undefined) { errors.push({ line: n + 1, key: "lint.btnNoBoard" }); continue; }
      if (!ctx.boards.has(id)) { errors.push({ line: n + 1, key: "lint.btnBoard", vars: { id } }); continue; }
      if (!("move" in attrs)) { errors.push({ line: n + 1, key: "lint.btnNoMove", vars: { id } }); continue; }
      if (!/^\d+$/.test(attrs.move)) {
        errors.push({ line: n + 1, key: "lint.btnMoveNum", vars: { move: attrs.move } });
        continue;
      }
      const total = boardPositions[id];
      if (total && Number(attrs.move) > total - 1) {
        errors.push({ line: n + 1, key: "lint.btnRange", vars: { move: attrs.move, max: total - 1 } });
      }
    }
  }
}

// Позиции уже отрисованных досок: id → сколько всего позиций в партии. Нужны
// для проверки «ход вне партии» — по тексту её не сделать, PGN грузится сетью.
function boardPositionsFromDom() {
  const out = {};
  if (typeof document === "undefined" || !previewEl) return out;
  for (const b of previewEl.querySelectorAll("chessjax-board")) {
    if (b.id && Array.isArray(b._positions)) out[b.id] = b._positions.length;
  }
  return out;
}

function lintDocument(md, boardPositions) {
  const errors = [];
  const raw = String(md).split("\n");
  const masked = [];
  const ctx = { boards: new Map(), count: 0 };

  // Frontmatter: открыт и не закрыт. Тогда parseFrontmatter отдаёт весь текст
  // как тело — метаданные молча становятся обычным абзацем с горизонтальной
  // линией, и в экспорт не попадут ни title, ни отключённые модули.
  let bodyStart = 0;
  if (raw.length && /^\s*---\s*$/.test(raw[0])) {
    let close = -1;
    for (let i = 1; i < raw.length; i++) {
      if (/^\s*---\s*$/.test(raw[i])) { close = i; break; }
    }
    if (close === -1) errors.push({ line: 1, key: "lint.fmOpen" });
    else bodyStart = close + 1;
  }

  let fence = null;
  for (let i = 0; i < raw.length; i++) {
    const line = raw[i];
    if (i < bodyStart) { masked.push(""); continue; }
    const isFence = /^\s*```/.test(line);
    if (!fence && isFence) {
      fence = { line: i + 1, lang: line.replace(/^\s*```/, "").trim().toLowerCase(), body: [] };
      masked.push("");
      continue;
    }
    if (fence) {
      masked.push("");
      if (isFence) {
        lintFenceBlock(fence, errors, ctx);
        fence = null;
      } else {
        fence.body.push({ line: i + 1, text: line });
      }
      continue;
    }
    masked.push(line);
  }
  if (fence) errors.push({ line: fence.line, key: "lint.fenceOpen" });

  lintMath(masked, errors);
  lintStoryButtons(masked, errors, ctx, boardPositions || {});
  errors.sort((a, b) => a.line - b.line);
  return errors;
}

// --- Ошибки в интерфейсе -----------------------------------------------------

let lintErrors = [];      // последний прогон — по нему курсор «бубупает» на строке
let lintState = null;     // { sig, index } — обход ошибок по Alt+ё
let lastBeepLine = 0;     // строка, на которой звук уже сыграл

// Звук ошибки — тот самый сигнал из VS Code (репозиторий microsoft/vscode,
// MIT; файл лежит рядом, в error.mp3).
let lintAudio = null;
function playErrorSound() {
  try {
    if (!lintAudio) {
      lintAudio = new Audio(new URL("error.mp3", import.meta.url).href);
      lintAudio.volume = 0.7;
    }
    lintAudio.currentTime = 0;
    const p = lintAudio.play();
    if (p && p.catch) p.catch(() => {});
  } catch (err) {
    // Звук — украшение: без него линтер работает.
  }
}

// Маркеры Монако: подчёркивание строки и метка на полосе прокрутки.
function applyLintMarkers(errors) {
  lintErrors = errors;
  if (!editor || typeof monaco === "undefined") return;
  const model = editor.getModel();
  if (!model) return;
  const lines = model.getValue().split("\n");
  monaco.editor.setModelMarkers(
    model,
    "mathmd-lint",
    errors.map((e) => ({
      severity: monaco.MarkerSeverity.Error,
      message: lintText(e),
      startLineNumber: e.line,
      startColumn: 1,
      endLineNumber: e.line,
      endColumn: (lines[e.line - 1] || "").length + 1,
    })),
  );
}

// Живой прогон по правке: маркеры должны стоять до того, как пользователь
// вспомнит про Alt+ё, иначе F8 переходить некуда.
let liveLintTimer = null;
function scheduleLiveLint() {
  clearTimeout(liveLintTimer);
  liveLintTimer = setTimeout(() => {
    if (!editor) return;
    applyLintMarkers(lintDocument(editor.getValue(), boardPositionsFromDom()));
  }, 600);
}

function runLint() {
  const errors = lintDocument(editor.getValue(), boardPositionsFromDom());
  applyLintMarkers(errors);
  return errors;
}

function lintItemLabel(err, i, n) {
  return I18N.t("msg.lintItem", { i: i + 1, n, line: err.line, text: lintText(err) });
}

function renderLintPanel(errors, index) {
  lintList.replaceChildren(
    ...errors.map((err, i) => {
      const li = document.createElement("li");
      if (i === index) li.setAttribute("aria-current", "true");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = lintItemLabel(err, i, errors.length);
      btn.addEventListener("click", () => showLintError(errors, i));
      li.appendChild(btn);
      return li;
    }),
  );
}

// Показать ошибку вместо предпросмотра: панель со списком, курсор редактора на
// строке ошибки, звук и объявление. Список остаётся на экране — он же и
// «Problems» для зрячего, и точка возврата мышью.
function showLintError(errors, index) {
  const err = errors[index];
  previewSection.hidden = false;
  previewEl.hidden = true;
  lintPanel.hidden = false;
  renderLintPanel(errors, index);
  lastBeepLine = err.line; // звук играем сами, обработчик курсора молчит
  editor.setPosition({ lineNumber: err.line, column: 1 });
  editor.revealLineInCenterIfOutsideViewport(err.line);
  editor.focus();
  playErrorSound();
  speak(I18N.t("msg.lintAt", { i: index + 1, n: errors.length, line: err.line, text: lintText(err) }));
}

function hideLint() {
  if (!lintPanel || lintPanel.hidden) return;
  lintPanel.hidden = true;
  previewEl.hidden = false;
  lintState = null;
  lastBeepLine = 0;
}

// Alt+ё: ошибки есть — показываем их (каждое следующее нажатие — следующая
// ошибка, по кругу), ошибок нет — обычный предпросмотр.
function runPreviewOrLint(line) {
  const errors = runLint();
  if (!errors.length) {
    hideLint();
    showPreviewAndFocus(line);
    return;
  }
  const sig = lintSignature(errors);
  const index = lintState && lintState.sig === sig ? (lintState.index + 1) % errors.length : 0;
  lintState = { sig, index };
  showLintError(errors, index);
}

// F8 / Shift+F8: следующая (предыдущая) ошибка после курсора, по кругу. Идём
// от строки курсора, а не от сохранённого индекса: курсор могли подвинуть
// мышью или стрелками, и «следующая» должна значить следующую отсюда.
function goToLintError(step) {
  const errors = runLint();
  if (!errors.length) {
    hideLint();
    speak(I18N.t("msg.lintNone"));
    return;
  }
  const cur = editor.getPosition().lineNumber;
  let index = -1;
  if (step > 0) {
    index = errors.findIndex((e) => e.line > cur);
  } else {
    for (let i = errors.length - 1; i >= 0; i--) {
      if (errors[i].line < cur) { index = i; break; }
    }
  }
  if (index === -1) index = step > 0 ? 0 : errors.length - 1;
  lintState = { sig: lintSignature(errors), index };
  showLintError(errors, index);
}

// Курсор встал на строку с ошибкой — бубуп. Повторно на той же строке молчим:
// иначе набор текста на ошибке превратился бы в трещотку.
function beepOnErrorLine(lineNumber) {
  if (!lintErrors.length) return;
  if (!lintErrors.some((e) => e.line === lineNumber)) { lastBeepLine = 0; return; }
  if (lineNumber === lastBeepLine) return;
  lastBeepLine = lineNumber;
  playErrorSound();
}

// Обратный ход того же переключателя: из предпросмотра в редактор — курсор
// встаёт на строку, из которой построен текущий блок предпросмотра.
function backToEditor() {
  const block = document.activeElement && document.activeElement.closest(".preview-block");
  let line = block && block.dataset.line ? Number(block.dataset.line) : 0;
  if (!line) line = editor.getPosition().lineNumber;
  editor.setPosition({ lineNumber: line, column: 1 });
  editor.revealLineInCenterIfOutsideViewport(line);
  editor.focus();
  speak(I18N.t("msg.backToEditor", { n: line }));
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

// --- Кнопка «Скопировать код» ------------------------------------------------
//
// Код из документа уносят руками — в пример, в чужой редактор, в переписку.
// Незрячему автору выделить блок мышью нечем, поэтому у каждого блока кода
// стоит кнопка. Вид один и тот же в предпросмотре и в готовом документе:
// разметку собираем строкой, и она попадает в оба места. Обработчик в
// предпросмотре — делегат ниже, в готовом документе — скрипт внутри страницы.

function copyText(text, done) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      () => done(true),
      () => done(fallbackCopy(text))
    );
    return;
  }
  done(fallbackCopy(text));
}

// Запасной путь: Clipboard API нет или страница открыта как file://.
function fallbackCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("aria-hidden", "true");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (err) {
    ok = false;
  }
  area.remove();
  return ok;
}

// Текст блока кода, к которому относится кнопка: ближайший <pre> перед ней.
function codeTextFor(btn) {
  let el = btn.previousElementSibling;
  while (el && el.tagName !== "PRE") el = el.previousElementSibling;
  return el ? el.textContent : "";
}

function copyCode(btn) {
  const status = btn.nextElementSibling;
  copyText(codeTextFor(btn), (ok) => {
    const msg = I18N.t(ok ? "msg.codeCopied" : "msg.codeCopyFailed");
    if (status && status.classList.contains("copy-status")) status.textContent = msg;
    speak(msg, fileStatusEl);
  });
}

// Кнопка ставится после каждого <pre>. Подпись передаём снаружи: в готовом
// документе она на языке документа, а не на языке интерфейса редактора.
function withCopyButtons(html, label) {
  const button =
    `<button type="button" class="copy-btn" data-copy>${escHtml(label)}</button>` +
    `<span class="copy-status" role="status" aria-live="polite"></span>`;
  return html.replace(/<pre(?:\s[^>]*)?>[\s\S]*?<\/pre>/g, (block) => block + button);
}

// Подпись кнопки входа в график — тоже на языке документа (см. withCopyButtons).
function withDesmosEnter(html, label) {
  return html.replace(
    /(<button type="button" class="desmos-enter"[^>]*>)[\s\S]*?(<\/button>)/g,
    (m, open, close) => open + escHtml(label) + close
  );
}

// Полный самодостаточный HTML-документ из текущего markdown: используется и
// для скачивания (exportHtml), и для показа по ?preview=html. Шахматные доски
// остаются живыми <chessjax-board> — документ подключает компонент с CDN, а
// CSS (включая fullscreen) встроен в <style>.
//
// Какие модули грузить, решает содержимое документа:
//   mathjax  — по умолчанию включён (выкл: mathjax: no)
//   chessjax — включается сам, если в тексте есть блок ```chess
//   desmos   — включается сам, если в тексте есть блок ```desmos
// Вложенные настройки (mathjax: {…}, desmos: {…}, chess: {…}) мержатся
// глубоко в конфиг MathJax, опции Desmos.Calculator и атрибуты досок.
// Заголовок документа берём из первого заголовка первого уровня, если его не
// задали настройкой title. Так обычному автору frontmatter не нужен вовсе:
// он пишет «# Моя статья» — и это же попадает в <title> готовой страницы.
function docTitleFromMarkdown(md) {
  // Заголовки внутри блоков кода — не заголовки документа.
  const text = md.replace(/^```[\s\S]*?^```/gm, "");
  const m = text.match(/^#[ \t]+(.+?)[ \t]*$/m);
  return m ? m[1].replace(/[*_`~]/g, "").trim() : "";
}

// Язык документа: настройка lang, иначе — по самому тексту. Кириллица выдаёт
// русский, дальше решает язык браузера (но только из тех, что знает редактор).
function detectDocLang(md) {
  if (/[а-яё]/i.test(md)) return "ru";
  const nav = (navigator.language || "en").toLowerCase().slice(0, 2);
  return I18N.LANGS.indexOf(nav) !== -1 ? nav : "en";
}

function buildDocumentHtml() {
  const md = editor.getValue();
  const bodyHtml = renderMarkdown(md);
  const fm = fmState || {};

  // Модули подключаются по содержимому: есть блок ```chess — грузим chessjax,
  // есть ```desmos — грузим Desmos. В настройках документа их указывать не надо.
  // `chessjax: no` и `desmos: no` выключают модуль принудительно; `yes` включает
  // его, даже если блоков нет (например, доски приходят скриптом документа).
  const mods = {
    mathjax: fm.mathjax !== false,
    chessjax: fm.chessjax === false ? false : chessBlocks.length > 0 || fm.chessjax === true,
    desmos: fm.desmos === false ? false : desmosBlocks.length > 0 || fm.desmos === true,
  };

  // Если в тексте есть блоки, а модуль отключён — честная подсказка в документе.
  const chessNote = chessBlocks.length && !mods.chessjax
    ? '<div class="module-off">' + I18N.t("doc.chessOff") + "</div>"
    : "";
  const desmosNote = desmosBlocks.length && !mods.desmos
    ? '<div class="module-off">' + I18N.t("doc.desmosOff") + "</div>"
    : "";

  const title = fm.title || docTitleFromMarkdown(md) || I18N.t("doc.exportTitle");
  const lang = fm.lang || detectDocLang(md);
  // Подписи внутри готового документа — на его языке, а не на языке интерфейса
  // редактора: страницу читает тот, кому её отдали.
  const docBody = withDesmosEnter(
    withCopyButtons(bodyHtml, I18N.tIn("ui.copyCode", lang)),
    I18N.tIn("msg.desmosEnter", lang)
  );
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
    chessBlock = `<script type="module" src="https://cdn.jsdelivr.net/gh/denizsincar29/chessjax@v0.8.7/chessjax.js"></script>
<script>
// Кнопки-ходы <button chess="id" move="N"> в тексте. Свой делегат chessjax
// навешивает при загрузке модуля, но при показе готового HTML через
// ?preview=html страница создаётся document.open() — это новый документ, а
// модуль из кэша повторно не выполняется, и обработчик теряется. Поэтому
// делегат повторяем здесь: он не зависит от модуля и работает в любом
// документе, в том числе в скачанном файле.
document.addEventListener("click", function (event) {
  var btn = event.target && event.target.closest ? event.target.closest("button[chess][move]") : null;
  if (!btn) return;
  var board = document.getElementById(btn.getAttribute("chess"));
  if (board && typeof board.goTo === "function") board.goTo(btn.getAttribute("move"));
});
</script>
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
    // Кнопка входа перед графиком (см. desmosSlot): показываем её только когда
    // график создан, и ведём фокус в список выражений.
    desmosInit = `<script>
document.querySelectorAll(".desmos[data-desmos-idx]").forEach(function (el) {
  var body = el.getAttribute("data-desmos-body");
  if (!body) return;
  var calc = Desmos.Calculator(el, ${JSON.stringify(dOpts)});
  decodeURIComponent(body).split("\\n").map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (expr, i) {
    try { calc.setExpression({ id: "e" + i, latex: expr }); }
    catch (err) { console.warn("Desmos:", expr, err); }
  });
  var enter = el.previousElementSibling;
  if (!enter || enter.className.indexOf("desmos-enter") === -1) return;
  enter.hidden = false;
  enter.addEventListener("click", function () {
    if (typeof calc.focusFirstExpression === "function") {
      try { calc.focusFirstExpression(); return; } catch (err) { console.warn("Desmos:", err); }
    }
    var frame = el.querySelector("iframe");
    if (frame) frame.focus();
  });
});
</script>
`;
  }

  // Готовая страница самодостаточна: скрипт копирования встроен в неё, как и
  // остальные модули. Тексты — на языке документа.
  let copyBlock = "";
  if (docBody.indexOf("copy-btn") !== -1) {
    copyBlock = `<script>
(function () {
  var COPIED = ${JSON.stringify(I18N.tIn("msg.codeCopied", lang))};
  var FAILED = ${JSON.stringify(I18N.tIn("msg.codeCopyFailed", lang))};
  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("aria-hidden", "true");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    area.remove();
    return ok;
  }
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
      return;
    }
    done(fallbackCopy(text));
  }
  document.addEventListener("click", function (event) {
    var btn = event.target && event.target.closest ? event.target.closest(".copy-btn[data-copy]") : null;
    if (!btn) return;
    var pre = btn.previousElementSibling;
    while (pre && pre.tagName !== "PRE") pre = pre.previousElementSibling;
    if (!pre) return;
    copyText(pre.textContent, function (ok) {
      var status = btn.nextElementSibling;
      if (status && status.className.indexOf("copy-status") !== -1) status.textContent = ok ? COPIED : FAILED;
    });
  });
})();
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
  chessjax-board:fullscreen .chessjax-board { width: min(64vh, 92vw); height: min(64vh, 92vw); margin: 0 auto; grid-template-columns: repeat(8, minmax(0, 1fr)); grid-auto-rows: minmax(0, 1fr); border-width: 2px; border-color: #2c3640; background: #1b2127; }
  chessjax-board:fullscreen .chessjax-cell { width: 100%; height: 100%; font-size: min(5vh, 5vw); }
  chessjax-board:fullscreen .chessjax-summary,
  chessjax-board:fullscreen .chessjax-live,
  chessjax-board:fullscreen .chessjax-help { max-width: min(64vh, 92vw); margin-left: auto; margin-right: auto; text-align: center; font-size: 1.1rem; color: #e2e8f0; }
  chessjax-board:fullscreen .chessjax-controls { justify-content: center; }
  chessjax-board:fullscreen .chessjax-btn { min-width: 56px; min-height: 48px; font-size: 1.4rem; }
  .copy-btn { font: inherit; font-size: .9rem; margin: .2rem 0 .1rem; padding: .25rem .7rem; border: 1px solid #bbb; border-radius: 6px; background: #fafafa; cursor: pointer; }
  .copy-btn:hover { border-color: #666; }
  .copy-status { font-size: .85rem; color: #555; margin-left: .5rem; }
</style>
${mjBlock}${chessBlock}${desmosBlock}</head>
<body>
${chessNote}
${docBody}
${desmosNote}
${desmosInit}${copyBlock}</body>
</html>`;
}

function exportHtml() {
  const base = store && store.current() ? store.current().name.replace(/\.md$/i, "") : "math";
  download(base + ".html", buildDocumentHtml(), "text/html;charset=utf-8");
  speak(I18N.t("msg.htmlSaved"), fileStatusEl);
}

// --- Документы в localStorage ------------------------------------------------
//
// Само хранение — в docstore.js (подключён обычным <script> до этого файла):
// документы, автосохранение по тишине, история снимками. Здесь — интерфейс:
// список документов, восстановление при заходе, шаги по истории.
//
// Черновик не создаётся, пока человек ничего не набрал: иначе демо-текст,
// который лежит в редакторе при первом заходе, навсегда перекрывал бы примеры
// по ссылке (?example=… грузится, только если черновик пуст).

let storage = null;
try {
  storage = window.localStorage;
} catch (e) {
  storage = null; // приватный режим/запрет хранилища: работаем без него
}
const store = window.MathmdStore ? window.MathmdStore.create(storage) : null;
const docSelectEl = document.getElementById("doc-select");

const SAVE_IDLE_MS = 5000;  // тишина после правки, через которую пишем в хранилище
let saveTimer = null;
let docTouched = false;     // человек правил текст — есть что сохранять
let docSwitching = false;   // программная подстановка: не считаем её правкой
let docSelectSig = "";      // подпись списка документов, чтобы не дёргать DOM зря

// Подставить текст в редактор не как правку, а как переход к другому
// документу: автосохранение не должно принять это за набор.
function setEditorValue(text) {
  docSwitching = true;
  editor.setValue(text);
  docSwitching = false;
  editor.focus();
}

// Список документов в <select>: сверху «Новый документ», дальше — по свежести.
// Перебираем DOM только когда список правда изменился (иначе на каждом
// автосохранении перестраивалось бы дерево доступности).
function refreshDocSelect() {
  if (!docSelectEl) return;
  const docs = store ? store.list() : [];
  const curId = store ? store.currentId() : "";
  const sig = docs.map((d) => d.id + ":" + d.name).join("|") + "#" + curId;
  if (sig === docSelectSig) return;
  docSelectSig = sig;
  const options = docs.map((d) => {
    const o = document.createElement("option");
    o.value = d.id;
    o.textContent = d.name;
    if (d.id === curId) o.selected = true;
    return o;
  });
  const fresh = document.createElement("option");
  fresh.value = "__new";
  fresh.textContent = I18N.t("ui.docNewOption");
  docSelectEl.replaceChildren(...options, fresh);
}

// Текущее состояние экрана — в хранилище, минуя дебаунс: перед сменой
// документа или подстановкой примера, чтобы ничего не потерялось.
function persistNow() {
  if (!store || !docTouched) return;
  store.setValue(editor.getValue());
  store.snapshot();
  store.flush();
  refreshDocSelect();
  if (store.wasDegraded()) {
    store.clearDegraded();
    speak(I18N.t("msg.historyTrimmed"), fileStatusEl);
  }
}

function scheduleAutosave() {
  docTouched = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persistNow, SAVE_IDLE_MS);
}

function openDocById(id) {
  if (!store) return;
  clearTimeout(saveTimer);
  if (store.current()) store.setValue(editor.getValue());
  const opened = store.openDoc(id);
  if (!opened) return;
  setEditorValue(opened.value);
  docTouched = true;
  refreshDocSelect();
  speak(I18N.t("msg.docOpened", { name: opened.name }), fileStatusEl);
}

function newDoc() {
  if (!store) return;
  clearTimeout(saveTimer);
  if (store.current()) store.setValue(editor.getValue());
  const created = store.newDoc("");
  setEditorValue("");
  docTouched = true;
  refreshDocSelect();
  speak(I18N.t("msg.docNew", { name: created.name }), fileStatusEl);
}

function renameDoc() {
  if (!store) return;
  const cur = store.current();
  if (!cur) return;
  const name = window.prompt(I18N.t("msg.namePrompt"), cur.name);
  if (name === null) return; // отказ — оставляем как было
  const renamed = store.rename(name);
  if (!renamed) return;
  refreshDocSelect();
  speak(I18N.t("msg.docRenamed", { name: renamed.name }), fileStatusEl);
}

function deleteDoc() {
  if (!store) return;
  const cur = store.current();
  if (!cur) return;
  if (!window.confirm(I18N.t("msg.docDeleteConfirm", { name: cur.name }))) return;
  clearTimeout(saveTimer);
  const removed = store.remove(cur.id);
  const next = store.current();
  setEditorValue(next ? next.value : DEFAULT_MD);
  docTouched = !!next && next.value.trim().length > 0;
  refreshDocSelect();
  if (removed) speak(I18N.t("msg.docDeleted", { name: removed.name }), fileStatusEl);
}

function forgetAll() {
  if (!store) return;
  if (!window.confirm(I18N.t("msg.forgetConfirm"))) return;
  clearTimeout(saveTimer);
  store.clearAll();
  docTouched = false;
  setEditorValue(DEFAULT_MD);
  refreshDocSelect();
  speak(I18N.t("msg.forgotten"), fileStatusEl);
}

// Шаг по истории правок: снимки живут в localStorage, поэтому переживают
// перезагрузку — в отличие от родного undo Monaco (он только внутри сессии).
function historyStep(dir) {
  if (!store || !store.current()) return;
  clearTimeout(saveTimer);
  store.setValue(editor.getValue());
  const res = dir === "back" ? store.back() : store.forward();
  if (!res) {
    speak(I18N.t("msg.histEdge"), fileStatusEl);
    return;
  }
  setEditorValue(res.value);
  docTouched = true;
  speak(
    I18N.t(dir === "back" ? "msg.histBack" : "msg.histForward", {
      index: res.index + 1,
      total: res.total,
    }),
    fileStatusEl
  );
}

// Вернуть документ прошлого визита. Пустой черновик не трогаем: в редакторе
// остаётся демо-текст, и он не считается документом, пока в нём не наберут.
function restoreDraft(quiet) {
  if (!store) return;
  const d = store.current();
  if (!d) return;
  setEditorValue(d.value);
  docTouched = d.value.trim().length > 0;
  refreshDocSelect();
  if (quiet) return; // дальше страница сама объявит, что загрузила
  if (docTouched) {
    speak(I18N.t("msg.draftRestored", { name: d.name }), fileStatusEl);
  } else {
    speak(I18N.t("msg.docOpened", { name: d.name }), fileStatusEl);
  }
}

function saveMd() {
  if (store && store.current()) {
    const d = store.current();
    // Безымянный документ при первом сохранении спрашивает имя: дальше файл
    // и документ называются одинаково.
    if (/^untitled\d+\.md$/i.test(d.name)) {
      const name = window.prompt(I18N.t("msg.namePrompt"), d.name);
      if (name !== null && store.rename(name)) refreshDocSelect();
    }
    if (docTouched) {
      store.setValue(editor.getValue());
      store.flush();
    }
    const file = (store.current() || d).name;
    download(file, editor.getValue());
    speak(I18N.t("msg.mdSaved", { name: file }), fileStatusEl);
    return;
  }
  download("document.md", editor.getValue());
  speak(I18N.t("msg.mdSaved", { name: "document.md" }), fileStatusEl);
}

function openMd() {
  document.getElementById("open-input").click();
}

// Текст с диска становится документом с тем же именем: повторное открытие того
// же файла продолжает его, а не заводит копию. Общий путь для обоих способов
// открытия — выбора файла и настоящего дескриптора.
function applyOpenedFile(name, text) {
  clearTimeout(saveTimer);
  if (store) {
    if (store.current()) store.setValue(editor.getValue());
    store.openNamed(name, text);
    docTouched = true;
    refreshDocSelect();
  }
  setEditorValue(text);
  showPreviewAndFocus(1);
}

// --- Файлы на диске ---------------------------------------------------------
// Chromium умеет работать с настоящим файлом: showOpenFilePicker отдаёт
// дескриптор, и сохранение пишет прямо в тот же файл, а не кладёт ещё одну
// копию в «Загрузки». Firefox и Safari такого API не дают — там остаётся
// прежний путь: выбор файла через <input type=file> и скачивание. Для незрячего
// разница не косметическая: папку загрузок он не видит и не может на глаз
// определить, какая из трёх копий свежая.
const fsApi = typeof window.showOpenFilePicker === "function";
const MD_TYPES = [
  { description: "Markdown", accept: { "text/markdown": [".md", ".markdown"], "text/plain": [".txt"] } },
];

let diskHandle = null;  // FileSystemFileHandle файла, с которым сейчас работаем
let diskDocId = null;   // какому документу он принадлежит

// Дескриптор помним вместе с документом: переключение документа его не роняет
// (вернулся к документу — пишешь снова в тот же файл). Дескрипторы живут только
// эту сессию: после перезагрузки страницы браузер их не отдаёт обратно, и
// первое сохранение снова спросит, куда писать.
function bindDiskHandle(handle) {
  diskDocId = store && store.current() ? store.current().id : null;
  diskHandle = handle;
}

function currentDiskHandle() {
  if (!diskHandle) return null;
  const id = store && store.current() ? store.current().id : null;
  return id === diskDocId ? diskHandle : null;
}

function suggestedName() {
  const d = store && store.current();
  const name = d && d.name ? d.name : "document.md";
  return /\.(md|markdown|txt)$/i.test(name) ? name : name.replace(/\.[^.]*$/, "") + ".md";
}

function sameFileName(handle, name) {
  return !!handle && handle.name === name;
}

// --- Облако -----------------------------------------------------------------
// Адрес документа в облаке помним вместе с документом — так же, как дескриптор
// файла: переключение документа его не роняет, а вернувшись к документу, снова
// сохраняешь туда же. Живёт адрес эту сессию: после перезагрузки страницы
// документ снова просто локальный, пока его не откроют из облака.

let cloudDoc = null;   // { owner, path } — адрес этого документа в облаке
let cloudDocId = null; // какому документу он принадлежит

function currentDocId() {
  return store && store.current() ? store.current().id : null;
}

function bindCloudDoc(owner, path) {
  cloudDocId = currentDocId();
  cloudDoc = { owner: owner, path: path };
}

function currentCloudDoc() {
  if (!cloudDoc) return null;
  return currentDocId() === cloudDocId ? cloudDoc : null;
}

// Имя документа для облачного файла — последний сегмент пути. Так «ДЗ/ИИ/задачи»
// открывается как «задачи.md»: в списке документов видно, что это за работа.
function cloudDocName(path) {
  const last = String(path).split("/").filter(Boolean).pop() || "cloud";
  return /\.(md|markdown|txt)$/i.test(last) ? last : last + ".md";
}

function cloudAvailable() {
  return Boolean(window.MathmdCloud);
}

async function openFromDisk() {
  if (!fsApi) {
    openMd();
    return;
  }
  let handle = null;
  try {
    [handle] = await window.showOpenFilePicker({ types: MD_TYPES, multiple: false });
  } catch (err) {
    if (err && err.name === "AbortError") return; // человек передумал — молчим
    openMd(); // незнакомая ошибка: уходим на привычный путь
    return;
  }
  try {
    const file = await handle.getFile();
    applyOpenedFile(file.name, await file.text());
    bindDiskHandle(handle);
    speak(I18N.t("msg.fileOpenedDisk", { name: file.name }), fileStatusEl);
  } catch (err) {
    speak(I18N.t("msg.fileReadFailed", { name: handle.name }), fileStatusEl);
  }
}

// Право на запись. Файл, открытый через showOpenFilePicker, браузер по
// умолчанию отдаёт только на чтение — запись спрашивают отдельно. Запрос
// разрешения возможен лишь из действия человека, а Ctrl+S и нажатие кнопки —
// как раз оно.
async function ensureWritable(handle) {
  if (typeof handle.queryPermission !== "function" || typeof handle.requestPermission !== "function") {
    return true; // браузер без этих методов: пусть решает createWritable
  }
  const opts = { mode: "readwrite" };
  try {
    if ((await handle.queryPermission(opts)) === "granted") return true;
    return (await handle.requestPermission(opts)) === "granted";
  } catch (err) {
    return false;
  }
}

// Сохранение .md: в тот же файл, если он известен; иначе спрашиваем, куда
// (или скачиваем — там, где API нет). asNew — «Сохранить как»: спросить всегда.
async function saveMdToDisk({ asNew = false } = {}) {
  if (!fsApi) {
    saveMd();
    return;
  }
  let handle = asNew ? null : currentDiskHandle();
  if (!handle) {
    try {
      handle = await window.showSaveFilePicker({ suggestedName: suggestedName(), types: MD_TYPES });
    } catch (err) {
      if (err && err.name === "AbortError") return;
      saveMd(); // незнакомая ошибка: привычный путь надёжнее
      return;
    }
    if (!handle || !handle.name) return; // браузер отдал пустой выбор — молчим
    // Сначала отдать текущее состояние в хранилище: имя документа вот-вот
    // сменится на имя файла, и незаписанная правка осталась бы под старым.
    if (docTouched) persistNow();
    // Имя файла становится именем документа: дальше они совпадают.
    if (store && store.current() && !sameFileName(handle, store.current().name)) {
      if (store.rename(handle.name)) refreshDocSelect();
    }
    bindDiskHandle(handle);
  }
  try {
    if (!(await ensureWritable(handle))) {
      speak(I18N.t("msg.saveFailed", { name: handle.name }), fileStatusEl);
      return;
    }
    const writable = await handle.createWritable();
    await writable.write(editor.getValue());
    await writable.close();
    speak(I18N.t("msg.mdSavedToDisk", { name: handle.name }), fileStatusEl);
  } catch (err) {
    speak(I18N.t("msg.saveFailed", { name: handle.name }), fileStatusEl);
  }
}

// Открыть чужой текст (пример по ссылке, документ по URL) отдельным
// документом: прежний черновик не пропадает, а остаётся в списке «Документ».
// Одно и то же имя переиспользуется — повторное открытие примера продолжает
// его же документ, а не плодит копии (так же ведёт себя открытие файла).
function loadAsDocument(name, text) {
  if (!store) {
    setEditorValue(text);
    return;
  }
  clearTimeout(saveTimer);
  if (store.current() && docTouched) {
    store.setValue(editor.getValue());
    store.snapshot();
    store.flush();
  }
  store.openNamed(name, text);
  docTouched = false; // чужой текст — ещё не правка человека
  refreshDocSelect();
  setEditorValue(text);
}

// Примеры лежат по языкам: examples/ru/demo.md, examples/en/demo.md и так далее.
// Если перевода нет (или это старая ссылка на плоский examples/<имя>.md) — берём
// общий файл. Возвращает текст или null.
async function fetchExample(safe) {
  for (const url of ["examples/" + I18N.getLang() + "/" + safe + ".md", "examples/" + safe + ".md"]) {
    const res = await fetch(url);
    if (res.ok) return await res.text();
  }
  return null;
}

// Последний открытый пример: имя и ровно тот текст, что лежит в редакторе.
// По нему смена языка перечитывает пример — если человек его ещё не правил.
let exampleState = null;

// Открыть пример из examples/: загрузить в редактор и сразу показать
// предпросмотр. Имя — простой файл (латиница/цифры/_-), без путей.
async function openExample(name) {
  const safe = String(name).replace(/\.md$/i, "");
  if (!/^[a-z0-9_-]+$/i.test(safe)) {
    speak(I18N.t("msg.badExample"), fileStatusEl);
    return;
  }
  const text = await fetchExample(safe);
  if (text === null) {
    speak(I18N.t("msg.exampleNotFound", { name: safe }), fileStatusEl);
    return;
  }
  // Пример — отдельный документ: то, что человек писал, остаётся в списке
  // «Документ» и возвращается оттуда, а не растворяется в истории правок.
  const separate = !!store && !store.isEmpty();
  exampleState = { name: safe, text };
  loadAsDocument(safe + ".md", text);
  showPreviewAndFocus(1);
  speak(
    I18N.t(separate ? "msg.exampleAsDocument" : "msg.exampleOpened", { name: safe }),
    fileStatusEl
  );
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
    const md = await fetchExample(safe);
    if (md === null) {
      speak(I18N.t("msg.exampleNotFound", { name: safe }), fileStatusEl);
      return;
    }
    exampleState = { name: safe, text: md };
    const preview = params.get("preview");
    const standalone = preview === "html" || preview === "readyhtml";
    // Готовый HTML (раздача материала) отдаём всегда: это не редактирование.
    // А в редактор пример грузим тоже всегда — но отдельным документом, если
    // в редакторе уже что-то написано: прежний черновик остаётся в списке
    // «Документ», и ссылка ничего не затирает молча.
    if (standalone) {
      editor.setValue(md);
      openStandaloneHtml();
      return;
    }
    const separate = !!store && !store.isEmpty();
    if (separate) loadAsDocument(safe + ".md", md);
    else editor.setValue(md);
    if (preview === "on") {
      showPreviewAndFocus(1);
      if (separate) speak(I18N.t("msg.exampleAsDocument"), fileStatusEl);
    } else {
      speak(I18N.t(separate ? "msg.exampleAsDocument" : "msg.exampleLoaded", { name: safe }), fileStatusEl);
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
  const urlStandalone = params.get("preview") === "html" || params.get("preview") === "readyhtml";
  let md = "";
  try {
    const res = await fetch(url.href);
    if (!res.ok) {
      speak(I18N.t("msg.urlHttp", { status: res.status }), fileStatusEl);
      return;
    }
    md = await res.text();
  } catch (e) {
    speak(I18N.t("msg.urlError", { error: e.message }), fileStatusEl);
    return;
  }
  if (urlStandalone) {
    editor.setValue(md);
    openStandaloneHtml();
    return;
  }
  // Как и пример, документ по ссылке не затирает написанное: он заводится
  // отдельным документом, а прежний остаётся в списке «Документ».
  const separate = !!store && !store.isEmpty();
  if (separate) {
    const tail = decodeURIComponent(url.pathname.split("/").pop() || "");
    loadAsDocument(tail || "document.md", md);
    speak(I18N.t("msg.exampleAsDocument"), fileStatusEl);
    return;
  }
  editor.setValue(md);
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

  // Фокус на редакторе при открытии страницы: пользователь попадает на сайт
  // сразу в поле ввода, первая же буква идёт в документ. Строка объявления
  // «редактор готов» прозвучит уже поверх Monaco.
  editor.focus();

  // Палитра команд. F1 Monaco вешает сам, но браузеры любят забирать эту
  // клавишу себе (справка браузера), а Ctrl+Shift+P в Firefox открывает
  // приватное окно и до страницы вообще не доходит. Поэтому даём свою
  // комбинацию, которую не трогает ни один браузер.
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyP,
    () => editor.trigger("keyboard", "editor.action.quickCommand", null)
  );

  // Живой предпросмотр: формулы обновляются по мере набора (с дебаунсом).
  editor.onDidChangeModelContent(() => scheduleLivePreview());

  // Линтер: маркеры пересчитываются по правке (тоже с дебаунсом). Так F8 и
  // Shift+F8 работают сразу, без предварительного Alt+ё.
  editor.onDidChangeModelContent(() => scheduleLiveLint());
  scheduleLiveLint();
  editor.onDidChangeCursorPosition((e) => beepOnErrorLine(e.position.lineNumber));

  // F8 / Shift+F8 — по ошибкам. Маркеры в модели дают волнистое подчёркивание и
  // метки на полосе прокрутки, но переход делаем свой: он гарантированно
  // объявляет ошибку голосом и работает одинаково на любой сборке Монако.
  editor.addCommand(monaco.KeyCode.F8, () => goToLintError(1));
  editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.F8, () => goToLintError(-1));

  // Escape выпускает фокус из редактора. Tab внутри Монако вставляет отступ и
  // из редактора не выводит, так что без этого клавиатурой из него не выйти.
  // Третий аргумент — условие: пока Монако занят своим делом (подсказки,
  // переименование, поиск, вставка сниппета), Escape остаётся за ним.
  editor.addCommand(
    monaco.KeyCode.Escape,
    () => releaseEditorFocus(),
    "!suggestWidgetVisible && !renameInputVisible && !parameterHintsVisible && !findWidgetVisible && !inSnippetMode"
  );

  // Автосохранение: пишем в хранилище через SAVE_IDLE_MS тишины после правки.
  // Программные подстановки (смена документа, пример, шаг по истории) за
  // правку не считаем — иначе они бы сами себя записывали в черновик.
  editor.onDidChangeModelContent(() => {
    if (docSwitching) return;
    scheduleAutosave();
  });

  // Уход со страницы: дописываем немедленно — дебаунс может не успеть.
  window.addEventListener("pagehide", () => {
    clearTimeout(saveTimer);
    if (store && docTouched) {
      store.setValue(editor.getValue());
      store.flush();
    }
  });

  // История правок: Ctrl+Alt+Z / Ctrl+Alt+Y. Родной undo Monaco (Ctrl+Z)
  // живёт только внутри сессии — эти снимки переживают перезагрузку.
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyZ,
    () => historyStep("back")
  );
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyY,
    () => historyStep("forward")
  );

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

  // Файл: Ctrl+S — готовый HTML, Ctrl+Shift+S — .md, Ctrl+O — открыть .md.
  // Ctrl+S браузер забирает себе, но в capture-фазе клавиша ещё наша.

  // Функциональные клавиши. Браузер держит за собой F3 (поиск), F5
  // (перезагрузка), F6 (адресная строка), F10 (меню), F11 (полный экран) и
  // F12 (инструменты) — их не трогаем. Свободные отдаём делу: F1 — справка,
  // Shift+F1 — палитра команд, F2 — переименовать документ, Shift+F2 — удалить,
  // F9 — новый документ.
  function runFKey(e) {
    switch (e.code) {
      case "F1":
        if (e.shiftKey) editor.trigger("keyboard", "editor.action.quickCommand", null);
        else openHelpDialog();
        return true;
      case "F2":
        if (e.shiftKey) deleteDoc();
        else renameDoc();
        return true;
      case "F9":
        if (!e.shiftKey) newDoc();
        return true;
      default:
        return false;
    }
  }

  // Хоткеи на уровне window в capture-фазе: это самая ранняя точка, в которую
  // доходит событие, — раньше Monaco, раньше любых обработчиков на document.
  // Монако не увидит эти клавиши (stopImmediatePropagation).
  window.addEventListener(
    "keydown",
    (e) => {
      // Alt+ё (та же клавиша, что и `) — переключатель между редактором и
      // предпросмотром. Из редактора: показать секцию, пересоздать графики
      // Desmos и объявить содержимое строки курсора. Из предпросмотра: вернуть
      // фокус в редактор на ту строку, с которой пришли.
      // Так правка идёт циклом: набрал — Alt+ё — послушал — Alt+ё — поправил.
      // Если в документе есть ошибки, вместо предпросмотра показываем их:
      // следующее Alt+ё ведёт к следующей ошибке (см. runPreviewOrLint).
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.code === "Backquote") {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (previewSection.contains(document.activeElement) && lintPanel.hidden) {
          backToEditor();
        } else {
          runPreviewOrLint(editor.getPosition().lineNumber);
        }
        return;
      }
      // Ctrl+Shift+Enter — скрыть предпросмотр (и панель ошибок вместе с ним:
      // секция одна, а следующее Alt+ё всё равно пересчитает линтер).
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.shiftKey && e.code === "Enter") {
        e.preventDefault();
        e.stopImmediatePropagation();
        previewSection.hidden = true;
        hideLint();
        speak(I18N.t("msg.previewHidden"));
        return;
      }
      // Файл: Ctrl+S — сохранить .md (в тот же файл, если он известен),
      // Ctrl+Shift+S — готовый HTML, Ctrl+Alt+S — сохранить как новый файл,
      // Ctrl+O — открыть .md. Ctrl+S и Ctrl+Shift+S браузер обычно забирает
      // себе (сохранить страницу), поэтому перехватываем их здесь, до браузера.
      // У облачного документа Ctrl+S пишет в облако, а не в файл на диске:
      // где документ живёт, туда и сохраняется.
      if (ctrl && !e.altKey) {
        if (e.code === "KeyS" && !e.shiftKey) {
          e.preventDefault();
          e.stopImmediatePropagation();
          saveCurrent();
          return;
        }
        if (e.code === "KeyS" && e.shiftKey) {
          e.preventDefault();
          e.stopImmediatePropagation();
          exportHtml();
          return;
        }
        if (e.code === "KeyO" && !e.shiftKey) {
          e.preventDefault();
          e.stopImmediatePropagation();
          openFromDisk();
          return;
        }
      }
      if (ctrl && e.altKey && !e.shiftKey && e.code === "KeyS") {
        e.preventDefault();
        e.stopImmediatePropagation();
        // Для облачного документа «сохранить как» — это новый адрес в облаке.
        if (currentCloudDoc()) cloudSave({ asNew: true });
        else saveMdToDisk({ asNew: true });
        return;
      }
      // Alt+O (и Ctrl+Alt+O) — облако документов. F8 занят переходом по
      // ошибкам, поэтому у облака своя клавиша: «О» как «Облако».
      if (e.altKey && !e.shiftKey && e.code === "KeyO") {
        e.preventDefault();
        e.stopImmediatePropagation();
        openCloudDialog();
        return;
      }
      // F-клавиши. Незнакомую отдаём браузеру: он вправе перезагрузить
      // страницу по F5 или открыть поиск по F3.
      if (!e.altKey && !ctrl && /^F\d+$/.test(e.code) && runFKey(e)) {
        e.preventDefault();
        e.stopImmediatePropagation();
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
    runPreviewOrLint(line);
  });

  // Выход из редактора по Escape: фокус уходит на первое, что стоит после
  // редактора — на кнопку предпросмотра. Дальше Tab идёт по файловой панели
  // обычным порядком, а Shift+Tab возвращает в редактор. Имя кнопки скринридер
  // прочитает сам, так что объявлять словами тут нечего.
  function releaseEditorFocus() {
    const next = document.getElementById("btn-preview");
    if (next) next.focus();
  }

  // Клик по блоку предпросмотра (удобно зрячему): курсор редактора прыгает
  // на строку этого блока, и можно сразу править markdown.
  previewEl.addEventListener("click", (e) => {
    // Кнопка копирования — не переход в редактор: нажали её, значит копируют.
    const copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) {
      copyCode(copyBtn);
      return;
    }
    if (e.target.closest("a")) return;
    // Встроенные вставки — чужое интерактивное содержимое, у них своя работа с
    // фокусом. Щелчок по кнопке входа, по графику Desmos, по шахматной доске или
    // по кнопке-ходу в тексте не должен уводить в редактор: Monaco тут же
    // отбирает фокус, который вставка только что взяла себе (клетка доски, поле
    // выражения), а кнопка-ход вообще теряет нажатие.
    if (
      e.target.closest(".desmos-enter") ||
      e.target.closest(".desmos") ||
      e.target.closest("chessjax-board") ||
      e.target.closest("button[chess][move]")
    )
      return;
    const block = e.target.closest(".preview-block");
    if (!block) return;
    const line = parseInt(block.dataset.line, 10);
    if (!Number.isInteger(line)) return;
    editor.setPosition({ lineNumber: line, column: 1 });
    editor.revealLineInCenter(line);
    editor.focus();
  });
  document.getElementById("btn-export").addEventListener("click", exportHtml);
  document.getElementById("btn-save").addEventListener("click", () => saveMdToDisk());
  document.getElementById("btn-open").addEventListener("click", openFromDisk);
  // Список примеров: стрелка только ВЫБИРАЕТ пункт, открывает его Enter/Пробел
  // или клик. Нативный <select> шлёт change уже на первом нажатии стрелки — из-за
  // этого пример открывался, едва до него дойдёшь стрелкой, и на каждом шаге
  // предпросмотр пересобирался заново. Поэтому change больше ничего не открывает:
  // он лишь запоминает выбор, а действие делает Enter/Пробел (клавиатура) либо
  // указатель (мышь, палец).
  const exampleSelect = document.getElementById("example-select");
  let examplePending = ""; // выбранный, но ещё не открытый пример
  let exampleByPointer = false; // выбор сделан указателем — открываем сразу
  function commitExample(name) {
    examplePending = "";
    exampleByPointer = false;
    exampleSelect.value = "";
    if (name) openExample(name);
  }
  exampleSelect.addEventListener("pointerdown", () => {
    exampleByPointer = true;
  });
  exampleSelect.addEventListener("change", () => {
    if (exampleByPointer) commitExample(exampleSelect.value);
    else examplePending = exampleSelect.value;
  });
  exampleSelect.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    // Пробел на закрытом списке открывает выпадающий список — здесь он должен
    // открывать пример, поэтому гасим нативное поведение.
    const name = examplePending || exampleSelect.value;
    if (!name) return;
    event.preventDefault();
    commitExample(name);
  });
  // Уход с поля отменяет неоткрытый выбор: список возвращается к «—».
  exampleSelect.addEventListener("blur", () => {
    examplePending = "";
    exampleByPointer = false;
    exampleSelect.value = "";
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
      const text = String(reader.result);
      applyOpenedFile(file.name, text);
      // Без File System Access API сохранение умеет только скачивать копию —
      // об этом честнее сказать сразу, чем после первой потери файла.
      speak(I18N.t(fsApi ? "msg.fileOpened" : "msg.fileOpenedNoDisk", { name: file.name }), fileStatusEl);
    };
    reader.readAsText(file, "utf-8");
    event.target.value = "";
  });

  // Список документов: выбор открывает сохранённый, последний пункт — новый.
  // Стрелка только ВЫБИРАЕТ пункт, переключает документ Enter/Пробел или клик —
  // та же грабля, что была у списка примеров: нативный select шлёт change на
  // первом нажатии стрелки, и документ менялся на ходу вместе с пересборкой
  // предпросмотра.
  if (docSelectEl) {
    let docPending = ""; // выбранный, но ещё не открытый документ
    let docByPointer = false; // выбор сделан указателем — переключаем сразу
    function commitDoc(id) {
      docPending = "";
      docByPointer = false;
      if (id === "__new") newDoc();
      else if (id) openDocById(id);
    }
    docSelectEl.addEventListener("pointerdown", () => {
      docByPointer = true;
    });
    docSelectEl.addEventListener("change", () => {
      if (docByPointer) commitDoc(docSelectEl.value);
      else docPending = docSelectEl.value;
    });
    docSelectEl.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const id = docPending || docSelectEl.value;
      if (!id) return;
      event.preventDefault();
      commitDoc(id);
    });
    // Уход с поля отменяет неоткрытый выбор: список снова показывает текущий
    // документ, а не тот, до которого дошли стрелкой.
    docSelectEl.addEventListener("blur", () => {
      docPending = "";
      docByPointer = false;
      if (store) docSelectEl.value = store.currentId() || "";
    });
  }
  // Имя документа правится рядом со списком, а не только из палитры команд:
  // удалить ненужный документ можно прямо здесь (клавиши F2 и Shift+F2).
  const docRenameBtn = document.getElementById("btn-doc-rename");
  const docDeleteBtn = document.getElementById("btn-doc-delete");
  if (docRenameBtn) docRenameBtn.addEventListener("click", renameDoc);
  if (docDeleteBtn) docDeleteBtn.addEventListener("click", deleteDoc);

  // Справка: модальный диалог (native <dialog>), Esc закрывает сам.
  // Фокус ставим на заголовок: по умолчанию браузер отдаёт его первой
  // фокусируемой вещи внутри, а это ссылка на руководство в самом низу, — из-за
  // этого справка открывалась «с конца». С заголовка скринридер сначала скажет,
  // что за диалог открылся, а Tab пойдёт по тексту вниз.
  const helpDialog = document.getElementById("help-dialog");
  const helpClose = document.getElementById("help-close");
  const helpHeading = document.getElementById("help-heading");
  let helpReturnFocus = null;
  function openHelpDialog() {
    if (helpDialog.open) return;
    helpReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    helpDialog.showModal();
    if (helpHeading) helpHeading.focus();
    speak(I18N.t("msg.helpOpen"), fileStatusEl);
  }
  document.getElementById("btn-help").addEventListener("click", openHelpDialog);
  helpClose.addEventListener("click", () => helpDialog.close());
  helpDialog.addEventListener("close", () => {
    // Возвращаем фокус туда, откуда справку открыли: из редактора — в редактор,
    // с кнопки — на кнопку. Иначе F1, закрытый Escape, выкидывал бы в панель
    // файла, и работу пришлось бы искать заново.
    if (helpReturnFocus && document.contains(helpReturnFocus)) {
      const dom = editor.getDomNode();
      if (dom && dom.contains(helpReturnFocus)) editor.focus();
      else if (typeof helpReturnFocus.focus === "function") helpReturnFocus.focus();
    } else {
      document.getElementById("btn-help").focus();
    }
    speak(I18N.t("msg.helpClosed"), fileStatusEl);
  });

  // Полное руководство (manual.html) — отдельная страница, чтобы не потерять
  // документ: открываем в новой вкладке. Ссылки в интерфейсе ведут на неё с
  // текущим языком, чтобы не переспрашивать выбор заново.
  function manualUrl() {
    return "manual.html?lang=" + I18N.getLang();
  }
  function syncManualLinks() {
    document.querySelectorAll("[data-manual-link]").forEach((a) => { a.href = manualUrl(); });
  }
  function openManual() {
    if (window.open(manualUrl(), "_blank")) {
      speak(I18N.t("msg.manualOpen"), fileStatusEl);
    } else {
      speak(I18N.t("msg.manualBlocked"), fileStatusEl);
    }
  }
  document.getElementById("btn-manual").addEventListener("click", openManual);
  syncManualLinks();

  // --- Облако ----------------------------------------------------------------
  // Диалог облака — про то, что лежит на сервере. Вход живёт в куке, поэтому
  // «войти» здесь значит просто попросить сервер поставить куку; после этого
  // и редактор, и облако видят одну и ту же сессию.
  const cloudDialog = document.getElementById("cloud-dialog");
  const cloudHeading = document.getElementById("cloud-heading");
  const cloudHint = document.getElementById("cloud-hint");
  const cloudLoginForm = document.getElementById("cloud-login-form");
  const cloudListBlock = document.getElementById("cloud-list-block");
  const cloudList = document.getElementById("cloud-list");
  const cloudSaveForm = document.getElementById("cloud-save-form");
  const cloudPathInput = document.getElementById("cloud-path");
  const cloudSaveBtn = document.getElementById("cloud-save-submit");
  const cloudLogoutBtn = document.getElementById("cloud-logout");
  const cloudOpenSiteBtn = document.getElementById("cloud-open-site");
  const cloudOpenPageBtn = document.getElementById("cloud-open-page");
  const cloudCloseBtn = document.getElementById("cloud-close");
  let cloudUser = null;       // кто вошёл, по данным сервера
  let cloudReturnFocus = null;
  let cloudBusy = false;      // в диалоге идёт запрос — не дёргаем его дважды

  // cloudSay — объявление для скринридера: и в подсказку диалога (её прочитают
  // при переходе по Tab), и в live-регион (её услышат сразу).
  function cloudSay(text) {
    if (cloudHint) cloudHint.textContent = text;
    speak(text, fileStatusEl);
  }

  function cloudPaint() {
    const signed = Boolean(cloudUser);
    if (cloudLoginForm) cloudLoginForm.hidden = signed;
    if (cloudListBlock) cloudListBlock.hidden = !signed;
    if (cloudSaveForm) cloudSaveForm.hidden = !signed;
    if (cloudLogoutBtn) cloudLogoutBtn.hidden = !signed;
    if (cloudHint) {
      cloudHint.textContent = signed
        ? I18N.t("cloud.signedAs", { name: cloudUser.username })
        : I18N.t("cloud.signedOut");
    }
    const bound = currentCloudDoc();
    if (cloudSaveBtn) {
      cloudSaveBtn.textContent = I18N.t(bound ? "cloud.saveCurrent" : "cloud.saveNew");
    }
    // Ходить в облако есть за чем, только если документ там уже лежит: у
    // нового листа страницы нет, и кнопка вела бы в 404.
    if (cloudOpenPageBtn) cloudOpenPageBtn.hidden = !bound;
  }

  async function cloudFillList() {
    if (!cloudUser) return;
    const docs = await window.MathmdCloud.list();
    cloudList.replaceChildren();
    for (const doc of docs) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      const state = doc.visibility === "public" ? I18N.t("cloud.public") : I18N.t("cloud.private");
      const when = new Date(doc.updated_at).toLocaleString(I18N.getLang());
      btn.textContent = I18N.t("cloud.listItem", {
        name: doc.title || doc.path,
        path: doc.path,
        state: state,
        when: when,
      });
      btn.addEventListener("click", () => {
        cloudDialog.close();
        cloudOpen(doc.owner || cloudUser.username, doc.path);
      });
      li.append(btn);
      cloudList.append(li);
    }
    if (!docs.length) {
      const li = document.createElement("li");
      li.textContent = I18N.t("cloud.listEmpty");
      cloudList.append(li);
    }
  }

  // cloudRefresh перечитывает и «кто вошёл», и список. Ошибки не глотаем: без
  // входа это обычное состояние, а не поломка.
  async function cloudRefresh(announce) {
    if (!cloudAvailable()) {
      cloudSay(I18N.t("msg.cloudUnavailable"));
      return;
    }
    if (cloudBusy) return;
    cloudBusy = true;
    try {
      cloudUser = await window.MathmdCloud.me();
      cloudPaint();
      if (cloudUser) {
        await cloudFillList();
        if (announce) cloudSay(I18N.t("cloud.signedAs", { name: cloudUser.username }));
      } else if (announce) {
        cloudSay(I18N.t("cloud.signedOut"));
      }
    } catch (err) {
      cloudSay(I18N.t("msg.cloudError", { text: err.message }));
    } finally {
      cloudBusy = false;
    }
  }

  function openCloudDialog() {
    if (!cloudAvailable()) {
      speak(I18N.t("msg.cloudUnavailable"), fileStatusEl);
      return;
    }
    if (cloudDialog.open) {
      if (cloudHeading) cloudHeading.focus();
      return;
    }
    cloudReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cloudDialog.showModal();
    cloudPaint();
    // Фокус на заголовок: сначала «что открылось», потом поля.
    if (cloudHeading) cloudHeading.focus();
    cloudRefresh(false).then(() => {
      if (!cloudUser && cloudLoginForm) cloudLoginForm.querySelector("input").focus();
      cloudSay(cloudUser ? I18N.t("cloud.signedAs", { name: cloudUser.username }) : I18N.t("cloud.signedOut"));
    });
  }

  cloudDialog.addEventListener("close", () => {
    if (cloudReturnFocus && document.contains(cloudReturnFocus)) {
      const dom = editor.getDomNode();
      if (dom && dom.contains(cloudReturnFocus)) editor.focus();
      else if (typeof cloudReturnFocus.focus === "function") cloudReturnFocus.focus();
    } else {
      editor.focus();
    }
  });

  // openFromCloud — открыть документ из облака документом редактора. Локальный
  // черновик при этом не пропадает: он остаётся в списке «Документ».
  async function cloudOpen(owner, path) {
    if (!cloudAvailable()) {
      speak(I18N.t("msg.cloudUnavailable"), fileStatusEl);
      return;
    }
    speak(I18N.t("msg.cloudLoading", { path: path }), fileStatusEl);
    try {
      const doc = await window.MathmdCloud.load(owner, path);
      const realPath = doc.path || path;
      loadAsDocument(cloudDocName(realPath), doc.content || "");
      bindCloudDoc(doc.owner || owner, realPath);
      speak(I18N.t("msg.cloudOpened", { path: realPath }), fileStatusEl);
    } catch (err) {
      if (err.status === 401) {
        speak(I18N.t("msg.cloudNeedLogin"), fileStatusEl);
        openCloudDialog();
        return;
      }
      // Документа по этому адресу ещё нет — это не ошибка, а создание:
      // открываем пустой лист, привязанный к облаку, и Ctrl+S его заведёт.
      // Этим путём ходит кнопка «Создать документ» на странице облака.
      if (err.status === 404) {
        loadAsDocument(cloudDocName(path), "");
        bindCloudDoc(owner, path);
        speak(I18N.t("msg.cloudNew", { path: path }), fileStatusEl);
        return;
      }
      speak(I18N.t("msg.cloudError", { text: err.message }), fileStatusEl);
    }
  }

  // cloudSave — Ctrl+S для облачного документа: правит то, что лежит на
  // сервере. Для нового адреса спрашиваем путь: тем же путём документ и
  // заводится в облаке.
  async function cloudSave({ asNew = false } = {}) {
    if (!cloudAvailable()) {
      speak(I18N.t("msg.cloudUnavailable"), fileStatusEl);
      return;
    }
    let target = asNew ? null : currentCloudDoc();
    if (!target) {
      cloudUser = cloudUser || (await window.MathmdCloud.me().catch(() => null));
      if (!cloudUser) {
        speak(I18N.t("msg.cloudNeedLogin"), fileStatusEl);
        openCloudDialog();
        return;
      }
      const answer = window.prompt(I18N.t("msg.cloudPathPrompt"), suggestedName().replace(/\.md$/i, ""));
      if (answer === null) return;
      const clean = answer.trim().replace(/^\/+/, "").replace(/\s+/g, "-");
      if (!clean) {
        speak(I18N.t("msg.cloudBadPath"), fileStatusEl);
        return;
      }
      target = { owner: cloudUser.username, path: clean };
    }
    try {
      const md = editor.getValue();
      const title = (fmState && fmState.title) || docTitleFromMarkdown(md) || "";
      const doc = await window.MathmdCloud.save(target.owner, target.path, { content: md, title: title });
      const realPath = doc.path || target.path;
      bindCloudDoc(doc.owner || target.owner, realPath);
      // Сохранение идёт в файл — локальный черновик тоже подтягиваем, чтобы
      // в списке документов имя совпадало с тем, что лежит в облаке.
      if (docTouched) persistNow();
      speak(
        I18N.t(asNew ? "msg.cloudSavedAs" : "msg.cloudSaved", { path: realPath }),
        fileStatusEl
      );
    } catch (err) {
      if (err.status === 401) {
        cloudUser = null;
        speak(I18N.t("msg.cloudNeedLogin"), fileStatusEl);
        openCloudDialog();
        return;
      }
      speak(I18N.t("msg.cloudSaveFailed", { text: err.message }), fileStatusEl);
    }
  }

  // Ctrl+S в облачном документе — это запись в облако, а не файл на диске.
  function saveCurrent() {
    if (currentCloudDoc()) cloudSave();
    else saveMdToDisk();
  }

  if (document.getElementById("btn-cloud")) {
    document.getElementById("btn-cloud").addEventListener("click", openCloudDialog);
  }
  if (cloudCloseBtn) cloudCloseBtn.addEventListener("click", () => cloudDialog.close());
  // Вкладка, в которой открыт редактор. Имя нужно, чтобы вернуть человека
  // назад в ту же вкладку, из которой он пришёл: браузерное «назад» вернуло бы
  // его правильно, но оно уводит и из редактора — а этому документу тут ещё
  // работать. Имя примет только окно, открытое скриптом; вкладку человека
  // браузер по имени не отдаст, и тогда мы не открываем ничего лишнего.
  let cloudTabName = "";
  try {
    cloudTabName = window.name || "";
    if (!cloudTabName) {
      cloudTabName = "mathmd" + Date.now();
      window.name = cloudTabName;
    }
  } catch (err) {
    cloudTabName = "";
  }

  function cloudOpenPage() {
    const at = currentCloudDoc();
    if (!at) return;
    const url = window.MathmdCloud.pageUrl(at.owner, at.path, cloudTabName);
    if (window.open(url, cloudTabName)) {
      speak(I18N.t("msg.cloudSiteOpen"), fileStatusEl);
    } else {
      speak(I18N.t("msg.manualBlocked"), fileStatusEl);
    }
  }

  if (cloudOpenPageBtn) cloudOpenPageBtn.addEventListener("click", cloudOpenPage);

  if (cloudOpenSiteBtn) {
    cloudOpenSiteBtn.addEventListener("click", () => {
      if (!cloudAvailable()) return;
      if (window.open(window.MathmdCloud.homeUrl(cloudTabName), cloudTabName)) {
        speak(I18N.t("msg.cloudSiteOpen"), fileStatusEl);
      } else {
        speak(I18N.t("msg.manualBlocked"), fileStatusEl);
      }
    });
  }
  if (cloudLogoutBtn) {
    cloudLogoutBtn.addEventListener("click", async () => {
      try {
        await window.MathmdCloud.logout();
      } catch (err) {
        // выйти должно получиться всегда
      }
      cloudUser = null;
      cloudPathInput.value = "";
      cloudPaint();
      if (cloudLoginForm) cloudLoginForm.querySelector("input").focus();
      cloudSay(I18N.t("cloud.signedOut"));
    });
  }
  if (cloudLoginForm) {
    cloudLoginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = document.getElementById("cloud-login-name").value.trim();
      const pass = document.getElementById("cloud-login-pass").value;
      cloudSay(I18N.t("cloud.signingIn"));
      try {
        cloudUser = await window.MathmdCloud.login(name, pass);
        document.getElementById("cloud-login-pass").value = "";
        await cloudRefresh(false);
        cloudSay(I18N.t("cloud.signedAs", { name: cloudUser.username }));
        if (cloudList) cloudList.focus();
      } catch (err) {
        if (err.status === 401) cloudSay(I18N.t("cloud.badCredentials"));
        else cloudSay(I18N.t("msg.cloudError", { text: err.message }));
        if (cloudLoginForm) cloudLoginForm.querySelector("input").focus();
      }
    });
  }
  if (cloudSaveForm) {
    cloudSaveForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const raw = cloudPathInput.value.trim().replace(/^\/+/, "").replace(/\s+/g, "-");
      if (!raw) {
        cloudSay(I18N.t("msg.cloudBadPath"));
        return;
      }
      if (!cloudUser) {
        cloudSay(I18N.t("msg.cloudNeedLogin"));
        return;
      }
      cloudSay(I18N.t("msg.cloudSaving", { path: raw }));
      try {
        const md = editor.getValue();
        const title = (fmState && fmState.title) || docTitleFromMarkdown(md) || "";
        const doc = await window.MathmdCloud.save(cloudUser.username, raw, { content: md, title: title });
        bindCloudDoc(doc.owner || cloudUser.username, doc.path || raw);
        if (docTouched) persistNow();
        cloudPathInput.value = "";
        await cloudFillList();
        cloudPaint();
        cloudSay(I18N.t("msg.cloudSavedAs", { path: doc.path || raw }));
        if (cloudList) cloudList.focus();
      } catch (err) {
        cloudSay(I18N.t("msg.cloudSaveFailed", { text: err.message }));
      }
    });
  }

  // Облачный документ подставляется в редактор только после того, как прошли и
  // черновик, и URL-параметры: ссылку #cloud=… открывают, чтобы работать именно
  // с этим документом, а не чтобы посмотреть на восстановленный черновик.
  async function openCloudFromHash() {
    const m = /^#cloud=(.+)$/.exec(location.hash);
    if (!m) return false;
    history.replaceState(null, "", location.pathname + location.search);
    let decoded = m[1];
    try {
      decoded = decodeURIComponent(m[1]);
    } catch (err) {
      decoded = m[1];
    }
    const parts = decoded.replace(/^\/+/, "").split("/").filter(Boolean);
    if (parts.length < 2) {
      speak(I18N.t("msg.cloudBadPath"), fileStatusEl);
      return true;
    }
    const owner = parts.shift();
    await cloudOpen(owner, parts.join("/"));
    return true;
  }

  // Команды в command palette (Shift+F1) и контекстное меню. Повседневные
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
    add({ id: "mathmd.saveMd", label: I18N.t("cmd.saveMd"), run: saveCurrent });
    add({ id: "mathmd.saveMdAs", label: I18N.t("cmd.saveMdAs"), run: () => saveMdToDisk({ asNew: true }) });
    add({ id: "mathmd.cloud", label: I18N.t("cmd.cloud"), run: openCloudDialog });
    add({ id: "mathmd.cloudSave", label: I18N.t("cmd.cloudSave"), run: () => cloudSave() });
    add({ id: "mathmd.cloudSaveAs", label: I18N.t("cmd.cloudSaveAs"), run: () => cloudSave({ asNew: true }) });
    add({ id: "mathmd.exportHtml", label: I18N.t("cmd.exportHtml"), run: exportHtml });
    add({ id: "mathmd.help", label: I18N.t("cmd.help"), run: openHelpDialog });
    add({ id: "mathmd.manual", label: I18N.t("cmd.manual"), run: openManual });
    add({ id: "mathmd.docNew", label: I18N.t("cmd.docNew"), run: newDoc });
    add({ id: "mathmd.docRename", label: I18N.t("cmd.docRename"), run: renameDoc });
    add({ id: "mathmd.docDelete", label: I18N.t("cmd.docDelete"), run: deleteDoc });
    add({ id: "mathmd.forget", label: I18N.t("cmd.forget"), run: forgetAll });
    add({ id: "mathmd.historyBack", label: I18N.t("cmd.historyBack"), run: () => historyStep("back") });
    add({ id: "mathmd.historyForward", label: I18N.t("cmd.historyForward"), run: () => historyStep("forward") });
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
  async function changeUiLang(lang) {
    I18N.setLang(lang);
    toolbarEl.replaceChildren();
    buildToolbar();
    editor.updateOptions({ ariaLabel: I18N.t("editor.ariaLabel") });
    registerEditorActions();
    syncManualLinks();
    docSelectSig = ""; // пункт «Новый документ» переводится — пересобрать список
    refreshDocSelect();
    speak(I18N.t("msg.langChanged", { lang: I18N.langName(lang) }), fileStatusEl);
    // Пример берётся из папки своего языка: если он открыт и человек его не
    // правил — перечитываем на новом языке, иначе правка человека важнее.
    if (exampleState && editor.getValue() === exampleState.text) {
      const text = await fetchExample(exampleState.name);
      if (text !== null && text !== exampleState.text) {
        exampleState = { name: exampleState.name, text };
        loadAsDocument(exampleState.name + ".md", text);
      }
    }
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
  registerEditorActions();

  speak(I18N.t("msg.editorReady"));

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.warn("[mathmd] service worker:", err);
    });
  }

  // Документ прошлого визита — раньше URL-параметров: пример по ссылке
  // грузится, только если черновик пуст (иначе он затёр бы работу).
  const urlParams = new URLSearchParams(location.search);
  const quietRestore =
    urlParams.has("example") || urlParams.has("url") || location.hash.startsWith("#cloud=");
  restoreDraft(quietRestore);

  // URL-параметры должны сработать уже после инициализации редактора.
  loadFromUrl();

  // Ссылка из облака (#cloud=владелец/путь) — после всего остального: она
  // приходит, чтобы работать с конкретным документом, и потому главнее и
  // черновика, и примеров по ссылке.
  openCloudFromHash();

  // Ссылку из облака (#cloud=владелец/путь) открывают и в уже открытом
  // редакторе: тогда браузер меняет только фрагмент адреса и страницу не
  // перезагружает — скрипт второй раз не запускается, и документ не
  // открывался бы. Слушатель доводит такой переход до конца.
  window.addEventListener("hashchange", () => {
    if (location.hash.startsWith("#cloud=")) openCloudFromHash();
  });

  if (store && !store.isPersistent()) {
    speak(I18N.t("msg.storageOff"), fileStatusEl);
  }

  // Первый заход: подсказать, где руководство. Ссылка стоит выше редактора, но
  // новичок про неё не знает — проговариваем один раз, дальше молчим (флаг в
  // localStorage). Не перебиваем объявления о примере по ссылке.
  if (!quietRestore) announceFirstRun();
});

// Флаг «уже был здесь». Отдельный ключ, чтобы не путаться с хранилищем
// документов и не мешать восстановлению черновика.
const VISITED_KEY = "mathmd-visited-v1";

function announceFirstRun() {
  let seen = null;
  try {
    seen = localStorage.getItem(VISITED_KEY);
  } catch (err) {
    return; // приватный режим: молчим, подсказка не критична
  }
  if (seen) return;
  try {
    localStorage.setItem(VISITED_KEY, "1");
  } catch (err) {
    /* записать не получилось — не беда */
  }
  setTimeout(() => speak(I18N.t("msg.firstRun")), 1500);
}
