// cloud.js — связь редактора с облаком документов mdcloud.
//
// Вход живёт в httpOnly-куке на общем домене: облако её ставит, браузер сам
// прикладывает к запросам и оттуда, и отсюда. Поэтому здесь нет ни токенов,
// ни localStorage — только fetch с credentials: "include". Токен в ответе на
// вход есть, но редактору он не нужен: кука уже работает.
//
// Адрес облака можно переопределить перед загрузкой: window.MATHMD_CLOUD.

(function () {
  "use strict";

  var BASE = String(window.MATHMD_CLOUD || "https://mdcloud.denizsincar.ru").replace(/\/+$/, "");

  // encodePath разбивает путь на сегменты и кодирует каждый: «ДЗ/ИИ/задачи»
  // должно дойти до сервера как путь из трёх частей, а не как одна строка.
  function encodePath(path) {
    return String(path)
      .split("/")
      .filter(function (part) {
        return part !== "";
      })
      .map(encodeURIComponent)
      .join("/");
  }

  // Ошибка с сохранённым кодом ответа: по 401 интерфейс понимает, что вход
  // нужен заново, а не что «что-то пошло не так».
  function CloudError(message, status) {
    var err = new Error(message);
    err.name = "CloudError";
    err.status = status;
    return err;
  }

  async function call(path, opts) {
    var init = {
      method: (opts && opts.method) || "GET",
      credentials: "include",
      headers: {},
    };
    if (opts && opts.body !== undefined) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(opts.body);
    }

    var resp;
    try {
      resp = await fetch(BASE + path, init);
    } catch (err) {
      throw CloudError("облако не отвечает: проверьте связь", 0);
    }

    var text = await resp.text();
    var data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw CloudError("облако ответило не по-нашему", resp.status);
      }
    }
    if (!resp.ok) {
      throw CloudError(data.error || "облако ответило ошибкой " + resp.status, resp.status);
    }
    return data;
  }

  // Документы: путь в облаке — это <владелец>/<папка>/<файл>. Владелец тот,
  // кто вошёл, поэтому в списке и сохранении он берётся из сессии.
  window.MathmdCloud = {
    base: BASE,

    // homeUrl — страница облака: там вход, регистрация по приглашению и
    // список документов глазами браузера. onTop — вкладка, в которой открыт
    // редактор: по ней и возвращаются назад. Имя даёт вызывающий (см.
    // script.js), здесь его взять неоткуда, а угаданное имя хуже, чем
    // отсутствие: браузер открыл бы вторую вкладку с тем же адресом.
    homeUrl: function (onTop) {
      return BASE + "/" + (onTop ? onTop + ".html" : "");
    },

    // pageUrl — страница документа в облаке: то место, откуда документ
    // открыли в редакторе и куда человек возвращается назад. У нового
    // документа, который ещё не сохранён, страницы нет.
    pageUrl: function (owner, path, onTop) {
      return BASE + "/" + encodeURIComponent(owner) + "/" + encodePath(path) +
        (onTop ? "?" + onTop : "");
    },

    // docUrl — открытая ссылка на документ. Приватный документ по ней
    // попросит вход, публичный покажет любому.
    docUrl: function (owner, path) {
      return BASE + "/" + encodeURIComponent(owner) + "/" + encodePath(path);
    },

    // me — кто вошёл. Без входа не ошибка, а null: это обычный вопрос.
    me: async function () {
      try {
        return (await call("/api/me")).user;
      } catch (err) {
        if (err.status === 401) return null;
        throw err;
      }
    },

    list: async function (owner) {
      if (owner) return (await call("/api/docs/" + encodeURIComponent(owner))).docs || [];
      return (await call("/api/docs")).docs || [];
    },

    load: function (owner, path) {
      return call("/api/docs/" + encodeURIComponent(owner) + "/" + encodePath(path));
    },

    // save создаёт документ, если его ещё нет, и правит, если есть. Поля,
    // которых нет в fields, остаются прежними — так сохранение текста не
    // сбрасывает видимость документа.
    save: function (owner, path, fields) {
      return call("/api/docs/" + encodeURIComponent(owner) + "/" + encodePath(path), {
        method: "PUT",
        body: fields || {},
      });
    },

    login: async function (login, password) {
      return (await call("/api/auth/login", { method: "POST", body: { login: login, password: password } })).user;
    },

    logout: async function () {
      try {
        await call("/api/auth/logout", { method: "POST" });
      } catch (err) {
        if (err.status !== 401) throw err; // выйти должно получиться всегда
      }
    },

    // config рассказывает, как сейчас с регистрацией: свободно, по
    // приглашению или закрыто.
    config: function () {
      return call("/api/config");
    },
  };
})();
