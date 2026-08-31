// Математический редактор: Monaco + Markdown + MathJax 4 (LaTeX/AsciiMath) + Desmos.
//
// Рендер markdown с математикой и графиками, предпросмотр по Ctrl+Enter на
// строке курсора, помощники вставки формул, доступность для скринридера.

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

function renderMarkdown(md) {
  const body = extractDesmos(md).replace(/`([^`\n]+)`/g, (m, expr) => ASM_OPEN + expr + ASM_CLOSE);
  const segments = segmentMarkdown(body);
  let html = "";
  for (const seg of segments) {
    html += `<div class="preview-block" data-line="${seg.start}" tabindex="0">${converter.makeHtml(seg.lines)}</div>\n`;
  }
  html = html.split(ASM_OPEN).join("`").split(ASM_CLOSE).join("`");
  // Desmos-плейсхолдер showdown заворачивает в <p> — div внутри p невалиден.
  // Вырываем плейсхолдер из абзаца, потом инжектим контейнер графика.
  html = html.replace(/<p>@@DESMOS(\d+)@@<\/p>/g, (m, i) => `<div class="desmos" data-desmos-idx="${i}"></div>`);
  html = html.replace(/@@DESMOS(\d+)@@/g, (m, i) => `<div class="desmos" data-desmos-idx="${i}"></div>`);
  return html;
}

function initDesmosGraphs() {
  if (!window.Desmos || typeof Desmos.Calculator !== "function") return;
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

async function renderPreview() {
  const html = renderMarkdown(editor.getValue());
  previewEl.innerHTML = html;
  assignLineMarks(previewEl);
  initDesmosGraphs();
  await typesetMath();
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
    speak(`Строка ${line + 1}. ` + (label || "Пустой блок."));
  } else {
    speak("Нет предпросмотра для этой строки.");
  }
}

function showPreviewAndFocus(line) {
  previewSection.hidden = false;
  renderPreview().then(() => focusPreviewAtLine(line));
}

// --- Вставка сниппетов ------------------------------------------------------

function insertSnippet(template) {
  const marker = " ";
  const text = template.replace(/\{cursor\}/g, marker);
  const sel = editor.getSelection();
  const range = new monaco.Range(sel.startLineNumber, sel.startColumn, sel.endLineNumber, sel.endColumn);
  editor.executeEdits("mathmd-snippet", [{ range, text }]);
  const model = editor.getModel();
  const idx = model.getValue().indexOf(marker);
  if (idx >= 0) {
    const pos = model.getPositionAt(idx);
    const markerRange = new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column + 1);
    editor.executeEdits("mathmd-snippet-clean", [{ range: markerRange, text: "" }]);
    editor.setPosition(pos);
  }
  editor.focus();
}

// Кнопки тулбара: [метка для скринридера, сниппет, текст кнопки]
const TOOLBAR_GROUPS = [
  {
    title: "Математика",
    items: [
      ["Формула LaTeX в строке", "$x^2{cursor}$", "$x^2$"],
      ["Формула на отдельной строке", "$$\n{cursor}\n$$", "$$ ... $$"],
      ["Формула AsciiMath", "`sqrt(2){cursor}`", "`sqrt(2)`"],
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
];

function buildToolbar() {
  let accel = 0;
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
      toolbarEl.appendChild(btn);
      accel++;
      if (accel <= 9) {
        editor.addCommand(monaco.KeyMod.Alt | (monaco.KeyCode.Key1 + accel - 1), () => insertSnippet(snippet));
      }
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

function exportHtml() {
  const bodyHtml = renderMarkdown(editor.getValue());
  const doc = `<!DOCTYPE html>
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
  download("math.html", doc, "text/html;charset=utf-8");
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

  // Ctrl+Enter — обновить предпросмотр и перейти к строке курсора.
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
    const line = editor.getPosition().lineNumber;
    showPreviewAndFocus(line);
  });
  // Ctrl+Shift+Enter — скрыть предпросмотр.
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
    previewSection.hidden = true;
    speak("Предпросмотр скрыт.");
  });

  document.getElementById("btn-preview").addEventListener("click", () => {
    const line = editor.getPosition().lineNumber;
    showPreviewAndFocus(line);
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
});
