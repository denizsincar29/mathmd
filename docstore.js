// docstore.js — документы и история правок в localStorage.
//
// Зачем отдельным файлом: логика хранения — чистая (нет ни DOM, ни Monaco),
// поэтому её можно прогнать тестами напрямую, а script.js остаётся про
// интерфейс. Подключается обычным <script> до script.js; в Node модуль
// экспортируется через module.exports — для тестов.
//
// Что внутри:
//   * документы: у каждого имя, текст и время правки. Безымянный документ
//     получает имя untitled1.md, untitled2.md и так далее;
//   * автосохранение: script.js зовёт setValue() по таймеру тишины;
//   * история: снимки текста (не чаще раза в HIST_GAP_MS и на переходах
//     между документами). Родной undo Monaco живёт только внутри сессии и
//     не сериализуется, поэтому перезагрузку переживают именно снимки.
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.MathmdStore = api;
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  var KEY = "mathmd-docs-v1";
  var HIST_MAX = 30;              // снимков на документ
  var HIST_GAP_MS = 120000;       // не чаще снимка раз в две минуты правки
  var MAX_BYTES = 3.5 * 1024 * 1024;  // мягкий предел до квоты localStorage
  var NAME_MAX = 60;

  function fresh() {
    return { v: 1, current: "", seq: 0, docs: [] };
  }

  // Имя документа: убираем то, чем нельзя называть файл, и достраиваем .md.
  function cleanName(raw, fallback) {
    var s = String(raw == null ? "" : raw).replace(/[\x00-\x1f\x7f]/g, "");
    s = s.replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();
    if (!s) return fallback;
    if (s.length > NAME_MAX) s = s.slice(0, NAME_MAX).trim();
    if (!/\.[a-z0-9]{1,5}$/i.test(s)) s += ".md";
    return s;
  }

  function create(storage, opts) {
    opts = opts || {};
    var now = opts.now || function () { return Date.now(); };
    var state = fresh();
    var persistent = !!storage;    // получается ли писать в localStorage
    var degraded = false;          // пришлось ли резать историю из-за объёма

    function read() {
      if (!storage) return;
      var raw = null;
      try { raw = storage.getItem(KEY); } catch (e) { persistent = false; return; }
      if (!raw) return;
      var parsed = null;
      try { parsed = JSON.parse(raw); } catch (e) { return; }
      if (!parsed || !Array.isArray(parsed.docs)) return;
      state = {
        v: 1,
        current: typeof parsed.current === "string" ? parsed.current : "",
        seq: typeof parsed.seq === "number" ? parsed.seq : 0,
        docs: parsed.docs.filter(function (d) { return d && typeof d.value === "string"; })
          .map(function (d) {
            return {
              id: String(d.id || ""),
              name: String(d.name || ""),
              value: d.value,
              updated: Number(d.updated) || 0,
              hist: Array.isArray(d.hist) ? d.hist.filter(function (h) {
                return h && typeof h.v === "string" && typeof h.t === "number";
              }) : [],
              hi: typeof d.hi === "number" ? d.hi : -1,
            };
          }),
      };
      if (!doc(state.current)) state.current = state.docs.length ? state.docs[0].id : "";
    }

    function doc(id) {
      for (var i = 0; i < state.docs.length; i++) {
        if (state.docs[i].id === id) return state.docs[i];
      }
      return null;
    }

    function cur() {
      var d = doc(state.current);
      if (d) return d;
      return state.docs.length ? state.docs[0] : null;
    }

    function byteLen() {
      try { return JSON.stringify(state).length; } catch (e) { return 0; }
    }

    // Срезаем историю, пока не влезем в мягкий предел: сначала каждый второй
    // снимок, потом всю историю. Текст документов не трогаем никогда.
    function shrink() {
      var rounds = 0;
      while (byteLen() > MAX_BYTES && rounds < 40) {
        var cut = false;
        for (var i = 0; i < state.docs.length; i++) {
          var d = state.docs[i];
          if (d.hist.length > 1) {
            var keep = [];
            for (var j = 0; j < d.hist.length; j += 2) keep.push(d.hist[j]);
            // текущая позиция должна остаться валидной
            d.hist = keep;
            d.hi = Math.min(d.hi, d.hist.length - 1);
            if (d.hi < 0) d.hi = d.hist.length - 1;
            cut = true;
            degraded = true;
          }
        }
        if (!cut) break;
        rounds++;
      }
    }

    function flush() {
      if (!storage) return false;
      shrink();
      var payload;
      try { payload = JSON.stringify(state); } catch (e) { return false; }
      try {
        storage.setItem(KEY, payload);
        return true;
      } catch (e) {
        // Квота: жертвуем историей, она восстанавливаема только частично —
        // текст документов важнее.
        for (var i = 0; i < state.docs.length; i++) {
          state.docs[i].hist = [];
          state.docs[i].hi = -1;
        }
        degraded = true;
        try {
          storage.setItem(KEY, JSON.stringify(state));
          return true;
        } catch (e2) {
          persistent = false;
          return false;
        }
      }
    }

    function nextUntitled() {
      var max = 0;
      for (var i = 0; i < state.docs.length; i++) {
        var m = /^untitled(\d+)\.md$/i.exec(state.docs[i].name);
        if (m) max = Math.max(max, parseInt(m[1], 10));
      }
      state.seq = Math.max(state.seq, max) + 1;
      return "untitled" + state.seq + ".md";
    }

    function newId() {
      return "d" + now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
    }

    function addDoc(name, value) {
      var d = {
        id: newId(),
        name: cleanName(name, "") || nextUntitled(),
        value: typeof value === "string" ? value : "",
        updated: now(),
        hist: [],
        hi: -1,
      };
      state.docs.push(d);
      state.current = d.id;
      return d;
    }

    // --- история ------------------------------------------------------------
    //
    // hist — зафиксированные версии, hi — та, что показана сейчас. Текущее
    // (ещё не зафиксированное) состояние живёт в value; перед навигацией оно
    // фиксируется, чтобы «вперёд» вернуло ровно то, что было на экране.

    // Зафиксировать версию. Если мы стоим не на конце истории (пользователь
    // откатился назад и правит дальше) — «будущее» стирается: новая правка
    // отменяет откат, как в обычном undo.
    function commit(d, value) {
      if (d.hi < d.hist.length - 1) d.hist.length = d.hi + 1;
      if (d.hist.length && d.hist[d.hist.length - 1].v === value) {
        d.hi = d.hist.length - 1;
        return false;
      }
      d.hist.push({ t: now(), v: value });
      if (d.hist.length > HIST_MAX) d.hist.shift();
      d.hi = d.hist.length - 1;
      return true;
    }

    // Текущее состояние на экране обязано быть зафиксировано перед навигацией,
    // иначе «вперёд» вернёт не то, что было видно.
    function ensureCommitted(d) {
      if (d.hi >= 0 && d.hi < d.hist.length && d.hist[d.hi].v === d.value) return false;
      return commit(d, d.value);
    }

    // Периодический снимок (автосохранение): не чаще HIST_GAP_MS, чтобы правка
    // не превращалась в сотню версий. Пропущенное не теряется — перед откатом
    // ensureCommitted всё равно зафиксирует текущий текст.
    function snap(d) {
      var last = d.hist.length ? d.hist[d.hist.length - 1] : null;
      if (last && last.v === d.value) return false;
      if (last && d.hi === d.hist.length - 1 && now() - last.t < HIST_GAP_MS) return false;
      return commit(d, d.value);
    }

    function histInfo(d) {
      return { index: d.hi, total: d.hist.length, ts: d.hi >= 0 ? d.hist[d.hi].t : 0 };
    }

    read();

    return {
      KEY: KEY,
      HIST_MAX: HIST_MAX,

      // --- документы ---
      list: function () {
        return state.docs
          .map(function (d) { return { id: d.id, name: d.name, updated: d.updated, size: d.value.length }; })
          .sort(function (a, b) { return b.updated - a.updated; });
      },
      count: function () { return state.docs.length; },
      current: function () {
        var d = cur();
        return d ? { id: d.id, name: d.name, value: d.value, updated: d.updated } : null;
      },
      currentId: function () { return state.current; },
      isPersistent: function () { return persistent; },
      wasDegraded: function () { return degraded; },
      clearDegraded: function () { degraded = false; },

      // Текст текущего документа. Пустая строка — это «черновика нет»:
      // по ней script.js решает, можно ли грузить пример по ссылке.
      setValue: function (value) {
        var d = cur();
        if (!d) d = addDoc("", value);
        if (d.value === value) return false;
        d.value = String(value == null ? "" : value);
        d.updated = now();
        return true;
      },
      isEmpty: function () {
        var d = cur();
        return !d || d.value.trim() === "";
      },

      newDoc: function (value) {
        var d = cur();
        if (d) ensureCommitted(d);
        var created = addDoc("", value);
        flush();
        return { id: created.id, name: created.name };
      },
      openDoc: function (id) {
        var d = doc(id);
        if (!d) return null;
        var was = cur();
        if (was && was.id !== d.id) ensureCommitted(was);
        state.current = d.id;
        flush();
        return { id: d.id, name: d.name, value: d.value };
      },
      // Открыть файл с диска: документ с таким именем переиспользуем, новый —
      // заводим. Так повторное открытие того же файла не плодит копии.
      openNamed: function (name, value) {
        var clean = cleanName(name, "");
        var was = cur();
        var found = null;
        for (var i = 0; i < state.docs.length; i++) {
          if (state.docs[i].name === clean) { found = state.docs[i]; break; }
        }
        if (!found) {
          if (was) ensureCommitted(was);
          found = addDoc(clean, value);
        } else {
          if (was && was.id !== found.id) ensureCommitted(was);
          state.current = found.id;
          found.value = String(value == null ? "" : value);
          found.updated = now();
        }
        snap(found);
        flush();
        return { id: found.id, name: found.name };
      },
      rename: function (name) {
        var d = cur();
        if (!d) return null;
        var clean = cleanName(name, d.name);
        if (!clean || clean === d.name) return null;
        d.name = clean;
        d.updated = now();
        flush();
        return { id: d.id, name: d.name };
      },
      remove: function (id) {
        var was = cur();
        for (var i = 0; i < state.docs.length; i++) {
          if (state.docs[i].id === id) {
            var name = state.docs[i].name;
            state.docs.splice(i, 1);
            if (state.current === id) state.current = state.docs.length ? state.docs[0].id : "";
            flush();
            return { name: name };
          }
        }
        return null;
      },
      clearAll: function () {
        state = fresh();
        flush();
      },

      // --- история ---
      // Принудительный снимок: нужен там, где текст вот-вот заменят целиком
      // (пример, файл с диска) — обычный snapshot пропустил бы его по гэпу.
      mark: function () {
        var d = cur();
        if (!d) return false;
        var changed = ensureCommitted(d);
        flush();
        return changed;
      },
      snapshot: function () {
        var d = cur();
        if (!d || !d.value) return false;
        snap(d);
        flush();
        return true;
      },
      historyInfo: function () {
        var d = cur();
        return d ? histInfo(d) : { index: -1, total: 0, ts: 0 };
      },
      back: function () {
        var d = cur();
        if (!d) return null;
        ensureCommitted(d);
        if (d.hi <= 0) return null;
        d.hi -= 1;
        d.value = d.hist[d.hi].v;
        d.updated = now();
        flush();
        return { value: d.value, index: d.hi, total: d.hist.length, ts: d.hist[d.hi].t };
      },
      forward: function () {
        var d = cur();
        if (!d || d.hi < 0) return null;
        if (d.hi >= d.hist.length - 1) return null;
        d.hi += 1;
        d.value = d.hist[d.hi].v;
        d.updated = now();
        flush();
        return { value: d.value, index: d.hi, total: d.hist.length, ts: d.hist[d.hi].t };
      },

      flush: flush,
    };
  }

  return { create: create, KEY: KEY, cleanName: cleanName };
});
