const CACHE_NAME =
  "bsit-na-1a-site-v2";


const FILES_TO_CACHE = [

  "./",

  "./index.html",

  "./style.css",

  "./script.js",

  "./service-worker.js"
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


                  if (response.ok) {

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
     * as soon as possible.
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


    /*
     * Take control of open pages
     * immediately.
     */

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
           * Use the cached version if
           * it is already available.
           */

          if (cachedResponse) {

            return cachedResponse;

          }


          /*
           * Otherwise, get it from
           * the internet.
           */

          return fetch(
            event.request
          );

        }
      )

    );

  }
);
