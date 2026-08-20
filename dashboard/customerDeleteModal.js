function showDeleteModal(customer) {

    if (!customer)
        return;

    closeDeleteModal();

    document.body.insertAdjacentHTML(

        "beforeend",

        `

<div id="crmDeleteModal"

class="crmDeleteOverlay">

<div class="crmDeleteCard">

<div class="crmDeleteHeader">

🗑 Delete Booking

</div>

<div class="crmDeleteBody">

<div class="crmDeleteInfo">

<div>

<b>Booking</b>

</div>

<div>

${customer.bookingId}

</div>

</div>

<div class="crmDeleteInfo">

<div>

<b>Customer</b>

</div>

<div>

${customer.name}

</div>

</div>

<div class="crmDeleteInfo">

<div>

<b>Service</b>

</div>

<div>

${customer.service}

</div>

</div>

<div class="crmDeleteWarning">

Only a Manager can delete bookings.

</div>

<input

id="managerPin"

type="password"

class="crmDeleteInput"

placeholder="Enter Manager PIN"

oninput="clearDeletePinError()"

onkeydown="handleDeletePinKey(event)"

/>

<div

id="deletePinError"

class="crmDeleteError">

</div>

</div>

<div class="crmDeleteFooter">

<button

class="crmDeleteCancel"

onclick="closeDeleteModal()">

Cancel

</button>

<button

id="confirmDeleteBtn"

class="crmDeleteConfirm"

onclick="confirmDeleteWithPin()">

Delete

</button>

</div>

</div>

</div>

`

    );

    // ==========================================
    // Auto Focus PIN
    // ==========================================

    requestAnimationFrame(() => {

        const pinInput = document.getElementById("managerPin");

        if (pinInput) {

            pinInput.focus();

            pinInput.select();

        }

    });

}

function closeDeleteModal() {

    const modal =

        document.getElementById(

            "crmDeleteModal"

        );

    if (modal)

        modal.remove();

}

async function confirmDeleteWithPin() {

    clearDeletePinError();

    const pin =
        document
            .getElementById(
                "managerPin"
            )
            .value
            .trim();

    if (!pin) {

        showDeletePinError(
            "Please enter Manager PIN"
        );

        return;

    }

    setDeleteButtons(false);

    const verify =
        await verifyManagerPin(pin);

    if (!verify.success) {

        setDeleteButtons(true);

        showDeletePinError(
            "Invalid Manager PIN"
        );

        return;

    }

    closeDeleteModal();

    showDeleteLoader();

    deleteCustomerBooking(
        currentCustomerV2
    );

}

function showDeleteLoader() {

    if (document.getElementById("crmDeleteLoader"))
        return;

    document.body.insertAdjacentHTML(

        "beforeend",

        `

<div id="crmDeleteLoader"

class="crmDeleteLoader">

<div class="crmDeleteLoaderCard">

<div class="crmDeleteSpinner"></div>

<div class="crmDeleteLoaderTitle">

Deleting Booking...

</div>

<div class="crmDeleteLoaderText">

Please wait

</div>

</div>

</div>

`

    );

}

function hideDeleteLoader() {

    document
        .getElementById("crmDeleteLoader")
        ?.remove();

}

function setDeleteButtons(enabled) {

    const confirm =
        document.getElementById(
            "confirmDeleteBtn"
        );

    const cancel =
        document.querySelector(
            ".crmDeleteCancel"
        );

    if (confirm) {

        confirm.disabled = !enabled;

    }

    if (cancel) {

        cancel.disabled = !enabled;

    }

}


function animateDrawerClose(callback) {

    const drawer =
        document.querySelector(".crmGlassV2Drawer");

    if (!drawer) return;

    const container =
        drawer.querySelector(".crmGlassV2Container");

    container.classList.add("crmDrawerClosing");

    container.addEventListener(

        "animationend",

        function () {

            container.classList.remove("crmDrawerClosing");

            drawer.style.transform = "";
            drawer.style.opacity = "";

            // ⭐ Execute callback
            if (typeof callback === "function") {

                callback();

            }

        },

        { once: true }

    );

}

function showDeleteSuccess(id) {

    const toast =
        document.createElement("div");

    toast.className =
        "crmDeleteToast success";

    toast.innerHTML = `

<div>

✅ Booking Deleted

</div>

<div>

${id}

</div>

`;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 30);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 400);

    }, 2500);

}

function showDeleteError(error) {

    const toast =
        document.createElement("div");

    toast.className =
        "crmDeleteToast error";

    toast.innerHTML = `

<div>

❌ Unable to delete booking

</div>

<div>

${error}

</div>

`;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 30);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 400);

    }, 3000);

}

function showDeletePinError(message) {

    const box =
        document.getElementById(
            "deletePinError"
        );

    const input =
        document.getElementById(
            "managerPin"
        );

    if (box) {

        box.innerHTML =
            "❌ " + message;

        box.style.display =
            "block";

    }

    if (input) {

        input.classList.add(
            "crmDeleteInputError"
        );

        input.value = "";

        input.focus();

        input.select();

    }

    const card =
        document.querySelector(".crmDeleteCard");

    if (card) {

        card.classList.add("crmDeleteShake");

        setTimeout(() => {

            card.classList.remove("crmDeleteShake");

        }, 350);

    }

}

function clearDeletePinError() {

    const box =
        document.getElementById(
            "deletePinError"
        );

    const input =
        document.getElementById(
            "managerPin"
        );

    if (box) {

        box.style.display =
            "none";

        box.innerHTML = "";

    }

    if (input) {

        input.classList.remove(
            "crmDeleteInputError"
        );

    }

}

function handleDeletePinKey(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        confirmDeleteWithPin();

    }

}

