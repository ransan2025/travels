/*==================================
RANSAN DASHBOARD API
==================================*/

const DASHBOARD_CONFIG = {

    API:

        "https://script.google.com/macros/s/AKfycbx6CmDtoKCJ3Y77qTgBIJJeIkMdnufpetmv5MEZLFamxq_gxEV9M9sc68C42Kr3JMUT/exec",

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

    const res = await fetch(

        getApiUrl(),

        {

            method: "POST",

            headers: {
                "Content-Type": "text/plain"
            },

            body: JSON.stringify({

                action: "updateCRMStatus",

                env: DASHBOARD_ENV,


                sheet: data.sheet,

                row: data.row,

                status: data.status

            })

        }

    );

    return await res.json();

}

async function updateCRMFollowup(data) {

    const res = await fetch(

        getApiUrl(),


        {

            method: "POST",

            headers: {
                "Content-Type": "text/plain"
            },

            body: JSON.stringify({

                action: "updateCRMFollowup",

                env: DASHBOARD_ENV,


                sheet: data.sheet,

                row: data.row,

                followup: data.followup

            })

        }

    );

    return await res.json();

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