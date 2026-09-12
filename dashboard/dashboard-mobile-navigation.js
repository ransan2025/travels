/* =========================================================
   RANSAN TRAVELS
   MOBILE DASHBOARD NAVIGATION V1
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       SECTION MAP
       ===================================================== */

    const MOBILE_SECTIONS = {

        top: null,

        crm:
            "mobileCrmSection",

        leads:
            "mobileLeadCenterSection",

        priority:
            "mobilePrioritySection",

        actions:
            "mobileDashboardActions"

    };


    /* =====================================================
       MOBILE CHECK
       ===================================================== */

    function isMobile() {

        return (
            window.innerWidth <= 767
        );

    }


    /* =====================================================
       NAV ELEMENT
       ===================================================== */

    function getNav() {

        return document.getElementById(
            "ranSanMobileNav"
        );

    }


    /* =====================================================
       SCROLL TO SECTION
       ===================================================== */

    function go(
        sectionName
    ) {

        if (
            !isMobile()
        ) {

            return;

        }


        clearActiveState();


        setActiveState(
            sectionName
        );


        /*
         * HOME
         */

        if (
            sectionName === "top"
        ) {

            window.scrollTo({

                top:
                    0,

                behavior:
                    "smooth"

            });

            return;

        }


        const id =
            MOBILE_SECTIONS[
                sectionName
            ];


        if (
            !id
        ) {

            return;

        }


        const element =
            document.getElementById(
                id
            );


        if (
            !element
        ) {

            console.warn(
                "[MOBILE NAV] Section not found:",
                id
            );

            return;

        }


        element.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }


    /* =====================================================
       ACTIVE STATE
       ===================================================== */

    function clearActiveState() {

        document
            .querySelectorAll(
                ".ranSanMobileNavBtn"
            )
            .forEach(
                function (
                    button
                ) {

                    button
                        .classList
                        .remove(
                            "active"
                        );

                }
            );

    }


    function setActiveState(
        sectionName
    ) {

        const button =
            document.querySelector(
                '.ranSanMobileNavBtn' +
                '[data-mobile-nav="' +
                sectionName +
                '"]'
            );


        if (
            button
        ) {

            button
                .classList
                .add(
                    "active"
                );

        }

    }


    /* =====================================================
       AUTO ACTIVE SECTION
       ===================================================== */

    function updateActiveFromScroll() {

        if (
            !isMobile()
        ) {

            return;

        }


        /*
         * Do not update while a drawer/modal
         * is covering the dashboard.
         */

        if (
            shouldHideNavigation()
        ) {

            return;

        }


        const scrollPoint =
            window.scrollY +
            (
                window.innerHeight *
                0.32
            );


        let activeSection =
            "top";


        const orderedSections = [

            [
                "actions",
                "mobileDashboardActions"
            ],

            [
                "crm",
                "mobileCrmSection"
            ],

            [
                "leads",
                "mobileLeadCenterSection"
            ],

            [
                "priority",
                "mobilePrioritySection"
            ]

        ];


        orderedSections
            .forEach(
                function (
                    item
                ) {

                    const element =
                        document.getElementById(
                            item[1]
                        );


                    if (
                        !element
                    ) {

                        return;

                    }


                    const top =
                        element
                            .getBoundingClientRect()
                            .top +
                        window.scrollY;


                    if (
                        scrollPoint >=
                        top
                    ) {

                        activeSection =
                            item[0];

                    }

                }
            );


        clearActiveState();

        setActiveState(
            activeSection
        );

    }


    /* =====================================================
       MODAL / DRAWER DETECTION
       ===================================================== */

    function elementIsVisible(
        element
    ) {

        if (
            !element
        ) {

            return false;

        }


        const style =
            window.getComputedStyle(
                element
            );


        return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            Number(
                style.opacity || 1
            ) !== 0
        );

    }


    function shouldHideNavigation() {

        const customerDrawer =
            document.getElementById(
                "customerDrawerV2"
            );


        if (
            customerDrawer &&
            customerDrawer
                .classList
                .contains(
                    "active"
                )
        ) {

            return true;

        }


        const priorityModal =
            document.getElementById(
                "priorityModal"
            );


        if (
            elementIsVisible(
                priorityModal
            )
        ) {

            return true;

        }


        const leadModal =
            document.getElementById(
                "leadCenterModalV2"
            );


        if (
            elementIsVisible(
                leadModal
            )
        ) {

            return true;

        }


        const documentModal =
            document.getElementById(
                "bookingDocumentsModal"
            );


        if (
            documentModal &&
            documentModal
                .classList
                .contains(
                    "active"
                )
        ) {

            return true;

        }


        return false;

    }


    /* =====================================================
       NAV VISIBILITY
       ===================================================== */

    function updateVisibility() {

        const nav =
            getNav();


        if (
            !nav
        ) {

            return;

        }


        if (
            !isMobile()
        ) {

            nav
                .classList
                .remove(
                    "visible"
                );

            nav
                .classList
                .add(
                    "hidden"
                );

            return;

        }


        if (
            shouldHideNavigation()
        ) {

            nav
                .classList
                .remove(
                    "visible"
                );

            nav
                .classList
                .add(
                    "hidden"
                );

        }

        else {

            nav
                .classList
                .remove(
                    "hidden"
                );

            nav
                .classList
                .add(
                    "visible"
                );

        }

    }


    /* =====================================================
       OBSERVE MODALS / DRAWERS
       ===================================================== */

    function observeWorkspaceChanges() {

        const ids = [

            "customerDrawerV2",

            "priorityModal",

            "leadCenterModalV2",

            "bookingDocumentsModal"

        ];


        const observer =
            new MutationObserver(
                function () {

                    updateVisibility();

                }
            );


        ids.forEach(
            function (
                id
            ) {

                const element =
                    document.getElementById(
                        id
                    );


                if (
                    !element
                ) {

                    return;

                }


                observer.observe(
                    element,
                    {

                        attributes:
                            true,

                        attributeFilter:
                            [
                                "class",
                                "style",
                                "aria-hidden"
                            ]

                    }
                );

            }
        );

    }


    /* =====================================================
       SCROLL THROTTLE
       ===================================================== */

    let scrollTicking =
        false;


    function handleScroll() {

        if (
            scrollTicking
        ) {

            return;

        }


        scrollTicking =
            true;


        window.requestAnimationFrame(
            function () {

                updateActiveFromScroll();

                scrollTicking =
                    false;

            }
        );

    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    function init() {

        const nav =
            getNav();


        if (
            !nav
        ) {

            console.warn(
                "[MOBILE NAV] Navbar not found."
            );

            return;

        }


        updateVisibility();

        updateActiveFromScroll();

        observeWorkspaceChanges();


        window.addEventListener(
            "scroll",
            handleScroll,
            {
                passive:
                    true
            }
        );


        window.addEventListener(
            "resize",
            function () {

                updateVisibility();

                updateActiveFromScroll();

            }
        );

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.RanSanMobileNavigation = {

        go:
            go,

        refresh:
            function () {

                updateVisibility();

                updateActiveFromScroll();

            }

    };


    /* =====================================================
       START
       ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

})();