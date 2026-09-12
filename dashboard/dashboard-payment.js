/* =========================================================
   RANSAN TRAVELS
   DASHBOARD PAYMENT RECORDING + HISTORY V2
   ========================================================= */

(function () {

    "use strict";


    let currentPaymentRow =
        null;


    /*
     * Used to ignore an old history
     * response if another booking
     * is opened immediately.
     */
    let paymentHistoryRequestToken =
        0;

    /* =========================================================
PAYMENT RECEIPT STATE
========================================================= */

    /*
     * Current history loaded in the Payment modal.
     *
     * Receipt View uses this in-memory history.
     * No second API request is required.
     */

    let currentPaymentHistory =
        [];


    /*
     * Transaction currently displayed
     * inside the Receipt modal.
     */

    let currentReceiptTransaction =
        null;


    /* =====================================================
       ELEMENT
       ===================================================== */

    function el(id) {

        return document.getElementById(
            id
        );

    }



    /* =====================================================
       ENVIRONMENT
       ===================================================== */

    function getPaymentEnvironment() {

        let environment =
            "";


        /*
         * DASHBOARD_ENV may have been declared
         * with let/const rather than window.
         */

        try {

            if (
                typeof DASHBOARD_ENV !==
                "undefined"
            ) {

                environment =
                    DASHBOARD_ENV;

            }

        }

        catch (error) {

            // Ignore.

        }


        if (!environment) {

            environment =
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
        )
            ? "TEST"
            : "LIVE";

    }



    /* =====================================================
       NUMBER
       ===================================================== */

    function paymentNumber(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return 0;

        }


        const cleaned =
            String(value)
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

    function paymentMoney(value) {

        const number =
            paymentNumber(
                value
            );


        return (
            "₹" +
            number.toLocaleString(
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
       ESCAPE HTML
       ===================================================== */

    function escapeHtml(value) {

        return String(
            value ??
            ""
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
       LOCAL DATE
       ===================================================== */

    function todayLocal() {

        const now =
            new Date();


        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );


        return (
            year +
            "-" +
            month +
            "-" +
            day
        );

    }



    /* =====================================================
       DISPLAY PAYMENT DATE
       ===================================================== */

    function formatPaymentDate(value) {

        const text =
            String(
                value ||
                ""
            ).trim();


        if (!text) {

            return "-";

        }


        /*
         * YYYY-MM-DD
         */

        const match =
            text.match(
                /^(\d{4})-(\d{2})-(\d{2})$/
            );


        if (match) {

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
                !Number.isNaN(
                    date.getTime()
                )
            ) {

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

        }


        return text;

    }



    /* =====================================================
       MODE ICON
       ===================================================== */

    function paymentModeIcon(mode) {

        const normalized =
            String(
                mode ||
                ""
            )
                .trim()
                .toLowerCase();


        if (
            normalized.includes(
                "upi"
            )
        ) {
            return "⌁";
        }


        if (
            normalized.includes(
                "cash"
            )
        ) {
            return "₹";
        }


        if (
            normalized.includes(
                "bank"
            )
        ) {
            return "🏦";
        }


        if (
            normalized.includes(
                "card"
            )
        ) {
            return "▣";
        }


        if (
            normalized.includes(
                "cheque"
            )
        ) {
            return "▤";
        }


        return "₹";

    }



    /* =====================================================
       CURRENT BOOKING DETAILS
       ===================================================== */

    function getCurrentPaymentContext() {

        if (
            !currentPaymentRow
        ) {

            return null;

        }


        const row =
            currentPaymentRow;


        return {

            bookingId:
                String(
                    row[
                    "Booking ID"
                    ] ||
                    row.bookingId ||
                    ""
                ).trim(),

            customer:
                String(
                    row[
                    "Customer Name"
                    ] ||
                    row.Name ||
                    row.Customer ||
                    ""
                ).trim(),

            service:
                String(
                    row.Service ||
                    row._sheet ||
                    ""
                ).trim(),

            sheet:
                String(
                    row._sheet ||
                    ""
                ).trim(),

            row:
                Number(
                    row._row
                )

        };

    }



    /* =====================================================
       OPEN PAYMENT MODAL
       ===================================================== */

    function openPaymentModal(
        paymentKey
    ) {

        const registry =
            window
                .__ransanPaymentRows ||
            {};


        const row =
            registry[
            paymentKey
            ];


        if (!row) {

            console.error(
                "[PAYMENT] Booking row not found:",
                paymentKey
            );


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


        currentPaymentRow =
            row;


        const total =
            typeof getDashboardPaymentTotal ===
                "function"

                ? getDashboardPaymentTotal(
                    row
                )

                : 0;


        const paid =
            typeof getDashboardPaymentPaid ===
                "function"

                ? getDashboardPaymentPaid(
                    row
                )

                : 0;


        const balance =
            typeof getDashboardPaymentBalance ===
                "function"

                ? getDashboardPaymentBalance(
                    row,
                    total,
                    paid
                )

                : Math.max(
                    0,
                    total -
                    paid
                );


        const bookingId =
            row[
            "Booking ID"
            ] ||
            row.bookingId ||
            "-";


        const customer =
            row[
            "Customer Name"
            ] ||
            row.Name ||
            row.Customer ||
            "Customer";


        /* -----------------------------------------
           IDENTITY
           ----------------------------------------- */

        if (
            el(
                "paymentModalBookingId"
            )
        ) {

            el(
                "paymentModalBookingId"
            ).textContent =
                bookingId;

        }


        if (
            el(
                "paymentModalCustomer"
            )
        ) {

            el(
                "paymentModalCustomer"
            ).textContent =
                customer;

        }


        /* -----------------------------------------
           SUMMARY
           ----------------------------------------- */

        el(
            "paymentModalTotal"
        ).textContent =
            paymentMoney(
                total
            );


        el(
            "paymentModalPaid"
        ).textContent =
            paymentMoney(
                paid
            );


        el(
            "paymentModalBalance"
        ).textContent =
            paymentMoney(
                balance
            );


        /* -----------------------------------------
           FORM
           ----------------------------------------- */

        el(
            "paymentDate"
        ).value =
            todayLocal();


        el(
            "paymentAmount"
        ).value =
            "";


        el(
            "paymentAmount"
        ).max =
            balance > 0
                ? String(
                    balance
                )
                : "";


        el(
            "paymentAmount"
        ).placeholder =
            balance > 0

                ? "Maximum " +
                paymentMoney(
                    balance
                )

                : "Enter payment amount";


        el(
            "paymentMode"
        ).value =
            "UPI";


        el(
            "paymentReference"
        ).value =
            "";


        el(
            "paymentNotes"
        ).value =
            "";


        /* -----------------------------------------
           WARNING
           ----------------------------------------- */

        const warning =
            el(
                "paymentModalWarning"
            );


        if (warning) {

            if (
                total <= 0
            ) {

                warning.hidden =
                    false;


                warning.textContent =
                    "Set the booking Final Fare / Revenue before recording payment.";

            }

            else if (
                balance <= 0
            ) {

                warning.hidden =
                    false;


                warning.textContent =
                    "This booking is already fully paid.";

            }

            else {

                warning.hidden =
                    true;


                warning.textContent =
                    "";

            }

        }


        /* -----------------------------------------
           OPEN
           ----------------------------------------- */

        const modal =
            el(
                "addPaymentModal"
            );


        if (!modal) {

            console.error(
                "[PAYMENT] Modal HTML not found."
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
                "paymentModalOpen"
            );


        /*
         * Load history independently.
         * A history error must not prevent
         * the payment form from working.
         */

        loadPaymentHistory();


        setTimeout(
            function () {

                const amountInput =
                    el(
                        "paymentAmount"
                    );


                if (
                    amountInput &&
                    total > 0 &&
                    balance > 0
                ) {

                    amountInput.focus();

                }

            },
            120
        );

    }



    /* =====================================================
       CLOSE
       ===================================================== */

    function closePaymentModal() {


        /*
 * If a receipt is open,
 * close it together with the Payment modal.
 */

        closePaymentReceipt();


        currentPaymentHistory =
            [];

        /*
         * Invalidate any history request
         * that is currently running.
         */

        paymentHistoryRequestToken++;


        const modal =
            el(
                "addPaymentModal"
            );


        if (modal) {

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
                "paymentModalOpen"
            );


        currentPaymentRow =
            null;

    }



    /* =====================================================
       HISTORY UI STATE
       ===================================================== */

    function resetHistoryUI() {

        currentPaymentHistory =
            [];

        const loading =
            el(
                "paymentHistoryLoading"
            );


        const error =
            el(
                "paymentHistoryError"
            );


        const empty =
            el(
                "paymentHistoryEmpty"
            );


        const list =
            el(
                "paymentHistoryList"
            );


        const count =
            el(
                "paymentHistoryCount"
            );


        if (loading) {

            loading.hidden =
                true;

        }


        if (error) {

            error.hidden =
                true;

            error.textContent =
                "";

        }


        if (empty) {

            empty.hidden =
                true;

        }


        if (list) {

            list.innerHTML =
                "";

        }


        if (count) {

            count.textContent =
                "0";

        }

    }



    /* =====================================================
       HISTORY LOADING
       ===================================================== */

    function setHistoryLoading(
        loading
    ) {

        const loadingBox =
            el(
                "paymentHistoryLoading"
            );


        const refresh =
            el(
                "paymentHistoryRefreshBtn"
            );


        if (loadingBox) {

            loadingBox.hidden =
                !loading;

        }


        if (refresh) {

            refresh.disabled =
                loading;


            refresh.classList.toggle(
                "loading",
                loading
            );

        }

    }



    /* =====================================================
       LOAD PAYMENT HISTORY
       ===================================================== */

    async function loadPaymentHistory() {

        const context =
            getCurrentPaymentContext();


        resetHistoryUI();


        if (
            !context ||
            !context.bookingId
        ) {

            const error =
                el(
                    "paymentHistoryError"
                );


            if (error) {

                error.hidden =
                    false;


                error.textContent =
                    "Booking ID is not available.";

            }

            return;

        }


        if (
            typeof getApiUrl !==
            "function"
        ) {

            const error =
                el(
                    "paymentHistoryError"
                );


            if (error) {

                error.hidden =
                    false;


                error.textContent =
                    "Dashboard API is unavailable.";

            }

            return;

        }


        const requestToken =
            ++paymentHistoryRequestToken;


        setHistoryLoading(
            true
        );


        try {

            const response =
                await fetch(
                    getApiUrl(),
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "text/plain;charset=utf-8"

                        },

                        body:
                            JSON.stringify({

                                action:
                                    "getBookingPaymentHistory",

                                env:
                                    getPaymentEnvironment(),

                                bookingId:
                                    context.bookingId,

                                sourceSheet:
                                    context.sheet,

                                limit:
                                    100

                            })

                    }
                );


            const text =
                await response.text();


            console.log(
                "[PAYMENT HISTORY] RAW:",
                text
            );


            let result;


            try {

                result =
                    JSON.parse(
                        text
                    );

            }

            catch (error) {

                throw new Error(
                    "Invalid payment history response."
                );

            }


            /*
             * Booking was changed/closed before
             * this request completed.
             */

            if (
                requestToken !==
                paymentHistoryRequestToken
            ) {

                return;

            }


            if (
                !result ||
                result.success !== true
            ) {

                throw new Error(
                    result?.error ||
                    "Unable to load payment history."
                );

            }


            renderPaymentHistory(
                Array.isArray(
                    result.transactions
                )
                    ? result.transactions
                    : []
            );

        }

        catch (error) {

            if (
                requestToken !==
                paymentHistoryRequestToken
            ) {

                return;

            }


            console.error(
                "[PAYMENT HISTORY] ERROR:",
                error
            );


            const errorBox =
                el(
                    "paymentHistoryError"
                );


            if (errorBox) {

                errorBox.hidden =
                    false;


                errorBox.textContent =
                    error.message ||
                    "Unable to load payment history.";

            }

        }

        finally {

            if (
                requestToken ===
                paymentHistoryRequestToken
            ) {

                setHistoryLoading(
                    false
                );

            }

        }

    }



    /* =====================================================
       RENDER PAYMENT HISTORY
       ===================================================== */

    /* =====================================================
   RENDER PAYMENT HISTORY
   Receipt-ready version
   ===================================================== */

    function renderPaymentHistory(
        transactions
    ) {

        /*
         * Keep a local copy.
         *
         * View Receipt reads from this array
         * instead of making another API request.
         */

        currentPaymentHistory =
            Array.isArray(
                transactions
            )
                ? transactions.slice()
                : [];


        const list =
            el(
                "paymentHistoryList"
            );


        const empty =
            el(
                "paymentHistoryEmpty"
            );


        const count =
            el(
                "paymentHistoryCount"
            );


        if (count) {

            count.textContent =
                String(
                    currentPaymentHistory.length
                );

        }


        if (!list) {

            return;

        }


        /* =================================================
           EMPTY HISTORY
           ================================================= */

        if (
            !currentPaymentHistory.length
        ) {

            list.innerHTML =
                "";


            if (empty) {

                empty.hidden =
                    false;

            }


            return;

        }


        if (empty) {

            empty.hidden =
                true;

        }


        /* =================================================
           TRANSACTIONS
           ================================================= */

        list.innerHTML =
            currentPaymentHistory
                .map(
                    function (
                        transaction,
                        index
                    ) {

                        const amount =
                            paymentMoney(
                                transaction.amount
                            );


                        const date =
                            formatPaymentDate(
                                transaction.paymentDate
                            );


                        const mode =
                            String(
                                transaction.paymentMode ||
                                "Payment"
                            ).trim();


                        const reference =
                            String(
                                transaction.reference ||
                                ""
                            ).trim();


                        const notes =
                            String(
                                transaction.notes ||
                                ""
                            ).trim();


                        const recordedAt =
                            String(
                                transaction.recordedAt ||
                                ""
                            ).trim();


                        const recordedBy =
                            String(
                                transaction.recordedBy ||
                                ""
                            ).trim();


                        const paymentId =
                            String(
                                transaction.paymentId ||
                                ""
                            ).trim();


                        return `

                        <article
                            class="paymentHistoryItem"
                            data-payment-index="${index}"
                        >


                            <div
                                class="paymentHistoryItemAccent"
                            ></div>


                            <div
                                class="paymentHistoryItemMain"
                            >


                                <!-- =====================
                                     TOP
                                     ===================== -->

                                <div
                                    class="paymentHistoryItemTop"
                                >


                                    <div
                                        class="paymentHistoryAmountWrap"
                                    >


                                        <div
                                            class="paymentHistoryModeIcon"
                                        >
                                            ${escapeHtml(
                            paymentModeIcon(
                                mode
                            )
                        )}
                                        </div>


                                        <div>

                                            <strong
                                                class="paymentHistoryAmount"
                                            >
                                                ${escapeHtml(
                            amount
                        )}
                                            </strong>


                                            <span
                                                class="paymentHistoryDate"
                                            >
                                                ${escapeHtml(
                            date
                        )}
                                            </span>

                                        </div>


                                    </div>



                                    <span
                                        class="paymentHistoryModeBadge"
                                    >
                                        ${escapeHtml(
                            mode
                        )}
                                    </span>


                                </div>



                                <!-- =====================
                                     REFERENCE
                                     ===================== -->

                                ${reference

                                ? `

                                        <div
                                            class="paymentHistoryReference"
                                        >

                                            <span>
                                                Reference
                                            </span>

                                            <strong>
                                                ${escapeHtml(
                                    reference
                                )}
                                            </strong>

                                        </div>

                                      `

                                : ""
                            }



                                <!-- =====================
                                     NOTES
                                     ===================== -->

                                ${notes

                                ? `

                                        <div
                                            class="paymentHistoryNotes"
                                        >
                                            ${escapeHtml(
                                    notes
                                )}
                                        </div>

                                      `

                                : ""
                            }



                                <!-- =====================
                                     META
                                     ===================== -->

                                <div
                                    class="paymentHistoryMeta"
                                >


                                    ${paymentId

                                ? `

                                            <span>

                                                <b>
                                                    ID
                                                </b>

                                                ${escapeHtml(
                                    paymentId
                                )}

                                            </span>

                                          `

                                : ""
                            }


                                    ${recordedBy

                                ? `

                                            <span>

                                                <b>
                                                    By
                                                </b>

                                                ${escapeHtml(
                                    recordedBy
                                )}

                                            </span>

                                          `

                                : ""
                            }


                                    ${recordedAt

                                ? `

                                            <span>

                                                <b>
                                                    Recorded
                                                </b>

                                                ${escapeHtml(
                                    recordedAt
                                )}

                                            </span>

                                          `

                                : ""
                            }


                                </div>



                                <!-- =====================
                                     RECEIPT ACTION
                                     ===================== -->

                                <div
                                    class="paymentHistoryActions"
                                >

                                    <button
                                        type="button"
                                        class="paymentHistoryReceiptBtn"
                                        onclick="
                                            window.RanSanPayment
                                                ?.receipt(
                                                    ${index}
                                                )
                                        "
                                    >

                                        <span>
                                            🧾
                                        </span>

                                        View Receipt

                                    </button>

                                </div>


                            </div>

                        </article>

                    `;

                    }
                )
                .join(
                    ""
                );

    }

    /* =========================================================
       RANSAN PAYMENT RECEIPT V1
       ========================================================= */


    /* =====================================================
       SET TEXT
       ===================================================== */

    function setReceiptText(
        id,
        value,
        fallback
    ) {

        const element =
            el(
                id
            );


        if (!element) {

            return;

        }


        const text =
            String(
                value ??
                ""
            ).trim();


        element.textContent =
            text ||
            fallback ||
            "-";

    }



    /* =====================================================
       OPEN RECEIPT
       ===================================================== */

    function openPaymentReceipt(
        index
    ) {

        const transaction =
            currentPaymentHistory[
            Number(
                index
            )
            ];


        if (!transaction) {

            console.error(
                "[PAYMENT RECEIPT] Transaction not found:",
                index
            );


            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Payment transaction is not available.",
                    "error"
                );

            }


            return;

        }


        currentReceiptTransaction =
            transaction;


        /* =================================================
           AMOUNT
           ================================================= */

        setReceiptText(
            "paymentReceiptAmount",
            paymentMoney(
                transaction.amount
            ),
            "₹0"
        );


        /* =================================================
           PAYMENT ID
           ================================================= */

        setReceiptText(
            "paymentReceiptPaymentId",
            transaction.paymentId
        );


        /* =================================================
           BOOKING ID
           ================================================= */

        setReceiptText(
            "paymentReceiptBookingId",
            transaction.bookingId
        );


        /* =================================================
           CUSTOMER
           ================================================= */

        setReceiptText(
            "paymentReceiptCustomer",
            transaction.customer
        );


        /* =================================================
           SERVICE
           ================================================= */

        setReceiptText(
            "paymentReceiptService",
            transaction.service
        );


        /* =================================================
           PAYMENT DATE
           ================================================= */

        setReceiptText(
            "paymentReceiptDate",
            formatPaymentDate(
                transaction.paymentDate
            )
        );


        /* =================================================
           PAYMENT MODE
           ================================================= */

        setReceiptText(
            "paymentReceiptMode",
            transaction.paymentMode
        );


        /* =================================================
           REFERENCE
           ================================================= */

        const reference =
            String(
                transaction.reference ||
                ""
            ).trim();


        const referenceWrap =
            el(
                "paymentReceiptReferenceWrap"
            );


        if (referenceWrap) {

            referenceWrap.hidden =
                !reference;

        }


        setReceiptText(
            "paymentReceiptReference",
            reference
        );


        /* =================================================
           NOTES
           ================================================= */

        const notes =
            String(
                transaction.notes ||
                ""
            ).trim();


        const notesSection =
            el(
                "paymentReceiptNotesSection"
            );


        if (notesSection) {

            notesSection.hidden =
                !notes;

        }


        setReceiptText(
            "paymentReceiptNotes",
            notes
        );


        /* =================================================
           RECORDED BY
           ================================================= */

        setReceiptText(
            "paymentReceiptRecordedBy",
            transaction.recordedBy,
            "RanSan Travels"
        );


        /* =================================================
           RECORDED AT
           ================================================= */

        setReceiptText(
            "paymentReceiptRecordedAt",
            transaction.recordedAt
        );


        /* =================================================
           ENVIRONMENT
           ================================================= */

        const environment =
            String(
                transaction.environment ||
                getPaymentEnvironment()
            )
                .trim()
                .toUpperCase();


        const environmentElement =
            el(
                "paymentReceiptEnvironment"
            );


        if (environmentElement) {

            environmentElement.textContent =
                environment;


            environmentElement.classList.toggle(
                "test",
                environment ===
                "TEST"
            );


            environmentElement.classList.toggle(
                "live",
                environment !==
                "TEST"
            );

        }


        /* =================================================
           OPEN
           ================================================= */

        const modal =
            el(
                "paymentReceiptModal"
            );


        if (!modal) {

            console.error(
                "[PAYMENT RECEIPT] Receipt modal not found."
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

    }



    /* =====================================================
       CLOSE RECEIPT
       ===================================================== */

    function closePaymentReceipt() {

        const modal =
            el(
                "paymentReceiptModal"
            );


        if (modal) {

            modal.classList.remove(
                "active"
            );


            modal.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        currentReceiptTransaction =
            null;

    }



    /* =====================================================
       RECEIPT PRINT VALUE
       ===================================================== */

    function receiptPrintValue(
        value,
        fallback
    ) {

        const text =
            String(
                value ??
                ""
            ).trim();


        return escapeHtml(
            text ||
            fallback ||
            "-"
        );

    }



    /* =====================================================
       PRINT RECEIPT
       ===================================================== */

    function printPaymentReceipt() {

        const transaction =
            currentReceiptTransaction;


        if (!transaction) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "No receipt selected.",
                    "error"
                );

            }


            return;

        }


        const amount =
            paymentMoney(
                transaction.amount
            );


        const paymentDate =
            formatPaymentDate(
                transaction.paymentDate
            );


        const paymentId =
            String(
                transaction.paymentId ||
                "-"
            ).trim();


        const bookingId =
            String(
                transaction.bookingId ||
                "-"
            ).trim();


        const customer =
            String(
                transaction.customer ||
                "-"
            ).trim();


        const service =
            String(
                transaction.service ||
                "-"
            ).trim();


        const mode =
            String(
                transaction.paymentMode ||
                "-"
            ).trim();


        const reference =
            String(
                transaction.reference ||
                ""
            ).trim();


        const notes =
            String(
                transaction.notes ||
                ""
            ).trim();


        const recordedAt =
            String(
                transaction.recordedAt ||
                "-"
            ).trim();


        const recordedBy =
            String(
                transaction.recordedBy ||
                "RanSan Travels"
            ).trim();


        const environment =
            String(
                transaction.environment ||
                getPaymentEnvironment()
            )
                .trim()
                .toUpperCase();


        /*
         * window.open occurs directly from the
         * Print button click, which avoids normal
         * browser popup-blocker problems.
         */

        const printWindow =
            window.open(
                "",
                "_blank",
                "width=900,height=900"
            );


        if (!printWindow) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Allow pop-ups to print the receipt.",
                    "warning"
                );

            }


            return;

        }


        const referenceHtml =
            reference

                ? `

                <div class="detail">

                    <span>
                        Reference / Transaction ID
                    </span>

                    <strong>
                        ${receiptPrintValue(
                    reference
                )}
                    </strong>

                </div>

              `

                : "";


        const notesHtml =
            notes

                ? `

                <section class="notes">

                    <div class="section-title">
                        Notes
                    </div>

                    <p>
                        ${receiptPrintValue(
                    notes
                )}
                    </p>

                </section>

              `

                : "";


        const testWatermark =
            environment ===
                "TEST"

                ? `
                <div class="test-watermark">
                    TEST
                </div>
              `

                : "";


        const documentHtml = `

<!DOCTYPE html>

<html>

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width,initial-scale=1"
    >

    <title>
        RanSan Payment Receipt -
        ${receiptPrintValue(
            paymentId
        )}
    </title>


    <style>

        * {
            box-sizing: border-box;
        }


        html,
        body {
            margin: 0;
            padding: 0;

            background: #eef1f4;

            color: #17202a;

            font-family:
                Arial,
                Helvetica,
                sans-serif;
        }


        body {
            padding: 30px;
        }


        .receipt {
            position: relative;

            width: 100%;
            max-width: 780px;

            margin: 0 auto;

            overflow: hidden;

            border: 1px solid #dfe3e8;
            border-radius: 18px;

            background: #ffffff;

            box-shadow:
                0 20px 60px
                rgba(15, 23, 42, .10);
        }


        .top-line {
            height: 5px;

            background:
                linear-gradient(
                    90deg,
                    #6d5dfc,
                    #3388ef,
                    #17bfa3
                );
        }


        .header {
            display: flex;

            align-items: center;
            justify-content: space-between;

            gap: 20px;

            padding: 28px 32px 22px;

            border-bottom:
                1px solid #edf0f3;
        }


        .brand {
            display: flex;

            align-items: center;

            gap: 12px;
        }


        .brand-icon {
            width: 46px;
            height: 46px;

            display: grid;

            place-items: center;

            border-radius: 13px;

            background:
                linear-gradient(
                    145deg,
                    #eef2ff,
                    #ecfeff
                );

            color: #5145cd;

            font-size: 21px;
        }


        .brand strong {
            display: block;

            color: #111827;

            font-size: 18px;
        }


        .brand small {
            display: block;

            margin-top: 3px;

            color: #7b8490;

            font-size: 10px;

            letter-spacing: .06em;
            text-transform: uppercase;
        }


        .acknowledgement {
            text-align: right;
        }


        .acknowledgement span {
            display: block;

            color: #7f8895;

            font-size: 9px;
            font-weight: 700;

            letter-spacing: .10em;
        }


        .acknowledgement strong {
            display: block;

            margin-top: 4px;

            color: #1f2937;

            font-size: 16px;
        }


        .hero {
            display: flex;

            align-items: center;
            justify-content: space-between;

            gap: 20px;

            margin: 24px 32px;

            padding: 22px;

            border: 1px solid #d9f2e8;
            border-radius: 14px;

            background:
                linear-gradient(
                    145deg,
                    #f4fcf8,
                    #f8fafc
                );
        }


        .hero span {
            display: block;

            color: #6b7280;

            font-size: 10px;
            font-weight: 700;

            letter-spacing: .08em;
            text-transform: uppercase;
        }


        .hero strong {
            display: block;

            margin-top: 6px;

            color: #047857;

            font-size: 30px;
            font-weight: 800;
        }


        .received {
            padding:
                8px
                12px;

            border: 1px solid #bde9d8;
            border-radius: 999px;

            color: #047857;

            background: #ecfdf5;

            font-size: 11px;
            font-weight: 700;
        }


        .section {
            padding:
                0
                32px
                25px;
        }


        .section-title {
            margin-bottom: 12px;

            color: #5c6572;

            font-size: 10px;
            font-weight: 800;

            letter-spacing: .10em;
            text-transform: uppercase;
        }


        .details {
            display: grid;

            grid-template-columns:
                repeat(
                    2,
                    minmax(0, 1fr)
                );

            gap: 10px;
        }


        .detail {
            padding: 13px 14px;

            border: 1px solid #e9edf1;
            border-radius: 10px;

            background: #fafbfc;
        }


        .detail span {
            display: block;

            color: #8a929e;

            font-size: 9px;
            font-weight: 700;

            text-transform: uppercase;
        }


        .detail strong {
            display: block;

            margin-top: 5px;

            color: #222b36;

            font-size: 12px;

            word-break: break-word;
        }


        .notes {
            margin:
                0
                32px
                25px;

            padding: 14px 16px;

            border-left:
                3px solid
                #6d5dfc;

            border-radius:
                0
                10px
                10px
                0;

            background: #faf9ff;
        }


        .notes p {
            margin: 0;

            color: #505968;

            font-size: 11px;
            line-height: 1.6;
        }


        .record {
            display: grid;

            grid-template-columns:
                repeat(
                    2,
                    minmax(0, 1fr)
                );

            gap: 10px;

            margin:
                0
                32px
                25px;
        }


        .record > div {
            padding: 12px;

            border-radius: 10px;

            background: #f8fafc;
        }


        .record span {
            display: block;

            color: #89929f;

            font-size: 9px;
            font-weight: 700;
        }


        .record strong {
            display: block;

            margin-top: 5px;

            color: #303946;

            font-size: 11px;
        }


        .notice {
            margin:
                0
                32px
                24px;

            padding: 11px 13px;

            border-radius: 9px;

            background: #f5f7f9;

            color: #707986;

            font-size: 9px;

            line-height: 1.55;
        }


        .footer {
            display: flex;

            justify-content: space-between;

            gap: 20px;

            padding: 18px 32px;

            border-top:
                1px solid #edf0f3;

            color: #8a929d;

            font-size: 9px;
        }


        .test-watermark {
            position: absolute;

            top: 47%;
            left: 50%;

            z-index: 0;

            transform:
                translate(
                    -50%,
                    -50%
                )
                rotate(
                    -27deg
                );

            color:
                rgba(
                    220,
                    38,
                    38,
                    .055
                );

            font-size: 110px;
            font-weight: 900;

            pointer-events: none;
        }


        .receipt > *:not(
            .test-watermark
        ) {
            position: relative;
            z-index: 1;
        }


        @media print {

            @page {
                size: A4;
                margin: 12mm;
            }


            html,
            body {
                background: #fff;
            }


            body {
                padding: 0;
            }


            .receipt {
                max-width: none;

                border: 1px solid #ddd;

                box-shadow: none;
            }

        }


    </style>

</head>


<body>


    <main class="receipt">

        ${testWatermark}


        <div class="top-line"></div>


        <header class="header">

            <div class="brand">

                <div class="brand-icon">
                    ✈
                </div>

                <div>

                    <strong>
                        RanSan Travels
                    </strong>

                    <small>
                        Travel • Experiences • Memories
                    </small>

                </div>

            </div>


            <div class="acknowledgement">

                <span>
                    PAYMENT ACKNOWLEDGEMENT
                </span>

                <strong>
                    Receipt
                </strong>

            </div>

        </header>



        <section class="hero">

            <div>

                <span>
                    Amount Received
                </span>

                <strong>
                    ${receiptPrintValue(
            amount
        )}
                </strong>

            </div>


            <div class="received">
                ✓ Payment Received
            </div>

        </section>



        <section class="section">

            <div class="section-title">
                Receipt Details
            </div>


            <div class="details">


                <div class="detail">

                    <span>
                        Payment ID
                    </span>

                    <strong>
                        ${receiptPrintValue(
            paymentId
        )}
                    </strong>

                </div>


                <div class="detail">

                    <span>
                        Booking ID
                    </span>

                    <strong>
                        ${receiptPrintValue(
            bookingId
        )}
                    </strong>

                </div>


                <div class="detail">

                    <span>
                        Customer
                    </span>

                    <strong>
                        ${receiptPrintValue(
            customer
        )}
                    </strong>

                </div>


                <div class="detail">

                    <span>
                        Service
                    </span>

                    <strong>
                        ${receiptPrintValue(
            service
        )}
                    </strong>

                </div>


                <div class="detail">

                    <span>
                        Payment Date
                    </span>

                    <strong>
                        ${receiptPrintValue(
            paymentDate
        )}
                    </strong>

                </div>


                <div class="detail">

                    <span>
                        Payment Mode
                    </span>

                    <strong>
                        ${receiptPrintValue(
            mode
        )}
                    </strong>

                </div>


                ${referenceHtml}


            </div>

        </section>



        ${notesHtml}



        <section class="record">

            <div>

                <span>
                    Recorded By
                </span>

                <strong>
                    ${receiptPrintValue(
            recordedBy
        )}
                </strong>

            </div>


            <div>

                <span>
                    Recorded At
                </span>

                <strong>
                    ${receiptPrintValue(
            recordedAt
        )}
                </strong>

            </div>

        </section>



        <div class="notice">

            This document is a computer-generated
            acknowledgement of payment received against
            the booking shown above. It is not a tax invoice.

        </div>



        <footer class="footer">

            <span>
                RanSan Travels
            </span>

            <span>
                ${receiptPrintValue(
            paymentId
        )}
            </span>

        </footer>


    </main>


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

    `;


        printWindow
            .document
            .open();


        printWindow
            .document
            .write(
                documentHtml
            );


        printWindow
            .document
            .close();

    }

    /* =====================================================
       MANUAL HISTORY REFRESH
       ===================================================== */

    function refreshPaymentHistory() {

        if (
            !currentPaymentRow
        ) {

            return;

        }


        loadPaymentHistory();

    }



    /* =====================================================
       SAVE BUTTON LOADING
       ===================================================== */

    function setPaymentSaving(
        saving
    ) {

        const button =
            el(
                "paymentSaveBtn"
            );


        if (!button) {

            return;

        }


        button.disabled =
            saving;


        button.innerHTML =
            saving

                ? `
                    <span
                        class="paymentSaveSpinner"
                    ></span>
                    Saving Payment...
                  `

                : `
                    <span>
                        ✓
                    </span>
                    Record Payment
                  `;

    }



    /* =====================================================
       SAVE PAYMENT
       ===================================================== */

    async function savePayment() {

        if (
            !currentPaymentRow
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "No booking selected.",
                    "error"
                );

            }

            return;

        }


        const row =
            currentPaymentRow;


        const total =
            typeof getDashboardPaymentTotal ===
                "function"

                ? getDashboardPaymentTotal(
                    row
                )

                : 0;


        const oldPaid =
            typeof getDashboardPaymentPaid ===
                "function"

                ? getDashboardPaymentPaid(
                    row
                )

                : 0;


        const balance =
            typeof getDashboardPaymentBalance ===
                "function"

                ? getDashboardPaymentBalance(
                    row,
                    total,
                    oldPaid
                )

                : Math.max(
                    0,
                    total -
                    oldPaid
                );


        const amount =
            paymentNumber(
                el(
                    "paymentAmount"
                )?.value
            );


        const paymentDate =
            String(
                el(
                    "paymentDate"
                )?.value ||
                ""
            ).trim();


        const paymentMode =
            String(
                el(
                    "paymentMode"
                )?.value ||
                ""
            ).trim();


        const reference =
            String(
                el(
                    "paymentReference"
                )?.value ||
                ""
            ).trim();


        const notes =
            String(
                el(
                    "paymentNotes"
                )?.value ||
                ""
            ).trim();


        /* -----------------------------------------
           VALIDATE TOTAL
           ----------------------------------------- */

        if (
            total <= 0
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Please set the Final Fare / Revenue before recording payment.",
                    "warning"
                );

            }

            return;

        }


        /* -----------------------------------------
           FULLY PAID
           ----------------------------------------- */

        if (
            balance <= 0
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "This booking is already fully paid.",
                    "warning"
                );

            }

            return;

        }


        /* -----------------------------------------
           AMOUNT
           ----------------------------------------- */

        if (
            !Number.isFinite(
                amount
            )
            ||
            amount <= 0
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Enter a valid payment amount.",
                    "error"
                );

            }

            return;

        }


        if (
            amount >
            balance
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Payment cannot exceed the outstanding balance of " +
                    paymentMoney(
                        balance
                    ) +
                    ".",
                    "error"
                );

            }

            return;

        }


        /* -----------------------------------------
           DATE
           ----------------------------------------- */

        if (
            !paymentDate
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Select the payment date.",
                    "error"
                );

            }

            return;

        }


        if (
            !/^\d{4}-\d{2}-\d{2}$/
                .test(
                    paymentDate
                )
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Invalid payment date.",
                    "error"
                );

            }

            return;

        }


        /* -----------------------------------------
           MODE
           ----------------------------------------- */

        if (
            !paymentMode
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Select a payment mode.",
                    "error"
                );

            }

            return;

        }


        const context =
            getCurrentPaymentContext();


        if (
            !context ||
            !context.sheet ||
            !Number.isInteger(
                context.row
            )
        ) {

            console.error(
                "[PAYMENT] Missing booking source context:",
                row
            );


            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Booking source information is missing.",
                    "error"
                );

            }

            return;

        }


        const recordedBy =
            sessionStorage.getItem(
                "portalUsername"
            ) ||
            sessionStorage.getItem(
                "username"
            ) ||
            "";


        setPaymentSaving(
            true
        );


        if (
            typeof showLoader ===
            "function"
        ) {

            showLoader();

        }


        try {

            if (
                typeof getApiUrl !==
                "function"
            ) {

                throw new Error(
                    "Dashboard API is not available."
                );

            }


            const response =
                await fetch(
                    getApiUrl(),
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "text/plain;charset=utf-8"

                        },

                        body:
                            JSON.stringify({

                                action:
                                    "recordBookingPayment",

                                env:
                                    getPaymentEnvironment(),

                                sheet:
                                    context.sheet,

                                row:
                                    context.row,

                                bookingId:
                                    context.bookingId,

                                customer:
                                    context.customer,

                                service:
                                    context.service,

                                totalAmount:
                                    total,

                                paymentAmount:
                                    amount,

                                paymentDate:
                                    paymentDate,

                                paymentMode:
                                    paymentMode,

                                reference:
                                    reference,

                                notes:
                                    notes,

                                recordedBy:
                                    recordedBy

                            })

                    }
                );


            const text =
                await response.text();


            console.log(
                "[PAYMENT] RAW RESPONSE:",
                text
            );


            let result;


            try {

                result =
                    JSON.parse(
                        text
                    );

            }

            catch (error) {

                throw new Error(
                    "Invalid server response."
                );

            }


            if (
                !result ||
                result.success !== true
            ) {

                throw new Error(
                    result?.error ||
                    "Payment was not saved."
                );

            }


            /*
             * Preserve your V1 behaviour:
             * close after successful payment.
             */

            closePaymentModal();


            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Payment " +
                    paymentMoney(
                        amount
                    ) +
                    " recorded successfully.",
                    "success"
                );

            }


            if (
                typeof loadDashboardData ===
                "function"
            ) {

                await loadDashboardData();

            }


            if (
                typeof reapplyGlobalSearch ===
                "function"
            ) {

                reapplyGlobalSearch();

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

        catch (error) {

            console.error(
                "[PAYMENT] SAVE ERROR:",
                error
            );


            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    error.message ||
                    "Unable to record payment.",
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


            setPaymentSaving(
                false
            );

        }

    }



    /* =====================================================
       BACKDROP
       ===================================================== */

    /* =====================================================
   ESCAPE
   Receipt has priority over Payment Modal.
   ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            /*
             * Receipt is displayed above
             * Payment modal.
             *
             * Therefore Escape closes receipt first.
             */

            const receiptModal =
                el(
                    "paymentReceiptModal"
                );


            if (
                receiptModal &&
                receiptModal.classList.contains(
                    "active"
                )
            ) {

                closePaymentReceipt();

                return;

            }


            /*
             * Otherwise close the main
             * payment modal.
             */

            const paymentModal =
                el(
                    "addPaymentModal"
                );


            if (
                paymentModal &&
                paymentModal.classList.contains(
                    "active"
                )
            ) {

                closePaymentModal();

            }

        }
    );

    /* =====================================================
       RECEIPT BACKDROP CLOSE
       ===================================================== */

    document.addEventListener(
        "click",
        function (event) {

            if (
                event.target &&
                event.target.id ===
                "paymentReceiptModal"
            ) {

                closePaymentReceipt();

            }

        }
    );

    /* =====================================================
       ESCAPE
       ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                const modal =
                    el(
                        "addPaymentModal"
                    );


                if (
                    modal &&
                    modal.classList.contains(
                        "active"
                    )
                ) {

                    closePaymentModal();

                }

            }

        }
    );



    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.RanSanPayment = {

        /*
         * Main Payment Modal
         */

        open:
            openPaymentModal,


        close:
            closePaymentModal,


        save:
            savePayment,


        /*
         * History
         */

        refreshHistory:
            refreshPaymentHistory,


        /*
         * Receipt
         */

        receipt:
            openPaymentReceipt,


        closeReceipt:
            closePaymentReceipt,


        printReceipt:
            printPaymentReceipt

    };


})();