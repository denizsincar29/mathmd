// manual-examples.js — живые примеры в руководстве.
//
// Под каждым блоком кода с атрибутом data-example появляется кнопка
// «Скопировать код» и предпросмотр: markdown с формулами рендерится тем же
// showdown'ом и MathJax, шахматные доски и графики — теми же компонентами,
// что и в редакторе. Руководство показывает ровно тот результат, который
// даст документ, а не картинку «как должно быть».
//
// Блоки без предпросмотра — frontmatter: это настройки документа, а не текст,
// который что-то рисует.
(function () {
  "use strict";

  var blocks = Array.prototype.slice.call(document.querySelectorAll("pre[data-example]"));
  if (!blocks.length) return;

  // --- объявления для скринридера -------------------------------------------
  var status = document.createElement("div");
  status.className = "visually-hidden";
  status.setAttribute("aria-live", "polite");
  document.body.appendChild(status);
  var statusTimer = null;
  function say(text) {
    status.textContent = "";
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () {
      status.textContent = text;
    }, 60);
  }

  // --- рендер примера в предпросмотр ----------------------------------------
  // Те же настройки showdown, что в script.js: иначе руководство показывало бы
  // не то, что даёт редактор.
  var converter = window.showdown
    ? new showdown.Converter({
        tables: true,
        tasklists: true,
        strikethrough: true,
        simplifiedAutoLink: true,
        ghCodeBlocks: true,
        headerLevelStart: 1,
      })
    : null;

  // AsciiMath пишется в обратных кавычках, а showdown делает из них <code>.
  // Прячем кавычки за маркерами и возвращаем уже в готовом HTML.
  var ASM_OPEN = "⁣¶ASMOPEN¶⁣";
  var ASM_CLOSE = "⁣¶ASMCLOSE¶⁣";

  function renderMarkdown(text, el) {
    if (!converter) {
      el.textContent = text;
      return;
    }
    var body = text.replace(/`([^`\n]+)`/g, function (m, expr) {
      return ASM_OPEN + expr + ASM_CLOSE;
    });
    var html = converter.makeHtml(body);
    html = html.split(ASM_OPEN).join("`").split(ASM_CLOSE).join("`");
    el.innerHTML = html;
    typeset(el);
  }

  function typeset(el) {
    var mj = window.MathJax;
    if (mj && typeof mj.typesetPromise === "function") {
      mj.typesetPromise([el]).catch(function (err) {
        console.warn("[mathmd] MathJax в руководстве:", err);
      });
    }
  }

  // Атрибуты внутри fence-блока: строки вида key=value (кавычки необязательны).
  function parseFence(body) {
    var attrs = {};
    body.split(/\r?\n/).forEach(function (line) {
      var m = /^\s*([\w-]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (!m) return;
      var value = m[2].replace(/^["']|["']$/g, "");
      if (value) attrs[m[1]] = value;
    });
    return attrs;
  }

  function fences(text, name) {
    var re = new RegExp("```" + name + "\\s*\\n([\\s\\S]*?)```", "g");
    var out = [];
    var m;
    while ((m = re.exec(text))) out.push(m[1]);
    return out;
  }

  function renderChess(text, el) {
    var parts = fences(text, "chess");
    if (!parts.length) parts = [text];
    parts.forEach(function (part, i) {
      var attrs = parseFence(part);
      var board = document.createElement("chessjax-board");
      board.id = attrs.id || "manual-chess-" + (i + 1);
      Object.keys(attrs).forEach(function (k) {
        if (k !== "id") board.setAttribute(k, attrs[k]);
      });
      el.appendChild(board);
    });
  }

  function renderDesmos(text, el) {
    var parts = fences(text, "desmos");
    if (!parts.length) parts = [text];
    if (!window.Desmos || typeof window.Desmos.Calculator !== "function") {
      el.textContent = I18N.t("msg.desmosFallback");
      return;
    }
    parts.forEach(function (part) {
      var holder = document.createElement("div");
      holder.className = "desmos";
      el.appendChild(holder);
      try {
        var calc = window.Desmos.Calculator(holder, {
          expressions: true,
          settingsMenu: false,
          border: false,
          projectorMode: true,
        });
        part
          .split("\n")
          .map(function (s) { return s.trim(); })
          .filter(Boolean)
          .forEach(function (expr, i) {
            try {
              calc.setExpression({ id: "e" + i, latex: expr });
            } catch (err) {
              console.warn("[mathmd] выражение Desmos не распознано:", expr, err);
            }
          });
      } catch (err) {
        console.error("[mathmd] график Desmos в руководстве:", err);
      }
    });
  }

  function render(kind, text, el) {
    if (kind === "chess") renderChess(text, el);
    else if (kind === "desmos") renderDesmos(text, el);
    else renderMarkdown(text, el);
  }

  // --- кнопка «Скопировать код» ---------------------------------------------
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { done(true); },
        function () { done(fallbackCopy(text)); }
      );
      return;
    }
    done(fallbackCopy(text));
  }

  // Запасной путь для браузеров без Clipboard API и для file://.
  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("aria-hidden", "true");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    area.remove();
    return ok;
  }

  blocks.forEach(function (pre) {
    var kind = pre.getAttribute("data-example") || "markdown";
    var codeEl = pre.querySelector("code") || pre;
    var text = codeEl.textContent;

    var figure = document.createElement("figure");
    figure.className = "example";
    pre.parentNode.insertBefore(figure, pre);
    figure.appendChild(pre);

    var copy = document.createElement("button");
    copy.type = "button";
    copy.className = "copy-btn";
    copy.textContent = I18N.t("manual.copyCode");
    copy.addEventListener("click", function () {
      copyText(text, function (ok) {
        say(I18N.t(ok ? "manual.copied" : "manual.copyFailed"));
      });
    });
    figure.appendChild(copy);

    if (kind === "frontmatter") return; // настройки — не то, что рисуется

    // Подпись — обычным текстом: скринридер прочитает её перед содержимым,
    // а зрячий увидит, что это за блок. Скрытых описаний не заводим.
    var label = document.createElement("p");
    label.className = "preview-label";
    label.textContent = I18N.t("manual.previewLabel");

    var preview = document.createElement("div");
    preview.className = "example-preview";
    figure.appendChild(preview);
    render(kind, text, preview);
    preview.insertBefore(label, preview.firstChild);
  });
})();
