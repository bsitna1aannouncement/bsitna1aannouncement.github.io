import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

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


// =====================================================
// ADMIN
// =====================================================

const ADMIN_UID = "ivsmIAHXaES7VA6n3UHTaYUTRMs2";


// =====================================================
// SUBJECTS
// =====================================================

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


// =====================================================
// CLASS OFFICERS
// =====================================================

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
        role: "PIO",
        name: "Joyce Cortez"
    }
];


// =====================================================
// DOM ELEMENTS
// =====================================================

const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");
const studentContent = document.getElementById("studentContent");
const adminContent = document.getElementById("adminContent");

const studentTab = document.getElementById("studentTab");
const adminTab = document.getElementById("adminTab");

const loginTitle = document.getElementById("loginTitle");
const loginHint = document.getElementById("loginHint");

const studentLoginForm = document.getElementById("studentLoginForm");
const adminLoginForm = document.getElementById("adminLoginForm");

const studentRegisterBox = document.getElementById("studentRegisterBox");

const registerBtn = document.getElementById("registerBtn");
const backToLoginBtn = document.getElementById("backToLoginBtn");

const registerForm = document.getElementById("registerForm");

const logoutBtn = document.getElementById("logoutBtn");
const accountBadge = document.getElementById("accountBadge");

const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");

const refreshBtn = document.getElementById("refreshBtn");

const subjectFilters = document.getElementById("subjectFilters");
const announcementGrid = document.getElementById("announcementGrid");

const officerGrid = document.getElementById("officerGrid");

const announcementForm = document.getElementById("announcementForm");

const announcementId = document.getElementById("announcementId");

const subjectInput = document.getElementById("subjectInput");
const titleInput = document.getElementById("titleInput");
const detailsInput = document.getElementById("detailsInput");
const dateInput = document.getElementById("dateInput");

const formTitle = document.getElementById("formTitle");

const cancelEditBtn = document.getElementById("cancelEditBtn");

const adminList = document.getElementById("adminList");
const adminMessage = document.getElementById("adminMessage");

const seedBtn = document.getElementById("seedBtn");


// =====================================================
// IMPORTANT EVENT DOM
// =====================================================

const importantEvent =
    document.getElementById("importantEvent");

const eventLabel =
    document.getElementById("eventLabel");

const eventTitle =
    document.getElementById("eventTitle");

const eventDate =
    document.getElementById("eventDate");

const eventDetails =
    document.getElementById("eventDetails");

const eventForm =
    document.getElementById("eventForm");

const eventLabelInput =
    document.getElementById("eventLabelInput");

const eventTitleInput =
    document.getElementById("eventTitleInput");

const eventDateInput =
    document.getElementById("eventDateInput");

const eventDetailsInput =
    document.getElementById("eventDetailsInput");

const removeEventBtn =
    document.getElementById("removeEventBtn");

const eventMessage =
    document.getElementById("eventMessage");


// =====================================================
// HELPER
// =====================================================

function msg(element, text, error = false) {

    if (!element) return;

    element.textContent = text;

    element.style.color =
        error ? "#7b1018" : "#666666";
}


// =====================================================
// SCREEN CONTROL
// =====================================================

function setScreen(screen) {

    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    studentContent.classList.add("hidden");
    adminContent.classList.add("hidden");

    logoutBtn.classList.add("hidden");

    if (screen === "login") {

        loginSection.classList.remove("hidden");

        accountBadge.textContent = "Not signed in";

    }

    if (screen === "register") {

        registerSection.classList.remove("hidden");

        accountBadge.textContent = "Not signed in";

    }

    if (screen === "student") {

        studentContent.classList.remove("hidden");

        logoutBtn.classList.remove("hidden");

    }

    if (screen === "admin") {

        adminContent.classList.remove("hidden");

        logoutBtn.classList.remove("hidden");

    }
}


// =====================================================
// LOGIN TABS
// =====================================================

studentTab.addEventListener("click", () => {

    studentTab.classList.add("active");
    adminTab.classList.remove("active");

    loginTitle.textContent = "Student Login";

    loginHint.textContent =
        "Sign in to view class announcements.";

    studentLoginForm.classList.remove("hidden");
    adminLoginForm.classList.add("hidden");

    studentRegisterBox.classList.remove("hidden");

    msg(loginMessage, "");

});


adminTab.addEventListener("click", () => {

    adminTab.classList.add("active");
    studentTab.classList.remove("active");

    loginTitle.textContent = "Admin Login";

    loginHint.textContent =
        "Sign in using the administrator account.";

    adminLoginForm.classList.remove("hidden");
    studentLoginForm.classList.add("hidden");

    studentRegisterBox.classList.add("hidden");

    msg(loginMessage, "");

});


// =====================================================
// PASSWORD EYE
// =====================================================

const eyeOpen =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z'/%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3C/svg%3E";

const eyeClosed =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 3l18 18'/%3E%3Cpath d='M10.6 10.6a2 2 0 0 0 2.8 2.8'/%3E%3Cpath d='M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a17.8 17.8 0 0 1-3.1 4.2'/%3E%3Cpath d='M6.6 6.6C3.6 8.6 2 12 2 12s3.5 8 10 8a10.8 10.8 0 0 0 3-.4'/%3E%3C/svg%3E";


function setupPasswordToggle(
    inputId,
    buttonId,
    iconId
) {

    const input =
        document.getElementById(inputId);

    const button =
        document.getElementById(buttonId);

    const icon =
        document.getElementById(iconId);

    if (!input || !button || !icon) return;

    icon.src = eyeOpen;

    button.addEventListener("click", () => {

        if (input.type === "password") {

            input.type = "text";

            icon.src = eyeClosed;

            button.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            input.type = "password";

            icon.src = eyeOpen;

            button.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    });
}


setupPasswordToggle(
    "password",
    "toggleLoginPassword",
    "loginEyeIcon"
);

setupPasswordToggle(
    "adminPassword",
    "toggleAdminPassword",
    "adminEyeIcon"
);

setupPasswordToggle(
    "registerPassword",
    "toggleRegisterPassword",
    "registerEyeIcon"
);

setupPasswordToggle(
    "registerConfirmPassword",
    "toggleConfirmPassword",
    "confirmEyeIcon"
);


// =====================================================
// STUDENT LOGIN
// =====================================================

studentLoginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        msg(loginMessage, "Signing in...");

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            msg(loginMessage, "");

        } catch (error) {

            console.error(error);

            msg(
                loginMessage,
                "Invalid email or password.",
                true
            );

        }

    }
);


// =====================================================
// ADMIN LOGIN
// =====================================================

adminLoginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        msg(loginMessage, "Signing in...");

        const email =
            document.getElementById("adminEmail").value.trim();

        const password =
            document.getElementById("adminPassword").value;

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            msg(loginMessage, "");

        } catch (error) {

            console.error(error);

            msg(
                loginMessage,
                "Invalid admin email or password.",
                true
            );

        }

    }
);


// =====================================================
// REGISTER BUTTON
// =====================================================

registerBtn.addEventListener("click", () => {

    loginSection.classList.add("hidden");

    registerSection.classList.remove("hidden");

    msg(registerMessage, "");

});


// =====================================================
// BACK TO LOGIN
// =====================================================

backToLoginBtn.addEventListener("click", () => {

    registerSection.classList.add("hidden");

    loginSection.classList.remove("hidden");

    studentTab.classList.add("active");
    adminTab.classList.remove("active");

    studentLoginForm.classList.remove("hidden");
    adminLoginForm.classList.add("hidden");

    studentRegisterBox.classList.remove("hidden");

    loginTitle.textContent =
        "Student Login";

    loginHint.textContent =
        "Sign in to view class announcements.";

    msg(registerMessage, "");

});


// =====================================================
// STUDENT REGISTRATION
// =====================================================

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const username =
            document
                .getElementById("registerUsername")
                .value
                .trim();

        const email =
            document
                .getElementById("registerEmail")
                .value
                .trim();

        const password =
            document
                .getElementById("registerPassword")
                .value;

        const confirmPassword =
            document
                .getElementById("registerConfirmPassword")
                .value;


        if (password !== confirmPassword) {

            msg(
                registerMessage,
                "Passwords do not match.",
                true
            );

            return;
        }


        msg(
            registerMessage,
            "Creating account..."
        );


        try {

            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            await setDoc(
                doc(
                    db,
                    "users",
                    credential.user.uid
                ),
                {
                    username: username,
                    email: email,
                    role: "student",
                    createdAt: serverTimestamp()
                }
            );


            msg(
                registerMessage,
                "Account created successfully."
            );


        } catch (error) {

            console.error(error);

            msg(
                registerMessage,
                error.message,
                true
            );

        }

    }
);


// =====================================================
// LOGOUT
// =====================================================

logoutBtn.addEventListener(
    "click",
    async () => {

        await signOut(auth);

        setScreen("login");

        studentLoginForm.reset();
        adminLoginForm.reset();

        msg(loginMessage, "");

    }
);


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            setScreen("login");

            return;
        }


        accountBadge.textContent =
            user.email || "Signed in";


        try {

            const adminSnap =
                await getDoc(
                    doc(
                        db,
                        "admins",
                        user.uid
                    )
                );


            const isAdmin =
                user.uid === ADMIN_UID &&
                adminSnap.exists() &&
                adminSnap.data().role === "admin";


            if (isAdmin) {

                setScreen("admin");

                populateSubjectSelect();

                await loadAdminList();

                await loadEventForAdmin();

            } else {

                setScreen("student");

                await loadAnnouncements();

                await loadImportantEvent();

            }

        } catch (error) {

            console.error(
                "Authentication check error:",
                error
            );

            await signOut(auth);

            setScreen("login");

            msg(
                loginMessage,
                "Unable to verify account.",
                true
            );

        }

    }
);


// =====================================================
// ANNOUNCEMENTS
// =====================================================

let allAnnouncements = [];

let activeSubject = "All";


async function loadAnnouncements() {

    announcementGrid.innerHTML = `
        <div class="loading-box">
            <div class="loader-3d">
                <div class="loader-ring ring-red"></div>
                <div class="loader-ring ring-black"></div>
                <div class="loader-ring ring-yellow"></div>
            </div>
            <p>LOADING ANNOUNCEMENTS...</p>
        </div>
    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "announcements"
                )
            );


        allAnnouncements =
            snapshot.docs.map(
                document => ({
                    id: document.id,
                    ...document.data()
                })
            );


        allAnnouncements.sort(
            (a, b) => {

                const dateA =
                    a.dueDate || "9999-12-31";

                const dateB =
                    b.dueDate || "9999-12-31";

                return dateA.localeCompare(dateB);

            }
        );


        renderFilters();

        renderAnnouncements();

    } catch (error) {

        console.error(error);

        announcementGrid.innerHTML = `
            <div class="no-announcements">
                Unable to load announcements.
            </div>
        `;

    }

}


// =====================================================
// FILTERS
// =====================================================

function renderFilters() {

    subjectFilters.innerHTML =
        subjects
            .map(
                subject => `
                    <button
                        type="button"
                        class="filter-btn ${
                            activeSubject === subject
                                ? "active"
                                : ""
                        }"
                        data-subject="${subject}">
                        ${subject}
                    </button>
                `
            )
            .join("");


    document
        .querySelectorAll(".filter-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    activeSubject =
                        button.dataset.subject;

                    renderFilters();

                    renderAnnouncements();

                }
            );

        });

}


// =====================================================
// RENDER ANNOUNCEMENTS
// =====================================================

function renderAnnouncements() {

    const filtered =
        activeSubject === "All"
            ? allAnnouncements
            : allAnnouncements.filter(
                announcement =>
                    announcement.subject === activeSubject
            );


    if (filtered.length === 0) {

        announcementGrid.innerHTML = `
            <div class="no-announcements">
                No announcements available.
            </div>
        `;

        return;
    }


    announcementGrid.innerHTML =
        filtered
            .map(
                announcement => `

                    <article class="announcement-card">

                        <span class="announcement-subject">
                            ${escapeHtml(
                                announcement.subject || ""
                            )}
                        </span>

                        <h3>
                            ${escapeHtml(
                                announcement.title || ""
                            )}
                        </h3>

                        <p class="details">
                            ${escapeHtml(
                                announcement.details || ""
                            )}
                        </p>

                        ${
                            announcement.dueDate
                                ? `
                                    <small>
                                        Due:
                                        ${escapeHtml(
                                            announcement.dueDate
                                        )}
                                    </small>
                                `
                                : ""
                        }

                    </article>

                `
            )
            .join("");

}


// =====================================================
// SUBJECT SELECT
// =====================================================

function populateSubjectSelect() {

    subjectInput.innerHTML =
        subjects
            .filter(
                subject =>
                    subject !== "All"
            )
            .map(
                subject => `
                    <option value="${subject}">
                        ${subject}
                    </option>
                `
            )
            .join("");

}


// =====================================================
// OFFICERS
// =====================================================

function renderOfficers() {

    officerGrid.innerHTML =
        officers
            .map(
                officer => `

                    <div class="officer-card">

                        <div class="officer-role">
                            ${escapeHtml(
                                officer.role
                            )}
                        </div>

                        <h3>
                            ${escapeHtml(
                                officer.name
                            )}
                        </h3>

                    </div>

                `
            )
            .join("");

}


// =====================================================
// ADD / EDIT ANNOUNCEMENT
// =====================================================

announcementForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const id =
            announcementId.value;


        const data = {

            subject:
                subjectInput.value,

            title:
                titleInput.value.trim(),

            details:
                detailsInput.value.trim(),

            dueDate:
                dateInput.value || "",

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

                msg(
                    adminMessage,
                    "Announcement updated successfully."
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
                    adminMessage,
                    "Announcement added successfully."
                );

            }


            resetAnnouncementForm();

            await loadAdminList();

        } catch (error) {

            console.error(error);

            msg(
                adminMessage,
                "Unable to save announcement.",
                true
            );

        }

    }
);


// =====================================================
// ADMIN ANNOUNCEMENT LIST
// =====================================================

async function loadAdminList() {

    adminList.innerHTML =
        `<p class="small-text">Loading...</p>`;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "announcements"
                )
            );


        const announcements =
            snapshot.docs.map(
                document => ({
                    id: document.id,
                    ...document.data()
                })
            );


        announcements.sort(
            (a, b) =>
                (a.dueDate || "")
                    .localeCompare(
                        b.dueDate || ""
                    )
        );


        if (announcements.length === 0) {

            adminList.innerHTML =
                `<p class="small-text">
                    No announcements yet.
                </p>`;

            return;
        }


        adminList.innerHTML =
            announcements
                .map(
                    announcement => `

                        <div class="admin-item">

                            <small>
                                ${escapeHtml(
                                    announcement.subject || ""
                                )}
                            </small>

                            <strong>
                                ${escapeHtml(
                                    announcement.title || ""
                                )}
                            </strong>

                            ${
                                announcement.dueDate
                                    ? `
                                        <div>
                                            Due:
                                            ${escapeHtml(
                                                announcement.dueDate
                                            )}
                                        </div>
                                    `
                                    : ""
                            }


                            <div class="admin-item-actions">

                                <button
                                    type="button"
                                    data-edit="${announcement.id}">
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    data-delete="${announcement.id}">
                                    Delete
                                </button>

                            </div>

                        </div>

                    `
                )
                .join("");


        document
            .querySelectorAll(
                "[data-edit]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        editAnnouncement(
                            button.dataset.edit
                        );

                    }
                );

            });


        document
            .querySelectorAll(
                "[data-delete]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteAnnouncement(
                            button.dataset.delete
                        );

                    }
                );

            });

    } catch (error) {

        console.error(error);

        adminList.innerHTML =
            `<p class="message">
                Unable to load announcements.
            </p>`;

    }

}


// =====================================================
// EDIT ANNOUNCEMENT
// =====================================================

async function editAnnouncement(id) {

    try {

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "announcements",
                    id
                )
            );


        if (!snapshot.exists()) {

            msg(
                adminMessage,
                "Announcement not found.",
                true
            );

            return;
        }


        const data =
            snapshot.data();


        announcementId.value =
            id;

        subjectInput.value =
            data.subject || "";

        titleInput.value =
            data.title || "";

        detailsInput.value =
            data.details || "";

        dateInput.value =
            data.dueDate || "";


        formTitle.textContent =
            "Edit Announcement";

        cancelEditBtn.classList.remove(
            "hidden"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error(error);

        msg(
            adminMessage,
            "Unable to load announcement.",
            true
        );

    }

}


// =====================================================
// DELETE ANNOUNCEMENT
// =====================================================

async function deleteAnnouncement(id) {

    const confirmed =
        confirm(
            "Delete this announcement?"
        );


    if (!confirmed) return;


    try {

        await deleteDoc(
            doc(
                db,
                "announcements",
                id
            )
        );


        msg(
            adminMessage,
            "Announcement deleted."
        );


        await loadAdminList();

    } catch (error) {

        console.error(error);

        msg(
            adminMessage,
            "Unable to delete announcement.",
            true
        );

    }

}


// =====================================================
// RESET ANNOUNCEMENT FORM
// =====================================================

function resetAnnouncementForm() {

    announcementForm.reset();

    announcementId.value = "";

    formTitle.textContent =
        "Add Announcement";

    cancelEditBtn.classList.add(
        "hidden"
    );

}


cancelEditBtn.addEventListener(
    "click",
    () => {

        resetAnnouncementForm();

        msg(adminMessage, "");

    }
);


// =====================================================
// SEED CURRENT ANNOUNCEMENTS
// =====================================================

seedBtn.addEventListener(
    "click",
    async () => {

        const samples = [

            {
                id: "seed_cc2m",
                subject: "CC2(M)",
                title: "CC2(M) Reminder",
                details:
                    "Please review the assigned lessons and prepare for the upcoming activity.",
                dueDate: "2026-09-18"
            },

            {
                id: "seed_plf",
                subject: "PLF",
                title: "PLF Midterm Review",
                details:
                    "Review Chapters 1–3 for the midterm.",
                dueDate: "2026-09-22"
            },

            {
                id: "seed_sts",
                subject: "STS 1",
                title: "STS 1 Reminder",
                details:
                    "Please prepare the required materials and review the previous discussion.",
                dueDate: "2026-09-20"
            }

        ];


        try {

            for (const sample of samples) {

                const {
                    id,
                    ...data
                } = sample;


                await setDoc(
                    doc(
                        db,
                        "announcements",
                        id
                    ),
                    {
                        ...data,
                        updatedAt:
                            serverTimestamp()
                    },
                    {
                        merge: true
                    }
                );

            }


            msg(
                adminMessage,
                "Current announcements loaded."
            );


            await loadAdminList();

        } catch (error) {

            console.error(error);

            msg(
                adminMessage,
                "Unable to load announcements.",
                true
            );

        }

    }
);


// =====================================================
// IMPORTANT EVENT
// =====================================================
//
// Firestore location:
//
// siteSettings
//     └── importantEvent
//
// The document can be created, edited,
// or completely deleted by the admin.
// =====================================================


// -----------------------------------------------------
// LOAD IMPORTANT EVENT FOR STUDENTS
// -----------------------------------------------------

async function loadImportantEvent() {

    try {

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "siteSettings",
                    "importantEvent"
                )
            );


        // No event exists
        if (!snapshot.exists()) {

            importantEvent.classList.add(
                "hidden"
            );

            return;
        }


        const data =
            snapshot.data();


        // Fill event information
        eventLabel.textContent =
            data.label || "";

        eventTitle.textContent =
            data.title || "";

        eventDate.textContent =
            data.date || "";

        eventDetails.textContent =
            data.details || "";


        // Show event
        importantEvent.classList.remove(
            "hidden"
        );

    } catch (error) {

        console.error(
            "Unable to load important event:",
            error
        );


        importantEvent.classList.add(
            "hidden"
        );

    }

}


// -----------------------------------------------------
// LOAD EVENT INTO ADMIN FORM
// -----------------------------------------------------

async function loadEventForAdmin() {

    try {

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "siteSettings",
                    "importantEvent"
                )
            );


        if (!snapshot.exists()) {

            resetEventForm();

            return;
        }


        const data =
            snapshot.data();


        eventLabelInput.value =
            data.label || "";

        eventTitleInput.value =
            data.title || "";

        eventDateInput.value =
            data.date || "";

        eventDetailsInput.value =
            data.details || "";


        msg(
            eventMessage,
            "Current important event loaded."
        );

    } catch (error) {

        console.error(error);

        msg(
            eventMessage,
            "Unable to load important event.",
            true
        );

    }

}


// -----------------------------------------------------
// ADD / SAVE IMPORTANT EVENT
// -----------------------------------------------------

eventForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const label =
            eventLabelInput.value.trim();

        const title =
            eventTitleInput.value.trim();

        const date =
            eventDateInput.value.trim();

        const details =
            eventDetailsInput.value.trim();


        if (!label || !title) {

            msg(
                eventMessage,
                "Event Label and Event Title are required.",
                true
            );

            return;
        }


        try {

            await setDoc(
                doc(
                    db,
                    "siteSettings",
                    "importantEvent"
                ),
                {
                    label: label,
                    title: title,
                    date: date,
                    details: details,
                    updatedAt:
                        serverTimestamp()
                }
            );


            msg(
                eventMessage,
                "Important event saved successfully."
            );


            // Immediately update student view
            eventLabel.textContent =
                label;

            eventTitle.textContent =
                title;

            eventDate.textContent =
                date;

            eventDetails.textContent =
                details;

        } catch (error) {

            console.error(error);

            msg(
                eventMessage,
                "Unable to save important event.",
                true
            );

        }

    }
);


// -----------------------------------------------------
// REMOVE IMPORTANT EVENT ENTIRELY
// -----------------------------------------------------

removeEventBtn.addEventListener(
    "click",
    async () => {

        const confirmed =
            confirm(
                "Remove the important event completely? It will no longer appear to students."
            );


        if (!confirmed) return;


        try {

            await deleteDoc(
                doc(
                    db,
                    "siteSettings",
                    "importantEvent"
                )
            );


            // Clear admin form
            resetEventForm();


            // Completely hide student event
            importantEvent.classList.add(
                "hidden"
            );


            msg(
                eventMessage,
                "Important event removed completely."
            );

        } catch (error) {

            console.error(error);

            msg(
                eventMessage,
                "Unable to remove important event.",
                true
            );

        }

    }
);


// -----------------------------------------------------
// RESET EVENT FORM
// -----------------------------------------------------

function resetEventForm() {

    eventForm.reset();

    eventLabelInput.value = "";
    eventTitleInput.value = "";
    eventDateInput.value = "";
    eventDetailsInput.value = "";

}


// =====================================================
// REFRESH
// =====================================================

refreshBtn.addEventListener(
    "click",
    async () => {

        await loadAnnouncements();

        await loadImportantEvent();

    }
);


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// INITIAL UI
// =====================================================

populateSubjectSelect();

renderOfficers();

setScreen("login");
