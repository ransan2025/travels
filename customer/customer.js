/*=========================================================
CUSTOMER PORTAL
Version : 1.0
=========================================================*/

"use strict";

/*=========================================================
APPLICATION
=========================================================*/

const CustomerPortal = {

    /*---------------------------------------------
    Application
    ---------------------------------------------*/

    appName: "Customer Travel Portal",

    version: "1.0.0",

    debug: true,

    environment: "LIVE",

    apiUrl: "",

    /*---------------------------------------------
    Customer
    ---------------------------------------------*/

    customer: null,

    customerToken: null,

    customerPhone: null,

    customerName: null,

    /*---------------------------------------------
    Booking
    ---------------------------------------------*/

    currentBooking: null,

    bookings: [],

    bookingProgress: {},

    workflow: [],

    /*---------------------------------------------
    Documents
    ---------------------------------------------*/

    documents: [],

    voucher: null,

    invoice: null,

    /*---------------------------------------------
    Payment
    ---------------------------------------------*/

    payment: {

        total: 0,

        paid: 0,

        balance: 0,

        status: "Pending"

    },

    /*---------------------------------------------
    Timeline
    ---------------------------------------------*/

    timeline: [],

    /*---------------------------------------------
    Request
    ---------------------------------------------*/

    customerRequest: "",

    /*---------------------------------------------
    Flags
    ---------------------------------------------*/

    authenticated: false,

    loading: true,

    initialized: false

};

/*=========================================================
DOM CACHE
=========================================================*/

const PortalDOM = {

    loading:

        document.getElementById(
            "portalLoading"
        ),

    auth:

        document.getElementById(
            "portalAuth"
        ),

    dashboard:

        document.getElementById(
            "portalDashboard"
        ),

    header:

        document.getElementById(
            "portalHeader"
        ),

    bookings:

        document.getElementById(
            "myBookingsContainer"
        ),

    details:

        document.getElementById(
            "bookingDetailsContainer"
        )

};

/*=========================================================
CONFIGURATION
=========================================================*/

const PortalConfig = {

    animationDuration: 400,

    loadingDelay: 800,

    defaultCurrency: "₹",

    defaultDateFormat: "DD MMM YYYY",

    supportNumber:

        "+91 9967219563",

    companyName:

        "Travel CRM"

};

/*=========================================================
ICONS
=========================================================*/

const PortalIcons = {

    air: "✈",

    hotel: "🏨",

    driver: "🚖",

    document: "📄",

    visa: "🛂",

    payment: "💳",

    voucher: "🎫",

    insurance: "🧳",

    support: "📞",

    booking: "📋",

    timeline: "🕒",

    completed: "🟢",

    pending: "🔴",

    progress: "🟡"

};

const SERVICE_CONFIG = {

    Flight: {
        icon: "✈",
        color: "#3B82F6"
    },

    Train: {
        icon: "🚆",
        color: "#10B981"
    },

    Bus: {
        icon: "🚌",
        color: "#F59E0B"
    },

    Car: {
        icon: "🚖",
        color: "#8B5CF6"
    },

    Package: {
        icon: "🏖",
        color: "#EC4899"
    },

    "Premium Quote": {
        icon: "💎",
        color: "#FACC15"
    }

};

/*=========================================================
HELPERS
=========================================================*/

function logPortal(...args) {

    if (CustomerPortal.debug) {

        console.log(

            "[Customer Portal]",

            ...args

        );

    }

}

function errorPortal(...args) {

    console.error(

        "[Customer Portal]",

        ...args

    );

}

/*=========================================================
URL PARAMETERS
=========================================================*/

function getPortalParameter(name) {

    const params =

        new URLSearchParams(

            window.location.search

        );

    return params.get(name);

}

/*=========================================================
LOADING
=========================================================*/

function showLoading(message = "Loading your booking...") {

    CustomerPortal.loading = true;

    if (PortalDOM.loading) {

        PortalDOM.loading.classList.remove("hidden");

        const sub = PortalDOM.loading.querySelector(
            ".portalLoadingSub"
        );

        if (sub) {

            sub.innerHTML = message;

        }

    }

}

function hideLoading() {

    CustomerPortal.loading = false;

    if (PortalDOM.loading) {

        PortalDOM.loading.classList.add("hidden");

    }

}

/*=========================================================
AUTH PLACEHOLDER
=========================================================*/

function showAuthPlaceholder() {

    if (PortalDOM.auth) {

        PortalDOM.auth.classList.remove("hidden");

    }

    if (PortalDOM.dashboard) {

        PortalDOM.dashboard.classList.add("hidden");

    }

}

function hideAuthPlaceholder() {

    if (PortalDOM.auth) {

        PortalDOM.auth.classList.add("hidden");

    }

}

/*=========================================================
DASHBOARD
=========================================================*/

function showDashboard() {

    if (PortalDOM.dashboard) {

        PortalDOM.dashboard.classList.remove("hidden");

    }

}

function hideDashboard() {

    if (PortalDOM.dashboard) {

        PortalDOM.dashboard.classList.add("hidden");

    }

}

/*=========================================================
AUTHENTICATION
=========================================================*/

async function authenticateCustomer() {

    logPortal("Authenticating...");

    return new Promise(resolve => {

        setTimeout(function () {

            CustomerPortal.authenticated = true;

            resolve(true);

        }, 1000);

    });

}

/*=========================================================
BOOTSTRAP
=========================================================*/

async function initCustomerPortal() {

    logPortal("Initializing Portal...");

    if (CustomerPortal.initialized) {

        return;

    }

    CustomerPortal.initialized = true;

    showLoading();

    hideDashboard();

    hideAuthPlaceholder();

    try {

        const success = await authenticateCustomer();

        if (!success) {

            throw new Error(
                "Authentication Failed"
            );

        }

        hideLoading();

        showDashboard();

        logPortal("Portal Ready");

    }

    catch (err) {

        errorPortal(err);

        hideLoading();

        showAuthPlaceholder();

    }

}

/*=========================================================
APPLICATION START
=========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    function () {

        logPortal(

            CustomerPortal.appName,

            CustomerPortal.version

        );

        initCustomerPortal();

    }

);

/*=========================================================
SERVICE ICON MAPPER
=========================================================*/

function getServiceIcon(service) {

    if (!service) {

        return "📋";

    }

    const icons = {

        /*-----------------------------------
        Travel Services
        -----------------------------------*/

        Flight: "✈",

        Air: "✈",

        Train: "🚆",

        Bus: "🚌",

        Car: "🚖",

        Package: "🏖",

        Travel: "🏖",

        "Premium Quote": "💎",

        Premium: "💎",

        Quote: "💎",

        /*-----------------------------------
        Future Services
        -----------------------------------*/

        Visa: "🛂",

        Hotel: "🏨",

        Insurance: "🧳",

        Passport: "📘",

        Cruise: "🚢",

        Forex: "💱"

    };

    return icons[service] || "📋";

}

/*=========================================================
STATUS BADGE MAPPER
=========================================================*/

function getStatusBadge(status) {

    if (!status) {

        return `

        <span class="portalStatusBadge portalStatusGray">

            Unknown

        </span>

        `;

    }

    switch (status) {

        case "New":

            return `

            <span class="portalStatusBadge portalStatusBlue">

                🔵 New

            </span>

            `;

        case "Pending":

            return `

            <span class="portalStatusBadge portalStatusRed">

                🔴 Pending

            </span>

            `;

        case "Called":

            return `

            <span class="portalStatusBadge portalStatusPurple">

                📞 Called

            </span>

            `;

        case "WhatsApp Sent":

            return `

            <span class="portalStatusBadge portalStatusGreen">

                💬 WhatsApp

            </span>

            `;

        case "Follow Up":

            return `

            <span class="portalStatusBadge portalStatusOrange">

                📅 Follow Up

            </span>

            `;

        case "Processing":

            return `

            <span class="portalStatusBadge portalStatusYellow">

                ⚙ Processing

            </span>

            `;

        case "Confirmed":

            return `

            <span class="portalStatusBadge portalStatusGreen">

                ✅ Confirmed

            </span>

            `;

        case "Completed":

            return `

            <span class="portalStatusBadge portalStatusSuccess">

                🎉 Completed

            </span>

            `;

        case "Cancelled":

            return `

            <span class="portalStatusBadge portalStatusRed">

                ❌ Cancelled

            </span>

            `;

        default:

            return `

            <span class="portalStatusBadge portalStatusGray">

                ${status}

            </span>

            `;

    }

}

/*=========================================================
BOOKING ACTION BUTTONS
=========================================================*/

function renderBookingActions(booking) {

    return `

    <div class="bookingActions">

        <button
            class="bookingGlassBtn bookingPrimaryBtn"
            onclick="viewBooking('${booking.bookingId}')">

            👁 View Details

        </button>

        <button
            class="bookingGlassBtn bookingSecondaryBtn"
            onclick="downloadVoucher('${booking.bookingId}')">

            🎫 Voucher

        </button>

        <button
            class="bookingGlassBtn bookingSuccessBtn"
            onclick="payBooking('${booking.bookingId}')">

            💳 Pay

        </button>

    </div>

    `;

}

/*=========================================================
WORKFLOW SUMMARY STRIP
=========================================================*/

function renderWorkflowSummary(progress = {}) {

    const workflowIcons = {

        Ticket: "✈",

        Hotel: "🏨",

        Driver: "🚖",

        Documents: "📄",

        Visa: "🛂",

        "Payment Status": "💳",

        Voucher: "🎫",

        Insurance: "🧳"

    };

    let html = "";

    Object.keys(progress).forEach(step => {

        const value = progress[step] || "";

        let css = "workflowGray";

        switch (value) {

            case "Completed":

            case "Driver Assigned":

            case "Ticket Issued":

            case "Voucher Shared":

            case "Visa Approved":

            case "All Received":

                css = "workflowGreen";
                break;

            case "In Progress":

            case "Processing":

            case "Availability Checking":

            case "Vendor Contacted":

            case "Fare Blocked":

            case "Waiting for Airline Confirmation":

                css = "workflowYellow";
                break;

            case "Partial":

                css = "workflowOrange";
                break;

            case "Refunded":

                css = "workflowBlue";
                break;

            case "Pending":

            case "Driver Not Assigned":

            case "Ticket Not Booked":

            case "Visa Not Applied":

            case "Customer Has Not Submitted":

            case "Voucher Not Created":

                css = "workflowRed";
                break;

        }

        html += `

        <div class="workflowStep">

            <span class="workflowIcon">

                ${workflowIcons[step] || "📌"}

            </span>

            <span class="workflowDot ${css}"></span>

        </div>

        `;

    });

    return `

    <div class="bookingWorkflowSummary">

        ${html}

    </div>

    `;

}

/*=========================================================
BOOKING CARD TEMPLATE
=========================================================*/

/*=========================================================
BOOKING CARD
FINAL ASSEMBLY
=========================================================*/

function renderBookingCard(booking) {

    if (!booking) {

        return "";

    }

    return `

    <div class="customerBookingCard"

         data-booking="${booking.bookingId || ""}">

        <!--========================================
        HEADER
        ========================================-->

        <div class="bookingCardHeader">

            <div class="bookingService">

                ${getServiceIcon(booking.service)}

                <span>

                    ${booking.service || "Booking"}

                </span>

            </div>

            <div>

                ${getStatusBadge(

        booking.status

    )}

            </div>

        </div>

        <!--========================================
        BOOKING ID
        ========================================-->

        <div class="bookingInfoRow">

            <span class="bookingLabel">

                Booking ID

            </span>

            <span class="bookingValue">

                ${booking.bookingId || "-"}

            </span>

        </div>

        <!--========================================
        CUSTOMER
        ========================================-->

        <div class="bookingCustomer">

            👤

            ${booking.customerName || "-"}

        </div>

        <!--========================================
        ROUTE
        ========================================-->

        <div class="bookingRoute">

            📍

            ${booking.route || "-"}

        </div>

        <!--========================================
        DATE
        ========================================-->

        <div class="bookingTravelDate">

            📅

            ${booking.travelDate || "-"}

        </div>

        <!--========================================
        PAYMENT SUMMARY
        ========================================-->

        <div class="bookingPaymentSummary">

            <div class="paymentBox">

                <small>Total</small>

                <strong>

                    ${booking.totalAmount || "₹0"}

                </strong>

            </div>

            <div class="paymentBox">

                <small>Paid</small>

                <strong>

                    ${booking.paidAmount || "₹0"}

                </strong>

            </div>

            <div class="paymentBox">

                <small>Balance</small>

                <strong>

                    ${booking.balanceAmount || "₹0"}

                </strong>

            </div>

        </div>

        <!--========================================
        WORKFLOW
        ========================================-->

        ${renderWorkflowSummary(

        booking.progress || {}

    )}

        <!--========================================
        ACTIONS
        ========================================-->

        ${renderBookingActions(

        booking

    )}

    </div>

    `;

}


/*=========================================================
BOOKING ACTIONS
=========================================================*/

/*====================================================
VIEW BOOKING
Open Booking Details Panel
====================================================*/

function viewBooking(bookingId) {

    if (!bookingId) {

        return;

    }

    /*------------------------------------------
    Find Booking
    ------------------------------------------*/

    const booking =

        (window.customerBookings || [])

            .find(function (item) {

                return String(item.bookingId) === String(bookingId);

            });

    if (!booking) {

        console.warn(

            "Booking not found:",

            bookingId

        );

        return;

    }

    /*------------------------------------------
    Store Current Booking
    ------------------------------------------*/

    window.selectedBooking = booking;
    window.currentModificationBooking = booking;

    /*------------------------------------------
    Highlight Selected Card
    ------------------------------------------*/

    document

        .querySelectorAll(

            ".customerBookingCard"

        )

        .forEach(function (card) {

            card.classList.remove(

                "selectedBooking"

            );

        });

    const selectedCard =

        document.querySelector(

            `.customerBookingCard[data-booking="${bookingId}"]`

        );

    if (selectedCard) {

        selectedCard.classList.add(

            "selectedBooking"

        );

    }

    /*------------------------------------------
    Render Details
    ------------------------------------------*/

    showBookingDetails(booking);

    /*------------------------------------------
    Scroll Right Panel to Top
    ------------------------------------------*/

    const rightPanel =

        document.querySelector(

            ".portalRight"

        );

    if (rightPanel) {

        rightPanel.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    /*------------------------------------------
    Update Browser Title (Optional)
    ------------------------------------------*/

    document.title =

        `Booking ${booking.bookingId} - Customer Portal`;

}

function downloadVoucher(bookingId) {

    console.log(

        "Download Voucher",

        bookingId

    );

    // Future
    // Download PDF

}

/*=========================================================
PAY BOOKING
=========================================================*/

function payBooking(bookingId) {

    if (!bookingId) {

        alert(
            "Invalid Booking."
        );

        return;

    }

    const booking =

        CustomerPortal.bookings.find(

            b => b.bookingId == bookingId

        );

    if (!booking) {

        alert(
            "Booking not found."
        );

        return;

    }

    /*---------------------------------------
    Already Paid?
    ---------------------------------------*/

    const balance =

        Number(

            String(

                booking.balanceAmount || 0

            ).replace(/[^\d.-]/g, "")

        );

    if (balance <= 0) {

        alert(

            "This booking is already fully paid."

        );

        return;

    }

    /*---------------------------------------
    Future Payment Gateway
    ---------------------------------------*/

    console.log(

        "Opening Payment",

        booking

    );

    /*---------------------------------------
    TODO
    Replace this later with:

    • Razorpay Checkout
    • UPI Deep Link
    • QR Code Popup
    • Payment Gateway

    ---------------------------------------*/

    alert(

        "Online payment will be available soon.\n\n" +

        "Booking : " + booking.bookingId +

        "\nCustomer : " + booking.customerName +

        "\nBalance : ₹" + booking.balanceAmount

    );

}

/*=========================================================
RENDER BOOKINGS LIST
=========================================================*/

function renderBookingList(bookings = []) {

    const container =
        document.getElementById(
            "bookingListContainer"
        );

    /*--------------------------------------
Store Booking List Globally
--------------------------------------*/

    window.customerBookings = bookings;

    const empty =
        document.getElementById(
            "bookingEmpty"
        );

    if (!container) {

        return;

    }

    container.innerHTML = "";

    /*--------------------------------------
    No bookings
    --------------------------------------*/

    if (!bookings.length) {

        if (empty) {

            empty.classList.remove("hidden");

            empty.innerHTML = `

            <div class="portalGlass portalEmptyCard">

                <div class="portalEmptyIcon">

                    📭

                </div>

                <div class="portalEmptyTitle">

                    No Bookings Found

                </div>

                <div class="portalEmptySub">

                    We couldn't find any bookings for this customer.

                </div>

            </div>

            `;

        }

        return;

    }

    if (empty) {

        empty.classList.add("hidden");

    }

    /*--------------------------------------
    Sort Latest First
    --------------------------------------*/

    bookings.sort(function (a, b) {

        return new Date(b.createdDate) -

            new Date(a.createdDate);

    });

    /*--------------------------------------
    Render Cards
    --------------------------------------*/

    bookings.forEach(function (booking, index) {

        const card =
            document.createElement("div");

        card.className =
            "customerBookingCardWrapper";

        card.dataset.booking =
            booking.bookingId;

        card.innerHTML =
            renderBookingCard(booking);

        /*----------------------------------
        Click
        ----------------------------------*/

        card.addEventListener(

            "click",

            function () {

                window.selectedBooking = booking;

                window.currentModificationBooking = booking;

                selectBooking(

                    booking.bookingId

                );

            }

        );

        container.appendChild(card);

    });

    /*--------------------------------------
    Auto Select First Booking
    --------------------------------------*/

    if (bookings.length) {

        window.selectedBooking = bookings[0];

        window.currentModificationBooking = bookings[0];

        selectBooking(

            bookings[0].bookingId

        );

    }

}

/*=========================================================
SELECT BOOKING
=========================================================*/

function selectBooking(bookingId) {

    CustomerPortal.currentBooking =

        CustomerPortal.bookings.find(

            b => b.bookingId === bookingId

        );

    /*--------------------------------------
    Highlight Card
    --------------------------------------*/

    document

        .querySelectorAll(

            ".customerBookingCardWrapper"

        )

        .forEach(card => {

            card.classList.remove(

                "selected"

            );

        });

    const selected =

        document.querySelector(

            `[data-booking="${bookingId}"]`

        );

    if (selected) {

        selected.classList.add(

            "selected"

        );

    }

    /*--------------------------------------
    Render Details
    --------------------------------------*/

    renderBookingDetails(

        CustomerPortal.currentBooking

    );

}

/*=========================================================
RENDER BOOKING DETAILS
Master Renderer
=========================================================*/

function renderBookingDetails(booking) {

    const container =
        document.getElementById(
            "bookingDetailsContainer"
        );

    if (!container) {

        return;

    }

    /*--------------------------------------
    No Selection
    --------------------------------------*/

    if (!booking) {

        container.innerHTML = `

        <div class="portalGlass portalEmptyDetails">

            <div class="portalEmptyIcon">

                📋

            </div>

            <div class="portalEmptyTitle">

                No Booking Selected

            </div>

            <div class="portalEmptySub">

                Select a booking from the left panel.

            </div>

        </div>

        `;

        return;

    }

    CustomerPortal.currentBooking = booking;

    container.innerHTML = `

    ${renderBookingHeader(booking)}

    ${renderBookingInfo(booking)}

    ${renderPaymentSummary(booking)}

    ${renderWorkflowSection(booking)}

    ${renderDocumentsSection(booking)}

    ${renderModificationRequestCard(booking)}

    

    ${renderNotesSection(booking)}

    ${renderBookingActionPanel(booking)}

    `;

    loadCustomerModificationStatus(
        booking
    );


}

/*=========================================================
BOOKING HEADER
=========================================================*/

function renderBookingHeader(booking) {

    return `

    <div class="portalGlass bookingHeaderCard">

        <div class="bookingHeaderTop">

            <div class="bookingHeaderLeft">

                <div class="bookingHeaderIcon">

                    ${getServiceIcon(booking.service)}

                </div>

                <div>

                    <div class="bookingHeaderTitle">

                        ${booking.service}

                    </div>

                    <div class="bookingHeaderId">

                        Booking ID

                        <strong>

                            ${booking.bookingId}

                        </strong>

                    </div>

                </div>

            </div>

            <div>

                ${getStatusBadge(booking.status)}

            </div>

        </div>

    </div>

    `;

}

/*=========================================================
BOOKING INFORMATION
=========================================================*/

function renderBookingInfo(booking) {

    return `

<div class="portalGlass portalBookingInfoCard">

    <div class="portalBookingTitle">

        Booking Information

    </div>

    <div class="portalBookingGrid">

        ${bookingInfoRow("Customer", booking.customerName)}

        ${bookingInfoRow("Phone", booking.phone)}

        ${bookingInfoRow("Travel Date", formatPortalDate(booking.travelDate))}

        ${bookingInfoRow("Route", booking.route)}

        ${bookingInfoRow("Created", formatPortalDate(booking.createdDate))}

        ${bookingInfoRow("Assigned To", booking.assignedTo || "-")}

        ${bookingInfoRow("Priority", booking.priority)}

        ${bookingInfoRow("Source", booking.source)}

    </div>

</div>

`;

}

function bookingInfoRow(label, value) {

    return `

<div class="portalBookingRow">

    <div class="portalBookingLabel">

        ${label}

    </div>

    <div class="portalBookingSeparator">

        :

    </div>

    <div class="portalBookingValue">

        ${value || "-"}

    </div>

</div>

`;

}

function formatPortalDate(date) {

    if (!date) return "-";

    const d = new Date(date);

    if (isNaN(d.getTime())) {

        return date;

    }

    return d.toLocaleDateString(

        "en-IN",

        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }

    );

}



/*=========================================================
PAYMENT SUMMARY
=========================================================*/

function renderPaymentSummary(booking) {

    return `

<div class="portalGlass portalPaymentCard">

    <div class="portalSectionTitle">

        Payment Summary

    </div>

    <div class="portalPaymentGrid">

        <div class="portalPaymentBox">

            <div class="portalPaymentLabel">

                Total Amount

            </div>

            <div class="portalPaymentValue">

                ₹${booking.totalAmount}

            </div>

        </div>

        <div class="portalPaymentBox">

            <div class="portalPaymentLabel">

                Paid Amount

            </div>

            <div class="portalPaymentValue portalPaymentGreen">

                ₹${booking.paidAmount}

            </div>

        </div>

        <div class="portalPaymentBox">

            <div class="portalPaymentLabel">

                Balance

            </div>

            <div class="portalPaymentValue portalPaymentOrange">

                ₹${booking.balanceAmount}

            </div>

        </div>

        <div class="portalPaymentBox">

            <div class="portalPaymentLabel">

                Payment Status

            </div>

            <div class="portalPaymentStatus">

                ${getStatusBadge(booking.paymentStatus)}

            </div>

        </div>

    </div>

</div>

`;

}

/*=========================================================
WORKFLOW
=========================================================*/

function renderWorkflowSection(booking) {

    return `

    <div class="portalGlass workflowCard">

        <h3>

            Booking Progress

        </h3>

        ${renderWorkflowSummary(

        booking.progress || {}

    )}

    </div>

    `;

}

/*=========================================================
DOCUMENTS
=========================================================*/

function renderDocumentsSection() {

    return `

<div class="portalGlass portalDocumentsCard">

    <div class="portalSectionTitle">

        Documents

    </div>

    <div class="portalDocumentsGrid">

        <button class="portalDocumentButton">

            <span>

                🎫

            </span>

            <div>

                <strong>

                    Travel Voucher

                </strong>

                <small>

                    Download Booking Voucher

                </small>

            </div>

        </button>

        <button class="portalDocumentButton">

            <span>

                📄

            </span>

            <div>

                <strong>

                    Invoice

                </strong>

                <small>

                    Download Tax Invoice

                </small>

            </div>

        </button>

        <button class="portalDocumentButton">

            <span>

                🛂

            </span>

            <div>

                <strong>

                    Visa Documents

                </strong>

                <small>

                    View Uploaded Documents

                </small>

            </div>

        </button>

    </div>

</div>

`;

}

/*=========================================================
NOTES
=========================================================*/

function renderNotesSection(booking) {

    return `

    <div class="portalGlass notesCard">

        <h3>

            Notes

        </h3>

        <div class="notesBody">

            ${booking.notes || "No notes available."}

        </div>

    </div>

    `;

}

/*=========================================================
ACTION PANEL
=========================================================*/

function renderBookingActionPanel(booking) {

    return `

    <div class="portalGlass bookingActionCard">

        ${renderBookingActions(booking)}

    </div>

    `;

}



function renderModificationRequestCard(booking) {

    const bookingId =
        String(
            booking.bookingId || ""
        ).trim();

    return `

    <div class="portalGlass modificationRequestCard">

        <h3>
            Need to Change Something?
        </h3>

        <!-- =========================================
             CUSTOMER MODIFICATION STATUS
        ========================================== -->

        <div
            id="customerModificationStatus_${bookingId}"
            class="customerModificationStatus"
        >

            <div class="customerModificationStatusLoading">
                Checking modification requests...
            </div>

        </div>


        <!-- =========================================
             MODIFICATION BUTTONS
        ========================================== -->

        <div class="modificationGrid">

            ${renderModificationButtons(booking)}

        </div>

    </div>

    `;
}

async function loadCustomerModificationStatus(
    booking
) {

    try {

        const bookingId =
            String(
                booking.bookingId || ""
            ).trim();

        if (!bookingId) {

            return;

        }


        const statusContainer =
            document.getElementById(
                "customerModificationStatus_" +
                bookingId
            );


        if (!statusContainer) {

            return;

        }


        /*
         * Customer phone.
         */

        const phone =
            String(
                booking.phone ||
                window.customerPhone ||
                ""
            )
                .replace(/\D/g, "");


        if (!phone) {

            statusContainer.innerHTML = "";

            return;

        }


        console.log(
            "[CUSTOMER MODIFICATION] Checking status:",
            bookingId
        );


        /*
         * Call Apps Script.
         *
         * IMPORTANT:
         *
         * This action name must exist in your
         * backend doPost / API router.
         */

        const response =
            await callPortalAPI(
                "getCustomerModificationRequests",
                {

                    env:
                        window.CUSTOMER_ENV ||
                        "LIVE",

                    bookingId:
                        bookingId,

                    phone:
                        phone

                }
            );


        console.log(
            "[CUSTOMER MODIFICATION] Status response:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            statusContainer.innerHTML = "";

            return;

        }


        const requests =
            Array.isArray(
                response.requests
            )
                ? response.requests
                : [];


        /*
         * Find requests belonging to this booking.
         */

        const bookingRequests =
            requests.filter(
                function (item) {

                    return (
                        String(
                            item.bookingId ||
                            item["Booking ID"] ||
                            ""
                        ).trim()
                        ===
                        bookingId
                    );

                }
            );


        /*
         * No modification requests.
         */

        if (!bookingRequests.length) {

            statusContainer.innerHTML = "";

            return;

        }


        /*
         * Sort newest first.
         */

        bookingRequests.sort(
            function (a, b) {

                const dateA =
                    new Date(
                        a.requestedDate ||
                        a["Requested Date"] ||
                        0
                    ).getTime();

                const dateB =
                    new Date(
                        b.requestedDate ||
                        b["Requested Date"] ||
                        0
                    ).getTime();

                return dateB - dateA;

            }
        );


        /*
         * Display the latest request.
         */

        const latestRequest =
            bookingRequests[0];


        renderCustomerModificationStatus(
            statusContainer,
            latestRequest
        );


    }

    catch (error) {

        console.error(
            "[CUSTOMER MODIFICATION] Failed to load status:",
            error
        );


        const bookingId =
            String(
                booking.bookingId || ""
            ).trim();


        const statusContainer =
            document.getElementById(
                "customerModificationStatus_" +
                bookingId
            );


        if (statusContainer) {

            statusContainer.innerHTML = "";

        }

    }

}

function renderCustomerModificationStatus(
    container,
    request
) {

    if (!container) {

        return;

    }


    if (!request) {

        container.innerHTML = "";

        return;

    }


    const requestId =
        String(
            request.requestId ||
            request["Request ID"] ||
            ""
        ).trim();


    const requestType =
        String(
            request.requestType ||
            request["Request Type"] ||
            ""
        ).trim();


    const status =
        String(
            request.status ||
            request.Status ||
            ""
        )
            .trim()
            .toLowerCase();


    let statusClass =
        "pending";


    let statusIcon =
        "🟡";


    let statusText =
        "Modification request is pending";


    if (status === "approved") {

        statusClass =
            "approved";

        statusIcon =
            "🟢";

        statusText =
            "Modification request approved";

    }

    else if (status === "rejected") {

        statusClass =
            "rejected";

        statusIcon =
            "🔴";

        statusText =
            "Modification request rejected";

    }

    else if (status === "pending") {

        statusClass =
            "pending";

        statusIcon =
            "🟡";

        statusText =
            "Modification request is pending";

    }


    container.innerHTML = `

        <div
            class="
                customerModificationStatusBox
                customerModificationStatus_${statusClass}
            "
        >

            <div class="customerModificationStatusIcon">

                ${statusIcon}

            </div>


            <div class="customerModificationStatusContent">

                <div class="customerModificationStatusTitle">

                    ${statusText}

                </div>


                ${requestType
            ? `
                            <div class="customerModificationStatusType">

                                ${requestType}

                            </div>
                        `
            : ""
        }


                ${requestId
            ? `
                            <div class="customerModificationStatusRequestId">

                                Request ID:
                                <strong>
                                    ${requestId}
                                </strong>

                            </div>
                        `
            : ""
        }

            </div>

        </div>

    `;

}



function renderModificationButtons(booking) {

    if (!booking) {
        return "";
    }

    const service =
        String(booking.service || "")
            .trim()
            .toUpperCase();

    const config =
        SERVICE_MODIFICATIONS[service] || [];

    return config.map(function (item) {

        return `

<button
class="modificationButton"
onclick="openModificationRequest('${booking.bookingId}','${item.id}')">

    ${item.icon}
    ${item.label}

</button>

`;

    }).join("");

}


/*=========================================================
OPEN GENERIC MODIFICATION POPUP
=========================================================*/

/*=========================================================
OPEN GENERIC MODIFICATION POPUP
=========================================================*/

function openGenericModificationPopup(modificationType) {

    const booking = window.selectedBooking;

    if (!booking) {

        showBookingError(
            "Please open a booking first."
        );

        return;

    }

    openModificationRequest(booking);

    setTimeout(function () {

        const dropdown =
            document.getElementById(
                "modificationType"
            );

        if (dropdown) {

            dropdown.value = modificationType;

            renderModificationForm(
                booking,
                modificationType
            );

        }

    }, 100);

}