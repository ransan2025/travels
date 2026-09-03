/* =========================================
GLOBAL
========================================= */

window.rsAllRentals = [];

window.rsCurrentRentalCategory =
    "all";

window.rsRentalSwiper = null;

/* =========================================
GLOBAL CACHE
========================================= */

window.rsRentalData = [];

/* =========================================
FAVORITES
========================================= */

window.rsFavorites =
    JSON.parse(
        localStorage.getItem("rsFavorites")
    ) || [];

/* =========================================
RECENTLY VIEWED
========================================= */

window.rsRecentlyViewed =
    JSON.parse(
        localStorage.getItem(
            "rsRecentlyViewed"
        )
    ) || [];

/* =========================================
LOAD RENTALS
========================================= */

async function rsLoadRentals() {

    try {



        // 3. RETURN CACHE ONLY AFTER SKELETON SHOWN
        if (window.rsRentalData && window.rsRentalData.length) {

            rsRenderRentals(window.rsRentalData);

            // re-init swiper safely
            setTimeout(() => {
                if (window.rsRentalSwiper) {
                    window.rsRentalSwiper.update();
                }
            }, 100);

            return;
        }

        // 4. FETCH DATA
        const response = await apiFetch("getCarRentals");

        const result = await response.json();

        if (result.success) {

            window.rsRentalData = result.data;
            window.setupData = result.setup;   // ✅ IMPORTANT FIX


            // 5. RENDER REAL DATA
            rsRenderRentals(result.data);

            // 6. SWIPER FIX
            setTimeout(() => {
                if (window.rsRentalSwiper) {
                    window.rsRentalSwiper.update();
                }
            }, 100);
        }

    } catch (err) {
        console.error("Rental Load Error:", err);

        document.getElementById("rsRentalContainer").innerHTML =
            `<div class="rs-error">Failed to load rentals</div>`;
    }
}

async function loadSetupData() {
    try {

        console.log("⏳ Loading setup...");

        const res = await apiFetch("getSetup");

        const text = await res.text();

        try {
            window.setupData = JSON.parse(text);
        } catch (e) {
            console.error("Setup JSON parse failed:", text);
            window.setupData = null;
        }

        console.log("✅ Setup loaded:", window.setupData);

    } catch (err) {

        console.error("❌ Setup API failed:", err);

        window.setupData = null;
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const container = document.getElementById("rsRentalContainer");

    if (!container) {
        console.error("rsRentalContainer not found");
        return;
    }

    // SHOW SKELETON FIRST
    renderRentalSkeleton(6);

    rsRenderRecentlyViewed();

    // LOAD REAL DATA AFTER SHORT DELAY
    setTimeout(() => {
        rsLoadRentals();
    }, 300);



});

window.addEventListener("load", async () => {

    await loadSetupData();

    if (!window.setupData) {

        console.warn("Retrying setup in 2s...");

        setTimeout(loadSetupData, 2000);
    }
});

function normalizePrice(price) {
    if (!price) return { value: 0, unit: "/day" };

    const raw = String(price).toLowerCase();

    const number = parseInt(raw.replace(/[^0-9]/g, ""), 10) || 0;

    let unit = "/day";

    if (raw.includes("km")) unit = "/km";
    if (raw.includes("day")) unit = "/day";

    return { value: number, unit };
}


/* =========================================
RENDER PREMIUM RENTALS 2026 UI
========================================= */

function rsRenderRentals(data) {

    const container =
        document.getElementById(
            "rsRentalContainer"
        );




    /* =========================================
    EMPTY
    ========================================= */

    if (!data.length) {

        container.innerHTML = `

<div class="rs-rental-empty">

    🚖 No rentals found

</div>

`;

        return;

    }

    /* =========================================
    START HTML
    ========================================= */

    let html = `

<div class="rs-rental-swiper-wrap">

    <!-- LEFT -->

<div class="rs-rental-swiper-prev">

    <i class="fa-solid fa-chevron-left"></i>

</div>

    <!-- RIGHT -->

<div class="rs-rental-swiper-next">

    <i class="fa-solid fa-chevron-right"></i>

</div>

    <!-- SWIPER -->

    <div class="swiper rsRentalSwiper">

        <div class="swiper-wrapper">

`;

    /* =========================================
    LOOP
    ========================================= */

    data.forEach(car => {

        console.log("Rendering car:", car); // 👈 ADD HERE (IMPORTANT)





        /* =====================================
AI SMART AVAILABILITY ENGINE
===================================== */

        /* SLOTS */

        const slotsLeft =
            parseInt(car.slots_left || 0);

        /* AVAILABILITY */

        const availability =
            (
                car.availability || ""
            ).toLowerCase();

        /* VIEW COUNT */

        const viewedCount =
            Math.floor(
                Math.random() * 20
            ) + 5;

        /* DEFAULT */

        let rsAvailabilityClass =
            "rs-status-green";

        let rsAvailabilityTitle =
            "🟢 Available for instant booking";

        let rsAvailabilitySub =
            `🚘 ${viewedCount} people viewed this car`;

        /* =====================================
        CRITICAL
        ===================================== */

        if (slotsLeft <= 2) {

            rsAvailabilityClass =
                "rs-status-red";

            rsAvailabilityTitle =
                `🔥 Only ${slotsLeft} cars left today`;

            rsAvailabilitySub =
                "⚡ High demand in Chennai";

        }

        /* =====================================
        HIGH DEMAND
        ===================================== */

        else if (slotsLeft <= 5) {

            rsAvailabilityClass =
                "rs-status-orange";

            rsAvailabilityTitle =
                "⚡ Fast booking rentals";

            rsAvailabilitySub =
                `🔥 ${slotsLeft} cars remaining`;

        }

        /* =====================================
        AVAILABLE
        ===================================== */

        else {

            rsAvailabilityClass =
                "rs-status-green";

            rsAvailabilityTitle =
                "🟢 Available for instant booking";

            rsAvailabilitySub =
                `🚘 ${viewedCount} people viewed this car`;

        }

        /* UNAVAILABLE */

        if (
            availability.includes("unavailable") ||
            availability.includes("sold") ||
            availability.includes("full")
        ) {

            rsAvailabilityClass =
                "rs-status-red";

            rsAvailabilityTitle =
                "❌ Currently unavailable";

            rsAvailabilitySub =
                "Try another premium rental";

        }

        /* =====================================
        GRADIENT
        ===================================== */

        const categoryText = `
    ${car.category || ""}
    ${car.badge || ""}
`.toLowerCase();

        /* =====================================
        LIGHT PREMIUM THEME ENGINE
        ===================================== */

        let gradient =
            "linear-gradient(135deg,#ffffff,#f8fafc)";

        let glow =
            "0 10px 30px rgba(15,23,42,0.08)";

        let border =
            "1px solid rgba(255,255,255,0.7)";

        let themeClass =
            "rs-theme-default";

        /* SUV */

        if (categoryText.includes("suv")) {

            gradient =
                "linear-gradient(135deg,#eff6ff,#dbeafe)";

            glow =
                "0 12px 30px rgba(59,130,246,0.12)";

            themeClass =
                "rs-theme-suv";
        }

        /* LUXURY */

        else if (categoryText.includes("luxury")) {

            gradient =
                "linear-gradient(135deg,#fff7ed,#ffedd5)";

            glow =
                "0 12px 30px rgba(249,115,22,0.12)";

            themeClass =
                "rs-theme-luxury";
        }

        /* FAMILY */

        else if (categoryText.includes("family")) {

            gradient =
                "linear-gradient(135deg,#ecfdf5,#d1fae5)";

            glow =
                "0 12px 30px rgba(16,185,129,0.12)";

            themeClass =
                "rs-theme-family";
        }

        /* BUDGET */

        else if (categoryText.includes("budget")) {

            gradient =
                "linear-gradient(135deg,#faf5ff,#f3e8ff)";

            glow =
                "0 12px 30px rgba(168,85,247,0.12)";

            themeClass =
                "rs-theme-budget";
        }

        /* VIP */

        else if (categoryText.includes("vip")) {

            gradient =
                "linear-gradient(135deg,#f9fafb,#e5e7eb)";

            glow =
                "0 12px 30px rgba(17,24,39,0.10)";

            themeClass =
                "rs-theme-vip";
        }

        /* AIRPORT */

        else if (categoryText.includes("airport")) {

            gradient =
                "linear-gradient(135deg,#ecfeff,#cffafe)";

            glow =
                "0 12px 30px rgba(6,182,212,0.12)";

            themeClass =
                "rs-theme-airport";
        }

        // ✅ NORMALIZED SAFE DATA BLOCK (FIXED AC ISSUE)

        const featuresText = (car.features || "").toLowerCase();

        /* normalize full text source */
        const fullText =
            [
                car.ac,
                car.features,
                car.air_conditioning,
                car.amenities
            ]
                .join(" ")
                .toLowerCase();



        const hasAC =
            String(car.ac).toLowerCase() === "ac" ||
            String(car.ac).toLowerCase() === "yes" ||
            String(car.ac).toLowerCase() === "true" ||
            car.ac === 1 ||
            car.ac === true ||
            featuresText.includes("ac") ||
            featuresText.includes("air condition") ||
            featuresText.includes("air conditioning");

        const seats = car.seats ?? 4;
        const transmission = car.transmission || "Auto";
        const fuel = car.fuel || "Petrol";


        const priceData = normalizePrice(car.price);

        const numericPrice = priceData.value;
        const priceUnit = priceData.unit;

        // DO NOT redeclare if already exists above
        const carBadge = (car?.badge || "").toLowerCase();

        const isPremium =
            carBadge.includes("premium") ||
            numericPrice > 5000;


        const liveFeed = generateLiveFeed(car);


        html += `

<div class="swiper-slide">

<div
class="rs-rental-modern-card ${themeClass}"
style="
    --cardGradient:${gradient};
    --cardGlow:${glow};
"
>

    <!-- IMAGE -->

    <div class="rs-rental-modern-image-wrap">


    
<img
        src="${car.image}"
        alt="${car.vehicle_name}"
        class="rs-rental-modern-image"
    >

    <!-- OVERLAY -->
    <div class="rs-rental-image-overlay"></div>

<!-- FAVORITE HEART -->

<button
    class="rs-favorite-btn"
    onclick="rsToggleFavorite(event, '${car.vehicle_name}')"
>

    <span class="rs-favorite-icon">
        ♡
    </span>

</button>


    <!-- BADGE -->
<div class="rs-rental-modern-badge">
    ${isPremium ? "🧠 VERIFIED" : (car.badge || "PREMIUM")}
</div>


    <!-- QUICK SPECS OVERLAY (NEW) -->
    <div class="rs-rental-spec-overlay">

    <span>👥 ${seats}</span>
    <span>⚙️ ${transmission}</span>
    <span>⛽ ${fuel}</span>

    ${hasAC ? `<span>❄️ AC</span>` : ""}

</div>

    <!-- COMPARE -->

<label class="rs-compare-check">

    <input
        type="checkbox"
        onchange='rsToggleCompare(${JSON.stringify(car)})'
    >

    <span>

        Compare

    </span>

</label>

</div>



    <!-- BODY -->

    <div class="rs-rental-modern-body">

        <!-- TOP -->


        
        <div class="rs-rental-title-row">

    <div>
        <h3 class="rs-rental-modern-title">
            ${car.vehicle_name}
        </h3>

        <div class="rs-rental-modern-sub">
            🚘 ${car.category}
        </div>
    </div>

</div>

<!-- PRICE ROW (NEW 2026 UX) -->

<div class="rs-rental-price-row-modern">

<div class="rs-price-pill-2026" data-price="${numericPrice}">
    
    <span class="rs-price-label">Starting from</span>

    <span class="rs-price-value">₹0</span>

    <span class="rs-price-unit">${priceUnit}</span>

</div>

    <div class="rs-rating-pill-modern">
        ⭐ 4.9
    </div>

</div>

<!-- OFFER COUNTDOWN -->

${car.offer_ends ? `

<div class="rs-offer-countdown">


<div
    class="rs-offer-timer"
    data-offer-end="${car.offer_ends}"
    data-category="${car.category}"
    data-slots="${car.slots_left}"
>
    Loading Offer...
</div>

</div>

` : ""}

<div class="rs-live-feed">

    <span class="rs-live-dot"></span>

    <span class="rs-live-text">
        ${liveFeed}
    </span>

</div>

        <!-- FEATURES -->

        <div class="rs-rental-feature-box">

            ✨ ${car.features || "Premium travel experience"}

        </div>

                   <!-- STATUS -->

<!-- =====================================
AI AVAILABILITY
===================================== -->

<div class="rs-ai-availability-wrap">

    <!-- DOT -->

    <span class="
        rs-live-dot
        ${rsAvailabilityClass}
    "></span>

    <!-- CONTENT -->

    <div class="rs-ai-availability-content">

        <!-- TITLE -->

        <div class="rs-ai-availability-title">

            ${rsAvailabilityTitle}

        </div>

        <!-- SUB -->

        <div class="rs-ai-availability-sub">

            ${rsAvailabilitySub}

        </div>

    </div>

</div>

        <!-- FOOTER -->

        <div class="rs-rental-modern-footer">

 

            <!-- BUTTONS -->

<!-- FLOATING ACTION BAR -->

<div class="rs-floating-action-bar">

    <!-- WHATSAPP -->

    <button
    class="
        rs-action-btn
        rs-action-wa
    "
    data-title="Quick Vehicle Inquiry"
    onclick='rsQuickInquiry(${JSON.stringify(car)})'
>

    <span class="rs-btn-icon">
        💬
    </span>

    <span class="rs-btn-text">
        Enquire
    </span>

</button>

    <!-- QUICK BOOK -->

    <button
        class="
            rs-action-btn
            rs-action-book
        "
        data-title="Instant Quick Booking"
        onclick='rsrOpenBookingPopup(${JSON.stringify(car)})'
    >

        <span class="rs-btn-icon">

            ⚡

        </span>

        <span class="rs-btn-text">

            Book

        </span>

    </button>

    <!-- DETAILS -->

    <button
        class="
            rs-action-btn
            rs-action-view
        "
        data-title="View Rental Details"
        onclick='rsOpenRentalModal(${JSON.stringify(car)})'
    >

        <span class="rs-btn-icon">

            👁

        </span>

        <span class="rs-btn-text">

            Details 

        </span>

    </button>

</div>

        </div>

    </div>

</div>

</div>

`;

    });

    /* =========================================
    END HTML
    ========================================= */

    html += `

        </div>

        <div class="swiper-pagination"></div>

    </div>

</div>

`;

    container.innerHTML = html;

    /* =========================================
    RESTORE FAVORITES
    ========================================= */

    setTimeout(() => {

        document
            .querySelectorAll(".rs-favorite-btn")
            .forEach(btn => {

                const onclick =
                    btn.getAttribute("onclick");

                const match =
                    onclick.match(/'([^']+)'/);

                if (!match) return;

                const vehicleName =
                    match[1];

                if (
                    window.rsFavorites.includes(
                        vehicleName
                    )
                ) {

                    btn.classList.add("active");

                    const icon =
                        btn.querySelector(
                            ".rs-favorite-icon"
                        );

                    if (icon) {
                        icon.innerHTML = "♥";
                    }

                }

            });

    }, 50);

    /* =========================================
    DESTROY OLD
    ========================================= */

    if (window.rsRentalSwiper) {

        window.rsRentalSwiper.destroy(
            true,
            true
        );

    }

    /* =========================================
    INIT SWIPER
    ========================================= */

    window.rsRentalSwiper =
        new Swiper(".rsRentalSwiper", {

            slidesPerView: 1.15,

            spaceBetween: 18,

            loop: true,

            speed: 800,

            grabCursor: true,

            centeredSlides: false,

            autoplay: {

                delay: 3500,
                disableOnInteraction: false

            },

            pagination: {

                el: ".swiper-pagination",
                clickable: true

            },

            navigation: {

                nextEl:
                    ".rs-rental-swiper-next",

                prevEl:
                    ".rs-rental-swiper-prev"

            },

            breakpoints: {

                0: {
                    slidesPerView: 1.08
                },

                640: {
                    slidesPerView: 1.4
                },

                768: {
                    slidesPerView: 2
                },

                1200: {
                    slidesPerView: 3
                }

            }

        });

    requestAnimationFrame(() => {

        setTimeout(() => {

            /* PRICE COUNTER */

            animatePriceCounters();

            /* LIVE OFFER COUNTDOWN */

            startOfferCountdowns();

            /* LIVE FEED */

            startLiveFeedRotation();

        }, 300);

    });

}



function renderRentalSkeleton(count = 6) {

    const container = document.getElementById("rsRentalContainer");

    let html = `<div class="rs-skeleton-wrapper">`;

    for (let i = 0; i < count; i++) {
        html += `
        <div class="rs-skeleton-card">

            <!-- IMAGE -->
            <div class="rs-skeleton-image"></div>

            <!-- TITLE -->
            <div class="rs-skeleton-line rs-w-70"></div>

            <!-- SUB -->
            <div class="rs-skeleton-line rs-w-50"></div>

            <!-- PRICE -->
            <div class="rs-skeleton-pill"></div>

            <!-- BUTTONS -->
            <div class="rs-skeleton-buttons">
                <div></div>
                <div></div>
                <div></div>
            </div>

        </div>
        `;
    }

    html += `</div>`;

    container.innerHTML = html;
}

function startLiveFeedRotation() {

    setInterval(() => {

        document.querySelectorAll(".rs-live-text").forEach(el => {
            el.textContent = generateLiveFeed({});
        });

    }, 5000);
}

function generateLiveFeed(car) {

    const names = ["Rahul", "Amit", "Kiran", "Vikram", "Suresh", "Anjali", "Priya", "John"];

    const cities = ["Chennai", "Bangalore", "Mumbai", "Delhi", "Hyderabad"];

    const actions = [
        "booked this car",
        "viewed this car",
        "just completed a trip",
        "booked a ride",
        "checked availability"
    ];

    const name = names[Math.floor(Math.random() * names.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];

    // weighted logic for realism
    if (Math.random() > 0.6) {
        return `🚗 ${name} ${action} 2 mins ago`;
    }

    if (Math.random() > 0.4) {
        return `👀 Family from ${city} viewed this car`;
    }

    return `✈️ Airport trip booked recently`;
}

function startOfferCountdowns() {

    const timers =
        document.querySelectorAll(
            ".rs-offer-timer"
        );

    console.log(
        "Offer timers found:",
        timers.length
    );

    timers.forEach(timer => {

        const offerEnd =
            timer.dataset.offerEnd;

        const category =
            (
                timer.dataset.category || ""
            ).toLowerCase();

        const slots =
            parseInt(
                timer.dataset.slots || 0
            );

        if (!offerEnd) return;

        /* =====================================
        AI OFFER MESSAGES
        ===================================== */

        let offerMessages = [

            "🔥 Weekend Offer Ends in",

            "⚡ Airport Discount Ends in",

            "🏖 Family Saver Ends in",

            "👑 Luxury Upgrade Ends in",

            "🚖 Chennai Special Ends in"

        ];

        /* =====================================
        CATEGORY BASED SMART TEXT
        ===================================== */

        if (
            category.includes("luxury")
        ) {

            offerMessages.unshift(
                "💎 Luxury Exclusive Ends in"
            );
        }

        if (
            category.includes("suv")
        ) {

            offerMessages.unshift(
                "🚙 SUV Weekend Offer Ends in"
            );
        }

        if (
            category.includes("sedan")
        ) {

            offerMessages.unshift(
                "✨ Sedan Deal Ends in"
            );
        }

        if (
            category.includes("van")
        ) {

            offerMessages.unshift(
                "🚌 Group Trip Offer Ends in"
            );
        }

        /* =====================================
        HIGH DEMAND
        ===================================== */

        if (slots <= 2) {

            offerMessages.unshift(
                "🔥 Almost Sold Out Ends in"
            );
        }

        /* =====================================
        ROTATION STATE
        ===================================== */

        let currentMessage = 0;

        let lastRotation =
            Date.now();

        /* =====================================
        UPDATE TIMER
        ===================================== */

        function updateTimer() {

            const end =
                new Date(offerEnd).getTime();

            const now =
                new Date().getTime();

            const distance =
                end - now;

            /* EXPIRED */

            if (distance <= 0) {

                timer.innerHTML =
                    "❌ Offer Expired";

                return;
            }

            /* =====================================
            HOURS LEFT
            ===================================== */

            const hoursLeft =
                distance / (1000 * 60 * 60);

            /* =====================================
            DYNAMIC UI COLORS
            ===================================== */

            const countdownWrap =
                timer.closest(
                    ".rs-offer-countdown"
                );

            if (countdownWrap) {

                countdownWrap.classList.remove(
                    "rs-offer-green",
                    "rs-offer-yellow",
                    "rs-offer-red",
                    "rs-offer-critical"
                );

            }

            /* =====================================
            AI ROTATION SPEED
            ===================================== */

            let rotationSpeed = 8000;

            /* CRITICAL */

            if (hoursLeft <= 1) {

                countdownWrap?.classList.add(
                    "rs-offer-red",
                    "rs-offer-critical"
                );

                rotationSpeed = 10000;

            }

            /* HIGH */

            else if (hoursLeft <= 3) {

                countdownWrap?.classList.add(
                    "rs-offer-red"
                );

                rotationSpeed = 9000;

            }

            /* MEDIUM */

            else if (hoursLeft <= 12) {

                countdownWrap?.classList.add(
                    "rs-offer-yellow"
                );

                rotationSpeed = 7000;

            }

            /* SAFE */

            else {

                countdownWrap?.classList.add(
                    "rs-offer-green"
                );

                rotationSpeed = 6000;
            }

            /* =====================================
            ROTATE MESSAGE
            ===================================== */

            if (
                Date.now() - lastRotation >
                rotationSpeed
            ) {

                currentMessage++;

                if (
                    currentMessage >=
                    offerMessages.length
                ) {

                    currentMessage = 0;
                }

                lastRotation =
                    Date.now();
            }

            /* =====================================
            TIME
            ===================================== */

            const hours =
                String(
                    Math.floor(
                        distance /
                        (1000 * 60 * 60)
                    )
                ).padStart(2, "0");

            const minutes =
                String(
                    Math.floor(
                        (
                            distance %
                            (1000 * 60 * 60)
                        ) /
                        (1000 * 60)
                    )
                ).padStart(2, "0");

            const seconds =
                String(
                    Math.floor(
                        (
                            distance %
                            (1000 * 60)
                        ) / 1000
                    )
                ).padStart(2, "0");

            /* =====================================
            ICON ENGINE
            ===================================== */

            let icon = "⏰";

            if (hoursLeft <= 1) {

                icon = "🚨";

            } else if (hoursLeft <= 3) {

                icon = "🔥";

            } else if (hoursLeft <= 12) {

                icon = "⚡";

            }

            /* =====================================
            FINAL UI
            ===================================== */

            timer.innerHTML = `

<span class="rs-offer-text">
    ${icon} ${offerMessages[currentMessage]}
</span>

<span class="rs-offer-time">
    ${hours}:${minutes}:${seconds}
</span>

`;
        }

        /* INITIAL */

        updateTimer();

        /* LIVE */

        setInterval(
            updateTimer,
            1000
        );
    });
}

function animatePriceCounters() {

    const priceElements = document.querySelectorAll(".rs-price-pill-2026");

    priceElements.forEach(el => {

        const target = parseInt(el.dataset.price || "0", 10);
        const valueEl = el.querySelector(".rs-price-value");

        let current = 0;

        const steps = 30;
        const increment = target / steps;

        const interval = setInterval(() => {

            current += increment;

            if (current >= target) {
                current = target;
                clearInterval(interval);
            }

            valueEl.textContent = `₹${Math.floor(current)}`;

        }, 25);
    });
}



/* =========================================
TOGGLE FAVORITE
========================================= */

function rsToggleFavorite(event, vehicleName) {

    event.stopPropagation();

    const btn =
        event.currentTarget;

    const icon =
        btn.querySelector(
            ".rs-favorite-icon"
        );

    const exists =
        window.rsFavorites.includes(
            vehicleName
        );

    /* REMOVE */

    if (exists) {

        window.rsFavorites =
            window.rsFavorites.filter(
                item => item !== vehicleName
            );

        btn.classList.remove("active");

        icon.innerHTML = "♡";
    }

    /* ADD */

    else {

        window.rsFavorites.push(
            vehicleName
        );

        btn.classList.add("active");

        icon.innerHTML = "♥";
    }

    /* SAVE */

    localStorage.setItem(
        "rsFavorites",
        JSON.stringify(window.rsFavorites)
    );

}

window.rsSelectedRental = null;

function rsGetRentalAIRecommendation(car) {

    const category =
        (car.category || "").toLowerCase();

    if (category.includes("luxury")) {
        return "👑 Executive Luxury Choice";
    }

    if (category.includes("suv")) {
        return "🏔 Perfect For Outstation Trips";
    }

    if (category.includes("sedan")) {
        return "✈️ Best For Airport Transfers";
    }

    if (category.includes("muv")) {
        return "👨‍👩‍👧 Ideal For Family Travel";
    }

    if (category.includes("van")) {
        return "🚌 Best For Group Tours";
    }

    return "🚘 Premium Travel Experience";
}

function rsGetRentalTheme(car) {

    const category =
        (car.category || "").toLowerCase();

    if (category.includes("luxury")) {

        return {
            icon: "👑",
            title: "Luxury Executive Ride",
            score: 99
        };
    }

    if (category.includes("suv")) {

        return {
            icon: "🚙",
            title: "Perfect For Road Trips",
            score: 96
        };
    }

    if (category.includes("sedan")) {

        return {
            icon: "✈️",
            title: "Airport Transfer Specialist",
            score: 95
        };
    }

    if (category.includes("muv")) {

        return {
            icon: "👨‍👩‍👧",
            title: "Family Travel Choice",
            score: 94
        };
    }

    return {
        icon: "🚖",
        title: "Premium Rental Experience",
        score: 92
    };
}

/* =========================================
SMART VEHICLE HIGHLIGHTS
========================================= */

function rsGenerateVehicleHighlights(car) {

    const highlights = [];

    const category =
        (car.category || "")
            .toLowerCase();

    const fuel =
        (car.fuel || "")
            .toLowerCase();

    const transmission =
        (car.transmission || "")
            .toLowerCase();

    const features =
        (car.features || "")
            .toLowerCase();

    /* CATEGORY */

    if (category.includes("luxury")) {

        highlights.push(
            "👑 Executive Luxury Experience"
        );

        highlights.push(
            "💼 Preferred For Business Travel"
        );
    }

    if (category.includes("suv")) {

        highlights.push(
            "🏔 Excellent For Outstation Trips"
        );

        highlights.push(
            "🧳 Large Luggage Capacity"
        );
    }

    if (category.includes("sedan")) {

        highlights.push(
            "✈️ Perfect For Airport Transfers"
        );

        highlights.push(
            "🛋 Smooth City Ride Comfort"
        );
    }

    if (category.includes("muv")) {

        highlights.push(
            "👨‍👩‍👧 Ideal For Family Trips"
        );
    }

    if (category.includes("van")) {

        highlights.push(
            "🚌 Great For Group Travel"
        );
    }

    /* FEATURES */

    if (features.includes("sunroof")) {

        highlights.push(
            "☀️ Premium Sunroof Experience"
        );
    }

    if (features.includes("gps")) {

        highlights.push(
            "📍 Smart GPS Navigation"
        );
    }

    if (features.includes("premium")) {

        highlights.push(
            "✨ Premium Interior Finish"
        );
    }

    if (features.includes("reverse")) {

        highlights.push(
            "📷 Reverse Camera Assistance"
        );
    }

    /* TRANSMISSION */

    if (transmission.includes("automatic")) {

        highlights.push(
            "⚙️ Stress Free Automatic Drive"
        );
    }

    /* FUEL */

    if (fuel.includes("cng")) {

        highlights.push(
            "⛽ Fuel Efficient Travel"
        );
    }

    /* LIMIT */

    return highlights.slice(0, 6);
}

function rsOpenRentalModal(car) {

    window.selectedCar = car;

    /* =========================================
    RECENTLY VIEWED
    ========================================= */

    window.rsRecentlyViewed =
        window.rsRecentlyViewed.filter(
            item =>
                item.car.vehicle_name !==
                car.vehicle_name
        );

    window.rsRecentlyViewed.unshift({

        car: car,

        viewedAt: Date.now()

    });

    window.rsRecentlyViewed =
        window.rsRecentlyViewed.slice(0, 10);

    localStorage.setItem(
        "rsRecentlyViewed",
        JSON.stringify(
            window.rsRecentlyViewed
        )
    );

    rsRenderRecentlyViewed();

    /* =========================================
    SELECTED
    ========================================= */

    window.rsSelectedRental = car;

    document
        .getElementById(
            "rsRentalStickyBar"
        )
        .classList.remove(
            "rsr-sticky-hide"
        );

    const modal =
        document.getElementById(
            "rsRentalPackageModal"
        );

    modal.classList.add("active");

    rsRenderDemandTrend(car);


    /* =========================================
    HERO IMAGE
    ========================================= */

    document.getElementById(
        "rsRentalModalImage"
    ).src = car.image;

    /* =========================================
    SMART VEHICLE ICON
    ========================================= */

    let titleIcon = "🚘";

    const category =
        (car.category || "")
            .toLowerCase();

    if (
        category.includes("sedan")
    ) {

        titleIcon = "🚗";
    }

    else if (
        category.includes("suv")
    ) {

        titleIcon = "🚙";
    }

    else if (
        category.includes("luxury")
    ) {

        titleIcon = "🏎️";
    }

    else if (
        category.includes("tempo")
        ||
        category.includes("traveller")
        ||
        category.includes("van")
    ) {

        titleIcon = "🚐";
    }

    else if (
        category.includes("muv")
    ) {

        titleIcon = "🚘";
    }

    /* =========================================
    TITLE
    ========================================= */

    document.getElementById(
        "rsRentalModalTitle"
    ).innerHTML = `

<div class="rsr-modal-badge">

    ✨ ${car.badge || "Premium Ride"}

</div>

<div class="rsr-modal-title-main">

    <span class="rsr-title-icon">

        ${titleIcon}

    </span>

    <span>

        ${car.vehicle_name}

    </span>

</div>

`;

    /* =========================================
    RATING
    ========================================= */

    const rating =
        car.rating ||

        (
            (
                Math.random() * 1
            ) + 4
        ).toFixed(1);

    /* =========================================
    META
    ========================================= */

    document.getElementById(
        "rsRentalModalMeta"
    ).innerHTML = `

<div class="rsr-modal-meta-item">

    🚘 ${car.category}

</div>

<div class="rsr-modal-meta-dot"></div>

<div class="rsr-modal-meta-item rsr-rating">

    ⭐ ${rating}

</div>

<div class="rsr-modal-meta-dot"></div>

<div class="rsr-modal-meta-item">

    👥 ${car.seats} Seats

</div>

<div class="rsr-modal-meta-dot"></div>

<div class="rsr-modal-meta-item">

    ⚙️ ${car.transmission}

</div>

<div class="rsr-modal-meta-dot"></div>

<div class="rsr-modal-meta-item">

    ⛽ ${car.fuel}

</div>

`;

    /* =========================================
    FEATURES
    ========================================= */

    const features =
        (car.features || "")
            .split("|")
            .map(item => item.trim());

    let featureHTML = "";

    features.forEach(feature => {

        featureHTML += `

<div class="rsr-feature-pill">

    ✨ ${feature}

</div>

`;

    });

    /* =========================================
    VEHICLE HIGHLIGHTS
    ========================================= */

    const vehicleHighlights =
        rsGenerateVehicleHighlights(car);

    let highlightsHTML = "";

    vehicleHighlights.forEach((item, index) => {

        const highlightColors = [

            "rsr-highlight-blue",

            "rsr-highlight-green",

            "rsr-highlight-orange",

            "rsr-highlight-purple",

            "rsr-highlight-pink",

            "rsr-highlight-dark"

        ];

        const colorClass =
            highlightColors[
            index % highlightColors.length
            ];

        highlightsHTML += `

<div class="rsr-highlight-pill ${colorClass}">

    ${item}

</div>

`;

    });

    /* =========================================
    EXPERIENCE OVERVIEW
    ========================================= */

    document.getElementById(
        "rsRentalModalDesc"
    ).innerHTML = `

<!-- =========================================
SMART VEHICLE HIGHLIGHTS
========================================= -->

<div class="rsr-overview-card">

    <!-- TOP -->

    <div class="rsr-overview-top">

        <div class="rsr-overview-icon">

            🚘

        </div>

        <div>

            <div class="rsr-overview-title">

                Premium Mobility Experience

            </div>

            <div class="rsr-overview-sub">

                Verified Vehicle • Smart Travel Ready • Premium Comfort

            </div>

        </div>

    </div>



<div class="rsr-chip-wrap">

    <div class="rsr-chip rsr-chip-hot">

        🔥 ${car.slots_left} Left

    </div>

    <div class="rsr-chip rsr-chip-premium">

        ✨ ${car.badge}

    </div>

    <div class="rsr-chip rsr-chip-status">

        🚘 ${car.availability}

    </div>

    <div class="rsr-chip rsr-chip-drive">

        ⚙️ ${car.transmission}

    </div>

    <div class="rsr-chip rsr-chip-fuel">

        ⛽ ${car.fuel}

    </div>

    <div class="rsr-chip rsr-chip-seat">

        👥 ${car.seats} Seats

    </div>

</div>


    <!-- FEATURES -->

    <div class="rsr-feature-grid">

        ${featureHTML}

    </div>

</div>

<div class="rsr-highlights-wrap">

    <div class="rsr-section-header">

        <div class="rsr-section-icon">

            🚘

        </div>

        <div class="rsr-section-content">

            <div class="rsr-section-title">

                Smart Vehicle Highlights

            </div>

            <div class="rsr-section-subtitle">

                AI generated comfort & travel insights

            </div>

        </div>

    </div>

    <div class="rsr-highlights-grid">

        ${highlightsHTML}

    </div>

</div>




`;

    /* =========================================
    AI TRAVEL MATCH
    ========================================= */

    const aiScore =
        car.match_score || 95;

    const aiTag =
        car.trip_type
        ||
        `Best For ${car.category} Travelers`;

    /* =========================================
    AI TAGS
    ========================================= */

    let aiTags = [];

    if (car.ai_tags) {

        aiTags =
            car.ai_tags
                .split(",");

    }

    /* FALLBACK */

    else {

        aiTags = [

            "🔥 Trending",
            "✨ Smart Choice",
            "🚘 AI Verified"

        ];

    }

    /* HTML */

    let aiTagsHTML = "";

    aiTags.forEach(tag => {

        aiTagsHTML += `

<span>

    ${tag.trim()}

</span>

`;

    });

    /* =========================================
    RENDER
    ========================================= */

    document.getElementById(
        "rsRentalAIMatchWrap"
    ).innerHTML = `

<div class="rsr-ai-wrapper">

    <!-- HEADING -->

    <div class="rsr-section-heading">

        <span class="rsr-section-heading-icon">

            🧠

        </span>

        <span>

            AI Travel Match

        </span>

    </div>

    <!-- CARD -->

    <div class="rsr-ai-match-card">

        <div class="rsr-ai-glow"></div>

        <!-- LEFT -->

        <div class="rsr-ai-left">

            <div class="rsr-ai-ring">

                <div class="rsr-ai-ring-inner">

                    ${aiScore}

                    <span>%</span>

                </div>

            </div>

        </div>

        <!-- RIGHT -->

        <div class="rsr-ai-right">

            <div class="rsr-ai-title">

                AI Recommended Trip Type

            </div>

            <div class="rsr-ai-sub">

                ${aiTag}

            </div>

            <!-- TAGS -->

            <div class="rsr-ai-tags">

                ${aiTagsHTML}

            </div>

        </div>

    </div>

</div>

`;



    /* =========================================
    AVAILABILITY PERCENTAGE
    ========================================= */

    const availabilityPercent =
        parseInt(
            car.availability_percentage
        ) || 0;

    /* =========================================
    COLOR LOGIC
    ========================================= */

    let availabilityBarClass =
        "rsr-bar-green";

    let availabilityBadgeClass =
        "rsr-badge-green";

    /* LOW */

    if (availabilityPercent <= 30) {

        availabilityBarClass =
            "rsr-bar-red";

        availabilityBadgeClass =
            "rsr-badge-red";

    }

    /* MEDIUM */

    else if (availabilityPercent <= 60) {

        availabilityBarClass =
            "rsr-bar-orange";

        availabilityBadgeClass =
            "rsr-badge-orange";

    }

    /* GOOD */

    else if (availabilityPercent <= 80) {

        availabilityBarClass =
            "rsr-bar-blue";

        availabilityBadgeClass =
            "rsr-badge-blue";

    }

    /* HIGH */

    else {

        availabilityBarClass =
            "rsr-bar-green";

        availabilityBadgeClass =
            "rsr-badge-green";

    }

    /* =========================================
    RENDER AVAILABILITY METER
    ========================================= */

    document.getElementById(
        "rsRentalAvailabilityMeter"
    ).innerHTML = `

<div class="rsr-availability-card">

    <!-- HEADER -->

    <div class="rsr-availability-heading">

        <div class="rsr-availability-icon">

            📊

        </div>

        <div>

            <div class="rsr-availability-heading-title">

                Live Availability Meter

            </div>

            <div class="rsr-availability-heading-sub">

                Real-time booking availability updates

            </div>

        </div>

    </div>

    <!-- TOP -->

    <div class="rsr-availability-top">

        <div class="rsr-availability-title">

            Vehicle Availability

        </div>

        <div class="
            rsr-availability-percent
            ${availabilityBadgeClass}
        ">

            ${availabilityPercent}%

        </div>

    </div>

    <!-- BAR -->

    <div class="rsr-availability-bar">

        <div 
            class="
                rsr-availability-fill
                ${availabilityBarClass}
            "
            style="
                width:${availabilityPercent}%
            "
        ></div>

    </div>

    <!-- SUB -->

    <div class="rsr-availability-sub">

        Availability changes dynamically based on recent booking activity

    </div>

</div>

`;

    /* =====================================
    RENTAL LIVE FEED
    ===================================== */

    const rentalFeed = [

        "SUV booked from Chennai Airport",
        "Luxury Sedan reserved just now",
        "Traveler added Driver Assistance",
        "Weekend package booked recently",
        "Airport pickup confirmed",
        "Customer upgraded to Premium SUV",
        "Innova package booked today",
        "Last 3 self-drive cars remaining"

    ];

    let rentalFeedHTML = "";

    /* FIRST 4 */

    rentalFeed
        .slice(0, 4)
        .forEach(item => {

            rentalFeedHTML += `
    
    <div class="rs-rental-feed-card">

        <div class="rs-rental-feed-left">

            🚘

        </div>

        <div class="rs-rental-feed-content">

            <div class="rs-rental-feed-title">

                ${item}

            </div>

            <div class="rs-rental-feed-sub">

                Few minutes ago

            </div>

        </div>

        <div class="rs-rental-feed-live">

            <span class="rs-rental-feed-dot"></span>

            LIVE

        </div>

    </div>

    `;

        });

    document.getElementById(
        "rsRentalLiveFeed"
    ).innerHTML = rentalFeedHTML;


    /* =====================================
    AUTO ROTATE
    ===================================== */

    setInterval(() => {

        const randomRentalFeed = [

            "Luxury SUV booked just now",
            "2 travelers viewing rental package",
            "Airport transfer added",
            "Self-drive car reserved",
            "Weekend slots filling fast",
            "Premium package upgraded",
            "Customer selected Chauffeur Service",
            "New booking confirmed from Bangalore"

        ];

        const randomText =
            randomRentalFeed[
            Math.floor(
                Math.random()
                *
                randomRentalFeed.length
            )
            ];

        const wrap =
            document.getElementById(
                "rsRentalLiveFeed"
            );

        if (!wrap) return;

        const card =
            document.createElement("div");

        card.className =
            "rs-rental-feed-card rs-rental-feed-animate";

        card.innerHTML = `

        <div class="rs-rental-feed-left">

            🔥

        </div>

        <div class="rs-rental-feed-content">

            <div class="rs-rental-feed-title">

                ${randomText}

            </div>

            <div class="rs-rental-feed-sub">

                Just now

            </div>

        </div>

        <div class="rs-rental-feed-live">

            <span class="rs-rental-feed-dot"></span>

            LIVE

        </div>

    `;

        /* INSERT ONLY INSIDE FEED */

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

    /* =========================================
    RENTAL GALLERY
    ========================================= */

    let galleryHTML = "";

    /* =========================================
    STORE GALLERY IMAGES
    ========================================= */

    window.rsrGalleryImages = [];

    /* IF GALLERY EXISTS */

    if (
        car.gallery
        &&
        car.gallery.trim() !== ""
    ) {

        window.rsrGalleryImages =
            car.gallery
                .split(",");

    }

    /* FALLBACK TO MAIN IMAGE */

    else {

        window.rsrGalleryImages = [
            car.image
        ];

    }

    /* =========================================
    RENDER GALLERY
    ========================================= */

    window.rsrGalleryImages
        .forEach((img, index) => {

            galleryHTML += `

    <img
        src="${img.trim()}"
        class="rsr-gallery-image"
        onclick="rsrOpenFullscreenGallery(${index})"
    >

    `;

        });

    /* =========================================
    INSERT HTML
    ========================================= */

    document.getElementById(
        "rsRentalGallery"
    ).innerHTML = `

<div class="rsx-heading">

    📸 Vehicle Gallery

</div>

<div class="rsr-gallery-grid">

    ${galleryHTML}

</div>

`;


    /* =========================================
    WHY TRAVELERS CHOOSE THIS VEHICLE
    ========================================= */

    let whyChooseHTML = "";

    /* GET FROM SHEET */

    let whyChooseItems = [];

    if (car.why_choose) {

        whyChooseItems =
            car.why_choose
                .split(",");

    }

    /* ICONS */

    const whyIcons = [

        "✨",
        "🚘",
        "⚡",
        "🛣️",
        "💼",
        "🧳",
        "👨‍👩‍👧‍👦",
        "🔥"

    ];

    /* BUILD */

    whyChooseItems.forEach((item, index) => {

        whyChooseHTML += `

<div class="rsr-why-card rsr-why-color-${index % 6}">

    <div class="rsr-why-icon">

        ${whyIcons[index % whyIcons.length]}

    </div>

    <div class="rsr-why-title">

        ${item.trim()}

    </div>

</div>

`;

    });

    /* RENDER */

    document.getElementById(
        "rsRentalWhyChoose"
    ).innerHTML = `

<div class="rsr-why-wrapper">

    <div class="rsr-why-heading">

        ❤️ Why Travelers Choose This Vehicle

    </div>

    <div class="rsr-why-grid">

        ${whyChooseHTML}

    </div>

</div>

`;

    /* =========================================
    PREMIUM STICKY PRICE
    ========================================= */

    const actualPrice =
        parseInt(
            String(car.price)
                .replace(/[^\d]/g, "")
        ) || 0;

    const oldPrice =
        actualPrice + 4;

    const savings =
        oldPrice - actualPrice;

    const viewers =
        Math.floor(
            Math.random() * 18
        ) + 10;

    const slots =
        parseInt(
            car.slots_left || 3
        );

    let urgencyClass =
        "rsr-pill-green";

    if (slots <= 5) {

        urgencyClass =
            "rsr-pill-orange";
    }

    if (slots <= 2) {

        urgencyClass =
            "rsr-pill-red";
    }

    console.log(car.offer_ends);

    /* =========================================
    SMART COUNTDOWN
    ========================================= */

    let countdownHTML = "";

    if (
        car.offer_ends &&
        !isNaN(
            new Date(car.offer_ends)
        )
    ) {

        const endDate =
            new Date(car.offer_ends);

        const now =
            new Date();

        const diff =
            endDate.getTime()
            -
            now.getTime();

        /* =====================================
        EXPIRED
        ===================================== */

        if (diff <= 0) {

            countdownHTML = `

<div class="rsr-info-pill rsr-pill-expired">

    ❌ Offer Expired

</div>

`;

        }

        else {

            const days =
                Math.floor(
                    diff / (1000 * 60 * 60 * 24)
                );

            const hours =
                Math.floor(
                    (
                        diff / (1000 * 60 * 60)
                    ) % 24
                );

            const minutes =
                Math.floor(
                    (
                        diff / (1000 * 60)
                    ) % 60
                );

            /* =====================================
            COLOR SYSTEM
            ===================================== */

            let timerClass =
                "rsr-pill-green";

            let timerIcon =
                "🟢";

            /* LESS THAN 24 HOURS */

            if (diff <= 86400000) {

                timerClass =
                    "rsr-pill-red";

                timerIcon =
                    "🔥";

            }

            /* LESS THAN 3 DAYS */

            else if (diff <= 259200000) {

                timerClass =
                    "rsr-pill-orange";

                timerIcon =
                    "⚠️";

            }

            /* LESS THAN 7 DAYS */

            else if (diff <= 604800000) {

                timerClass =
                    "rsr-pill-yellow";

                timerIcon =
                    "⏰";

            }

            countdownHTML = `

<div class="rsr-info-pill ${timerClass}">

    ${timerIcon}
    Ends in ${days}d ${hours}h ${minutes}m

</div>

`;

        }

    }

    /* =========================================
    STICKY PRICE RENDER
    ========================================= */

    document.getElementById(
        "rsRentalStickyPrice"
    ).innerHTML = `

<div class="rsr-price-box">

    <div class="rsr-price-top">

        <div class="rsr-save-badge">

            SAVE ₹${savings}

        </div>

        <div class="rsr-old-price">

            ₹${oldPrice}/km

        </div>

    </div>

    <div class="rsr-new-price">

        ${car.price}

    </div>

    <div class="rsr-price-sub">

        <div class="rsr-info-pill ${urgencyClass}">

            🔥 Only ${slots} Left

        </div>

        <div class="rsr-info-pill rsr-pill-blue">

            👀 ${viewers} viewing now

        </div>

        ${countdownHTML}

    </div>

</div>

`;

    /* =========================================
    WHATSAPP BUTTON
    ========================================= */

    const stickyBtn =
        document.getElementById("rsRentalStickyWhatsapp");

    if (stickyBtn) {

        stickyBtn.onclick = function () {

            rsrOpenBookingPopup(window.selectedCar);

        };

    } else {

        console.error("Sticky button missing");

    }

}

/* =====================================
RENTAL FULLSCREEN GALLERY
===================================== */

window.rsrGalleryIndex = 0;

/* OPEN */

function rsrOpenFullscreenGallery(index) {

    window.rsrGalleryIndex =
        index;

    const modal =
        document.getElementById(
            "rsrFullscreenGallery"
        );

    modal.classList.add(
        "active"
    );

    rsrRenderFullscreenImage();


}

function rsRenderDemandTrend(car) {

    /* =========================
    CLEAN WRAP
    ========================= */

    const wrap = document.getElementById("rsRentalDemandTrend");
    if (!wrap || !car) return;

    /* =========================
    CLEAN DATA
    ========================= */

    const city = car.city || "City";

    const slotsLeft = parseInt(car.slots_left) || 0;

    const category = (car.category || "").toLowerCase();

    const bookings = parseInt(car.bookings_today) || 0;

    let views = parseInt(car.viewers_today);

    /* =========================
AI DEMAND ENGINE
========================= */

    const demandAI = rsGetDemandLevel(car);

    if (isNaN(views)) {
        views = Math.floor(Math.random() * 20) + 10;
    }

    const isWeekend = [0, 6].includes(new Date().getDay());

    const hour = new Date().getHours();

    /* =========================
    INSIGHT POOL (ROTATION)
    ========================= */

    const insights = [
        "✨ Luxury rides trending in your city",
        "🛣️ SUV demand increasing this weekend",
        "👨‍👩‍👧 Group travel bookings rising",
        "✈️ Airport trips are most booked today",
        "⚡ Evening demand is increasing fast",
        "🔥 High activity on premium vehicles"
    ];

    let insightIndex = 0;

    /* =========================
    URGENCY (STATIC LOGIC)
    ========================= */

    let urgencyText = "";

    if (slotsLeft <= 1) {
        urgencyText = `🔥 Only 1 vehicle left in ${city}`;
    } else if (slotsLeft <= 3) {
        urgencyText = `⚡ Limited availability in ${city}`;
    } else if (isWeekend && category.includes("suv")) {
        urgencyText = `🛣️ High SUV demand this weekend in ${city}`;
    } else {
        urgencyText = `🚘 Vehicles available in ${city}`;
    }

    /* =========================
    INITIAL RENDER
    ========================= */

    wrap.innerHTML = `

<div class="rsr-demand-card rsr-live-animate ${demandAI.colorClass}">

    <div class="rsr-demand-icon">📊</div>

    <div class="rsr-demand-content">

        <!-- LINE 1 -->
        <div class="rsr-demand-heading">
            ${demandAI.label}
        </div>

        <!-- LINE 2 -->
        <div class="rsr-demand-title" id="rsInsightLine">
            ${insights[0]}
        </div>

        <!-- LINE 3 -->
        <div class="rsr-demand-sub" id="rsStatsLine">
            ${city} • ${bookings} bookings • ${views} views
        </div>

    </div>

</div>

`;

    /* =========================
    SINGLE INTERVAL ENGINE
    ========================= */

    if (window.rsDemandInterval) {
        clearInterval(window.rsDemandInterval);
    }

    window.rsDemandInterval = setInterval(() => {

        const statsEl = document.getElementById("rsStatsLine");
        const insightEl = document.getElementById("rsInsightLine");

        if (!statsEl || !insightEl) return;

        /* LIVE VIEW SIMULATION */
        views += Math.floor(Math.random() * 2);

        /* UPDATE STATS */
        statsEl.innerHTML =
            `${city} • ${bookings} bookings • ${views} views`;

        /* ROTATE INSIGHT */
        insightIndex = (insightIndex + 1) % insights.length;

        insightEl.innerHTML = insights[insightIndex];

    }, 5000);
}

function rsGetDemandLevel(car) {

    const slots = parseInt(car.slots_left) || 0;
    const bookings = parseInt(car.bookings_today) || 0;
    const views = parseInt(car.viewers_today) || 0;
    const availability = parseInt(car.availability_percentage) || 100;

    const category = (car.category || "").toLowerCase();
    const hour = new Date().getHours();

    let score = 0;

    /* =========================
    SLOT PRESSURE
    ========================= */
    if (slots <= 1) score += 40;
    else if (slots <= 3) score += 30;
    else if (slots <= 5) score += 20;

    /* =========================
    BOOKINGS SIGNAL
    ========================= */
    if (bookings >= 5) score += 30;
    else if (bookings >= 3) score += 20;
    else if (bookings >= 1) score += 10;

    /* =========================
    VIEW TRAFFIC
    ========================= */
    if (views >= 30) score += 20;
    else if (views >= 15) score += 15;
    else if (views >= 5) score += 10;

    /* =========================
    LOW AVAILABILITY
    ========================= */
    if (availability <= 20) score += 25;
    else if (availability <= 40) score += 15;

    /* =========================
    CATEGORY BOOST
    ========================= */
    if (category.includes("suv")) score += 5;
    if (category.includes("luxury")) score += 10;

    /* =========================
    TIME BOOST (evening rush)
    ========================= */
    if (hour >= 18) score += 10;

    /* =========================
    FINAL CLASS MAP
    ========================= */

    if (score >= 80) {
        return {
            level: "critical",
            label: "🔥 Extreme Demand",
            colorClass: "rsr-demand-critical"
        };
    }

    if (score >= 60) {
        return {
            level: "high",
            label: "⚡ High Demand",
            colorClass: "rsr-demand-high"
        };
    }

    if (score >= 40) {
        return {
            level: "medium",
            label: "📊 Moderate Demand",
            colorClass: "rsr-demand-medium"
        };
    }

    if (score >= 20) {
        return {
            level: "low",
            label: "🟢 Normal Demand",
            colorClass: "rsr-demand-low"
        };
    }

    return {
        level: "new",
        label: "🆕 New Listing",
        colorClass: "rsr-demand-new"
    };
}

/* CLOSE */

function rsrCloseFullscreenGallery() {

    document.getElementById(
        "rsrFullscreenGallery"
    ).classList.remove(
        "active"
    );

}

/* RENDER */

function rsrRenderFullscreenImage() {

    const img =
        document.getElementById(
            "rsrFullscreenImage"
        );

    const counter =
        document.getElementById(
            "rsrFullscreenCounter"
        );

    if (
        !window.rsrGalleryImages
        ||
        !window.rsrGalleryImages.length
    ) return;

    img.src =
        window.rsrGalleryImages[
        window.rsrGalleryIndex
        ];

    counter.innerHTML = `

        ${window.rsrGalleryIndex + 1}
        /
        ${window.rsrGalleryImages.length}

    `;

}

/* NEXT */

function rsrNextGalleryImage() {

    window.rsrGalleryIndex++;

    if (
        window.rsrGalleryIndex
        >=
        window.rsrGalleryImages.length
    ) {

        window.rsrGalleryIndex = 0;

    }

    rsrRenderFullscreenImage();

}

/* PREV */

function rsrPrevGalleryImage() {

    window.rsrGalleryIndex--;

    if (
        window.rsrGalleryIndex < 0
    ) {

        window.rsrGalleryIndex =
            window.rsrGalleryImages.length - 1;

    }

    rsrRenderFullscreenImage();

}

/* =========================================
RENTAL STICKY BAR AUTO HIDE
========================================= */

let rsRentalLastScroll = 0;

window.addEventListener(
    "scroll",
    function () {

        const sticky =
            document.getElementById(
                "rsRentalStickyBar"
            );

        if (!sticky) return;

        const modal =
            document.getElementById(
                "rsRentalPackageModal"
            );

        if (
            !modal.classList.contains(
                "active"
            )
        ) return;

        const current =
            window.pageYOffset;

        /* SCROLL DOWN */

        if (
            current > rsRentalLastScroll
            &&
            current > 120
        ) {

            sticky.classList.add(
                "rsr-sticky-hide"
            );

        }

        /* SCROLL UP */

        else {

            sticky.classList.remove(
                "rsr-sticky-hide"
            );

        }

        /* SHRINK */

        if (current > 80) {

            sticky.classList.add(
                "rsr-sticky-small"
            );

        } else {

            sticky.classList.remove(
                "rsr-sticky-small"
            );

        }

        rsRentalLastScroll =
            current <= 0
                ? 0
                : current;

    }
);


function startModalOfferCountdown() {

    const timer =
        document.querySelector(
            ".rsx-modal-offer-timer"
        );

    if (!timer) return;

    const offerEnd =
        timer.dataset.offer;

    function updateTimer() {

        const end =
            new Date(offerEnd).getTime();

        const now =
            new Date().getTime();

        const distance =
            end - now;

        if (distance <= 0) {

            timer.innerHTML =
                "Expired";

            return;
        }

        const hours =
            String(
                Math.floor(
                    distance /
                    (1000 * 60 * 60)
                )
            ).padStart(2, "0");

        const minutes =
            String(
                Math.floor(
                    (
                        distance %
                        (1000 * 60 * 60)
                    ) /
                    (1000 * 60)
                )
            ).padStart(2, "0");

        const seconds =
            String(
                Math.floor(
                    (
                        distance %
                        (1000 * 60)
                    ) / 1000
                )
            ).padStart(2, "0");

        timer.innerHTML =
            `${hours}:${minutes}:${seconds}`;
    }

    updateTimer();

    setInterval(
        updateTimer,
        1000
    );
}


/* =========================================
RENDER RECENTLY VIEWED
========================================= */

function rsRenderRecentlyViewed() {

    const wrap =
        document.getElementById(
            "rsRecentlyViewedWrap"
        );

    const container =
        document.getElementById(
            "rsRecentlyViewed"
        );

    if (
        !wrap ||
        !container
    ) return;

    /* =========================================
    FILTER EXPIRED ITEMS (24 HOURS)
    ========================================= */

    const now = Date.now();

    window.rsRecentlyViewed =
        window.rsRecentlyViewed.filter(item => {

            const age =
                now - item.viewedAt;

            /* KEEP ONLY 24H */

            return age <
                24 * 60 * 60 * 1000;

        });

    /* SAVE CLEAN DATA */

    localStorage.setItem(
        "rsRecentlyViewed",
        JSON.stringify(
            window.rsRecentlyViewed
        )
    );

    /* EMPTY */

    if (
        !window.rsRecentlyViewed.length
    ) {

        wrap.style.display = "none";

        return;

    }

    wrap.style.display = "block";

    let html = "";

    /* =========================================
    LOOP
    ========================================= */

    window.rsRecentlyViewed.forEach(item => {

        const car = item.car;

        html += `

<div
    class="rs-recent-card"
    onclick='rsOpenRentalModal(${JSON.stringify(car)})'
>

    <img
        src="${car.image}"
        alt="${car.vehicle_name}"
    >

    <div class="rs-recent-body">

        <div class="rs-recent-title">

            ${car.vehicle_name}

        </div>

        <div class="rs-recent-sub">

            🚘 ${car.category}
            •
            💰 ${car.price}

        </div>

    </div>

</div>

`;

    });

    container.innerHTML = html;

}


/* =========================================
CLEAR RECENTLY VIEWED
========================================= */

function rsClearRecentlyViewed() {

    /* CLEAR MEMORY */

    window.rsRecentlyViewed = [];

    /* CLEAR STORAGE */

    localStorage.removeItem(
        "rsRecentlyViewed"
    );

    /* HIDE UI */

    rsRenderRecentlyViewed();

}

/* =========================================
SLIDER
========================================= */

function rsSlideRentals(direction) {

    if (!window.rsRentalSwiper)
        return;

    if (direction > 0) {

        window.rsRentalSwiper
            .slideNext();

    }

    else {

        window.rsRentalSwiper
            .slidePrev();

    }

}

/* =========================================
SEARCH
========================================= */

function rsFilterRentals() {

    const search =
        document.getElementById(
            "rsRentalSearch"
        )
            .value
            .toLowerCase();

    let filtered =
        window.rsAllRentals.filter(car => {

            const matchSearch =

                (
                    car.vehicle_name || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                (
                    car.category || ""
                )
                    .toLowerCase()
                    .includes(search);

            const matchCategory =

                window
                    .rsCurrentRentalCategory
                === "all"

                ||

                (
                    car.category || ""
                )
                    .toLowerCase()
                    .includes(
                        window
                            .rsCurrentRentalCategory
                    );

            return (
                matchSearch &&
                matchCategory
            );

        });

    rsRenderRentals(filtered);

}

/* =========================================
CATEGORY
========================================= */

function rsRentalCategory(
    category,
    btn
) {

    window.rsCurrentRentalCategory =
        category;

    document
        .querySelectorAll(
            ".rs-rental-filter-btn"
        )
        .forEach(el => {

            el.classList.remove(
                "active"
            );

        });

    btn.classList.add(
        "active"
    );

    rsFilterRentals();

}

/* =========================================
COMPARE SYSTEM
========================================= */

window.rsCompareCars = [];

/* =========================================
TOGGLE COMPARE
========================================= */

function rsToggleCompare(car) {

    const exists =
        rsCompareCars.find(
            x => x.vehicle_name === car.vehicle_name
        );

    /* REMOVE */

    if (exists) {

        rsCompareCars =
            rsCompareCars.filter(
                x => x.vehicle_name !== car.vehicle_name
            );

    }

    /* ADD */

    else {

        /* MAX 3 */

        if (rsCompareCars.length >= 3) {

            alert(
                "You can compare maximum 3 cars"
            );

            event.target.checked = false;

            return;

        }

        rsCompareCars.push(car);

    }

    rsUpdateCompareBar();

}

/* =========================================
UPDATE BAR
========================================= */

function rsUpdateCompareBar() {

    const bar =
        document.getElementById(
            "rsCompareBar"
        );

    const count =
        bar.querySelector(
            ".rs-compare-count"
        );

    count.innerHTML = `

🚘 ${rsCompareCars.length} Cars Selected

`;

    if (rsCompareCars.length >= 2) {

        bar.classList.add(
            "active"
        );

    }

    else {

        bar.classList.remove(
            "active"
        );

    }

}

/* =========================================
OPEN MODAL
========================================= */

function rsOpenCompareModal() {

    const modal =
        document.getElementById(
            "rsCompareModal"
        );

    modal.classList.add(
        "active"
    );

    let html = `

<table class="rs-compare-table">

<tr>

<th>Feature</th>

`;

    /* HEADER */

    rsCompareCars.forEach(car => {



        html += `

<th>

${car.vehicle_name}

</th>

`;

    });

    html += `

</tr>

`;

    /* FEATURES */

    const features = [

        {
            label: "Seats",
            key: "seats"
        },

        {
            label: "Fuel",
            key: "fuel"
        },

        {
            label: "Transmission",
            key: "transmission"
        },

        {
            label: "Category",
            key: "category"
        },

        {
            label: "Price",
            key: "price"
        },

        {
            label: "Availability",
            key: "availability"
        }

    ];

    features.forEach(item => {

        html += `

<tr>

<td>

${item.label}

</td>

`;

        rsCompareCars.forEach(car => {

            html += `

<td>

${car[item.key] || "-"}

</td>

`;

        });

        html += `

</tr>

`;

    });

    html += `

</table>

`;

    document.getElementById(
        "rsCompareTable"
    ).innerHTML = html;

}

/* =========================================
CLOSE MODAL
========================================= */

function rsCloseCompareModal() {

    document
        .getElementById(
            "rsCompareModal"
        )
        .classList.remove(
            "active"
        );

}

function rsrOpenBookingPopup(car) {

    // =====================================
    // BLOCK UNAVAILABLE
    // =====================================

    if (
        !car ||
        car.availability === "unavailable" ||
        car.availability === "Unavailable" ||
        car.availability === "NOT_AVAILABLE"
    ) {

        rsShowToast(
            "⚠️ Vehicle not available",
            "error"
        );

        return;
    }

    // =====================================
    // STORE CAR
    // =====================================

    window.selectedCar = car;

    // =====================================
    // CLOSE EXISTING MODAL
    // =====================================

    const rentalModal =
        document.getElementById(
            "rsRentalPackageModal"
        );

    if (rentalModal) {

        rentalModal.classList.remove(
            "active"
        );
    }

    // =====================================
    // OPEN BOOKING MODAL
    // =====================================

    setTimeout(() => {

        const popup =
            document.getElementById(
                "rsInstantBookingPopup"
            );

        if (popup) {

            popup.classList.add(
                "active"
            );
        }

        // RENDER CONTENT

        rsRenderBookingPopup();

    }, 120);
}

function rsrCloseBookingPopup() {
    document
        .getElementById("rsInstantBookingPopup")
        .classList.remove("active");
}


async function rsSubmitBooking() {

    console.clear();
    console.log("======================================");
    console.log("🚖 Ransan Travels - Booking Started");
    console.log("======================================");

    /* =====================================
       BUTTON
    ===================================== */

    const btn = document.querySelector(".rs-booking-btn-modern");

    if (btn?.disabled) {
        console.warn("Already submitting...");
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = "⏳ Sending...";
        btn.style.opacity = "0.7";
    }

    try {

        /* =====================================
           VEHICLE
        ===================================== */

        const car = window.selectedCar;

        if (!car) {
            throw new Error("Selected vehicle not found.");
        }

        console.log("Selected Vehicle :", car);

        /* =====================================
           PRICE TYPE
        ===================================== */

        const isPerKm = window.rsPriceType === "km";
        const isPerDay = window.rsPriceType === "day";

        console.log("Price Type :", window.rsPriceType);

        /* =====================================
           CUSTOMER DETAILS
        ===================================== */

        const customerName =
            (document.getElementById("rsCarCustomerName")?.value || "").trim();


        let phone =
            (document.getElementById("rsCarPhone")?.value || "")
                .replace(/\D/g, "");

        if (phone.length === 10) {
            phone = "91" + phone;
        }

        const notes =
            document.getElementById("rsCarBookingNotes")?.value.trim() || "";

        console.table({
            customerName,
            phone,
            notes
        });

        /* =====================================
           COMMON FIELDS
        ===================================== */

        const fromLocation =
            document.getElementById("rsFromLocation")?.value.trim() || "";

        const toLocation =
            document.getElementById("rsToLocation")?.value.trim() || "";

        const pickup =
            document.getElementById("rsPickupDate")?.value || "";

        const drop =
            document.getElementById("rsDropDate")?.value || "";

        const journeyType =
            isPerKm
                ? (window.rsJourneyType || "One Way")
                : "Rental";

        const location =
            `${fromLocation} → ${toLocation}`;

        console.table({
            fromLocation,
            toLocation,
            pickup,
            drop,
            journeyType,
            location
        });

        console.table({
            estimatedKm: window.rsEstimatedKm,
            estimatedFare: window.rsEstimatedFare
        });

        /* =====================================
           VALIDATION
        ===================================== */

        /* =====================================
           VALIDATION
        ===================================== */

        if (!customerName) {

            rsShowToast(
                "⚠ Please enter customer name.",
                "error"
            );

            console.warn("Validation Failed : Customer Name");

            return;
        }

        if (!phone) {

            rsShowToast(
                "⚠ Please enter WhatsApp number.",
                "error"
            );

            console.warn("Validation Failed : Phone");

            return;
        }

        if (phone.length !== 12) {

            rsShowToast(
                "⚠ Please enter valid WhatsApp number.",
                "error"
            );

            console.warn("Validation Failed : Invalid Phone");

            return;
        }

        if (!fromLocation) {

            rsShowToast(
                "⚠ Please enter pickup location.",
                "error"
            );

            return;
        }

        if (!toLocation) {

            rsShowToast(
                "⚠ Please enter drop location.",
                "error"
            );

            return;
        }

        if (!pickup) {

            rsShowToast(
                "⚠ Please select pickup date.",
                "error"
            );

            return;
        }

        if (!drop) {

            rsShowToast(
                "⚠ Please select drop date.",
                "error"
            );

            return;
        }

        console.log("✅ Validation Passed");

        /* ===== PART 2 STARTS FROM HERE ===== */

        /* =====================================
   CUSTOMER MESSAGE
===================================== */

        const customerMessage = `✨ *BOOKING REQUEST RECEIVED*

━━━━━━━━━━━━━━━━━━

👋 Hi *${customerName}*,

Thank you for choosing *Ransan Travels* ❤️

🚘 *Vehicle*
${car.vehicle_name}

🏷 *Category*
${car.category}

📍 *Route*
${location}

🛣 *Journey Type*
${journeyType}

📅 *Pickup*
${pickup}

📅 *Drop*
${drop}

${window.rsEstimatedKm > 0
                ? `📏 *Estimated Distance*
${window.rsEstimatedKm} KM`
                : ""}

${window.rsEstimatedFare > 0
                ? `💰 *Estimated Fare*
₹${Number(window.rsEstimatedFare).toLocaleString("en-IN")}`
                : ""}

━━━━━━━━━━━━━━━━━━

✅ Our travel expert will contact you shortly.

Thank you for choosing
*Ransan Travels* 🌍`;



        /* =====================================
           ADMIN MESSAGE
        ===================================== */

        const adminMessage = `🔥 *NEW CAR BOOKING*

━━━━━━━━━━━━━━━━━━

👤 *Customer*
${customerName}

📱 *Phone*
${phone}

🚘 *Vehicle*
${car.vehicle_name}

🏷 *Category*
${car.category}

📍 *Route*
${location}

🛣 *Journey*
${journeyType}

📅 *Pickup*
${pickup}

📅 *Drop*
${drop}

📏 *Estimated KM*
${window.rsEstimatedKm}

💰 *Estimated Fare*
₹${Number(window.rsEstimatedFare).toLocaleString("en-IN")}

📝 *Notes*
${notes || "-"}

━━━━━━━━━━━━━━━━━━`;



        /* =====================================
           BUILD PAYLOAD
        ===================================== */

        const payload = {

            action: "saveEnquiry",

            sheet: "Car_Bookings",

            type: "car_bookings",

            data: {

                "Customer Name": customerName,

                "Phone": phone,

                "Vehicle": car.vehicle_name,

                "Category": car.category,

                "Pickup": pickup,

                "Drop": drop,

                "Location": location,

                "Journey Type": journeyType,

                "Estimated KM": Number(window.rsEstimatedKm) || 0,

                "Estimated Fare": Number(window.rsEstimatedFare) || 0,

                "Source": "Website",

                "Notes": notes

            }

        };



        console.log("=================================");
        console.log("PAYLOAD TO APPS SCRIPT");
        console.log("=================================");
        console.log(JSON.stringify(payload, null, 2));



        /* ===== PART 3 STARTS FROM HERE ===== */

        /* =====================================
   API REQUEST
===================================== */

        console.log("=================================");
        console.log("Sending request to Apps Script...");
        console.log("API URL :", RS_CONFIG.API_URL);
        console.log("=================================");

        const response = await apiFetch("", {

            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify(payload)

        });

        console.log("HTTP Status :", response.status);
        console.log("HTTP OK :", response.ok);

        /* =====================================
           RAW RESPONSE
        ===================================== */

        const responseText = await response.text();

        console.log("=================================");
        console.log("RAW SERVER RESPONSE");
        console.log("=================================");
        console.log(responseText);

        /* =====================================
           JSON PARSE
        ===================================== */

        let result;

        try {

            result = JSON.parse(responseText);

        } catch (jsonError) {

            console.error("JSON Parse Error");

            console.error(jsonError);

            throw new Error(
                "Apps Script returned invalid JSON.\n\n" +
                responseText
            );

        }

        console.log("=================================");
        console.log("PARSED RESPONSE");
        console.log("=================================");
        console.table(result);

        /* =====================================
           RESPONSE VALIDATION
        ===================================== */

        if (!result.success) {

            console.error("Apps Script returned Success = FALSE");

            console.error(result);

            throw new Error(
                result.error ||
                "Unknown server error."
            );

        }

        console.log("=================================");
        console.log("Booking Saved Successfully");
        console.log("Booking ID :", result.bookingId);
        console.log("=================================");

        /* =====================================
           OPTIONAL
           (only if Apps Script returns bookingId)
        ===================================== */

        if (result.bookingId) {

            console.log("Assigned Booking ID :", result.bookingId);

        }

        /* ===== PART 4 STARTS FROM HERE ===== */

        /* =====================================
   SUCCESS UI
===================================== */

        console.log(
            "typeof rsShowToast =",
            typeof rsShowToast
        );

        rsShowToast(
            "✅ Booking submitted successfully",
            "success"
        );

        console.log("Showing success message...");

        setTimeout(() => {

            rsShowToast(
                "📲 Our team will contact you shortly.",
                "success"
            );

        }, 1200);

        /* =====================================
           CLOSE POPUP
        ===================================== */

        setTimeout(() => {

            console.log("Closing popup...");

            rsrCloseBookingPopup();

        }, 1800);

    }

    /* =====================================
       ERROR
    ===================================== */

    catch (err) {

        console.group("BOOKING ERROR");

        console.error(err);

        console.error("Message :", err.message);

        console.error("Stack :", err.stack);

        console.groupEnd();

        rsShowToast(
            err.message || "❌ Booking failed.",
            "error"
        );

    }

    /* =====================================
       FINALLY
    ===================================== */

    finally {

        if (btn) {

            btn.disabled = false;

            btn.innerHTML =
                "🚀 Confirm Instant Booking";

            btn.style.opacity = "1";

        }

        console.log("======================================");
        console.log("Booking Process Finished");
        console.log("======================================");

    }

}


function rsRenderBookingHeader() {

    const car = window.selectedCar;

    if (!car) return;

    document.getElementById("rsBookingCarName").innerText =
        car.vehicle_name || "";

    document.getElementById("rsBookingCarMeta").innerText =
        `${car.category || ""} • ${car.seats || ""} Seats`;
}



function rsRenderBookingPopup() {

    window.rsEstimatedKm = 0;
    window.rsEstimatedFare = 0;

    window.rsJourneyType = "oneway";

    const car = window.selectedCar;

    console.log(window.selectedCar);

    if (!car) return;

    // =====================================
    // PRICE TYPE
    // =====================================

    const isPerKm =
        car.price.toLowerCase().includes("/km");

    const isPerDay =
        car.price.toLowerCase().includes("/day");

    // =====================================
    // RATE
    // =====================================

    const rate =
        Number(
            car.price.replace(/[^\d]/g, "")
        ) || 0;

    // =====================================
    // TARGET CONTAINER
    // =====================================

    const container =
        document.getElementById(
            "rsBookingDynamicFields"
        );




    // =====================================
    // RENDER
    // =====================================

    container.innerHTML = `

<div class="rs-modern-booking-grid">

    <!-- LEFT -->

    <div class="rs-booking-vehicle-card">

        <img
            src="${car.image}"
            class="rs-booking-image"
        >

        <div class="rs-booking-content">

            <h2>
                ${car.vehicle_name}
            </h2>

            <div class="rs-booking-tags">

                <span>${car.category}</span>
                <span>${car.seats} Seats</span>
                <span>${car.transmission}</span>

            </div>

            <div class="rs-booking-price">
                ${car.price}
            </div>

        </div>

    </div>

    <!-- RIGHT -->

    <div class="rs-booking-form-card">

        ${isPerKm
            ?

            `

            <div class="rs-field">

                <label>
                    Pickup Location
                </label>

                <input
                    type="text"
                    id="rsFromLocation"
                    placeholder="Enter pickup location"
                >

            </div>

            <div class="rs-field">

                <label>
                    Drop Location
                </label>

                <input
                    type="text"
                    id="rsToLocation"
                    placeholder="Enter destination"
                >

            </div>

            <div class="rs-field">

    <label>
        Journey Type
    </label>

    <div class="rs-journey-toggle">

        <button
            type="button"
            class="rs-journey-btn active"
            data-type="oneway"
        >
            One Way
        </button>

        <button
            type="button"
            class="rs-journey-btn"
            data-type="roundtrip"
        >
            Round Trip
        </button>

    </div>

</div>

            <div class="rs-field">

    <label>
        Pickup Date & Time
    </label>

    <input
        type="datetime-local"
        id="rsPickupDate"
    >

</div>

<div class="rs-field">

    <label>
        Drop Date & Time
    </label>

    <input
        type="datetime-local"
        id="rsDropDate"
    >

</div>

            <button
    type="button"
    class="rs-calculate-btn"
    onclick="rsCalculateKmFare()"
>

    📍 Calculate Approx Fare

</button>

            `

            :

            `

<div class="rs-field">

    <label>
        Pickup Location
    </label>

    <input
        type="text"
        id="rsFromLocation"
        placeholder="Enter Pickup Location"
    >

</div>

<div class="rs-field">

    <label>
        Drop Location
    </label>

    <input
        type="text"
        id="rsToLocation"
        placeholder="Enter Drop Location"
    >

</div>

<div class="rs-field">

    <label>
        Pickup Date & Time
    </label>

    <input
        type="datetime-local"
        id="rsPickupDate"
    >

</div>

<div class="rs-field">

    <label>
        Return Date & Time
    </label>

    <input
        type="datetime-local"
        id="rsDropDate"
    >

</div>

<!-- CALCULATE BUTTON -->

<button
    class="rs-calculate-btn rs-day-btn"
    id="rsCalculateDayBtn"
>

    📅 Calculate Rental Cost

</button>

            `
        }

        <div class="rs-field">

    <label>
        Customer Name
    </label>

    <input
        type="text"
        id="rsCarCustomerName"
        placeholder="Enter Full Name"
    >

</div>

        <div class="rs-field">

            <label>
                WhatsApp Number
            </label>

            <input
                type="tel"
                id="rsCarPhone"
                placeholder="Enter WhatsApp Number"
            >

        </div>

        <input id="rsCarBookingNotes"
       class="rsNotes"
       placeholder="Notes">

        <!-- FARE -->

<div
    class="rs-estimate-box"
    id="rsFareBox"
>

    Select rental duration
    to calculate estimate

</div>



        <!-- BUTTON -->

        <button
            class="rs-booking-btn-modern"
            onclick="rsSubmitBooking()"
        >

            🚀 Confirm Instant Booking

        </button>

    </div>

</div>
`;

    rsInitJourneyToggle();

    // =====================================
    // EVENTS
    // =====================================

    // KM RENTAL

    if (isPerKm) {

        const kmBtn =
            document.getElementById(
                "rsCalculateFareBtn"
            );

        if (kmBtn) {

            kmBtn.addEventListener(
                "click",
                rsCalculateKmFare
            );

        }
    }

    // DAY RENTAL

    if (isPerDay) {

        const dayBtn =
            document.getElementById(
                "rsCalculateDayBtn"
            );

        if (dayBtn) {

            dayBtn.addEventListener(
                "click",
                rsCalculateDayFare
            );

        }
    }

    // =====================================
    // STORE GLOBAL
    // =====================================

    window.rsPriceType =
        isPerKm
            ? "km"
            : "day";

    window.rsPriceRate =
        rate;

}

async function rsCalculateKmFare() {

    const from =
        document.getElementById(
            "rsFromLocation"
        ).value.trim();

    const to =
        document.getElementById(
            "rsToLocation"
        ).value.trim();

    // =====================================
    // VALIDATION
    // =====================================

    if (!from || !to) {

        rsShowToast(
            "⚠️ Enter pickup & drop locations",
            "error"
        );

        return;
    }

    // =====================================
    // FARE BOX
    // =====================================

    const fareBox =
        document.getElementById(
            "rsFareBox"
        );

    // SAFETY CHECK

    if (!fareBox) {

        console.error(
            "rsFareBox not found"
        );

        return;
    }

    // SHOW BOX

    fareBox.classList.add(
        "active"
    );

    // LOADING UI

    fareBox.innerHTML = `

        <div style="
            text-align:center;
            padding:25px;
            font-weight:700;
            font-size:16px;
        ">

            ⏳ Calculating Smart Fare...

        </div>

    `;

    try {

        // =====================================
        // GEOCODE
        // =====================================

        const fromGeo =
            await rsGetCoordinates(
                from
            );

        const toGeo =
            await rsGetCoordinates(
                to
            );

        // =====================================
        // LOCATION CHECK
        // =====================================

        if (!fromGeo || !toGeo) {

            fareBox.innerHTML = `

                <div style="
                    text-align:center;
                    padding:20px;
                    color:#ef4444;
                    font-weight:700;
                ">

                    ❌ Location not found

                </div>

            `;

            return;
        }

        // =====================================
        // ROUTE API
        // =====================================

        const routeUrl =

            `https://router.project-osrm.org/route/v1/driving/${fromGeo.lon},${fromGeo.lat};${toGeo.lon},${toGeo.lat}?overview=false`;

        const response =
            await fetch(routeUrl);

        const data =
            await response.json();

        // =====================================
        // ROUTE CHECK
        // =====================================

        if (
            !data.routes ||
            !data.routes.length
        ) {

            fareBox.innerHTML = `

                <div style="
                    text-align:center;
                    padding:20px;
                    color:#ef4444;
                    font-weight:700;
                ">

                    ❌ Route not found

                </div>

            `;

            return;
        }

        // =====================================
        // DISTANCE
        // =====================================

        let km =
            Math.round(
                data.routes[0].distance / 1000
            );

        // ROUND TRIP

        if (
            window.rsJourneyType ===
            "roundtrip"
        ) {

            km = km * 2;

        }

        // =====================================
        // BASE FARE
        // =====================================

        const baseFare =
            km *
            window.rsPriceRate;

        // =====================================
        // TOLL ESTIMATION
        // =====================================

        const toll =
            rsEstimateToll(
                km,
                window.selectedCar.category
            );

        // =====================================
        // DRIVER ALLOWANCE
        // =====================================

        const pickupDate =
            document.getElementById(
                "rsPickupDate"
            )?.value;

        const dropDate =
            document.getElementById(
                "rsDropDate"
            )?.value;

        const driverAllowance =
            rsCalculateDriverAllowance(
                km,
                pickupDate,
                dropDate
            );

        // =====================================
        // TOTAL
        // =====================================

        const total =
            baseFare +
            toll +
            driverAllowance;

        // =====================================
        // SAVE VALUES
        // =====================================

        window.rsEstimatedFare =
            total;

        window.rsEstimatedKm =
            km;

        // =====================================
        // MODERN UI
        // =====================================

        fareBox.innerHTML = `

<div class="rs-fare-grid">

    <div class="rs-fare-pill distance">

        <div class="rs-fare-pill-label">
            📍 Distance
        </div>

        <div class="rs-fare-pill-value">
            ${km} KM
        </div>

    </div>

    <div class="rs-fare-pill fare">

        <div class="rs-fare-pill-label">
            🚖 Base Fare
        </div>

        <div class="rs-fare-pill-value">
            ₹${baseFare.toLocaleString()}
        </div>

    </div>

    <div class="rs-fare-pill toll">

        <div class="rs-fare-pill-label">
            🛣 Toll Estimate
        </div>

        <div class="rs-fare-pill-value">
            ₹${toll.toLocaleString()}
        </div>

    </div>

    <div class="rs-fare-pill driver">

        <div class="rs-fare-pill-label">
            👨‍✈️ Driver Allowance
        </div>

        <div class="rs-fare-pill-value">
            ₹${driverAllowance.toLocaleString()}
        </div>

    </div>

</div>

<!-- JOURNEY TYPE -->

<div class="rs-fare-pill trip">

    <div class="rs-fare-pill-label">
        🔁 Journey Type
    </div>

    <div class="rs-fare-pill-value">

        ${window.rsJourneyType === "roundtrip"
                ? "Round Trip"
                : "One Way"}

    </div>

</div>

<div class="rs-total-box">

    <div class="rs-total-label">
        Estimated Trip Cost
    </div>

    <div class="rs-total-price">
        ₹${total.toLocaleString()}
    </div>

</div>

<div class="rs-fare-note">

    Toll, parking, permit & hill charges may vary slightly.

</div>

`;

    }

    catch (err) {

        console.log(err);

        fareBox.innerHTML = `

            <div style="
                text-align:center;
                padding:20px;
                color:#ef4444;
                font-weight:700;
            ">

                ❌ Unable to calculate fare

            </div>

        `;
    }
}

function rsInitJourneyToggle() {

    const journeyBtns =
        document.querySelectorAll(
            ".rs-journey-btn"
        );

    if (!journeyBtns.length) return;

    // DEFAULT

    window.rsJourneyType =
        "oneway";

    // DEFAULT ACTIVE

    const defaultBtn =
        document.querySelector(
            '.rs-journey-btn[data-type="oneway"]'
        );

    if (defaultBtn) {

        defaultBtn.classList.add(
            "active"
        );
    }

    journeyBtns.forEach(btn => {

        btn.addEventListener(
            "click",
            function () {

                // REMOVE ACTIVE

                journeyBtns.forEach(b => {

                    b.classList.remove(
                        "active"
                    );

                });

                // ACTIVE

                this.classList.add(
                    "active"
                );

                // SAVE TYPE

                window.rsJourneyType =
                    this.getAttribute(
                        "data-type"
                    );

                console.log(
                    "Journey Type:",
                    window.rsJourneyType
                );

            }
        );

    });

}

async function rsCalculateDayFare() {


    const btn =
        document.getElementById(
            "rsCalculateDayBtn"
        );

    btn.disabled = true;

    btn.innerHTML =
        "⏳ Calculating...";

    const pickupInput =
        document.getElementById(
            "rsPickupDate"
        ).value;

    const dropInput =
        document.getElementById(
            "rsDropDate"
        ).value;

    const fareBox =
        document.getElementById(
            "rsFareBox"
        );

    // VALIDATION

    if (!pickupInput || !dropInput) {

        rsShowToast(
            "Select rental dates",
            "error"
        );

        return;
    }

    const pickup =
        new Date(pickupInput);

    const drop =
        new Date(dropInput);

    // INVALID DATE

    if (drop <= pickup) {

        rsShowToast(
            "Invalid return date",
            "error"
        );

        return;
    }

    // =====================================
    // HOURS
    // =====================================

    const totalHours =
        Math.ceil(
            (drop - pickup) /
            (1000 * 60 * 60)
        );

    // =====================================
    // DAYS
    // =====================================

    const days =
        Math.ceil(totalHours / 24);

    // =====================================
    // BASE RATE
    // =====================================

    const baseFare =
        days *
        window.rsPriceRate;

    // =====================================
    // DRIVER ALLOWANCE
    // =====================================

    // ₹800/day after first day

    const driverAllowance =
        days > 1
            ? (days - 1) * 800
            : 0;

    // =====================================
    // NIGHT CHARGE
    // =====================================

    // Optional premium logic

    const nightCharge =
        totalHours > 72
            ? 1500
            : 0;

    // =====================================
    // TOTAL
    // =====================================

    const total =
        baseFare +
        driverAllowance +
        nightCharge;

    // =====================================
    // SHOW UI
    // =====================================

    fareBox.classList.add("active");

    fareBox.innerHTML = `

<div class="rs-fare-grid">

    <!-- DAYS -->

    <div class="rs-fare-pill distance">

        <div class="rs-fare-pill-label">
            📅 Rental Days
        </div>

        <div class="rs-fare-pill-value">
            ${days} Days
        </div>

    </div>

    <!-- BASE -->

    <div class="rs-fare-pill fare">

        <div class="rs-fare-pill-label">
            🚘 Base Rental
        </div>

        <div class="rs-fare-pill-value">
            ₹${baseFare.toLocaleString()}
        </div>

    </div>

    <!-- DRIVER -->

    <div class="rs-fare-pill driver">

        <div class="rs-fare-pill-label">
            👨‍✈️ Driver Allowance
        </div>

        <div class="rs-fare-pill-value">
            ₹${driverAllowance.toLocaleString()}
        </div>

    </div>

    <!-- NIGHT -->

    <div class="rs-fare-pill toll">

        <div class="rs-fare-pill-label">
            🌙 Extra Charges
        </div>

        <div class="rs-fare-pill-value">
            ₹${nightCharge.toLocaleString()}
        </div>

    </div>

</div>

<!-- TOTAL -->

<div class="rs-total-box">

    <div class="rs-total-label">
        Estimated Rental Cost
    </div>

    <div class="rs-total-price">
        ₹${total.toLocaleString()}
    </div>

</div>

<div class="rs-fare-note">

    Fuel, toll, parking & interstate
    permit charges may vary.

</div>

`;

    // SAVE DATA

    window.rsEstimatedFare =
        total;

    window.rsEstimatedDays =
        days;


    btn.disabled = false;

    btn.innerHTML =
        "📅 Calculate Rental Cost";

}

function rsCalculateDriverAllowance(
    km,
    pickupDate,
    dropDate
) {

    // =====================================
    // ROUND TRIP
    // =====================================

    if (
        window.rsJourneyType ===
        "roundtrip"
    ) {

        // DATE CHECK

        if (
            pickupDate &&
            dropDate
        ) {

            const start =
                new Date(pickupDate);

            const end =
                new Date(dropDate);

            // TOTAL DAYS

            let days =
                Math.ceil(

                    (end - start) /

                    (1000 * 60 * 60 * 24)

                );

            // MIN 1 DAY

            if (days <= 0) {

                days = 1;

            }

            // ₹500 PER DAY

            return days * 500;
        }

        // FALLBACK

        return 500;
    }

    // =====================================
    // ONE WAY
    // =====================================

    if (km < 300) {

        return 0;
    }

    if (km < 500) {

        return 500;
    }

    return 1000;
}

function rsEstimateToll(km, category) {

    // =====================================
    // BASE TOLL %
    // =====================================

    let tollRate = 2.5;

    // SUV

    if (
        category &&
        category.toLowerCase().includes("suv")
    ) {

        tollRate = 3.5;
    }

    // LUXURY

    if (
        category &&
        category.toLowerCase().includes("luxury")
    ) {

        tollRate = 5;
    }

    // =====================================
    // TOTAL
    // =====================================

    return Math.round(
        km * tollRate
    );
}

async function rsGetCoordinates(place) {

    try {

        const response =
            await fetch(

                `https://geocode.maps.co/search?q=${encodeURIComponent(place)}&api_key=6a1331ee48429796232202jye029b47`

            );

        const data =
            await response.json();

        if (!data.length) {

            return null;

        }

        return {

            lat: data[0].lat,
            lon: data[0].lon

        };

    }

    catch (err) {

        console.log(err);

        return null;

    }

}

async function rsQuickInquiry(car) {

    try {

        console.log(
            "🚀 Quick Inquiry Started"
        );

        // =====================================
        // BUTTON LOADING
        // =====================================

        const buttons =
            document.querySelectorAll(
                ".rs-action-wa"
            );

        buttons.forEach(btn => {

            btn.disabled = true;

            btn.style.opacity = "0.8";

            btn.dataset.original =
                btn.innerHTML;

            btn.innerHTML = `

        <span class="rs-btn-loader"></span>
        Sending...

    `;

        });

        // =====================================
        // MESSAGE
        // =====================================

        const adminMessage =

            `🔥 *NEW VEHICLE ENQUIRY*

━━━━━━━━━━━━━━━

🚘 *Vehicle*
${car.vehicle_name}

🏷 *Category*
${car.category}

💰 *Price*
${car.price}

🪑 *Seats*
${car.seats}

⚙️ *Transmission*
${car.transmission}

━━━━━━━━━━━━━━━

⚡ Customer clicked quick enquiry

🚀 Immediate follow-up recommended`;

        console.log(
            "📨 Sending Message:",
            adminMessage
        );

        // =====================================
        // API CALL
        // =====================================

        const response =
            await fetch(

                RS_CONFIG.API_URL,

                {

                    method: "POST",

                    mode: "no-cors",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body: JSON.stringify({

                        action:
                            "quickInquiry",

                        admin_message:
                            adminMessage

                    })

                }

            );

        console.log(
            "✅ Request sent to App Script"
        );

        // =====================================
        // SUCCESS UI
        // =====================================

        rsShowToast(

            "✅ Enquiry sent successfully",

            "success"

        );

    }

    catch (err) {

        console.log(
            "❌ Quick Inquiry Error:",
            err
        );

        rsShowToast(

            "❌ Unable to send enquiry",

            "error"

        );

    }

    finally {

        // =====================================
        // RESET BUTTON
        // =====================================

        const buttons =
            document.querySelectorAll(
                ".rs-action-wa"
            );

        buttons.forEach(btn => {

            btn.disabled = false;

            btn.style.opacity = "1";

            btn.innerHTML =
                btn.dataset.original;

        });

    }

}