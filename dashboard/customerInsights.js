/* ===========================================================
   CUSTOMER INSIGHTS HELPERS
=========================================================== */

function getCustomerHealth(lastDays){

    if(lastDays<=1)
        return{
            text:"Healthy",
            color:"#22C55E",
            icon:"🟢"
        };

    if(lastDays<=3)
        return{
            text:"Needs Follow-up",
            color:"#F59E0B",
            icon:"🟡"
        };

    return{
        text:"Cold Lead",
        color:"#EF4444",
        icon:"🔴"
    };

}

/*=========================================================*/

function getPriorityInfo(priority){

    priority=(priority||"").toLowerCase();

    if(priority==="high"){

        return{
            icon:"🔥",
            text:"High Priority Lead",
            color:"#EF4444"
        };

    }

    if(priority==="normal"){

        return{
            icon:"⭐",
            text:"Normal Priority",
            color:"#F59E0B"
        };

    }

    return{

        icon:"🌱",

        text:"Low Priority",

        color:"#22C55E"

    };

}

function getCustomerActivityCount(customer){

    const notes=

        customer.raw?.Notes ||

        customer.raw?.["Notes"] ||

        "";

    if(!notes.trim())
        return 0;

    return notes

        .split("-------------------------")

        .filter(x=>x.trim())

        .length;

}

function getLastActivityDays(customer){

    const notes=

        customer.raw?.Notes ||

        customer.raw?.["Notes"] ||

        "";

    const match=

        notes.match(

            /\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/g

        );

    if(!match || !match.length)
        return 999;

    const latest=

        match[match.length-1];

    const parts=latest.split(" ");

    const d=parts[0].split("/");

    const t=parts[1].split(":");

    const dt=new Date(

        d[2],

        d[1]-1,

        d[0],

        t[0],

        t[1]

    );

    return Math.floor(

        (Date.now()-dt)/86400000

    );

}

function getConversionScore(customer){

    let score=40;

    if(customer.priority==="High")
        score+=25;

    if(customer.revenue>10000)
        score+=15;

    if(getCustomerActivityCount(customer)>5)
        score+=10;

    if(getLastActivityDays(customer)<=1)
        score+=10;

    return Math.min(score,99);

}

function renderCustomerInsights(customer){

    const priority=

        getPriorityInfo(customer.priority);

    const activityCount=

        getCustomerActivityCount(customer);

    const inactiveDays=

        getLastActivityDays(customer);

    const health=

        getCustomerHealth(inactiveDays);

    const score=

        getConversionScore(customer);

    return `

<section class="crmGlassV2Section">

<div class="crmGlassV2SectionTitle">

🧠 Customer Insights

</div>

<div class="crmInsightsCard">

<div class="crmInsightHero"

style="background:${priority.color}18;border-left:4px solid ${priority.color};">

<div class="crmInsightHeroIcon">

${priority.icon}

</div>

<div>

<div class="crmInsightHeroTitle">

${priority.text}

</div>

<div class="crmInsightHeroSub">

Customer Status Overview

</div>

</div>

</div>

<div class="crmInsightGrid">

<div class="crmInsightItem">

<span>💬 Last Contact</span>

<strong>${formatRelativeDateFromDays(inactiveDays)}</strong>

</div>

<div class="crmInsightItem">

<span>📅 Follow-up</span>

<strong>

${formatFollowUp(customer.followUp)}

</strong>

</div>

<div class="crmInsightItem">

<span>📞 Activities</span>

<strong>${activityCount}</strong>

</div>

<div class="crmInsightItem">

<span>💰 Revenue</span>

<strong>₹${getCustomerRevenue(customer).toLocaleString("en-IN")}</strong>

</div>

<div class="crmInsightItem">

<span>⚠ Health</span>

<strong style="color:${health.color}">

${health.icon} ${health.text}

</strong>

</div>

<div class="crmInsightItem">

<span>⭐ Conversion</span>

<strong>${score}%</strong>

</div>

</div>

</div>

</section>

`;

}

function formatRelativeDateFromDays(days){

    if(days===0)
        return "Today";

    if(days===1)
        return "Yesterday";

    if(days<7)
        return days+" days ago";

    if(days<14)
        return "Last week";

    return days+" days ago";

}

/*=========================================================
FOLLOWUP DATE FORMAT
=========================================================*/

function formatFollowUp(dateString){

    if(!dateString)
        return "Not Scheduled";

    const d = new Date(dateString);

    if(isNaN(d))
        return "Not Scheduled";

    return d.toLocaleString(

        "en-IN",

        {

            day:"numeric",

            month:"short",

            year:"numeric",

            hour:"numeric",

            minute:"2-digit"

        }

    );

}


/*=========================================================
REVENUE FORMAT
=========================================================*/

function getCustomerRevenue(customer){

    const revenue =

        customer.revenue ??

        customer.raw?.Revenue ??

        customer.raw?.["Revenue"] ??

        0;

    return Number(revenue) || 0;

}