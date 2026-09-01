// Service worker: PWA + offline. Bump CACHE_NAME whenever static assets
// change so old clients drop the stale cache on their next visit.
const CACHE_NAME = "mathmd-v35";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./i18n.js",
  "./script.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  // Cross-origin CDN (MathJax, Monaco, showdown, Desmos, chessjax).
  // Скрипты/модули НЕ перехватываем: если такой запрос однажды закешировался
  // как opaque (статус 0, без CORS-заголовков — так фечатся обычные <script>),
  // модульный import() по тому же URL падает («Failed to fetch dynamically
  // imported module» / «ServiceWorker перехватил запрос…»). Браузер грузит их
  // нативно через свой HTTP-кэш. Остальное (шрифты, картинки, CSS, fetch)
  // кешируем, но respondWith не может упасть — есть запасной fetch.
  if (url.origin !== self.location.origin) {
    if (event.request.destination === "script") return;
    event.respondWith(
      caches
        .match(event.request)
        .then((hit) => {
          if (hit && hit.status === 0) return fetch(event.request);
          return (
            hit ||
            fetch(event.request).then((response) => {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
              return response;
            })
          );
        })
        .catch(() => fetch(event.request))
    );
    return;
  }
  // Navigation: network first so a fresh deploy is picked up immediately.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }
  // Same-origin static assets: cache first, fetch on miss.
  event.respondWith(
    caches.match(event.request).then(
      (hit) =>
        hit ||
        fetch(event.request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
    )
  );
});
