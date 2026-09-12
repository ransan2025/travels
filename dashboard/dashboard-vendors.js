/* =========================================================
   RANSAN TRAVELS
   VENDOR CENTER V1
   ========================================================= */

(function () {

    "use strict";


    let vendors =
        [];


    let editingVendorId =
        "";


    let includeArchived =
        false;


    /* =====================================================
       ENVIRONMENT
       ===================================================== */

    function vendorEnvironment() {

        if (
            typeof DASHBOARD_ENV !==
            "undefined" &&
            DASHBOARD_ENV
        ) {

            return String(
                DASHBOARD_ENV
            ).toUpperCase();

        }


        return (
            sessionStorage.getItem(
                "portalEnvironment"
            ) ||
            "LIVE"
        ).toUpperCase();

    }



    /* =====================================================
       API
       ===================================================== */

    async function vendorApi(
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
                "[VENDOR CENTER] Invalid response:",
                text
            );


            throw new Error(
                "Vendor server returned invalid data."
            );

        }


        return result;

    }



    /* =====================================================
       OPEN
       ===================================================== */

    async function open() {

        ensureModal();


        const modal =
            document.getElementById(
                "vendorCenterModal"
            );


        if (!modal) {

            return;

        }


        modal.classList.add(
            "active"
        );


        document.body.classList.add(
            "vendorCenterOpen"
        );


        await load();

    }



    /* =====================================================
       CLOSE
       ===================================================== */

    function close() {

        const modal =
            document.getElementById(
                "vendorCenterModal"
            );


        if (modal) {

            modal.classList.remove(
                "active"
            );

        }


        document.body.classList.remove(
            "vendorCenterOpen"
        );


        closeForm();

    }



    /* =====================================================
       CREATE MODAL
       ===================================================== */

    function ensureModal() {

        if (
            document.getElementById(
                "vendorCenterModal"
            )
        ) {

            return;

        }


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "vendorCenterModal";


        modal.className =
            "vendorCenterModal";


        modal.innerHTML = `

            <div
                class="vendorCenterBackdrop"
                data-vendor-close
            ></div>


            <section class="vendorCenterWindow">

                <!-- HEADER -->

                <header class="vendorCenterHeader">

                    <div>

                        <div class="vendorCenterEyebrow">
                            SUPPLIER NETWORK
                        </div>

                        <h2>
                            Vendor Center
                        </h2>

                        <p>
                            Manage hotels, cab operators, DMCs,
                            package suppliers and travel partners.
                        </p>

                    </div>


                    <div class="vendorCenterHeaderActions">

                        <button
                            type="button"
                            id="vendorAddBtn"
                            class="vendorPrimaryBtn"
                        >
                            ＋ Add Vendor
                        </button>


                        <button
                            type="button"
                            id="vendorCenterClose"
                            class="vendorCloseBtn"
                        >
                            ×
                        </button>

                    </div>

                </header>


                <!-- KPI -->

                <div class="vendorStats">

                    <div class="vendorStat">
                        <span>Active Vendors</span>
                        <strong id="vendorActiveCount">0</strong>
                    </div>

                    <div class="vendorStat">
                        <span>Preferred</span>
                        <strong id="vendorPreferredCount">0</strong>
                    </div>

                    <div class="vendorStat">
                        <span>Hotels</span>
                        <strong id="vendorHotelCount">0</strong>
                    </div>

                    <div class="vendorStat">
                        <span>Transport</span>
                        <strong id="vendorTransportCount">0</strong>
                    </div>

                </div>


                <!-- TOOLBAR -->

                <div class="vendorToolbar">

                    <div class="vendorSearchWrap">

                        <span>
                            ⌕
                        </span>

                        <input
                            id="vendorSearch"
                            type="search"
                            placeholder="Search vendor, city, destination, contact..."
                            autocomplete="off"
                        >

                    </div>


                    <select id="vendorCategoryFilter">

                        <option value="">
                            All Categories
                        </option>

                        <option value="Hotel">
                            Hotel
                        </option>

                        <option value="Cab / Transport">
                            Cab / Transport
                        </option>

                        <option value="DMC / Package Supplier">
                            DMC / Package Supplier
                        </option>

                        <option value="Tour Operator">
                            Tour Operator
                        </option>

                        <option value="Transfer">
                            Transfer
                        </option>

                        <option value="Guide">
                            Guide
                        </option>

                        <option value="Visa Partner">
                            Visa Partner
                        </option>

                        <option value="Insurance Partner">
                            Insurance Partner
                        </option>

                        <option value="Flight Supplier">
                            Flight Supplier
                        </option>

                        <option value="Train Supplier">
                            Train Supplier
                        </option>

                        <option value="Bus Supplier">
                            Bus Supplier
                        </option>

                        <option value="Other">
                            Other
                        </option>

                    </select>


                    <label class="vendorArchivedToggle">

                        <input
                            id="vendorIncludeArchived"
                            type="checkbox"
                        >

                        <span>
                            Show Archived
                        </span>

                    </label>


                    <button
                        type="button"
                        id="vendorRefreshBtn"
                        class="vendorRefreshBtn"
                    >
                        ↻ Refresh
                    </button>

                </div>


                <!-- BODY -->

                <div class="vendorCenterBody">

                    <div
                        id="vendorLoading"
                        class="vendorLoading"
                    >
                        Loading supplier network...
                    </div>


                    <div
                        id="vendorEmpty"
                        class="vendorEmpty"
                        hidden
                    >
                        <div>🤝</div>

                        <strong>
                            No vendors found
                        </strong>

                        <span>
                            Add your first hotel, cab operator or
                            package supplier.
                        </span>
                    </div>


                    <div
                        id="vendorGrid"
                        class="vendorGrid"
                    ></div>

                </div>

            </section>


            <!-- FORM -->

            <div
                id="vendorFormOverlay"
                class="vendorFormOverlay"
            >

                <div class="vendorFormPanel">

                    <header class="vendorFormHeader">

                        <div>

                            <div class="vendorCenterEyebrow">
                                SUPPLIER PROFILE
                            </div>

                            <h3 id="vendorFormTitle">
                                Add Vendor
                            </h3>

                        </div>


                        <button
                            type="button"
                            id="vendorFormClose"
                            class="vendorCloseBtn"
                        >
                            ×
                        </button>

                    </header>


                    <div class="vendorFormBody">


                        <div class="vendorFormSectionTitle">
                            Basic Information
                        </div>


                        <div class="vendorFormGrid">

                            <label class="vendorField vendorFieldWide">

                                <span>
                                    Vendor / Company Name *
                                </span>

                                <input
                                    id="vendorName"
                                    type="text"
                                    placeholder="Example: Taj Hotels / ABC Cabs"
                                >

                            </label>


                            <label class="vendorField">

                                <span>
                                    Category *
                                </span>

                                <select id="vendorCategory">

                                    <option value="">
                                        Select category
                                    </option>

                                    <option value="Hotel">
                                        Hotel
                                    </option>

                                    <option value="Cab / Transport">
                                        Cab / Transport
                                    </option>

                                    <option value="DMC / Package Supplier">
                                        DMC / Package Supplier
                                    </option>

                                    <option value="Tour Operator">
                                        Tour Operator
                                    </option>

                                    <option value="Transfer">
                                        Transfer
                                    </option>

                                    <option value="Guide">
                                        Guide
                                    </option>

                                    <option value="Visa Partner">
                                        Visa Partner
                                    </option>

                                    <option value="Insurance Partner">
                                        Insurance Partner
                                    </option>

                                    <option value="Flight Supplier">
                                        Flight Supplier
                                    </option>

                                    <option value="Train Supplier">
                                        Train Supplier
                                    </option>

                                    <option value="Bus Supplier">
                                        Bus Supplier
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </label>


                            <label class="vendorField">

                                <span>
                                    Contact Person
                                </span>

                                <input
                                    id="vendorContactPerson"
                                    type="text"
                                    placeholder="Sales / reservation contact"
                                >

                            </label>

                        </div>


                        <div class="vendorFormSectionTitle">
                            Contact
                        </div>


                        <div class="vendorFormGrid">

                            <label class="vendorField">

                                <span>
                                    Phone
                                </span>

                                <input
                                    id="vendorPhone"
                                    type="tel"
                                    placeholder="+91..."
                                >

                            </label>


                            <label class="vendorField">

                                <span>
                                    WhatsApp
                                </span>

                                <input
                                    id="vendorWhatsapp"
                                    type="tel"
                                    placeholder="+91..."
                                >

                            </label>


                            <label class="vendorField vendorFieldWide">

                                <span>
                                    Email
                                </span>

                                <input
                                    id="vendorEmail"
                                    type="email"
                                    placeholder="reservations@example.com"
                                >

                            </label>

                        </div>


                        <div class="vendorFormSectionTitle">
                            Location & Coverage
                        </div>


                        <div class="vendorFormGrid vendorFormGrid3">

                            <label class="vendorField">

                                <span>City</span>

                                <input
                                    id="vendorCity"
                                    type="text"
                                    placeholder="Dubai"
                                >

                            </label>


                            <label class="vendorField">

                                <span>State</span>

                                <input
                                    id="vendorState"
                                    type="text"
                                    placeholder="Maharashtra"
                                >

                            </label>


                            <label class="vendorField">

                                <span>Country</span>

                                <input
                                    id="vendorCountry"
                                    type="text"
                                    placeholder="India"
                                >

                            </label>

                        </div>


                        <label class="vendorField">

                            <span>
                                Destinations / Areas Served
                            </span>

                            <input
                                id="vendorDestinations"
                                type="text"
                                placeholder="Dubai, Abu Dhabi, Sharjah"
                            >

                        </label>


                        <label class="vendorField">

                            <span>
                                Services
                            </span>

                            <textarea
                                id="vendorServices"
                                rows="3"
                                placeholder="Hotel rooms, airport transfer, sightseeing, sedan, SUV..."
                            ></textarea>

                        </label>


                        <div class="vendorFormSectionTitle">
                            Commercial Details
                        </div>


                        <label class="vendorField">

                            <span>
                                Rate / Contract Notes
                            </span>

                            <textarea
                                id="vendorRateNotes"
                                rows="3"
                                placeholder="Net rates, seasonal rates, markup agreement..."
                            ></textarea>

                        </label>


                        <div class="vendorFormGrid">

                            <label class="vendorField">

                                <span>
                                    Payment Terms
                                </span>

                                <input
                                    id="vendorPaymentTerms"
                                    type="text"
                                    placeholder="Advance / 7 days / 30 days"
                                >

                            </label>


                            <label class="vendorField">

                                <span>
                                    GSTIN
                                </span>

                                <input
                                    id="vendorGstin"
                                    type="text"
                                    placeholder="GST number"
                                >

                            </label>

                        </div>


                        <label class="vendorPreferredField">

                            <input
                                id="vendorPreferred"
                                type="checkbox"
                            >

                            <span>

                                <strong>
                                    Preferred Vendor
                                </strong>

                                <small>
                                    Show this supplier first in the vendor directory.
                                </small>

                            </span>

                        </label>


                        <label class="vendorField">

                            <span>
                                Internal Notes
                            </span>

                            <textarea
                                id="vendorNotes"
                                rows="3"
                                placeholder="Internal supplier notes..."
                            ></textarea>

                        </label>


                        <div
                            id="vendorFormError"
                            class="vendorFormError"
                            hidden
                        ></div>

                    </div>


                    <footer class="vendorFormFooter">

                        <button
                            type="button"
                            id="vendorCancelBtn"
                            class="vendorSecondaryBtn"
                        >
                            Cancel
                        </button>


                        <button
                            type="button"
                            id="vendorSaveBtn"
                            class="vendorPrimaryBtn"
                        >
                            Save Vendor
                        </button>

                    </footer>

                </div>

            </div>

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
                "vendorCenterClose"
            )
            ?.addEventListener(
                "click",
                close
            );


        document
            .querySelector(
                "#vendorCenterModal [data-vendor-close]"
            )
            ?.addEventListener(
                "click",
                close
            );


        document
            .getElementById(
                "vendorAddBtn"
            )
            ?.addEventListener(
                "click",
                function () {

                    openForm();

                }
            );


        document
            .getElementById(
                "vendorRefreshBtn"
            )
            ?.addEventListener(
                "click",
                load
            );


        document
            .getElementById(
                "vendorSearch"
            )
            ?.addEventListener(
                "input",
                render
            );


        document
            .getElementById(
                "vendorCategoryFilter"
            )
            ?.addEventListener(
                "change",
                render
            );


        document
            .getElementById(
                "vendorIncludeArchived"
            )
            ?.addEventListener(
                "change",
                function (
                    event
                ) {

                    includeArchived =
                        Boolean(
                            event.target.checked
                        );


                    load();

                }
            );


        document
            .getElementById(
                "vendorFormClose"
            )
            ?.addEventListener(
                "click",
                closeForm
            );


        document
            .getElementById(
                "vendorCancelBtn"
            )
            ?.addEventListener(
                "click",
                closeForm
            );


        document
            .getElementById(
                "vendorSaveBtn"
            )
            ?.addEventListener(
                "click",
                save
            );


        document
            .getElementById(
                "vendorGrid"
            )
            ?.addEventListener(
                "click",
                handleGridAction
            );


        document.addEventListener(
            "keydown",
            function (
                event
            ) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    const form =
                        document.getElementById(
                            "vendorFormOverlay"
                        );


                    if (
                        form &&
                        form.classList.contains(
                            "active"
                        )
                    ) {

                        closeForm();

                        return;

                    }


                    close();

                }

            }
        );

    }



    /* =====================================================
       LOAD
       ===================================================== */

    async function load() {

        const loading =
            document.getElementById(
                "vendorLoading"
            );


        const grid =
            document.getElementById(
                "vendorGrid"
            );


        if (loading) {

            loading.hidden =
                false;

        }


        if (grid) {

            grid.innerHTML =
                "";

        }


        try {

            const result =
                await vendorApi(
                    "getVendors",
                    {

                        env:
                            vendorEnvironment(),

                        includeArchived:
                            includeArchived

                    }
                );


            if (
                !result ||
                result.success !==
                    true
            ) {

                throw new Error(
                    result?.error ||
                    "Unable to load vendors."
                );

            }


            vendors =
                Array.isArray(
                    result.vendors
                )
                    ? result.vendors
                    : [];


            updateStats();

            render();

        }

        catch (
            error
        ) {

            console.error(
                "[VENDOR CENTER]",
                error
            );


            if (grid) {

                grid.innerHTML = `

                    <div class="vendorLoadError">

                        Unable to load vendor directory.

                        <small>
                            ${escapeHtml(
                                error.message
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



    /* =====================================================
       STATS
       ===================================================== */

    function updateStats() {

        const active =
            vendors.filter(
                vendor =>
                    String(
                        vendor.status
                    ).toUpperCase() ===
                    "ACTIVE"
            );


        setText(
            "vendorActiveCount",
            active.length
        );


        setText(
            "vendorPreferredCount",
            active.filter(
                vendor =>
                    vendor.preferred
            ).length
        );


        setText(
            "vendorHotelCount",
            active.filter(
                vendor =>
                    vendor.category ===
                    "Hotel"
            ).length
        );


        setText(
            "vendorTransportCount",
            active.filter(
                vendor =>
                    vendor.category ===
                    "Cab / Transport" ||
                    vendor.category ===
                    "Transfer"
            ).length
        );

    }



    /* =====================================================
       RENDER
       ===================================================== */

    function render() {

        const grid =
            document.getElementById(
                "vendorGrid"
            );


        const empty =
            document.getElementById(
                "vendorEmpty"
            );


        if (!grid) {

            return;

        }


        const search =
            String(
                document
                    .getElementById(
                        "vendorSearch"
                    )
                    ?.value ||
                ""
            )
                .trim()
                .toLowerCase();


        const category =
            String(
                document
                    .getElementById(
                        "vendorCategoryFilter"
                    )
                    ?.value ||
                ""
            );


        const filtered =
            vendors.filter(
                function (
                    vendor
                ) {

                    if (
                        category &&
                        vendor.category !==
                            category
                    ) {

                        return false;

                    }


                    if (!search) {

                        return true;

                    }


                    const haystack =
                        [

                            vendor.vendorName,

                            vendor.category,

                            vendor.contactPerson,

                            vendor.phone,

                            vendor.whatsapp,

                            vendor.email,

                            vendor.city,

                            vendor.state,

                            vendor.country,

                            vendor.destinations,

                            vendor.services

                        ]
                            .join(
                                " "
                            )
                            .toLowerCase();


                    return haystack.includes(
                        search
                    );

                }
            );


        if (
            !filtered.length
        ) {

            grid.innerHTML =
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


        grid.innerHTML =
            filtered
                .map(
                    renderCard
                )
                .join(
                    ""
                );

    }



    /* =====================================================
       CARD
       ===================================================== */

    function renderCard(
        vendor
    ) {

        const archived =
            String(
                vendor.status ||
                ""
            ).toUpperCase() ===
            "ARCHIVED";


        const location =
            [
                vendor.city,
                vendor.state,
                vendor.country
            ]
                .filter(
                    Boolean
                )
                .join(
                    ", "
                );


        return `

            <article
                class="
                    vendorCard
                    ${
                        archived
                            ? "archived"
                            : ""
                    }
                "
            >

                <div class="vendorCardHeader">

                    <div class="vendorAvatar">

                        ${categoryIcon(
                            vendor.category
                        )}

                    </div>


                    <div class="vendorCardTitle">

                        <div>

                            <strong>
                                ${escapeHtml(
                                    vendor.vendorName
                                )}
                            </strong>


                            ${
                                vendor.preferred
                                    ? `
                                        <span class="vendorPreferredBadge">
                                            ★ PREFERRED
                                        </span>
                                    `
                                    : ""
                            }

                        </div>


                        <span>
                            ${escapeHtml(
                                vendor.category
                            )}
                        </span>

                    </div>


                    <span
                        class="
                            vendorStatus
                            ${
                                archived
                                    ? "archived"
                                    : "active"
                            }
                        "
                    >

                        ${
                            archived
                                ? "ARCHIVED"
                                : "ACTIVE"
                        }

                    </span>

                </div>


                <div class="vendorCardDetails">

                    ${
                        location
                            ? `
                                <div>
                                    <span>Location</span>
                                    <strong>
                                        ${escapeHtml(
                                            location
                                        )}
                                    </strong>
                                </div>
                            `
                            : ""
                    }


                    ${
                        vendor.contactPerson
                            ? `
                                <div>
                                    <span>Contact</span>
                                    <strong>
                                        ${escapeHtml(
                                            vendor.contactPerson
                                        )}
                                    </strong>
                                </div>
                            `
                            : ""
                    }


                    ${
                        vendor.destinations
                            ? `
                                <div class="wide">
                                    <span>Coverage</span>
                                    <strong>
                                        ${escapeHtml(
                                            vendor.destinations
                                        )}
                                    </strong>
                                </div>
                            `
                            : ""
                    }

                </div>


                ${
                    vendor.services
                        ? `
                            <div class="vendorServices">
                                ${escapeHtml(
                                    vendor.services
                                )}
                            </div>
                        `
                        : ""
                }


                <div class="vendorContactRow">

                    ${
                        vendor.phone
                            ? `
                                <a
                                    href="tel:${escapeAttribute(
                                        vendor.phone
                                    )}"
                                >
                                    ☎ Call
                                </a>
                            `
                            : ""
                    }


                    ${
                        vendor.whatsapp
                            ? `
                                <button
                                    type="button"
                                    data-vendor-action="whatsapp"
                                    data-vendor-id="${escapeAttribute(
                                        vendor.vendorId
                                    )}"
                                >
                                    ◉ WhatsApp
                                </button>
                            `
                            : ""
                    }


                    ${
                        vendor.email
                            ? `
                                <a
                                    href="mailto:${escapeAttribute(
                                        vendor.email
                                    )}"
                                >
                                    ✉ Email
                                </a>
                            `
                            : ""
                    }

                </div>


                <div class="vendorCardActions">

                    ${
                        archived
    ? `

        <button
            type="button"
            class="vendorRestoreBtn"
            data-vendor-action="restore"
            data-vendor-id="${escapeAttribute(
                vendor.vendorId
            )}"
        >
            ↩ Restore
        </button>


        <button
            type="button"
            class="vendorPermanentDeleteBtn"
            data-vendor-action="delete"
            data-vendor-id="${escapeAttribute(
                vendor.vendorId
            )}"
        >
            🗑 Delete Permanently
        </button>

    `
                            : `

                                <button
                                    type="button"
                                    data-vendor-action="edit"
                                    data-vendor-id="${escapeAttribute(
                                        vendor.vendorId
                                    )}"
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    class="vendorArchiveBtn"
                                    data-vendor-action="archive"
                                    data-vendor-id="${escapeAttribute(
                                        vendor.vendorId
                                    )}"
                                >
                                    Archive
                                </button>

                            `
                    }

                </div>

            </article>

        `;

    }



    /* =====================================================
       GRID ACTIONS
       ===================================================== */

    async function handleGridAction(
        event
    ) {

        const button =
            event.target.closest(
                "[data-vendor-action]"
            );


        if (!button) {

            return;

        }


        const vendorId =
            button.dataset.vendorId;


        const action =
            button.dataset.vendorAction;


        const vendor =
            vendors.find(
                item =>
                    item.vendorId ===
                    vendorId
            );


        if (!vendor) {

            return;

        }


        if (
            action ===
            "edit"
        ) {

            openForm(
                vendor
            );

            return;

        }


        if (
            action ===
            "archive"
        ) {

            await changeStatus(
                vendor,
                "archiveVendor"
            );

            return;

        }


        if (
            action ===
            "restore"
        ) {

            await changeStatus(
                vendor,
                "restoreVendor"
            );

            return;

        }

        if (
    action ===
    "delete"
) {

    openPermanentVendorDeleteModal(
        vendor
    );

    return;

}


        if (
            action ===
            "whatsapp"
        ) {

            openWhatsapp(
                vendor
            );

        }

    }



    /* =====================================================
       FORM
       ===================================================== */

    function openForm(
        vendor
    ) {

        const overlay =
            document.getElementById(
                "vendorFormOverlay"
            );


        if (!overlay) {

            return;

        }


        editingVendorId =
            vendor?.vendorId ||
            "";


        setText(
            "vendorFormTitle",
            editingVendorId
                ? "Edit Vendor"
                : "Add Vendor"
        );


        setValue(
            "vendorName",
            vendor?.vendorName
        );


        setValue(
            "vendorCategory",
            vendor?.category
        );


        setValue(
            "vendorContactPerson",
            vendor?.contactPerson
        );


        setValue(
            "vendorPhone",
            vendor?.phone
        );


        setValue(
            "vendorWhatsapp",
            vendor?.whatsapp
        );


        setValue(
            "vendorEmail",
            vendor?.email
        );


        setValue(
            "vendorCity",
            vendor?.city
        );


        setValue(
            "vendorState",
            vendor?.state
        );


        setValue(
            "vendorCountry",
            vendor?.country
        );


        setValue(
            "vendorDestinations",
            vendor?.destinations
        );


        setValue(
            "vendorServices",
            vendor?.services
        );


        setValue(
            "vendorRateNotes",
            vendor?.rateNotes
        );


        setValue(
            "vendorPaymentTerms",
            vendor?.paymentTerms
        );


        setValue(
            "vendorGstin",
            vendor?.gstin
        );


        setValue(
            "vendorNotes",
            vendor?.notes
        );


        const preferred =
            document.getElementById(
                "vendorPreferred"
            );


        if (preferred) {

            preferred.checked =
                Boolean(
                    vendor?.preferred
                );

        }


        hideFormError();


        overlay.classList.add(
            "active"
        );


        setTimeout(
            function () {

                document
                    .getElementById(
                        "vendorName"
                    )
                    ?.focus();

            },
            50
        );

    }



    function closeForm() {

        document
            .getElementById(
                "vendorFormOverlay"
            )
            ?.classList.remove(
                "active"
            );


        editingVendorId =
            "";


        hideFormError();

    }



    /* =====================================================
       SAVE
       ===================================================== */

    async function save() {

        const saveButton =
            document.getElementById(
                "vendorSaveBtn"
            );


        const payload =
        {

            env:
                vendorEnvironment(),

            vendorId:
                editingVendorId,

            vendorName:
                value(
                    "vendorName"
                ),

            category:
                value(
                    "vendorCategory"
                ),

            contactPerson:
                value(
                    "vendorContactPerson"
                ),

            phone:
                value(
                    "vendorPhone"
                ),

            whatsapp:
                value(
                    "vendorWhatsapp"
                ),

            email:
                value(
                    "vendorEmail"
                ),

            city:
                value(
                    "vendorCity"
                ),

            state:
                value(
                    "vendorState"
                ),

            country:
                value(
                    "vendorCountry"
                ),

            destinations:
                value(
                    "vendorDestinations"
                ),

            services:
                value(
                    "vendorServices"
                ),

            rateNotes:
                value(
                    "vendorRateNotes"
                ),

            paymentTerms:
                value(
                    "vendorPaymentTerms"
                ),

            gstin:
                value(
                    "vendorGstin"
                ),

            preferred:
                Boolean(
                    document
                        .getElementById(
                            "vendorPreferred"
                        )
                        ?.checked
                ),

            notes:
                value(
                    "vendorNotes"
                )

        };


        if (!payload.vendorName) {

            showFormError(
                "Vendor name is required."
            );

            return;

        }


        if (!payload.category) {

            showFormError(
                "Please select a vendor category."
            );

            return;

        }


        hideFormError();


        if (saveButton) {

            saveButton.disabled =
                true;


            saveButton.textContent =
                editingVendorId
                    ? "Saving Changes..."
                    : "Adding Vendor...";

        }


        try {

            const result =
                await vendorApi(
                    "saveVendor",
                    payload
                );


            if (
                !result ||
                result.success !==
                    true
            ) {

                throw new Error(
                    result?.error ||
                    "Unable to save vendor."
                );

            }


            closeForm();


            vendorToast(
                result.message ||
                "Vendor saved successfully.",
                "success"
            );


            await load();

        }

        catch (
            error
        ) {

            showFormError(
                error.message
            );

        }

        finally {

            if (saveButton) {

                saveButton.disabled =
                    false;


                saveButton.textContent =
                    "Save Vendor";

            }

        }

    }



    /* =====================================================
       ARCHIVE / RESTORE
       ===================================================== */

    /* =====================================================
   ARCHIVE / RESTORE
   MODERN CONFIRMATION MODAL
   ===================================================== */

async function changeStatus(
    vendor,
    action
) {

    if (!vendor) {

        return;

    }


    if (
        action !==
            "archiveVendor" &&
        action !==
            "restoreVendor"
    ) {

        console.error(
            "[VENDOR CENTER] Invalid status action:",
            action
        );


        return;

    }


    openVendorStatusModal(
        vendor,
        action
    );

}

/* =========================================================
   VENDOR ARCHIVE / RESTORE MODAL
   RANSAN PREMIUM UI
   ========================================================= */


let vendorStatusModalState =
{
    vendor:
        null,

    action:
        "",

    processing:
        false
};



/* ---------------------------------------------------------
   Ensure Modal Exists
   --------------------------------------------------------- */

function ensureVendorStatusModal() {

    if (
        document.getElementById(
            "vendorStatusActionModal"
        )
    ) {

        return;

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "vendorStatusActionModal";


    modal.className =
        "vendorStatusActionModal";


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    modal.innerHTML = `

        <div
            class="vendorStatusActionBackdrop"
            data-vendor-status-close
        ></div>


        <div
            class="vendorStatusActionDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vendorStatusActionTitle"
        >

            <!-- =============================================
                 HEADER
                 ============================================= -->

            <div class="vendorStatusActionHeader">

                <div class="vendorStatusActionHeaderLeft">

                    <div
                        id="vendorStatusActionIcon"
                        class="vendorStatusActionIcon"
                    >
                        🗃
                    </div>


                    <div>

                        <div
                            id="vendorStatusActionEyebrow"
                            class="vendorStatusActionEyebrow"
                        >
                            VENDOR MANAGEMENT
                        </div>


                        <h3
                            id="vendorStatusActionTitle"
                        >
                            Archive Vendor
                        </h3>

                    </div>

                </div>


                <button
                    type="button"
                    id="vendorStatusActionClose"
                    class="vendorStatusActionClose"
                    aria-label="Close vendor action"
                >
                    ×
                </button>

            </div>


            <!-- =============================================
                 BODY
                 ============================================= -->

            <div class="vendorStatusActionBody">


                <!-- VENDOR -->

                <div class="vendorStatusActionVendor">

                    <div
                        id="vendorStatusVendorIcon"
                        class="vendorStatusActionVendorIcon"
                    >
                        🤝
                    </div>


                    <div class="vendorStatusActionVendorCopy">

                        <strong
                            id="vendorStatusVendorName"
                        >
                            Vendor
                        </strong>


                        <span
                            id="vendorStatusVendorCategory"
                        >
                            Supplier
                        </span>


                        <small
                            id="vendorStatusVendorId"
                        ></small>

                    </div>

                </div>


                <!-- INFORMATION -->

                <div
                    id="vendorStatusActionInfo"
                    class="vendorStatusActionInfo"
                >

                    <div
                        id="vendorStatusActionInfoIcon"
                        class="vendorStatusActionInfoIcon"
                    >
                        i
                    </div>


                    <div>

                        <strong
                            id="vendorStatusActionInfoTitle"
                        >
                            Vendor record will be preserved
                        </strong>


                        <p
                            id="vendorStatusActionInfoText"
                        >
                            This supplier will be removed from the
                            active directory but can be restored later.
                        </p>

                    </div>

                </div>


                <!-- ERROR -->

                <div
                    id="vendorStatusActionError"
                    class="vendorStatusActionError"
                    hidden
                ></div>


                <!-- PROCESSING -->

                <div
                    id="vendorStatusActionLoading"
                    class="vendorStatusActionLoading"
                    hidden
                >

                    <span class="vendorStatusActionSpinner"></span>

                    <span
                        id="vendorStatusActionLoadingText"
                    >
                        Updating vendor...
                    </span>

                </div>

            </div>


            <!-- =============================================
                 FOOTER
                 ============================================= -->

            <div class="vendorStatusActionFooter">

                <button
                    type="button"
                    id="vendorStatusActionCancel"
                    class="vendorStatusActionCancel"
                >
                    Cancel
                </button>


                <button
                    type="button"
                    id="vendorStatusActionConfirm"
                    class="vendorStatusActionConfirm"
                >

                    <span
                        id="vendorStatusActionConfirmIcon"
                    >
                        🗃
                    </span>

                    <span
                        id="vendorStatusActionConfirmLabel"
                    >
                        Archive Vendor
                    </span>

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    /* =====================================================
       CLOSE
       ===================================================== */

    document
        .getElementById(
            "vendorStatusActionClose"
        )
        ?.addEventListener(
            "click",
            closeVendorStatusModal
        );


    document
        .getElementById(
            "vendorStatusActionCancel"
        )
        ?.addEventListener(
            "click",
            closeVendorStatusModal
        );


    modal.addEventListener(
        "click",
        function (
            event
        ) {

            if (
                event.target.matches(
                    "[data-vendor-status-close]"
                )
            ) {

                closeVendorStatusModal();

            }

        }
    );


    /* =====================================================
       CONFIRM
       ===================================================== */

    document
        .getElementById(
            "vendorStatusActionConfirm"
        )
        ?.addEventListener(
            "click",
            executeVendorStatusAction
        );


    /* =====================================================
       ESCAPE
       ===================================================== */

    document.addEventListener(
        "keydown",
        handleVendorStatusModalKeydown
    );

}



/* ---------------------------------------------------------
   Open Modal
   --------------------------------------------------------- */

function openVendorStatusModal(
    vendor,
    action
) {

    ensureVendorStatusModal();


    const modal =
        document.getElementById(
            "vendorStatusActionModal"
        );


    if (!modal) {

        return;

    }


    const restoring =
        action ===
        "restoreVendor";


    vendorStatusModalState.vendor =
        vendor;


    vendorStatusModalState.action =
        action;


    vendorStatusModalState.processing =
        false;


    /* =====================================================
       DIALOG THEME
       ===================================================== */

    const dialog =
        modal.querySelector(
            ".vendorStatusActionDialog"
        );


    if (dialog) {

        dialog.classList.toggle(
            "restoreMode",
            restoring
        );


        dialog.classList.toggle(
            "archiveMode",
            !restoring
        );

    }


    /* =====================================================
       HEADER
       ===================================================== */

    setVendorStatusModalText(
        "vendorStatusActionIcon",
        restoring
            ? "↩"
            : "🗃"
    );


    setVendorStatusModalText(
        "vendorStatusActionEyebrow",
        restoring
            ? "RESTORE SUPPLIER"
            : "ARCHIVE SUPPLIER"
    );


    setVendorStatusModalText(
        "vendorStatusActionTitle",
        restoring
            ? "Restore Vendor"
            : "Archive Vendor"
    );


    /* =====================================================
       VENDOR DETAILS
       ===================================================== */

    setVendorStatusModalText(
        "vendorStatusVendorIcon",
        categoryIcon(
            vendor.category
        )
    );


    setVendorStatusModalText(
        "vendorStatusVendorName",
        vendor.vendorName ||
        "Vendor"
    );


    setVendorStatusModalText(
        "vendorStatusVendorCategory",
        vendor.category ||
        "Supplier"
    );


    setVendorStatusModalText(
        "vendorStatusVendorId",
        vendor.vendorId
            ? (
                "Vendor ID: " +
                vendor.vendorId
            )
            : ""
    );


    /* =====================================================
       INFORMATION
       ===================================================== */

    setVendorStatusModalText(
        "vendorStatusActionInfoIcon",
        restoring
            ? "✓"
            : "i"
    );


    setVendorStatusModalText(
        "vendorStatusActionInfoTitle",
        restoring
            ? "Return this vendor to the active directory"
            : "Vendor record will be preserved"
    );


    setVendorStatusModalText(
        "vendorStatusActionInfoText",
        restoring
            ? (
                "The supplier will become ACTIVE again and " +
                "will appear in the normal Vendor Center directory."
            )
            : (
                "The supplier will be removed from the active " +
                "Vendor Center directory. The record will remain " +
                "stored safely and can be restored later."
            )
    );


    /* =====================================================
       BUTTON
       ===================================================== */

    setVendorStatusModalText(
        "vendorStatusActionConfirmIcon",
        restoring
            ? "↩"
            : "🗃"
    );


    setVendorStatusModalText(
        "vendorStatusActionConfirmLabel",
        restoring
            ? "Restore Vendor"
            : "Archive Vendor"
    );


    clearVendorStatusModalError();


    setVendorStatusModalLoading(
        false
    );


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
        "vendorStatusActionOpen"
    );

}



/* ---------------------------------------------------------
   Close Modal
   --------------------------------------------------------- */

function closeVendorStatusModal() {

    if (
        vendorStatusModalState.processing
    ) {

        return;

    }


    const modal =
        document.getElementById(
            "vendorStatusActionModal"
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
        "vendorStatusActionOpen"
    );


    vendorStatusModalState.vendor =
        null;


    vendorStatusModalState.action =
        "";


    clearVendorStatusModalError();

}



/* ---------------------------------------------------------
   Execute Archive / Restore
   --------------------------------------------------------- */

async function executeVendorStatusAction() {

    if (
        vendorStatusModalState.processing
    ) {

        return;

    }


    const vendor =
        vendorStatusModalState.vendor;


    const action =
        vendorStatusModalState.action;


    if (!vendor) {

        showVendorStatusModalError(
            "Vendor information is unavailable."
        );


        return;

    }


    if (
        action !==
            "archiveVendor" &&
        action !==
            "restoreVendor"
    ) {

        showVendorStatusModalError(
            "Vendor action is invalid."
        );


        return;

    }


    const restoring =
        action ===
        "restoreVendor";


    vendorStatusModalState.processing =
        true;


    clearVendorStatusModalError();


    setVendorStatusModalLoading(
        true
    );


    try {

        const result =
            await vendorApi(
                action,
                {

                    env:
                        vendorEnvironment(),

                    vendorId:
                        vendor.vendorId

                }
            );


        if (
            !result ||
            result.success !==
                true
        ) {

            throw new Error(
                result?.error ||
                (
                    restoring
                        ? "Unable to restore vendor."
                        : "Unable to archive vendor."
                )
            );

        }


        /* =================================================
           REFRESH DIRECTORY
           ================================================= */

        await load();


        /* =================================================
           SUCCESS
           ================================================= */

        vendorStatusModalState.processing =
            false;


        setVendorStatusModalLoading(
            false
        );


        closeVendorStatusModal();


        vendorToast(
            result.message ||
            (
                restoring
                    ? "Vendor restored successfully."
                    : "Vendor archived successfully."
            ),
            "success"
        );

    }

    catch (
        error
    ) {

        console.error(
            "[VENDOR STATUS]",
            error
        );


        vendorStatusModalState.processing =
            false;


        setVendorStatusModalLoading(
            false
        );


        showVendorStatusModalError(
            error.message ||
            (
                restoring
                    ? "Unable to restore vendor."
                    : "Unable to archive vendor."
            )
        );

    }

}



/* ---------------------------------------------------------
   Loading State
   --------------------------------------------------------- */

function setVendorStatusModalLoading(
    loading
) {

    const restoring =
        vendorStatusModalState.action ===
        "restoreVendor";


    const confirmButton =
        document.getElementById(
            "vendorStatusActionConfirm"
        );


    const cancelButton =
        document.getElementById(
            "vendorStatusActionCancel"
        );


    const closeButton =
        document.getElementById(
            "vendorStatusActionClose"
        );


    const loadingBox =
        document.getElementById(
            "vendorStatusActionLoading"
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


    if (loadingBox) {

        loadingBox.hidden =
            !loading;

    }


    setVendorStatusModalText(
        "vendorStatusActionLoadingText",
        restoring
            ? "Restoring vendor..."
            : "Archiving vendor..."
    );


    setVendorStatusModalText(
        "vendorStatusActionConfirmLabel",
        loading
            ? (
                restoring
                    ? "Restoring..."
                    : "Archiving..."
            )
            : (
                restoring
                    ? "Restore Vendor"
                    : "Archive Vendor"
            )
    );

}



/* ---------------------------------------------------------
   Error
   --------------------------------------------------------- */

function showVendorStatusModalError(
    message
) {

    const element =
        document.getElementById(
            "vendorStatusActionError"
        );


    if (!element) {

        return;

    }


    element.hidden =
        false;


    element.textContent =
        message ||
        "Unable to update vendor.";

}



/* ---------------------------------------------------------
   Clear Error
   --------------------------------------------------------- */

function clearVendorStatusModalError() {

    const element =
        document.getElementById(
            "vendorStatusActionError"
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
   Set Modal Text
   --------------------------------------------------------- */

function setVendorStatusModalText(
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



/* ---------------------------------------------------------
   Escape Key
   --------------------------------------------------------- */

function handleVendorStatusModalKeydown(
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
            "vendorStatusActionModal"
        );


    if (
        !modal ||
        !modal.classList.contains(
            "active"
        )
    ) {

        return;

    }


    closeVendorStatusModal();

}

    /* =====================================================
       WHATSAPP
       ===================================================== */

    function openWhatsapp(
        vendor
    ) {

        const number =
            String(
                vendor.whatsapp ||
                vendor.phone ||
                ""
            ).replace(
                /\D/g,
                ""
            );


        if (!number) {

            vendorToast(
                "Vendor WhatsApp number is unavailable.",
                "error"
            );

            return;

        }


        const finalNumber =
            number.startsWith(
                "91"
            )
                ? number
                : "91" +
                    number;


        window.open(
            "https://wa.me/" +
            finalNumber,
            "_blank"
        );

    }

/* =========================================================
   PERMANENT VENDOR DELETE MODAL
   ========================================================= */


let permanentVendorDeleteState =
{
    vendor:
        null,

    processing:
        false
};



/* ---------------------------------------------------------
   Ensure Modal
   --------------------------------------------------------- */

function ensurePermanentVendorDeleteModal() {

    if (
        document.getElementById(
            "permanentVendorDeleteModal"
        )
    ) {

        return;

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "permanentVendorDeleteModal";


    modal.className =
        "permanentVendorDeleteModal";


    modal.innerHTML = `

        <div
            class="permanentVendorDeleteBackdrop"
            data-vendor-delete-close
        ></div>


        <div
            class="permanentVendorDeleteDialog"
            role="dialog"
            aria-modal="true"
        >

            <!-- HEADER -->

            <div class="permanentVendorDeleteHeader">

                <div class="permanentVendorDeleteHeaderLeft">

                    <div class="permanentVendorDeleteWarning">
                        !
                    </div>


                    <div>

                        <div class="permanentVendorDeleteEyebrow">
                            SECURITY CONFIRMATION
                        </div>

                        <h3>
                            Permanently Delete Vendor
                        </h3>

                    </div>

                </div>


                <button
                    type="button"
                    id="permanentVendorDeleteClose"
                    class="permanentVendorDeleteClose"
                >
                    ×
                </button>

            </div>


            <!-- BODY -->

            <div class="permanentVendorDeleteBody">


                <div class="permanentVendorDeleteVendor">

                    <div
                        id="permanentVendorDeleteIcon"
                        class="permanentVendorDeleteVendorIcon"
                    >
                        🤝
                    </div>


                    <div>

                        <strong
                            id="permanentVendorDeleteName"
                        >
                            Vendor
                        </strong>

                        <span
                            id="permanentVendorDeleteCategory"
                        >
                            Supplier
                        </span>

                        <small
                            id="permanentVendorDeleteId"
                        ></small>

                    </div>

                </div>


                <div class="permanentVendorDeleteDanger">

                    <span>
                        ⚠
                    </span>

                    <div>

                        <strong>
                            This action cannot be undone
                        </strong>

                        <p>
                            The vendor record will be permanently removed
                            from the Vendors sheet. Restore will no longer
                            be possible.
                        </p>

                    </div>

                </div>


                <label class="permanentVendorDeleteField">

                    <span>
                        Type <strong>DELETE</strong> to confirm
                    </span>

                    <input
                        id="permanentVendorDeleteConfirmation"
                        type="text"
                        placeholder="Type DELETE"
                        autocomplete="off"
                    >

                </label>


                <label class="permanentVendorDeleteField">

                    <span>
                        Manager PIN
                    </span>


                    <div class="permanentVendorDeletePinWrap">

                        <input
                            id="permanentVendorDeletePin"
                            type="password"
                            inputmode="numeric"
                            placeholder="Enter Manager PIN"
                            autocomplete="off"
                        >


                        <button
                            type="button"
                            id="permanentVendorDeletePinToggle"
                            class="permanentVendorDeletePinToggle"
                        >
                            👁
                        </button>

                    </div>

                </label>


                <div
                    id="permanentVendorDeleteError"
                    class="permanentVendorDeleteError"
                    hidden
                ></div>


                <div
                    id="permanentVendorDeleteLoading"
                    class="permanentVendorDeleteLoading"
                    hidden
                >

                    <span class="permanentVendorDeleteSpinner"></span>

                    Permanently deleting vendor...

                </div>

            </div>


            <!-- FOOTER -->

            <div class="permanentVendorDeleteFooter">

                <button
                    type="button"
                    id="permanentVendorDeleteCancel"
                    class="vendorSecondaryBtn"
                >
                    Cancel
                </button>


                <button
                    type="button"
                    id="permanentVendorDeleteConfirm"
                    class="permanentVendorDeleteConfirm"
                    disabled
                >
                    🗑 Delete Permanently
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const confirmation =
        document.getElementById(
            "permanentVendorDeleteConfirmation"
        );


    const pin =
        document.getElementById(
            "permanentVendorDeletePin"
        );


    confirmation?.addEventListener(
        "input",
        validatePermanentVendorDelete
    );


    pin?.addEventListener(
        "input",
        validatePermanentVendorDelete
    );


    document
        .getElementById(
            "permanentVendorDeleteConfirm"
        )
        ?.addEventListener(
            "click",
            executePermanentVendorDelete
        );


    document
        .getElementById(
            "permanentVendorDeleteCancel"
        )
        ?.addEventListener(
            "click",
            closePermanentVendorDeleteModal
        );


    document
        .getElementById(
            "permanentVendorDeleteClose"
        )
        ?.addEventListener(
            "click",
            closePermanentVendorDeleteModal
        );


    document
        .querySelector(
            "#permanentVendorDeleteModal [data-vendor-delete-close]"
        )
        ?.addEventListener(
            "click",
            closePermanentVendorDeleteModal
        );


    document
        .getElementById(
            "permanentVendorDeletePinToggle"
        )
        ?.addEventListener(
            "click",
            togglePermanentVendorDeletePin
        );

}



/* ---------------------------------------------------------
   Open
   --------------------------------------------------------- */

function openPermanentVendorDeleteModal(
    vendor
) {

    ensurePermanentVendorDeleteModal();


    const modal =
        document.getElementById(
            "permanentVendorDeleteModal"
        );


    if (!modal) {

        return;

    }


    permanentVendorDeleteState.vendor =
        vendor;


    permanentVendorDeleteState.processing =
        false;


    const name =
        document.getElementById(
            "permanentVendorDeleteName"
        );


    const category =
        document.getElementById(
            "permanentVendorDeleteCategory"
        );


    const id =
        document.getElementById(
            "permanentVendorDeleteId"
        );


    const icon =
        document.getElementById(
            "permanentVendorDeleteIcon"
        );


    if (name) {

        name.textContent =
            vendor.vendorName ||
            "Vendor";

    }


    if (category) {

        category.textContent =
            vendor.category ||
            "Supplier";

    }


    if (id) {

        id.textContent =
            "Vendor ID: " +
            (
                vendor.vendorId ||
                ""
            );

    }


    if (icon) {

        icon.textContent =
            categoryIcon(
                vendor.category
            );

    }


    const confirmation =
        document.getElementById(
            "permanentVendorDeleteConfirmation"
        );


    const pin =
        document.getElementById(
            "permanentVendorDeletePin"
        );


    if (confirmation) {

        confirmation.value =
            "";

    }


    if (pin) {

        pin.value =
            "";

        pin.type =
            "password";

    }


    hidePermanentVendorDeleteError();


    setPermanentVendorDeleteLoading(
        false
    );


    validatePermanentVendorDelete();


    modal.classList.add(
        "active"
    );


    setTimeout(
        function () {

            confirmation?.focus();

        },
        60
    );

}



/* ---------------------------------------------------------
   Close
   --------------------------------------------------------- */

function closePermanentVendorDeleteModal() {

    if (
        permanentVendorDeleteState.processing
    ) {

        return;

    }


    document
        .getElementById(
            "permanentVendorDeleteModal"
        )
        ?.classList.remove(
            "active"
        );


    permanentVendorDeleteState.vendor =
        null;


    hidePermanentVendorDeleteError();

}



/* ---------------------------------------------------------
   Validation
   --------------------------------------------------------- */

function validatePermanentVendorDelete() {

    const confirmation =
        String(
            document
                .getElementById(
                    "permanentVendorDeleteConfirmation"
                )
                ?.value ||
            ""
        )
            .trim()
            .toUpperCase();


    const pin =
        String(
            document
                .getElementById(
                    "permanentVendorDeletePin"
                )
                ?.value ||
            ""
        ).trim();


    const button =
        document.getElementById(
            "permanentVendorDeleteConfirm"
        );


    if (!button) {

        return false;

    }


    const valid =
        confirmation ===
            "DELETE" &&
        pin.length >
            0 &&
        !permanentVendorDeleteState.processing;


    button.disabled =
        !valid;


    return valid;

}



/* ---------------------------------------------------------
   Execute
   --------------------------------------------------------- */

async function executePermanentVendorDelete() {

    if (
        permanentVendorDeleteState.processing
    ) {

        return;

    }


    if (
        !validatePermanentVendorDelete()
    ) {

        return;

    }


    const vendor =
        permanentVendorDeleteState.vendor;


    if (!vendor) {

        showPermanentVendorDeleteError(
            "Vendor information is unavailable."
        );

        return;

    }


    const managerPin =
        String(
            document
                .getElementById(
                    "permanentVendorDeletePin"
                )
                ?.value ||
            ""
        ).trim();


    permanentVendorDeleteState.processing =
        true;


    hidePermanentVendorDeleteError();


    setPermanentVendorDeleteLoading(
        true
    );


    try {

        const result =
            await vendorApi(
                "permanentlyDeleteVendor",
                {

                    env:
                        vendorEnvironment(),

                    vendorId:
                        vendor.vendorId,

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
                "Unable to permanently delete vendor."
            );

        }


        permanentVendorDeleteState.processing =
            false;


        setPermanentVendorDeleteLoading(
            false
        );


        closePermanentVendorDeleteModal();


        vendorToast(
            "Vendor permanently deleted.",
            "success"
        );


        await load();

    }

    catch (
        error
    ) {

        console.error(
            "[VENDOR DELETE]",
            error
        );


        permanentVendorDeleteState.processing =
            false;


        setPermanentVendorDeleteLoading(
            false
        );


        validatePermanentVendorDelete();


        showPermanentVendorDeleteError(
            error.message ||
            "Unable to permanently delete vendor."
        );

    }

}



/* ---------------------------------------------------------
   Loading
   --------------------------------------------------------- */

function setPermanentVendorDeleteLoading(
    loading
) {

    const status =
        document.getElementById(
            "permanentVendorDeleteLoading"
        );


    const deleteButton =
        document.getElementById(
            "permanentVendorDeleteConfirm"
        );


    const cancelButton =
        document.getElementById(
            "permanentVendorDeleteCancel"
        );


    const closeButton =
        document.getElementById(
            "permanentVendorDeleteClose"
        );


    const confirmation =
        document.getElementById(
            "permanentVendorDeleteConfirmation"
        );


    const pin =
        document.getElementById(
            "permanentVendorDeletePin"
        );


    if (status) {

        status.hidden =
            !loading;

    }


    if (deleteButton) {

        deleteButton.disabled =
            loading;

        deleteButton.textContent =
            loading
                ? "Deleting..."
                : "🗑 Delete Permanently";

    }


    if (cancelButton) {

        cancelButton.disabled =
            loading;

    }


    if (closeButton) {

        closeButton.disabled =
            loading;

    }


    if (confirmation) {

        confirmation.disabled =
            loading;

    }


    if (pin) {

        pin.disabled =
            loading;

    }

}



/* ---------------------------------------------------------
   Error
   --------------------------------------------------------- */

function showPermanentVendorDeleteError(
    message
) {

    const element =
        document.getElementById(
            "permanentVendorDeleteError"
        );


    if (!element) {

        return;

    }


    element.hidden =
        false;


    element.textContent =
        message ||
        "Unable to permanently delete vendor.";

}



function hidePermanentVendorDeleteError() {

    const element =
        document.getElementById(
            "permanentVendorDeleteError"
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
   Toggle PIN
   --------------------------------------------------------- */

function togglePermanentVendorDeletePin() {

    const input =
        document.getElementById(
            "permanentVendorDeletePin"
        );


    const button =
        document.getElementById(
            "permanentVendorDeletePinToggle"
        );


    if (
        !input ||
        !button
    ) {

        return;

    }


    const visible =
        input.type ===
        "text";


    input.type =
        visible
            ? "password"
            : "text";


    button.textContent =
        visible
            ? "👁"
            : "🙈";

}

    /* =====================================================
       HELPERS
       ===================================================== */

    function categoryIcon(
        category
    ) {

        const icons =
        {

            "Hotel":
                "🏨",

            "Cab / Transport":
                "🚖",

            "DMC / Package Supplier":
                "🌍",

            "Tour Operator":
                "🧳",

            "Transfer":
                "🚐",

            "Guide":
                "🧭",

            "Visa Partner":
                "🛂",

            "Insurance Partner":
                "🛡",

            "Flight Supplier":
                "✈",

            "Train Supplier":
                "🚆",

            "Bus Supplier":
                "🚌",

            "Other":
                "🤝"

        };


        return icons[
            category
        ] ||
        "🤝";

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
                value ||
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
                value ?? "";

        }

    }



    function showFormError(
        message
    ) {

        const element =
            document.getElementById(
                "vendorFormError"
            );


        if (!element) {

            return;

        }


        element.hidden =
            false;


        element.textContent =
            message ||
            "Unable to save vendor.";

    }



    function hideFormError() {

        const element =
            document.getElementById(
                "vendorFormError"
            );


        if (!element) {

            return;

        }


        element.hidden =
            true;


        element.textContent =
            "";

    }



    function vendorToast(
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
            "[VENDOR]",
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



    function escapeAttribute(
        value
    ) {

        return escapeHtml(
            value
        );

    }



    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.RanSanVendors =
    {

        open:
            open,

        close:
            close,

        refresh:
            load

    };


})();