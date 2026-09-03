let expandedCRMCard = null;

/*=========================
TABS
=========================*/

/*=========================
CHANGE TAB
=========================*/

function changeTab(service, btn) {

    // ----------------------------
    // Default values
    // ----------------------------

    if (!service) {

        service = "Flight";

    }

    if (!btn) {

        document.querySelectorAll(".tab").forEach(function (t) {

            if (t.textContent.trim() == "Flight") {

                btn = t;

            }

        });

    }

    // ----------------------------
    // Remove active class
    // ----------------------------

    document.querySelectorAll(".tab").forEach(function (t) {

        t.classList.remove("active");

    });

    // ----------------------------
    // Activate selected tab
    // ----------------------------

    if (btn) {

        btn.classList.add("active");

    }

    currentTab = service;

    pendingView = false;

    console.log("Rendering:", currentTab);

    renderTab(currentTab, false);

}

function renderTab(
    service,
    pendingOnly = false
) {

    const box =
        document.getElementById(
            "tabContent"
        );


    if (!box) {

        console.warn(
            "[CRM] #tabContent not found"
        );

        return;

    }


    /*
     * IMPORTANT:
     * Use the shared dashboard object.
     */

    const data =
        window.dashboardData;


    if (
        !data ||
        typeof data !== "object"
    ) {

        console.warn(
            "[CRM] Dashboard data not ready"
        );


        box.innerHTML = `
            <div class="crmSearchEmpty">
                Loading CRM records...
            </div>
        `;


        return;

    }


    updateTabCounters();


    console.log(
        "======== RENDER TAB ========"
    );


    console.log(
        "Service =",
        service
    );


    let arr = [];


    switch (service) {


        case "Flight":

            arr =
                data.air || [];

            break;


        case "Train":

            arr =
                data.train || [];

            break;


        case "Bus":

            arr =
                data.bus || [];

            break;


        case "Car":

            arr =
                data.cars || [];

            break;


        case "Package":

            arr =
                data.packages || [];

            break;


        case "Quote":

            arr =
                data.quotes || [];

            break;


        default:

            arr = [];

    }


    console.log(
        "Loaded Records =",
        arr.length
    );


    if (pendingOnly) {

        arr =
            arr.filter(
                function (x) {

                    const s =
                        String(
                            x.Status ||
                            x.STATUS ||
                            "New"
                        )
                        .trim()
                        .toLowerCase();


                    return (

                        s === "new" ||

                        s === "pending" ||

                        s === "processing" ||

                        s === "follow up"

                    );

                }
            );

    }


    currentRows =
        [...arr];


    applyCRMFilters();

}

/*=========================================================
   CRM SEARCH + FILTER + SORT
=========================================================*/

function applyCRMFilters() {

    console.log(
        "======================================"
    );

    console.log(
        "[CRM] Applying Search / Filter / Sort"
    );

    console.log(
        "======================================"
    );


    /*-----------------------------------------------------
       SOURCE ROWS
    -----------------------------------------------------*/

    let rows =
        Array.isArray(currentRows)
            ? [...currentRows]
            : [];


    console.log(
        "[CRM] Source rows:",
        rows.length
    );


    /*-----------------------------------------------------
       SEARCH
    -----------------------------------------------------*/

    const searchInput =
        document.getElementById("crmSearch");


    const keyword =
        searchInput
            ? String(searchInput.value || "")
                .trim()
                .toLowerCase()
            : "";


    if (keyword) {

        rows = rows.filter(function (row) {

            if (!row) {
                return false;
            }


            /*---------------------------------------------
               Main searchable fields
            ---------------------------------------------*/

            const searchableValues = [

                /* Customer */
                getCustomerName(row),

                getCustomerPhone(row),

                /* Route */
                getCustomerRoute(row),

                /* Booking */
                row.BookingID,
                row["Booking ID"],
                row.bookingId,
                row.bookingID,

                /* Email */
                row.Email,
                row["Email Address"],
                row["Customer Email"],

                /* Service */
                row.Service,
                row.service,

                /* Status */
                getCustomerStatus(row),

                /* Priority */
                row.Priority,
                row.priority,

                /* Travel details */
                row["Travel Date"],
                row["Journey Date"],
                row["Travel Month"],

                /* Flight */
                row.Airline,
                row["Flight Number"],
                row["Flight No"],
                row.From,
                row.To,

                /* Train */
                row["Train Name"],
                row["Train Number"],
                row["Train No"],

                /* Bus */
                row["Bus Name"],
                row["Bus Number"],
                row["Bus No"],

                /* Car */
                row.Vehicle,
                row.Pickup,
                row.Drop,
                row["Pickup Location"],
                row["Drop Location"],

                /* Package */
                row.Package,
                row["Package Name"],

                /* Contact */
                row.Contact,
                row.Mobile,
                row["Mobile Number"],
                row["Customer Mobile"]

            ];


            /*---------------------------------------------
               Convert everything to searchable text
            ---------------------------------------------*/

            return searchableValues.some(
                function (value) {

                    return String(
                        value ?? ""
                    )
                        .trim()
                        .toLowerCase()
                        .includes(keyword);

                }
            );

        });

    }


    console.log(
        "[CRM] After search:",
        rows.length
    );


    /*-----------------------------------------------------
       STATUS FILTER
    -----------------------------------------------------*/

    const filterElement =
        document.getElementById("crmFilter");


    const filter =
        filterElement
            ? String(
                filterElement.value || "All"
            ).trim()
            : "All";


    if (
        filter &&
        filter !== "All"
    ) {

        rows = rows.filter(
            function (row) {

                return (
                    getCustomerStatus(row)
                    === filter
                );

            }
        );

    }


    console.log(
        "[CRM] After status filter:",
        rows.length
    );


    /*-----------------------------------------------------
       SORT
    -----------------------------------------------------*/

    const sortElement =
        document.getElementById("crmSort");


    const sort =
        sortElement
            ? sortElement.value || "default"
            : "default";


    switch (sort) {


        /*-----------------------------------------------
           CUSTOMER NAME
        -----------------------------------------------*/

        case "name":

            rows.sort(function (a, b) {

                return getCustomerName(a)
                    .localeCompare(
                        getCustomerName(b),
                        undefined,
                        {
                            sensitivity: "base"
                        }
                    );

            });

            break;


        /*-----------------------------------------------
           TRAVEL DATE
        -----------------------------------------------*/

        case "date":

            rows.sort(function (a, b) {

                const dateA =
                    new Date(
                        getCustomerDate(a)
                    ).getTime() || 0;


                const dateB =
                    new Date(
                        getCustomerDate(b)
                    ).getTime() || 0;


                return dateA - dateB;

            });

            break;


        /*-----------------------------------------------
           STATUS
        -----------------------------------------------*/

        case "status":

            const statusOrder = {

                "New": 1,

                "Pending": 2,

                "Processing": 3,

                "Follow Up": 4,

                "Called": 5,

                "WhatsApp Sent": 6,

                "Overdue": 7,

                "Completed": 8

            };


            rows.sort(function (a, b) {

                return (
                    (statusOrder[
                        getCustomerStatus(a)
                    ] || 99)
                    -
                    (statusOrder[
                        getCustomerStatus(b)
                    ] || 99)
                );

            });

            break;


        /*-----------------------------------------------
           PRIORITY
        -----------------------------------------------*/

        case "priority":

            const priorityOrder = {

                "Follow Up": 1,

                "Pending": 2,

                "Called": 2,

                "WhatsApp Sent": 2,

                "Overdue": 2,

                "Processing": 3,

                "New": 4,

                "Completed": 5

            };


            rows.sort(function (a, b) {

                return (
                    (priorityOrder[
                        getCustomerStatus(a)
                    ] || 99)
                    -
                    (priorityOrder[
                        getCustomerStatus(b)
                    ] || 99)
                );

            });

            break;

    }


    /*-----------------------------------------------------
       GROUP BY STATUS
    -----------------------------------------------------*/

    const groups =
        groupByStatus(rows);


    /*-----------------------------------------------------
       BUILD HTML
    -----------------------------------------------------*/

    let html = "";


    html += renderQueue(
        "New",
        groups.New,
        "🔵"
    );


    html += renderQueue(
        "Pending",
        groups.Pending,
        "🟠"
    );


    html += renderQueue(
        "Processing",
        groups.Processing,
        "🟣"
    );


    html += renderQueue(
        "Follow Up",
        groups.FollowUp,
        "🟡"
    );


    html += renderQueue(
        "Called",
        groups.Called,
        "📞"
    );


    html += renderQueue(
        "WhatsApp Sent",
        groups.WhatsAppSent,
        "💬"
    );


    html += renderQueue(
        "Overdue",
        groups.Overdue,
        "🔴"
    );


    html += renderQueue(
        "Completed",
        groups.Completed,
        "🟢"
    );


    /*-----------------------------------------------------
       EMPTY SEARCH RESULT
    -----------------------------------------------------*/

    if (!html) {

        html = `

            <div class="crmSearchEmpty">

                <div class="crmSearchEmptyIcon">
                    🔍
                </div>

                <div class="crmSearchEmptyTitle">
                    No Records Found
                </div>

                <div class="crmSearchEmptyText">
                    No booking matches
                    "${escapeCRMText(keyword)}"
                </div>

            </div>

        `;

    }


    /*-----------------------------------------------------
       RENDER
    -----------------------------------------------------*/

    const container =
        document.getElementById("tabContent");


    if (!container) {

        console.warn(
            "[CRM] #tabContent not found"
        );

        return;

    }


    container.innerHTML = html;


    console.log(
        "[CRM] Final displayed rows:",
        rows.length
    );


    console.log(
        "[CRM] HTML length:",
        html.length
    );


    /*-----------------------------------------------------
       Restore expanded cards
    -----------------------------------------------------*/

    restoreExpandedCards();

}

let expandedCards = {};

function toggleCardDetails(btn) {

    const details =
        btn.closest(".bookingCard")
            .querySelector(".cardDetails");

    const icon =
        btn.querySelector(".expandIcon");

    if (details.classList.contains("open")) {

        details.classList.remove("open");

        icon.innerHTML = "▼";

    } else {

        details.classList.add("open");

        icon.innerHTML = "▲";

    }

}

function restoreExpandedCards() {

    document.querySelectorAll(".bookingCard")

        .forEach(card => {

            const id =

                card.dataset.cardid;

            if (expandedCards[id]) {

                const btn =

                    card.querySelector(".expandBtn");

                const details =

                    card.querySelector(".cardDetails");

                if (btn && details) {

                    details.classList.add("open");

                    btn.classList.add("expanded");

                    const icon = btn.querySelector(".expandIcon");

                    if (icon)
                        icon.innerHTML = "▲";

                }

            }

        });

}

/*=========================
CUSTOMER HELPERS
=========================*/

function getCustomerName(x) {

    return (

        x.Name ||

        x["Customer Name"] ||

        x["customer Name"] ||

        x["Customer"] ||

        x.Package ||

        x.Service ||

        x.Vehicle ||

        "Customer"

    );

}

function getCustomerPhone(x) {

    return (

        x.Phone ||

        x.Mobile ||

        x["Customer Mobile"] ||

        x["Mobile Number"] ||

        x.Contact ||

        ""

    );

}

/*=========================================================
   CUSTOMER STATUS
=========================================================*/

function getCustomerStatus(x) {

    if (!x) {
        return "New";
    }

    const value =
        x.Status ??
        x.STATUS ??
        x.status ??
        "";

    const status =
        String(value)
            .trim()
            .toLowerCase();

    switch (status) {

        case "new":
            return "New";

        case "pending":
            return "Pending";

        case "processing":
            return "Processing";

        case "follow up":
        case "followup":
        case "follow-up":
            return "Follow Up";

        case "called":
            return "Called";

        case "whatsapp sent":
        case "whatsapp":
            return "WhatsApp Sent";

        case "completed":
        case "complete":
            return "Completed";

        case "overdue":
            return "Overdue";

        default:
            return "New";

    }

}

/*=========================================================
   CUSTOMER / TRAVEL DATE
=========================================================*/

function getCustomerDate(row) {

    if (!row) {
        return "";
    }


    const sheet =
        String(row._sheet || "")
            .trim()
            .toLowerCase();


    /*=====================================================
       DEBUG
    =====================================================*/

    console.log(
        "[DATE] Sheet:",
        sheet,
        "Travel Date:",
        row["Travel Date"],
        "Journey Date:",
        row["Journey Date"]
    );


    /*=====================================================
       AIR / FLIGHT
    =====================================================*/

    if (
        sheet === "air" ||
        sheet.includes("air")
    ) {

        return (
            row["Travel Date"] ||
            row["Journey Date"] ||
            row["Date"] ||
            ""
        );

    }


    /*=====================================================
       TRAIN
       
       Some data may use:
       Travel Date
       Journey Date
       Date
    =====================================================*/

    if (
        sheet === "train" ||
        sheet.includes("train")
    ) {

        return (
            row["Travel Date"] ||
            row["Journey Date"] ||
            row["Journey date"] ||
            row["Date"] ||
            ""
        );

    }


    /*=====================================================
       BUS
    =====================================================*/

    if (
        sheet === "bus" ||
        sheet.includes("bus")
    ) {

        return (
            row["Travel Date"] ||
            row["Journey Date"] ||
            row["Journey date"] ||
            row["Date"] ||
            ""
        );

    }


    /*=====================================================
       CAR
    =====================================================*/

    if (
        sheet === "car_bookings" ||
        sheet.includes("car")
    ) {

        return (
            row["Pickup Date"] ||
            row["Pickup"] ||
            row["Created Date"] ||
            ""
        );

    }


    /*=====================================================
       PACKAGE
    =====================================================*/

    if (
        sheet === "travel_leads" ||
        sheet.includes("travel_lead")
    ) {

        return (
            row["Travel Month"] ||
            row["Travel Date"] ||
            row["Journey Date"] ||
            ""
        );

    }


    /*=====================================================
       QUOTE
    =====================================================*/

    if (
        sheet === "premium_quote" ||
        sheet.includes("premium_quote")
    ) {

        return (
            row["Travel Month"] ||
            row["Travel Date"] ||
            row["Journey Date"] ||
            ""
        );

    }


    /*=====================================================
       GENERIC FALLBACK
    =====================================================*/

    return (
        row["Travel Date"] ||
        row["Journey Date"] ||
        row["Pickup Date"] ||
        row["Travel Month"] ||
        row["Created Date"] ||
        row["Date"] ||
        ""
    );

}

function getCustomerRoute(x) {

    let from =

        x.From ||

        x.Pickup ||

        x.Location ||

        "";

    let to =

        x.To ||

        x.Drop ||

        "";

    if (to != "") {

        return from + " → " + to;

    }

    return from;

}




/* ===========================================================
   WRAPPER
=========================================================== */

function openCustomer(item) {

    openCustomerV2(item);

    setTimeout(colorizeDrawerTimeline, 100);

    customerEditing = false;

    updateEditButton();

    updateSaveButton();

}

/*=========================================================
   GROUP ROWS BY STATUS
=========================================================*/

function groupByStatus(arr) {

    const groups = {

        New: [],

        Pending: [],

        Processing: [],

        FollowUp: [],

        Completed: [],

        Called: [],

        WhatsAppSent: [],

        Overdue: []

    };


    if (!Array.isArray(arr)) {
        return groups;
    }


    arr.forEach(function (row) {

        const status =
            getCustomerStatus(row);


        switch (status) {

            case "New":

                groups.New.push(row);

                break;


            case "Pending":

                groups.Pending.push(row);

                break;


            case "Processing":

                groups.Processing.push(row);

                break;


            case "Follow Up":

                groups.FollowUp.push(row);

                break;


            case "Called":

                groups.Called.push(row);

                break;


            case "WhatsApp Sent":

                groups.WhatsAppSent.push(row);

                break;


            case "Overdue":

                groups.Overdue.push(row);

                break;


            case "Completed":

                groups.Completed.push(row);

                break;


            default:

                groups.New.push(row);

        }

    });


    return groups;

}

function renderQueue(title, arr, icon) {

    if (!Array.isArray(arr) || arr.length === 0) {

        return "";

    }

    let html = `

<div class="queueTitle">

    ${icon} ${title}

    (${arr.length})

</div>

`;

    arr.forEach(function (row, index) {

        try {

            html += renderCard(row);

        }

        catch (e) {

            console.error("RenderCard Error :", index, row, e);

        }

    });

    return html;

}

function getServiceBadge(row) {

    const sheet = String(row._sheet || "").toLowerCase();

    if (sheet === "air") {
        return `<span class="servicePill air">✈ Air</span>`;
    }

    if (sheet === "train") {
        return `<span class="servicePill train">🚆 Train</span>`;
    }

    if (sheet === "bus") {
        return `<span class="servicePill bus">🚌 Bus</span>`;
    }

    if (sheet === "car_bookings") {
        return `<span class="servicePill car">🚖 Car</span>`;
    }

    if (sheet === "travel_leads") {
        return `<span class="servicePill package">🏖 Package</span>`;
    }

    if (sheet === "premium_quote") {
        return `<span class="servicePill quote">💬 Quote</span>`;
    }

    return `<span class="servicePill default">📌 Service</span>`;
}

function getBookingAmount(row) {

    return Number(

        row["Revenue"] ||

        row["Estimated Revenue"] ||

        row["Amount"] ||

        row["Fare"] ||

        row["Total Fare"] ||

        row["Estimated Fare"] ||

        row["Package Cost"] ||

        0

    );

}

function getFollowupDate(item) {

    return (

        item["Next Follow Up"] ||

        item["FollowUp Date"] ||

        item["Follow Up Date"] ||

        item["Follow-up Date"] ||

        ""

    );

}

function getLastActivity(item) {

    return (

        item["Last Activity"] ||

        item["Updated On"] ||

        item.Timestamp ||

        ""

    );

}

function getCustomerActivity(row) {

    if (!window.dashboardData) {

        return {

            icon: "⚡",

            title: "No Activity",

            time: ""

        };

    }

    const bookingId =

        row["Booking ID"] ||

        row.bookingId ||

        "";

    const customer =

        getCustomerName(row);

    const logs =

        window.dashboardData.activityLog ||

        [];

    for (let i = logs.length - 1; i >= 0; i--) {

        const a = logs[i];

        if (

            (bookingId && a.bookingId == bookingId)

            ||

            (customer && a.customer == customer)

        ) {

            return {

                icon: getActivityIcon(a.type),

                title: a.description || a.type,

                time: timeAgo(a.datetime)

            };

        }

    }

    return {

        icon: "⚡",

        title: "No Activity",

        time: ""

    };

}

function formatRelativeTime(date) {

    if (!date) return "";

    const d = new Date(date);

    if (isNaN(d)) return date;

    const now = new Date();

    const diff = (now - d) / 1000;

    if (diff < 60)
        return "Just now";

    if (diff < 3600)
        return Math.floor(diff / 60) + " mins ago";

    if (diff < 86400)
        return Math.floor(diff / 3600) + " hrs ago";

    if (diff < 172800)
        return "Yesterday";

    if (diff < 604800)
        return Math.floor(diff / 86400) + " days ago";

    return d.toLocaleDateString();

}

function getTimelineTheme(type) {

    const activity =
        String(type || "")
            .toLowerCase()
            .trim();

    //--------------------------------------------------
    // Default
    //--------------------------------------------------

    let theme = {

        color: "#64748B",
        glow: "rgba(100,116,139,.35)",
        badge: "Activity",
        icon: "📝"

    };

    //--------------------------------------------------
    // WhatsApp
    //--------------------------------------------------

    if (activity.includes("whatsapp")) {

        theme = {

            color: "#22C55E",
            glow: "rgba(34,197,94,.35)",
            badge: "WhatsApp",
            icon: "💬"

        };

    }

    //--------------------------------------------------
    // Phone
    //--------------------------------------------------

    else if (

        activity.includes("phone") ||

        activity.includes("call")

    ) {

        theme = {

            color: "#3B82F6",
            glow: "rgba(59,130,246,.35)",
            badge: "Phone",
            icon: "📞"

        };

    }

    //--------------------------------------------------
    // Follow Up
    //--------------------------------------------------

    else if (

        activity.includes("follow")

    ) {

        theme = {

            color: "#F59E0B",
            glow: "rgba(245,158,11,.35)",
            badge: "Follow Up",
            icon: "📅"

        };

    }

    //--------------------------------------------------
    // Completed
    //--------------------------------------------------

    else if (

        activity.includes("completed")

    ) {

        theme = {

            color: "#10B981",
            glow: "rgba(16,185,129,.35)",
            badge: "Completed",
            icon: "✅"

        };

    }

    //--------------------------------------------------
    // Confirmed
    //--------------------------------------------------

    else if (

        activity.includes("confirmed")

    ) {

        theme = {

            color: "#059669",
            glow: "rgba(5,150,105,.35)",
            badge: "Confirmed",
            icon: "🎉"

        };

    }

    //--------------------------------------------------
    // Note
    //--------------------------------------------------

    else if (

        activity.includes("note")

    ) {

        theme = {

            color: "#FB923C",
            glow: "rgba(251,146,60,.35)",
            badge: "Note",
            icon: "📝"

        };

    }

    return theme;

}

/*=========================================================
PREMIUM HUMAN FRIENDLY DATE
=========================================================*/

function formatRelativeDate(value) {

    let d;

    //----------------------------------
    // Unix Timestamp
    //----------------------------------

    if (!isNaN(value)) {

        d = new Date(Number(value));

    }

    //----------------------------------
    // DD/MM/YYYY HH:mm
    //----------------------------------

    else {

        const match = value.match(
            /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/
        );

        if (!match) {

            return {

                day: "",

                time: ""

            };

        }

        const [

            ,

            dd,

            mm,

            yyyy,

            hh,

            min

        ] = match;

        d = new Date(

            yyyy,

            mm - 1,

            dd,

            hh,

            min

        );

    }

    //----------------------------------

    const now = new Date();

    const diffDays = Math.floor(

        (now - d) / 86400000

    );

    let dayLabel = "";

    if (diffDays === 0) {

        dayLabel = "Today";

    }

    else if (diffDays === 1) {

        dayLabel = "Yesterday";

    }

    else if (diffDays < 7) {

        dayLabel = diffDays + " days ago";

    }

    else if (diffDays < 14) {

        dayLabel = "Last week";

    }

    else if (diffDays < 30) {

        dayLabel = Math.floor(diffDays / 7) + " weeks ago";

    }

    else if (diffDays < 60) {

        dayLabel = "Last month";

    }

    else {

        if (

            d.getFullYear() === now.getFullYear()

        ) {

            dayLabel = d.toLocaleDateString(

                "en-IN",

                {

                    day: "numeric",

                    month: "short"

                }

            );

        }

        else {

            dayLabel = d.toLocaleDateString(

                "en-IN",

                {

                    day: "numeric",

                    month: "short",

                    year: "numeric"

                }

            );

        }

    }

    return {

        day: dayLabel,

        time: d.toLocaleTimeString(

            "en-IN",

            {

                hour: "numeric",

                minute: "2-digit"

            }

        )

    };

}

function buildTimeline(row) {

    const notes =
        row.Notes ||
        row["Notes"] ||
        "";

    if (!notes || notes.trim() === "") {

        return `
        <div class="timelineEmpty">
            No Activity
        </div>
        `;

    }

    //-------------------------------------------------------
    // Split every activity
    //-------------------------------------------------------

    const blocks = notes
        .split("-------------------------")
        .map(x => x.trim())
        .filter(x => x !== "");

    const timeline = [];

    blocks.forEach(block => {

        const lines = block
            .split("\n")
            .map(x => x.trim())
            .filter(x => x != "");

        if (lines.length < 2) return;

        //------------------------------------------
        // First line
        //------------------------------------------

        const first = lines[0];

        //------------------------------------------
        // Emoji
        //------------------------------------------

        const icon =
            first.match(
                /^[^\s]+/
            )?.[0] || "📝";

        //------------------------------------------
        // Remove emoji
        //------------------------------------------

        const withoutIcon =
            first.replace(icon, "").trim();

        //------------------------------------------
        // Date + Time
        //------------------------------------------

        const dateMatch =
            withoutIcon.match(
                /\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/
            );

        const activityTime =
            dateMatch ?
                dateMatch[0] :
                "";

        //------------------------------------------
        // Activity text
        //------------------------------------------

        const title =
            lines.slice(1).join(" ");

        //------------------------------------------
        // Color
        //------------------------------------------

        //-------------------------------------------------------
        // Premium Color & Badge
        //-------------------------------------------------------



        const theme =
            getTimelineTheme(title);

        const color =
            theme.color;

        const glow =
            theme.glow;

        const badge =
            theme.badge;

        const displayIcon =
            theme.icon;

        const relative =
            formatRelativeDate(activityTime);




        timeline.push({

            icon,

            displayIcon,

            title,

            shortTitle:
                title.length > 90
                    ? title.substring(0, 90) + "..."
                    : title,

            expandable:
                title.length > 90,

            day: relative.day,

            time: relative.time,

            color,

            glow,

            badge

        });

    });

    //-------------------------------------------------------

    if (timeline.length === 0) {

        return `
        <div class="timelineEmpty">
            No Activity
        </div>
        `;

    }

    //-------------------------------------------------------
    // Latest first
    //-------------------------------------------------------

    timeline.reverse();

    const latestActivity = timeline[0] || null;

    //-------------------------------------------------------

    const visibleTimeline = timeline.slice(0, 3);
    const hiddenTimeline = timeline.slice(3);

    return `

<div class="crmTimelineVisible">

${visibleTimeline.map((item, index) =>

        renderTimelineItem(item, index)

    ).join("")}

</div>

${hiddenTimeline.length
            ?

            `

<button
class="crmTimelineExpandBtn"
type="button"
onclick="toggleTimelineHistory(this)">

▼ 📜 View Previous Activities (${hiddenTimeline.length})

</button>

<div class="crmTimelineHidden">

${hiddenTimeline.map((item, index) =>

                renderTimelineItem(item, index + 3)

            ).join("")}

</div>

`

            :

            ""

        }

`;

}

function renderTimelineItem(item, index) {

    //--------------------------------------------------
    // Build Timeline Body
    //--------------------------------------------------

    let body = item.title || "";

    //--------------------------------------------------
    // Booking ID
    //--------------------------------------------------

    if (item.bookingId) {

        body = body.replace(

            /Booking\s*ID\s*:\s*$/im,

            `Booking ID : ${item.bookingId}`

        );

        if (

            item.badge === "Booking" &&

            !/Booking\s*ID/i.test(body)

        ) {

            body =

                `Booking ID : ${item.bookingId}

${body}`;

        }

    }

    //--------------------------------------------------
    // Customer Note
    //--------------------------------------------------

    if (

        item.customerNote &&

        item.title.trim() !== item.customerNote.trim()

    ) {

        body += `

Customer Note :

${item.customerNote}`;

    }

    //--------------------------------------------------

    return `

<div

class="crmGlassV2TimelineItem"

style="
border-left:4px solid ${item.color};
--timelineGlow:${item.glow};
">

<div
class="crmGlassV2TimelineIcon"
style="
background:${item.color}22;
color:${item.color};
box-shadow:0 0 18px ${item.glow};
border:1px solid ${item.color}55;
">

${item.displayIcon}

</div>

<div class="crmGlassV2TimelineContent">

<div class="crmGlassV2TimelineTop">

<span
class="crmGlassV2TimelineBadge"

style="
background:${item.color}22;
color:${item.color};
border-color:${item.color}66;
">

${item.badge}

</span>

<div class="crmGlassV2TimelineMeta">

<div class="crmGlassV2TimelineDay">

${item.day}

</div>

<div
class="crmGlassV2TimelineClock"

style="
background:${item.color}15;
color:${item.color};
">

🕒 ${item.time}

</div>

</div>

</div>

<div class="crmGlassV2TimelineTitle">

<div
id="timelineShort${index}"
class="crmTimelineShort">

${formatLatestActivityBody(body)}

</div>

<div
id="timelineFull${index}"
class="crmTimelineFull">

${formatLatestActivityBody(body)}

</div>

${item.expandable ?

            `

<button
class="crmTimelineMore"
type="button"
onclick="toggleTimelineNote(${index},this)">

▼ More

</button>

`

            : ""}

</div>

</div>

</div>

`;

}

function toggleTimelineHistory(btn) {

    const wrapper =
        btn.nextElementSibling;

    wrapper.classList.toggle("open");

    if (wrapper.classList.contains("open")) {

        btn.innerHTML = "▲ Show Less";

    } else {

        btn.innerHTML =
            `▼ Show More (${wrapper.children.length})`;

    }

}


function toggleTimelineNote(index, btn) {

    const card = btn.closest(".crmGlassV2TimelineTitle");

    card.classList.toggle("expanded");

    const expanded =
        card.classList.contains("expanded");

    btn.innerHTML =
        expanded
            ? "▲ Less"
            : "▼ More";

}


function getLatestActivity(row) {

    const notes =
        row.Notes ||
        row["Notes"] ||
        "";

    if (!notes.trim()) {

        return null;

    }

    const blocks = notes
        .split("-------------------------")
        .map(x => x.trim())
        .filter(Boolean);

    if (blocks.length === 0) {

        return null;

    }

    //---------------------------------------------------
    // Latest block
    //---------------------------------------------------

    const latest = blocks[blocks.length - 1];

    const lower = latest.toLowerCase();

    if (

        lower.includes("phone") ||

        latest.includes("📞")

    ) {

        return "PHONE";

    }

    if (

        lower.includes("whatsapp") ||

        latest.includes("💬")

    ) {

        return "WHATSAPP";

    }

    if (

        lower.includes("follow") ||

        latest.includes("📅")

    ) {

        return "FOLLOWUP";

    }



    return "NOTE";

}

function toggleCRMCard(id) {

    const all = document.querySelectorAll(".crmCardExpanded");

    all.forEach(function (x) {

        if (x.id !== id) {

            x.style.maxHeight = "0px";

            x.classList.remove("open");

        }

    });

    const card = document.getElementById(id);

    if (!card) return;

    if (card.classList.contains("open")) {

        card.style.maxHeight = "0px";

        card.classList.remove("open");

        expandedCRMCard = null;

        return;

    }

    card.classList.add("open");

    card.style.maxHeight =

        card.scrollHeight + "px";

    expandedCRMCard = id;

}

function restoreExpandedCRMCard() {

    if (!expandedCRMCard) return;

    const box =

        document.getElementById(

            expandedCRMCard

        );

    if (!box) return;

    box.classList.add("open");

    box.style.maxHeight =

        box.scrollHeight + "px";

}

function buildLatestActivity(row) {

    const activities = getCustomerActivityList(row);

    if (!activities.length) {

        return `

<div class="crmGlassV2TimelineEmpty">

No Recent Activity

</div>

`;

    }

    const latest = activities[0];

    //--------------------------------------------------
    // Build body exactly like renderActivityCard()
    //--------------------------------------------------

    let body = latest.body || "";

    const bookingId =
        latest.bookingId ||
        row["Booking ID"] ||
        row.bookingId ||
        "";

    //--------------------------------------------------
    // Replace empty Booking ID
    //--------------------------------------------------

    if (bookingId) {

        body = body.replace(
            /Booking\s*ID\s*:\s*$/im,
            `Booking ID : ${bookingId}`
        );

        if (
            latest.badge === "Booking" &&
            !/Booking\s*ID/i.test(body)
        ) {

            body = `Booking ID : ${bookingId}

${body}`;
        }
    }

    //--------------------------------------------------
    // Customer Note
    //--------------------------------------------------

    if (

        latest.customerNote &&

        latest.body.trim() !== latest.customerNote.trim()

    ) {

        body += `

Customer Note :

${latest.customerNote}`;

    }

    //--------------------------------------------------

    return `

<div
class="crmGlassV2TimelineItem"
style="
border-left:4px solid ${latest.color};
--timelineGlow:${latest.color};
">

<div
class="crmGlassV2TimelineIcon"
style="
background:${latest.color}22;
color:${latest.color};
">

${latest.icon}

</div>

<div class="crmGlassV2TimelineContent">

<div class="crmGlassV2TimelineTop">

<span
class="crmGlassV2TimelineBadge"
style="
background:${latest.color}22;
color:${latest.color};
">

${latest.badge}

</span>

<div class="crmGlassV2TimelineMeta">

<div class="crmGlassV2TimelineDay">

${latest.relative.day}

</div>

<div
class="crmGlassV2TimelineClock"
style="
background:${latest.color}15;
color:${latest.color};
">

🕒 ${latest.relative.time}

</div>

</div>

</div>

<div class="crmGlassV2TimelineTitle">

${formatLatestActivityBody(body)}

</div>

</div>

</div>

`;

}

function formatLatestActivityBody(text) {

    return text

        .split("\n")

        .filter(x => x.trim() != "")

        .map(line => {

            if (line.includes(":")) {

                const parts = line.split(":");

                return `

<div class="crmLatestActivityLine">

<strong>${parts.shift()}:</strong>

${parts.join(":").trim()}

</div>

`;

            }

            return `

<div class="crmLatestActivityLine">

${line}

</div>

`;

        })

        .join("");

}




//-----------------------------------------------------
// Detect Service Icon
//-----------------------------------------------------
function getServiceIcon(row) {

    const sheet = String(row._sheet || "").toLowerCase();

    if (sheet.includes("air")) return "✈";
    if (sheet.includes("train")) return "🚆";
    if (sheet.includes("bus")) return "🚌";
    if (sheet.includes("car")) return "🚖";
    if (sheet.includes("travel_leads")) return "🏖";
    if (sheet.includes("quote")) return "💬";

    return "📌";
}

//-----------------------------------------------------
// Better Route
//-----------------------------------------------------
function getTravelFrom(row) {

    const sheet = String(row._sheet || "").toLowerCase();

    // AIR
    if (sheet.includes("air"))
        return row["From"] || "";

    // TRAIN
    if (sheet.includes("train"))
        return row["From"] || "";

    // BUS
    if (sheet.includes("bus"))
        return row["From"] || "";

    //--------------------------------
    // CAR BOOKINGS
    //--------------------------------
    if (sheet === "car_bookings") {

        const location = row["Location"] || "";

        if (location.includes("→")) {
            return location.split("→")[0].trim();
        }

        return location;

    }

    // PACKAGE
    if (sheet.includes("travel"))
        return row["Package"] || "";

    // QUOTE
    if (sheet.includes("quote"))
        return row["Service"] || "";

    return "";

}

function getTravelTo(row) {

    const sheet = String(row._sheet || "").toLowerCase();

    // AIR
    if (sheet.includes("air"))
        return row["To"] || "";

    // TRAIN
    if (sheet.includes("train"))
        return row["To"] || "";

    // BUS
    if (sheet.includes("bus"))
        return row["To"] || "";

    //--------------------------------
    // CAR BOOKINGS
    //--------------------------------
    if (sheet === "car_bookings") {

        const location = row["Location"] || "";

        if (location.includes("→")) {
            return location.split("→")[1].trim();
        }

        return "";

    }

    // PACKAGE
    if (sheet.includes("travel"))
        return row["Travel Month"] || "";

    // QUOTE
    if (sheet.includes("quote"))
        return row["Travel Month"] || "";

    return "";

}

//-----------------------------------------------------
// Only Date
//-----------------------------------------------------
/*=========================================================
   FORMAT TRAVEL DATE
=========================================================*/

function formatTravelDate(value) {

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {

        return "";

    }


    const original =
        String(value).trim();


    /*=====================================================
       TRAVEL MONTH
       Example:
       August 2026
    =====================================================*/

    if (
        /^[A-Za-z]+\s+\d{4}$/.test(original)
    ) {

        return original;

    }


    /*=====================================================
       DD/MM/YYYY
       Example:
       25/08/2026
    =====================================================*/

    let match =
        original.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


    if (match) {

        const day =
            Number(match[1]);

        const month =
            Number(match[2]) - 1;

        const year =
            Number(match[3]);


        const d =
            new Date(
                year,
                month,
                day
            );


        if (
            d.getFullYear() === year &&
            d.getMonth() === month &&
            d.getDate() === day
        ) {

            return d.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        }

    }


    /*=====================================================
       DD-MM-YYYY
    =====================================================*/

    match =
        original.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})$/
        );


    if (match) {

        const day =
            Number(match[1]);

        const month =
            Number(match[2]) - 1;

        const year =
            Number(match[3]);


        const d =
            new Date(
                year,
                month,
                day
            );


        if (
            d.getFullYear() === year &&
            d.getMonth() === month &&
            d.getDate() === day
        ) {

            return d.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        }

    }


    /*=====================================================
       STANDARD JS / ISO DATE
       
       Example:
       2026-08-25
       2026-08-25T00:00:00
    =====================================================*/

    const d =
        new Date(original);


    if (!isNaN(d.getTime())) {

        return d.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    /*=====================================================
       LAST FALLBACK
    =====================================================*/

    return original;

}

function getTravelDate(row) {

    const sheet = String(row._sheet || "").toLowerCase();

    //--------------------------------
    // Air / Train / Bus
    //--------------------------------

    if (
        sheet === "air" ||
        sheet === "train" ||
        sheet === "bus"
    ) {
        return row["Travel Date"];
    }

    //--------------------------------
    // Car
    //--------------------------------

    if (sheet === "car_bookings") {
        return row["Pickup"];
    }

    //--------------------------------
    // Package
    //--------------------------------

    if (sheet === "travel_leads") {
        return row["Travel Month"];
    }

    //--------------------------------
    // Quote
    //--------------------------------

    if (sheet === "premium_quote") {
        return row["Travel Month"];
    }

    return "";
}

function getVehicleBadge(row) {

    if (String(row._sheet || "").toLowerCase() !== "car_bookings")
        return "";

    const vehicle = row["Vehicle"] || "";
    if (!vehicle) return "";

    return `
        <span class="vehicleBadge">
            🚙 ${vehicle}
        </span>
    `;
}

/*==================================================
PREMIUM CRM AVATAR GRADIENT
==================================================*/

const avatarGradients = [

    ["#00BCD4", "#3F51B5"],
    ["#4CAF50", "#009688"],
    ["#9C27B0", "#673AB7"],
    ["#FF9800", "#F44336"],
    ["#03A9F4", "#00BCD4"],
    ["#E91E63", "#9C27B0"],
    ["#8BC34A", "#4CAF50"],
    ["#607D8B", "#3F51B5"],
    ["#FF5722", "#FF9800"],
    ["#3F51B5", "#9C27B0"]

];

function hashString(str) {

    let hash = 0;

    for (let i = 0; i < str.length; i++) {

        hash = ((hash << 5) - hash) + str.charCodeAt(i);

        hash |= 0;

    }

    return Math.abs(hash);

}

function getAvatarGradient(name) {

    if (!name)
        return "linear-gradient(135deg,#00BCD4,#3F51B5)";

    const pair = avatarGradients[
        hashString(name) % avatarGradients.length
    ];

    return `linear-gradient(135deg,${pair[0]},${pair[1]})`;

}

/*==========================================
CRM TIMELINE COUNT
==========================================*/

function getActivityCount(row) {

    if (!row.Notes)
        return 0;

    const entries = row.Notes
        .split("-------------------------")
        .filter(x => x.trim() != "");

    return entries.length;

}

function renderCard(row) {

    const name = getCustomerName(row);
    const phone = getCustomerPhone(row);
    const status = getCustomerStatus(row);

    console.log("===== SHEET =====");
    console.log(row._sheet);

    console.log("===== COMPLETE ROW =====");
    console.table(row);

    const route = getCustomerRoute(row);
    const date = getCustomerDate(row);

    console.table(row);


    console.log("===== AMOUNT DEBUG =====");
    console.log("Sheet:", row._sheet);
    console.table(row);
    console.log("Revenue =", row["Revenue"]);
    console.log("Estimated Revenue =", row["Estimated Revenue"]);
    console.log("Estimated Fare =", row["Estimated Fare"]);
    console.log("Amount Returned =", getBookingAmount(row));

    const amount = getBookingAmount(row);

    const latestActivity = buildLatestActivity(row);



    //------------------------------------------------
    // Priority
    //------------------------------------------------

    let priority = "LOW";
    let priorityColor = "#22c55e";

    if (status === "Follow Up") {

        priority = "HIGH";
        priorityColor = "#ef4444";

    }

    else if (

        status === "Pending" ||

        status === "Called" ||

        status === "WhatsApp Sent"

    ) {

        priority = "MEDIUM";
        priorityColor = "#f59e0b";

    }

    return `

<div class="bookingCard modernCard">

    <!-- ========================= -->
    <!-- SUMMARY -->
    <!-- ========================= -->

    <div class="cardSummary">

        <div class="bookingHeader">

            <div class="customerInfo">

<div
class="customerAvatar"
style="background:${getAvatarGradient(name)}">

    ${name ? name.charAt(0).toUpperCase() : "?"}

</div>

                <div class="bookingHeaderInfo">

                    <div class="customerNameRow">

                        <div class="customerName">

                            ${name}

                        </div>

                        <div
                            class="priorityMini"
                            style="--priorityColor:${priorityColor};">

                            <span class="priorityDot"></span>

                            ${priority}

                        </div>

                    </div>

                    <div class="customerPhone">

                        📞 ${phone}

                    </div>

                </div>

            </div>

            <div class="bookingRight">

                <div class="statusBadge ${status.toLowerCase().replace(/\s/g, "")}">

                    ${status}

                </div>


<button class="actionBtn viewBtn"
        onclick='openCustomer(${JSON.stringify(row)})'>
    👁
</button>



${getBookingAmount(row) > 0 ? `

<div class="amountBadge">

💰 ₹ ${Number(getBookingAmount(row)).toLocaleString("en-IN")}

</div>

` : ""}

            </div>

        </div>

<div class="travelSummary">

    <div class="travelMini travelRoute">



        ${getServiceBadge(row)}

        <div class="travelRouteModern">

    <div class="travelFrom">
        📍 <span>${getTravelFrom(row)}</span>
    </div>

    <div class="travelMiddle">

        <div class="travelTrack"></div>

        <div class="travelPlane">
            ${getServiceIcon(row)}
        </div>

    </div>

    <div class="travelTo">
        📍 <span>${getTravelTo(row)}</span>
    </div>

    ${getVehicleBadge(row)}

</div>

    </div>

    <div class="travelMini travelDate">

        <span class="travelDateIcon">

            📅

        </span>

        ${formatTravelDate(getCustomerDate(row))}

    </div>

</div>

<div class="followupBadge ${getFollowupClass(row["Next Follow Up"] || row["FollowUp Date"])}">

    <span class="followupIcon">⏰</span>

    <span class="followupLabel">Follow Up</span>

    <span class="followupText">
        ${getFollowupText(row["Next Follow Up"] || row["FollowUp Date"])}
    </span>

</div>

        <div class="crmProgress">

${buildProgress(status)}

</div>

<div class="activityPreview compactActivity">

<div>

${latestActivity}

</div>



</div>

        <div class="expandRow">

<button
class="expandBtn"
onclick="toggleCardDetails(this)">

<span class="expandIcon">▼</span>

<span class="expandLabel">

Timeline

</span>

<span class="activityBadge">

🟢

${getActivityCount(row)}

${getActivityCount(row) == 1 ? "Activity" : "Activities"}

</span>

</button>

</div>

    </div>

    <!-- ========================= -->
    <!-- DETAILS -->
    <!-- ========================= -->

    <div class="cardDetails">

<div class="crmTimeline crmTimelineScroll">

    ${buildActivityFeed(row)}

</div>

        <div class="bookingActions">

    <button class="actionBtn callBtn"
        onclick="callCustomer('${phone}')">
        📞
    </button>

    <button class="actionBtn whatsappBtn"
        onclick="whatsappCustomer('${phone}')">
        💬
    </button>

<button class="actionBtn viewBtn"
        onclick='openCustomer(${JSON.stringify(row)})'>
    👁
</button>

    <button class="actionBtn copyBtn"
        onclick="copyCustomer('${phone}')">
        📋
    </button>

</div>

    </div>

</div>

`;

}



function closeCustomerDrawer() {

    const drawer =

        document.getElementById(

            "customerDrawer"

        );

    drawer.classList.remove(

        "active"

    );

}

document.addEventListener(

    "DOMContentLoaded",

    function () {

        const closeBtn =

            document.getElementById(

                "closeDrawer"

            );

        if (closeBtn) {

            closeBtn.onclick =

                closeCustomerDrawer;

        }

    }

);



function closeDrawer() {

    document
        .getElementById(
            "customerDrawer"
        )
        .classList.remove(
            "active"
        );

}

function openCustomerByIndex(index) {

    const item = currentRows[index];

    if (!item) {

        return;

    }

    openCustomer(item);


}

async function saveCustomerUpdate() {

    const btn =
        document.getElementById(
            "saveCustomerBtn"
        );

    const btnText =
        document.getElementById(
            "saveBtnText"
        );

    const msg =
        document.getElementById(
            "saveMessage"
        );

    if (!msg) {

        console.error(
            "saveMessage div missing"
        );

        return;

    }

    try {

        if (!currentCustomer) {

            msg.className =
                "saveError";

            msg.innerHTML =
                "No customer selected";

            return;

        }

        btn.disabled = true;

        btnText.innerHTML =
            "⏳ Saving...";

        msg.className =
            "saveLoading";

        msg.innerHTML =
            "Saving update...";

        const status =
            document.getElementById(
                "customerStatus"
            ).value;

        const notes =
            document.getElementById("customerNotes")?.value.trim() || "";


        console.log(
            "CURRENT CUSTOMER"
        );

        console.log(
            currentCustomer
        );

        const result =
            await saveCustomerCRM({



                sheet: currentTab,

                bookingId:

                    currentCustomer["Booking ID"] ||

                    currentCustomer.bookingId ||

                    "",

                customer:

                    currentCustomer.Name ||

                    currentCustomer.Customer ||

                    currentCustomer["Customer Name"] ||

                    "",

                service: currentTab,

                status: status,

                notes: notes,

                activity: status

            });

        await saveBookingProgress(currentCustomer);

        console.log(
            "SAVE RESULT"
        );

        console.log(
            result
        );

        if (result.success) {

            msg.className =
                "saveSuccess";

            msg.innerHTML =
                "✓ Saved Successfully";

            /*---------------------------------------
            SAVE BOOKING PROGRESS
            ---------------------------------------*/

            try {

                await saveBookingProgress(currentCustomerV2);

                console.log("Booking Progress Saved");

            }
            catch (err) {

                console.error("Booking Progress Error");

                console.error(err);

            }


        } else {

            msg.className =
                "saveError";

            msg.innerHTML =
                result.message ||

                result.error ||

                "Save Failed";

        }

    }

    catch (err) {

        console.error(err);

        msg.className =
            "saveError";

        msg.innerHTML =
            err.message ||
            "Save Failed";

    }

    finally {

        btn.disabled = false;

        btnText.innerHTML =
            "💾 Save Update";

    }

}

/*=========================================================
   UPDATE TAB COUNTERS
=========================================================*/

function updateTabCounters() {

    console.log(
        "================================="
    );

    console.log(
        "[TAB COUNTERS] Updating..."
    );

    console.log(
        "================================="
    );


    const data =
        window.dashboardData;


    if (
        !data ||
        typeof data !== "object"
    ) {

        console.warn(
            "[TAB COUNTERS] dashboardData is not available"
        );

        return;

    }


    function safeLength(value) {

        return Array.isArray(value)
            ? value.length
            : 0;

    }


    const counts = {

        flight:
            safeLength(
                data.air
            ),

        train:
            safeLength(
                data.train
            ),

        bus:
            safeLength(
                data.bus
            ),

        car:
            safeLength(
                data.cars
            ),

        package:
            safeLength(
                data.packages
            ),

        quote:
            safeLength(
                data.quotes
            )

    };


    const counterElements = {

        countFlight:
            counts.flight,

        countTrain:
            counts.train,

        countBus:
            counts.bus,

        countCar:
            counts.car,

        countPackage:
            counts.package,

        countQuote:
            counts.quote

    };


    Object.entries(
        counterElements
    )
    .forEach(
        function ([id, count]) {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {

                return;

            }


            element.textContent =
                count;

        }
    );


    console.log(
        "[TAB COUNTERS] Result:",
        counts
    );

}

function buildProgress(status) {

    status = String(status || "").trim().toLowerCase();

    const steps = [
        "New",
        "Follow Up",
        "Processing",
        "Completed"
    ];

    let current = 0;

    switch (status) {

        case "new":
            current = 0;
            break;

        case "pending":
        case "follow up":
        case "whatsapp sent":
        case "called":
            current = 1;
            break;

        case "processing":
        case "confirmed":
            current = 2;
            break;

        case "completed":
            current = 3;
            break;

        default:
            current = 0;

    }

    return steps.map((step, index) => {

        const colors = [
            "#3b82f6",
            "#f59e0b",
            "#8b5cf6",
            "#22c55e"
        ];

        return `

<div class="crmStep ${index <= current ? "done" : ""}"
style="--stepColor:${colors[index]}">

<div class="crmStepDot"></div>

<div class="crmStepLabel">

${step}

</div>

</div>

`;

    }).join("");

}

function getFollowupText(date) {

    if (!date)
        return "";

    const d = new Date(date);

    if (isNaN(d))
        return "";

    const today = new Date();

    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diff = Math.floor(
        (d - today) / 86400000
    );

    if (diff < 0) {

        return `Overdue ${Math.abs(diff)} Day${Math.abs(diff) > 1 ? "s" : ""}`;

    }

    if (diff === 0) {

        return "Today";

    }

    if (diff === 1) {

        return "Tomorrow";

    }

    return diff + " Days";

}

function getFollowupClass(date) {

    if (!date) return "followup-future";

    const d = new Date(date);
    const today = new Date();

    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diff = Math.floor((d - today) / 86400000);

    if (diff === 0) return "followup-today";

    if (diff === 1) return "followup-tomorrow";

    if (diff < 0) return "followup-overdue";

    return "followup-future";

}

function getServiceName(row) {

    const sheet = String(row._sheet || "").toLowerCase();

    if (sheet.includes("air")) return "FLIGHT";

    if (sheet.includes("train")) return "TRAIN";

    if (sheet.includes("bus")) return "BUS";

    if (sheet.includes("car")) return "CAR";

    if (sheet === "travel_leads")
        return "Package";

    if (sheet === "premium_quote")
        return "Quote";

    return "SERVICE";

}

/*=========================================================
ACTIVITY CENTER HELPERS
=========================================================*/

/*
Converts Notes column into activity objects
*/

function parseCustomerActivities(row) {

    //--------------------------------------------------
    // Original Notes
    //--------------------------------------------------

    const notes =
        row["Notes"] ||
        row.Notes ||
        "";

    if (!notes.trim())
        return [];

    //--------------------------------------------------
    // Extract Customer Note (before first activity)
    //--------------------------------------------------

    let customerNote = "";

    let activityText = notes;

    const firstSeparator =
        notes.indexOf("-------------------------");

    //--------------------------------------------------
    // Case 1: No separator → Entire note is customer note
    //--------------------------------------------------

    if (firstSeparator === -1) {

        customerNote = notes.trim();

        activityText = "";

    }

    //--------------------------------------------------
    // Case 2: Separator exists
    //--------------------------------------------------

    else {

        const firstBlock =
            notes
                .substring(0, firstSeparator)
                .trim();

        if (!/\d{2}\/\d{2}\/\d{4}/.test(firstBlock)) {

            customerNote = firstBlock;

            activityText =
                notes.substring(firstSeparator);

        }

    }

    console.group("========== CUSTOMER ACTIVITY ==========");

    console.log("Customer :", row["Customer Name"]);

    console.log("Booking ID :", row["Booking ID"]);

    console.log("Customer Note :", customerNote);

    console.log("Activity Text :");

    console.log(activityText);

    console.groupEnd();

    //--------------------------------------------------
    // Split Activities
    //--------------------------------------------------

    const blocks =
        activityText
            .split("-------------------------")
            .map(x => x.trim())
            .filter(Boolean);

    const activities = [];

    //--------------------------------------------------

    blocks.forEach(block => {

        const lines =
            block
                .split("\n")
                .map(x => x.trim())
                .filter(Boolean);

        if (lines.length < 2)
            return;

        //--------------------------------------------------
        // First Line
        //--------------------------------------------------

        const first = lines[0];

        //--------------------------------------------------
        // Emoji
        //--------------------------------------------------

        const emoji =
            first.match(/^[^\s]+/)?.[0] || "📝";

        //--------------------------------------------------
        // Remove Emoji
        //--------------------------------------------------

        const firstWithoutEmoji =
            first.replace(emoji, "").trim();

        //--------------------------------------------------
        // Date
        //--------------------------------------------------

        const dateMatch =
            firstWithoutEmoji.match(
                /\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/
            );

        const activityTime =
            dateMatch
                ? dateMatch[0]
                : "";

        //--------------------------------------------------
        // Activity Body
        //--------------------------------------------------

        const body =
            lines
                .slice(1)
                .join("\n");

        //--------------------------------------------------
        // Theme
        //--------------------------------------------------

        const theme =
            getActivityCardTheme(body);

        //--------------------------------------------------
        // Debug
        //--------------------------------------------------

        console.log({

            customer: row["Customer Name"],

            bookingId: row["Booking ID"],

            customerNote,

            title: theme.title,

            body

        });

        //--------------------------------------------------

        activities.push({

            emoji,

            icon: theme.icon,

            color: theme.color,

            badge: theme.badge,

            title: theme.title,

            body,

            customerNote,

            bookingId:
                row["Booking ID"] || "",

            time: activityTime,

            relative:
                formatRelativeDate(activityTime)

        });

    });

    //--------------------------------------------------
    // Only Customer Note Exists
    //--------------------------------------------------

    if (

        activities.length === 0 &&

        customerNote

    ) {

        activities.push({

            icon: "📝",

            emoji: "📝",

            badge: "Customer Note",

            title: "Customer Note",

            color: "#64748b",

            body: customerNote,

            bookingId:
                row["Booking ID"],

            customerNote,

            time:
                row["Created Date"],

            relative:
                formatRelativeDate(

                    row["Created Date"]

                )

        });

    }

    //--------------------------------------------------

    return activities.reverse();

}

/*=========================================================
ACTIVITY CARD THEME
=========================================================*/

function getActivityCardTheme(text) {

    const t = text.toLowerCase();

    //--------------------------------------

    if (t.includes("phone") || t.includes("call")) {

        return {

            icon: "📞",
            badge: "Phone Call",
            title: "Phone Call",
            color: "#3b82f6"

        };

    }

    //--------------------------------------

    if (t.includes("whatsapp")) {

        return {

            icon: "💬",
            badge: "WhatsApp",
            title: "WhatsApp",
            color: "#22c55e"

        };

    }

    //--------------------------------------

    if (t.includes("payment")) {

        return {

            icon: "🎉",
            badge: "Payment",
            title: "Payment",
            color: "#f59e0b"

        };

    }

    //--------------------------------------

    if (
        t.includes("booking") ||
        t.includes("confirmed")
    ) {

        return {

            icon: "✈",
            badge: "Booking",
            title: "Booking Confirmed",
            color: "#8b5cf6"

        };

    }

    //--------------------------------------

    if (t.includes("follow")) {

        return {

            icon: "📅",
            badge: "Follow Up",
            title: "Follow Up",
            color: "#06b6d4"

        };

    }

    //--------------------------------------

    if (
        t.includes("issue") ||
        t.includes("problem")
    ) {

        return {

            icon: "⚠",
            badge: "Issue",
            title: "Customer Issue",
            color: "#ef4444"

        };

    }

    //--------------------------------------

    return {

        icon: "📝",
        badge: "Note",
        title: "CRM Note",
        color: "#64748b"

    };

}

/*=========================================================
ACTIVITY COUNT
=========================================================*/

function getCustomerActivityList(row) {

    return parseCustomerActivities(row);

}

/*=========================================================
ACTIVITY CENTER
=========================================================*/

function buildActivityFeed(row) {

    const activities =
        getCustomerActivityList(row);

    if (activities.length === 0) {

        return `

<div class="crmActivityEmpty">

No Activities Found

</div>

`;

    }

    return `

<div class="crmActivityCenter">

<div class="crmActivityHeader">

<div>

<div class="crmActivityTitle">

📋 Customer Activity Center

</div>

<div class="crmActivityCount">

${activities.length} Activities

</div>

</div>

</div>

<div class="crmActivityToolbar">

<input
type="text"
class="crmActivitySearch"
placeholder="🔍 Search activities..."
onkeyup="filterActivityCards(this.value)">

<div class="crmActivityFilters">

<button
class="crmActivityChip active"
onclick="filterActivityType('all',this)">

All

</button>

<button
class="crmActivityChip"
onclick="filterActivityType('call',this)">

📞

</button>

<button
class="crmActivityChip"
onclick="filterActivityType('whatsapp',this)">

💬

</button>

<button
class="crmActivityChip"
onclick="filterActivityType('follow',this)">

📅

</button>

<button
class="crmActivityChip"
onclick="filterActivityType('payment',this)">

💰

</button>

<button
class="crmActivityChip"
onclick="filterActivityType('booking',this)">

✈

</button>

<button
class="crmActivityChip"
onclick="filterActivityType('issue',this)">

⚠

</button>

</div>

</div>

    <div class="crmActivityFeed">

${activities.map((activity, index) =>

        renderActivityCard(activity, index, row)

    ).join("")}

    </div>

</div>

`;

}

function filterActivityCards(keyword) {

    keyword = keyword.toLowerCase();

    document
        .querySelectorAll(".crmActivityCard")
        .forEach(card => {

            const text =
                card.innerText.toLowerCase();

            card.style.display =
                text.includes(keyword)
                    ? ""
                    : "none";

        });

}

/*=========================================================
FILTER BY TYPE
=========================================================*/

function filterActivityType(type, btn) {

    document
        .querySelectorAll(".crmActivityChip")
        .forEach(x => x.classList.remove("active"));

    btn.classList.add("active");

    document
        .querySelectorAll(".crmActivityCard")
        .forEach(card => {

            if (type === "all") {

                card.style.display = "block";
                return;

            }

            const badge =
                card.querySelector(".crmActivityBadge")
                    ?.innerText
                    .toLowerCase() || "";

            let show = false;

            switch (type) {

                case "call":

                    show =
                        badge.includes("phone");

                    break;

                case "whatsapp":

                    show =
                        badge.includes("whatsapp");

                    break;

                case "follow":

                    show =
                        badge.includes("follow");

                    break;

                case "payment":

                    show =
                        badge.includes("payment");

                    break;

                case "booking":

                    show =
                        badge.includes("booking");

                    break;

                case "issue":

                    show =
                        badge.includes("issue");

                    break;

            }

            card.style.display =
                show
                    ? "block"
                    : "none";

        });

}

/*=========================================================
ACTIVITY CARD
=========================================================*/

function renderActivityCard(activity, index, row) {

    console.log(row);

    //--------------------------------------------------
    // Auto Inject Booking ID for Booking Activities
    //--------------------------------------------------

    let body = activity.body;

    //----------------------------------------------------
    // Customer Note
    //----------------------------------------------------

    if (

        activity.customerNote &&

        activity.body.trim() !== activity.customerNote.trim()

    ) {

        body += `

Customer Note :

${activity.customerNote}

`;

    }

    //----------------------------------------------------
    // Booking ID
    //----------------------------------------------------

    const bookingId =
        row["Booking ID"] ||
        row.bookingId ||
        "";

    if (bookingId) {

        //------------------------------------------------
        // Replace empty Booking ID
        //------------------------------------------------

        body = body.replace(

            /Booking\s*ID\s*:\s*$/im,

            `Booking ID : ${bookingId}`

        );

        //------------------------------------------------
        // If Booking ID doesn't exist, insert it
        //------------------------------------------------

        if (

            activity.title.toLowerCase().includes("booking") &&

            !/Booking\s*ID/i.test(body)

        ) {

            body =

                `Booking ID : ${bookingId}

${body}`;

        }

    }

    //--------------------------------------------------

    return `

<div
class="crmActivityCard"
style="border-left:4px solid ${activity.color};">

<div class="crmActivityCardHeader">

<div class="crmActivityCardLeft">

<div
class="crmActivityCardIcon"
style="
background:${activity.color}22;
color:${activity.color};
">

${activity.icon}

</div>

<div>

<div class="crmActivityCardTitle">

${activity.title}

</div>

<div class="crmActivityCardDate">

${activity.relative.day}

•

${activity.relative.time}

</div>

</div>

</div>

<div
class="crmActivityBadge"
style="
background:${activity.color}22;
color:${activity.color};
">

${activity.badge}

</div>

</div>

<div
id="activityBodyShort${index}"
class="crmActivityBodyShort">

${buildActivityPreview(body)}

</div>

<div
id="activityBodyFull${index}"
class="crmActivityBodyFull">

${formatActivityBody(body)}

</div>

${body.length > 180
            ? `

<button
class="crmActivityExpand"
onclick="toggleActivityCard(${index},this)">

▼ View Details

</button>

`
            : ""}

</div>

`;

}

/*=========================================================
ACTIVITY PREVIEW
=========================================================*/

function buildActivityPreview(text) {

    if (text.length <= 180)
        return formatActivityBody(text);

    return formatActivityBody(

        text.substring(0, 180) + "..."

    );

}

/*=========================================================
FORMAT BODY
=========================================================*/

function formatActivityBody(text) {

    return text

        .split("\n")

        .map(line => {

            if (line.includes(":")) {

                const parts = line.split(":");

                return `<div class="crmActivityLine">

<strong>${parts.shift()}:</strong>

${parts.join(":").trim()}

</div>`;

            }

            return `<div class="crmActivityLine">${line}</div>`;

        })

        .join("");

}

/*=========================================================
EXPAND CARD
=========================================================*/

function toggleActivityCard(index, btn) {

    const shortBody =

        document.getElementById(

            "activityBodyShort" + index

        );

    const fullBody =

        document.getElementById(

            "activityBodyFull" + index

        );

    if (

        fullBody.classList.contains(

            "open"

        )

    ) {

        fullBody.classList.remove("open");

        shortBody.style.display = "block";

        btn.innerHTML = "▼ View Details";

    }

    else {

        fullBody.classList.add("open");

        shortBody.style.display = "none";

        btn.innerHTML = "▲ Show Less";

    }

}

