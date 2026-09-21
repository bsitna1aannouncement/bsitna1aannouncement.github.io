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
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* ==========================================
   VARIABLES
========================================== */

const $ = id => document.getElementById(id);

const ADMIN_UID =
  "ivsmIAHXaES7VA6n3UHTaYUTRMs2";


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

  const element = $(id);

  if (!element) return;

  element.textContent = text;

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

  if (!button) return;

  if (loadingText) {

    button.disabled = true;

    button.dataset.originalText =
      normalText || button.textContent;

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
    () => $("adminEmail").focus(),
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

  $("accountBadge")
    .classList
    .remove("hidden");

  $("accountBadge").textContent =
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

  const button = $(buttonId);
  const input = $(inputId);
  const icon = $(iconId);

  if (!button || !input || !icon)
    return;

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
        $("adminEmail").value.trim(),
        $("adminPassword").value
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
    .querySelectorAll(".filter-btn")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          currentFilter =
            btn.dataset.subject;

          renderFilters();

          renderAnnouncements();
        }
      );
    });
}


/* ==========================================
   LOAD ANNOUNCEMENTS
========================================== */

async function loadAnnouncements() {

  try {

    const snap =
      await getDocs(
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


    renderFilters();

    renderAnnouncements();

  } catch (err) {

    console.error(
      "Unable to load announcements:",
      err
    );


    $("announcementGrid").innerHTML = `
      <div class="no-announcements">

        <strong>
          Unable to load announcements.
        </strong>

        <p>
          Please check your internet connection and try again.
        </p>

      </div>
    `;
  }
}


/* ==========================================
   SORT HELPERS
========================================== */

function getTimestampValue(timestamp) {

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


function getDueDateValue(date) {

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

    $("announcementGrid").innerHTML = `
      <div class="no-announcements">
        No announcements found.
      </div>
    `;

    return;
  }


  $("announcementGrid").innerHTML =
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

  $("officerGrid").innerHTML =
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

  try {

    const snap =
      await getDocs(
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


    $("adminList").innerHTML =
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

    $("adminList").innerHTML = `
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

  try {

    const snap =
      await getDoc(
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
   IMPORTANT EVENT
========================================== */

async function loadImportantEvent() {

  try {

    const snap =
      await getDoc(
        doc(
          db,
          "siteSettings",
          "importantEvent"
        )
      );


    if (!snap.exists()) {

      $("importantEvent")
        .classList
        .add("hidden");

      return;
    }


    const event =
      snap.data();


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

  } catch (err) {

    console.error(
      "Unable to load important event:",
      err
    );
  }
}


/* ==========================================
   LOAD EVENT FOR ADMIN
========================================== */

async function loadEventForAdmin() {

  try {

    const snap =
      await getDoc(
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


      msg(
        "eventMessage",
        "Important event saved successfully."
      );


      await loadImportantEvent();

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


      resetEventForm();


      $("importantEvent")
        .classList
        .add("hidden");


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

  $("eventForm").reset();
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

      const adminSnap =
        await getDoc(
          doc(
            db,
            "admins",
            user.uid
          )
        );


      if (
        user.uid === ADMIN_UID &&
        adminSnap.exists() &&
        adminSnap.data().role === "admin"
      ) {

        showAdminContent();

        populateSubjectSelect();

        await loadAdminList();

        await loadEventForAdmin();

        return;
      }


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
   INITIALIZE
========================================== */

populateSubjectSelect();

renderOfficers();

renderFilters();

loadAnnouncements();

loadImportantEvent();
