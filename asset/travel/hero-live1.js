document.addEventListener(

"DOMContentLoaded",

function(){

buildHeroLive();

}

);

function buildHeroLive(){

const box=

document.getElementById(

"heroLiveBar"

);

box.innerHTML=`

<div class="hero-live">

<div class="hero-live-head">

<span class="hero-live-dot">

</span>

LIVE

</div>

<div class="hero-live-items">

<div class="hero-live-pill">

🔥

${heroLiveData.enquiriesToday}

enquiries today

</div>

<div class="hero-live-pill">

🚖

${heroLiveData.vehiclesAvailable}

vehicles available

</div>

<div class="hero-live-pill">

🏖

${heroLiveData.holidayOffers}

holiday offers

</div>

<div class="hero-live-pill rating">

${heroLiveData.ratingStars}

${heroLiveData.rating}

</div>

</div>

</div>

`;

}