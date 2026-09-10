/* =========================================================
   RANSAN TRAVELS
   REFUND HISTORY + REFUND RECEIPT V1
   ========================================================= */

(function () {

    "use strict";


    let currentBooking =
        null;


    let refundRows =
        [];


    let visibleRefundRows =
        [];


    let currentReceipt =
        null;


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
       HTML ESCAPE
       ===================================================== */

    function escapeHtml(
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


    /* =====================================================
       GENERIC VALUE
       ===================================================== */

    function firstValue(
        object,
        keys,
        fallback
    ) {

        if (
            !object ||
            typeof object !==
                "object"
        ) {

            return fallback ?? "";

        }


        for (
            const key
            of keys
        ) {

            if (
                object[key] !==
                    undefined &&
                object[key] !==
                    null &&
                object[key] !==
                    ""
            ) {

                return object[key];

            }

        }


        return fallback ?? "";

    }


    /* =====================================================
       NUMBER
       ===================================================== */

    function numberValue(
        value
    ) {

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
                value ?? ""
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
        value
    ) {

        return (
            "₹" +
            Math.abs(
                numberValue(
                    value
                )
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
       DATE
       ===================================================== */

    function displayDate(
        value
    ) {

        if (!value) {

            return "-";

        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                value
            );

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


    function displayDateTime(
        value
    ) {

        if (!value) {

            return "-";

        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                value
            );

        }


        return date
            .toLocaleString(
                "en-IN",
                {

                    day:
                        "2-digit",

                    month:
                        "short",

                    year:
                        "numeric",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit"

                }
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

    function bookingId(
        row
    ) {

        return String(
            firstValue(
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


    function customerName(
        row
    ) {

        return String(
            firstValue(
                row,
                [

                    "Customer Name",
                    "Customer",
                    "Name",
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
            firstValue(
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


    function service(
        row
    ) {

        return String(
            firstValue(
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
       API
       ===================================================== */

    async function apiPost(
        payload
    ) {

        if (
            typeof getApiUrl !==
                "function"
        ) {

            throw new Error(
                "Dashboard API URL is unavailable."
            );

        }


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
                            payload
                        )

                }
            );


        const text =
            await response.text();


        try {

            return JSON.parse(
                text
            );

        }

        catch (
            error
        ) {

            console.error(
                "[REFUND HISTORY] Invalid server response:",
                text
            );


            throw new Error(
                "Invalid server response."
            );

        }

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
            "[REFUND HISTORY]",
            message
        );

    }


    /* =====================================================
       OPEN
       ===================================================== */

    function openHistory(
        row
    ) {

        if (
            !row ||
            typeof row !==
                "object"
        ) {

            toast(
                "Booking information is unavailable.",
                "error"
            );

            return;

        }


        const id =
            bookingId(
                row
            );


        if (!id) {

            toast(
                "Booking ID is unavailable.",
                "error"
            );

            return;

        }


        currentBooking =
            row;


        refundRows =
            [];


        visibleRefundRows =
            [];


        $("refundHistoryCustomer").textContent =
            customerName(
                row
            );


        $("refundHistoryPhone").textContent =
            phone(
                row
            ) ||
            "-";


        $("refundHistoryBookingId").textContent =
            id;


        $("refundHistoryService").textContent =
            service(
                row
            ) ||
            "-";


        const env =
            environment();


        const envElement =
            $("refundHistoryEnvironment");


        envElement.textContent =
            env;


        envElement.classList.toggle(
            "test",
            env === "TEST"
        );


        $("refundHistorySearch").value =
            "";


        const modal =
            $("refundHistoryModal");


        modal.classList.add(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "refundHistoryOpen"
        );


        loadHistory();

    }


    /* =====================================================
       CLOSE
       ===================================================== */

    function closeHistory() {

        $("refundHistoryModal")
            ?.classList
            .remove(
                "active"
            );


        $("refundHistoryModal")
            ?.setAttribute(
                "aria-hidden",
                "true"
            );


        closeReceipt();


        document.body.classList.remove(
            "refundHistoryOpen"
        );


        currentBooking =
            null;


        refundRows =
            [];


        visibleRefundRows =
            [];

    }


    /* =====================================================
       LOADING
       ===================================================== */

    function setLoading(
        loading
    ) {

        const loadingBox =
            $("refundHistoryLoading");


        const list =
            $("refundHistoryList");


        const empty =
            $("refundHistoryEmpty");


        if (
            loadingBox
        ) {

            loadingBox.hidden =
                !loading;

        }


        if (
            loading
        ) {

            list.innerHTML =
                "";


            empty.hidden =
                true;

        }

    }


    /* =====================================================
       LOAD HISTORY
       ===================================================== */

    async function loadHistory() {

        if (
            !currentBooking
        ) {

            return;

        }


        const id =
            bookingId(
                currentBooking
            );


        setLoading(
            true
        );


        try {

            const result =
                await apiPost(
                    {

                        action:
                            "getBookingRefundHistory",

                        env:
                            environment(),

                        bookingId:
                            id,

                        sheet:
                            currentBooking._sheet ||
                            "",

                        row:
                            Number(
                                currentBooking._row ||
                                0
                            )

                    }
                );


            if (
                !result ||
                result.success !==
                    true
            ) {

                throw new Error(
                    result?.error ||
                    "Refund history could not be loaded."
                );

            }


            refundRows =
                Array.isArray(
                    result.refunds
                )
                    ? result.refunds
                    : [];


            updateSummary(
                result.summary ||
                {}
            );


            applyFilter();

        }

        catch (
            error
        ) {

            console.error(
                "[REFUND HISTORY]",
                error
            );


            refundRows =
                [];


            visibleRefundRows =
                [];


            updateSummary(
                {}
            );


            renderHistory();


            toast(
                error.message ||
                "Refund history could not be loaded.",
                "error"
            );

        }

        finally {

            setLoading(
                false
            );

        }

    }


    /* =====================================================
       SUMMARY
       ===================================================== */

    function updateSummary(
        summary
    ) {

        const count =
            Number(
                summary.count ??
                refundRows.length ??
                0
            );


        const total =
            numberValue(
                summary.totalRefunded ??
                refundRows.reduce(
                    function (
                        sum,
                        row
                    ) {

                        return (
                            sum +
                            Math.abs(
                                numberValue(
                                    row.amount
                                )
                            )
                        );

                    },
                    0
                )
            );


        $("refundHistoryCount").textContent =
            String(
                count
            );


        $("refundHistoryTotal").textContent =
            money(
                total
            );


        $("refundHistoryLatest").textContent =
            summary.latestRefundDate
                ? displayDate(
                    summary.latestRefundDate
                )
                : (
                    refundRows.length
                        ? displayDate(
                            refundRows[0]
                                .refundDate ||
                            refundRows[0]
                                .timestamp
                        )
                        : "-"
                );

    }


    /* =====================================================
       FILTER
       ===================================================== */

    function applyFilter() {

        const keyword =
            String(
                $("refundHistorySearch")
                    ?.value ||
                ""
            )
                .trim()
                .toLowerCase();


        if (!keyword) {

            visibleRefundRows =
                [
                    ...refundRows
                ];

        }

        else {

            visibleRefundRows =
                refundRows.filter(
                    function (
                        row
                    ) {

                        const haystack =
                            [

                                row.transactionId,
                                row.refundDate,
                                row.mode,
                                row.reference,
                                row.reason,
                                row.notes,
                                row.recordedBy,
                                row.customer,
                                row.service

                            ]
                                .join(
                                    " "
                                )
                                .toLowerCase();


                        return haystack
                            .includes(
                                keyword
                            );

                    }
                );

        }


        renderHistory();

    }


    /* =====================================================
       RENDER
       ===================================================== */

    function renderHistory() {

        const list =
            $("refundHistoryList");


        const empty =
            $("refundHistoryEmpty");


        if (
            !visibleRefundRows.length
        ) {

            list.innerHTML =
                "";


            empty.hidden =
                false;


            $("refundHistoryFooterText")
                .textContent =
                    refundRows.length
                        ? "No matching refunds"
                        : "0 transactions";


            return;

        }


        empty.hidden =
            true;


        list.innerHTML =
            visibleRefundRows
                .map(
                    function (
                        row
                    ) {

                        const globalIndex =
                            refundRows
                                .indexOf(
                                    row
                                );


                        const amount =
                            Math.abs(
                                numberValue(
                                    row.amount
                                )
                            );


                        return `
                            <article
                                class="
                                    refundHistoryItem
                                "
                            >

                                <div
                                    class="
                                        refundHistoryItemTop
                                    "
                                >

                                    <div>

                                        <span
                                            class="
                                                refundHistoryTypeBadge
                                            "
                                        >
                                            ↩ REFUND
                                        </span>

                                        <strong
                                            class="
                                                refundHistoryAmount
                                            "
                                        >
                                            -${escapeHtml(
                                                money(
                                                    amount
                                                )
                                            )}
                                        </strong>

                                    </div>


                                    <div
                                        class="
                                            refundHistoryDate
                                        "
                                    >
                                        ${escapeHtml(
                                            displayDate(
                                                row.refundDate ||
                                                row.timestamp
                                            )
                                        )}
                                    </div>

                                </div>


                                <div
                                    class="
                                        refundHistoryMetaGrid
                                    "
                                >

                                    <div>

                                        <small>
                                            Refund ID
                                        </small>

                                        <strong>
                                            ${escapeHtml(
                                                row.transactionId ||
                                                "-"
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            Mode
                                        </small>

                                        <strong>
                                            ${escapeHtml(
                                                row.mode ||
                                                "-"
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            Reference
                                        </small>

                                        <strong>
                                            ${escapeHtml(
                                                row.reference ||
                                                "-"
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            Reason
                                        </small>

                                        <strong>
                                            ${escapeHtml(
                                                row.reason ||
                                                "-"
                                            )}
                                        </strong>

                                    </div>

                                </div>


                                <div
                                    class="
                                        refundHistoryPosition
                                    "
                                >

                                    <span>
                                        Paid
                                        ${escapeHtml(
                                            money(
                                                row.paidBefore
                                            )
                                        )}
                                        →
                                        ${escapeHtml(
                                            money(
                                                row.paidAfter
                                            )
                                        )}
                                    </span>

                                    <span>
                                        Balance
                                        ${escapeHtml(
                                            money(
                                                row.balanceBefore
                                            )
                                        )}
                                        →
                                        ${escapeHtml(
                                            money(
                                                row.balanceAfter
                                            )
                                        )}
                                    </span>

                                </div>


                                ${
                                    row.notes
                                        ? `
                                            <div
                                                class="
                                                    refundHistoryNotes
                                                "
                                            >
                                                ${escapeHtml(
                                                    row.notes
                                                )}
                                            </div>
                                        `
                                        : ""
                                }


                                <div
                                    class="
                                        refundHistoryItemFooter
                                    "
                                >

                                    <span>
                                        ${
                                            row.recordedBy
                                                ? "Recorded by " +
                                                  escapeHtml(
                                                      row.recordedBy
                                                  )
                                                : "Recorded in payment ledger"
                                        }
                                    </span>


                                    <button
                                        type="button"
                                        onclick="
                                            window
                                                .RanSanRefundHistory
                                                ?.openReceipt(
                                                    ${globalIndex}
                                                )
                                        "
                                    >
                                        🧾 View Receipt
                                    </button>

                                </div>

                            </article>
                        `;

                    }
                )
                .join(
                    ""
                );


        $("refundHistoryFooterText")
            .textContent =
                visibleRefundRows.length +
                " of " +
                refundRows.length +
                (
                    refundRows.length === 1
                        ? " transaction"
                        : " transactions"
                );

    }


    /* =====================================================
       OPEN RECEIPT
       ===================================================== */

    function openReceipt(
        index
    ) {

        const row =
            refundRows[
                Number(
                    index
                )
            ];


        if (!row) {

            toast(
                "Refund transaction could not be found.",
                "error"
            );

            return;

        }


        currentReceipt =
            row;


        $("refundReceiptId").textContent =
            row.transactionId ||
            "-";


        $("refundReceiptDate").textContent =
            displayDate(
                row.refundDate ||
                row.timestamp
            );


        $("refundReceiptCustomer").textContent =
            row.customer ||
            customerName(
                currentBooking
            ) ||
            "-";


        $("refundReceiptBookingId").textContent =
            row.bookingId ||
            bookingId(
                currentBooking
            ) ||
            "-";


        $("refundReceiptService").textContent =
            row.service ||
            service(
                currentBooking
            ) ||
            "-";


        $("refundReceiptAmount").textContent =
            money(
                row.amount
            );


        $("refundReceiptPaidBefore").textContent =
            money(
                row.paidBefore
            );


        $("refundReceiptPaidAfter").textContent =
            money(
                row.paidAfter
            );


        $("refundReceiptBalanceBefore").textContent =
            money(
                row.balanceBefore
            );


        $("refundReceiptBalanceAfter").textContent =
            money(
                row.balanceAfter
            );


        $("refundReceiptMode").textContent =
            row.mode ||
            "-";


        $("refundReceiptReference").textContent =
            row.reference ||
            "-";


        $("refundReceiptReason").textContent =
            row.reason ||
            "-";


        $("refundReceiptRecordedBy").textContent =
            row.recordedBy ||
            "-";


        $("refundReceiptNotes").textContent =
            row.notes ||
            "-";


        $("refundReceiptNotesSection").hidden =
            !String(
                row.notes ||
                ""
            ).trim();


        const modal =
            $("refundReceiptModal");


        modal.classList.add(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /* =====================================================
       CLOSE RECEIPT
       ===================================================== */

    function closeReceipt() {

        $("refundReceiptModal")
            ?.classList
            .remove(
                "active"
            );


        $("refundReceiptModal")
            ?.setAttribute(
                "aria-hidden",
                "true"
            );


        currentReceipt =
            null;

    }


    /* =====================================================
       PRINT RECEIPT
       ===================================================== */

    function printReceipt() {

        if (
            !currentReceipt
        ) {

            return;

        }


        const row =
            currentReceipt;


        const popup =
            window.open(
                "",
                "_blank",
                "width=900,height=900"
            );


        if (!popup) {

            toast(
                "Allow pop-ups to print the refund receipt.",
                "warning"
            );

            return;

        }


        const safe =
            escapeHtml;


        const notes =
            String(
                row.notes ||
                ""
            ).trim();


        popup.document.open();


        popup.document.write(`
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
    Refund ${safe(
        row.transactionId ||
        row.bookingId ||
        ""
    )}
</title>

<style>

    * {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        padding: 32px;
        background: #ffffff;
        color: #111827;
        font-family:
            Arial,
            Helvetica,
            sans-serif;
    }

    .receipt {
        width: 100%;
        max-width: 780px;
        margin: 0 auto;
        border: 1px solid #d9dee6;
        border-radius: 16px;
        overflow: hidden;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 26px;
        border-bottom: 1px solid #e5e7eb;
    }

    h1 {
        margin: 0;
        font-size: 25px;
    }

    .subtitle {
        margin-top: 5px;
        color: #6b7280;
        font-size: 12px;
    }

    .status {
        padding: 7px 11px;
        border: 1px solid #fecdd3;
        border-radius: 999px;
        background: #fff1f2;
        color: #be123c;
        font-size: 10px;
        font-weight: 800;
    }

    .body {
        padding: 26px;
    }

    .amount {
        margin-bottom: 22px;
        padding: 20px;
        border: 1px solid #fecdd3;
        border-radius: 12px;
        background: #fff7f8;
        text-align: center;
    }

    .amount small {
        display: block;
        color: #6b7280;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: .08em;
    }

    .amount strong {
        display: block;
        margin-top: 6px;
        color: #be123c;
        font-size: 28px;
    }

    .section {
        margin-top: 20px;
    }

    .sectionTitle {
        margin-bottom: 9px;
        color: #6b7280;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .09em;
        text-transform: uppercase;
    }

    .row {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        padding: 9px 0;
        border-bottom: 1px solid #edf0f4;
        font-size: 12px;
    }

    .row span {
        color: #6b7280;
    }

    .row strong {
        text-align: right;
    }

    .finance {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }

    .finance div {
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 9px;
    }

    .finance small {
        display: block;
        color: #6b7280;
        font-size: 10px;
    }

    .finance strong {
        display: block;
        margin-top: 5px;
        font-size: 14px;
    }

    .notes {
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 9px;
        font-size: 12px;
        line-height: 1.55;
        white-space: pre-wrap;
    }

    .footer {
        margin-top: 25px;
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 10px;
        line-height: 1.5;
        text-align: center;
    }

    @media print {

        body {
            padding: 0;
        }

        .receipt {
            border: 0;
        }

    }

</style>

</head>

<body>

<div class="receipt">

    <div class="header">

        <div>

            <h1>
                RanSan Travels
            </h1>

            <div class="subtitle">
                Refund Acknowledgement
            </div>

        </div>

        <div class="status">
            REFUND RECORDED
        </div>

    </div>


    <div class="body">

        <div class="amount">

            <small>
                REFUND AMOUNT
            </small>

            <strong>
                ${safe(
                    money(
                        row.amount
                    )
                )}
            </strong>

        </div>


        <div class="section">

            <div class="sectionTitle">
                Refund Reference
            </div>

            <div class="row">
                <span>Refund ID</span>
                <strong>
                    ${safe(
                        row.transactionId ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="row">
                <span>Refund Date</span>
                <strong>
                    ${safe(
                        displayDate(
                            row.refundDate ||
                            row.timestamp
                        )
                    )}
                </strong>
            </div>

        </div>


        <div class="section">

            <div class="sectionTitle">
                Booking
            </div>

            <div class="row">
                <span>Customer</span>
                <strong>
                    ${safe(
                        row.customer ||
                        customerName(
                            currentBooking
                        ) ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="row">
                <span>Booking ID</span>
                <strong>
                    ${safe(
                        row.bookingId ||
                        bookingId(
                            currentBooking
                        ) ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="row">
                <span>Service</span>
                <strong>
                    ${safe(
                        row.service ||
                        service(
                            currentBooking
                        ) ||
                        "-"
                    )}
                </strong>
            </div>

        </div>


        <div class="section">

            <div class="sectionTitle">
                Financial Position
            </div>

            <div class="finance">

                <div>
                    <small>Paid Before</small>
                    <strong>
                        ${safe(
                            money(
                                row.paidBefore
                            )
                        )}
                    </strong>
                </div>

                <div>
                    <small>Paid After</small>
                    <strong>
                        ${safe(
                            money(
                                row.paidAfter
                            )
                        )}
                    </strong>
                </div>

                <div>
                    <small>Balance Before</small>
                    <strong>
                        ${safe(
                            money(
                                row.balanceBefore
                            )
                        )}
                    </strong>
                </div>

                <div>
                    <small>Balance After</small>
                    <strong>
                        ${safe(
                            money(
                                row.balanceAfter
                            )
                        )}
                    </strong>
                </div>

            </div>

        </div>


        <div class="section">

            <div class="sectionTitle">
                Refund Details
            </div>

            <div class="row">
                <span>Refund Mode</span>
                <strong>
                    ${safe(
                        row.mode ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="row">
                <span>Reference</span>
                <strong>
                    ${safe(
                        row.reference ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="row">
                <span>Reason</span>
                <strong>
                    ${safe(
                        row.reason ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="row">
                <span>Recorded By</span>
                <strong>
                    ${safe(
                        row.recordedBy ||
                        "-"
                    )}
                </strong>
            </div>

        </div>


        ${
            notes
                ? `
                    <div class="section">

                        <div class="sectionTitle">
                            Notes
                        </div>

                        <div class="notes">
                            ${safe(
                                notes
                            )}
                        </div>

                    </div>
                `
                : ""
        }


        <div class="footer">

            This acknowledgement confirms that the refund
            was recorded in the RanSan Travels payment ledger.
            The original payment transaction remains preserved
            for audit purposes.

        </div>

    </div>

</div>

<script>

    window.addEventListener(
        "load",
        function () {

            setTimeout(
                function () {

                    window.print();

                },
                250
            );

        }
    );

<\/script>

</body>

</html>
        `);


        popup.document.close();

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
                    "refundHistoryModal"
            ) {

                closeHistory();

            }


            if (
                event.target?.id ===
                    "refundReceiptModal"
            ) {

                closeReceipt();

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


            if (
                $("refundReceiptModal")
                    ?.classList
                    .contains(
                        "active"
                    )
            ) {

                closeReceipt();

                return;

            }


            if (
                $("refundHistoryModal")
                    ?.classList
                    .contains(
                        "active"
                    )
            ) {

                closeHistory();

            }

        }
    );


    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.RanSanRefundHistory =
        {

            open:
                openHistory,

            close:
                closeHistory,

            refresh:
                loadHistory,

            filter:
                applyFilter,

            openReceipt:
                openReceipt,

            closeReceipt:
                closeReceipt,

            printReceipt:
                printReceipt

        };


})();