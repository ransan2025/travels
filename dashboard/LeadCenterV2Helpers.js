/*==================================================
LEAD CENTER V2
SERVICE ICON
==================================================*/

function getLeadServiceIcon(service) {

    switch (String(service).toLowerCase()) {

        case "air":
            return "✈";

        case "train":
            return "🚆";

        case "bus":
            return "🚌";

        case "car":
            return "🚖";

        case "package":
            return "🏝";

        case "quote":
            return "💎";

        default:
            return "📋";

    }

}

/*==================================================
SERVICE NAME
==================================================*/

function getLeadServiceName(service) {

    switch (String(service).toLowerCase()) {

        case "air":
            return "Air";

        case "train":
            return "Train";

        case "bus":
            return "Bus";

        case "car":
            return "Car";

        case "package":
            return "Holiday Package";

        case "quote":
            return "Premium Quote";

        default:
            return "Lead";

    }

}

/*==================================================
DATE FORMAT
==================================================*/

function formatLeadDate(value) {

    if (!value)
        return "-";

    let d;

    if (
        typeof value === "string" &&
        value.includes("/")
    ) {

        const p = value.split("/");

        d = new Date(

            Number(p[2]),

            Number(p[1]) - 1,

            Number(p[0])

        );

    }

    else {

        d = new Date(value);

    }

    if (isNaN(d))
        return "-";

    return d.toLocaleDateString(

        "en-GB",

        {

            day: "2-digit",

            month: "short"

        }

    );

}

/*==================================================
STATUS PILL
==================================================*/

function buildLeadStatusPill(status){

    status = String(status || "").trim();

const map = {

    "New": "🟢",

    "Processing": "🟠",

    "Follow Up": "🟣",

    "Called": "📞",

    "WhatsApp Sent": "💬",

    "Proposal Pending": "🔵",

    "Payment Pending": "🟡",

    "Driver Pending": "🔴",

    "Confirmed": "✅",

    "Completed": "🏆",

    "Lost": "❌",

    "Cancelled": "⚫"

};

    return `

<span class="leadStatusPill">

${map[status] || "⚪"}

${status}

</span>

`;

}

/*==================================================
PRIORITY PILL
==================================================*/

function buildLeadPriorityPill(priority){

    priority = String(priority || "").toLowerCase();

    let icon="⚪";
    let cls="priorityLow";

    if(priority==="high"){

        icon="🔴";
        cls="priorityHigh";

    }

    else if(priority==="medium"){

        icon="🟠";
        cls="priorityMedium";

    }

    else{

        icon="🟢";
        cls="priorityLow";

    }

    return `

<span class="leadPriorityPill ${cls}">

${icon}

${priority.toUpperCase()}

</span>

`;

}

/*==================================================
CUSTOMER NAME
==================================================*/

function getLeadCustomer(row) {

    return (

        row["Customer Name"] ||

        row.Name ||

        row.Customer ||

        "-"

    );

}

/*==================================================
PHONE
==================================================*/

function getLeadPhone(row) {

    return (

        row.Phone ||

        row.Mobile ||

        "-"

    );

}

/*==================================================
ASSIGNED EXECUTIVE
==================================================*/

/*=========================================
SOURCE + REVENUE
=========================================*/

function getLeadAssigned(row){

    const source =
        row.Source ||
        "-";

    const revenue =
        row["Estimated Revenue"] ||
        row.Revenue ||
        row["Revenue"] ||
        "";

    let revenueText = "";

    if(revenue){

        revenueText = `
        <div class="leadRevenueText">
            💰 ₹${Number(revenue).toLocaleString("en-IN")}
        </div>
        `;

    }

    return `

<div class="leadSourceWrap">

    <div class="leadSourceText">

        📍 ${source}

    </div>

    ${revenueText}

</div>

`;

}

/*==================================================
FOLLOWUP DATE
==================================================*/

function getLeadFollowup(row) {

    return formatLeadDate(

        row["Next Follow Up"]

    );

}

/*==================================================
CREATED DATE
==================================================*/

function getLeadCreatedDate(row) {

    return formatLeadDate(

        row["Created Date"]

    );

}

/*==================================================
SERVICE DESCRIPTION
==================================================*/

function getLeadServiceDescription(row) {

    switch (row._service) {

        case "air":

            return `
                <div class="journeyMain">
                    ${row.From || "-"} → ${row.To || "-"}
                </div>
                <div class="journeySub">
                    ✈ ${formatLeadDate(row["Travel Date"])}
                </div>
            `;

        case "train":

            return `
                <div class="journeyMain">
                    ${row.From || "-"} → ${row.To || "-"}
                </div>
                <div class="journeySub">
                    🚆 ${row.Class || "-"} • ${row.Passengers || 0} Pax • ${formatLeadDate(row["Travel Date"])}
                </div>
            `;

        case "bus":

            return `
                <div class="journeyMain">
                    ${row.From || "-"} → ${row.To || "-"}
                </div>
                <div class="journeySub">
                    🚌 ${row.Class || "-"} • ${row.Passengers || 0} Pax • ${formatLeadDate(row["Travel Date"])}
                </div>
            `;

        case "car":

            return `
                <div class="journeyMain">
                    🚖 ${row.Vehicle || "-"}
                </div>
                <div class="journeySub">
                    📍 ${row["Location"] || "-"}
                </div>
            `;

        case "package":

            return `
                <div class="journeyMain">
                    ${row.Package || "-"}
                </div>
                <div class="journeySub">
                    🌍 ${row["Travel Month"] || "-"}
                </div>
            `;

        case "quote":

            return `
                <div class="journeyMain">
                    ${row.Service || "Premium Quote"}
                </div>
                <div class="journeySub">
                    🌍 ${row["Travel Month"] || "-"}
                </div>
            `;

        default:

            return "-";

    }

}

function getLeadFollowup(row) {

    const date = row["Next Follow Up"];

    if (!date)
        return "-";

    const today = new Date();

    const follow = new Date(date);

    today.setHours(0,0,0,0);
    follow.setHours(0,0,0,0);

    const diff = Math.round(

        (follow - today) /

        (1000 * 60 * 60 * 24)

    );

    if (diff === 0)
        return "📅 Today";

    if (diff === 1)
        return "📅 Tomorrow";

    return "📅 " + follow.toLocaleDateString(
        "en-GB",
        {
            day:"2-digit",
            month:"short"
        }
    );

}

/*==================================================
ACTION BUTTONS
==================================================*/

function buildLeadActionButtons(row) {

    return `

<div class="actionWrap">

<button

class="actionBtn"

title="Call"

onclick='event.stopPropagation();callCustomer(${JSON.stringify(row)})'>

☎

</button>

<button

class="actionBtn"

title="WhatsApp"

onclick='event.stopPropagation();openWhatsappModal(${JSON.stringify(row)})'>

💬

</button>

<button

class="actionBtn"

title="Status"

onclick='event.stopPropagation();openStatusModal(${JSON.stringify(row)})'>

✏

</button>

<button

class="actionBtn"

title="Followup"

onclick='event.stopPropagation();openFollowupModal(${JSON.stringify(row)})'>

📅

</button>

</div>

`;

}

