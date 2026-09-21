import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocsFromServer,
  getDocFromServer,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* ==========================================
   FIREBASE
========================================== */

const firebaseConfig = {
  apiKey: "AIzaSyAc8_gEr9O26MTmECEEqhUPSdqpbpOHBxo",
  authDomain: "bsit-na-1a-j.firebaseapp.com",
  projectId: "bsit-na-1a-j",
  storageBucket: "bsit-na-1a-j.firebasestorage.app",
  messagingSenderId: "154328167720",
  appId: "1:154328167720:web:a7ecc2af99128f09ae4c1d"
};


const app =
  initializeApp(firebaseConfig);


const db =
  initializeFirestore(app, {
    localCache:
      persistentLocalCache({
        tabManager:
          persistentMultipleTabManager()
      })
  });


const auth =
  getAuth(app);


/* ==========================================
   VARIABLES
========================================== */

const $ = id =>
  document.getElementById(id);


const subjects = [
  "All",
  "CC2(M)",
  "CC2(WF)",
  "CC1",
  "PATH FIT 1",
  "NSTP 1",
  "STS 1",
  "PLF",
  "ENG",
  "HUM 1"
];


const officers = [
  {
    role: "Mayor",
    name: "Xantheigh Robles"
  },
  {
    role: "Vice Mayor",
    name: "Airiz Shanaya"
  },
  {
    role: "Secretary",
    name: "Kurt Orito"
  },
  {
    role: "Treasurer",
    name: "Jack Daniel Pasion"
  },
  {
    role: "Auditor",
    name: "Honey Antiquina"
  },
  {
    role: "Public Information Officer (PIO)",
    name: "Joyce Cortez"
  }
];


let currentFilter = "All";

let currentSort = "newest";

let announcements = [];


/* ==========================================
   OFFLINE CACHE
========================================== */

const ANNOUNCEMENT_CACHE =
  "bsit-na-1a-last-viewed-announcements";


const EVENT_CACHE =
  "bsit-na-1a-last-viewed-important-event";


/* ==========================================
   ONLINE / OFFLINE
========================================== */

function isOnline() {
  return navigator.onLine;
}


/* ==========================================
   HELPERS
========================================== */

function esc(value = "") {

  return String(value).replace(
    /[&<>'"]/g,
    c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[c])
  );
}


function msg(
  id,
  text,
  error = false
) {

  const element =
    $(id);

  if (!element)
    return;

  element.textContent =
    text;

  element.style.color =
    error
      ? "#7b1018"
      : "#666";
}


function setButtonLoading(
  button,
  loadingText,
  normalText
) {

  if (!button)
    return;


  if (loadingText) {

    button.disabled = true;

    button.dataset.originalText =
      normalText ||
      button.textContent;

    button.textContent =
      loadingText;

  } else {

    button.disabled = false;

    button.textContent =
      button.dataset.originalText ||
      normalText ||
      button.textContent;
  }
}


function friendlyError(err) {

  const code =
    err?.code || "";


  const map = {

    "auth/invalid-credential":
      "Incorrect email or password.",

    "auth/invalid-email":
      "Please enter a valid email.",

    "auth/network-request-failed":
      "Network error. Please check your internet connection.",

    "auth/api-key-not-valid":
      "Firebase API key is invalid. Check the Firebase configuration.",

    "permission-denied":
      "You do not have permission to do that.",

    "failed-precondition":
      "This action could not be completed right now.",

    "unavailable":
      "Firebase is temporarily unavailable. Please try again."
  };


  return (
    map[code] ||
    err?.message ||
    "Something went wrong. Please try again."
  );
}


/* ==========================================
   LAST VIEWED ANNOUNCEMENTS CACHE
========================================== */

function saveAnnouncementsToCache(list) {

  try {

    const cleanList =
      list.map(
        a => ({
          id:
            a.id || "",

          subject:
            a.subject || "",

          title:
            a.title || "",

          details:
            a.details || "",

          dueDate:
            a.dueDate || "",

          createdAt:
            a.createdAt || null,

          updatedAt:
            a.updatedAt || null
        })
      );


    localStorage.setItem(
      ANNOUNCEMENT_CACHE,
      JSON.stringify(cleanList)
    );

  } catch (err) {

    console.warn(
      "Unable to save offline announcements:",
      err
    );
  }
}


function loadAnnouncementsFromCache() {

  try {

    const saved =
      localStorage.getItem(
        ANNOUNCEMENT_CACHE
      );


    if (!saved)
      return false;


    const parsed =
      JSON.parse(saved);


    if (!Array.isArray(parsed))
      return false;


    announcements =
      parsed;


    renderFilters();

    renderAnnouncements();


    return true;

  } catch (err) {

    console.warn(
      "Unable to read offline announcements:",
      err
    );


    return false;
  }
}


/* ==========================================
   LAST VIEWED EVENT CACHE
========================================== */

function saveEventToCache(event) {

  try {

    const cleanEvent = {

      label:
        event.label || "",

      title:
        event.title || "",

      date:
        event.date || "",

      details:
        event.details || ""
    };


    localStorage.setItem(
      EVENT_CACHE,
      JSON.stringify(cleanEvent)
    );

  } catch (err) {

    console.warn(
      "Unable to save offline event:",
      err
    );
  }
}


function loadEventFromCache() {

  try {

    const saved =
      localStorage.getItem(
        EVENT_CACHE
      );


    if (!saved)
      return false;


    const event =
      JSON.parse(saved);


    if (!event)
      return false;


    displayImportantEvent(
      event
    );


    return true;

  } catch (err) {

    console.warn(
      "Unable to read offline event:",
      err
    );


    return false;
  }
}


function removeEventFromCache() {

  try {

    localStorage.removeItem(
      EVENT_CACHE
    );

  } catch (err) {

    console.warn(err);
  }
}


/* ==========================================
   OFFLINE DISPLAY
========================================== */

function showOfflineMessage() {

  const cached =
    loadAnnouncementsFromCache();


  if (!cached) {

    $("announcementGrid")
      .innerHTML = `
        <div class="no-announcements">

          <strong>
            No offline announcements available.
          </strong>

          <p>
            Connect to the internet once to load the announcements.
          </p>

        </div>
      `;
  }


  const eventCached =
    loadEventFromCache();


  if (!eventCached) {

    $("importantEvent")
      .classList
      .add("hidden");
  }
}


/* ==========================================
   SCREEN CONTROL
========================================== */

function showAdminLogin() {

  $("loginSection")
    .classList
    .remove("hidden");


  $("adminContent")
    .classList
    .add("hidden");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  setTimeout(
    () =>
      $("adminEmail").focus(),
    100
  );
}


function hideAdminLogin() {

  $("loginSection")
    .classList
    .add("hidden");


  msg(
    "loginMessage",
    ""
  );
}


function showAdminContent() {

  $("loginSection")
    .classList
    .add("hidden");


  $("adminContent")
    .classList
    .remove("hidden");


  $("studentContent")
    .classList
    .remove("hidden");


  $("accountBadge")
    .classList
    .remove("hidden");


  $("logoutBtn")
    .classList
    .remove("hidden");


  $("accountBadge")
    .textContent =
    "Admin";


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function showPublicSite() {

  $("loginSection")
    .classList
    .add("hidden");


  $("adminContent")
    .classList
    .add("hidden");


  $("accountBadge")
    .classList
    .add("hidden");


  $("logoutBtn")
    .classList
    .add("hidden");


  $("studentContent")
    .classList
    .remove("hidden");
}


/* ==========================================
   PASSWORD EYE
========================================== */

const eyeClosed = `
<svg
viewBox="0 0 24 24"
aria-hidden="true">

<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/>

<circle
cx="12"
cy="12"
r="3"/>

</svg>
`;


const eyeOpen = `
<svg
viewBox="0 0 24 24"
aria-hidden="true">

<path d="M3 3l18 18"/>

<path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>

<path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a17.4 17.4 0 0 1-3.2 4.2"/>

<path d="M6.2 6.2C3.5 8.2 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1"/>

</svg>
`;


function setupPasswordToggle(
  buttonId,
  inputId,
  iconId
) {

  const button =
    $(buttonId);

  const input =
    $(inputId);

  const icon =
    $(iconId);


  if (
    !button ||
    !input ||
    !icon
  ) {
    return;
  }


  icon.innerHTML =
    eyeClosed;


  button.setAttribute(
    "aria-label",
    "Show password"
  );


  button.addEventListener(
    "click",
    () => {

      const isPassword =
        input.type === "password";


      if (isPassword) {

        input.type = "text";

        icon.innerHTML =
          eyeOpen;

        button.setAttribute(
          "aria-label",
          "Hide password"
        );

      } else {

        input.type = "password";

        icon.innerHTML =
          eyeClosed;

        button.setAttribute(
          "aria-label",
          "Show password"
        );
      }
    }
  );
}


setupPasswordToggle(
  "toggleAdminPassword",
  "adminPassword",
  "adminEyeIcon"
);


/* ==========================================
   ADMIN LOGIN OPEN / CLOSE
========================================== */

$("adminIconBtn").addEventListener(
  "click",
  () => {

    if (auth.currentUser) {

      showAdminContent();

      return;
    }


    showAdminLogin();
  }
);


$("closeLoginBtn").addEventListener(
  "click",
  hideAdminLogin
);


$("backToSiteBtn").addEventListener(
  "click",
  showPublicSite
);


/* ==========================================
   ADMIN LOGIN
========================================== */

$("adminLoginForm").addEventListener(
  "submit",
  async e => {

    e.preventDefault();


    msg(
      "loginMessage",
      ""
    );


    const button =
      $("adminLoginSubmit");


    setButtonLoading(
      button,
      "Signing in...",
      "Sign In"
    );


    try {

      await signInWithEmailAndPassword(
        auth,
        $("adminEmail")
          .value
          .trim(),

        $("adminPassword")
          .value
      );

    } catch (err) {

      console.error(err);


      msg(
        "loginMessage",
        friendlyError(err),
        true
      );


      setButtonLoading(
        button,
        null,
        "Sign In"
      );
    }
  }
);


/* ==========================================
   LOGOUT
========================================== */

$("logoutBtn").addEventListener(
  "click",
  async () => {

    try {

      await signOut(auth);

      showPublicSite();

    } catch (err) {

      console.error(err);
    }
  }
);


/* ==========================================
   REFRESH
========================================== */

$("refreshBtn").addEventListener(
  "click",
  async () => {

    const button =
      $("refreshBtn");


    if (!isOnline()) {

      showOfflineMessage();

      return;
    }


    setButtonLoading(
      button,
      "Refreshing...",
      "Refresh"
    );


    await loadAnnouncements();

    await loadImportantEvent();


    setButtonLoading(
      button,
      null,
      "Refresh"
    );
  }
);


/* ==========================================
   SEARCH
========================================== */

$("searchInput").addEventListener(
  "input",
  renderAnnouncements
);


/* ==========================================
   SORT
========================================== */

$("sortSelect").addEventListener(
  "change",
  () => {

    currentSort =
      $("sortSelect").value;

    renderAnnouncements();
  }
);


/* ==========================================
   FILTERS
========================================== */

function renderFilters() {

  $("subjectFilters").innerHTML =
    subjects
      .map(
        s => `
          <button
            type="button"
            class="filter-btn ${
              currentFilter === s
                ? "active"
                : ""
            }"
            data-subject="${esc(s)}">

            ${esc(s)}

          </button>
        `
      )
      .join("");


  document
    .querySelectorAll(
      ".filter-btn"
    )
    .forEach(
      btn => {

        btn.addEventListener(
          "click",
          () => {

            currentFilter =
              btn.dataset.subject;

            renderFilters();

            renderAnnouncements();
          }
        );
      }
    );
}


/* ==========================================
   LOAD ANNOUNCEMENTS
========================================== */

async function loadAnnouncements() {

  if (!isOnline()) {

    showOfflineMessage();

    return;
  }


  try {

    const snap =
      await getDocsFromServer(
        collection(
          db,
          "announcements"
        )
      );


    announcements =
      snap.docs.map(
        d => ({
          id: d.id,
          ...d.data()
        })
      );


    /*
     * Only save the cache after
     * successfully receiving the
     * current server data.
     */

    saveAnnouncementsToCache(
      announcements
    );


    renderFilters();

    renderAnnouncements();


  } catch (err) {

    console.warn(
      "Unable to get current online announcements:",
      err
    );


    showOfflineMessage();
  }
}


/* ==========================================
   SORT HELPERS
========================================== */

function getTimestampValue(
  timestamp
) {

  if (!timestamp)
    return 0;


  if (
    typeof timestamp === "object" &&
    typeof timestamp.toMillis === "function"
  ) {

    return timestamp.toMillis();
  }


  return (
    new Date(timestamp).getTime() ||
    0
  );
}


function getDueDateValue(
  date
) {

  if (!date)
    return Number.MAX_SAFE_INTEGER;


  return new Date(
    date + "T00:00:00"
  ).getTime();
}


/* ==========================================
   DISPLAY ANNOUNCEMENTS
========================================== */

function renderAnnouncements() {

  const search =
    $("searchInput")
      .value
      .trim()
      .toLowerCase();


  let list =
    currentFilter === "All"
      ? [...announcements]
      : announcements.filter(
          a =>
            a.subject ===
            currentFilter
        );


  if (search) {

    list =
      list.filter(
        a => {

          const searchable =
            `${a.subject || ""} ${
              a.title || ""
            } ${
              a.details || ""
            }`.toLowerCase();


          return searchable.includes(
            search
          );
        }
      );
  }


  list.sort(
    (a, b) => {

      if (
        currentSort ===
        "oldest"
      ) {

        return (
          getTimestampValue(
            a.createdAt
          ) -
          getTimestampValue(
            b.createdAt
          )
        );
      }


      if (
        currentSort ===
        "deadlineSoon"
      ) {

        return (
          getDueDateValue(
            a.dueDate
          ) -
          getDueDateValue(
            b.dueDate
          )
        );
      }


      if (
        currentSort ===
        "deadlineLate"
      ) {

        return (
          getDueDateValue(
            b.dueDate
          ) -
          getDueDateValue(
            a.dueDate
          )
        );
      }


      return (
        getTimestampValue(
          b.updatedAt
        ) -
        getTimestampValue(
          a.updatedAt
        )
      );
    }
  );


  if (!list.length) {

    $("announcementGrid")
      .innerHTML = `
        <div class="no-announcements">
          No announcements found.
        </div>
      `;

    return;
  }


  $("announcementGrid")
    .innerHTML =
    list
      .map(
        a => `
          <article
            class="announcement-card">

            <div
              class="announcement-subject">

              ${esc(
                a.subject ||
                "CLASS"
              )}

            </div>


            <h3>
              ${esc(
                a.title || ""
              )}
            </h3>


            <p class="details">
              ${esc(
                a.details || ""
              )}
            </p>


            <strong
              class="announcement-date">

              Due:
              ${esc(
                formatDate(
                  a.dueDate
                )
              )}

            </strong>

          </article>
        `
      )
      .join("");
}


/* ==========================================
   SUBJECT SELECT
========================================== */

function populateSubjectSelect() {

  $("subjectInput").innerHTML =
    subjects
      .filter(
        s => s !== "All"
      )
      .map(
        s =>
          `<option value="${esc(s)}">${esc(s)}</option>`
      )
      .join("");
}


/* ==========================================
   OFFICERS
========================================== */

function renderOfficers() {

  $("officerGrid")
    .innerHTML =
    officers
      .map(
        officer => `
          <div
            class="officer-card">

            <div
              class="officer-role">

              ${esc(
                officer.role
              )}

            </div>


            <h3>
              ${esc(
                officer.name
              )}
            </h3>

          </div>
        `
      )
      .join("");
}


/* ==========================================
   DATE
========================================== */

function formatDate(date) {

  if (!date)
    return "No date";


  const d =
    new Date(
      date +
      "T00:00:00"
    );


  return isNaN(d)

    ? date

    : d.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric"
        }
      );
}


/* ==========================================
   ADD / EDIT ANNOUNCEMENT
========================================== */

$("announcementForm").addEventListener(
  "submit",
  async e => {

    e.preventDefault();


    if (!isOnline()) {

      msg(
        "adminMessage",
        "You need an internet connection to save announcements.",
        true
      );

      return;
    }


    const id =
      $("announcementId")
        .value;


    const data = {

      subject:
        $("subjectInput")
          .value,

      title:
        $("titleInput")
          .value
          .trim(),

      details:
        $("detailsInput")
          .value
          .trim(),

      dueDate:
        $("dateInput")
          .value,

      updatedAt:
        serverTimestamp()
    };


    const button =
      $("saveAnnouncementBtn");


    setButtonLoading(
      button,
      "Saving...",
      "Save Announcement"
    );


    try {

      if (id) {

        await updateDoc(
          doc(
            db,
            "announcements",
            id
          ),
          data
        );


        msg(
          "adminMessage",
          "Changes saved successfully."
        );

      } else {

        await addDoc(
          collection(
            db,
            "announcements"
          ),
          {
            ...data,

            createdAt:
              serverTimestamp()
          }
        );


        msg(
          "adminMessage",
          "Announcement saved successfully."
        );
      }


      resetAnnouncementForm();


      await loadAnnouncements();


      await loadAdminList();


    } catch (err) {

      console.error(err);


      msg(
        "adminMessage",
        friendlyError(err),
        true
      );


    } finally {

      setButtonLoading(
        button,
        null,
        "Save Announcement"
      );
    }
  }
);


/* ==========================================
   ADMIN LIST
========================================== */

async function loadAdminList() {

  if (!isOnline()) {

    $("adminList")
      .innerHTML = `
        <p>
          Connect to the internet to manage announcements.
        </p>
      `;

    return;
  }


  try {

    const snap =
      await getDocsFromServer(
        collection(
          db,
          "announcements"
        )
      );


    const list =
      snap.docs
        .map(
          d => ({
            id: d.id,
            ...d.data()
          })
        )
        .sort(
          (a, b) =>
            getDueDateValue(
              a.dueDate
            ) -
            getDueDateValue(
              b.dueDate
            )
        );


    $("adminList")
      .innerHTML =
      list.length

        ? list
            .map(
              a => `

                <div class="admin-item">

                  <span>

                    ${esc(
                      a.subject || ""
                    )}

                    <strong>
                      ${esc(
                        a.title || ""
                      )}
                    </strong>

                    ${esc(
                      formatDate(
                        a.dueDate
                      )
                    )}

                  </span>


                  <div
                    class="admin-item-actions">

                    <button
                      type="button"
                      data-edit="${esc(a.id)}">

                      Edit

                    </button>


                    <button
                      type="button"
                      data-delete="${esc(a.id)}">

                      Delete

                    </button>

                  </div>

                </div>
              `
            )
            .join("")

        : `<p>No announcements yet.</p>`;


    document
      .querySelectorAll(
        "[data-edit]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () =>
              editAnnouncement(
                button.dataset.edit
              )
          );
        }
      );


    document
      .querySelectorAll(
        "[data-delete]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () =>
              deleteAnnouncement(
                button.dataset.delete
              )
          );
        }
      );


  } catch (err) {

    console.error(
      "Admin list error:",
      err
    );


    $("adminList")
      .innerHTML = `
        <p>
          Unable to load announcements.
        </p>
      `;
  }
}


/* ==========================================
   EDIT
========================================== */

async function editAnnouncement(id) {

  if (!isOnline()) {

    msg(
      "adminMessage",
      "Connect to the internet to edit announcements.",
      true
    );

    return;
  }


  try {

    const snap =
      await getDocFromServer(
        doc(
          db,
          "announcements",
          id
        )
      );


    if (!snap.exists())
      return;


    const a =
      snap.data();


    $("announcementId")
      .value = id;


    $("subjectInput")
      .value =
      a.subject ||
      "CC2(M)";


    $("titleInput")
      .value =
      a.title || "";


    $("detailsInput")
      .value =
      a.details || "";


    $("dateInput")
      .value =
      a.dueDate || "";


    $("formTitle")
      .textContent =
      "Edit Announcement";


    $("saveAnnouncementBtn")
      .textContent =
      "Save Changes";


    $("cancelEditBtn")
      .classList
      .remove("hidden");


    $("adminContent")
      .scrollIntoView({
        behavior: "smooth",
        block: "start"
      });


  } catch (err) {

    console.error(err);


    msg(
      "adminMessage",
      friendlyError(err),
      true
    );
  }
}


/* ==========================================
   DELETE
========================================== */

async function deleteAnnouncement(id) {

  if (!isOnline()) {

    msg(
      "adminMessage",
      "Connect to the internet to delete announcements.",
      true
    );

    return;
  }


  if (
    !confirm(
      "Delete this announcement?"
    )
  ) {
    return;
  }


  try {

    await deleteDoc(
      doc(
        db,
        "announcements",
        id
      )
    );


    msg(
      "adminMessage",
      "Announcement deleted."
    );


    await loadAnnouncements();

    await loadAdminList();


  } catch (err) {

    console.error(err);


    msg(
      "adminMessage",
      friendlyError(err),
      true
    );
  }
}


/* ==========================================
   CANCEL EDIT
========================================== */

$("cancelEditBtn").addEventListener(
  "click",
  resetAnnouncementForm
);


function resetAnnouncementForm() {

  $("announcementForm")
    .reset();


  $("announcementId")
    .value = "";


  $("formTitle")
    .textContent =
    "Add Announcement";


  $("saveAnnouncementBtn")
    .textContent =
    "Save Announcement";


  $("cancelEditBtn")
    .classList
    .add("hidden");
}


/* ==========================================
   IMPORTANT EVENT DISPLAY
========================================== */

function displayImportantEvent(
  event
) {

  if (!event) {

    $("importantEvent")
      .classList
      .add("hidden");

    return;
  }


  $("eventLabel")
    .textContent =
    event.label || "";


  $("eventTitle")
    .textContent =
    event.title || "";


  $("eventDate")
    .textContent =
    event.date || "";


  $("eventDetails")
    .textContent =
    event.details || "";


  $("importantEvent")
    .classList
    .remove("hidden");
}


/* ==========================================
   LOAD IMPORTANT EVENT
========================================== */

async function loadImportantEvent() {

  if (!isOnline()) {

    const cached =
      loadEventFromCache();


    if (!cached) {

      $("importantEvent")
        .classList
        .add("hidden");
    }


    return;
  }


  try {

    const snap =
      await getDocFromServer(
        doc(
          db,
          "siteSettings",
          "importantEvent"
        )
      );


    if (!snap.exists()) {

      removeEventFromCache();


      $("importantEvent")
        .classList
        .add("hidden");


      return;
    }


    const event =
      snap.data();


    const cleanEvent = {

      label:
        event.label || "",

      title:
        event.title || "",

      date:
        event.date || "",

      details:
        event.details || ""
    };


    saveEventToCache(
      cleanEvent
    );


    displayImportantEvent(
      cleanEvent
    );


  } catch (err) {

    console.warn(
      "Unable to get current online event:",
      err
    );


    const cached =
      loadEventFromCache();


    if (!cached) {

      $("importantEvent")
        .classList
        .add("hidden");
    }
  }
}


/* ==========================================
   LOAD EVENT FOR ADMIN
========================================== */

async function loadEventForAdmin() {

  if (!isOnline()) {

    $("eventMessage")
      .textContent =
      "Connect to the internet to manage the important event.";

    return;
  }


  try {

    const snap =
      await getDocFromServer(
        doc(
          db,
          "siteSettings",
          "importantEvent"
        )
      );


    if (!snap.exists()) {

      resetEventForm();

      return;
    }


    const event =
      snap.data();


    $("eventLabelInput")
      .value =
      event.label || "";


    $("eventTitleInput")
      .value =
      event.title || "";


    $("eventDateInput")
      .value =
      event.date || "";


    $("eventDetailsInput")
      .value =
      event.details || "";


  } catch (err) {

    console.error(
      "Unable to load event:",
      err
    );
  }
}


/* ==========================================
   SAVE IMPORTANT EVENT
========================================== */

$("eventForm").addEventListener(
  "submit",
  async e => {

    e.preventDefault();


    if (!isOnline()) {

      msg(
        "eventMessage",
        "You need an internet connection to save the event.",
        true
      );

      return;
    }


    const button =
      $("saveEventBtn");


    const data = {

      label:
        $("eventLabelInput")
          .value
          .trim(),

      title:
        $("eventTitleInput")
          .value
          .trim(),

      date:
        $("eventDateInput")
          .value
          .trim(),

      details:
        $("eventDetailsInput")
          .value
          .trim(),

      updatedAt:
        serverTimestamp()
    };


    setButtonLoading(
      button,
      "Saving...",
      "Save Event"
    );


    try {

      await setDoc(
        doc(
          db,
          "siteSettings",
          "importantEvent"
        ),
        data
      );


      const cleanEvent = {

        label:
          data.label,

        title:
          data.title,

        date:
          data.date,

        details:
          data.details
      };


      saveEventToCache(
        cleanEvent
      );


      displayImportantEvent(
        cleanEvent
      );


      msg(
        "eventMessage",
        "Important event saved successfully."
      );


    } catch (err) {

      console.error(
        "Unable to save important event:",
        err
      );


      msg(
        "eventMessage",
        friendlyError(err),
        true
      );


    } finally {

      setButtonLoading(
        button,
        null,
        "Save Event"
      );
    }
  }
);


/* ==========================================
   REMOVE IMPORTANT EVENT
========================================== */

$("removeEventBtn").addEventListener(
  "click",
  async () => {

    if (!isOnline()) {

      msg(
        "eventMessage",
        "Connect to the internet to remove the event.",
        true
      );

      return;
    }


    if (
      !confirm(
        "Remove the important event from the student page?"
      )
    ) {
      return;
    }


    const button =
      $("removeEventBtn");


    setButtonLoading(
      button,
      "Removing...",
      "Remove Event"
    );


    try {

      await deleteDoc(
        doc(
          db,
          "siteSettings",
          "importantEvent"
        )
      );


      removeEventFromCache();


      $("importantEvent")
        .classList
        .add("hidden");


      resetEventForm();


      msg(
        "eventMessage",
        "Important event removed."
      );


    } catch (err) {

      console.error(err);


      msg(
        "eventMessage",
        friendlyError(err),
        true
      );


    } finally {

      setButtonLoading(
        button,
        null,
        "Remove Event"
      );
    }
  }
);


/* ==========================================
   RESET EVENT FORM
========================================== */

function resetEventForm() {

  $("eventForm")
    .reset();
}


/* ==========================================
   AUTH STATE
========================================== */

onAuthStateChanged(
  auth,
  async user => {

    if (!user) {

      showPublicSite();

      return;
    }


    try {

      /*
       * IMPORTANT:
       *
       * There is NO hard-coded admin UID.
       *
       * Firebase checks:
       *
       * admins/{user.uid}
       *
       * and requires:
       *
       * role == "admin"
       *
       * This allows BOTH admin accounts
       * to work automatically.
       */

      const adminSnap =
        await getDoc(
          doc(
            db,
            "admins",
            user.uid
          )
        );


      if (
        adminSnap.exists() &&
        adminSnap.data().role === "admin"
      ) {

        showAdminContent();


        populateSubjectSelect();


        await loadAdminList();


        await loadEventForAdmin();


        return;
      }


      /*
       * The Firebase Auth account exists,
       * but there is no matching authorized
       * admin document.
       */

      await signOut(auth);


      showPublicSite();


      showAdminLogin();


      msg(
        "loginMessage",
        "This account is not authorized as an admin.",
        true
      );


    } catch (err) {

      console.error(
        "Auth/Firestore error:",
        err
      );


      if (!isOnline()) {

        showPublicSite();

        return;
      }


      await signOut(auth);


      showPublicSite();


      showAdminLogin();


      msg(
        "loginMessage",
        friendlyError(err),
        true
      );
    }
  }
);


/* ==========================================
   ONLINE / OFFLINE EVENTS
========================================== */

window.addEventListener(
  "offline",
  () => {

    console.log(
      "Device is offline. Showing last viewed announcements."
    );


    showOfflineMessage();
  }
);


window.addEventListener(
  "online",
  async () => {

    console.log(
      "Device is online. Updating announcements."
    );


    await loadAnnouncements();

    await loadImportantEvent();
  }
);


/* ==========================================
   SERVICE WORKER
========================================== */

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register(
          "./service-worker.js"
        )
        .then(
          registration => {

            console.log(
              "Service worker registered:",
              registration.scope
            );
          }
        )
        .catch(
          error => {

            console.warn(
              "Service worker registration failed:",
              error
            );
          }
        );
    }
  );
}


/* ==========================================
   INITIALIZE
========================================== */

populateSubjectSelect();

renderOfficers();

renderFilters();


if (isOnline()) {

  loadAnnouncements();

  loadImportantEvent();

} else {

  showOfflineMessage();
}
