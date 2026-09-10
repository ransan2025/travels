/*====================================================
DASH NOTIFICATION MODULE
====================================================*/

console.log(
    "========== DASH NOTIFICATION JS VERSION 2026-08-25 V2 =========="
);


window.DashNotification = (function () {

    "use strict";


    /*================================================
    STATE
    ================================================*/

    let notifications = [];

    let initialized = false;

    let activeFilter =
        "all";


    /*================================================
    HELPERS
    ================================================*/

    function setText(
        id,
        value
    ) {

        const element =
            document.getElementById(id);


        if (!element) {

            console.warn(
                "[NOTIFICATION] Element not found:",
                id
            );

            return;

        }


        element.textContent =
            value ?? "";

    }


    function escapeHTML(value) {

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


    function updateCount(count) {

        const badge =
            document.getElementById(
                "notificationCount"
            );


        if (!badge) {

            return;

        }


        const total =
            Number(count) || 0;


        if (total > 0) {

            badge.textContent =
                total > 99
                    ? "99+"
                    : total;


            badge.hidden =
                false;

        }
        else {

            badge.textContent =
                "0";


            badge.hidden =
                true;

        }

    }


    /*====================================================
    NOTIFICATION BUSINESS DATE
    ====================================================*/

    /*
     * Change this only if your business timezone
     * is different.
     */

    const NOTIFICATION_TIMEZONE =
        "Asia/Kolkata";


    /*====================================================
    DATE OBJECT -> YYYY-MM-DD IN BUSINESS TIMEZONE
    ====================================================*/

    function getDateKeyInTimezone(date) {

        if (
            !(date instanceof Date) ||
            isNaN(date.getTime())
        ) {

            return "";

        }


        const parts =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone:
                        NOTIFICATION_TIMEZONE,

                    year:
                        "numeric",

                    month:
                        "2-digit",

                    day:
                        "2-digit"
                }
            )
                .formatToParts(date);


        const values = {};


        parts.forEach(
            function (part) {

                if (
                    part.type !==
                    "literal"
                ) {

                    values[
                        part.type
                    ] =
                        part.value;

                }

            }
        );


        if (
            !values.year ||
            !values.month ||
            !values.day
        ) {

            return "";

        }


        return (
            values.year +
            "-" +
            values.month +
            "-" +
            values.day
        );

    }


    /*====================================================
    NORMALIZE FOLLOW-UP DATE -> YYYY-MM-DD
    ====================================================*/

    function getNotificationDateKey(value) {

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {

            return "";

        }


        /*----------------------------------------------
        DATE OBJECT
        ----------------------------------------------*/

        if (
            value instanceof Date &&
            !isNaN(value.getTime())
        ) {

            return getDateKeyInTimezone(
                value
            );

        }


        /*----------------------------------------------
        TIMESTAMP
        ----------------------------------------------*/

        if (
            typeof value ===
            "number"
        ) {

            return getDateKeyInTimezone(
                new Date(value)
            );

        }


        const text =
            String(value)
                .trim();


        let match;


        /*----------------------------------------------
        EXACT YYYY-MM-DD
    
        Very important:
        $ makes sure ISO timestamps don't enter here.
        ----------------------------------------------*/

        match =
            text.match(
                /^(\d{4})-(\d{1,2})-(\d{1,2})$/
            );


        if (match) {

            return (
                String(match[1]) +
                "-" +
                String(match[2])
                    .padStart(2, "0") +
                "-" +
                String(match[3])
                    .padStart(2, "0")
            );

        }


        /*----------------------------------------------
        DD/MM/YYYY
        ----------------------------------------------*/

        match =
            text.match(
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
            );


        if (match) {

            return (
                String(match[3]) +
                "-" +
                String(match[2])
                    .padStart(2, "0") +
                "-" +
                String(match[1])
                    .padStart(2, "0")
            );

        }


        /*----------------------------------------------
        DD-MM-YYYY
        ----------------------------------------------*/

        match =
            text.match(
                /^(\d{1,2})-(\d{1,2})-(\d{4})$/
            );


        if (match) {

            return (
                String(match[3]) +
                "-" +
                String(match[2])
                    .padStart(2, "0") +
                "-" +
                String(match[1])
                    .padStart(2, "0")
            );

        }


        /*----------------------------------------------
        ISO / DATETIME
    
        Example:
        2026-08-24T18:30:00.000Z
    
        This instant becomes 25 Aug in India.
        ----------------------------------------------*/

        const date =
            new Date(text);


        if (
            isNaN(
                date.getTime()
            )
        ) {

            console.warn(
                "[NOTIFICATION] Invalid follow-up date:",
                value
            );


            return "";

        }


        return getDateKeyInTimezone(
            date
        );

    }


    /*====================================================
    TODAY -> YYYY-MM-DD
    ====================================================*/

    function getNotificationTodayKey() {

        return getDateKeyInTimezone(
            new Date()
        );

    }


    /*====================================================
    FORMAT YYYY-MM-DD FOR DISPLAY
    ====================================================*/

    function formatNotificationDateKey(
        dateKey
    ) {

        if (!dateKey) {

            return "";

        }


        const parts =
            dateKey
                .split("-")
                .map(Number);


        if (
            parts.length !== 3 ||
            !parts[0] ||
            !parts[1] ||
            !parts[2]
        ) {

            return dateKey;

        }


        /*
         * Noon avoids another midnight
         * timezone edge case.
         */

        const date =
            new Date(
                parts[0],
                parts[1] - 1,
                parts[2],
                12,
                0,
                0
            );


        return date.toLocaleDateString(
            "en-GB",
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


    /*====================================================
    CALCULATE CALENDAR DAY DIFFERENCE
    ====================================================*/

    function getNotificationDayDifference(
        fromKey,
        toKey
    ) {

        if (
            !fromKey ||
            !toKey
        ) {

            return 0;

        }


        const from =
            fromKey
                .split("-")
                .map(Number);


        const to =
            toKey
                .split("-")
                .map(Number);


        const fromUTC =
            Date.UTC(
                from[0],
                from[1] - 1,
                from[2]
            );


        const toUTC =
            Date.UTC(
                to[0],
                to[1] - 1,
                to[2]
            );


        return Math.round(
            (
                toUTC -
                fromUTC
            )
            /
            86400000
        );

    }


    /*================================================
    CRM RECORDS
    ================================================*/

    function getCRMRecords() {

        const data =
            window.dashboardData;


        if (
            !data ||
            typeof data !== "object"
        ) {

            return [];

        }


        return [

            ...(data.air || [])
                .map(
                    row => ({
                        ...row,
                        _notificationService:
                            "Flight"
                    })
                ),

            ...(data.train || [])
                .map(
                    row => ({
                        ...row,
                        _notificationService:
                            "Train"
                    })
                ),

            ...(data.bus || [])
                .map(
                    row => ({
                        ...row,
                        _notificationService:
                            "Bus"
                    })
                ),

            ...(data.cars || [])
                .map(
                    row => ({
                        ...row,
                        _notificationService:
                            "Car"
                    })
                ),

            ...(data.packages || [])
                .map(
                    row => ({
                        ...row,
                        _notificationService:
                            "Package"
                    })
                ),

            ...(data.quotes || [])
                .map(
                    row => ({
                        ...row,
                        _notificationService:
                            "Quote"
                    })
                )

        ];

    }


    /*================================================
    FOLLOW-UP NOTIFICATIONS
    ================================================*/

    /*====================================================
FOLLOW-UP NOTIFICATIONS
====================================================*/

    function getFollowups() {

        const rows =
            getCRMRecords();


        /*
         * Business date.
         *
         * Example:
         * 2026-08-25
         */

        const todayKey =
            getNotificationTodayKey();


        const result = [];


        console.log(
            "[NOTIFICATION] TODAY KEY:",
            todayKey
        );


        rows.forEach(
            function (row) {

                /*------------------------------------------
                STATUS
                ------------------------------------------*/

                const status =
                    String(
                        row.Status ||
                        row.STATUS ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                /*
                 * Only records whose current
                 * status is Follow Up.
                 */

                if (
                    status !== "follow up" &&
                    status !== "followup" &&
                    status !== "follow-up"
                ) {

                    return;

                }


                /*------------------------------------------
                FOLLOW-UP DATE
                ------------------------------------------*/

                const rawDate =
                    row["Next Follow Up"] ||
                    row.NextFollowUp ||
                    row.followup ||
                    "";


                const followDateKey =
                    getNotificationDateKey(
                        rawDate
                    );


                if (!followDateKey) {

                    return;

                }


                /*------------------------------------------
                BASIC INFORMATION
                ------------------------------------------*/

                const customer =
                    row["Customer Name"] ||
                    row.Name ||
                    row.Customer ||
                    "Customer";


                const bookingId =
                    row["Booking ID"] ||
                    row.BookingID ||
                    row.bookingId ||
                    "";


                const service =
                    row._notificationService ||
                    "CRM";


                /*------------------------------------------
                TEMPORARY DEBUG
    
                Keep this until you verify everything.
                ------------------------------------------*/

                console.log(
                    "[NOTIFICATION FOLLOWUP]",
                    {
                        bookingId:
                            bookingId,

                        customer:
                            customer,

                        rawDate:
                            rawDate,

                        normalized:
                            followDateKey,

                        today:
                            todayKey,

                        result:
                            followDateKey <
                                todayKey
                                ? "OVERDUE"
                                : followDateKey ===
                                    todayKey
                                    ? "TODAY"
                                    : "FUTURE"
                    }
                );


                /*==========================================
                OVERDUE
                ==========================================*/

                if (
                    followDateKey <
                    todayKey
                ) {

                    const days =
                        getNotificationDayDifference(
                            followDateKey,
                            todayKey
                        );


                    result.push({

                        type:
                            "overdue",

                        icon:
                            "⏰",

                        title:
                            customer,

                        message:
                            "Follow up overdue by " +
                            days +
                            (
                                days === 1
                                    ? " day"
                                    : " days"
                            ),

                        service:
                            service,

                        bookingId:
                            bookingId,

                        /*
                         * Store normalized calendar date.
                         */

                        dateKey:
                            followDateKey,

                        dateText:
                            formatNotificationDateKey(
                                followDateKey
                            ),

                        row:
                            row

                    });


                    return;

                }


                /*==========================================
                TODAY
                ==========================================*/

                if (
                    followDateKey ===
                    todayKey
                ) {

                    result.push({

                        type:
                            "today",

                        icon:
                            "📅",

                        title:
                            customer,

                        message:
                            "Follow up is due today",

                        service:
                            service,

                        bookingId:
                            bookingId,

                        dateKey:
                            followDateKey,

                        dateText:
                            formatNotificationDateKey(
                                followDateKey
                            ),

                        row:
                            row

                    });


                    return;

                }


                /*
                 * Future follow-ups:
                 *
                 * Do not show in notification panel.
                 */

            }
        );


        return result;

    }


    /*================================================
    MODIFICATION REQUEST DATA
    ================================================*/

    function getModificationData() {

        const sources = [

            window.bookingModificationRequests,

            window.modificationRequests,

            window.bookingChangeRequests,

            window.dashboardData
                ?.modificationRequests,

            window.dashboardData
                ?.modifications

        ];


        for (
            const source of sources
        ) {

            if (
                Array.isArray(source) &&
                source.length > 0
            ) {

                return source;

            }

        }


        return [];

    }


    /*================================================
BUILD MODIFICATION NOTIFICATIONS
================================================*/

    function getModifications() {

        const requests =
            getModificationData();


        console.log(
            "[NOTIFICATION] Raw modification requests:",
            requests.length
        );


        return requests

            .filter(
                function (request) {

                    /*
                     * Your actual modification file
                     * primarily uses request.status
                     */

                    const status =
                        String(
                            request.status ||
                            request.Status ||
                            request["Request Status"] ||
                            request.RequestStatus ||
                            "Pending"
                        )
                            .trim()
                            .toLowerCase();


                    return (

                        status === "pending" ||

                        status === "new" ||

                        status === "under review" ||

                        status === "requested" ||

                        status === "open"

                    );

                }
            )

            .map(
                function (request) {

                    const customer =
                        request.customer ||
                        request.customerName ||
                        request["Customer Name"] ||
                        request.Customer ||
                        "Customer";


                    const bookingId =
                        request.bookingId ||
                        request["Booking ID"] ||
                        request.BookingID ||
                        "";


                    const service =
                        request.service ||
                        request.Service ||
                        "Booking";


                    const requestType =
                        request.requestType ||
                        request["Request Type"] ||
                        request.changeType ||
                        request["Change Type"] ||
                        "Booking change";


                    /*
                     * Optional friendly label from
                     * modification module.
                     */

                    let changeLabel =
                        requestType;


                    if (
                        typeof window.getModificationRequestTypeLabel ===
                        "function"
                    ) {

                        changeLabel =
                            window.getModificationRequestTypeLabel(
                                requestType
                            );

                    }


                    return {

                        type:
                            "modification",

                        icon:
                            "🔄",

                        title:
                            customer,

                        message:
                            changeLabel +
                            " request awaiting review",

                        service:
                            service,

                        bookingId:
                            bookingId,

                        request:
                            request

                    };

                }
            );

    }


    /*================================================
    REFRESH
    ================================================*/

    function refresh() {

        const followups =
            getFollowups();


        const modifications =
            getModifications();


        notifications = [

            ...followups,

            ...modifications

        ];


        /*================================================
SORT NOTIFICATIONS
================================================*/

        const priority = {

            overdue: 1,

            today: 2,

            modification: 3

        };


        notifications.sort(
            function (a, b) {

                const typeDifference =

                    (
                        priority[a.type] ||
                        99
                    )

                    -

                    (
                        priority[b.type] ||
                        99
                    );


                /*
                 * Overdue before Today,
                 * Today before Modifications.
                 */

                if (
                    typeDifference !== 0
                ) {

                    return typeDifference;

                }


                /*
                 * For follow-ups in same category:
                 * oldest date first.
                 */

                if (
                    a.dateKey &&
                    b.dateKey
                ) {

                    return a.dateKey
                        .localeCompare(
                            b.dateKey
                        );

                }


                return 0;

            }
        );


        render();

    }

    /*================================================
SET FILTER
================================================*/

    function setFilter(filter) {

        const allowedFilters = [

            "all",

            "overdue",

            "today",

            "modification"

        ];


        activeFilter =
            allowedFilters.includes(filter)
                ? filter
                : "all";


        console.log(
            "[NOTIFICATION] Active filter:",
            activeFilter
        );


        updateFilterUI();


        render();

    }

    /*================================================
UPDATE FILTER UI
================================================*/

    function updateFilterUI() {

        const filterButtons =
            document.querySelectorAll(
                "[data-notification-filter]"
            );


        filterButtons.forEach(
            function (button) {

                const filter =
                    button.dataset
                        .notificationFilter;


                const isActive =
                    filter ===
                    activeFilter;


                button.classList.toggle(
                    "active",
                    isActive
                );


                button.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );

            }
        );


        const allButton =
            document.getElementById(
                "notificationAllBtn"
            );


        if (allButton) {

            const isAll =
                activeFilter ===
                "all";


            allButton.classList.toggle(
                "active",
                isAll
            );


            allButton.setAttribute(
                "aria-pressed",
                String(isAll)
            );

        }

    }


    /*================================================
    RENDER
    ================================================*/

    function render() {

        const list =
            document.getElementById(
                "notificationList"
            );


        if (!list) {

            return;

        }


        const overdue =
            notifications.filter(
                item =>
                    item.type ===
                    "overdue"
            );


        const today =
            notifications.filter(
                item =>
                    item.type ===
                    "today"
            );


        const modifications =
            notifications.filter(
                item =>
                    item.type ===
                    "modification"
            );


        updateCount(
            notifications.length
        );


        /*
         * Notice:
         *
         * We call the LOCAL helper setText(),
         * not a global setNotificationText().
         */

        setText(
            "notificationOverdueCount",
            overdue.length
        );


        setText(
            "notificationTodayCount",
            today.length
        );


        setText(
            "notificationModificationCount",
            modifications.length
        );


        const subtitle =
            document.getElementById(
                "notificationSubtitle"
            );


        if (subtitle) {

            if (
                activeFilter ===
                "overdue"
            ) {

                subtitle.textContent =
                    overdue.length
                        ? overdue.length +
                        " overdue follow-up" +
                        (
                            overdue.length !== 1
                                ? "s"
                                : ""
                        )

                        : "No overdue follow-ups";

            }


            else if (
                activeFilter ===
                "today"
            ) {

                subtitle.textContent =
                    today.length
                        ? today.length +
                        " follow-up" +
                        (
                            today.length !== 1
                                ? "s"
                                : ""
                        ) +
                        " due today"

                        : "Nothing due today";

            }


            else if (
                activeFilter ===
                "modification"
            ) {

                subtitle.textContent =
                    modifications.length
                        ? modifications.length +
                        " booking change" +
                        (
                            modifications.length !== 1
                                ? "s"
                                : ""
                        ) +
                        " need review"

                        : "No pending booking changes";

            }


            else {

                subtitle.textContent =
                    notifications.length
                        ? notifications.length +
                        " item" +
                        (
                            notifications.length !== 1
                                ? "s"
                                : ""
                        ) +
                        " need attention"

                        : "You're all caught up";

            }

        }


        /*
         * EMPTY
         */

        if (
            !notifications.length
        ) {

            list.innerHTML = `

                <div class="notificationEmpty">

                    <div class="notificationEmptyIcon">
                        ✓
                    </div>

                    <strong>
                        All caught up
                    </strong>

                    <span>
                        There are no overdue follow-ups,
                        follow-ups due today, or pending
                        booking changes.
                    </span>

                </div>

            `;


            return;

        }


        /*================================================
FILTERED LIST
================================================*/

        let html = "";


        /*----------------------------------------------
        ALL
        ----------------------------------------------*/

        if (
            activeFilter ===
            "all"
        ) {

            html +=
                buildGroup(
                    "Overdue Follow Ups",
                    overdue
                );


            html +=
                buildGroup(
                    "Due Today",
                    today
                );


            html +=
                buildGroup(
                    "Booking Changes",
                    modifications
                );

        }


        /*----------------------------------------------
        OVERDUE
        ----------------------------------------------*/

        else if (
            activeFilter ===
            "overdue"
        ) {

            html =
                buildGroup(
                    "Overdue Follow Ups",
                    overdue
                );

        }


        /*----------------------------------------------
        TODAY
        ----------------------------------------------*/

        else if (
            activeFilter ===
            "today"
        ) {

            html =
                buildGroup(
                    "Due Today",
                    today
                );

        }


        /*----------------------------------------------
        MODIFICATIONS
        ----------------------------------------------*/

        else if (
            activeFilter ===
            "modification"
        ) {

            html =
                buildGroup(
                    "Booking Changes",
                    modifications
                );

        }


        /*----------------------------------------------
        NO ITEMS FOR SELECTED FILTER
        ----------------------------------------------*/

        if (!html) {

            let emptyTitle =
                "Nothing here";


            let emptyMessage =
                "No notifications currently need attention.";


            if (
                activeFilter ===
                "overdue"
            ) {

                emptyTitle =
                    "No overdue follow-ups";


                emptyMessage =
                    "There are no overdue follow-ups.";

            }


            else if (
                activeFilter ===
                "today"
            ) {

                emptyTitle =
                    "Nothing due today";


                emptyMessage =
                    "There are no follow-ups due today.";

            }


            else if (
                activeFilter ===
                "modification"
            ) {

                emptyTitle =
                    "No booking changes";


                emptyMessage =
                    "There are no pending booking modification requests.";

            }


            html = `

        <div class="notificationEmpty">

            <div class="notificationEmptyIcon">
                ✓
            </div>

            <strong>
                ${escapeHTML(emptyTitle)}
            </strong>

            <span>
                ${escapeHTML(emptyMessage)}
            </span>

        </div>

    `;

        }


        list.innerHTML =
            html;


        /*
         * Keep selected filter visually active.
         */

        updateFilterUI();

    }


    /*================================================
    GROUP
    ================================================*/

    function buildGroup(
        title,
        items
    ) {

        if (!items.length) {

            return "";

        }


        let html = `

            <div class="notificationGroupTitle">

                ${escapeHTML(title)}

            </div>

        `;


        items.forEach(
            function (item) {

                const index =
                    notifications.indexOf(
                        item
                    );


                html +=
                    buildItem(
                        item,
                        index
                    );

            }
        );


        return html;

    }


    /*================================================
    ITEM
    ================================================*/

    function buildItem(
        item,
        index
    ) {

        return `

            <div
                class="
                    notificationItem
                    ${escapeHTML(item.type)}
                "
                data-notification-index="${index}"
            >

                <div class="notificationItemIcon">

                    ${escapeHTML(
            item.icon
        )}

                </div>


                <div class="notificationItemContent">


                    <div class="notificationItemTop">

                        <div class="notificationCustomer">

                            ${escapeHTML(
            item.title
        )}

                        </div>


                        <span class="notificationService">

                            ${escapeHTML(
            item.service
        )}

                        </span>

                    </div>


                    <div class="notificationMessage">

                        ${escapeHTML(
            item.message
        )}

                    </div>


                    <div class="notificationMeta">


                        ${item.bookingId
                ? `

                                <span>

                                    🆔

                                    ${escapeHTML(
                    item.bookingId
                )}

                                </span>

                                `
                : ""
            }


                        ${item.dateText
                ? `

                                <span>

                                    ${escapeHTML(
                    item.dateText
                )}

                                </span>

                                `
                : ""
            }


                        <span
                            class="
                                notificationSeverity
                                ${escapeHTML(item.type)}
                            "
                        >

                            ${item.type === "overdue"
                ? "OVERDUE"

                : item.type === "today"
                    ? "TODAY"

                    : "REVIEW"
            }

                        </span>


                    </div>


                </div>

            </div>

        `;

    }


    /*================================================
    OPEN ITEM
    ================================================*/

    function openItem(index) {

        const item =
            notifications[
            index
            ];


        if (!item) {

            return;

        }


        close();


        /*
         * FOLLOW-UP
         */

        if (
            item.type === "overdue" ||
            item.type === "today"
        ) {

            if (
                typeof window.openCustomerV2 ===
                "function"
            ) {

                window.openCustomerV2(
                    item.row
                );


                return;

            }


            if (
                typeof window.openCustomer ===
                "function"
            ) {

                window.openCustomer(
                    item.row
                );


                return;

            }

        }


        /*
         * MODIFICATION
         */

        if (
            item.type ===
            "modification"
        ) {

            if (
                typeof window.openModificationRequest ===
                "function"
            ) {

                window.openModificationRequest(
                    item.request
                );


                return;

            }


            const section =

                document.getElementById(
                    "modificationRequests"
                )

                ||

                document.querySelector(
                    ".modificationRequests"
                )

                ||

                document.querySelector(
                    "[data-section='modifications']"
                );


            if (section) {

                section.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });

            }

        }

    }


    /*================================================
    EVENT DELEGATION
    ================================================*/

    function handleListClick(event) {

        const item =
            event.target.closest(
                ".notificationItem"
            );


        if (!item) {

            return;

        }


        const index =
            Number(
                item.dataset
                    .notificationIndex
            );


        if (
            !Number.isInteger(index)
        ) {

            return;

        }


        openItem(
            index
        );

    }


    /*================================================
    OPEN / CLOSE PANEL
    ================================================*/

    function open() {

        const panel =
            document.getElementById(
                "notificationPanel"
            );


        const btn =
            document.getElementById(
                "notificationBtn"
            );


        if (
            !panel ||
            !btn
        ) {

            return;

        }


        refresh();


        panel.classList.add(
            "open"
        );


        btn.classList.add(
            "active"
        );


        panel.setAttribute(
            "aria-hidden",
            "false"
        );


        btn.setAttribute(
            "aria-expanded",
            "true"
        );

    }


    function close() {

        const panel =
            document.getElementById(
                "notificationPanel"
            );


        const btn =
            document.getElementById(
                "notificationBtn"
            );


        if (panel) {

            panel.classList.remove(
                "open"
            );


            panel.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        if (btn) {

            btn.classList.remove(
                "active"
            );


            btn.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }


    function toggle() {

        const panel =
            document.getElementById(
                "notificationPanel"
            );


        if (!panel) {

            return;

        }


        if (
            panel.classList.contains(
                "open"
            )
        ) {

            close();

        }
        else {

            open();

        }

    }


    /*================================================
    SET MODIFICATION DATA
    ================================================*/

    function setModificationRequests(
        requests
    ) {

        window.bookingModificationRequests =
            Array.isArray(requests)
                ? requests
                : [];


        refresh();

    }


    /*================================================
    INITIALIZE
    ================================================*/

    function init() {

        if (initialized) {

            return;

        }


        const btn =
            document.getElementById(
                "notificationBtn"
            );


        const panel =
            document.getElementById(
                "notificationPanel"
            );


        const closeBtn =
            document.getElementById(
                "notificationCloseBtn"
            );


        const list =
            document.getElementById(
                "notificationList"
            );

        const summary =
            document.getElementById(
                "notificationSummary"
            );


        const allBtn =
            document.getElementById(
                "notificationAllBtn"
            );


        if (
            !btn ||
            !panel
        ) {

            console.warn(
                "[NOTIFICATION] Required HTML not found."
            );


            return;

        }


        initialized =
            true;


        btn.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                toggle();

            }
        );


        if (closeBtn) {

            closeBtn.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    close();

                }
            );

        }


        if (list) {

            list.addEventListener(
                "click",
                handleListClick
            );

        }

        /*================================================
SUMMARY FILTERS
================================================*/

        if (summary) {

            summary.addEventListener(
                "click",
                function (event) {

                    const filterButton =
                        event.target.closest(
                            "[data-notification-filter]"
                        );


                    if (!filterButton) {

                        return;

                    }


                    const filter =
                        filterButton.dataset
                            .notificationFilter;


                    setFilter(
                        filter
                    );

                }
            );

        }

        /*================================================
ALL BUTTON
================================================*/

        if (allBtn) {

            allBtn.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    setFilter(
                        "all"
                    );

                }
            );

        }


        panel.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

            }
        );


        document.addEventListener(
            "click",
            close
        );


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    close();

                }

            }
        );


        refresh();


        console.log(
            "[NOTIFICATION] initialized"
        );

    }


    /*================================================
    PUBLIC API
    ================================================*/

    return {

        init:
            init,

        refresh:
            refresh,

        open:
            open,

        close:
            close,

        setModificationRequests:
            setModificationRequests

    };

})();

document.addEventListener(
    "DOMContentLoaded",
    function () {

        window.DashNotification
            ?.init();

    }
);

