const content = document.getElementById("page-content");
const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");

const API = "/api";

const pageInfo = {
    dashboard: ["Dashboard", "Overview of apartment visitor activities."],
    register: ["Register Visitor", "Register a new visitor and record entry."],
    residents: ["Residents", "View registered apartment residents."],
    records: ["Visitor Records", "Monitor visitor entry and exit information."],
    apartment: ["Apartment Details", "Apartment information and security details."]
};

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

async function getData(url) {
    const response = await fetch(API + url);

    if (!response.ok) {
        throw new Error("Unable to load data from server");
    }

    return response.json();
}

function formatDate(value) {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function showError(error) {
    alert(error.message || "Something went wrong");
}

// PAGE NAVIGATION

function navigate(page) {
    if (!pageInfo[page]) page = "dashboard";

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.page === page
        );
    });

    pageTitle.textContent = pageInfo[page][0];
    pageSubtitle.textContent = pageInfo[page][1];

    if (location.hash !== "#" + page) {
        history.pushState(null, "", "#" + page);
    }

    renderPage(page);
}

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        navigate(link.dataset.page);
    });
});

window.addEventListener("popstate", () => {
    navigate(location.hash.slice(1) || "dashboard");
});

// PAGE ROUTER

async function renderPage(page) {
    content.innerHTML = `
        <div class="panel">
            Loading information...
        </div>
    `;

    try {
        if (page === "dashboard") await dashboardPage();
        if (page === "register") await registerPage();
        if (page === "residents") await residentsPage();
        if (page === "records") await recordsPage();
        if (page === "apartment") apartmentPage();

    } catch (error) {
        content.innerHTML = `
            <div class="panel">
                <h3>Unable to load this page</h3>
                <p>${escapeHTML(error.message)}</p>
                <button class="btn" onclick="renderPage('${page}')">
                    Retry
                </button>
            </div>
        `;
    }
}

// 1. DASHBOARD

async function dashboardPage() {
    const data = await getData("/dashboard");
    const visits = await getData("/visits");

    content.innerHTML = `
        <div class="page-heading">
            <h2>Dashboard Overview</h2>
            <p>Monitor apartment residents and visitor activities.</p>
        </div>

        <div class="stats-grid">

            <div class="stat-card">
                <div>
                    <p>Total Residents</p>
                    <h3>${data.totalResidents}</h3>
                    <p>Registered residents</p>
                </div>
                <div class="stat-icon blue">
                    <i class="fa-solid fa-users"></i>
                </div>
            </div>

            <div class="stat-card">
                <div>
                    <p>Total Visitors</p>
                    <h3>${data.totalVisitors}</h3>
                    <p>Registered visitors</p>
                </div>
                <div class="stat-icon green">
                    <i class="fa-solid fa-user-group"></i>
                </div>
            </div>

            <div class="stat-card">
                <div>
                    <p>Total Visits</p>
                    <h3>${data.totalVisits}</h3>
                    <p>Total visit records</p>
                </div>
                <div class="stat-icon orange">
                    <i class="fa-solid fa-clipboard-list"></i>
                </div>
            </div>

            <div class="stat-card">
                <div>
                    <p>Active Visitors</p>
                    <h3>${data.activeVisitors}</h3>
                    <p>Currently inside</p>
                </div>
                <div class="stat-icon purple">
                    <i class="fa-solid fa-door-open"></i>
                </div>
            </div>

        </div>

        <div class="panel">
            <div class="panel-header">
                <div>
                    <h3>Recent Visitor Records</h3>
                    <p>Latest visitor entry and exit information</p>
                </div>

                <button class="btn"
                    onclick="navigate('records')">
                    View All
                </button>
            </div>

            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Visitor</th>
                            <th>Resident</th>
                            <th>Flat No</th>
                            <th>Entry Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${visits.slice(0, 5).map(v => `
                            <tr>
                                <td>#${v.visit_id}</td>
                                <td>${escapeHTML(v.visitor_name)}</td>
                                <td>${escapeHTML(v.resident_name)}</td>
                                <td>${escapeHTML(v.flat_no)}</td>
                                <td>${formatDate(v.entry_time)}</td>
                                <td>
                                    <span class="status ${v.status === "IN" ? "status-in" : "status-out"}">
                                        ${escapeHTML(v.status)}
                                    </span>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 2. REGISTER VISITOR

async function registerPage() {
    const residents = await getData("/residents");

    content.innerHTML = `
        <div class="page-heading">
            <h2>New Visitor Registration</h2>
            <p>Enter visitor information and assign the resident.</p>
        </div>

        <div class="panel">
            <div class="panel-header">
                <div>
                    <h3>Visitor Information</h3>
                    <p>Fill in the details below.</p>
                </div>
            </div>

            <form id="visitor-form">
                <div class="form-grid">

                    <div class="form-group">
                        <label>Visitor Name *</label>
                        <input type="text" name="name"
                            placeholder="Enter visitor name"
                            maxlength="100" required>
                    </div>

                    <div class="form-group">
                        <label>Phone Number *</label>
                        <input type="tel" name="phone"
                            placeholder="Enter phone number"
                            pattern="[0-9+ -]{7,15}" required>
                    </div>

                    <div class="form-group">
                        <label>Vehicle Number</label>
                        <input type="text" name="vehicle_no"
                            placeholder="Example: AP21AB1234"
                            maxlength="30">
                    </div>

                    <div class="form-group">
                        <label>Purpose of Visit *</label>
                        <select name="purpose" required>
                            <option value="">Select purpose</option>
                            <option>Family Visit</option>
                            <option>Friend Visit</option>
                            <option>Delivery</option>
                            <option>Maintenance</option>
                            <option>Personal Visit</option>
                            <option>Electrician</option>
                            <option>Water Service</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div class="form-group form-full">
                        <label>Select Resident / Flat *</label>

                        <select name="resident_id" required>
                            <option value="">Select Resident</option>

                            ${residents.map(r => `
                                <option value="${r.resident_id}">
                                    ${escapeHTML(r.name)} -
                                    ${escapeHTML(r.flat_no)}
                                </option>
                            `).join("")}
                        </select>
                    </div>

                    <div class="form-full">
                        <button type="submit" class="btn">
                            <i class="fa-solid fa-user-plus"></i>
                            Register Visitor
                        </button>
                    </div>

                </div>
            </form>
        </div>

        <div class="panel">
            <h3>Registration Guidelines</h3>
            <p style="margin-top:12px;color:#8290a3;font-size:13px;line-height:2">
                1. Enter the visitor's correct details.<br>
                2. Select the resident to be visited.<br>
                3. Verify the visitor information.<br>
                4. Click Register Visitor to save the record.<br>
                5. Entry time and IN status are recorded automatically.
            </p>
        </div>
    `;

    document.getElementById("visitor-form")
        .addEventListener("submit", async event => {

            event.preventDefault();

            const form = new FormData(event.target);
            const button = event.target.querySelector("button");

            const body = Object.fromEntries(form.entries());

            button.disabled = true;
            button.textContent = "Registering...";

            try {
                const response = await fetch(API + "/visits", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Registration failed");
                }

                alert(result.message);
                event.target.reset();
                navigate("dashboard");

            } catch (error) {
                showError(error);
                button.disabled = false;
                button.textContent = "Register Visitor";
            }
        });
}

// 3. RESIDENTS PAGE

async function residentsPage() {
    const residents = await getData("/residents");

    content.innerHTML = `
        <div class="page-heading">
            <h2>Resident Directory</h2>
            <p>Complete information about registered apartment residents.</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div>
                    <p>Total Registered Residents</p>
                    <h3>${residents.length}</h3>
                </div>
                <div class="stat-icon blue">
                    <i class="fa-solid fa-users"></i>
                </div>
            </div>
        </div>

        <div class="panel">

            <div class="panel-header">
                <div>
                    <h3>Resident Information</h3>
                    <p>All apartment resident details</p>
                </div>
            </div>

            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Resident ID</th>
                            <th>Resident Name</th>
                            <th>Flat Number</th>
                            <th>Phone</th>
                            <th>Email</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${residents.map(r => `
                            <tr>
                                <td>#${r.resident_id}</td>
                                <td>${escapeHTML(r.name)}</td>
                                <td>${escapeHTML(r.flat_no)}</td>
                                <td>${escapeHTML(r.phone)}</td>
                                <td>${escapeHTML(r.email)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

        </div>
    `;
}

// 4. VISITOR RECORDS

async function recordsPage() {
    const visits = await getData("/visits");

    content.innerHTML = `
        <div class="page-heading">
            <h2>Visitor Records</h2>
            <p>Complete visitor entry and exit history.</p>
        </div>

        <div class="stats-grid">

            <div class="stat-card">
                <div>
                    <p>Total Records</p>
                    <h3>${visits.length}</h3>
                </div>
                <div class="stat-icon blue">
                    <i class="fa-solid fa-clipboard-list"></i>
                </div>
            </div>

            <div class="stat-card">
                <div>
                    <p>Currently Inside</p>
                    <h3>${visits.filter(v => v.status === "IN").length}</h3>
                </div>
                <div class="stat-icon green">
                    <i class="fa-solid fa-door-open"></i>
                </div>
            </div>

            <div class="stat-card">
                <div>
                    <p>Checked Out</p>
                    <h3>${visits.filter(v => v.status === "OUT").length}</h3>
                </div>
                <div class="stat-icon orange">
                    <i class="fa-solid fa-door-closed"></i>
                </div>
            </div>

        </div>

        <div class="panel">

            <div class="panel-header">
                <div>
                    <h3>Visitor History</h3>
                    <p>Entry, exit and visit status details</p>
                </div>
            </div>

            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Visit ID</th>
                            <th>Visitor</th>
                            <th>Phone</th>
                            <th>Resident</th>
                            <th>Flat</th>
                            <th>Purpose</th>
                            <th>Entry Time</th>
                            <th>Exit Time</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${visits.map(v => `
                            <tr>
                                <td>#${v.visit_id}</td>
                                <td>${escapeHTML(v.visitor_name)}</td>
                                <td>${escapeHTML(v.visitor_phone)}</td>
                                <td>${escapeHTML(v.resident_name)}</td>
                                <td>${escapeHTML(v.flat_no)}</td>
                                <td>${escapeHTML(v.purpose)}</td>
                                <td>${formatDate(v.entry_time)}</td>
                                <td>${formatDate(v.exit_time)}</td>

                                <td>
                                    <span class="status ${v.status === "IN" ? "status-in" : "status-out"}">
                                        ${escapeHTML(v.status)}
                                    </span>
                                </td>

                                <td>
                                    ${v.status === "IN" ? `
                                        <button class="btn btn-success btn-small"
                                            onclick="checkoutVisitor(${v.visit_id})">
                                            Check Out
                                        </button>
                                    ` : `
                                        <span style="color:#8290a3">Completed</span>
                                    `}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

        </div>
    `;
}

// CHECKOUT FUNCTION

async function checkoutVisitor(id) {
    if (!confirm("Are you sure you want to check out this visitor?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API}/visits/${id}/checkout`,
            { method: "PUT" }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Checkout failed");
        }

        alert(result.message);
        await recordsPage();

    } catch (error) {
        showError(error);
    }
}

// 5. APARTMENT DETAILS

function apartmentPage() {
    content.innerHTML = `
        <div class="page-heading">
            <h2>Apartment Details</h2>
            <p>General apartment and management information.</p>
        </div>

        <div class="panel">
            <div class="panel-header">
                <h3>Apartment Information</h3>
            </div>

            <div class="info-grid">

                <div class="info-box">
                    <p>Apartment Name</p>
                    <h3>Green Valley Apartments</h3>
                </div>

                <div class="info-box">
                    <p>Total Flats</p>
                    <h3>10</h3>
                </div>

                <div class="info-box">
                    <p>Apartment Blocks</p>
                    <h3>2 Blocks</h3>
                </div>

                <div class="info-box">
                    <p>Block A</p>
                    <h3>101 - 105</h3>
                </div>

                <div class="info-box">
                    <p>Block B</p>
                    <h3>201 - 205</h3>
                </div>

                <div class="info-box">
                    <p>Management</p>
                    <h3>Apartment Admin</h3>
                </div>

            </div>
        </div>

        <div class="panel">
            <div class="panel-header">
                <h3>Security Information</h3>
            </div>

            <div class="info-grid">

                <div class="info-box">
                    <p>Security Department</p>
                    <h3>Visitor Security</h3>
                </div>

                <div class="info-box">
                    <p>System</p>
                    <h3>Digital Entry Register</h3>
                </div>

                <div class="info-box">
                    <p>Visitor Tracking</p>
                    <h3>Entry / Exit Monitoring</h3>
                </div>

            </div>
        </div>
    `;
}

// INITIAL PAGE

const initialPage = location.hash.replace("#", "") || "dashboard";
navigate(initialPage);