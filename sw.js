const statisCacheName = "static-site-v0";
const dinamicCacheName = "dinamic-site-v0";

const ASSETS = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/css/materialize.min.css",
  "./js/app.js",
  "./js/ui.js",
  "./js/materialize.min.js",
  "./offline.html",
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
  console.log("cachesKeysArr", cachesKeysArr);

  //соберем массив промисов тех ключей, которые надо удалить
  await Promise.all(
    cachesKeysArr
      .filter((key) => key !== statisCacheName)
      .map((key) => caches.delete(key))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(cacheFirst(event.request));

  //до рефакторинга:
  //сравниваем кеш и запросы которые в реквесте
  //   event.respondWith(
  //     caches.match(event.request).then((cacheRes) => {
  //       //возвращаем кеш или делаем фетч если кеш не совпал при метче
  //       return (
  //         cacheRes ||
  //         fetch(event.request).then((response) => {
  //           //откроем новый кеш и кладем в него не все, а responce по ключу, так же возвращаем  респонс
  //           return caches.open(dinamicCacheName).then((cache) => {
  //             cache.put(event.request.url, response.clone());
  //             return response;
  //           });
  //         })
  //       );
  //     })
  //   );
});

//рефакторинг кода, вынесем функции
async function cacheFirst(request) {
  const cached = await caches.match(request);
  console.log("cached in cacheFirst", cached);
  try {
    return cached ?? (await fetch(request));
  } catch (e) {
    console.log("--------------> error", e);
    return networkFirst(request);
  }
}

async function networkFirst(request) {
  const cache = await caches.open(dinamicCacheName);
  try {
    const response = await fetch(request);
    await cache.put(request, response.clone());
    return response;
  } catch (e) {
    console.log("catch error in networkFirst ", e);
    const cached = await cache.match(request);
    return cached;
  }
}
