/*==========================================
FORMAT DATE
==========================================*/

function formatLeadDate(date){

    if(!date) return "";

    const d=new Date(date);

    if(isNaN(d)) return "";

    return d.toLocaleDateString("en-IN",{

        day:"2-digit",

        month:"short",

        year:"numeric"

    });

}

/*==========================================
CUSTOMER NAME
==========================================*/

function getLeadCustomerName(row){

    return (

        row["Customer Name"] ||

        row.Name ||

        "Customer"

    );

}

/*==========================================
PHONE
==========================================*/

function getLeadPhone(row){

    return (

        row.Phone ||

        row.Mobile ||

        row["Phone Number"] ||

        ""

    );

}

/*==========================================
SERVICE ICON
==========================================*/

function getLeadServiceIcon(service){

    switch(service){

        case "air":

            return "✈";

        case "train":

            return "🚆";

        case "bus":

            return "🚌";

        case "car":

            return "🚖";

        case "package":

            return "🏝";

        case "quote":

            return "💎";

        default:

            return "📋";

    }

}

/*==========================================
SERVICE TITLE
==========================================*/

function getLeadServiceTitle(row){

    switch(row._service){

        case "air":

            return (

                row.From +

                " → " +

                row.To

            );

        case "train":

            return (

                row.From +

                " → " +

                row.To

            );

        case "bus":

            return (

                row.From +

                " → " +

                row.To

            );

        case "car":

            return (

                row.Vehicle ||

                "Car Booking"

            );

        case "package":

            return (

                row.Package ||

                row.Destination ||

                "Holiday Package"

            );

        case "quote":

            return (

                row.Service ||

                "Premium Quote"

            );

    }

    return "";

}

/*==========================================
STATUS PILL
==========================================*/

function buildLeadStatusPill(status){

    status=status||"";

    const cls=

        String(status)

        .toLowerCase()

        .replace(/\s+/g,"-");

    return `

<span class="leadStatusPill status-${cls}">

${status}

</span>

`;

}

/*==========================================
PRIORITY PILL
==========================================*/

function buildLeadPriorityPill(priority){

    priority=priority||"Normal";

    const cls=

        priority

        .toLowerCase();

    return `

<span class="leadPriorityPill priority-${cls}">

${priority}

</span>

`;

}

/*==========================================
REVENUE
==========================================*/

function getLeadRevenue(row){

    return (

        row.Revenue ||

        row.Amount ||

        row.Budget ||

        row["Budget Amount"] ||

        ""

    );

}

/*==========================================
CREATED DATE
==========================================*/

function getLeadCreated(row){

    return formatLeadDate(

        row["Created Date"]

    );

}

/*==========================================
CUSTOMER CARD
==========================================*/

function buildLeadCustomerCard(row){

    const customer=

        getLeadCustomerName(row);

    const phone=

        getLeadPhone(row);

    const title=

        getLeadServiceTitle(row);

    const icon=

        getLeadServiceIcon(row._service);

    const revenue=

        getLeadRevenue(row);

    const created=

        getLeadCreated(row);

    return `

<div class="leadCustomerCard">

<div class="leadCustomerTop">

<div class="leadAvatar">

${customer.charAt(0).toUpperCase()}

</div>

<div class="leadCustomerInfo">

<div class="leadCustomerName">

${customer}

</div>

<div class="leadCustomerPhone">

📞 ${phone}

</div>

</div>

</div>

<div class="leadCustomerService">

${icon}

${title}

</div>

<div class="leadCustomerMeta">

<div>

${buildLeadStatusPill(

row.Status

)}

</div>

<div>

${buildLeadPriorityPill(

row.Priority

)}

</div>

</div>

<div class="leadCustomerBottom">

<div class="leadRevenue">

💰 ${revenue}

</div>

<div class="leadCreated">

📅 ${created}

</div>

</div>

<div class="leadCustomerActions">

<button

class="crmBtn callBtn"

onclick='callCustomer(${JSON.stringify(row)})'>

☎

</button>

<button

class="crmBtn whatsappBtn"

onclick='openWhatsappModal(${JSON.stringify(row)})'>

💬

</button>

<button

class="crmBtn statusBtn"

onclick='openStatusModal(${JSON.stringify(row)})'>

✏

</button>

<button

class="crmBtn followupBtn"

onclick='openFollowupModal(${JSON.stringify(row)})'>

📅

</button>

<button

class="crmBtn"

onclick='openCustomerV2(${JSON.stringify(row)})'>

👤

</button>

</div>

</div>

`;

}

localStorage.setItem(

"leadRowsPerPage",

leadRowsPerPage

);

localStorage.setItem(

"leadService",

currentLeadService

);

leadRowsPerPage =

Number(

localStorage.getItem(

"leadRowsPerPage"

)

)||25;

currentLeadService =

localStorage.getItem(

"leadService"

)||"all";

