// Проверка cloud.js без браузера: подставляем window и fetch и смотрим, что
// редактор шлёт в облако. Главное здесь — пути с кириллицей и папками:
// «ДЗ/ИИ/задачи» обязано уехать тремя закодированными сегментами.

// Запуск: node test/cloud.test.mjs   (ничего ставить не нужно)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, "..", "cloud.js"), "utf8");

let calls = [];
let route = () => ({ status: 200, body: {} });

globalThis.window = {};
globalThis.fetch = async (url, init) => {
  calls.push({ url, init });
  const r = route(url, init);
  if (r.throw) throw new Error("network down");
  return {
    ok: r.status >= 200 && r.status < 300,
    status: r.status,
    text: async () => (typeof r.body === "string" ? r.body : JSON.stringify(r.body)),
  };
};

(0, eval)(src);
const C = globalThis.window.MathmdCloud;

let failed = 0;
function ok(name, cond, extra) {
  if (cond) {
    console.log("ok   " + name);
  } else {
    failed++;
    console.log("FAIL " + name + (extra ? " — " + extra : ""));
  }
}

ok("адрес облака по умолчанию", C.base === "https://mdcloud.denizsincar.ru", C.base);

// --- путь с кириллицей и папками ------------------------------------------
const docUrl = C.docUrl("deniz", "ДЗ/ИИ/задачи");
ok(
  "docUrl кодирует каждый сегмент",
  docUrl === "https://mdcloud.denizsincar.ru/deniz/%D0%94%D0%97/%D0%98%D0%98/%D0%B7%D0%B0%D0%B4%D0%B0%D1%87%D0%B8",
  docUrl
);

calls = [];
route = () => ({ status: 200, body: { path: "ДЗ/ИИ/задачи", content: "# Задачи" } });
const doc = await C.load("deniz", "ДЗ/ИИ/задачи");
ok(
  "load: путь из сегментов",
  calls[0].url ===
    "https://mdcloud.denizsincar.ru/api/docs/deniz/%D0%94%D0%97/%D0%98%D0%98/%D0%B7%D0%B0%D0%B4%D0%B0%D1%87%D0%B8",
  calls[0].url
);
ok("load: текст документа вернулся", doc.content === "# Задачи");
ok("load: кука едет с запросом", calls[0].init.credentials === "include");

// --- запись ----------------------------------------------------------------
calls = [];
route = () => ({ status: 200, body: { owner: "deniz", path: "ДЗ/ИИ/задачи" } });
await C.save("deniz", "ДЗ/ИИ/задачи", { content: "# Новое", title: "Задачи" });
ok("save: метод PUT", calls[0].init.method === "PUT");
ok("save: заголовок JSON", calls[0].init.headers["Content-Type"] === "application/json");
ok(
  "save: тело — markdown и заголовок",
  calls[0].init.body === JSON.stringify({ content: "# Новое", title: "Задачи" }),
  calls[0].init.body
);
ok("save: путь ведёт в api/docs", calls[0].url.includes("/api/docs/deniz/"), calls[0].url);

// Ведущий слэш в пути не должен превратиться в пустой сегмент: /api/docs/deniz//x.
calls = [];
await C.save("deniz", "/заметка", { content: "x" });
ok("save: ведущий слэш срезан", calls[0].url.endsWith("/api/docs/deniz/%D0%B7%D0%B0%D0%BC%D0%B5%D1%82%D0%BA%D0%B0"), calls[0].url);

// --- вход и «кто я» --------------------------------------------------------
calls = [];
route = () => ({ status: 200, body: { user: { username: "deniz" } } });
const user = await C.login("deniz", "parol1234");
ok("login: вернулся пользователь", user.username === "deniz");
ok("login: POST с телом", calls[0].init.method === "POST" && calls[0].init.body.includes("parol1234"));

route = () => ({ status: 401, body: { error: "нужен вход" } });
ok("me без входа — null, а не ошибка", (await C.me()) === null);

route = () => ({ status: 200, body: { user: { username: "deniz" } } });
const me = await C.me();
ok("me со входом — пользователь", me.username === "deniz");

// --- список ---------------------------------------------------------------
calls = [];
route = () => ({ status: 200, body: { docs: [{ path: "а" }, { path: "б" }] } });
const docs = await C.list();
ok("list: свои документы", docs.length === 2);
calls = [];
await C.list("vasilisa");
ok("list чужого владельца идёт без /api/docs (публичный список)", calls[0].url.endsWith("/api/docs/vasilisa"), calls[0].url);

// --- выход -----------------------------------------------------------------
route = () => ({ status: 401, body: { error: "нужен вход" } });
let logoutThrew = false;
try {
  await C.logout();
} catch (err) {
  logoutThrew = true;
}
ok("logout без сессии не падает", !logoutThrew);

// --- ошибки ----------------------------------------------------------------
route = () => ({ status: 403, body: { error: "регистрация по приглашению: нужен код" } });
let msg = "";
try {
  await C.login("a", "b");
} catch (err) {
  msg = err.message;
  ok("ошибка: код ответа сохранён", err.status === 403, String(err.status));
}
ok("ошибка: текст от сервера", msg === "регистрация по приглашению: нужен код", msg);

route = () => ({ status: 200, body: "<html>не json</html>" });
let badBody = "";
try {
  await C.list();
} catch (err) {
  badBody = err.message;
}
ok("ошибка: не-JSON ответ объяснён", badBody === "облако ответило не по-нашему", badBody);

route = () => ({ throw: true });
let netErr = "";
try {
  await C.list();
} catch (err) {
  netErr = err.message;
}
ok("ошибка: сеть недоступна", netErr === "облако не отвечает: проверьте связь", netErr);

console.log(failed ? "\nПРОВАЛОВ: " + failed : "\nвсё чисто");
process.exit(failed ? 1 : 0);
