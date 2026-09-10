/* =====================================================
INLINE EXPAND JS
===================================================== */
function rsToggleV3(id) {
    for (let i = 1; i <= 4; i++) {
        let wrap =
            document.querySelectorAll(
                ".rs-service-wrap-item-v3"
            )[i - 1];
        let panel =
            document.getElementById(
                "rsPanel" + i
            );
        let arrow =
            document.getElementById(
                "rsArrow" + i
            );
        if (i === id) {
            panel.classList.toggle("open");
            wrap.classList.toggle("active");
            arrow.innerText =
                panel.classList.contains("open")
                    ? "−"
                    : "+";
        } else {
            panel.classList.remove("open");
            wrap.classList.remove("active");
            arrow.innerText = "+";
        }
    }
}
let rsModeType = "air";
/* =====================================================
TAB SWITCH
===================================================== */
function rsModeV3(el, type) {
    rsModeType = type;
    document.querySelectorAll(".rs-tab-v3")
        .forEach(btn =>
            btn.classList.remove("active"));
    el.classList.add("active");
    // Hide all forms
    document.getElementById(
        "airFields"
    ).style.display = "none";
    document.getElementById(
        "trainFields"
    ).style.display = "none";
    document.getElementById(
        "busFields"
    ).style.display = "none";
    // Show selected form
    if (type === "air") {
        document.getElementById(
            "airFields"
        ).style.display = "block";
    }
    if (type === "train") {
        document.getElementById(
            "trainFields"
        ).style.display = "block";
    }
    if (type === "bus") {
        document.getElementById(
            "busFields"
        ).style.display = "block";
    }
}

const SCRIPT_URL = getApiUrl();


// =========================
// SEND ENQUIRY
// =========================
async function rsSendWhatsapp(btn) {
    // =========================
    // BUTTON LOADER
    // =========================
    const originalText =
        btn ? btn.innerHTML : "Send Enquiry";
    if (btn) {
        btn.disabled = true;
        btn.innerHTML =
            `
<span class="rs-btn-loader"></span>
<span>Sending Enquiry...</span>
`;
    }
    let payload = {};

    // =========================
    // AIR
    // =========================
    if (rsModeType === "air") {

        payload = {

            action: "saveEnquiry",

            sheet: "Air",

            type: "air",

            data: {

                "Customer Name":
                    document.getElementById("rsCustomerName").value.trim(),

                "Phone":
                    document.getElementById("rsMobile").value.trim(),

                "From":
                    document.getElementById("rsAirFrom").value.trim(),

                "To":
                    document.getElementById("rsAirTo").value.trim(),

                "Travel Date":
                    document.getElementById("rsAirDate").value,

                "Adult":
                    document.getElementById("rsAdult").value,

                "Child":
                    document.getElementById("rsChild").value,

                "Infant":
                    document.getElementById("rsInfant").value,

                "Notes":
                    document.getElementById("rsNotes").value,

                "Source":
                    "Website"

            }

        };

    }

    // =========================
    // TRAIN
    // =========================
    else if (rsModeType === "train") {

        payload = {

            action: "saveEnquiry",

            sheet: "Train",

            type: "train",

            data: {

                "Customer Name":
                    document.getElementById("rsTrainCustomerName").value.trim(),

                "Phone":
                    document.getElementById("rsTrainMobile").value.trim(),

                "From":
                    document.getElementById("rsTrainFrom").value.trim(),

                "To":
                    document.getElementById("rsTrainTo").value.trim(),

                "Travel Date":
                    document.getElementById("rsTrainDate").value,

                "Class":
                    document.getElementById("rsTrainClass").value,

                "Passengers":
                    document.getElementById("rsTrainPassenger").value,

                "Notes":
                    document.getElementById("rsTrainNotes").value,

                "Source":
                    "Website"

            }

        };

    }

    // =========================
    // BUS
    // =========================
    else if (rsModeType === "bus") {

        payload = {

            action: "saveEnquiry",

            sheet: "Bus",

            type: "bus",

            data: {

                "Customer Name":
                    document.getElementById("rsBusCustomerName").value.trim(),

                "Phone":
                    document.getElementById("rsBusMobile").value.trim(),

                "From":
                    document.getElementById("rsBusFrom").value.trim(),

                "To":
                    document.getElementById("rsBusTo").value.trim(),

                "Travel Date":
                    document.getElementById("rsBusDate").value,

                "Class":
                    document.getElementById("rsBusClass").value,

                "Passengers":
                    document.getElementById("rsBusPassenger").value,

                "Notes":
                    document.getElementById("rsBusNotes").value,

                "Source":
                    "Website"

            }

        };

    }

    if (rsModeType === "air") {

        if (!payload.data["Customer Name"]) {

            rsToast("Enter Customer Name", true);

            btn.disabled = false;

            btn.innerHTML = originalText;

            return;

        }

        if (!payload.data["Phone"]) {

            rsToast("Enter Mobile Number", true);

            btn.disabled = false;

            btn.innerHTML = originalText;

            return;

        }

        if (!payload.data["From"]) {

            rsToast("Enter From City", true);

            btn.disabled = false;

            btn.innerHTML = originalText;

            return;

        }

        if (!payload.data["To"]) {

            rsToast("Enter Destination", true);

            btn.disabled = false;

            btn.innerHTML = originalText;

            return;

        }

        if (rsModeType === "train") {

            if (!payload.data["Customer Name"]) {

                rsToast("Enter Customer Name", true);

                btn.disabled = false;
                btn.innerHTML = originalText;
                return;

            }

            if (!payload.data["Phone"]) {

                rsToast("Enter Mobile Number", true);

                btn.disabled = false;
                btn.innerHTML = originalText;
                return;

            }

            if (!payload.data["From"]) {

                rsToast("Enter From Station", true);

                btn.disabled = false;
                btn.innerHTML = originalText;
                return;

            }

            if (!payload.data["To"]) {

                rsToast("Enter Destination", true);

                btn.disabled = false;
                btn.innerHTML = originalText;
                return;

            }

        }

    }

    if (rsModeType === "train") {

        if (!payload.data["Customer Name"]) {

            rsToast("Enter Customer Name", true);

            btn.disabled = false;
            btn.innerHTML = originalText;
            return;

        }

        if (!payload.data["Phone"]) {

            rsToast("Enter Mobile Number", true);

            btn.disabled = false;
            btn.innerHTML = originalText;
            return;

        }

        if (!payload.data["From"]) {

            rsToast("Enter From Station", true);

            btn.disabled = false;
            btn.innerHTML = originalText;
            return;

        }

        if (!payload.data["To"]) {

            rsToast("Enter Destination", true);

            btn.disabled = false;
            btn.innerHTML = originalText;
            return;

        }

    }

    if (rsModeType === "bus") {

        if (!payload.data["Customer Name"]) {

            rsToast("Enter Customer Name", true);

            btn.disabled = false;

            btn.innerHTML = originalText;

            return;

        }

        if (!payload.data["Phone"]) {

            rsToast("Enter Mobile Number", true);

            btn.disabled = false;

            btn.innerHTML = originalText;

            return;

        }

        if (!payload.data["From"]) {

            rsToast("Enter Boarding Place", true);

            btn.disabled = false;

            btn.innerHTML = originalText;

            return;

        }

        if (!payload.data["To"]) {

            rsToast("Enter Destination", true);

            btn.disabled = false;

            btn.innerHTML = originalText;

            return;

        }

    }

    console.log("Sending Payload:", payload);

    try {

        payload.env = getIndexEnvironment();

        const response = await fetch(getApiUrl(), {

            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify(payload)

        });
        const result = await response.json();
        console.log("Server Response:", result);

        // =========================
        // SUCCESS
        // =========================
        if (result.success) {
            rsToast(
                "✅ Enquiry Submitted Successfully"
            );

            rsSuccessPopup();

            // RESET FORM
            document.getElementById("rsCustomerName").value = "";

            document.getElementById("rsMobile").value = "";

            document.getElementById("rsAirFrom").value = "";

            document.getElementById("rsAirTo").value = "";

            document.getElementById("rsAirDate").value = "";

            document.getElementById("rsAdult").value = "1";

            document.getElementById("rsChild").value = "0";

            document.getElementById("rsInfant").value = "0";

            document.getElementById("rsNotes").value = "";

            if (rsModeType === "train") {

                document.getElementById("rsTrainCustomerName").value = "";

                document.getElementById("rsTrainMobile").value = "";

                document.getElementById("rsTrainFrom").value = "";

                document.getElementById("rsTrainTo").value = "";

                document.getElementById("rsTrainDate").value = "";

                document.getElementById("rsTrainClass").value = "";

                document.getElementById("rsTrainPassenger").value = "1";

                document.getElementById("rsTrainNotes").value = "";

            }

            if (rsModeType === "bus") {

                document.getElementById("rsBusCustomerName").value = "";

                document.getElementById("rsBusMobile").value = "";

                document.getElementById("rsBusFrom").value = "";

                document.getElementById("rsBusTo").value = "";

                document.getElementById("rsBusDate").value = "";

                document.getElementById("rsBusClass").value = "";

                document.getElementById("rsBusPassenger").value = "1";

                document.getElementById("rsBusNotes").value = "";

            }


        }
        // =========================
        // ERROR
        // =========================
        else {
            rsToast(
                "❌ " + (
                    result.error ||
                    "Submission failed"
                ),
                true
            );
        }
    }
    catch (err) {
        console.error(err);
        rsToast(
            "❌ Network error",
            true
        );
    }

    // =========================
    // RESET BUTTON
    // =========================
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}


// ========================================
// LIVE SEARCH FEEL
// ========================================

const rsCities = [

    "Chennai",
    "Dubai",
    "Singapore",
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Kuala Lumpur",
    "Colombo",
    "Bangkok",
    "Maldives",
    "Sharjah",
    "Abu Dhabi",
    "London",
    "Paris",
    "Toronto",
    "Sydney",
    "Madurai",
    "Coimbatore",
    "Trichy"

];


// ========================================
// INIT LIVE SEARCH
// ========================================

function rsInitLiveSearch() {

    const fromInput =
        document.getElementById("rsAirFrom");

    const toInput =
        document.getElementById("rsAirTo");

    const suggest =
        document.getElementById("rsAirSuggest");

    if (
        !fromInput ||
        !toInput ||
        !suggest
    ) return;


    // ====================================
    // INPUT SEARCH
    // ====================================

    function attachSearch(input) {

        input.addEventListener("input", function () {

            const value =
                input.value
                    .trim()
                    .toLowerCase();

            suggest.innerHTML = "";

            // HIDE IF EMPTY

            if (!value) {

                suggest.style.display = "none";

                return;

            }

            // FILTER

            const matches =
                rsCities.filter(city =>

                    city
                        .toLowerCase()
                        .includes(value)

                );

            // NO RESULT

            if (!matches.length) {

                suggest.style.display = "none";

                return;

            }

            // SHOW

            suggest.style.display = "block";

            matches.forEach(city => {

                const item =
                    document.createElement("div");

                item.className =
                    "rs-air-item";

                item.innerHTML =
                    `
<div class="rs-air-icon">
✈
</div>

<div>
<div class="rs-air-city">
${city}
</div>

<div class="rs-air-country">
Popular Destination
</div>
</div>
`;

                item.onclick = () => {

                    input.value = city;

                    suggest.style.display =
                        "none";

                };

                suggest.appendChild(item);

            });

        });

    }


    // ATTACH BOTH INPUTS

    attachSearch(fromInput);

    attachSearch(toInput);


    // ====================================
    // OUTSIDE CLICK
    // ====================================

    document.addEventListener(
        "click",
        function (e) {

            if (
                !suggest.contains(e.target) &&
                e.target !== fromInput &&
                e.target !== toInput
            ) {

                suggest.style.display =
                    "none";

            }

        }
    );

}


// START
rsInitLiveSearch();


// ========================================
// QUICK ROUTES
// ========================================

function rsQuickRoute(from, to) {

    document.getElementById(
        "rsAirFrom"
    ).value = from;

    document.getElementById(
        "rsAirTo"
    ).value = to;

    rsToast(
        `✈ Route Selected:
        ${from} → ${to}`
    );

}



/* =========================================
AI SMART ROUTE SUGGESTIONS
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const rsAIRoutes = {

        "dubai": {
            price: "₹18,999",
            season: "Best time: Nov → Feb",
            visa: "Visa Available",
            emoji: "✈️"
        },

        "singapore": {
            price: "₹22,499",
            season: "Best time: Dec → March",
            visa: "Visa Free Transit",
            emoji: "🌆"
        },

        "maldives": {
            price: "₹24,999",
            season: "Best time: Oct → April",
            visa: "Visa On Arrival",
            emoji: "🏝️"
        },

        "mumbai": {
            price: "₹4,999",
            season: "Daily Flights Available",
            visa: "Domestic Route",
            emoji: "🏙️"
        },

        "delhi": {
            price: "₹5,999",
            season: "Flights Every Hour",
            visa: "Domestic Route",
            emoji: "🇮🇳"
        },

        "bangkok": {
            price: "₹17,499",
            season: "Popular Holiday Route",
            visa: "Easy Visa",
            emoji: "🌏"
        }

    };

    // =========================================
    // ELEMENTS
    // =========================================

    const rsAirToInput =
        document.getElementById("rsAirTo");

    const rsAIBox =
        document.getElementById("rsAISuggestion");

    // SAFETY CHECK

    if (!rsAirToInput || !rsAIBox) {
        console.log("AI Suggestion elements missing");
        return;
    }

    // =========================================
    // INPUT EVENT
    // =========================================

    rsAirToInput.addEventListener("input", function () {

        const value =
            this.value.toLowerCase().trim();

        // EMPTY

        if (!value) {

            rsAIBox.style.display = "none";

            return;
        }

        let found = null;

        for (const city in rsAIRoutes) {

            if (city.includes(value)) {

                found = rsAIRoutes[city];

                break;
            }

        }

        // NO MATCH

        if (!found) {

            rsAIBox.style.display = "none";

            return;
        }

        // SHOW

        rsAIBox.style.display = "block";

        rsAIBox.innerHTML = `

<div class="rs-ai-card">

    <div class="rs-ai-top">

        <span class="rs-ai-emoji">
            ${found.emoji}
        </span>

        <div>

            <div class="rs-ai-title">
                AI Smart Travel Suggestion
            </div>

            <div class="rs-ai-sub">
                Estimated fare from
                <b>${found.price}</b>
            </div>

        </div>

    </div>

    <div class="rs-ai-meta">
        📅 ${found.season}
    </div>

    <div class="rs-ai-meta">
        🛂 ${found.visa}
    </div>

</div>
`;

    });

});