"use strict";

/*====================================================
BOOKING MODIFICATION POPUP ENGINE
====================================================*/

let popupOpened = false;

/*====================================================
OPEN
====================================================*/

function openModificationPopup(options = {}) {

    const overlay =
        document.getElementById(
            "bookingModificationOverlay"
        );

    if (!overlay) return;

    popupOpened = true;

    document.body.style.overflow = "hidden";

    const title =
        document.getElementById(
            "bookingModificationTitle"
        );

    const body =
        document.getElementById(
            "bookingModificationBody"
        );

    const footer =
        document.getElementById(
            "bookingModificationFooter"
        );

    title.textContent =
        options.title || "Booking Request";

    body.innerHTML =
        options.body || "";

    footer.innerHTML =
        options.footer || "";

    overlay.classList.remove("hidden");

    const popup =
        overlay.querySelector(
            ".bookingModificationPopup"
        );

    popup.style.animation =
        "bookingPopupOpen .28s ease";

}

/*====================================================
CLOSE
====================================================*/

function closeModificationPopup() {

    const overlay =
        document.getElementById(
            "bookingModificationOverlay"
        );

    if (!overlay) return;

    popupOpened = false;

    document.body.style.overflow = "";

    const popup =
        overlay.querySelector(
            ".bookingModificationPopup"
        );

    popup.style.animation =
        "bookingPopupClose .22s ease";

    setTimeout(function () {

        overlay.classList.add("hidden");

        document.getElementById(
            "bookingModificationBody"
        ).innerHTML = "";

        document.getElementById(
            "bookingModificationFooter"
        ).innerHTML = "";

    },200);

}

/*====================================================
CLICK OUTSIDE
====================================================*/

document.addEventListener(

    "click",

    function(e){

        const overlay =
            document.getElementById(
                "bookingModificationOverlay"
            );

        if(!overlay) return;

        if(

            popupOpened &&

            e.target === overlay

        ){

            closeModificationPopup();

        }

    }

);

/*====================================================
ESC KEY
====================================================*/

document.addEventListener(

    "keydown",

    function(e){

        if(

            popupOpened &&

            e.key === "Escape"

        ){

            closeModificationPopup();

        }

    }

);

/*====================================================
BUTTON
====================================================*/

document.addEventListener(

    "click",

    function(e){

        if(

            e.target.closest(

                ".bookingModificationClose"

            )

        ){

            closeModificationPopup();

        }

    }

);

/*====================================================
LOADING HELPERS
====================================================*/

function popupLoading(text="Submitting Request..."){

    showBookingLoading(text);

}

function popupLoadingClose(){

    hideBookingLoading();

}

/*====================================================
SUCCESS
====================================================*/

function popupSuccess(

    title,

    message,

    callback

){

    hideBookingLoading();

    closeModificationPopup();

    showBookingSuccess(

        title,

        message,

        callback

    );

}

/*====================================================
ERROR
====================================================*/

function popupError(

    title,

    message

){

    hideBookingLoading();

    showBookingError(

        title,

        message

    );

}