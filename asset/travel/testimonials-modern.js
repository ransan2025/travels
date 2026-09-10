/*=========================================================
 RANSAN TRAVELS
 TESTIMONIALS MODERN
 RELIABLE PLAY / PAUSE CONTROLLER

 IMPORTANT:
 ----------------------------------------------------------
 - Does NOT generate reviews
 - Does NOT modify reviewsData
 - Does NOT replace reviews.js
 - Does NOT create another slider
 - Only controls CSS marquee Play / Pause
=========================================================*/

(function () {

    "use strict";


    document.addEventListener(
        "DOMContentLoaded",
        function () {


            /*=================================================
            FIND SECTION
            =================================================*/

            const section =
                document.querySelector(
                    ".rsx-testimonials-modern"
                );


            if (!section) {

                console.warn(
                    "Testimonials modern section not found."
                );

                return;

            }


            /*=================================================
            FIND TRACK
            =================================================*/

            const track =
                section.querySelector(
                    "#testimonialTrack"
                );


            /*=================================================
            FIND BUTTON
            =================================================*/

            const button =
                section.querySelector(
                    "#rsxTestimonialPauseBtn"
                );


            if (!track) {

                console.warn(
                    "testimonialTrack not found."
                );

                return;

            }


            if (!button) {

                console.warn(
                    "Testimonial pause button not found."
                );

                return;

            }


            const icon =
                button.querySelector(
                    "i"
                );


            const label =
                button.querySelector(
                    "span"
                );


            /*
             * false = animation running
             * true  = manually paused
             */

            let isPaused = false;


            /*=================================================
            UPDATE BUTTON
            =================================================*/

            function updateButton() {


                button.setAttribute(
                    "aria-pressed",
                    isPaused
                        ? "true"
                        : "false"
                );


                if (isPaused) {


                    if (icon) {

                        icon.className =
                            "fa-solid fa-play";

                    }


                    if (label) {

                        label.textContent =
                            "Play";

                    }


                    button.setAttribute(
                        "aria-label",
                        "Play testimonial movement"
                    );


                } else {


                    if (icon) {

                        icon.className =
                            "fa-solid fa-pause";

                    }


                    if (label) {

                        label.textContent =
                            "Pause";

                    }


                    button.setAttribute(
                        "aria-label",
                        "Pause testimonial movement"
                    );

                }

            }


            /*=================================================
            PAUSE
            =================================================*/

            function pauseTestimonials() {


                isPaused = true;


                track.classList.add(
                    "rsx-manually-paused"
                );


                /*
                 * Direct inline style guarantees pause.
                 */

                track.style.animationPlayState =
                    "paused";


                /*
                 * Also control the actual CSSAnimation object
                 * when supported.
                 */

                const animations =
                    track.getAnimations
                        ? track.getAnimations()
                        : [];


                animations.forEach(
                    function (animation) {

                        try {

                            animation.pause();

                        }
                        catch (error) {

                            /* Safe fallback uses CSS above */

                        }

                    }
                );


                updateButton();

            }


            /*=================================================
            PLAY
            =================================================*/

            function playTestimonials() {


                isPaused = false;


                track.classList.remove(
                    "rsx-manually-paused"
                );


                /*
                 * Explicitly force the CSS animation
                 * into running state.
                 */

                track.style.animationPlayState =
                    "running";


                /*
                 * Web Animations API:
                 * Resume the existing CSS animation object.
                 */

                const animations =
                    track.getAnimations
                        ? track.getAnimations()
                        : [];


                animations.forEach(
                    function (animation) {

                        try {

                            animation.play();

                        }
                        catch (error) {

                            /* CSS fallback remains active */

                        }

                    }
                );


                updateButton();

            }


            /*=================================================
            BUTTON CLICK
            =================================================*/

            button.addEventListener(
                "click",
                function (event) {


                    event.preventDefault();

                    event.stopPropagation();


                    if (isPaused) {

                        playTestimonials();

                    } else {

                        pauseTestimonials();

                    }

                }
            );


            /*=================================================
            ENHANCE GENERATED REVIEW CARDS

            This does NOT control animation.
            It only improves semantics.
            =================================================*/

            function enhanceCards() {


                const cards =
                    track.querySelectorAll(
                        ".rsx-card"
                    );


                cards.forEach(
                    function (card) {


                        if (
                            card.dataset.rsxAccessible ===
                            "true"
                        ) {

                            return;

                        }


                        card.dataset.rsxAccessible =
                            "true";


                        card.setAttribute(
                            "role",
                            "article"
                        );


                        /*
                         * IMPORTANT:
                         * Do NOT add tabindex here.
                         *
                         * Previously tabindex caused
                         * focus-within to pause the slider.
                         */

                    }
                );

            }


            enhanceCards();


            /*
             * reviews.js may populate cards shortly after
             * this file executes.
             */

            const observer =
                new MutationObserver(
                    function () {

                        enhanceCards();

                    }
                );


            observer.observe(
                track,
                {
                    childList: true
                }
            );


            /*=================================================
            PAGE VISIBILITY
            =================================================*/

            document.addEventListener(
                "visibilitychange",
                function () {


                    if (document.hidden) {


                        /*
                         * Temporarily stop while tab is hidden.
                         */

                        track.style.animationPlayState =
                            "paused";


                        return;

                    }


                    /*
                     * Restore correct user-selected state.
                     */

                    if (isPaused) {

                        pauseTestimonials();

                    } else {

                        playTestimonials();

                    }

                }
            );


            /*=================================================
            INITIAL STATE
            =================================================*/

            track.classList.remove(
                "rsx-manually-paused"
            );


            track.style.animationPlayState =
                "running";


            updateButton();


            /*
             * A second initialization after reviews.js has
             * finished generating cards.
             */

            window.setTimeout(
                function () {


                    enhanceCards();


                    if (!isPaused) {

                        playTestimonials();

                    }


                },
                300
            );

        }
    );

})();