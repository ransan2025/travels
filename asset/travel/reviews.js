document.addEventListener("DOMContentLoaded",function(){

buildHeader();

buildReviews();

});

function buildHeader(){

document.getElementById("trustBadge").innerHTML=`

<div class="rsx-top-badge">

🏆 ${reviewsData.stats.badge}

</div>

`;

document.getElementById("googleRating").innerHTML=`

<div class="rsx-rating-pill">

<img src="asset/travel/google-icon.svg">

<span>

${reviewsData.stats.rating} ★★★★★

</span>

<span class="rsx-divider"></span>

<span>

${reviewsData.stats.customers} Happy Travelers

</span>

</div>

`;

}

function buildReviews(){

const container=document.getElementById("testimonialTrack");

let cards="";

reviewsData.reviews.forEach(r=>{

cards+=createCard(r);

});

reviewsData.reviews.forEach(r=>{

cards+=createCard(r);

});

container.innerHTML=cards;

}

function createCard(r){

const initials=getInitials(r.name);

let stars="";

for(let i=0;i<r.rating;i++){

stars+="★";

}

return`

<div class="rsx-card">

<div class="rsx-stars">

${stars}

</div>

<p>

${r.review}

</p>

<div class="rsx-user">

<div class="rsx-avatar">

${createAvatar(r)}

</div>

<div>

<h4>

${r.name}

</h4>

${r.verified ?

'<span class="rsx-verified">✔ Verified Customer</span>'

:''

}

<div class="rsx-location">

📍 ${r.location} • ${r.month}

</div>

<div class="rsx-google">

<img src="asset/travel/google-icon.svg">

${r.source}

</div>

</div>

</div>

</div>

`;

}

function getInitials(name){

return name

.split(" ")

.map(word=>word[0])

.join("")

.substring(0,2)

.toUpperCase();

}

function createAvatar(r){

if(r.photo){

return `

<img
class="rsx-avatar-img"
src="${r.photo}"
alt="${r.name}"

onerror="this.style.display='none';
this.nextElementSibling.style.display='flex';">

<div
class="rsx-avatar"
style="display:none;">

${getInitials(r.name)}

</div>

`;

}

return `

<div class="rsx-avatar">

${getInitials(r.name)}

</div>

`;

}