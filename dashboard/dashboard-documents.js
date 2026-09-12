/* =========================================================
   RANSAN TRAVELS
   BOOKING DOCUMENT MANAGER V1
   ========================================================= */

(function () {

    "use strict";


    let currentRow =
        null;


    let currentDocuments =
        [];

    let archivedDocuments = [];


    const MAX_BYTES =
        8 * 1024 * 1024;


    const ALLOWED_TYPES =
        [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


    function $(
        id
    ) {

        return document.getElementById(
            id
        );

    }


    function value(
        row,
        keys,
        fallback = ""
    ) {

        if (!row) {

            return fallback;

        }


        for (
            const key
            of keys
        ) {

            if (
                row[key] !== undefined &&
                row[key] !== null &&
                row[key] !== ""
            ) {

                return row[key];

            }

        }


        return fallback;

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
                    "bookingId"
                ]
            )
        ).trim();

    }


    function customer(
        row
    ) {

        return String(
            value(
                row,
                [
                    "Customer Name",
                    "Customer",
                    "Name"
                ],
                "Customer"
            )
        );

    }


    function environment() {

        let env =
            sessionStorage.getItem(
                "portalEnvironment"
            ) ||
            localStorage.getItem(
                "dashboardEnv"
            ) ||
            window.DASHBOARD_ENV ||
            "LIVE";


        env =
            String(
                env
            )
                .trim()
                .toUpperCase();


        return env ===
            "TEST"
            ? "TEST"
            : "LIVE";

    }


    function escapeHtml(
        text
    ) {

        return String(
            text ?? ""
        )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function toast(
        message,
        type = "info"
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
            "[DOCUMENTS]",
            message
        );

    }


    async function api(
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


        return result;

    }


    function open(
        row
    ) {

        if (
            !row ||
            !bookingId(row)
        ) {

            toast(
                "Booking information is unavailable.",
                "error"
            );

            return;

        }


        if (
            !row._sheet ||
            !row._row
        ) {

            toast(
                "Booking source metadata is unavailable.",
                "error"
            );

            return;

        }


        currentRow =
            row;


        $("bookingDocumentsCustomer")
            .textContent =
            customer(
                row
            );


        $("bookingDocumentsBookingId")
            .textContent =
            bookingId(
                row
            );


        $("bookingDocumentsEnvironment")
            .textContent =
            environment();


        $("bookingDocumentType")
            .value =
            "";


        $("bookingDocumentName")
            .value =
            "";


        $("bookingDocumentFile")
            .value =
            "";


        $("bookingDocumentCustomerVisible")
            .checked =
            true;


        const modal =
            $("bookingDocumentsModal");


        modal.classList.add(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "bookingDocumentsOpen"
        );


        load();

    }


    function close() {

        $("bookingDocumentsModal")
            ?.classList
            .remove(
                "active"
            );


        $("bookingDocumentsModal")
            ?.setAttribute(
                "aria-hidden",
                "true"
            );


        document.body.classList.remove(
            "bookingDocumentsOpen"
        );


        currentRow =
            null;


        currentDocuments =
            [];

    }


    async function load() {

        if (!currentRow) {

            return;

        }


        setLoading(
            true
        );


        try {

            const result =
                await api({

                    action:
                        "getBookingDocuments",

                    env:
                        environment(),

                    bookingId:
                        bookingId(
                            currentRow
                        )

                });


            if (
                !result.success
            ) {

                throw new Error(
                    result.error ||
                    "Unable to load documents."
                );

            }


            currentDocuments =
                Array.isArray(
                    result.documents
                )
                    ? result.documents
                    : [];


            render();

        }

        catch (
        error
        ) {

            currentDocuments =
                [];


            render();


            toast(
                error.message,
                "error"
            );

        }

        finally {

            setLoading(
                false
            );

        }

    }


    function setLoading(
        state
    ) {

        const el =
            $("bookingDocumentsLoading");


        if (el) {

            el.hidden =
                !state;

        }

    }


    function render() {

        const list =
            $("bookingDocumentsList");


        const empty =
            $("bookingDocumentsEmpty");


        const count =
            currentDocuments.length;


        $("bookingDocumentsCount")
            .textContent =
            count +
            (
                count === 1
                    ? " document"
                    : " documents"
            );


        if (!count) {

            list.innerHTML =
                "";


            empty.hidden =
                false;


            return;

        }


        empty.hidden =
            true;


        list.innerHTML =
            currentDocuments
                .map(
                    function (
                        doc
                    ) {

                        return `
                            <div class="bookingDocumentItem">

                                <div class="bookingDocumentIcon">
                                    ${documentIcon(
                            doc.documentType,
                            doc.mimeType
                        )}
                                </div>


                                <div class="bookingDocumentMain">

                                    <strong>
                                        ${escapeHtml(
                            doc.documentName ||
                            doc.documentType
                        )}
                                    </strong>

                                    <span>
                                        ${escapeHtml(
                            doc.documentType
                        )}
                                        •
                                        ${escapeHtml(
                            formatSize(
                                doc.fileSize
                            )
                        )}
                                    </span>

                                    <small>
                                        Uploaded
                                        ${escapeHtml(
                            formatDate(
                                doc.uploadedAt
                            )
                        )}
                                        ${doc.uploadedBy
                                ? " by " +
                                escapeHtml(
                                    doc.uploadedBy
                                )
                                : ""
                            }
                                    </small>

                                </div>


                                <div class="bookingDocumentVisibilityState">

                                    <span class="${doc.customerVisible
                                ? "visible"
                                : "internal"
                            }">
                                        ${doc.customerVisible
                                ? "Customer Visible"
                                : "Internal Only"
                            }
                                    </span>

                                </div>


                                <div class="bookingDocumentActions">

                                    <button
                                        type="button"
                                        onclick="
                                            window.RanSanDocuments
                                                ?.view(
                                                    '${escapeHtml(
                                doc.documentId
                            )}'
                                                )
                                        "
                                    >
                                        View
                                    </button>


                                    <button
                                        type="button"
                                        onclick="
                                            window.RanSanDocuments
                                                ?.toggleVisibility(
                                                    '${escapeHtml(
                                doc.documentId
                            )}',
                                                    ${!doc.customerVisible}
                                                )
                                        "
                                    >
                                        ${doc.customerVisible
                                ? "Make Internal"
                                : "Show to Customer"
                            }
                                    </button>


                                    <button
                                        type="button"
                                        class="danger"
                                        onclick="
                                            window.RanSanDocuments
                                                ?.archive(
                                                    '${escapeHtml(
                                doc.documentId
                            )}'
                                                )
                                        "
                                    >
                                        Archive
                                    </button>

                                </div>

                            </div>
                        `;

                    }
                )
                .join("");

    }


    async function upload() {

        if (!currentRow) {

            return;

        }


        const documentType =
            $("bookingDocumentType")
                .value
                .trim();


        const documentName =
            $("bookingDocumentName")
                .value
                .trim();


        const file =
            $("bookingDocumentFile")
                .files[0];


        const customerVisible =
            $("bookingDocumentCustomerVisible")
                .checked;


        if (!documentType) {

            toast(
                "Select a document type.",
                "warning"
            );

            return;

        }


        if (!file) {

            toast(
                "Choose a document file.",
                "warning"
            );

            return;

        }


        if (
            !ALLOWED_TYPES.includes(
                file.type
            )
        ) {

            toast(
                "Only PDF, JPG, PNG and WEBP files are allowed.",
                "error"
            );

            return;

        }


        if (
            file.size >
            MAX_BYTES
        ) {

            toast(
                "Maximum file size is 8 MB.",
                "error"
            );

            return;

        }


        const button =
            $("bookingDocumentUploadBtn");


        button.disabled =
            true;


        button.textContent =
            "Uploading...";


        try {

            const base64 =
                await fileToBase64(
                    file
                );


            const result =
                await api({

                    action:
                        "uploadBookingDocument",

                    env:
                        environment(),

                    sheet:
                        currentRow._sheet,

                    row:
                        Number(
                            currentRow._row
                        ),

                    bookingId:
                        bookingId(
                            currentRow
                        ),

                    documentType:
                        documentType,

                    documentName:
                        documentName ||
                        documentType,

                    fileName:
                        file.name,

                    mimeType:
                        file.type,

                    base64:
                        base64,

                    customerVisible:
                        customerVisible,

                    uploadedBy:
                        sessionStorage.getItem(
                            "portalUsername"
                        ) ||
                        sessionStorage.getItem(
                            "username"
                        ) ||
                        ""

                });


            if (
                !result.success
            ) {

                throw new Error(
                    result.error ||
                    "Document upload failed."
                );

            }


            toast(
                "Document uploaded successfully.",
                "success"
            );


            $("bookingDocumentFile")
                .value =
                "";


            $("bookingDocumentName")
                .value =
                "";


            await load();

        }

        catch (
        error
        ) {

            toast(
                error.message,
                "error"
            );

        }

        finally {

            button.disabled =
                false;


            button.innerHTML =
                "<span>↑</span> Upload Document";

        }

    }


    function fileToBase64(
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

                        const result =
                            String(
                                reader.result ||
                                ""
                            );


                        const comma =
                            result.indexOf(
                                ","
                            );


                        resolve(
                            comma >= 0
                                ? result.slice(
                                    comma + 1
                                )
                                : result
                        );

                    };


                reader.onerror =
                    function () {

                        reject(
                            new Error(
                                "Unable to read selected file."
                            )
                        );

                    };


                reader.readAsDataURL(
                    file
                );

            }
        );

    }


    async function view(
        documentId
    ) {

        try {

            toast(
                "Opening document...",
                "info"
            );


            const result =
                await api({

                    action:
                        "getBookingDocumentFile",

                    env:
                        environment(),

                    documentId:
                        documentId,

                    customerAccess:
                        false

                });


            if (
                !result.success
            ) {

                throw new Error(
                    result.error ||
                    "Unable to open document."
                );

            }


            openBase64File(
                result.base64,
                result.mimeType,
                result.fileName
            );

        }

        catch (
        error
        ) {

            toast(
                error.message,
                "error"
            );

        }

    }


    async function toggleVisibility(
        documentId,
        newValue
    ) {

        try {

            const result =
                await api({

                    action:
                        "updateBookingDocumentVisibility",

                    env:
                        environment(),

                    documentId:
                        documentId,

                    customerVisible:
                        newValue

                });


            if (
                !result.success
            ) {

                throw new Error(
                    result.error ||
                    "Unable to update visibility."
                );

            }


            toast(
                newValue
                    ? "Document is now visible to the customer."
                    : "Document is now internal only.",
                "success"
            );


            await load();

        }

        catch (
        error
        ) {

            toast(
                error.message,
                "error"
            );

        }

    }


    /* =========================================================
   ARCHIVE DOCUMENT
   MODERN MODAL FLOW
   ========================================================= */

    async function archive(
        documentId
    ) {

        const documentItem =
            currentDocuments.find(
                function (
                    item
                ) {

                    return (
                        String(
                            item.documentId ||
                            ""
                        ) ===
                        String(
                            documentId ||
                            ""
                        )
                    );

                }
            );


        openArchiveDocumentModal(
            documentId,
            documentItem
        );

    }

    /* =========================================================
       ARCHIVE DOCUMENT MODAL
       RANSAN PREMIUM UI
       ========================================================= */


    let archiveDocumentState =
    {
        documentId:
            "",

        document:
            null,

        processing:
            false
    };


    /* ---------------------------------------------------------
       Ensure modal exists
       --------------------------------------------------------- */

    function ensureArchiveDocumentModal() {

        if (
            document.getElementById(
                "bookingDocumentArchiveModal"
            )
        ) {

            return;

        }


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "bookingDocumentArchiveModal";


        modal.className =
            "bookingDocumentArchiveModal";


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        modal.innerHTML = `

        <div
            class="bookingDocumentArchiveBackdrop"
            data-archive-modal-close
        ></div>


        <div
            class="bookingDocumentArchiveDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bookingDocumentArchiveTitle"
        >

            <!-- HEADER -->

            <div class="bookingDocumentArchiveHeader">

                <div class="bookingDocumentArchiveHeaderLeft">

                    <div class="bookingDocumentArchiveIcon">
                        🗃
                    </div>


                    <div>

                        <div class="bookingDocumentArchiveEyebrow">
                            DOCUMENT MANAGEMENT
                        </div>


                        <h3 id="bookingDocumentArchiveTitle">
                            Archive Document
                        </h3>

                    </div>

                </div>


                <button
                    type="button"
                    id="bookingDocumentArchiveClose"
                    class="bookingDocumentArchiveClose"
                    aria-label="Close archive dialog"
                >
                    ×
                </button>

            </div>


            <!-- BODY -->

            <div class="bookingDocumentArchiveBody">


                <div class="bookingDocumentArchiveDocument">

                    <div class="bookingDocumentArchiveFileIcon">
                        📄
                    </div>


                    <div class="bookingDocumentArchiveDocumentCopy">

                        <strong
                            id="bookingDocumentArchiveName"
                        >
                            Document
                        </strong>


                        <span
                            id="bookingDocumentArchiveMeta"
                        >
                            Travel document
                        </span>


                        <small
                            id="bookingDocumentArchiveBooking"
                        ></small>

                    </div>

                </div>


                <div class="bookingDocumentArchiveInfoBox">

                    <div class="bookingDocumentArchiveInfoIcon">
                        i
                    </div>


                    <div>

                        <strong>
                            The Drive file will be preserved
                        </strong>


                        <p>
                            Archiving removes this document from the active
                            Documents list and from the customer portal.
                            The private Google Drive file remains preserved
                            for audit and can be restored later.
                        </p>

                    </div>

                </div>


                <div
                    id="bookingDocumentArchiveError"
                    class="bookingDocumentArchiveError"
                    hidden
                ></div>


                <div
                    id="bookingDocumentArchiveStatus"
                    class="bookingDocumentArchiveStatus"
                    hidden
                >

                    <span class="bookingDocumentArchiveSpinner"></span>

                    <span>
                        Archiving document...
                    </span>

                </div>

            </div>


            <!-- FOOTER -->

            <div class="bookingDocumentArchiveFooter">

                <button
                    type="button"
                    id="bookingDocumentArchiveCancel"
                    class="bookingDocumentArchiveCancel"
                >
                    Cancel
                </button>


                <button
                    type="button"
                    id="bookingDocumentArchiveConfirm"
                    class="bookingDocumentArchiveConfirm"
                >
                    <span>
                        🗃
                    </span>

                    <span
                        id="bookingDocumentArchiveConfirmLabel"
                    >
                        Archive Document
                    </span>
                </button>

            </div>

        </div>

    `;


        document.body.appendChild(
            modal
        );


        /* =====================================================
           EVENTS
           ===================================================== */

        const closeButton =
            document.getElementById(
                "bookingDocumentArchiveClose"
            );


        const cancelButton =
            document.getElementById(
                "bookingDocumentArchiveCancel"
            );


        const confirmButton =
            document.getElementById(
                "bookingDocumentArchiveConfirm"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeArchiveDocumentModal
            );

        }


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeArchiveDocumentModal
            );

        }


        if (confirmButton) {

            confirmButton.addEventListener(
                "click",
                executeArchiveDocument
            );

        }


        modal.addEventListener(
            "click",
            function (
                event
            ) {

                if (
                    event.target.matches(
                        "[data-archive-modal-close]"
                    )
                ) {

                    closeArchiveDocumentModal();

                }

            }
        );


        document.addEventListener(
            "keydown",
            handleArchiveDocumentModalKeydown
        );

    }



    /* ---------------------------------------------------------
       Open modal
       --------------------------------------------------------- */

    function openArchiveDocumentModal(
        documentId,
        documentItem
    ) {

        ensureArchiveDocumentModal();


        const modal =
            document.getElementById(
                "bookingDocumentArchiveModal"
            );


        if (!modal) {

            return;

        }


        archiveDocumentState.documentId =
            String(
                documentId ||
                ""
            );


        archiveDocumentState.document =
            documentItem ||
            null;


        archiveDocumentState.processing =
            false;


        const nameElement =
            document.getElementById(
                "bookingDocumentArchiveName"
            );


        const metaElement =
            document.getElementById(
                "bookingDocumentArchiveMeta"
            );


        const bookingElement =
            document.getElementById(
                "bookingDocumentArchiveBooking"
            );


        const name =
            documentItem?.documentName ||
            documentItem?.documentType ||
            documentItem?.fileName ||
            "Document";


        const type =
            documentItem?.documentType ||
            "Travel document";


        const fileName =
            documentItem?.fileName ||
            "";


        if (nameElement) {

            nameElement.textContent =
                name;

        }


        if (metaElement) {

            metaElement.textContent =
                fileName
                    ? type +
                    " • " +
                    fileName
                    : type;

        }


        if (bookingElement) {

            const currentBookingId =
                currentRow
                    ? bookingId(
                        currentRow
                    )
                    : documentItem?.bookingId;


            bookingElement.textContent =
                currentBookingId
                    ? "Booking ID: " +
                    currentBookingId
                    : "";

        }


        clearArchiveDocumentError();


        setArchiveDocumentLoading(
            false
        );


        modal.classList.add(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "bookingDocumentArchiveOpen"
        );

    }



    /* ---------------------------------------------------------
       Close modal
       --------------------------------------------------------- */

    function closeArchiveDocumentModal() {

        if (
            archiveDocumentState.processing
        ) {

            return;

        }


        const modal =
            document.getElementById(
                "bookingDocumentArchiveModal"
            );


        if (!modal) {

            return;

        }


        modal.classList.remove(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "bookingDocumentArchiveOpen"
        );


        archiveDocumentState.documentId =
            "";


        archiveDocumentState.document =
            null;


        clearArchiveDocumentError();

    }



    /* ---------------------------------------------------------
       Execute archive
       --------------------------------------------------------- */

    async function executeArchiveDocument() {

        if (
            archiveDocumentState.processing
        ) {

            return;

        }


        const documentId =
            String(
                archiveDocumentState.documentId ||
                ""
            ).trim();


        if (!documentId) {

            showArchiveDocumentError(
                "Document ID is missing."
            );


            return;

        }


        archiveDocumentState.processing =
            true;


        clearArchiveDocumentError();


        setArchiveDocumentLoading(
            true
        );


        try {

            const result =
                await api({

                    action:
                        "archiveBookingDocument",

                    env:
                        environment(),

                    documentId:
                        documentId

                });


            if (
                !result ||
                result.success !==
                true
            ) {

                throw new Error(
                    result?.error ||
                    result?.message ||
                    "Unable to archive document."
                );

            }


            /* =================================================
               REFRESH ACTIVE DOCUMENTS
               ================================================= */

            await load();


            /*
             * If Archived Documents panel is currently open,
             * refresh it too so the archived document appears
             * immediately.
             */

            const archivePanel =
                document.getElementById(
                    "bookingDocumentsArchivePanel"
                );


            if (
                archivePanel &&
                !archivePanel.hidden
            ) {

                await loadArchivedDocuments();

            }


            /* =================================================
               SUCCESS
               ================================================= */

            toast(
                "Document archived.",
                "success"
            );


            archiveDocumentState.processing =
                false;


            closeArchiveDocumentModal();

        }

        catch (
        error
        ) {

            console.error(
                "[DOCUMENT ARCHIVE]",
                error
            );


            archiveDocumentState.processing =
                false;


            setArchiveDocumentLoading(
                false
            );


            showArchiveDocumentError(
                error.message ||
                "Unable to archive document."
            );

        }

    }



    /* ---------------------------------------------------------
       Loading state
       --------------------------------------------------------- */

    function setArchiveDocumentLoading(
        loading
    ) {

        const confirmButton =
            document.getElementById(
                "bookingDocumentArchiveConfirm"
            );


        const cancelButton =
            document.getElementById(
                "bookingDocumentArchiveCancel"
            );


        const closeButton =
            document.getElementById(
                "bookingDocumentArchiveClose"
            );


        const status =
            document.getElementById(
                "bookingDocumentArchiveStatus"
            );


        const label =
            document.getElementById(
                "bookingDocumentArchiveConfirmLabel"
            );


        if (confirmButton) {

            confirmButton.disabled =
                loading;


            confirmButton.classList.toggle(
                "loading",
                loading
            );

        }


        if (cancelButton) {

            cancelButton.disabled =
                loading;

        }


        if (closeButton) {

            closeButton.disabled =
                loading;

        }


        if (status) {

            status.hidden =
                !loading;

        }


        if (label) {

            label.textContent =
                loading
                    ? "Archiving..."
                    : "Archive Document";

        }

    }



    /* ---------------------------------------------------------
       Error
       --------------------------------------------------------- */

    function showArchiveDocumentError(
        message
    ) {

        const element =
            document.getElementById(
                "bookingDocumentArchiveError"
            );


        if (!element) {

            return;

        }


        element.hidden =
            false;


        element.textContent =
            message ||
            "Unable to archive document.";

    }



    /* ---------------------------------------------------------
       Clear error
       --------------------------------------------------------- */

    function clearArchiveDocumentError() {

        const element =
            document.getElementById(
                "bookingDocumentArchiveError"
            );


        if (!element) {

            return;

        }


        element.hidden =
            true;


        element.textContent =
            "";

    }



    /* ---------------------------------------------------------
       Escape key
       --------------------------------------------------------- */

    function handleArchiveDocumentModalKeydown(
        event
    ) {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        const modal =
            document.getElementById(
                "bookingDocumentArchiveModal"
            );


        if (
            !modal ||
            !modal.classList.contains(
                "active"
            )
        ) {

            return;

        }


        closeArchiveDocumentModal();

    }


    function openBase64File(
        base64,
        mimeType,
        fileName
    ) {

        const binary =
            atob(
                base64
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
                        mimeType ||
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


    function formatSize(
        bytes
    ) {

        const n =
            Number(
                bytes ||
                0
            );


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
            1024 * 1024
        ) {

            return (
                (
                    n /
                    1024
                ).toFixed(1) +
                " KB"
            );

        }


        return (
            (
                n /
                (
                    1024 *
                    1024
                )
            ).toFixed(1) +
            " MB"
        );

    }


    function formatDate(
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


        return date.toLocaleDateString(
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


    function documentIcon(
        type,
        mime
    ) {

        if (
            String(
                mime
            ) ===
            "application/pdf"
        ) {

            return "📄";

        }


        if (
            String(
                mime
            ).startsWith(
                "image/"
            )
        ) {

            return "🖼️";

        }


        const map =
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
                "🗺️"
        };


        return map[type] ||
            "📎";

    }


    document.addEventListener(
        "click",
        function (
            event
        ) {

            if (
                event.target?.id ===
                "bookingDocumentsModal"
            ) {

                close();

            }

        }
    );


    document.addEventListener(
        "keydown",
        function (
            event
        ) {

            if (
                event.key ===
                "Escape" &&
                $("bookingDocumentsModal")
                    ?.classList
                    .contains(
                        "active"
                    )
            ) {

                close();

            }

        }
    );

    /* =========================================================
   DOCUMENT MANAGER V1.1
   ARCHIVED DOCUMENTS
   ========================================================= */


    /* ---------------------------------------------------------
       ENSURE ARCHIVED UI EXISTS
       --------------------------------------------------------- */

    function ensureArchivedDocumentsUI() {

        const modal =
            document.getElementById(
                "bookingDocumentsModal"
            );


        const activeList =
            document.getElementById(
                "bookingDocumentsList"
            );


        if (
            !modal ||
            !activeList
        ) {

            return;

        }


        /*
         * Prevent duplicate controls.
         */

        if (
            document.getElementById(
                "bookingDocumentsArchiveToolbar"
            )
        ) {

            return;

        }


        /* =====================================================
           ARCHIVE TOOLBAR
           ===================================================== */

        const toolbar =
            document.createElement(
                "div"
            );


        toolbar.id =
            "bookingDocumentsArchiveToolbar";


        toolbar.className =
            "bookingDocumentsArchiveToolbar";


        toolbar.innerHTML = `

        <div class="bookingDocumentsArchiveToolbarLeft">

            <div class="bookingDocumentsArchiveIcon">
                🗃
            </div>

            <div>

                <strong>
                    Archived Documents
                </strong>

                <small>
                    Restore or permanently remove documents that were previously archived.
                </small>

            </div>

        </div>


        <button
            type="button"
            id="bookingDocumentsArchiveToggle"
            class="bookingDocumentsArchiveToggle"
        >
            🗃 View Archived
        </button>

    `;


        activeList.insertAdjacentElement(
            "afterend",
            toolbar
        );


        /* =====================================================
           ARCHIVE PANEL
           ===================================================== */

        const archivePanel =
            document.createElement(
                "div"
            );


        archivePanel.id =
            "bookingDocumentsArchivePanel";


        archivePanel.className =
            "bookingDocumentsArchivePanel";


        archivePanel.hidden =
            true;


        archivePanel.innerHTML = `

        <div class="bookingDocumentsArchivePanelHeader">

            <div>

                <strong>
                    Archived Documents
                </strong>

                <small id="bookingDocumentsArchivedCount">
                    0 archived documents
                </small>

            </div>


            <button
                type="button"
                id="bookingDocumentsArchiveRefresh"
                class="bookingDocumentsArchiveRefresh"
            >
                ↻ Refresh
            </button>

        </div>


        <div
            id="bookingDocumentsArchivedLoading"
            class="bookingDocumentsArchivedLoading"
            hidden
        >
            Loading archived documents...
        </div>


        <div
            id="bookingDocumentsArchivedEmpty"
            class="bookingDocumentsArchivedEmpty"
            hidden
        >
            No archived documents for this booking.
        </div>


        <div
            id="bookingDocumentsArchivedList"
            class="bookingDocumentsArchivedList"
        ></div>

    `;


        toolbar.insertAdjacentElement(
            "afterend",
            archivePanel
        );


        /* =====================================================
           TOGGLE
           ===================================================== */

        const toggleButton =
            document.getElementById(
                "bookingDocumentsArchiveToggle"
            );


        if (toggleButton) {

            toggleButton.addEventListener(
                "click",
                toggleArchivedDocuments
            );

        }


        /* =====================================================
           REFRESH
           ===================================================== */

        const refreshButton =
            document.getElementById(
                "bookingDocumentsArchiveRefresh"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                loadArchivedDocuments
            );

        }


        /* =====================================================
           ARCHIVED DOCUMENT BUTTON EVENTS
           ===================================================== */

        const archivedList =
            document.getElementById(
                "bookingDocumentsArchivedList"
            );


        if (archivedList) {

            archivedList.addEventListener(
                "click",
                handleArchivedDocumentAction
            );

        }

    }



    /* ---------------------------------------------------------
       TOGGLE ARCHIVED PANEL
       --------------------------------------------------------- */

    async function toggleArchivedDocuments() {

        ensureArchivedDocumentsUI();


        const panel =
            document.getElementById(
                "bookingDocumentsArchivePanel"
            );


        const button =
            document.getElementById(
                "bookingDocumentsArchiveToggle"
            );


        if (!panel) {

            return;

        }


        const opening =
            panel.hidden;


        panel.hidden =
            !panel.hidden;


        if (button) {

            button.innerHTML =
                opening
                    ? "▲ Hide Archived"
                    : "🗃 View Archived";

        }


        if (opening) {

            await loadArchivedDocuments();

        }

    }



    /* ---------------------------------------------------------
       LOAD ARCHIVED DOCUMENTS
       --------------------------------------------------------- */

    async function loadArchivedDocuments() {

        ensureArchivedDocumentsUI();


        if (!currentRow) {

            return;

        }


        const currentBookingId =
            bookingId(
                currentRow
            );


        if (!currentBookingId) {

            return;

        }


        const loading =
            document.getElementById(
                "bookingDocumentsArchivedLoading"
            );


        const empty =
            document.getElementById(
                "bookingDocumentsArchivedEmpty"
            );


        const list =
            document.getElementById(
                "bookingDocumentsArchivedList"
            );


        if (loading) {

            loading.hidden =
                false;

        }


        if (empty) {

            empty.hidden =
                true;

        }


        if (list) {

            list.innerHTML =
                "";

        }


        try {

            const result =
                await callArchivedDocumentApi(
                    "getArchivedBookingDocuments",
                    {

                        env:
                            environment(),

                        bookingId:
                            currentBookingId

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
                    "Unable to load archived documents."
                );

            }


            archivedDocuments =
                Array.isArray(
                    result.documents
                )
                    ? result.documents
                    : [];


            renderArchivedDocuments();

        }

        catch (
        error
        ) {

            console.error(
                "[DOCUMENTS V1.1] Archived documents:",
                error
            );


            archivedDocuments =
                [];


            if (list) {

                list.innerHTML = `

                <div class="bookingDocumentsArchiveError">

                    Unable to load archived documents.

                    <small>
                        ${archiveEscapeHtml(
                    error.message ||
                    ""
                )}
                    </small>

                </div>

            `;

            }

        }

        finally {

            if (loading) {

                loading.hidden =
                    true;

            }

        }

    }



    /* ---------------------------------------------------------
       RENDER ARCHIVED DOCUMENTS
       --------------------------------------------------------- */

    function renderArchivedDocuments() {

        const list =
            document.getElementById(
                "bookingDocumentsArchivedList"
            );


        const empty =
            document.getElementById(
                "bookingDocumentsArchivedEmpty"
            );


        const count =
            document.getElementById(
                "bookingDocumentsArchivedCount"
            );


        if (count) {

            count.textContent =
                archivedDocuments.length +
                (
                    archivedDocuments.length ===
                        1
                        ? " archived document"
                        : " archived documents"
                );

        }


        if (!list) {

            return;

        }


        if (
            archivedDocuments.length ===
            0
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


        list.innerHTML =
            archivedDocuments
                .map(
                    function (
                        document
                    ) {

                        return renderArchivedDocumentCard(
                            document
                        );

                    }
                )
                .join(
                    ""
                );

    }



    /* ---------------------------------------------------------
       ARCHIVED DOCUMENT CARD
       --------------------------------------------------------- */

    function renderArchivedDocumentCard(
        document
    ) {

        const name =
            document.documentName ||
            document.documentType ||
            document.fileName ||
            "Document";


        const type =
            document.documentType ||
            "Document";


        const uploadedBy =
            document.uploadedBy ||
            "RanSan";


        const fileSize =
            formatArchivedDocumentBytes(
                document.fileSize
            );


        const archivedDate =
            formatArchivedDocumentDate(
                document.updatedAt
            );


        const isCustomerUpload =
            String(
                uploadedBy
            )
                .trim()
                .toUpperCase() ===
            "CUSTOMER PORTAL";


        return `

        <article
            class="bookingDocumentsArchivedCard"
            data-archived-document-id="${archiveEscapeHtml(
            document.documentId
        )}"
        >

            <div class="bookingDocumentsArchivedCardTop">

                <div class="bookingDocumentsArchivedFileIcon">

                    ${archivedDocumentIcon(
            document.mimeType
        )
            }

                </div>


                <div class="bookingDocumentsArchivedInfo">

                    <div class="bookingDocumentsArchivedName">

                        ${archiveEscapeHtml(
                name
            )}

                    </div>


                    <div class="bookingDocumentsArchivedMeta">

                        <span>
                            ${archiveEscapeHtml(
                type
            )}
                        </span>

                        ${fileSize
                ? `
                                    <span>
                                        ${archiveEscapeHtml(
                    fileSize
                )}
                                    </span>
                                `
                : ""
            }

                    </div>


                    <div class="bookingDocumentsArchivedBadges">

                        <span class="bookingDocumentsArchivedBadge">
                            ARCHIVED
                        </span>


                        ${isCustomerUpload
                ? `
                                    <span class="bookingDocumentsCustomerUploadBadge">
                                        CUSTOMER UPLOAD
                                    </span>
                                `
                : `
                                    <span class="bookingDocumentsRanSanUploadBadge">
                                        RANSAN DOCUMENT
                                    </span>
                                `
            }

                    </div>

                </div>

            </div>


            <div class="bookingDocumentsArchivedDetails">

                <span>
                    Uploaded by
                    <strong>
                        ${archiveEscapeHtml(
                uploadedBy
            )}
                    </strong>
                </span>


                ${archivedDate
                ? `
                            <span>
                                Archived
                                <strong>
                                    ${archiveEscapeHtml(
                    archivedDate
                )}
                                </strong>
                            </span>
                        `
                : ""
            }

            </div>


            <div class="bookingDocumentsArchivedActions">

                <button
                    type="button"
                    class="bookingDocumentsRestoreBtn"
                    data-archive-action="restore"
                    data-document-id="${archiveEscapeHtml(
                document.documentId
            )}"
                >
                    ↩ Restore
                </button>


                <button
                    type="button"
                    class="bookingDocumentsPermanentDeleteBtn"
                    data-archive-action="delete"
                    data-document-id="${archiveEscapeHtml(
                document.documentId
            )}"
                >
                    🗑 Delete Permanently
                </button>

            </div>

        </article>

    `;

    }



    /* ---------------------------------------------------------
       ARCHIVED BUTTON DELEGATION
       --------------------------------------------------------- */

    async function handleArchivedDocumentAction(
        event
    ) {

        const button =
            event.target.closest(
                "[data-archive-action]"
            );


        if (!button) {

            return;

        }


        const action =
            button.dataset.archiveAction;


        const documentId =
            button.dataset.documentId;


        if (!documentId) {

            return;

        }


        if (
            action ===
            "restore"
        ) {

            await restoreArchivedDocument(
                documentId,
                button
            );


            return;

        }


        if (
            action ===
            "delete"
        ) {

            await permanentlyDeleteArchivedDocument(
                documentId,
                button
            );

        }

    }



    /* ---------------------------------------------------------
       RESTORE DOCUMENT
       --------------------------------------------------------- */

    async function restoreArchivedDocument(
        documentId,
        button
    ) {

        if (!currentRow) {

            return;

        }


        const document =
            archivedDocuments.find(
                function (
                    item
                ) {

                    return (
                        String(
                            item.documentId
                        ) ===
                        String(
                            documentId
                        )
                    );

                }
            );


        const documentName =
            document
                ? (
                    document.documentName ||
                    document.documentType ||
                    document.fileName ||
                    "this document"
                )
                : "this document";


        const confirmed =
            window.confirm(
                "Restore \"" +
                documentName +
                "\"?\n\n" +
                "The document will return to Active Documents.\n\n" +
                "For security, it will be restored as Internal Only and will NOT automatically become visible to the customer."
            );


        if (!confirmed) {

            return;

        }


        const originalText =
            button
                ? button.innerHTML
                : "";


        if (button) {

            button.disabled =
                true;


            button.innerHTML =
                "Restoring...";

        }


        try {

            const result =
                await callArchivedDocumentApi(
                    "restoreBookingDocument",
                    {

                        env:
                            environment(),

                        bookingId:
                            bookingId(
                                currentRow
                            ),

                        documentId:
                            documentId

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
                    "Unable to restore document."
                );

            }


            await loadArchivedDocuments();


            /*
             * Existing active Documents Manager refresh.
             */

            await load();


            window.alert(
                "Document restored successfully.\n\n" +
                "It has been restored as Internal Only."
            );

        }

        catch (
        error
        ) {

            console.error(
                "[DOCUMENT RESTORE]",
                error
            );


            window.alert(
                error.message ||
                "Unable to restore document."
            );

        }

        finally {

            if (
                button &&
                document.body.contains(
                    button
                )
            ) {

                button.disabled =
                    false;


                button.innerHTML =
                    originalText ||
                    "↩ Restore";

            }

        }

    }



    /* ---------------------------------------------------------
       PERMANENT DELETE
       --------------------------------------------------------- */

    /* =========================================================
   PERMANENT DELETE
   MODERN CONFIRMATION MODAL
   ========================================================= */

    async function permanentlyDeleteArchivedDocument(
        documentId,
        button
    ) {

        if (!currentRow) {

            return;

        }


        const documentItem =
            archivedDocuments.find(
                function (
                    item
                ) {

                    return (
                        String(
                            item.documentId
                        ) ===
                        String(
                            documentId
                        )
                    );

                }
            );


        if (!documentItem) {

            console.error(
                "[PERMANENT DOCUMENT DELETE] Archived document not found:",
                documentId
            );


            return;

        }


        /*
         * Open the modern confirmation modal.
         *
         * Actual permanent deletion will happen only after
         * DELETE + Manager PIN have been entered.
         */

        openPermanentDeleteDocumentModal(
            documentItem,
            button
        );

    }

    /* =========================================================
       DOCUMENT PERMANENT DELETE MODAL
       RANSAN PREMIUM UI
       ========================================================= */


    /* ---------------------------------------------------------
       Modal state
       --------------------------------------------------------- */

    let permanentDeleteDocumentState =
    {
        document:
            null,

        sourceButton:
            null,

        deleting:
            false
    };


    /* ---------------------------------------------------------
       Ensure modal exists
       --------------------------------------------------------- */

    function ensurePermanentDeleteDocumentModal() {

        if (
            document.getElementById(
                "bookingDocumentPermanentDeleteModal"
            )
        ) {

            return;

        }


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "bookingDocumentPermanentDeleteModal";


        modal.className =
            "bookingDocumentDeleteModal";


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        modal.innerHTML = `

        <div
            class="bookingDocumentDeleteBackdrop"
            data-delete-modal-close
        ></div>


        <div
            class="bookingDocumentDeleteDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bookingDocumentDeleteTitle"
        >

            <!-- =============================================
                 HEADER
                 ============================================= -->

            <div class="bookingDocumentDeleteHeader">

                <div class="bookingDocumentDeleteHeaderLeft">

                    <div class="bookingDocumentDeleteWarningIcon">
                        !
                    </div>


                    <div>

                        <div class="bookingDocumentDeleteEyebrow">
                            SECURITY CONFIRMATION
                        </div>


                        <h3 id="bookingDocumentDeleteTitle">
                            Permanently Delete Document
                        </h3>

                    </div>

                </div>


                <button
                    type="button"
                    id="bookingDocumentDeleteClose"
                    class="bookingDocumentDeleteClose"
                    aria-label="Close permanent delete dialog"
                >
                    ×
                </button>

            </div>


            <!-- =============================================
                 BODY
                 ============================================= -->

            <div class="bookingDocumentDeleteBody">


                <!-- DOCUMENT -->

                <div class="bookingDocumentDeleteDocument">

                    <div class="bookingDocumentDeleteFileIcon">
                        📄
                    </div>


                    <div class="bookingDocumentDeleteDocumentCopy">

                        <strong
                            id="bookingDocumentDeleteName"
                        >
                            Document
                        </strong>


                        <span
                            id="bookingDocumentDeleteMeta"
                        >
                            Archived document
                        </span>


                        <small
                            id="bookingDocumentDeleteBooking"
                        ></small>

                    </div>

                </div>


                <!-- WARNING -->

                <div class="bookingDocumentDeleteDangerBox">

                    <div class="bookingDocumentDeleteDangerIcon">
                        ⚠
                    </div>


                    <div>

                        <strong>
                            This action cannot be undone
                        </strong>


                        <p>
                            The private Google Drive file will be
                            permanently removed. The audit metadata
                            will remain marked as DELETED.
                        </p>

                    </div>

                </div>


                <!-- CONFIRM TEXT -->

                <div class="bookingDocumentDeleteField">

                    <label
                        for="bookingDocumentDeleteConfirmation"
                    >
                        Type
                        <strong>DELETE</strong>
                        to confirm
                    </label>


                    <input
                        id="bookingDocumentDeleteConfirmation"
                        type="text"
                        autocomplete="off"
                        spellcheck="false"
                        placeholder="Type DELETE"
                    >


                    <small>
                        This confirmation is case-insensitive.
                    </small>

                </div>


                <!-- MANAGER PIN -->

                <div class="bookingDocumentDeleteField">

                    <label
                        for="bookingDocumentDeletePin"
                    >
                        Manager PIN
                    </label>


                    <div class="bookingDocumentDeletePinWrap">

                        <input
                            id="bookingDocumentDeletePin"
                            type="password"
                            inputmode="numeric"
                            autocomplete="off"
                            placeholder="Enter Manager PIN"
                        >


                        <button
                            type="button"
                            id="bookingDocumentDeletePinToggle"
                            class="bookingDocumentDeletePinToggle"
                            aria-label="Show Manager PIN"
                        >
                            👁
                        </button>

                    </div>


                    <small>
                        Manager authorization is required for permanent deletion.
                    </small>

                </div>


                <!-- ERROR -->

                <div
                    id="bookingDocumentDeleteError"
                    class="bookingDocumentDeleteError"
                    hidden
                ></div>


                <!-- STATUS -->

                <div
                    id="bookingDocumentDeleteStatus"
                    class="bookingDocumentDeleteStatus"
                    hidden
                >

                    <span class="bookingDocumentDeleteSpinner"></span>

                    <span>
                        Permanently deleting document...
                    </span>

                </div>

            </div>


            <!-- =============================================
                 FOOTER
                 ============================================= -->

            <div class="bookingDocumentDeleteFooter">

                <button
                    type="button"
                    id="bookingDocumentDeleteCancel"
                    class="bookingDocumentDeleteCancel"
                >
                    Cancel
                </button>


                <button
                    type="button"
                    id="bookingDocumentDeleteConfirm"
                    class="bookingDocumentDeleteConfirm"
                    disabled
                >
                    <span class="bookingDocumentDeleteBtnIcon">
                        🗑
                    </span>

                    <span
                        id="bookingDocumentDeleteConfirmLabel"
                    >
                        Delete Permanently
                    </span>
                </button>

            </div>

        </div>

    `;


        document.body.appendChild(
            modal
        );


        /* =====================================================
           ELEMENTS
           ===================================================== */

        const closeButton =
            document.getElementById(
                "bookingDocumentDeleteClose"
            );


        const cancelButton =
            document.getElementById(
                "bookingDocumentDeleteCancel"
            );


        const confirmButton =
            document.getElementById(
                "bookingDocumentDeleteConfirm"
            );


        const confirmationInput =
            document.getElementById(
                "bookingDocumentDeleteConfirmation"
            );


        const pinInput =
            document.getElementById(
                "bookingDocumentDeletePin"
            );


        const pinToggle =
            document.getElementById(
                "bookingDocumentDeletePinToggle"
            );


        /* =====================================================
           CLOSE
           ===================================================== */

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closePermanentDeleteDocumentModal
            );

        }


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closePermanentDeleteDocumentModal
            );

        }


        /*
         * Backdrop click.
         */

        modal.addEventListener(
            "click",
            function (
                event
            ) {

                if (
                    event.target.matches(
                        "[data-delete-modal-close]"
                    )
                ) {

                    closePermanentDeleteDocumentModal();

                }

            }
        );


        /* =====================================================
           VALIDATION
           ===================================================== */

        if (confirmationInput) {

            confirmationInput.addEventListener(
                "input",
                validatePermanentDeleteDocumentForm
            );

        }


        if (pinInput) {

            pinInput.addEventListener(
                "input",
                validatePermanentDeleteDocumentForm
            );


            pinInput.addEventListener(
                "keydown",
                function (
                    event
                ) {

                    /*
                     * Allow Enter to submit only when form
                     * is completely valid.
                     */

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        const deleteButton =
                            document.getElementById(
                                "bookingDocumentDeleteConfirm"
                            );


                        if (
                            deleteButton &&
                            !deleteButton.disabled
                        ) {

                            executePermanentDocumentDelete();

                        }

                    }

                }
            );

        }


        /* =====================================================
           PIN VISIBILITY
           ===================================================== */

        if (pinToggle) {

            pinToggle.addEventListener(
                "click",
                togglePermanentDeletePinVisibility
            );

        }


        /* =====================================================
           DELETE
           ===================================================== */

        if (confirmButton) {

            confirmButton.addEventListener(
                "click",
                executePermanentDocumentDelete
            );

        }


        /* =====================================================
           ESC
           ===================================================== */

        document.addEventListener(
            "keydown",
            handlePermanentDeleteModalKeydown
        );

    }



    /* ---------------------------------------------------------
       Open modal
       --------------------------------------------------------- */

    function openPermanentDeleteDocumentModal(
        documentItem,
        sourceButton
    ) {

        ensurePermanentDeleteDocumentModal();


        const modal =
            document.getElementById(
                "bookingDocumentPermanentDeleteModal"
            );


        if (!modal) {

            return;

        }


        permanentDeleteDocumentState.document =
            documentItem;


        permanentDeleteDocumentState.sourceButton =
            sourceButton ||
            null;


        permanentDeleteDocumentState.deleting =
            false;


        /* =====================================================
           DOCUMENT DETAILS
           ===================================================== */

        const nameElement =
            document.getElementById(
                "bookingDocumentDeleteName"
            );


        const metaElement =
            document.getElementById(
                "bookingDocumentDeleteMeta"
            );


        const bookingElement =
            document.getElementById(
                "bookingDocumentDeleteBooking"
            );


        const documentName =
            documentItem.documentName ||
            documentItem.documentType ||
            documentItem.fileName ||
            "Document";


        const documentType =
            documentItem.documentType ||
            "Document";


        const fileName =
            documentItem.fileName ||
            "";


        if (nameElement) {

            nameElement.textContent =
                documentName;

        }


        if (metaElement) {

            metaElement.textContent =
                fileName
                    ? documentType +
                    " • " +
                    fileName
                    : documentType;

        }


        if (bookingElement) {

            const currentBookingId =
                currentRow
                    ? bookingId(
                        currentRow
                    )
                    : documentItem.bookingId;


            bookingElement.textContent =
                currentBookingId
                    ? "Booking ID: " +
                    currentBookingId
                    : "";

        }


        /* =====================================================
           RESET INPUTS
           ===================================================== */

        const confirmationInput =
            document.getElementById(
                "bookingDocumentDeleteConfirmation"
            );


        const pinInput =
            document.getElementById(
                "bookingDocumentDeletePin"
            );


        const pinToggle =
            document.getElementById(
                "bookingDocumentDeletePinToggle"
            );


        if (confirmationInput) {

            confirmationInput.value =
                "";

        }


        if (pinInput) {

            pinInput.value =
                "";


            pinInput.type =
                "password";

        }


        if (pinToggle) {

            pinToggle.textContent =
                "👁";


            pinToggle.setAttribute(
                "aria-label",
                "Show Manager PIN"
            );

        }


        clearPermanentDeleteDocumentError();


        setPermanentDeleteDocumentLoading(
            false
        );


        validatePermanentDeleteDocumentForm();


        /* =====================================================
           OPEN
           ===================================================== */

        modal.classList.add(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "bookingDocumentDeleteOpen"
        );


        /*
         * Focus DELETE input.
         */

        window.setTimeout(
            function () {

                confirmationInput
                    ?.focus();

            },
            80
        );

    }



    /* ---------------------------------------------------------
       Close modal
       --------------------------------------------------------- */

    function closePermanentDeleteDocumentModal() {

        if (
            permanentDeleteDocumentState.deleting
        ) {

            /*
             * Do not allow closing while a destructive request
             * is actively running.
             */

            return;

        }


        const modal =
            document.getElementById(
                "bookingDocumentPermanentDeleteModal"
            );


        if (!modal) {

            return;

        }


        modal.classList.remove(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "bookingDocumentDeleteOpen"
        );


        permanentDeleteDocumentState.document =
            null;


        permanentDeleteDocumentState.sourceButton =
            null;


        clearPermanentDeleteDocumentError();

    }



    /* ---------------------------------------------------------
       Validate fields
       --------------------------------------------------------- */

    function validatePermanentDeleteDocumentForm() {

        const confirmationInput =
            document.getElementById(
                "bookingDocumentDeleteConfirmation"
            );


        const pinInput =
            document.getElementById(
                "bookingDocumentDeletePin"
            );


        const confirmButton =
            document.getElementById(
                "bookingDocumentDeleteConfirm"
            );


        if (
            !confirmationInput ||
            !pinInput ||
            !confirmButton
        ) {

            return false;

        }


        const confirmationValid =
            String(
                confirmationInput.value ||
                ""
            )
                .trim()
                .toUpperCase() ===
            "DELETE";


        const pinValid =
            String(
                pinInput.value ||
                ""
            ).trim().length >
            0;


        const valid =
            confirmationValid &&
            pinValid &&
            !permanentDeleteDocumentState.deleting;


        confirmButton.disabled =
            !valid;


        confirmationInput.classList.toggle(
            "valid",
            confirmationValid
        );


        confirmationInput.classList.toggle(
            "invalid",
            Boolean(
                confirmationInput.value
            ) &&
            !confirmationValid
        );


        return valid;

    }



    /* ---------------------------------------------------------
       Execute permanent deletion
       --------------------------------------------------------- */

    async function executePermanentDocumentDelete() {

        if (
            permanentDeleteDocumentState.deleting
        ) {

            return;

        }


        const documentItem =
            permanentDeleteDocumentState.document;


        if (
            !documentItem ||
            !currentRow
        ) {

            showPermanentDeleteDocumentError(
                "Document information is no longer available. Close this window and try again."
            );


            return;

        }


        if (
            !validatePermanentDeleteDocumentForm()
        ) {

            return;

        }


        const confirmationInput =
            document.getElementById(
                "bookingDocumentDeleteConfirmation"
            );


        const pinInput =
            document.getElementById(
                "bookingDocumentDeletePin"
            );


        const managerPin =
            String(
                pinInput?.value ||
                ""
            ).trim();


        const documentId =
            String(
                documentItem.documentId ||
                ""
            ).trim();


        if (!documentId) {

            showPermanentDeleteDocumentError(
                "Document ID is missing."
            );


            return;

        }


        permanentDeleteDocumentState.deleting =
            true;


        clearPermanentDeleteDocumentError();


        setPermanentDeleteDocumentLoading(
            true
        );


        validatePermanentDeleteDocumentForm();


        try {

            const result =
                await callArchivedDocumentApi(
                    "permanentlyDeleteBookingDocument",
                    {

                        env:
                            environment(),

                        bookingId:
                            bookingId(
                                currentRow
                            ),

                        documentId:
                            documentId,

                        confirmation:
                            "DELETE",

                        managerPin:
                            managerPin

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
                    "Unable to permanently delete document."
                );

            }


            /* =================================================
               REMOVE FROM LOCAL STATE
               ================================================= */

            archivedDocuments =
                archivedDocuments.filter(
                    function (
                        item
                    ) {

                        return (
                            String(
                                item.documentId
                            ) !==
                            documentId
                        );

                    }
                );


            renderArchivedDocuments();


            /*
             * Refresh from backend to ensure state is exact.
             */

            await loadArchivedDocuments();


            /* =================================================
               SUCCESS UI
               ================================================= */

            showPermanentDeleteDocumentSuccess(
                documentItem
            );

        }

        catch (
        error
        ) {

            console.error(
                "[PERMANENT DOCUMENT DELETE]",
                error
            );


            permanentDeleteDocumentState.deleting =
                false;


            setPermanentDeleteDocumentLoading(
                false
            );


            validatePermanentDeleteDocumentForm();


            showPermanentDeleteDocumentError(
                error.message ||
                "Unable to permanently delete document."
            );

        }

    }



    /* ---------------------------------------------------------
       Loading state
       --------------------------------------------------------- */

    function setPermanentDeleteDocumentLoading(
        loading
    ) {

        const confirmButton =
            document.getElementById(
                "bookingDocumentDeleteConfirm"
            );


        const cancelButton =
            document.getElementById(
                "bookingDocumentDeleteCancel"
            );


        const closeButton =
            document.getElementById(
                "bookingDocumentDeleteClose"
            );


        const confirmationInput =
            document.getElementById(
                "bookingDocumentDeleteConfirmation"
            );


        const pinInput =
            document.getElementById(
                "bookingDocumentDeletePin"
            );


        const status =
            document.getElementById(
                "bookingDocumentDeleteStatus"
            );


        const label =
            document.getElementById(
                "bookingDocumentDeleteConfirmLabel"
            );


        if (confirmButton) {

            confirmButton.disabled =
                loading;


            confirmButton.classList.toggle(
                "loading",
                loading
            );

        }


        if (cancelButton) {

            cancelButton.disabled =
                loading;

        }


        if (closeButton) {

            closeButton.disabled =
                loading;

        }


        if (confirmationInput) {

            confirmationInput.disabled =
                loading;

        }


        if (pinInput) {

            pinInput.disabled =
                loading;

        }


        if (status) {

            status.hidden =
                !loading;

        }


        if (label) {

            label.textContent =
                loading
                    ? "Deleting..."
                    : "Delete Permanently";

        }

    }



    /* ---------------------------------------------------------
       Error
       --------------------------------------------------------- */

    function showPermanentDeleteDocumentError(
        message
    ) {

        const element =
            document.getElementById(
                "bookingDocumentDeleteError"
            );


        if (!element) {

            return;

        }


        element.hidden =
            false;


        element.textContent =
            message ||
            "Unable to permanently delete document.";

    }



    /* ---------------------------------------------------------
       Clear error
       --------------------------------------------------------- */

    function clearPermanentDeleteDocumentError() {

        const element =
            document.getElementById(
                "bookingDocumentDeleteError"
            );


        if (!element) {

            return;

        }


        element.hidden =
            true;


        element.textContent =
            "";

    }



    /* ---------------------------------------------------------
       Success
       --------------------------------------------------------- */

    function showPermanentDeleteDocumentSuccess(
        documentItem
    ) {

        const modal =
            document.getElementById(
                "bookingDocumentPermanentDeleteModal"
            );


        const dialog =
            modal?.querySelector(
                ".bookingDocumentDeleteDialog"
            );


        if (
            !modal ||
            !dialog
        ) {

            permanentDeleteDocumentState.deleting =
                false;


            closePermanentDeleteDocumentModal();


            return;

        }


        const documentName =
            documentItem.documentName ||
            documentItem.documentType ||
            documentItem.fileName ||
            "Document";


        dialog.innerHTML = `

        <div class="bookingDocumentDeleteSuccess">

            <div class="bookingDocumentDeleteSuccessIcon">
                ✓
            </div>


            <h3>
                Document Deleted
            </h3>


            <p>
                <strong>
                    ${archiveEscapeHtml(
            documentName
        )}
                </strong>
                was permanently removed from private storage.
            </p>


            <small>
                The audit record remains available in RanSan with status DELETED.
            </small>


            <button
                type="button"
                id="bookingDocumentDeleteSuccessClose"
                class="bookingDocumentDeleteSuccessClose"
            >
                Done
            </button>

        </div>

    `;


        permanentDeleteDocumentState.deleting =
            false;


        const doneButton =
            document.getElementById(
                "bookingDocumentDeleteSuccessClose"
            );


        if (doneButton) {

            doneButton.addEventListener(
                "click",
                function () {

                    /*
                     * Remove this modal completely because its
                     * dialog HTML was replaced by the success state.
                     *
                     * ensurePermanentDeleteDocumentModal() will
                     * rebuild it next time.
                     */

                    modal.remove();


                    document.body.classList.remove(
                        "bookingDocumentDeleteOpen"
                    );


                    permanentDeleteDocumentState.document =
                        null;


                    permanentDeleteDocumentState.sourceButton =
                        null;

                }
            );

        }

    }



    /* ---------------------------------------------------------
       PIN visibility
       --------------------------------------------------------- */

    function togglePermanentDeletePinVisibility() {

        const pinInput =
            document.getElementById(
                "bookingDocumentDeletePin"
            );


        const button =
            document.getElementById(
                "bookingDocumentDeletePinToggle"
            );


        if (
            !pinInput ||
            !button
        ) {

            return;

        }


        const showing =
            pinInput.type ===
            "text";


        pinInput.type =
            showing
                ? "password"
                : "text";


        button.textContent =
            showing
                ? "👁"
                : "🙈";


        button.setAttribute(
            "aria-label",
            showing
                ? "Show Manager PIN"
                : "Hide Manager PIN"
        );


        pinInput.focus();

    }



    /* ---------------------------------------------------------
       Escape key
       --------------------------------------------------------- */

    function handlePermanentDeleteModalKeydown(
        event
    ) {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        const modal =
            document.getElementById(
                "bookingDocumentPermanentDeleteModal"
            );


        if (
            !modal ||
            !modal.classList.contains(
                "active"
            )
        ) {

            return;

        }


        closePermanentDeleteDocumentModal();

    }


    /* ---------------------------------------------------------
       API CALL
       --------------------------------------------------------- */

    async function callArchivedDocumentApi(
        action,
        payload
    ) {

        const apiUrl =
            getApiUrl();


        if (!apiUrl) {

            throw new Error(
                "Dashboard API URL is not configured."
            );

        }


        const request =
            Object.assign(
                {},
                payload || {},
                {
                    action:
                        action
                }
            );


        const response =
            await fetch(
                apiUrl,
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
                            request
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
        parseError
        ) {

            console.error(
                "[DOCUMENTS V1.1] Invalid response:",
                text
            );


            throw new Error(
                "Invalid response from document server."
            );

        }


        return result;

    }



    /* ---------------------------------------------------------
       ARCHIVED DOCUMENT ICON
       --------------------------------------------------------- */

    function archivedDocumentIcon(
        mimeType
    ) {

        mimeType =
            String(
                mimeType ||
                ""
            )
                .toLowerCase();


        if (
            mimeType ===
            "application/pdf"
        ) {

            return "📄";

        }


        if (
            mimeType.indexOf(
                "image/"
            ) ===
            0
        ) {

            return "🖼";

        }


        return "📁";

    }



    /* ---------------------------------------------------------
       FILE SIZE
       --------------------------------------------------------- */

    function formatArchivedDocumentBytes(
        bytes
    ) {

        bytes =
            Number(
                bytes ||
                0
            );


        if (
            !bytes ||
            bytes < 0
        ) {

            return "";

        }


        if (
            bytes <
            1024
        ) {

            return (
                bytes +
                " B"
            );

        }


        if (
            bytes <
            1024 * 1024
        ) {

            return (
                (
                    bytes /
                    1024
                ).toFixed(
                    1
                ) +
                " KB"
            );

        }


        return (
            (
                bytes /
                (
                    1024 *
                    1024
                )
            ).toFixed(
                2
            ) +
            " MB"
        );

    }



    /* ---------------------------------------------------------
       DATE
       --------------------------------------------------------- */

    function formatArchivedDocumentDate(
        value
    ) {

        if (!value) {

            return "";

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


        return date.toLocaleString(
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



    /* ---------------------------------------------------------
       HTML ESCAPE
       --------------------------------------------------------- */

    function archiveEscapeHtml(
        value
    ) {

        return String(
            value ===
                null ||
                value ===
                undefined
                ? ""
                : value
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



    /* ---------------------------------------------------------
       INITIALIZE ARCHIVED UI
       --------------------------------------------------------- */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            ensureArchivedDocumentsUI
        );

    }

    else {

        ensureArchivedDocumentsUI();

    }

    window.RanSanDocuments =
    {
        open:
            open,

        close:
            close,

        refresh:
            load,

        upload:
            upload,

        view:
            view,

        toggleVisibility:
            toggleVisibility,

        archive:
            archive
    };


})();