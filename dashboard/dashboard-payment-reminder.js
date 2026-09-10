/* =========================================================
   RANSAN TRAVELS
   OUTSTANDING PAYMENT / WHATSAPP REMINDER V1
   ========================================================= */

(function () {

    "use strict";


    let currentReminderRow =
        null;


    let currentReminderFinance =
        {

            total:
                0,

            paid:
                0,

            balance:
                0

        };



    /* =====================================================
       ELEMENT
       ===================================================== */

    function reminderEl(
        id
    ) {

        return document.getElementById(
            id
        );

    }



    /* =====================================================
       FIRST VALUE
       ===================================================== */

    function reminderValue(
        row,
        keys,
        fallback
    ) {

        if (!row) {

            return fallback || "";

        }


        for (
            let i = 0;
            i < keys.length;
            i++
        ) {

            const key =
                keys[i];


            if (
                Object.prototype
                    .hasOwnProperty
                    .call(
                        row,
                        key
                    )
            ) {

                const value =
                    row[
                        key
                    ];


                if (
                    value !== null &&
                    value !== undefined &&
                    String(
                        value
                    ).trim() !==
                        ""
                ) {

                    return value;

                }

            }

        }


        return fallback || "";

    }



    /* =====================================================
       NUMBER
       ===================================================== */

    function reminderNumber(
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return 0;

        }


        if (
            typeof value ===
                "number"
        ) {

            return Number.isFinite(
                value
            )
                ? value
                : 0;

        }


        const cleaned =
            String(
                value
            )
                .replace(
                    /₹/g,
                    ""
                )
                .replace(
                    /,/g,
                    ""
                )
                .replace(
                    /[^\d.-]/g,
                    ""
                )
                .trim();


        if (!cleaned) {

            return 0;

        }


        const number =
            Number(
                cleaned
            );


        return Number.isFinite(
            number
        )
            ? number
            : 0;

    }



    /* =====================================================
       MONEY
       ===================================================== */

    function reminderMoney(
        value
    ) {

        return (
            "₹" +
            reminderNumber(
                value
            )
                .toLocaleString(
                    "en-IN",
                    {

                        minimumFractionDigits:
                            0,

                        maximumFractionDigits:
                            2

                    }
                )
        );

    }



    /* =====================================================
       ENVIRONMENT
       ===================================================== */

    function reminderEnvironment() {

        let environment =
            "";


        try {

            if (
                typeof DASHBOARD_ENV !==
                    "undefined"
            ) {

                environment =
                    DASHBOARD_ENV;

            }

        }

        catch (
            error
        ) {

            // Ignore.

        }


        if (!environment) {

            environment =
                window.DASHBOARD_ENV ||
                localStorage.getItem(
                    "dashboardEnv"
                ) ||
                sessionStorage.getItem(
                    "portalEnvironment"
                ) ||
                "LIVE";

        }


        environment =
            String(
                environment
            )
                .trim()
                .toUpperCase();


        return (
            environment ===
                "TEST"

            ? "TEST"

            : "LIVE"
        );

    }



    /* =====================================================
       CUSTOMER
       ===================================================== */

    function getReminderCustomer(
        row
    ) {

        return String(
            reminderValue(
                row,
                [
                    "Customer Name",
                    "Name",
                    "Customer",
                    "customerName"
                ],
                "Customer"
            )
        ).trim();

    }



    /* =====================================================
       PHONE
       ===================================================== */

    function getReminderPhone(
        row
    ) {

        return String(
            reminderValue(
                row,
                [
                    "Phone",
                    "Mobile",
                    "Customer Mobile",
                    "Mobile Number",
                    "Phone Number",
                    "Contact"
                ],
                ""
            )
        ).trim();

    }



    /* =====================================================
       BOOKING ID
       ===================================================== */

    function getReminderBookingId(
        row
    ) {

        return String(
            reminderValue(
                row,
                [
                    "Booking ID",
                    "BookingID",
                    "bookingId",
                    "bookingID"
                ],
                ""
            )
        ).trim();

    }



    /* =====================================================
       SERVICE
       ===================================================== */

    function getReminderService(
        row
    ) {

        let service =
            String(
                reminderValue(
                    row,
                    [
                        "Service",
                        "service"
                    ],
                    ""
                )
            ).trim();


        if (!service) {

            service =
                String(
                    row?._sheet ||
                    row?._source ||
                    ""
                ).trim();

        }


        const normalized =
            service
                .toLowerCase();


        if (
            normalized ===
                "air"
        ) {

            return "Flight";

        }


        if (
            normalized.includes(
                "train"
            )
        ) {

            return "Train";

        }


        if (
            normalized.includes(
                "bus"
            )
        ) {

            return "Bus";

        }


        if (
            normalized.includes(
                "car"
            )
        ) {

            return "Car";

        }


        if (
            normalized.includes(
                "travel_lead"
            ) ||
            normalized.includes(
                "package"
            )
        ) {

            return "Package";

        }


        if (
            normalized.includes(
                "premium"
            )
        ) {

            return "Premium Quote";

        }


        return service || "-";

    }



    /* =====================================================
       TRAVEL DATE
       ===================================================== */

    function getReminderTravelDate(
        row
    ) {

        return String(
            reminderValue(
                row,
                [
                    "Travel Date",
                    "Journey Date",
                    "Departure Date",
                    "Date",
                    "Travel Month"
                ],
                ""
            )
        ).trim();

    }



    /* =====================================================
       TOTAL
       ===================================================== */

    function getReminderTotal(
        row
    ) {

        if (
            typeof getDashboardPaymentTotal ===
                "function"
        ) {

            const total =
                Number(
                    getDashboardPaymentTotal(
                        row
                    )
                );


            if (
                Number.isFinite(
                    total
                )
            ) {

                return Math.max(
                    0,
                    total
                );

            }

        }


        return Math.max(
            0,
            reminderNumber(
                reminderValue(
                    row,
                    [
                        "Total Amount",
                        "Revenue",
                        "Estimated Revenue",
                        "Amount",
                        "Fare",
                        "Total Fare",
                        "Estimated Fare",
                        "Package Cost",
                        "Package Amount",
                        "Final Fare",
                        "Final Amount",
                        "Booking Amount"
                    ],
                    0
                )
            )
        );

    }



    /* =====================================================
       PAID
       ===================================================== */

    function getReminderPaid(
        row
    ) {

        if (
            typeof getDashboardPaymentPaid ===
                "function"
        ) {

            const paid =
                Number(
                    getDashboardPaymentPaid(
                        row
                    )
                );


            if (
                Number.isFinite(
                    paid
                )
            ) {

                return Math.max(
                    0,
                    paid
                );

            }

        }


        return Math.max(
            0,
            reminderNumber(
                reminderValue(
                    row,
                    [
                        "Paid Amount",
                        "Amount Paid",
                        "Paid",
                        "Received Amount",
                        "Payment Received",
                        "Advance Paid",
                        "Advance Amount"
                    ],
                    0
                )
            )
        );

    }



    /* =====================================================
       BALANCE
       ===================================================== */

    function getReminderBalance(
        row,
        total,
        paid
    ) {

        if (
            typeof getDashboardPaymentBalance ===
                "function"
        ) {

            const balance =
                Number(
                    getDashboardPaymentBalance(
                        row,
                        total,
                        paid
                    )
                );


            if (
                Number.isFinite(
                    balance
                )
            ) {

                return Math.max(
                    0,
                    balance
                );

            }

        }


        const stored =
            reminderValue(
                row,
                [
                    "Balance Amount",
                    "Balance",
                    "Outstanding",
                    "Outstanding Amount",
                    "Pending Amount",
                    "Amount Due",
                    "Due Amount"
                ],
                ""
            );


        if (
            String(
                stored
            ).trim() !==
                ""
        ) {

            return Math.max(
                0,
                reminderNumber(
                    stored
                )
            );

        }


        return Math.max(
            0,
            total -
            paid
        );

    }



    /* =====================================================
       LOCAL DATE
       ===================================================== */

    function todayInputDate() {

        const now =
            new Date();


        return [
            now.getFullYear(),
            String(
                now.getMonth() +
                1
            ).padStart(
                2,
                "0"
            ),
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            )
        ].join(
            "-"
        );

    }



    /* =====================================================
       DEFAULT DUE DATE
       Three days from today.
       ===================================================== */

    function defaultDueDate() {

        const date =
            new Date();


        date.setDate(
            date.getDate() +
            3
        );


        return [
            date.getFullYear(),
            String(
                date.getMonth() +
                1
            ).padStart(
                2,
                "0"
            ),
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            )
        ].join(
            "-"
        );

    }



    /* =====================================================
       DATE DISPLAY
       ===================================================== */

    function formatReminderDate(
        value
    ) {

        const text =
            String(
                value ||
                ""
            ).trim();


        const match =
            text.match(
                /^(\d{4})-(\d{2})-(\d{2})$/
            );


        if (!match) {

            return text;

        }


        const date =
            new Date(
                Number(
                    match[1]
                ),
                Number(
                    match[2]
                ) - 1,
                Number(
                    match[3]
                )
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return text;

        }


        return date
            .toLocaleDateString(
                "en-IN",
                {

                    day:
                        "2-digit",

                    month:
                        "short",

                    year:
                        "numeric"

                }
            );

    }



    /* =====================================================
       BUILD MESSAGE
       ===================================================== */

    function buildReminderMessage() {

        if (
            !currentReminderRow
        ) {

            return "";

        }


        const template =
            String(
                reminderEl(
                    "paymentReminderTemplate"
                )?.value ||
                "friendly"
            );


        if (
            template ===
                "custom"
        ) {

            return String(
                reminderEl(
                    "paymentReminderMessage"
                )?.value ||
                ""
            );

        }


        const customer =
            getReminderCustomer(
                currentReminderRow
            );


        const bookingId =
            getReminderBookingId(
                currentReminderRow
            );


        const service =
            getReminderService(
                currentReminderRow
            );


        const travelDate =
            getReminderTravelDate(
                currentReminderRow
            );


        const total =
            currentReminderFinance
                .total;


        const paid =
            currentReminderFinance
                .paid;


        const balance =
            currentReminderFinance
                .balance;


        const dueDate =
            String(
                reminderEl(
                    "paymentReminderDueDate"
                )?.value ||
                ""
            );


        const displayDueDate =
            dueDate
                ? formatReminderDate(
                    dueDate
                )
                : "";


        let message =
            "";


        /* -----------------------------------------
           FRIENDLY
           ----------------------------------------- */

        if (
            template ===
                "friendly"
        ) {

            message =
`Hi ${customer},

This is a friendly payment reminder from *RanSan Travels*.

Booking ID: *${bookingId}*
Service: ${service}

Booking Value: *${reminderMoney(total)}*
Amount Received: *${reminderMoney(paid)}*
Outstanding Balance: *${reminderMoney(balance)}*

${displayDueDate
    ? `Kindly arrange the pending payment by *${displayDueDate}*.\n\n`
    : ""
}Please let us know if you need any assistance.

Regards,
*RanSan Travels*`;

        }



        /* -----------------------------------------
           BALANCE DUE
           ----------------------------------------- */

        else if (
            template ===
                "balance_due"
        ) {

            message =
`Hi ${customer},

Payment update for your RanSan Travels booking:

Booking ID: *${bookingId}*
Total Booking Value: *${reminderMoney(total)}*
Paid: *${reminderMoney(paid)}*
Balance Due: *${reminderMoney(balance)}*

${displayDueDate
    ? `Payment Due Date: *${displayDueDate}*\n\n`
    : ""
}Kindly complete the outstanding payment at your convenience.

Thank you,
*RanSan Travels*`;

        }



        /* -----------------------------------------
           BEFORE TRAVEL
           ----------------------------------------- */

        else if (
            template ===
                "before_travel"
        ) {

            message =
`Hi ${customer},

Your upcoming ${service} booking with *RanSan Travels* currently has an outstanding balance.

Booking ID: *${bookingId}*
${travelDate
    ? `Travel Date: ${travelDate}\n`
    : ""
}Outstanding Balance: *${reminderMoney(balance)}*

${displayDueDate
    ? `Kindly complete the payment by *${displayDueDate}* to help us keep your booking arrangements on schedule.\n\n`
    : `Kindly complete the pending payment to help us keep your booking arrangements on schedule.\n\n`
}Thank you,
*RanSan Travels*`;

        }



        /* -----------------------------------------
           FINAL
           ----------------------------------------- */

        else if (
            template ===
                "final"
        ) {

            message =
`Hi ${customer},

This is a final payment reminder regarding your RanSan Travels booking.

Booking ID: *${bookingId}*
Outstanding Balance: *${reminderMoney(balance)}*

${displayDueDate
    ? `Please arrange payment by *${displayDueDate}*.\n\n`
    : ""
}If payment has already been made, please ignore this reminder and share the transaction reference with us if required.

Regards,
*RanSan Travels*`;

        }


        return message;

    }



    /* =====================================================
       CHARACTER COUNT
       ===================================================== */

    function updateCharacterCount() {

        const textarea =
            reminderEl(
                "paymentReminderMessage"
            );


        const counter =
            reminderEl(
                "paymentReminderCharCount"
            );


        if (
            !textarea ||
            !counter
        ) {

            return;

        }


        const length =
            textarea
                .value
                .length;


        counter.textContent =
            length +
            (
                length ===
                    1

                ? " character"

                : " characters"
            );

    }



    /* =====================================================
       UPDATE TEMPLATE
       ===================================================== */

    function updateTemplate() {

        if (
            !currentReminderRow
        ) {

            return;

        }


        const template =
            String(
                reminderEl(
                    "paymentReminderTemplate"
                )?.value ||
                "friendly"
            );


        /*
         * Custom means user owns the text.
         * Do not overwrite it.
         */

        if (
            template ===
                "custom"
        ) {

            updateCharacterCount();

            return;

        }


        const textarea =
            reminderEl(
                "paymentReminderMessage"
            );


        if (
            textarea
        ) {

            textarea.value =
                buildReminderMessage();

        }


        updateCharacterCount();

    }



    /* =====================================================
       BUTTON STATE
       ===================================================== */

    function setSendEnabled(
        enabled
    ) {

        const button =
            reminderEl(
                "paymentReminderSendBtn"
            );


        if (!button) {

            return;

        }


        button.disabled =
            !enabled;


        button.classList.toggle(
            "disabled",
            !enabled
        );

    }



    /* =====================================================
       OPEN
       ===================================================== */

    function openReminder(
        row
    ) {

        if (!row) {

            if (
                typeof showToast ===
                    "function"
            ) {

                showToast(
                    "Booking information is not available.",
                    "error"
                );

            }

            return;

        }


        currentReminderRow =
            row;


        const customer =
            getReminderCustomer(
                row
            );


        const phone =
            getReminderPhone(
                row
            );


        const bookingId =
            getReminderBookingId(
                row
            );


        const service =
            getReminderService(
                row
            );


        const total =
            getReminderTotal(
                row
            );


        const paid =
            getReminderPaid(
                row
            );


        const balance =
            getReminderBalance(
                row,
                total,
                paid
            );


        currentReminderFinance =
            {

                total:
                    total,

                paid:
                    paid,

                balance:
                    balance

            };


        /* -----------------------------------------
           DETAILS
           ----------------------------------------- */

        reminderEl(
            "paymentReminderCustomer"
        ).textContent =
            customer ||
            "-";


        reminderEl(
            "paymentReminderPhone"
        ).textContent =
            phone ||
            "Phone not available";


        reminderEl(
            "paymentReminderBookingId"
        ).textContent =
            bookingId ||
            "-";


        reminderEl(
            "paymentReminderService"
        ).textContent =
            service ||
            "-";


        reminderEl(
            "paymentReminderTotal"
        ).textContent =
            reminderMoney(
                total
            );


        reminderEl(
            "paymentReminderPaid"
        ).textContent =
            reminderMoney(
                paid
            );


        reminderEl(
            "paymentReminderBalance"
        ).textContent =
            reminderMoney(
                balance
            );


        /* -----------------------------------------
           ENVIRONMENT
           ----------------------------------------- */

        const environment =
            reminderEnvironment();


        const envBadge =
            reminderEl(
                "paymentReminderEnvironment"
            );


        if (
            envBadge
        ) {

            envBadge.textContent =
                environment;


            envBadge.classList.toggle(
                "test",
                environment ===
                    "TEST"
            );

        }


        /* -----------------------------------------
           FORM DEFAULTS
           ----------------------------------------- */

        reminderEl(
            "paymentReminderTemplate"
        ).value =
            "friendly";


        reminderEl(
            "paymentReminderDueDate"
        ).value =
            defaultDueDate();


        /* -----------------------------------------
           VALIDATION STATE
           ----------------------------------------- */

        const warning =
            reminderEl(
                "paymentReminderWarning"
            );


        let canSend =
            true;


        if (
            total <= 0
        ) {

            canSend =
                false;


            warning.hidden =
                false;


            warning.textContent =
                "Final Fare / Revenue is not set. Set the booking value before sending a payment reminder.";

        }

        else if (
            balance <= 0
        ) {

            canSend =
                false;


            warning.hidden =
                false;


            warning.textContent =
                "This booking has no outstanding balance. No payment reminder is required.";

        }

        else if (
            !phone
        ) {

            canSend =
                false;


            warning.hidden =
                false;


            warning.textContent =
                "Customer mobile number is not available.";

        }

        else {

            warning.hidden =
                true;


            warning.textContent =
                "";

        }


        setSendEnabled(
            canSend
        );


        updateTemplate();


        /* -----------------------------------------
           OPEN
           ----------------------------------------- */

        const modal =
            reminderEl(
                "paymentReminderModal"
            );


        if (!modal) {

            console.error(
                "[PAYMENT REMINDER] Modal HTML missing."
            );

            return;

        }


        modal.classList.add(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body
            .classList.add(
                "paymentReminderOpen"
            );

    }



    /* =====================================================
       CLOSE
       ===================================================== */

    function closeReminder() {

        const modal =
            reminderEl(
                "paymentReminderModal"
            );


        if (
            modal
        ) {

            modal.classList.remove(
                "active"
            );


            modal.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        document.body
            .classList.remove(
                "paymentReminderOpen"
            );


        currentReminderRow =
            null;


        currentReminderFinance =
            {

                total:
                    0,

                paid:
                    0,

                balance:
                    0

            };

    }



    /* =====================================================
       SENDING UI
       ===================================================== */

    function setSending(
        sending
    ) {

        const button =
            reminderEl(
                "paymentReminderSendBtn"
            );


        if (!button) {

            return;

        }


        button.disabled =
            sending;


        button.innerHTML =
            sending

                ? `
                    <span
                        class="paymentReminderSpinner"
                    ></span>

                    Sending...
                  `

                : `
                    <span>
                        💬
                    </span>

                    Send WhatsApp
                  `;

    }



    /* =====================================================
       SEND
       ===================================================== */

    async function sendReminder() {

        if (
            !currentReminderRow
        ) {

            return;

        }


        const row =
            currentReminderRow;


        const customer =
            getReminderCustomer(
                row
            );


        const phone =
            getReminderPhone(
                row
            );


        const bookingId =
            getReminderBookingId(
                row
            );


        const service =
            getReminderService(
                row
            );


        const message =
            String(
                reminderEl(
                    "paymentReminderMessage"
                )?.value ||
                ""
            ).trim();


        const reminderType =
            String(
                reminderEl(
                    "paymentReminderTemplate"
                )?.value ||
                "friendly"
            );


        const dueDate =
            String(
                reminderEl(
                    "paymentReminderDueDate"
                )?.value ||
                ""
            );


        const total =
            currentReminderFinance
                .total;


        const paid =
            currentReminderFinance
                .paid;


        const balance =
            currentReminderFinance
                .balance;


        /* -----------------------------------------
           VALIDATE
           ----------------------------------------- */

        if (
            total <= 0
        ) {

            showToast?.(
                "Set Final Fare / Revenue before sending a payment reminder.",
                "warning"
            );

            return;

        }


        if (
            balance <= 0
        ) {

            showToast?.(
                "This booking is fully paid.",
                "warning"
            );

            return;

        }


        if (!phone) {

            showToast?.(
                "Customer phone number is not available.",
                "error"
            );

            return;

        }


        if (!bookingId) {

            showToast?.(
                "Booking ID is not available.",
                "error"
            );

            return;

        }


        if (
            !row._sheet ||
            !Number(
                row._row
            )
        ) {

            showToast?.(
                "Booking source information is missing.",
                "error"
            );

            return;

        }


        if (
            !message
        ) {

            showToast?.(
                "Payment reminder message cannot be empty.",
                "error"
            );

            return;

        }


        if (
            typeof getApiUrl !==
                "function"
        ) {

            showToast?.(
                "Dashboard API is unavailable.",
                "error"
            );

            return;

        }


        setSending(
            true
        );


        if (
            typeof showLoader ===
                "function"
        ) {

            showLoader();

        }


        try {

            const response =
                await fetch(
                    getApiUrl(),
                    {

                        method:
                            "POST",

                        headers:
                            {

                                "Content-Type":
                                    "text/plain;charset=utf-8"

                            },

                        body:
                            JSON.stringify(
                                {

                                    action:
                                        "sendPaymentReminder",

                                    env:
                                        reminderEnvironment(),

                                    sheet:
                                        row._sheet,

                                    row:
                                        Number(
                                            row._row
                                        ),

                                    bookingId:
                                        bookingId,

                                    customer:
                                        customer,

                                    mobile:
                                        phone,

                                    service:
                                        service,

                                    totalAmount:
                                        total,

                                    paidAmount:
                                        paid,

                                    balanceAmount:
                                        balance,

                                    reminderType:
                                        reminderType,

                                    dueDate:
                                        dueDate,

                                    message:
                                        message,

                                    sentBy:
                                        sessionStorage.getItem(
                                            "portalUsername"
                                        ) ||
                                        sessionStorage.getItem(
                                            "username"
                                        ) ||
                                        ""

                                }
                            )

                    }
                );


            const text =
                await response.text();


            console.log(
                "[PAYMENT REMINDER] RAW:",
                text
            );


            let result;


            try {

                result =
                    JSON.parse(
                        text
                    );

            }

            catch (
                error
            ) {

                throw new Error(
                    "Invalid server response."
                );

            }


            if (
                !result ||
                result.success !==
                    true
            ) {

                throw new Error(
                    result?.error ||
                    "Unable to send payment reminder."
                );

            }


            closeReminder();


            if (
                typeof showToast ===
                    "function"
            ) {

                showToast(
                    "Payment reminder sent successfully.",
                    "success"
                );

            }


            /*
             * Refresh only existing dashboard displays.
             */

            if (
                typeof loadDashboardData ===
                    "function"
            ) {

                await loadDashboardData();

            }


            if (
                typeof loadLiveOperations ===
                    "function"
            ) {

                await loadLiveOperations();

            }


            if (
                typeof loadDashboardKPI ===
                    "function"
            ) {

                await loadDashboardKPI();

            }

        }

        catch (
            error
        ) {

            console.error(
                "[PAYMENT REMINDER] SEND ERROR:",
                error
            );


            if (
                typeof showToast ===
                    "function"
            ) {

                showToast(
                    error.message ||
                    "Unable to send payment reminder.",
                    "error"
                );

            }

        }

        finally {

            if (
                typeof hideLoader ===
                    "function"
            ) {

                hideLoader();

            }


            setSending(
                false
            );

        }

    }



    /* =====================================================
       BACKDROP
       ===================================================== */

    document.addEventListener(
        "click",
        function (
            event
        ) {

            if (
                event.target &&
                event.target.id ===
                    "paymentReminderModal"
            ) {

                closeReminder();

            }

        }
    );



    /* =====================================================
       ESCAPE
       ===================================================== */

    document.addEventListener(
        "keydown",
        function (
            event
        ) {

            if (
                event.key !==
                    "Escape"
            ) {

                return;

            }


            const modal =
                reminderEl(
                    "paymentReminderModal"
                );


            if (
                modal &&
                modal.classList.contains(
                    "active"
                )
            ) {

                closeReminder();

            }

        }
    );



    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.RanSanPaymentReminder =
        {

            open:
                openReminder,

            close:
                closeReminder,

            send:
                sendReminder,

            updateTemplate:
                updateTemplate,

            updateCharacterCount:
                updateCharacterCount

        };


})();