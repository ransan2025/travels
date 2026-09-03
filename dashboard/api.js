/*=========================================================
 SHARED PORTAL API
 Used by customer.html AND dashboard.html
=========================================================*/

const PORTAL_API_CONFIG = {

    apiUrl:
        "https://script.google.com/macros/s/AKfycbz8rZXT7UWNYAdw8P3QpAamTk-NKljp-b0flYogJuIr3nwTljClyI_Xc9heoy4gXUmV/exec"

};


/*=========================================================
 GET ENVIRONMENT
=========================================================*/

function getPortalEnvironment() {

    return String(

        window.CUSTOMER_ENV ||

        window.DASHBOARD_ENV ||

        sessionStorage.getItem("env") ||

        localStorage.getItem("env") ||

        "LIVE"

    )
    .trim()
    .toUpperCase();

}


/*=========================================================
 CALL PORTAL API
=========================================================*/

async function callPortalAPI(
    action,
    payload = {}
) {

    const environment =
        getPortalEnvironment();


    const request = {

        action:
            action,

        env:
            environment,

        ...payload

    };


    console.log(
        "[PORTAL API] Request =",
        request
    );


    try {

        const response =
            await fetch(

                PORTAL_API_CONFIG.apiUrl,

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify(
                            request
                        ),

                    redirect:
                        "follow",

                    cache:
                        "no-cache"

                }

            );


        if (!response.ok) {

            throw new Error(

                "Server returned HTTP " +
                response.status

            );

        }


        const result =
            await response.json();


        console.log(
            "[PORTAL API] Response =",
            result
        );


        return result;

    }


    catch (err) {

        console.error(
            "[PORTAL API] Error =",
            err
        );


        return {

            success:
                false,

            message:
                err.message ||
                "Server Error"

        };

    }

}


/*=========================================================
 LOGIN
=========================================================*/

async function portalLogin(
    username,
    password,
    environment
) {

    return await callPortalAPI(

        "login",

        {

            username:
                username,

            password:
                password,

            env:
                environment

        }

    );

}


/*=========================================================
 SAVE LOGIN SESSION
=========================================================*/

function savePortalLoginSession(
    data
) {

    sessionStorage.setItem(
        "isLoggedIn",
        "true"
    );


    sessionStorage.setItem(
        "env",
        data.env || "LIVE"
    );


    sessionStorage.setItem(
        "role",
        data.role || ""
    );


    sessionStorage.setItem(
        "username",
        data.username || ""
    );


    sessionStorage.setItem(
        "access",
        data.access || ""
    );

}


/*=========================================================
 LOGOUT
=========================================================*/

function logoutPortalUser() {

    sessionStorage.clear();

    window.location.replace(
        "login.html"
    );

}