/* =========================================================
   RANSAN CUSTOMER PORTAL
   BOOKING DOCUMENTS V1
   ========================================================= */

(function () {

    "use strict";


    let documentsByBooking =
        {};


    function safeId(
        value
    ) {

        return String(
            value ||
            ""
        ).replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
        );

    }


    function escapeHtml(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function phone() {

        if (
            typeof AuthState !==
            "undefined" &&
            AuthState.phone
        ) {

            return AuthState.phone;

        }


        return sessionStorage.getItem(
            "customerPhone"
        ) || "";

    }


    function environment() {

        if (
            typeof CustomerPortal !==
            "undefined" &&
            CustomerPortal.environment
        ) {

            return CustomerPortal.environment;

        }


        return "LIVE";

    }


    async function load(
        bookingId
    ) {

        if (!bookingId) {

            return;

        }


        const container =
            document.getElementById(
                "portalDocumentsList_" +
                safeId(
                    bookingId
                )
            ) ||
            document.getElementById(
                "portalDocumentsList_" +
                bookingId
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            `
                <div class="portalDocumentsLoadingV1">
                    Loading documents...
                </div>
            `;


        try {

            if (
                typeof callPortalAPI !==
                "function"
            ) {

                throw new Error(
                    "Customer Portal API is unavailable."
                );

            }


            const result =
                await callPortalAPI(
                    "getCustomerBookingDocuments",
                    {
                        bookingId:
                            bookingId,

                        phone:
                            phone(),

                        env:
                            environment()
                    }
                );


            if (
                !result.success
            ) {

                throw new Error(
                    result.error ||
                    result.message ||
                    "Unable to load documents."
                );

            }


            const documents =
                Array.isArray(
                    result.documents
                )
                    ? result.documents
                    : [];


            documentsByBooking[
                bookingId
            ] =
                documents;


            render(
                bookingId,
                documents
            );

        }

        catch (
        error
        ) {

            console.error(
                "[CUSTOMER DOCUMENTS]",
                error
            );


            container.innerHTML =
                `
                    <div class="portalDocumentsErrorV1">
                        Documents could not be loaded.
                    </div>
                `;

        }

    }


    function render(
        bookingId,
        documents
    ) {

        const container =
            document.getElementById(
                "portalDocumentsList_" +
                safeId(
                    bookingId
                )
            ) ||
            document.getElementById(
                "portalDocumentsList_" +
                bookingId
            );


        if (!container) {

            return;

        }


        /* =====================================================
           EMPTY STATE
           ===================================================== */

        if (!documents.length) {

            container.innerHTML =
                `
                <div class="portalDocumentsEmptyV1">

                    <span>
                        📁
                    </span>

                    <strong>
                        No documents available yet
                    </strong>

                    <small>
                        Your travel documents will appear here
                        once they are ready.
                    </small>

                </div>
            `;


            return;

        }


        /* =====================================================
           DOCUMENT CARDS
           ===================================================== */

        container.innerHTML =
            `
            <div class="portalDocumentsGridV1">

                ${documents
                .map(
                    function (
                        document,
                        index
                    ) {

                        /*
                         * File size.
                         *
                         * Do not show "0 B" when old/corrupt
                         * metadata contains zero or blank.
                         */

                        const fileSize =
                            Number(
                                document.fileSize ||
                                0
                            );


                        const sizeText =
                            fileSize > 0
                                ? formatSize(
                                    fileSize
                                )
                                : "";


                        const metaText =
                            sizeText
                                ? (
                                    escapeHtml(
                                        document.documentType
                                    ) +
                                    " • " +
                                    escapeHtml(
                                        sizeText
                                    )
                                )
                                : escapeHtml(
                                    document.documentType
                                );


                        return `

                                <button
                                    type="button"
                                    class="portalDocumentItemV1"
                                    onclick="
                                        window
                                            .RanSanCustomerDocuments
                                            ?.open(
                                                '${escapeHtml(
                            bookingId
                        )}',
                                                ${index},
                                                this
                                            )
                                    "
                                >

                                    <span class="portalDocumentIconV1">

                                        ${iconFor(
                            document
                        )}

                                    </span>


                                    <span class="portalDocumentCopyV1">

                                        <strong>

                                            ${escapeHtml(
                            document.documentName ||
                            document.documentType
                        )}

                                        </strong>


                                        <small>

                                            ${metaText}

                                        </small>

                                    </span>


                                    <span
                                        class="portalDocumentOpenV1"
                                        data-document-view-label
                                    >
                                        View →
                                    </span>

                                </button>

                            `;

                    }
                )
                .join("")
            }

            </div>
        `;

    }


    /* =========================================================
   OPEN CUSTOMER DOCUMENT
   Premium Loading State
   ========================================================= */

    /* =========================================================
   OPEN CUSTOMER DOCUMENT
   ---------------------------------------------------------
   Premium Loader + Popup Safe Version

   IMPORTANT:
   Uses the EXISTING document INDEX architecture.

   Parameters:
   bookingId
   index
   button
   ========================================================= */

async function open(
    bookingId,
    index,
    button
) {

    bookingId =
        String(
            bookingId ||
            ""
        ).trim();


    index =
        Number(
            index
        );


    if (!bookingId) {

        return;

    }


    /* =====================================================
       FIND DOCUMENT USING EXISTING INDEX
       ===================================================== */

    const bookingDocuments =
        Array.isArray(
            documentsByBooking[
                bookingId
            ]
        )
            ? documentsByBooking[
                bookingId
            ]
            : [];


    const documentItem =
        bookingDocuments[
            index
        ];


    if (!documentItem) {

        console.error(
            "[CUSTOMER DOCUMENT] Document not found:",
            bookingId,
            index
        );


        window.alert(
            "Document information could not be found. Please refresh and try again."
        );


        return;

    }


    /* =====================================================
       OPEN BLANK WINDOW IMMEDIATELY
       -----------------------------------------------------
       This is important.

       Browsers may block window.open() when it happens
       AFTER an asynchronous API request.

       Opening the window immediately inside the user's
       click prevents popup blocking.
       ===================================================== */

    const viewer =
        window.open(
            "",
            "_blank"
        );


    if (!viewer) {

        window.alert(
            "Your browser blocked the document window. Please allow pop-ups for RanSan Travels and try again."
        );


        return;

    }


    /* =====================================================
       TEMPORARY LOADING PAGE INSIDE NEW TAB
       ===================================================== */

    try {

        viewer.document.open();


        viewer.document.write(`
            <!DOCTYPE html>

            <html>

            <head>

                <title>
                    Opening Document...
                </title>

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                >

                <style>

                    * {
                        box-sizing: border-box;
                    }

                    html,
                    body {
                        margin: 0;
                        width: 100%;
                        height: 100%;
                    }

                    body {
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        background:
                            #070b11;

                        color:
                            #e5edf5;

                        font-family:
                            Inter,
                            -apple-system,
                            BlinkMacSystemFont,
                            "Segoe UI",
                            Arial,
                            sans-serif;
                    }

                    .documentOpeningBox {
                        display: flex;
                        flex-direction: column;
                        align-items: center;

                        gap: 14px;

                        padding: 30px;

                        text-align: center;
                    }

                    .documentOpeningSpinner {
                        width: 34px;
                        height: 34px;

                        border:
                            3px solid
                            rgba(125,211,252,.18);

                        border-top-color:
                            #7dd3fc;

                        border-radius:
                            50%;

                        animation:
                            spin
                            .75s
                            linear
                            infinite;
                    }

                    .documentOpeningTitle {
                        color:
                            #f8fafc;

                        font-size:
                            16px;

                        font-weight:
                            750;
                    }

                    .documentOpeningSub {
                        color:
                            #94a3b8;

                        font-size:
                            12px;
                    }

                    @keyframes spin {

                        to {
                            transform:
                                rotate(360deg);
                        }

                    }

                </style>

            </head>


            <body>

                <div class="documentOpeningBox">

                    <div class="documentOpeningSpinner"></div>

                    <div class="documentOpeningTitle">
                        Opening your document
                    </div>

                    <div class="documentOpeningSub">
                        Retrieving the secure file from RanSan Travels...
                    </div>

                </div>

            </body>

            </html>
        `);


        viewer.document.close();

    }

    catch (
        viewerError
    ) {

        console.warn(
            "[CUSTOMER DOCUMENT] Loading page skipped:",
            viewerError
        );

    }


    /* =====================================================
       BUTTON LOADING STATE
       ===================================================== */

    let viewLabel =
        null;


    let originalLabel =
        "View →";


    if (button) {

        viewLabel =
            button.querySelector(
                "[data-document-view-label]"
            );


        button.disabled =
            true;


        button.classList.add(
            "portalDocumentOpening"
        );


        if (viewLabel) {

            originalLabel =
                viewLabel.innerHTML;


            viewLabel.innerHTML = `

                <span
                    class="portalDocumentViewSpinner"
                    aria-hidden="true"
                ></span>

                <span>
                    Opening...
                </span>

            `;

        }

    }


    try {

        /* =================================================
           REQUEST PRIVATE FILE
           ================================================= */

        if (
            typeof callPortalAPI !==
            "function"
        ) {

            throw new Error(
                "Customer Portal API is unavailable."
            );

        }


        const result =
            await callPortalAPI(
                "getBookingDocumentFile",
                {

                    documentId:
                        documentItem.documentId,

                    bookingId:
                        bookingId,

                    phone:
                        phone(),

                    customerAccess:
                        true,

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
                result?.message ||
                "Unable to open document."
            );

        }


        if (!result.base64) {

            throw new Error(
                "Document data was not received."
            );

        }


        /* =================================================
           BASE64 → BINARY
           ================================================= */

        const binary =
            atob(
                result.base64
            );


        const bytes =
            new Uint8Array(
                binary.length
            );


        for (
            let i = 0;
            i < binary.length;
            i++
        ) {

            bytes[
                i
            ] =
                binary.charCodeAt(
                    i
                );

        }


        /* =================================================
           CREATE PRIVATE BROWSER BLOB
           ================================================= */

        const blob =
            new Blob(
                [
                    bytes
                ],
                {

                    type:
                        result.mimeType ||
                        documentItem.mimeType ||
                        "application/octet-stream"

                }
            );


        const objectUrl =
            URL.createObjectURL(
                blob
            );


        /* =================================================
           LOAD FILE INTO ALREADY-OPEN WINDOW
           ================================================= */

        viewer.location.replace(
            objectUrl
        );


        /*
         * Keep URL alive long enough for browser viewers,
         * especially PDF viewer.
         */

        window.setTimeout(
            function () {

                URL.revokeObjectURL(
                    objectUrl
                );

            },
            120000
        );

    }

    catch (
        error
    ) {

        console.error(
            "[CUSTOMER DOCUMENT OPEN]",
            error
        );


        /*
         * Close temporary loading tab when request fails.
         */

        try {

            if (
                viewer &&
                !viewer.closed
            ) {

                viewer.close();

            }

        }

        catch (
            closeError
        ) {

            // Ignore.

        }


        window.alert(
            error.message ||
            "Unable to open document."
        );

    }

    finally {

        /* =================================================
           RESTORE VIEW BUTTON
           ================================================= */

        if (
            button &&
            document.body.contains(
                button
            )
        ) {

            button.disabled =
                false;


            button.classList.remove(
                "portalDocumentOpening"
            );


            if (viewLabel) {

                viewLabel.innerHTML =
                    originalLabel ||
                    "View →";

            }

        }

    }

}


    function openFile(
        result
    ) {

        const binary =
            atob(
                result.base64
            );


        const bytes =
            new Uint8Array(
                binary.length
            );


        for (
            let i = 0;
            i <
            binary.length;
            i++
        ) {

            bytes[i] =
                binary.charCodeAt(
                    i
                );

        }


        const blob =
            new Blob(
                [bytes],
                {
                    type:
                        result.mimeType ||
                        "application/octet-stream"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        window.open(
            url,
            "_blank"
        );


        setTimeout(
            function () {

                URL.revokeObjectURL(
                    url
                );

            },
            60000
        );

    }


    function iconFor(
        document
    ) {

        const type =
            String(
                document.documentType ||
                ""
            );


        const icons =
        {
            "Travel Voucher":
                "🎫",

            "Ticket":
                "✈️",

            "Invoice":
                "🧾",

            "Visa Document":
                "🛂",

            "Insurance":
                "🧳",

            "Hotel Voucher":
                "🏨",

            "Transport Voucher":
                "🚖",

            "Passport / ID Copy":
                "🪪",

            "Itinerary":
                "🗺️",

            "Other":
                "📎"
        };


        return icons[type] ||
            "📄";

    }


    function formatSize(
    bytes
) {

    const n =
        Number(
            bytes ||
            0
        );


    /*
     * Invalid / missing metadata.
     *
     * Do not display misleading "0 B".
     */

    if (
        !Number.isFinite(
            n
        ) ||
        n <= 0
    ) {

        return "";

    }


    if (
        n <
        1024
    ) {

        return (
            n +
            " B"
        );

    }


    if (
        n <
        (
            1024 *
            1024
        )
    ) {

        return (
            n /
            1024
        ).toFixed(
            1
        ) +
        " KB";

    }


    return (
        n /
        (
            1024 *
            1024
        )
    ).toFixed(
        1
    ) +
    " MB";

}

    /* =========================================================
   CUSTOMER DOCUMENT UPLOAD V1
   ========================================================= */

    const CUSTOMER_DOCUMENT_MAX_BYTES =
        5 * 1024 * 1024;


    const CUSTOMER_DOCUMENT_MIME_TYPES =
        [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


    /* ---------------------------------------------------------
       OPEN UPLOAD PANEL
       --------------------------------------------------------- */

    function openUpload(
        bookingId
    ) {

        const panel =
            document.getElementById(
                "customerDocumentUpload_" +
                safeId(
                    bookingId
                )
            );


        if (!panel) {

            return;

        }


        panel.hidden =
            false;


        const status =
            document.getElementById(
                "customerDocumentUploadStatus_" +
                safeId(
                    bookingId
                )
            );


        if (status) {

            status.innerHTML =
                "";

        }

    }


    /* ---------------------------------------------------------
       CLOSE UPLOAD PANEL
       --------------------------------------------------------- */

    function closeUpload(
        bookingId
    ) {

        const panel =
            document.getElementById(
                "customerDocumentUpload_" +
                safeId(
                    bookingId
                )
            );


        if (panel) {

            panel.hidden =
                true;

        }

    }


    /* ---------------------------------------------------------
       UPLOAD CUSTOMER FILE
       --------------------------------------------------------- */

    async function uploadCustomerDocument(
        bookingId
    ) {

        const domId =
            safeId(
                bookingId
            );


        const typeElement =
            document.getElementById(
                "customerDocumentType_" +
                domId
            );


        const fileElement =
            document.getElementById(
                "customerDocumentFile_" +
                domId
            );


        const consentElement =
            document.getElementById(
                "customerDocumentConsent_" +
                domId
            );


        const button =
            document.getElementById(
                "customerDocumentUploadBtn_" +
                domId
            );


        const status =
            document.getElementById(
                "customerDocumentUploadStatus_" +
                domId
            );


        if (
            !typeElement ||
            !fileElement ||
            !consentElement
        ) {

            return;

        }


        const documentType =
            typeElement.value.trim();


        const file =
            fileElement.files[0];


        if (!documentType) {

            setCustomerUploadStatus(
                status,
                "Please select a document type.",
                "error"
            );

            return;

        }


        if (!file) {

            setCustomerUploadStatus(
                status,
                "Please choose a document file.",
                "error"
            );

            return;

        }


        if (
            !CUSTOMER_DOCUMENT_MIME_TYPES
                .includes(
                    file.type
                )
        ) {

            setCustomerUploadStatus(
                status,
                "Only PDF, JPG, PNG and WEBP files are allowed.",
                "error"
            );

            return;

        }


        if (
            file.size >
            CUSTOMER_DOCUMENT_MAX_BYTES
        ) {

            setCustomerUploadStatus(
                status,
                "Maximum file size is 5 MB.",
                "error"
            );

            return;

        }


        if (
            !consentElement.checked
        ) {

            setCustomerUploadStatus(
                status,
                "Please confirm the document-upload consent.",
                "error"
            );

            return;

        }


        if (button) {

            button.disabled =
                true;


            button.textContent =
                "Uploading securely...";

        }


        setCustomerUploadStatus(
            status,
            "Securely uploading your document...",
            "loading"
        );


        try {

            const base64 =
                await customerFileToBase64(
                    file
                );


            const result =
                await callPortalAPI(
                    "uploadCustomerBookingDocument",
                    {

                        env:
                            environment(),

                        bookingId:
                            bookingId,

                        phone:
                            phone(),

                        documentType:
                            documentType,

                        documentName:
                            documentType,

                        fileName:
                            file.name,

                        mimeType:
                            file.type,

                        base64:
                            base64,

                        consent:
                            true

                    }
                );


            if (
                !result ||
                !result.success
            ) {

                throw new Error(
                    result?.error ||
                    result?.message ||
                    "Document upload failed."
                );

            }


            typeElement.value =
                "";


            fileElement.value =
                "";


            consentElement.checked =
                false;


            setCustomerUploadStatus(
                status,
                "✓ Document uploaded securely and received by RanSan Travels.",
                "success"
            );


            /*
             * Reload customer-visible RanSan documents.
             * Customer identity upload itself remains private.
             */

            await load(
                bookingId
            );

        }

        catch (
        error
        ) {

            console.error(
                "[CUSTOMER DOCUMENT UPLOAD]",
                error
            );


            setCustomerUploadStatus(
                status,
                error.message ||
                "Unable to upload document.",
                "error"
            );

        }

        finally {

            if (button) {

                button.disabled =
                    false;


                button.textContent =
                    "🔒 Upload Securely";

            }

        }

    }


    /* ---------------------------------------------------------
       FILE → BASE64
       --------------------------------------------------------- */

    function customerFileToBase64(
        file
    ) {

        return new Promise(
            function (
                resolve,
                reject
            ) {

                const reader =
                    new FileReader();


                reader.onload =
                    function () {

                        const raw =
                            String(
                                reader.result ||
                                ""
                            );


                        const comma =
                            raw.indexOf(
                                ","
                            );


                        resolve(
                            comma >= 0
                                ? raw.slice(
                                    comma + 1
                                )
                                : raw
                        );

                    };


                reader.onerror =
                    function () {

                        reject(
                            new Error(
                                "Unable to read the selected file."
                            )
                        );

                    };


                reader.readAsDataURL(
                    file
                );

            }
        );

    }


    /* ---------------------------------------------------------
       STATUS MESSAGE
       --------------------------------------------------------- */

    function setCustomerUploadStatus(
        element,
        message,
        state
    ) {

        if (!element) {

            return;

        }


        element.className =
            "customerDocumentUploadStatus " +
            (
                state ||
                ""
            );


        element.textContent =
            message ||
            "";

    }

    window.RanSanCustomerDocuments =
    {
        load:
            load,

        open:
            open,

        openUpload:
            openUpload,

        closeUpload:
            closeUpload,

        upload:
            uploadCustomerDocument
    };


})();