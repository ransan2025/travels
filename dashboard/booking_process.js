

/*==========================================
BOOKING PROGRESS HTML
==========================================*/

function renderBookingWorkflow() {

    let html = `

<div class="bookingProgressCard">

<div class="bookingProgressHeader">

<div class="bookingProgressTitle">

📋 Booking Progress

</div>

<div class="bookingProgressSubtitle">

Live booking execution tracker

</div>

</div>

<div class="bookingProgressGrid">

`;

    bookingWorkflow.forEach(step => {

        html += `

<div class="progressItem">

<div class="progressLeft">

${step.icon}

${step.step}

</div>

<div class="progressRight">

<select

class="bookingProgressSelect"

data-progress="${step.step}"

>

${buildWorkflowOptions(step)}

</select>

</div>

</div>

`;

    });

    html += `

</div>

</div>

`;

    return html;

}

/*==========================================
WORKFLOW OPTIONS
==========================================*/

function buildWorkflowOptions(step) {

    let html = "";

    const current =

        bookingProgress[step.step] ||

        "";

    step.statuses.forEach(status => {

        html += `

<option

value="${status}"

${current == status ? "selected" : ""}

>

${status}

</option>

`;

    });

    return html;

}



/*==========================================
BOOKING PROGRESS RENDER
==========================================*/

function renderBookingProgress() {

    return `

<div class="crmBookingProgressCard">

<div class="crmSectionTitle">

📋 Booking Progress

</div>

<div class="bookingProgressGrid">

${buildBookingProgressItem("✈", "Ticket")}

${buildBookingProgressItem("🏨", "Hotel")}

${buildBookingProgressItem("🚖", "Driver")}

${buildBookingProgressItem("📄", "Documents")}

${buildBookingProgressItem("🛂", "Visa")}

${buildBookingProgressItem("💳", "Payment Status")}

${buildBookingProgressItem("🎫", "Voucher")}

${buildBookingProgressItem("🧳", "Insurance")}

</div>

</div>

`;

}

/*==========================================
BOOKING PROGRESS ITEM
==========================================*/

function buildBookingProgressItem(icon, title) {

    return `

<div class="bookingProgressItem">

<div class="bookingProgressLabel">

${icon} ${title}

</div>

<select

class="bookingProgressSelect"

data-progress="${title}">

<option value="">--</option>

<option>Pending</option>

<option>In Progress</option>

<option>Completed</option>

<option>Partial</option>

<option>Refunded</option>

</select>

</div>

`;

}



function bookingProgressRow(label, id, value) {

    return `

<div class="crmBookingRow">

<div class="crmBookingLabel">

${label}

</div>

<select

id="${id}"

class="crmBookingSelect">

<option ${value === "Pending" ? "selected" : ""}>

Pending

</option>

<option ${value === "In Progress" ? "selected" : ""}>

In Progress

</option>

<option ${value === "Completed" ? "selected" : ""}>

Completed

</option>

<option ${value === "Partial" ? "selected" : ""}>

Partial

</option>

<option ${value === "Optional" ? "selected" : ""}>

Optional

</option>

<option ${value === "Refunded" ? "selected" : ""}>

Refunded

</option>

</select>

</div>

`;

}

/*==========================================
BIND BOOKING PROGRESS
==========================================*/

function bindBookingProgress() {

    document

        .querySelectorAll("[data-progress]")

        .forEach(control => {

            const key =

                control.dataset.progress;

            if (

                bookingProgress[key] !== undefined

            ) {

                control.value =

                    bookingProgress[key];

            }

        });

}

/*==========================================
WORKFLOW SERVICE NAME
==========================================*/

function getWorkflowService(customer) {

    const sheet =
        String(

            customer.raw?._sheet ||

            ""

        ).toLowerCase();

    if (sheet === "air")
        return "Air";

    if (sheet === "train")
        return "Train";

    if (sheet === "bus")
        return "Bus";

    if (sheet === "car_bookings")
        return "Car";

    if (sheet === "travel_leads")
        return "Package";

    if (sheet === "premium_quote")
        return "Premium Quote";

    return "";

}


function getWorkflowBadgeClass(status) {

    switch (String(status).toLowerCase()) {

        case "completed":

        case "issued":

        case "approved":

        case "assigned":

        case "confirmed":

        case "shared":

        case "received":

            return "completed";

        case "partial":

            return "partial";

        case "pending":

        case "cancelled":

        case "rejected":

            return "pending";

        default:

            return "progress";

    }

}


function updateProgressSelectColor(select) {

    select.classList.remove(

        "pending",

        "progress",

        "completed",

        "partial",

        "refunded"

    );

    const value =

        String(select.value).toLowerCase();

    if (

        value.includes("completed") ||

        value.includes("issued") ||

        value.includes("approved") ||

        value.includes("assigned") ||

        value.includes("received") ||

        value.includes("shared")

    ) {

        select.classList.add("completed");

    }

    else if (value.includes("partial")) {

        select.classList.add("partial");

    }

    else if (value.includes("refund")) {

        select.classList.add("refunded");

    }

    else if (

        value.includes("progress") ||

        value.includes("processing") ||

        value.includes("checking") ||

        value.includes("vendor")

    ) {

        select.classList.add("progress");

    }

    else {

        select.classList.add("pending");

    }

}

