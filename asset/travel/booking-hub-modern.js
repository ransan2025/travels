/*=========================================================
 RANSAN TRAVELS
 BOOKING HUB MODERN ENHANCEMENT
 STABLE VERSION

 IMPORTANT
 ----------------------------------------------------------
 - Does NOT replace rsToggleV3()
 - Does NOT replace rsModeV3()
 - Does NOT replace rsSendWhatsapp()
 - Does NOT replace rsLoadRentals()
 - Does NOT replace rental Swiper logic
=========================================================*/

(function () {

    "use strict";


    document.addEventListener(
        "DOMContentLoaded",
        function () {


            const hub =
                document.querySelector(
                    ".rs-booking-hub-modern"
                );


            if (!hub) {

                return;

            }


            const blocks =
                hub.querySelectorAll(
                    ".rs-service-block-v3"
                );


            /*=================================================
            UPDATE ACCESSIBILITY STATE
            =================================================*/

            function syncServiceStates() {


                blocks.forEach(
                    function (block) {


                        const controls =
                            block.getAttribute(
                                "aria-controls"
                            );


                        if (!controls) {

                            return;

                        }


                        const panel =
                            document.getElementById(
                                controls
                            );


                        if (!panel) {

                            return;

                        }


                        const isOpen =
                            panel.classList.contains(
                                "open"
                            );


                        block.setAttribute(
                            "aria-expanded",
                            isOpen
                                ? "true"
                                : "false"
                        );

                    }
                );

            }


            /*=================================================
            RENTAL SWIPER RESIZE FIX

            Rental JS builds Swiper while the accordion is
            collapsed. When Panel 3 opens, force Swiper to
            recalculate its visible width.
            =================================================*/

            function refreshRentalSwiper() {


                const rentalPanel =
                    document.getElementById(
                        "rsPanel3"
                    );


                const rentalContainer =
                    document.getElementById(
                        "rsRentalContainer"
                    );


                if (
                    !rentalPanel ||
                    !rentalContainer
                ) {

                    return;

                }


                if (
                    !rentalPanel.classList.contains(
                        "open"
                    )
                ) {

                    return;

                }


                /*
                 * If rental data has not loaded for any reason,
                 * safely ask the ORIGINAL rental loader to run.
                 */

                if (
                    typeof window.rsLoadRentals ===
                    "function"
                ) {


                    const hasRentalContent =
                        rentalContainer.querySelector(
                            ".rsRentalSwiper"
                        );


                    const hasData =
                        Array.isArray(
                            window.rsRentalData
                        ) &&
                        window.rsRentalData.length > 0;


                    if (
                        !hasRentalContent &&
                        !hasData
                    ) {

                        window.rsLoadRentals();

                    }

                }


                /*
                 * Swiper may already exist but was initialized
                 * inside a collapsed accordion.
                 */

                window.setTimeout(
                    function () {


                        const swiper =
                            window.rsRentalSwiper;


                        if (!swiper) {

                            /*
                             * Data may now exist but Swiper was
                             * not rendered yet.
                             */

                            if (
                                typeof window.rsLoadRentals ===
                                    "function" &&
                                Array.isArray(
                                    window.rsRentalData
                                ) &&
                                window.rsRentalData.length
                            ) {

                                window.rsLoadRentals();

                            }


                            return;

                        }


                        try {


                            if (
                                typeof swiper.updateSize ===
                                "function"
                            ) {

                                swiper.updateSize();

                            }


                            if (
                                typeof swiper.updateSlides ===
                                "function"
                            ) {

                                swiper.updateSlides();

                            }


                            if (
                                typeof swiper.updateProgress ===
                                "function"
                            ) {

                                swiper.updateProgress();

                            }


                            if (
                                typeof swiper.updateSlidesClasses ===
                                "function"
                            ) {

                                swiper.updateSlidesClasses();

                            }


                            if (
                                typeof swiper.update ===
                                "function"
                            ) {

                                swiper.update();

                            }


                        }
                        catch (error) {

                            console.warn(
                                "Rental Swiper refresh skipped:",
                                error
                            );

                        }


                    },
                    120
                );


                /*
                 * Accordion transition may still be running.
                 * Run one final update after it settles.
                 */

                window.setTimeout(
                    function () {


                        const swiper =
                            window.rsRentalSwiper;


                        if (
                            swiper &&
                            typeof swiper.update ===
                                "function"
                        ) {

                            try {

                                swiper.update();

                            }
                            catch (error) {

                                console.warn(
                                    "Rental Swiper final update skipped:",
                                    error
                                );

                            }

                        }


                    },
                    520
                );

            }


            /*=================================================
            PACKAGE / RENTAL PANEL WIDTH REFRESH
            =================================================*/

            function refreshDynamicPanels() {


                const packagePanel =
                    document.getElementById(
                        "rsPanel2"
                    );


                const rentalPanel =
                    document.getElementById(
                        "rsPanel3"
                    );


                if (
                    packagePanel &&
                    packagePanel.classList.contains(
                        "open"
                    )
                ) {

                    packagePanel.style.width =
                        "100%";

                }


                if (
                    rentalPanel &&
                    rentalPanel.classList.contains(
                        "open"
                    )
                ) {

                    rentalPanel.style.width =
                        "100%";


                    refreshRentalSwiper();

                }

            }


            /*=================================================
            CLICK HANDLING

            Existing inline onclick="rsToggleV3(x)"
            remains the actual accordion controller.
            =================================================*/

            blocks.forEach(
                function (block) {


                    block.addEventListener(
                        "click",
                        function () {


                            window.setTimeout(
                                function () {

                                    syncServiceStates();

                                    refreshDynamicPanels();

                                },
                                0
                            );

                        }
                    );


                    /*=========================================
                    KEYBOARD ACCESSIBILITY
                    =========================================*/

                    block.addEventListener(
                        "keydown",
                        function (event) {


                            if (
                                event.key !== "Enter" &&
                                event.key !== " "
                            ) {

                                return;

                            }


                            event.preventDefault();

                            block.click();

                        }
                    );

                }
            );


            /*=================================================
            WINDOW RESIZE

            Required for Swiper + accordion responsive changes.
            =================================================*/

            let resizeTimer = null;


            window.addEventListener(
                "resize",
                function () {


                    window.clearTimeout(
                        resizeTimer
                    );


                    resizeTimer =
                        window.setTimeout(
                            function () {

                                refreshDynamicPanels();

                            },
                            180
                        );

                },
                {
                    passive: true
                }
            );


            /*=================================================
            INITIAL STATE
            =================================================*/

            syncServiceStates();

        }
    );

})();