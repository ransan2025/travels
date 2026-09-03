/*=========================================================
GENERIC MODIFICATION POPUP
=========================================================*/

function buildModificationPopup(booking) {

    return `

<div class="modificationPopup">

    <!--==============================
    Booking Summary
    ==============================-->

    <div class="modBookingSummary">

        <div class="modBookingIcon">

            ${getServiceIcon(booking.service)}

        </div>

        <div class="modBookingInfo">

            <div class="modBookingTitle">

                Booking Modification Request

            </div>

            <div class="modBookingSubTitle">

                Booking ID :
                <strong>${booking.bookingId}</strong>

            </div>

        </div>

    </div>

    <!--==============================
    Booking Information
    ==============================-->

    <div class="modBookingGrid">

        <div class="modInfoItem">

            <label>Customer</label>

            <span>${booking.customerName}</span>

        </div>

        <div class="modInfoItem">

            <label>Service</label>

            <span>${booking.service}</span>

        </div>

        <div class="modInfoItem">

            <label>Travel Date</label>

            <span>${booking.travelDate}</span>

        </div>

        <div class="modInfoItem">

            <label>Route</label>

            <span>${booking.route}</span>

        </div>

    </div>

    <!--==============================
    Modification Type
    ==============================-->

    <div class="modFormGroup">

        <label>

            What would you like to modify?

        </label>

        <select
            id="modificationType"
            class="modSelect">

            <option value="">

                Select Modification

            </option>

        </select>

    </div>

    <!--==============================
    Dynamic Form Area
    ==============================-->

    <div
        id="modificationDynamicArea">

    </div>

</div>

`;

}

/*=========================================================
SERVICE MODIFICATION CONFIGURATION
=========================================================*/

/*=========================================================
SERVICE MODIFICATION CONFIGURATION
=========================================================*/

const SERVICE_MODIFICATIONS = {

    /*-----------------------------------------------------
    FLIGHT / AIR
    Supports booking.service = "Flight", "Air", "FLIGHT", "AIR"
    -----------------------------------------------------*/
    FLIGHT: [

        {
            id: "travelDate",
            label: "Change Travel Date",
            icon: "📅"
        },

        {
            id: "route",
            label: "Change From / To",
            icon: "📍"
        },

        {
            id: "addTraveller",
            label: "Add Traveller",
            icon: "➕"
        },

        {
            id: "removeTraveller",
            label: "Remove Traveller",
            icon: "➖"
        }

    ],

    TRAIN: [

        {
            id: "travelDate",
            label: "Change Travel Date",
            icon: "📅"
        },

        {
            id: "route",
            label: "Change From / To",
            icon: "📍"
        },

        {
            id: "class",
            label: "Change Class",
            icon: "🎫"
        },

        {
            id: "addTraveller",
            label: "Add Traveller",
            icon: "➕"
        },

        {
            id: "removeTraveller",
            label: "Remove Traveller",
            icon: "➖"
        }

    ],

    BUS: [

        {
            id: "travelDate",
            label: "Change Travel Date",
            icon: "📅"
        },

        {
            id: "route",
            label: "Change From / To",
            icon: "📍"
        },

        {
            id: "class",
            label: "Seat / Class",
            icon: "💺"
        },

        {
            id: "addTraveller",
            label: "Add Traveller",
            icon: "➕"
        },

        {
            id: "removeTraveller",
            label: "Remove Traveller",
            icon: "➖"
        }

    ],

    PACKAGE: [

        {
            id: "package",
            label: "Upgrade Package",
            icon: "⭐"
        },

        {
            id: "travelMonth",
            label: "Travel Month",
            icon: "🗓"
        },

        {
            id: "hotel",
            label: "Change Hotel",
            icon: "🏨"
        },

        {
            id: "visa",
            label: "Visa",
            icon: "🛂"
        },

        {
            id: "addTraveller",
            label: "Add Traveller",
            icon: "➕"
        },

        {
            id: "removeTraveller",
            label: "Remove Traveller",
            icon: "➖"
        }

    ],

    CAR: [

        {
            id: "vehicle",
            label: "Change Vehicle",
            icon: "🚗"
        },

        {
            id: "pickupDate",
            label: "Pickup Date",
            icon: "📅"
        },

        {
            id: "dropDate",
            label: "Drop Date",
            icon: "📅"
        },

        {
            id: "pickupLocation",
            label: "Pickup Location",
            icon: "📍"
        },

        {
            id: "dropLocation",
            label: "Drop Location",
            icon: "🏁"
        }

    ]

};


/*---------------------------------------------------------
BACKWARD COMPATIBILITY

If some existing booking still contains service = "Air",
it will continue to work.
---------------------------------------------------------*/

SERVICE_MODIFICATIONS.AIR =
    SERVICE_MODIFICATIONS.FLIGHT;

/*=========================================================
FIELD VALIDATION CONFIG
=========================================================*/

const MODIFICATION_VALIDATION = {

    travelDate: [

        "requestedValue",

        "requestReason"

    ],

    route: [

        "routeFrom",

        "routeTo",

        "requestReason"

    ],

    vehicle: [

        "requestedValue",

        "requestReason"

    ],

    hotel: [

        "requestedValue",

        "requestReason"

    ],

    package: [

        "requestedValue",

        "requestReason"

    ],

    class: [

        "requestedValue"

    ],

    travelMonth: [

        "requestedValue",

        "requestReason"

    ],

    pickupDate: [

        "requestedValue"

    ],

    dropDate: [

        "requestedValue"

    ],

    pickupLocation: [

        "requestedValue"

    ],

    dropLocation: [

        "requestedValue"

    ],

    visa: [

        "requestReason"

    ],

    addTraveller: [

        "travellerName",

        "travellerAge",

        "travellerGender"

    ],

    removeTraveller: [

        "requestedValue",

        "requestReason"

    ],

    cancelBooking: [

        "requestReason"

    ],

    other: [

        "requestReason"

    ]

};

/*=========================================================
VALIDATE MODIFICATION FORM
=========================================================*/

function validateModificationForm(type) {

    clearValidationErrors();

    const required =
        MODIFICATION_VALIDATION[type] || [];

    let valid = true;

    required.forEach(function (id) {

        const field =
            document.getElementById(id);

        if (!field) return;

        const value =
            String(field.value || "").trim();

        if (value === "") {

            valid = false;

            field.classList.add("modError");

        }

    });

    return valid;

}

/*=========================================================
CLEAR VALIDATION
=========================================================*/

function clearValidationErrors() {

    document
        .querySelectorAll(".modError")
        .forEach(function (el) {

            el.classList.remove("modError");

        });

}

/*=========================================================
COLLECT FORM DATA
=========================================================*/

function collectModificationFormData() {

    const data = {};

    document
        .querySelectorAll(
            "#modificationDynamicArea input," +
            "#modificationDynamicArea textarea," +
            "#modificationDynamicArea select"
        )
        .forEach(function (el) {

            data[el.id] = el.value;

        });

    return data;

}



/*=========================================================
COMMON MODIFICATIONS
=========================================================*/

const COMMON_MODIFICATIONS = [

    {
        id: "cancelBooking",
        label: "Cancel Booking",
        icon: "❌"
    },

    {
        id: "other",
        label: "Other Request",
        icon: "💬"
    }

];



/*=========================================================
OPEN MODIFICATION REQUEST
=========================================================*/

function openModificationRequest(bookingId, modificationType = "") {

    console.log("Booking ID :", bookingId);

    console.log("window.currentModificationBooking");
    console.log(window.currentModificationBooking);

    console.log("window.selectedBooking");
    console.log(window.selectedBooking);

    console.log("window.customerBookings");
    console.log(window.customerBookings);

    let booking = null;

    /*------------------------------------------
    First preference:
    If current booking is already selected
    ------------------------------------------*/

    if (
        window.currentModificationBooking &&
        String(window.currentModificationBooking.bookingId) === String(bookingId)
    ) {

        booking = window.currentModificationBooking;

    } else {

        booking = (window.customerBookings || []).find(function (item) {

            return String(item.bookingId) === String(bookingId);

        });

    }

    if (!booking) {

        console.warn("Booking not found :", bookingId);

        showBookingError("Booking not found.");

        return;

    }

    window.currentModificationBooking = booking;

    const footer = `

<button
class="bookingGlassBtn"
onclick="closeBookingModificationPopup()">

Cancel

</button>

<button
class="bookingGlassBtn bookingPrimaryBtn"
onclick="submitModificationRequest()">

Submit Request

</button>

`;

    openBookingModificationPopup(

        "Booking Modification",

        buildModificationPopup(booking),

        footer

    );

    initializeModificationPopup(booking);

    if (modificationType) {

        const ddl =
            document.getElementById("modificationType");

        if (ddl) {

            ddl.value = modificationType;

            renderModificationForm(

                booking,

                modificationType

            );

        }

    }

}

/*=========================================================
INITIALIZE POPUP
=========================================================*/

function initializeModificationPopup(booking) {

    populateModificationTypes(
        booking.service
    );

    document
        .getElementById("modificationType")
        .addEventListener(

            "change",

            function () {

                renderModificationForm(

                    booking,

                    this.value

                );

            }

        );

}

/*=========================================================
POPULATE MODIFICATION TYPES
=========================================================*/

/*=========================================================
POPULATE MODIFICATION TYPES
=========================================================*/

function populateModificationTypes(service) {

    const dropdown =
        document.getElementById("modificationType");

    if (!dropdown) {
        return;
    }

    dropdown.innerHTML = `
        <option value="">
            Select Modification
        </option>
    `;

    const serviceKey =
        String(service || "")
            .trim()
            .toUpperCase();

    const list =
        SERVICE_MODIFICATIONS[serviceKey] || [];

    list.forEach(function (item) {

        dropdown.innerHTML += `
            <option value="${item.id}">
                ${item.icon} ${item.label}
            </option>
        `;

    });

    if (COMMON_MODIFICATIONS.length) {

        dropdown.innerHTML += `
            <option disabled>
                ──────────────────
            </option>
        `;

        COMMON_MODIFICATIONS.forEach(function (item) {

            dropdown.innerHTML += `
                <option value="${item.id}">
                    ${item.icon || "📝"} ${item.label}
                </option>
            `;

        });

    }

}


/*=========================================================
DYNAMIC FORM RENDERER
=========================================================*/

function renderModificationForm(booking, type) {

    const container =
        document.getElementById(
            "modificationDynamicArea"
        );

    if (!container) return;

    container.innerHTML = "";

    switch (type) {

        case "travelDate":

            container.innerHTML = renderTravelDateForm(booking);

            break;

        case "route":

            container.innerHTML = renderRouteForm(booking);

            break;

        case "vehicle":

            container.innerHTML = renderVehicleForm(booking);

            break;

        case "hotel":

            container.innerHTML = renderHotelForm(booking);

            break;

        case "package":

            container.innerHTML = renderPackageForm(booking);

            break;

        case "travelMonth":

            container.innerHTML = renderTravelMonthForm(booking);

            break;

        case "class":

            container.innerHTML = renderClassForm(booking);

            break;

        case "pickupDate":

            container.innerHTML = renderPickupDateForm(booking);

            break;

        case "dropDate":

            container.innerHTML = renderDropDateForm(booking);

            break;

        case "pickupLocation":

            container.innerHTML = renderPickupLocationForm(booking);

            break;

        case "dropLocation":

            container.innerHTML = renderDropLocationForm(booking);

            break;

        case "visa":

            container.innerHTML = renderVisaForm(booking);

            break;

        case "addTraveller":

            container.innerHTML = renderAddTravellerForm(booking);

            break;

        case "removeTraveller":

            container.innerHTML = renderRemoveTravellerForm(booking);

            break;

        case "cancelBooking":

            container.innerHTML = renderCancelBookingForm(booking);

            break;

        case "other":

            container.innerHTML = renderOtherRequestForm(booking);

            break;

        default:

            container.innerHTML = "";

    }

}

function renderTravelDateForm(booking) {

    return `

<div class="modFormGroup">

<label>Current Travel Date</label>

<input
type="text"
class="modInput"
readonly
value="${booking.travelDate}">

</div>

<div class="modFormGroup">

<label>Preferred Date</label>

<input
id="requestedValue"
type="date"
class="modInput">

</div>

<div class="modFormGroup">

<label>Reason</label>

<textarea
id="requestReason"
class="modTextarea"></textarea>

</div>

`;

}

function renderRouteForm(booking) {

    return `

<div class="modFormGroup">

<label>Current Route</label>

<input
readonly
class="modInput"
value="${booking.route}">

</div>

<div class="modTwoColumn">

<div class="modFormGroup">

<label>From</label>

<input
id="routeFrom"
class="modInput">

</div>

<div class="modFormGroup">

<label>To</label>

<input
id="routeTo"
class="modInput">

</div>

</div>

<div class="modFormGroup">

<label>Reason</label>

<textarea
id="requestReason"
class="modTextarea"></textarea>

</div>

`;

}

function renderVehicleForm() {

    return `

<div class="modFormGroup">

<label>Vehicle</label>

<select
id="requestedValue"
class="modSelect">

<option>Sedan</option>

<option>SUV</option>

<option>Luxury</option>

<option>Tempo Traveller</option>

</select>

</div>

<div class="modFormGroup">

<label>Reason</label>

<textarea
id="requestReason"
class="modTextarea"></textarea>

</div>

`;

}

function renderHotelForm() {

    return `

<div class="modFormGroup">

<label>Hotel Category</label>

<select
id="requestedValue"
class="modSelect">

<option>Standard</option>

<option>Deluxe</option>

<option>Premium</option>

<option>Luxury</option>

</select>

</div>

<div class="modFormGroup">

<label>Remarks</label>

<textarea
id="requestReason"
class="modTextarea"></textarea>

</div>

`;

}

function renderPackageForm() {

    return `

<div class="modFormGroup">

<label>Package</label>

<select
id="requestedValue"
class="modSelect">

<option>Silver</option>

<option>Gold</option>

<option>Platinum</option>

<option>Luxury</option>

</select>

</div>

<div class="modFormGroup">

<label>Reason</label>

<textarea
id="requestReason"
class="modTextarea"></textarea>

</div>

`;

}

function renderTravelMonthForm() {

    return `

<div class="modFormGroup">

<label>Preferred Month</label>

<input
id="requestedValue"
type="month"
class="modInput">

</div>

<div class="modFormGroup">

<label>Reason</label>

<textarea
id="requestReason"
class="modTextarea"></textarea>

</div>

`;

}

function renderClassForm() {

    return `

<div class="modFormGroup">

<label>Preferred Class</label>

<select
id="requestedValue"
class="modSelect">

<option>Economy</option>

<option>Premium Economy</option>

<option>Business</option>

<option>First</option>

</select>

</div>

`;

}

function renderPickupDateForm() {

    return `

<div class="modFormGroup">

<label>Pickup Date</label>

<input
id="requestedValue"
type="date"
class="modInput">

</div>

`;

}

function renderDropDateForm() {

    return `

<div class="modFormGroup">

<label>Drop Date</label>

<input
id="requestedValue"
type="date"
class="modInput">

</div>

`;

}

function renderPickupLocationForm() {

    return `

<div class="modFormGroup">

<label>Pickup Location</label>

<input
id="requestedValue"
class="modInput">

</div>

`;

}

function renderDropLocationForm() {

    return `

<div class="modFormGroup">

<label>Drop Location</label>

<input
id="requestedValue"
class="modInput">

</div>

`;

}

function renderVisaForm() {

    return `

<div class="modFormGroup">

<label>Visa Request</label>

<textarea
id="requestReason"
class="modTextarea"></textarea>

</div>

`;

}

function renderAddTravellerForm() {

    return `

<div class="modFormGroup">

<label>Traveller Name</label>

<input
id="travellerName"
class="modInput">

</div>

<div class="modFormGroup">

<label>Age</label>

<input
id="travellerAge"
type="number"
class="modInput">

</div>

<div class="modFormGroup">

<label>Gender</label>

<select
id="travellerGender"
class="modSelect">

<option>Male</option>

<option>Female</option>

<option>Other</option>

</select>

</div>

`;

}

function renderRemoveTravellerForm() {

    return `

<div class="modFormGroup">

<label>Traveller Name</label>

<input
id="requestedValue"
class="modInput">

</div>

<div class="modFormGroup">

<label>Reason</label>

<textarea
id="requestReason"
class="modTextarea"></textarea>

</div>

`;

}

function renderCancelBookingForm() {

    return `

<div class="modWarning">

⚠ Cancellation request will be reviewed by our support team.

</div>

<div class="modFormGroup">

<label>Reason</label>

<textarea
id="requestReason"
class="modTextarea"></textarea>

</div>

`;

}

function renderOtherRequestForm() {

    return `

<div class="modFormGroup">

<label>How can we help?</label>

<textarea
id="requestReason"
class="modTextarea"
rows="5"></textarea>

</div>

`;

}

/*=========================================================
SUBMIT MODIFICATION REQUEST
=========================================================*/

async function submitModificationRequest() {

    try {

        const modificationType =
            document
                .getElementById("modificationType")
                .value;

        if (!modificationType) {

            showBookingError(

                "Please select modification type."

            );

            return;

        }

        if (!validateModificationForm(modificationType)) {

            showBookingError(

                "Please fill all required fields."

            );

            return;

        }



        const payload = buildModificationPayload(
            window.currentModificationBooking,
            modificationType
        );

        showBookingLoading(
            "Submitting request..."
        );

        const response =
            await callPortalAPI(
                "submitModificationRequest",
                payload
            );

        console.log("Modification Response :", response);

        hideBookingLoading();

        if (response.success) {

            showBookingSuccess(

                "Request Submitted",

                "Your request has been submitted successfully."

            );

            closeBookingModificationPopup();

            return;

        }

        showBookingError(
            response.message || "Unable to submit request."
        );

    }

    catch (err) {

        hideBookingLoading();

        console.error(err);

        showBookingError(
            err.message || err.toString()
        );

    }

}

/*=========================================================
BUILD REQUEST PAYLOAD
=========================================================*/

/*=========================================================
AUTO PAYLOAD BUILDER
=========================================================*/

function buildModificationPayload(
    booking,
    type
) {

    const formData =
        collectModificationFormData();

    return {

        bookingId:
            booking.bookingId,

        customer:
            booking.customerName,

        phone:
            booking.phone,

        service:
            booking.service,

        requestType:
            type,

        currentValue:
            booking,

        requestedValue:
            formData,

        reason:
            formData.requestReason || ""

    };

}


/*=========================================================
  CUSTOMER MODIFICATION STATUS
=========================================================*/

/*
 * Stores the modification requests currently loaded
 * for the logged-in customer.
 */
let customerModificationRequests = [];


/*=========================================================
  LOAD CUSTOMER MODIFICATION REQUESTS
=========================================================*/

async function loadCustomerModificationRequests() {

    const container =
        document.getElementById(
            "customerModificationStatusContainer"
        );


    if (!container) {

        console.warn(
            "[CUSTOMER MODIFICATION] Status container not found."
        );

        return;

    }


    /*
     * Customer phone.
     *
     * Your existing customer portal already uses
     * customerPhone, so reuse that value.
     */

    const phone =
        String(
            window.currentCustomerPhone ||
            window.customerPhone ||
            ""
        )
            .replace(/\D/g, "");


    if (!phone) {

        console.warn(
            "[CUSTOMER MODIFICATION] Customer phone not available."
        );

        container.innerHTML = "";

        return;

    }


    /*
     * Show loading state.
     */

    container.innerHTML = `

        <div class="customerModificationStatusCard">

            <div class="customerModificationStatusTitle">

                Modification Requests

            </div>

            <div class="customerModificationNoRequests">

                Loading request status...

            </div>

        </div>

    `;


    try {

        console.log(
            "[CUSTOMER MODIFICATION] Loading requests..."
        );


        const payload = {

            env:
                window.CUSTOMER_ENV ||
                "LIVE",

            phone:
                phone

        };


        console.log(
            "[CUSTOMER MODIFICATION] Payload:",
            payload
        );


        /*
         * IMPORTANT
         *
         * Replace ONLY the action name below if your
         * existing Apps Script action has a different name.
         */

        const response =
            await callPortalAPI(
                "getCustomerModificationRequests",
                payload
            );


        console.log(
            "[CUSTOMER MODIFICATION] Response:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response &&
                    (
                        response.message ||
                        response.error
                    )
                    ? (
                        response.message ||
                        response.error
                    )
                    : "Unable to load modification requests."
            );

        }


        /*
         * Accept common response property names.
         */

        customerModificationRequests =
            Array.isArray(
                response.requests
            )
                ? response.requests
                : Array.isArray(
                    response.data
                )
                    ? response.data
                    : [];


        renderCustomerModificationRequests();

    }

    catch (error) {

        console.error(
            "[CUSTOMER MODIFICATION] Load error:",
            error
        );


        container.innerHTML = `

            <div class="customerModificationStatusCard">

                <div class="customerModificationStatusTitle">

                    Modification Requests

                </div>

                <div class="customerModificationNoRequests">

                    Unable to load modification request status.

                </div>

            </div>

        `;

    }

}


/*=========================================================
  RENDER CUSTOMER MODIFICATION REQUESTS
=========================================================*/

function renderCustomerModificationRequests() {

    const container =
        document.getElementById(
            "customerModificationStatusContainer"
        );


    if (!container) {

        return;

    }


    /*
     * No requests.
     */

    if (
        !customerModificationRequests ||
        !customerModificationRequests.length
    ) {

        container.innerHTML = `

            <div class="customerModificationStatusCard">

                <div class="customerModificationStatusHeader">

                    <div class="customerModificationStatusTitle">

                        Modification Requests

                    </div>

                </div>

                <div class="customerModificationNoRequests">

                    No modification requests.

                </div>

            </div>

        `;

        return;

    }


    /*
     * Build request cards.
     */

    let html = `

        <div class="customerModificationStatusCard">

            <div class="customerModificationStatusHeader">

                <div class="customerModificationStatusTitle">

                    Modification Requests

                </div>

                <button
                    type="button"
                    class="customerModificationRefreshButton"
                    onclick="loadCustomerModificationRequests()"
                >
                    ↻ Refresh
                </button>

            </div>

    `;


    customerModificationRequests.forEach(
        function (request) {

            html +=
                buildCustomerModificationStatusCard(
                    request
                );

        }
    );


    html += `

        </div>

    `;


    container.innerHTML = html;

}


/*=========================================================
  BUILD STATUS CARD
=========================================================*/

function buildCustomerModificationStatusCard(
    request
) {

    const requestId =
        String(
            request["Request ID"] ||
            request.requestId ||
            request.id ||
            ""
        ).trim();


    const requestType =
        String(
            request["Request Type"] ||
            request.requestType ||
            ""
        ).trim();


    const bookingId =
        String(
            request["Booking ID"] ||
            request.bookingId ||
            ""
        ).trim();


    const status =
        String(
            request.Status ||
            request.status ||
            "Pending"
        )
            .trim();


    const normalizedStatus =
        status.toLowerCase();


    let badgeClass =
        "customerModificationStatusPending";


    let icon =
        "⏳";


    if (
        normalizedStatus ===
        "approved"
    ) {

        badgeClass =
            "customerModificationStatusApproved";

        icon =
            "✅";

    }

    else if (
        normalizedStatus ===
        "rejected"
    ) {

        badgeClass =
            "customerModificationStatusRejected";

        icon =
            "❌";

    }


    return `

        <div
            class="customerModificationRequest"
        >

            <div
                class="customerModificationRequestTop"
            >

                <div>

                    <div
                        class="customerModificationRequestType"
                    >

                        ${escapeCustomerModificationHtml(
        requestType ||
        "Modification Request"
    )}

                    </div>

                    <div
                        class="customerModificationRequestId"
                    >

                        Request ID:
                        ${escapeCustomerModificationHtml(
        requestId
    )}

                    </div>

                </div>


                <div
                    class="
                        customerModificationStatusBadge
                        ${badgeClass}
                    "
                >

                    ${icon}

                    ${escapeCustomerModificationHtml(
        status
    )}

                </div>

            </div>


            <div
                class="customerModificationRequestDetails"
            >

                <div
                    class="customerModificationRequestDetail"
                >

                    <strong>
                        Booking:
                    </strong>

                    ${escapeCustomerModificationHtml(
        bookingId
    )}

                </div>


                ${request["Requested Date"] ||
            request.requestedDate
            ? `
                            <div
                                class="customerModificationRequestDetail"
                            >

                                <strong>
                                    Submitted:
                                </strong>

                                ${formatCustomerModificationDate(
                request["Requested Date"] ||
                request.requestedDate
            )}

                            </div>
                        `
            : ""
        }

            </div>

        </div>

    `;

}


/*=========================================================
  DATE FORMATTER
=========================================================*/

function formatCustomerModificationDate(
    value
) {

    if (!value) {

        return "";

    }


    const date =
        new Date(value);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return escapeCustomerModificationHtml(
            value
        );

    }


    return date.toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/*=========================================================
  SAFE HTML
=========================================================*/

function escapeCustomerModificationHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

