/*==================================================
LEAD CENTER V2
==================================================*/

let leadCenterKPI = {};

let leadCenterRows = [];

let currentLeadStage = "all";

let currentLeadService = "all";


/*=========================================
LEAD TABLE PAGINATION
=========================================*/

let leadCurrentPage = 1;

let leadRowsPerPage = 25;

let leadFilteredRows = [];


/*==================================================
ALL CRM ROWS
==================================================*/

function getAllLeadRows() {

    return [

        ...(dashboardData.air || []).map(x => ({
            ...x,
            _service: "air"
        })),

        ...(dashboardData.train || []).map(x => ({
            ...x,
            _service: "train"
        })),

        ...(dashboardData.bus || []).map(x => ({
            ...x,
            _service: "bus"
        })),

        ...(dashboardData.cars || []).map(x => ({
            ...x,
            _service: "car"
        })),

        ...(dashboardData.packages || []).map(x => ({
            ...x,
            _service: "package"
        })),

        ...(dashboardData.quotes || []).map(x => ({
            ...x,
            _service: "quote"
        }))

    ];

}

/*==================================================
LEAD CENTER KPI
==================================================*/

function calculateLeadCenterKPI() {

    const rows = getAllLeadRows();

    leadCenterRows = rows;

    leadCenterKPI = {

        newLeads: [],

        pending: [],


        followups: [],

        quotes: [],

        converted: [],

        lost: []

    };

    rows.forEach(row => {

        const status =

            String(row.Status || "")
                .trim()
                .toLowerCase();

        if (

            status === "" ||

            status === "new"

        ) {

            leadCenterKPI.newLeads.push(row);

        }


        if (

            [

                "processing",

                "pending",

                "whatsapp sent",

                "called",

                "waiting",

                "waiting confirmation",

                "driver pending",

                "fare waiting",

                "follow up",

                "confirmed",

                "proposal pending"

            ].includes(status)

        ) {

            leadCenterKPI.pending.push(row);

        }

        if (

            status === "follow up" ||

            status === "followup"

        ) {

            leadCenterKPI.followups.push(row);

        }

        if (

            row._service === "quote" &&

            status !== "completed"

        ) {

            leadCenterKPI.quotes.push(row);

        }

        if (

            status === "completed" ||

            status === "converted"

        ) {

            leadCenterKPI.converted.push(row);

        }

        if (

            status === "lost" ||

            status === "cancelled"

        ) {

            leadCenterKPI.lost.push(row);

        }

    });

}

function buildLeadCenterCard({

    icon,

    title,

    subtitle,

    indicator,

    count,

    cls,

    stage,

    progress

}) {


    

    return `

<div
class="leadStageCard ${cls}"
onclick="openLeadCenterModalV2('${stage}')">

    <div class="leadStageHeader">

        <div class="leadStageIcon">

            ${icon}

        </div>

        <div class="leadStageCount">

            ${count}

        </div>

    </div>

    <div class="leadStageTitle">

        ${title}

    </div>

    <div class="leadStageSub">

        ${subtitle}

    </div>

<div class="leadStageIndicator">

    <span class="leadIndicatorChip">

        ${indicator}

    </span>

</div>

<div class="leadProgressWrap">

    <div class="leadProgress">

        <div
            class="leadProgressFill"
            style="width:${progress}%">
        </div>

    </div>

<div class="leadProgressBadge ${getProgressBadgeClass(progress)}">

    📊 ${progress}%

</div>

</div>

</div>

`;

}

function getProgressBadgeClass(progress) {

    if (progress >= 80)
        return "progressExcellent";

    if (progress >= 60)
        return "progressGood";

    if (progress >= 40)
        return "progressAverage";

    if (progress >= 20)
        return "progressLow";

    return "progressCritical";

}

/*==================================================
RENDER LEAD CENTER
==================================================*/

function renderLeadCenterV2() {

    calculateLeadCenterKPI();

    const totalLeads =

        Math.max(

            1,

            leadCenterRows.length

        );

    const grid =

        document.getElementById(

            "leadCenterGridV2"

        );

    if (!grid)

        return;

    let html = "";

    html += buildLeadCenterCard({

        icon: "🆕",

        title: "New Leads",

        subtitle: "Fresh Enquiries",

        indicator: getLeadCenterIndicator("new"),

        count: leadCenterKPI.newLeads.length,

        progress: Math.round(
            (leadCenterKPI.newLeads.length / totalLeads) * 100
        ),

        cls: "stageNew",

        stage: "new"

    });

    html += buildLeadCenterCard({

        icon: "⏳",

        title: "Pending",

        subtitle: "Open Requests",

        indicator: getLeadCenterIndicator("pending"),


        count: leadCenterKPI.pending.length,

        progress: Math.round(
            (leadCenterKPI.pending.length / totalLeads) * 100
        ),

        cls: "stagePending",

        stage: "pending"

    });

    html += buildLeadCenterCard({

        icon: "📞",

        title: "Today's Followups",

        subtitle: "Customer Calls",

        indicator: getLeadCenterIndicator("followup"),

        count: leadCenterKPI.followups.length,

        progress: Math.round(
            (leadCenterKPI.followups.length / totalLeads) * 100
        ),

        cls: "stageFollowup",

        stage: "followup"

    });

    html += buildLeadCenterCard({

        icon: "💰",

        title: "Quotes Pending",

        subtitle: "Premium Sales",

        indicator: getLeadCenterIndicator("quote"),

        count: leadCenterKPI.quotes.length,

        progress: Math.round(
            (leadCenterKPI.quotes.length / totalLeads) * 100
        ),

        cls: "stageQuote",

        stage: "quote"

    });

    html += buildLeadCenterCard({

        icon: "✅",

        title: "Converted",

        subtitle: "Successful Sales",

        indicator: getLeadCenterIndicator("converted"),

        count: leadCenterKPI.converted.length,

        progress: Math.round(
            (leadCenterKPI.converted.length / totalLeads) * 100
        ),

        cls: "stageConverted",

        stage: "converted"

    });

    html += buildLeadCenterCard({

        icon: "❌",

        title: "Lost Leads",

        subtitle: "Closed Enquiries",

        indicator: getLeadCenterIndicator("lost"),

        count: leadCenterKPI.lost.length,

        progress: Math.round(
            (leadCenterKPI.lost.length / totalLeads) * 100
        ),

        cls: "stageLost",

        stage: "lost"

    });

    grid.innerHTML = html;

}

function getLeadCenterIndicator(stage) {

    switch (stage) {

        case "new":
            return "🟢 +" + leadCenterKPI.newLeads.length + " Today";

        case "pending":
            return "🟠 Need Action";

        case "followup":
            return "🟣 Due Today";

        case "quote":
            return "🟡 Awaiting Customer";

        case "converted":
            return "✅ Closed Successfully";

        case "lost":
            return "❌ Requires Review";

        default:
            return "";

    }

}

function openLeadCenterModalV2(stage) {

    currentLeadStage = stage;
    currentLeadService = "all";

    const map = {

        new: "🆕 New Leads",

        pending: "⏳ Pending",

        followup: "📞 Today's Followups",

        quote: "💰 Quotes Pending",

        converted: "✅ Converted",

        lost: "❌ Lost Leads"

    };

    document.getElementById("leadCenterTitleV2").innerHTML =
        map[stage] || "Lead Center";

    document.getElementById("leadCenterSubtitleV2").innerHTML =
        "";

    document.getElementById("leadSearchInputV2").value = "";

    document.getElementById("leadCenterModalV2").style.display =
        "flex";

    renderLeadCenterChips();

    renderLeadCenterTable();

}

function closeLeadCenterModalV2() {

    document.getElementById(

        "leadCenterModalV2"

    ).style.display = "none";

}

/*==================================================
LEAD CENTER
SERVICE CHIPS
==================================================*/

function renderLeadCenterChips() {

    const wrap =
        document.getElementById("leadCenterChips");

    if (!wrap)
        return;

    const chips = [

        { id: "all", text: "ALL" },

        { id: "air", text: "AIR" },

        { id: "train", text: "TRAIN" },

        { id: "bus", text: "BUS" },

        { id: "car", text: "CAR" },

        { id: "package", text: "PACKAGE" },

        { id: "quote", text: "QUOTE" }

    ];

    wrap.innerHTML = chips.map(ch => `

<button
class="leadChipV2 ${currentLeadService === ch.id ? "active" : ""}"
data-service="${ch.id}"
onclick="selectLeadService('${ch.id}')">

${ch.text}

</button>

`).join("");

}


function selectLeadService(service) {

    if (currentLeadService === service)
        return;

    currentLeadService = service;

    leadCurrentPage = 1;

    // Clear search
    const searchBox =
        document.getElementById("leadSearchInputV2");

    if (searchBox)
        searchBox.value = "";

    document
        .querySelectorAll(".leadChipV2")
        .forEach(chip => {

            chip.classList.toggle(
                "active",
                chip.dataset.service === service
            );

        });

    renderLeadCenterTable();

}

function getLeadStageRows() {

    switch (currentLeadStage) {

        case "new":

            return leadCenterKPI.newLeads;

        case "pending":

            return leadCenterKPI.pending;

        case "followup":

            return leadCenterKPI.followups;

        case "quote":

            return leadCenterKPI.quotes;

        case "converted":

            return leadCenterKPI.converted;

        case "lost":

            return leadCenterKPI.lost;

    }

    return [];

}

function getFilteredLeadRows() {

    let rows =

        [...getLeadStageRows()];

    if (currentLeadService !== "all") {

        rows =

            rows.filter(x =>

                x._service ===

                currentLeadService

            );

    }

    const q =

        document.getElementById(

            "leadSearchInputV2"

        )

            .value

            .trim()

            .toLowerCase();

    if (q) {

        rows =

            rows.filter(r => {

                return JSON.stringify(r)

                    .toLowerCase()

                    .includes(q);

            });

    }

    return rows;

}

/*==================================================
LEAD CENTER FILTER
==================================================*/

function filterLeadCenterRows(rows) {

    return rows;

}

/*==================================================
LEAD CENTER SORT
==================================================*/

function sortLeadRows(rows) {

    return rows.sort((a, b) => {

        const da = new Date(a["Created Date"] || 0);

        const db = new Date(b["Created Date"] || 0);

        return db - da;

    });

}

/*==================================================
LEAD CENTER V2
TABLE RENDERER
==================================================*/

function renderLeadCenterTable() {

    const container =
        document.getElementById("leadCenterTableWrap");

    if (!container) return;

    //--------------------------------------------------
    // Get Data
    //--------------------------------------------------

    let rows = getFilteredLeadRows();

    rows = filterLeadCenterRows(rows);

    rows = sortLeadRows(rows);

    rows = sortPendingRows(rows);

    /*=========================================
UPDATE TOTAL COUNT
=========================================*/

    const countBox =
        document.getElementById("leadCenterCountV2");

    if (countBox) {

        countBox.innerHTML =
            rows.length +
            " Lead" +
            (rows.length !== 1 ? "s" : "");

    }

    //--------------------------------------------------
    // Search
    //--------------------------------------------------

    const search =
        document
            .getElementById("leadSearchInputV2")
            ?.value
            ?.trim()
            ?.toLowerCase() || "";

    if (search) {

        rows = rows.filter(row =>

            JSON.stringify(row)
                .toLowerCase()
                .includes(search)

        );

    }

    //--------------------------------------------------
    // Total Count
    //--------------------------------------------------

    const totalRecords = rows.length;

    //--------------------------------------------------
    // Empty State
    //--------------------------------------------------

    if (totalRecords === 0) {

        container.innerHTML = `

<div class="leadEmptyStateV2">

    <div class="leadEmptyIcon">
        📭
    </div>

    <div class="leadEmptyTitle">
        No Leads Found
    </div>

    <div class="leadEmptySub">
        Try another Service or Search.
    </div>

</div>

`;

        document.getElementById("leadCenterSubtitleV2").innerHTML =
            "0 Records";

        return;

    }

    //--------------------------------------------------
    // Pagination
    //--------------------------------------------------

    rows = getLeadCurrentPageRows(rows);

    //--------------------------------------------------
    // Build Table
    //--------------------------------------------------

let html = `

<table class="leadTableV2">

<thead>

<tr>

<th>ID</th>

<th>Svc</th>

<th>Customer</th>

<th>Journey</th>

<th>Status</th>

<th>Priority</th>

<th>Follow Up</th>

<th>Source / Revenue</th>

<th>Action</th>

</tr>

</thead>

<tbody>

`;

    //--------------------------------------------------
    // Rows
    //--------------------------------------------------

    rows.forEach(row => {

        html += buildLeadTableRow(row);

    });

    html += `

</tbody>

</table>

`;

    //--------------------------------------------------
    // Pagination
    //--------------------------------------------------

    html += buildLeadPagination();

    //--------------------------------------------------
    // Render
    //--------------------------------------------------

    container.innerHTML = html;

    //--------------------------------------------------
    // Subtitle
    //--------------------------------------------------

    document.getElementById("leadCenterSubtitleV2").innerHTML =

        `${totalRecords} Record${totalRecords > 1 ? "s" : ""}`;

}


/*=========================================
BOOKING ID
=========================================*/

function getLeadBookingId(row) {

    return row["Booking ID"] || "-";

}

/*=========================================
JOURNEY / REQUIREMENT
=========================================*/

function getJourney(row) {

    switch (row._service) {

        case "air":

            return `${row.From || ""} → ${row.To || ""}`;

        case "train":

            return `${row.From || ""} → ${row.To || ""}`;

        case "bus":

            return `${row.From || ""} → ${row.To || ""}`;

        case "car":

            return `${row.Vehicle || ""} • ${row["Journey Type"] || ""}`;

        case "package":

            return `${row.Package || ""}`;

        case "quote":

            return `${row.Service || ""}`;

        default:

            return "--";

    }

}

/*=========================================
PENDING PRIORITY SORT
=========================================*/

function sortPendingRows(rows) {

    // Only apply for Pending card

    if (currentLeadStage !== "pending") {

        return rows;

    }

    const priorityMap = {

        "driver pending": 1,

        "payment pending": 2,

        "proposal pending": 3,

        "fare waiting": 4,

        "processing": 5,

        "pending": 5,

        "whatsapp": 6,

        "called": 7

    };

    rows.sort((a, b) => {

        const pa = priorityMap[String(a.Status || "").toLowerCase()] || 99;

        const pb = priorityMap[String(b.Status || "").toLowerCase()] || 99;

        if (pa !== pb) {

            return pa - pb;

        }

        // Same priority → nearest follow-up first

        const da = new Date(a["Next Follow Up"] || a["Travel Date"] || 0);

        const db = new Date(b["Next Follow Up"] || b["Travel Date"] || 0);

        return da - db;

    });

    return rows;

}

/*==================================================
LIVE SEARCH
==================================================*/

document

    .getElementById(

        "leadSearchInputV2"

    )

    ?.addEventListener(

        "input",

        renderLeadCenterTable

    );

function showLeadSkeleton() {

    const wrap =
        document.getElementById(
            "leadCenterTableWrap"
        );

    if (!wrap)
        return;

    wrap.innerHTML = `

<div class="leadSkeleton">

    <div class="leadSkeletonRow"></div>

    <div class="leadSkeletonRow"></div>

    <div class="leadSkeletonRow"></div>

    <div class="leadSkeletonRow"></div>

    <div class="leadSkeletonRow"></div>

</div>

`;

}



function buildLeadEmptyState() {

    return `

<div class="leadEmptyState">

<div class="leadEmptyIcon">

🔍

</div>

<div class="leadEmptyTitle">

No Leads Found

</div>

<div class="leadEmptySub">

Try changing filters

or search keywords.

</div>

</div>

`;

}

document.addEventListener(

    "keydown",

    e => {

        if (

            e.ctrlKey &&

            e.key === "f"

        ) {

            e.preventDefault();

            document.getElementById(

                "leadSearchInputV2"

            ).focus();

        }

    }
);

setTimeout(() => {

    document

        .getElementById(

            "leadSearchInputV2"

        )

        .focus();

}, 200);



/*=========================================
CURRENT PAGE DATA
=========================================*/

function getLeadCurrentPageRows(rows) {

    leadFilteredRows = rows;

    const start =

        (leadCurrentPage - 1)

        *

        leadRowsPerPage;

    const end =

        start +

        leadRowsPerPage;

    return rows.slice(start, end);

}

function getLeadTotalPages() {

    return Math.max(

        1,

        Math.ceil(

            leadFilteredRows.length /

            leadRowsPerPage

        )

    );

}

function leadNextPage() {

    if (

        leadCurrentPage <

        getLeadTotalPages()

    ) {

        leadCurrentPage++;

        renderLeadCenterTable();

    }

}

function leadPrevPage() {

    if (

        leadCurrentPage > 1

    ) {

        leadCurrentPage--;

        renderLeadCenterTable();

    }

}

function leadGoPage(page) {

    leadCurrentPage = page;

    renderLeadCenterTable();

}

function leadChangeRowsPerPage() {

    leadRowsPerPage =

        Number(

            document.getElementById(

                "leadRowsPerPage"

            ).value

        );

    leadCurrentPage = 1;

    renderLeadCenterTable();

}

function buildLeadPagination() {

    const totalPages =

        getLeadTotalPages();

    const totalRows =

        leadFilteredRows.length;

    const start =

        ((leadCurrentPage - 1)

            *

            leadRowsPerPage) + 1;

    const end =

        Math.min(

            totalRows,

            leadCurrentPage *

            leadRowsPerPage

        );

    let pages = "";

    for (

        let i = 1;

        i <= totalPages;

        i++

    ) {

        pages += `

<button

class="leadPageBtn

${i === leadCurrentPage ? "active" : ""}"

onclick="leadGoPage(${i})"

>

${i}

</button>

`;

    }

    return `

<div class="leadPagination">

<div class="leadPaginationInfo">

Showing

<b>${start}</b>

-

<b>${end}</b>

of

<b>${totalRows}</b>

Leads

</div>

<div class="leadPaginationCenter">

<button

class="leadPageBtn"

onclick="leadPrevPage()"

>

◀

</button>

${pages}

<button

class="leadPageBtn"

onclick="leadNextPage()"

>

▶

</button>

</div>

<div class="leadRowsSelect">

<select

id="leadRowsPerPage"

onchange="leadChangeRowsPerPage()"

>

<option

${leadRowsPerPage === 10 ? "selected" : ""}

>

10

</option>

<option

${leadRowsPerPage === 25 ? "selected" : ""}

>

25

</option>

<option

${leadRowsPerPage === 50 ? "selected" : ""}

>

50

</option>

<option

${leadRowsPerPage === 100 ? "selected" : ""}

>

100

</option>

</select>

</div>

</div>

`;

}

