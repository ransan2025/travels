/*=====================================
RANSAN ICON LIBRARY
2026 Dashboard
=====================================*/

const DashboardIcons={

    services:{

        Flight:"✈",

        Train:"🚆",

        Bus:"🚌",

        Car:"🚖",

        Package:"🏖",

        Quote:"💬",

        Utility:"💡"

    },

    status:{

        New:"🟢",

        Pending:"🟡",

        Processing:"🔵",

        Confirmed:"✅",

        Completed:"🎉",

        Cancelled:"❌",

        Failed:"⚠",

        Closed:"🔒"

    },

    priority:{

        High:"🔴",

        Medium:"🟠",

        Low:"🟢"

    },

    support:{

        Whatsapp:"💬",

        Call:"📞",

        Email:"📧",

        Ticket:"🎫"

    },

    customer:{

        Male:"👨",

        Female:"👩",

        Family:"👨‍👩‍👧",

        Business:"💼"

    }

};

/*==============================
GET SERVICE ICON
==============================*/

function getServiceIcon(service){

    return DashboardIcons.services[service]

    ||

    "📌";

}

/*==============================
GET STATUS ICON
==============================*/

function getStatusIcon(status){

    return DashboardIcons.status[status]

    ||

    "⚪";

}

/*==============================
GET PRIORITY
==============================*/

function getPriorityIcon(level){

    return DashboardIcons.priority[level]

    ||

    "⚪";

}

/*==============================
BADGE
==============================*/

function createStatusBadge(status){

return `

<span class="statusBadge status${status}">

${getStatusIcon(status)}

${status}

</span>

`;

}