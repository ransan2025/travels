/*=========================================================
 RANSAN TRAVELS
 GALLERY / JOURNEY ENHANCEMENT

 IMPORTANT:
 ----------------------------------------------------------
 - Does NOT replace existing gallery filtering
 - Does NOT duplicate travel.js filter logic
 - Adds accessibility + image preview only
=========================================================*/

(function () {

    "use strict";


    document.addEventListener(
        "DOMContentLoaded",
        function () {


            const gallery =
                document.querySelector(
                    ".rs-gallery-modern"
                );


            if (!gallery) {

                return;

            }


            /*=================================================
            FILTER ACCESSIBILITY
            =================================================*/

            const filters =
                gallery.querySelectorAll(
                    ".rs-gallery-filters span"
                );


            function syncFilterAccessibility() {


                filters.forEach(
                    function (filter) {


                        const isActive =
                            filter.classList.contains(
                                "active"
                            );


                        filter.setAttribute(
                            "aria-pressed",
                            isActive
                                ? "true"
                                : "false"
                        );

                    }
                );

            }


            filters.forEach(
                function (filter) {


                    /*
                     * Existing travel.js handles CLICK.
                     * We only map Enter / Space to that
                     * same click event.
                     */

                    filter.addEventListener(
                        "keydown",
                        function (event) {


                            if (
                                event.key !== "Enter" &&
                                event.key !== " "
                            ) {

                                return;

                            }


                            event.preventDefault();

                            filter.click();

                        }
                    );


                    /*
                     * travel.js click listener runs first/alongside.
                     * Sync aria after class change has completed.
                     */

                    filter.addEventListener(
                        "click",
                        function () {


                            window.setTimeout(
                                syncFilterAccessibility,
                                0
                            );

                        }
                    );

                }
            );


            syncFilterAccessibility();


            /*=================================================
            LIGHTBOX REFERENCES
            =================================================*/

            const lightbox =
                gallery.querySelector(
                    "#rsGalleryLightbox"
                );


            const lightboxImage =
                gallery.querySelector(
                    "#rsGalleryLightboxImage"
                );


            const lightboxTitle =
                gallery.querySelector(
                    "#rsGalleryLightboxTitle"
                );


            const lightboxType =
                gallery.querySelector(
                    "#rsGalleryLightboxType"
                );


            const closeButton =
                gallery.querySelector(
                    "#rsGalleryLightboxClose"
                );


            const viewButtons =
                gallery.querySelectorAll(
                    ".rs-gallery-view-btn"
                );


            if (
                !lightbox ||
                !lightboxImage ||
                !lightboxTitle ||
                !closeButton
            ) {

                return;

            }


            let lastFocusedElement =
                null;


            /*=================================================
            OPEN LIGHTBOX
            =================================================*/

            function openLightbox(card) {


                if (!card) {

                    return;

                }


                const image =
                    card.querySelector(
                        "img"
                    );


                if (!image) {

                    return;

                }


                const title =
                    card.dataset.galleryTitle ||
                    card.querySelector(
                        ".gallery-overlay h3"
                    )?.textContent.trim() ||
                    "RanSan Journey";


                const type =
                    card.dataset.galleryType ||
                    "Travel Experience";


                lastFocusedElement =
                    document.activeElement;


                lightboxImage.src =
                    image.currentSrc ||
                    image.src;


                lightboxImage.alt =
                    image.alt ||
                    title;


                lightboxTitle.textContent =
                    title;


                if (lightboxType) {

                    lightboxType.textContent =
                        type;

                }


                lightbox.classList.add(
                    "active"
                );


                lightbox.setAttribute(
                    "aria-hidden",
                    "false"
                );


                document.body.classList.add(
                    "rs-gallery-lightbox-open"
                );


                closeButton.focus();

            }


            /*=================================================
            CLOSE LIGHTBOX
            =================================================*/

            function closeLightbox() {


                lightbox.classList.remove(
                    "active"
                );


                lightbox.setAttribute(
                    "aria-hidden",
                    "true"
                );


                document.body.classList.remove(
                    "rs-gallery-lightbox-open"
                );


                /*
                 * Clear src after transition/render cycle.
                 */

                window.setTimeout(
                    function () {


                        if (
                            !lightbox.classList.contains(
                                "active"
                            )
                        ) {

                            lightboxImage.src =
                                "";

                        }

                    },
                    100
                );


                if (
                    lastFocusedElement &&
                    typeof lastFocusedElement.focus ===
                        "function"
                ) {

                    lastFocusedElement.focus();

                }

            }


            /*=================================================
            VIEW BUTTONS
            =================================================*/

            viewButtons.forEach(
                function (button) {


                    button.addEventListener(
                        "click",
                        function (event) {


                            event.preventDefault();

                            event.stopPropagation();


                            const card =
                                button.closest(
                                    ".gallery-card"
                                );


                            openLightbox(
                                card
                            );

                        }
                    );

                }
            );


            /*=================================================
            CLOSE BUTTON
            =================================================*/

            closeButton.addEventListener(
                "click",
                closeLightbox
            );


            /*=================================================
            BACKDROP CLOSE
            =================================================*/

            const backdrop =
                gallery.querySelector(
                    "[data-rs-gallery-close]"
                );


            if (backdrop) {

                backdrop.addEventListener(
                    "click",
                    closeLightbox
                );

            }


            /*=================================================
            ESCAPE CLOSE
            =================================================*/

            document.addEventListener(
                "keydown",
                function (event) {


                    if (
                        event.key !== "Escape"
                    ) {

                        return;

                    }


                    if (
                        !lightbox.classList.contains(
                            "active"
                        )
                    ) {

                        return;

                    }


                    closeLightbox();

                }
            );

        }
    );

})();