const statisCacheName = "static-site-v2";

const ASSETS = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/css/materialize.min.css",
  "./js/app.js",
  "./js/ui.js",
  "./js/materialize.min.js",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2",
];

self.addEventListener("install", async (event) => {
  console.log("service worker has been installed");

  const cache = await caches.open(statisCacheName); //открываем кеш, даем ему название
  await cache.addAll(ASSETS); //добавляем массив с даннми для fetch-зпросов которые выполнятся и результаты пойдут в кеша
});

self.addEventListener("activate", async (event) => {
  console.log("service worker has been activate");
  //массив со всеми версиями кеша
  const cachesKeysArr = await caches.keys();

  //соберем массив промисов тех ключей, которые надо удалить
  await Promise.all(
    cachesKeysArr
      .filter((key) => key !== statisCacheName)
      .map((key) => caches.delete(key))
  );
});
self.addEventListener("fetch", (event) => {
  console.log("fetch", event.request.url);
  //сравниваем кеш и запросы которые в реквесте
  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      //возвращаем кеш или делаем фетч если кеш не совпал при метче
      return cacheRes || fetch(event.request);
    })
  );
});
