async function loadLiveOperations() {

    console.log("Loading Live Operations...");

    const result = await getActivityLog();

    if (!result.success) return;

    const container =
        document.getElementById("liveOperations");

    const activities =
        result.activities || [];

    if (!activities.length) {

        container.innerHTML =
            `<div class="crmTimelineEmpty">
                No Activity Found
            </div>`;

        return;

    }

    console.log(result.activities);

    //--------------------------------------------------
    // Sort Latest First
    //--------------------------------------------------

    activities.sort((a, b) => {

        return Number(b.timestamp || 0) -
            Number(a.timestamp || 0);

    });

    //--------------------------------------------------
    // Group
    //--------------------------------------------------

    let html = "";

    let currentGroup = "";

    activities.forEach(a => {

        const group =
            getTimelineGroup(a.timestamp);

        if (group !== currentGroup) {

            currentGroup = group;

            html +=

                `<div class="crmTimelineDay">

                <span>${group}</span>

            </div>`;

        }

        html += renderTimelineCard(a);

    });

    container.innerHTML = html;

    window.lastActivityRefresh = Date.now();

}


function getStatusText(type, description = "") {

    if (!description) return type;

    const txt = description.toLowerCase();

    if (txt.includes("completed"))
        return "Completed";

    if (txt.includes("confirmed"))
        return "Confirmed";

    if (txt.includes("processing"))
        return "Processing";

    if (txt.includes("cancel"))
        return "Cancelled";

    if ((type || "").toUpperCase() === "FOLLOWUP")
        return "Follow Up";

    if ((type || "").toUpperCase() === "CALL")
        return "Call";

    if ((type || "").toUpperCase() === "WHATSAPP")
        return "WhatsApp";

    if ((type || "").toUpperCase() === "BOOKING")
        return "Booking";

    return type;

}


function getStatusClass(type, description = "") {

    const status = getStatusText(type, description).toLowerCase();

    switch (status) {

        case "completed":
            return "completed";

        case "confirmed":
            return "confirmed";

        case "processing":
            return "processing";

        case "cancelled":
            return "cancelled";

        case "booking":
            return "booking";

        case "follow up":
            return "followup";

        case "call":
            return "call";

        case "whatsapp":
            return "whatsapp";

        default:
            return "default";

    }

}

function renderTimelineCard(a) {

    const customer =
        a.customer ||
        a.title ||
        "Customer";

    const avatar =
        String(customer)
            .trim()
            .charAt(0)
            .toUpperCase() || "?";

    const service =
        String(a.service || "default").toLowerCase();

    const type =
        (a.type || "").toLowerCase();

    return `

<div class="crmTimelineItem">

    <div class="crmTimelineDot"

    style="background:${getTimelineColor(type)}">

    </div>

    <div
class="crmTimelineCard new"

onclick='openBooking(${JSON.stringify(a)})'>

        <div class="crmTimelineTop">

            <div class="crmTimelineAvatar" style="background:${getAvatarColor(customer)}">

                ${avatar}

            </div>

            <div class="crmTimelineInfo">

                <div class="crmTimelineCustomer">

                    ${customer}

                </div>

                <div class="crmTimelineMeta">

                    <span class="crmServiceBadge crmService-${service || "default"}">

                        ${service.toUpperCase()}

                    </span>

<span
class="crmStatusBadge crmStatus-${getStatusClass(a.type, a.description)}">

${getStatusText(a.type, a.description)}

</span>

                </div>

            </div>

            <div class="crmTimelineTime">

                ${timeAgo(a.timestamp)}

            </div>

        </div>

        <div class="crmTimelineTitle">

            ${a.title || ""}

        </div>

        <div class="crmTimelineDescription">

            ${a.description || ""}

        </div>

        ${a.bookingId ?

            `<div class="crmBookingID"

title="${a.bookingId}">

🆔 ${a.bookingId.substring(0, 8)}...

</div>`

            :

            ""}

${a.amount && Number(a.amount) > 0 ?

            `<div class="crmTimelineRevenue">

            ₹${Number(a.amount).toLocaleString()}

        </div>`

            :

            ""}

    </div>

</div>

`;

}

function openBooking(id) {

    if (!id) return;

    console.log("Opening Booking", id);

    // Future

    // showBookingPopup(id)

    // loadBooking(id)

}

function getAvatarColor(name) {

    const colors = [

        "#3B82F6", // Blue
        "#8B5CF6", // Purple
        "#EC4899", // Pink
        "#10B981", // Emerald
        "#F59E0B", // Amber
        "#EF4444", // Red
        "#14B8A6", // Teal
        "#6366F1", // Indigo
        "#F97316", // Orange
        "#84CC16"  // Lime

    ];

    if (!name) return colors[0];

    let hash = 0;

    for (let i = 0; i < name.length; i++) {
        hash += name.charCodeAt(i);
    }

    return colors[hash % colors.length];

}

function getTimelineColor(type) {

    switch (type) {

        case "booking":

            return "#2196F3";

        case "status":

            return "#9C27B0";

        case "call":

            return "#43A047";

        case "whatsapp":

            return "#00C853";

        case "followup":

            return "#FB8C00";

        default:

            return "#607D8B";

    }

}

function getTimelineGroup(ts) {

    if (!ts) return "Earlier";

    const d = new Date(Number(ts));

    const today = new Date();

    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    const ds =
        d.toDateString();

    if (ds === today.toDateString())
        return "Today";

    if (ds === yesterday.toDateString())
        return "Yesterday";

    return "Earlier";

}

function timeAgo(timestamp) {

    if (!timestamp) return "-";

    timestamp = Number(timestamp);

    const now = Date.now();

    const diff = now - timestamp;

    if (diff < 0) return "Just now";

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

    const el = document.getElementById("activityTime");

    if (!el) return;

    if (!window.lastActivityRefresh) {

        el.innerHTML = "🔴 Offline";

        return;

    }

    const sec = Math.floor(

        (Date.now() - window.lastActivityRefresh) / 1000

    );

    el.innerHTML = `🟢 LIVE • ${sec}s ago`;

}

setInterval(
    updateActivityClock,
    1000
);

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


function openBooking(a){

    if(!a) return;

    const modal =
        document.getElementById("bookingModal");

    modal.style.display="flex";

    document.getElementById("bookingModalBody").innerHTML=`

<div class="bookingPreview">

<div class="bookingPreviewHeader">

<div>

<div class="bookingPreviewService">

${getActivityIcon(a.type)}
${formatService(a.service)}

</div>

<div class="bookingPreviewId">

${a.bookingId}

</div>

</div>

<span class="crmStatusBadge crmStatus-${(a.type||"").toLowerCase()}">

${extractStatus(a)}

</span>

</div>

<div class="bookingPreviewGrid">

<div>

<label>Customer</label>

<div>${a.customer||"-"}</div>

</div>

<div>

<label>Activity</label>

<div>${a.title||"-"}</div>

</div>

<div>

<label>Revenue</label>

<div>

${a.amount?("₹"+Number(a.amount).toLocaleString()):"-"}

</div>

</div>

<div>

<label>Follow-up</label>

<div>${a.followUpDate||"-"}</div>

</div>

<div>

<label>Date</label>

<div>

${new Date(a.date).toLocaleDateString()}

</div>

</div>

<div>

<label>Time</label>

<div>${a.time||"-"}</div>

</div>

</div>

<div class="bookingPreviewDescription">

<b>Description</b>

<p>

${a.description||"-"}

</p>

</div>

<div class="bookingPreviewButtons">

<button
class="bookingPrimary"

onclick="openFullBooking('${a.bookingId}')">

Open Full Booking

</button>

<button
class="bookingSecondary"

onclick="closeBookingModal()">

Close

</button>

</div>

</div>

`;

}



function closeBookingModal() {

    document.getElementById("bookingModal").style.display = "none";

}

function extractStatus(a){

    if(!a.description) return a.type;

    const m =
        a.description.match(/Status\s*→\s*([^|]+)/i);

    return m ? m[1].trim() : a.type;

}