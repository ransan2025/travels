/* =========================================================
   RANSAN TRAVELS
   REFUND / PAYMENT REVERSAL V1
   ========================================================= */

(function () {

    "use strict";


    let currentRefundRow =
        null;


    let currentRefundFinance =
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

    function $(
        id
    ) {

        return document.getElementById(
            id
        );

    }


    /* =====================================================
       VALUE
       ===================================================== */

    function value(
        row,
        keys,
        fallback
    ) {

        if (!row) {

            return fallback ?? "";

        }


        for (
            const key
            of keys
        ) {

            if (
                row[
                    key
                ] !== undefined &&
                row[
                    key
                ] !== null &&
                row[
                    key
                ] !== ""
            ) {

                return row[
                    key
                ];

            }

        }


        return fallback ?? "";

    }


    /* =====================================================
       NUMBER
       ===================================================== */

    function numberValue(
        input
    ) {

        if (
            typeof input ===
                "number"
        ) {

            return Number.isFinite(
                input
            )
                ? input
                : 0;

        }


        const cleaned =
            String(
                input ?? ""
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
                );


        const parsed =
            Number(
                cleaned
            );


        return Number.isFinite(
            parsed
        )
            ? parsed
            : 0;

    }


    /* =====================================================
       MONEY
       ===================================================== */

    function money(
        input
    ) {

        return (
            "₹" +
            numberValue(
                input
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

    function environment() {

        let env =
            "";


        try {

            if (
                typeof DASHBOARD_ENV !==
                    "undefined"
            ) {

                env =
                    DASHBOARD_ENV;

            }

        }

        catch (
            error
        ) {

            // Ignore.

        }


        env =
            env ||
            window.DASHBOARD_ENV ||
            localStorage.getItem(
                "dashboardEnv"
            ) ||
            sessionStorage.getItem(
                "portalEnvironment"
            ) ||
            "LIVE";


        env =
            String(
                env
            )
                .trim()
                .toUpperCase();


        return (
            env === "TEST"
                ? "TEST"
                : "LIVE"
        );

    }


    /* =====================================================
       BOOKING HELPERS
       ===================================================== */

    function customerName(
        row
    ) {

        return String(
            value(
                row,
                [

                    "Customer Name",
                    "Name",
                    "Customer",
                    "customerName"

                ],
                "Customer"
            )
        );

    }


    function phone(
        row
    ) {

        return String(
            value(
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
        );

    }


    function bookingId(
        row
    ) {

        return String(
            value(
                row,
                [

                    "Booking ID",
                    "BookingID",
                    "bookingId",
                    "bookingID"

                ],
                ""
            )
        );

    }


    function service(
        row
    ) {

        return String(
            value(
                row,
                [

                    "Service",
                    "service"

                ],
                row?._sheet ||
                ""
            )
        );

    }


    /* =====================================================
       PAYMENT HELPERS
       ===================================================== */

    function totalAmount(
        row
    ) {

        if (
            typeof getDashboardPaymentTotal ===
                "function"
        ) {

            return numberValue(
                getDashboardPaymentTotal(
                    row
                )
            );

        }


        return numberValue(
            value(
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
        );

    }


    function paidAmount(
        row
    ) {

        if (
            typeof getDashboardPaymentPaid ===
                "function"
        ) {

            return numberValue(
                getDashboardPaymentPaid(
                    row
                )
            );

        }


        return numberValue(
            value(
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
        );

    }


    function balanceAmount(
        row,
        total,
        paid
    ) {

        if (
            typeof getDashboardPaymentBalance ===
                "function"
        ) {

            return numberValue(
                getDashboardPaymentBalance(
                    row,
                    total,
                    paid
                )
            );

        }


        const stored =
            value(
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
            stored !== ""
        ) {

            return numberValue(
                stored
            );

        }


        return Math.max(
            0,
            total -
            paid
        );

    }


    /* =====================================================
       TODAY
       ===================================================== */

    function todayInput() {

        const now =
            new Date();


        const local =
            new Date(
                now.getTime() -
                (
                    now.getTimezoneOffset() *
                    60000
                )
            );


        return local
            .toISOString()
            .slice(
                0,
                10
            );

    }


    /* =====================================================
       TOAST
       ===================================================== */

    function toast(
        message,
        type
    ) {

        if (
            typeof showToast ===
                "function"
        ) {

            showToast(
                message,
                type
            );

            return;

        }


        console.log(
            "[REFUND]",
            message
        );

    }


    /* =====================================================
       OPEN
       ===================================================== */

    function openRefund(
        row
    ) {

        if (
            !row ||
            typeof row !==
                "object"
        ) {

            toast(
                "Booking data is unavailable.",
                "error"
            );

            return;

        }


        currentRefundRow =
            row;


        const total =
            totalAmount(
                row
            );


        const paid =
            paidAmount(
                row
            );


        const balance =
            balanceAmount(
                row,
                total,
                paid
            );


        currentRefundFinance =
            {

                total,
                paid,
                balance

            };


        $("refundCustomer").textContent =
            customerName(
                row
            );


        $("refundPhone").textContent =
            phone(
                row
            ) ||
            "-";


        $("refundBookingId").textContent =
            bookingId(
                row
            ) ||
            "-";


        $("refundService").textContent =
            service(
                row
            ) ||
            "-";


        $("refundTotal").textContent =
            money(
                total
            );


        $("refundPaid").textContent =
            money(
                paid
            );


        $("refundBalance").textContent =
            money(
                balance
            );


        $("refundMaximum").textContent =
            money(
                paid
            );


        const env =
            environment();


        const envBadge =
            $("refundEnvironment");


        envBadge.textContent =
            env;


        envBadge.classList.toggle(
            "test",
            env === "TEST"
        );


        $("refundType").value =
            "PARTIAL_REFUND";


        $("refundDate").value =
            todayInput();


        $("refundAmount").value =
            "";


        $("refundMode").value =
            "";


        $("refundReference").value =
            "";


        $("refundReason").value =
            "";


        $("refundNotes").value =
            "";


        $("refundConfirm").checked =
            false;


        const warning =
            $("refundWarning");


        warning.hidden =
            true;


        warning.textContent =
            "";


        if (
            !row._sheet ||
            !Number(
                row._row
            )
        ) {

            warning.hidden =
                false;


            warning.textContent =
                "Booking source information is missing. Refund is disabled.";

        }

        else if (
            total <= 0
        ) {

            warning.hidden =
                false;


            warning.textContent =
                "Booking Final Fare / Revenue is not set. Refund cannot be recorded.";

        }

        else if (
            paid <= 0
        ) {

            warning.hidden =
                false;


            warning.textContent =
                "There is no recorded paid amount available to refund.";

        }


        previewRefund();


        const modal =
            $("refundModal");


        modal.classList.add(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "refundModalOpen"
        );

    }


    /* =====================================================
       CLOSE
       ===================================================== */

    function closeRefund() {

        const modal =
            $("refundModal");


        modal?.classList.remove(
            "active"
        );


        modal?.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "refundModalOpen"
        );


        currentRefundRow =
            null;

    }


    /* =====================================================
       TYPE
       ===================================================== */

    function changeRefundType() {

        const type =
            $("refundType")?.value ||
            "PARTIAL_REFUND";


        if (
            type === "FULL_REFUND"
        ) {

            $("refundAmount").value =
                currentRefundFinance.paid
                    .toFixed(
                        2
                    );

        }


        if (
            type === "PAYMENT_REVERSAL" &&
            !$("refundReason").value
        ) {

            $("refundReason").value =
                "Payment Entry Reversal";

        }


        previewRefund();

    }


    /* =====================================================
       PREVIEW
       ===================================================== */

    function previewRefund() {

        const refund =
            numberValue(
                $("refundAmount")
                    ?.value
            );


        const currentPaid =
            currentRefundFinance.paid;


        const total =
            currentRefundFinance.total;


        const newPaid =
            Math.max(
                0,
                currentPaid -
                refund
            );


        const newBalance =
            Math.max(
                0,
                total -
                newPaid
            );


        let status =
            "Unpaid";


        if (
            newPaid <= 0
        ) {

            status =
                "Unpaid";

        }

        else if (
            newBalance <= 0
        ) {

            status =
                "Paid";

        }

        else {

            status =
                "Partial";

        }


        $("refundPreviewPaid").textContent =
            money(
                newPaid
            );


        $("refundPreviewBalance").textContent =
            money(
                newBalance
            );


        $("refundPreviewStatus").textContent =
            status;


        const invalid =
            !currentRefundRow ||
            !currentRefundRow._sheet ||
            !Number(
                currentRefundRow._row
            ) ||
            currentPaid <= 0 ||
            total <= 0 ||
            refund <= 0 ||
            refund >
                currentPaid ||
            !$(
                "refundConfirm"
            )?.checked;


        $("refundSubmitBtn").disabled =
            invalid;

    }


    /* =====================================================
       SUBMIT
       ===================================================== */

    async function submitRefund() {

        if (
            !currentRefundRow
        ) {

            return;

        }


        const row =
            currentRefundRow;


        const total =
            currentRefundFinance.total;


        const currentPaid =
            currentRefundFinance.paid;


        const refundAmount =
            numberValue(
                $("refundAmount")
                    ?.value
            );


        const refundType =
            String(
                $("refundType")
                    ?.value ||
                "PARTIAL_REFUND"
            );


        const refundDate =
            String(
                $("refundDate")
                    ?.value ||
                ""
            );


        const refundMode =
            String(
                $("refundMode")
                    ?.value ||
                ""
            );


        const reference =
            String(
                $("refundReference")
                    ?.value ||
                ""
            ).trim();


        const reason =
            String(
                $("refundReason")
                    ?.value ||
                ""
            ).trim();


        const notes =
            String(
                $("refundNotes")
                    ?.value ||
                ""
            ).trim();


        if (
            !row._sheet ||
            !Number(
                row._row
            )
        ) {

            toast(
                "Booking source information is missing.",
                "error"
            );

            return;

        }


        if (
            !bookingId(
                row
            )
        ) {

            toast(
                "Booking ID is missing.",
                "error"
            );

            return;

        }


        if (
            total <= 0
        ) {

            toast(
                "Booking value is not set.",
                "warning"
            );

            return;

        }


        if (
            currentPaid <= 0
        ) {

            toast(
                "There is no payment available to refund.",
                "warning"
            );

            return;

        }


        if (
            refundAmount <= 0
        ) {

            toast(
                "Enter a valid refund amount.",
                "warning"
            );

            return;

        }


        if (
            refundAmount >
            currentPaid
        ) {

            toast(
                "Refund cannot exceed the currently paid amount.",
                "warning"
            );

            return;

        }


        if (
            !refundDate
        ) {

            toast(
                "Select the refund date.",
                "warning"
            );

            return;

        }


        if (
            !refundMode
        ) {

            toast(
                "Select the refund mode.",
                "warning"
            );

            return;

        }


        if (
            !reason
        ) {

            toast(
                "Select a refund reason.",
                "warning"
            );

            return;

        }


        if (
            !$(
                "refundConfirm"
            )?.checked
        ) {

            toast(
                "Please confirm the refund authorization.",
                "warning"
            );

            return;

        }


        const button =
            $("refundSubmitBtn");


        button.disabled =
            true;


        const originalText =
            button.innerHTML;


        button.innerHTML =
            `
                <span
                    class="refundButtonSpinner"
                ></span>

                Recording...
            `;


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
                                        "recordBookingRefund",

                                    env:
                                        environment(),

                                    sheet:
                                        row._sheet,

                                    row:
                                        Number(
                                            row._row
                                        ),

                                    bookingId:
                                        bookingId(
                                            row
                                        ),

                                    customer:
                                        customerName(
                                            row
                                        ),

                                    service:
                                        service(
                                            row
                                        ),

                                    refundType:
                                        refundType,

                                    refundAmount:
                                        refundAmount,

                                    refundDate:
                                        refundDate,

                                    refundMode:
                                        refundMode,

                                    reference:
                                        reference,

                                    reason:
                                        reason,

                                    notes:
                                        notes,

                                    recordedBy:
                                        sessionStorage
                                            .getItem(
                                                "portalUsername"
                                            ) ||
                                        sessionStorage
                                            .getItem(
                                                "username"
                                            ) ||
                                        ""

                                }
                            )

                    }
                );


            const text =
                await response.text();


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

                console.error(
                    "[REFUND] Raw server response:",
                    text
                );


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
                    "Refund could not be recorded."
                );

            }


            closeRefund();


            toast(
                "Refund recorded successfully. " +
                money(
                    result.refundAmount
                ) +
                " refunded.",
                "success"
            );


            /*
             * Refresh existing modules.
             */

            if (
                typeof loadDashboardData ===
                    "function"
            ) {

                await Promise.resolve(
                    loadDashboardData()
                );

            }


            if (
                typeof loadLiveOperations ===
                    "function"
            ) {

                loadLiveOperations();

            }


            if (
                typeof loadDashboardKPI ===
                    "function"
            ) {

                loadDashboardKPI();

            }


            if (
                window.RanSanCollections &&
                typeof window
                    .RanSanCollections
                    .refresh ===
                    "function"
            ) {

                /*
                 * Safe even if Collections is currently
                 * closed; it simply refreshes the dataset.
                 */

                Promise.resolve(
                    window
                        .RanSanCollections
                        .refresh()
                )
                .catch(
                    function (
                        error
                    ) {

                        console.warn(
                            "[REFUND] Collections refresh skipped:",
                            error
                        );

                    }
                );

            }

        }

        catch (
            error
        ) {

            console.error(
                "[REFUND] ERROR:",
                error
            );


            toast(
                error.message ||
                "Refund could not be recorded.",
                "error"
            );

        }

        finally {

            button.innerHTML =
                originalText;


            previewRefund();

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
                event.target?.id ===
                    "refundModal"
            ) {

                closeRefund();

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
                event.key === "Escape" &&
                $("refundModal")
                    ?.classList
                    .contains(
                        "active"
                    )
            ) {

                closeRefund();

            }

        }
    );


    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.RanSanRefund =
        {

            open:
                openRefund,

            close:
                closeRefund,

            changeType:
                changeRefundType,

            preview:
                previewRefund,

            submit:
                submitRefund

        };


})();