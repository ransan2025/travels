/*=========================================================
 RANSAN TRAVELS
 MODERN TRAVEL ASSISTANT
 DIRECT SERVICE ROUTING VERSION

 IMPORTANT:
 ----------------------------------------------------------
 - Does NOT replace rsToggleV3()
 - Does NOT replace rsModeV3()
 - Does NOT use duplicate openTravelService()
 - Does NOT modify enquiry submission
 - Does NOT modify rental/package engines
=========================================================*/

(function () {

    "use strict";


    document.addEventListener(
        "DOMContentLoaded",
        function () {


            /*=================================================
            REFERENCES
            =================================================*/

            const widget =
                document.getElementById(
                    "rsTravelWidget"
                );


            const toggleButton =
                document.getElementById(
                    "rsTravelWidgetToggle"
                );


            const menu =
                document.getElementById(
                    "travelWidgetMenu"
                );


            const closeButton =
                document.getElementById(
                    "rsTravelWidgetClose"
                );


            const customQuoteButton =
                document.getElementById(
                    "rsTravelWidgetCustomQuote"
                );


            const servicesSection =
                document.getElementById(
                    "services"
                );


            if (
                !widget ||
                !toggleButton ||
                !menu
            ) {

                return;

            }


            /*=================================================
            CHECK OPEN STATE
            =================================================*/

            function isOpen() {


                return (
                    window
                        .getComputedStyle(menu)
                        .display !==
                    "none"
                );

            }


            /*=================================================
            SET WIDGET STATE
            =================================================*/

            function setWidgetState(open) {


                menu.style.display =
                    open
                        ? "block"
                        : "none";


                menu.setAttribute(
                    "aria-hidden",
                    open
                        ? "false"
                        : "true"
                );


                toggleButton.setAttribute(
                    "aria-expanded",
                    open
                        ? "true"
                        : "false"
                );


                toggleButton.setAttribute(
                    "aria-label",
                    open
                        ? "Close RanSan Travel Assistant"
                        : "Open RanSan Travel Assistant"
                );


                toggleButton.classList.toggle(
                    "rs-widget-active",
                    open
                );

            }


            /*=================================================
            TOGGLE
            =================================================*/

            function toggleWidget() {


                setWidgetState(
                    !isOpen()
                );

            }


            /*=================================================
            OPEN PREMIUM QUOTE
            =================================================*/

            function openQuote() {


                if (
                    typeof window.openPremiumQuote ===
                    "function"
                ) {

                    window.openPremiumQuote();

                }

            }


            /*=================================================
            SCROLL TO BOOKING HUB
            =================================================*/

            function scrollToBookingHub() {


                if (!servicesSection) {

                    return;

                }


                servicesSection.scrollIntoView(
                    {
                        behavior:
                            "smooth",

                        block:
                            "start"
                    }
                );

            }


            /*=================================================
            ENSURE ACCORDION PANEL IS OPEN

            Important:
            rsToggleV3() is a TOGGLE function.

            Calling it blindly could CLOSE an already
            open panel.

            Therefore first check .open.
            =================================================*/

            function ensurePanelOpen(panelNumber) {


                const panel =
                    document.getElementById(
                        "rsPanel" + panelNumber
                    );


                if (!panel) {

                    return false;

                }


                /*
                 * Already open:
                 * do not toggle it closed.
                 */

                if (
                    panel.classList.contains(
                        "open"
                    )
                ) {

                    return true;

                }


                if (
                    typeof window.rsToggleV3 ===
                    "function"
                ) {


                    window.rsToggleV3(
                        panelNumber
                    );


                    return true;

                }


                return false;

            }


            /*=================================================
            SELECT AIR / TRAIN / BUS TAB

            We use the existing rsModeV3()
            rather than duplicating the form logic.
            =================================================*/

            function selectTicketMode(mode) {


                const panel =
                    document.getElementById(
                        "rsPanel1"
                    );


                if (!panel) {

                    return;

                }


                const tabs =
                    panel.querySelectorAll(
                        ".rs-tab-v3"
                    );


                let targetTab =
                    null;


                tabs.forEach(
                    function (tab) {


                        const clickCode =
                            tab.getAttribute(
                                "onclick"
                            ) || "";


                        /*
                         * Existing HTML contains:
                         *
                         * rsModeV3(this,'air')
                         * rsModeV3(this,'train')
                         * rsModeV3(this,'bus')
                         */

                        if (
                            clickCode.includes(
                                "'" + mode + "'"
                            ) ||
                            clickCode.includes(
                                '"' + mode + '"'
                            )
                        ) {

                            targetTab =
                                tab;

                        }

                    }
                );


                if (!targetTab) {

                    return;

                }


                if (
                    typeof window.rsModeV3 ===
                    "function"
                ) {


                    window.rsModeV3(
                        targetTab,
                        mode
                    );

                } else {


                    /*
                     * Fallback:
                     * use existing inline onclick.
                     */

                    targetTab.click();

                }

            }


            /*=================================================
            OPTIONAL FOCUS TARGET

            After scrolling/opening, focus the first useful
            field when possible.
            =================================================*/

            function focusAfterDelay(selector) {


                if (!selector) {

                    return;

                }


                window.setTimeout(
                    function () {


                        const element =
                            document.querySelector(
                                selector
                            );


                        if (!element) {

                            return;

                        }


                        try {

                            element.focus(
                                {
                                    preventScroll:
                                        true
                                }
                            );

                        }
                        catch (error) {

                            element.focus();

                        }


                    },
                    700
                );

            }


            /*=================================================
            ROUTE SERVICE
            =================================================*/

            function routeService(route) {


                /*
                 * Close assistant immediately.
                 */

                setWidgetState(
                    false
                );


                switch (route) {


                    /*=========================================
                    FLIGHT
                    =========================================*/

                    case "flight":


                        ensurePanelOpen(
                            1
                        );


                        selectTicketMode(
                            "air"
                        );


                        scrollToBookingHub();


                        focusAfterDelay(
                            "#rsCustomerName"
                        );


                        break;


                    /*=========================================
                    TRAIN
                    =========================================*/

                    case "train":


                        ensurePanelOpen(
                            1
                        );


                        selectTicketMode(
                            "train"
                        );


                        scrollToBookingHub();


                        focusAfterDelay(
                            "#rsTrainCustomerName"
                        );


                        break;


                    /*=========================================
                    BUS
                    =========================================*/

                    case "bus":


                        ensurePanelOpen(
                            1
                        );


                        selectTicketMode(
                            "bus"
                        );


                        scrollToBookingHub();


                        focusAfterDelay(
                            "#rsBusCustomerName"
                        );


                        break;


                    /*=========================================
                    HOLIDAY PACKAGE
                    =========================================*/

                    case "package":


                        ensurePanelOpen(
                            2
                        );


                        scrollToBookingHub();


                        focusAfterDelay(
                            "#rsPackageSearch"
                        );


                        break;


                    /*=========================================
                    CAR RENTAL
                    =========================================*/

                    case "rental":


                        ensurePanelOpen(
                            3
                        );


                        scrollToBookingHub();


                        /*
                         * Your Booking Hub enhancement already
                         * handles the rental Swiper refresh after
                         * panel 3 becomes visible.

                         * We do not initialize another Swiper here.
                         */

                        focusAfterDelay(
                            "#rsRentalSearch"
                        );


                        break;


                    /*=========================================
                    UNKNOWN
                    =========================================*/

                    default:


                        openQuote();


                        break;

                }

            }


            /*=================================================
            LAUNCHER
            =================================================*/

            toggleButton.addEventListener(
                "click",
                function (event) {


                    event.preventDefault();

                    event.stopPropagation();


                    toggleWidget();

                }
            );


            /*=================================================
            CLOSE BUTTON
            =================================================*/

            if (closeButton) {


                closeButton.addEventListener(
                    "click",
                    function (event) {


                        event.preventDefault();

                        event.stopPropagation();


                        setWidgetState(
                            false
                        );


                        toggleButton.focus();

                    }
                );

            }


            /*=================================================
            SERVICE ROUTE BUTTONS
            =================================================*/

            const routeButtons =
                menu.querySelectorAll(
                    "[data-rs-widget-route]"
                );


            routeButtons.forEach(
                function (button) {


                    button.addEventListener(
                        "click",
                        function () {


                            const route =
                                button.getAttribute(
                                    "data-rs-widget-route"
                                );


                            routeService(
                                route
                            );

                        }
                    );

                }
            );


            /*=================================================
            CUSTOM QUOTE
            =================================================*/

            if (customQuoteButton) {


                customQuoteButton.addEventListener(
                    "click",
                    function () {


                        setWidgetState(
                            false
                        );


                        openQuote();

                    }
                );

            }


            /*=================================================
            OUTSIDE CLICK
            =================================================*/

            document.addEventListener(
                "click",
                function (event) {


                    if (!isOpen()) {

                        return;

                    }


                    if (
                        widget.contains(
                            event.target
                        )
                    ) {

                        return;

                    }


                    setWidgetState(
                        false
                    );

                }
            );


            /*=================================================
            ESCAPE
            =================================================*/

            document.addEventListener(
                "keydown",
                function (event) {


                    if (
                        event.key !== "Escape"
                    ) {

                        return;

                    }


                    if (!isOpen()) {

                        return;

                    }


                    setWidgetState(
                        false
                    );


                    toggleButton.focus();

                }
            );


            /*=================================================
            SYNC WITH OLD SCRIPT

            Old travel.js can still manipulate
            travelWidgetMenu.style.display.

            Keep ARIA synchronized.
            =================================================*/

            const menuObserver =
                new MutationObserver(
                    function () {


                        const open =
                            isOpen();


                        menu.setAttribute(
                            "aria-hidden",
                            open
                                ? "false"
                                : "true"
                        );


                        toggleButton.setAttribute(
                            "aria-expanded",
                            open
                                ? "true"
                                : "false"
                        );


                        toggleButton.classList.toggle(
                            "rs-widget-active",
                            open
                        );

                    }
                );


            menuObserver.observe(
                menu,
                {
                    attributes:
                        true,

                    attributeFilter:
                        [
                            "style"
                        ]
                }
            );


            /*=================================================
            INITIAL STATE
            =================================================*/

            setWidgetState(
                false
            );

        }
    );

})();