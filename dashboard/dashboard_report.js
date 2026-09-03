/*====================================================
RANSAN DASHBOARD REPORT
====================================================*/

console.log(
    "========== DASHBOARD REPORT JS 2026-08-25 V1 =========="
);


/*====================================================
REPORT API CONFIGURATION
====================================================*/

const REPORT_API_URL =
    "https://script.google.com/macros/s/AKfycbz8rZXT7UWNYAdw8P3QpAamTk-NKljp-b0flYogJuIr3nwTljClyI_Xc9heoy4gXUmV/exec";


/*
 * Keep Report and Dashboard environment
 * synchronized through the same localStorage key.
 */

let REPORT_ENV =
    String(
        localStorage.getItem(
            "dashboardEnv"
        ) ||
        "LIVE"
    )
        .trim()
        .toUpperCase();


if (
    REPORT_ENV !== "LIVE" &&
    REPORT_ENV !== "TEST"
) {

    REPORT_ENV =
        "LIVE";

}

window.DashboardReport = (function () {

    "use strict";


    /*================================================
    STATE
    ================================================*/

    let sourceData = null;

    let allRecords = [];

    let filteredRecords = [];

    /*================================================
ENVIRONMENT LOADER PROGRESS
================================================*/

    let reportEnvironmentProgress =
        0;


    let reportEnvironmentProgressTimer =
        null;


    const SERVICE_META = {

        Flight: {
            icon: "✈"
        },

        Train: {
            icon: "🚆"
        },

        Bus: {
            icon: "🚌"
        },

        Car: {
            icon: "🚖"
        },

        Package: {
            icon: "🏖"
        },

        Quote: {
            icon: "💬"
        }

    };


    const STATUS_COLORS = [

        "#38bdf8",
        "#fbbf24",
        "#34d399",
        "#818cf8",
        "#f87171",
        "#c084fc",
        "#94a3b8",
        "#2dd4bf"

    ];


    /*================================================
    HELPERS
    ================================================*/

    function $(id) {

        return document.getElementById(id);

    }


    function safeText(value) {

        return String(
            value ?? ""
        );

    }


    function escapeHTML(value) {

        return safeText(value)

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


    function number(value) {

        const n =
            Number(value);


        return Number.isFinite(n)
            ? n
            : 0;

    }


    function money(value) {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style:
                    "currency",

                currency:
                    "INR",

                maximumFractionDigits:
                    0
            }
        )
            .format(
                number(value)
            );

    }


    function normalizeStatus(value) {

        return safeText(value)
            .trim();

    }


    function getStatusKey(value) {

        return normalizeStatus(value)
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                ""
            );

    }


    function getCustomer(row) {

        return (

            row["Customer Name"] ||

            row.Customer ||

            row.customer ||

            row.customerName ||

            row.Name ||

            "Customer"

        );

    }


    function getBookingId(row) {

        return (

            row["Booking ID"] ||

            row.BookingID ||

            row.bookingId ||

            row.bookingID ||

            ""

        );

    }


    function getPhone(row) {

        return (

            row.Phone ||

            row.Mobile ||

            row["Phone Number"] ||

            row["Mobile Number"] ||

            ""

        );

    }


    function getStatus(row) {

        return (

            row.Status ||

            row.STATUS ||

            row.status ||

            "NEW"

        );

    }


    function getRevenue(row) {

        return number(
            row.Revenue ??
            row.revenue ??
            0
        );

    }


    function getTravelDate(row) {

        return (

            row["Travel Date"] ||

            row.travelDate ||

            row.Date ||

            ""

        );

    }


    function getCreatedDate(row) {

        return (

            row["Created Date"] ||

            row.createdDate ||

            row.Timestamp ||

            row.timestamp ||

            ""

        );

    }


    function getFollowup(row) {

        return (

            row["Next Follow Up"] ||

            row.NextFollowUp ||

            row.followup ||

            row.followUp ||

            ""

        );

    }


    /*================================================
    REPORT BUSINESS TIMEZONE
    ================================================*/

    const REPORT_TIMEZONE =
        "Asia/Kolkata";


    /*================================================
    DATE OBJECT -> BUSINESS DATE
    ================================================*/

    function getReportDateKeyFromDate(
        date
    ) {

        if (
            !(date instanceof Date) ||
            isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        const parts =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone:
                        REPORT_TIMEZONE,

                    year:
                        "numeric",

                    month:
                        "2-digit",

                    day:
                        "2-digit"
                }
            )
                .formatToParts(
                    date
                );


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


        return (
            values.year +
            "-" +
            values.month +
            "-" +
            values.day
        );

    }


    /*================================================
    NORMALIZE ANY DATE
    ================================================*/

    function dateKey(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "";

        }


        if (
            value instanceof Date
        ) {

            return getReportDateKeyFromDate(
                value
            );

        }


        if (
            typeof value ===
            "number"
        ) {

            return getReportDateKeyFromDate(
                new Date(value)
            );

        }


        const text =
            safeText(value)
                .trim();


        let match;


        /*----------------------------------------------
        EXACT YYYY-MM-DD
        ----------------------------------------------*/

        match =
            text.match(
                /^(\d{4})-(\d{1,2})-(\d{1,2})$/
            );


        if (match) {

            return (
                match[1] +
                "-" +
                String(match[2])
                    .padStart(2, "0") +
                "-" +
                String(match[3])
                    .padStart(2, "0")
            );

        }


        /*----------------------------------------------
        EXACT DD/MM/YYYY
        ----------------------------------------------*/

        match =
            text.match(
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
            );


        if (match) {

            return (
                match[3] +
                "-" +
                String(match[2])
                    .padStart(2, "0") +
                "-" +
                String(match[1])
                    .padStart(2, "0")
            );

        }


        /*----------------------------------------------
        EXACT DD-MM-YYYY
        ----------------------------------------------*/

        match =
            text.match(
                /^(\d{1,2})-(\d{1,2})-(\d{4})$/
            );


        if (match) {

            return (
                match[3] +
                "-" +
                String(match[2])
                    .padStart(2, "0") +
                "-" +
                String(match[1])
                    .padStart(2, "0")
            );

        }


        /*----------------------------------------------
        ISO DATETIME
        ----------------------------------------------*/

        const date =
            new Date(text);


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        return getReportDateKeyFromDate(
            date
        );

    }


    /*================================================
    TODAY IN INDIA
    ================================================*/

    function todayKey() {

        return getReportDateKeyFromDate(
            new Date()
        );

    }


    function formatDate(value) {

        const key =
            dateKey(value);


        if (!key) {

            return "—";

        }


        const parts =
            key.split("-")
                .map(Number);


        const date =
            new Date(
                parts[0],
                parts[1] - 1,
                parts[2],
                12
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


    /*================================================
    BUILD RECORDS
    ================================================*/

    function buildRecords(data) {

        if (
            !data ||
            typeof data !==
            "object"
        ) {

            return [];

        }


        return [

            ...(data.air || [])
                .map(
                    row => ({
                        ...row,
                        _reportService:
                            "Flight"
                    })
                ),

            ...(data.train || [])
                .map(
                    row => ({
                        ...row,
                        _reportService:
                            "Train"
                    })
                ),

            ...(data.bus || [])
                .map(
                    row => ({
                        ...row,
                        _reportService:
                            "Bus"
                    })
                ),

            ...(data.cars || [])
                .map(
                    row => ({
                        ...row,
                        _reportService:
                            "Car"
                    })
                ),

            ...(data.packages || [])
                .map(
                    row => ({
                        ...row,
                        _reportService:
                            "Package"
                    })
                ),

            ...(data.quotes || [])
                .map(
                    row => ({
                        ...row,
                        _reportService:
                            "Quote"
                    })
                )

        ];

    }

    /*================================================
LOAD REPORT DATA FROM GOOGLE APPS SCRIPT
================================================*/

    async function loadReportData() {

        const refreshBtn =
            $("reportRefreshBtn");


        try {

            /*------------------------------------------
            LOADING UI
            ------------------------------------------*/

            if (refreshBtn) {

                refreshBtn.disabled =
                    true;


                refreshBtn.classList.add(
                    "loading"
                );

            }


            const syncText =
                $("reportLastSync");


            if (syncText) {

                syncText.textContent =
                    "Loading " +
                    REPORT_ENV +
                    " data...";

            }


            console.log(
                "[REPORT] Loading dashboard data:",
                {
                    environment:
                        REPORT_ENV
                }
            );


            /*------------------------------------------
            BUILD EXISTING APPS SCRIPT GET URL
            ------------------------------------------*/

            const url =
                new URL(
                    REPORT_API_URL
                );


            url.searchParams.set(
                "action",
                "getDashboard"
            );


            url.searchParams.set(
                "env",
                REPORT_ENV
            );


            /*
             * Cache bust browser/proxy.
             *
             * Your Apps Script itself may still use
             * its own intended cache.
             */

            url.searchParams.set(
                "_ts",
                Date.now()
            );


            console.log(
                "[REPORT] Request URL:",
                url.toString()
            );


            /*------------------------------------------
            FETCH
            ------------------------------------------*/

            const response =
                await fetch(
                    url.toString(),
                    {
                        method:
                            "GET",

                        cache:
                            "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "HTTP " +
                    response.status +
                    " " +
                    response.statusText
                );

            }


            const text =
                await response.text();


            let result;


            try {

                result =
                    JSON.parse(
                        text
                    );

            }
            catch (parseError) {

                console.error(
                    "[REPORT] Invalid API response:",
                    text
                );


                throw new Error(
                    "Server returned invalid JSON."
                );

            }


            console.log(
                "[REPORT] Dashboard response:",
                result
            );


            /*------------------------------------------
            VALIDATE
            ------------------------------------------*/

            if (
                !result ||
                result.success !==
                true
            ) {

                throw new Error(
                    result?.error ||
                    "Dashboard data could not be loaded."
                );

            }


            /*------------------------------------------
            DATA ARRAYS
            ------------------------------------------*/

            const data = {

                air:
                    Array.isArray(
                        result.air
                    )
                        ? result.air
                        : [],

                train:
                    Array.isArray(
                        result.train
                    )
                        ? result.train
                        : [],

                bus:
                    Array.isArray(
                        result.bus
                    )
                        ? result.bus
                        : [],

                cars:
                    Array.isArray(
                        result.cars
                    )
                        ? result.cars
                        : [],

                packages:
                    Array.isArray(
                        result.packages
                    )
                        ? result.packages
                        : [],

                quotes:
                    Array.isArray(
                        result.quotes
                    )
                        ? result.quotes
                        : [],

                kpi:
                    result.kpi ||
                    {},

                activity:
                    Array.isArray(
                        result.activity
                    )
                        ? result.activity
                        : []

            };


            /*------------------------------------------
            SEND TO EXISTING REPORT ENGINE
            ------------------------------------------*/

            setData(
                data
            );


            /*
             * Optional global reference.
             */

            window.reportDashboardData =
                data;


            updateSync();


            console.log(
                "[REPORT] Successfully loaded",
                {
                    environment:
                        REPORT_ENV,

                    air:
                        data.air.length,

                    train:
                        data.train.length,

                    bus:
                        data.bus.length,

                    cars:
                        data.cars.length,

                    packages:
                        data.packages.length,

                    quotes:
                        data.quotes.length
                }
            );


            return data;

        }
        catch (error) {

            console.error(
                "[REPORT] Load error:",
                error
            );


            const syncText =
                $("reportLastSync");


            if (syncText) {

                syncText.textContent =
                    "Unable to load " +
                    REPORT_ENV +
                    " data";

            }


            showLoadError(
                error.message ||
                "Unable to load report data."
            );


            return null;

        }
        finally {

            if (refreshBtn) {

                refreshBtn.disabled =
                    false;


                refreshBtn.classList.remove(
                    "loading"
                );

            }

        }

    }


    /*================================================
    PUBLIC DATA SETTER
    ================================================*/

    function setData(data) {

        sourceData =
            data;


        allRecords =
            buildRecords(
                data
            );


        updateEnvironment();


        applyFilters();


        updateSync();


        console.log(
            "[REPORT] Data loaded:",
            allRecords.length
        );

    }




    /*================================================
    FILTERS
    ================================================*/

    function applyFilters() {

        const service =
            $("reportServiceFilter")
                ?.value ||
            "all";


        const status =
            $("reportStatusFilter")
                ?.value ||
            "all";


        const preset =
            $("reportDatePreset")
                ?.value ||
            "all";


        const query =
            safeText(
                $("reportSearch")
                    ?.value
            )
                .trim()
                .toLowerCase();


        const from =
            $("reportFromDate")
                ?.value ||
            "";


        const to =
            $("reportToDate")
                ?.value ||
            "";


        const range =
            resolveDateRange(
                preset,
                from,
                to
            );


        filteredRecords =
            allRecords.filter(
                function (row) {

                    /* SERVICE */

                    if (
                        service !== "all" &&
                        row._reportService !== service
                    ) {

                        return false;

                    }


                    /* STATUS */

                    if (
                        status !== "all" &&
                        normalizeStatus(
                            getStatus(row)
                        )
                            .toLowerCase() !==
                        status.toLowerCase()
                    ) {

                        return false;

                    }


                    /* DATE */

                    if (
                        range.from ||
                        range.to
                    ) {

                        const key =
                            dateKey(
                                getCreatedDate(row)
                            );


                        if (
                            !key
                        ) {

                            return false;

                        }


                        if (
                            range.from &&
                            key < range.from
                        ) {

                            return false;

                        }


                        if (
                            range.to &&
                            key > range.to
                        ) {

                            return false;

                        }

                    }


                    /* SEARCH */

                    if (query) {

                        const haystack = [

                            getBookingId(row),

                            getCustomer(row),

                            getPhone(row),

                            row._reportService,

                            getStatus(row),

                            row.From,

                            row.To,

                            row.Destination

                        ]
                            .join(" ")
                            .toLowerCase();


                        if (
                            !haystack.includes(
                                query
                            )
                        ) {

                            return false;

                        }

                    }


                    return true;

                }
            );


        render();

    }


    function resolveDateRange(
        preset,
        customFrom,
        customTo
    ) {

        const today =
            new Date();


        today.setHours(
            12,
            0,
            0,
            0
        );


        if (
            preset === "all"
        ) {

            return {
                from: "",
                to: ""
            };

        }


        if (
            preset === "custom"
        ) {

            return {

                from:
                    customFrom,

                to:
                    customTo

            };

        }


        const end =
            todayKey();


        if (
            preset === "today"
        ) {

            return {
                from: end,
                to: end
            };

        }


        if (
            preset === "month"
        ) {

            const first =
                new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1,
                    12
                );


            return {

                from:
                    dateKey(first),

                to:
                    end

            };

        }


        const days =
            Number(preset);


        if (
            Number.isFinite(days)
        ) {

            const start =
                new Date(today);


            start.setDate(
                start.getDate() -
                (days - 1)
            );


            return {

                from:
                    dateKey(start),

                to:
                    end

            };

        }


        return {
            from: "",
            to: ""
        };

    }


    /*====================================================
    ADVANCED REPORTS
    ====================================================*/


    /*====================================================
    SAFE FIELD FINDER
    ====================================================*/

    function reportField(
        row,
        names
    ) {

        if (!row) {

            return "";

        }


        const keys =
            Object.keys(
                row
            );


        for (
            let i = 0;
            i < names.length;
            i++
        ) {

            const wanted =
                String(
                    names[i]
                )
                    .trim()
                    .toLowerCase();


            const matched =
                keys.find(
                    function (key) {

                        return String(
                            key
                        )
                            .trim()
                            .toLowerCase() ===
                            wanted;

                    }
                );


            if (
                matched !==
                undefined
            ) {

                return row[
                    matched
                ];

            }

        }


        return "";

    }


    /*====================================================
    NUMBER
    ====================================================*/

    function reportNumber(
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return 0;

        }


        const cleaned =
            String(
                value
            )
                .replace(
                    /[^0-9.-]/g,
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


    /*====================================================
    PERCENT
    ====================================================*/

    function reportPercent(
        part,
        total
    ) {

        if (!total) {

            return 0;

        }


        return (
            part /
            total
        ) * 100;

    }


    /*====================================================
    AVERAGE
    ====================================================*/

    function reportAverage(
        total,
        count
    ) {

        if (!count) {

            return 0;

        }


        return (
            total /
            count
        );

    }


    /*====================================================
    SOURCE
    ====================================================*/

    function reportSource(
        row
    ) {

        return (
            reportField(
                row,
                [
                    "Source",
                    "Lead Source",
                    "Booking Source",
                    "Enquiry Source",
                    "Channel"
                ]
            ) ||
            "Unknown"
        );

    }


    /*====================================================
    PHONE
    ====================================================*/

    function reportPhone(
        row
    ) {

        return String(
            reportField(
                row,
                [
                    "Phone",
                    "Mobile",
                    "Mobile Number",
                    "Phone Number",
                    "Contact",
                    "Contact Number",
                    "Customer Phone"
                ]
            ) ||
            ""
        )
            .trim();

    }


    /*====================================================
    PASSENGER COUNT
    ====================================================*/

    function reportPassengers(
        row
    ) {

        const raw =
            reportField(
                row,
                [
                    "Passengers",
                    "Passenger",
                    "Pax",
                    "No of Passengers",
                    "No. of Passengers",
                    "Passenger Count",
                    "Travellers",
                    "Travelers",
                    "Adults"
                ]
            );


        let count =
            reportNumber(
                raw
            );


        if (
            count <= 0
        ) {

            const adults =
                reportNumber(
                    reportField(
                        row,
                        [
                            "Adults",
                            "Adult"
                        ]
                    )
                );


            const children =
                reportNumber(
                    reportField(
                        row,
                        [
                            "Children",
                            "Child",
                            "Kids"
                        ]
                    )
                );


            const infants =
                reportNumber(
                    reportField(
                        row,
                        [
                            "Infants",
                            "Infant"
                        ]
                    )
                );


            count =
                adults +
                children +
                infants;

        }


        return Math.max(
            0,
            count
        );

    }


    /*====================================================
    STATUS HELPERS
    ====================================================*/

    function reportStatusKey(
        row
    ) {

        return String(
            getStatus(
                row
            ) ||
            ""
        )
            .trim()
            .toLowerCase();

    }


    function reportIsCompleted(
        row
    ) {

        const status =
            reportStatusKey(
                row
            );


        return (
            status.includes(
                "complete"
            ) ||
            status ===
            "completed"
        );

    }


    function reportIsCancelled(
        row
    ) {

        return reportStatusKey(
            row
        )
            .includes(
                "cancel"
            );

    }


    function reportIsFollowup(
        row
    ) {

        const status =
            reportStatusKey(
                row
            );


        return (
            status.includes(
                "follow"
            ) ||
            Boolean(
                getFollowup(
                    row
                )
            )
        );

    }


    /*====================================================
    DATE KEY
    ====================================================*/

    function reportDateKey(
        value
    ) {

        if (!value) {

            return "";

        }


        const text =
            String(
                value
            )
                .trim();


        const simple =
            text.match(
                /^(\d{4})-(\d{2})-(\d{2})/
            );


        if (simple) {

            return (
                simple[1] +
                "-" +
                simple[2] +
                "-" +
                simple[3]
            );

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

            return "";

        }


        return [
            date.getFullYear(),
            String(
                date.getMonth() + 1
            )
                .padStart(
                    2,
                    "0"
                ),
            String(
                date.getDate()
            )
                .padStart(
                    2,
                    "0"
                )
        ]
            .join(
                "-"
            );

    }


    /*====================================================
    TODAY KEY
    ====================================================*/

    function reportTodayKey() {

        const now =
            new Date();


        return [
            now.getFullYear(),
            String(
                now.getMonth() + 1
            )
                .padStart(
                    2,
                    "0"
                ),
            String(
                now.getDate()
            )
                .padStart(
                    2,
                    "0"
                )
        ]
            .join(
                "-"
            );

    }


    /*====================================================
    ADD DAYS
    ====================================================*/

    function reportAddDaysKey(
        days
    ) {

        const date =
            new Date();


        date.setHours(
            12,
            0,
            0,
            0
        );


        date.setDate(
            date.getDate() +
            days
        );


        return reportDateKey(
            date
        );

    }


    /*====================================================
    METRIC CARD
    ====================================================*/

    function reportMetricHTML(
        label,
        value,
        sub,
        color
    ) {

        return `

        <div class="reportAdvancedMetric ${color || ""}">

            <div class="reportAdvancedMetricLabel">

                ${escapeHTML(
            label
        )}

            </div>


            <div class="reportAdvancedMetricValue">

                ${escapeHTML(
            String(
                value
            )
        )}

            </div>


            <div class="reportAdvancedMetricSub">

                ${escapeHTML(
            sub ||
            ""
        )}

            </div>

        </div>

    `;

    }


    /*====================================================
1. SALES & REVENUE
====================================================*/

    function renderSalesRevenueReport() {

        const records =
            filteredRecords;


        /*================================================
        TOTAL REVENUE
        ================================================*/

        const revenue =
            records.reduce(
                function (
                    total,
                    row
                ) {

                    return total +
                        reportNumber(
                            getRevenue(
                                row
                            )
                        );

                },
                0
            );


        /*================================================
        COMPLETED BOOKINGS
        ================================================*/

        const completed =
            records.filter(
                reportIsCompleted
            );


        /*================================================
        COMPLETED REVENUE
        ================================================*/

        const completedRevenue =
            completed.reduce(
                function (
                    total,
                    row
                ) {

                    return total +
                        reportNumber(
                            getRevenue(
                                row
                            )
                        );

                },
                0
            );


        /*================================================
        AVERAGE VALUE
        ================================================*/

        const avgValue =
            reportAverage(
                revenue,
                records.length
            );


        /*================================================
        ZERO REVENUE RECORDS
        ================================================*/

        const zeroRevenue =
            records.filter(
                function (row) {

                    return (
                        reportNumber(
                            getRevenue(
                                row
                            )
                        ) <= 0
                    );

                }
            )
                .length;


        /*================================================
        SALES KPI CARDS
        ================================================*/

        const kpis =
            $("reportSalesKpis");


        if (kpis) {

            kpis.innerHTML =

                reportMetricHTML(
                    "Total Revenue",
                    money(
                        revenue
                    ),
                    records.length +
                    " records",
                    "green"
                ) +

                reportMetricHTML(
                    "Completed Revenue",
                    money(
                        completedRevenue
                    ),
                    completed.length +
                    " completed",
                    "teal"
                ) +

                reportMetricHTML(
                    "Average Booking Value",
                    money(
                        avgValue
                    ),
                    "Revenue ÷ bookings",
                    "blue"
                ) +

                reportMetricHTML(
                    "Zero Revenue",
                    zeroRevenue,
                    "Records requiring review",
                    zeroRevenue
                        ? "amber"
                        : "green"
                );

        }


        /*================================================
        REVENUE BY SERVICE
        ================================================*/

        const byService =
            {};


        records.forEach(
            function (row) {

                const service =
                    row._reportService ||
                    "Other";


                if (
                    !byService[
                    service
                    ]
                ) {

                    byService[
                        service
                    ] =
                        0;

                }


                byService[
                    service
                ] +=
                    reportNumber(
                        getRevenue(
                            row
                        )
                    );

            }
        );


        /*================================================
        SERVICE ROWS
        ================================================*/

        const serviceRows =
            Object.entries(
                byService
            )
                .sort(
                    function (
                        a,
                        b
                    ) {

                        return (
                            b[1] -
                            a[1]
                        );

                    }
                );


        /*================================================
        HIGHEST SERVICE REVENUE
        ================================================*/

        const maximum =
            Math.max(
                1,
                ...serviceRows.map(
                    function (item) {

                        return item[1];

                    }
                )
            );


        /*================================================
        RENDER SERVICE REVENUE
        ================================================*/

        const serviceBox =
            $("reportSalesService");


        if (serviceBox) {

            if (
                !serviceRows.length
            ) {

                serviceBox.innerHTML = `

                <div class="reportRevenueEmpty">

                    No revenue data available

                </div>

            `;

            }
            else {

                serviceBox.innerHTML =
                    serviceRows.map(
                        function (item) {

                            const service =
                                item[0];


                            const serviceRevenue =
                                item[1];


                            /*
                             * Relative performance:
                             * highest service = 100%
                             */

                            const width =
                                (
                                    serviceRevenue /
                                    maximum
                                ) * 100;


                            /*
                             * Actual share of total revenue.
                             */

                            const revenueShare =
                                revenue > 0
                                    ? (
                                        serviceRevenue /
                                        revenue
                                    ) * 100
                                    : 0;


                            const icon =
                                SERVICE_META[
                                    service
                                ]?.icon ||
                                "•";


                            const serviceClass =
                                String(
                                    service
                                )
                                    .trim()
                                    .toLowerCase()
                                    .replace(
                                        /[^a-z0-9]+/g,
                                        "-"
                                    );


                            return `

                            <div
                                class="
                                    reportRevenueServiceRow
                                    ${serviceClass}
                                "
                            >

                                <!-- =========================
                                SERVICE + AMOUNT
                                ========================== -->

                                <div class="reportRevenueServiceTop">


                                    <!-- SERVICE BADGE -->

                                    <div
                                        class="
                                            reportRevenueServiceBadge
                                            ${serviceClass}
                                        "
                                    >

                                        <span class="reportRevenueServiceIcon">

                                            ${icon}

                                        </span>


                                        <span>

                                            ${escapeHTML(
                                service
                            )}

                                        </span>

                                    </div>


                                    <!-- REVENUE AMOUNT -->

                                    <div class="reportRevenueAmount">

                                        <span class="reportRevenueAmountLabel">

                                            REVENUE

                                        </span>


                                        <strong>

                                            ${escapeHTML(
                                money(
                                    serviceRevenue
                                )
                            )}

                                        </strong>

                                    </div>

                                </div>


                                <!-- =========================
                                SERVICE PROGRESS BAR
                                ========================== -->

                                <div class="reportRevenueServiceTrack">

                                    <div
                                        class="
                                            reportRevenueServiceFill
                                            ${serviceClass}
                                        "
                                        style="width:${Math.max(
                                2,
                                width
                            )}%"
                                    ></div>

                                </div>


                                <!-- =========================
                                SERVICE META
                                ========================== -->

                                <div class="reportRevenueServiceMeta">

                                    <span>

                                        ${revenueShare.toFixed(
                                1
                            )}%
                                        of total revenue

                                    </span>


                                    <span>

                                        ${width.toFixed(
                                0
                            )}%
                                        relative performance

                                    </span>

                                </div>

                            </div>

                        `;

                        }
                    )
                        .join("");

            }

        }


        /*================================================
        REVENUE SUMMARY
        ================================================*/

        const summary =
            $("reportSalesSummary");


        if (summary) {

            const completionRate =
                reportPercent(
                    completed.length,
                    records.length
                );


            const completedRevenueShare =
                reportPercent(
                    completedRevenue,
                    revenue
                );


            summary.innerHTML = `

            <div class="reportRevenueSummaryGrid">


                <!-- =============================
                TOTAL BOOKINGS
                ============================== -->

                <div class="reportRevenueSummaryItem blue">

                    <div class="reportRevenueSummaryIcon">

                        🧾

                    </div>


                    <div class="reportRevenueSummaryInfo">

                        <span class="reportRevenueSummaryLabel">

                            Total Bookings

                        </span>


                        <strong>

                            ${records.length}

                        </strong>

                    </div>


                    <span class="reportRevenueSummaryPill blue">

                        RECORDS

                    </span>

                </div>


                <!-- =============================
                COMPLETED BOOKINGS
                ============================== -->

                <div class="reportRevenueSummaryItem green">

                    <div class="reportRevenueSummaryIcon">

                        ✓

                    </div>


                    <div class="reportRevenueSummaryInfo">

                        <span class="reportRevenueSummaryLabel">

                            Completed Bookings

                        </span>


                        <strong>

                            ${completed.length}

                        </strong>

                    </div>


                    <span class="reportRevenueSummaryPill green">

                        ${completionRate.toFixed(
                1
            )}%

                    </span>

                </div>


                <!-- =============================
                COMPLETION RATE
                ============================== -->

                <div class="reportRevenueSummaryItem purple">

                    <div class="reportRevenueSummaryIcon">

                        ↗

                    </div>


                    <div class="reportRevenueSummaryInfo">

                        <span class="reportRevenueSummaryLabel">

                            Completion Rate

                        </span>


                        <strong>

                            ${completionRate.toFixed(
                1
            )}%

                        </strong>

                    </div>


                    <span class="reportRevenueSummaryPill purple">

                        SUCCESS

                    </span>

                </div>


                <!-- =============================
                COMPLETED REVENUE SHARE
                ============================== -->

                <div class="reportRevenueSummaryItem teal">

                    <div class="reportRevenueSummaryIcon">

                        ₹

                    </div>


                    <div class="reportRevenueSummaryInfo">

                        <span class="reportRevenueSummaryLabel">

                            Completed Revenue Share

                        </span>


                        <strong>

                            ${completedRevenueShare.toFixed(
                1
            )}%

                        </strong>

                    </div>


                    <span class="reportRevenueSummaryPill teal">

                        EARNED

                    </span>

                </div>


                <!-- =============================
                REVENUE PER RECORD
                ============================== -->

                <div class="reportRevenueSummaryItem amber">

                    <div class="reportRevenueSummaryIcon">

                        ◈

                    </div>


                    <div class="reportRevenueSummaryInfo">

                        <span class="reportRevenueSummaryLabel">

                            Revenue / Record

                        </span>


                        <strong class="reportRevenueSummaryMoney">

                            ${escapeHTML(
                money(
                    avgValue
                )
            )}

                        </strong>

                    </div>


                    <span class="reportRevenueSummaryPill amber">

                        AVG

                    </span>

                </div>


            </div>

        `;

        }

    }


    /*====================================================
2. LEAD CONVERSION FUNNEL
====================================================*/

    function renderLeadConversionReport() {

        const records =
            filteredRecords;


        const stages = [

            {
                label:
                    "All Leads",

                key:
                    "all",

                icon:
                    "◎",

                match:
                    function () {

                        return true;

                    }
            },

            {
                label:
                    "Follow Up",

                key:
                    "followup",

                icon:
                    "↻",

                match:
                    reportIsFollowup
            },

            {
                label:
                    "Confirmed",

                key:
                    "confirmed",

                icon:
                    "✓",

                match:
                    function (row) {

                        return reportStatusKey(
                            row
                        )
                            .includes(
                                "confirm"
                            );

                    }
            },

            {
                label:
                    "Processing",

                key:
                    "processing",

                icon:
                    "◌",

                match:
                    function (row) {

                        return reportStatusKey(
                            row
                        )
                            .includes(
                                "process"
                            );

                    }
            },

            {
                label:
                    "Completed",

                key:
                    "completed",

                icon:
                    "★",

                match:
                    reportIsCompleted
            },

            {
                label:
                    "Cancelled",

                key:
                    "cancelled",

                icon:
                    "×",

                match:
                    reportIsCancelled
            }

        ];


        const total =
            records.length;


        const container =
            $("reportLeadFunnel");


        if (!container) {

            return;

        }


        /*================================================
        EMPTY STATE
        ================================================*/

        if (!total) {

            container.innerHTML = `

            <div class="reportFunnelEmpty">

                No lead data available

            </div>

        `;

            return;

        }


        /*================================================
        STAGE DATA
        ================================================*/

        const stageData =
            stages.map(
                function (stage) {

                    const count =
                        records.filter(
                            stage.match
                        )
                            .length;


                    const rate =
                        reportPercent(
                            count,
                            total
                        );


                    return {

                        label:
                            stage.label,

                        key:
                            stage.key,

                        icon:
                            stage.icon,

                        count:
                            count,

                        rate:
                            rate

                    };

                }
            );


        /*================================================
        RENDER FUNNEL
        ================================================*/

        container.innerHTML = `

        <div class="reportModernFunnel">


            ${stageData.map(
            function (
                stage,
                index
            ) {

                const previous =
                    index > 0
                        ? stageData[
                        index - 1
                        ]
                        : null;


                const stageConversion =
                    previous &&
                        previous.count > 0
                        ? reportPercent(
                            stage.count,
                            previous.count
                        )
                        : 100;


                return `

                        <div
                            class="
                                reportModernFunnelRow
                                ${stage.key}
                            "
                        >


                            <!-- =========================
                            STAGE IDENTITY
                            ========================== -->

                            <div class="reportModernFunnelIdentity">

                                <div
                                    class="
                                        reportModernFunnelIcon
                                        ${stage.key}
                                    "
                                >

                                    ${stage.icon}

                                </div>


                                <div class="reportModernFunnelName">

                                    <strong>

                                        ${escapeHTML(
                    stage.label
                )}

                                    </strong>


                                    <span>

                                        Stage
                                        ${index + 1}

                                    </span>

                                </div>

                            </div>


                            <!-- =========================
                            PROGRESS
                            ========================== -->

                            <div class="reportModernFunnelProgress">

                                <div class="reportModernFunnelTrack">

                                    <div
                                        class="
                                            reportModernFunnelFill
                                            ${stage.key}
                                        "
                                        style="
                                            width:${Math.max(
                    2,
                    stage.rate
                )}%;
                                        "
                                    ></div>

                                </div>


                                <div class="reportModernFunnelMeta">

                                    <span>

                                        ${stage.rate.toFixed(
                    1
                )}%
                                        of total leads

                                    </span>


                                    ${index > 0
                        ? `
                                                <span>

                                                    ${stageConversion.toFixed(
                            1
                        )}%
                                                    vs previous stage

                                                </span>
                                            `
                        : `
                                                <span>
                                                    Funnel baseline
                                                </span>
                                            `
                    }

                                </div>

                            </div>


                            <!-- =========================
                            COUNT
                            ========================== -->

                            <div class="reportModernFunnelStats">

                                <div
                                    class="
                                        reportModernFunnelCount
                                        ${stage.key}
                                    "
                                >

                                    ${stage.count}

                                </div>


                                <div
                                    class="
                                        reportModernFunnelRate
                                        ${stage.key}
                                    "
                                >

                                    ${stage.rate.toFixed(
                        1
                    )}%

                                </div>

                            </div>


                        </div>

                    `;

            }
        )
                .join("")}


        </div>

    `;

    }

    /*====================================================
SOURCE VISUAL META
====================================================*/

    function reportSourceVisual(
        source
    ) {

        const value =
            String(
                source ||
                ""
            )
                .trim()
                .toLowerCase();


        /*================================================
        WHATSAPP
        ================================================*/

        if (
            value.includes(
                "whatsapp"
            )
        ) {

            return {

                key:
                    "whatsapp",

                icon:
                    "◉"

            };

        }


        /*================================================
        WEBSITE / WEB
        ================================================*/

        if (
            value.includes(
                "website"
            ) ||
            value ===
            "web" ||
            value.includes(
                "online"
            )
        ) {

            return {

                key:
                    "website",

                icon:
                    "🌐"

            };

        }


        /*================================================
        REFERRAL
        ================================================*/

        if (
            value.includes(
                "referral"
            ) ||
            value.includes(
                "reference"
            ) ||
            value.includes(
                "refer"
            )
        ) {

            return {

                key:
                    "referral",

                icon:
                    "↗"

            };

        }


        /*================================================
        DIRECT
        ================================================*/

        if (
            value.includes(
                "direct"
            ) ||
            value.includes(
                "walk"
            )
        ) {

            return {

                key:
                    "direct",

                icon:
                    "◎"

            };

        }


        /*================================================
        INSTAGRAM
        ================================================*/

        if (
            value.includes(
                "instagram"
            ) ||
            value ===
            "insta"
        ) {

            return {

                key:
                    "instagram",

                icon:
                    "◈"

            };

        }


        /*================================================
        FACEBOOK
        ================================================*/

        if (
            value.includes(
                "facebook"
            ) ||
            value ===
            "fb"
        ) {

            return {

                key:
                    "facebook",

                icon:
                    "f"

            };

        }


        /*================================================
        PHONE / CALL
        ================================================*/

        if (
            value.includes(
                "phone"
            ) ||
            value.includes(
                "call"
            ) ||
            value.includes(
                "mobile"
            )
        ) {

            return {

                key:
                    "phone",

                icon:
                    "☎"

            };

        }


        /*================================================
        EMAIL
        ================================================*/

        if (
            value.includes(
                "email"
            ) ||
            value.includes(
                "mail"
            )
        ) {

            return {

                key:
                    "email",

                icon:
                    "✉"

            };

        }


        /*================================================
        GOOGLE
        ================================================*/

        if (
            value.includes(
                "google"
            )
        ) {

            return {

                key:
                    "google",

                icon:
                    "G"

            };

        }


        /*================================================
        UNKNOWN
        ================================================*/

        if (
            !value ||
            value ===
            "unknown"
        ) {

            return {

                key:
                    "unknown",

                icon:
                    "?"

            };

        }


        /*================================================
        OTHER
        ================================================*/

        return {

            key:
                "other",

            icon:
                "•"

        };

    }

    /*====================================================
3. SOURCE PERFORMANCE
====================================================*/

    function renderSourcePerformanceReport() {

        const groups =
            {};


        /*================================================
        BUILD SOURCE GROUPS
        ================================================*/

        filteredRecords.forEach(
            function (row) {

                const source =
                    String(
                        reportSource(
                            row
                        )
                    )
                        .trim() ||
                    "Unknown";


                if (!groups[source]) {

                    groups[source] = {

                        total:
                            0,

                        completed:
                            0,

                        cancelled:
                            0,

                        revenue:
                            0

                    };

                }


                const group =
                    groups[source];


                /*----------------------------------------
                TOTAL LEADS
                ----------------------------------------*/

                group.total++;


                /*----------------------------------------
                COMPLETED
                ----------------------------------------*/

                if (
                    reportIsCompleted(
                        row
                    )
                ) {

                    group.completed++;

                }


                /*----------------------------------------
                CANCELLED
                ----------------------------------------*/

                if (
                    reportIsCancelled(
                        row
                    )
                ) {

                    group.cancelled++;

                }


                /*----------------------------------------
                REVENUE
                ----------------------------------------*/

                group.revenue +=
                    reportNumber(
                        getRevenue(
                            row
                        )
                    );

            }
        );


        /*================================================
        TABLE BODY
        ================================================*/

        const body =
            $("reportSourceBody");


        if (!body) {

            return;

        }


        /*================================================
        EMPTY STATE
        ================================================*/

        const sourceRows =
            Object.entries(
                groups
            )
                .sort(
                    function (
                        a,
                        b
                    ) {

                        return (
                            b[1].revenue -
                            a[1].revenue
                        );

                    }
                );


        if (
            !sourceRows.length
        ) {

            body.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="reportSourceEmpty"
                >

                    No source performance data available

                </td>

            </tr>

        `;

            return;

        }


        /*================================================
        RENDER
        ================================================*/

        body.innerHTML =
            sourceRows.map(
                function (entry) {

                    const source =
                        entry[0];


                    const item =
                        entry[1];


                    const conversion =
                        reportPercent(
                            item.completed,
                            item.total
                        );


                    const averageValue =
                        reportAverage(
                            item.revenue,
                            item.total
                        );


                    const cancellationRate =
                        reportPercent(
                            item.cancelled,
                            item.total
                        );


                    const visual =
                        reportSourceVisual(
                            source
                        );


                    /*================================================
                    CONVERSION COLOR
                    ================================================*/

                    let conversionClass =
                        "low";


                    if (
                        conversion >=
                        50
                    ) {

                        conversionClass =
                            "high";

                    }
                    else if (
                        conversion >=
                        25
                    ) {

                        conversionClass =
                            "medium";

                    }


                    /*================================================
                    CANCELLATION COLOR
                    ================================================*/

                    let cancellationClass =
                        "good";


                    if (
                        cancellationRate >=
                        30
                    ) {

                        cancellationClass =
                            "high";

                    }
                    else if (
                        cancellationRate >=
                        15
                    ) {

                        cancellationClass =
                            "medium";

                    }


                    return `

                    <tr class="reportSourceRow">


                        <!-- =========================
                        SOURCE
                        ========================== -->

                        <td>

                            <div
                                class="
                                    reportSourceIdentity
                                    ${visual.key}
                                "
                            >

                                <span
                                    class="
                                        reportSourceIcon
                                        ${visual.key}
                                    "
                                >

                                    ${visual.icon}

                                </span>


                                <div class="reportSourceName">

                                    <strong>

                                        ${escapeHTML(
                        source
                    )}

                                    </strong>


                                    <span>

                                        Lead source

                                    </span>

                                </div>

                            </div>

                        </td>


                        <!-- =========================
                        LEADS
                        ========================== -->

                        <td>

                            <span class="reportSourceMetric leads">

                                <span class="reportSourceMetricIcon">
                                    ◎
                                </span>

                                <strong>

                                    ${item.total}

                                </strong>

                                <small>
                                    Leads
                                </small>

                            </span>

                        </td>


                        <!-- =========================
                        COMPLETED
                        ========================== -->

                        <td>

                            <span class="reportSourceMetric completed">

                                <span class="reportSourceMetricIcon">
                                    ✓
                                </span>

                                <strong>

                                    ${item.completed}

                                </strong>

                            </span>

                        </td>


                        <!-- =========================
                        CANCELLED
                        ========================== -->

                        <td>

                            <span
                                class="
                                    reportSourceMetric
                                    cancelled
                                    ${cancellationClass}
                                "
                            >

                                <span class="reportSourceMetricIcon">
                                    ×
                                </span>

                                <strong>

                                    ${item.cancelled}

                                </strong>

                            </span>

                        </td>


                        <!-- =========================
                        CONVERSION
                        ========================== -->

                        <td>

                            <div class="reportSourceConversion">

                                <span
                                    class="
                                        reportSourceConversionPill
                                        ${conversionClass}
                                    "
                                >

                                    <span>
                                        ↗
                                    </span>

                                    ${conversion.toFixed(
                        1
                    )}%

                                </span>


                                <div class="reportSourceConversionTrack">

                                    <div
                                        class="
                                            reportSourceConversionFill
                                            ${conversionClass}
                                        "
                                        style="
                                            width:${Math.min(
                        100,
                        Math.max(
                            2,
                            conversion
                        )
                    )}%;
                                        "
                                    ></div>

                                </div>

                            </div>

                        </td>


                        <!-- =========================
                        REVENUE
                        ========================== -->

                        <td>

                            <span class="reportSourceRevenue">

                                <span class="reportSourceRevenueLabel">

                                    REVENUE

                                </span>


                                <strong>

                                    ${escapeHTML(
                        money(
                            item.revenue
                        )
                    )}

                                </strong>

                            </span>

                        </td>


                        <!-- =========================
                        AVERAGE VALUE
                        ========================== -->

                        <td>

                            <span class="reportSourceAverage">

                                <span class="reportSourceAverageIcon">

                                    ◈

                                </span>


                                <span>

                                    <small>
                                        AVG
                                    </small>


                                    <strong>

                                        ${escapeHTML(
                        money(
                            averageValue
                        )
                    )}

                                    </strong>

                                </span>

                            </span>

                        </td>


                    </tr>

                `;

                }
            )
                .join("");

    }


    /*====================================================
4. SERVICE PROFITABILITY / PERFORMANCE
====================================================*/

    function renderServiceProfitabilityReport() {

        const groups =
            {};


        /*================================================
        BUILD SERVICE GROUPS
        ================================================*/

        filteredRecords.forEach(
            function (row) {

                const service =
                    row._reportService ||
                    "Other";


                if (!groups[service]) {

                    groups[service] = {

                        records:
                            0,

                        completed:
                            0,

                        followup:
                            0,

                        cancelled:
                            0,

                        other:
                            0,

                        revenue:
                            0

                    };

                }


                const group =
                    groups[service];


                /*----------------------------------------
                TOTAL UNIQUE RECORD
                ----------------------------------------*/

                group.records++;


                /*================================================
                IMPORTANT:
                STATUS COUNTS MUST BE MUTUALLY EXCLUSIVE
    
                Priority:
                1. Cancelled
                2. Completed
                3. Follow Up
                4. Other / Open
    
                One booking can enter ONLY one category.
                ================================================*/

                if (
                    reportIsCancelled(
                        row
                    )
                ) {

                    group.cancelled++;

                }
                else if (
                    reportIsCompleted(
                        row
                    )
                ) {

                    group.completed++;

                }
                else if (
                    reportIsFollowup(
                        row
                    )
                ) {

                    group.followup++;

                }
                else {

                    group.other++;

                }


                /*----------------------------------------
                REVENUE
                ----------------------------------------*/

                group.revenue +=
                    reportNumber(
                        getRevenue(
                            row
                        )
                    );

            }
        );


        /*================================================
        TABLE BODY
        ================================================*/

        const body =
            $("reportProfitabilityBody");


        if (!body) {

            return;

        }


        const serviceRows =
            Object.entries(
                groups
            )
                .sort(
                    function (
                        a,
                        b
                    ) {

                        return (
                            b[1].revenue -
                            a[1].revenue
                        );

                    }
                );


        /*================================================
        EMPTY STATE
        ================================================*/

        if (
            !serviceRows.length
        ) {

            body.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="reportServicePerformanceEmpty"
                >

                    No service performance data available

                </td>

            </tr>

        `;

            return;

        }


        /*================================================
        RENDER
        ================================================*/

        body.innerHTML =
            serviceRows.map(
                function (entry) {

                    const service =
                        entry[0];


                    const item =
                        entry[1];


                    const icon =
                        SERVICE_META[
                            service
                        ]?.icon ||
                        "•";


                    const serviceClass =
                        String(
                            service
                        )
                            .trim()
                            .toLowerCase()
                            .replace(
                                /[^a-z0-9]+/g,
                                "-"
                            );


                    /*================================================
                    CONVERSION
    
                    Completed ÷ Total Records
                    ================================================*/

                    const conversion =
                        reportPercent(
                            item.completed,
                            item.records
                        );


                    /*================================================
                    AVERAGE BOOKING VALUE
    
                    Revenue ÷ Total Records
                    ================================================*/

                    const averageValue =
                        reportAverage(
                            item.revenue,
                            item.records
                        );


                    /*================================================
                    FOLLOW UP RATE
                    ================================================*/

                    const followupRate =
                        reportPercent(
                            item.followup,
                            item.records
                        );


                    /*================================================
                    CANCELLATION RATE
                    ================================================*/

                    const cancellationRate =
                        reportPercent(
                            item.cancelled,
                            item.records
                        );


                    /*================================================
                    CONVERSION VISUAL CLASS
                    ================================================*/

                    let conversionClass =
                        "low";


                    if (
                        conversion >=
                        50
                    ) {

                        conversionClass =
                            "high";

                    }
                    else if (
                        conversion >=
                        25
                    ) {

                        conversionClass =
                            "medium";

                    }


                    return `

                    <tr
                        class="
                            reportServicePerformanceRow
                            ${serviceClass}
                        "
                    >


                        <!-- =========================
                        SERVICE
                        ========================== -->

                        <td>

                            <div
                                class="
                                    reportServicePerformanceIdentity
                                    ${serviceClass}
                                "
                            >

                                <span
                                    class="
                                        reportServicePerformanceIcon
                                        ${serviceClass}
                                    "
                                >

                                    ${icon}

                                </span>


                                <div class="reportServicePerformanceName">

                                    <strong>

                                        ${escapeHTML(
                        service
                    )}

                                    </strong>


                                    <span>

                                        Service

                                    </span>

                                </div>

                            </div>

                        </td>


                        <!-- =========================
                        TOTAL RECORDS
                        ========================== -->

                        <td>

                            <span class="reportServiceTotalBadge">

                                <span class="reportServiceTotalIcon">

                                    ◎

                                </span>


                                <strong>

                                    ${item.records}

                                </strong>


                                <small>

                                    Total

                                </small>

                            </span>

                        </td>


                        <!-- =========================
                        COMPLETED
                        ========================== -->

                        <td>

                            <span class="reportServiceStatusMetric completed">

                                <span>

                                    ✓

                                </span>


                                <strong>

                                    ${item.completed}

                                </strong>

                            </span>

                        </td>


                        <!-- =========================
                        FOLLOW UP
                        ========================== -->

                        <td>

                            <div class="reportServiceFollowupMetric">

                                <span class="reportServiceStatusMetric followup">

                                    <span>

                                        ↻

                                    </span>


                                    <strong>

                                        ${item.followup}

                                    </strong>

                                </span>


                                <small>

                                    ${followupRate.toFixed(
                        1
                    )}%

                                </small>

                            </div>

                        </td>


                        <!-- =========================
                        CANCELLED
                        ========================== -->

                        <td>

                            <div class="reportServiceCancelledMetric">

                                <span class="reportServiceStatusMetric cancelled">

                                    <span>

                                        ×

                                    </span>


                                    <strong>

                                        ${item.cancelled}

                                    </strong>

                                </span>


                                ${item.cancelled > 0
                            ? `
                                            <small>

                                                ${cancellationRate.toFixed(
                                1
                            )}%

                                            </small>
                                        `
                            : ""
                        }

                            </div>

                        </td>


                        <!-- =========================
                        REVENUE
                        ========================== -->

                        <td>

                            <div class="reportServiceRevenueBadge">

                                <small>

                                    REVENUE

                                </small>


                                <strong>

                                    ${escapeHTML(
                            money(
                                item.revenue
                            )
                        )}

                                </strong>

                            </div>

                        </td>


                        <!-- =========================
                        AVERAGE VALUE
                        ========================== -->

                        <td>

                            <div class="reportServiceAverageBadge">

                                <span>

                                    ◈

                                </span>


                                <div>

                                    <small>

                                        AVG

                                    </small>


                                    <strong>

                                        ${escapeHTML(
                            money(
                                averageValue
                            )
                        )}

                                    </strong>

                                </div>

                            </div>

                        </td>


                        <!-- =========================
                        CONVERSION
                        ========================== -->

                        <td>

                            <div class="reportServiceConversion">

                                <span
                                    class="
                                        reportServiceConversionBadge
                                        ${conversionClass}
                                    "
                                >

                                    <span>

                                        ↗

                                    </span>


                                    ${conversion.toFixed(
                            1
                        )}%

                                </span>


                                <div class="reportServiceConversionTrack">

                                    <div
                                        class="
                                            reportServiceConversionFill
                                            ${conversionClass}
                                        "
                                        style="
                                            width:${Math.min(
                            100,
                            Math.max(
                                conversion > 0
                                    ? 3
                                    : 0,
                                conversion
                            )
                        )}%;
                                        "
                                    ></div>

                                </div>

                            </div>

                        </td>


                    </tr>

                `;

                }
            )
                .join("");

    }


    /*====================================================
5. CANCELLATION ANALYSIS
====================================================*/

    function renderCancellationAnalysisReport() {

        const records =
            filteredRecords;


        /*================================================
        CANCELLED RECORDS
        ================================================*/

        const cancelled =
            records.filter(
                reportIsCancelled
            );


        /*================================================
        LOST REVENUE
        ================================================*/

        const lostRevenue =
            cancelled.reduce(
                function (
                    total,
                    row
                ) {

                    return total +
                        reportNumber(
                            getRevenue(
                                row
                            )
                        );

                },
                0
            );


        /*================================================
        OVERALL CANCELLATION RATE
        ================================================*/

        const cancellationRate =
            reportPercent(
                cancelled.length,
                records.length
            );


        /*================================================
        KPI CARDS
        ================================================*/

        const kpis =
            $("reportCancellationKpis");


        if (kpis) {

            kpis.innerHTML =

                reportMetricHTML(
                    "Cancelled",
                    cancelled.length,
                    "Bookings",
                    "red"
                ) +

                reportMetricHTML(
                    "Cancellation Rate",
                    cancellationRate.toFixed(
                        1
                    ) + "%",
                    "Of filtered records",
                    cancellationRate >= 25
                        ? "red"
                        : cancellationRate >= 10
                            ? "amber"
                            : "green"
                ) +

                reportMetricHTML(
                    "Lost Revenue",
                    money(
                        lostRevenue
                    ),
                    "Revenue on cancelled records",
                    "red"
                ) +

                reportMetricHTML(
                    "Active / Other",
                    records.length -
                    cancelled.length,
                    "Non-cancelled",
                    "green"
                );

        }


        /*================================================
        GROUP BY SERVICE
        ================================================*/

        const groups =
            {};


        records.forEach(
            function (row) {

                const service =
                    row._reportService ||
                    "Other";


                if (!groups[service]) {

                    groups[service] = {

                        total:
                            0,

                        cancelled:
                            0,

                        lostRevenue:
                            0

                    };

                }


                groups[
                    service
                ].total++;


                if (
                    reportIsCancelled(
                        row
                    )
                ) {

                    groups[
                        service
                    ].cancelled++;


                    groups[
                        service
                    ].lostRevenue +=
                        reportNumber(
                            getRevenue(
                                row
                            )
                        );

                }

            }
        );


        /*================================================
        TABLE BODY
        ================================================*/

        const body =
            $("reportCancellationBody");


        if (!body) {

            return;

        }


        /*================================================
        SORT SERVICES
    
        Highest cancellation rate first.
        If equal, highest lost revenue first.
        ================================================*/

        const serviceRows =
            Object.entries(
                groups
            )
                .sort(
                    function (
                        a,
                        b
                    ) {

                        const rateA =
                            reportPercent(
                                a[1].cancelled,
                                a[1].total
                            );


                        const rateB =
                            reportPercent(
                                b[1].cancelled,
                                b[1].total
                            );


                        if (
                            rateB !==
                            rateA
                        ) {

                            return (
                                rateB -
                                rateA
                            );

                        }


                        return (
                            b[1].lostRevenue -
                            a[1].lostRevenue
                        );

                    }
                );


        /*================================================
        EMPTY STATE
        ================================================*/

        if (
            !serviceRows.length
        ) {

            body.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="reportCancellationEmpty"
                >

                    No cancellation data available

                </td>

            </tr>

        `;

            return;

        }


        /*================================================
        RENDER SERVICE ANALYSIS
        ================================================*/

        body.innerHTML =
            serviceRows.map(
                function (entry) {

                    const service =
                        entry[0];


                    const item =
                        entry[1];


                    const icon =
                        SERVICE_META[
                            service
                        ]?.icon ||
                        "•";


                    const serviceClass =
                        String(
                            service
                        )
                            .trim()
                            .toLowerCase()
                            .replace(
                                /[^a-z0-9]+/g,
                                "-"
                            );


                    /*================================================
                    SERVICE CANCELLATION RATE
                    ================================================*/

                    const rate =
                        reportPercent(
                            item.cancelled,
                            item.total
                        );


                    /*================================================
                    ACTIVE / NON-CANCELLED
                    ================================================*/

                    const active =
                        Math.max(
                            0,
                            item.total -
                            item.cancelled
                        );


                    /*================================================
                    RISK CLASS
    
                    < 10%   = Low
                    10-24.9 = Medium
                    >= 25%  = High
                    ================================================*/

                    let riskClass =
                        "low";


                    let riskLabel =
                        "LOW";


                    if (
                        rate >=
                        25
                    ) {

                        riskClass =
                            "high";


                        riskLabel =
                            "HIGH";

                    }
                    else if (
                        rate >=
                        10
                    ) {

                        riskClass =
                            "medium";


                        riskLabel =
                            "MEDIUM";

                    }


                    return `

                    <tr
                        class="
                            reportCancellationRow
                            ${serviceClass}
                        "
                    >


                        <!-- =========================
                        SERVICE
                        ========================== -->

                        <td>

                            <div class="reportCancellationService">

                                <span
                                    class="
                                        reportCancellationServiceIcon
                                        ${serviceClass}
                                    "
                                >

                                    ${icon}

                                </span>


                                <div class="reportCancellationServiceName">

                                    <strong>

                                        ${escapeHTML(
                        service
                    )}

                                    </strong>


                                    <span>

                                        Service

                                    </span>

                                </div>

                            </div>

                        </td>


                        <!-- =========================
                        TOTAL BOOKINGS
                        ========================== -->

                        <td>

                            <div class="reportCancellationTotal">

                                <span class="reportCancellationTotalIcon">

                                    ◎

                                </span>


                                <div>

                                    <strong>

                                        ${item.total}

                                    </strong>


                                    <small>

                                        TOTAL

                                    </small>

                                </div>

                            </div>

                        </td>


                        <!-- =========================
                        CANCELLED
                        ========================== -->

                        <td>

                            <div class="reportCancellationCountWrap">

                                <span
                                    class="
                                        reportCancellationCount
                                        ${item.cancelled > 0
                            ? "has-cancelled"
                            : "zero"}
                                    "
                                >

                                    <span>

                                        ×

                                    </span>


                                    <strong>

                                        ${item.cancelled}

                                    </strong>

                                </span>


                                <small>

                                    ${active}
                                    active

                                </small>

                            </div>

                        </td>


                        <!-- =========================
                        CANCELLATION RATE
                        ========================== -->

                        <td>

                            <div class="reportCancellationRisk">


                                <div class="reportCancellationRiskTop">

                                    <span
                                        class="
                                            reportCancellationRatePill
                                            ${riskClass}
                                        "
                                    >

                                        ${rate.toFixed(
                                1
                            )}%

                                    </span>


                                    <span
                                        class="
                                            reportCancellationRiskBadge
                                            ${riskClass}
                                        "
                                    >

                                        ${riskLabel}

                                    </span>

                                </div>


                                <div class="reportCancellationRiskTrack">

                                    <div
                                        class="
                                            reportCancellationRiskFill
                                            ${riskClass}
                                        "
                                        style="
                                            width:${Math.min(
                                100,
                                Math.max(
                                    rate > 0
                                        ? 3
                                        : 0,
                                    rate
                                )
                            )}%;
                                        "
                                    ></div>

                                </div>

                            </div>

                        </td>


                        <!-- =========================
                        LOST REVENUE
                        ========================== -->

                        <td>

                            <div
                                class="
                                    reportCancellationLostRevenue
                                    ${item.lostRevenue > 0
                            ? "has-loss"
                            : "no-loss"}
                                "
                            >

                                <span class="reportCancellationLostIcon">

                                    ${item.lostRevenue > 0
                            ? "↓"
                            : "✓"}

                                </span>


                                <div>

                                    <small>

                                        ${item.lostRevenue > 0
                            ? "LOST REVENUE"
                            : "NO LOSS"
                        }

                                    </small>


                                    <strong>

                                        ${escapeHTML(
                            money(
                                item.lostRevenue
                            )
                        )}

                                    </strong>

                                </div>

                            </div>

                        </td>


                    </tr>

                `;

                }
            )
                .join("");

    }


    /*====================================================
6. CUSTOMER VALUE REPORT
====================================================*/

    function renderCustomerValueReport() {

        const groups =
            {};


        /*================================================
        BUILD CUSTOMER GROUPS
        ================================================*/

        filteredRecords.forEach(
            function (row) {

                const customer =
                    getCustomer(
                        row
                    ) ||
                    "Unknown Customer";


                const phone =
                    reportPhone(
                        row
                    );


                /*
                 * Phone is preferred because the same
                 * customer's name may be entered differently.
                 */

                const key =
                    phone
                        ? "phone:" + phone
                        : "name:" +
                        String(
                            customer
                        )
                            .trim()
                            .toLowerCase();


                if (!groups[key]) {

                    groups[key] = {

                        customer:
                            customer,

                        phone:
                            phone,

                        bookings:
                            0,

                        revenue:
                            0,

                        services:
                            new Set(),

                        lastTravel:
                            ""

                    };

                }


                const group =
                    groups[key];


                /*----------------------------------------
                BOOKINGS
                ----------------------------------------*/

                group.bookings++;


                /*----------------------------------------
                REVENUE
                ----------------------------------------*/

                group.revenue +=
                    reportNumber(
                        getRevenue(
                            row
                        )
                    );


                /*----------------------------------------
                SERVICES USED
                ----------------------------------------*/

                if (
                    row._reportService
                ) {

                    group.services.add(
                        row._reportService
                    );

                }


                /*----------------------------------------
                LAST TRAVEL DATE
                ----------------------------------------*/

                const travelKey =
                    reportDateKey(
                        getTravelDate(
                            row
                        )
                    );


                if (
                    travelKey &&
                    (
                        !group.lastTravel ||
                        travelKey >
                        group.lastTravel
                    )
                ) {

                    group.lastTravel =
                        travelKey;

                }

            }
        );


        /*================================================
        CUSTOMER ARRAY
        ================================================*/

        const customers =
            Object.values(
                groups
            );


        /*================================================
        REPEAT CUSTOMERS
        ================================================*/

        const repeatCustomers =
            customers.filter(
                function (item) {

                    return (
                        item.bookings >
                        1
                    );

                }
            )
                .length;


        /*================================================
        CUSTOMER REVENUE
        ================================================*/

        const totalRevenue =
            customers.reduce(
                function (
                    total,
                    item
                ) {

                    return (
                        total +
                        item.revenue
                    );

                },
                0
            );


        /*================================================
        TOP CUSTOMER VALUE
        ================================================*/

        const highest =
            customers.reduce(
                function (
                    max,
                    item
                ) {

                    return Math.max(
                        max,
                        item.revenue
                    );

                },
                0
            );


        /*================================================
        KPI CARDS
        ================================================*/

        const kpis =
            $("reportCustomerValueKpis");


        if (kpis) {

            kpis.innerHTML =

                reportMetricHTML(
                    "Unique Customers",
                    customers.length,
                    "Based on phone/name",
                    "blue"
                ) +

                reportMetricHTML(
                    "Repeat Customers",
                    repeatCustomers,
                    reportPercent(
                        repeatCustomers,
                        customers.length
                    )
                        .toFixed(
                            1
                        ) +
                    "% repeat rate",
                    "purple"
                ) +

                reportMetricHTML(
                    "Customer Revenue",
                    money(
                        totalRevenue
                    ),
                    "Filtered customer value",
                    "green"
                ) +

                reportMetricHTML(
                    "Top Customer Value",
                    money(
                        highest
                    ),
                    "Highest customer value",
                    "teal"
                );

        }


        /*================================================
        TABLE BODY
        ================================================*/

        const body =
            $("reportCustomerValueBody");


        if (!body) {

            return;

        }


        /*================================================
        SORT CUSTOMERS BY VALUE
        ================================================*/

        const sortedCustomers =
            customers.sort(
                function (
                    a,
                    b
                ) {

                    return (
                        b.revenue -
                        a.revenue
                    );

                }
            );


        /*================================================
        EMPTY STATE
        ================================================*/

        if (
            !sortedCustomers.length
        ) {

            body.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="reportCustomerValueEmpty"
                >

                    No customer value data available

                </td>

            </tr>

        `;

            return;

        }


        /*================================================
        RENDER
        ================================================*/

        body.innerHTML =
            sortedCustomers.map(
                function (
                    item,
                    index
                ) {

                    /*================================================
                    CUSTOMER INITIALS
                    ================================================*/

                    const nameParts =
                        String(
                            item.customer ||
                            "Customer"
                        )
                            .trim()
                            .split(
                                /\s+/
                            )
                            .filter(
                                Boolean
                            );


                    let initials =
                        nameParts
                            .slice(
                                0,
                                2
                            )
                            .map(
                                function (part) {

                                    return (
                                        part.charAt(
                                            0
                                        )
                                            .toUpperCase()
                                    );

                                }
                            )
                            .join("");


                    if (!initials) {

                        initials =
                            "?";

                    }


                    /*================================================
                    CUSTOMER TIER
    
                    Presentation only.
                    ================================================*/

                    let tierClass =
                        "new";


                    let tierLabel =
                        "NEW";


                    let tierIcon =
                        "•";


                    if (
                        index === 0 &&
                        item.revenue > 0
                    ) {

                        tierClass =
                            "top";


                        tierLabel =
                            "TOP CUSTOMER";


                        tierIcon =
                            "★";

                    }
                    else if (
                        item.bookings >=
                        3
                    ) {

                        tierClass =
                            "loyal";


                        tierLabel =
                            "LOYAL";


                        tierIcon =
                            "◆";

                    }
                    else if (
                        item.bookings ===
                        2
                    ) {

                        tierClass =
                            "repeat";


                        tierLabel =
                            "REPEAT";


                        tierIcon =
                            "↻";

                    }


                    /*================================================
                    AVERAGE BOOKING VALUE
                    ================================================*/

                    const averageValue =
                        reportAverage(
                            item.revenue,
                            item.bookings
                        );


                    /*================================================
                    SERVICE PILLS
                    ================================================*/

                    const serviceHTML =
                        [
                            ...item.services
                        ]
                            .map(
                                function (
                                    service
                                ) {

                                    const icon =
                                        SERVICE_META[
                                            service
                                        ]?.icon ||
                                        "•";


                                    const serviceClass =
                                        String(
                                            service
                                        )
                                            .trim()
                                            .toLowerCase()
                                            .replace(
                                                /[^a-z0-9]+/g,
                                                "-"
                                            );


                                    return `

                                    <span
                                        class="
                                            reportCustomerServicePill
                                            ${serviceClass}
                                        "
                                    >

                                        <span>

                                            ${icon}

                                        </span>


                                        ${escapeHTML(
                                        service
                                    )}

                                    </span>

                                `;

                                }
                            )
                            .join("");


                    return `

                    <tr class="reportCustomerValueRow">


                        <!-- =========================
                        CUSTOMER
                        ========================== -->

                        <td>

                            <div class="reportCustomerIdentity">

                                <div
                                    class="
                                        reportCustomerAvatar
                                        ${tierClass}
                                    "
                                >

                                    ${escapeHTML(
                        initials
                    )}

                                </div>


                                <div class="reportCustomerIdentityInfo">

                                    <strong class="reportCustomerName">

                                        ${escapeHTML(
                        item.customer
                    )}

                                    </strong>


                                    <span
                                        class="
                                            reportCustomerTier
                                            ${tierClass}
                                        "
                                    >

                                        <span>

                                            ${tierIcon}

                                        </span>


                                        ${tierLabel}

                                    </span>

                                </div>

                            </div>

                        </td>


                        <!-- =========================
                        BOOKINGS
                        ========================== -->

                        <td>

                            <div
                                class="
                                    reportCustomerBookings
                                    ${item.bookings > 1
                            ? "repeat"
                            : "single"}
                                "
                            >

                                <span class="reportCustomerBookingsIcon">

                                    ◎

                                </span>


                                <strong>

                                    ${item.bookings}

                                </strong>


                                <small>

                                    ${item.bookings === 1
                            ? "BOOKING"
                            : "BOOKINGS"}

                                </small>

                            </div>

                        </td>


                        <!-- =========================
                        SERVICES
                        ========================== -->

                        <td>

                            <div class="reportCustomerServices">

                                ${serviceHTML ||
                        `
                                        <span class="reportCustomerNoService">
                                            —
                                        </span>
                                    `
                        }

                            </div>

                        </td>


                        <!-- =========================
                        CUSTOMER REVENUE
                        ========================== -->

                        <td>

                            <div
                                class="
                                    reportCustomerRevenue
                                    ${tierClass}
                                "
                            >

                                <span class="reportCustomerRevenueIcon">

                                    ₹

                                </span>


                                <div>

                                    <small>

                                        CUSTOMER VALUE

                                    </small>


                                    <strong>

                                        ${escapeHTML(
                            money(
                                item.revenue
                            )
                        )}

                                    </strong>

                                </div>

                            </div>

                        </td>


                        <!-- =========================
                        AVG VALUE
                        ========================== -->

                        <td>

                            <div class="reportCustomerAverage">

                                <span class="reportCustomerAverageIcon">

                                    ◈

                                </span>


                                <div>

                                    <small>

                                        AVG / BOOKING

                                    </small>


                                    <strong>

                                        ${escapeHTML(
                            money(
                                averageValue
                            )
                        )}

                                    </strong>

                                </div>

                            </div>

                        </td>


                        <!-- =========================
                        LAST TRAVEL
                        ========================== -->

                        <td>

                            ${item.lastTravel
                            ? `

                                        <div class="reportCustomerTravelDate">

                                            <span>

                                                ◷

                                            </span>


                                            <div>

                                                <small>

                                                    LAST TRAVEL

                                                </small>


                                                <strong>

                                                    ${escapeHTML(
                                formatDate(
                                    item.lastTravel
                                )
                            )}

                                                </strong>

                                            </div>

                                        </div>

                                    `
                            : `

                                        <span class="reportCustomerTravelNone">

                                            No travel date

                                        </span>

                                    `
                        }

                        </td>


                    </tr>

                `;

                }
            )
                .join("");

    }


    /*====================================================
7. UPCOMING TRAVEL REPORT
====================================================*/

    function renderUpcomingTravelReport() {

        const today =
            reportTodayKey();


        const tomorrow =
            reportAddDaysKey(
                1
            );


        const sevenDays =
            reportAddDaysKey(
                7
            );


        const thirtyDays =
            reportAddDaysKey(
                30
            );


        /*================================================
        BUILD UPCOMING TRAVEL LIST
        ================================================*/

        const upcoming =
            filteredRecords
                .map(
                    function (row) {

                        return {

                            row:
                                row,

                            key:
                                reportDateKey(
                                    getTravelDate(
                                        row
                                    )
                                )

                        };

                    }
                )
                .filter(
                    function (item) {

                        return (
                            item.key &&
                            item.key >=
                            today
                        );

                    }
                )
                .sort(
                    function (
                        a,
                        b
                    ) {

                        return (
                            a.key.localeCompare(
                                b.key
                            )
                        );

                    }
                );


        /*================================================
        KPI COUNTS
        ================================================*/

        const todayCount =
            upcoming.filter(
                function (item) {

                    return (
                        item.key ===
                        today
                    );

                }
            )
                .length;


        const tomorrowCount =
            upcoming.filter(
                function (item) {

                    return (
                        item.key ===
                        tomorrow
                    );

                }
            )
                .length;


        const next7 =
            upcoming.filter(
                function (item) {

                    return (
                        item.key >=
                        today &&
                        item.key <=
                        sevenDays
                    );

                }
            )
                .length;


        const next30 =
            upcoming.filter(
                function (item) {

                    return (
                        item.key >=
                        today &&
                        item.key <=
                        thirtyDays
                    );

                }
            )
                .length;


        /*================================================
        KPI CARDS
        ================================================*/

        const kpis =
            $("reportTravelKpis");


        if (kpis) {

            kpis.innerHTML =

                reportMetricHTML(
                    "Today",
                    todayCount,
                    "Travelling today",
                    todayCount
                        ? "red"
                        : "green"
                ) +

                reportMetricHTML(
                    "Tomorrow",
                    tomorrowCount,
                    "Next day departures",
                    "amber"
                ) +

                reportMetricHTML(
                    "Next 7 Days",
                    next7,
                    "Upcoming week",
                    "blue"
                ) +

                reportMetricHTML(
                    "Next 30 Days",
                    next30,
                    "Upcoming month",
                    "purple"
                );

        }


        /*================================================
        TABLE BODY
        ================================================*/

        const body =
            $("reportTravelBody");


        if (!body) {

            return;

        }


        /*================================================
        EMPTY STATE
        ================================================*/

        if (
            !upcoming.length
        ) {

            body.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="reportUpcomingEmpty"
                >

                    <div class="reportUpcomingEmptyState">

                        <span class="reportUpcomingEmptyIcon">
                            ◷
                        </span>

                        <strong>
                            No upcoming travel
                        </strong>

                        <small>
                            No future travel records match the current filters.
                        </small>

                    </div>

                </td>

            </tr>

        `;

            return;

        }


        /*================================================
        RENDER
        ================================================*/

        body.innerHTML =
            upcoming
                .slice(
                    0,
                    100
                )
                .map(
                    function (item) {

                        const row =
                            item.row;


                        const service =
                            row._reportService ||
                            "Other";


                        const status =
                            getStatus(
                                row
                            );


                        const bookingId =
                            getBookingId(
                                row
                            ) ||
                            "—";


                        const customer =
                            getCustomer(
                                row
                            ) ||
                            "Unknown Customer";


                        const passengers =
                            reportPassengers(
                                row
                            );


                        const serviceIcon =
                            SERVICE_META[
                                service
                            ]?.icon ||
                            "•";


                        const serviceClass =
                            String(
                                service
                            )
                                .trim()
                                .toLowerCase()
                                .replace(
                                    /[^a-z0-9]+/g,
                                    "-"
                                );


                        /*================================================
                        TRAVEL URGENCY
                        ================================================*/

                        let travelClass =
                            "upcoming";


                        let travelLabel =
                            "UPCOMING";


                        let travelIcon =
                            "◷";


                        if (
                            item.key ===
                            today
                        ) {

                            travelClass =
                                "today";


                            travelLabel =
                                "TODAY";


                            travelIcon =
                                "●";

                        }
                        else if (
                            item.key ===
                            tomorrow
                        ) {

                            travelClass =
                                "tomorrow";


                            travelLabel =
                                "TOMORROW";


                            travelIcon =
                                "→";

                        }
                        else if (
                            item.key <=
                            sevenDays
                        ) {

                            travelClass =
                                "week";


                            travelLabel =
                                "THIS WEEK";


                            travelIcon =
                                "◈";

                        }


                        /*================================================
                        CUSTOMER INITIALS
                        ================================================*/

                        const nameParts =
                            String(
                                customer
                            )
                                .trim()
                                .split(
                                    /\s+/
                                )
                                .filter(
                                    Boolean
                                );


                        let initials =
                            nameParts
                                .slice(
                                    0,
                                    2
                                )
                                .map(
                                    function (part) {

                                        return (
                                            part.charAt(
                                                0
                                            )
                                                .toUpperCase()
                                        );

                                    }
                                )
                                .join("");


                        if (!initials) {

                            initials =
                                "?";

                        }


                        return `

                        <tr
                            class="
                                reportUpcomingRow
                                ${travelClass}
                            "
                        >


                            <!-- =========================
                            TRAVEL DATE
                            ========================== -->

                            <td>

                                <div
                                    class="
                                        reportUpcomingDate
                                        ${travelClass}
                                    "
                                >

                                    <span
                                        class="
                                            reportUpcomingDateIcon
                                            ${travelClass}
                                        "
                                    >

                                        ${travelIcon}

                                    </span>


                                    <div class="reportUpcomingDateInfo">

                                        <strong>

                                            ${escapeHTML(
                            formatDate(
                                getTravelDate(
                                    row
                                )
                            )
                        )}

                                        </strong>


                                        <span
                                            class="
                                                reportUpcomingUrgency
                                                ${travelClass}
                                            "
                                        >

                                            ${travelLabel}

                                        </span>

                                    </div>

                                </div>

                            </td>


                            <!-- =========================
                            BOOKING ID
                            ========================== -->

                            <td>

                                <span class="reportUpcomingBooking">

                                    <span class="reportUpcomingBookingIcon">

                                        #

                                    </span>


                                    <strong>

                                        ${escapeHTML(
                            bookingId
                        )}

                                    </strong>

                                </span>

                            </td>


                            <!-- =========================
                            CUSTOMER
                            ========================== -->

                            <td>

                                <div class="reportUpcomingCustomer">

                                    <span class="reportUpcomingCustomerAvatar">

                                        ${escapeHTML(
                            initials
                        )}

                                    </span>


                                    <div>

                                        <strong>

                                            ${escapeHTML(
                            customer
                        )}

                                        </strong>


                                        <small>

                                            Traveller

                                        </small>

                                    </div>

                                </div>

                            </td>


                            <!-- =========================
                            SERVICE
                            ========================== -->

                            <td>

                                <span
                                    class="
                                        reportUpcomingService
                                        ${serviceClass}
                                    "
                                >

                                    <span class="reportUpcomingServiceIcon">

                                        ${serviceIcon}

                                    </span>


                                    <strong>

                                        ${escapeHTML(
                            service
                        )}

                                    </strong>

                                </span>

                            </td>


                            <!-- =========================
                            PASSENGERS
                            ========================== -->

                            <td>

                                ${passengers
                                ? `

                                            <span class="reportUpcomingPassengers">

                                                <span>

                                                    ♙

                                                </span>


                                                <strong>

                                                    ${passengers}

                                                </strong>


                                                <small>

                                                    ${Number(passengers) === 1
                                    ? "PAX"
                                    : "PAX"}

                                                </small>

                                            </span>

                                        `
                                : `

                                            <span class="reportUpcomingPassengers none">

                                                <span>
                                                    —
                                                </span>

                                                <small>
                                                    PAX
                                                </small>

                                            </span>

                                        `
                            }

                            </td>


                            <!-- =========================
                            STATUS
                            ========================== -->

                            <td>

                                <div class="reportUpcomingStatus">

                                    <span
                                        class="
                                            reportStatusPill
                                            ${statusClass(
                                status
                            )}
                                        "
                                    >

                                        ${escapeHTML(
                                status ||
                                "—"
                            )}

                                    </span>

                                </div>

                            </td>


                        </tr>

                    `;

                    }
                )
                .join("");

    }


    /*====================================================
8. PASSENGER VOLUME
====================================================*/

    function renderPassengerVolumeReport() {

        const groups =
            {};


        let totalPassengers =
            0;


        let bookingsWithPassengers =
            0;


        /*================================================
        BUILD PASSENGER GROUPS
        ================================================*/

        filteredRecords.forEach(
            function (row) {

                const service =
                    row._reportService ||
                    "Other";


                const passengers =
                    reportPassengers(
                        row
                    );


                if (!groups[service]) {

                    groups[service] = {

                        bookings:
                            0,

                        bookingsWithPax:
                            0,

                        passengers:
                            0,

                        revenue:
                            0

                    };

                }


                const group =
                    groups[service];


                /*----------------------------------------
                TOTAL BOOKINGS
                ----------------------------------------*/

                group.bookings++;


                /*----------------------------------------
                PASSENGER DATA
    
                Only positive passenger counts are treated
                as known passenger data.
                ----------------------------------------*/

                if (
                    passengers >
                    0
                ) {

                    group.passengers +=
                        passengers;


                    group.bookingsWithPax++;


                    totalPassengers +=
                        passengers;


                    bookingsWithPassengers++;

                }


                /*----------------------------------------
                REVENUE
                ----------------------------------------*/

                group.revenue +=
                    reportNumber(
                        getRevenue(
                            row
                        )
                    );

            }
        );


        /*================================================
        OVERALL AVERAGE PASSENGERS
    
        Known passengers ÷ bookings having pax data
        ================================================*/

        const avgPassengers =
            reportAverage(
                totalPassengers,
                bookingsWithPassengers
            );


        /*================================================
        MISSING PASSENGER DATA
        ================================================*/

        const missingPassengerData =
            Math.max(
                0,
                filteredRecords.length -
                bookingsWithPassengers
            );


        /*================================================
        KPI CARDS
        ================================================*/

        const kpis =
            $("reportPassengerKpis");


        if (kpis) {

            kpis.innerHTML =

                reportMetricHTML(
                    "Passengers",
                    totalPassengers,
                    "Known passenger volume",
                    "blue"
                ) +

                reportMetricHTML(
                    "Bookings With Pax",
                    bookingsWithPassengers,
                    "Passenger data available",
                    "purple"
                ) +

                reportMetricHTML(
                    "Avg Pax / Booking",
                    avgPassengers.toFixed(
                        1
                    ),
                    "Where passenger count exists",
                    "teal"
                ) +

                reportMetricHTML(
                    "Missing Pax Data",
                    missingPassengerData,
                    "Records without passenger count",
                    missingPassengerData > 0
                        ? "amber"
                        : "green"
                );

        }


        /*================================================
        TABLE BODY
        ================================================*/

        const body =
            $("reportPassengerBody");


        if (!body) {

            return;

        }


        /*================================================
        SORT BY PASSENGER VOLUME
        ================================================*/

        const serviceRows =
            Object.entries(
                groups
            )
                .sort(
                    function (
                        a,
                        b
                    ) {

                        return (
                            b[1].passengers -
                            a[1].passengers
                        );

                    }
                );


        /*================================================
        EMPTY STATE
        ================================================*/

        if (
            !serviceRows.length
        ) {

            body.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="reportPassengerEmpty"
                >

                    <div class="reportPassengerEmptyState">

                        <span class="reportPassengerEmptyIcon">

                            ♙

                        </span>


                        <strong>

                            No passenger data available

                        </strong>


                        <small>

                            No records match the current report filters.

                        </small>

                    </div>

                </td>

            </tr>

        `;

            return;

        }


        /*================================================
        RENDER SERVICE PASSENGER VOLUME
        ================================================*/

        body.innerHTML =
            serviceRows.map(
                function (entry) {

                    const service =
                        entry[0];


                    const item =
                        entry[1];


                    const icon =
                        SERVICE_META[
                            service
                        ]?.icon ||
                        "•";


                    const serviceClass =
                        String(
                            service
                        )
                            .trim()
                            .toLowerCase()
                            .replace(
                                /[^a-z0-9]+/g,
                                "-"
                            );


                    /*================================================
                    AVG PAX
    
                    IMPORTANT:
                    Divide only by bookings where passenger
                    data actually exists.
                    ================================================*/

                    const averagePax =
                        reportAverage(
                            item.passengers,
                            item.bookingsWithPax
                        );


                    /*================================================
                    PASSENGER VOLUME SHARE
    
                    Service passengers ÷ all known passengers
                    ================================================*/

                    const passengerShare =
                        reportPercent(
                            item.passengers,
                            totalPassengers
                        );


                    /*================================================
                    PAX DATA COVERAGE
    
                    Bookings with passenger data ÷ service bookings
                    ================================================*/

                    const dataCoverage =
                        reportPercent(
                            item.bookingsWithPax,
                            item.bookings
                        );


                    /*================================================
                    MISSING PAX FOR SERVICE
                    ================================================*/

                    const missingPax =
                        Math.max(
                            0,
                            item.bookings -
                            item.bookingsWithPax
                        );


                    /*================================================
                    DATA COVERAGE CLASS
                    ================================================*/

                    let coverageClass =
                        "low";


                    if (
                        dataCoverage >=
                        90
                    ) {

                        coverageClass =
                            "high";

                    }
                    else if (
                        dataCoverage >=
                        60
                    ) {

                        coverageClass =
                            "medium";

                    }


                    return `

                    <tr
                        class="
                            reportPassengerRow
                            ${serviceClass}
                        "
                    >


                        <!-- =========================
                        SERVICE
                        ========================== -->

                        <td>

                            <div class="reportPassengerService">

                                <span
                                    class="
                                        reportPassengerServiceIcon
                                        ${serviceClass}
                                    "
                                >

                                    ${icon}

                                </span>


                                <div class="reportPassengerServiceInfo">

                                    <strong>

                                        ${escapeHTML(
                        service
                    )}

                                    </strong>


                                    <span>

                                        Passenger service

                                    </span>

                                </div>

                            </div>

                        </td>


                        <!-- =========================
                        BOOKINGS
                        ========================== -->

                        <td>

                            <div class="reportPassengerBookings">

                                <span class="reportPassengerBookingsIcon">

                                    ◎

                                </span>


                                <div>

                                    <strong>

                                        ${item.bookings}

                                    </strong>


                                    <small>

                                        BOOKINGS

                                    </small>

                                </div>

                            </div>

                        </td>


                        <!-- =========================
                        PASSENGERS
                        ========================== -->

                        <td>

                            <div class="reportPassengerVolume">


                                <div class="reportPassengerVolumeTop">

                                    <span
                                        class="
                                            reportPassengerCount
                                            ${serviceClass}
                                        "
                                    >

                                        <span>

                                            ♙

                                        </span>


                                        <strong>

                                            ${item.passengers}

                                        </strong>


                                        <small>

                                            PAX

                                        </small>

                                    </span>


                                    <span class="reportPassengerShare">

                                        ${passengerShare.toFixed(
                        1
                    )}%

                                    </span>

                                </div>


                                <div class="reportPassengerVolumeTrack">

                                    <div
                                        class="
                                            reportPassengerVolumeFill
                                            ${serviceClass}
                                        "
                                        style="
                                            width:${Math.min(
                        100,
                        Math.max(
                            passengerShare > 0
                                ? 3
                                : 0,
                            passengerShare
                        )
                    )}%;
                                        "
                                    ></div>

                                </div>


                                <div class="reportPassengerVolumeMeta">

                                    <span>

                                        ${passengerShare.toFixed(
                        1
                    )}% of total volume

                                    </span>

                                </div>

                            </div>

                        </td>


                        <!-- =========================
                        AVG PAX
                        ========================== -->

                        <td>

                            <div class="reportPassengerAverage">

                                <span class="reportPassengerAverageIcon">

                                    ◈

                                </span>


                                <div>

                                    <small>

                                        AVG / BOOKING

                                    </small>


                                    <strong>

                                        ${averagePax.toFixed(
                        1
                    )}

                                        <span>

                                            PAX

                                        </span>

                                    </strong>

                                </div>

                            </div>


                            <div class="reportPassengerCoverage">

                                <span
                                    class="
                                        reportPassengerCoverageDot
                                        ${coverageClass}
                                    "
                                ></span>


                                <span>

                                    ${dataCoverage.toFixed(
                        0
                    )}% data

                                </span>


                                ${missingPax > 0
                            ? `

                                            <span class="reportPassengerMissing">

                                                ${missingPax}
                                                missing

                                            </span>

                                        `
                            : ""
                        }

                            </div>

                        </td>


                        <!-- =========================
                        REVENUE
                        ========================== -->

                        <td>

                            <div class="reportPassengerRevenue">

                                <span class="reportPassengerRevenueIcon">

                                    ₹

                                </span>


                                <div>

                                    <small>

                                        REVENUE

                                    </small>


                                    <strong>

                                        ${escapeHTML(
                            money(
                                item.revenue
                            )
                        )}

                                    </strong>

                                </div>

                            </div>

                        </td>


                    </tr>

                `;

                }
            )
                .join("");

    }


    /*====================================================
9. CRM DATA QUALITY REPORT
====================================================*/

    function renderDataQualityReport() {

        const records =
            filteredRecords;


        /*================================================
        QUALITY CHECK DEFINITIONS
    
        Weight:
        HIGH   = 3
        MEDIUM = 2
        LOW    = 1
        ================================================*/

        const qualityChecks = [

            /*--------------------------------------------
            BOOKING ID
            --------------------------------------------*/

            {
                key:
                    "booking-id",

                icon:
                    "#",

                label:
                    "Missing Booking ID",

                severity:
                    "high",

                weight:
                    3,

                applies:
                    function () {

                        return true;

                    },

                hasIssue:
                    function (row) {

                        return !String(
                            getBookingId(
                                row
                            ) ||
                            ""
                        )
                            .trim();

                    },

                recommendation:
                    "Booking ID should be present for every record."
            },


            /*--------------------------------------------
            CUSTOMER
            --------------------------------------------*/

            {
                key:
                    "customer",

                icon:
                    "◉",

                label:
                    "Missing Customer",

                severity:
                    "high",

                weight:
                    3,

                applies:
                    function () {

                        return true;

                    },

                hasIssue:
                    function (row) {

                        return !String(
                            getCustomer(
                                row
                            ) ||
                            ""
                        )
                            .trim();

                    },

                recommendation:
                    "Add the customer name before processing the booking."
            },


            /*--------------------------------------------
            PHONE
            --------------------------------------------*/

            {
                key:
                    "phone",

                icon:
                    "☎",

                label:
                    "Missing Phone",

                severity:
                    "high",

                weight:
                    3,

                applies:
                    function () {

                        return true;

                    },

                hasIssue:
                    function (row) {

                        return !String(
                            reportPhone(
                                row
                            ) ||
                            ""
                        )
                            .trim();

                    },

                recommendation:
                    "Phone is important for CRM follow-up and customer matching."
            },


            /*--------------------------------------------
            STATUS
            --------------------------------------------*/

            {
                key:
                    "status",

                icon:
                    "◆",

                label:
                    "Missing Status",

                severity:
                    "high",

                weight:
                    3,

                applies:
                    function () {

                        return true;

                    },

                hasIssue:
                    function (row) {

                        return !String(
                            getStatus(
                                row
                            ) ||
                            ""
                        )
                            .trim();

                    },

                recommendation:
                    "Assign a CRM status to every booking or lead."
            },


            /*--------------------------------------------
            TRAVEL DATE
            --------------------------------------------*/

            {
                key:
                    "travel-date",

                icon:
                    "◷",

                label:
                    "Missing Travel Date",

                severity:
                    "medium",

                weight:
                    2,

                applies:
                    function (row) {

                        /*
                         * Cancelled records are retained because
                         * their historical travel date is still
                         * useful for reporting.
                         */

                        return true;

                    },

                hasIssue:
                    function (row) {

                        return !reportDateKey(
                            getTravelDate(
                                row
                            )
                        );

                    },

                recommendation:
                    "Add a valid travel date for reliable operational reporting."
            },


            /*--------------------------------------------
            FOLLOW-UP
            --------------------------------------------*/

            {
                key:
                    "followup",

                icon:
                    "↻",

                label:
                    "Missing Follow Up",

                severity:
                    "medium",

                weight:
                    2,

                applies:
                    function (row) {

                        /*
                         * Follow-up is only expected on
                         * active/open records.
                         */

                        return (
                            !reportIsCompleted(
                                row
                            ) &&
                            !reportIsCancelled(
                                row
                            )
                        );

                    },

                hasIssue:
                    function (row) {

                        /*
                         * reportDateKey() gives a stronger
                         * validation than only checking whether
                         * some raw value exists.
                         */

                        return !reportDateKey(
                            getFollowup(
                                row
                            )
                        );

                    },

                recommendation:
                    "Active leads should normally have a valid next follow-up date."
            },


            /*--------------------------------------------
            ZERO REVENUE
            --------------------------------------------*/

            {
                key:
                    "zero-revenue",

                icon:
                    "₹",

                label:
                    "Zero Revenue",

                severity:
                    "low",

                weight:
                    1,

                applies:
                    function (row) {

                        /*
                         * Revenue is expected only once a record
                         * is completed or confirmed.
                         *
                         * This prevents open enquiries/follow-ups
                         * from incorrectly reducing data quality.
                         */

                        const statusKey =
                            reportStatusKey(
                                row
                            );


                        return (
                            reportIsCompleted(
                                row
                            ) ||
                            statusKey.includes(
                                "confirm"
                            )
                        );

                    },

                hasIssue:
                    function (row) {

                        return (
                            reportNumber(
                                getRevenue(
                                    row
                                )
                            ) <=
                            0
                        );

                    },

                recommendation:
                    "Review confirmed or completed records that have no revenue."
            },


            /*--------------------------------------------
            PASSENGER COUNT
            --------------------------------------------*/

            {
                key:
                    "passenger-count",

                icon:
                    "♙",

                label:
                    "Missing Passenger Count",

                severity:
                    "low",

                weight:
                    1,

                applies:
                    function () {

                        return true;

                    },

                hasIssue:
                    function (row) {

                        return (
                            reportPassengers(
                                row
                            ) <=
                            0
                        );

                    },

                recommendation:
                    "Passenger count improves operational and passenger-volume reporting."
            }

        ];


        /*================================================
        ANALYSE EVERY QUALITY CHECK
        ================================================*/

        const issues =
            qualityChecks.map(
                function (check) {

                    let applicable =
                        0;


                    let count =
                        0;


                    const affectedRows =
                        [];


                    records.forEach(
                        function (
                            row,
                            rowIndex
                        ) {

                            if (
                                !check.applies(
                                    row
                                )
                            ) {

                                return;

                            }


                            applicable++;


                            if (
                                check.hasIssue(
                                    row
                                )
                            ) {

                                count++;


                                affectedRows.push(
                                    rowIndex
                                );

                            }

                        }
                    );


                    const rate =
                        reportPercent(
                            count,
                            applicable
                        );


                    return {

                        key:
                            check.key,

                        icon:
                            check.icon,

                        label:
                            check.label,

                        severity:
                            check.severity,

                        weight:
                            check.weight,

                        recommendation:
                            check.recommendation,

                        count:
                            count,

                        applicable:
                            applicable,

                        rate:
                            rate,

                        affectedRows:
                            affectedRows

                    };

                }
            );


        /*================================================
        ISSUE OCCURRENCES
    
        IMPORTANT:
        This is NOT unique records.
        One record can fail several checks.
        ================================================*/

        const issueOccurrences =
            issues.reduce(
                function (
                    total,
                    issue
                ) {

                    return (
                        total +
                        issue.count
                    );

                },
                0
            );


        /*================================================
        UNIQUE AFFECTED RECORDS
        ================================================*/

        const affectedRecordIndexes =
            new Set();


        issues.forEach(
            function (issue) {

                issue.affectedRows.forEach(
                    function (index) {

                        affectedRecordIndexes.add(
                            index
                        );

                    }
                );

            }
        );


        const affectedRecords =
            affectedRecordIndexes.size;


        /*================================================
        HIGH PRIORITY ISSUE OCCURRENCES
        ================================================*/

        const highPriorityIssues =
            issues
                .filter(
                    function (issue) {

                        return (
                            issue.severity ===
                            "high"
                        );

                    }
                )
                .reduce(
                    function (
                        total,
                        issue
                    ) {

                        return (
                            total +
                            issue.count
                        );

                    },
                    0
                );


        /*================================================
        WEIGHTED QUALITY SCORE
    
        Each check contributes only when it applies.
    
        Example:
        Missing Booking ID:
            weight 3
    
        Missing Passenger Count:
            weight 1
    
        Therefore critical CRM fields have a larger
        effect on the final quality score.
        ================================================*/

        const maximumWeightedPoints =
            issues.reduce(
                function (
                    total,
                    issue
                ) {

                    return (
                        total +
                        (
                            issue.applicable *
                            issue.weight
                        )
                    );

                },
                0
            );


        const lostWeightedPoints =
            issues.reduce(
                function (
                    total,
                    issue
                ) {

                    return (
                        total +
                        (
                            issue.count *
                            issue.weight
                        )
                    );

                },
                0
            );


        const qualityScore =
            maximumWeightedPoints > 0

                ? Math.max(
                    0,
                    Math.min(
                        100,
                        (
                            1 -
                            (
                                lostWeightedPoints /
                                maximumWeightedPoints
                            )
                        ) *
                        100
                    )
                )

                : 100;


        /*================================================
        KPI CARDS
        ================================================*/

        const kpis =
            $("reportQualityKpis");


        if (kpis) {

            kpis.innerHTML =

                reportMetricHTML(
                    "Quality Score",
                    qualityScore.toFixed(
                        1
                    ) + "%",
                    "Weighted CRM completeness",
                    qualityScore >= 90
                        ? "green"
                        : qualityScore >= 75
                            ? "amber"
                            : "red"
                ) +

                reportMetricHTML(
                    "Issue Occurrences",
                    issueOccurrences,
                    affectedRecords +
                    " affected record" +
                    (
                        affectedRecords === 1
                            ? ""
                            : "s"
                    ),
                    issueOccurrences
                        ? "amber"
                        : "green"
                ) +

                reportMetricHTML(
                    "High Priority",
                    highPriorityIssues,
                    "Critical field gaps",
                    highPriorityIssues
                        ? "red"
                        : "green"
                ) +

                reportMetricHTML(
                    "Records Checked",
                    records.length,
                    "Filtered dataset",
                    "blue"
                );

        }


        /*================================================
        TABLE BODY
        ================================================*/

        const body =
            $("reportQualityBody");


        if (!body) {

            return;

        }


        /*================================================
        SEVERITY SORT
    
        HIGH → MEDIUM → LOW
        Within same severity:
        highest issue count first.
        ================================================*/

        const severityOrder = {

            high:
                3,

            medium:
                2,

            low:
                1

        };


        const sortedIssues =
            issues
                .slice()
                .sort(
                    function (
                        a,
                        b
                    ) {

                        const severityDifference =
                            (
                                severityOrder[
                                b.severity
                                ] ||
                                0
                            ) -
                            (
                                severityOrder[
                                a.severity
                                ] ||
                                0
                            );


                        if (
                            severityDifference !==
                            0
                        ) {

                            return severityDifference;

                        }


                        return (
                            b.count -
                            a.count
                        );

                    }
                );


        /*================================================
        RENDER
        ================================================*/

        body.innerHTML =
            sortedIssues.map(
                function (issue) {

                    /*----------------------------------------
                    HEALTH CLASS
    
                    No issue     → healthy
                    < 10%        → low
                    10 - 24.9%   → medium
                    >= 25%       → high
                    ----------------------------------------*/

                    let impactClass =
                        "healthy";


                    if (
                        issue.count >
                        0
                    ) {

                        if (
                            issue.rate >=
                            25
                        ) {

                            impactClass =
                                "high";

                        }
                        else if (
                            issue.rate >=
                            10
                        ) {

                            impactClass =
                                "medium";

                        }
                        else {

                            impactClass =
                                "low";

                        }

                    }


                    return `

                    <tr
                        class="
                            reportQualityRow
                            ${issue.count
                            ? "has-issue"
                            : "healthy"}
                        "
                    >


                        <!-- =========================
                        QUALITY CHECK
                        ========================== -->

                        <td>

                            <div class="reportQualityCheck">

                                <span
                                    class="
                                        reportQualityCheckIcon
                                        ${issue.severity}
                                    "
                                >

                                    ${issue.icon}

                                </span>


                                <div class="reportQualityCheckInfo">

                                    <strong>

                                        ${escapeHTML(
                                issue.label
                            )}

                                    </strong>


                                    <span>

                                        ${issue.applicable
                            ? issue.applicable +
                            " applicable records"
                            : "Not applicable"
                        }

                                    </span>

                                </div>

                            </div>

                        </td>


                        <!-- =========================
                        ISSUE COUNT
                        ========================== -->

                        <td>

                            <div class="reportQualityIssueMetric">


                                <div class="reportQualityIssueTop">

                                    <span
                                        class="
                                            reportQualityIssueCount
                                            ${issue.count
                            ? impactClass
                            : "healthy"}
                                        "
                                    >

                                        <span>

                                            ${issue.count
                            ? "!"
                            : "✓"}

                                        </span>


                                        <strong>

                                            ${issue.count}

                                        </strong>


                                        <small>

                                            ${issue.count === 1
                            ? "ISSUE"
                            : "ISSUES"
                        }

                                        </small>

                                    </span>


                                    ${issue.applicable > 0
                            ? `

                                                <span class="reportQualityIssueRate">

                                                    ${issue.rate.toFixed(
                                1
                            )}%

                                                </span>

                                            `
                            : ""
                        }

                                </div>


                                ${issue.applicable > 0
                            ? `

                                            <div class="reportQualityIssueTrack">

                                                <div
                                                    class="
                                                        reportQualityIssueFill
                                                        ${impactClass}
                                                    "
                                                    style="
                                                        width:${Math.min(
                                100,
                                Math.max(
                                    issue.rate > 0
                                        ? 3
                                        : 0,
                                    issue.rate
                                )
                            )}%;
                                                    "
                                                ></div>

                                            </div>

                                        `
                            : ""
                        }

                            </div>

                        </td>


                        <!-- =========================
                        SEVERITY
                        ========================== -->

                        <td>

                            <div class="reportQualitySeverityWrap">

                                <span
                                    class="
                                        reportQualitySeverity
                                        ${issue.severity}
                                    "
                                >

                                    <span class="reportQualitySeverityDot"></span>


                                    ${escapeHTML(
                            issue.severity
                                .toUpperCase()
                        )}

                                </span>


                                <small>

                                    Weight
                                    ${issue.weight}

                                </small>

                            </div>

                        </td>


                        <!-- =========================
                        RECOMMENDATION
                        ========================== -->

                        <td>

                            <div
                                class="
                                    reportQualityRecommendation
                                    ${issue.count
                            ? issue.severity
                            : "healthy"}
                                "
                            >

                                <span class="reportQualityRecommendationIcon">

                                    ${issue.count
                            ? "→"
                            : "✓"}

                                </span>


                                <div>

                                    <small>

                                        ${issue.count
                            ? "RECOMMENDATION"
                            : "CHECK PASSED"
                        }

                                    </small>


                                    <strong>

                                        ${issue.count
                            ? escapeHTML(
                                issue.recommendation
                            )
                            : "No issue found in the current filtered records."
                        }

                                    </strong>

                                </div>

                            </div>

                        </td>


                    </tr>

                `;

                }
            )
                .join("");

    }


    /*====================================================
    RENDER ALL ADVANCED REPORTS
    ====================================================*/

    function renderAdvancedReports() {

        renderSalesRevenueReport();

        renderLeadConversionReport();

        renderSourcePerformanceReport();

        renderServiceProfitabilityReport();

        renderCancellationAnalysisReport();

        renderCustomerValueReport();

        renderUpcomingTravelReport();

        renderPassengerVolumeReport();

        renderDataQualityReport();

    }


    /*====================================================
    ADVANCED REPORT TAB SWITCHING
    ====================================================*/

    function bindAdvancedReportTabs() {

        document.querySelectorAll(
            "[data-advanced-report]"
        )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            const target =
                                button.dataset
                                    .advancedReport;


                            document.querySelectorAll(
                                "[data-advanced-report]"
                            )
                                .forEach(
                                    function (item) {

                                        item.classList.remove(
                                            "active"
                                        );

                                    }
                                );


                            document.querySelectorAll(
                                "[data-advanced-content]"
                            )
                                .forEach(
                                    function (item) {

                                        item.classList.remove(
                                            "active"
                                        );

                                    }
                                );


                            button.classList.add(
                                "active"
                            );


                            const panel =
                                document.querySelector(
                                    '[data-advanced-content="' +
                                    target +
                                    '"]'
                                );


                            if (panel) {

                                panel.classList.add(
                                    "active"
                                );

                            }

                        }
                    );

                }
            );

    }



    /*================================================
    RENDER EVERYTHING
    ================================================*/

    function render() {

        renderPeriod();

        renderKpis();

        renderServicePerformance();

        renderStatusDistribution();

        renderFollowupHealth();

        renderTopCustomers();

        renderServiceTable();

        renderDetailTable();

        renderHealth();

        renderAdvancedReports();

    }


    /*================================================
    KPI
    ================================================*/

    function renderKpis() {

        const total =
            filteredRecords.length;


        const revenue =
            filteredRecords.reduce(
                (sum, row) =>
                    sum +
                    getRevenue(row),
                0
            );


        const completed =
            filteredRecords.filter(
                row =>
                    getStatusKey(
                        getStatus(row)
                    ) ===
                    "completed"
            )
                .length;


        const confirmed =
            filteredRecords.filter(
                row =>
                    getStatusKey(
                        getStatus(row)
                    ) ===
                    "confirmed"
            )
                .length;


        const followups =
            filteredRecords.filter(
                row => {

                    const s =
                        getStatusKey(
                            getStatus(row)
                        );


                    return (
                        s === "followup"
                    );

                }
            );


        const conversion =
            total
                ? (
                    completed /
                    total
                ) * 100
                : 0;


        $("reportRevenue").textContent =
            money(revenue);


        $("reportBookings").textContent =
            total.toLocaleString(
                "en-IN"
            );


        $("reportConversion").textContent =
            conversion.toFixed(1) +
            "%";


        $("reportFollowups").textContent =
            followups.length;


        $("reportRevenuePerBooking").textContent =
            total
                ? money(
                    revenue /
                    total
                ) +
                " avg"

                : "₹0 avg";


        $("reportCompletedBookings").textContent =
            completed +
            " completed";


        $("reportConfirmedBookings").textContent =
            confirmed +
            " confirmed";


        const health =
            calculateFollowupHealth(
                filteredRecords
            );


        $("reportFollowupToday").textContent =
            health.today +
            " today";


        $("reportFollowupOverdue").textContent =
            health.overdue +
            " overdue";

    }


    /*================================================
    SERVICE PERFORMANCE
    ================================================*/

    function getServiceSummary(records) {

        return Object.keys(
            SERVICE_META
        )
            .map(
                function (service) {

                    const rows =
                        records.filter(
                            row =>
                                row._reportService ===
                                service
                        );


                    const completed =
                        rows.filter(
                            row =>
                                getStatusKey(
                                    getStatus(row)
                                ) ===
                                "completed"
                        )
                            .length;


                    const followup =
                        rows.filter(
                            row =>
                                getStatusKey(
                                    getStatus(row)
                                ) ===
                                "followup"
                        )
                            .length;


                    const cancelled =
                        rows.filter(
                            row =>
                                getStatusKey(
                                    getStatus(row)
                                ) ===
                                "cancelled"
                        )
                            .length;


                    const revenue =
                        rows.reduce(
                            (sum, row) =>
                                sum +
                                getRevenue(row),
                            0
                        );


                    return {

                        service,

                        icon:
                            SERVICE_META[
                                service
                            ].icon,

                        records:
                            rows.length,

                        completed,

                        followup,

                        cancelled,

                        revenue,

                        conversion:
                            rows.length
                                ? (
                                    completed /
                                    rows.length
                                ) * 100
                                : 0

                    };

                }
            );

    }


    function renderServicePerformance() {

        const container =
            $("reportServicePerformance");


        const summary =
            getServiceSummary(
                filteredRecords
            );


        const maximum =
            Math.max(
                1,
                ...summary.map(
                    item =>
                        item.records
                )
            );


        container.innerHTML =
            summary.map(
                function (item) {

                    const width =
                        (
                            item.records /
                            maximum
                        ) * 100;


                    return `

                        <div class="reportServiceRow">

                            <div class="reportServiceName">

                                <span>
                                    ${item.icon}
                                </span>

                                <span>
                                    ${escapeHTML(
                        item.service
                    )}
                                </span>

                            </div>


                            <div class="reportServiceBar">
<div
    class="
        reportServiceBarFill
        ${item.service.toLowerCase()}
    "
    style="width:${width}%"
></div>

                            </div>


                            <div class="reportServiceRecords">

                                ${item.records}

                            </div>


                            <div class="reportServiceRevenue">

                                ${escapeHTML(
                        money(
                            item.revenue
                        )
                    )}

                            </div>

                        </div>

                    `;

                }
            )
                .join("");


        $("reportServiceCount").textContent =
            filteredRecords.length +
            " records";

    }


    /*================================================
    STATUS DISTRIBUTION
    ================================================*/

    function renderStatusDistribution() {

        const counts =
            new Map();


        filteredRecords.forEach(
            function (row) {

                const status =
                    normalizeStatus(
                        getStatus(row)
                    ) ||
                    "Unknown";


                counts.set(
                    status,
                    (
                        counts.get(
                            status
                        ) ||
                        0
                    ) +
                    1
                );

            }
        );


        const items =
            Array.from(
                counts.entries()
            )
                .sort(
                    (a, b) =>
                        b[1] -
                        a[1]
                );


        const total =
            filteredRecords.length;


        $("reportDonutTotal").textContent =
            total;


        const group =
            $("reportDonutSegments");


        group.innerHTML =
            "";


        const radius =
            46;


        const circumference =
            2 *
            Math.PI *
            radius;


        let offset =
            0;


        items.forEach(
            function (
                [status, count],
                index
            ) {

                if (!total) {

                    return;

                }


                const portion =
                    count /
                    total;


                const length =
                    circumference *
                    portion;


                const circle =
                    document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "circle"
                    );


                circle.setAttribute(
                    "cx",
                    "60"
                );


                circle.setAttribute(
                    "cy",
                    "60"
                );


                circle.setAttribute(
                    "r",
                    radius
                );


                circle.setAttribute(
                    "fill",
                    "none"
                );


                circle.setAttribute(
                    "stroke",
                    STATUS_COLORS[
                    index %
                    STATUS_COLORS.length
                    ]
                );


                circle.setAttribute(
                    "stroke-width",
                    "13"
                );


                circle.setAttribute(
                    "stroke-dasharray",
                    `${length} ${circumference - length}`
                );


                circle.setAttribute(
                    "stroke-dashoffset",
                    String(
                        -offset
                    )
                );


                group.appendChild(
                    circle
                );


                offset +=
                    length;

            }
        );


        $("reportStatusLegend").innerHTML =
            items.map(
                function (
                    [status, count],
                    index
                ) {

                    return `

                        <div class="reportLegendRow">

                            <span
                                class="reportLegendDot"
                                style="
                                    background:
                                    ${STATUS_COLORS[
                        index %
                        STATUS_COLORS.length
                        ]}
                                "
                            ></span>

                            <span class="reportLegendLabel">

                                ${escapeHTML(
                            status
                        )}

                            </span>

                            <strong class="reportLegendValue">

                                ${count}

                            </strong>

                        </div>

                    `;

                }
            )
                .join("");

    }


    /*================================================
FOLLOW UP HEALTH
================================================*/

    function calculateFollowupHealth(
        records
    ) {

        const today =
            todayKey();


        let overdue =
            0;


        let dueToday =
            0;


        let future =
            0;


        let noFollowup =
            0;


        let active =
            0;


        records.forEach(
            function (row) {

                /*
                 * Completed and cancelled records
                 * should not affect follow-up health.
                 */

                if (
                    reportIsCompleted(row) ||
                    reportIsCancelled(row)
                ) {

                    return;

                }


                active++;


                const follow =
                    dateKey(
                        getFollowup(row)
                    );


                if (!follow) {

                    noFollowup++;

                    return;

                }


                if (
                    follow <
                    today
                ) {

                    overdue++;

                }
                else if (
                    follow ===
                    today
                ) {

                    dueToday++;

                }
                else {

                    future++;

                }

            }
        );


        return {

            overdue,

            today:
                dueToday,

            future,

            noFollowup,

            active

        };

    }


    function renderFollowupHealth() {

        const health =
            calculateFollowupHealth(
                filteredRecords
            );


        $("reportOverdueMetric").textContent =
            health.overdue;


        $("reportTodayMetric").textContent =
            health.today;


        $("reportFutureMetric").textContent =
            health.future;


        $("reportNoFollowupMetric").textContent =
            health.noFollowup;

    }


    /*================================================
    TOP CUSTOMERS
    ================================================*/

    function renderTopCustomers() {

        const customers =
            new Map();


        filteredRecords.forEach(
            function (row) {

                const name =
                    safeText(
                        getCustomer(row)
                    )
                        .trim() ||
                    "Customer";


                if (
                    !customers.has(name)
                ) {

                    customers.set(
                        name,
                        {
                            name,
                            revenue: 0,
                            records: 0
                        }
                    );

                }


                const customer =
                    customers.get(
                        name
                    );


                customer.records++;

                customer.revenue +=
                    getRevenue(row);

            }
        );


        const items =
            Array.from(
                customers.values()
            )
                .sort(
                    function (a, b) {

                        if (
                            b.revenue !==
                            a.revenue
                        ) {

                            return (
                                b.revenue -
                                a.revenue
                            );

                        }


                        return (
                            b.records -
                            a.records
                        );

                    }
                )
                .slice(
                    0,
                    5
                );


        const container =
            $("reportTopCustomers");


        if (
            !items.length
        ) {

            container.innerHTML = `

                <div class="reportEmpty">

                    <strong>
                        No customer data
                    </strong>

                </div>

            `;


            return;

        }


        container.innerHTML =
            items.map(
                function (item) {

                    const initial =
                        item.name
                            .charAt(0)
                            .toUpperCase();


                    return `

                        <div class="reportCustomerRow">

                            <div class="reportCustomerAvatar">

                                ${escapeHTML(
                        initial
                    )}

                            </div>


                            <div>

                                <div class="reportCustomerName">

                                    ${escapeHTML(
                        item.name
                    )}

                                </div>

<div class="reportCustomerMeta">

    <span class="reportCustomerBookingBadge">

        🧳

        ${item.records}

        booking${item.records !== 1
                            ? "s"
                            : ""
                        }

    </span>

</div>

                            </div>


                            <div class="reportCustomerValue">

                                <strong>

                                    ${escapeHTML(
                            money(
                                item.revenue
                            )
                        )}

                                </strong>

                                <span>
                                    Revenue
                                </span>

                            </div>

                        </div>

                    `;

                }
            )
                .join("");

    }


    /*================================================
    SERVICE TABLE
    ================================================*/

    function renderServiceTable() {

        const summary =
            getServiceSummary(
                filteredRecords
            );


        const body =
            $("reportServiceTableBody");


        if (!body) {

            return;

        }


        body.innerHTML =
            summary
                .map(
                    function (item) {

                        /*
                         * Safe service class:
                         *
                         * Flight  -> flight
                         * Train   -> train
                         * Bus     -> bus
                         * Car     -> car
                         * Package -> package
                         * Quote   -> quote
                         */

                        const serviceClass =
                            String(
                                item.service || ""
                            )
                                .trim()
                                .toLowerCase()
                                .replace(
                                    /[^a-z0-9]+/g,
                                    "-"
                                );


                        return `

                        <tr>


                            <!-- =====================================
                            SERVICE
                            ====================================== -->

                            <td>

                                <div class="reportOverviewService">

                                    <span
                                        class="
                                            reportOverviewServiceIcon
                                            ${serviceClass}
                                        "
                                    >

                                        ${item.icon}

                                    </span>


                                    <span class="reportOverviewServiceName">

                                        ${escapeHTML(
                            item.service
                        )}

                                    </span>

                                </div>

                            </td>


                            <!-- =====================================
                            RECORDS
                            ====================================== -->

                            <td>

                                <span class="reportOverviewRecords">

                                    ${item.records}

                                </span>

                            </td>


                            <!-- =====================================
                            COMPLETED
                            ====================================== -->

                            <td>

                                <span class="reportOverviewDone">

                                    ${item.completed}

                                </span>

                            </td>


                            <!-- =====================================
                            FOLLOW UP
                            ====================================== -->

                            <td>

                                <span class="reportOverviewFollow">

                                    ${item.followup}

                                </span>

                            </td>


                            <!-- =====================================
                            CANCELLED
                            ====================================== -->

                            <td>

                                <span class="reportOverviewCancelled">

                                    ${item.cancelled}

                                </span>

                            </td>


                            <!-- =====================================
                            REVENUE
                            ====================================== -->

                            <td class="reportRevenueCell">

                                ${escapeHTML(
                            money(
                                item.revenue
                            )
                        )}

                            </td>


                            <!-- =====================================
                            CONVERSION
                            ====================================== -->

                            <td>

                                <span class="reportConversionBadge">

                                    ${item.conversion
                                .toFixed(1)}%

                                </span>

                            </td>


                        </tr>

                    `;

                    }
                )
                .join("");

    }


    /*================================================
    DETAIL TABLE
    ================================================*/

    function statusClass(status) {

        switch (
        getStatusKey(status)
        ) {

            case "completed":

                return "completed";


            case "followup":

                return "followup";


            case "cancelled":

                return "cancelled";


            case "confirmed":

                return "confirmed";


            default:

                return "";

        }

    }


    /*================================================
BOOKING REPORT FOLLOW-UP STATE
================================================*/

    function getReportFollowupState(
        value
    ) {

        const followupKey =
            dateKey(
                value
            );


        if (!followupKey) {

            return "none";

        }


        const today =
            todayKey();


        if (
            followupKey <
            today
        ) {

            return "overdue";

        }


        if (
            followupKey ===
            today
        ) {

            return "today";

        }


        return "future";

    }

    /*================================================
BOOKING REPORT
================================================*/

    function renderDetailTable() {

        const body =
            $("reportDetailBody");


        const empty =
            $("reportEmpty");


        const recordCount =
            $("reportRecordCount");


        if (!body) {

            return;

        }


        /*================================================
        RECORD COUNT
        ================================================*/

        if (recordCount) {

            recordCount.textContent =
                filteredRecords.length +
                (
                    filteredRecords.length === 1
                        ? " record"
                        : " records"
                );

        }


        /*================================================
        EMPTY
        ================================================*/

        if (
            !filteredRecords.length
        ) {

            body.innerHTML =
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


        /*================================================
        ROWS
        ================================================*/

        body.innerHTML =
            filteredRecords
                .map(
                    function (row) {

                        /*----------------------------------
                        BOOKING
                        ----------------------------------*/

                        const booking =
                            getBookingId(
                                row
                            );


                        /*----------------------------------
                        CUSTOMER
                        ----------------------------------*/

                        const customer =
                            getCustomer(
                                row
                            );


                        const customerInitial =
                            String(
                                customer ||
                                "C"
                            )
                                .trim()
                                .charAt(0)
                                .toUpperCase();


                        /*----------------------------------
                        SERVICE
                        ----------------------------------*/

                        const service =
                            row._reportService ||
                            "Service";


                        const icon =
                            SERVICE_META[
                                service
                            ]?.icon ||
                            "•";


                        const serviceClass =
                            String(
                                service
                            )
                                .trim()
                                .toLowerCase()
                                .replace(
                                    /[^a-z0-9]+/g,
                                    "-"
                                );


                        /*----------------------------------
                        STATUS
                        ----------------------------------*/

                        const status =
                            getStatus(
                                row
                            );


                        const currentStatusClass =
                            statusClass(
                                status
                            );


                        /*----------------------------------
                        TRAVEL
                        ----------------------------------*/

                        const travelDate =
                            formatDate(
                                getTravelDate(
                                    row
                                )
                            );


                        /*----------------------------------
                        FOLLOW UP
                        ----------------------------------*/

                        const rawFollowup =
                            getFollowup(
                                row
                            );


                        const followupDate =
                            formatDate(
                                rawFollowup
                            );


                        const followupState =
                            getReportFollowupState(
                                rawFollowup
                            );


                        /*----------------------------------
                        REVENUE
                        ----------------------------------*/

                        const revenue =
                            getRevenue(
                                row
                            );


                        const revenueClass =
                            revenue > 0
                                ? "hasRevenue"
                                : "noRevenue";


                        return `

                        <tr
                            class="
                                reportBookingRow
                                ${serviceClass}
                            "
                        >


                            <!-- =========================
                            BOOKING ID
                            ========================== -->

                            <td>

                                <span class="reportBookingIdBadge">

                                    <span class="reportBookingIdIcon">
                                        #
                                    </span>

                                    <span>

                                        ${escapeHTML(
                            booking ||
                            "—"
                        )}

                                    </span>

                                </span>

                            </td>


                            <!-- =========================
                            CUSTOMER
                            ========================== -->

                            <td>

                                <div class="reportBookingCustomer">

                                    <span class="reportBookingCustomerAvatar">

                                        ${escapeHTML(
                            customerInitial
                        )}

                                    </span>


                                    <span class="reportBookingCustomerName">

                                        ${escapeHTML(
                            customer
                        )}

                                    </span>

                                </div>

                            </td>


                            <!-- =========================
                            SERVICE
                            ========================== -->

                            <td>

                                <span
                                    class="
                                        reportDetailService
                                        ${serviceClass}
                                    "
                                >

                                    <span class="reportDetailServiceIcon">

                                        ${icon}

                                    </span>

                                    <span>

                                        ${escapeHTML(
                            service
                        )}

                                    </span>

                                </span>

                            </td>


                            <!-- =========================
                            TRAVEL DATE
                            ========================== -->

                            <td>

                                <span class="reportTravelDateBadge">

                                    <span>
                                        ◷
                                    </span>

                                    ${escapeHTML(
                            travelDate
                        )}

                                </span>

                            </td>


                            <!-- =========================
                            STATUS
                            ========================== -->

                            <td>

                                <span
                                    class="
                                        reportStatusPill
                                        ${currentStatusClass}
                                    "
                                >

                                    <span class="reportStatusDot"></span>

                                    ${escapeHTML(
                            status
                        )}

                                </span>

                            </td>


                            <!-- =========================
                            FOLLOW UP
                            ========================== -->

                            <td>

                                <span
                                    class="
                                        reportFollowupBadge
                                        ${followupState}
                                    "
                                >

                                    <span class="reportFollowupIcon">

                                        ${followupState === "overdue"
                                ? "⏰"

                                : followupState === "today"
                                    ? "📅"

                                    : followupState === "future"
                                        ? "🗓"

                                        : "—"
                            }

                                    </span>


                                    <span>

                                        ${escapeHTML(
                                followupDate
                            )}

                                    </span>

                                </span>

                            </td>


                            <!-- =========================
                            REVENUE
                            ========================== -->

                            <td>

                                <span
                                    class="
                                        reportBookingRevenue
                                        ${revenueClass}
                                    "
                                >

                                    ${revenue > 0
                                ? "₹"
                                : ""
                            }

                                    <span>

                                        ${revenue > 0
                                ? escapeHTML(
                                    Number(
                                        revenue
                                    )
                                        .toLocaleString(
                                            "en-IN"
                                        )
                                )

                                : "—"
                            }

                                    </span>

                                </span>

                            </td>


                        </tr>

                    `;

                    }
                )
                .join("");

    }


    /*================================================
HEALTH
================================================*/

    function renderHealth() {

        const health =
            calculateFollowupHealth(
                filteredRecords
            );


        const total =
            health.active;


        const label =
            $("reportHealthLabel");


        const pulse =
            document.querySelector(
                ".reportHealthPulse"
            );


        if (!label) {

            return;

        }


        /*============================================
        RESET HEALTH CLASSES
        ============================================*/

        if (pulse) {

            pulse.classList.remove(
                "healthy",
                "monitor",
                "attention",
                "no-data"
            );

        }


        /*============================================
        NO ACTIVE FOLLOW-UP RECORDS
        ============================================*/

        if (!total) {

            label.textContent =
                "No Active Follow-ups";


            if (pulse) {

                pulse.classList.add(
                    "no-data"
                );

            }


            return;

        }


        /*============================================
        FOLLOW-UP HEALTH RATIO
        ============================================*/

        const ratio =
            health.overdue /
            total;


        /*============================================
        NEEDS ATTENTION
        25% OR MORE ACTIVE RECORDS OVERDUE
        ============================================*/

        if (
            ratio >= .25
        ) {

            label.textContent =
                "Follow-up Alert";


            if (pulse) {

                pulse.classList.add(
                    "attention"
                );

            }

        }


        /*============================================
        MONITOR
        10% - 24.99% OVERDUE
        ============================================*/

        else if (
            ratio >= .10
        ) {

            label.textContent =
                "Follow-up Watch";


            if (pulse) {

                pulse.classList.add(
                    "monitor"
                );

            }

        }


        /*============================================
        HEALTHY
        BELOW 10% OVERDUE
        ============================================*/

        else {

            label.textContent =
                "Follow-ups Healthy";


            if (pulse) {

                pulse.classList.add(
                    "healthy"
                );

            }

        }

    }


    /*================================================
    PERIOD
    ================================================*/

    function renderPeriod() {

        const preset =
            $("reportDatePreset")
                ?.value ||
            "all";


        const service =
            $("reportServiceFilter")
                ?.value ||
            "all";


        const labels = {

            all:
                "All available data",

            today:
                "Today",

            "7":
                "Last 7 days",

            "30":
                "Last 30 days",

            month:
                "This month",

            custom:
                "Custom date range"

        };


        let text =
            labels[preset] ||
            "Current data";


        if (
            service !== "all"
        ) {

            text +=
                " • " +
                service;

        }


        $("reportPeriodText").textContent =
            text;


        $("reportGeneratedAt").textContent =
            "Report generated " +
            new Date()
                .toLocaleString(
                    "en-IN"
                );

    }


    function updateEnvironment() {

    const label =
        $("reportEnvironment");


    const toggle =
        $("reportEnvToggle");


    const syncDot =
        document.querySelector(
            ".reportSyncDot"
        );


    const syncText =
        document.querySelector(
            ".reportSync"
        );


    if (
        REPORT_ENV !== "LIVE" &&
        REPORT_ENV !== "TEST"
    ) {

        REPORT_ENV =
            "LIVE";

    }


    localStorage.setItem(
        "dashboardEnv",
        REPORT_ENV
    );


    window.DASHBOARD_ENV =
        REPORT_ENV;


    if (label) {

        label.textContent =
            REPORT_ENV;


        label.classList.toggle(
            "live",
            REPORT_ENV ===
                "LIVE"
        );


        label.classList.toggle(
            "test",
            REPORT_ENV ===
                "TEST"
        );

    }


    if (toggle) {

        toggle.checked =
            REPORT_ENV ===
                "TEST";

    }


    /*============================================
    SYNC INDICATOR ENVIRONMENT COLOR
    ============================================*/

    if (syncDot) {

        syncDot.classList.toggle(
            "live",
            REPORT_ENV ===
                "LIVE"
        );


        syncDot.classList.toggle(
            "test",
            REPORT_ENV ===
                "TEST"
        );

    }


    if (syncText) {

        syncText.classList.toggle(
            "live",
            REPORT_ENV ===
                "LIVE"
        );


        syncText.classList.toggle(
            "test",
            REPORT_ENV ===
                "TEST"
        );

    }

}

    /*================================================
ENVIRONMENT MODAL LOADER - SHOW
================================================*/

    function showEnvironmentLoader(
        environment
    ) {

        const loader =
            $("reportEnvironmentLoader");


        if (!loader) {

            console.warn(
                "[REPORT] Environment loader HTML not found."
            );

            return;

        }


        const env =
            String(
                environment ||
                "LIVE"
            )
                .trim()
                .toUpperCase();


        const isLive =
            env ===
            "LIVE";


        const title =
            $("reportEnvironmentLoaderTitle");


        const message =
            $("reportEnvironmentLoaderMessage");


        const badge =
            $("reportEnvironmentLoaderBadge");


        const icon =
            $("reportEnvironmentLoaderIcon");


        /*================================================
        REMOVE PREVIOUS ENVIRONMENT STATE
        ================================================*/

        loader.classList.remove(
            "live",
            "test"
        );


        /*================================================
        APPLY NEW ENVIRONMENT STATE
        ================================================*/

        loader.classList.add(
            isLive
                ? "live"
                : "test"
        );


        /*================================================
        TITLE
        ================================================*/

        if (title) {

            title.textContent =
                isLive
                    ? "Switching to LIVE"
                    : "Switching to TEST";

        }


        /*================================================
        MESSAGE
        ================================================*/

        if (message) {

            message.textContent =
                isLive
                    ? "Loading live booking and CRM data..."
                    : "Loading test environment data...";

        }


        /*================================================
        ENVIRONMENT BADGE
        ================================================*/

        if (badge) {

            badge.textContent =
                env;

        }


        /*================================================
        ICON
        ================================================*/

        if (icon) {

            icon.textContent =
                isLive
                    ? "●"
                    : "◆";

        }


        /*================================================
        SHOW LOADER
        ================================================*/

        loader.hidden =
            false;


        loader.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "reportEnvironmentLoading"
        );


        /*================================================
START 0 → 92% PROGRESS
================================================*/

        startEnvironmentProgress();

        console.log(
            "[REPORT] Environment loader shown:",
            env
        );

    }

    /*================================================
SET ENVIRONMENT PROGRESS
================================================*/

    function setEnvironmentProgress(
        value
    ) {

        const circle =
            $("reportEnvironmentProgressCircle");


        const text =
            $("reportEnvironmentProgressValue");


        const circumference =
            213.63;


        const progress =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(value) || 0
                )
            );


        reportEnvironmentProgress =
            progress;


        if (circle) {

            const offset =
                circumference -
                (
                    progress /
                    100
                ) *
                circumference;


            circle.style.strokeDashoffset =
                offset;

        }


        if (text) {

            text.textContent =
                Math.round(
                    progress
                ) + "%";

        }

    }


    /*================================================
    START SIMULATED ENVIRONMENT PROGRESS
    ================================================*/

    function startEnvironmentProgress() {

        /*----------------------------------------------
        CLEAR PREVIOUS TIMER
        ----------------------------------------------*/

        if (
            reportEnvironmentProgressTimer
        ) {

            clearInterval(
                reportEnvironmentProgressTimer
            );

        }


        /*----------------------------------------------
        START AT ZERO
        ----------------------------------------------*/

        setEnvironmentProgress(
            0
        );


        /*
         * Small delay gives the browser time
         * to render the initial 0% state.
         */

        setTimeout(
            function () {

                setEnvironmentProgress(
                    8
                );

            },
            80
        );


        /*----------------------------------------------
        SIMULATED PROGRESS
        ----------------------------------------------*/

        reportEnvironmentProgressTimer =
            setInterval(
                function () {

                    let increment;


                    /*
                     * Move quickly at the beginning,
                     * then progressively slow down.
                     */

                    if (
                        reportEnvironmentProgress <
                        35
                    ) {

                        increment =
                            Math.random() *
                            8 +
                            4;

                    }
                    else if (
                        reportEnvironmentProgress <
                        65
                    ) {

                        increment =
                            Math.random() *
                            5 +
                            2;

                    }
                    else if (
                        reportEnvironmentProgress <
                        85
                    ) {

                        increment =
                            Math.random() *
                            2.5 +
                            1;

                    }
                    else {

                        increment =
                            Math.random() *
                            0.8 +
                            0.2;

                    }


                    const next =
                        Math.min(
                            92,
                            reportEnvironmentProgress +
                            increment
                        );


                    setEnvironmentProgress(
                        next
                    );


                    /*
                     * Never automatically reach 100%.
                     *
                     * 100% means the actual environment
                     * switch has completed.
                     */

                    if (
                        next >=
                        92
                    ) {

                        clearInterval(
                            reportEnvironmentProgressTimer
                        );


                        reportEnvironmentProgressTimer =
                            null;

                    }

                },
                260
            );

    }


    /*================================================
    COMPLETE ENVIRONMENT PROGRESS
    ================================================*/

    function completeEnvironmentProgress() {

        if (
            reportEnvironmentProgressTimer
        ) {

            clearInterval(
                reportEnvironmentProgressTimer
            );


            reportEnvironmentProgressTimer =
                null;

        }


        setEnvironmentProgress(
            100
        );

    }


    /*================================================
    ENVIRONMENT MODAL LOADER - HIDE
    ================================================*/

    function hideEnvironmentLoader() {

        const loader =
            $("reportEnvironmentLoader");


        if (loader) {

            loader.hidden =
                true;


            loader.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        document.body.classList.remove(
            "reportEnvironmentLoading"
        );


        console.log(
            "[REPORT] Environment loader hidden."
        );

    }


    function updateSync() {

        $("reportLastSync").textContent =
            "Synced " +
            new Date()
                .toLocaleTimeString(
                    "en-IN",
                    {
                        hour:
                            "2-digit",

                        minute:
                            "2-digit",

                        second:
                            "2-digit"
                    }
                );

    }


    /*================================================
    CSV EXPORT
    ================================================*/

    function exportCSV() {

        if (
            !filteredRecords.length
        ) {

            alert(
                "No report records to export."
            );

            return;

        }


        const rows = [

            [
                "Booking ID",
                "Customer",
                "Phone",
                "Service",
                "Travel Date",
                "Status",
                "Follow Up",
                "Revenue"
            ],

            ...filteredRecords.map(
                function (row) {

                    return [

                        getBookingId(row),

                        getCustomer(row),

                        getPhone(row),

                        row._reportService,

                        dateKey(
                            getTravelDate(row)
                        ),

                        getStatus(row),

                        dateKey(
                            getFollowup(row)
                        ),

                        getRevenue(row)

                    ];

                }
            )

        ];


        const csv =
            rows.map(
                row =>
                    row.map(
                        csvEscape
                    )
                        .join(",")
            )
                .join("\n");


        const blob =
            new Blob(
                [
                    "\uFEFF",
                    csv
                ],
                {
                    type:
                        "text/csv;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "RanSan_Dashboard_Report_" +
            todayKey() +
            ".csv";


        document.body
            .appendChild(
                link
            );


        link.click();


        link.remove();


        URL.revokeObjectURL(
            url
        );

    }


    function csvEscape(value) {

        const text =
            safeText(value);


        if (
            /[",\n]/.test(text)
        ) {

            return (
                '"' +
                text.replace(
                    /"/g,
                    '""'
                ) +
                '"'
            );

        }


        return text;

    }


    /*================================================
    RESET FILTERS
    ================================================*/

    function resetFilters() {

        $("reportDatePreset").value =
            "all";


        $("reportServiceFilter").value =
            "all";


        $("reportStatusFilter").value =
            "all";


        $("reportSearch").value =
            "";


        $("reportFromDate").value =
            "";


        $("reportToDate").value =
            "";


        $("reportCustomDates").hidden =
            true;


        applyFilters();

    }


    /*================================================
LOAD ERROR
================================================*/

    function showLoadError(
        message
    ) {

        /*
         * IMPORTANT:
         * This function must stay INSIDE
         * window.DashboardReport module.
         */

        sourceData =
            null;


        allRecords =
            [];


        filteredRecords =
            [];


        /*
         * Render normal zero / empty state.
         */

        render();


        const empty =
            $("reportEmpty");


        const body =
            $("reportDetailBody");


        if (body) {

            body.innerHTML =
                "";

        }


        if (empty) {

            empty.hidden =
                false;


            empty.innerHTML = `

                <div>
                    ⚠
                </div>

                <strong>
                    Unable to load report
                </strong>

                <span>
                    ${escapeHTML(
                message
            )}
                </span>

            `;

        }


        const health =
            $("reportHealthLabel");


        if (health) {

            health.textContent =
                "Data Error";

        }

    }



    /*================================================
    SWITCH LIVE / TEST ENVIRONMENT
    ================================================*/

    async function switchEnvironment(
        environment
    ) {

        const nextEnvironment =
            String(
                environment ||
                "LIVE"
            )
                .trim()
                .toUpperCase();


        /*----------------------------------------------
        VALIDATE
        ----------------------------------------------*/

        if (
            nextEnvironment !== "LIVE" &&
            nextEnvironment !== "TEST"
        ) {

            console.error(
                "[REPORT] Invalid environment:",
                nextEnvironment
            );


            return false;

        }


        /*----------------------------------------------
        SAME ENVIRONMENT
        ----------------------------------------------*/

        if (
            nextEnvironment ===
            REPORT_ENV
        ) {

            updateEnvironment();


            return true;

        }


        const previousEnvironment =
            REPORT_ENV;


        console.log(
            "[REPORT] Environment switch:",
            previousEnvironment,
            "→",
            nextEnvironment
        );


        /*----------------------------------------------
        SET NEW ENVIRONMENT
        ----------------------------------------------*/

        REPORT_ENV =
            nextEnvironment;


        /*
         * Same storage key used by
         * your main Dashboard.
         */

        localStorage.setItem(
            "dashboardEnv",
            REPORT_ENV
        );


        window.DASHBOARD_ENV =
            REPORT_ENV;


        /*
         * Immediately update LIVE / TEST
         * label and toggle.
         */

        updateEnvironment();


        /*----------------------------------------------
        CLEAR PREVIOUS DATA
        ----------------------------------------------*/

        sourceData =
            null;


        allRecords =
            [];


        filteredRecords =
            [];


        window.reportDashboardData =
            null;


        /*
         * Remove old environment records
         * from screen while new environment
         * loads.
         */

        render();


        /*----------------------------------------------
        LOAD NEW ENVIRONMENT
        ----------------------------------------------*/

        const data =
            await loadReportData();


        /*----------------------------------------------
        LOAD FAILED
        ----------------------------------------------*/

        if (!data) {

            console.error(
                "[REPORT] Environment load failed:",
                nextEnvironment
            );


            /*
             * Restore previous environment.
             */

            REPORT_ENV =
                previousEnvironment;


            localStorage.setItem(
                "dashboardEnv",
                REPORT_ENV
            );


            window.DASHBOARD_ENV =
                REPORT_ENV;


            updateEnvironment();


            console.log(
                "[REPORT] Restored environment:",
                REPORT_ENV
            );


            return false;

        }


        /*----------------------------------------------
        SUCCESS
        ----------------------------------------------*/

        console.log(
            "[REPORT] Environment switch completed:",
            REPORT_ENV
        );


        return true;

    }



    /*================================================
    RESET FILTERS
    ================================================*/

    function resetFilters() {

        const datePreset =
            $("reportDatePreset");


        const serviceFilter =
            $("reportServiceFilter");


        const statusFilter =
            $("reportStatusFilter");


        const search =
            $("reportSearch");


        const fromDate =
            $("reportFromDate");


        const toDate =
            $("reportToDate");


        const customDates =
            $("reportCustomDates");


        if (datePreset) {

            datePreset.value =
                "all";

        }


        if (serviceFilter) {

            serviceFilter.value =
                "all";

        }


        if (statusFilter) {

            statusFilter.value =
                "all";

        }


        if (search) {

            search.value =
                "";

        }


        if (fromDate) {

            fromDate.value =
                "";

        }


        if (toDate) {

            toDate.value =
                "";

        }


        if (customDates) {

            customDates.hidden =
                true;

        }


        applyFilters();

    }



    /*================================================
    EVENTS
    ================================================*/

    function bindEvents() {


        /*
         * Avoid duplicate listeners.
         */

        if (
            document.body
                .dataset
                .reportEventsInitialized ===
            "true"
        ) {

            return;

        }


        document.body
            .dataset
            .reportEventsInitialized =
            "true";


        /*================================================
        SERVICE / STATUS / DATE FILTERS
        ================================================*/

        [
            "reportServiceFilter",
            "reportStatusFilter",
            "reportFromDate",
            "reportToDate"
        ]
            .forEach(
                function (id) {

                    const element =
                        $(id);


                    if (!element) {

                        return;

                    }


                    element.addEventListener(
                        "change",
                        applyFilters
                    );

                }
            );



        /*================================================
        DATE PRESET
        ================================================*/

        const datePreset =
            $("reportDatePreset");


        if (datePreset) {

            datePreset.addEventListener(
                "change",
                function () {

                    const customDates =
                        $("reportCustomDates");


                    if (customDates) {

                        customDates.hidden =
                            this.value !==
                            "custom";

                    }


                    applyFilters();

                }
            );

        }



        /*================================================
        SEARCH
        ================================================*/

        const search =
            $("reportSearch");


        if (search) {

            search.addEventListener(
                "input",
                applyFilters
            );

        }



        /*================================================
        RESET
        ================================================*/

        const resetBtn =
            $("reportResetBtn");


        if (resetBtn) {

            resetBtn.addEventListener(
                "click",
                resetFilters
            );

        }



        /*================================================
        PRINT
        ================================================*/

        const printBtn =
            $("reportPrintBtn");


        if (printBtn) {

            printBtn.addEventListener(
                "click",
                function () {

                    window.print();

                }
            );

        }



        /*================================================
        EXPORT CSV
        ================================================*/

        const exportBtn =
            $("reportExportBtn");


        if (exportBtn) {

            exportBtn.addEventListener(
                "click",
                exportCSV
            );

        }



        /*================================================
        MANUAL REFRESH
        ================================================*/

        const refreshBtn =
            $("reportRefreshBtn");


        if (refreshBtn) {

            refreshBtn.addEventListener(
                "click",
                async function () {

                    console.log(
                        "[REPORT] Manual refresh:",
                        REPORT_ENV
                    );


                    await loadReportData();

                }
            );

        }



        /*================================================
LIVE / TEST ENVIRONMENT SWITCH
================================================*/

        const envToggle =
            $("reportEnvToggle");


        if (envToggle) {

            envToggle.addEventListener(
                "change",
                async function () {

                    /*
                     * ON  = TEST
                     * OFF = LIVE
                     */

                    const requestedEnvironment =
                        this.checked
                            ? "TEST"
                            : "LIVE";


                    console.log(
                        "[REPORT] Environment toggle:",
                        requestedEnvironment
                    );


                    /*================================================
                    PREVENT REPEATED CLICKS
                    ================================================*/

                    this.disabled =
                        true;


                    /*================================================
                    SHOW MODAL LOADER
                    ================================================*/

                    showEnvironmentLoader(
                        requestedEnvironment
                    );


                    let switchSuccess =
                        false;


                    try {

                        const success =
                            await switchEnvironment(
                                requestedEnvironment
                            );


                        switchSuccess =
                            Boolean(
                                success
                            );

                        /*
                         * If switching failed,
                         * restore toggle position to
                         * the actual active environment.
                         */

                        if (!success) {

                            this.checked =
                                REPORT_ENV ===
                                "TEST";

                        }

                    }
                    catch (error) {

                        console.error(
                            "[REPORT] Environment switch error:",
                            error
                        );


                        /*
                         * Restore visual toggle state.
                         */

                        this.checked =
                            REPORT_ENV ===
                            "TEST";

                    }
                    finally {

                        /*================================================
                        FINISH CIRCLE AT 100%
                        ================================================*/

                        completeEnvironmentProgress();


                        /*
                         * Briefly show 100% before closing.
                         */

                        await new Promise(
                            function (resolve) {

                                setTimeout(
                                    resolve,
                                    280
                                );

                            }
                        );


                        /*================================================
                        CLOSE MODAL
                        ================================================*/

                        hideEnvironmentLoader();


                        /*================================================
                        RE-ENABLE SWITCH
                        ================================================*/

                        this.disabled =
                            false;

                    }

                }
            );

        }

    }



    /*================================================
    INITIALIZE
    ================================================*/

    async function init() {

        console.log(
            "========== DASHBOARD REPORT INIT =========="
        );


        /*================================================
        RESTORE SAVED ENVIRONMENT
        ================================================*/

        const storedEnvironment =
            String(
                localStorage.getItem(
                    "dashboardEnv"
                ) ||
                "LIVE"
            )
                .trim()
                .toUpperCase();


        REPORT_ENV =
            storedEnvironment === "TEST"
                ? "TEST"
                : "LIVE";


        window.DASHBOARD_ENV =
            REPORT_ENV;


        console.log(
            "[REPORT] Starting environment:",
            REPORT_ENV
        );


        /*================================================
        BIND EVENTS
        ================================================*/

        bindEvents();

        bindAdvancedReportTabs();
        /*================================================
        UPDATE LIVE / TEST UI
        ================================================*/

        updateEnvironment();


        /*================================================
        LOAD ORIGINAL APPS SCRIPT DATA
        ================================================*/

        await loadReportData();


        console.log(
            "========== DASHBOARD REPORT READY =========="
        );

    }



    /*================================================
    PUBLIC API
    ================================================*/

    return {

        init:
            init,


        load:
            loadReportData,


        setData:
            setData,


        applyFilters:
            applyFilters,


        switchEnvironment:
            switchEnvironment,


        getEnvironment:
            function () {

                return REPORT_ENV;

            },


        getFilteredRecords:
            function () {

                return [
                    ...filteredRecords
                ];

            }

    };


})();



/*====================================================
BOOT
====================================================*/

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await window
            .DashboardReport
            ?.init();

    }
);