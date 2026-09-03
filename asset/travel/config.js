/*
=================================
RanSan Global Configuration
=================================
*/

const RS_CONFIG = {

    API_URL:
    "https://script.google.com/macros/s/AKfycbz8rZXT7UWNYAdw8P3QpAamTk-NKljp-b0flYogJuIr3nwTljClyI_Xc9heoy4gXUmV/exec"

};

/*=========================================
INDEX ENVIRONMENT
=========================================*/

// Default Environment
const DEFAULT_ENV = "LIVE";

// Read saved environment
const INDEX_ENV =
    localStorage.getItem("INDEX_ENV") || DEFAULT_ENV;

/*=========================================
API
=========================================*/

function getApi(action) {

    return RS_CONFIG.API_URL +
        "?action=" + action +
        "&env=" + INDEX_ENV;

}

/*=========================================
HELPER FUNCTIONS
=========================================*/

function setIndexEnvironment(env) {

    env = String(env).toUpperCase();

    if (env !== "LIVE" && env !== "TEST") {
        return;
    }

    localStorage.setItem("INDEX_ENV", env);

    location.reload();

}

function getIndexEnvironment() {

    return INDEX_ENV;

}

/*
=================================
API Helpers
=================================
*/

function getApiUrl(action = "") {

    let url = RS_CONFIG.API_URL;

    if (action) {
        url += "?action=" + encodeURIComponent(action);
    }

    url += (url.includes("?") ? "&" : "?") +
        "env=" + getIndexEnvironment();

    return url;
}

function apiFetch(action = "", options = {}) {

    return fetch(getApiUrl(action), options);

}