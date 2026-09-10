/* =========================================================
   RANSAN TRAVELS
   BOOKING COST & ACTUAL PROFIT V1
   ========================================================= */

(function () {

    "use strict";


    let currentBooking =
        null;


    let summary =
        null;


    let vendors =
        [];


    let editingCostId =
        "";


    let archiveCostId =
        "";


    /* =====================================================
       OPEN
       ===================================================== */

    async function open(
        booking
    ) {

        if (!booking) {

            return;

        }


        currentBooking =
            booking;


        ensureModal();


        const modal =
            document.getElementById(
                "bookingCostModal"
            );


        modal?.classList.add(
            "active"
        );


        document.body.classList.add(
            "bookingCostOpen"
        );


        await Promise.all([

            loadSummary(),

            loadVendors()

        ]);

    }



    /* =====================================================
       CLOSE
       ===================================================== */

    function close() {

        document
            .getElementById(
                "bookingCostModal"
            )
            ?.classList.remove(
                "active"
            );


        document.body.classList.remove(
            "bookingCostOpen"
        );


        closeForm();


        closeArchiveConfirm();


        currentBooking =
            null;


        summary =
            null;

    }



    /* =====================================================
       BOOKING ID
       ===================================================== */

    function getBookingId() {

        return String(

            currentBooking?.["Booking ID"] ||

            currentBooking?.bookingId ||

            currentBooking?.BookingID ||

            ""

        ).trim();

    }



    /* =====================================================
       ENVIRONMENT
       ===================================================== */

    function environment() {

        return String(

            window.DASHBOARD_ENV ||

            sessionStorage.getItem(
                "portalEnvironment"
            ) ||

            sessionStorage.getItem(
                "env"
            ) ||

            "LIVE"

        ).toUpperCase();

    }



    /* =====================================================
       API
       ===================================================== */

    async function api(
        action,
        data
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
                            Object.assign(
                                {},
                                data || {},
                                {
                                    action:
                                        action
                                }
                            )
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
                "[BOOKING COST] Invalid response:",
                text
            );


            throw new Error(
                "Booking cost server returned invalid data."
            );

        }

    }



    /* =====================================================
       BUILD MODAL
       ===================================================== */

    function ensureModal() {

        if (
            document.getElementById(
                "bookingCostModal"
            )
        ) {

            return;

        }


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "bookingCostModal";


        modal.className =
            "bookingCostModal";


        modal.innerHTML = `

            <div
                class="bookingCostBackdrop"
                data-booking-cost-close
            ></div>


            <section class="bookingCostWindow">


                <!-- HEADER -->

                <header class="bookingCostHeader">

                    <div>

                        <div class="bookingCostEyebrow">
                            COMMERCIAL INTELLIGENCE
                        </div>

                        <h2>
                            Booking Cost & Profit
                        </h2>

                        <p>
                            Track supplier costs and actual booking profitability.
                        </p>

                    </div>


                    <button
                        type="button"
                        id="bookingCostClose"
                        class="bookingCostClose"
                    >
                        ×
                    </button>

                </header>


                <!-- CONTEXT -->

                <div class="bookingCostContext">

                    <div>

                        <span>
                            Booking
                        </span>

                        <strong id="bookingCostBookingId">
                            —
                        </strong>

                    </div>


                    <div>

                        <span>
                            Customer
                        </span>

                        <strong id="bookingCostCustomer">
                            —
                        </strong>

                    </div>


                    <div>

                        <span>
                            Service
                        </span>

                        <strong id="bookingCostService">
                            —
                        </strong>

                    </div>

                </div>


                <!-- KPI -->

                <div class="bookingProfitKpis">

                    <div class="bookingProfitKpi selling">

                        <span>
                            Selling Amount
                        </span>

                        <strong id="bookingSellingAmount">
                            ₹0
                        </strong>

                        <small>
                            Existing booking revenue
                        </small>

                    </div>


                    <div class="bookingProfitKpi cost">

                        <span>
                            Actual Cost
                        </span>

                        <strong id="bookingActualCost">
                            ₹0
                        </strong>

                        <small>
                            Total active cost entries
                        </small>

                    </div>


                    <div
                        id="bookingProfitKpi"
                        class="bookingProfitKpi profit"
                    >

                        <span>
                            Actual Profit
                        </span>

                        <strong id="bookingActualProfit">
                            ₹0
                        </strong>

                        <small id="bookingProfitState">
                            —
                        </small>

                    </div>


                    <div
                        id="bookingMarginKpi"
                        class="bookingProfitKpi margin"
                    >

                        <span>
                            Profit Margin
                        </span>

                        <strong id="bookingProfitMargin">
                            0.00%
                        </strong>

                        <small>
                            Profit ÷ selling amount
                        </small>

                    </div>

                </div>


                <!-- SECONDARY SUMMARY -->

                <div class="bookingCostPaymentSummary">

                    <div>
                        <span>
                            Supplier Cost Paid
                        </span>

                        <strong id="bookingCostPaid">
                            ₹0
                        </strong>
                    </div>


                    <div>
                        <span>
                            Supplier Cost Pending
                        </span>

                        <strong id="bookingCostPending">
                            ₹0
                        </strong>
                    </div>

                </div>


                <!-- TOOLBAR -->

                <div class="bookingCostToolbar">

                    <div>

                        <strong>
                            Cost Breakdown
                        </strong>

                        <span id="bookingCostCount">
                            0 entries
                        </span>

                    </div>


                    <div class="bookingCostToolbarActions">

                        <button
                            type="button"
                            id="bookingCostRefresh"
                            class="bookingCostSecondaryBtn"
                        >
                            ↻ Refresh
                        </button>


                        <button
                            type="button"
                            id="bookingCostAdd"
                            class="bookingCostPrimaryBtn"
                        >
                            ＋ Add Cost
                        </button>

                    </div>

                </div>


                <!-- LIST -->

                <div class="bookingCostBody">

                    <div
                        id="bookingCostLoading"
                        class="bookingCostLoading"
                    >
                        Loading booking profitability...
                    </div>


                    <div
                        id="bookingCostEmpty"
                        class="bookingCostEmpty"
                        hidden
                    >

                        <div>
                            ₹
                        </div>

                        <strong>
                            No actual costs recorded
                        </strong>

                        <span>
                            Add supplier, hotel, transport or other booking costs.
                        </span>

                    </div>


                    <div
                        id="bookingCostList"
                        class="bookingCostList"
                    ></div>

                </div>


                <!-- COST FORM -->

                <div
                    id="bookingCostFormOverlay"
                    class="bookingCostFormOverlay"
                >

                    <div class="bookingCostForm">

                        <header>

                            <div>

                                <div class="bookingCostEyebrow">
                                    COST ENTRY
                                </div>

                                <h3 id="bookingCostFormTitle">
                                    Add Booking Cost
                                </h3>

                            </div>


                            <button
                                type="button"
                                id="bookingCostFormClose"
                                class="bookingCostClose"
                            >
                                ×
                            </button>

                        </header>


                        <div class="bookingCostFormBody">


                            <label class="bookingCostField">

                                <span>
                                    Cost Category *
                                </span>


                                <select id="bookingCostCategory">

                                    <option value="">
                                        Select category
                                    </option>

                                    <option>Air / Ticket Cost</option>
                                    <option>Train Cost</option>
                                    <option>Bus Cost</option>
                                    <option>Hotel</option>
                                    <option>Cab / Transport</option>
                                    <option>DMC / Package</option>
                                    <option>Transfer</option>
                                    <option>Sightseeing / Activity</option>
                                    <option>Guide</option>
                                    <option>Visa</option>
                                    <option>Insurance</option>
                                    <option>Service Fee</option>
                                    <option>Other</option>

                                </select>

                            </label>


                            <label class="bookingCostField">

                                <span>
                                    Vendor / Supplier
                                </span>


                                <select id="bookingCostVendor">

                                    <option value="">
                                        No linked vendor
                                    </option>

                                </select>

                            </label>


                            <label class="bookingCostField">

                                <span>
                                    Cost Description
                                </span>


                                <input
                                    id="bookingCostDescription"
                                    type="text"
                                    placeholder="Example: 3 nights hotel net rate"
                                >

                            </label>


                            <div class="bookingCostFormGrid">


                                <label class="bookingCostField">

                                    <span>
                                        Actual Cost Amount *
                                    </span>


                                    <div class="bookingCostMoneyInput">

                                        <i>
                                            ₹
                                        </i>

                                        <input
                                            id="bookingCostAmount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                        >

                                    </div>

                                </label>


                                <label class="bookingCostField">

                                    <span>
                                        Supplier Payment
                                    </span>


                                    <select id="bookingCostPaymentStatus">

                                        <option value="PENDING">
                                            Pending
                                        </option>

                                        <option value="PART PAID">
                                            Part Paid
                                        </option>

                                        <option value="PAID">
                                            Paid
                                        </option>

                                        <option value="NOT APPLICABLE">
                                            Not Applicable
                                        </option>

                                    </select>

                                </label>

                            </div>


                            <label class="bookingCostField">

                                <span>
                                    Supplier Reference
                                </span>


                                <input
                                    id="bookingCostReference"
                                    type="text"
                                    placeholder="Voucher / invoice / confirmation reference"
                                >

                            </label>


                            <div
                                id="bookingCostFormError"
                                class="bookingCostFormError"
                                hidden
                            ></div>

                        </div>


                        <footer>

                            <button
                                type="button"
                                id="bookingCostCancel"
                                class="bookingCostSecondaryBtn"
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                id="bookingCostSave"
                                class="bookingCostPrimaryBtn"
                            >
                                Save Cost
                            </button>

                        </footer>

                    </div>

                </div>


                <!-- ARCHIVE CONFIRM -->

                <div
                    id="bookingCostArchiveConfirm"
                    class="bookingCostArchiveConfirm"
                >

                    <div class="bookingCostArchiveDialog">

                        <div class="bookingCostArchiveIcon">
                            🗃
                        </div>


                        <h3>
                            Archive Cost Entry?
                        </h3>


                        <p>
                            The cost will stop affecting actual profit,
                            but its historical record will remain preserved.
                        </p>


                        <div class="bookingCostArchiveActions">

                            <button
                                type="button"
                                id="bookingCostArchiveCancel"
                                class="bookingCostSecondaryBtn"
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                id="bookingCostArchiveConfirmBtn"
                                class="bookingCostArchiveBtn"
                            >
                                Archive Cost
                            </button>

                        </div>

                    </div>

                </div>


            </section>

        `;


        document.body.appendChild(
            modal
        );


        bindEvents();

    }



    /* =====================================================
       EVENTS
       ===================================================== */

    function bindEvents() {

        document
            .getElementById(
                "bookingCostClose"
            )
            ?.addEventListener(
                "click",
                close
            );


        document
            .querySelector(
                "#bookingCostModal [data-booking-cost-close]"
            )
            ?.addEventListener(
                "click",
                close
            );


        document
            .getElementById(
                "bookingCostRefresh"
            )
            ?.addEventListener(
                "click",
                loadSummary
            );


        document
            .getElementById(
                "bookingCostAdd"
            )
            ?.addEventListener(
                "click",
                function () {

                    openForm();

                }
            );


        document
            .getElementById(
                "bookingCostFormClose"
            )
            ?.addEventListener(
                "click",
                closeForm
            );


        document
            .getElementById(
                "bookingCostCancel"
            )
            ?.addEventListener(
                "click",
                closeForm
            );


        document
            .getElementById(
                "bookingCostSave"
            )
            ?.addEventListener(
                "click",
                saveCost
            );


        document
            .getElementById(
                "bookingCostList"
            )
            ?.addEventListener(
                "click",
                handleListAction
            );


        document
            .getElementById(
                "bookingCostArchiveCancel"
            )
            ?.addEventListener(
                "click",
                closeArchiveConfirm
            );


        document
            .getElementById(
                "bookingCostArchiveConfirmBtn"
            )
            ?.addEventListener(
                "click",
                executeArchiveCost
            );

    }



    /* =====================================================
       LOAD SUMMARY
       ===================================================== */

    async function loadSummary() {

        const bookingId =
            getBookingId();


        if (!bookingId) {

            return;

        }


        const loading =
            document.getElementById(
                "bookingCostLoading"
            );


        if (loading) {

            loading.hidden =
                false;

        }


        try {

            const result =
                await api(
                    "getBookingCostSummary",
                    {

                        env:
                            environment(),

                        bookingId:
                            bookingId

                    }
                );


            if (
                !result ||
                result.success !==
                    true
            ) {

                throw new Error(
                    result?.error ||
                    "Unable to load booking costs."
                );

            }


            summary =
                result;


            renderSummary();


            renderCosts();

        }

        catch (
            error
        ) {

            console.error(
                "[BOOKING COST]",
                error
            );


            costToast(
                error.message,
                "error"
            );

        }

        finally {

            if (loading) {

                loading.hidden =
                    true;

            }

        }

    }



    /* =====================================================
       LOAD VENDORS
       ===================================================== */

    async function loadVendors() {

        try {

            const result =
                await api(
                    "getVendors",
                    {

                        env:
                            environment(),

                        includeArchived:
                            false

                    }
                );


            vendors =
                result?.success &&
                Array.isArray(
                    result.vendors
                )
                    ? result.vendors
                    : [];


            renderVendorOptions();

        }

        catch (
            error
        ) {

            /*
             * Vendor dropdown is optional.
             * Cost management still works without it.
             */

            vendors =
                [];

        }

    }



    /* =====================================================
       SUMMARY
       ===================================================== */

    function renderSummary() {

        if (!summary) {

            return;

        }


        setText(
            "bookingCostBookingId",
            summary.bookingId ||
            "—"
        );


        setText(
            "bookingCostCustomer",
            summary.customer ||
            "—"
        );


        setText(
            "bookingCostService",
            summary.service ||
            "—"
        );


        setText(
            "bookingSellingAmount",
            money(
                summary.sellingAmount
            )
        );


        setText(
            "bookingActualCost",
            money(
                summary.totalCost
            )
        );


        setText(
            "bookingCostPaid",
            money(
                summary.paidCost
            )
        );


        setText(
            "bookingCostPending",
            money(
                summary.pendingCost
            )
        );


        setText(
            "bookingActualProfit",
            money(
                summary.actualProfit
            )
        );


        setText(
            "bookingProfitMargin",
            Number(
                summary.marginPercent ||
                0
            ).toFixed(
                2
            ) +
            "%"
        );


        const profitKpi =
            document.getElementById(
                "bookingProfitKpi"
            );


        const marginKpi =
            document.getElementById(
                "bookingMarginKpi"
            );


        profitKpi?.classList.toggle(
            "negative",
            Number(
                summary.actualProfit
            ) < 0
        );


        marginKpi?.classList.toggle(
            "negative",
            Number(
                summary.marginPercent
            ) < 0
        );


        let state =
            "Healthy margin";


        if (
            Number(
                summary.actualProfit
            ) < 0
        ) {

            state =
                "Booking is currently at a loss";

        }

        else if (
            Number(
                summary.marginPercent
            ) < 10
        ) {

            state =
                "Low margin";

        }


        setText(
            "bookingProfitState",
            state
        );

    }



    /* =====================================================
       COST LIST
       ===================================================== */

    function renderCosts() {

        const list =
            document.getElementById(
                "bookingCostList"
            );


        const empty =
            document.getElementById(
                "bookingCostEmpty"
            );


        const costs =
            Array.isArray(
                summary?.costs
            )
                ? summary.costs
                : [];


        setText(
            "bookingCostCount",
            costs.length +
            (
                costs.length ===
                1
                    ? " entry"
                    : " entries"
            )
        );


        if (!costs.length) {

            if (list) {

                list.innerHTML =
                    "";

            }


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
            costs
                .map(
                    renderCostCard
                )
                .join(
                    ""
                );

    }



    function renderCostCard(
        item
    ) {

        return `

            <article class="bookingCostCard">

                <div class="bookingCostCardIcon">
                    ${costIcon(
                        item.category
                    )}
                </div>


                <div class="bookingCostCardMain">

                    <div class="bookingCostCardTop">

                        <div>

                            <strong>
                                ${escapeHtml(
                                    item.category
                                )}
                            </strong>

                            ${
                                item.vendorName
                                    ? `
                                        <span>
                                            ${escapeHtml(
                                                item.vendorName
                                            )}
                                        </span>
                                    `
                                    : ""
                            }

                        </div>


                        <strong class="bookingCostCardAmount">
                            ${money(
                                item.amount
                            )}
                        </strong>

                    </div>


                    ${
                        item.description
                            ? `
                                <p>
                                    ${escapeHtml(
                                        item.description
                                    )}
                                </p>
                            `
                            : ""
                    }


                    <div class="bookingCostCardMeta">

                        <span
                            class="
                                bookingCostPaymentBadge
                                ${paymentClass(
                                    item.paymentStatus
                                )}
                            "
                        >
                            ${escapeHtml(
                                item.paymentStatus
                            )}
                        </span>


                        ${
                            item.reference
                                ? `
                                    <span>
                                        Ref:
                                        ${escapeHtml(
                                            item.reference
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>


                    <div class="bookingCostCardActions">

                        <button
                            type="button"
                            data-cost-action="edit"
                            data-cost-id="${escapeHtml(
                                item.costId
                            )}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="bookingCostArchiveLink"
                            data-cost-action="archive"
                            data-cost-id="${escapeHtml(
                                item.costId
                            )}"
                        >
                            Archive
                        </button>

                    </div>

                </div>

            </article>

        `;

    }



    /* =====================================================
       LIST ACTION
       ===================================================== */

    function handleListAction(
        event
    ) {

        const button =
            event.target.closest(
                "[data-cost-action]"
            );


        if (!button) {

            return;

        }


        const item =
            summary?.costs?.find(
                cost =>
                    String(
                        cost.costId
                    ) ===
                    String(
                        button.dataset.costId
                    )
            );


        if (!item) {

            return;

        }


        if (
            button.dataset.costAction ===
            "edit"
        ) {

            openForm(
                item
            );


            return;

        }


        if (
            button.dataset.costAction ===
            "archive"
        ) {

            openArchiveConfirm(
                item.costId
            );

        }

    }



    /* =====================================================
       FORM
       ===================================================== */

    function openForm(
        item
    ) {

        editingCostId =
            item?.costId ||
            "";


        setText(
            "bookingCostFormTitle",
            editingCostId
                ? "Edit Booking Cost"
                : "Add Booking Cost"
        );


        setValue(
            "bookingCostCategory",
            item?.category
        );


        setValue(
            "bookingCostDescription",
            item?.description
        );


        setValue(
            "bookingCostAmount",
            item?.amount
        );


        setValue(
            "bookingCostPaymentStatus",
            item?.paymentStatus ||
            "PENDING"
        );


        setValue(
            "bookingCostReference",
            item?.reference
        );


        renderVendorOptions(
            item?.vendorId
        );


        hideFormError();


        document
            .getElementById(
                "bookingCostFormOverlay"
            )
            ?.classList.add(
                "active"
            );

    }



    function closeForm() {

        document
            .getElementById(
                "bookingCostFormOverlay"
            )
            ?.classList.remove(
                "active"
            );


        editingCostId =
            "";


        hideFormError();

    }



    /* =====================================================
       SAVE
       ===================================================== */

    async function saveCost() {

        const category =
            value(
                "bookingCostCategory"
            );


        const amount =
            Number(
                value(
                    "bookingCostAmount"
                )
            );


        if (!category) {

            showFormError(
                "Please select a cost category."
            );


            return;

        }


        if (
            !Number.isFinite(
                amount
            ) ||
            amount < 0
        ) {

            showFormError(
                "Please enter a valid cost amount."
            );


            return;

        }


        const vendorSelect =
            document.getElementById(
                "bookingCostVendor"
            );


        const vendor =
            vendors.find(
                item =>
                    item.vendorId ===
                    vendorSelect?.value
            );


        const button =
            document.getElementById(
                "bookingCostSave"
            );


        hideFormError();


        if (button) {

            button.disabled =
                true;


            button.textContent =
                "Saving...";

        }


        try {

            const result =
                await api(
                    "saveBookingCost",
                    {

                        env:
                            environment(),

                        bookingId:
                            getBookingId(),

                        costId:
                            editingCostId,

                        vendorId:
                            vendor?.vendorId ||
                            "",

                        vendorName:
                            vendor?.vendorName ||
                            "",

                        category:
                            category,

                        description:
                            value(
                                "bookingCostDescription"
                            ),

                        amount:
                            amount,

                        paymentStatus:
                            value(
                                "bookingCostPaymentStatus"
                            ),

                        reference:
                            value(
                                "bookingCostReference"
                            )

                    }
                );


            if (
                !result?.success
            ) {

                throw new Error(
                    result?.error ||
                    "Unable to save booking cost."
                );

            }


            closeForm();


            costToast(
                result.message,
                "success"
            );


            await loadSummary();

        }

        catch (
            error
        ) {

            showFormError(
                error.message
            );

        }

        finally {

            if (button) {

                button.disabled =
                    false;


                button.textContent =
                    "Save Cost";

            }

        }

    }



    /* =====================================================
       ARCHIVE CONFIRM
       No native browser confirm.
       ===================================================== */

    function openArchiveConfirm(
        costId
    ) {

        archiveCostId =
            costId;


        document
            .getElementById(
                "bookingCostArchiveConfirm"
            )
            ?.classList.add(
                "active"
            );

    }



    function closeArchiveConfirm() {

        archiveCostId =
            "";


        document
            .getElementById(
                "bookingCostArchiveConfirm"
            )
            ?.classList.remove(
                "active"
            );

    }



    async function executeArchiveCost() {

        if (!archiveCostId) {

            return;

        }


        const button =
            document.getElementById(
                "bookingCostArchiveConfirmBtn"
            );


        if (button) {

            button.disabled =
                true;


            button.textContent =
                "Archiving...";

        }


        try {

            const result =
                await api(
                    "archiveBookingCost",
                    {

                        env:
                            environment(),

                        bookingId:
                            getBookingId(),

                        costId:
                            archiveCostId

                    }
                );


            if (
                !result?.success
            ) {

                throw new Error(
                    result?.error ||
                    "Unable to archive cost."
                );

            }


            closeArchiveConfirm();


            costToast(
                "Cost entry archived.",
                "success"
            );


            await loadSummary();

        }

        catch (
            error
        ) {

            costToast(
                error.message,
                "error"
            );

        }

        finally {

            if (button) {

                button.disabled =
                    false;


                button.textContent =
                    "Archive Cost";

            }

        }

    }



    /* =====================================================
       VENDORS
       ===================================================== */

    function renderVendorOptions(
        selectedId
    ) {

        const select =
            document.getElementById(
                "bookingCostVendor"
            );


        if (!select) {

            return;

        }


        select.innerHTML =
            `
                <option value="">
                    No linked vendor
                </option>
            ` +
            vendors.map(
                vendor => `

                    <option
                        value="${escapeHtml(
                            vendor.vendorId
                        )}"
                        ${
                            vendor.vendorId ===
                            selectedId
                                ? "selected"
                                : ""
                        }
                    >
                        ${escapeHtml(
                            vendor.vendorName
                        )}
                        — ${escapeHtml(
                            vendor.category
                        )}
                    </option>

                `
            ).join("");

    }



    /* =====================================================
       HELPERS
       ===================================================== */

    function costIcon(
        category
    ) {

        const text =
            String(
                category ||
                ""
            ).toLowerCase();


        if (
            text.includes(
                "hotel"
            )
        ) {

            return "🏨";

        }


        if (
            text.includes(
                "transport"
            ) ||
            text.includes(
                "transfer"
            )
        ) {

            return "🚖";

        }


        if (
            text.includes(
                "air"
            )
        ) {

            return "✈";

        }


        if (
            text.includes(
                "train"
            )
        ) {

            return "🚆";

        }


        if (
            text.includes(
                "bus"
            )
        ) {

            return "🚌";

        }


        if (
            text.includes(
                "visa"
            )
        ) {

            return "🛂";

        }


        if (
            text.includes(
                "insurance"
            )
        ) {

            return "🛡";

        }


        return "₹";

    }



    function paymentClass(
        status
    ) {

        status =
            String(
                status ||
                ""
            ).toUpperCase();


        if (
            status ===
            "PAID"
        ) {

            return "paid";

        }


        if (
            status ===
            "PART PAID"
        ) {

            return "partial";

        }


        return "pending";

    }



    function money(
        number
    ) {

        return new Intl.NumberFormat(
            "en-IN",
            {

                style:
                    "currency",

                currency:
                    "INR",

                maximumFractionDigits:
                    2

            }
        ).format(
            Number(
                number ||
                0
            )
        );

    }



    function value(
        id
    ) {

        return String(
            document
                .getElementById(
                    id
                )
                ?.value ||
            ""
        ).trim();

    }



    function setValue(
        id,
        value
    ) {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            element.value =
                value ??
                "";

        }

    }



    function setText(
        id,
        value
    ) {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            element.textContent =
                value ??
                "";

        }

    }



    function showFormError(
        message
    ) {

        const element =
            document.getElementById(
                "bookingCostFormError"
            );


        if (!element) {

            return;

        }


        element.hidden =
            false;


        element.textContent =
            message;

    }



    function hideFormError() {

        const element =
            document.getElementById(
                "bookingCostFormError"
            );


        if (!element) {

            return;

        }


        element.hidden =
            true;


        element.textContent =
            "";

    }



    function costToast(
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
            "[BOOKING COST]",
            message
        );

    }



    function escapeHtml(
        value
    ) {

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
       PUBLIC
       ===================================================== */

    window.RanSanBookingCost =
    {

        open:
            open,

        close:
            close,

        refresh:
            loadSummary

    };


})();