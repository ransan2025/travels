/*=========================================================
CUSTOMER CRM COMPLETION
=========================================================*/

function renderCustomerCompletion(customer) {

    if (!customer) return "";

    //--------------------------------------------------
    // Notes Count
    //--------------------------------------------------

    const notesCount =
        customer.notes
            ? buildNotesHistory(customer.notes).history.length
            : 0;

    //--------------------------------------------------
    // Status Completed?
    //--------------------------------------------------

    const status =
        (customer.status || "")
            .toLowerCase();

    const statusDone =
        status.includes("confirm") ||
        status.includes("complete");

    //--------------------------------------------------
    // Documents
    //--------------------------------------------------

    const hasDocuments =
        Array.isArray(customer.documents)
            ? customer.documents.length > 0
            : !!customer.documents;

    //--------------------------------------------------
    // Checklist
    //--------------------------------------------------

    const checks = [

        {
            label: "Phone",
            done: !!customer.phone
        },

        {
            label: "Email",
            done: !!customer.email
        },

        {
            label: "Booking",
            done: !!customer.bookingId
        },

        {
            label: "Payment",
            done: Number(customer.revenue || 0) > 0
        },

        {
            label: "Status",
            done: statusDone
        },

        {
            label: "Notes",
            done: notesCount > 0
        },

        {
            label: "Follow-up",
            done: !!customer.followUp
        },

        {
            label: "Documents",
            done: hasDocuments
        }

    ];

    //--------------------------------------------------

    const completed =
        checks.filter(x => x.done).length;

    const total =
        checks.length;

    const percent =
        Math.round((completed / total) * 100);

    //--------------------------------------------------
    // Theme
    //--------------------------------------------------

    let title = "Needs Attention";
    let color = "#ef4444";
    let icon = "🔴";

    if (percent >= 35) {

        title = "In Progress";
        color = "#f59e0b";
        icon = "🟡";

    }

    if (percent >= 75) {

        title = "Almost Complete";
        color = "#22c55e";
        icon = "🟢";

    }

    //--------------------------------------------------

    return `

<section class="crmCustomerProgress">

    <div class="crmCustomerProgressHeader">

        <div>

            <div class="crmCustomerProgressTitle">

                Customer CRM Progress

            </div>

            <div
                class="crmCustomerProgressStatus"
                style="color:${color};">

                ${icon} ${title}

            </div>

        </div>

        <div class="crmCustomerProgressPercent">

            ${percent}%

        </div>

    </div>

    <div class="crmCustomerProgressBar">

        <div
            class="crmCustomerProgressFill"
            style="
                width:${percent}%;
                background:${color};
            ">

        </div>

    </div>

    <div class="crmCustomerChecklist">

        ${checks.map(item => `

            <div class="crmCustomerChecklistItem ${item.done ? "crmChecklistDone" : "crmChecklistPending"}">

                <span>

                    ${item.done ? "✅" : "⭕"}

                </span>

                <span>

                    ${item.label}

                </span>

            </div>

        `).join("")}

    </div>

</section>

`;

}

/*=========================================================
SMART CRM SUGGESTIONS
=========================================================*/

function renderSmartCRMSuggestions(customer) {

    if (!customer)
        return "";

const stage =
    getCustomerJourneyStage(customer);

const suggestions =
    getSmartSuggestions(stage,customer);

    return `

<section class="crmSmartSuggestCard">

    <div class="crmSmartSuggestHeader">

        <div class="crmSmartSuggestTitle">

            🤖 Smart CRM Suggestions

        </div>

        <div class="crmSmartSuggestSub">

            Suggested Next Actions

        </div>

    </div>

    <div class="crmSmartSuggestGrid">

        ${suggestions.map(item=>`

        <div class="crmSmartSuggestItem">

            <div
                class="crmSmartSuggestIcon"
                style="
                    background:${item.color}22;
                    color:${item.color};
                ">

                ${item.icon}

            </div>

            <div class="crmSmartSuggestContent">

                <div class="crmSmartSuggestHeading">

                    ${item.title}

                </div>

                <div class="crmSmartSuggestText">

                    ${item.desc}

                </div>

            </div>

        </div>

        `).join("")}

    </div>

</section>

`;

}

/*=========================================================
CUSTOMER JOURNEY STAGE
=========================================================*/

function getCustomerJourneyStage(customer){

    const status =
        (customer.status || "")
        .trim()
        .toLowerCase();

    const today = new Date();

    let travelDays = null;

    if(customer.travelDate){

        const travel = new Date(customer.travelDate);

        travelDays =
            Math.ceil((travel - today)/86400000);

    }

    //------------------------------------------
    // Travel Completed
    //------------------------------------------

    if(travelDays!==null && travelDays<-7){

        return "completed";

    }

    //------------------------------------------
    // Travelling
    //------------------------------------------

    if(travelDays!==null && travelDays<=0){

        return "travelling";

    }

    //------------------------------------------
    // Upcoming Travel
    //------------------------------------------

    if(status==="confirmed"){

        return "confirmed";

    }

    //------------------------------------------
    // CRM Journey
    //------------------------------------------

    switch(status){

        case "new":
            return "new";

        case "called":
            return "called";

        case "whatsapp":
        case "whatsapp sent":
            return "whatsapp";

        case "follow up":
            return "followup";

        default:
            return "new";

    }

}

/*=========================================================
SMART SUGGESTION DATA
=========================================================*/

function getSmartSuggestions(stage, customer){

    const suggestions=[];

    const revenue =
        Number(customer.revenue||0);

    const inactive =
        getLastActivityDays(customer);

    const hasDocuments =
        !!customer.documents;

    const today=new Date();

    let travelDays=0;

    if(customer.travelDate){

        travelDays=Math.ceil(
            (new Date(customer.travelDate)-today)
            /86400000
        );

    }

    switch(stage){

        //----------------------------------
        // NEW
        //----------------------------------

        case "new":

            suggestions.push({

                icon:"📞",

                color:"#3b82f6",

                title:"Call Customer",

                desc:"First contact pending."

            });

            suggestions.push({

                icon:"💬",

                color:"#22c55e",

                title:"Send Itinerary",

                desc:"Share package details."

            });

        break;

        //----------------------------------
        // CALLED
        //----------------------------------

        case "called":

            suggestions.push({

                icon:"💬",

                color:"#22c55e",

                title:"Send WhatsApp",

                desc:"Share quotation & itinerary."

            });

            suggestions.push({

                icon:"📅",

                color:"#f59e0b",

                title:"Schedule Follow-up",

                desc:"Reconnect after discussion."

            });

        break;

        //----------------------------------
        // WHATSAPP
        //----------------------------------

        case "whatsapp":

            suggestions.push({

                icon:"💬",

                color:"#22c55e",

                title:"Continue Conversation",

                desc:"Await customer response."

            });

            suggestions.push({

                icon:"📅",

                color:"#3b82f6",

                title:"Schedule Follow-up",

                desc:"Don't lose engagement."

            });

        break;

        //----------------------------------
        // FOLLOW UP
        //----------------------------------

        case "followup":

            suggestions.push({

                icon:"📅",

                color:"#f59e0b",

                title:"Today's Follow-up",

                desc:"Customer awaiting callback."

            });

            suggestions.push({

                icon:"📞",

                color:"#3b82f6",

                title:"Call Customer",

                desc:"Convert enquiry."

            });

        break;

        //----------------------------------
        // CONFIRMED
        //----------------------------------

        case "confirmed":

            if(revenue<=0){

                suggestions.push({

                    icon:"💰",

                    color:"#22c55e",

                    title:"Payment Pending",

                    desc:"Collect payment."

                });

            }

            if(!hasDocuments){

                suggestions.push({

                    icon:"📄",

                    color:"#8b5cf6",

                    title:"Documents Pending",

                    desc:"Passport/Visa required."

                });

            }

            suggestions.push({

                icon:"✈",

                color:"#3b82f6",

                title:"Travel Countdown",

                desc:`Travel in ${travelDays} day${travelDays!==1?"s":""}`

            });

        break;

        //----------------------------------
        // TRAVELLING
        //----------------------------------

        case "travelling":

            suggestions.push({

                icon:"✈",

                color:"#2563eb",

                title:"Customer Travelling",

                desc:"Check hotel experience."

            });

            suggestions.push({

                icon:"☎",

                color:"#22c55e",

                title:"Courtesy Call",

                desc:"Mid-trip follow-up."

            });

            suggestions.push({

                icon:"⭐",

                color:"#f59e0b",

                title:"Collect Feedback",

                desc:"After return."

            });

        break;

        //----------------------------------
        // COMPLETED
        //----------------------------------

        case "completed":

            suggestions.push({

                icon:"🧳",

                color:"#22c55e",

                title:"Journey Completed",

                desc:"Trip successfully completed."

            });

            suggestions.push({

                icon:"⭐",

                color:"#f59e0b",

                title:"Request Google Review",

                desc:"Increase reputation."

            });

            suggestions.push({

                icon:"🎁",

                color:"#8b5cf6",

                title:"Offer Next Holiday",

                desc:"Cross-sell package."

            });

        break;

    }

    //----------------------------------
    // Inactive
    //----------------------------------

    if(inactive>=10){

        suggestions.push({

            icon:"🔴",

            color:"#ef4444",

            title:"Customer Inactive",

            desc:`No activity for ${inactive} days.`

        });

    }

    return suggestions;

}

