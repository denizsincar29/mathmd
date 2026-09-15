// Проверка словаря i18n без браузера: все ключи есть на четырёх языках, и
// каждый ключ, который зовут из кода, в словаре есть. Пропущенный перевод
// виден только тому, кто на этом языке работает, — то есть не сразу.
//
// Запуск: node test/i18n.test.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const LANGS = ["ru", "en", "de", "tr"];

let failed = 0;
function ok(name, cond, extra) {
  console.log((cond ? "ok   " : "FAIL ") + name + (cond || !extra ? "" : " — " + extra));
  if (!cond) failed++;
}

const src = fs.readFileSync(path.join(ROOT, "i18n.js"), "utf8");
const from = src.indexOf("var DICT = {");
const to = src.indexOf("\n  };", from);
ok("в i18n.js найден словарь", from >= 0 && to > from);
const dict = src.slice(from, to);

// Каждая запись словаря начинается строкой из четырёх пробелов и кавычки.
const entries = new Map();
for (const chunk of dict.split(/\n    (?=")/)) {
  const m = /^\s*"([^"]+)":\s*\{/.exec(chunk);
  if (m) entries.set(m[1], chunk);
}
ok("словарь разобран", entries.size > 100, "записей: " + entries.size);

const missing = [];
for (const [key, chunk] of entries) {
  const absent = LANGS.filter((l) => !new RegExp("(^|[\\s{,])" + l + ":").test(chunk));
  if (absent.length) missing.push(key + " → нет " + absent.join("/"));
}
ok("у каждого ключа есть все четыре языка", missing.length === 0, missing.slice(0, 5).join("; "));

const used = new Set();
for (const file of ["script.js", "cloud.js", "index.html", "i18n.js"]) {
  const text = fs.readFileSync(path.join(ROOT, file), "utf8");
  for (const m of text.matchAll(/I18N\.(?:t|add)\(\s*"([^"]+)"/g)) used.add(m[1]);
  // Ключи из разметки: data-i18n="ключ" и data-i18n-attr.
  for (const m of text.matchAll(/data-i18n[a-z-]*="([^"]+)"/g)) {
    for (const key of m[1].split(",")) used.add(key.trim());
  }
}
const unknown = [...used].filter((key) => !entries.has(key)).sort();
ok("все зовущиеся ключи есть в словаре", unknown.length === 0,
  "ключей " + used.size + ", лишних: " + unknown.slice(0, 5).join(", "));

// Ключ, который зовут, но не перевели, печатается как есть — для незрячего
// это строка «msg.something» посреди русской речи.
ok("новый ключ про создание документа на месте", entries.has("msg.cloudNew"));

console.log(failed ? "\nПРОВАЛОВ: " + failed : "\nвсё чисто");
process.exitCode = failed ? 1 : 0;
