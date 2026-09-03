let crmStatusReady = false;

/* ===========================================================
   CRM GLASS DRAWER V2
   PART 1 : GLOBAL VARIABLES
=========================================================== */

const CRM_DRAWER_V2 = {

    initialized: false,

    currentCustomer: null,

    currentRawData: null,

    statusList: [
        "New",
        "Pending",
        "Called",
        "WhatsApp Sent",
        "Follow Up",
        "Processing",
        "Confirmed",
        "Completed",
        "Cancelled"
    ]

};

/* ===========================================================
   FIELD MAP
=========================================================== */

const CRM_FIELD_MAP = {

    bookingId: [
        "Booking ID",
        "BookingID",
        "bookingId"
    ],

    customer: [
        "Name",
        "Customer",
        "Customer Name",
        "Passenger Name"
    ],

    phone: [
        "Phone",
        "Mobile",
        "Customer Mobile",
        "Contact"
    ],

    email: [
        "Email",
        "Mail"
    ],

    from: [
        "From",
        "Pickup",
        "Source"
    ],

    to: [
        "To",
        "Drop",
        "Destination"
    ],

    date: [
        "Travel Date",
        "Journey Date",
        "Date",
        "Date Time"
    ],

    passengers: [
        "Passengers",
        "Pax",
        "Travellers",
        "No of Pax"
    ],

    amount: [

        "Amount",
        "Fare",
        "Total",
        "Grand Total",
        "GrandTotal",
        "Net Amount",
        "Final Amount",
        "Price",
        "Revenue",
        "Booking Amount"

    ],

    status: [
        "Status",
        "STATUS",
        "status"
    ],

    notes: [
        "Notes",
        "Remarks",
        "Comments",
        "Requirement",
        "Message"
    ],

    priority: [
        "Priority"
    ],

    followUp: [
        "Next Follow Up",
        "Follow Up"
    ],

    assignedTo: [
        "Assigned To",
        "Executive",
        "Agent"
    ],

    service: [

        "Service",
        "SERVICE",
        "Type",
        "Category",
        "Booking Type",
        "Travel Type",
        "Module",
        "Product",
        "Package",
        "Vehicle"

    ],

};

/* ===========================================================
   INITIALIZE
=========================================================== */

function initCustomerDrawerV2() {

    if (CRM_DRAWER_V2.initialized) {
        return;
    }

    CRM_DRAWER_V2.initialized = true;

    const closeBtn = document.getElementById("crmGlassV2CloseBtn");

    if (closeBtn) {

        closeBtn.addEventListener("click", closeCustomerDrawerV2);

    }

    document.addEventListener("keydown", function (e) {

        if (e.key === "Escape") {

            closeCustomerDrawerV2();

        }

    });


}

/* ===========================================================
   OPEN DRAWER
=========================================================== */

function openCustomerDrawerV2() {

    const drawer = document.getElementById("customerDrawerV2");

    if (!drawer) return;

    drawer.classList.add("active");

}

document.addEventListener(

    "DOMContentLoaded",

    function () {

        initCRMKeyboardShortcuts();

    }

);

/* ===========================================================
   CLOSE DRAWER
=========================================================== */

function closeCustomerDrawerV2() {

    const drawer = document.getElementById("customerDrawerV2");

    if (!drawer) return;

    drawer.classList.remove("active");

}

function getDrawerContentV2() {

    return document.getElementById("crmGlassV2Content");

}

function safeValue(value, fallback = "-") {

    if (value === undefined) return fallback;

    if (value === null) return fallback;

    if (String(value).trim() === "") return fallback;

    return value;

}

function escapeHtml(value) {

    return String(value || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#39;");

}

function getField(item, aliases, fallback = "") {

    if (!item) return fallback;

    for (const key of aliases) {

        if (

            item[key] !== undefined &&

            item[key] !== null &&

            item[key] !== ""

        ) {

            return item[key];

        }

    }

    return fallback;

}

function getCustomerInitial(name) {

    return safeValue(name, "?")

        .trim()

        .charAt(0)

        .toUpperCase();

}

function getStatusClass(status) {

    return "crmGlassV2Status-" +

        safeValue(status, "new")

            .toLowerCase()

            .replace(/\s+/g, "-");

}

function buildStatusOptions(selectedStatus) {

    return CRM_DRAWER_V2.statusList.map(status => {

        return `
            <option value="${status}"
                ${status === selectedStatus ? "selected" : ""}>
                ${status}
            </option>
        `;

    }).join("");

}

/* ===========================================================
   NORMALIZE CUSTOMER
=========================================================== */

function normalizeCustomer(item) {

    if (!item) return null;

    const customer = {

        raw: item,

        bookingId: getField(item, CRM_FIELD_MAP.bookingId),

        name: safeValue(
            getField(item, CRM_FIELD_MAP.customer)
        ),

        phone: safeValue(
            getField(item, CRM_FIELD_MAP.phone)
        ),

        email: getField(item, CRM_FIELD_MAP.email),

        from: getField(item, CRM_FIELD_MAP.from),

        to: getField(item, CRM_FIELD_MAP.to),

        travelDate: safeValue(
            getField(item, CRM_FIELD_MAP.date)
        ),

        passengers: safeValue(
            getField(item, CRM_FIELD_MAP.passengers)
        ),

        amount: safeValue(
            getField(item, CRM_FIELD_MAP.amount)
        ),

        status: safeValue(
            getField(item, CRM_FIELD_MAP.status, "New"),
            "New"
        ),

        notes: getField(item, CRM_FIELD_MAP.notes),

        priority: (() => {

            const p = getField(item, CRM_FIELD_MAP.priority);

            return p ? String(p).trim() : "Normal";

        })(),

        followUp: getField(item, CRM_FIELD_MAP.followUp),

        assignedTo: getField(item, CRM_FIELD_MAP.assignedTo),

        service: getField(item, CRM_FIELD_MAP.service),

        // NEW
        source: safeValue(
            getField(item, [
                "Source",
                "Lead Source",
                "Customer Source"
            ]),
            "Direct"
        ),

        lastUpdated: safeValue(
            getField(item, [
                "Last Updated",
                "Updated On",
                "Modified"
            ]),
            ""
        ),

        revenue:

            Number(

                item.Revenue ||

                item["Revenue"] ||

                0

            ),

    };

    customer.latestActivity = getLatestActivity(item);

    /* -----------------------------------------
   Normalize according to Sheet
------------------------------------------*/

    const sheet = String(item._sheet || "").toLowerCase();


    /* -----------------------------------------
   NORMALIZE SERVICE
------------------------------------------*/

    switch (sheet) {

        case "air":
            customer.service = "Flight";
            break;

        case "train":
            customer.service = "Train";
            break;

        case "bus":
            customer.service = "Bus";
            break;

        case "car_bookings":
            customer.service = "Car";
            break;

        case "travel_leads":
            customer.service = "Package";
            break;

        case "premium_quote":
            customer.service = "Quote";
            break;

        default:
            customer.service =
                getField(item, CRM_FIELD_MAP.service) || "-";

    }

    /* ===============================
       CAR
    =============================== */

    if (sheet === "car_bookings") {


        customer.from = item.Location
            ? item.Location.split("→")[0].trim()
            : "-";

        customer.to = item.Location
            ? item.Location.split("→")[1].trim()
            : "-";

        customer.travelDate = item.Pickup || "";

        customer.amount =
            item.Revenue ||
            item["Estimated Fare"] ||
            0;

    }

    /* ===============================
       PACKAGE
    =============================== */

    else if (sheet === "travel_leads") {



        customer.from = item.Package || "-";

        customer.to = item["Travel Month"] || "-";

        customer.travelDate = item["Created Date"];

        customer.passengers =
            (Number(item.Adults || 0) +
                Number(item.Child || 0) +
                Number(item.Infant || 0));

    }

    /* ===============================
       PREMIUM QUOTE
    =============================== */

    else if (sheet === "premium_quote") {



        customer.from =
            item["Travel Month"] || "-";

        customer.to =
            item.Message || "-";

        customer.travelDate =
            item["Created Date"];

        customer.passengers =
            item.Travellers || "-";

        customer.amount =
            item["Estimated Revenue"] || 0;

    }

    customer.travelClass =
        getField(item, ["Class"]) ||
        getField(item, ["Cabin"]) ||
        "";

    customer.vehicle =
        getField(item, ["Vehicle"]) ||
        "";

    customer.packageName =
        getField(item, ["Package"]) ||
        "";

    customer.budget =
        getField(item, ["Budget"]) ||
        "";

    customer.message =
        getField(item, ["Message"]) ||
        "";

    customer.sheet =
        item._sheet || "";

    customer.avatar = getCustomerInitial(customer.name);

    customer.journey =

        customer.from && customer.to

            ? `${customer.from} → ${customer.to}`

            : customer.from || customer.to || "-";


    console.log("===== PRIORITY DEBUG =====");
    console.log(item._sheet);
    console.log("Raw Priority =", item["Priority"]);
    console.log("Mapped Priority =", customer.priority);

    return customer;

}

document.addEventListener("DOMContentLoaded", function () {

    initCustomerDrawerV2();

});

function getJourneyDetail(customer) {

    const sheet = (customer.sheet || "").toLowerCase();

    //--------------------------------------------------
    // Flight
    //--------------------------------------------------

    if (sheet === "air") {

        return {

            label: "Class",

            value: customer.travelClass || "Economy",

            icon: "💺"

        };

    }

    //--------------------------------------------------
    // Train
    //--------------------------------------------------

    if (sheet === "train") {

        return {

            label: "Class",

            value: customer.travelClass || "Economy",

            icon: "🚆"

        };

    }

    //--------------------------------------------------
    // Bus
    //--------------------------------------------------

    if (sheet === "bus") {

        return {

            label: "Class",

            value: customer.travelClass || "Sleeper",

            icon: "🚌"

        };

    }

    //--------------------------------------------------
    // Car
    //--------------------------------------------------

    if (sheet === "car_bookings") {

        return {

            label: "Vehicle",

            value: customer.vehicle || "-",

            icon: "🚗"

        };

    }

    //--------------------------------------------------
    // Package
    //--------------------------------------------------

    if (sheet === "travel_leads") {

        return {

            label: "Budget",

            value: customer.budget || "-",

            icon: "💰"

        };

    }

    //--------------------------------------------------
    // Premium Quote
    //--------------------------------------------------

    if (sheet === "premium_quote") {

        return {

            label: "Requirement",

            value: customer.message || "-",

            icon: "📝"

        };

    }

    //--------------------------------------------------

    return {

        label: "Details",

        value: "-",

        icon: "📄"

    };

}

function detectCustomerService(item) {

    if (!item) return "-";

    const explicit = getField(item, CRM_FIELD_MAP.service);

    if (explicit) {

        const s = explicit.toLowerCase();

        if (s.includes("car")) return "Car";
        if (s.includes("flight")) return "Flight";
        if (s.includes("air")) return "Flight";
        if (s.includes("train")) return "Train";
        if (s.includes("bus")) return "Bus";
        if (s.includes("package")) return "Package";

        return explicit;
    }

    const sheet = String(item._sheet || "").toLowerCase();

    if (sheet.includes("air"))
        return "Flight";

    if (sheet.includes("train"))
        return "Train";

    if (sheet.includes("bus"))
        return "Bus";

    if (sheet.includes("car"))
        return "Car";

    if (sheet.includes("travel"))
        return "Package";

    if (sheet.includes("premium"))
        return "Quote";

    return "-";
}

/* ===========================================================
   OPEN DRAWER
=========================================================== */

function openCustomerDrawerV2() {

    const drawer =
        document.getElementById(
            "customerDrawerV2"
        );

    if (!drawer) {
        console.error(
            "customerDrawerV2 not found."
        );
        return;
    }

    drawer.style.display = "flex";


    drawer.classList.add("active");

    document.body.classList.add(
        "crmGlassV2DrawerOpen"
    );

    animateDrawerOpen();
    handleDrawerResize();
    setTimeout(focusFirstControl, 250);

}

/* ===========================================================
   CLOSE DRAWER
=========================================================== */

function closeCustomerDrawerV2() {

    const drawer =
        document.getElementById("customerDrawerV2");

    if (!drawer) return;

    drawer.classList.remove("active");

    drawer.style.display = "none";

    document.body.classList.remove(
        "crmGlassV2DrawerOpen"
    );

}

/* ===========================================================
   OPEN CUSTOMER
=========================================================== */

async function openCustomerV2(item) {

    if (!item) {

        console.warn(
            "No customer data supplied."
        );

        return;

    }

    initCustomerDrawerV2();

    const customer =
        normalizeCustomer(item);

    console.log("========== RAW ROW ==========");
    console.table(item);

    console.log("========== NORMALIZED CUSTOMER ==========");
    console.log(customer);

    console.log("Current Sheet :", currentTab);

    if (!customer) {

        console.warn(
            "Unable to normalize customer."
        );

        return;

    }

    currentCustomerV2 = customer;

    /* -------------------------------------------------------
       Compatibility with Existing CRM
    ------------------------------------------------------- */

    currentCustomer =
        customer.raw;

    window.currentCustomer =
        customer.raw;

    window.selectedCustomer =
        customer.raw;

    openCustomerDrawerV2();

    const body =
        document.getElementById(
            "crmGlassV2Content"
        );

    if (!body) {

        console.error(
            "crmGlassV2Content not found."
        );

        return;

    }

    body.innerHTML =
        renderCustomerWorkspace(customer);




    // Reset Drawer State
    customerEditing = false;
    customerDirty = false;



    /*---------------------------------------
LOAD WORKFLOW
---------------------------------------*/

    const workflowService =
        getWorkflowService(customer);

    console.log(
        "Workflow Service :",
        workflowService
    );

    await loadWorkflow(
        workflowService
    );

    /*---------------------------------------
    LOAD BOOKING PROGRESS
    ---------------------------------------*/

    await loadBookingProgress(

        customer

    );

    /*---------------------------------------
    RENDER WORKFLOW
    ---------------------------------------*/

    const progressContainer =
        document.getElementById(
            "bookingProgressContainer"
        );

    if (progressContainer) {

        progressContainer.innerHTML =
            renderBookingWorkflow();

    }

    document
        .querySelectorAll(".bookingProgressSelect")
        .forEach(select => {

            updateProgressSelectColor(select);

            select.addEventListener("change", () => {

                updateProgressSelectColor(select);

            });

        });


    bindCustomerDrawerV2(customer);

    // Apply View Mode
    toggleCustomerEditing(false);

    updateSaveButton();

    initNotesCounter();

     /*---------------------------------------
    LOAD MODIFICATION REQUESTS
    ---------------------------------------*/

    await loadModificationRequests(customer);

}

/* ===========================================================
   OPEN CUSTOMER BY INDEX
=========================================================== */

function openCustomerByIndex(index) {

    if (
        !currentRows ||
        !currentRows[index]
    ) {

        return;

    }

    openCustomerV2(
        currentRows[index]
    );



}

/* ===========================================================
   BIND EVENTS
=========================================================== */

function bindCustomerDrawerV2(customer) {

    const saveBtn =
        document.getElementById(
            "saveCustomerBtn"
        );

    if (saveBtn) {

        saveBtn.onclick =
            saveCustomerUpdate;

    }

    const status =
        document.getElementById(
            "customerStatus"
        );

    if (status) {

        status.value =
            customer.status;

    }

    const notes =
        document.getElementById(
            "customerNotes"
        );

    if (notes) {

        notes.value =
            customer.notes || "";

    }



}

/* ===========================================================
   CLICK OUTSIDE
=========================================================== */

document.addEventListener(

    "click",

    function (e) {

        const drawer =
            document.getElementById(
                "customerDrawerV2"
            );

        if (!drawer) {
            return;
        }

        if (
            e.target === drawer
        ) {

            attemptCloseDrawer();

        }

    }

);

function getAvatarGradient(name) {

    if (!name) return "avatar-gray";

    const gradients = [

        "avatar-orange",
        "avatar-green",
        "avatar-purple",
        "avatar-red",
        "avatar-blue",
        "avatar-gold"

    ];

    let total = 0;

    for (let i = 0; i < name.length; i++) {

        total += name.charCodeAt(i);

    }

    return gradients[total % gradients.length];

}

/* ===========================================================
   PART 3
   MASTER WORKSPACE RENDERER
   Builds the complete CRM Glass Drawer V2
=========================================================== */

function renderCustomerWorkspace(customer) {

    if (!customer) {

        return `
            <div class="crmGlassV2Empty">
                No customer selected.
            </div>
        `;

    }

    return `

        <div class="crmGlassV2Workspace">

            <!-- Customer Header -->
            ${renderHeader(customer)}

            <!-- Profile Completion -->
            ${renderCustomerCompletion(customer)}

            <!-- Customer Snapshot -->
            ${renderCustomerSnapshot(customer)}

            <!-- Quick Actions -->
            ${renderActionBar(customer)}

            <!-- Booking Information -->
            <div class="crmGlassV2InfoGrid">

                <div>

                    ${renderSummary(customer)}

                </div>

                <div>

                    ${renderJourney(customer)}

                </div>

            </div>

<!-- CRM + Insights -->

<div class="crmCustomerWorkspaceGrid">

    <div class="crmCustomerWorkspaceLeft">

        ${renderCRMControls(customer)}

    </div>

    <div class="crmCustomerWorkspaceRight">

        ${renderCustomerInsights(customer)}

    </div>

</div>


<!-- Smart CRM Suggestions -->

${renderSmartCRMSuggestions(customer)}

<!-- Customer Notes -->

${renderNotes(customer)}

            <!-- Save -->
            ${renderSaveBar(customer)}

        </div>

    `;

}

/* ===========================================================
   PART 4
   RENDER HEADER
=========================================================== */

function renderHeader(customer) {

    if (!customer) return "";

    const statusClass = getStatusClass(customer.status);

    return `

<section class="crmGlassV2Header">

    <!-- LEFT -->

    <div class="crmGlassV2HeaderLeft">

        <div class="crmGlassV2Avatar ${getAvatarGradient(customer.name)}">

            ${escapeHtml(customer.avatar)}

        </div>

        <div class="crmGlassV2HeaderInfo">

            <!-- Name + Status -->

            <div class="crmGlassV2HeaderTop">

                <div class="crmGlassV2CustomerName">

                    ${escapeHtml(customer.name)}

                </div>

                <span class="crmGlassV2Badge ${statusClass}">

                    ${escapeHtml(customer.status)}

                </span>

            </div>

            <!-- Contact -->

            <div class="crmGlassV2HeaderContact">

                <span>

                    📞 ${escapeHtml(customer.phone || "-")}

                </span>

                ${customer.email ?

            `

                <span>

                    ✉ ${escapeHtml(customer.email)}

                </span>

                `

            : ""}

            </div>

            <!-- Chips -->

            <div class="crmGlassV2HeaderChips">

                ${customer.service ?

            `

                <span class="crmGlassMiniChip">

                    ${renderServiceChip(customer.service)}

                </span>

                `

            : ""}

                ${customer.bookingId ?

            `

                <span class="crmGlassMiniChip">

                    #${escapeHtml(customer.bookingId)}

                </span>

                `

            : ""}

            </div>

        </div>

    </div>

    <!-- RIGHT -->

    <div class="crmGlassV2HeaderRight">

        <span

            id="crmEditBadge"

            class="crmEditBadge">

            VIEW MODE

        </span>

        <button

            id="crmQuickEditBtn"

            class="crmQuickEditBtn"

            onclick="toggleCustomerEditing()">

            ✏ Enable Editing

        </button>

    </div>

</section>

`;

}

function updateEditingHeader(editing) {

    const header =
        document.querySelector(
            ".crmGlassV2Header"
        );

    if (!header) return;

    header.classList.toggle(
        "crmGlassV2Editing",
        editing
    );

}

function renderServiceChip(service) {

    const s = (service || "").toLowerCase();

    let css = "serviceDefault";
    let icon = "📋";

    if (s.includes("flight") || s.includes("air")) {

        css = "serviceFlight";
        icon = "✈️";

    }

    else if (s.includes("train")) {

        css = "serviceTrain";
        icon = "🚆";

    }

    else if (s.includes("bus")) {

        css = "serviceBus";
        icon = "🚌";

    }

    else if (s.includes("car")) {

        css = "serviceCar";
        icon = "🚖";

    }

    else if (s.includes("package")) {

        css = "servicePackage";
        icon = "🌴";

    }

    else if (s.includes("quote")) {

        css = "serviceQuote";
        icon = "📝";

    }

    return `

<span class="crmGlassV2ServiceChip ${css}">

${icon}
${escapeHtml(service)}

</span>

`;

}

/* ===========================================================
   PART 5
   RENDER SUMMARY
=========================================================== */

function renderSummary(customer) {

    if (!customer) {
        return "";
    }

    const amount = formatCurrency(customer.amount);

    return `

    <section class="crmGlassV2Section">

        <div class="crmGlassV2SectionTitle">

            📊 Booking Summary

        </div>

        <div class="crmGlassV2SummaryGrid">

            <!-- Booking -->

            <div class="crmGlassV2SummaryCard">

<div class="crmGlassV2SummaryIcon crmSummaryBooking">

🎫

</div>

                <div class="crmGlassV2SummaryBody">

                    <div class="crmGlassV2SummaryLabel">

                        Booking ID

                    </div>

                    <div class="crmGlassV2SummaryValue">

                        ${escapeHtml(customer.bookingId || "-")}

                    </div>

                </div>

            </div>

            <!-- Revenue -->

            <div class="crmGlassV2SummaryCard">

<div class="crmGlassV2SummaryIcon crmSummaryService">

${getSummaryServiceIcon(customer.service)}

</div>

    <div class="crmGlassV2SummaryBody">

        <div class="crmGlassV2SummaryLabel">

            Service

        </div>

        <div class="crmGlassV2SummaryValue">

            ${escapeHtml(customer.service)}

        </div>

    </div>

</div>

            <!-- Passengers -->

            <div class="crmGlassV2SummaryCard">

<div class="crmGlassV2SummaryIcon crmSummaryPassenger">

👥

</div>

                <div class="crmGlassV2SummaryBody">

                    <div class="crmGlassV2SummaryLabel">

                        Passengers

                    </div>

                    <div class="crmGlassV2SummaryValue">

                        ${escapeHtml(customer.passengers)}

                    </div>

                </div>

            </div>

            <!-- Status -->

            <div class="crmGlassV2SummaryCard">

<div class="crmGlassV2SummaryIcon crmSummaryAmount">

💰

</div>

                <div class="crmGlassV2SummaryBody">

<div class="crmGlassV2SummaryLabel">

Amount

</div>

<div class="crmGlassV2SummaryValue">

${amount}

</div>

                </div>

            </div>

        </div>

    </section>

    `;

}

function getSummaryServiceIcon(service) {

    const s = String(service || "").toLowerCase();

    if (s.includes("flight") || s.includes("air"))
        return "✈️";

    if (s.includes("train"))
        return "🚆";

    if (s.includes("bus"))
        return "🚌";

    if (
        s.includes("car") ||
        s.includes("cab") ||
        s.includes("suv") ||
        s.includes("taxi")
    )
        return "🚖";

    if (
        s.includes("package") ||
        s.includes("tour")
    )
        return "🌴";

    if (
        s.includes("quote")
    )
        return "📝";

    return "📋";
}

function formatCurrency(value) {

    if (value === null || value === undefined || value === "")
        return "-";

    const num = Number(
        String(value).replace(/,/g, "")
    );

    if (isNaN(num))
        return escapeHtml(value);

    return "₹ " + num.toLocaleString("en-IN");

}

/* ===========================================================
   PART 6
   RENDER JOURNEY
=========================================================== */

function renderJourney(customer) {


    console.log(customer.service);

    if (!customer) {
        return "";
    }

    const from = customer.from || "-";
    const to = customer.to || "-";

    const travelDate = formatTravelDate(customer.travelDate);

    const service = customer.service || "";

    const bookingSource = customer.bookingSource || "";

    const enquiryTime = customer.enquiryTime || "";

    const detail = getJourneyDetail(customer);

    return `

    <section class="crmGlassV2Section">

        <div class="crmGlassV2SectionTitle">

            ✈ Journey Information

        </div>

        <div class="crmGlassV2JourneyCard">

            <!-- Route -->

            <div class="crmGlassV2Route">

                <div class="crmGlassV2Location">

                    <span class="crmGlassV2LocationIcon">

                        📍

                    </span>

                    <span class="crmGlassV2LocationName">

                        ${escapeHtml(from)}

                    </span>

                </div>

                <div class="crmGlassV2RouteCenter">

                    <div class="crmGlassV2RouteLine"></div>

<div class="crmGlassV2Plane">

    ${getJourneyVehicleIcon(customer.service)}

</div>

                </div>

                <div class="crmGlassV2Location">

                    <span class="crmGlassV2LocationIcon">

                        📍

                    </span>

                    <span class="crmGlassV2LocationName">

                        ${escapeHtml(to)}

                    </span>

                </div>

            </div>

            <!-- Journey Details -->

            <div class="crmGlassV2JourneyMeta">

                <div class="crmGlassV2MetaItem">

                    <span class="crmGlassV2MetaIcon">

                        📅

                    </span>

                    <span>

                        ${escapeHtml(travelDate)}

                    </span>

                </div>

                ${service ? `
                <div class="crmGlassV2MetaItem">

    <span class="crmGlassV2MetaIcon">

        ${detail.icon}

    </span>

    <span>

        <strong>${detail.label}</strong><br>

        ${escapeHtml(detail.value)}

    </span>

</div>
                ` : ""}

                ${bookingSource ? `
                <div class="crmGlassV2MetaItem">

                    <span class="crmGlassV2MetaIcon">

                        🌐

                    </span>

                    <span>

                        ${escapeHtml(bookingSource)}

                    </span>

                </div>
                ` : ""}

                ${enquiryTime ? `
                <div class="crmGlassV2MetaItem">

                    <span class="crmGlassV2MetaIcon">

                        🕒

                    </span>

                    <span>

                        ${escapeHtml(enquiryTime)}

                    </span>

                </div>
                ` : ""}

            </div>

        </div>

    </section>

    `;

}

/* ===========================================================
   PART 7
   RENDER CRM CONTROLS
=========================================================== */

function renderCRMControls(customer) {

    if (!customer) {
        return "";
    }

    return `

    <section class="crmGlassV2Section">

        <div class="crmGlassV2SectionTitle">

            ⚙ CRM Management

        </div>

        <div class="crmGlassV2CRMCard">

            <!-- Status -->

            <div class="crmGlassV2Field">

                <label class="crmGlassV2Label">

                    Status

                </label>

<select
id="customerStatus"
class="crmGlassV2Select"
onchange="highlightStatusChip()">

                    ${buildStatusOptions(customer.status)}

                </select>

            </div>

            <!-- Follow Up -->

            <div class="crmGlassV2Field">

                <label class="crmGlassV2Label">

                    Next Follow Up

                </label>

                <input

                    type="date"

                    id="customerFollowUp"

                    class="crmGlassV2Input"

                    value="${escapeHtml(customer.followUp || "")}"

                >

            </div>

            <!-- Priority -->

            <div class="crmGlassV2Field">

                <label class="crmGlassV2Label">

                    Priority

                </label>

                <select

                    id="customerPriority"

                    class="crmGlassV2Select">

                    <option value="Low"
                        ${customer.priority === "Low" ? "selected" : ""}>
                        Low
                    </option>

                    <option value="Normal"
                        ${customer.priority === "Normal" ? "selected" : ""}>
                        Normal
                    </option>

                    <option value="High"
                        ${customer.priority === "High" ? "selected" : ""}>
                        High
                    </option>

                    <option value="Urgent"
                        ${customer.priority === "Urgent" ? "selected" : ""}>
                        Urgent
                    </option>

                </select>

            </div>

<!-- Revenue -->

<div class="crmGlassV2Field">

<label class="crmGlassV2Label">

Revenue

</label>

<input
type="number"
id="customerRevenue"
class="crmGlassV2Input"
placeholder="Enter Amount"
value="${customer.revenue || ""}"
disabled>

</div>





</div>



<!-- ======================================= -->
<!-- Quick Note Types -->
<!-- ======================================= -->

<div class="crmGlassV2Field">

<label class="crmGlassV2Label">

✍ Add New Note

</label>

<div class="crmNoteTypeToolbar">

${renderNoteTypeChip("📞", "Call")}

${renderNoteTypeChip("💬", "WhatsApp")}

${renderNoteTypeChip("📅", "Follow Up")}

${renderNoteTypeChip("🎉", "Payment")}

${renderNoteTypeChip("✈", "Booking")}

${renderNoteTypeChip("⚠", "Customer Issue")}

${renderNoteTypeChip("📝", "Custom")}

</div>

</div>

<textarea

id="customerNotes"

class="crmGlassV2Notes"

rows="4"

placeholder="Write today's update..."

></textarea>

<div class="crmGlassV2NotesFooter">

<div class="crmGlassV2NotesHint">

💡 Every save creates a new timeline entry.

</div>

<div
id="customerNotesCounter"
class="crmGlassV2NotesCounter">

0 Characters

</div>

    </section>

    `;

}



function highlightStatusChip() {

    const status =
        (document.getElementById("customerStatus")?.value || "")
            .trim()
            .toLowerCase();

    let chip = "";

    if (status.includes("call"))
        chip = "Call";

    else if (status.includes("whatsapp"))
        chip = "WhatsApp";

    else if (status.includes("follow"))
        chip = "Follow Up";

    else if (status.includes("confirm"))
        chip = "Booking";

    else if (status.includes("payment"))
        chip = "Payment";

    if (chip) {

        highlightNoteChip(chip);

    }

}

function renderNoteTypeChip(icon, title) {

    return `

<button
type="button"
id="noteChip_${title.replace(/\s/g, '')}"
class="crmNoteTypeChipV2"

onclick="insertNoteTemplate('${icon}','${title}')">

<div class="crmNoteChipIcon">

${icon}

</div>

<div class="crmNoteChipText">

${title}

</div>

</button>

`;

}

function highlightNoteChip(title) {

    document
        .querySelectorAll(".crmNoteTypeChipV2")
        .forEach(chip => {

            chip.classList.remove("crmNoteChipActive");

        });

    const id =
        "noteChip_" +
        title.replace(/\s+/g, "");

    const chip =
        document.getElementById(id);

    if (chip) {

        chip.classList.add("crmNoteChipActive");

    }

}

function insertNoteTemplate(icon, type) {

    const box =
        document.getElementById("customerNotes");

    if (!box) return;

    if (box.value.trim() !== "")
        return;

    let template = "";

    switch (type) {

        case "Call":

            template =
                `📞 Phone Call

Outcome :

Next Step :

`;

            break;

        case "WhatsApp":

            template =
                `💬 WhatsApp Sent

Message :

Customer Response :

`;

            break;

        case "Follow Up":

            template =
                `📅 Follow Up

Reason :

Follow-up Date :

`;

            break;

        case "Payment":

            template =
                `🎉 Payment Received

Amount :

Payment Mode :

`;

            break;

        case "Booking":

            template =
                `✈ Booking Confirmed

Booking ID :

Remarks :

`;

            break;

        case "Customer Issue":

            template =
                `⚠ Customer Issue

Problem :

Resolution :

`;

            break;

        default:

            template =
                `📝

`;

    }

    box.value = template;

    highlightNoteChip(type);

    box.focus();

    box.selectionStart =
        box.selectionEnd =
        box.value.length;

    updateCustomerNotesCounter();

}

function updateCustomerNotesCounter() {

    const box =
        document.getElementById("customerNotes");

    const counter =
        document.getElementById("customerNotesCounter");

    if (!box || !counter) return;

    counter.innerHTML =
        box.value.length + " Characters";

}



let currentNoteFilter = "All";

function filterNotes(type) {

    if (currentNoteFilter === type) {

        currentNoteFilter = "All";

    }

    else {

        currentNoteFilter = type;

    }

    openCustomerV2(currentCustomer);

}

function buildNotesHistory(notes) {

    if (!notes) {

        return {

            history: [],

            summary: {

                whatsapp: 0,

                phone: 0,

                followup: 0,

                confirmed: 0,

                completed: 0,

                total: 0

            }

        };

    }

    const summary = {

        whatsapp: 0,

        phone: 0,

        followup: 0,

        confirmed: 0,

        completed: 0,

        total: 0

    };

    const history = notes

        .split("-------------------------")

        .map(x => x.trim())

        .filter(Boolean)

        .map(block => {

            const lines = block

                .split("\n")

                .filter(Boolean);

            if (!lines.length)

                return null;

            const first = lines[0];

            const icon =

                first.match(/^[^\s]+/)?.[0] || "📝";

            const withoutIcon =

                first.replace(icon, "").trim();

            const dateMatch =

                withoutIcon.match(/\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/);

            const activityTime =

                dateMatch ? dateMatch[0] : "";

            const title =

                lines

                    .slice(1)

                    .join("\n")

                    .trim();

            const cleanTitle =

                title

                    .replace(/^📞\s*/, "")

                    .replace(/^💬\s*/, "")

                    .replace(/^📅\s*/, "")

                    .replace(/^✅\s*/, "")

                    .replace(/^🎉\s*/, "")

                    .replace(/^📝\s*/, "");

            const theme =

                getTimelineTheme(cleanTitle);

            switch (theme.badge) {

                case "WhatsApp":

                    summary.whatsapp++;

                    break;

                case "Phone":

                    summary.phone++;

                    break;

                case "Follow Up":

                    summary.followup++;

                    break;

                case "Confirmed":

                    summary.confirmed++;

                    break;

                case "Completed":

                    summary.completed++;

                    break;

            }

            summary.total++;

            const relative =

                formatRelativeDate(activityTime);

            return {

                title: cleanTitle,

                badge: theme.badge,

                color: theme.color,

                glow: theme.glow,

                displayIcon: theme.icon,

                day: relative.day,

                time: relative.time

            };

        })

        .filter(Boolean);

    return {

        history,

        summary

    };

}

function renderNoteCard(item) {

    return `

<div
class="crmGlassV2TimelineItem"

style="
border-left:4px solid ${item.color};
--timelineGlow:${item.glow};
">

<div class="crmMiniIcon">

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

<div
class="crmGlassV2TimelineTitle crmNoteText">

${formatNoteContent(item.title)}

</div>

</div>

</div>

`;

}

function renderCompactHistoryCard(item) {

    return `

<div class="crmCompactHistoryCard">

    <div class="crmCompactHistoryRow">

        <div class="crmCompactHistoryLeft">

            <span
            class="crmCompactHistoryIcon"
            style="color:${item.color};">

                ${item.displayIcon}

            </span>

            <span
            class="crmCompactHistoryBadge"
            style="
                background:${item.color}15;
                color:${item.color};
                border-color:${item.color}50;">

                ${item.badge}

            </span>

        </div>

        <div class="crmCompactHistoryTime">

            ${item.day} • ${item.time}

        </div>

    </div>

    <div class="crmCompactHistoryMessage">

        ${formatNoteContent(item.title)}

    </div>

</div>

`;

}

function formatNoteContent(text) {

    return text
        .split("\n")
        .filter(Boolean)
        .map(line => `

<div class="crmNoteCheck">

<div class="crmCheckIcon">

✓

</div>

<div>

${escapeHtml(line)}

</div>

</div>

`)
        .join("");

}

/* ===========================================================
   PART 8
   RENDER NOTES
=========================================================== */

function renderNotes(customer) {

    if (!customer)
        return "";

    const data =
        buildNotesHistory(customer.notes);

    let history =
        data.history;

    const summary =
        data.summary;

    //--------------------------------------------------
    // Apply Filter
    //--------------------------------------------------

    if (currentNoteFilter !== "All") {

        history = history.filter(item => {

            if (currentNoteFilter === "Total")
                return true;

            return item.badge === currentNoteFilter;

        });

    }

    //--------------------------------------------------
    // Latest + History
    //--------------------------------------------------

    const latest =

        history.length > 0

            ? history[history.length - 1]

            : null;

    const oldHistory =

        history.length > 1

            ? history.slice(0, history.length - 1).reverse()

            : [];

    return `

<section class="crmGlassV2Section">

    <div class="crmGlassV2SectionTitle">

        📝 Customer Notes

    </div>

    <!-- KPI SUMMARY -->

    <div class="crmNotesSummary">

        ${renderSummaryCard("WhatsApp", summary.whatsapp)}

        ${renderSummaryCard("Phone", summary.phone)}

        ${renderSummaryCard("Follow Up", summary.followup)}

        ${renderSummaryCard("Completed", summary.completed)}

        ${renderSummaryCard("Total", summary.total)}

    </div>

    <div class="crmCustomerNotesCard">

        <!-- ===================================== -->
        <!-- Latest -->
        <!-- ===================================== -->

        <div class="crmCustomerNotesHeading">

            ⭐ Latest Activity

        </div>

        ${latest
            ? renderNoteCard(latest)
            :
            `
                <div class="crmLatestNote">

                    No notes available

                </div>
                `
        }



        ${oldHistory.length
            ?

            `

            <div class="crmCustomerNotesDivider"></div>

            <button

                type="button"

                class="crmNotesHistoryBtn"

                onclick="toggleNotesHistory(this)">

                ▼ Previous Notes (${oldHistory.length})

            </button>

            <div class="crmNotesHistory">

${oldHistory

                .map(item => renderCompactHistoryCard(item))

                .join("")}

            </div>

            `

            :

            ""

        }

    </div>

</section>

`;

}

function renderSummaryCard(type, count) {

    let theme;

    switch (type) {

        case "WhatsApp":

            theme = getTimelineTheme("WhatsApp");

            break;

        case "Phone":

            theme = getTimelineTheme("Phone");

            break;

        case "Follow Up":

            theme = getTimelineTheme("Follow Up");

            break;

        case "Completed":

            theme = getTimelineTheme("Completed");

            break;

        default:

            theme = {

                icon: "📝",

                color: "#9ca3af",

                glow: "#6b7280",

                badge: "Total"

            };

    }

    return `

<div
class="crmSummaryBadge"

style="
background:${theme.color}15;
border:1px solid ${theme.color}55;
color:${theme.color};
box-shadow:0 0 15px ${theme.glow}22;
"

onclick="filterNotes('${type}')"

>

<div class="crmSummaryIcon">

${theme.icon}

</div>

<div class="crmSummaryText">

${theme.badge}

</div>

<div class="crmSummaryCount">

${count}

</div>

</div>

`;

}

function toggleNotesHistory(btn) {

    const history =
        btn.nextElementSibling;

    const expanded =
        history.classList.contains("show");

    if (expanded) {

        history.classList.remove("show");

        btn.innerHTML = "▼ View History";

    }

    else {

        history.classList.add("show");

        btn.innerHTML = "▲ Hide History";

    }

}

/* ===========================================================
   NOTES CHARACTER COUNTER
=========================================================== */

function initNotesCounter() {

    const textarea =
        document.getElementById(
            "customerNotes"
        );

    const counter =
        document.getElementById(
            "customerNotesCounter"
        );

    if (!textarea || !counter) {
        return;
    }

    const updateCounter = () => {

        counter.textContent =
            textarea.value.length +
            " Characters";

    };

    textarea.addEventListener(
        "input",
        updateCounter
    );

    updateCounter();

}


/* ===========================================================
   PART 9
   RENDER TIMELINE
   Reuses existing buildTimeline()
=========================================================== */

function renderTimeline(customer) {

    if (!customer) {
        return "";
    }

    let timelineHtml = "";

    try {

        if (
            typeof buildTimeline === "function"
        ) {

            timelineHtml =
                buildTimeline(customer.raw);

        }

    }
    catch (err) {

        console.error(
            "Timeline Error",
            err
        );

        timelineHtml =
            "<div class='crmGlassV2TimelineEmpty'>Unable to load timeline.</div>";

    }

    if (
        !timelineHtml ||
        timelineHtml.trim() === ""
    ) {

        timelineHtml =
            "<div class='crmGlassV2TimelineEmpty'>No timeline available.</div>";

    }



    return `

<section class="crmGlassV2Section">

    <div class="crmGlassV2SectionTitle">

        📅 Activity Timeline

    </div>

    <div class="crmGlassV2TimelineCard">

        <div class="crmGlassV2TimelineHeader">

            Customer Activity

        </div>

<div class="crmGlassV2TimelineBody crmGlassV2ModernTimeline">

    ${timelineHtml}

</div>

    </div>

</section>

`;

}

/* ===========================================================
   PART 10
   RENDER ACTION BAR
=========================================================== */

function renderActionBar(customer) {

    if (!customer) {
        return "";
    }

    const phone =
        escapeHtml(customer.phone || "");

    const bookingId =
        escapeHtml(customer.bookingId || "");

    return `

<section class="crmGlassV2Section">

    <div class="crmGlassV2SectionTitle">

        ⚡ Quick Actions

    </div>

    <div class="crmGlassV2ActionBar">

        <!-- Call -->

        <button
            type="button"
            class="crmGlassV2ActionBtn crmGlassV2CallBtn"
            onclick='callCustomer(currentCustomerV2.raw)'>

            <span class="crmGlassV2ActionIcon">

                📞

            </span>

            <span>

                Call

            </span>

        </button>

        <!-- WhatsApp -->

        <button
            type="button"
            class="crmGlassV2ActionBtn crmGlassV2WhatsappBtn"
            onclick='openWhatsappModal(currentCustomerV2.raw)'>

            <span class="crmGlassV2ActionIcon">

                💬

            </span>

            <span>

                WhatsApp

            </span>

        </button>

        <!-- View -->

<button

id="toggleEditBtn"

type="button"

class="crmGlassV2ActionBtn crmGlassV2ViewBtn"

onclick="toggleCustomerEditing()">

<span class="crmGlassV2ActionIcon">

✏

</span>

<span>

Enable Editing

</span>

</button>

        <!-- Copy -->

        <button
            type="button"
            class="crmGlassV2ActionBtn crmGlassV2CopyBtn"
            onclick="copyCustomer('${phone}')">

            <span class="crmGlassV2ActionIcon">

                🧾

            </span>

            <span>

                Invoice

            </span>

        </button>

    </div>

</section>

`;

}

/* ===========================================================
   OPTIONAL
=========================================================== */

function viewCustomerBooking(bookingId) {

    console.log("Booking :", bookingId);

}

/* ===========================================================
   PART 11
   RENDER SAVE BAR
=========================================================== */

function renderSaveBar(customer) {

    if (!customer) {
        return "";
    }

    const lastUpdated =
        customer.lastUpdated || "";

    return `

<section class="crmGlassV2Section">

    <div class="crmGlassV2SaveCard">

        <!-- Footer Buttons -->

        <div class="crmGlassV2FooterActions">

            <button

                type="button"

                class="crmGlassV2DeleteBtn"

                onclick="showDeleteModal(currentCustomerV2)">

                🗑 Delete Booking

            </button>

            <button

                id="saveCustomerBtn"

                type="button"

                class="crmGlassV2SaveBtn"

                disabled

                onclick="saveCustomerUpdate()">

                <span id="saveBtnText">

                    💾 Save Customer Update

                </span>

                

            </button>



        </div>

        <!-- Save Status -->

        <div
            id="saveMessage"
            class="crmGlassV2SaveMessage">

        </div>

        <!-- Last Updated -->

        ${lastUpdated ? `

        <div class="crmGlassV2LastUpdated">

            <span class="crmGlassV2LastUpdatedIcon">

                🕒

            </span>

            <span>

                Last Updated :
                ${escapeHtml(lastUpdated)}

            </span>

        </div>

        <div class="crmShortcutHint">

⌨

<span>

Ctrl+E Edit

</span>

•

<span>

Ctrl+S Save

</span>

•

<span>

Ctrl+N Note

</span>

•

<span>

Ctrl+M WhatsApp

</span>

•

<span>

Ctrl+P Call

</span>

</div>

        ` : ""}

    </div>

</section>

`;

}

/* ===========================================================
   PART 12
   SAVE CUSTOMER UPDATE
=========================================================== */

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

    if (!btn || !btnText || !msg) {

        console.error("Save controls not found.");

        return;

    }

    if (!currentCustomer) {

        msg.className =
            "crmGlassV2SaveMessage saveError";

        msg.innerHTML =
            "No customer selected.";

        return;

    }

    try {

        btn.disabled = true;

        btnText.innerHTML =
            "⏳ Saving...";

        msg.className =
            "crmGlassV2SaveMessage saveLoading";

        msg.innerHTML =
            "Saving customer...";

        /* ---------------------------------------
           Read Form Values
        --------------------------------------- */

        const status =
            document.getElementById(
                "customerStatus"
            )?.value || "";

        const newNote =
            document
                .getElementById("customerNotes")
                ?.value
                .trim() || "";

        const followUp =
            document.getElementById(
                "customerFollowUp"
            )?.value || "";

        const priority =
            document.getElementById(
                "customerPriority"
            )?.value || "";

        const revenue =
            Number(

                document.getElementById(

                    "customerRevenue"

                )?.value || 0

            );

        /* ---------------------------------------
           Save
        --------------------------------------- */

        const result =
            await saveCustomerCRM({

                sheet:
                    currentTab,

                bookingId:

                    currentCustomer["Booking ID"] ||

                    currentCustomer.bookingId ||

                    "",

                customer:

                    currentCustomer.Name ||

                    currentCustomer.Customer ||

                    currentCustomer["Customer Name"] ||

                    "",

                service:
                    currentTab,

                status:
                    status,

                notes: newNote,

                followUp:
                    followUp,

                priority:
                    priority,

                revenue:
                    revenue,

                activity:
                    status

            });

        /* ---------------------------------------
           Success
        --------------------------------------- */

        if (result.success) {

            msg.className =
                "crmGlassV2SaveMessage saveSuccess";

            msg.innerHTML =
                "✓ Customer Updated";

            btnText.innerHTML =
                "✓ Saved";

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

            const notesBox =
                document.getElementById("customerNotes");

            if (notesBox) {

                notesBox.value = "";

            }

            const counter =
                document.getElementById(
                    "customerNotesCounter"
                );

            if (counter) {

                counter.innerHTML = "0 Characters";

            }

            /* -----------------------------------
               Update Current Object
            ----------------------------------- */

            currentCustomer.Status = status;
            currentCustomer.status = status;

            currentCustomer.Notes = newNote;
            currentCustomer.notes = newNote;

            currentCustomer.Priority = priority;

            currentCustomer.Revenue =
                revenue;

            currentCustomer.revenue =
                revenue;

            currentCustomer["Next Follow Up"] =
                followUp;

            /* -----------------------------------
               Refresh Dashboard Card
            ----------------------------------- */

            if (
                typeof renderDashboard ===
                "function"
            ) {

                renderDashboard();

            }

            /* -----------------------------------
               Refresh Current Drawer
            ----------------------------------- */

            if (
                typeof openCustomerV2 ===
                "function"
            ) {

                setTimeout(function () {

                    openCustomerV2(
                        currentCustomer
                    );

                }, 300);

            }

            customerDirty = false;

            toggleCustomerEditing(false);

            return {
                success: true
            };

        }



        else {

            msg.className =
                "crmGlassV2SaveMessage saveError";

            msg.innerHTML =
                result.message ||

                result.error ||

                "Save failed.";

            return {
                success: false,
                error: result.error || result.message
            };

        }

    }

    catch (err) {

        console.error(err);

        msg.className =
            "crmGlassV2SaveMessage saveError";

        msg.innerHTML =
            err.message ||
            "Save failed.";

        return {
            success: false,
            error: err.message
        };

    }

    finally {

        btn.disabled = false;

        btnText.innerHTML =
            "💾 Save Customer Update";

    }

}


function updateCurrentRow() {

    if (!currentRows) return;

    const bookingId =
        currentCustomer["Booking ID"] ||
        currentCustomer.bookingId;

    const row =
        currentRows.find(r =>

            (r["Booking ID"] || r.bookingId) === bookingId

        );

    if (!row) return;

    row.Status =
        document.getElementById(
            "customerStatus"
        ).value;

    row.Notes =
        document.getElementById(
            "customerNotes"
        ).value;

    row.Priority =
        document.getElementById(
            "customerPriority"
        ).value;

    const revenue =
        document.getElementById(
            "customerRevenue"
        );

    if (revenue) {

        row.Revenue =
            Number(revenue.value);

    }

    row["Next Follow Up"] =
        document.getElementById(
            "customerFollowUp"
        ).value;

}

/* ===========================================================
   PART 13
   STATUS BADGE & UTILITY FUNCTIONS
=========================================================== */

/* -----------------------------------------------------------
   CRM Status Master List
----------------------------------------------------------- */

const CRM_STATUS_LIST = [

    "New",

    "Contacted",

    "Follow Up",

    "Quotation Sent",

    "WhatsApp Sent",


    "Processing",

    "Confirmed",

    "Completed",

    "Cancelled"

];

/* -----------------------------------------------------------
   Build Status Dropdown Options
----------------------------------------------------------- */

function buildStatusOptions(selectedStatus = "New") {

    return CRM_STATUS_LIST.map(status => {

        const selected =
            status === selectedStatus
                ? "selected"
                : "";

        return `

<option value="${escapeHtml(status)}" ${selected}>

    ${escapeHtml(status)}

</option>

`;

    }).join("");

}

/* -----------------------------------------------------------
   Status Badge
----------------------------------------------------------- */

function renderStatusBadge(status) {

    const cssClass =
        getStatusBadgeClass(status);

    return `

<span class="crmGlassV2StatusBadge ${cssClass}">

    ${escapeHtml(status || "New")}

</span>

`;

}

/* -----------------------------------------------------------
   Status CSS Class
----------------------------------------------------------- */

function getStatusBadgeClass(status) {

    status = (status || "").toLowerCase();

    switch (status) {

        case "new":

            return "crmGlassV2BadgeNew";

        case "pending":

            return "crmGlassV2BadgePending";

        case "called":

            return "crmGlassV2BadgeCalled";

        case "whatsapp sent":

            return "crmGlassV2BadgeWhatsapp";

        case "follow up":

            return "crmGlassV2BadgeFollow";

        case "processing":

            return "crmGlassV2BadgeProcessing";

        case "confirmed":

            return "crmGlassV2BadgeConfirmed";

        case "completed":

            return "crmGlassV2BadgeCompleted";

        case "cancelled":

            return "crmGlassV2BadgeCancelled";

        default:

            return "crmGlassV2BadgeNew";

    }

}

/* -----------------------------------------------------------
   Format Currency
----------------------------------------------------------- */

function formatCurrency(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-";

    }

    const number =
        Number(
            String(value)
                .replace(/,/g, "")
                .replace(/[^\d.-]/g, "")
        );

    if (isNaN(number)) {

        return escapeHtml(value);

    }

    return "₹ " + number.toLocaleString("en-IN");

}

/* -----------------------------------------------------------
   Format Date
----------------------------------------------------------- */

function formatDate(value) {

    if (!value) {

        return "-";

    }

    const date =
        new Date(value);

    if (isNaN(date.getTime())) {

        return escapeHtml(value);

    }

    return date.toLocaleDateString(

        "en-IN",

        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }

    );

}

/* -----------------------------------------------------------
   Safe Text
----------------------------------------------------------- */

function safeText(value, fallback = "-") {

    if (

        value === null ||

        value === undefined ||

        value === ""

    ) {

        return fallback;

    }

    return escapeHtml(value);

}

/* -----------------------------------------------------------
   Empty Value
----------------------------------------------------------- */

function isEmpty(value) {

    return (

        value === null ||

        value === undefined ||

        value === ""

    );

}

/* -----------------------------------------------------------
   Refresh Current Drawer
----------------------------------------------------------- */

function refreshCustomerDrawerV2() {

    if (!window.currentCustomer) {

        return;

    }

    openCustomerV2(window.currentCustomer);

}

/* -----------------------------------------------------------
   Close Drawer & Clear State
----------------------------------------------------------- */

function destroyCustomerDrawerV2() {

    currentCustomerV2 = null;

    closeCustomerDrawerV2();

}

/* ===========================================================
   PART 14
   ANIMATION
   EVENT BINDING
   RESPONSIVE HELPERS
=========================================================== */

/* -----------------------------------------------------------
   Animate Drawer Opening
----------------------------------------------------------- */

function animateDrawerOpen() {

    const drawer =
        document.getElementById(
            "customerDrawerV2"
        );

    if (!drawer) return;

    drawer.classList.add(
        "crmGlassV2Opening"
    );

    setTimeout(function () {

        drawer.classList.remove(
            "crmGlassV2Opening"
        );

    }, 350);

}

/* -----------------------------------------------------------
   Animate Drawer Closing
----------------------------------------------------------- */

function animateDrawerClose(callback) {

    const drawer =
        document.getElementById(
            "customerDrawerV2"
        );

    if (!drawer) {

        if (callback) callback();

        return;

    }

    drawer.classList.add(
        "crmGlassV2Closing"
    );

    setTimeout(function () {

        drawer.classList.remove(
            "crmGlassV2Closing"
        );

        if (callback) {

            callback();

        }

    }, 250);

}

/* -----------------------------------------------------------
   Focus First Input
----------------------------------------------------------- */

function focusFirstControl() {

    const drawer =
        document.getElementById(
            "customerDrawerV2"
        );

    if (!drawer) return;

    const control =
        drawer.querySelector(

            "select,input,textarea,button"

        );

    if (control) {

        control.focus({

            preventScroll: true

        });

    }

}

/* -----------------------------------------------------------
   Bind Drawer Events
----------------------------------------------------------- */

function bindCustomerDrawerV2(customer) {

    initNotesCounter();

    const status =
        document.getElementById(
            "customerStatus"
        );

    const revenue =
        document.getElementById(
            "customerRevenue"
        );

    if (status) {

        status.addEventListener(

            "change",

            function () {

                //------------------------------------------------
                // Status Badge
                //------------------------------------------------

                const badge =
                    document.querySelector(
                        ".crmGlassV2StatusBadge"
                    );

                if (badge) {

                    badge.className =
                        "crmGlassV2StatusBadge " +
                        getStatusBadgeClass(
                            this.value
                        );

                    badge.innerHTML =
                        escapeHtml(this.value);

                }

                //------------------------------------------------
                // Revenue Enable / Disable
                //------------------------------------------------

                if (!revenue) return;

                updateRevenueFieldState();

            }

        );

        //------------------------------------------------
        // Run once while opening drawer
        //------------------------------------------------

        status.dispatchEvent(
            new Event("change")
        );

    }

}

/* -----------------------------------------------------------
   Window Resize
----------------------------------------------------------- */

function handleDrawerResize() {

    const drawer =
        document.getElementById(
            "customerDrawerV2"
        );

    if (!drawer) return;

    if (

        window.innerWidth < 768

    ) {

        drawer.classList.add(

            "crmGlassV2Mobile"

        );

    }

    else {

        drawer.classList.remove(

            "crmGlassV2Mobile"

        );

    }

}

/* -----------------------------------------------------------
   Keyboard Shortcuts
----------------------------------------------------------- */

document.addEventListener(

    "keydown",

    function (e) {

        if (

            !document

                .getElementById(

                    "customerDrawerV2"

                )

                ?.classList

                .contains("active")

        ) {

            return;

        }

        /* ESC */

        if (

            e.key === "Escape"

        ) {

            attemptCloseDrawer();

        }

        /* CTRL + S */

        if (

            (e.ctrlKey || e.metaKey)

            &&

            e.key.toLowerCase() === "s"

        ) {

            e.preventDefault();

            saveCustomerUpdate();

        }

    }

);

/* -----------------------------------------------------------
   Responsive
----------------------------------------------------------- */

window.addEventListener(

    "resize",

    handleDrawerResize

);

/* -----------------------------------------------------------
   Open Override
----------------------------------------------------------- */

const _openDrawerV2 =
    openCustomerDrawerV2;

openCustomerDrawerV2 =
    function () {

        _openDrawerV2();

        animateDrawerOpen();

        handleDrawerResize();

        setTimeout(

            focusFirstControl,

            250

        );

    };

/* -----------------------------------------------------------
   Close Override
----------------------------------------------------------- */

const _closeDrawerV2 =
    closeCustomerDrawerV2;

closeCustomerDrawerV2 =
    function () {

        animateDrawerClose(function () {

            _closeDrawerV2();

        });

    };

/* -----------------------------------------------------------
   Initialize
----------------------------------------------------------- */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        initCustomerDrawerV2();

        handleDrawerResize();

    }

);

function getJourneyVehicleIcon(service) {

    if (!service) return "✈️";

    const s = service.toLowerCase();

    if (s.includes("air") || s.includes("flight"))
        return "✈️";

    if (s.includes("train"))
        return "🚆";

    if (s.includes("bus"))
        return "🚌";

    if (
        s.includes("car") ||
        s.includes("cab") ||
        s.includes("suv") ||
        s.includes("taxi") ||
        s.includes("innova")
    )
        return "🚖";

    if (
        s.includes("package") ||
        s.includes("tour")
    )
        return "🌴";

    if (s.includes("quote"))
        return "📝";

    return "📍";
}

function formatTravelDate(value) {

    if (!value) return "-";

    const d = new Date(value);

    if (isNaN(d)) return value;

    return d.toLocaleDateString(
        "en-IN",
        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }

    );

}

function renderCustomerSnapshot(customer) {

    if (!customer)
        return "";

    const health =
        getCustomerHealth(customer);

    const actions =
        getNextAction(customer);

    return `

<div class="crmSnapshotV3">

    <div class="crmSnapshotGridV3">

        <!-- Source -->

        <div class="crmSnapshotCardV3">

            <div class="crmSnapshotIconV3">

                ⭐

            </div>

            <div>

                <div class="crmSnapshotLabelV3">

                    Source

                </div>

                <div class="crmSnapshotValueV3">

                    ${escapeHtml(customer.source || "Direct")}

                </div>

            </div>

        </div>

        <!-- Updated -->

        <div class="crmSnapshotCardV3">

            <div class="crmSnapshotIconV3">

                🕒

            </div>

            <div>

                <div class="crmSnapshotLabelV3">

                    Updated

                </div>

                <div class="crmSnapshotValueV3">

                    ${formatSnapshotDate(customer.lastUpdated)}

                </div>

            </div>

        </div>

        <!-- Priority -->

        <div class="crmSnapshotCardV3">

            <div class="crmSnapshotIconV3">

                🏷

            </div>

            <div>

                <div class="crmSnapshotLabelV3">

                    Priority

                </div>

                <div class="crmSnapshotValueV3">

                    ${getPriorityBadge(customer.priority)}

                </div>

            </div>

        </div>

        <!-- Health -->

        <div class="crmSnapshotCardV3">

            <div class="crmSnapshotIconV3">

                ❤️

            </div>

            <div>

                <div class="crmSnapshotLabelV3">

                    Health

                </div>

                <div class="crmSnapshotValueV3">

                    <span class="${health.class}">

                        ${health.label}

                    </span>

                </div>

            </div>

        </div>

    </div>

    <div class="crmSnapshotActionsV3">

        <div class="crmSnapshotActionsTitleV3">

            ⚡ Suggested Next Action

        </div>

        <div class="crmSnapshotActionWrapV3">

            ${actions.map(action => `

                <span class="crmSnapshotActionChipV3 ${action.class}">

                    ${action.icon}

                    ${action.text}

                </span>

            `).join("")}

        </div>

    </div>

</div>

`;

}

function formatSnapshotDate(value) {

    if (!value) return "-";

    const d = new Date(value);

    if (isNaN(d))
        return value;

    return d.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}

function getPriorityBadge(priority) {

    const p = String(priority || "Normal").trim().toLowerCase();

    switch (p) {

        case "high":
            return '<span class="crmPriority crmPriorityHigh">High</span>';

        case "medium":
            return '<span class="crmPriority crmPriorityMedium">Medium</span>';

        case "low":
            return '<span class="crmPriority crmPriorityLow">Low</span>';

        case "normal":
        default:
            return '<span class="crmPriority crmPriorityNormal">Normal</span>';

    }

}

function getCustomerHealth(customer) {

    const status = String(customer.status || "").toLowerCase();

    const priority = String(customer.priority || "").toLowerCase();

    const revenue = Number(customer.amount || 0);

    //---------------------------------------------------
    // Days since last update
    //---------------------------------------------------

    let days = 999;

    if (customer.lastUpdated) {

        const last = new Date(customer.lastUpdated);

        if (!isNaN(last)) {

            days = Math.floor(

                (Date.now() - last.getTime()) /

                (1000 * 60 * 60 * 24)

            );

        }

    }

    //---------------------------------------------------
    // HOT
    //---------------------------------------------------

    if (

        status.includes("completed") ||

        status.includes("confirmed") ||

        revenue >= 5000

    ) {

        return {

            label: "🔥 Hot Lead",

            class: "crmHealthHot"

        };

    }

    //---------------------------------------------------
    // WARM
    //---------------------------------------------------

    if (

        status.includes("follow") ||

        status.includes("called") ||

        priority === "high" ||

        priority === "medium"

    ) {

        return {

            label: "🟡 Warm Lead",

            class: "crmHealthWarm"

        };

    }

    //---------------------------------------------------
    // NEW
    //---------------------------------------------------

    if (

        status === "new" &&

        days <= 7

    ) {

        return {

            label: "⚪ New Lead",

            class: "crmHealthNew"

        };

    }

    //---------------------------------------------------
    // COLD
    //---------------------------------------------------

    if (

        days > 15 &&

        !status.includes("completed")

    ) {

        return {

            label: "🔴 Cold Lead",

            class: "crmHealthCold"

        };

    }

    //---------------------------------------------------
    // Default

    return {

        label: "🟡 Warm Lead",

        class: "crmHealthWarm"

    };

}

function getNextAction(customer) {

    const status =
        String(customer.status || "")
            .trim()
            .toLowerCase();

    const revenue =
        Number(customer.amount || 0);

    const latest =
        customer.latestActivity || "NOTE";

    const actions = [];

    //---------------------------------------------------
    // BUSINESS STATUS
    //---------------------------------------------------

    // Completed booking
    if (status === "completed") {

        actions.push({

            icon: "✅",

            text: "Booking Complete",

            class: "crmActionDone"

        });

    }

    // Confirmed booking
    else if (status === "confirmed") {

        actions.push({

            icon: "🎫",

            text: "Booking Confirmed",

            class: "crmActionConfirmed"

        });

    }

    //---------------------------------------------------
    // PAYMENT
    //---------------------------------------------------

    if (

        revenue <= 0 &&

        (
            status === "confirmed" ||
            status === "completed"
        )

    ) {

        actions.push({

            icon: "💰",

            text: "Collect Payment",

            class: "crmActionPayment"

        });

    }

    //---------------------------------------------------
    // If booking already confirmed/completed,
    // don't show communication actions.
    //---------------------------------------------------

    if (actions.length > 0) {

        return actions;

    }

    //---------------------------------------------------
    // COMMUNICATION WORKFLOW
    //---------------------------------------------------

    switch (latest) {

        case "PHONE":

            actions.push({

                icon: "💬",

                text: "Send WhatsApp",

                class: "crmActionWhatsapp"

            });

            break;

        case "WHATSAPP":

            actions.push({

                icon: "📅",

                text: "Follow Up Today",

                class: "crmActionFollow"

            });

            break;

        case "FOLLOWUP":

            actions.push({

                icon: "📞",

                text: "Call Customer",

                class: "crmActionCall"

            });

            break;

    }

    //---------------------------------------------------
    // NEW LEAD
    //---------------------------------------------------

    if (

        actions.length === 0 &&

        status === "new"

    ) {

        actions.push({

            icon: "📞",

            text: "Call Customer",

            class: "crmActionCall"

        });

    }

    //---------------------------------------------------
    // DEFAULT
    //---------------------------------------------------

    if (actions.length === 0) {

        actions.push({

            icon: "⭐",

            text: "Monitor Lead",

            class: "crmActionDefault"

        });

    }

    return actions;

}

/* ==========================================================
   CRM Keyboard Productivity
========================================================== */

function initCRMKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        crmKeyboardHandler
    );

}

function crmKeyboardHandler(e) {

    //--------------------------------------------------
    // Only when Customer Drawer is open
    //--------------------------------------------------

    if (!currentCustomer)
        return;

    //--------------------------------------------------
    // Ignore typing inside controls
    //--------------------------------------------------

    const tag =
        document.activeElement.tagName;

    if (

        tag === "INPUT" ||

        tag === "TEXTAREA" ||

        tag === "SELECT"

    ) {

        return;

    }

    //--------------------------------------------------
    // CTRL + E
    //--------------------------------------------------

    if (

        e.ctrlKey &&

        e.key.toLowerCase() === "e"

    ) {

        e.preventDefault();

        if (

            typeof toggleCustomerEditing ===

            "function"

        ) {

            toggleCustomerEditing(true);

        }

        return;

    }

    //--------------------------------------------------
    // CTRL + S
    //--------------------------------------------------

    if (

        e.ctrlKey &&

        e.key.toLowerCase() === "s"

    ) {

        e.preventDefault();

        if (

            typeof saveCustomerUpdate ===

            "function"

        ) {

            saveCustomerUpdate();

        }

        return;

    }

    //--------------------------------------------------
    // CTRL + N
    //--------------------------------------------------

    if (

        e.ctrlKey &&

        e.key.toLowerCase() === "n"

    ) {

        e.preventDefault();

        const notes =

            document.getElementById(

                "customerNotes"

            );

        if (notes) {

            notes.focus();

        }

        return;

    }

    //--------------------------------------------------
    // CTRL + W
    //--------------------------------------------------

    if (

        e.ctrlKey &&

        e.key.toLowerCase() === "m"

    ) {

        e.preventDefault();

        if (

            typeof openWhatsappModal ===

            "function"

        ) {

            openWhatsappModal(currentCustomerV2.raw);

        }

        return;

    }

    //--------------------------------------------------
    // CTRL + P
    //--------------------------------------------------

    if (

        e.ctrlKey &&

        e.key.toLowerCase() === "p"

    ) {

        e.preventDefault();

        if (

            typeof callCustomer ===

            "function"

        ) {

            callCustomer(currentCustomerV2.raw);

        }

        return;

    }

    //--------------------------------------------------
    // CTRL + D
    //--------------------------------------------------

    if (

        e.ctrlKey &&

        e.key.toLowerCase() === "d"

    ) {

        e.preventDefault();

        if (

            typeof showDeleteModal ===

            "function"

        ) {

            showDeleteModal(currentCustomerV2);

        }

        return;

    }

}