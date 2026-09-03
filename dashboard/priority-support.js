/*==========================================
PRIORITY TABLE STATE
==========================================*/

let priorityRows = [];

let priorityFilteredRows = [];

let priorityCurrentPage = 1;

let priorityRowsPerPage = 15;

let prioritySortColumn = "";

let prioritySortDirection = "asc";


function getDaysDifference(dateValue) {

    if (!dateValue) return "";

    let dueDate;

    if (typeof dateValue === "string" && dateValue.includes("/")) {

        const p = dateValue.split("/");

        dueDate = new Date(
            Number(p[2]),
            Number(p[1]) - 1,
            Number(p[0])
        );

    } else {

        dueDate = new Date(dateValue);

    }

    dueDate.setHours(0, 0, 0, 0);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const diff = Math.floor(
        (today - dueDate) / 86400000
    );

    if (diff === 0)
        return "⏰ Due Today";

    if (diff === 1)
        return "⏰ Yesterday";

    return `⏰ ${diff} Days Overdue`;

}

function buildPriorityCard(options) {

    return `

<div class="priorityCardV2">

<div class="priorityHeaderV2">

<div class="priorityTitleV2">

${options.icon}

${options.title}

</div>

<div class="priorityCountV2 ${options.color}">

${options.count}

</div>

</div>

<div class="priorityBodyV2">

${options.body}

</div>

<div class="priorityFooterV2"

onclick="openPriorityModal('${options.type}')">

View All →

</div>

</div>

`;

}

function renderOverdueFollowupsCard() {

    const today = new Date();

    const all = [

        ...(dashboardData.quotes || []),

        ...(dashboardData.packages || []),

        ...(dashboardData.air || []),

        ...(dashboardData.train || []),

        ...(dashboardData.bus || []),

        ...(dashboardData.cars || [])

    ];

    const rows = all.filter(x => {

        const status = String(x.Status || "").toLowerCase();

        if (status !== "follow up" && status !== "followup")
            return false;

        if (!x["Next Follow Up"])
            return false;

        return new Date(x["Next Follow Up"]) < today;

    });

    let body = "";

    rows
        .sort((a, b) =>
            new Date(a["Next Follow Up"]) -
            new Date(b["Next Follow Up"])
        )
        .slice(0, 2)
        .forEach(x => {

            const customer =
                x["Customer Name"] ||
                x.Name ||
                "Customer";

            const phone =
                x.Phone ||
                x.Mobile ||
                "";

            const service =
                x.Package ||
                x.Vehicle ||
                x["Package Name"] ||
                x["Vehicle Name"] ||
                (
                    x.From && x.To
                        ? x.From + " → " + x.To
                        : ""
                );

                const reason =
    getDaysDifference(x["Next Follow Up"]);

            body += `

<div class="priorityCustomerV2">

<div class="priorityCustomerName">

👤 ${customer}

</div>

<div class="priorityPhoneV2">

📞 ${phone}

</div>

<div class="priorityCustomerPackage">

🏝 ${service}

</div>

<div class="priorityReason ${getPriorityReasonClass(reason)}">

${reason}

</div>

</div>

`;

        });

    if (!body) {

        body = '<div class="priorityEmpty">No Records</div>';

    }

    return buildPriorityCard({

        icon: "🔴",

        title: "Overdue Follow Ups",

        count: rows.length,

        body,

        color: "red",

        type: "followup"

    });

}

function renderPremiumQuotesCard() {

    const rows =
        (dashboardData.quotes || [])
            .filter(x =>
                String(x.Status || "")
                    .toLowerCase() !== "completed"
            );

    let body = "";

    rows.slice(0, 2).forEach(x => {

        const customer =
            x["Customer Name"] ||
            x.Name ||
            "Customer";

        // Package / Service
        const serviceName =
            x.Package ||
            x.Vehicle ||
            x["Package Name"] ||
            x["Vehicle Name"] ||
            x.Service ||
            "Premium Service";

        // --------------------------
        // Budget
        // --------------------------

        const budgetValue = Number(
            String(
                x.Budget ||
                x["Budget Amount"] ||
                x.Amount ||
                0
            ).replace(/[^\d.]/g, "")
        );

        // --------------------------
        // Status
        // --------------------------

        const status =
            String(x.Status || "")
                .trim()
                .toLowerCase();

        // --------------------------
        // Smart Reason
        // --------------------------

        let reason = "";

        if (budgetValue >= 200000) {

            reason =
                "🔥 High Budget ₹" +
                (budgetValue / 100000).toFixed(1) +
                "L";

        }

        else if (
            status === "follow up" ||
            status === "followup"
        ) {

            reason =
                "📞 Waiting Callback";

        }

        else if (
            status === "new"
        ) {

            reason =
                "💰 Quote Not Sent";

        }

        else if (
            status === "proposal sent"
        ) {

            reason =
                "📄 Proposal Pending";

        }

        else {

            reason =
                "📋 " +
                (x.Status || "Pending");

        }

        body += `

<div class="priorityCustomerV2">

    <div class="priorityCustomerName">

        👤 ${customer}

    </div>

    <div class="priorityCustomerPackage">

        🚖 ${serviceName}

    </div>

<div class="priorityReason ${getPriorityReasonClass(reason)}">

${reason}

</div>

</div>

`;

    });

    if (!body) {

        body =
            '<div class="priorityEmpty">No Records</div>';

    }

    return buildPriorityCard({

        icon: "🟠",

        title: "Premium Quotes",

        count: rows.length,

        body,

        color: "orange",

        type: "quotes"

    });

}

function renderCarBookingsCard() {

    const rows =
        (dashboardData.cars || [])
            .filter(x =>
                String(x.Status || "")
                    .toLowerCase() === "new"
            );

    let body = "";

    rows.slice(0,2).forEach(x=>{

        const customer =
            x["Customer Name"] ||
            x.Name ||
            "Customer";

        const vehicle =
            x.Vehicle ||
            x["Vehicle Name"] ||
            "Vehicle";

const pickupDate =
    x.Pickup ||
    x["Pickup Date"] ||
    x["Travel Date"] ||
    x.Date ||
    "";

        const location =
            x["Pickup Location"] ||
            x["Pickup Point"] ||
            "";

        const journey =
            String(
                x["Journey Type"] ||
                ""
            ).toLowerCase();

        const payment =
            String(
                x["Payment Status"] ||
                ""
            ).toLowerCase();

        const driver =
            String(
                x.Driver ||
                x["Driver Name"] ||
                ""
            );

        //--------------------------------------------------
        // SMART REASON
        //--------------------------------------------------

        let reason = "";

        if (pickupDate) {

            const tripDate =
                new Date(pickupDate);

            tripDate.setHours(0,0,0,0);

            const today =
                new Date();

            today.setHours(0,0,0,0);

            const diff =
                Math.floor(
                    (tripDate - today) /
                    86400000
                );

            if (diff === 0) {

                reason =
                    "🚗 Pickup Today";

            }

            else if (diff === 1) {

                reason =
                    "📅 Pickup Tomorrow";

            }

        }

        if (
            !reason &&
            !driver
        ) {

            reason =
                "🚘 Driver Pending";

        }

        if (
            !reason &&
            payment === "pending"
        ) {

            reason =
                "💰 Payment Pending";

        }

        if (
            !reason &&
            location.toLowerCase().includes("airport")
        ) {

            reason =
                "📍 Airport Pickup";

        }

        if (
            !reason &&
            journey.includes("out")
        ) {

            reason =
                "🛣 Outstation Trip";

        }

        if (!reason) {

            reason =
                "🚖 " +
                (
                    x["Journey Type"] ||
                    "Car Booking"
                );

        }

        body += `

<div class="priorityCustomerV2">

<div class="priorityCustomerName">

👤 ${customer}

</div>

<div class="priorityCustomerPackage">

🚖 ${vehicle}

</div>

<div class="priorityReason ${getPriorityReasonClass(reason)}">

${reason}

</div>

</div>

`;

    });

    if(!body){

        body =
            '<div class="priorityEmpty">No Records</div>';

    }

    return buildPriorityCard({

        icon:"🔵",

        title:"New Car Bookings",

        count:rows.length,

        body,

        color:"blue",

        type:"cars"

    });

}

function renderTravelLeadsCard() {

    const rows = (dashboardData.packages || [])
        .filter(x =>
            String(x.Status || "").toLowerCase() !== "completed"
        );

    let body = "";

    rows.slice(0, 2).forEach(x => {

        const customer =
            x["Customer Name"] ||
            x.Name ||
            "Customer";

        const phone =
            x.Phone ||
            x.Mobile ||
            "";

        const packageName =
            x.Package ||
            x["Package Name"] ||
            x.Destination ||
            "Holiday Package";

        const budget =
            x.Budget ||
            x["Budget Amount"] ||
            "";

        body += `

<div class="priorityCustomerV2">

<div class="priorityCustomerName">
👤 ${customer}
</div>

<div class="priorityPhoneV2">
📞 ${phone}
</div>

<div class="priorityCustomerPackage">
🏝 ${packageName}
</div>

<div class="priorityReason">
💰 ${budget || "Travel Lead"}
</div>

</div>

`;

    });

    if (!body) {

        body =
            '<div class="priorityEmpty">No Records</div>';

    }

    return buildPriorityCard({

        icon: "🟢",

        title: "Travel Leads",

        count: rows.length,

        body,

        color: "green",

        type: "packages"

    });

}

function renderAirCard() {

    const rows = (dashboardData.air || [])
        .filter(x =>
            String(x.Status || "").toLowerCase() !== "completed"
        );

    let body = "";

    rows.slice(0, 2).forEach(x => {

        const customer =
            x["Customer Name"] ||
            x.Name ||
            "Customer";

        const route =
            (x.From || "") +
            " → " +
            (x.To || "");

        //--------------------------------------------------
        // Travel Date
        //--------------------------------------------------

        const departure =
            x["Travel Date"] ||
            x.Departure ||
            x.Date ||
            "";

        //--------------------------------------------------
        // Status
        //--------------------------------------------------

        const status =
            String(x.Status || "")
                .trim()
                .toLowerCase();

        //--------------------------------------------------
        // Passport
        //--------------------------------------------------

        const passport =
            String(
                x.Passport ||
                x["Passport Status"] ||
                ""
            ).toLowerCase();

        //--------------------------------------------------
        // Smart Reason
        //--------------------------------------------------

        let reason = "";

        if (departure) {

            const depDate =
                new Date(departure);

            depDate.setHours(0,0,0,0);

            const today =
                new Date();

            today.setHours(0,0,0,0);

            const diff =
                Math.floor(
                    (depDate - today) / 86400000
                );

            if (diff === 0) {

                reason =
                    "✈ Departure Today";

            }

            else if (diff === 1) {

                reason =
                    "📅 Departure Tomorrow";

            }

        }

        if (
            !reason &&
            status === "new"
        ) {

            reason =
                "💰 Fare Waiting";

        }

        if (
            !reason &&
            (
                status === "called" ||
                status === "follow up" ||
                status === "followup"
            )
        ) {

            reason =
                "🎟 Ticket Pending";

        }

        if (
            !reason &&
            (
                passport === "no" ||
                passport === "required"
            )
        ) {

            reason =
                "🛂 Passport Required";

        }

        if (!reason) {

            reason =
                "📅 " + departure;

        }

        body += `

<div class="priorityCustomerV2">

<div class="priorityCustomerName">

👤 ${customer}

</div>

<div class="priorityCustomerPackage">

✈ ${route}

</div>

<div class="priorityReason ${getPriorityReasonClass(reason)}">

${reason}

</div>

</div>

`;

    });

    if (!body) {

        body =
            '<div class="priorityEmpty">No Records</div>';

    }

    return buildPriorityCard({

        icon: "✈",

        title: "Air Enquiries",

        count: rows.length,

        body,

        color: "cyan",

        type: "air"

    });

}

function renderTrainCard() {

    const rows =
        (dashboardData.train || [])
            .filter(x =>
                String(x.Status || "")
                    .toLowerCase() !== "completed"
            );

    let body = "";

    rows.slice(0, 2).forEach(x => {

        const customer =
            x["Customer Name"] ||
            x.Name ||
            "Customer";

        const route =
            (x.From || "") +
            " → " +
            (x.To || "");

        /* ===========================
           Travel Date
        =========================== */

        const travelDate =
            x["Travel Date"] ||
            x.Date ||
            "";

        /* ===========================
           Status
        =========================== */

        const status =
            String(
                x.Status || ""
            ).trim().toLowerCase();

        /* ===========================
           Quota / PNR Status
        =========================== */

        const quota =
            String(
                x.Quota ||
                x["Ticket Status"] ||
                ""
            ).trim().toUpperCase();

        /* ===========================
           SMART REASON
        =========================== */

        let reason = "";

        if (travelDate) {

            const dep =
                new Date(travelDate);

            dep.setHours(0,0,0,0);

            const today =
                new Date();

            today.setHours(0,0,0,0);

            const diff =
                Math.floor(
                    (dep - today) / 86400000
                );

            if (diff === 0) {

                reason =
                    "🚆 Departure Today";

            }

            else if (diff === 1) {

                reason =
                    "📅 Tomorrow";

            }

        }

        if (
            !reason &&
            status === "new"
        ) {

            reason =
                "⏳ Waiting Confirmation";

        }

        if (
            !reason &&
            (
                status === "called" ||
                status === "follow up" ||
                status === "followup"
            )
        ) {

            reason =
                "🎟 Ticket Pending";

        }

        if (
            !reason &&
            quota.includes("WL")
        ) {

            reason =
                "🚦 Waiting List";

        }

        if (
            !reason &&
            quota.includes("RAC")
        ) {

            reason =
                "🟠 RAC Ticket";

        }

        if (!reason) {

reason = "📅 " + formatTravelDate(travelDate);

        }

        body += `

<div class="priorityCustomerV2">

    <div class="priorityCustomerName">

        👤 ${customer}

    </div>

    <div class="priorityCustomerPackage">

        🚆 ${route}

    </div>

<div class="priorityReason ${getPriorityReasonClass(reason)}">

${reason}

</div>

</div>

`;

    });

    if (!body) {

        body =
            '<div class="priorityEmpty">No Records</div>';

    }

    return buildPriorityCard({

        icon: "🚆",

        title: "Train Enquiries",

        count: rows.length,

        body,

        color: "emerald",

        type: "train"

    });

}

function formatTravelDate(dateValue) {

    if (!dateValue) return "";

    const dt = new Date(dateValue);

    if (isNaN(dt)) return dateValue;

    return dt.toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}

function renderBusCard() {

    const rows =
        (dashboardData.bus || [])
            .filter(x =>
                String(x.Status || "")
                    .toLowerCase() !== "completed"
            );

    let body = "";

    rows.slice(0,2).forEach(x=>{

        const customer =
            x["Customer Name"] ||
            x.Name ||
            "Customer";

        const route =
            (x.From || "") +
            " → " +
            (x.To || "");

        /* ==========================
           Travel Date
        ========================== */

        const travelDate =
            x["Travel Date"] ||
            x.Date ||
            "";

        /* ==========================
           Status
        ========================== */

        const status =
            String(
                x.Status || ""
            ).trim().toLowerCase();

        /* ==========================
           Payment
        ========================== */

        const payment =
            String(
                x["Payment Status"] ||
                ""
            ).trim().toLowerCase();

        /* ==========================
           Smart Reason
        ========================== */

        let reason = "";

        if (travelDate) {

            const trip =
                new Date(travelDate);

            const today =
                new Date();

            const tripOnly =
                new Date(trip);

            tripOnly.setHours(0,0,0,0);

            const todayOnly =
                new Date(today);

            todayOnly.setHours(0,0,0,0);

            const diff =
                Math.floor(
                    (tripOnly - todayOnly) /
                    86400000
                );

            if (diff === 0) {

                if (trip.getHours() >= 18) {

                    reason =
                        "🌙 Tonight";

                }
                else {

                    reason =
                        "🚌 Departure Today";

                }

            }

            else if (diff === 1) {

                reason =
                    "📅 Tomorrow";

            }

        }

        if (
            !reason &&
            payment === "pending"
        ) {

            reason =
                "💰 Payment Pending";

        }

        if (
            !reason &&
            status === "new"
        ) {

            reason =
                "🎫 Seat Not Booked";

        }

        if (
            !reason &&
            (
                status === "called" ||
                status === "follow up" ||
                status === "followup"
            )
        ) {

            reason =
                "📞 Waiting Confirmation";

        }

        if (!reason) {

            reason =
                "📅 " +
                formatTravelDate(travelDate);

        }

        body += `

<div class="priorityCustomerV2">

    <div class="priorityCustomerName">

        👤 ${customer}

    </div>

    <div class="priorityCustomerPackage">

        🚌 ${route}

    </div>

<div class="priorityReason ${getPriorityReasonClass(reason)}">

${reason}

</div>

</div>

`;

    });

    if(!body){

        body =
            '<div class="priorityEmpty">No Records</div>';

    }

    return buildPriorityCard({

        icon:"🚌",

        title:"Bus Enquiries",

        count:rows.length,

        body,

        color:"amber",

        type:"bus"

    });

}



function renderPrioritySupportV2() {

    const box =
        document.getElementById("priorityList");

    if (!box) return;

    box.innerHTML =

        renderOverdueFollowupsCard()

        +

        renderPremiumQuotesCard()

        +

        renderCarBookingsCard()

        +

        renderTravelLeadsCard()

        +

        renderAirCard()

        +

        renderTrainCard()

        +

        renderBusCard();

}

function buildPriorityCustomer(row, reason) {

    const name =
        row["Customer Name"] ||
        row.Name ||
        "Customer";

    const phone =
        row.Phone ||
        row.Mobile ||
        "-";

    const service =

        row.Package ||

        row.Vehicle ||

        row.Service ||

        (row.From && row.To
            ? row.From + " → " + row.To
            : "-");

    return `

<div class="priorityCustomerCard">

    <div class="priorityName">

        👤 ${name}

    </div>

    <div class="priorityPhone">

        📞 ${phone}

    </div>

    <div class="priorityService">

        ${service}

    </div>

    <div class="priorityReason">

        ${reason}

    </div>

</div>

`;

}


function getPriorityReasonClass(reason){

    reason = String(reason || "").toLowerCase();

    /* ==========================
       RED
    ========================== */

    if(

        reason.includes("overdue") ||

        reason.includes("today") ||

        reason.includes("departure today") ||

        reason.includes("pickup today")

    ){

        return "priorityReasonRed";

    }

    /* ==========================
       ORANGE
    ========================== */

    if(

        reason.includes("driver pending") ||

        reason.includes("payment pending") ||

        reason.includes("seat not booked") ||

        reason.includes("waiting confirmation") ||

        reason.includes("waiting callback")

    ){

        return "priorityReasonOrange";

    }

    /* ==========================
       GREEN
    ========================== */

    if(

        reason.includes("high budget") ||

        reason.includes("vip") ||

        reason.includes("payment received")

    ){

        return "priorityReasonGreen";

    }

    /* ==========================
       BLUE
    ========================== */

    if(

        reason.includes("airport") ||

        reason.includes("departure tomorrow") ||

        reason.includes("tomorrow")

    ){

        return "priorityReasonBlue";

    }

    /* ==========================
       PURPLE
    ========================== */

    if(

        reason.includes("proposal") ||

        reason.includes("ticket pending") ||

        reason.includes("passport")

    ){

        return "priorityReasonPurple";

    }

    return "";

}

/*==========================================
PAGINATION
==========================================*/

function buildPriorityPagination() {

    const totalRecords = priorityFilteredRows.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalRecords / priorityRowsPerPage)
    );

    const start =
        totalRecords === 0
            ? 0
            : ((priorityCurrentPage - 1) * priorityRowsPerPage) + 1;

    const end = Math.min(
        priorityCurrentPage * priorityRowsPerPage,
        totalRecords
    );

    let html = `

<div class="priorityPagination">

    <!-- LEFT -->

    <div class="priorityPageInfo">

        Showing ${start} - ${end} of ${totalRecords} Leads

    </div>

    <!-- CENTER -->

    <div class="priorityPager">

        <button

            class="priorityNavBtn"

            ${priorityCurrentPage === 1 ? "disabled" : ""}

            onclick="priorityPrevPage()">

            ◀

        </button>

`;

    // Page Numbers

    for (let i = 1; i <= totalPages; i++) {

        html += `

        <button

            class="priorityPageBtn ${i === priorityCurrentPage ? "active" : ""}"

            onclick="priorityGoPage(${i})">

            ${i}

        </button>

`;

    }

    html += `

        <button

            class="priorityNavBtn"

            ${priorityCurrentPage === totalPages ? "disabled" : ""}

            onclick="priorityNextPage()">

            ▶

        </button>

    </div>

    <!-- RIGHT -->

    <div class="priorityPageSize">

        <select onchange="priorityChangePageSize(this.value)">

            <option value="10" ${priorityRowsPerPage == 10 ? "selected" : ""}>10</option>

            <option value="25" ${priorityRowsPerPage == 25 ? "selected" : ""}>25</option>

            <option value="50" ${priorityRowsPerPage == 50 ? "selected" : ""}>50</option>

            <option value="100" ${priorityRowsPerPage == 100 ? "selected" : ""}>100</option>

        </select>

    </div>

</div>

`;

    return html;

}

function priorityChangePageSize(size){

    priorityRowsPerPage = Number(size);

    priorityCurrentPage = 1;

    renderPriorityTable(priorityFilteredRows);

}


function priorityPrevPage(){

    if(priorityCurrentPage>1){

        priorityCurrentPage--;

        renderPriorityTable(priorityRows);

    }

}

function priorityNextPage(){

    const pages=

    Math.ceil(

        priorityFilteredRows.length/

        priorityRowsPerPage

    );

    if(priorityCurrentPage<pages){

        priorityCurrentPage++;

        renderPriorityTable(priorityRows);

    }

}

function priorityGoPage(page){

    priorityCurrentPage=page;

    renderPriorityTable(priorityRows);

}

function prioritySort(column){

    if(prioritySortColumn===column){

        prioritySortDirection=

        prioritySortDirection==="asc"

        ?"desc"

        :"asc";

    }

    else{

        prioritySortColumn=column;

        prioritySortDirection="asc";

    }

    priorityRows.sort((a,b)=>{

        const av=

        String(a[column]||"");

        const bv=

        String(b[column]||"");

        return prioritySortDirection==="asc"

        ?av.localeCompare(bv)

        :bv.localeCompare(av);

    });

    renderPriorityTable(priorityRows);

}

function showPrioritySkeleton(){

document.getElementById(

"priorityModalBody"

).innerHTML=`

<div class="prioritySkeleton">

<div></div>

<div></div>

<div></div>

<div></div>

<div></div>

</div>

`;

}

showPrioritySkeleton();

setTimeout(()=>{

renderPriorityTable(priorityRows);

},150);


/*=========================================
Priority Search
=========================================*/

document
.getElementById("prioritySearch")
?.addEventListener("input", function () {

    const keyword =
        this.value
            .trim()
            .toLowerCase();

    const filtered =
        priorityRows.filter(row => {

return [

    row["Customer Name"],

    row.Phone,

    row["Booking ID"],

    row.From,

    row.To,

    row.Package,

    row.Vehicle,

    row.Status

]

.join(" ")

.toLowerCase()

.includes(keyword);

        });

    priorityCurrentPage = 1;

    renderPriorityTable(filtered);

});

function renderPriorityStatsRibbon(data){

    const wrap =
    document.getElementById(
        "priorityStatsRibbon"
    );

    if(!wrap) return;

    const high =
        data.filter(r=>
            String(r.Priority)
            .toLowerCase()=="high"
        ).length;

    const medium =
        data.filter(r=>
            String(r.Priority)
            .toLowerCase()=="medium"
        ).length;

    const low =
        data.filter(r=>
            String(r.Priority)
            .toLowerCase()=="low"
        ).length;

    wrap.innerHTML=`

<div class="priorityStatCard high">

🔴 High

<b>${high}</b>

</div>

<div class="priorityStatCard medium">

🟠 Medium

<b>${medium}</b>

</div>

<div class="priorityStatCard low">

🟢 Low

<b>${low}</b>

</div>

<div class="priorityStatCard total">

📋 Total

<b>${data.length}</b>

</div>

`;

}

