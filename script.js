import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
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

  apiKey:
    "AIzaSyA8rMg6Ygf7q5L80xPndSKR8B7jG-okICE",

  authDomain:
    "bsit-na-1a-j.firebaseapp.com",

  projectId:
    "bsit-na-1a-j",

  storageBucket:
    "bsit-na-1a-j.firebasestorage.app",

  messagingSenderId:
    "154328167720",

  appId:
    "1:154328167720:web:a7ecc2af99128f09ae4c1d"

};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* ==========================================
   VARIABLES
   ========================================== */

const $ = id =>
  document.getElementById(id);


const subjects = [
  "All",
  "CC",
  "PLF",
  "STS",
  "NSTP",
  "PE"
];


let currentFilter = "All";

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
      "\"": "&quot;"
    }[c])
  );

}


function showLoading(text) {

  $("loadingText").textContent = text;

  $("loadingBox")
    .classList
    .remove("hidden");

}


function hideLoading() {

  $("loadingBox")
    .classList
    .add("hidden");

}


function msg(id, text, error = false) {

  $(id).textContent = text;

  $(id).style.color =
    error
      ? "#7b1018"
      : "#666";

}


/* ==========================================
   SCREEN CONTROL
   ========================================== */

function setScreen(mode) {

  $("loginSection")
    .classList
    .toggle(
      "hidden",
      mode !== "login"
    );

  $("registerSection")
    .classList
    .toggle(
      "hidden",
      mode !== "register"
    );

  $("studentContent")
    .classList
    .toggle(
      "hidden",
      mode !== "student"
    );

  $("adminContent")
    .classList
    .toggle(
      "hidden",
      mode !== "admin"
    );

  $("logoutBtn")
    .classList
    .toggle(
      "hidden",
      !["student", "admin"].includes(mode)
    );

}


/* ==========================================
   PASSWORD EYES
   ========================================== */

/*
   These SVG icons are created directly in JavaScript.

   This means Acode does NOT need:
   eye-open.png
   eye-closed.png

   They work even when the image files are not
   available in your project folder.
*/

const eyeClosed = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="24"
     height="24"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     stroke-width="2"
     stroke-linecap="round"
     stroke-linejoin="round">
  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
  <circle cx="12" cy="12" r="3"/>
</svg>
`;


const eyeOpen = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="24"
     height="24"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     stroke-width="2"
     stroke-linecap="round"
     stroke-linejoin="round">
  <path d="M3 3l18 18"/>
  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
  <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-3.1 4.4"/>
  <path d="M6.6 6.6C3.5 8.5 2 12 2 12s3 8 10 8a10.7 10.7 0 0 0 3.3-.5"/>
</svg>
`;


/*
   Convert the SVG icons into data URLs.
   This is similar to using Base64, but it keeps
   the JavaScript much shorter.
*/

const eyeClosedIcon =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(eyeClosed);

const eyeOpenIcon =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(eyeOpen);


/*
   Password toggle function
*/

function setupPasswordToggle(
  buttonId,
  inputId,
  iconId
) {

  const button = $(buttonId);
  const input = $(inputId);
  const icon = $(iconId);

  if (!button || !input || !icon) {
    return;
  }


  /*
     Set the initial icon.
  */

  icon.src = eyeClosedIcon;

  icon.alt = "Show password";


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

        /*
           Show password
        */

        input.type = "text";

        icon.src = eyeOpenIcon;

        icon.alt = "Hide password";

        button.setAttribute(
          "aria-label",
          "Hide password"
        );

      } else {

        /*
           Hide password
        */

        input.type = "password";

        icon.src = eyeClosedIcon;

        icon.alt = "Show password";

        button.setAttribute(
          "aria-label",
          "Show password"
        );

      }

    }
  );

}


/*
   STUDENT LOGIN PASSWORD
*/

setupPasswordToggle(
  "toggleLoginPassword",
  "password",
  "loginEyeIcon"
);


/*
   ADMIN LOGIN PASSWORD
*/

setupPasswordToggle(
  "toggleAdminPassword",
  "adminPassword",
  "adminEyeIcon"
);


/*
   REGISTER PASSWORD
*/

setupPasswordToggle(
  "toggleRegisterPassword",
  "registerPassword",
  "registerEyeIcon"
);


/*
   CONFIRM PASSWORD
*/

setupPasswordToggle(
  "toggleConfirmPassword",
  "registerConfirmPassword",
  "confirmEyeIcon"
);


/* ==========================================
   LOGIN TABS
   ========================================== */

$("studentTab").addEventListener(
  "click",
  () => {

    $("studentTab")
      .classList
      .add("active");

    $("adminTab")
      .classList
      .remove("active");

    $("studentLoginBox")
      .classList
      .remove("hidden");

    $("adminLoginBox")
      .classList
      .add("hidden");

  }
);


$("adminTab").addEventListener(
  "click",
  () => {

    $("adminTab")
      .classList
      .add("active");

    $("studentTab")
      .classList
      .remove("active");

    $("adminLoginBox")
      .classList
      .remove("hidden");

    $("studentLoginBox")
      .classList
      .add("hidden");

  }
);


/* ==========================================
   CREATE ACCOUNT
   ========================================== */

$("registerBtn").addEventListener(
  "click",
  () => {

    msg("loginMessage", "");

    setScreen("register");

  }
);


$("backToLoginBtn").addEventListener(
  "click",
  () => {

    msg("registerMessage", "");

    setScreen("login");

  }
);


/* ==========================================
   STUDENT LOGIN
   ========================================== */

$("studentLoginForm").addEventListener(
  "submit",
  async e => {

    e.preventDefault();

    msg("loginMessage", "");

    showLoading("Signing in...");


    try {

      await signInWithEmailAndPassword(
        auth,
        $("emailInput").value.trim(),
        $("password").value
      );

    } catch (err) {

      hideLoading();

      msg(
        "loginMessage",
        friendlyError(err),
        true
      );

    }

  }
);


/* ==========================================
   ADMIN LOGIN
   ========================================== */

$("adminLoginForm").addEventListener(
  "submit",
  async e => {

    e.preventDefault();

    msg("adminLoginMessage", "");

    showLoading("Signing in...");


    try {

      await signInWithEmailAndPassword(
        auth,
        $("adminEmail").value.trim(),
        $("adminPassword").value
      );

    } catch (err) {

      hideLoading();

      msg(
        "adminLoginMessage",
        friendlyError(err),
        true
      );

    }

  }
);


/* ==========================================
   REGISTER
   ========================================== */

$("registerForm").addEventListener(
  "submit",
  async e => {

    e.preventDefault();


    const password =
      $("registerPassword").value;


    const confirm =
      $("registerConfirmPassword").value;


    if (password !== confirm) {

      msg(
        "registerMessage",
        "Passwords do not match.",
        true
      );

      return;

    }


    showLoading("Creating account...");


    try {

      const cred =
        await createUserWithEmailAndPassword(
          auth,
          $("registerEmail").value.trim(),
          password
        );


      await setDoc(
        doc(
          db,
          "users",
          cred.user.uid
        ),
        {
          username:
            $("registerUsername").value.trim(),

          email:
            cred.user.email,

          role:
            "student",

          createdAt:
            serverTimestamp()
        }
      );


    } catch (err) {

      hideLoading();

      msg(
        "registerMessage",
        friendlyError(err),
        true
      );

    }

  }
);


/* ==========================================
   LOGOUT / BUTTONS
   ========================================== */

$("logoutBtn").addEventListener(
  "click",
  async () => {

    await signOut(auth);

  }
);


$("refreshBtn").addEventListener(
  "click",
  loadAnnouncements
);


$("seedBtn").addEventListener(
  "click",
  seedCurrentAnnouncements
);


/* ==========================================
   ERROR MESSAGES
   ========================================== */

function friendlyError(err) {

  const code =
    err?.code || "";


  const map = {

    "auth/invalid-credential":
      "Incorrect email or password.",

    "auth/invalid-email":
      "Please enter a valid email.",

    "auth/email-already-in-use":
      "That email is already registered.",

    "auth/weak-password":
      "Password should be at least 6 characters.",

    "permission-denied":
      "You do not have permission to do that."

  };


  return map[code] ||
    err?.message ||
    "Something went wrong. Please try again.";

}


/* ==========================================
   AUTH STATE
   ========================================== */

onAuthStateChanged(
  auth,
  async user => {

    hideLoading();


    if (!user) {

      $("accountBadge")
        .textContent =
        "Not signed in";

      setScreen("login");

      return;

    }


    $("accountBadge")
      .textContent =
      user.email ||
      "Signed in";


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
        adminSnap.exists() &&
        adminSnap.data().role === "admin"
      ) {

        setScreen("admin");

        populateSubjectSelect();

        await loadAdminList();

      } else {

        setScreen("student");

        await loadAnnouncements();

      }


    } catch (err) {

      console.error(err);

      setScreen("student");

      await loadAnnouncements();

    }

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
            class="filter-btn ${
              s === currentFilter
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
      snap.docs
        .map(
          d => ({
            id: d.id,
            ...d.data()
          })
        )
        .sort(
          (a, b) =>
            String(
              a.dueDate || ""
            ).localeCompare(
              String(
                b.dueDate || ""
              )
            )
        );


    renderFilters();

    renderAnnouncements();


  } catch (err) {

    console.error(err);

    $("announcementGrid").innerHTML =
      `
        <div class="no-announcements">
          Unable to load announcements.
        </div>
      `;

  }

}


/* ==========================================
   DISPLAY ANNOUNCEMENTS
   ========================================== */

function renderAnnouncements() {

  const list =
    currentFilter === "All"
      ? announcements
      : announcements.filter(
          a =>
            a.subject ===
            currentFilter
        );


  if (!list.length) {

    $("announcementGrid").innerHTML =
      `
        <div class="no-announcements">
          No announcements available.
        </div>
      `;

    return;

  }


  $("announcementGrid").innerHTML =
    list
      .map(
        a => `
          <article class="announcement-card">

            <span class="subject-tag">
              ${esc(
                a.subject ||
                "CLASS"
              )}
            </span>

            <h3>
              ${esc(a.title)}
            </h3>

            <p class="details">
              ${esc(a.details)}
            </p>

            <small>
              <strong>Due:</strong>
              ${esc(
                formatDate(
                  a.dueDate
                )
              )}
            </small>

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
          `
            <option value="${esc(s)}">
              ${esc(s)}
            </option>
          `
      )
      .join("");

}


/* ==========================================
   DATE
   ========================================== */

function formatDate(date) {

  if (!date) {
    return "No date";
  }


  const d =
    new Date(
      date + "T00:00:00"
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
      $("announcementId").value;


    const data = {

      subject:
        $("subjectInput").value,

      title:
        $("titleInput").value.trim(),

      details:
        $("detailsInput").value.trim(),

      dueDate:
        $("dueDateInput").value,

      updatedAt:
        serverTimestamp()

    };


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

      }


      msg(
        "adminMessage",
        "Announcement saved."
      );


      resetAnnouncementForm();

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
            String(
              a.dueDate || ""
            ).localeCompare(
              String(
                b.dueDate || ""
              )
            )
        );


    $("adminList").innerHTML =
      list.length

        ? list
            .map(
              a => `
                <div class="admin-item">

                  <small>
                    ${esc(
                      a.subject || ""
                    )}
                  </small>

                  <strong>
                    ${esc(a.title)}
                  </strong>

                  <span>
                    ${esc(
                      formatDate(
                        a.dueDate
                      )
                    )}
                  </span>

                  <div
                    class="admin-item-actions">

                    <button
                      data-edit="${a.id}">
                      Edit
                    </button>

                    <button
                      data-delete="${a.id}">
                      Delete
                    </button>

                  </div>

                </div>
              `
            )
            .join("")

        : `
          <p class="small-text">
            No announcements yet.
          </p>
        `;


    document
      .querySelectorAll(
        "[data-edit]"
      )
      .forEach(
        b =>
          b.addEventListener(
            "click",
            () =>
              editAnnouncement(
                b.dataset.edit
              )
          )
      );


    document
      .querySelectorAll(
        "[data-delete]"
      )
      .forEach(
        b =>
          b.addEventListener(
            "click",
            () =>
              deleteAnnouncement(
                b.dataset.delete
              )
          )
      );


  } catch (err) {

    $("adminList").innerHTML =
      `
        <p class="message">
          Unable to load announcements.
        </p>
      `;

    console.error(err);

  }

}


/* ==========================================
   EDIT
   ========================================== */

async function editAnnouncement(id) {

  const snap =
    await getDoc(
      doc(
        db,
        "announcements",
        id
      )
    );


  if (!snap.exists()) {
    return;
  }


  const a =
    snap.data();


  $("announcementId").value =
    id;

  $("subjectInput").value =
    a.subject || "CC";

  $("titleInput").value =
    a.title || "";

  $("detailsInput").value =
    a.details || "";

  $("dueDateInput").value =
    a.dueDate || "";

  $("formTitle").textContent =
    "Edit Announcement";

  $("cancelEditBtn")
    .classList
    .remove("hidden");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

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


    await loadAdminList();


  } catch (err) {

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

  $("announcementForm").reset();

  $("announcementId").value =
    "";

  $("formTitle").textContent =
    "Add Announcement";

  $("cancelEditBtn")
    .classList
    .add("hidden");

}


/* ==========================================
   LOAD CURRENT ANNOUNCEMENTS
   ========================================== */

async function seedCurrentAnnouncements() {

  const sample = [

    {
      subject: "CC",
      title: "CC Announcement",
      details:
        "Please check your class instructions and prepare for the next activity.",
      dueDate: "2026-09-18"
    },

    {
      subject: "PLF",
      title: "PLF Midterm Review",
      details:
        "Review Chapters 1–3 for the online midterm.",
      dueDate: "2026-09-22"
    },

    {
      subject: "STS",
      title: "STS Reminder",
      details:
        "Check the latest class instructions and submission requirements.",
      dueDate: "2026-09-20"
    }

  ];


  try {

    showLoading(
      "Loading announcements..."
    );


    for (const a of sample) {

      await addDoc(
        collection(
          db,
          "announcements"
        ),
        {
          ...a,
          createdAt:
            serverTimestamp(),
          updatedAt:
            serverTimestamp()
        }
      );

    }


    await loadAdminList();

    hideLoading();

    msg(
      "adminMessage",
      "Current announcements loaded."
    );


  } catch (err) {

    hideLoading();

    msg(
      "adminMessage",
      friendlyError(err),
      true
    );

  }

}


/* ==========================================
   INITIALIZE
   ========================================== */

populateSubjectSelect();
