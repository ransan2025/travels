/* =========================================================
   RANSAN TRAVELS
   BOOKING / PROFORMA INVOICE V1
   ---------------------------------------------------------
   Read-only invoice view + print.

   IMPORTANT:
   - Does NOT modify booking data.
   - Does NOT modify payment data.
   - Does NOT call Apps Script.
   - Does NOT create a statutory GST invoice.
   ========================================================= */

(function () {

    "use strict";


    let currentInvoiceBooking =
        null;



    /* =====================================================
       ELEMENT
       ===================================================== */

    function invoiceEl(id) {

        return document.getElementById(
            id
        );

    }



    /* =====================================================
       FIRST NON-EMPTY VALUE
       ===================================================== */

    function invoiceValue(
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
                    row[key];


                if (
                    value !== null &&
                    value !== undefined &&
                    String(
                        value
                    ).trim() !== ""
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

    function invoiceNumber(value) {

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

    function invoiceMoney(value) {

        return (
            "₹" +
            invoiceNumber(
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
       HTML ESCAPE
       ===================================================== */

    function invoiceEscape(value) {

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
       TODAY
       ===================================================== */

    function invoiceToday() {

        return new Date()
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
       FORMAT DATE
       ===================================================== */

    function invoiceDate(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "-";

        }


        const text =
            String(
                value
            ).trim();


        /*
         * YYYY-MM-DD
         */

        const iso =
            text.match(
                /^(\d{4})-(\d{2})-(\d{2})/
            );


        if (iso) {

            const date =
                new Date(
                    Number(
                        iso[1]
                    ),
                    Number(
                        iso[2]
                    ) - 1,
                    Number(
                        iso[3]
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
       ENVIRONMENT
       ===================================================== */

    function invoiceEnvironment() {

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

                ? "TEST"

                : "LIVE"
        );

    }



    /* =====================================================
       CUSTOMER
       ===================================================== */

    function invoiceCustomer(
        row
    ) {

        return String(
            invoiceValue(
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

    function invoicePhone(
        row
    ) {

        return String(
            invoiceValue(
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
       EMAIL
       ===================================================== */

    function invoiceEmail(
        row
    ) {

        return String(
            invoiceValue(
                row,
                [
                    "Email",
                    "Email ID",
                    "Email Address",
                    "Customer Email"
                ],
                ""
            )
        ).trim();

    }



    /* =====================================================
       BOOKING ID
       ===================================================== */

    function invoiceBookingId(
        row
    ) {

        return String(
            invoiceValue(
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

    function invoiceService(
        row
    ) {

        let service =
            String(
                invoiceValue(
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


        const lower =
            service
                .toLowerCase();


        if (
            lower === "air"
        ) {

            return "Flight";

        }


        if (
            lower.includes(
                "car"
            )
        ) {

            return "Car";

        }


        if (
            lower.includes(
                "travel_lead"
            )
            ||
            lower.includes(
                "package"
            )
        ) {

            return "Package";

        }


        if (
            lower.includes(
                "premium"
            )
        ) {

            return "Premium Quote";

        }


        return service || "-";

    }



    /* =====================================================
       ROUTE
       ===================================================== */

    function invoiceRoute(
        row
    ) {

        const direct =
            invoiceValue(
                row,
                [
                    "Route",
                    "route"
                ],
                ""
            );


        if (
            String(
                direct
            ).trim()
        ) {

            return String(
                direct
            ).trim();

        }


        const from =
            String(
                invoiceValue(
                    row,
                    [
                        "From",
                        "Pickup",
                        "Pickup Location",
                        "Source",
                        "Origin"
                    ],
                    ""
                )
            ).trim();


        const to =
            String(
                invoiceValue(
                    row,
                    [
                        "To",
                        "Drop",
                        "Drop Location",
                        "Destination"
                    ],
                    ""
                )
            ).trim();


        if (
            from &&
            to
        ) {

            return (
                from +
                " → " +
                to
            );

        }


        return (
            from ||
            to ||
            "-"
        );

    }



    /* =====================================================
       TRAVEL DATE
       ===================================================== */

    function invoiceTravelDate(
        row
    ) {

        const value =
            invoiceValue(
                row,
                [
                    "Travel Date",
                    "Journey Date",
                    "Departure Date",
                    "Date",
                    "Travel Month"
                ],
                ""
            );


        return invoiceDate(
            value
        );

    }



    /* =====================================================
       STATUS
       ===================================================== */

    function invoiceBookingStatus(
        row
    ) {

        return String(
            invoiceValue(
                row,
                [
                    "Status",
                    "STATUS",
                    "status"
                ],
                "New"
            )
        ).trim();

    }



    /* =====================================================
       TOTAL
       -----------------------------------------------------
       Reuses Payment Visibility helper first.
       ===================================================== */

    function invoiceTotal(
        row
    ) {

        if (
            typeof getDashboardPaymentTotal ===
            "function"
        ) {

            const value =
                Number(
                    getDashboardPaymentTotal(
                        row
                    )
                );


            if (
                Number.isFinite(
                    value
                )
            ) {

                return Math.max(
                    0,
                    value
                );

            }

        }


        return Math.max(
            0,
            invoiceNumber(
                invoiceValue(
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
                        "Final Fare",
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

    function invoicePaid(
        row
    ) {

        if (
            typeof getDashboardPaymentPaid ===
            "function"
        ) {

            const value =
                Number(
                    getDashboardPaymentPaid(
                        row
                    )
                );


            if (
                Number.isFinite(
                    value
                )
            ) {

                return Math.max(
                    0,
                    value
                );

            }

        }


        return Math.max(
            0,
            invoiceNumber(
                invoiceValue(
                    row,
                    [
                        "Paid Amount",
                        "Amount Paid",
                        "Received Amount",
                        "Payment Received",
                        "Advance",
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

    function invoiceBalance(
        row,
        total,
        paid
    ) {

        if (
            typeof getDashboardPaymentBalance ===
            "function"
        ) {

            const value =
                Number(
                    getDashboardPaymentBalance(
                        row,
                        total,
                        paid
                    )
                );


            if (
                Number.isFinite(
                    value
                )
            ) {

                return Math.max(
                    0,
                    value
                );

            }

        }


        const direct =
            invoiceValue(
                row,
                [
                    "Balance Amount",
                    "Balance",
                    "Pending Amount",
                    "Amount Due",
                    "Due Amount",
                    "Outstanding Amount"
                ],
                ""
            );


        if (
            String(
                direct
            ).trim() !==
            ""
        ) {

            return Math.max(
                0,
                invoiceNumber(
                    direct
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
       PAYMENT STATUS
       ===================================================== */

    function invoicePaymentStatus(
        row,
        total,
        paid,
        balance
    ) {

        const direct =
            String(
                invoiceValue(
                    row,
                    [
                        "Payment Status",
                        "paymentStatus"
                    ],
                    ""
                )
            ).trim();


        if (direct) {

            return direct;

        }


        if (
            total <= 0
        ) {

            return "Not Set";

        }


        if (
            balance <= 0 &&
            paid > 0
        ) {

            return "Paid";

        }


        if (
            paid > 0 &&
            balance > 0
        ) {

            return "Partial";

        }


        return "Pending";

    }



    /* =====================================================
       NOTES
       ===================================================== */

    function invoiceNotes(
        row
    ) {

        return String(
            invoiceValue(
                row,
                [
                    "Notes",
                    "Booking Notes",
                    "Remarks",
                    "Special Request"
                ],
                ""
            )
        ).trim();

    }



    /* =====================================================
       DOCUMENT NUMBER
       -----------------------------------------------------
       This is intentionally PROFORMA only.
       It is NOT a statutory invoice serial.
       ===================================================== */

    function invoiceDocumentNumber(
        row
    ) {

        const bookingId =
            invoiceBookingId(
                row
            );


        if (
            bookingId
        ) {

            return (
                "PRO-" +
                bookingId
            );

        }


        return "PROFORMA";

    }



    /* =====================================================
       SET TEXT
       ===================================================== */

    function setInvoiceText(
        id,
        value,
        fallback
    ) {

        const element =
            invoiceEl(
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
       OPEN INVOICE
       ===================================================== */

    function openInvoice(
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


        currentInvoiceBooking =
            row;


        const customer =
            invoiceCustomer(
                row
            );


        const phone =
            invoicePhone(
                row
            );


        const email =
            invoiceEmail(
                row
            );


        const bookingId =
            invoiceBookingId(
                row
            );


        const service =
            invoiceService(
                row
            );


        const route =
            invoiceRoute(
                row
            );


        const travelDate =
            invoiceTravelDate(
                row
            );


        const bookingStatus =
            invoiceBookingStatus(
                row
            );


        const total =
            invoiceTotal(
                row
            );


        const paid =
            invoicePaid(
                row
            );


        const balance =
            invoiceBalance(
                row,
                total,
                paid
            );


        const paymentStatus =
            invoicePaymentStatus(
                row,
                total,
                paid,
                balance
            );


        const notes =
            invoiceNotes(
                row
            );


        /* -----------------------------------------
           DOCUMENT
           ----------------------------------------- */

        setInvoiceText(
            "invoiceDocumentNumber",
            invoiceDocumentNumber(
                row
            )
        );


        setInvoiceText(
            "invoiceDate",
            invoiceToday()
        );


        /* -----------------------------------------
           CUSTOMER
           ----------------------------------------- */

        setInvoiceText(
            "invoiceCustomerName",
            customer
        );


        setInvoiceText(
            "invoiceCustomerPhone",
            phone,
            "-"
        );


        setInvoiceText(
            "invoiceCustomerEmail",
            email,
            "-"
        );


        /* -----------------------------------------
           BOOKING
           ----------------------------------------- */

        setInvoiceText(
            "invoiceBookingId",
            bookingId,
            "-"
        );


        setInvoiceText(
            "invoiceService",
            service
        );


        setInvoiceText(
            "invoiceRoute",
            route
        );


        setInvoiceText(
            "invoiceTravelDate",
            travelDate
        );


        setInvoiceText(
            "invoiceBookingStatus",
            bookingStatus
        );


        /* -----------------------------------------
           FINANCE
           ----------------------------------------- */

        setInvoiceText(
            "invoiceTotalAmount",
            invoiceMoney(
                total
            )
        );


        setInvoiceText(
            "invoicePaidAmount",
            invoiceMoney(
                paid
            )
        );


        setInvoiceText(
            "invoiceBalanceAmount",
            invoiceMoney(
                balance
            )
        );


        setInvoiceText(
            "invoicePaymentStatus",
            paymentStatus
        );


        /* -----------------------------------------
           STATUS STYLE
           ----------------------------------------- */

        const paymentStatusEl =
            invoiceEl(
                "invoicePaymentStatus"
            );


        if (
            paymentStatusEl
        ) {

            paymentStatusEl.className =
                "bookingInvoicePaymentStatus";


            const normalized =
                paymentStatus
                    .toLowerCase();


            if (
                normalized.includes(
                    "paid"
                ) &&
                !normalized.includes(
                    "partial"
                )
            ) {

                paymentStatusEl
                    .classList.add(
                        "paid"
                    );

            }

            else if (
                normalized.includes(
                    "partial"
                )
            ) {

                paymentStatusEl
                    .classList.add(
                        "partial"
                    );

            }

            else {

                paymentStatusEl
                    .classList.add(
                        "pending"
                    );

            }

        }


        /* -----------------------------------------
           NOTES
           ----------------------------------------- */

        const notesSection =
            invoiceEl(
                "bookingInvoiceNotesSection"
            );


        if (
            notesSection
        ) {

            notesSection.hidden =
                !notes;

        }


        setInvoiceText(
            "invoiceNotes",
            notes
        );


        /* -----------------------------------------
           ENVIRONMENT
           ----------------------------------------- */

        const env =
            invoiceEnvironment();


        const envElement =
            invoiceEl(
                "bookingInvoiceEnvironment"
            );


        if (
            envElement
        ) {

            envElement.textContent =
                env;


            envElement.classList.toggle(
                "test",
                env ===
                "TEST"
            );


            envElement.classList.toggle(
                "live",
                env !==
                "TEST"
            );

        }


        /* -----------------------------------------
           WARNING
           ----------------------------------------- */

        const warning =
            invoiceEl(
                "bookingInvoiceWarning"
            );


        if (
            warning
        ) {

            if (
                total <= 0
            ) {

                warning.hidden =
                    false;


                warning.textContent =
                    "Final Fare / Revenue has not yet been set for this booking. The document can be previewed, but the amount is currently ₹0.";

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
            invoiceEl(
                "bookingInvoiceModal"
            );


        if (!modal) {

            console.error(
                "[INVOICE] Modal HTML not found."
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
                "bookingInvoiceOpen"
            );

    }



    /* =====================================================
       CLOSE
       ===================================================== */

    function closeInvoice() {

        const modal =
            invoiceEl(
                "bookingInvoiceModal"
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
                "bookingInvoiceOpen"
            );


        currentInvoiceBooking =
            null;

    }



    /* =====================================================
       PRINT VALUE
       ===================================================== */

    function printInvoiceValue(
        value,
        fallback
    ) {

        const text =
            String(
                value ??
                ""
            ).trim();


        return invoiceEscape(
            text ||
            fallback ||
            "-"
        );

    }

    /* =====================================================
       PRINT NOTE HTML
       -----------------------------------------------------
       Preserves each note line safely.
       HTML is escaped before <br> is introduced.
       ===================================================== */

    function printInvoiceNotes(
        value
    ) {

        let text =
            String(
                value ??
                ""
            );


        /*
         * Sometimes text may contain literal
         * "\n" instead of a real line break.
         */

        text =
            text.replace(
                /\\n/g,
                "\n"
            );


        /*
         * Normalize Windows / Mac line endings.
         */

        text =
            text.replace(
                /\r\n/g,
                "\n"
            );


        text =
            text.replace(
                /\r/g,
                "\n"
            );


        /*
         * Escape first for safety.
         */

        const safe =
            invoiceEscape(
                text
            );


        /*
         * Convert actual new lines to HTML.
         */

        return safe.replace(
            /\n/g,
            "<br>"
        );

    }

    /* =====================================================
       PRINT INVOICE
       ===================================================== */

    function printInvoice() {

        const row =
            currentInvoiceBooking;


        if (!row) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "No invoice is currently open.",
                    "error"
                );

            }


            return;

        }


        const customer =
            invoiceCustomer(
                row
            );


        const phone =
            invoicePhone(
                row
            );


        const email =
            invoiceEmail(
                row
            );


        const bookingId =
            invoiceBookingId(
                row
            );


        const service =
            invoiceService(
                row
            );


        const route =
            invoiceRoute(
                row
            );


        const travelDate =
            invoiceTravelDate(
                row
            );


        const bookingStatus =
            invoiceBookingStatus(
                row
            );


        const total =
            invoiceTotal(
                row
            );


        const paid =
            invoicePaid(
                row
            );


        const balance =
            invoiceBalance(
                row,
                total,
                paid
            );


        const paymentStatus =
            invoicePaymentStatus(
                row,
                total,
                paid,
                balance
            );


        const notes =
            invoiceNotes(
                row
            );


        const documentNumber =
            invoiceDocumentNumber(
                row
            );


        const documentDate =
            invoiceToday();


        const env =
            invoiceEnvironment();


        const printWindow =
            window.open(
                "",
                "_blank",
                "width=950,height=900"
            );


        if (!printWindow) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Allow pop-ups to print the invoice.",
                    "warning"
                );

            }


            return;

        }


        const phoneHtml =
            phone

                ? `
                    <div>
                        ${printInvoiceValue(
                    phone
                )}
                    </div>
                  `

                : "";


        const emailHtml =
            email

                ? `
                    <div>
                        ${printInvoiceValue(
                    email
                )}
                    </div>
                  `

                : "";


        const notesHtml =
    notes

        ? `

            <section class="notes">

                <div class="sectionTitle">
                    Notes
                </div>


                <div class="notesContent">

                    ${printInvoiceNotes(
                        notes
                    )}

                </div>

            </section>

          `

        : "";


        const testWatermark =
            env ===
                "TEST"

                ? `
                    <div class="testWatermark">
                        TEST
                    </div>
                  `

                : "";


        const printHtml = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width,initial-scale=1"
>

<title>
    RanSan Proforma -
    ${printInvoiceValue(
            bookingId
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

    font-family:
        Arial,
        Helvetica,
        sans-serif;

    background: #eef1f4;

    color: #17202a;
}


body {
    padding: 30px;
}


.invoice {
    position: relative;

    width: 100%;
    max-width: 820px;

    margin: 0 auto;

    overflow: hidden;

    border: 1px solid #dde2e7;

    border-radius: 18px;

    background: #fff;

    box-shadow:
        0 22px 65px
        rgba(15, 23, 42, .10);
}


.topAccent {
    height: 5px;

    background:
        linear-gradient(
            90deg,
            #7257e8,
            #397ee7,
            #1cb7c9,
            #12a87d
        );
}


.header {
    display: flex;

    align-items: center;
    justify-content: space-between;

    gap: 20px;

    padding: 28px 32px 23px;

    border-bottom:
        1px solid #edf0f3;
}


.brand {
    display: flex;

    align-items: center;

    gap: 12px;
}


.brandIcon {
    width: 48px;
    height: 48px;

    display: grid;

    place-items: center;

    border-radius: 14px;

    background:
        linear-gradient(
            145deg,
            #f0edff,
            #edfaff
        );

    color: #5b4bc6;

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

    color: #77808c;

    font-size: 10px;

    text-transform: uppercase;

    letter-spacing: .06em;
}


.doc {
    text-align: right;
}


.doc span {
    display: block;

    color: #838c98;

    font-size: 9px;
    font-weight: 700;

    letter-spacing: .09em;
}


.doc strong {
    display: block;

    margin-top: 4px;

    color: #1f2937;

    font-size: 16px;
}


.doc small {
    display: block;

    margin-top: 4px;

    color: #7e8793;

    font-size: 10px;
}


.billRow {
    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 12px;

    padding: 24px 32px;
}


.infoCard {
    padding: 16px;

    border: 1px solid #e8ebef;

    border-radius: 12px;

    background: #fafbfc;
}


.label {
    margin-bottom: 8px;

    color: #8a929d;

    font-size: 9px;
    font-weight: 800;

    text-transform: uppercase;

    letter-spacing: .09em;
}


.infoCard strong {
    display: block;

    margin-bottom: 6px;

    color: #202936;

    font-size: 14px;
}


.infoCard div {
    margin-top: 3px;

    color: #606a77;

    font-size: 10px;
}


.section {
    padding:
        0
        32px
        24px;
}


.sectionTitle {
    margin-bottom: 11px;

    color: #697381;

    font-size: 9px;
    font-weight: 800;

    letter-spacing: .09em;

    text-transform: uppercase;
}


.bookingTable {
    width: 100%;

    border-collapse: collapse;

    border: 1px solid #e5e9ee;

    border-radius: 12px;

    overflow: hidden;
}


.bookingTable th {
    padding: 10px 12px;

    text-align: left;

    background: #f6f8fa;

    color: #737d8a;

    font-size: 9px;

    text-transform: uppercase;
}


.bookingTable td {
    padding: 13px 12px;

    border-top: 1px solid #eceff2;

    color: #29323e;

    font-size: 11px;
}


.summary {
    width: min(
        360px,
        calc(100% - 64px)
    );

    margin:
        0
        32px
        24px
        auto;

    border: 1px solid #e5e9ee;

    border-radius: 12px;

    overflow: hidden;
}


.summaryRow {
    display: flex;

    align-items: center;
    justify-content: space-between;

    gap: 15px;

    padding: 11px 13px;

    border-bottom:
        1px solid #edf0f3;
}


.summaryRow:last-child {
    border-bottom: 0;
}


.summaryRow span {
    color: #697381;

    font-size: 10px;
}


.summaryRow strong {
    color: #1f2937;

    font-size: 12px;
}


.summaryRow.paid strong {
    color: #07875e;
}


.summaryRow.balance strong {
    color: #b77905;
}


.summaryRow.total {
    background: #f8fafc;
}


.summaryRow.total strong {
    font-size: 16px;
}


.paymentStatus {
    display: inline-block;

    padding:
        4px
        8px;

    border-radius: 999px;

    background: #f2f4f7;

    color: #515b67;

    font-size: 9px;
    font-weight: 700;
}


.notes {
    margin:
        0
        32px
        24px;

    padding: 14px 16px;

    border-left:
        3px solid #7257e8;

    background: #faf9ff;
}


.notesContent {
    margin: 0;

    color: #555f6c;

    font-size: 10px;

    line-height: 1.75;

    white-space: normal;

    overflow-wrap: anywhere;

    word-break: break-word;
}


.notice {
    margin:
        0
        32px
        24px;

    padding: 11px 13px;

    border-radius: 9px;

    background: #f5f7f9;

    color: #737c88;

    font-size: 9px;

    line-height: 1.5;
}


.footer {
    display: flex;

    align-items: center;
    justify-content: space-between;

    gap: 20px;

    padding: 18px 32px;

    border-top:
        1px solid #edf0f3;

    color: #89919c;

    font-size: 9px;
}


.testWatermark {
    position: absolute;

    top: 48%;
    left: 50%;

    transform:
        translate(
            -50%,
            -50%
        )
        rotate(
            -28deg
        );

    color:
        rgba(
            220,
            38,
            38,
            .055
        );

    font-size: 115px;
    font-weight: 900;

    pointer-events: none;
}


.invoice > *:not(
    .testWatermark
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


    .invoice {
        max-width: none;

        border: 1px solid #ddd;

        box-shadow: none;
    }

}

</style>

</head>


<body>

<main class="invoice">

    ${testWatermark}

    <div class="topAccent"></div>


    <header class="header">

        <div class="brand">

            <div class="brandIcon">
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


        <div class="doc">

            <span>
                BOOKING / PROFORMA INVOICE
            </span>

            <strong>
                ${printInvoiceValue(
            documentNumber
        )}
            </strong>

            <small>
                ${printInvoiceValue(
            documentDate
        )}
            </small>

        </div>

    </header>


    <section class="billRow">

        <div class="infoCard">

            <div class="label">
                Bill To
            </div>

            <strong>
                ${printInvoiceValue(
            customer
        )}
            </strong>

            ${phoneHtml}

            ${emailHtml}

        </div>


        <div class="infoCard">

            <div class="label">
                Booking
            </div>

            <strong>
                ${printInvoiceValue(
            bookingId
        )}
            </strong>

            <div>
                ${printInvoiceValue(
            service
        )}
            </div>

            <div>
                Status:
                ${printInvoiceValue(
            bookingStatus
        )}
            </div>

        </div>

    </section>


    <section class="section">

        <div class="sectionTitle">
            Booking Details
        </div>


        <table class="bookingTable">

            <thead>

                <tr>

                    <th>
                        Service
                    </th>

                    <th>
                        Route / Destination
                    </th>

                    <th>
                        Travel Date
                    </th>

                    <th>
                        Amount
                    </th>

                </tr>

            </thead>


            <tbody>

                <tr>

                    <td>
                        ${printInvoiceValue(
            service
        )}
                    </td>

                    <td>
                        ${printInvoiceValue(
            route
        )}
                    </td>

                    <td>
                        ${printInvoiceValue(
            travelDate
        )}
                    </td>

                    <td>
                        ${printInvoiceValue(
            invoiceMoney(
                total
            )
        )}
                    </td>

                </tr>

            </tbody>

        </table>

    </section>


    <section class="summary">

        <div class="summaryRow total">

            <span>
                Booking Value
            </span>

            <strong>
                ${printInvoiceValue(
            invoiceMoney(
                total
            )
        )}
            </strong>

        </div>


        <div class="summaryRow paid">

            <span>
                Amount Paid
            </span>

            <strong>
                ${printInvoiceValue(
            invoiceMoney(
                paid
            )
        )}
            </strong>

        </div>


        <div class="summaryRow balance">

            <span>
                Balance Due
            </span>

            <strong>
                ${printInvoiceValue(
            invoiceMoney(
                balance
            )
        )}
            </strong>

        </div>


        <div class="summaryRow">

            <span>
                Payment Status
            </span>

            <strong
                class="paymentStatus"
            >
                ${printInvoiceValue(
            paymentStatus
        )}
            </strong>

        </div>

    </section>


    ${notesHtml}


    <div class="notice">

        This document is a booking/proforma invoice
        generated from the current booking information.
        It is not a GST tax invoice.

    </div>


    <footer class="footer">

        <span>
            RanSan Travels
        </span>

        <span>
            Booking:
            ${printInvoiceValue(
            bookingId
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
                printHtml
            );


        printWindow
            .document
            .close();

    }



    /* =====================================================
       BACKDROP CLOSE
       ===================================================== */

    document.addEventListener(
        "click",
        function (event) {

            if (
                event.target &&
                event.target.id ===
                "bookingInvoiceModal"
            ) {

                closeInvoice();

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
                event.key !==
                "Escape"
            ) {

                return;

            }


            const modal =
                invoiceEl(
                    "bookingInvoiceModal"
                );


            if (
                modal &&
                modal.classList.contains(
                    "active"
                )
            ) {

                closeInvoice();

            }

        }
    );



    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.RanSanInvoice = {

        open:
            openInvoice,

        close:
            closeInvoice,

        print:
            printInvoice

    };


})();