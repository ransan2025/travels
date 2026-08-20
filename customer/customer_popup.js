/*====================================================
CUSTOMER PORTAL POPUP UTILITIES
Version : 1.0
====================================================*/

"use strict";

/*====================================================
LOADING
====================================================*/

function showBookingLoading(text = "Processing...") {

    const overlay = document.getElementById(
        "bookingLoadingOverlay"
    );

    if (!overlay) return;

    const label = overlay.querySelector(
        ".bookingLoadingText"
    );

    if (label) {

        label.textContent = text;

    }

    overlay.classList.remove("hidden");

}

/*====================================================*/

function hideBookingLoading() {

    const overlay = document.getElementById(
        "bookingLoadingOverlay"
    );

    if (!overlay) return;

    overlay.classList.add("hidden");

}

/*====================================================
SUCCESS
====================================================*/

function showBookingSuccess(

    title = "Success",

    message = "Operation completed successfully.",

    callback = null

) {

    const overlay = document.getElementById(
        "bookingSuccessOverlay"
    );

    if (!overlay) return;

    document.getElementById(
        "bookingSuccessTitle"
    ).textContent = title;

    document.getElementById(
        "bookingSuccessMessage"
    ).textContent = message;

    overlay.classList.remove("hidden");

    const btn = document.getElementById(
        "bookingSuccessButton"
    );

    btn.onclick = function () {

        overlay.classList.add("hidden");

        if (typeof callback === "function") {

            callback();

        }

    };

}

/*====================================================*/

function hideBookingSuccess() {

    const overlay = document.getElementById(
        "bookingSuccessOverlay"
    );

    if (!overlay) return;

    overlay.classList.add("hidden");

}

/*====================================================
ERROR
====================================================*/

function showBookingError(

    title = "Something went wrong",

    message = "Please try again."

) {

    const overlay = document.getElementById(
        "bookingErrorOverlay"
    );

    if (!overlay) return;

    document.getElementById(
        "bookingErrorTitle"
    ).textContent = title;

    document.getElementById(
        "bookingErrorMessage"
    ).textContent = message;

    overlay.classList.remove("hidden");

}

/*====================================================*/

function hideBookingError() {

    const overlay = document.getElementById(
        "bookingErrorOverlay"
    );

    if (!overlay) return;

    overlay.classList.add("hidden");

}

/*====================================================
INITIALIZE
====================================================*/

document.addEventListener(

    "DOMContentLoaded",

    function () {

        const successBtn = document.getElementById(
            "bookingSuccessButton"
        );

        if (successBtn) {

            successBtn.addEventListener(

                "click",

                hideBookingSuccess

            );

        }

        const errorBtn = document.getElementById(
            "bookingErrorButton"
        );

        if (errorBtn) {

            errorBtn.addEventListener(

                "click",

                hideBookingError

            );

        }

    }

);

/*=====================================================
TRAVEL DATE POPUP HTML
=====================================================*/

function buildTravelDatePopup(booking) {

    return `

<div class="travelDatePopup">

    <div class="travelPopupHeader">

        <div class="travelPopupIcon">

            📅

        </div>

        <div class="travelPopupHeaderText">

            <div class="travelPopupHeading">

                Request Travel Date Change

            </div>

            <div class="travelPopupSubHeading">

                Submit a request to reschedule your booking.

            </div>

        </div>

    </div>

    <div class="travelPopupForm">

        <div class="travelFormGroup">

            <label>

                Current Travel Date

            </label>

            <input

                type="text"

                class="travelInput"

                value="${booking.travelDate || "-"}"

                readonly

            >

        </div>

        <div class="travelFormGroup">

            <label>

                Preferred New Date

            </label>

            <input

                id="travelNewDate"

                type="date"

                class="travelInput"

            >

        </div>

        <div class="travelFormGroup">

            <label>

                Reason

            </label>

            <textarea

                id="travelReason"

                class="travelTextarea"

                placeholder="Please tell us why you would like to change the travel date."

            ></textarea>

        </div>

    </div>

</div>

`;

}

/*=====================================================
OPEN TRAVEL DATE POPUP
=====================================================*/

function openTravelDatePopup(booking) {

    if (!booking) return;

    const footer = `

<button
class="bookingGlassBtn"
onclick="closeBookingModificationPopup()">

Cancel

</button>

<button
class="bookingGlassBtn bookingPrimaryBtn"
id="travelDateSubmitBtn">

Submit Request

</button>

`;

    openBookingModificationPopup(

        "Travel Date Change",

        buildTravelDatePopup(booking),

        footer

    );

    // Attach event after popup is rendered
    document
        .getElementById("travelDateSubmitBtn")
        .onclick = function () {

            submitModificationRequest();

        };

}

/*=====================================================
OPEN POPUP
=====================================================*/

function openBookingModificationPopup(

    title,

    body,

    footer

) {

    document.querySelector(

        ".bookingModificationTitle"

    ).textContent = title;

    document.getElementById(

        "bookingModificationBody"

    ).innerHTML = body;

    document.getElementById(

        "bookingModificationFooter"

    ).innerHTML = footer;

    document.getElementById(

        "bookingModificationOverlay"

    ).classList.remove(

        "hidden"

    );

}

/*=====================================================
CLOSE POPUP
=====================================================*/

function closeBookingModificationPopup() {

    document.getElementById(

        "bookingModificationOverlay"

    ).classList.add(

        "hidden"

    );

    document.getElementById(

        "bookingModificationBody"

    ).innerHTML = "";

    document.getElementById(

        "bookingModificationFooter"

    ).innerHTML = "";

}

document

    .getElementById(

        "bookingModificationClose"

    )

    .onclick =

    closeBookingModificationPopup;


    document

.getElementById(

    "bookingModificationOverlay"

)

.addEventListener(

    "click",

    function(e){

        if(

            e.target.id===

            "bookingModificationOverlay"

        ){

            closeBookingModificationPopup();

        }

    }

);

/*=====================================================
SUBMIT TRAVEL DATE REQUEST
=====================================================*/

async function submitTravelDateRequest(booking){

    const newDate=document
        .getElementById("travelNewDate")
        .value
        .trim();

    const reason=document
        .getElementById("travelReason")
        .value
        .trim();

    if(!newDate){

        bookingError(

            "Please select preferred travel date."

        );

        return;

    }

    if(reason.length<5){

        bookingError(

            "Please enter reason."

        );

        return;

    }

    bookingLoading(true);

    try{

        const response=

        await callPortalAPI(

            "submitModificationRequest",

            {

                bookingId:
                booking.bookingId,

                customer:
                booking.customerName,

                phone:
                booking.phone,

                requestType:
                "Travel Date",

                currentValue:
                booking.travelDate,

                requestedValue:
                newDate,

                reason:
                reason

            }

        );

        bookingLoading(false);

        if(response.success){

            bookingPopupClose();

            bookingSuccess(

                "Request Submitted",

                "Your travel date modification request has been sent successfully."

            );

        }

        else{

            bookingError(

                response.message||

                "Unable to submit request."

            );

        }

    }

    catch(err){

        bookingLoading(false);

        bookingError(

            err.message

        );

    }

}

/*=====================================================
OPEN POPUP
=====================================================*/

function bookingPopupOpen(){

    document
    .getElementById(

        "bookingModificationOverlay"

    )
    .classList
    .remove("hidden");

}

/*=====================================================
CLOSE POPUP
=====================================================*/

function bookingPopupClose(){

    document
    .getElementById(

        "bookingModificationOverlay"

    )
    .classList
    .add("hidden");

    document
    .getElementById(

        "bookingModificationBody"

    )
    .innerHTML="";

    document
    .getElementById(

        "bookingModificationFooter"

    )
    .innerHTML="";

}

function bookingLoading(show){

    document
    .getElementById(

        "bookingLoadingOverlay"

    )
    .classList
    .toggle(

        "hidden",

        !show

    );

}

function bookingSuccess(

    title,

    message

){

    document
    .getElementById(

        "bookingSuccessTitle"

    )
    .textContent=title;

    document
    .getElementById(

        "bookingSuccessMessage"

    )
    .textContent=message;

    document
    .getElementById(

        "bookingSuccessOverlay"

    )
    .classList
    .remove("hidden");

}

document

.getElementById(

"bookingSuccessButton"

)

.onclick=function(){

document

.getElementById(

"bookingSuccessOverlay"

)

.classList

.add(

"hidden"

);

};

function bookingError(message){

    document

    .getElementById(

        "bookingErrorMessage"

    )

    .textContent=

    message;

    document

    .getElementById(

        "bookingErrorOverlay"

    )

    .classList

    .remove(

        "hidden"

    );

}

document

.getElementById(

"bookingErrorButton"

)

.onclick=function(){

document

.getElementById(

"bookingErrorOverlay"

)

.classList

.add(

"hidden"

);

};



