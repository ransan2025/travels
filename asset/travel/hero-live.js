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

    const item =

        heroLiveData.items[heroIndex];

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

    if (

        heroIndex >= heroLiveData.items.length

    ) {

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

        buildGreeting();

    });

document.addEventListener(

    "DOMContentLoaded",

    function () {

        loadGreeting();

    }

);

function loadGreeting() {

    fetch("https://ipwho.is/")

        .then(response => response.json())

        .then(data => {

            console.log(data);

            if (data.success) {

                buildGreeting(

                    data.city || "",

                    data.region || "",

                    data.country || ""

                );

            }

            else {

                buildGreeting();

            }

        })

        .catch(error => {

            console.log(error);

            buildGreeting();

        });

}

function buildGreeting(city = "", region = "", country = "") {

    const hour = new Date().getHours();

    let icon = "";
    let title = "";
    let message = "";

    // Time-based greeting
    if (hour >= 5 && hour < 12) {

        icon = "🌞";
        title = "Good Morning!";

    }
    else if (hour >= 12 && hour < 17) {

        icon = "☀";
        title = "Good Afternoon!";

    }
    else if (hour >= 17 && hour < 21) {

        icon = "🌆";
        title = "Good Evening!";

    }
    else {

        icon = "🌙";
        title = "Good Evening!";

    }

    // Location message

    if (city) {

        if (hour >= 5 && hour < 12) {

            message =
                `Planning your next adventure from <b>${city}</b>?`;

        }
        else if (hour >= 12 && hour < 17) {

            message =
                `Great time to book your next journey from <b>${city}</b>.`;

        }
        else if (hour >= 17 && hour < 21) {

            message =
                `Weekend escapes from <b>${city}</b> await.`;

        }
        else {

            message =
                `Plan tomorrow's journey from <b>${city}</b>.`;

        }

    }

    else if (region) {

        message =
            `Discover amazing journeys across <b>${region}</b>.`;

    }

    else if (country) {

        message =
            `Explore unforgettable destinations across <b>${country}</b>.`;

    }

    else {

        if (hour >= 5 && hour < 12) {

            message =
                "Perfect time to plan your next adventure.";

        }
        else if (hour >= 12 && hour < 17) {

            message =
                "Exclusive travel deals are waiting for you.";

        }
        else if (hour >= 17 && hour < 21) {

            message =
                "Weekend getaways are just a click away.";

        }
        else {

            message =
                "Travel smarter and plan tomorrow's journey.";

        }

    }

    document.getElementById("heroGreetingCard").innerHTML = `

    <div class="hero-greeting-card">

        <div class="greet-top">

            ${icon} ${title}

        </div>

        <div class="greet-bottom">

            ${message}

        </div>

    </div>

    `;

}