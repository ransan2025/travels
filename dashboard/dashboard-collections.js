/* =========================================================
   RANSAN TRAVELS
   PAYMENT AGEING / COLLECTIONS DASHBOARD V1
   ========================================================= */

(function () {

    "use strict";


    let collectionRows = [];

    let visibleRows = [];

    let activeBucket = "all";

    let currentDueDateRow = null;



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
       ESCAPE
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

    function money(
        value
    ) {

        return (
            "₹" +
            numberValue(
                value
            )
                .toLocaleString(
                    "en-IN",
                    {

                        maximumFractionDigits:
                            2

                    }
                )
        );

    }



    /* =====================================================
       ENV
       ===================================================== */

    function environment() {

        let env = "";


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
       POST
       ===================================================== */

    async function apiPost(
        data
    ) {

        if (
            typeof getApiUrl !==
                "function"
        ) {

            throw new Error(
                "Dashboard API is unavailable."
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
                            data
                        )

                }
            );


        const text =
            await response.text();


        let json;


        try {

            json =
                JSON.parse(
                    text
                );

        }

        catch (
            error
        ) {

            console.error(
                "[COLLECTIONS] RAW RESPONSE:",
                text
            );


            throw new Error(
                "Invalid server response."
            );

        }


        return json;

    }



    /* =====================================================
       FORMAT DATE
       ===================================================== */

    function displayDate(
        value
    ) {

        const text =
            String(
                value || ""
            ).trim();


        if (!text) {

            return "-";

        }


        const match =
            text.match(
                /^(\d{4})-(\d{2})-(\d{2})$/
            );


        if (match) {

            const d =
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


            return d.toLocaleDateString(
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


        const parsed =
            new Date(
                text
            );


        if (
            !Number.isNaN(
                parsed.getTime()
            )
        ) {

            return parsed
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


        return text;

    }



    /* =====================================================
       AGEING TEXT
       ===================================================== */

    function ageingLabel(
        row
    ) {

        switch (
            row.ageingBucket
        ) {

            case "due_soon":

                return {
                    label:
                        "Due Soon",
                    css:
                        "soon"
                };


            case "due_today":

                return {
                    label:
                        "Due Today",
                    css:
                        "today"
                };


            case "overdue_1_7":

                return {
                    label:
                        row.daysOverdue +
                        "d overdue",
                    css:
                        "overdue"
                };


            case "overdue_8_30":

                return {
                    label:
                        row.daysOverdue +
                        "d overdue",
                    css:
                        "late"
                };


            case "overdue_30_plus":

                return {
                    label:
                        row.daysOverdue +
                        "d overdue",
                    css:
                        "critical"
                };


            case "no_due_date":

                return {
                    label:
                        "No due date",
                    css:
                        "nodue"
                };


            default:

                return {
                    label:
                        "-",
                    css:
                        ""
                };

        }

    }



    /* =====================================================
       SERVICE LABEL
       ===================================================== */

    function serviceLabel(
        sheet
    ) {

        const key =
            String(
                sheet || ""
            ).toLowerCase();


        if (
            key === "air"
        ) {

            return "✈ Flight";

        }


        if (
            key === "train"
        ) {

            return "🚆 Train";

        }


        if (
            key === "bus"
        ) {

            return "🚌 Bus";

        }


        if (
            key === "car_bookings"
        ) {

            return "🚕 Car";

        }


        if (
            key === "travel_leads"
        ) {

            return "🏖 Package";

        }


        if (
            key === "premium_quote"
        ) {

            return "💎 Quote";

        }


        return sheet || "-";

    }



    /* =====================================================
       OPEN
       ===================================================== */

    async function openCollections() {

        const modal =
            $("collectionsModal");


        if (!modal) {

            console.error(
                "[COLLECTIONS] Modal missing."
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


        document.body.classList.add(
            "collectionsOpen"
        );


        const env =
            environment();


        const badge =
            $("collectionsEnvironment");


        if (badge) {

            badge.textContent =
                env;


            badge.classList.toggle(
                "test",
                env === "TEST"
            );

        }


        await loadCollections();

    }



    /* =====================================================
       CLOSE
       ===================================================== */

    function closeCollections() {

        $("collectionsModal")
            ?.classList.remove(
                "active"
            );


        $("collectionsModal")
            ?.setAttribute(
                "aria-hidden",
                "true"
            );


        document.body.classList.remove(
            "collectionsOpen"
        );


        closeDueDate();

    }



    /* =====================================================
       LOAD
       ===================================================== */

    async function loadCollections() {

        setLoading(
            true
        );


        try {

            const result =
                await apiPost(
                    {

                        action:
                            "getPaymentCollections",

                        env:
                            environment()

                    }
                );


            if (
                !result ||
                result.success !==
                    true
            ) {

                throw new Error(
                    result?.error ||
                    "Unable to load collections."
                );

            }


            collectionRows =
                Array.isArray(
                    result.rows
                )
                    ? result.rows
                    : [];


            activeBucket =
                "all";


            document
                .querySelectorAll(
                    ".collectionsAgeingCard"
                )
                .forEach(
                    function (
                        button
                    ) {

                        button.classList.toggle(
                            "active",
                            button.dataset.bucket ===
                                "all"
                        );

                    }
                );


            updateSummary(
                result.summary ||
                {}
            );


            applyFilters();

        }

        catch (
            error
        ) {

            console.error(
                "[COLLECTIONS] LOAD ERROR:",
                error
            );


            if (
                typeof showToast ===
                    "function"
            ) {

                showToast(
                    error.message ||
                    "Unable to load payment collections.",
                    "error"
                );

            }

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

        setText(
            "collectionsOutstandingAmount",
            money(
                summary.outstandingAmount
            )
        );


        setText(
            "collectionsOutstandingCount",
            bookingCountText(
                summary.outstandingCount
            )
        );


        setText(
            "collectionsDueTodayAmount",
            money(
                summary.dueTodayAmount
            )
        );


        setText(
            "collectionsDueTodayCount",
            bookingCountText(
                summary.dueTodayCount
            )
        );


        setText(
            "collectionsOverdueAmount",
            money(
                summary.overdueAmount
            )
        );


        setText(
            "collectionsOverdueCount",
            bookingCountText(
                summary.overdueCount
            )
        );


        setText(
            "collectionsNoDueAmount",
            money(
                summary.noDueDateAmount
            )
        );


        setText(
            "collectionsNoDueCount",
            bookingCountText(
                summary.noDueDateCount
            )
        );


        setText(
            "collectionsBucketAll",
            summary.outstandingCount || 0
        );


        setText(
            "collectionsBucketSoon",
            summary.dueSoonCount || 0
        );


        setText(
            "collectionsBucketToday",
            summary.dueTodayCount || 0
        );


        setText(
            "collectionsBucket1to7",
            summary.overdue1to7Count || 0
        );


        setText(
            "collectionsBucket8to30",
            summary.overdue8to30Count || 0
        );


        setText(
            "collectionsBucket30Plus",
            summary.overdue30PlusCount || 0
        );


        setText(
            "collectionsBucketNoDue",
            summary.noDueDateCount || 0
        );

    }



    function bookingCountText(
        value
    ) {

        const count =
            Number(
                value || 0
            );


        return (
            count +
            (
                count === 1
                    ? " booking"
                    : " bookings"
            )
        );

    }



    function setText(
        id,
        value
    ) {

        const element =
            $(
                id
            );


        if (
            element
        ) {

            element.textContent =
                value;

        }

    }



    /* =====================================================
       BUCKET
       ===================================================== */

    function setBucket(
        bucket,
        button
    ) {

        activeBucket =
            bucket ||
            "all";


        document
            .querySelectorAll(
                ".collectionsAgeingCard"
            )
            .forEach(
                function (
                    item
                ) {

                    item.classList.remove(
                        "active"
                    );

                }
            );


        button?.classList.add(
            "active"
        );


        applyFilters();

    }



    /* =====================================================
       FILTER
       ===================================================== */

    function applyFilters() {

        const keyword =
            String(
                $("collectionsSearch")
                    ?.value ||
                ""
            )
                .trim()
                .toLowerCase();


        const service =
            String(
                $("collectionsServiceFilter")
                    ?.value ||
                "all"
            );


        const sort =
            String(
                $("collectionsSort")
                    ?.value ||
                "urgency"
            );


        visibleRows =
            collectionRows.filter(
                function (
                    row
                ) {

                    if (
                        activeBucket !==
                            "all" &&
                        row.ageingBucket !==
                            activeBucket
                    ) {

                        return false;

                    }


                    if (
                        service !==
                            "all" &&
                        String(
                            row.sheet
                        ) !==
                            service
                    ) {

                        return false;

                    }


                    if (
                        keyword
                    ) {

                        const search =
                            [

                                row.customer,
                                row.bookingId,
                                row.phone,
                                row.service,
                                row.sheet,
                                row.paymentStatus

                            ]
                                .join(
                                    " "
                                )
                                .toLowerCase();


                        if (
                            !search.includes(
                                keyword
                            )
                        ) {

                            return false;

                        }

                    }


                    return true;

                }
            );


        sortRows(
            visibleRows,
            sort
        );


        renderRows(
            visibleRows
        );

    }



    /* =====================================================
       SORT
       ===================================================== */

    function sortRows(
        rows,
        sort
    ) {

        if (
            sort ===
                "balance_desc"
        ) {

            rows.sort(
                (
                    a,
                    b
                ) =>
                    numberValue(
                        b.balanceAmount
                    ) -
                    numberValue(
                        a.balanceAmount
                    )
            );


            return;

        }


        if (
            sort ===
                "balance_asc"
        ) {

            rows.sort(
                (
                    a,
                    b
                ) =>
                    numberValue(
                        a.balanceAmount
                    ) -
                    numberValue(
                        b.balanceAmount
                    )
            );


            return;

        }


        if (
            sort ===
                "customer"
        ) {

            rows.sort(
                (
                    a,
                    b
                ) =>
                    String(
                        a.customer ||
                        ""
                    )
                        .localeCompare(
                            String(
                                b.customer ||
                                ""
                            )
                        )
            );


            return;

        }


        if (
            sort ===
                "due_date"
        ) {

            rows.sort(
                (
                    a,
                    b
                ) =>
                    String(
                        a.paymentDueDate ||
                        "9999-12-31"
                    )
                        .localeCompare(
                            String(
                                b.paymentDueDate ||
                                "9999-12-31"
                            )
                        )
            );


            return;

        }


        /*
         * Urgency:
         * oldest overdue first,
         * no due date after dated overdue,
         * future after.
         */

        rows.sort(
            function (
                a,
                b
            ) {

                const rank = {

                    overdue_30_plus:
                        1,

                    overdue_8_30:
                        2,

                    overdue_1_7:
                        3,

                    due_today:
                        4,

                    due_soon:
                        5,

                    no_due_date:
                        6

                };


                const diff =
                    (
                        rank[
                            a.ageingBucket
                        ] || 99
                    ) -
                    (
                        rank[
                            b.ageingBucket
                        ] || 99
                    );


                if (
                    diff !== 0
                ) {

                    return diff;

                }


                return (
                    numberValue(
                        b.balanceAmount
                    ) -
                    numberValue(
                        a.balanceAmount
                    )
                );

            }
        );

    }



    /* =====================================================
       RENDER
       ===================================================== */

    function renderRows(
        rows
    ) {

        const body =
            $("collectionsTableBody");


        const empty =
            $("collectionsEmpty");


        if (
            !body
        ) {

            return;

        }


        body.innerHTML =
            "";


        if (
            !rows.length
        ) {

            empty.hidden =
                false;


            updateFooter(
                []
            );


            return;

        }


        empty.hidden =
            true;


        rows.forEach(
            function (
                row
            ) {

                const ageing =
                    ageingLabel(
                        row
                    );


                const tr =
                    document.createElement(
                        "tr"
                    );


                tr.innerHTML = `

                    <td>

                        <div
                            class="collectionsCustomer"
                        >

                            <strong>
                                ${escapeHtml(
                                    row.customer ||
                                    "Customer"
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    row.phone ||
                                    "-"
                                )}
                            </small>

                        </div>

                    </td>


                    <td>

                        <div
                            class="collectionsBooking"
                        >

                            <strong>
                                ${escapeHtml(
                                    row.bookingId ||
                                    "-"
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    serviceLabel(
                                        row.sheet
                                    )
                                )}
                            </small>

                        </div>

                    </td>


                    <td class="collectionsMoney">
                        ${money(
                            row.totalAmount
                        )}
                    </td>


                    <td
                        class="
                            collectionsMoney
                            paid
                        "
                    >
                        ${money(
                            row.paidAmount
                        )}
                    </td>


                    <td
                        class="
                            collectionsMoney
                            balance
                        "
                    >
                        ${money(
                            row.balanceAmount
                        )}
                    </td>


                    <td>

                        <button
                            type="button"
                            class="
                                collectionsDueDateBtn
                                ${
                                    row.paymentDueDate
                                        ? ""
                                        : "missing"
                                }
                            "
                            title="Set Payment Due Date"
                        >
                            ${
                                row.paymentDueDate
                                    ? escapeHtml(
                                        displayDate(
                                            row.paymentDueDate
                                        )
                                    )
                                    : "＋ Set Date"
                            }
                        </button>

                    </td>


                    <td>

                        <span
                            class="
                                collectionsAgeBadge
                                ${ageing.css}
                            "
                        >
                            ${escapeHtml(
                                ageing.label
                            )}
                        </span>

                    </td>


                    <td>

                        <div
                            class="collectionsLastDate"
                        >

                            ${escapeHtml(
                                displayDate(
                                    row.lastPaymentDate
                                )
                            )}

                            ${
                                row.lastPaymentMode

                                ? `
                                    <small>
                                        ${escapeHtml(
                                            row.lastPaymentMode
                                        )}
                                    </small>
                                  `

                                : ""
                            }

                        </div>

                    </td>


                    <td>

                        <div
                            class="collectionsLastDate"
                        >

                            ${escapeHtml(
                                displayDate(
                                    row.lastReminderDate
                                )
                            )}

                            ${
                                row.lastReminderDate

                                ? `
                                    <small>
                                        Sent
                                    </small>
                                  `

                                : `
                                    <small>
                                        Never
                                    </small>
                                  `
                            }

                        </div>

                    </td>


                    <td>

                        <div
                            class="collectionsRowActions"
                        >

                            <button
                                type="button"
                                class="collectionsAction customer"
                                title="Open Customer"
                            >
                                👤
                            </button>


                            <button
                                type="button"
                                class="collectionsAction payment"
                                title="Add Payment"
                            >
                                ＋₹
                            </button>


                            <button
                                type="button"
                                class="collectionsAction reminder"
                                title="Send Payment Reminder"
                            >
                                💬
                            </button>


                            <button
                                type="button"
                                class="collectionsAction invoice"
                                title="View Invoice"
                            >
                                🧾
                            </button>

                        </div>

                    </td>

                `;


                tr
                    .querySelector(
                        ".collectionsDueDateBtn"
                    )
                    ?.addEventListener(
                        "click",
                        function () {

                            openDueDate(
                                row
                            );

                        }
                    );


                tr
                    .querySelector(
                        ".collectionsAction.customer"
                    )
                    ?.addEventListener(
                        "click",
                        function () {

                            openCustomerAction(
                                row
                            );

                        }
                    );


                tr
                    .querySelector(
                        ".collectionsAction.payment"
                    )
                    ?.addEventListener(
                        "click",
                        function () {

                            openPaymentAction(
                                row
                            );

                        }
                    );


                tr
                    .querySelector(
                        ".collectionsAction.reminder"
                    )
                    ?.addEventListener(
                        "click",
                        function () {

                            openReminderAction(
                                row
                            );

                        }
                    );


                tr
                    .querySelector(
                        ".collectionsAction.invoice"
                    )
                    ?.addEventListener(
                        "click",
                        function () {

                            openInvoiceAction(
                                row
                            );

                        }
                    );


                body.appendChild(
                    tr
                );

            }
        );


        updateFooter(
            rows
        );

    }



    /* =====================================================
       FOOTER
       ===================================================== */

    function updateFooter(
        rows
    ) {

        setText(
            "collectionsVisibleCount",
            rows.length
        );


        const total =
            rows.reduce(
                (
                    sum,
                    row
                ) =>
                    sum +
                    numberValue(
                        row.balanceAmount
                    ),
                0
            );


        setText(
            "collectionsTotalVisible",
            money(
                total
            )
        );

    }



    /* =====================================================
       RAW ROW FOR EXISTING FEATURES
       ===================================================== */

    function buildExistingRow(
        collection
    ) {

        const raw =
            collection.raw &&
            typeof collection.raw ===
                "object"

                ? {
                    ...collection.raw
                }

                : {};


        raw._sheet =
            collection.sheet;


        raw._row =
            collection.row;


        raw["Payment Due Date"] =
            collection.paymentDueDate ||
            "";


        return raw;

    }



    /* =====================================================
       OPEN CUSTOMER
       ===================================================== */

    function openCustomerAction(
        collection
    ) {

        const row =
            buildExistingRow(
                collection
            );


        closeCollections();


        if (
            typeof openCustomerV2 ===
                "function"
        ) {

            openCustomerV2(
                row
            );


            return;

        }


        if (
            typeof openCustomer ===
                "function"
        ) {

            openCustomer(
                row
            );


            return;

        }


        showToast?.(
            "Customer Drawer is unavailable.",
            "error"
        );

    }



    /* =====================================================
       ADD PAYMENT
       ===================================================== */

    function openPaymentAction(
        collection
    ) {

        const row =
            buildExistingRow(
                collection
            );


        let key =
            "";


        if (
            typeof registerDashboardPaymentRow ===
                "function"
        ) {

            key =
                registerDashboardPaymentRow(
                    row
                );

        }

        else {

            window.__ransanPaymentRows =
                window.__ransanPaymentRows ||
                {};


            key =
                String(
                    row._sheet
                ) +
                "::" +
                String(
                    row._row
                ) +
                "::" +
                String(
                    row["Booking ID"] ||
                    ""
                );


            window.__ransanPaymentRows[
                key
            ] =
                row;

        }


        if (
            !window.RanSanPayment?.open
        ) {

            showToast?.(
                "Payment module is unavailable.",
                "error"
            );

            return;

        }


        window.RanSanPayment.open(
            key
        );

    }



    /* =====================================================
       PAYMENT REMINDER
       ===================================================== */

    function openReminderAction(
        collection
    ) {

        const row =
            buildExistingRow(
                collection
            );


        if (
            !window
                .RanSanPaymentReminder
                ?.open
        ) {

            showToast?.(
                "Payment Reminder module is unavailable.",
                "error"
            );

            return;

        }


        window
            .RanSanPaymentReminder
            .open(
                row
            );

    }



    /* =====================================================
       INVOICE
       ===================================================== */

    function openInvoiceAction(
        collection
    ) {

        const row =
            buildExistingRow(
                collection
            );


        if (
            !window
                .RanSanInvoice
                ?.open
        ) {

            showToast?.(
                "Invoice module is unavailable.",
                "error"
            );

            return;

        }


        window
            .RanSanInvoice
            .open(
                row
            );

    }



    /* =====================================================
       DUE DATE MODAL
       ===================================================== */

    function openDueDate(
        collection
    ) {

        currentDueDateRow =
            collection;


        setText(
            "paymentDueDateBookingId",
            collection.bookingId ||
            "-"
        );


        setText(
            "paymentDueDateCustomer",
            collection.customer ||
            "-"
        );


        const input =
            $("paymentDueDateInput");


        if (
            input
        ) {

            input.value =
                collection.paymentDueDate ||
                "";

        }


        $("paymentDueDateModal")
            ?.classList.add(
                "active"
            );


        $("paymentDueDateModal")
            ?.setAttribute(
                "aria-hidden",
                "false"
            );

    }



    function closeDueDate() {

        $("paymentDueDateModal")
            ?.classList.remove(
                "active"
            );


        $("paymentDueDateModal")
            ?.setAttribute(
                "aria-hidden",
                "true"
            );


        currentDueDateRow =
            null;

    }



    /* =====================================================
       SAVE DUE DATE
       ===================================================== */

    async function saveDueDate() {

        if (
            !currentDueDateRow
        ) {

            return;

        }


        const dueDate =
            String(
                $("paymentDueDateInput")
                    ?.value ||
                ""
            );


        await updateDueDate(
            dueDate
        );

    }



    async function clearDueDate() {

        if (
            !currentDueDateRow
        ) {

            return;

        }


        await updateDueDate(
            ""
        );

    }



    async function updateDueDate(
        dueDate
    ) {

        const row =
            currentDueDateRow;


        const button =
            $("paymentDueDateSaveBtn");


        if (
            button
        ) {

            button.disabled =
                true;


            button.textContent =
                "Saving...";

        }


        try {

            const result =
                await apiPost(
                    {

                        action:
                            "updatePaymentDueDate",

                        env:
                            environment(),

                        sheet:
                            row.sheet,

                        row:
                            Number(
                                row.row
                            ),

                        bookingId:
                            row.bookingId,

                        dueDate:
                            dueDate,

                        customer:
                            row.customer,

                        service:
                            row.service,

                        updatedBy:
                            sessionStorage.getItem(
                                "portalUsername"
                            ) ||
                            ""

                    }
                );


            if (
                !result ||
                result.success !==
                    true
            ) {

                throw new Error(
                    result?.error ||
                    "Unable to save payment due date."
                );

            }


            closeDueDate();


            showToast?.(
                dueDate
                    ? "Payment due date saved."
                    : "Payment due date cleared.",
                "success"
            );


            await loadCollections();


            /*
             * Refresh main dashboard too so the new
             * Payment Due Date is available in booking rows.
             */

            if (
                typeof loadDashboardData ===
                    "function"
            ) {

                await loadDashboardData();

            }

        }

        catch (
            error
        ) {

            console.error(
                "[COLLECTIONS] DUE DATE ERROR:",
                error
            );


            showToast?.(
                error.message ||
                "Unable to save payment due date.",
                "error"
            );

        }

        finally {

            if (
                button
            ) {

                button.disabled =
                    false;


                button.textContent =
                    "Save Due Date";

            }

        }

    }



    /* =====================================================
       LOADING
       ===================================================== */

    function setLoading(
        loading
    ) {

        const element =
            $("collectionsLoading");


        if (
            element
        ) {

            element.hidden =
                !loading;

        }

    }



    /* =====================================================
       BACKDROP / ESC
       ===================================================== */

    document.addEventListener(
        "click",
        function (
            event
        ) {

            if (
                event.target?.id ===
                    "collectionsModal"
            ) {

                closeCollections();

            }


            if (
                event.target?.id ===
                    "paymentDueDateModal"
            ) {

                closeDueDate();

            }

        }
    );


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
                $("paymentDueDateModal")
                    ?.classList.contains(
                        "active"
                    )
            ) {

                closeDueDate();

                return;

            }


            if (
                $("collectionsModal")
                    ?.classList.contains(
                        "active"
                    )
            ) {

                closeCollections();

            }

        }
    );



    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.RanSanCollections =
        {

            open:
                openCollections,

            close:
                closeCollections,

            refresh:
                loadCollections,

            applyFilters:
                applyFilters,

            setBucket:
                setBucket,

            openDueDate:
                openDueDate,

            closeDueDate:
                closeDueDate,

            saveDueDate:
                saveDueDate,

            clearDueDate:
                clearDueDate

        };


})();