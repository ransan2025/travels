/*==================================
RANSAN DASHBOARD API
==================================*/

const DASHBOARD_CONFIG = {

    API:

        "https://script.google.com/macros/s/AKfycbz8rZXT7UWNYAdw8P3QpAamTk-NKljp-b0flYogJuIr3nwTljClyI_Xc9heoy4gXUmV/exec",

    REFRESH: 30000

};

/*==========================================
BOOKING PROGRESS
==========================================*/

let bookingProgress = {};

/*==========================================
BOOKING WORKFLOW
==========================================*/

let bookingWorkflow = [];




let DASHBOARD_ENV =
    localStorage.getItem("dashboardEnv") || "LIVE";

function getApiUrl(action = "") {

    let url = DASHBOARD_CONFIG.API;

    if (action) {

        url += "?action=" + action;

        url += "&env=" + DASHBOARD_ENV;

    }

    else {

        url += "?env=" + DASHBOARD_ENV;

    }

    return url;

}

/*==================================
LOAD DASHBOARD
==================================*/

async function loadDashboardData() {

    try {

        const response =

            await fetch(

                getApiUrl("getDashboard")


            );

        const result =

            await response.json();

        if (!result.success) {

            return;

        }

        window.dashboardData = result;

        document.dispatchEvent(

            new CustomEvent(

                "dashboardLoaded",

                {

                    detail: result

                }

            )

        );

    }

    catch (err) {

        console.log(err);

    }

}

/*==================================
AUTO REFRESH
==================================*/

loadDashboardData();

setInterval(

    loadDashboardData,

    DASHBOARD_CONFIG.REFRESH

);

async function saveCustomerCRM(data) {

    console.log("CRM REQUEST");
    console.log(data);

    console.log("Sending Note:", data.notes);

    const res = await fetch(

        getApiUrl(),


        {

            method: "POST",

            headers: {

                "Content-Type": "text/plain"

            },

            body: JSON.stringify({

                action: "updateCustomer",

                env: DASHBOARD_ENV,

                sheet: data.sheet,

                bookingId: data.bookingId,

                customer: data.customer,

                service: data.service,

                status: data.status,

                notes: data.notes,

                followUp: data.followUp,

                priority: data.priority,

                revenue: data.revenue

            })

        }

    );

    const result = await res.json();

    console.log("CRM SAVE RESPONSE");
    console.log(result);

    return result;

}

async function deleteCustomerCRM(data) {

    const res = await fetch(

        getApiUrl(),


        {

            method: "POST",

            headers: {
                "Content-Type": "text/plain"
            },

            body: JSON.stringify({

                action: "deleteCustomer",

                env: DASHBOARD_ENV,


                sheet: data.sheet,

                bookingId: data.bookingId

            })

        }

    );

    return await res.json();

}

async function updateCRMStatus(data) {

    try {

        if (!data || !data.sheet) {

            throw new Error(
                "Sheet name is missing."
            );

        }


        const row =
            Number(data.row);


        if (
            !Number.isInteger(row) ||
            row < 2
        ) {

            throw new Error(
                "Invalid sheet row: " +
                data.row
            );

        }


        const status =
            String(
                data.status || ""
            ).trim();


        if (!status) {

            throw new Error(
                "Status is missing."
            );

        }


        /*
         * IMPORTANT:
         * Send ALL values collected by the modal.
         */

        const payload = {

            action:
                "updateCRMStatus",

            env:
                DASHBOARD_ENV,

            sheet:
                String(data.sheet).trim(),

            row:
                row,

            status:
                status,

            notes:
                String(
                    data.notes || ""
                ).trim(),

            revenue:
                data.revenue !== undefined &&
                data.revenue !== null &&
                data.revenue !== ""
                    ? Number(data.revenue)
                    : ""

        };


        console.log(
            "Sending CRM status update:",
            payload
        );


        const res =
            await fetch(
                getApiUrl(),
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        if (!res.ok) {

            throw new Error(
                "HTTP error: " +
                res.status
            );

        }


        const text =
            await res.text();


        console.log(
            "CRM status raw response:",
            text
        );


        let result;


        try {

            result =
                JSON.parse(text);

        } catch (parseError) {

            console.error(
                "Invalid JSON response:",
                text
            );

            throw new Error(
                "Server returned an invalid response."
            );

        }


        console.log(
            "CRM status parsed result:",
            result
        );


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(

                result?.error ||

                "Status update was not saved."

            );

        }


        return result;


    } catch (error) {

        console.error(
            "updateCRMStatus error:",
            error
        );


        /*
         * IMPORTANT:
         * Return a structured failure response.
         * Do NOT pretend this was successful.
         */

        return {

            success: false,

            error:
                error.message ||
                "Unable to update CRM status."

        };

    }

}


async function updateCRMFollowup(data) {

    try {

        if (!data || !data.sheet) {

            throw new Error(
                "Sheet name is missing."
            );

        }


        const row =
            Number(data.row);


        if (
            !Number.isInteger(row) ||
            row < 2
        ) {

            throw new Error(
                "Invalid sheet row: " +
                data.row
            );

        }


        const followup =
            String(
                data.followup || ""
            ).trim();


        if (!followup) {

            throw new Error(
                "Follow-up date is missing."
            );

        }


        /*
         * Validate YYYY-MM-DD.
         */

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                followup
            )
        ) {

            throw new Error(
                "Invalid follow-up date."
            );

        }


        const payload = {

            action:
                "updateCRMFollowup",

            env:
                DASHBOARD_ENV,

            sheet:
                String(data.sheet).trim(),

            row:
                row,

            followup:
                followup,

            notes:
                String(
                    data.notes || ""
                ).trim()

        };


        console.log(
            "Sending CRM follow-up update:",
            payload
        );


        const res =
            await fetch(
                getApiUrl(),
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        if (!res.ok) {

            throw new Error(
                "HTTP error: " +
                res.status
            );

        }


        const text =
            await res.text();


        console.log(
            "CRM follow-up raw response:",
            text
        );


        let result;


        try {

            result =
                JSON.parse(text);

        } catch (parseError) {

            console.error(
                "Invalid JSON response:",
                text
            );

            throw new Error(
                "Server returned an invalid response."
            );

        }


        console.log(
            "CRM follow-up parsed result:",
            result
        );


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(

                result?.error ||

                "Follow-up was not saved."

            );

        }


        return result;


    } catch (error) {

        console.error(
            "updateCRMFollowup error:",
            error
        );


        return {

            success: false,

            error:
                error.message ||
                "Unable to update CRM follow-up."

        };

    }

}

async function getActivityLog() {

    const res =
        await fetch(

            getApiUrl(),


            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain"
                },

                body:
                    JSON.stringify({

                        action:
                            "getActivityLog",

                        env: DASHBOARD_ENV,


                    })

            }

        );

    return await res.json();

}

async function getDashboardKPI() {

    const res =
        await fetch(

            getApiUrl(),


            {

                method: "POST",

                headers: {

                    "Content-Type":

                        "text/plain"

                },

                body:
                    JSON.stringify({

                        action:
                            "getDashboardKPI",

                        env: DASHBOARD_ENV,


                    })

            }

        );

    return await res.json();

}

async function verifyManagerPin(pin) {

    const res =
        await fetch(

            getApiUrl(),


            {

                method: "POST",

                headers: {

                    "Content-Type": "text/plain"

                },

                body: JSON.stringify({

                    env: DASHBOARD_ENV,


                    action: "verifyManagerPin",

                    pin

                })

            }

        );

    return await res.json();

}

/*==========================================
LOAD BOOKING PROGRESS
==========================================*/

/*==========================================
LOAD BOOKING PROGRESS
==========================================*/

async function loadBookingProgress(customer) {

    const bookingId =

        customer.bookingId ||

        customer.raw?.["Booking ID"];

    const response = await fetch(

        getApiUrl(),

        {

            method: "POST",

            headers: {

                "Content-Type": "text/plain"

            },

            body: JSON.stringify({

                action: "getBookingProgress",

                env: DASHBOARD_ENV,

                bookingId: bookingId

            })

        }

    );

    const result = await response.json();

    if (result.success) {

        bookingProgress =

            result.progress || {};

    }
    else {

        bookingProgress = {};

    }

}

/*==========================================
SAVE ONLY BOOKING PROGRESS
==========================================*/

async function saveOnlyBookingProgress() {

    if (!currentCustomer) {

        return;

    }

    await saveBookingProgress(currentCustomer);

    showToast(

        "Booking Progress Updated",

        "success"

    );

}

/*==========================================
SAVE BOOKING PROGRESS
==========================================*/

async function saveBookingProgress(customer) {

    console.log("===== SAVE BOOKING PROGRESS START =====");
    console.log(customer);

    if (!customer) {

        console.warn("Customer missing");

        return;

    }

    //------------------------------------------
    // Booking ID
    //------------------------------------------

    const bookingId =

        customer.bookingId ||

        customer["Booking ID"] ||

        customer.raw?.["Booking ID"] ||

        "";

    if (!bookingId) {

        console.error("Booking ID missing");

        console.log(customer);

        return;

    }

    //------------------------------------------
    // Build Progress Object
    //------------------------------------------

    const progress = {};

    document

        .querySelectorAll("[data-progress]")

        .forEach(control => {

            progress[
                control.dataset.progress
            ] = control.value;

        });

    //------------------------------------------
    // Save
    //------------------------------------------

    try {

        const response = await fetch(

            getApiUrl(),

            {

                method: "POST",

                headers: {
                    "Content-Type": "text/plain"
                },

                body: JSON.stringify({

                    action: "updateBookingProgress",

                    env: DASHBOARD_ENV,

                    bookingId: bookingId,

                    sheet:

                        customer.sheet ||

                        customer.raw?._sheet ||

                        customer.raw?.sheet ||

                        "",

                    progress: progress

                })

            }

        );

        const result = await response.json();

        console.log("===== BOOKING PROGRESS RESPONSE =====");
        console.log(result);

        console.log("Booking Progress Saved");

        console.log(result);

        if (!result.success) {

            showToast(

                result.message ||

                "Booking Progress Save Failed",

                "error"

            );

            return;

        }

        showToast(

            "Booking Progress Updated",

            "success"

        );

    }

    catch (err) {

        console.error(err);

        showToast(

            "Unable to save Booking Progress",

            "error"

        );

    }

}

/*==========================================
LOAD WORKFLOW
==========================================*/

async function loadWorkflow(service) {

    const response = await fetch(

        getApiUrl(),

        {

            method: "POST",

            headers: {

                "Content-Type": "text/plain"

            },

            body: JSON.stringify({

                action: "getWorkflow",

                env: DASHBOARD_ENV,

                service: service

            })

        }

    );

    const result = await response.json();

    console.log("Workflow Response");

    console.log(result);

    if (result.success) {

        bookingWorkflow = result.workflow;

    }
    else {

        bookingWorkflow = [];

    }

}