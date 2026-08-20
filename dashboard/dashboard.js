
/*
Current rendered rows
*/

let currentRows = [];

let pendingView = false;

let currentTab = "Flight";

let currentCustomer = null;

let currentWhatsappRow = null;

let liveRefreshStarted = false;

let priorityCurrentRows = [];

/*=========================
INIT
=========================*/

document.addEventListener(

    "dashboardLoaded",

    function (e) {

        dashboardData = e.detail;

        updateDashboard(dashboardData);

    }

);

function updateDashboard(data) {

    dashboardData = data;

    console.log("DASHBOARD DATA");
    console.log(dashboardData);

    updateKPI();



    renderActivity();

    //renderPriority();
    renderPrioritySupportV2();

    renderLeadCenterV2();

    /*
    Keep current tab
    */

    renderTab(
        currentTab,
        false
    );

    applyDashboardTheme();

    /*
    Load Live Operations
    */

    loadDashboardKPI();

    loadLiveOperations();

    renderLeadCounts();

    updateTabCounters();

    renderLoggedInUser();

}


document.addEventListener(

    "DOMContentLoaded",

    function () {

        loadDashboard();


        changeTab();

        initKPI();


        initSearch();

        startAutoRefresh();


        applyDashboardTheme();

        loadFestivalBanner();


        updateActivityClock();


    }

);

function loadDashboard() {

    loadDashboardData();

    loadDashboardKPI();

    loadLiveOperations();

    initKPI();

}


/*=========================
KPI
=========================*/

function updateKPI() {

    setValue(

        "flightCount",

        getPendingCount(

            dashboardData.air

        )

    );

    setValue(

        "trainCount",

        getPendingCount(

            dashboardData.train

        )

    );

    setValue(

        "busCount",

        getPendingCount(

            dashboardData.bus

        )

    );

    setValue(

        "carCount",

        getPendingCount(

            dashboardData.cars

        )

    );

    setValue(

        "packageCount",

        getPendingCount(

            dashboardData.packages

        )

    );

    setValue(

        "quoteCount",

        getPendingCount(

            dashboardData.quotes

        )

    );

    /* KPI badges */

    setBadge(

        "flightBadge",

        dashboardData.air

    );

    setBadge(

        "trainBadge",

        dashboardData.train

    );

    setBadge(

        "busBadge",

        dashboardData.bus

    );

    setBadge(

        "carBadge",

        dashboardData.cars

    );

    setBadge(

        "packageBadge",

        dashboardData.packages

    );

    setBadge(

        "quoteBadge",

        dashboardData.quotes

    );

}

function setBadge(id, arr) {

    const el =
        document.getElementById(id);

    if (!el) return;

    const pending =
        getPendingCount(arr);

    const completed =
        getCompletedCount(arr);

    if (pending == 0) {

        el.innerHTML =
            completed + " DONE";

        el.style.background =
            "#4caf50";

        el.style.color =
            "#fff";

    }

    else {

        el.innerHTML =
            completed + " DONE";

        el.style.background =
            "#43a047";

        el.style.color =
            "#fff";

    }

}

function getCompletedCount(arr) {

    if (!arr) {

        return 0;

    }

    return arr.filter(function (x) {

        const status =

            String(

                x.Status ||

                x.STATUS ||

                ""

            ).toLowerCase();

        return (

            status == "completed" ||

            status == "confirmed" ||

            status == "closed" ||

            status == "ticketed" ||

            status == "booked"

        );

    }).length;

}

function getPendingCount(arr) {

    if (!arr) {

        return 0;

    }

    return arr.filter(function (x) {

        const status =

            String(

                x.Status ||

                x.STATUS ||

                "New"

            ).toLowerCase();

        return (

            status == "new" ||

            status == "pending" ||

            status == "processing" ||

            status == "follow up"

        );

    }).length;

}

function initKPI() {

    const cards = document.querySelectorAll(".kpi");

    cards.forEach(function (card) {

        const tab = card.dataset.tab;

        //-------------------------------------------------
        // SINGLE CLICK → MODAL
        //-------------------------------------------------

        card.onclick = function () {

            openKPIModal(tab);

        };

        //-------------------------------------------------
        // DOUBLE CLICK → PENDING QUEUE
        //-------------------------------------------------

        card.ondblclick = function () {

            openPendingQueue(tab);

        };

    });

}

function openKPIModal(service) {

    let rows = [];

    switch (service) {

        case "Flight":
            rows = dashboardData.air || [];
            break;

        case "Train":
            rows = dashboardData.train || [];
            break;

        case "Bus":
            rows = dashboardData.bus || [];
            break;

        case "Car":
            rows = dashboardData.cars || [];
            break;

        case "Package":
            rows = dashboardData.packages || [];
            break;

        case "Quote":
            rows = dashboardData.quotes || [];
            break;

    }

    //----------------------------------------
    // Pending Leads Only
    //----------------------------------------

    rows = rows.filter(function (r) {

        const s = getCustomerStatus(r);

        return (

            s === "New"

            ||

            s === "Pending"

            ||

            s === "Processing"

            ||

            s === "Follow Up"

        );

    });

    //----------------------------------------
    // Modal Title
    //----------------------------------------

    document.getElementById("kpiModalTitle").innerHTML =

        "🔥 " +

        service +

        " Leads (" +

        rows.length +

        ")";

    //----------------------------------------
    // Build HTML
    //----------------------------------------

    let html =

        `

<div class="kpiQueueBar">

    <button

        class="kpiQueueBtn"

        onclick="closeKPIModal();openPendingQueue('${service}')">

        📋 View Pending Queue →

    </button>

</div>

`;

    rows.forEach(function (r) {

        html += renderCard(r);

    });

    //----------------------------------------
    // No Records
    //----------------------------------------

    if (rows.length === 0) {

        html +=

            `

<div class="emptyState">

    No Pending Leads

</div>

`;

    }

    //----------------------------------------
    // Render
    //----------------------------------------

    document.getElementById(

        "kpiModalBody"

    ).innerHTML = html;

    document.getElementById(

        "kpiModal"

    ).classList.add(

        "show"

    );

}

function openQueueFromModal(service) {

    closeKPIModal();

    //--------------------------------

    document.querySelectorAll(".tab")
        .forEach(function (t) {

            t.classList.remove("active");

            if (
                t.textContent.trim() === service
            ) {
                t.classList.add("active");
            }

        });

    //--------------------------------

    currentTab = service;

    pendingView = true;

    renderTab(service, true);

}

function closeKPIModal() {

    document

        .getElementById("kpiModal")

        .classList.remove("show");

}

window.addEventListener("click", function (e) {

    const modal =

        document.getElementById("kpiModal");

    if (e.target === modal) {

        closeKPIModal();

    }

});

function highlightTab(name) {

    const tabs =

        document.querySelectorAll(

            ".tab"

        );

    tabs.forEach(function (tab) {

        tab.classList.remove(

            "active"

        );

        if (

            tab.textContent.trim() == name

        ) {

            tab.classList.add(

                "active"

            );

        }

    });

}

function openPendingQueue(tab) {

    closeKPIModal();

    currentTab = tab;
    pendingView = true;

    // Highlight active tab
    document.querySelectorAll(".tab").forEach(function (btn) {
        btn.classList.remove("active");

        if (btn.textContent.trim().startsWith(getTabEmoji(tab))) {
            btn.classList.add("active");
        }
    });

    renderTab(tab, true);

    document.querySelector(".crmGlass.tabs").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}

function getTabEmoji(tab) {

    switch (tab) {

        case "Flight": return "✈";

        case "Train": return "🚆";

        case "Bus": return "🚌";

        case "Car": return "🚖";

        case "Package": return "🏖";

        case "Quote": return "💬";

        default: return "";

    }

}


function setValue(id, val) {

    const el =

        document.getElementById(id);

    if (el) {

        el.textContent = val;

    }

}

/*=========================
ACTIVITY
=========================*/

function renderActivity() {

    const box =

        document.getElementById(

            "activityFeed"

        );

    if (!box) return;

    let html = "";

    let arr = [];

    if (dashboardData.air) {

        dashboardData.air.slice(-5)

            .reverse()

            .forEach(function (x) {

                arr.push({

                    icon: "✈",

                    name:

                        x["Customer Mobile"] ||

                        "Customer",

                    message:

                        x["From"] +

                        " → " +

                        x["To"],

                    time:

                        x["Date Time"] ||

                        ""

                });

            });

    }

    arr.forEach(

        function (x) {

            html += `

<div class="activityItem"

onclick='openCustomer(${JSON.stringify(x)})'>

<div>

${x.icon}

</div>

<div>

<b>

${x.name}

</b>

<br>

${x.message}

</div>

<div>

${x.time}

</div>

</div>

`;

        }

    );

    box.innerHTML =

        html ||

        "No activity";

}

function renderPriority() {

    const box =
        document.getElementById(
            "priorityList"
        );

    if (!box) return;

    const today =
        new Date();

    let html = "";

    /* =========================
       FOLLOW UPS PENDING
    ========================= */

    /* =========================
       OVERDUE FOLLOW UPS
    ========================= */

    const allFollowups = [

        ...(dashboardData.quotes || []).map(x => ({
            ...x,
            _source: "Quote"
        })),

        ...(dashboardData.packages || []).map(x => ({
            ...x,
            _source: "Package"
        })),

        ...(dashboardData.cars || []).map(x => ({
            ...x,
            _source: "Car"
        })),

        ...(dashboardData.air || []).map(x => ({
            ...x,
            _source: "Air"
        })),

        ...(dashboardData.train || []).map(x => ({
            ...x,
            _source: "Train"
        })),

        ...(dashboardData.bus || []).map(x => ({
            ...x,
            _source: "Bus"
        }))

    ];

    const followups =

        allFollowups.filter(x => {

            const status =

                String(
                    x.Status || ""
                )
                    .trim()
                    .toLowerCase();

            const followDate =
                x["Next Follow Up"];

            if (!followDate)
                return false;

            let dt;

            if (
                typeof followDate === "string" &&
                followDate.includes("/")
            ) {

                const p =
                    followDate.split("/");

                dt =
                    new Date(

                        Number(p[2]),

                        Number(p[1]) - 1,

                        Number(p[0])

                    );

            }
            else {

                dt =
                    new Date(followDate);

            }

            return (

                (
                    status === "follow up" ||

                    status === "followup"
                )

                &&

                dt < today

            );

        });

    const overdueCount =
        followups.length;

    console.log(
        "OVERDUE",
        overdueCount
    );

    html += createPriorityBlock(

        "🔴",

        "Overdue Follow Ups",

        overdueCount,

        followups
            .sort((a, b) => {

                const da =
                    new Date(
                        a["Next Follow Up"]
                    );

                const db =
                    new Date(
                        b["Next Follow Up"]
                    );

                return da - db;

            })

            .slice(0, 5)

            .map(x => ({

                title:
                    x.Name ||

                    x["Customer Name"] ||

                    x.Customer ||

                    "Customer",

                subtitle:

                    "Due : " +

                    (x["Next Follow Up"] || "")

            })),

        "red",

        "followup"

    );

    /* =========================
       PREMIUM QUOTES
    ========================= */

    const quotes =

        (dashboardData.quotes || [])

            .filter(x =>

                String(

                    x.Status ||

                    ""

                ).toLowerCase()

                !== "completed"

            );

    html += createPriorityBlock(

        "🟠",

        "Premium Quotes Pending",

        quotes.length,

        quotes.slice(0, 5).map(x => ({

            title:
                x.Name ||

                "Quote",

            subtitle:
                x.Service ||

                "Premium Quote"

        })),

        "orange",

        "quotes"

    );

    /* =========================
       NEW CAR BOOKINGS
    ========================= */

    const cars =

        (dashboardData.cars || [])

            .filter(x =>

                String(

                    x.Status ||

                    ""

                ).toLowerCase()

                === "new"

            );

    html += createPriorityBlock(

        "🔵",

        "New Car Bookings",

        cars.length,

        cars.slice(0, 5).map(x => ({

            title:
                x["Customer Name"] ||

                x.customerName ||

                "Customer",

            subtitle:
                x.Vehicle ||

                x.vehicle ||

                "Booking"

        })),

        "blue",

        "cars"

    );

    /* =========================
       TRAVEL LEADS
    ========================= */

    const packages =

        dashboardData.packages || [];

    html += createPriorityBlock(

        "🟢",

        "Travel Leads",

        packages.length,

        packages.slice(0, 5).map(x => ({

            title:
                x["Customer Name"] ||

                x.Name ||

                "Lead",

            subtitle:
                x.Destination ||

                "Package Enquiry"

        })),

        "green",

        "packages"

    );

    /* =========================
       AIR
    ========================= */

    const air =
        dashboardData.air || [];

    html += createPriorityBlock(

        "✈",

        "Air Enquiries",

        air.length,

        air.slice(0, 3).map(x => ({

            title:
                x.From + " → " + x.To,

            subtitle:
                x.Mobile || ""

        })),
        "cyan",

        "air"

    );

    /* =========================
       TRAIN
    ========================= */

    const train =
        dashboardData.train || [];

    html += createPriorityBlock(

        "🚆",

        "Train Enquiries",

        train.length,

        train.slice(0, 3).map(x => ({

            title:
                x.From + " → " + x.To,

            subtitle:
                x.Mobile || ""

        })),

        "emerald",

        "train"


    );

    /* =========================
       BUS
    ========================= */

    const bus =
        dashboardData.bus || [];

    html += createPriorityBlock(

        "🚌",

        "Bus Enquiries",

        bus.length,

        bus.slice(0, 3).map(x => ({

            title:
                x.From + " → " + x.To,

            subtitle:
                x.Mobile || ""

        })),

        "amber",

        "bus"


    );

    box.innerHTML = html;
}

function createPriorityBlock(

    icon,

    title,

    count,

    items,

    color,

    type

) {

    return `

    <div class="priorityBlock">

        <div class="priorityHeader" onclick="openPriorityModal('${type}')">

            <span>

                ${icon}

                ${title}

            </span>

            <span class="priorityCount ${color}">

                ${count}

            </span>

        </div>

        ${items.length

            ?

            items.map(item => `

                <div class="priorityItem">

                    <div class="priorityTitle">

                        ${item.title}

                    </div>

                    <div class="prioritySub">

                        ${item.subtitle}

                    </div>

                </div>

            `).join("")

            :

            `<div class="priorityEmpty">

                No Records

            </div>`

        }

    </div>

    `;
}








/*=========================
SEARCH
=========================*/

function initSearch() {

    const box =

        document.getElementById(

            "globalSearch"

        );

    if (!box) return;

    box.addEventListener(

        "keyup",

        function () {

            searchDashboard(

                this.value

            );

        }

    );

}

function searchDashboard(q) {

    q =

        q.toLowerCase();

    const rows =

        document.querySelectorAll(

            ".tableRow"

        );

    rows.forEach(

        function (r) {

            if (

                r.innerText

                    .toLowerCase()

                    .includes(q)

            ) {

                r.style.display = "block";

            }

            else {

                r.style.display = "none";

            }

        }

    );

}


document.addEventListener(

    "click",

    function (e) {

        if (

            e.target.innerHTML == "✖"

        ) {

            document

                .getElementById(

                    "customerDrawer"

                )

                .classList.remove(

                    "active"

                );

        }

    }

    /*=========================
    THEME
    =========================*/

);

function applyDashboardTheme() {

    if (

        window.heroLiveData

        &&

        window.activeFestival

    ) {

        document.documentElement

            .style.setProperty(

                "--accent",

                activeFestival.accentColor ||

                "#ffd54f"

            );

    }

}


let dashboardRefreshTimer = null;

function startAutoRefresh() {

    if (dashboardRefreshTimer) {

        clearInterval(dashboardRefreshTimer);

    }

    dashboardRefreshTimer = setInterval(function () {

        loadDashboardData();

        loadDashboardKPI();

        loadLiveOperations();

    }, 10000);

}



function loadFestivalBanner() {

    console.log("Festival Banner Running");

    if (
        typeof heroLiveData === "undefined" ||
        !heroLiveData.specialEvents
    ) {
        console.log("heroLiveData not loaded");
        return;
    }

    const today = new Date();

    const currentMonth =
        today.getMonth() + 1;

    const currentDay =
        today.getDate();

    const event =
        heroLiveData.specialEvents.find(e => {

            if (!e.enabled)
                return false;

            const start =
                e.startMonth * 100 +
                e.startDay;

            const end =
                e.endMonth * 100 +
                e.endDay;

            const current =
                currentMonth * 100 +
                currentDay;

            if (start <= end) {

                return (
                    current >= start &&
                    current <= end
                );

            }

            return (
                current >= start ||
                current <= end
            );

        });

    if (!event) {

        console.log(
            "No active festival"
        );

        return;

    }

    const banner =
        document.createElement("div");

    banner.className =
        "festivalBanner";

    banner.innerHTML = `

        <div class="festivalBannerContent">

            <span class="festivalIcon">
                ${event.icon}
            </span>

            <div>

                <div class="festivalTitle">
                    ${event.title}
                </div>

                <div class="festivalMessage">
                    ${event.message}
                </div>

            </div>

        </div>

    `;

    document.body.prepend(
        banner
    );

    console.log(
        "Festival Banner Loaded"
    );

}

async function loadLiveOperations() {

    const result = await getActivityLog();

    if (!result.success) return;

    const container = document.getElementById("liveOperations");

    const activities = result.activities || [];

    if (!activities.length) {

        container.innerHTML =
            "<div class='emptyActivity'>No Activity</div>";

        return;

    }

    activities.sort((a, b) => b.timestamp - a.timestamp);

    let html = "";

    let currentGroup = "";

    activities.forEach(a => {

        const group = getActivityGroup(a.timestamp);

        if (group !== currentGroup) {

            currentGroup = group;

            html += `
            <div class="timelineDay">

                <span>${group}</span>

            </div>`;
        }

        html += `

<div class="timelineItem">

    <div class="timelineDot"></div>

    <div class="timelineCard">

        <div class="timelineHeader">

            <div class="timelineAvatar">

                ${getInitials(a.customer)}

            </div>

            <div class="timelineInfo">

                <div class="timelineCustomer">

                    ${a.customer}

                </div>

                <div class="timelineMeta">

                    <span class="serviceBadge ${(a.service || "").toLowerCase()}">

                        ${a.service}

                    </span>

                    <span class="statusBadge ${a.type.toLowerCase()}">

                        ${a.type}

                    </span>

                </div>

            </div>

            <div class="timelineTime">

                ${timeAgo(a.timestamp)}

            </div>

        </div>

        <div class="timelineTitle">

            ${a.title}

        </div>

        <div class="timelineDesc">

            ${a.description}

        </div>

        ${a.amount > 0 ?

                `<div class="timelineRevenue">

            ₹${Number(a.amount).toLocaleString()}

        </div>`

                : ""
            }

    </div>

</div>`;

    });

    container.innerHTML = html;

    document.getElementById("activityTime").innerHTML =
        "Updated " + new Date().toLocaleTimeString();

}

function getInitials(name) {

    if (!name) return "C";

    return name
        .split(" ")
        .map(x => x[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

}

function getActivityGroup(ts) {

    const d = new Date(ts);

    d.setHours(0, 0, 0, 0);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);

    yesterday.setDate(today.getDate() - 1);

    if (d.getTime() == today.getTime()) return "Today";

    if (d.getTime() == yesterday.getTime()) return "Yesterday";

    return d.toLocaleDateString();

}

function getServiceColor(service) {

    switch ((service || "").toLowerCase()) {

        case "air":
            return "#00c853";

        case "train":
            return "#42a5f5";

        case "bus":
            return "#ff9800";

        case "car_bookings":
            return "#ab47bc";

        case "travel_leads":
            return "#26c6da";

        default:
            return "#ffffff";

    }

}

function getServiceBg(service) {

    switch ((service || "").toLowerCase()) {

        case "air":
            return "rgba(0,200,83,.15)";

        case "train":
            return "rgba(66,165,245,.15)";

        case "bus":
            return "rgba(255,152,0,.15)";

        case "car_bookings":
            return "rgba(171,71,188,.15)";

        case "travel_leads":
            return "rgba(38,198,218,.15)";

        default:
            return "rgba(255,255,255,.08)";

    }

}

function getActivityColor(type) {

    switch (type) {

        case "CALL":

            return "#16a34a";

        case "WHATSAPP":

            return "#22c55e";

        case "STATUS":

            return "#2563eb";

        case "FOLLOWUP":

            return "#f59e0b";

        case "BOOKING":

            return "#9333ea";

        case "PACKAGE":

            return "#0ea5e9";

        case "QUOTE":

            return "#ec4899";

        case "AIR":

            return "#2563eb";

        case "TRAIN":

            return "#f97316";

        case "BUS":

            return "#059669";

        default:

            return "#64748b";

    }

}

function getActivityIcon(type) {

    switch (type) {

        case "CALL":

            return "📞";

        case "WHATSAPP":

            return "💬";

        case "STATUS":

            return "✏️";

        case "FOLLOWUP":

            return "📅";

        case "BOOKING":

            return "💰";

        case "PACKAGE":

            return "🏖️";

        case "QUOTE":

            return "📄";

        case "AIR":

            return "✈️";

        case "TRAIN":

            return "🚆";

        case "BUS":

            return "🚌";

        default:

            return "⚡";

    }

}


function formatService(service) {

    if (!service) return "";

    const map = {

        air: "Air",

        train: "Train",

        bus: "Bus",

        car_bookings: "Car",

        travel_leads: "Package"

    };

    return map[service.toLowerCase()] || service;

}

function getActivityTitle(type) {

    switch (type) {

        case "CALL":

            return "Phone Call";

        case "WHATSAPP":

            return "WhatsApp Sent";

        case "STATUS":

            return "Status Updated";

        case "FOLLOWUP":

            return "Follow Up";

        case "BOOKING":

            return "Booking";

        case "PACKAGE":

            return "Holiday Package";

        case "QUOTE":

            return "Premium Quote";

        case "AIR":

            return "Flight Enquiry";

        case "TRAIN":

            return "Train Enquiry";

        case "BUS":

            return "Bus Enquiry";

        default:

            return type;

    }

}



function timeAgo(ts) {

    ts = Number(ts);

    if (!ts) return "-";

    const diff = Date.now() - ts;

    const sec = Math.floor(diff / 1000);

    if (sec < 60)
        return sec + " sec ago";

    const min = Math.floor(sec / 60);

    if (min < 60)
        return min + " min ago";

    const hr = Math.floor(min / 60);

    if (hr < 24)
        return hr + " hr ago";

    const day = Math.floor(hr / 24);

    return day + " day ago";

}

function updateActivityClock() {

    const el =
        document.getElementById(
            "activityTime"
        );

    if (!el) return;

    const now =
        new Date();

    el.innerHTML =
        now.toLocaleTimeString();

}

setInterval(
    updateActivityClock,
    1000
);

async function loadDashboardKPI() {

    console.log("===== KPI START =====");

    const result = await getDashboardKPI();

    console.log("KPI RESULT");
    console.log(result);

    if (!result) {

        console.error("No Result Returned");

        return;

    }

    if (!result.success) {

        console.error("Result Success False");

        return;

    }

    console.log("Revenue =", result.revenue);
    console.log("Leads =", result.newLeads);
    console.log("Last Activity =", result.lastActivity);
    console.log("Followups Today =", result.followupsToday);
    console.log("Pending =", result.followupsPending);
    console.log("Overdue =", result.followupsOverdue);

    //--------------------------------------------------

    document.getElementById("kpiRevenue").innerHTML =
        "₹" + (Number(result.revenue) || 0).toLocaleString("en-IN");

    const trend = document.getElementById("kpiRevenueTrend");

    trend.innerHTML = result.revenueTrend || "+0%";

    trend.classList.remove(
        "trendUp",
        "trendDown"
    );

    if ((result.revenueTrend || "").startsWith("-")) {

        trend.classList.add("trendDown");

    } else {

        trend.classList.add("trendUp");

    }

    //--------------------------------------------------

    document.getElementById("kpiLeads").textContent =
        Number(result.newLeads) || 0;

    //--------------------------------------------------

    document.getElementById("kpiActivityIcon").innerHTML =
        result.lastActivity.icon;

    document.getElementById("kpiLastActivity").innerHTML =
        result.lastActivity.title;

    if (document.getElementById("kpiLastTime")) {

        document.getElementById("kpiLastTime").innerHTML =
            result.lastActivity.time;

    }

    //--------------------------------------------------

    document.getElementById("kpiFollowups").textContent =
        Number(result.followupsToday) || 0;

    document.getElementById("kpiFollowupDetail").innerHTML =
        "🟠 " +
        (result.followupsPending || 0) +
        " Pending&nbsp;&nbsp;🔴 " +
        (result.followupsOverdue || 0) +
        " Overdue";

    console.log("===== KPI END =====");

}

function renderLeadCounts() {

    document.getElementById(
        "leadAirCount"
    ).innerText =
        (dashboardData.air || []).length;

    document.getElementById(
        "leadTrainCount"
    ).innerText =
        (dashboardData.train || []).length;

    document.getElementById(
        "leadBusCount"
    ).innerText =
        (dashboardData.bus || []).length;

    document.getElementById(
        "leadCarCount"
    ).innerText =
        (dashboardData.cars || []).length;

    document.getElementById(
        "leadPackageCount"
    ).innerText =
        (dashboardData.packages || []).length;

    document.getElementById(
        "leadQuoteCount"
    ).innerText =
        (dashboardData.quotes || []).length;

}

function openLeadModal(type) {

    let data = [];
    let title = "";

    switch (type) {

        case "air":

            title =
                "Air Enquiries";

            data =
                dashboardData.air || [];

            break;

        case "train":

            title =
                "Train Enquiries";

            data =
                dashboardData.train || [];

            break;

        case "bus":

            title =
                "Bus Enquiries";

            data =
                dashboardData.bus || [];

            break;

        case "car":

            title =
                "Car Bookings";

            data =
                dashboardData.cars || [];

            break;

        case "package":

            title =
                "Package Leads";

            data =
                dashboardData.packages || [];

            break;

        case "quote":

            title =
                "Premium Quotes";

            data =
                dashboardData.quotes || [];

            break;

    }

    const iconConfig = {

        air: {
            icon: "✈",
            class: "airIcon"
        },

        train: {
            icon: "🚆",
            class: "trainIcon"
        },

        bus: {
            icon: "🚌",
            class: "busIcon"
        },

        car: {
            icon: "🚖",
            class: "carIcon"
        },

        package: {
            icon: "🏖",
            class: "packageIcon"
        },


        quote: {
            icon: "💎",
            class: "quoteIcon"
        }

    };




    const cfg =
        iconConfig[type] ||
        {
            icon: "📋",
            class: "defaultIcon"
        };

    document
        .getElementById(
            "leadModalTitle"
        )
        .innerHTML = `

<div class="modalTitleWrap">

    <span class="modalIcon ${cfg.class}">

        ${cfg.icon}

    </span>

    <span>

        ${title}

    </span>

</div>

`;

    renderLeadTable(data);

    document
        .getElementById(
            "leadModal"
        )
        .style.display =
        "flex";

}

function renderLeadTable(data) {

    const body =
        document.getElementById(
            "leadModalBody"
        );

    if (!data.length) {

        body.innerHTML =
            "No Records";

        return;

    }

    const headers =
        Object.keys(data[0]).filter(

            h =>

                h !== "_row" &&

                h !== "_sheet"

        );

    let html =
        `
<table class="leadTable">
<thead>
<tr>
`;

    console.log(headers);

    headers.forEach(h => {

        html +=
            `<th>${h}</th>`;

    });

    html +=
        `
</tr>
</thead>
<tbody>
`;

    data.forEach(row => {

        html += "<tr>";

        headers.forEach(h => {

            let value = row[h] || "";

            if (

                h.toLowerCase().includes("status")

            ) {

                const cls =

                    String(value)

                        .toLowerCase()

                        .replace(/\s+/g, "-");

                value =

                    `<span class="status-pill status-${cls}">

        ${value}

    </span>`;

            }

            html += `<td>${value}</td>`;

        });

        html += "</tr>";

    });

    html +=
        `
</tbody>
</table>
`;

    body.innerHTML =
        html;

}

function closeLeadModal() {

    document
        .getElementById(
            "leadModal"
        )
        .style.display =
        "none";

}

/*==================================================
SMART REQUIREMENT
==================================================*/

function getPriorityRequirement(row) {

    switch (row._source) {

        case "Air":

            return `${row.From || "-"} → ${row.To || "-"}

${formatTravelDate(row["Travel Date"])} • ${row.Adult || 1}A ${row.Child || 0}C`;

        case "Train":

            return `${row.From || "-"} → ${row.To || "-"}

${row.Class || "-"} • ${row.Passengers || "-"} Pax`;

        case "Bus":

            return `${row.From || "-"} → ${row.To || "-"}

${row.Class || "-"} • ${row.Passengers || "-"} Pax`;

        case "Car":

            return `${row.Vehicle || "-"}

${row["Journey Type"] || "-"}

• ${row.Location || "-"}`;

        case "Package":

            return `${row.Package || "-"}

${row["Travel Month"] || "-"}

• ${row.Adults || 1} Adults`;

        case "Premium Quote":

            return `${row.Service || "-"}

${row["Travel Month"] || "-"}

• ${row.Travellers || "-"}`;

        default:

            return "-";

    }

}

/*==================================================
SMART FOLLOWUP
==================================================*/

function getPriorityFollowup(row) {

    const value =

        row["Next Follow Up"] ||

        "";

    if (!value)

        return "—";

    const date = new Date(value);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const diff =

        Math.floor(

            (date - today) / 86400000

        );

    if (diff === 0)

        return "📅 Today";

    if (diff === 1)

        return "📅 Tomorrow";

    return `📅 ${date.toLocaleDateString("en-GB", {

        day: "2-digit",

        month: "short"

    })}`;

}

/*==================================================
SOURCE BADGE
==================================================*/

function getPrioritySource(row) {

    switch (row._source) {

        case "Air":

            return "✈ AIR";

        case "Train":

            return "🚆 TRAIN";

        case "Bus":

            return "🚌 BUS";

        case "Car":

            return "🚖 CAR";

        case "Package":

            return "🏖 PACKAGE";

        case "Premium Quote":

            return "💬 QUOTE";

        default:

            return "CRM";

    }

}

/*==================================================
PENDING PRIORITY
==================================================*/

function getPriorityWeight(status) {

    status =

        String(status || "")

            .toLowerCase();

    switch (status) {

        case "driver pending":

            return 1;

        case "payment pending":

            return 2;

        case "proposal pending":

            return 3;

        case "fare waiting":

            return 4;

        case "processing":

            return 5;

        case "follow up":

            return 6;

        case "followup":

            return 6;

        case "whatsapp":

            return 7;

        case "called":

            return 8;

        case "new":

            return 9;

        default:

            return 99;

    }

}

/*==================================================
SMART SORT
==================================================*/

function sortPriorityRows(rows) {

    rows.sort((a, b) => {

        const p =

            getPriorityWeight(a.Status) -

            getPriorityWeight(b.Status);

        if (p !== 0)

            return p;

        const da =

            new Date(

                a["Next Follow Up"] ||

                0

            );

        const db =

            new Date(

                b["Next Follow Up"] ||

                0

            );

        return da - db;

    });

    return rows;

}





function openPriorityModal(type) {

    let data = [];
    let title = "";

    switch (type) {

        /*=========================================
        FOLLOW UPS
        =========================================*/

        case "followup":

            title = "📞 Overdue Follow Ups";

            const allFollowups = [

                ...(dashboardData.quotes || []).map(x => ({ ...x, _source: "Premium Quote" })),
                ...(dashboardData.air || []).map(x => ({ ...x, _source: "Air" })),
                ...(dashboardData.train || []).map(x => ({ ...x, _source: "Train" })),
                ...(dashboardData.bus || []).map(x => ({ ...x, _source: "Bus" })),
                ...(dashboardData.cars || []).map(x => ({ ...x, _source: "Car" })),
                ...(dashboardData.packages || []).map(x => ({ ...x, _source: "Package" }))

            ];

            data = allFollowups.filter(x => {

                const status = String(x.Status || "")
                    .trim()
                    .toLowerCase();

                return status === "follow up" ||
                    status === "followup";

            });

            break;

        /*=========================================
        PREMIUM QUOTES
        =========================================*/

        case "quotes":

            title = "💬 Premium Quotes Pending";

            data = (dashboardData.quotes || []).filter(x =>

                String(x.Status || "").toLowerCase() !== "completed"

            );

            break;

        /*=========================================
        CAR BOOKINGS
        =========================================*/

        case "cars":

            title = "🚖 New Car Bookings";

            data = (dashboardData.cars || []).filter(x =>

                String(x.Status || "").toLowerCase() === "new"

            );

            break;

        /*=========================================
        PACKAGE LEADS
        =========================================*/

        case "packages":

            title = "🏖 Travel Leads";

            data = (dashboardData.packages || []).filter(x =>

                String(x.Status || "").toLowerCase() !== "completed"

            );

            break;

        /*=========================================
        AIR
        =========================================*/

        case "air":

            title = "✈ Air Enquiries";

            data = (dashboardData.air || []).filter(x =>

                String(x.Status || "").toLowerCase() !== "completed"

            );

            break;

        /*=========================================
        TRAIN
        =========================================*/

        case "train":

            title = "🚆 Train Enquiries";

            data = (dashboardData.train || []).filter(x =>

                String(x.Status || "").toLowerCase() !== "completed"

            );

            break;

        /*=========================================
        BUS
        =========================================*/

        case "bus":

            title = "🚌 Bus Enquiries";

            data = (dashboardData.bus || []).filter(x =>

                String(x.Status || "").toLowerCase() !== "completed"

            );

            break;

    }

    /*=========================================
    Modal Title
    =========================================*/

    document.getElementById("priorityModalTitle").innerText = title;

    document.getElementById("priorityModalSubtitle").innerHTML =
        `${data.length} Record${data.length !== 1 ? "s" : ""}`;

    /*=========================================
    Build Smart Fields
    =========================================*/

    data = data.map((row,index)=>({

    ...row,

    _priorityIndex:index,

    _requirement:getPriorityRequirement(row),

    _followup:getPriorityFollowup(row),

    _sourceBadge:getPrioritySource(row)

}));

    /*=========================================
    Smart Priority Sorting
    =========================================*/

    data = sortPriorityRows(data);

    /*=========================================
    Store Global Data
    =========================================*/

    priorityRows = [...data];

    priorityFilteredRows = [...data];

    priorityCurrentRows = [...data];

    priorityCurrentPage = 1;

    /*=========================================
    Clear Search
    =========================================*/

    const searchBox = document.getElementById("prioritySearch");

    if (searchBox) {

        searchBox.value = "";

    }

    /*=========================================
    Open Modal FIRST
    =========================================*/

    document.getElementById("priorityModal").style.display = "flex";

    /*=========================================
    Render Table
    =========================================*/

    renderPriorityTable(priorityRows);

}

/*==========================================
SHOW NOTES
==========================================*/

function showPriorityNotes(index){

    const row = priorityRows[index];

    if(!row) return;

    let notes = row.Notes || "No Notes";

    notes = notes.replace(/\n/g,"<br>");

    const popup = document.createElement("div");

    popup.className = "priorityNotesPopup";

    popup.innerHTML = `

<div class="priorityNotesCard">

<div class="priorityNotesHeader">

📝 Notes

<span onclick="this.closest('.priorityNotesPopup').remove()">

✕

</span>

</div>

<div class="priorityNotesBody">

${notes}

</div>

</div>

`;

    document.body.appendChild(popup);

}

function renderSourceBadge(source) {

    const map = {

        Air: {
            icon: "✈",
            classs: "sourceAir"
        },

        Train: {
            icon: "🚆",
            cls: "sourceTrain"
        },

        Bus: {
            icon: "🚌",
            cls: "sourceBus"
        },

        Car: {
            icon: "🚖",
            cls: "sourceCar"
        },

        Package: {
            icon: "🏖",
            cls: "sourcePackage"
        },

        Quote: {
            icon: "💬",
            cls: "sourceQuote"
        }

    };

    const item =

        map[source] ||

        {
            icon: "📌",
            cls: "sourceDefault"
        };

    return `

    <span class="sourceBadge ${item.cls}">

        <span class="sourceIcon">

            ${item.icon}

        </span>

        ${source}

    </span>

    `;
}

/*=========================================================
SHOW GLOBAL LOADER
=========================================================*/

function showLoader(text = "Updating CRM...") {

    const loader =
        document.getElementById("crmLoader");

    if (!loader) return;

    loader.classList.add("show");

    const txt =
        loader.querySelector("div:last-child");

    if (txt) {

        txt.innerText = text;

    }

}

/*=========================================================
HIDE GLOBAL LOADER
=========================================================*/

function hideLoader() {

    const loader =
        document.getElementById("crmLoader");

    if (!loader) return;

    loader.classList.remove("show");

}

/*=========================================================
SHOW TOAST
=========================================================*/

function showToast(

    message,

    type = "success"

) {

    const toast =

        document.getElementById("crmToast");

    if (!toast) return;

    toast.className = "";

    toast.classList.add(type);

    toast.classList.add("show");

    const icon =

        document.getElementById(

            "crmToastIcon"

        );

    const text =

        document.getElementById(

            "crmToastText"

        );

    switch (type) {

        case "success":

            icon.innerHTML = "✔";

            break;

        case "error":

            icon.innerHTML = "✖";

            break;

        case "warning":

            icon.innerHTML = "⚠";

            break;

        default:

            icon.innerHTML = "ℹ";

    }

    text.innerText = message;

    clearTimeout(

        toast._timer

    );

    toast._timer =

        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);

}

/*=========================================================
BUTTON LOADING
=========================================================*/

function setButtonLoading(

    button,

    loading,

    text = ""

) {

    // If string ID passed,
    // convert to button element

    if (typeof button === "string") {

        button =

            document.getElementById(

                button

            );

    }

    if (!button) {

        console.log(

            "Button not found"

        );

        return;

    }

    if (loading) {

        button.disabled = true;

        button.classList.add(

            "loading"

        );

        if (

            !button.querySelector(

                ".crmSpinner"

            )

        ) {

            button.insertAdjacentHTML(

                "afterbegin",

                '<span class="crmSpinner"></span>'

            );

        }

        if (text) {

            button.dataset.original =

                button.innerHTML;

            button.innerHTML =

                '<span class="crmSpinner"></span> '

                + text;

        }

    }

    else {

        button.disabled = false;

        button.classList.remove(

            "loading"

        );

        if (button.dataset.original) {

            button.innerHTML =

                button.dataset.original;

        }

    }

}

/*=========================================================
ESC KEY CLOSE
=========================================================*/

document.addEventListener(

    "keydown",

    function (e) {

        if (

            e.key !== "Escape"

        ) return;

        closeStatusModal?.();

        closeFollowupModal?.();

    }

);

/*=========================================================
OUTSIDE CLICK
=========================================================*/

window.addEventListener(

    "click",

    function (e) {

        if (

            e.target.id ===

            "statusModal"

        ) {

            closeStatusModal?.();

        }

        if (

            e.target.id ===

            "followupModal"

        ) {

            closeFollowupModal?.();

        }

    }

);

/*=========================================================
REFRESH DASHBOARD
=========================================================*/

async function refreshDashboard() {

    await loadDashboardData();

    updateDashboard();

}

/*=========================================================
CRM CONTEXT
=========================================================*/

const crmContext = {

    sheet: null,

    row: null,

    bookingId: null,

    customer: null

};

/*=========================================================
SET CRM CONTEXT
=========================================================*/

function setCRMContext(row) {

    crmContext.sheet =

        row._sheet;

    crmContext.row =

        row._row;

    crmContext.bookingId =

        row["Booking ID"] ||

        "";

    crmContext.customer =

        row.Name ||

        row["Customer Name"] ||

        row.Customer ||

        "Customer";

}

/*=========================================================
CLEAR CONTEXT
=========================================================*/

function clearCRMContext() {

    crmContext.sheet = null;

    crmContext.row = null;

    crmContext.bookingId = null;

    crmContext.customer = null;

}

/*=========================================================
VALIDATION
=========================================================*/

function validateCRMContext() {

    if (

        !crmContext.sheet ||

        !crmContext.row

    ) {

        showToast(

            "CRM Context Missing",

            "error"

        );

        return false;

    }

    return true;

}



function renderPriorityTable(data) {

    console.log("STEP 1");

    window.priorityCurrentRows = [...data];

    

    const body =
        document.getElementById("priorityModalBody");

    document.getElementById("priorityRecordCount").innerHTML =
        data.length +
        " Record" +
        (data.length !== 1 ? "s" : "");

    renderPriorityStats(data);

    if (data.length === 0) {

        body.innerHTML = `
        <div class="priorityEmptyState">

            <div class="emptyIcon">
                📭
            </div>

            <div class="emptyTitle">
                No Priority Records
            </div>

            <div class="emptySub">
                Everything looks under control.
            </div>

        </div>
        `;

        return;

    }


    
    //--------------------------------
    // Search
    //--------------------------------

    const keyword =
        document
            .getElementById("prioritySearch")
            .value
            .trim()
            .toLowerCase();



    let filtered =
        data.filter(r =>

            JSON.stringify(r)
                .toLowerCase()
                .includes(keyword)

        );

    //--------------------------------
    // Pagination
    //--------------------------------

    priorityFilteredRows = filtered;

    const start =
        (priorityCurrentPage - 1) *
        priorityRowsPerPage;

    const end =
        start +
        priorityRowsPerPage;

    filtered =
        filtered.slice(start, end);

    //--------------------------------
    // Build Table
    //--------------------------------

    body.innerHTML =

        buildPriorityTable(filtered) +
        buildPriorityPagination();

    console.log("Priority table rendered");

}

/*==========================================
PRIORITY TABLE BUILDER
==========================================*/

function buildPriorityTable(rows) {

    let html = `

<table class="priorityBusinessTable">

<thead>

${buildPriorityHeader()}

</thead>

<tbody>

`;

    rows.forEach((row,index)=>{

        html += buildPriorityRow(row,index);

    });

    html += `

</tbody>

</table>

`;

    return html;

}

/*==========================================
HEADER
==========================================*/

function buildPriorityHeader() {

    return `

<tr>

<th>ID</th>

<th>Source</th>

<th>Customer</th>

<th>Requirement</th>

<th>Status</th>

<th>Priority</th>

<th>Follow Up</th>

<th>Notes</th>


<th>Revenue</th>

<th>Action</th>

</tr>

`;

}

/*==========================================
BOOKING ID CELL
==========================================*/

function buildBookingIdCell(row,index){

    const id =
        row["Booking ID"] || "-";

    const sheet =
        String(
            row._sheet ||
            row._source ||
            ""
        ).toLowerCase();

    let icon="📄";

    if(sheet.includes("air")) icon="✈";
    else if(sheet.includes("train")) icon="🚆";
    else if(sheet.includes("bus")) icon="🚌";
    else if(sheet.includes("car")) icon="🚖";
    else if(sheet.includes("package")) icon="🏖";
    else if(sheet.includes("travel")) icon="🏖";
    else if(sheet.includes("quote")) icon="💎";

    return `

<div class="priorityBookingId"

onclick="event.stopPropagation();openPriorityCustomer(${index})">

<span class="bookingIcon">

${icon}

</span>

<span class="bookingCode">

${id}

</span>

</div>

`;

}

/*==========================================
ROW
==========================================*/

function buildPriorityRow(row,index) {

    return `

<tr
class="leadRowV2"
onclick="event.stopPropagation();openPriorityCustomer(${index})">


<td>

${buildBookingIdCell(row,index)}

</td>

<td>

${buildSourceCell(row)}

</td>

<td>

${buildCustomerCell(row)}

</td>

<td>

${getPriorityRequirement(row)}

</td>

<td>

${buildStatusCell(row)}

</td>

<td>

${buildPriorityCell(row)}

</td>

<td>

${buildFollowupCell(row)}

</td>

<td>

${buildNotesCell(row,index)}

</td>

<td>

${buildRevenueCell(row)}

</td>

<td>

${buildActionCell(row)}

</td>

</tr>

`;

}

function openPriorityCustomer(index){

    //closePriorityModal();

    const row = window.priorityCurrentRows[index];

    if(!row){
        console.error("Row not found");
        return;
    }

    // Reuse existing Lead Center logic
    openCustomerV2(row);

}

/*==========================================
NOTES CELL
==========================================*/

function buildNotesCell(row,index){

    return `

<div class="priorityNotesActions">

<button
class="priorityNotesBtn"
onclick='event.stopPropagation();showPriorityNotes(${index})'>

📝 View

</button>

<button
class="priorityNotesEditBtn"
onclick='event.stopPropagation();openPriorityCustomer(${index})'>

✏ Edit

</button>

</div>

`;

}

/*==========================================
CUSTOMER STATUS DOT
==========================================*/

function getCustomerStatusDot(status){

    status = String(status || "").trim().toLowerCase();

    const map = {

        "new":"🟢",

        "processing":"🟠",

        "proposal pending":"🔵",

        "follow up":"🟡",

        "followup":"🟡",

        "called":"🟣",

        "whatsapp sent":"🟦",

        "confirmed":"🟢",

        "driver pending":"🔴",

        "payment pending":"🟠",

        "completed":"✅",

        "lost":"❌"

    };

    return map[status] || "⚪";

}

/*==========================================
CUSTOMER
==========================================*/

/*==========================================
CUSTOMER
==========================================*/

function buildCustomerCell(row){

    const dot = getCustomerStatusDot(row.Status);

    return `

<div class="priorityCustomer">

<div class="priorityCustomerName">

<span class="customerStatusDot">

${dot}

</span>

${row["Customer Name"] || "-"}

</div>

<div class="priorityCustomerPhone">

📞 ${row.Phone || "-"}

</div>

</div>

`;

}

/*==========================================
REQUIREMENT
==========================================*/

/*==========================================
SMART REQUIREMENT
==========================================*/

function getPriorityRequirement(row) {

    const sheet =

        String(

            row._source ||

            row._sheet ||

            ""

        ).toLowerCase();


    /*==========================
    PREMIUM QUOTE
    ==========================*/

    if (sheet.includes("premium")) {

        return `

<div class="priorityRequirement">

<div class="reqTitle">

${row.Service || "-"}

</div>

<div class="reqSub">

🗓 ${formatTravelMonth(row["Travel Month"])}

&nbsp;&nbsp;

👥 ${row.Travellers || "-"}

 Traveller(s)

</div>

</div>

`;

    }


/*==========================
TRAVEL LEADS / PACKAGE
==========================*/

if (
    sheet.includes("package") ||
    sheet.includes("travel")
) {

    const packageName =
        row.Package ||
        row["Package Name"] ||
        "-";

    const travelMonth =
        row["Travel Month"] ||
        row.Month ||
        "";

    const adults =
        Number(
            row.Adults ??
            row.Adult ??
            0
        );

    const child =
        Number(
            row.Child ??
            row.Children ??
            0
        );

    const infant =
        Number(
            row.Infant ??
            row.Infants ??
            0
        );

    const pax =
        adults +
        child +
        infant;

    return `

<div class="priorityRequirement">

    <div class="reqTitle">

        🏖 ${packageName}

    </div>

    <div class="reqSub">

        🗓 ${formatTravelMonth(travelMonth)}

        &nbsp;&nbsp;

        👥 ${pax} Pax

    </div>

</div>

`;

}


/*==========================
CAR
==========================*/

if (sheet.includes("car")) {

    return `

<div class="priorityRequirement">

    <div class="reqTitle">

        ${row.Vehicle || "-"}

    </div>

    <div class="reqSub">

        📍 ${row.Location || "-"}

        <br>

        📅 ${formatShortDate(row.Pickup)} → ${formatShortDate(row.Drop)}

        <br>

        🚖 ${row["Journey Type"] || "-"}

    </div>

</div>

`;

}


    /*==========================
    AIR
    ==========================*/

    if (sheet.includes("air")) {

        const pax =

            Number(row.Adult || 0) +

            Number(row.Child || 0) +

            Number(row.Infant || 0);

        return `

<div class="priorityRequirement">

<div class="reqTitle">

✈ ${row.From || "-"} → ${row.To || "-"}

</div>

<div class="reqSub">

🗓 ${formatLeadDate(row["Travel Date"])}

&nbsp;&nbsp;

👥 ${pax} Pax

</div>

</div>

`;

    }


    /*==========================
    TRAIN
    ==========================*/

    if (sheet.includes("train")) {

        return `

<div class="priorityRequirement">

<div class="reqTitle">

🚆 ${row.From || "-"} → ${row.To || "-"}

</div>

<div class="reqSub">

🗓 ${formatLeadDate(row["Travel Date"])}

&nbsp;&nbsp;

🎫 ${row.Class || "-"}

&nbsp;&nbsp;

👥 ${row.Passengers || "-"}

 Pax

</div>

</div>

`;

    }


    /*==========================
    BUS
    ==========================*/

    if (sheet.includes("bus")) {

        return `

<div class="priorityRequirement">

<div class="reqTitle">

🚌 ${row.From || "-"} → ${row.To || "-"}

</div>

<div class="reqSub">

🗓 ${formatLeadDate(row["Travel Date"])}

&nbsp;&nbsp;

🎫 ${row.Class || "-"}

&nbsp;&nbsp;

👥 ${row.Passengers || "-"}

 Pax

</div>

</div>

`;

    }


    return "-";

}

function formatShortDate(value){

    if(!value) return "-";

    const d = new Date(value);

    return d.toLocaleDateString("en-IN",{

        day:"2-digit",

        month:"short"

    });

}

function formatTravelMonth(month) {

    if (!month) return "-";

    return month;

}

/*==========================================
STATUS
==========================================*/

function buildStatusCell(row) {

    return buildLeadStatusPill(row.Status);

}

/*==========================================
PRIORITY
==========================================*/

function buildPriorityCell(row) {

    return buildLeadPriorityPill(row.Priority);

}

/*==========================================
FOLLOWUP BADGE
==========================================*/

function buildFollowupCell(row){

    const followup =
        row["Next Follow Up"] ||
        row["Follow Up"] ||
        "";

    // No Follow-up
    if(!followup){

        return `

<span class="followupBadge followupNone">

—

</span>

`;

    }

    const followDate = new Date(followup);

    followDate.setHours(0,0,0,0);

    const today = new Date();

    today.setHours(0,0,0,0);

    const diff =
        Math.floor(
            (followDate - today) /
            (1000*60*60*24)
        );

    let cls = "";
    let icon = "";
    let text = "";

    if(diff < 0){

        cls = "followupOverdue";
        icon = "🔴";
        text = "Overdue";

    }
    else if(diff === 0){

        cls = "followupToday";
        icon = "🟠";
        text = "Today";

    }
    else if(diff === 1){

        cls = "followupTomorrow";
        icon = "🟡";
        text = "Tomorrow";

    }
    else{

        cls = "followupFuture";
        icon = "🟢";

        text = followDate.toLocaleDateString("en-GB",{
            day:"2-digit",
            month:"short"
        });

    }

    return `

<span class="followupBadge ${cls}">

${icon} ${text}

</span>

`;

}

/*==========================================
SOURCE
==========================================*/

function buildSourceCell(row) {

    return `

<div class="prioritySource">

${row._sourceBadge}

</div>

`;

}

/*==========================================
REVENUE BADGE
==========================================*/

function buildRevenueCell(row){

    let revenue =
        row.Revenue ||
        row["Estimated Revenue"] ||
        "";

    revenue = Number(revenue);

    // Empty Revenue
    if(!revenue || isNaN(revenue)){

        return `

<span class="revenueBadge revenueNone">

—

</span>

`;

    }

    let cls = "revenueLow";

    if(revenue >= 25000){

        cls = "revenueHigh";

    }

    else if(revenue >= 5000){

        cls = "revenueMedium";

    }

    return `

<span class="revenueBadge ${cls}">

₹${revenue.toLocaleString("en-IN")}

</span>

`;

}

/*==========================================
ACTION
==========================================*/

function buildActionCell(row) {

    return `

<div class="crmActions">

<button

class="crmBtn callBtn"

onclick='callCustomer(${JSON.stringify(row)})'>

☎

</button>

<button

class="crmBtn whatsappBtn"

onclick='openWhatsappModal(${JSON.stringify(row)})'>

💬

</button>

<button

class="crmBtn statusBtn"

onclick='openStatusModal(${JSON.stringify(row)})'>

✏

</button>

<button

class="crmBtn followupBtn"

onclick='openFollowupModal(${JSON.stringify(row)})'>

📅

</button>

</div>

`;

}



function renderPriorityStats(data){

    let high = 0;
    let today = 0;
    let overdue = 0;
    let revenue = 0;

    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);

    data.forEach(row=>{

        /*-------------------------
        Priority
        --------------------------*/
        if(String(row.Priority || "").toLowerCase()=="high"){
            high++;
        }

        /*-------------------------
        Revenue
        --------------------------*/
        revenue += Number(row.Revenue || row["Estimated Revenue"] || 0);

        /*-------------------------
        Follow Up
        --------------------------*/
        const follow =
            row["Next Follow Up"] ||
            row.NextFollowUp ||
            "";

        if(!follow) return;

        const d = new Date(follow);

        if(isNaN(d)) return;

        d.setHours(0,0,0,0);

        if(d.getTime()==todayDate.getTime()){

            today++;

        }else if(d<todayDate){

            overdue++;

        }

    });

    document.getElementById("priorityStatsRibbon").innerHTML = `

<div class="priorityStatCard high">
<div class="statIcon">🔴</div>
<div class="statLabel">High</div>
<div class="statValue">${high}</div>
</div>

<div class="priorityStatCard today">
<div class="statIcon">📅</div>
<div class="statLabel">Today</div>
<div class="statValue">${today}</div>
</div>

<div class="priorityStatCard overdue">
<div class="statIcon">⏰</div>
<div class="statLabel">Overdue</div>
<div class="statValue">${overdue}</div>
</div>

<div class="priorityStatCard revenue">
<div class="statIcon">💰</div>
<div class="statLabel">Revenue</div>
<div class="statValue">₹${Number(revenue).toLocaleString("en-IN")}</div>
</div>

<div class="priorityStatCard total">
<div class="statIcon">📋</div>
<div class="statLabel">Total</div>
<div class="statValue">${data.length}</div>
</div>

`;

}

function closePriorityModal() {

    document.getElementById(

        "priorityModal"

    ).style.display = "none";

}





async function updateStatusModal(

    sheet,

    row

) {

    const status = prompt(

        "Enter Status\n\nNEW\nFollow Up\nCompleted\nWhatsApp Sent"

    );

    if (!status) return;

    const result =

        await updateCRMStatus({

            sheet,

            row,

            status

        });

    console.log(result);

    loadDashboardData();

}

async function followupModal(

    sheet,

    row

) {

    const dt = prompt(

        "Enter Follow Up Date\n\nYYYY-MM-DD"

    );

    if (!dt) return;

    const result =

        await updateCRMFollowup({

            sheet,

            row,

            followup: dt

        });

    console.log(result);

    loadDashboardData();

}

function showToast(message, type = "success") {

    const toast =

        document.getElementById("crmToast");

    toast.innerHTML = message;

    toast.className =

        "crmToast " + type;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

/*====================================================
OPEN STATUS MODAL
====================================================*/

/*====================================================
OPEN STATUS MODAL
====================================================*/

let currentCRMRecord = null;

function openStatusModal(row) {

    currentCRMRecord = row;

    document.getElementById(
        "statusCustomerName"
    ).innerText =

        row.Name ||

        row["Customer Name"] ||

        row.Customer ||

        "Customer";

    document.getElementById(
        "crmStatus"
    ).value =

        row.Status ||

        "NEW";

    document.getElementById("crmRevenue").value =
        row.Revenue || "";

    document.getElementById("crmStatus").onchange =
        toggleRevenueField;

    // Run once immediately
    toggleRevenueField();


    document.getElementById(
        "crmNotes"
    ).value =

        row.Notes ||

        "";

    const priority =
        document.getElementById("priorityModal");

    if (priority) {

        priority.style.display = "none";

    }

    document.getElementById(
        "statusModal"
    ).style.display =

        "flex";

}

function toggleRevenueField() {

    const status =
        document.getElementById("crmStatus").value;

    const revenue =
        document.getElementById("crmRevenue");

    console.log("Selected Status =", status);

    const allowed = [

        "Confirmed",

        "Processing",

        "Completed"

    ];

    if (allowed.includes(status)) {

        revenue.disabled = false;

        revenue.placeholder = "Enter Final Fare";

    } else {

        revenue.disabled = true;

        revenue.value = "";

        revenue.placeholder = "Revenue not required";

    }

}

function closeStatusModal() {

    document.getElementById(
        "statusModal"
    ).style.display = "none";

    const priority =
        document.getElementById("priorityModal");

    if (priority) {

        priority.style.display = "none";

    }

    document.getElementById(
        "statusModal"
    ).style.display =

        "none";

    currentCRMRecord = null;

}

/*====================================================
SAVE STATUS
====================================================*/

async function saveStatus() {

    if (!currentCRMRecord) {

        showToast(
            "No CRM record selected",
            "error"
        );

        return;

    }

    const status =

        document
            .getElementById(
                "crmStatus"
            )
            .value;

    const notes =

        document
            .getElementById(
                "crmNotes"
            )
            .value;

    const revenue =

        Number(

            document
                .getElementById(
                    "crmRevenue"
                )
                .value

        ) || 0;

    setButtonLoading(

        "saveStatusBtn",

        true,

        "Saving..."

    );

    showLoader();

    try {

        const result =

            await fetch(

                DASHBOARD_CONFIG.API,

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "text/plain"

                    },

                    body: JSON.stringify({

                        action: "updateCRMStatus",

                        sheet:

                            currentCRMRecord._sheet,

                        row:

                            currentCRMRecord._row,

                        status: status,

                        notes: notes,

                        revenue: revenue

                    })

                }

            );

        const json =

            await result.json();

        hideLoader();

        setButtonLoading(

            "saveStatusBtn",

            false

        );

        if (json.success) {

            showToast(

                "Status Updated Successfully",

                "success"

            );

            setTimeout(() => {

                closeStatusModal();

            }, 300);

            setTimeout(async () => {

                await loadDashboardData();

                if (typeof renderPriority === "function") {

                    renderPriority();

                }

            }, 1800);

        }

        else {

            showToast(

                json.error ||

                "Unable to update",

                "error"

            );

        }

    }

    catch (err) {

        hideLoader();

        setButtonLoading(

            "saveStatusBtn",

            false

        );

        showToast(

            err.message,

            "error"

        );

    }

    await loadLiveOperations();

    await loadDashboardKPI();

}

let currentFollowupRow = null;

function openFollowupModal(row) {

    currentFollowupRow = row;

    document.getElementById(
        "followupCustomer"
    ).innerText =

        row.Name ||

        row["Customer Name"] ||

        row.Customer ||

        "Customer";

    document.getElementById(
        "crmFollowDate"
    ).value =

        row["Next Follow Up"] ||

        "";

    document.getElementById(
        "crmFollowNotes"
    ).value =

        row.Notes ||

        "";

    const priority =
        document.getElementById("priorityModal");

    if (priority) {

        priority.style.display = "none";

    }

    document.getElementById(
        "followupModal"
    ).style.display =

        "flex";

}

function closeFollowupModal() {

    document.getElementById(
        "followupModal"
    ).style.display = "none";

    currentFollowupRow = null;

}

async function saveFollowup() {

    if (!currentFollowupRow) return;

    showLoader();

    const followup =
        document.getElementById(
            "crmFollowDate"
        ).value;

    const notes =
        document.getElementById(
            "crmFollowNotes"
        ).value;

    try {

        const result =

            await fetch(

                DASHBOARD_CONFIG.API,

                {

                    method: "POST",

                    headers: {
                        "Content-Type": "text/plain"
                    },

                    body: JSON.stringify({

                        action: "updateCRMFollowup",

                        sheet:
                            currentFollowupRow._sheet,

                        row:
                            currentFollowupRow._row,

                        followup,

                        notes

                    })

                }

            );

        const json =
            await result.json();

        hideLoader();

        if (json.success) {

            closeFollowupModal();

            showToast(

                "Follow Up Updated Successfully",

                "success"

            );

            loadDashboardData();

        }
        else {

            showToast(

                json.error ||

                "Unable to Save",

                "error"

            );

        }

    }

    catch (err) {

        hideLoader();

        showToast(

            err.toString(),

            "error"

        );

    }

    await loadLiveOperations();

    await loadDashboardKPI();

}

/*=========================================
CALL CUSTOMER
=========================================*/

async function callCustomer(row) {

    if (!row) return;

    const phone =
        row.Phone ||
        row.Mobile ||
        "";

    if (!phone) {

        showToast(
            "Phone number not available",
            "warning"
        );

        return;

    }

    // Save CRM Context
    setCRMContext(row);

    // Open Phone Dialer
    window.location.href =
        "tel:" + phone;

    try {

        const res =
            await fetch(

                getApiUrl(),

                {

                    method: "POST",

                    headers: {
                        "Content-Type": "text/plain"
                    },

                    body: JSON.stringify({

                        action: "logCRMCall",

                        env: DASHBOARD_ENV,


                        sheet: row._sheet,

                        row: row._row,

                        phone: phone,

                        customer:
                            row.Name ||
                            row["Customer Name"] ||
                            "",

                        service:
                            row.Service || "",

                        bookingId:
                            row["Booking ID"] || ""

                    })

                }

            );

        const json =
            await res.json();

        if (json.success) {

            loadDashboardData();

        }

    }

    catch (err) {

        console.log(err);

    }

    await loadLiveOperations();

    await loadDashboardKPI();

}

function openWhatsappModal(row) {

    currentWhatsappRow = row;

    // Hide Priority Modal
    const priorityModal =
        document.getElementById("priorityModal");

    customerDrawerV2.style.display = "none";

    if (priorityModal) {

        priorityModal.style.display = "none";

    }

    // Customer Name
    document.getElementById(
        "whatsappCustomer"
    ).innerText =

        row.Name ||

        row["Customer Name"] ||

        "Customer";

    // Default Template
    document.getElementById(
        "whatsappTemplate"
    ).value = "Holiday Package";

    loadWhatsappTemplate();

    // Show WhatsApp Modal
    document.getElementById(
        "whatsappModal"
    ).style.display = "flex";

}

function closeWhatsappModal() {

    document.getElementById("whatsappModal").style.display = "none";

    const row = currentWhatsappRow;

    currentWhatsappRow = null;

    setTimeout(() => {

        if (row) {

            // Rebuild the drawer for the same customer
            openCustomerV2(row);

        }

    }, 150);

}

function loadWhatsappTemplate() {

    if (!currentWhatsappRow) return;

    const name =

        currentWhatsappRow.Name ||

        currentWhatsappRow["Customer Name"] ||

        "";

    const service =

        currentWhatsappRow.Service ||

        "";

    const template =

        document.getElementById(

            "whatsappTemplate"

        ).value;

    let message = "";

    switch (template) {

        case "Holiday Package":

            message =

                `Hi ${name},

Thank you for contacting Ransan Travels.

We are preparing the best holiday package for you.

Regards
Ransan Travels`;

            break;

        case "Quotation":

            message =

                `Hi ${name},

Your quotation for ${service} is ready.

Please check and let us know.

Thanks
Ransan Travels`;

            break;

        case "Reminder":

            message =

                `Hi ${name},

Just a gentle reminder regarding your enquiry.

Please let us know if you need any assistance.

Regards`;

            break;

        case "Follow Up":

            message =

                `Hi ${name},

Following up regarding your travel enquiry.

Kindly let us know your plan.

Thank you`;

            break;

        case "Payment Reminder":

            message =

                `Hi ${name},

Kindly complete your pending payment to confirm your booking.

Regards`;

            break;

        case "Custom":

            message = "";

            break;

    }

    document.getElementById(

        "whatsappMessage"

    ).value = message;

}

async function sendCRMWhatsapp() {

    if (!currentWhatsappRow) return;

    const mobile =

        currentWhatsappRow.Phone ||

        currentWhatsappRow.Mobile ||

        "";

    const message =

        document.getElementById(

            "whatsappMessage"

        ).value;

    showLoader();

    setButtonLoading(

        "sendWhatsappBtn",

        true

    );

    try {

        const response =

            await fetch(

                getApiUrl(),

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "text/plain"

                    },

                    body: JSON.stringify({

                        action: "sendCRMWhatsapp",

                        env: DASHBOARD_ENV,


                        sheet:

                            currentWhatsappRow._sheet,

                        row:

                            currentWhatsappRow._row,

                        mobile,

                        message

                    })

                }

            );

        const text = await response.text();

        console.log("RAW RESPONSE =", text);

        const json = JSON.parse(text);

        console.log("PARSED =", json);

        hideLoader();

        setButtonLoading(

            "sendWhatsappBtn",

            false

        );

        if (json.success) {

            closeWhatsappModal();

            showToast(
                "WhatsApp Sent Successfully",
                "success"
            );

            setTimeout(() => {

                loadDashboardData();

            }, 1200);

        }

        else {

            showToast(

                json.error,

                "error"

            );

        }

    }

    catch (err) {

        hideLoader();

        setButtonLoading(

            "sendWhatsappBtn",

            false

        );

        showToast(

            err.toString(),

            "error"

        );

    }

    await loadLiveOperations();

    await loadDashboardKPI();

}

document

    .getElementById(

        "prioritySearch"

    )

    .addEventListener(

        "input",

        function () {

            renderPriorityTable(

                priorityCurrentRows

            );

        }

    );


    function renderLoggedInUser() {

    const username =
        sessionStorage.getItem(
            "portalUsername"
        ) || "";

    const role =
        sessionStorage.getItem(
            "portalRole"
        ) || "";

    const environment =
        sessionStorage.getItem(
            "portalEnvironment"
        ) || "";


    const nameElement =
        document.getElementById(
            "portalCustomerName"
        );


    if (nameElement) {

        nameElement.innerHTML = `

            ${username}

            <span
                style="
                    font-size:11px;
                    margin-left:8px;
                    opacity:.7;
                ">

                ${role}

            </span>

        `;

    }


    const phoneElement =
        document.getElementById(
            "portalCustomerPhone"
        );


    if (phoneElement) {

        phoneElement.textContent =
            environment;

    }

}