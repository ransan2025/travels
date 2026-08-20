function updateTodaysFocus(){

    let all=[];

    all=all.concat(dashboardData.air||[]);
    all=all.concat(dashboardData.train||[]);
    all=all.concat(dashboardData.bus||[]);
    all=all.concat(dashboardData.cars||[]);
    all=all.concat(dashboardData.packages||[]);
    all=all.concat(dashboardData.quotes||[]);

    let calls=0;
    let whatsapp=0;
    let followup=0;
    let overdue=0;
    let vip=0;

    all.forEach(r=>{

        const status=getCustomerStatus(r);

        if(status==="Pending")
            calls++;

        if(status==="WhatsApp Sent")
            whatsapp++;

        if(status==="Follow Up")
            followup++;

        if(status==="Overdue")
            overdue++;

        const priority=

            String(
                r.Priority||
                r.priority||
                ""
            ).toLowerCase();

        if(priority==="vip")
            vip++;

    });

    document.getElementById("focusCalls").innerHTML=calls;

    document.getElementById("focusWhatsapp").innerHTML=whatsapp;

    document.getElementById("focusFollowup").innerHTML=followup;

    document.getElementById("focusOverdue").innerHTML=overdue;

    document.getElementById("focusVIP").innerHTML=vip;

}

function openFocusQueue(type){

    switch(type){

        case "calls":

            document.getElementById("crmFilter").value="Pending";

            break;

        case "whatsapp":

            document.getElementById("crmFilter").value="WhatsApp Sent";

            break;

        case "followup":

            document.getElementById("crmFilter").value="Follow Up";

            break;

        case "overdue":

            document.getElementById("crmFilter").value="Overdue";

            break;

        case "vip":

            document.getElementById("crmSearch").value="VIP";

            break;

    }

    applyCRMFilters();

    document.querySelector(".glass.crmGlass.tabs")
        ?.scrollIntoView({

            behavior:"smooth",

            block:"start"

        });

}