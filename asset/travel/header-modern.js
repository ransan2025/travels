/*=========================================================
 RANSAN TRAVELS
 MODERN HEADER / NAVIGATION
=========================================================*/

(function () {

    "use strict";


    /*=====================================================
    ELEMENTS
    =====================================================*/

    const header =
        document.getElementById(
            "rsMainHeader"
        );


    const mobileButton =
        document.getElementById(
            "rsMobileMenuBtn"
        );


    const mobileMenu =
        document.getElementById(
            "rsMobileMenu"
        );


    const mobileClose =
        document.getElementById(
            "rsMobileMenuClose"
        );


    const backdrop =
        document.getElementById(
            "rsMobileMenuBackdrop"
        );


    if (!header) {

        return;

    }


    /*=====================================================
    MOBILE MENU
    =====================================================*/

    function openMobileMenu() {

        if (
            !mobileMenu ||
            !mobileButton ||
            !backdrop
        ) {

            return;

        }


        mobileMenu.classList.add(
            "open"
        );


        backdrop.classList.add(
            "show"
        );


        mobileButton.classList.add(
            "active"
        );


        mobileButton.setAttribute(
            "aria-expanded",
            "true"
        );


        mobileMenu.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "rs-mobile-menu-open"
        );

    }


    function closeMobileMenu() {

        if (
            !mobileMenu ||
            !mobileButton ||
            !backdrop
        ) {

            return;

        }


        mobileMenu.classList.remove(
            "open"
        );


        backdrop.classList.remove(
            "show"
        );


        mobileButton.classList.remove(
            "active"
        );


        mobileButton.setAttribute(
            "aria-expanded",
            "false"
        );


        mobileMenu.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "rs-mobile-menu-open"
        );

    }


    if (mobileButton) {

        mobileButton.addEventListener(
            "click",
            function () {

                if (
                    mobileMenu &&
                    mobileMenu.classList.contains(
                        "open"
                    )
                ) {

                    closeMobileMenu();

                }
                else {

                    openMobileMenu();

                }

            }
        );

    }


    if (mobileClose) {

        mobileClose.addEventListener(
            "click",
            closeMobileMenu
        );

    }


    if (backdrop) {

        backdrop.addEventListener(
            "click",
            closeMobileMenu
        );

    }


    /*=====================================================
    ESCAPE KEY
    =====================================================*/

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeMobileMenu();

            }

        }
    );


    /*=====================================================
    CLOSE AFTER MOBILE LINK CLICK
    =====================================================*/

    document
        .querySelectorAll(
            ".rs-mobile-links .nav-link"
        )
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    closeMobileMenu
                );

            }
        );


    /*=====================================================
    MOBILE BOOK BUTTON
    CLOSE DRAWER AFTER CLICK
    =====================================================*/

    const mobileBookButton =
        document.querySelector(
            ".rs-mobile-book-btn"
        );


    if (mobileBookButton) {

        mobileBookButton.addEventListener(
            "click",
            function () {

                closeMobileMenu();

            }
        );

    }


    /*=====================================================
    HEADER SCROLL APPEARANCE
    =====================================================*/

    function updateHeaderScrollState() {

        header.classList.toggle(
            "rs-header-scrolled",
            window.scrollY > 20
        );

    }


    updateHeaderScrollState();


    window.addEventListener(
        "scroll",
        updateHeaderScrollState,
        {
            passive:
                true
        }
    );


    /*=====================================================
    ACTIVE NAVIGATION
    =====================================================*/

    const desktopLinks =
        Array.from(
            document.querySelectorAll(
                "#rsDesktopMenu .nav-link"
            )
        );


    const mobileLinks =
        Array.from(
            document.querySelectorAll(
                ".rs-mobile-links .nav-link"
            )
        );


    const allNavigationLinks =
        desktopLinks.concat(
            mobileLinks
        );


    const sectionIds =
        [
            "services",
            "offer",
            "about",
            "reviews",
            "gallery",
            "location"
        ];


    const sections =
        sectionIds
            .map(
                function (id) {

                    return document.getElementById(
                        id
                    );

                }
            )
            .filter(
                Boolean
            );


    function setActiveNavigation(
        id
    ) {

        allNavigationLinks.forEach(
            function (link) {

                const href =
                    link.getAttribute(
                        "href"
                    );


                link.classList.toggle(
                    "active",
                    href ===
                        "#" + id
                );

            }
        );

    }


    /*=====================================================
    SECTION OBSERVER
    =====================================================*/

    if (
        "IntersectionObserver"
        in window
    ) {

        const sectionObserver =
            new IntersectionObserver(

                function (entries) {

                    const visible =
                        entries
                            .filter(
                                function (entry) {

                                    return (
                                        entry.isIntersecting
                                    );

                                }
                            )
                            .sort(
                                function (a, b) {

                                    return (
                                        b.intersectionRatio -
                                        a.intersectionRatio
                                    );

                                }
                            );


                    if (
                        visible.length
                    ) {

                        setActiveNavigation(
                            visible[0]
                                .target
                                .id
                        );

                    }

                },

                {

                    root:
                        null,

                    rootMargin:
                        "-20% 0px -55% 0px",

                    threshold:
                        [
                            0.01,
                            0.15,
                            0.30,
                            0.50
                        ]

                }

            );


        sections.forEach(
            function (section) {

                sectionObserver.observe(
                    section
                );

            }
        );

    }


    /*=====================================================
    DIRECT NAV CLICK

    Immediately updates selected item.
    Smooth scrolling is already enabled by your site CSS.
    =====================================================*/

    allNavigationLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !href ||
                        href.charAt(0) !== "#"
                    ) {

                        return;

                    }


                    const id =
                        href.substring(
                            1
                        );


                    if (id) {

                        setActiveNavigation(
                            id
                        );

                    }

                }
            );

        }
    );


    /*=====================================================
    RESIZE SAFETY
    =====================================================*/

    window.addEventListener(
        "resize",
        function () {

            if (
                window.innerWidth > 900
            ) {

                closeMobileMenu();

            }

        },
        {
            passive:
                true
        }
    );

})();