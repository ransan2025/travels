
/* =========================================================
   DASHBOARD MODIFICATION REQUESTS
   DYNAMIC / SERVICE-INDEPENDENT VERSION
========================================================= */

let modificationRequests = [];
let modificationStatusFilter = "";
let modificationSearchText = "";


/* =========================================================
   LOAD REQUESTS
========================================================= */

async function loadModificationRequests() {

    const container =
        document.getElementById("modificationRequestList");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="modificationLoading">
            Loading modification requests...
        </div>
    `;

    try {

        const result =
            await callPortalAPI(
                "getModificationRequests",
                {
                    env: DASHBOARD_ENV || "LIVE",
                    status: modificationStatusFilter,
                    search: modificationSearchText
                }
            );

        console.log(
            "[MODIFICATION] Modification Requests:",
            result
        );

        if (!result || !result.success) {

            container.innerHTML = `
                <div class="modificationEmpty">
                    Unable to load modification requests.
                </div>
            `;

            return;
        }

        modificationRequests =
            Array.isArray(result.requests)
                ? result.requests
                : [];

        updateModificationCounters();

        renderModificationRequests();

    }

    catch (err) {

        console.error(
            "[MODIFICATION] Load error:",
            err
        );

        container.innerHTML = `
            <div class="modificationEmpty">
                Unable to load modification requests.
            </div>
        `;

    }

}


/* =========================================================
   COUNTERS
========================================================= */

function updateModificationCounters() {

    const pending =
        modificationRequests.filter(
            r =>
                String(r.status || "")
                    .trim()
                    .toLowerCase() === "pending"
        ).length;

    const approved =
        modificationRequests.filter(
            r =>
                String(r.status || "")
                    .trim()
                    .toLowerCase() === "approved"
        ).length;

    const rejected =
        modificationRequests.filter(
            r =>
                String(r.status || "")
                    .trim()
                    .toLowerCase() === "rejected"
        ).length;

    const pendingEl =
        document.getElementById("modPendingCount");

    const approvedEl =
        document.getElementById("modApprovedCount");

    const rejectedEl =
        document.getElementById("modRejectedCount");

    if (pendingEl) {
        pendingEl.textContent = pending;
    }

    if (approvedEl) {
        approvedEl.textContent = approved;
    }

    if (rejectedEl) {
        rejectedEl.textContent = rejected;
    }

}


/* =========================================================
   STATUS FILTER
========================================================= */

function filterModificationRequests(status) {

    modificationStatusFilter =
        status || "";

    document
        .querySelectorAll(".modFilterBtn")
        .forEach(btn => {

            btn.classList.toggle(
                "active",
                String(btn.dataset.status || "") ===
                modificationStatusFilter
            );

        });

    loadModificationRequests();

}


/* =========================================================
   SEARCH
========================================================= */

function applyModificationSearch() {

    const input =
        document.getElementById(
            "modificationSearch"
        );

    modificationSearchText =
        input
            ? input.value.trim()
            : "";

    renderModificationRequests();

}


/* =========================================================
   MAIN RENDER
========================================================= */

function renderModificationRequests() {

    const container =
        document.getElementById(
            "modificationRequestList"
        );

    if (!container) {
        return;
    }

    let list =
        modificationRequests.slice();


    /* -----------------------------------------------------
       SEARCH
    ----------------------------------------------------- */

    if (modificationSearchText) {

        const search =
            modificationSearchText
                .toLowerCase();

        list =
            list.filter(request => {

                const text =
                    [
                        request.requestId,
                        request.bookingId,
                        request.customer,
                        request.customerName,
                        request.phone,
                        request.service,
                        request.requestType,
                        request.requestReason,
                        request.reason
                    ]
                        .map(value =>
                            String(value ?? "")
                                .toLowerCase()
                        )
                        .join(" ");

                return text.includes(search);

            });

    }


    if (!list.length) {

        container.innerHTML = `
            <div class="modificationEmpty">
                No modification requests found.
            </div>
        `;

        return;
    }


    container.innerHTML =
        list
            .map(renderModificationRequestCard)
            .join("");

}

function getModificationServiceLabel(service) {
    const serviceMap = {
        Package: "Package",
        Bus: "Bus",
        Train: "Train",
        Car: "Car",
        Hotel: "Hotel",
        Flight: "Flight",
        Cab: "Cab",
        Visa: "Visa",
        Insurance: "Insurance"
    };

    return serviceMap[service] || service || "Service";
}


function getModificationRequestTypeLabel(requestType) {
    const typeMap = {
        addTraveller: "Add Traveller",
        removeTraveller: "Remove Traveller",
        editTraveller: "Edit Traveller",

        travelDate: "Travel Date",
        travelMonth: "Travel Month",

        vehicle: "Vehicle",
        vehicleType: "Vehicle Type",

        pickup: "Pickup Location",
        drop: "Drop Location",
        route: "Route",

        passenger: "Passenger Details",
        passengers: "Passenger Details",

        room: "Room Details",
        roomType: "Room Type",

        hotel: "Hotel Details",

        flightDate: "Flight Date",
        flightClass: "Flight Class",

        seat: "Seat",
        class: "Travel Class",

        cancellation: "Cancellation",
        modification: "Booking Details"
    };

    return typeMap[requestType] || formatModificationLabel(requestType);
}


function formatModificationLabel(value) {
    if (!value) {
        return "Booking Change";
    }

    return String(value)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, char => char.toUpperCase());
}

/* =========================================================
   REQUEST CARD
========================================================= */

function renderModificationRequestCard(request) {

    const status =
        String(
            request.status || "Pending"
        ).trim();

    const statusClass =
        status.toLowerCase();

    const reason =
        getModificationReason(request);

    const requestedDate =
        formatModificationDate(
            getModificationRequestedDate(request)
        );

    const bookingId =
        getModificationBookingId(request);

    const customer =
        getModificationCustomer(request);

    const phone =
        getModificationPhone(request);

    const service =
        getModificationService(request);

    const requestType =
        getModificationRequestType(request);

    const isPending =
        status.toLowerCase() === "pending";


    return `

        <div
            class="modificationRequestCard"
            data-request-id="${escapeModificationHtml(
        getModificationRequestId(request)
    )}">

            <div class="modificationRequestTop">

                <div>

                    <div class="modificationBookingId">
                        Booking:
                        ${escapeModificationHtml(
        bookingId
    )}
                    </div>

                    <div class="modificationCustomer">
                        ${escapeModificationHtml(
        customer
    )}
                        ·
                        ${escapeModificationHtml(
        phone
    )}
                    </div>

                </div>

                <div
                    class="modificationStatus ${escapeModificationHtml(
        statusClass
    )}">

                    ${escapeModificationHtml(status)}

                </div>

            </div>


            <span
    class="modificationTag modificationServiceTag"
    title="Booking service"
>
    <span class="modificationTagIcon">🧳</span>
    <span class="modificationTagLabel">SERVICE</span>
    <span class="modificationTagValue">
        ${escapeModificationHtml(
        getModificationServiceLabel(service)
    )}
    </span>
</span>

<span
    class="modificationTag modificationTypeTag"
    title="Type of modification requested"
>
    <span class="modificationTagIcon">✦</span>
    <span class="modificationTagLabel">CHANGE</span>
    <span class="modificationTagValue">
        ${escapeModificationHtml(
        getModificationRequestTypeLabel(requestType)
    )}
    </span>
</span>

<span
    class="modificationTag modificationDateTag"
    title="Modification request date"
>
    <span class="modificationTagIcon">◷</span>
    <span class="modificationTagLabel">REQUESTED</span>
    <span class="modificationTagValue">
        ${escapeModificationHtml(
        formatModificationDate(requestedDate)
    )}
    </span>
</span>

</div>


            <div class="modificationDetails">

                <strong>
                    Requested Change
                </strong>

                <div class="modificationChangeContainer">

                    ${renderModificationChange(request)}

                </div>


                ${reason
            ? `
                            <div class="modificationReason">

                                <strong>Reason:</strong>

                                ${escapeModificationHtml(
                reason
            )}

                            </div>
                        `
            : ""
        }

            </div>


            <div class="modificationActions">

<button
    type="button"
    class="modViewBtn"
    data-request-id="${escapeModificationHtml(
            getModificationRequestId(request)
        )}"
    data-booking-id="${escapeModificationHtml(
            bookingId
        )}"
>
    👁 View Booking
</button>


${isPending
            ? `

            <button
                type="button"
                class="modApproveBtn"
                data-action="approve"
                data-request-id="${escapeModificationHtml(
                getModificationRequestId(request)
            )}"
            >
                ✓ Approve
            </button>


            <button
                type="button"
                class="modRejectBtn"
                data-action="reject"
                data-request-id="${escapeModificationHtml(
                getModificationRequestId(request)
            )}"
            >
                ✕ Reject
            </button>

        `
            : ""
        }

            </div>

        </div>

    `;



}

/* =========================================================
   VIEW BOOKING BUTTON
   ---------------------------------------------------------
   Uses the request already loaded in modificationRequests.
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".modViewBtn"
            );

        if (!button) {
            return;
        }

        const requestId =
            String(
                button.dataset.requestId || ""
            ).trim();

        const bookingId =
            String(
                button.dataset.bookingId || ""
            ).trim();

        console.log(
            "========== VIEW BOOKING CLICKED =========="
        );

        console.log(
            "[MODIFICATION] Request ID:",
            requestId
        );

        console.log(
            "[MODIFICATION] Booking ID:",
            bookingId
        );


        /* -------------------------------------------------
           Find the complete modification request
        ------------------------------------------------- */

        const request =
            modificationRequests.find(
                item => {

                    const id =
                        getModificationRequestId(
                            item
                        );

                    return String(id)
                        .trim() === requestId;
                }
            );


        if (!request) {

            console.error(
                "[MODIFICATION] Request not found:",
                requestId
            );

            return;
        }


        console.log(
            "[MODIFICATION] Request found:",
            request
        );


        /* -------------------------------------------------
           Open booking
        ------------------------------------------------- */

        viewModificationBooking(
            request
        );

    }
);

function bindModificationRequestActions(requests) {

    const list =
        document.querySelector(
            ".modificationRequestList"
        );

    if (!list) {
        return;
    }


    list.onclick = function (event) {

        const button =
            event.target.closest(
                "[data-modification-action]"
            );

        if (!button) {
            return;
        }


        const action =
            button.dataset.modificationAction;


        const index =
            Number(
                button.dataset.modificationIndex
            );


        const request =
            requests[index];


        if (!request) {

            console.warn(
                "[MODIFICATION] Request not found for index:",
                index
            );

            return;
        }


        /* =============================================
           VIEW
        ============================================= */

        if (action === "view") {

            viewModificationBooking(
                request
            );

            return;
        }


        /* =============================================
           REJECT
        ============================================= */

        if (action === "reject") {

            console.log(
                "[MODIFICATION] Reject clicked:",
                request
            );

            /*
             * Keep your existing reject function here.
             */

            return;
        }

    };
}

/* =============================================
   APPROVE
============================================= */

document.addEventListener(
    "click",
    async function (event) {

        const button =
            event.target.closest(
                ".modViewBtn, .modApproveBtn, .modRejectBtn"
            );


        if (!button) {
            return;
        }


        const action =
            button.dataset.action ||
            (
                button.classList.contains(
                    "modViewBtn"
                )
                    ? "view"
                    : button.classList.contains(
                        "modApproveBtn"
                    )
                        ? "approve"
                        : "reject"
            );


        const requestId =
            button.dataset.requestId;


        console.log(
            "========== MODIFICATION ACTION CLICKED =========="
        );

        console.log(
            "[MODIFICATION] Action:",
            action
        );

        console.log(
            "[MODIFICATION] Request ID:",
            requestId
        );


        if (!requestId) {

            console.error(
                "[MODIFICATION] Missing Request ID."
            );

            alert(
                "Request ID is missing."
            );

            return;
        }


        /*
         * =============================================
         * VIEW
         * =============================================
         */

        if (action === "view") {

            console.log(
                "[MODIFICATION] Opening booking:",
                requestId
            );


            const request =
                modificationRequests.find(
                    function (item) {

                        return String(
                            getModificationRequestId(
                                item
                            )
                        ).trim() ===
                            String(
                                requestId
                            ).trim();

                    }
                );


            if (!request) {

                console.error(
                    "[MODIFICATION] Request not found:",
                    requestId
                );

                alert(
                    "Request not found. Please refresh the page."
                );

                return;
            }


            viewModificationBooking(
                request
            );

            return;
        }


        /*
         * =============================================
         * APPROVE
         * =============================================
         */

        if (action === "approve") {

            console.log(
                "[MODIFICATION] APPROVE BUTTON DETECTED:",
                requestId
            );


            /*
             * Prevent double clicking.
             */
            if (
                button.dataset.processing ===
                "true"
            ) {

                console.log(
                    "[MODIFICATION] Approval already processing:",
                    requestId
                );

                return;
            }


            button.dataset.processing =
                "true";


            button.disabled =
                true;


            try {

                await approveModification(
                    requestId
                );

            }
            catch (error) {

                console.error(
                    "[MODIFICATION] Approve handler error:",
                    error
                );

                alert(
                    "Unable to approve request."
                );

            }
            finally {

                button.dataset.processing =
                    "false";

                button.disabled =
                    false;

            }


            return;
        }


        /*
         * =============================================
         * REJECT
         * =============================================
         */

        if (action === "reject") {

            console.log(
                "[MODIFICATION] REJECT BUTTON DETECTED:",
                requestId
            );


            if (
                button.dataset.processing ===
                "true"
            ) {

                return;
            }


            button.dataset.processing =
                "true";


            button.disabled =
                true;


            try {

                await rejectModification(
                    requestId
                );

            }
            catch (error) {

                console.error(
                    "[MODIFICATION] Reject handler error:",
                    error
                );

                alert(
                    "Unable to reject request."
                );

            }
            finally {

                button.dataset.processing =
                    "false";

                button.disabled =
                    false;

            }


            return;
        }

    }
);

/* =========================================================
   MODIFICATION ACTION BUTTON HANDLER
   VIEW / APPROVE / REJECT
========================================================= */




/* =========================================================
   MODIFICATION DYNAMIC DATA NORMALIZER

========================================================= */

function parseModificationDynamicData(request) {

    if (!request) {

        return {
            currentValue: "",
            requestedValue: "",
            reason: ""
        };

    }

    /* -----------------------------------------------------
       FIRST: use normalized dynamicData returned by backend
    ----------------------------------------------------- */

    let dynamicData =
        request.dynamicData;


    /* -----------------------------------------------------
       If dynamicData somehow comes as JSON string,
       parse it.
    ----------------------------------------------------- */

    if (
        typeof dynamicData === "string"
    ) {

        dynamicData =
            parseModificationValue(
                dynamicData
            );

    }


    /* -----------------------------------------------------
       NEW STRUCTURE
    ----------------------------------------------------- */

    if (
        dynamicData &&
        typeof dynamicData === "object"
    ) {

        return {

            currentValue:
                parseModificationValue(
                    dynamicData.currentValue
                ),

            requestedValue:
                parseModificationValue(
                    dynamicData.requestedValue
                ),

            reason:
                dynamicData.reason ||
                dynamicData.requestReason ||
                ""

        };

    }


    /* -----------------------------------------------------
       FALLBACK: OLD STRUCTURE
    ----------------------------------------------------- */

    return {

        currentValue:
            parseModificationValue(
                request.currentValue
            ),

        requestedValue:
            parseModificationValue(
                request.requestedValue
            ),

        reason:
            request.requestReason ||
            request.reason ||
            ""

    };

}



/* =========================================================
   MAIN MODIFICATION CHANGE RENDERER
========================================================= */

function renderModificationChange(request) {

    if (!request) {

        return `
            <div class="modificationNoChange">
                No detailed change information.
            </div>
        `;

    }


    /* -----------------------------------------------------
       Get dynamic data
    ----------------------------------------------------- */

    let dynamic =
        request.dynamicData;


    /*
       Some API records may only have Dynamic Data as
       a JSON string.
    */

    if (typeof dynamic === "string") {

        dynamic =
            parseModificationValue(
                dynamic
            );

    }


    if (!dynamic) {

        dynamic = {};

    }


    let currentValue =
        dynamic.currentValue;


    let requestedValue =
        dynamic.requestedValue;


    /* -----------------------------------------------------
       Parse values if necessary
    ----------------------------------------------------- */

    currentValue =
        parseModificationValue(
            currentValue
        );

    requestedValue =
        parseModificationValue(
            requestedValue
        );


    /* -----------------------------------------------------
       Request type
    ----------------------------------------------------- */

    const requestType =
        String(
            request.requestType ||
            request["Request Type"] ||
            ""
        )
            .trim();


    console.log(
        "[MODIFICATION] Request:",
        request.requestId ||
        request["Request ID"]
    );

    console.log(
        "[MODIFICATION] Request Type:",
        requestType
    );

    console.log(
        "[MODIFICATION] Current:",
        currentValue
    );

    console.log(
        "[MODIFICATION] Requested:",
        requestedValue
    );




    requestedValue =
        unwrapModificationRequestedValue(
            requestedValue
        );


    /* =====================================================
       UNWRAP CURRENT VALUE
    ===================================================== */

    currentValue =
        unwrapModificationCurrentValue(
            currentValue
        );



    if (
        isPlainObject(
            requestedValue
        )
    ) {

        const requestedKeys =
            Object.keys(
                requestedValue
            );


        if (
            requestedKeys.length
        ) {

            const currentObject = {};


            requestedKeys.forEach(
                function (key) {

                    let oldValue =
                        "";


                    if (
                        isPlainObject(
                            currentValue
                        )
                    ) {

                        /*
                           First try direct field.
                        */

                        if (
                            Object.prototype.hasOwnProperty.call(
                                currentValue,
                                key
                            )
                        ) {

                            oldValue =
                                currentValue[key];

                        }

                        else {

                            /*
                               Try alternate field names.
                            */

                            const actualKey =
                                findModificationFieldInObject(
                                    currentValue,
                                    key
                                );


                            if (
                                actualKey !== null
                            ) {

                                oldValue =
                                    currentValue[
                                    actualKey
                                    ];

                            }

                        }

                    }


                    currentObject[key] =
                        oldValue;

                }
            );


            return renderModificationObjectChange(
                currentObject,
                requestedValue
            );

        }

    }




    if (
        requestedValue !== undefined &&
        requestedValue !== null &&
        requestedValue !== ""
    ) {

        let actualCurrentValue =
            "";


        /* -------------------------------------------------
           Current value is a booking object
        ------------------------------------------------- */

        if (
            isPlainObject(
                currentValue
            )
        ) {

            const actualField =
                findModificationFieldInObject(
                    currentValue,
                    requestType
                );


            if (
                actualField !== null
            ) {

                actualCurrentValue =
                    currentValue[
                    actualField
                    ];

            }

        }


        /* -------------------------------------------------
           If current field wasn't found, check raw data
        ------------------------------------------------- */

        if (
            (
                actualCurrentValue === "" ||
                actualCurrentValue === null ||
                actualCurrentValue === undefined
            ) &&
            isPlainObject(
                currentValue
            ) &&
            isPlainObject(
                currentValue.raw
            )
        ) {

            const rawField =
                findModificationFieldInObject(
                    currentValue.raw,
                    requestType
                );


            if (
                rawField !== null
            ) {

                actualCurrentValue =
                    currentValue.raw[
                    rawField
                    ];

            }

        }


        console.log(
            "[MODIFICATION] Final comparison:",
            {
                requestType:
                    requestType,

                oldValue:
                    actualCurrentValue,

                newValue:
                    requestedValue
            }
        );


        return renderModificationSimpleChangeWithField(
            requestType,
            actualCurrentValue,
            requestedValue
        );

    }


    /* =====================================================
       NOTHING FOUND
    ===================================================== */

    return `
        <div class="modificationNoChange">
            No detailed change information.
        </div>
    `;

}


/* =========================================================
   UNWRAP REQUESTED VALUE
========================================================= */

function unwrapModificationRequestedValue(
    value
) {



    while (
        isPlainObject(value) &&
        Object.prototype.hasOwnProperty.call(
            value,
            "requestedValue"
        )
    ) {

        value =
            parseModificationValue(
                value.requestedValue
            );

    }


    return value;

}


/* =========================================================
   UNWRAP CURRENT VALUE
========================================================= */

function unwrapModificationCurrentValue(
    value
) {

    while (
        isPlainObject(value) &&
        Object.prototype.hasOwnProperty.call(
            value,
            "currentValue"
        )
    ) {

        value =
            parseModificationValue(
                value.currentValue
            );

    }


    return value;

}


/* =========================================================
   FIND FIELD IN OBJECT
========================================================= */

function findModificationFieldInObject(
    object,
    requestedField
) {

    if (
        !isPlainObject(object)
    ) {

        return null;

    }


    const target =
        normalizeModificationFieldKey(
            requestedField
        );


    if (!target) {

        return null;

    }


    const keys =
        Object.keys(
            object
        );


    /* -----------------------------------------------------
       1. Direct normalized match
    ----------------------------------------------------- */

    for (
        const key
        of keys
    ) {

        if (
            normalizeModificationFieldKey(
                key
            ) === target
        ) {

            return key;

        }

    }


    /* -----------------------------------------------------
       2. Common aliases
    ----------------------------------------------------- */

    const aliases = {

        vehicle: [
            "vehicle",
            "Vehicle",
            "vehicleType",
            "Vehicle Type",
            "car",
            "Car",
            "carType",
            "Car Type"
        ],

        traveldate: [
            "travelDate",
            "Travel Date",
            "travel_date",
            "Pickup",
            "pickup"
        ],

        travelmonth: [
            "travelMonth",
            "Travel Month",
            "travel_month"
        ],

        travellername: [
            "travellerName",
            "Traveller Name",
            "traveller_name"
        ],

        travellerage: [
            "travellerAge",
            "Traveller Age",
            "traveller_age"
        ],

        travellergender: [
            "travellerGender",
            "Traveller Gender",
            "traveller_gender"
        ],

        customername: [
            "customerName",
            "Customer Name",
            "customer_name"
        ],

        bookingid: [
            "bookingId",
            "Booking ID",
            "booking_id"
        ],

        nextfollowup: [
            "nextFollowUp",
            "Next Follow Up",
            "next_follow_up"
        ],

        createddate: [
            "createdDate",
            "Created Date",
            "created_date"
        ],

        lastupdated: [
            "lastUpdated",
            "Last Updated",
            "last_updated"
        ],

        assignedto: [
            "assignedTo",
            "Assigned To",
            "assigned_to"
        ],

        paymentstatus: [
            "paymentStatus",
            "Payment Status",
            "payment_status"
        ],

        totalamount: [
            "totalAmount",
            "Total Amount",
            "total_amount"
        ],

        paidamount: [
            "paidAmount",
            "Paid Amount",
            "paid_amount"
        ],

        balanceamount: [
            "balanceAmount",
            "Balance Amount",
            "balance_amount"
        ]

    };


    const possibleKeys =
        aliases[target];


    if (
        Array.isArray(
            possibleKeys
        )
    ) {

        for (
            const possibleKey
            of possibleKeys
        ) {

            if (
                Object.prototype.hasOwnProperty.call(
                    object,
                    possibleKey
                )
            ) {

                return possibleKey;

            }

        }

    }


    return null;

}


/* =========================================================
   NORMALIZE FIELD NAME
========================================================= */

function normalizeModificationFieldKey(
    value
) {

    return String(
        value || ""
    )
        .toLowerCase()
        .replace(
            /[^a-z0-9]/g,
            ""
        );

}


/* =========================================================
   SIMPLE CHANGE WITH FIELD LABEL
========================================================= */

function renderModificationSimpleChangeWithField(
    fieldKey,
    currentValue,
    requestedValue
) {

    const label =
        getModificationFieldLabel(
            fieldKey
        );


    return `

        <div class="modificationChangeRow">

            <div class="modificationChangeLabel">

                ${escapeModificationHtml(
        label
    )}

            </div>

            <div class="modificationChangeValues">

                <span class="modificationOldValue">

                    ${escapeModificationHtml(
        formatModificationDisplayValue(
            currentValue,
            fieldKey
        )
    )}

                </span>

                <span class="modificationArrow">
                    →
                </span>

                <strong class="modificationNewValue">

                    ${escapeModificationHtml(
        formatModificationDisplayValue(
            requestedValue,
            fieldKey
        )
    )}

                </strong>

            </div>

        </div>

    `;

}


/* =========================================================
   OBJECT CHANGE RENDERER
========================================================= */

function renderModificationObjectChange(
    currentObject,
    requestedObject
) {

    if (
        !isPlainObject(
            requestedObject
        )
    ) {

        return `
            <div class="modificationNoChange">
                No detailed change information.
            </div>
        `;

    }


    const keys =
        Object.keys(
            requestedObject
        );


    if (!keys.length) {

        return `
            <div class="modificationNoChange">
                No detailed change information.
            </div>
        `;

    }


    return keys
        .map(function (key) {

            const oldValue =
                currentObject &&
                    Object.prototype.hasOwnProperty.call(
                        currentObject,
                        key
                    )
                    ? currentObject[key]
                    : "";

            const newValue =
                requestedObject[key];


            return `

                <div class="modificationChangeRow">

                    <div class="modificationChangeLabel">

                        ${escapeModificationHtml(
                getModificationFieldLabel(
                    key
                )
            )}

                    </div>

                    <div class="modificationChangeValues">

                        <span class="modificationOldValue">

                            ${escapeModificationHtml(
                formatModificationDisplayValue(
                    oldValue,
                    key
                )
            )}

                        </span>

                        <span class="modificationArrow">
                            →
                        </span>

                        <strong class="modificationNewValue">

                            ${escapeModificationHtml(
                formatModificationDisplayValue(
                    newValue,
                    key
                )
            )}

                        </strong>

                    </div>

                </div>

            `;

        })
        .join("");

}


/* =========================================================
   SIMPLE VALUE CHANGE
========================================================= */

function renderModificationSimpleChange(
    currentValue,
    requestedValue
) {

    return `

        <div class="modificationChangeRow">

            <div class="modificationChangeValues">

                <span class="modificationOldValue">

                    ${escapeModificationHtml(
        formatModificationDisplayValue(
            currentValue
        )
    )}

                </span>

                <span class="modificationArrow">
                    →
                </span>

                <strong class="modificationNewValue">

                    ${escapeModificationHtml(
        formatModificationDisplayValue(
            requestedValue
        )
    )}

                </strong>

            </div>

        </div>

    `;

}

/* =========================================================
   GET FIRST EXISTING VALUE
========================================================= */

function getFirstExistingValue(
    object,
    keys
) {

    if (
        !object ||
        typeof object !== "object"
    ) {

        return undefined;

    }


    for (
        const key
        of keys
    ) {

        if (
            Object.prototype.hasOwnProperty.call(
                object,
                key
            )
        ) {

            const value =
                object[key];

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {

                return value;

            }

        }

    }


    return undefined;

}


/* =========================================================
   EMPTY VALUE
========================================================= */

function isEmptyModificationValue(value) {

    return (
        value === undefined ||
        value === null ||
        value === ""
    );

}


/* =========================================================
   UNWRAP MODIFICATION WRAPPER
========================================================= */

function unwrapModificationWrapper(value) {

    if (
        !isPlainObject(value)
    ) {

        return {
            found: false,
            value: value,
            fieldKey: ""
        };

    }


    /*
       -----------------------------------------------------
       Common wrapper:
       
       {
           requestedValue: "...",
           requestReason: "Date change"
       }
       -----------------------------------------------------
    */

    const wrapperKeys = [

        "requestedValue",
        "Requested Value",
        "requested_value",
        "newValue",
        "New Value",
        "new_value",
        "value",
        "Value"

    ];


    for (
        const key
        of wrapperKeys
    ) {

        if (
            Object.prototype.hasOwnProperty.call(
                value,
                key
            )
        ) {

            return {

                found: true,

                value:
                    parseModificationValue(
                        value[key]
                    ),

                fieldKey:
                    getFirstExistingValue(
                        value,
                        [
                            "field",
                            "Field",
                            "fieldName",
                            "Field Name",
                            "field_name"
                        ]
                    ) || ""

            };

        }

    }


    /*
       -----------------------------------------------------
       If this is a normal modification object, don't unwrap.
       -----------------------------------------------------
    */

    return {

        found: false,

        value: value,

        fieldKey: ""

    };

}

/* =========================================================
   PARSE VALUE
========================================================= */

function parseModificationValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return value;

    }


    if (
        typeof value !== "string"
    ) {

        return value;

    }


    const text =
        value.trim();


    if (!text) {

        return "";

    }


    /*
       -----------------------------------------------------
       JSON object / array
       -----------------------------------------------------
    */

    if (
        (
            text.startsWith("{") &&
            text.endsWith("}")
        )
        ||
        (
            text.startsWith("[") &&
            text.endsWith("]")
        )
    ) {

        try {

            return JSON.parse(text);

        }

        catch (err) {

            console.warn(
                "[MODIFICATION] JSON parse failed:",
                text
            );

        }

    }


    return value;

}


/* =========================================================
   PLAIN OBJECT
========================================================= */

function isPlainObject(value) {

    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    );

}


/* =========================================================
   FIELD LABELS
========================================================= */

function getModificationFieldLabel(key) {

    const labels = {

        bookingId:
            "Booking ID",

        bookingID:
            "Booking ID",

        customerName:
            "Customer Name",

        customer:
            "Customer",

        phone:
            "Phone",

        service:
            "Service",

        travelDate:
            "Travel Date",

        travelMonth:
            "Travel Month",

        requestType:
            "Request Type",

        requestReason:
            "Reason",

        reason:
            "Reason",

        travellerName:
            "Traveller Name",

        travellerAge:
            "Traveller Age",

        travellerGender:
            "Traveller Gender",

        passengerName:
            "Passenger Name",

        passengerAge:
            "Passenger Age",

        passengerGender:
            "Passenger Gender",

        from:
            "From",

        to:
            "To",

        departureDate:
            "Departure Date",

        returnDate:
            "Return Date",

        departureTime:
            "Departure Time",

        returnTime:
            "Return Time",

        class:
            "Class",

        travelClass:
            "Class",

        passengers:
            "Passengers",

        adults:
            "Adults",

        child:
            "Children",

        children:
            "Children",

        infant:
            "Infants",

        hotel:
            "Hotel",

        roomType:
            "Room Type",

        roomCount:
            "Room Count",

        driver:
            "Driver",

        vehicle:
            "Vehicle",

        vehicleType:
            "Vehicle Type",

        pickup:
            "Pickup",

        pickupLocation:
            "Pickup Location",

        drop:
            "Drop",

        dropLocation:
            "Drop Location",

        pickupDate:
            "Pickup Date",

        pickupTime:
            "Pickup Time",

        amount:
            "Amount",

        totalAmount:
            "Total Amount",

        paidAmount:
            "Paid Amount",

        balanceAmount:
            "Balance Amount",

        paymentStatus:
            "Payment Status"

    };


    if (
        labels[key]
    ) {

        return labels[key];

    }


    return String(key || "")
        .replace(
            /([a-z])([A-Z])/g,
            "$1 $2"
        )
        .replace(
            /[_-]+/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim()
        .replace(
            /\b\w/g,
            function (char) {

                return char.toUpperCase();

            }
        );

}


/* =========================================================
   FORMAT DISPLAY VALUE
========================================================= */

function formatModificationDisplayValue(
    value,
    fieldKey
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-";

    }


    /*
       OBJECT
    */

    if (
        typeof value === "object"
    ) {

        return formatModificationObjectInline(
            value
        );

    }


    /*
       DATE FIELD
    */

    if (
        fieldKey &&
        isModificationDateField(
            fieldKey
        )
    ) {

        return formatModificationDateOnly(
            value
        );

    }


    /*
       ISO DATE STRING
    */

    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}(T|$)/.test(
            value.trim()
        )
    ) {

        return formatModificationDateOnly(
            value
        );

    }


    return String(value);

}


/* =========================================================
   OBJECT INLINE FORMAT
========================================================= */

function formatModificationObjectInline(
    object
) {

    if (!object) {

        return "-";

    }


    if (Array.isArray(object)) {

        return object
            .map(function (item) {

                return formatModificationDisplayValue(
                    item
                );

            })
            .join(", ");

    }


    return Object.keys(object)
        .map(function (key) {

            return (
                getModificationFieldLabel(
                    key
                ) +
                ": " +
                formatModificationDisplayValue(
                    object[key],
                    key
                )
            );

        })
        .join(" • ");

}


/* =========================================================
   DATE FIELD DETECTION
========================================================= */

function isModificationDateField(
    key
) {

    const normalized =
        String(key || "")
            .toLowerCase();


    return (
        normalized.includes("date") ||
        normalized.includes("time")
    );

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatModificationDateOnly(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

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


/* =========================================================
   REQUESTED DATE
========================================================= */

function getModificationRequestedDate(
    request
) {

    return getFirstExistingValue(
        request,
        [
            "requestedDate",
            "Requested Date",
            "requested_date",
            "createdDate",
            "Created Date"
        ]
    );

}


/* =========================================================
   REQUEST ID
========================================================= */

function getModificationRequestId(
    request
) {

    return String(
        getFirstExistingValue(
            request,
            [
                "requestId",
                "Request ID",
                "request_id",
                "_requestId"
            ]
        ) || ""
    );

}


/* =========================================================
   BOOKING ID
========================================================= */

function getModificationBookingId(
    request
) {

    return String(
        getFirstExistingValue(
            request,
            [
                "bookingId",
                "Booking ID",
                "booking_id"
            ]
        ) || "-"
    );

}


/* =========================================================
   CUSTOMER
========================================================= */

function getModificationCustomer(
    request
) {

    return String(
        getFirstExistingValue(
            request,
            [
                "customer",
                "customerName",
                "Customer Name",
                "Customer"
            ]
        ) || "-"
    );

}


/* =========================================================
   PHONE
========================================================= */

function getModificationPhone(
    request
) {

    return String(
        getFirstExistingValue(
            request,
            [
                "phone",
                "Phone",
                "mobile",
                "Mobile",
                "mobileNumber"
            ]
        ) || "-"
    );

}


/* =========================================================
   SERVICE
========================================================= */

function getModificationService(
    request
) {

    return String(
        getFirstExistingValue(
            request,
            [
                "service",
                "Service"
            ]
        ) || "-"
    );

}


/* =========================================================
   REQUEST TYPE
========================================================= */

function getModificationRequestType(
    request
) {

    return String(
        getFirstExistingValue(
            request,
            [
                "requestType",
                "Request Type",
                "request_type",
                "type"
            ]
        ) || "-"
    );

}


/* =========================================================
   REASON
========================================================= */

function getModificationReason(
    request
) {

    return String(
        getFirstExistingValue(
            request,
            [
                "requestReason",
                "Request Reason",
                "request_reason",
                "reason",
                "Reason"
            ]
        ) || ""
    );

}


/* =========================================================
   GENERIC DATE
========================================================= */

function formatModificationDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleString(
        "en-IN"
    );

}









/* =========================================================
   VIEW BOOKING
========================================================= */

/* =========================================================
   VIEW BOOKING
   Opens a read-only booking details modal
========================================================= */

/* =========================================================
   VIEW MODIFICATION BOOKING
   ---------------------------------------------------------
   Finds the booking and opens the read-only booking modal.
========================================================= */

function viewModificationBooking(
    request
) {

    console.log(
        "========== VIEW MODIFICATION BOOKING =========="
    );

    console.log(
        "[MODIFICATION] Request:",
        request
    );


    if (!request) {

        console.error(
            "[MODIFICATION] No request supplied."
        );

        return;
    }


    const bookingId =
        getModificationBookingId(
            request
        );


    const requestId =
        getModificationRequestId(
            request
        );


    console.log(
        "[MODIFICATION] Request ID:",
        requestId
    );

    console.log(
        "[MODIFICATION] Booking ID:",
        bookingId
    );


    if (!bookingId) {

        console.error(
            "[MODIFICATION] Booking ID missing."
        );

        showModificationBookingModalMessage(
            "This modification request does not contain a valid booking ID."
        );

        return;
    }


    /* =====================================================
       FIRST: search existing dashboard booking collections
    ===================================================== */

    let booking =
        findDashboardBookingById(
            bookingId
        );


    /* =====================================================
       SECOND: use modification request's currentValue
       as fallback.

       This is important because your API already returns
       the complete current booking inside dynamicData.
    ===================================================== */

    if (!booking) {

        const dynamicData =
            parseModificationDynamicData(
                request
            );


        const currentValue =
            dynamicData.currentValue;


        if (
            currentValue &&
            typeof currentValue === "object"
        ) {

            const currentBookingId =
                String(
                    currentValue.bookingId ||
                    currentValue["Booking ID"] ||
                    ""
                ).trim();


            if (
                currentBookingId ===
                String(bookingId).trim()
            ) {

                booking =
                    currentValue;

                console.log(
                    "[MODIFICATION] Using currentValue as booking fallback."
                );
            }
        }
    }


    /* =====================================================
       BOOKING NOT FOUND
    ===================================================== */

    if (!booking) {

        console.warn(
            "[MODIFICATION] Booking not found:",
            bookingId
        );

        showModificationBookingModalMessage(
            "Booking " +
            bookingId +
            " could not be loaded."
        );

        return;
    }


    console.log(
        "[MODIFICATION] Booking found:",
        booking
    );


    /* =====================================================
       OPEN READ-ONLY MODAL
    ===================================================== */

    openModificationBookingModal(
        booking,
        request
    );

}


function escapeModificationBookingHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {
        return "-";
    }


    return String(value)
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

function formatModificationBookingDate(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    /*
     * ---------------------------------------------------------
     * OBJECT VALUE
     *
     * Some booking records may contain:
     *
     * {
     *     month: "September",
     *     day: 12,
     *     year: 2026
     * }
     *
     * or similar structures.
     * ---------------------------------------------------------
     */

    if (
        typeof value === "object" &&
        !Array.isArray(value)
    ) {

        const month =
            value.month ??
            value.Month ??
            value.travelMonth ??
            value["Travel Month"];

        const day =
            value.day ??
            value.Day ??
            value.date ??
            value.Date;

        const year =
            value.year ??
            value.Year;

        /*
         * If only month exists, don't generate
         * "September undefined".
         */
        if (
            month &&
            (
                day === undefined ||
                day === null ||
                day === ""
            )
        ) {

            return String(month);
        }

        /*
         * Month + day + year
         */
        if (month && day && year) {

            return `${month} ${day}, ${year}`;
        }

        /*
         * Month + day
         */
        if (month && day) {

            return `${month} ${day}`;
        }

        /*
         * Try common nested date properties.
         */
        const nestedDate =
            value.value ??
            value.dateValue ??
            value.travelDate;

        if (nestedDate) {

            return formatModificationBookingDate(
                nestedDate
            );
        }

        /*
         * Last resort for object.
         */
        try {

            return Object.entries(value)
                .map(([key, val]) =>
                    `${key}: ${val}`
                )
                .join(" · ");

        }
        catch (error) {

            return String(value);
        }
    }


    /*
     * ---------------------------------------------------------
     * NORMAL STRING
     * ---------------------------------------------------------
     */

    const text =
        String(value).trim();

    if (!text) {
        return "-";
    }


    /*
     * If it's already a human-readable month,
     * DON'T send it through new Date().
     *
     * Example:
     * "September"
     * "August"
     * "July 2026"
     */
    if (
        /^[A-Za-z]+$/.test(text) ||
        /^[A-Za-z]+\s+\d{4}$/.test(text)
    ) {

        return text;
    }


    /*
     * ISO / normal date.
     */
    const date =
        new Date(text);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return text;
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function formatModificationBookingAmount(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }


    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {
        return String(value);
    }


    return number.toLocaleString(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    );
}

function getModificationBookingStatusClass(status) {

    const normalized =
        String(status || "")
            .trim()
            .toLowerCase();

    if (normalized === "confirmed") {
        return "confirmed";
    }

    if (normalized === "pending") {
        return "pending";
    }

    if (normalized === "called") {
        return "called";
    }

    if (normalized === "new") {
        return "new";
    }

    return "";
}

/* =========================================================
   OPEN BOOKING DETAILS MODAL
========================================================= */

function openModificationBookingModal(
    booking,
    request
) {

    console.log(
        "========== VIEW BOOKING DATA =========="
    );

    console.log(
        "[MODIFICATION] Full booking:",
        booking
    );

    console.log(
        "[MODIFICATION] Booking raw:",
        booking?.raw
    );

    console.log(
        "[MODIFICATION] Full request:",
        request
    );

    console.log(
        "[MODIFICATION] Travel Date:",
        booking?.travelDate,
        booking?.raw?.["Travel Date"]
    );

    console.log(
        "[MODIFICATION] Notes:",
        booking?.notes,
        booking?.raw?.["Notes"]
    );

    console.log(
        "========================================"
    );


    closeModificationBookingModal();


    const safe =
        escapeModificationBookingHtml;


    const raw =
        booking.raw &&
            typeof booking.raw === "object"
            ? booking.raw
            : {};


    const bookingId =
        booking.bookingId ||
        raw["Booking ID"] ||
        request?.bookingId ||
        "-";


    const customer =
        booking.customerName ||
        booking.customer ||
        raw["Customer Name"] ||
        request?.customer ||
        "-";


    const phone =
        booking.phone ||
        raw["Phone"] ||
        request?.phone ||
        "-";


    const service =
        booking.service ||
        raw["_service"] ||
        "-";


    const status =
        booking.status ||
        raw["Status"] ||
        "-";

    const statusClass =
        String(status)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");


    const travelDate =
        booking.travelDate ||
        raw["Travel Date"] ||
        raw["Pickup"] ||
        "-";


    const route =
        booking.route ||
        booking.location ||
        raw["Location"] ||
        (
            raw["From"] &&
                raw["To"]
                ? `${raw["From"]} → ${raw["To"]}`
                : "-"
        );


    const priority =
        booking.priority ||
        raw["Priority"] ||
        "-";


    const assignedTo =
        booking.assignedTo ||
        raw["Assigned To"] ||
        "-";


    const source =
        booking.source ||
        raw["Source"] ||
        "-";


    const notes =
        booking.notes ||
        raw["Notes"] ||
        "-";


    const totalAmount =
        booking.totalAmount ??
        raw["Total Amount"] ??
        raw["Estimated Fare"] ??
        raw["Revenue"] ??
        null;


    const paidAmount =
        booking.paidAmount ??
        raw["Paid Amount"] ??
        null;


    const balanceAmount =
        booking.balanceAmount ??
        raw["Balance Amount"] ??
        null;


    const paymentStatus =
        booking.paymentStatus ||
        raw["Payment Status"] ||
        "-";


    const requestId =
        request?.requestId ||
        request?.["Request ID"] ||
        "-";


    const requestedDate =
        request?.requestedDate ||
        request?.["Requested Date"] ||
        "-";


    const modal =
        document.createElement("div");


    modal.className =
        "modificationBookingModal";


    modal.id =
        "modificationBookingModal";


    modal.innerHTML = `

        <div
            class="modificationBookingModalContent"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modificationBookingModalTitle"
        >

            <div class="modificationBookingModalHeader">

                <div>

                    <h3
                        id="modificationBookingModalTitle"
                        class="modificationBookingModalTitle"
                    >
                        Booking Details
                    </h3>

                    <div
                        class="modificationBookingModalSubtitle"
                    >
                        Read-only booking information
                        · Request ${safe(requestId)}
                    </div>

                </div>


                <button
                    type="button"
                    class="modificationBookingModalClose"
                    id="modificationBookingModalClose"
                    aria-label="Close booking details"
                >
                    ×
                </button>

            </div>


            <div class="modificationBookingModalBody">


                <!-- SUMMARY -->

                <div class="modificationBookingSummary">

                    <div class="modificationBookingSummaryItem">
                        <div class="modificationBookingSummaryLabel">
                            Booking ID
                        </div>

                        <div class="modificationBookingSummaryValue">
                            ${safe(bookingId)}
                        </div>
                    </div>


                    <div class="modificationBookingSummaryItem">
                        <div class="modificationBookingSummaryLabel">
                            Customer
                        </div>

                        <div class="modificationBookingSummaryValue">
                            ${safe(customer)}
                        </div>
                    </div>


                    <div class="modificationBookingSummaryItem">
                        <div class="modificationBookingSummaryLabel">
                            Service
                        </div>

                        <div class="modificationBookingSummaryValue">
                            ${safe(service)}
                        </div>
                    </div>


                    <div class="modificationBookingSummaryItem">
                        <div class="modificationBookingSummaryLabel">
                            Phone
                        </div>

                        <div class="modificationBookingSummaryValue">
                            ${safe(phone)}
                        </div>
                    </div>


                    <div class="modificationBookingSummaryItem">
                        <div class="modificationBookingSummaryLabel">
                            Status
                        </div>

                        <div class="modificationBookingSummaryValue">

<span
    class="modificationBookingStatusPill ${safe(statusClass)}"
>
    ${safe(status)}
</span>

                        </div>
                    </div>


                    <div class="modificationBookingSummaryItem">
                        <div class="modificationBookingSummaryLabel">
                            Request Date
                        </div>

                        <div class="modificationBookingSummaryValue">
                            ${safe(
        formatModificationBookingDate(
            requestedDate
        )
    )}
                        </div>
                    </div>

                </div>


                <!-- BOOKING INFORMATION -->

                <div class="modificationBookingSection">

                    <div class="modificationBookingSectionTitle">
                        Booking Information
                    </div>


                    <div class="modificationBookingDetailGrid">


                        <div class="modificationBookingDetailItem">

                            <div class="modificationBookingDetailLabel">
                                Travel Date
                            </div>

                            <div class="modificationBookingDetailValue">
                                ${safe(
        formatModificationBookingDate(
            travelDate
        )
    )}
                            </div>

                        </div>


                        <div class="modificationBookingDetailItem">

                            <div class="modificationBookingDetailLabel">
                                Route
                            </div>

                            <div class="modificationBookingDetailValue">
                                ${safe(route)}
                            </div>

                        </div>


                        <div class="modificationBookingDetailItem">

                            <div class="modificationBookingDetailLabel">
                                Priority
                            </div>

                            <div class="modificationBookingDetailValue">
                                ${safe(priority)}
                            </div>

                        </div>


                        <div class="modificationBookingDetailItem">

                            <div class="modificationBookingDetailLabel">
                                Assigned To
                            </div>

                            <div class="modificationBookingDetailValue">
                                ${safe(assignedTo)}
                            </div>

                        </div>


                        <div class="modificationBookingDetailItem">

                            <div class="modificationBookingDetailLabel">
                                Source
                            </div>

                            <div class="modificationBookingDetailValue">
                                ${safe(source)}
                            </div>

                        </div>


                        <div class="modificationBookingDetailItem">

                            <div class="modificationBookingDetailLabel">
                                Total Amount
                            </div>

                            <div class="modificationBookingDetailValue">
                                ${safe(
        formatModificationBookingAmount(
            totalAmount
        )
    )}
                            </div>

                        </div>


                        <div class="modificationBookingDetailItem">

                            <div class="modificationBookingDetailLabel">
                                Paid Amount
                            </div>

                            <div class="modificationBookingDetailValue">
                                ${safe(
        formatModificationBookingAmount(
            paidAmount
        )
    )}
                            </div>

                        </div>


                        <div class="modificationBookingDetailItem">

                            <div class="modificationBookingDetailLabel">
                                Balance Amount
                            </div>

                            <div class="modificationBookingDetailValue">
                                ${safe(
        formatModificationBookingAmount(
            balanceAmount
        )
    )}
                            </div>

                        </div>


                        <div class="modificationBookingDetailItem">

                            <div class="modificationBookingDetailLabel">
                                Payment Status
                            </div>

                            <div class="modificationBookingDetailValue">
                                ${safe(paymentStatus)}
                            </div>

                        </div>


                    </div>

                </div>


                <!-- NOTES -->

                <div class="modificationBookingSection">

                    <div class="modificationBookingSectionTitle">
                        Notes
                    </div>

<div class="modificationBookingNotesBox">
    ${safe(notes)}
</div>

                </div>


            </div>


            <div class="modificationBookingModalFooter">

                <button
                    type="button"
                    class="modificationBookingModalDone"
                    id="modificationBookingModalDone"
                >
                    Close
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );

    document.addEventListener(
        "keydown",
        modificationBookingEscapeHandler
    );


    const closeButton =
        modal.querySelector(
            "#modificationBookingModalClose"
        );


    const doneButton =
        modal.querySelector(
            "#modificationBookingModalDone"
        );


    closeButton?.addEventListener(
        "click",
        closeModificationBookingModal
    );


    doneButton?.addEventListener(
        "click",
        closeModificationBookingModal
    );


    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === modal
            ) {

                closeModificationBookingModal();

            }

        }
    );


    document.body.style.overflow =
        "hidden";


    setTimeout(
        function () {

            closeButton?.focus();

        },
        0
    );

}

function closeModificationBookingModal() {

    const modal =
        document.getElementById(
            "modificationBookingModal"
        );


    if (modal) {
        modal.remove();
    }


    document.removeEventListener(
        "keydown",
        modificationBookingEscapeHandler
    );


    document.body.style.overflow =
        "";
}

function modificationBookingEscapeHandler(
    event
) {

    if (
        event.key === "Escape"
    ) {

        closeModificationBookingModal();

    }

}

function showModificationBookingModalMessage(
    message
) {

    closeModificationBookingModal();


    const safe =
        escapeModificationBookingHtml(
            message
        );


    const modal =
        document.createElement("div");


    modal.className =
        "modificationBookingModal";


    modal.id =
        "modificationBookingModal";


    modal.innerHTML = `

        <div
            class="modificationBookingModalContent"
            role="dialog"
            aria-modal="true"
        >

            <div
                class="modificationBookingModalHeader"
            >

                <div>

                    <h3
                        class="modificationBookingModalTitle"
                    >
                        Booking Details
                    </h3>

                    <div
                        class="modificationBookingModalSubtitle"
                    >
                        Unable to load booking
                    </div>

                </div>


                <button
                    type="button"
                    class="modificationBookingModalClose"
                    onclick="closeModificationBookingModal()"
                >
                    ×
                </button>

            </div>


            <div
                class="modificationBookingModalBody"
            >

                <div
                    class="modificationNoChange"
                >
                    ${safe}
                </div>

            </div>


            <div
                class="modificationBookingModalFooter"
            >

                <button
                    type="button"
                    class="modificationBookingModalDone"
                    onclick="closeModificationBookingModal()"
                >
                    Close
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );

    document.body.style.overflow =
        "hidden";
}



/* =========================================================
   FIND BOOKING
========================================================= */

function findDashboardBookingById(
    bookingId
) {

    const id =
        String(
            bookingId || ""
        )
            .trim();


    if (!id) {
        return null;
    }


    const collections = [

        window.customerBookings,

        window.allBookings,

        window.dashboardBookings,

        window.crmBookings

    ];


    for (
        const collection
        of collections
    ) {

        if (
            !Array.isArray(
                collection
            )
        ) {

            continue;

        }


        const found =
            collection.find(
                item => {

                    return String(
                        item.bookingId ||
                        item["Booking ID"] ||
                        item["booking_id"] ||
                        ""
                    )
                        .trim() === id;

                }
            );


        if (found) {

            return found;

        }

    }


    return null;

}


/*=========================================================
  APPROVE BUTTON SPINNER CSS
=========================================================*/

if (
    !document.getElementById(
        "modificationApproveSpinnerStyle"
    )
) {

    const style =
        document.createElement("style");

    style.id =
        "modificationApproveSpinnerStyle";

    style.textContent = `

        @keyframes modificationApproveSpin {

            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }

        }

        .modification-approve-spinner {

            display: inline-block;

            width: 14px;

            height: 14px;

            border: 2px solid currentColor;

            border-right-color: transparent;

            border-radius: 50%;

            animation:
                modificationApproveSpin
                0.7s linear infinite;

            vertical-align: middle;

            margin-right: 6px;

        }

    `;

    document.head.appendChild(
        style
    );

}


/*=========================================================
  APPROVE BUTTON LOADING
=========================================================*/

function setModificationApproveLoading(
    requestId,
    loading
) {

    const id =
        String(
            requestId || ""
        ).trim();

    if (!id) {
        return;
    }


    /*
     * Find approve button using the request ID.
     */

    const buttons =
        document.querySelectorAll(
            "[data-action='approve'], " +
            "[data-modification-action='approve']"
        );


    buttons.forEach(function (button) {

        const buttonRequestId =
            String(
                button.dataset.requestId ||
                button.getAttribute(
                    "data-request-id"
                ) ||
                ""
            ).trim();


        if (
            buttonRequestId !== id
        ) {
            return;
        }


        /*
         * Store original button HTML.
         */

        if (
            !button.dataset.originalHtml
        ) {

            button.dataset.originalHtml =
                button.innerHTML;

        }


        if (loading) {

            button.disabled = true;

            button.style.pointerEvents =
                "none";

            button.innerHTML =

                `<span
                    class="modification-approve-spinner">
                 </span>
                 Approving...`;

        }
        else {

            button.disabled = false;

            button.style.pointerEvents =
                "";

            if (
                button.dataset.originalHtml
            ) {

                button.innerHTML =
                    button.dataset.originalHtml;

            }

        }

    });

}


/*=========================================================
  SUCCESS TOAST
=========================================================*/

function showModificationToast(
    message,
    type
) {

    /*
     * Remove previous toast.
     */

    const existing =
        document.getElementById(
            "modificationApproveToast"
        );

    if (existing) {
        existing.remove();
    }


    const toast =
        document.createElement("div");

    toast.id =
        "modificationApproveToast";


    toast.textContent =
        message;


    toast.style.position =
        "fixed";

    toast.style.top =
        "20px";

    toast.style.right =
        "20px";

    toast.style.zIndex =
        "999999";

    toast.style.padding =
        "12px 18px";

    toast.style.borderRadius =
        "8px";

    toast.style.fontSize =
        "14px";

    toast.style.fontWeight =
        "600";

    toast.style.boxShadow =
        "0 4px 15px rgba(0,0,0,0.18)";

    toast.style.background =
        type === "error"
            ? "#dc3545"
            : "#198754";

    toast.style.color =
        "#ffffff";


    document.body.appendChild(
        toast
    );


    setTimeout(function () {

        if (toast) {
            toast.remove();
        }

    }, 3000);

}

/*=========================================================
  MODIFICATION CONFIRMATION MODAL
=========================================================*/

/* =========================================================
   MODIFICATION CONFIRM MODAL
   ---------------------------------------------------------
   Reusable confirmation modal for Approve / Reject.
========================================================= */

function showModificationConfirmModal(
    options
) {

    options =
        options || {};


    const requestId =
        String(
            options.requestId || ""
        ).trim();


    const action =
        String(
            options.action || ""
        ).trim()
        .toLowerCase();


    const title =
        options.title ||
        "Confirm Action";


    const message =
        options.message ||
        "Are you sure?";


    const confirmText =
        options.confirmText ||
        "Confirm";


    const cancelText =
        options.cancelText ||
        "Cancel";


    const onConfirm =
        typeof options.onConfirm ===
        "function"
            ? options.onConfirm
            : function () {};


    const onCancel =
        typeof options.onCancel ===
        "function"
            ? options.onCancel
            : function () {};


    /* =====================================================
       REMOVE EXISTING MODAL
    ===================================================== */

    const existing =
        document.getElementById(
            "modificationConfirmModal"
        );


    if (existing) {

        existing.remove();

    }


    /* =====================================================
       OVERLAY
    ===================================================== */

    const overlay =
        document.createElement("div");


    overlay.id =
        "modificationConfirmModal";


    overlay.style.position =
        "fixed";

    overlay.style.inset =
        "0";

    overlay.style.zIndex =
        "1000000";

    overlay.style.background =
        "rgba(0,0,0,0.45)";

    overlay.style.display =
        "flex";

    overlay.style.alignItems =
        "center";

    overlay.style.justifyContent =
        "center";

    overlay.style.padding =
        "20px";


    /* =====================================================
       MODAL
    ===================================================== */

    const modal =
        document.createElement("div");


    modal.style.width =
        "100%";

    modal.style.maxWidth =
        "420px";

    modal.style.background =
        "#ffffff";

    modal.style.borderRadius =
        "12px";

    modal.style.padding =
        "20px";

    modal.style.boxShadow =
        "0 15px 45px rgba(0,0,0,0.25)";

    modal.style.fontFamily =
        "Arial, sans-serif";


    /* =====================================================
       TITLE
    ===================================================== */

    const heading =
        document.createElement("div");


    heading.textContent =
        title;


    heading.style.fontSize =
        "17px";

    heading.style.fontWeight =
        "700";

    heading.style.marginBottom =
        "10px";

    heading.style.color =
        "#222";


    /* =====================================================
       MESSAGE
    ===================================================== */

    const body =
        document.createElement("div");


    body.textContent =
        message;


    body.style.fontSize =
        "14px";

    body.style.lineHeight =
        "1.5";

    body.style.color =
        "#555";

    body.style.marginBottom =
        "18px";


    /* =====================================================
       BUTTON CONTAINER
    ===================================================== */

    const actions =
        document.createElement("div");


    actions.style.display =
        "flex";

    actions.style.justifyContent =
        "flex-end";

    actions.style.gap =
        "8px";


    /* =====================================================
       CANCEL BUTTON
    ===================================================== */

    const cancelButton =
        document.createElement("button");


    cancelButton.type =
        "button";


    cancelButton.textContent =
        cancelText;


    cancelButton.style.padding =
        "8px 15px";

    cancelButton.style.borderRadius =
        "7px";

    cancelButton.style.border =
        "1px solid #ced4da";

    cancelButton.style.background =
        "#ffffff";

    cancelButton.style.color =
        "#333";

    cancelButton.style.cursor =
        "pointer";

    cancelButton.style.fontWeight =
        "600";


    /* =====================================================
       CONFIRM BUTTON
    ===================================================== */

    const confirmButton =
        document.createElement("button");


    confirmButton.type =
        "button";


    confirmButton.textContent =
        confirmText;


    confirmButton.style.padding =
        "8px 15px";

    confirmButton.style.borderRadius =
        "7px";

    confirmButton.style.border =
        "0";

    confirmButton.style.color =
        "#ffffff";

    confirmButton.style.cursor =
        "pointer";

    confirmButton.style.fontWeight =
        "600";


    /* =====================================================
       BUTTON COLOR
    ===================================================== */

    if (action === "reject") {

        confirmButton.style.background =
            "#dc3545";

    }
    else {

        confirmButton.style.background =
            "#198754";

    }


    /* =====================================================
       CANCEL HANDLER
    ===================================================== */

    cancelButton.addEventListener(
        "click",
        function () {

            overlay.remove();

            try {

                onCancel();

            }
            catch (error) {

                console.error(
                    "[MODIFICATION] Modal cancel error:",
                    error
                );

            }

        }
    );


    /* =====================================================
       CONFIRM HANDLER
    ===================================================== */

    confirmButton.addEventListener(
        "click",
        async function () {

            /*
             * Prevent double click.
             */

            if (
                confirmButton.dataset.loading ===
                "true"
            ) {

                return;

            }


            confirmButton.dataset.loading =
                "true";


            confirmButton.disabled =
                true;

            cancelButton.disabled =
                true;


            /* =================================================
               SHOW MODAL BUTTON SPINNER
            ================================================= */

            const originalText =
                confirmButton.textContent;


            confirmButton.innerHTML = `

                <span
                    style="
                        display:inline-block;
                        width:12px;
                        height:12px;
                        border:2px solid currentColor;
                        border-top-color:transparent;
                        border-radius:50%;
                        animation:modificationConfirmSpin .7s linear infinite;
                        margin-right:7px;
                        vertical-align:-2px;
                    "
                ></span>

                ${action === "reject"
                    ? "Rejecting..."
                    : "Processing..."
                }

            `;


            try {

                /*
                 * IMPORTANT:
                 *
                 * Wait for the actual API operation.
                 */

                await onConfirm();


                /*
                 * API function normally shows the
                 * success toast and refreshes the page.
                 *
                 * Remove modal after completion.
                 */

                if (
                    document.body.contains(
                        overlay
                    )
                ) {

                    overlay.remove();

                }

            }


            catch (error) {

                console.error(
                    "[MODIFICATION] Confirmation action error:",
                    error
                );


                /*
                 * Restore buttons if API function throws.
                 */

                confirmButton.dataset.loading =
                    "false";

                confirmButton.disabled =
                    false;

                cancelButton.disabled =
                    false;

                confirmButton.textContent =
                    originalText;


                showModificationToast(
                    action === "reject"
                        ? "Unable to reject modification request."
                        : "Unable to process modification request.",
                    "error"
                );

            }

        }
    );


    /* =====================================================
       BUILD MODAL
    ===================================================== */

    actions.appendChild(
        cancelButton
    );

    actions.appendChild(
        confirmButton
    );


    modal.appendChild(
        heading
    );

    modal.appendChild(
        body
    );

    modal.appendChild(
        actions
    );


    overlay.appendChild(
        modal
    );


    document.body.appendChild(
        overlay
    );

}

/*=========================================================
  MODIFICATION CONFIRM MODAL SPINNER
=========================================================*/

if (
    !document.getElementById(
        "modificationConfirmSpinnerStyle"
    )
) {

    const style =
        document.createElement("style");


    style.id =
        "modificationConfirmSpinnerStyle";


    style.textContent = `

        @keyframes modificationConfirmSpin {

            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }

        }

    `;


    document.head.appendChild(
        style
    );

}

/*=========================================================
  APPROVE CONFIRMATION TOAST
=========================================================*/

function showModificationApproveConfirmation(
    requestId
) {

    return new Promise(function (resolve) {

        const id =
            String(
                requestId || ""
            ).trim();


        /*
         * Remove any existing confirmation.
         */

        const existing =
            document.getElementById(
                "modificationApproveConfirmToast"
            );

        if (existing) {
            existing.remove();
        }


        /*
         * Create confirmation container.
         */

        const toast =
            document.createElement("div");

        toast.id =
            "modificationApproveConfirmToast";


        toast.style.position =
            "fixed";

        toast.style.top =
            "20px";

        toast.style.right =
            "20px";

        toast.style.zIndex =
            "1000000";

        toast.style.width =
            "320px";

        toast.style.padding =
            "16px";

        toast.style.borderRadius =
            "10px";

        toast.style.background =
            "#ffffff";

        toast.style.color =
            "#222222";

        toast.style.boxShadow =
            "0 6px 25px rgba(0,0,0,0.20)";

        toast.style.border =
            "1px solid #e5e7eb";


        /*
         * Message.
         */

        const message =
            document.createElement("div");

        message.textContent =
            "Approve modification request " +
            id +
            "?";

        message.style.fontSize =
            "14px";

        message.style.fontWeight =
            "600";

        message.style.marginBottom =
            "12px";


        /*
         * Button container.
         */

        const actions =
            document.createElement("div");

        actions.style.display =
            "flex";

        actions.style.gap =
            "8px";


        /*
         * Approve button.
         */

        const approveButton =
            document.createElement("button");

        approveButton.type =
            "button";

        approveButton.textContent =
            "Approve";

        approveButton.style.border =
            "0";

        approveButton.style.borderRadius =
            "6px";

        approveButton.style.padding =
            "7px 14px";

        approveButton.style.background =
            "#198754";

        approveButton.style.color =
            "#ffffff";

        approveButton.style.cursor =
            "pointer";

        approveButton.style.fontWeight =
            "600";


        /*
         * Cancel button.
         */

        const cancelButton =
            document.createElement("button");

        cancelButton.type =
            "button";

        cancelButton.textContent =
            "Cancel";

        cancelButton.style.border =
            "1px solid #ced4da";

        cancelButton.style.borderRadius =
            "6px";

        cancelButton.style.padding =
            "7px 14px";

        cancelButton.style.background =
            "#ffffff";

        cancelButton.style.color =
            "#333333";

        cancelButton.style.cursor =
            "pointer";


        /*
         * APPROVE.
         */

        approveButton.addEventListener(
            "click",
            function () {

                toast.remove();

                resolve(true);

            }
        );


        /*
         * CANCEL.
         */

        cancelButton.addEventListener(
            "click",
            function () {

                toast.remove();

                resolve(false);

            }
        );


        /*
         * Build toast.
         */

        actions.appendChild(
            approveButton
        );

        actions.appendChild(
            cancelButton
        );

        toast.appendChild(
            message
        );

        toast.appendChild(
            actions
        );


        document.body.appendChild(
            toast
        );

    });

}

/* =========================================================
   APPROVE
========================================================= */

/* =========================================================
   APPROVE MODIFICATION REQUEST
========================================================= */

async function approveModification(
    requestId
) {

    const id =
        String(
            requestId || ""
        ).trim();


    if (!id) {

        console.error(
            "[MODIFICATION] Approve aborted: Request ID missing."
        );

        showModificationToast(
            "Unable to approve request. Request ID is missing.",
            "error"
        );

        return false;
    }


    /*
     * Find current request.
     */

    const request =
        modificationRequests.find(
            function (item) {

                return (
                    String(
                        getModificationRequestId(
                            item
                        )
                    ).trim() === id
                );

            }
        );


    if (!request) {

        console.error(
            "[MODIFICATION] Approve aborted: request not found:",
            id
        );

        showModificationToast(
            "Modification request was not found. Please refresh the page.",
            "error"
        );

        return false;
    }


    console.log(
        "========== APPROVE MODIFICATION =========="
    );

    console.log(
        "[MODIFICATION] Request ID:",
        id
    );

    console.log(
        "[MODIFICATION] Request:",
        request
    );


    /*
     * Check status.
     */

    const currentStatus =
        String(
            request.status ||
            request.Status ||
            ""
        )
            .trim()
            .toLowerCase();


    if (
        currentStatus &&
        currentStatus !== "pending"
    ) {

        showModificationToast(
            "This request is already " +
            currentStatus +
            ".",
            "error"
        );

        return false;
    }


    /*
     * Confirmation.
     *
     * Keep this because it is useful for admin.
     */

    /*=========================================================
      TOAST CONFIRMATION
    =========================================================*/

    const confirmed =
        await showModificationApproveConfirmation(
            id
        );


    if (!confirmed) {

        console.log(
            "[MODIFICATION] Approval cancelled:",
            id
        );

        return false;
    }


    /*
     * Admin.
     */

    const admin =
        String(
            window.currentAdminName ||
            window.currentAdmin ||
            "Admin"
        ).trim() ||
        "Admin";


    /*
     * Remarks.
     */

    const remarks = "";


    /*
     * START LOADING
     *
     * IMPORTANT:
     * This function is now defined above.
     */

    setModificationApproveLoading(
        id,
        true
    );


    let result;


    try {

        console.log(
            "[MODIFICATION] Sending approve request..."
        );

        console.log(
            "[MODIFICATION] API:",
            "approveModificationRequest"
        );

        const payload = {

            env:
                window.DASHBOARD_ENV ||
                "LIVE",

            requestId:
                id,

            admin:
                admin,

            remarks:
                remarks

        };


        console.log(
            "[MODIFICATION] Payload:",
            payload
        );


        /*
         * CALL APPS SCRIPT API
         */

        result =
            await callPortalAPI(
                "approveModificationRequest",
                payload
            );


        console.log(
            "[MODIFICATION] Approve response:",
            result
        );

    }

    catch (error) {

        console.error(
            "[MODIFICATION] Approve API error:",
            error
        );


        setModificationApproveLoading(
            id,
            false
        );


        showModificationToast(
            "Unable to approve modification request.",
            "error"
        );


        return false;
    }


    /*
     * Validate API response.
     */

    if (
        !result ||
        result.success !== true
    ) {

        console.error(
            "[MODIFICATION] Approval failed:",
            result
        );


        setModificationApproveLoading(
            id,
            false
        );


        showModificationToast(
            (
                result &&
                result.message
            )
                ? result.message
                : "Unable to approve modification request.",
            "error"
        );


        return false;
    }


    /*
     * SUCCESS
     */

    console.log(
        "[MODIFICATION] Approval successful:",
        id
    );


    /*
     * Stop spinner.
     */

    setModificationApproveLoading(
        id,
        false
    );


    /*
     * Show success toast immediately.
     */

    showModificationToast(
        "Modification request " +
        id +
        " approved successfully.",
        "success"
    );


    /*
     * Refresh modification requests.
     */

    try {

        await loadModificationRequests();

    }

    catch (error) {

        console.error(
            "[MODIFICATION] Failed to refresh modification requests:",
            error
        );

    }


    /*
     * Refresh main dashboard if available.
     */

    if (
        typeof loadDashboardData ===
        "function"
    ) {

        try {

            await loadDashboardData();

        }

        catch (error) {

            console.error(
                "[MODIFICATION] Failed to refresh dashboard:",
                error
            );

        }

    }


    return true;
}

/*=========================================================
  REJECT BUTTON LOADING
=========================================================*/

function setModificationRejectLoading(
    requestId,
    loading
) {

    const id =
        String(
            requestId || ""
        ).trim();


    if (!id) {
        return;
    }


    /*
     * Try common reject button selectors.
     */

    const buttons =
        document.querySelectorAll(
            '[data-action="reject"]'
        );


    buttons.forEach(
        function (button) {

            const buttonRequestId =
                String(
                    button.dataset.requestId ||
                    ""
                ).trim();


            if (
                buttonRequestId !== id
            ) {

                return;

            }


            if (loading) {

                if (
                    button.dataset.originalHtml ===
                    undefined
                ) {

                    button.dataset.originalHtml =
                        button.innerHTML;

                }


                button.disabled = true;


                button.innerHTML = `
                    <span
                        style="
                            display:inline-block;
                            width:12px;
                            height:12px;
                            border:2px solid currentColor;
                            border-top-color:transparent;
                            border-radius:50%;
                            animation:modificationRejectSpin .7s linear infinite;
                            margin-right:6px;
                            vertical-align:-2px;
                        "
                    ></span>
                    Rejecting...
                `;

            }
            else {

                button.disabled = false;


                if (
                    button.dataset.originalHtml !==
                    undefined
                ) {

                    button.innerHTML =
                        button.dataset.originalHtml;

                }

            }

        }
    );

}

/*=========================================================
  REJECT BUTTON SPINNER CSS
=========================================================*/

/*=========================================================
  REJECT BUTTON SPINNER CSS
=========================================================*/

if (
    !document.getElementById(
        "modificationRejectSpinnerStyle"
    )
) {

    const style =
        document.createElement("style");


    style.id =
        "modificationRejectSpinnerStyle";


    style.textContent = `
        @keyframes modificationRejectSpin {

            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }

        }
    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   REJECT MODIFICATION REQUEST
   ---------------------------------------------------------
   This function ONLY:
   1. Validates request
   2. Checks status
   3. Opens confirmation modal

   It does NOT call the API directly.

   The actual API operation is handled by:
   processModificationRejection()
========================================================= */

async function rejectModification(
    requestId
) {

    const id =
        String(
            requestId || ""
        ).trim();


    /* =====================================================
       REQUEST ID VALIDATION
    ===================================================== */

    if (!id) {

        console.error(
            "[MODIFICATION] Reject aborted: Request ID missing."
        );

        showModificationToast(
            "Unable to reject request. Request ID is missing.",
            "error"
        );

        return false;
    }


    /* =====================================================
       FIND REQUEST
    ===================================================== */

    const request =
        modificationRequests.find(
            function (item) {

                return (
                    String(
                        getModificationRequestId(
                            item
                        )
                    ).trim() === id
                );

            }
        );


    if (!request) {

        console.error(
            "[MODIFICATION] Reject aborted: request not found:",
            id
        );

        showModificationToast(
            "Modification request was not found. Please refresh the page.",
            "error"
        );

        return false;
    }


    console.log(
        "========== REJECT MODIFICATION =========="
    );

    console.log(
        "[MODIFICATION] Request ID:",
        id
    );

    console.log(
        "[MODIFICATION] Request:",
        request
    );


    /* =====================================================
       STATUS CHECK
    ===================================================== */

    const currentStatus =
        String(
            request.status ||
            request.Status ||
            ""
        )
            .trim()
            .toLowerCase();


    if (
        currentStatus &&
        currentStatus !== "pending"
    ) {

        showModificationToast(
            "This request is already " +
            currentStatus +
            ".",
            "error"
        );

        return false;
    }


    /* =====================================================
       OPEN CUSTOM CONFIRMATION MODAL
       
       IMPORTANT:
       Do NOT call the API here.
    ===================================================== */

    showModificationConfirmModal({

        requestId:
            id,

        action:
            "reject",

        title:
            "Reject Modification Request",

        message:
            "Are you sure you want to reject modification request " +
            id +
            "?",

        confirmText:
            "Reject Request",

        cancelText:
            "Cancel",


        /* =================================================
           CONFIRM
        ================================================= */

        onConfirm:
            async function () {

                console.log(
                    "[MODIFICATION] Reject confirmed:",
                    id
                );


                await processModificationRejection(
                    id
                );

            },


        /* =================================================
           CANCEL
        ================================================= */

        onCancel:
            function () {

                console.log(
                    "[MODIFICATION] Rejection cancelled:",
                    id
                );

            }

    });


    /*
     * IMPORTANT
     *
     * Stop execution here.
     *
     * The API must NOT be called until the
     * administrator presses "Reject Request"
     * inside the modal.
     */

    return false;
}

/* =========================================================
   PROCESS MODIFICATION REJECTION
   ---------------------------------------------------------
   This function performs the actual rejection after the
   administrator confirms the custom modal.
========================================================= */

async function processModificationRejection(
    requestId
) {

    const id =
        String(
            requestId || ""
        ).trim();


    /* =====================================================
       VALIDATE REQUEST ID
    ===================================================== */

    if (!id) {

        showModificationToast(
            "Unable to reject request. Request ID is missing.",
            "error"
        );

        return false;
    }


    console.log(
        "========== PROCESS MODIFICATION REJECTION =========="
    );

    console.log(
        "[MODIFICATION] Request ID:",
        id
    );


    /* =====================================================
       ADMIN
    ===================================================== */

    const admin =
        String(
            window.currentAdminName ||
            window.currentAdmin ||
            "Admin"
        )
            .trim() ||
        "Admin";


    /* =====================================================
       REMARKS
    ===================================================== */

    const remarks = "";


    /* =====================================================
       START BUTTON LOADING
    ===================================================== */

    if (
        typeof setModificationRejectLoading ===
        "function"
    ) {

        setModificationRejectLoading(
            id,
            true
        );

    }


    let result;


    try {

        console.log(
            "[MODIFICATION] Sending reject request..."
        );

        console.log(
            "[MODIFICATION] API:",
            "rejectModificationRequest"
        );


        const payload = {

            env:
                window.DASHBOARD_ENV ||
                "LIVE",

            requestId:
                id,

            admin:
                admin,

            remarks:
                remarks

        };


        console.log(
            "[MODIFICATION] Reject Payload:",
            payload
        );


        /* =================================================
           CALL APPS SCRIPT
        ================================================= */

        result =
            await callPortalAPI(
                "rejectModificationRequest",
                payload
            );


        console.log(
            "[MODIFICATION] Reject response:",
            result
        );

    }


    catch (error) {

        console.error(
            "[MODIFICATION] Reject API error:",
            error
        );


        /* =================================================
           STOP LOADING
        ================================================= */

        if (
            typeof setModificationRejectLoading ===
            "function"
        ) {

            setModificationRejectLoading(
                id,
                false
            );

        }


        showModificationToast(
            "Unable to reject modification request.",
            "error"
        );


        return false;
    }


    /* =====================================================
       VALIDATE API RESPONSE
    ===================================================== */

    if (
        !result ||
        result.success !== true
    ) {

        console.error(
            "[MODIFICATION] Rejection failed:",
            result
        );


        if (
            typeof setModificationRejectLoading ===
            "function"
        ) {

            setModificationRejectLoading(
                id,
                false
            );

        }


        showModificationToast(

            (
                result &&
                (
                    result.message ||
                    result.error
                )
            )
                ? (
                    result.message ||
                    result.error
                )
                : "Unable to reject modification request.",

            "error"
        );


        return false;
    }


    /* =====================================================
       SUCCESS
    ===================================================== */

    console.log(
        "[MODIFICATION] Rejection successful:",
        id
    );


    /* =====================================================
       STOP BUTTON LOADING
    ===================================================== */

    if (
        typeof setModificationRejectLoading ===
        "function"
    ) {

        setModificationRejectLoading(
            id,
            false
        );

    }


    /* =====================================================
       SUCCESS TOAST
    ===================================================== */

    showModificationToast(
        "Modification request " +
        id +
        " rejected successfully.",
        "success"
    );


    /* =====================================================
       REFRESH MODIFICATION REQUESTS
    ===================================================== */

    try {

        await loadModificationRequests();

    }

    catch (error) {

        console.error(
            "[MODIFICATION] Failed to refresh modification requests:",
            error
        );

    }


    /* =====================================================
       REFRESH MAIN DASHBOARD
    ===================================================== */

    if (
        typeof loadDashboardData ===
        "function"
    ) {

        try {

            await loadDashboardData();

        }

        catch (error) {

            console.error(
                "[MODIFICATION] Failed to refresh dashboard:",
                error
            );

        }

    }


    return true;
}


/* =========================================================
   SAFE HTML
========================================================= */

function escapeModificationHtml(
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


/* =========================================================
   SAFE JS
========================================================= */

function escapeJs(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        );

}


/* =========================================================
   SAFE JSON FOR INLINE HTML
========================================================= */

function safeJsonForHtmlAttribute(
    object
) {

    const json =
        JSON.stringify(
            object || {}
        );


    return json
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            "&quot;"
        );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "[MODIFICATION] Dashboard DOM ready"
        );

        console.log(
            "[MODIFICATION] DASHBOARD_ENV =",
            window.DASHBOARD_ENV
        );


        const container =
            document.getElementById(
                "modificationRequestList"
            );


        if (!container) {

            console.warn(
                "[MODIFICATION] modificationRequestList not found"
            );

            return;

        }


        loadModificationRequests();

    }
);


