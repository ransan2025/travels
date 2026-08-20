
let activeFestival = null;
window.festivalCTA = null;
window.festivalTicker = null;
window.festivalUrgency = null;
window.festivalCountdownTimer = null;
window.festivalTypingTexts = null;

document.addEventListener(

    "DOMContentLoaded",

    function () {

        buildHeroLive();

    }

);

function buildHeroLive() {

    document.getElementById(

        "heroLiveTicker"

    ).innerHTML = `

<div class="hero-live-wrap">

<div class="hero-live-badge">

<span class="hero-live-dot">

</span>

LIVE

</div>

<div

class="hero-live-message"

id="heroLiveMessage">

</div>

<div class="hero-live-rating">

${heroLiveData.stars}

${heroLiveData.rating}

</div>

</div>

`;

    rotateHeroLive();

    setInterval(

        rotateHeroLive,

        4000

    );

}

let heroIndex = 0;

function rotateHeroLive() {

    const box = document.getElementById(

        "heroLiveMessage"

    );

    const source =

        window.festivalTicker ||

        heroLiveData.items;

    const item =

        source[heroIndex];

    box.style.opacity = 0;

    box.style.transform = "translateY(8px)";

    setTimeout(function () {

        box.className =

            "hero-live-message " +

            item.color;

        box.innerHTML = `

${item.icon}

${item.text}

`;

        box.style.opacity = 1;

        box.style.transform = "translateY(0px)";

    }, 300);

    heroIndex++;

    if (heroIndex >= source.length) {

        heroIndex = 0;

    }

}

document.addEventListener(

    "DOMContentLoaded",

    function () {

        buildTrustTicker();

    });

function buildTrustTicker() {

    document.getElementById(

        "heroTrustTicker"

    ).innerHTML = `

<div class="hero-trust-wrap">

<div

id="heroTrustMessage"

class="hero-trust-message">

</div>

</div>

`;

    rotateTrust();

    setInterval(

        rotateTrust,

        5000

    );

}

let trustIndex = 0;

function rotateTrust() {

    const box =

        document.getElementById(

            "heroTrustMessage"

        );

    const item =

        heroLiveData.trustBar[trustIndex];

    box.style.opacity = 0;

    box.style.transform = "translateY(8px)";

    setTimeout(function () {

        box.className =

            "hero-trust-message " +

            item.color;

        box.innerHTML = `

${item.icon}

${item.text}

`;

        box.style.opacity = 1;

        box.style.transform = "translateY(0px)";

    }, 300);

    trustIndex++;

    if (

        trustIndex >=

        heroLiveData.trustBar.length

    ) {

        trustIndex = 0;

    }

}

document.addEventListener(

    "DOMContentLoaded",

    function () {

        loadGreeting();

    }

);

function isFestivalActive(event) {

    const today =
        new Date();

    const year =
        today.getFullYear();

    let start =
        new Date(

            year,

            event.startMonth - 1,

            event.startDay

        );

    let end =
        new Date(

            year,

            event.endMonth - 1,

            event.endDay,

            23,

            59,

            59

        );

    /*
    Cross-year festival
    */

    if (end < start) {

        if (today >= start) {

            end.setFullYear(
                year + 1
            );

        }

        else {

            start.setFullYear(
                year - 1
            );

        }

    }

    return (

        today >= start &&

        today <= end

    );

}

function isFestivalActive(event) {

    const today =
        new Date();

    const year =
        today.getFullYear();

    let start =
        new Date(

            year,

            event.startMonth - 1,

            event.startDay

        );

    let end =
        new Date(

            year,

            event.endMonth - 1,

            event.endDay,

            23,

            59,

            59

        );

    /*
    Cross year
    */

    if (end < start) {

        if (today >= start) {

            end.setFullYear(

                year + 1

            );

        }

        else {

            start.setFullYear(

                year - 1

            );

        }

    }

    return (

        today >= start &&

        today <= end

    );

}

function loadGreeting() {

    const now = new Date();

    const day = now.getDay();

    const hour = now.getHours();

    const month = now.getMonth() + 1;

    const date = now.getDate();

    /*=====================
    CHECK SPECIAL EVENTS
    =====================*/

    const special =

        heroLiveData.specialEvents

            .filter(function (event) {

                return (

                    event.enabled !== false

                    &&

                    isFestivalActive(

                        event

                    )

                );

            })

            .sort(function (a, b) {

                return (

                    b.priority || 0

                ) - (

                        a.priority || 0

                    );

            })

        [0];

    if (special) {

        activeFestival = special;

        renderGreeting(special);

        applyFestivalTheme(

            special

        );

        return;

    }

    /* Reset Festival */

    resetHeroTheme();

    /* Continue Normal Greeting */

    /*=====================
    NORMAL GREETINGS
    =====================*/

    let timeSlot = "";

    if (hour >= 5 && hour < 12) {

        timeSlot = "morning";

    }

    else if (hour >= 12 && hour < 17) {

        timeSlot = "afternoon";

    }

    else if (hour >= 17 && hour < 21) {

        timeSlot = "evening";

    }

    else {

        timeSlot = "night";

    }

    const item =

        heroLiveData.greetings.find(

            g =>

                g.days.includes(day)

                &&

                (

                    g.times.includes("all")

                    ||

                    g.times.includes(timeSlot)

                )

        );

    if (item) {

        resetHeroTheme();

        renderGreeting(item);

    }

}

function applyFestivalColors(event) {

    document.documentElement.style.setProperty(

        "--festival-primary",

        event.primaryColor ||

        "#1565c0"

    );

    document.documentElement.style.setProperty(

        "--festival-secondary",

        event.secondaryColor ||

        "#2e7d32"

    );

    document.documentElement.style.setProperty(

        "--festival-accent",

        event.accentColor ||

        "#ffd700"

    );

    document.documentElement.style.setProperty(

        "--festival-text",

        event.textColor ||

        "#ffffff"

    );

    document.documentElement.style.setProperty(

        "--festival-overlay",

        event.overlay ||

        "rgba(0,0,0,.45)"

    );

}

function applyFestivalOverlay(event) {

    document.documentElement.style.setProperty(

        "--hero-overlay-1",

        event.overlay1 ||

        "rgba(0,0,0,.72)"

    );

    document.documentElement.style.setProperty(

        "--hero-overlay-2",

        event.overlay2 ||

        "rgba(0,0,0,.45)"

    );

    document.documentElement.style.setProperty(

        "--hero-overlay-3",

        event.overlay3 ||

        "rgba(0,0,0,.15)"

    );

}

function applyFestivalTheme(event) {

    updateFestivalBadge(event);

    updateFestivalOffer(event);

    updateFestivalCTA(event);

    updateFestivalHero(event);

    applyFestivalColors(event);

    applyFestivalOverlay(event);

    updateFestivalTicker(event);

    updateFestivalUrgency(event);

    startFestivalCountdown(event);

    startFestivalProgress(event);

    updateFestivalProgress(event);

    updateFestivalTyping(event);

    updateFestivalRibbon(event);


    setInterval(function () {

        updateFestivalProgress(
            event
        );

    }, 60000);

    document.body.setAttribute(

        "data-theme",

        event.theme

    );

    document.documentElement.style.setProperty(

        "--festival-accent",

        event.themeColor ||

        "#0d6efd"

    );

    document.documentElement.style.setProperty(

        "--festival-primary",

        event.primaryColor

    );

    document.documentElement.style.setProperty(

        "--festival-secondary",

        event.secondaryColor

    );

    const zone =

        document.getElementById(

            "festivalZone"

        );

    if (zone) {

        zone.classList.add(

            "festival-active"

        );

    }

    const progressWrap =

        document.getElementById(

            "festivalProgressWrap"

        );

    if (progressWrap) {

        progressWrap.style.display = "block";

    }

}

function updateFestivalBadge(event) {

    const badge =

        document.getElementById(

            "badgeText"

        );

    if (!badge) return;

    badge.innerHTML =

        `
${event.icon}

${event.badge}
`;

}

function updateFestivalOffer(event) {

    const rotate =

        document.getElementById(

            "rotateText"

        );

    if (rotate) {

        rotate.innerHTML =

            event.offer;

    }

    const offer =

        document.getElementById(

            "festivalOffer"

        );

    if (offer) {

        offer.classList.add(

            "active"

        );

        offer.innerHTML =

            `

<span>${event.icon}</span>

<span>${event.offer}</span>

`;

    }

}

function resetFestivalOffer() {

    const offer =

        document.getElementById(

            "festivalOffer"

        );

    if (!offer) return;

    offer.classList.remove(

        "active"

    );

    offer.innerHTML = "";

}

function resetHeroTheme() {

    /* Festival inactive */

    activeFestival = null;

    window.currentFestivalHero = null;

    /* Remove theme */

    document.body.removeAttribute(

        "data-theme"

    );

    /* Reset badge */

    const badge =

        document.getElementById(

            "badgeText"

        );

    if (

        badge

        &&

        heroLiveData.badgeTexts

    ) {

        badge.innerHTML =

            heroLiveData.badgeTexts[0];

    }

    /* Remove offer */

    const offer =

        document.getElementById(

            "festivalOffer"

        );

    if (offer) {

        offer.innerHTML = "";

        offer.classList.remove(

            "active"

        );

    }



    /* Reset rotating text */

    const rotate =

        document.getElementById(

            "rotateText"

        );

    if (

        rotate

        &&

        heroLiveData.rotatingDestinations

    ) {

        if (

            rotate

            &&

            heroLiveData.rotatingDestinations.length

        ) {

            rotate.textContent =

                heroLiveData.rotatingDestinations[0];

        }

    }

    resetFestivalHero();
    window.festivalCTA = null;
    updatePrimaryCTA();

    document.documentElement.style.setProperty(

        "--festival-primary",

        "#1565c0"

    );

    document.documentElement.style.setProperty(

        "--festival-secondary",

        "#2e7d32"

    );

    document.documentElement.style.setProperty(

        "--festival-accent",

        "#ffd700"

    );

    document.documentElement.style.setProperty(

        "--festival-text",

        "#ffffff"

    );

    document.documentElement.style.setProperty(

        "--festival-overlay",

        "rgba(0,0,0,.45)"

    );

    document.documentElement.style.setProperty(

        "--hero-overlay-1",

        "rgba(0,0,0,.72)"

    );

    document.documentElement.style.setProperty(

        "--hero-overlay-2",

        "rgba(0,0,0,.45)"

    );

    document.documentElement.style.setProperty(

        "--hero-overlay-3",

        "rgba(0,0,0,.15)"

    );

    document.documentElement.style.setProperty(

        "--festival-accent",

        "#0d6efd"

    );

    window.festivalTicker = null;

    heroIndex = 0;

    rotateHeroLive();

    window.festivalUrgency = null;

    clearInterval(

        window.festivalCountdownTimer

    );

    const box =

        document.getElementById(

            "festivalCountdown"

        );

    if (box) {

        box.classList.remove(

            "active"

        );

        box.innerHTML = "";

    }

    window.festivalTypingTexts = null;

    resetFestivalRibbon();


    document.documentElement.style.setProperty(

        "--festival-primary",

        "#ff9800"

    );

    document.documentElement.style.setProperty(

        "--festival-secondary",

        "#ff5722"

    );

    const zone =

        document.getElementById(

            "festivalZone"

        );

    if (zone) {

        zone.classList.remove(

            "festival-active"

        );

    }

    const progressWrap =

        document.getElementById(

            "festivalProgressWrap"

        );

    if (progressWrap) {

        progressWrap.style.display = "none";

    }

    const fill =

        document.getElementById(

            "festivalProgressFill"

        );

    if (fill) {

        fill.style.width = "0%";

    }

    const txt =

        document.getElementById(

            "festivalProgressText"

        );

    if (txt) {

        txt.innerHTML = "";

    }

}

function updateFestivalCTA(event) {

    window.festivalCTA = {

        text: event.cta,

        link: "#book",

        icon: event.icon,

        subtitle: event.subtitle,

        pill: event.pill,

        color: "festival"

    };

    updatePrimaryCTA();

}

function updateFestivalUrgency(event) {

    if (event.urgency) {

        window.festivalUrgency =

            event.urgency;

    }

    else {

        window.festivalUrgency = null;

    }

}

function updateFestivalTicker(event) {

    if (!event.liveTicker) {

        window.festivalTicker = null;

        return;

    }

    window.festivalTicker = event.liveTicker;

    heroIndex = 0;

    rotateHeroLive();

}

/*=================================
FESTIVAL HERO IMAGE
=================================*/

function updateFestivalHero(event) {

    if (!event.heroImage) {

        return;

    }

    const slides =

        document.querySelectorAll(

            ".hero-slide"

        );

    if (!slides.length) {

        return;

    }

    window.currentFestivalHero = true;

    slides.forEach(function (slide) {

        slide.classList.remove(

            "active"

        );

    });

    slides[0].style.backgroundImage =

        `url('${event.heroImage}')`;

    slides[0].classList.add(

        "active"

    );

}

function resetFestivalHero() {

    window.currentFestivalHero = false;

    const slides =

        document.querySelectorAll(

            ".hero-slide"

        );

    if (slides.length) {

        slides[0].style.backgroundImage =

            `linear-gradient(
rgba(0,0,0,.45),
rgba(0,0,0,.45)
),

url('${event.heroImage}')`;

    }

}



const offer =

    document.getElementById(

        "festivalOffer"

    );

if (

    offer

    &&

    activeFestival

) {

    offer.innerHTML =

        activeFestival.offer;

}

function renderGreeting(item) {

const badge =

item.badge

?

`

<span class="hero-special-badge">

<span class="live-dot"></span>

${item.icon}

${item.badge}

</span>

`

:

`

<span class="hero-normal-badge">

${heroLiveData.badgeTexts[0]}

</span>

`;


    const offer =

        item.offer

            ?

            `

<div class="hero-offer-pill">

🔥 ${item.offer}

</div>

`

            :

            "";

    document.getElementById(

        "heroGreetingCard"

    ).innerHTML =

        `

<div class="hero-greeting-card">

${badge}

<div class="greet-top">

${item.icon}

${item.title}

</div>

<div class="greet-bottom">

${item.message}

</div>



</div>

`;



}

let titleIndex = 0;

const heroTitle = document.getElementById("heroTitle");

function updateHeroTitle() {

    const item =

        heroLiveData.heroTitles[titleIndex];

    heroTitle.innerHTML =

        `

${item.before}

<span>

${item.highlight}

</span>

`;

    titleIndex++;

    if (titleIndex >= heroLiveData.heroTitles.length) {

        titleIndex = 0;

    }

}

updateHeroTitle();

setInterval(updateHeroTitle, 5000);


/********************************
HERO CTA
********************************/

const primaryCTA =
    document.getElementById("ctaPrimary");

const secondaryCTA =
    document.getElementById("ctaSecondary");

const whatsappCTA =
    document.getElementById("ctaWhatsapp");

/*************************
STATIC BUTTONS
*************************/

if (secondaryCTA) {

    secondaryCTA.href =
        heroLiveData.cta.secondary.link;

    secondaryCTA.textContent =

        heroLiveData.cta.secondary.icon +

        " " +

        heroLiveData.cta.secondary.text;

}

if (whatsappCTA) {

    whatsappCTA.href =
        heroLiveData.cta.whatsapp.link;

    whatsappCTA.textContent =

        heroLiveData.cta.whatsapp.icon +

        " " +

        heroLiveData.cta.whatsapp.text;

}

/*************************
PRIMARY ROTATION
*************************/

/********************************
PRIMARY CTA
********************************/

const primaryItems = heroLiveData.cta.primary;

let primaryIndex = 0;

function updatePrimaryCTA() {

    if (!primaryCTA) return;

    /*************************
    FESTIVAL MODE
    *************************/

    if (window.festivalCTA) {

        primaryCTA.href =
            window.festivalCTA.link;

        primaryCTA.innerHTML = `

        <div class="cta-main">

            ${window.festivalCTA.icon}

            ${window.festivalCTA.text}

        </div>

        <div class="cta-sub">

<span class="cta-pill festival">

${window.festivalCTA.pill}

${window.festivalCTA.subtitle}

</span>

        </div>

        `;

        primaryCTA.classList.remove(

            "blue",
            "purple",
            "orange",
            "green",
            "teal",
            "festival"

        );

        primaryCTA.classList.add(

            window.festivalCTA.color ||

            "festival"

        );

        return;

    }

    /*************************
    NORMAL MODE
    *************************/

    const item =

        primaryItems[primaryIndex];

    primaryCTA.href =

        item.link;

    primaryCTA.innerHTML = `

    <div class="cta-main">

        ${item.icon}

        ${item.text}

    </div>

    <div class="cta-sub">

        <span class="cta-pill">

            ${item.pill}

            ${item.subtitle}

        </span>

    </div>

    `;

    primaryCTA.classList.remove(

        "blue",
        "purple",
        "orange",
        "green",
        "teal",
        "festival"

    );

    if (item.color) {

        primaryCTA.classList.add(

            item.color

        );

    }

    primaryIndex++;

    if (

        primaryIndex >=

        primaryItems.length

    ) {

        primaryIndex = 0;

    }

}

/************************
START
************************/

updatePrimaryCTA();

setInterval(
    updatePrimaryCTA,
    5000
);

function getCountdownTitle(event, days, totalHours) {

    if (totalHours <= 1) {

        return "🚨 Final Hour";

    }

    if (totalHours <= 6) {

        return "🔥 Ending Soon";

    }

    if (totalHours <= 24) {

        return "⚡ Last Day Sale";

    }

    if (days <= 7) {

        return "🎁 Limited Time Offer";

    }

    if (days <= 15) {

        return "🎉 Festival Live";

    }

    return event.countdownText ||

        "🎉 Festival Coming Soon";

}

let festivalTimer = null;

function startFestivalCountdown(event) {

    if (!event.countdown) return;

    const box =
        document.getElementById(
            "festivalCountdown"
        );

    if (!box) return;

    clearInterval(festivalTimer);

    festivalTimer = setInterval(function () {

        const now = new Date();

        const expiry = new Date(

            now.getFullYear(),

            event.endMonth - 1,

            event.endDay,

            event.expiryHour || 23,

            event.expiryMinute || 59,

            59

        );

        const diff = expiry - now;

        if (diff <= 0) {

            clearInterval(festivalTimer);

            box.innerHTML =

                `

            <div class="festival-expired">

            ⏰ Offer Closed

            </div>

            `;

            resetHeroTheme();

            return;

        }

        const totalHours =
            Math.floor(diff / 3600000);

        const days =
            Math.floor(
                diff /
                (1000 * 60 * 60 * 24)
            );

        const hours =
            Math.floor(

                (
                    diff %
                    (1000 * 60 * 60 * 24)
                )

                /

                (1000 * 60 * 60)

            );

        const mins =
            Math.floor(

                (
                    diff %
                    (1000 * 60 * 60)
                )

                /

                (1000 * 60)

            );

        const secs =
            Math.floor(

                (
                    diff %
                    (1000 * 60)
                )

                /

                1000

            );

        updateCountdownColor(

            box,

            days,

            totalHours

        );

        const dynamicTitle =

            getCountdownTitle(

                event,

                days,

                totalHours

            );

        box.innerHTML =

            `

<div class="festival-count-title">

${dynamicTitle}

</div>


<div class="festival-count-grid">

<div class="festival-pill day">

<div class="festival-num">

${days}

</div>

<div class="festival-label">

DAYS

</div>

</div>

<div class="festival-pill hour">

<div class="festival-num">

${hours}

</div>

<div class="festival-label">

HRS

</div>

</div>

<div class="festival-pill minute">

<div class="festival-num">

${mins}

</div>

<div class="festival-label">

MIN

</div>

</div>

<div class="festival-pill second">

<div class="festival-num">

${secs}

</div>

<div class="festival-label">

SEC

</div>

</div>

</div>

`;

    }, 1000);

}

function updateCountdownColor(
    box,
    days,
    totalHours
) {

    box.classList.remove(

        "count-green",
        "count-yellow",
        "count-orange",
        "count-red",
        "count-blink"

    );

    if (days > 3) {

        box.classList.add(
            "count-green"
        );

    }

    else if (days > 1) {

        box.classList.add(
            "count-yellow"
        );

    }

    else if (totalHours > 6) {

        box.classList.add(
            "count-orange"
        );

    }

    else if (totalHours > 1) {

        box.classList.add(
            "count-red"
        );

    }

    else {

        box.classList.add(
            "count-blink"
        );

    }

}

let urgencyTimer;

function startFestivalUrgency(event) {

    clearInterval(urgencyTimer);

    if (!event.urgency) return;

    const rotate =

        document.getElementById("rotateText");

    if (!rotate) return;

    let i = 0;

    rotate.innerHTML =

        event.urgency[0];

    rotate.style.color =

        event.urgencyColor ||

        "#ff5722";

    urgencyTimer = setInterval(function () {

        i++;

        if (i >= event.urgency.length) {

            i = 0;

        }

        rotate.innerHTML =

            event.urgency[i];

        rotate.style.color =

            event.urgencyColor ||

            "#ff5722";

    }, 3000);

}

let progressTimer;

function startFestivalProgress(event) {

    clearInterval(progressTimer);

    const box =

        document.getElementById(

            "festivalProgress"

        );

    if (!box) return;

    progressTimer = setInterval(function () {

        const now = new Date();

        const start = new Date();

        start.setMonth(event.startMonth - 1);

        start.setDate(event.startDay);

        start.setHours(0);

        start.setMinutes(0);

        const end = new Date();

        end.setMonth(event.endMonth - 1);

        end.setDate(event.endDay);

        end.setHours(

            event.expiryHour || 23

        );

        end.setMinutes(

            event.expiryMinute || 59

        );

        const total =

            end - start;

        const done =

            now - start;

        let percent =

            (done / total) * 100;

        if (percent < 0) {

            percent = 0;

        }

        if (percent > 100) {

            percent = 100;

        }

        box.innerHTML = `

<div class="festival-progress-wrap">

<div class="festival-progress-fill"

style="width:${percent}%">

</div>

</div>

`;

        const fill =

            box.querySelector(

                ".festival-progress-fill"

            );

        fill.style.background =

            event.progressColor ||

            "#ffd700";

        const wrap =

            box.querySelector(

                ".festival-progress-wrap"

            );

        wrap.style.background =

            event.progressBg ||

            "rgba(255,255,255,.25)";

    }, 1000);

}

function updateFestivalProgress(
    event
) {

    const fill = document.getElementById(

        "festivalProgressFill"

    );

    const text = document.getElementById(

        "festivalProgressText"

    );

    if (!fill || !text) {

        return;

    }

    const now = new Date();

    const start = new Date(

        now.getFullYear(),

        event.startMonth - 1,

        event.startDay,

        0, 0, 0

    );

    const end = new Date(

        now.getFullYear(),

        event.endMonth - 1,

        event.endDay,

        23, 59, 59

    );

    const total = end - start;

    const elapsed = now - start;

    let percent =

        (elapsed / total) * 100;

    percent = Math.max(
        0,
        Math.min(
            100,
            percent
        )
    );

    fill.style.width =

        percent + "%";

    fill.style.background =

        `linear-gradient(

90deg,

${event.primaryColor},

${event.secondaryColor}

)`;

    text.innerHTML =

        Math.round(percent)

        +

        "% Festival Completed";

}

function updateFestivalTyping(event) {

    if (

        event.typingTexts &&

        event.typingTexts.length

    ) {

        window.festivalTypingTexts =

            event.typingTexts;

    }

}

function updateFestivalRibbon(event) {

    const ribbon =

        document.getElementById(
            "festivalRibbon"
        );

    if (!ribbon) return;

    ribbon.innerHTML =

        event.icon +

        " " +

        event.badge;

    ribbon.style.background =

        "linear-gradient(135deg," +

        event.primaryColor +

        "," + event.secondaryColor + ")";

    ribbon.classList.add(
        "active"
    );

}

function resetFestivalRibbon() {

    const ribbon =

        document.getElementById(
            "festivalRibbon"
        );

    if (!ribbon) return;

    ribbon.classList.remove(
        "active"
    );

}