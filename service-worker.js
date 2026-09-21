const CACHE_NAME =
  "bsit-na-1a-site-v1";


const FILES_TO_CACHE = [

  "./",

  "./index.html",

  "./style.css",

  "./script.js",

  /*
   * Firebase modules used by script.js.
   */
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js",

  "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js",

  "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js"
];


/* ==========================================
   INSTALL
========================================== */

self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches.open(
        CACHE_NAME
      )
      .then(
        async cache => {

          /*
           * Cache each file separately.
           *
           * If one external Firebase file
           * cannot be cached, the rest of
           * the website can still be cached.
           */

          await Promise.all(
            FILES_TO_CACHE.map(
              async url => {

                try {

                  const response =
                    await fetch(
                      url,
                      {
                        cache: "no-cache"
                      }
                    );


                  if (
                    response.ok ||
                    response.type === "opaque"
                  ) {

                    await cache.put(
                      url,
                      response
                    );
                  }

                } catch (error) {

                  console.warn(
                    "Could not cache:",
                    url
                  );
                }
              }
            )
          );
        }
      )
    );


    /*
     * Activate the new service worker
     * immediately.
     */

    self.skipWaiting();
  }
);


/* ==========================================
   ACTIVATE
========================================== */

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches.keys()
        .then(
          cacheNames =>
            Promise.all(
              cacheNames
                .filter(
                  name =>
                    name !==
                    CACHE_NAME
                )
                .map(
                  name =>
                    caches.delete(
                      name
                    )
                )
            )
        )
    );


    self.clients.claim();
  }
);


/* ==========================================
   FETCH
========================================== */

self.addEventListener(
  "fetch",
  event => {

    /*
     * Only handle GET requests.
     */

    if (
      event.request.method !==
      "GET"
    ) {
      return;
    }


    event.respondWith(

      caches.match(
        event.request
      )
      .then(
        cachedResponse => {

          /*
           * If the website file is already
           * cached, use it immediately.
           *
           * This allows the page itself to
           * open without internet.
           */

          if (cachedResponse) {

            return cachedResponse;
          }


          /*
           * For anything not cached,
           * try the internet normally.
           */

          return fetch(
            event.request
          );
        }
      )
    );
  }
);
