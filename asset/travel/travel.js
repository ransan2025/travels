
/* =========================================
   RANSAN HERO JS (UPDATED CLEAN VERSION)
   Slider + Auto Dots + Typing Text
========================================= */
/* -------------------------------
   HERO SLIDER
-------------------------------- */
const slides = document.querySelectorAll('.hero-slide');
const dotsWrap = document.querySelector('.hero-dots');
let current = 0;
let sliderTimer;

/* Festival lock */

window.currentFestivalHero = null;

/* Create dots automatically */
slides.forEach((slide, i) => {
    const dot = document.createElement('span');
    if (i === 0) {
        dot.classList.add('active');
    }
    dot.addEventListener(

        'click',

        function () {

            if (

                window.currentFestivalHero !== null

            ) {

                return;

            }

            goSlide(

                i

            );

            restartSlider();

        }

    );
    dotsWrap.appendChild(dot);
});

/* Get all dots after create */
const dots = document.querySelectorAll('.hero-dots span');

/* Show selected slide */
function goSlide(index) {

    slides.forEach(slide => {

        slide.classList.remove(

            'active'

        );

    });

    dots.forEach(dot => {

        dot.classList.remove(

            'active'

        );

    });

    slides[index].classList.add(

        'active'

    );

    dots[index].classList.add(

        'active'

    );

    current = index;

}

/* Auto slide */
function autoSlide() {

    /* Festival active */

    if(

window.currentFestivalHero

){

return;

}

    current++;

    if (

        current >= slides.length

    ) {

        current = 0;

    }

    goSlide(

        current

    );

}

/* Restart timer after manual click */
function restartSlider() {

    clearInterval(

        sliderTimer

    );

    sliderTimer =

        setInterval(

            autoSlide,

            4000

        );

}

/* Start slider */
sliderTimer = setInterval(autoSlide, 4000);

/*--------------------------------
TYPE TEXT EFFECT
--------------------------------*/


const typingText =
    document.getElementById("typingText");

let txtIndex = 0;

let charIndex = 0;

let deleting = false;

function typeLoop() {

    const words =

        window.festivalTypingTexts &&

        window.festivalTypingTexts.length

        ?

        window.festivalTypingTexts

        :

        heroLiveData.typingTexts;

    if (

        !words ||

        !words.length ||

        !typingText

    ) {

        setTimeout(typeLoop, 1000);

        return;

    }

    if (

        txtIndex >= words.length

    ) {

        txtIndex = 0;

    }

    const word =

        words[txtIndex] || "";

    if (!deleting) {

        typingText.textContent =

            word.substring(

                0,

                charIndex

            );

        charIndex++;

        if (

            charIndex >

            word.length

        ) {

            deleting = true;

            setTimeout(

                typeLoop,

                1200

            );

            return;

        }

    }

    else {

        typingText.textContent =

            word.substring(

                0,

                charIndex

            );

        charIndex--;

        if (

            charIndex < 0

        ) {

            deleting = false;

            txtIndex++;

            if (

                txtIndex >=

                words.length

            ) {

                txtIndex = 0;

            }

            charIndex = 0;

        }

    }

    setTimeout(

        typeLoop,

        deleting ? 40 : 90

    );

}

typeLoop();



/*=========================
AUTO SPOTLIGHT
=========================*/

const spotItems =
    heroLiveData.spotlightMessages;

let spot = 0;

const spotlightBox =
    document.getElementById("spotlightBox");

function updateSpotlight() {

    if (!spotlightBox) return;

    spot++;

    if (spot >= spotItems.length) {

        spot = 0;

    }

    spotlightBox.textContent =

        spotItems[spot];

}

setInterval(

    updateSpotlight,

    3000

);

/*=========================
LIVE HERO STATS
=========================*/

const liveStats =
    heroLiveData.liveStats;

let liveIndex = 0;

const liveCounter =
    document.getElementById("liveCounter");

const liveBooking =
    document.querySelector(".live-booking");

function updateLiveStat() {

    if (!liveCounter || !liveBooking) {

        return;

    }

    const item = liveStats[liveIndex];

    liveBooking.innerHTML =

        `

${item.icon}

<span id="liveCounter">

${item.count}

</span>

${item.label}

`;

    liveIndex++;

    if (liveIndex >= liveStats.length) {

        liveIndex = 0;

    }

}

/* Initial */

updateLiveStat();

/* Rotate */

setInterval(

    updateLiveStat,

    4000

);

const badgeTexts = heroLiveData.badgeTexts;

let badgeIndex = 0;

const badgeEl = document.getElementById("badgeText");

setInterval(() => {

    badgeIndex++;

    if (badgeIndex >= badgeTexts.length) {

        badgeIndex = 0;

    }

    badgeEl.style.opacity = 0;

    badgeEl.style.transform = "translateY(10px)";

    setTimeout(() => {

        badgeEl.textContent =

            badgeTexts[badgeIndex];

        badgeEl.style.opacity = 1;

        badgeEl.style.transform =

            "translateY(0)";

    }, 300);

}, 4000);


/* =========================================
   AIRLINE EXPERIENCE MODULE (SAFE ISOLATED)
========================================= */
(function(){

    const rotateEl =
    document.getElementById(
    "rotateText"
    );

    if(!rotateEl){

        return;

    }

    let destIndex=0;

    function rotateDestination(){

        let items=[];

        /*
        FESTIVAL MODE
        */

        if(

        activeFestival

        &&

        activeFestival.urgency

        &&

        activeFestival.urgency.length

        ){

            items=
            activeFestival.urgency;

        }

        /*
        NORMAL MODE
        */

        else{

            items=
            heroLiveData.rotatingDestinations;

        }

        if(!items.length){

            return;

        }

        rotateEl.style.opacity=0;

        rotateEl.style.transform=
        "translateY(8px)";

        setTimeout(function(){

            rotateEl.textContent=
            items[destIndex];

            rotateEl.style.opacity=1;

            rotateEl.style.transform=
            "translateY(0px)";

        },300);

        destIndex++;

        if(

        destIndex>=items.length

        ){

            destIndex=0;

        }

    }

    rotateDestination();

    setInterval(

    rotateDestination,

    3000

    );

})();

let base = 10000;
const el = document.getElementById("customerCount");
setInterval(() => {
    base += Math.floor(Math.random() * 3); // slow realistic growth
    el.innerText = base.toLocaleString() + "+";
}, 4000);

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


const SCRIPT_URL = RS_CONFIG.API_URL;

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
            type: "air",
            from: document.getElementById("rsAirFrom").value,
            to: document.getElementById("rsAirTo").value,
            date: document.getElementById("rsAirDate").value,
            mobile: document.getElementById("rsMobile").value,
            adult: document.getElementById("rsAdult").value,
            child: document.getElementById("rsChild").value,
            infant: document.getElementById("rsInfant").value
        };
    }

    // =========================
    // TRAIN
    // =========================
    else if (rsModeType === "train") {
        payload = {
            type: "train",
            from: document.getElementById("rsTrainFrom").value,
            to: document.getElementById("rsTrainTo").value,
            date: document.getElementById("rsTrainDate").value,
            classType: document.getElementById("rsTrainClass").value,
            passengers: document.getElementById("rsTrainPassenger").value,
            mobile: document.getElementById("rsTrainMobile").value
        };
    }

    // =========================
    // BUS
    // =========================
    else if (rsModeType === "bus") {
        payload = {
            type: "bus",
            from: document.getElementById("rsBusFrom").value,
            to: document.getElementById("rsBusTo").value,
            date: document.getElementById("rsBusDate").value,
            classType: document.getElementById("rsBusClass").value,
            passengers: document.getElementById("rsBusPassenger").value,
            mobile: document.getElementById("rsBusMobile").value
        };
    }

    console.log("Sending Payload:", payload);

    try {
        const response = await fetch(SCRIPT_URL, {
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
            document.querySelectorAll(
                "#airFields input, #trainFields input, #busFields input, select"
            ).forEach(el => {
                el.value = "";
            });
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


// =========================
// INLINE TOAST
// =========================
function rsToast(message, error = false) {
    let toast =
        document.getElementById("rsToast");

    if (!toast) {
        toast =
            document.createElement("div");
        toast.id = "rsToast";
        toast.style.position = "fixed";
        toast.style.bottom = "30px";
        toast.style.right = "30px";
        toast.style.padding = "16px 22px";
        toast.style.borderRadius = "14px";
        toast.style.color = "#fff";
        toast.style.fontSize = "14px";
        toast.style.fontWeight = "600";
        toast.style.zIndex = "999999";
        toast.style.boxShadow =
            "0 10px 30px rgba(0,0,0,0.25)";
        toast.style.transition =
            "all .35s ease";
        toast.style.opacity = "0";
        toast.style.transform =
            "translateY(20px)";
        document.body.appendChild(toast);
    }

    toast.style.background =
        error
            ? "linear-gradient(135deg,#ef4444,#dc2626)"
            : "linear-gradient(135deg,#16a34a,#15803d)";

    toast.innerHTML = message;
    toast.style.opacity = "1";
    toast.style.transform =
        "translateY(0px)";

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform =
            "translateY(20px)";
    }, 3500);
}

function rsSuccessPopup() {

    // REMOVE OLD
    document.getElementById("rsSuccessPopup")?.remove();

    // CREATE POPUP
    const popup =
        document.createElement("div");

    popup.id = "rsSuccessPopup";

    popup.innerHTML =
        `
<div class="rs-success-card">

    <div class="rs-success-icon">
        ✓
    </div>

    <div class="rs-success-title">
        Enquiry Submitted
    </div>

    <div class="rs-success-sub">
        Our travel consultant will contact you shortly
    </div>

    <div class="rs-success-mini">
        ✈ Best fares • Instant support • Trusted booking
    </div>

</div>
`;

    document.body.appendChild(popup);

    // AUTO REMOVE
    setTimeout(() => {

        popup.style.opacity = "0";

        popup.style.transform =
            "translate(-50%,-50%) scale(.9)";

        setTimeout(() => {

            popup.remove();

        }, 400);

    }, 3200);

}


// ========================================
// SUCCESS POPUP CSS
// ========================================

const rsSuccessStyle =
    document.createElement("style");

rsSuccessStyle.innerHTML =
    `

#rsSuccessPopup{

    position:fixed;
    top:50%;
    left:50%;
    transform:
    translate(-50%,-50%);

    z-index:9999999;

    animation:
    rsPopupIn .35s ease;

}

.rs-success-card{

    width:340px;
    max-width:90vw;

    background:
    rgba(255,255,255,.92);

    backdrop-filter:
    blur(20px);

    border:
    1px solid rgba(255,255,255,.4);

    border-radius:28px;

    padding:34px 26px;

    text-align:center;

    box-shadow:
    0 25px 70px rgba(0,0,0,.18);

}

.rs-success-icon{

    width:92px;
    height:92px;

    margin:auto auto 20px;

    border-radius:50%;

    background:
    linear-gradient(
    135deg,
    #22c55e,
    #16a34a
    );

    color:#fff;

    display:flex;
    align-items:center;
    justify-content:center;

    font-size:46px;
    font-weight:700;

    box-shadow:
    0 15px 35px rgba(34,197,94,.35);

    animation:
    rsTickPop .5s ease;

}

.rs-success-title{

    font-size:26px;
    font-weight:800;

    color:#111827;

    margin-bottom:10px;

}

.rs-success-sub{

    font-size:15px;
    line-height:1.6;

    color:#4b5563;

    margin-bottom:18px;

}

.rs-success-mini{

    display:inline-block;

    background:
    linear-gradient(
    135deg,
    #eff6ff,
    #dbeafe
    );

    color:#2563eb;

    padding:10px 16px;

    border-radius:999px;

    font-size:13px;
    font-weight:700;

}

@keyframes rsPopupIn{

    from{

        opacity:0;

        transform:
        translate(-50%,-50%)
        scale(.7);

    }

    to{

        opacity:1;

        transform:
        translate(-50%,-50%)
        scale(1);

    }

}

@keyframes rsTickPop{

    from{

        transform:scale(.2);

        opacity:0;

    }

    to{

        transform:scale(1);

        opacity:1;

    }

}

`;

document.head.appendChild(
    rsSuccessStyle
);


// =========================
// SPINNER CSS AUTO INJECT
// =========================
const rsStyle =
    document.createElement("style");
rsStyle.innerHTML =
    `
.rs-btn-loader{
    width:16px;
    height:16px;
    border:2px solid rgba(255,255,255,.35);
    border-top:2px solid #fff;
    border-radius:50%;
    display:inline-block;
    animation:rsSpin .7s linear infinite;
    margin-right:8px;
    vertical-align:middle;
}
@keyframes rsSpin{
    100%{
        transform:rotate(360deg);
    }
}
`;
document.head.appendChild(rsStyle);







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



/* =========================================
GLOBAL
========================================= */

let rsAllPackages = [];

let rsCurrentCategory = "all";

/* =========================================
LOAD PACKAGES
========================================= */

async function rsLoadPackages() {

    try {

        const response =
            await fetch(
                `${SCRIPT_URL}?action=getTourPackages`
            );

        const result =
            await response.json();

        if (
            result.success &&
            result.data
        ) {

            rsAllPackages =
                result.data;

            rsRenderPackages(
                rsAllPackages
            );

        }

    }

    catch (err) {

        console.error(err);

    }

}

/* =========================================
RENDER
========================================= */

function rsRenderPackages(data) {



    const container =
        document.getElementById(
            "rsPackageContainer"
        );

    if (!data.length) {

        container.innerHTML =
            "No packages found";

        return;

    }

    let html = "";

    data.forEach(pkg => {

        /* =====================================
        THEME
        ===================================== */

        const theme =
            (pkg.theme || "").toLowerCase();

        const themeData =
            rsGetThemeData(pkg.theme);

        const offerData =
            rsGetOfferText(
                pkg.offer_ends
            );

        /* =====================================
        DYNAMIC GRADIENT
        ===================================== */

        let gradient =
            "linear-gradient(135deg,#2563eb,#7c3aed)";

        if (theme.includes("honeymoon")) {

            gradient =
                "linear-gradient(135deg,#ec4899,#db2777)";

        }

        else if (theme.includes("luxury")) {

            gradient =
                "linear-gradient(135deg,#f59e0b,#ea580c)";

        }

        else if (theme.includes("family")) {

            gradient =
                "linear-gradient(135deg,#10b981,#059669)";

        }

        else if (theme.includes("adventure")) {

            gradient =
                "linear-gradient(135deg,#2563eb,#0891b2)";

        }

        /* =====================================
        HTML
        ===================================== */

        html += `

<div
class="rs-package-card"
style="--cardGradient:${gradient};"
data-theme="${theme.replace(/\s/g, '-')}"
>

    <!-- =====================================
    IMAGE
    ====================================== -->

    <div class="rs-package-image-wrap">

        <!-- IMAGE -->

        <img
            src="${pkg.image}"
            alt="${pkg.package_name}"
        >

        <!-- MAIN BADGE -->

        <div class="
            rs-package-badge
            ${(pkg.badge || "")
                .toLowerCase()
                .replace(/\s/g, '-')}
        ">

            ${rsGetBadgeIcon(pkg.badge)}

            ${pkg.badge || "Popular"}

        </div>


    </div>

    <!-- =====================================
    BODY
    ====================================== -->

    <div class="rs-card-body-v3">

        <!-- TITLE -->

        <h4 class="rs-package-title">

            ${pkg.package_name}

        </h4>

        <!-- CITY -->

<div class="rs-package-location">

    📍 ${pkg.city}

    <span class="rs-location-dot">
        •
    </span>

    ⭐ ${pkg.rating || "4.8"}

</div>

        <!-- THEME + SEASON -->

<div class="rs-meta-row">

    <div class="
        rs-theme-pill
        ${themeData.class}
    ">

        <span>
            ${themeData.icon}
        </span>

        ${pkg.theme || "Premium"}

    </div>

    <div class="rs-mini-duration">

        ☀️ ${pkg.days}D

    </div>

    <div class="rs-mini-duration rs-night">

        🌙 ${pkg.nights}N

    </div>

</div>
        <!-- AI SUMMARY -->

<div
    class="rs-ai-summary-line"
    data-highlights="${pkg.ai_highlights || ''}"
>

    <span class="rs-ai-icon">

        ✨

    </span>

    <span class="rs-ai-text">

        ${rsGetAISummary(pkg)}

    </span>

</div>





        <!-- =====================================
        PRICE BOX
        ====================================== -->

        <div class="rs-glass-price-box">

            ${pkg.old_price
                ?
                `
                <div class="rs-card-old-price">

                    ₹${Number(pkg.old_price)
                    .toLocaleString()}

                </div>
                `
                :
                ""
            }

            <div class="rs-card-price-row">

                <!-- PRICE -->

                <div class="rs-card-price-pill">

                    <span class="rs-price-icon">

                        ✨

                    </span>

                    <span class="rs-card-price">

                        ₹${Number(pkg.amount)
                .toLocaleString()}

                    </span>

                </div>

                <!-- SAVE -->

                ${pkg.old_price
                ?
                `
                    <div class="rs-save-pill">

                        ${Math.round(
                    (
                        (
                            Number(pkg.old_price)
                            -
                            Number(pkg.amount)
                        )
                        /
                        Number(pkg.old_price)
                    ) * 100
                )}% OFF

                    </div>
                    `
                :
                ""
            }

            </div>


            <!-- LIVE VIEWING -->

<div
    class="
        rs-live-status
        ${rsGetUrgencyClass(
                Number(pkg.slots_left || 0)
            )}
    "

    data-viewing="
        ${Math.max(
                8,
                Number(pkg.weekly_booked || 10)
                +
                Math.floor(Math.random() * 12)
            )}
    "

    data-booked="
        ${Number(pkg.weekly_booked || 0)}
    "

    data-slots="
        ${Number(pkg.slots_left || 0)}
    "

    data-offer="${pkg.offer_ends || ''}"

    data-theme="${pkg.theme || ''}"
>

    <span class="rs-live-dot"></span>

    <span class="rs-live-status-text">

        Live updates

    </span>

</div>

        </div>

        <!-- =====================================
        BUTTONS
        ====================================== -->

        <div class="rs-package-btn-row">

            <!-- VIEW -->

            <button
                class="
                    rs-modern-btn
                    rs-view-btn
                "
                onclick='rsOpenPackageModal(${JSON.stringify(pkg)})'
            >

                👁 View Details

            </button>

            <!-- WHATSAPP -->

<button
    class="
        rs-modern-btn
        rs-wa-btn
    "
    onclick='rsOpenLeadPopup(${JSON.stringify(pkg)})'
>

    <span
        class="rs-wa-btn-text"
        data-slots="${Number(pkg.slots_left || 3)}"
    >

        💬 WhatsApp

    </span>

</button>

        </div>

    </div>

</div>

`;

    });

    container.innerHTML = html;

    rsStartLiveStatusRotation();

    rsStartWhatsappRotation();

    rsStartAISummaryRotation();

}


/* =========================================
WHATSAPP BUTTON ROTATION
========================================= */

function rsStartWhatsappRotation() {

    const buttons =
        document.querySelectorAll(
            ".rs-wa-btn-text"
        );

    buttons.forEach(btn => {

        const slots =
            Number(btn.dataset.slots);

        let messages = [

            "💬 WhatsApp",

            "🔥 Book Fast"

        ];

        /* HIGH URGENCY */

        if (slots <= 2) {

            messages = [

                "⚠ Few Slots Left",

                "🔥 Selling Fast",

                "💬 Book Now"

            ];

        }

        /* MEDIUM */

        else if (slots <= 5) {

            messages = [

                "🔥 Selling Fast",

                "💬 Enquire Now",

                "⚡ Limited Slots"

            ];

        }

        let index = 0;

        setInterval(() => {

            btn.classList.add(
                "rs-wa-changing"
            );

            setTimeout(() => {

                index++;

                if (index >= messages.length) {

                    index = 0;

                }

                btn.innerHTML =
                    messages[index];

                btn.classList.remove(
                    "rs-wa-changing"
                );

            }, 250);

        }, 3000);

    });

}

function rsGetBadgeIcon(badge) {

    badge = (badge || "").toLowerCase();

    if (badge.includes("best")) {
        return "🏆";
    }

    if (badge.includes("trending")) {
        return "🔥";
    }

    if (badge.includes("honeymoon")) {
        return "💖";
    }

    if (badge.includes("luxury")) {
        return "✨";
    }

    if (badge.includes("family")) {
        return "👨‍👩‍👧";
    }

    return "⭐";

}

function rsGetThemeData(theme) {

    theme =
        (theme || "").toLowerCase();

    if (theme.includes("honeymoon")) {

        return {
            icon: "💖",
            class: "rs-theme-honeymoon"
        };

    }

    if (theme.includes("luxury")) {

        return {
            icon: "✨",
            class: "rs-theme-luxury"
        };

    }

    if (theme.includes("family")) {

        return {
            icon: "👨‍👩‍👧",
            class: "rs-theme-family"
        };

    }

    if (theme.includes("adventure")) {

        return {
            icon: "🏔️",
            class: "rs-theme-adventure"
        };

    }

    if (theme.includes("beach")) {

        return {
            icon: "🏖️",
            class: "rs-theme-beach"
        };

    }

    return {
        icon: "🌍",
        class: "rs-theme-default"
    };

}



/* =========================================
AI SMART SUMMARY
========================================= */

/* =========================================
SMART AI SUMMARY
========================================= */

function rsGetAISummary(pkg) {

    if (!pkg.ai_highlights) {

        return "Luxury curated travel experience";

    }

    const items =
        pkg.ai_highlights
            .split("|")
            .map(i => i.trim())
            .slice(0, 2);

    const cleanItems =
        items.map(item => {

            return item.replace(
                /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
                ""
            ).trim();

        });

    return cleanItems.join(" • ");

}

/* =========================================
AI SUMMARY ROTATOR
========================================= */

/* =========================================
AI SUMMARY ROTATOR
========================================= */

function rsStartAISummaryRotation() {

    const summaries =
        document.querySelectorAll(
            ".rs-ai-summary-line"
        );

    summaries.forEach(summary => {

        const raw =
            summary.dataset.highlights;

        if (!raw) return;

        /* =====================================
        CLEAN ITEMS
        ===================================== */

        let items =
            raw.split("|")
                .map(i => {

                    return i.replace(
                        /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
                        ""
                    ).trim();

                });

        /* =====================================
        SMART PRIORITY ORDER
        ===================================== */

        const priorityKeywords = [

            "villa",
            "water",
            "private",
            "dinner",
            "cruise",
            "safari",
            "beach",
            "pool",
            "luxury"

        ];

        items.sort((a, b) => {

            const aPriority =
                priorityKeywords.some(
                    k => a.toLowerCase().includes(k)
                );

            const bPriority =
                priorityKeywords.some(
                    k => b.toLowerCase().includes(k)
                );

            return bPriority - aPriority;

        });

        if (items.length <= 1) return;

        let index = 0;

        const textEl =
            summary.querySelector(
                ".rs-ai-text"
            );

        let paused = false;

        /* =====================================
        PAUSE ON HOVER
        ===================================== */

        summary.addEventListener(
            "mouseenter",
            () => paused = true
        );

        summary.addEventListener(
            "mouseleave",
            () => paused = false
        );

        /* =====================================
        TYPING EFFECT
        ===================================== */

        function typeText(text) {

            textEl.innerHTML = "";

            let i = 0;

            const typing =
                setInterval(() => {

                    textEl.innerHTML +=
                        text.charAt(i);

                    i++;

                    if (i >= text.length) {

                        clearInterval(typing);

                    }

                }, 30);

        }

        /* =====================================
        AUTO CHANGE
        ===================================== */

        setInterval(() => {

            if (paused) return;

            index++;

            if (index >= items.length) {

                index = 0;

            }

            /* =====================================
            SHIMMER + FADE
            ===================================== */

            summary.classList.add(
                "rs-ai-changing"
            );

            setTimeout(() => {

                typeText(items[index]);

                summary.classList.remove(
                    "rs-ai-changing"
                );

            }, 350);

        }, 3500);

    });

}

/* =========================================
URGENCY COLOR
========================================= */

function rsGetUrgencyClass(slots) {

    slots = Number(slots ?? 3);

    if (slots <= 2) {

        return "rs-urgency-high";

    }

    if (slots <= 5) {

        return "rs-urgency-medium";

    }

    return "rs-urgency-low";

}

/* =========================================
AI LIVE STATUS
========================================= */

function rsGetLiveStatus(theme) {

    theme =
        (theme || "").toLowerCase();

    if (theme.includes("honeymoon")) {

        return "couples viewing now";

    }

    if (theme.includes("family")) {

        return "families exploring now";

    }

    if (theme.includes("luxury")) {

        return "luxury travellers viewing";

    }

    if (theme.includes("adventure")) {

        return "adventure lovers exploring";

    }

    if (theme.includes("beach")) {

        return "beach lovers viewing";

    }

    return "travellers viewing now";

}

/* =========================================
ULTRA PREMIUM LIVE STATUS
========================================= */

function rsStartLiveStatusRotation() {

    const boxes =
        document.querySelectorAll(
            ".rs-live-status"
        );

    boxes.forEach(box => {

        let viewing =
            Number(box.dataset.viewing);

        const booked =
            Number(box.dataset.booked);

        const slots =
            Number(box.dataset.slots);

        const offer =
            box.dataset.offer;

        const theme =
            box.dataset.theme;

        const aiStatus =
            rsGetLiveStatus(theme);

        /* =========================
        BUILD MESSAGES
        ========================= */

        let messages = [];

        /* VIEWING */

        messages.push(
            `👀 ${viewing} ${aiStatus}`
        );

        /* BOOKED */

        if (booked > 0) {

            messages.push(
                `🔥 ${booked} people booked this week`
            );

        }

        /* SLOTS */

        if (slots > 0) {

            messages.push(
                `⏳ Only ${slots} slots left`
            );

        }

        /* OFFER */

        if (offer) {

            const offerData =
                rsGetOfferText(offer);

            messages.push(
                offerData.text
            );

        }

        let index = 0;

        let typingInterval;

        let paused = false;

        const textWrap =
            box.querySelector(
                ".rs-live-status-text"
            );

        /* =========================
        TYPEWRITER
        ========================= */

        function typeText(text) {

            clearInterval(
                typingInterval
            );

            textWrap.innerHTML = "";

            let i = 0;

            typingInterval =
                setInterval(() => {

                    textWrap.innerHTML =
                        text.substring(0, i);

                    i++;

                    if (i > text.length) {

                        clearInterval(
                            typingInterval
                        );

                    }

                }, 30);

        }

        /* =========================
        START FIRST
        ========================= */

        typeText(messages[index]);

        /* =========================
        AUTO ROTATE
        ========================= */

        setInterval(() => {

            if (paused) return;

            index++;

            if (index >= messages.length) {

                index = 0;

            }

            /* UPDATE LIVE VIEWERS */

            viewing +=
                Math.random() > .5
                    ? 1
                    : -1;

            if (viewing < 8) {

                viewing = 8;

            }

            messages[0] =
                `👀 ${viewing} ${aiStatus}`;

            /* FADE */

            box.classList.add(
                "fade"
            );

            setTimeout(() => {

                typeText(
                    messages[index]
                );

                box.classList.remove(
                    "fade"
                );

            }, 250);

        }, 3500);

        /* =========================
        PAUSE HOVER
        ========================= */

        box.addEventListener(
            "mouseenter",
            () => paused = true
        );

        box.addEventListener(
            "mouseleave",
            () => paused = false
        );

    });

}

/* =========================================
OFFER TEXT
========================================= */

/* =========================================
OFFER TEXT
========================================= */

/* =========================================
SMART OFFER TEXT
========================================= */

function rsGetOfferText(dateString) {

    if (!dateString) {

        return {
            text: "🔥 Limited Time Offer",
            class: "rs-offer-hot"
        };

    }

    const today =
        new Date();

    const offerDate =
        new Date(dateString);

    today.setHours(0, 0, 0, 0);

    offerDate.setHours(0, 0, 0, 0);

    const diffTime =
        offerDate - today;

    const diffDays =
        Math.ceil(
            diffTime /
            (1000 * 60 * 60 * 24)
        );

    /* =====================================
    EXPIRED
    ===================================== */

    if (diffDays <= 0) {

        return {
            text: "⚠ Offer Ending Today",
            class: "rs-offer-danger"
        };

    }

    /* =====================================
    TOMORROW
    ===================================== */

    if (diffDays === 1) {

        return {
            text: "⏳ Ends Tomorrow",
            class: "rs-offer-danger"
        };

    }

    /* =====================================
    2-7 DAYS
    ===================================== */

    if (diffDays <= 7) {

        return {
            text: `🔥 Ends In ${diffDays} Days`,
            class: "rs-offer-hot"
        };

    }

    /* =====================================
    8-30 DAYS
    ===================================== */

    if (diffDays <= 30) {

        return {
            text: "⚡ Limited Time Deal",
            class: "rs-offer-warm"
        };

    }

    /* =====================================
    LONG FUTURE
    ===================================== */

    return {

        text: "🎉 Early Bird Offer",

        class: "rs-offer-cool"

    };

}

/* =========================================
CLOSE MODAL
========================================= */

function rsClosePackageModal() {

    document
        .getElementById(
            "rsPackageModal"
        )
        .classList.remove(
            "active"
        );

}

/* =========================================
SLIDER
========================================= */

function rsSlidePackages(direction) {

    const container =
        document.getElementById(
            "rsPackageContainer"
        );

    const card =
        container.querySelector(
            ".rs-package-card"
        );

    if (!card) return;

    const scrollAmount =
        card.offsetWidth + 22;

    container.scrollBy({

        left:
            direction * scrollAmount * 2,

        behavior: "smooth"

    });

}

/* =========================================
SEARCH
========================================= */

function rsFilterPackages() {

    const search =
        document.getElementById(
            "rsPackageSearch"
        )
            .value
            .toLowerCase();

    let filtered =
        rsAllPackages.filter(pkg => {

            const matchSearch =

                (
                    pkg.package_name || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                (
                    pkg.city || ""
                )
                    .toLowerCase()
                    .includes(search);

            const matchCategory =

                rsCurrentCategory === "all"

                ||

                (
                    pkg.theme || ""
                )
                    .toLowerCase() ===
                rsCurrentCategory;

            return (
                matchSearch &&
                matchCategory
            );

        });

    rsRenderPackages(filtered);

}

/* =========================================
CATEGORY
========================================= */

function rsPackageCategory(
    category,
    btn
) {

    rsCurrentCategory =
        category;

    document
        .querySelectorAll(
            ".rs-filter-btn"
        )
        .forEach(el => {

            el.classList.remove(
                "active"
            );

        });

    btn.classList.add(
        "active"
    );

    rsFilterPackages();

}

/* =========================================
WHATSAPP
========================================= */

function rsPackageWhatsApp(message) {

    const mobile =
        "919999999999";

    const url =
        `https://wa.me/${mobile}?text=${encodeURIComponent(message)}`;

    window.open(
        url,
        "_blank"
    );

}

/* =========================================
AUTO LOAD
========================================= */

rsLoadPackages();


/* =========================================
OPEN PREMIUM PACKAGE MODAL
========================================= */

window.rsSelectedPackage = null;

function rsOpenPackageModal(pkg) {

    const modal =
        document.getElementById(
            "rsPremiumModal"
        );

    modal.classList.add("active");

    /* =====================================
    HERO
    ===================================== */

    document.getElementById(
        "rsModalHeroImage"
    ).src = pkg.image;

    document.getElementById(
        "rsModalTitle"
    ).innerHTML =
        `${pkg.category_icon || "🌍"} ${pkg.package_name}`;

    document.getElementById(
        "rsModalCity"
    ).innerHTML =
        `
📍 ${pkg.city}
&nbsp;&nbsp;•&nbsp;&nbsp;
⭐ ${pkg.rating || "4.8"}
&nbsp;&nbsp;•&nbsp;&nbsp;
🕒 ${pkg.days}D/${pkg.nights}N
`;

    /* =====================================
    ULTRA PREMIUM DESCRIPTION SYSTEM
    ===================================== */

    let description =
        pkg.description || "";

    /* =====================================
    AUTO KEYWORD HIGHLIGHT
    ===================================== */

    const keywordMap = {

        "Beach":
            "🏖️ Beach",

        "Luxury":
            "✨ Luxury",

        "Adventure":
            "🪂 Adventure",

        "Island":
            "🌴 Island",

        "Dinner":
            "🍽️ Dinner",

        "Resort":
            "🏨 Resort",

        "Water Sports":
            "🤿 Water Sports",

        "Sunset":
            "🌅 Sunset",

        "Cruise":
            "🛳️ Cruise",

        "Temple":
            "🛕 Temple"

    };

    /* APPLY KEYWORD COLORS */

    Object.keys(keywordMap)
        .forEach(word => {

            const colored =
                `
<span class="rsx-keyword">

${keywordMap[word]}

</span>
`;

            description =
                description.replaceAll(
                    word,
                    colored
                );

        });

    /* =====================================
    AI SUMMARY CHIPS
    ===================================== */

    let aiSummaryHTML = "";

    const aiChips = [];

    /* AUTO GENERATE */

    if (
        description.includes("Beach")
    ) {
        aiChips.push(
            "🏖️ Beach Escape"
        );
    }

    if (
        description.includes("Luxury")
    ) {
        aiChips.push(
            "✨ Luxury Stay"
        );
    }

    if (
        description.includes("Adventure")
    ) {
        aiChips.push(
            "🪂 Adventure Trip"
        );
    }

    if (
        description.includes("Water")
    ) {
        aiChips.push(
            "🤿 Water Activities"
        );
    }

    if (
        description.includes("Island")
    ) {
        aiChips.push(
            "🌴 Island Experience"
        );
    }

    if (
        description.includes("Dinner")
    ) {
        aiChips.push(
            "🍽️ Romantic Dining"
        );
    }

    /* RENDER CHIPS */

    aiChips.forEach(chip => {

        aiSummaryHTML +=
            `
<div class="rsx-ai-summary-chip">

    ${chip}

</div>
`;

    });




    /* =====================================
    RENDER
    ===================================== */

    document.getElementById(
        "rsModalDescription"
    ).innerHTML =
        `



        
<div class="rsx-description-wrap">

    <!-- FLOATING PARTICLES -->

    <div class="rsx-particle p1"></div>
    <div class="rsx-particle p2"></div>
    <div class="rsx-particle p3"></div>

    <!-- CARD -->

    <div class="rsx-description-card">

        <!-- ICON -->

        <div class="rsx-description-icon">

            ✨

        </div>

        <!-- TITLE -->

        <div class="rsx-description-title">

            Experience Overview

        </div>




        <!-- AI CHIPS -->

        <div class="rsx-ai-summary-wrap">

            ${aiSummaryHTML}

        </div>



        

        <!-- TYPEWRITER TEXT -->

        <div
            class="rsx-description-text rsx-typewriter"
            id="rsTypewriterText"
        >

            ${description}

        </div>

        <!-- FADE -->

        <div class="rsx-fade-overlay"></div>

        <!-- READ MORE -->

        <button
            class="rsx-readmore-btn"
            id="rsReadMoreBtn"
        >

            Read More

        </button>

    </div>

</div>
`;

    /* =====================================
    READ MORE
    ===================================== */

    setTimeout(() => {

        const text =
            document.getElementById(
                "rsTypewriterText"
            );

        const btn =
            document.getElementById(
                "rsReadMoreBtn"
            );

        if (!text || !btn) return;

        btn.onclick = function () {

            text.classList.toggle(
                "rsx-expand"
            );

            btn.innerText =
                text.classList.contains(
                    "rsx-expand"
                )
                    ? "Show Less"
                    : "Read More";

        };

    }, 300);

    /* =====================================
    PRICE
    ===================================== */

    document.getElementById(
        "rsStickyPrice"
    ).innerHTML =
        `
₹${Number(pkg.amount).toLocaleString()}
`;

    /* =====================================
    WHATSAPP
    ===================================== */

    /* =====================================
    STICKY BUTTON
    ===================================== */

    document.getElementById(
        "rsStickyWhatsapp"
    ).onclick = function () {

        rsOpenLeadPopup(pkg);

    };

    /* =====================================
    AI HIGHLIGHTS
    ===================================== */

    let aiHTML = "";

    if (pkg.ai_highlights) {

        pkg.ai_highlights
            .split("|")
            .forEach(item => {

                aiHTML +=
                    `
<div class="rsp-ai-chip">
✨ ${item}
</div>

`;

            });




    }

    document.getElementById(
        "rsAIHighlights"
    ).innerHTML = aiHTML;


    /* =====================================
    LIVE BOOKING FEED
    ===================================== */

    const bookingFeed =
        [
            "Rahul from Mumbai booked this package",
            "Priya upgraded to Luxury Stay",
            "Couple from Bangalore reserved 2 slots",
            "Family from Chennai confirmed booking",
            "Sneha added Water Sports package",
            "Akash booked Honeymoon Suite",
            "Traveler from Delhi booked today",
            "Last 2 slots booked recently"
        ];

    let feedHTML = "";

    /* SHOW FIRST 4 */

    bookingFeed
        .slice(0, 4)
        .forEach(item => {

            feedHTML +=
                `
<div class="rs-live-feed-card">

    <!-- LEFT -->

    <div class="rs-live-feed-left">

        ✈️

    </div>

    <!-- CONTENT -->

    <div class="rs-live-feed-content">

        <div class="rs-live-feed-title">

            ${item}

        </div>

        <div class="rs-live-feed-sub">

            Few minutes ago

        </div>

    </div>

    <!-- LIVE -->

    <div class="rs-live-feed-live">

        <span
            class="rs-live-feed-dot"
        ></span>

        LIVE

    </div>

</div>
`;

        });

    document.getElementById(
        "rsLiveBookingFeed"
    ).innerHTML = feedHTML;

    /* =====================================
    AUTO ROTATE FEED
    ===================================== */

    setInterval(() => {

        const randomBookings =
            [

                "Luxury Villa booked just now",
                "3 travelers viewing this package",
                "New Honeymoon booking confirmed",
                "Traveler unlocked special offer",
                "Weekend slots filling fast",
                "Dubai Marina upgrade selected",
                "Beach Resort package booked",
                "Airport transfer added"
            ];

        const randomText =
            randomBookings[
            Math.floor(
                Math.random()
                *
                randomBookings.length
            )
            ];

        const wrap =
            document.getElementById(
                "rsLiveBookingFeed"
            );

        if (!wrap) return;

        const card =
            document.createElement("div");

        card.className =
            "rs-live-feed-card";

        card.innerHTML =
            `
<div class="rs-live-feed-left">

    🔥

</div>

<div class="rs-live-feed-content">

    <div class="rs-live-feed-title">

        ${randomText}

    </div>

    <div class="rs-live-feed-sub">

        Just now

    </div>

</div>

<div class="rs-live-feed-live">

    <span
        class="rs-live-feed-dot"
    ></span>

    LIVE

</div>
`;

        wrap.prepend(card);

        /* KEEP ONLY 4 */

        while (
            wrap.children.length > 4
        ) {

            wrap.removeChild(
                wrap.lastChild
            );

        }

    }, 5000);

    /* =====================================
AI MATCH SCORE
===================================== */

    let aiScore = 92;

    const theme =
        (pkg.theme || "")
            .toLowerCase();

    let aiTag =
        "Perfect For Premium Travelers";

    if (theme.includes("honeymoon")) {

        aiScore = 98;

        aiTag =
            "Perfect For Couples";

    }

    else if (theme.includes("family")) {

        aiScore = 96;

        aiTag =
            "Great For Families";

    }

    else if (theme.includes("adventure")) {

        aiScore = 95;

        aiTag =
            "Best For Adventure Lovers";

    }

    else if (theme.includes("luxury")) {

        aiScore = 99;

        aiTag =
            "Ultra Luxury Experience";

    }

    else if (theme.includes("beach")) {

        aiScore = 97;

        aiTag =
            "Relaxing Beach Escape";

    }

    /* RENDER */

    document.getElementById(
        "rsAIMatchWrap"
    ).innerHTML =
        `
<div class="rs-ai-match-card">

    <!-- LEFT -->

    <div class="rs-ai-match-left">

        <div class="rs-ai-match-ring">

            <div class="rs-ai-match-inner">

                ${aiScore}<span>%</span>

            </div>

        </div>

    </div>

    <!-- RIGHT -->

    <div class="rs-ai-match-right">

        <div class="rs-ai-match-title">

            AI Compatibility Score

        </div>

        <div class="rs-ai-match-subtitle">

            ${aiTag}

        </div>

        <div class="rs-ai-match-tags">

            <span>✨ Smart Match</span>

            <span>🔥 Trending</span>

            <span>💎 Premium Pick</span>

        </div>

    </div>

</div>
`;

    /* =====================================
    INCLUDED
    ===================================== */

    let includedHTML = "";

    if (pkg.included) {

        pkg.included
            .split("|")
            .forEach(item => {

                includedHTML +=
                    `
<div class="rsp-chip rsp-included">
    ✅ ${item}
</div>
`;

            });

    }

    document.getElementById(
        "rsIncludedWrap"
    ).innerHTML = includedHTML;

    /* =====================================
    EXCLUDED
    ===================================== */

    let excludedHTML = "";

    if (pkg.excluded) {

        pkg.excluded
            .split("|")
            .forEach(item => {

                excludedHTML +=
                    `
<div class="rsp-chip rsp-excluded">
    ❌ ${item}
</div>
`;

            });

    }

    document.getElementById(
        "rsExcludedWrap"
    ).innerHTML = excludedHTML;

    /* =====================================
    ITINERARY
    ===================================== */

    /* =========================================
    PREMIUM ITINERARY TIMELINE
    ========================================= */

    let timelineHTML = "";

    const itinerary =
        (pkg.itinerary || "")
            .split("|");

    const dayColors = [

        "#2563eb",
        "#7c3aed",
        "#db2777",
        "#ea580c",
        "#059669",
        "#0891b2"

    ];

    itinerary.forEach((item, index) => {

        if (!item.trim()) return;

        // =====================================
        // AUTO ICON DETECT
        // =====================================

        let icon = "✈️";

        const text =
            item.toLowerCase();

        if (text.includes("water"))
            icon = "🤿";

        else if (text.includes("beach"))
            icon = "🏖️";

        else if (text.includes("shopping"))
            icon = "🛍️";

        else if (text.includes("dinner"))
            icon = "🍽️";

        else if (text.includes("departure"))
            icon = "🛫";

        else if (text.includes("arrival"))
            icon = "🏨";

        else if (text.includes("leisure"))
            icon = "🌴";

        else if (text.includes("temple"))
            icon = "🛕";

        else if (text.includes("safari"))
            icon = "🦁";

        else if (text.includes("cruise"))
            icon = "🛳️";

        // =====================================
        // DAY COLOR
        // =====================================

        const color =
            dayColors[
            index % dayColors.length
            ];

        timelineHTML +=
            `
<div class="rsp-tour-row">

    <!-- LEFT -->

    <div class="rsp-tour-left">

        <div
            class="rsp-tour-day"
            style="
                background:${color};
            "
        >

            Day ${index + 1}

        </div>

        <div
            class="rsp-tour-line"
            style="
                background:${color}22;
            "
        ></div>

    </div>

    <!-- RIGHT -->

    <div class="rsp-tour-right">

        <div
            class="rsp-tour-card"
            style="
                border-color:${color}20;
            "
        >

            <div
                class="rsp-tour-icon"
                style="
                    background:${color}15;
                "
            >

                ${icon}

            </div>

            <div class="rsp-tour-content">

<div class="rsp-tour-title">

    ${index === 0
                ? "Arrival Experience"

                :

                item.toLowerCase().includes("water")
                    ? "Water Adventure"

                    :

                    item.toLowerCase().includes("beach")
                        ? "Beach Experience"

                        :

                        item.toLowerCase().includes("shopping")
                            ? "Shopping Time"

                            :

                            item.toLowerCase().includes("dinner")
                                ? "Luxury Dining"

                                :

                                item.toLowerCase().includes("departure")
                                    ? "Departure Journey"

                                    :

                                    item.toLowerCase().includes("leisure")
                                        ? "Relax & Leisure"

                                        :

                                        item.toLowerCase().includes("temple")
                                            ? "Temple Visit"

                                            :

                                            item.toLowerCase().includes("cruise")
                                                ? "Cruise Experience"

                                                :

                                                "Tour Activity"
            }

</div>

                <div class="rsp-tour-desc">

                    ${item.trim()}

                </div>

            </div>

        </div>

    </div>

</div>
`;

    });

    document.getElementById(
        "rsTimeline"
    ).innerHTML = timelineHTML;


    /* =====================================
    2026 ULTRA PREMIUM PRICE
    ===================================== */

    const oldPrice =
        pkg.old_price
            ? Number(pkg.old_price)
            : 0;

    const newPrice =
        Number(pkg.amount);

    const savings =
        oldPrice > newPrice
            ? oldPrice - newPrice
            : 0;

    /* =====================================
    LIVE VIEW COUNTER
    ===================================== */

    const viewers =
        Math.floor(
            Math.random() * 18
        ) + 12;

    /* =====================================
    URGENCY COLOR
    ===================================== */

    const slots =
        pkg.slots_left || 3;

    let urgencyClass =
        "rsp-pill-green";

    if (slots <= 5) {
        urgencyClass =
            "rsp-pill-orange";
    }

    if (slots <= 2) {
        urgencyClass =
            "rsp-pill-red";
    }
    /* =====================================
    COUNTDOWN
    ===================================== */

    let countdownHTML = "";

    if (pkg.offer_ends) {

        const endDate =
            new Date(pkg.offer_ends);

        const now =
            new Date();

        const diff =
            endDate - now;

        if (diff > 0) {

            const days =
                Math.floor(
                    diff / (1000 * 60 * 60 * 24)
                );

            const hours =
                Math.floor(
                    (diff / (1000 * 60 * 60)) % 24
                );

            const minutes =
                Math.floor(
                    (diff / (1000 * 60)) % 60
                );

            countdownHTML =
                `
        <div class="rsp-info-pill rsp-pill-yellow">

            ⏰ Ends in ${days}d ${hours}h ${minutes}m

        </div>
        `;
        }
    }

    /* =====================================
    RENDER
    ===================================== */

    document.getElementById(
        "rsStickyPrice"
    ).innerHTML =
        `
<div class="rsp-price-box">

    <!-- TOP -->

    <div class="rsp-price-top">

        ${savings > 0
            ?
            `
            <div class="rsp-save-badge">

                SAVE ₹${savings.toLocaleString()}

            </div>
            `
            :
            ""
        }

        ${oldPrice
            ?
            `
            <div class="rsp-old-price">

                ₹${oldPrice.toLocaleString()}

            </div>
            `
            :
            ""
        }

    </div>

    <!-- MAIN PRICE -->

    <div class="rsp-new-price">

        ₹${newPrice.toLocaleString()}

    </div>

    <!-- SUB -->

    <div class="rsp-price-sub">

        <div class="rsp-info-pill ${urgencyClass}">

    🔥 Only ${slots} slots left

</div>

<div class="rsp-info-pill rsp-pill-blue">

    ✈️ ${pkg.weekly_booked || 27} booked this week

</div>

<div class="rsp-info-pill rsp-pill-purple">

    👀 ${viewers} people viewing now

</div>

        ${countdownHTML}

    </div>

</div>
`;

    /* =====================================
    GALLERY
    ===================================== */

    let galleryHTML = "";

    window.rsGalleryImages = [];

    if (pkg.gallery_images) {

        window.rsGalleryImages =
            pkg.gallery_images
                .split(",");

        window.rsGalleryImages
            .forEach((img, index) => {

                galleryHTML +=
                    `
<img
    src="${img.trim()}"
    class="rs-gallery-image"
    onclick="rsOpenFullscreenGallery(${index})"
>
`;

            });

    }

    document.getElementById(
        "rsGallery"
    ).innerHTML = galleryHTML;



}


/* =====================================
FULLSCREEN GALLERY
===================================== */

window.rsGalleryIndex = 0;

/* OPEN */

function rsOpenFullscreenGallery(index) {

    window.rsGalleryIndex =
        index;

    const modal =
        document.getElementById(
            "rsFullscreenGallery"
        );

    modal.classList.add(
        "active"
    );

    rsRenderFullscreenImage();

}

/* CLOSE */

function rsCloseFullscreenGallery() {

    document.getElementById(
        "rsFullscreenGallery"
    ).classList.remove(
        "active"
    );

}

/* RENDER */

function rsRenderFullscreenImage() {

    const img =
        document.getElementById(
            "rsFullscreenImage"
        );

    const counter =
        document.getElementById(
            "rsFullscreenCounter"
        );

    if (
        !window.rsGalleryImages
        ||
        !window.rsGalleryImages.length
    ) return;

    img.src =
        window.rsGalleryImages[
            window.rsGalleryIndex
        ].trim();

    counter.innerHTML =
        `
${window.rsGalleryIndex + 1}
/
${window.rsGalleryImages.length}
`;

}

/* NEXT */

function rsNextGalleryImage() {

    window.rsGalleryIndex++;

    if (
        window.rsGalleryIndex
        >=
        window.rsGalleryImages.length
    ) {

        window.rsGalleryIndex = 0;

    }

    rsRenderFullscreenImage();

}

/* PREV */

function rsPrevGalleryImage() {

    window.rsGalleryIndex--;

    if (
        window.rsGalleryIndex < 0
    ) {

        window.rsGalleryIndex =
            window.rsGalleryImages.length - 1;

    }

    rsRenderFullscreenImage();

}

/* =====================================
KEYBOARD SUPPORT
===================================== */

document.addEventListener(
    "keydown",
    function (e) {

        const gallery =
            document.getElementById(
                "rsFullscreenGallery"
            );

        if (
            !gallery.classList.contains(
                "active"
            )
        ) return;

        if (e.key === "ArrowRight") {

            rsNextGalleryImage();

        }

        if (e.key === "ArrowLeft") {

            rsPrevGalleryImage();

        }

        if (e.key === "Escape") {

            rsCloseFullscreenGallery();

        }

    }
);

/* =====================================
MOBILE SWIPE
===================================== */

let rsTouchStartX = 0;

let rsTouchEndX = 0;

const rsGallery =
    document.getElementById(
        "rsFullscreenGallery"
    );

if (rsGallery) {

    rsGallery.addEventListener(
        "touchstart",
        e => {

            rsTouchStartX =
                e.changedTouches[0].screenX;

        }
    );

    rsGallery.addEventListener(
        "touchend",
        e => {

            rsTouchEndX =
                e.changedTouches[0].screenX;

            rsHandleSwipe();

        }
    );

}

function rsHandleSwipe() {

    if (
        rsTouchEndX
        <
        rsTouchStartX - 50
    ) {

        rsNextGalleryImage();

    }

    if (
        rsTouchEndX
        >
        rsTouchStartX + 50
    ) {

        rsPrevGalleryImage();

    }

}


/* =========================================
CLOSE PREMIUM MODAL
========================================= */

function rsClosePackageModal() {

    document
        .getElementById(
            "rsPremiumModal"
        )
        .classList.remove("active");

}

/* =========================================
CLICK OUTSIDE TO CLOSE
========================================= */

document.addEventListener(
    "click",
    function (e) {

        const modal =
            document.getElementById(
                "rsPremiumModal"
            );

        if (
            e.target === modal
        ) {
            rsClosePackageModal();
        }

    }
);

/* =====================================================
AUTO HIDE STICKY BAR
===================================================== */

let rsLastScroll = 0;

window.addEventListener(
    "scroll",
    function () {

        const sticky =
            document.querySelector(
                ".rsx-sticky-bar"
            );

        if (!sticky) return;

        const current =
            window.pageYOffset;

        /* SCROLL DOWN */

        if (current > rsLastScroll
            && current > 120) {

            sticky.classList.add(
                "rsx-sticky-hide"
            );

        }

        /* SCROLL UP */

        else {

            sticky.classList.remove(
                "rsx-sticky-hide"
            );

        }

        /* SHRINK */

        if (current > 80) {

            sticky.classList.add(
                "rsx-sticky-small"
            );

        } else {

            sticky.classList.remove(
                "rsx-sticky-small"
            );

        }

        rsLastScroll = current;

    }
);

/* =========================================
CURRENT PACKAGE
========================================= */

let rsCurrentPackage = null;

/* =========================================
OPEN LEAD POPUP
2026 AI UX VERSION
========================================= */

function rsOpenLeadPopup(pkg) {

    /* STORE PACKAGE */

    window.rsCurrentPackage =
        pkg || {};

    window.rsSelectedPackage =
        pkg || {};

    /* PACKAGE */

    document.getElementById(
        "rsLeadPackage"
    ).value =
        pkg.package_name || "";

    /* =====================================
    AUTO MONTH
    ===================================== */

    const months = [

        "January", "February", "March",
        "April", "May", "June",
        "July", "August", "September",
        "October", "November", "December"

    ];

    const currentMonth =
        months[
        new Date().getMonth()
        ];

    document.getElementById(
        "rsLeadMonth"
    ).value =
        currentMonth;

    /* =====================================
    DEFAULT TRAVELLERS
    ===================================== */

    document.getElementById(
        "rsLeadAdults"
    ).value = "2";

    document.getElementById(
        "rsLeadChild"
    ).value = "0";

    document.getElementById(
        "rsLeadInfant"
    ).value = "0";

    /* =====================================
    SMART BUDGET
    ===================================== */

    let budget =
        "₹50K - ₹1L";

    const amount =
        parseInt(
            (
                pkg.amount || "0"
            ).toString()
                .replace(/\D/g, '')
        );

    if (amount >= 200000) {

        budget = "₹2L+";

    }

    else if (amount >= 100000) {

        budget = "₹1L - ₹2L";

    }

    else if (amount <= 50000) {

        budget = "Under ₹50K";

    }

    document.getElementById(
        "rsLeadBudget"
    ).value =
        budget;

    /* =====================================
    DYNAMIC CTA
    ===================================== */

    const btn =
        document.getElementById(
            "rsLeadSubmitBtn"
        );

    let cta =
        "🚀 Get Personalized Quote";

    const packageName =
        (
            pkg.package_name || ""
        ).toLowerCase();

    if (
        packageName.includes(
            "maldives"
        )
    ) {

        cta =
            "💕 Get Honeymoon Quote";

    }

    else if (
        packageName.includes(
            "dubai"
        )
    ) {

        cta =
            "🔥 Unlock Dubai Deals";

    }

    else if (
        packageName.includes(
            "bali"
        )
    ) {

        cta =
            "🌴 Get Bali Offers";

    }

    btn.innerHTML = cta;

    /* =====================================
    REAL LIVE SEATS
    ===================================== */

    document.getElementById(
        "rsSeatsLeft"
    ).innerHTML =

        `${pkg.slots_left || 5}
        seats left`;

    /* =====================================
    REAL VIEWING COUNT
    ===================================== */

    const viewing =
        Math.floor(
            Math.random() * 18
        ) + 12;

    document.getElementById(
        "rsViewingCount"
    ).innerHTML =

        `${viewing}
        people viewing now`;

    /* =====================================
    AI MONTH RECOMMENDATION
    ===================================== */

    let recommendation =
        "✨ Best travel deals available this season.";

    if (
        packageName.includes("maldives")
    ) {

        recommendation =
            "☀️ Best time for Maldives is Nov–April with crystal clear beaches.";

    }

    else if (
        packageName.includes("bali")
    ) {

        recommendation =
            "🌴 Bali is highly recommended between April–October.";

    }

    else if (
        packageName.includes("dubai")
    ) {

        recommendation =
            "🏙️ Dubai luxury season starts from November.";

    }

    document.getElementById(
        "rsAiRecommendation"
    ).innerHTML =
        recommendation;

    /* =====================================
    PERSONA DETECTION
    ===================================== */

    let persona =
        "🧠 Family Vacation Explorer";

    if (
        packageName.includes("honeymoon") ||
        packageName.includes("maldives")
    ) {

        persona =
            "💕 Romantic Luxury Traveler";

    }

    else if (
        packageName.includes("bali")
    ) {

        persona =
            "🌴 Relaxation & Nature Traveler";

    }

    else if (
        packageName.includes("dubai")
    ) {

        persona =
            "🔥 Premium Lifestyle Traveler";

    }

    document.getElementById(
        "rsTravelerPersona"
    ).innerHTML =
        persona;

    /* =====================================
    AI SCORE
    ===================================== */

    const score =
        Math.floor(
            Math.random() * 8
        ) + 92;

    document.getElementById(
        "rsAiScoreFill"
    ).style.width =
        score + "%";

    document.getElementById(
        "rsAiScoreText"
    ).innerHTML =
        `${score}% Match`;

    /* =====================================
    OPEN POPUP
    ===================================== */

    document.getElementById(
        "rsLeadOverlay"
    ).classList.add(
        "active"
    );

    /* =====================================
    FOCUS
    ===================================== */

    setTimeout(() => {

        document.getElementById(
            "rsLeadName"
        ).focus();

    }, 200);

    /* =====================================
    START FUNCTIONS
    ===================================== */

    rsStartUrgencyTimer(
        pkg.offer_ends
    );

    rsTypingEffect();

}

/* =========================================
CLOSE
========================================= */

function rsCloseLeadPopup() {

    document
        .getElementById(
            "rsLeadOverlay"
        )
        .classList.remove("active");

}

/* =========================================
SUBMIT LEAD
========================================= */

async function rsSubmitLead() {

    /* =========================================
    BUTTON
    ========================================= */

    const btn =
        document.querySelector(
            ".rs-lead-submit"
        );

    /* PREVENT DOUBLE CLICK */

    if (btn.disabled) {
        return;
    }

    /* =========================================
    GET VALUES
    ========================================= */

    const name =
        document.getElementById(
            "rsLeadName"
        ).value.trim();

    let phone =
        document.getElementById(
            "rsLeadPhone"
        ).value
            .replace(/\D/g, '');

    /* AUTO ADD +91 */

    if (
        phone.length === 10
    ) {

        phone = "91" + phone;

    }

    const data = {

        package_name:
            document.getElementById(
                "rsLeadPackage"
            ).value.trim(),

        name: name,

        phone: phone,

        month:
            document.getElementById(
                "rsLeadMonth"
            ).value,

        adults:
            document.getElementById(
                "rsLeadAdults"
            ).value,

        child:
            document.getElementById(
                "rsLeadChild"
            ).value,

        infant:
            document.getElementById(
                "rsLeadInfant"
            ).value,

        budget:
            document.getElementById(
                "rsLeadBudget"
            ).value,

        source:
            "Travel Website"

    };

    /* =========================================
    VALIDATION
    ========================================= */

    if (!name) {

        rsShowToast(
            "Please enter your name",
            "error"
        );

        return;

    }

    /* PHONE VALIDATION */

    if (
        phone.length < 12
    ) {

        rsShowToast(
            "Please enter valid WhatsApp number",
            "error"
        );

        return;

    }

    /* =========================================
    LOADING UI
    ========================================= */

    btn.innerHTML =
        "⏳ Submitting...";

    btn.disabled = true;

    rsShowToast(
        "Submitting your travel request...",
        "success"
    );

    btn.style.opacity = "0.7";

    try {

        /* =====================================
        API CALL
        ===================================== */

        const response =
            await fetch(

                RS_CONFIG.API_URL,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            action:
                                "saveTravelLead",

                            package_name:
                                data.package_name,

                            name:
                                data.name,

                            phone:
                                data.phone,

                            month:
                                data.month,

                            adults:
                                data.adults,

                            child:
                                data.child,

                            infant:
                                data.infant,

                            budget:
                                data.budget,

                            source:
                                data.source

                        })

                }

            );

        /* =====================================
        RESPONSE VALIDATION
        ===================================== */

        if (!response.ok) {

            throw new Error(
                "Server Error"
            );

        }

        const result =
            await response.json();

        btn.innerHTML =
            "✅ Submitted";

        console.log(
            "Lead Response:",
            result
        );

        /* =====================================
        SUCCESS
        ===================================== */

        if (result.success) {

            /* SUCCESS TOAST */

            rsShowToast(
                "✨ AI Travel Plan Request Submitted Successfully",
                "success"
            );

            /* OPTIONAL MICRO SUCCESS */

            setTimeout(() => {

                rsShowToast(
                    "📲 Travel expert will contact you shortly"
                );

            }, 1200);

            /* CLOSE POPUP */

            setTimeout(() => {

                rsCloseLeadPopup();

            }, 1800);

            /* RESET FORM */

            document.getElementById(
                "rsLeadName"
            ).value = "";

            document.getElementById(
                "rsLeadPhone"
            ).value = "";

        }

        else {

            console.log(result);

            rsShowToast(
                result.error ||
                "Something went wrong",
                "error"
            );

        }

    }

    catch (err) {

        console.log(
            "Lead Error:",
            err
        );

        rsShowToast(
            "Network error. Please try again.",
            "error"
        );

    }

    finally {

        /* =====================================
        RESET BUTTON
        ===================================== */

        btn.innerHTML =
            "🚀 Get Personalized Quote";

        btn.disabled = false;

        btn.style.opacity = "1";

    }

}

/* =========================================
SHOW TOAST
========================================= */

function rsShowToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "rsToast"
        );

    const text =
        document.getElementById(
            "rsToastText"
        );

    const icon =
        document.getElementById(
            "rsToastIcon"
        );

    text.innerHTML = message;

    /* SUCCESS */

    if (type === "success") {

        icon.innerHTML = "✅";

        icon.style.background =
            "linear-gradient(135deg,#10b981,#059669)";

    }

    /* ERROR */

    else {

        icon.innerHTML = "❌";

        icon.style.background =
            "linear-gradient(135deg,#ef4444,#dc2626)";

    }

    toast.classList.add(
        "active"
    );

    setTimeout(() => {

        toast.classList.remove(
            "active"
        );

    }, 3000);

}


function rsStartUrgencyTimer(
    offerEnds
) {

    if (!offerEnds) return;

    const timer =
        document.getElementById(
            "rsUrgencyTimer"
        );

    const end =
        new Date(
            offerEnds
        ).getTime();

    clearInterval(
        window.rsUrgencyInterval
    );

    window.rsUrgencyInterval =
        setInterval(() => {

            const now =
                new Date().getTime();

            const distance =
                end - now;

            if (distance <= 0) {

                timer.innerHTML =
                    "⚠️ Offer Expired";

                clearInterval(
                    window.rsUrgencyInterval
                );

                return;

            }

            const days =
                Math.floor(
                    distance /
                    (1000 * 60 * 60 * 24)
                );

            const hours =
                Math.floor(
                    (
                        distance %
                        (1000 * 60 * 60 * 24)
                    ) /
                    (1000 * 60 * 60)
                );

            timer.innerHTML =
                `🔥 Offer expires in ${days}d ${hours}h`;

        }, 1000);

}

function rsTypingEffect() {

    const typing =
        document.getElementById(
            "rsAiTyping"
        );

    typing.style.display =
        "flex";

    setTimeout(() => {

        typing.innerHTML =
            "✅ AI advisor ready with personalized travel quote";

    }, 4000);

}

/* =========================================
ANIMATED COUNTER
========================================= */

function rsInitCounters() {

    const counters =
        document.querySelectorAll(".rs-counter");

    counters.forEach(counter => {

        const target =
            +counter.getAttribute("data-target");

        let count = 0;

        const speed =
            target / 90;

        const update = () => {

            count += speed;

            if (count < target) {

                counter.innerText =
                    Math.floor(count);

                requestAnimationFrame(update);

            } else {

                if (target === 98) {

                    counter.innerText =
                        target + "%";

                } else {

                    counter.innerText =
                        target + "+";

                }

            }

        };

        update();

    });

}

window.addEventListener(
    "load",
    rsInitCounters
);

/* =====================================
LOAD FARE VEHICLES
===================================== */

async function rsLoadFareVehicles2026() {

    try {

        const response =
            await fetch(

                `${RS_CONFIG.API_URL}?action=getCarRentals`

            );

        const result =
            await response.json();

        if (!result.success) return;

        const select =
            document.getElementById(
                "rsFareVehicle"
            );

        select.innerHTML =
            `<option value="">
                Select Vehicle
            </option>`;

        result.data.forEach(car => {

            select.innerHTML += `

            <option

                value="${car.price}"

                data-vehicle="${car.vehicle_name}"

            >

                ${car.vehicle_name}
                •
                ${car.price}

            </option>

            `;

        });

    }

    catch (err) {

        console.log(
            "Fare Vehicle Load Error",
            err
        );

    }

}

/* =====================================
FARE CALCULATOR 2026
===================================== */

function rsCalculateFare2026() {

    const vehicle =
        document.getElementById(
            "rsFareVehicle"
        );

    const priceText =
        vehicle.value || "";

    if (!priceText) {

        document.getElementById(
            "rsFareResult"
        ).innerHTML =

            `
        <div class="rs-fare-error">

            Select Vehicle

        </div>
        `;

        return;
    }

    const rate =
        parseFloat(
            priceText.replace(
                /[^0-9.]/g,
                ""
            )
        );

    let fare = 0;

    let fareType = "";

    let usageText = "";

    // =====================
    // PER DAY
    // =====================

    if (
        priceText
            .toLowerCase()
            .includes("/day")
    ) {

        const days =
            Number(
                document.getElementById(
                    "rsFareDays"
                ).value
            );

        if (!days) {

            document.getElementById(
                "rsFareResult"
            ).innerHTML =

                `
            <div class="rs-fare-error">

                Enter Rental Days

            </div>
            `;

            return;
        }

        fare =
            rate * days;

        fareType =
            "Per Day";

        usageText =
            `📅 ${days} Day(s)`;

    }

    // =====================
    // PER KM
    // =====================

    else {

        const km =
            Number(
                document.getElementById(
                    "rsFareKm"
                ).value
            );

        if (!km) {

            document.getElementById(
                "rsFareResult"
            ).innerHTML =

                `
            <div class="rs-fare-error">

                Enter Distance

            </div>
            `;

            return;
        }

        fare =
            Math.round(
                km * rate
            );

        fareType =
            "Per KM";

        usageText =
            `📍 ${km} KM`;

    }

    // =====================
    // RESULT
    // =====================

    document.getElementById(
        "rsFareResult"
    ).innerHTML =

        `

    <div class="rs-fare-price-card">

        <div class="rs-fare-price-label">

            Estimated Fare

        </div>

        <div class="rs-fare-price">

            ₹${fare.toLocaleString("en-IN")}

        </div>

    </div>

    <div class="rs-fare-modern-pills">

        <span class="rs-pill vehicle">

            🚘 ${vehicle.options[vehicle.selectedIndex].dataset.vehicle}

        </span>

        <span class="rs-pill rate">

            💰 ${priceText}

        </span>

        <span class="rs-pill type">

            ⚡ ${fareType}

        </span>

    </div>

    <div class="rs-fare-modern-pills">

        <span class="rs-pill distance">

            ${usageText}

        </span>

    </div>

    <div class="rs-transparent-card">

        ✨ Transparent Pricing

    </div>

    <div class="rs-fare-note-modern">

        Toll, Parking & Driver Bata Extra

    </div>

    `;
}

document.addEventListener(

    "DOMContentLoaded",

    () => {

        rsLoadFareVehicles2026();

    }

);

document
    .getElementById(
        "rsFareVehicle"
    )
    .addEventListener(
        "change",
        rsToggleFareMode
    );

/* =========================================
SCROLL REVEAL
========================================= */

const revealElements = document.querySelectorAll(
    '[class*="reveal"]'
);

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            } else {
                entry.target.classList.remove("active");
            }

        });
    },
    {
        threshold: 0.15
    }
);

revealElements.forEach(el => {
    revealObserver.observe(el);
});


function openPremiumQuote() {

    document
        .getElementById(
            "premiumQuoteModal"
        )
        .style.display = "flex";

}

function closePremiumQuote() {

    document
        .getElementById(
            "premiumQuoteModal"
        )
        .style.display = "none";

    resetPremiumQuote();

}



async function submitPremiumQuote() {

    const btn =
        document.getElementById(
            "premiumSubmitBtn"
        );

    const txt =
        document.getElementById(
            "premiumBtnText"
        );

    const loader =
        document.getElementById(
            "premiumLoader"
        );

    btn.disabled = true;

    txt.innerHTML =
        "Submitting...";

    loader.style.display =
        "block";

    const data = {

        action: "savePremiumQuote",

        name: pqName.value,

        phone: pqPhone.value,

        service: pqService.value,

        month: pqMonth.value,

        travellers: pqTravellers.value,

        message: pqMessage.value

    };

    try {

        const res =
            await fetch(

                RS_CONFIG.API_URL,

                {

                    method: "POST",

                    body: JSON.stringify(data)

                }

            );

        const json =
            await res.json();

        loader.style.display =
            "none";

        document.querySelectorAll(

            "#premiumQuoteModal input,#premiumQuoteModal select,#premiumQuoteModal textarea,#premiumSubmitBtn"

        ).forEach(el => {

            el.style.display = "none";

        });

        document.getElementById(

            "premiumSuccess"

        ).style.display = "block";

        setTimeout(() => {

            closePremiumQuote();

            resetPremiumQuote();

        }, 3000);

    }

    catch (e) {

        loader.style.display =
            "none";

        txt.innerHTML =
            "Get My Custom Quote";

        btn.disabled = false;

    }

}

function resetPremiumQuote() {

    pqName.value = "";

    pqPhone.value = "";

    pqService.selectedIndex = 0;

    pqMonth.value = "";

    pqTravellers.value = "";

    pqMessage.value = "";

    document.querySelectorAll(

        "#premiumQuoteModal input,#premiumQuoteModal select,#premiumQuoteModal textarea,#premiumSubmitBtn"

    ).forEach(el => {

        el.style.display = "block";

    });

    document.getElementById(

        "premiumSuccess"

    ).style.display = "none";

    document.getElementById(

        "premiumBtnText"

    ).innerHTML =

        "Get My Custom Quote";

    document.getElementById(

        "premiumSubmitBtn"

    ).disabled = false;

}

function premiumToast(msg) {

    const t =
        document
            .getElementById(
                "premiumToast"
            );

    t.innerHTML = msg;

    t.classList.add(
        "show"
    );

    setTimeout(() => {

        t.classList.remove(
            "show"
        );

    }, 3000);

}


function toggleTravelWidget() {

    const menu =

        document.getElementById(

            "travelWidgetMenu"

        );

    if (

        menu.style.display === "block"

    ) {

        menu.style.display = "none";

    }

    else {

        menu.style.display = "block";

    }

}

function openTravelService(service) {

    document.getElementById(

        "pqService"

    ).value = service;

    document.getElementById(

        "travelWidgetMenu"

    ).style.display = "none";

    openPremiumQuote();

}

window.onclick = function (event) {

    const menu =

        document.getElementById(

            "travelWidgetMenu"

        );

    const widget =

        document.querySelector(

            ".rs-travel-widget"

        );

    if (

        !widget.contains(

            event.target

        )

    ) {

        menu.style.display = "none";

    }

}


function toggleConcierge() {

    const menu =

        document.getElementById(

            "conciergeMenu"

        );

    if (

        menu.style.display == "block"

    ) {

        menu.style.display = "none";

    }

    else {

        menu.style.display = "block";

    }

}

function openTravelService(service) {

    pqService.value = service;

    document.getElementById(

        "conciergeMenu"

    ).style.display = "none";

    openPremiumQuote();

}

const progressCircle =
    document.getElementById(
        "progressCircle"
    );

const backTop =
    document.getElementById(
        "backToTop"
    );

const radius = 45;

const circumference =
    2 * Math.PI * radius;

progressCircle.style.strokeDasharray =
    circumference;

progressCircle.style.strokeDashoffset =
    circumference;

window.addEventListener(

    "scroll",

    function () {

        const scrollTop =
            window.scrollY;

        const docHeight =

            document.documentElement.scrollHeight -

            window.innerHeight;

        const percent =

            scrollTop / docHeight;

        const offset =

            circumference -
            (percent * circumference);

        progressCircle.style.strokeDashoffset =
            offset;

        if (scrollTop > 400) {

            backTop.classList.add(
                "show"
            );

        }

        else {

            backTop.classList.remove(
                "show"
            );

        }

    }

);

function scrollToTop() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

document.addEventListener("DOMContentLoaded", () => {

    const filters = document.querySelectorAll(
        ".rs-gallery-filters span"
    );

    const cards = document.querySelectorAll(
        ".gallery-card"
    );

    filters.forEach(filter => {

        filter.addEventListener("click", () => {

            filters.forEach(f =>
                f.classList.remove(
                    "active"
                ));

            filter.classList.add(
                "active"
            );

            const category =
                filter.dataset.filter;

            cards.forEach(card => {

                if (

                    category === "all"

                    ||

                    card.classList.contains(
                        category
                    )

                ) {

                    card.style.display = "block";

                } else {

                    card.style.display = "none";

                }

            });

        });

    });

});