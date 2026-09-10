/*=========================================================
 RANSAN TRAVELS
 LOCATION / CONTACT MODERN ENHANCEMENT

 IMPORTANT:
 ----------------------------------------------------------
 - Does NOT replace switchMap()
 - Does NOT change map URLs
 - Does NOT change phone numbers
 - Does NOT change footer office-link logic
=========================================================*/

(function () {

    "use strict";


    document.addEventListener(
        "DOMContentLoaded",
        function () {


            const section =
                document.querySelector(
                    ".rs-location-modern"
                );


            if (!section) {

                return;

            }


            const chips =
                section.querySelectorAll(
                    ".rs-map-chips .chip"
                );


            const officeButtons =
                section.querySelectorAll(
                    "[data-rs-select-office]"
                );


            /*=================================================
            SYNC ACCESSIBILITY STATE

            Existing switchMap() changes .active.
            We only keep aria-pressed synchronized.
            =================================================*/

            function syncChipState() {


                chips.forEach(
                    function (chip) {


                        const active =
                            chip.classList.contains(
                                "active"
                            );


                        chip.setAttribute(
                            "aria-pressed",
                            active
                                ? "true"
                                : "false"
                        );

                    }
                );

            }


            /*=================================================
            CHIP CLICK

            switchMap() runs from existing inline onclick.
            We only sync aria AFTER that function finishes.
            =================================================*/

            chips.forEach(
                function (chip) {


                    chip.addEventListener(
                        "click",
                        function () {


                            window.setTimeout(
                                syncChipState,
                                0
                            );

                        }
                    );

                }
            );


            /*=================================================
            OFFICE CARDS → EXISTING CHIP

            No map logic duplicated here.
            We simply click the existing matching chip.
            =================================================*/

            officeButtons.forEach(
                function (button) {


                    button.addEventListener(
                        "click",
                        function () {


                            const office =
                                button.getAttribute(
                                    "data-rs-select-office"
                                );


                            if (!office) {

                                return;

                            }


                            const chip =
                                section.querySelector(
                                    `.rs-map-chips .chip[data-rs-city="${office}"]`
                                );


                            if (!chip) {

                                return;

                            }


                            chip.click();


                            /*
                             * On smaller screens move the user
                             * back toward the map after selection.
                             */

                            if (
                                window.matchMedia(
                                    "(max-width: 980px)"
                                ).matches
                            ) {


                                const mapCard =
                                    section.querySelector(
                                        ".rs-map-card"
                                    );


                                if (mapCard) {


                                    window.setTimeout(
                                        function () {


                                            mapCard.scrollIntoView(
                                                {
                                                    behavior:
                                                        "smooth",

                                                    block:
                                                        "start"
                                                }
                                            );


                                        },
                                        80
                                    );

                                }

                            }

                        }
                    );

                }
            );


            /*=================================================
            INITIAL STATE
            =================================================*/

            syncChipState();

        }
    );

})();