/*==================================================
LEAD CENTER V2
BUILD ONE TABLE ROW
==================================================*/

function buildLeadTableRow(row) {

    const bookingId =
        getLeadBookingId(row);

    const serviceIcon =
        getLeadServiceIcon(row._service);

    const serviceName =
        getLeadServiceName(row._service);

    const customer =
        getLeadCustomer(row);

    const phone =
        getLeadPhone(row);

    const service =
        getLeadServiceDescription(row);

    const followup =
        getLeadFollowup(row);

    const assigned =
        getLeadAssigned(row);

    const status =
        buildLeadStatusPill(row.Status);

    const priority =
        buildLeadPriorityPill(row.Priority);

    const actions =
        buildLeadActionButtons(row);

    return `

<tr
class="leadRowV2"
onclick='openCustomerV2(${JSON.stringify(row)})'>

<td>

<span class="bookingIdChip">

${bookingId}

</span>

</td>

<td>

<div class="serviceCell">

<span class="serviceIcon">

${serviceIcon}

</span>

<span>

${serviceName}

</span>

</div>

</td>

<td>

<div class="customerCell">

<div class="customerName">

${customer}

</div>

<div class="customerPhone">

📞 ${phone}

</div>

</div>

</td>

<td>

${service}

</td>

<td>

${status}

</td>

<td>

${priority}

</td>

<td>

${followup}

</td>

<td>

${assigned}

</td>

<td>

${actions}

</td>

</tr>

`;

}


let html = "";

rows.forEach(row=>{

    html += buildLeadTableRow(row);

});