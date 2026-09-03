/*=========================================================
CUSTOMER AUTHENTICATION
Version : 1.0
=========================================================*/

"use strict";

/*=========================================================
CONFIGURATION
=========================================================*/

const AUTH_CONFIG = {

    apiUrl:
        "https://script.google.com/macros/s/AKfycbz8rZXT7UWNYAdw8P3QpAamTk-NKljp-b0flYogJuIr3nwTljClyI_Xc9heoy4gXUmV/exec",

    otpLength: 6,

    otpExpireMinutes: 5,

    rememberDays: 30,

    debug: true

};

/*=========================================================
AUTH STATE
=========================================================*/

const AuthState = {

    phone: "",

    otp: "",

    sessionId: "",

    customer: null,

    authenticated: false,

    rememberDevice: false,

    loading: false,

    otpSent: false

};

/*=========================================================
LOGGER
=========================================================*/

function authLog(...args) {

    if (!AUTH_CONFIG.debug) {

        return;

    }

    console.log(

        "[AUTH]",

        ...args

    );

}

function authError(...args) {

    console.error(

        "[AUTH]",

        ...args

    );

}

/*=========================================================
DOM CACHE
=========================================================*/

const AuthDOM = {

    /*---------------------------------------
    Authentication Container
    ---------------------------------------*/

    authScreen:

        document.getElementById(
            "portalAuth"
        ),

    dashboard:

        document.getElementById(
            "portalDashboard"
        ),

    loading:

        document.getElementById(
            "portalLoading"
        ),

    /*---------------------------------------
    Phone Step
    ---------------------------------------*/

    phoneStep:

        document.getElementById(
            "phoneStep"
        ),

    phoneInput:

        document.getElementById(
            "customerPhone"
        ),

    sendOtpBtn:

        document.getElementById(
            "sendOtpBtn"
        ),

    /*---------------------------------------
    OTP Step
    ---------------------------------------*/

    otpStep:

        document.getElementById(
            "otpStep"
        ),

    otpInput:

        document.getElementById(
            "customerOTP"
        ),

    verifyOtpBtn:

        document.getElementById(
            "verifyOtpBtn"
        ),

    resendOtpBtn:

        document.getElementById(
            "resendOtpBtn"
        ),

    /*---------------------------------------
    Messages
    ---------------------------------------*/

    message:

        document.getElementById(
            "portalLoginMessage"
        ),

    /*---------------------------------------
    Header
    ---------------------------------------*/

    customerName:

        document.getElementById(
            "portalCustomerName"
        ),

    customerPhone:

        document.getElementById(
            "portalCustomerPhone"
        ),

    logoutBtn:

        document.getElementById(
            "logoutBtn"
        )

};

/*=========================================================
DOM HELPERS
=========================================================*/

function showElement(element) {

    if (!element) {

        return;

    }

    element.classList.remove("hidden");

}

function hideElement(element) {

    if (!element) {

        return;

    }

    element.classList.add("hidden");

}

function enableElement(element) {

    if (!element) {

        return;

    }

    element.disabled = false;

}

function disableElement(element) {

    if (!element) {

        return;

    }

    element.disabled = true;

}

function setButtonLoading(button, text = "Please wait...") {

    if (!button) {

        return;

    }

    button.dataset.originalText =

        button.innerHTML;

    button.innerHTML = text;

    button.disabled = true;

}

function resetButton(button) {

    if (!button) {

        return;

    }

    button.innerHTML =

        button.dataset.originalText ||

        button.innerHTML;

    button.disabled = false;

}

/*=========================================================
LOGIN MESSAGE
=========================================================*/

function showLoginMessage(

    message,

    type = "info"

) {

    if (!AuthDOM.message) {

        return;

    }

    AuthDOM.message.innerHTML =

        message;

    AuthDOM.message.className =

        "portalLoginMessage " +

        type;

}

function clearLoginMessage() {

    if (!AuthDOM.message) {

        return;

    }

    AuthDOM.message.innerHTML = "";

    AuthDOM.message.className =

        "portalLoginMessage";

}

/*=========================================================
PART 3
AUTHENTICATION UI CONTROLLER
=========================================================*/

/*=========================================================
SHOW PHONE LOGIN
=========================================================*/

function showPhoneLogin() {

    authLog("Showing Phone Login");

    clearLoginMessage();

    AuthState.otpSent = false;

    showElement(AuthDOM.authScreen);

    hideElement(AuthDOM.dashboard);

    showElement(AuthDOM.phoneStep);

    hideElement(AuthDOM.otpStep);

    if (AuthDOM.phoneInput) {

        AuthDOM.phoneInput.value = "";

        AuthDOM.phoneInput.focus();

    }

    if (AuthDOM.otpInput) {

        AuthDOM.otpInput.value = "";

    }

}

/*=========================================================
SHOW OTP SCREEN
=========================================================*/

function showOtpScreen() {

    authLog("Showing OTP Screen");

    AuthState.otpSent = true;

    hideElement(AuthDOM.phoneStep);

    showElement(AuthDOM.otpStep);

    clearLoginMessage();

    if (AuthDOM.otpInput) {

        AuthDOM.otpInput.value = "";

        AuthDOM.otpInput.focus();

    }

}

/*=========================================================
SHOW DASHBOARD
=========================================================*/

function showCustomerDashboard() {

    authLog("Opening Dashboard");

    hideElement(AuthDOM.authScreen);

    showElement(AuthDOM.dashboard);

}

/*=========================================================
LOGOUT SCREEN
=========================================================*/

function showLogoutScreen() {

    authLog("Logout");

    hideElement(AuthDOM.dashboard);

    showPhoneLogin();

}

/*=========================================================
LOADING
=========================================================*/

function startAuthLoading(text = "Please wait...") {

    AuthState.loading = true;

    showElement(AuthDOM.loading);

    const sub = document.querySelector(".portalLoadingSub");

    if (sub) {

        sub.innerHTML = text;

    }

}

function stopAuthLoading() {

    AuthState.loading = false;

    hideElement(AuthDOM.loading);

}

/*=========================================================
RESET AUTHENTICATION
=========================================================*/

function resetAuthentication() {

    authLog("Reset Authentication");

    AuthState.phone = "";

    AuthState.otp = "";

    AuthState.customer = null;

    AuthState.sessionId = "";

    AuthState.authenticated = false;

    AuthState.loading = false;

    AuthState.otpSent = false;

    clearLoginMessage();

    if (AuthDOM.phoneInput) {

        AuthDOM.phoneInput.value = "";

    }

    if (AuthDOM.otpInput) {

        AuthDOM.otpInput.value = "";

    }

    showPhoneLogin();

}

/*=========================================================
HEADER
=========================================================*/

function updateCustomerHeader(customer) {

    if (!customer) return;

    if (AuthDOM.customerName) {

        AuthDOM.customerName.innerHTML =

            customer.customerName ||

            customer.name ||

            "Customer";

    }

    if (AuthDOM.customerPhone) {

        AuthDOM.customerPhone.innerHTML =

            customer.phone ||

            "";

    }

}

/*=========================================================
BIND EVENTS
=========================================================*/

function bindAuthenticationUI() {

    authLog("Binding Authentication UI");

    if (AuthDOM.sendOtpBtn) {

        AuthDOM.sendOtpBtn.addEventListener(

            "click",

            onSendOtp

        );

    }

    if (AuthDOM.verifyOtpBtn) {

        AuthDOM.verifyOtpBtn.addEventListener(

            "click",

            onVerifyOtp

        );

    }

    if (AuthDOM.resendOtpBtn) {

        AuthDOM.resendOtpBtn.addEventListener(

            "click",

            onResendOtp

        );

    }

    if (AuthDOM.logoutBtn) {

        AuthDOM.logoutBtn.addEventListener(

            "click",

            logoutCustomer

        );

    }

}



/*=========================================================
VERIFY OTP
=========================================================*/

async function onVerifyOtp() {

    clearLoginMessage();

    const otp = String(

        AuthDOM.otpInput.value || ""

    ).trim();

    if (otp.length !== AUTH_CONFIG.otpLength) {

        showLoginMessage(

            "Please enter the 6 digit OTP.",

            "error"

        );

        return;

    }

    AuthState.otp = otp;

    try {

        setButtonLoading(

            AuthDOM.verifyOtpBtn,

            "Verifying..."

        );

        startAuthLoading(

            "Verifying OTP..."

        );

        const result = await callPortalAPI(

            "verifyCustomerOTP",

            {

                phone: AuthState.phone,

                otp: otp

            }

        );

        stopAuthLoading();

        resetButton(

            AuthDOM.verifyOtpBtn

        );

        if (!result.success) {

            showLoginMessage(

                result.message ||

                "Invalid OTP.",

                "error"

            );

            return;

        }

        AuthState.sessionId =

            result.session;

        AuthState.authenticated = true;

        sessionStorage.setItem(

            "customerSession",

            result.session

        );

        sessionStorage.setItem(

            "customerPhone",

            AuthState.phone

        );

        showLoginMessage(

            "Login successful.",

            "success"

        );

        await loginCompleted();

    }

    catch (err) {

        stopAuthLoading();

        resetButton(

            AuthDOM.verifyOtpBtn

        );

        authError(err);

        showLoginMessage(

            "Unable to verify OTP.",

            "error"

        );

    }

}

/*=========================================================
LOGIN COMPLETED
=========================================================*/

async function loginCompleted() {

    authLog(

        "Authentication Successful"

    );

    startAuthLoading(

        "Loading your bookings..."

    );

    try {

        await loadBookings();

        updatePortalHeader();

        stopAuthLoading();

        showCustomerDashboard();

    }

    catch (err) {

        stopAuthLoading();

        authError(err);

        showLoginMessage(

            "Unable to load bookings.",

            "error"

        );

    }

}

/*=========================================================
LOAD BOOKINGS
=========================================================*/

/*=========================================================
LOAD CUSTOMER BOOKINGS
Production Version
=========================================================*/

async function loadBookings(refresh = false) {

    authLog("Loading customer bookings...");

    try {

        //--------------------------------------------------
        // Validate Login
        //--------------------------------------------------

        if (!AuthState.phone) {

            throw new Error("Customer phone missing.");

        }

        //--------------------------------------------------
        // Loading UI
        //--------------------------------------------------

        if (refresh) {

            const btn = document.getElementById(
                "refreshBookingsBtn"
            );

            if (btn) {

                btn.disabled = true;

                btn.innerHTML = "Refreshing...";

            }

        }

        else {

            startAuthLoading(
                "Loading your bookings..."
            );

        }

        //--------------------------------------------------
        // Backend
        //--------------------------------------------------

        const result = await callPortalAPI(

            "getCustomerBookings",

            {

                phone: AuthState.phone

            }

        );

        //--------------------------------------------------
        // API Error
        //--------------------------------------------------

        if (!result.success) {

            throw new Error(

                result.message ||

                "Unable to load bookings."

            );

        }

        //--------------------------------------------------
        // Save Customer
        //--------------------------------------------------

        CustomerPortal.customer =

            result.customer || {};

        //--------------------------------------------------
        // Save Bookings
        //--------------------------------------------------

        CustomerPortal.bookings =

            Array.isArray(result.bookings)

                ? result.bookings

                : [];

        renderCustomerSummary();

        renderBookingList(
            CustomerPortal.bookings
        );

        renderSearchBox();

        const refreshBtn =

            document.getElementById(

                "refreshBookingsBtn"

            );

        if (refreshBtn) {

            refreshBtn.addEventListener(

                "click",

                refreshBookings

            );

        }

        if (CustomerPortal.bookings.length > 0) {

            renderBookingDetails(
                CustomerPortal.bookings[0]
            );

        }

        //--------------------------------------------------
        // Update Header
        //--------------------------------------------------

        updatePortalHeader();

        //--------------------------------------------------
        // Customer Summary
        //--------------------------------------------------

        renderCustomerSummary(

            CustomerPortal.customer,

            CustomerPortal.bookings

        );


        //--------------------------------------------------
        // Empty State
        //--------------------------------------------------

        const emptyBox =

            document.getElementById(

                "bookingEmpty"

            );

        if (emptyBox) {

            if (

                CustomerPortal.bookings.length === 0

            ) {

                emptyBox.classList.remove("hidden");

            }

            else {

                emptyBox.classList.add("hidden");

            }

        }

        //--------------------------------------------------
        // Auto Select Latest Booking
        //--------------------------------------------------

        if (

            CustomerPortal.bookings.length > 0

        ) {

            selectBooking(

                CustomerPortal.bookings[0].bookingId

            );

        }

        //--------------------------------------------------
        // Success
        //--------------------------------------------------

        authLog(

            "Bookings Loaded:",

            CustomerPortal.bookings.length

        );

        return CustomerPortal.bookings;

    }

    catch (error) {

        authError(error);

        CustomerPortal.bookings = [];

        renderBookingList([]);

        showLoginMessage(

            error.message ||

            "Unable to load bookings.",

            "error"

        );

        throw error;

    }

    finally {

        stopAuthLoading();

        const btn =

            document.getElementById(

                "refreshBookingsBtn"

            );

        if (btn) {

            btn.disabled = false;

            btn.innerHTML = "↻ Refresh";

        }

    }

}


/*=========================================================
HEADER
=========================================================*/

function updatePortalHeader() {

    if (

        CustomerPortal.bookings.length === 0

    ) {

        return;

    }

    const booking =

        CustomerPortal.bookings[0];

    if (

        AuthDOM.customerName

    ) {

        AuthDOM.customerName.innerHTML =

            booking.customerName;

    }

    if (

        AuthDOM.customerPhone

    ) {

        AuthDOM.customerPhone.innerHTML =

            booking.phone;

    }

}

/*=========================================================
RESEND OTP
=========================================================*/

async function onResendOtp() {

    AuthDOM.phoneInput.value =

        AuthState.phone;

    await onSendOtp();

}

/*=========================================================
LOGOUT
=========================================================*/

function logoutCustomer() {

    sessionStorage.removeItem(

        "customerSession"

    );

    sessionStorage.removeItem(

        "customerPhone"

    );

    resetAuthentication();

}

/*=========================================================
INITIALIZE AUTH UI
=========================================================*/

function initializeAuthenticationUI() {

    authLog("Initializing Authentication");

    bindAuthenticationUI();

    showPhoneLogin();

}

/*=========================================================
AUTO LOGIN
=========================================================*/

function tryAutoLogin() {

    const session =

        sessionStorage.getItem(

            "customerSession"

        );

    const phone =

        sessionStorage.getItem(

            "customerPhone"

        );

    if (!session || !phone) {

        showPhoneLogin();

        return;

    }

    AuthState.sessionId =

        session;

    AuthState.phone =

        phone;

    AuthState.authenticated = true;

    loginCompleted();

}


document.addEventListener("DOMContentLoaded", () => {

    initializeAuthenticationUI();

    tryAutoLogin();

});

/*=========================================================
PART 4
PHONE VALIDATION & SEND OTP
=========================================================*/

/*=========================================================
VALIDATE PHONE
=========================================================*/

function validatePhone(phone) {

    phone = String(phone || "").trim();

    phone = phone.replace(/\D/g, "");

    if (phone.length !== 10) {

        showLoginMessage(

            "Please enter a valid 10 digit mobile number.",

            "error"

        );

        return false;

    }

    return phone;

}



/*=========================================================
SEND OTP
=========================================================*/

async function onSendOtp() {

    clearLoginMessage();

    const phone = validatePhone(

        AuthDOM.phoneInput.value

    );

    if (!phone) {

        return;

    }

    AuthState.phone = phone;

    try {

        setButtonLoading(

            AuthDOM.sendOtpBtn,

            "Sending..."

        );

        startAuthLoading(

            "Checking your bookings..."

        );

        const result = await callPortalAPI(

            "sendCustomerOTP",

            {

                phone

            }

        );

        stopAuthLoading();

        resetButton(

            AuthDOM.sendOtpBtn

        );

        if (!result.success) {

            showLoginMessage(

                result.message ||

                "Customer not found.",

                "error"

            );

            return;

        }

        showLoginMessage(

            "OTP sent successfully via WhatsApp.",

            "success"

        );

        showOtpScreen();

    }

    catch (err) {

        stopAuthLoading();

        resetButton(

            AuthDOM.sendOtpBtn

        );

        authError(err);

        showLoginMessage(

            "Unable to send OTP.",

            "error"

        );

    }

}


/*=========================================================
CUSTOMER SUMMARY
=========================================================*/

function renderCustomerSummary() {

    const container =
        document.getElementById(
            "customerSummaryCard"
        );

    if (!container) {

        return;

    }

    const bookings =
        CustomerPortal.bookings || [];

    if (bookings.length === 0) {

        container.innerHTML = `

        <div class="portalGlass customerSummaryCard">

            <div class="summaryEmpty">

                No Customer Information

            </div>

        </div>

        `;

        return;

    }

    /*---------------------------------------------------
    Customer
    ---------------------------------------------------*/

    const customer =
        bookings[0];

    /*---------------------------------------------------
    Statistics
    ---------------------------------------------------*/

    const totalBookings =
        bookings.length;

    const completedTrips =
        bookings.filter(b =>

            String(b.status)
                .toLowerCase() === "completed"

        ).length;

    const confirmedTrips =
        bookings.filter(b =>

            String(b.status)
                .toLowerCase() === "confirmed"

        ).length;

    const processingTrips =
        bookings.filter(b => {

            const s =
                String(b.status)
                    .toLowerCase();

            return (

                s === "processing" ||

                s === "pending" ||

                s === "new"

            );

        }).length;

    const upcomingTrips =
        bookings.filter(b => {

            if (!b.travelDate) {

                return false;

            }

            const travel =
                new Date(b.travelDate);

            return (

                !isNaN(travel) &&

                travel >= new Date()

            );

        }).length;

    const totalAmount =
        bookings.reduce(

            (sum, b) =>

                sum + Number(b.totalAmount || 0),

            0

        );

    const paidAmount =
        bookings.reduce(

            (sum, b) =>

                sum + Number(b.paidAmount || 0),

            0

        );

    const balanceAmount =
        bookings.reduce(

            (sum, b) =>

                sum + Number(b.balanceAmount || 0),

            0

        );

    /*---------------------------------------------------
    HTML
    ---------------------------------------------------*/

    container.innerHTML = `

    <div class="portalGlass customerSummaryCard">

        <div class="summaryHeader">

            <div class="summaryAvatar">

                👤

            </div>

            <div class="summaryInfo">

                <div class="summaryName">

                    ${customer.customerName || "-"}

                </div>

                <div class="summaryPhone">

                    ${customer.phone || "-"}

                </div>

            </div>

        </div>

        <div class="summaryGrid">

            <div class="summaryBox">

                <div class="summaryValue">

                    ${totalBookings}

                </div>

                <div class="summaryLabel">

                    Bookings

                </div>

            </div>

            <div class="summaryBox">

                <div class="summaryValue">

                    ${upcomingTrips}

                </div>

                <div class="summaryLabel">

                    Upcoming

                </div>

            </div>

            <div class="summaryBox">

                <div class="summaryValue">

                    ${completedTrips}

                </div>

                <div class="summaryLabel">

                    Completed

                </div>

            </div>

            <div class="summaryBox">

                <div class="summaryValue">

                    ${processingTrips}

                </div>

                <div class="summaryLabel">

                    Processing

                </div>

            </div>

        </div>

        <div class="summaryPayment">

            <div class="summaryPaymentRow">

                <span>Total</span>

                <strong>

                    ₹${formatCurrency(totalAmount)}

                </strong>

            </div>

            <div class="summaryPaymentRow">

                <span>Paid</span>

                <strong class="paidAmount">

                    ₹${formatCurrency(paidAmount)}

                </strong>

            </div>

            <div class="summaryPaymentRow">

                <span>Balance</span>

                <strong class="balanceAmount">

                    ₹${formatCurrency(balanceAmount)}

                </strong>

            </div>

        </div>

    </div>

    `;

}

/*=========================================================
SEARCH BOOKINGS
=========================================================*/

function searchBookings() {

    const searchInput =
        document.getElementById(
            "bookingSearchInput"
        );

    if (!searchInput) {

        return;

    }

    const keyword =
        String(searchInput.value || "")
            .trim()
            .toLowerCase();

    /*------------------------------------------
    Original Booking List
    ------------------------------------------*/

    const bookings =
        CustomerPortal.bookings || [];

    /*------------------------------------------
    Empty Search
    ------------------------------------------*/

    if (keyword === "") {

        renderBookingList(bookings);

        return;

    }

    /*------------------------------------------
    Filter
    ------------------------------------------*/

    const filtered =
        bookings.filter(function (booking) {

            const searchable = [

                booking.bookingId,

                booking.customerName,

                booking.phone,

                booking.service,

                booking.route,

                booking.status,

                booking.travelDate,

                booking.assignedTo,

                booking.notes

            ]

                .join(" ")

                .toLowerCase();

            return searchable.includes(keyword);

        });

    /*------------------------------------------
    Render
    ------------------------------------------*/

    renderBookingList(filtered);

    /*------------------------------------------
    Empty Result
    ------------------------------------------*/

    if (filtered.length === 0) {

        renderEmptyBookings(

            "No bookings found.",

            "Try another keyword."

        );

    }

}

/*=========================================================
RENDER SEARCH BOX
=========================================================*/

function renderSearchBox() {

    const container =
        document.getElementById(
            "bookingSearchContainer"
        );

    if (!container) {

        return;

    }

    container.innerHTML = `

    <div class="portalGlass bookingSearchBox">

        <input

            id="bookingSearchInput"

            class="bookingSearchInput"

            type="text"

            placeholder="Search Booking ID, Route, Service..."

        >

    </div>

    `;

    document

        .getElementById("bookingSearchInput")

        .addEventListener(

            "input",

            searchBookings

        );

}



/*=========================================================
REFRESH BOOKINGS
Production Version
=========================================================*/

async function refreshBookings() {

    authLog("Refreshing Bookings...");

    /*---------------------------------------
    Save Current Selection
    ---------------------------------------*/

    const selectedBookingId =
        CustomerPortal.currentBooking
            ? CustomerPortal.currentBooking.bookingId
            : null;

    try {

        /*---------------------------------------
        Loading
        ---------------------------------------*/

        startAuthLoading(
            "Refreshing bookings..."
        );

        /*---------------------------------------
        Reload
        ---------------------------------------*/

        await loadBookings();

        /*---------------------------------------
        Update Summary
        ---------------------------------------*/

        renderCustomerSummary();

        /*---------------------------------------
        Update Search Box
        ---------------------------------------*/

        renderSearchBox();

        /*---------------------------------------
        Update Booking List
        ---------------------------------------*/

        renderBookingList(
            CustomerPortal.bookings
        );

        /*---------------------------------------
        Restore Selected Booking
        ---------------------------------------*/

        if (selectedBookingId) {

            const booking =
                CustomerPortal.bookings.find(

                    b =>

                        b.bookingId ===
                        selectedBookingId

                );

            if (booking) {

                CustomerPortal.currentBooking =
                    booking;

                renderBookingDetails(
                    booking
                );

                highlightBookingCard(
                    booking.bookingId
                );

            }

            else if (CustomerPortal.bookings.length > 0) {

                CustomerPortal.currentBooking =
                    CustomerPortal.bookings[0];

                renderBookingDetails(

                    CustomerPortal.bookings[0]

                );

                highlightBookingCard(

                    CustomerPortal.bookings[0].bookingId

                );

            }

        }

        else if (CustomerPortal.bookings.length > 0) {

            CustomerPortal.currentBooking =
                CustomerPortal.bookings[0];

            renderBookingDetails(

                CustomerPortal.bookings[0]

            );

            highlightBookingCard(

                CustomerPortal.bookings[0].bookingId

            );

        }

        stopAuthLoading();

        authLog("Bookings Refreshed");

    }

    catch (err) {

        stopAuthLoading();

        authError(err);

        showLoginMessage(

            "Unable to refresh bookings.",

            "error"

        );

    }

}

/*=========================================================
HIGHLIGHT SELECTED BOOKING
=========================================================*/

function highlightBookingCard(bookingId) {

    document

        .querySelectorAll(".customerBookingCard")

        .forEach(card => {

            card.classList.remove(

                "selectedBooking"

            );

        });

    const selected =

        document.querySelector(

            `.customerBookingCard[data-booking="${bookingId}"]`

        );

    if (selected) {

        selected.classList.add(

            "selectedBooking"

        );

    }

}

/*=========================================================
FORMAT CURRENCY
=========================================================*/

function formatCurrency(value) {

    value = Number(value || 0);

    return value.toLocaleString("en-IN", {

        minimumFractionDigits: 0,

        maximumFractionDigits: 0

    });

}