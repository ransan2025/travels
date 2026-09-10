/*=========================================================
 RANSAN TRAVELS
 WHY SECTION MODERN ENHANCEMENT

 Important:
 - No reveal observer here.
 - No duplicate scroll listener.
 - Existing travel.js owns reveal animations.
=========================================================*/

(function () {

    "use strict";


    document.addEventListener(
        "DOMContentLoaded",
        function () {


            /*=================================================
            SECTION
            =================================================*/

            const section =
                document.querySelector(
                    ".rs-why-section.rs-why-modern"
                );


            if (!section) {

                return;

            }


            /*=================================================
            CARDS
            =================================================*/

            const cards =
                section.querySelectorAll(
                    ".rs-why-card"
                );


            if (!cards.length) {

                return;

            }


            /*=================================================
            DEVICE CHECK

            Pointer lighting only makes sense with mouse /
            precision pointer.
            =================================================*/

            const supportsPointer =
                window.matchMedia(
                    "(pointer: fine)"
                ).matches;


            const reducedMotion =
                window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;


            if (
                !supportsPointer ||
                reducedMotion
            ) {

                return;

            }


            /*=================================================
            POINTER LIGHT
            =================================================*/

            cards.forEach(
                function (card) {


                    const shell =
                        card.querySelector(
                            ".rs-why-card-shell"
                        );


                    if (!shell) {

                        return;

                    }


                    card.addEventListener(
                        "pointermove",
                        function (event) {


                            const rect =
                                shell.getBoundingClientRect();


                            const x =
                                event.clientX -
                                rect.left;


                            const y =
                                event.clientY -
                                rect.top;


                            shell.style.setProperty(
                                "--rs-light-x",
                                x + "px"
                            );


                            shell.style.setProperty(
                                "--rs-light-y",
                                y + "px"
                            );

                        }
                    );


                    card.addEventListener(
                        "pointerleave",
                        function () {


                            shell.style.setProperty(
                                "--rs-light-x",
                                "50%"
                            );


                            shell.style.setProperty(
                                "--rs-light-y",
                                "0%"
                            );

                        }
                    );

                }
            );

        }
    );

})();