/*=========================================================
 RANSAN TRAVELS
 HERO MODERN ENHANCEMENT
 SAFE ADDITIVE SCRIPT
=========================================================*/

(function () {

    "use strict";


    document.addEventListener(
        "DOMContentLoaded",
        function () {


            const hero =
                document.querySelector(
                    ".hero.rs-hero-modern"
                );


            if (!hero) {

                return;

            }


            /*=================================================
            HERO ENTRANCE
            =================================================*/

            window.requestAnimationFrame(
                function () {

                    hero.classList.add(
                        "rs-hero-enhanced"
                    );

                }
            );


            /*=================================================
            SCROLL CUE

            Only controls the new cue.
            Does NOT touch existing scroll/reveal JS.
            =================================================*/

            const scrollCue =
                document.getElementById(
                    "rsHeroScrollCue"
                );


            const services =
                document.getElementById(
                    "services"
                );


            if (
                scrollCue &&
                services
            ) {

                scrollCue.addEventListener(
                    "click",
                    function () {

                        services.scrollIntoView(
                            {
                                behavior:
                                    "smooth",

                                block:
                                    "start"
                            }
                        );

                    }
                );

            }


            /*=================================================
            LIGHT DESKTOP DEPTH EFFECT

            Moves ONLY our decorative glows.
            Existing hero slides remain untouched.
            =================================================*/

            const glowOne =
                hero.querySelector(
                    ".rs-hero-glow-one"
                );


            const glowTwo =
                hero.querySelector(
                    ".rs-hero-glow-two"
                );


            const supportsPointer =
                window.matchMedia(
                    "(pointer:fine)"
                ).matches;


            const reducedMotion =
                window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;


            if (
                supportsPointer &&
                !reducedMotion &&
                glowOne &&
                glowTwo
            ) {

                hero.addEventListener(
                    "pointermove",
                    function (event) {

                        const rect =
                            hero.getBoundingClientRect();


                        const x =
                            (
                                event.clientX -
                                rect.left
                            ) /
                            rect.width -
                            .5;


                        const y =
                            (
                                event.clientY -
                                rect.top
                            ) /
                            rect.height -
                            .5;


                        glowOne.style.transform =
                            "translate(" +
                            (x * 18) +
                            "px," +
                            (y * 12) +
                            "px)";


                        glowTwo.style.transform =
                            "translate(" +
                            (x * -14) +
                            "px," +
                            (y * -10) +
                            "px)";

                    }
                );


                hero.addEventListener(
                    "pointerleave",
                    function () {

                        glowOne.style.transform =
                            "translate(0,0)";


                        glowTwo.style.transform =
                            "translate(0,0)";

                    }
                );

            }

        }
    );

})();