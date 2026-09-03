/*=========================================================
 RANSAN TRAVELS
 SHARED DASHBOARD AUTH GUARD
=========================================================*/

(function protectRansanPortal() {

    /*
     * Login session created by
     * savePortalLoginSession()
     */

    const loggedIn =
        sessionStorage.getItem(
            "isLoggedIn"
        );


    /*
     * Not authenticated
     */

    if (
        loggedIn !== "true"
    ) {

        window.location.replace(
            "login.html"
        );

        return;

    }


    /*
     * Restore environment from
     * authenticated session
     */

    let env =
        (
            sessionStorage.getItem(
                "env"
            ) ||
            localStorage.getItem(
                "env"
            ) ||
            "LIVE"
        )
        .toUpperCase();


    /*
     * Only allow known environments
     */

    if (
        env !== "LIVE" &&
        env !== "TEST"
    ) {

        env =
            "LIVE";

    }


    /*
     * Make environment available
     * throughout dashboard/report
     */

    window.DASHBOARD_ENV =
        env;


    /*
     * Keep existing report environment
     * storage synchronized.
     */

    localStorage.setItem(
        "dashboardEnv",
        env
    );

})();