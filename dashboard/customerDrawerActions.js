let customerEditing = false;

let customerDirty = false;

function toggleCustomerEditing(state = null) {

    if (state === null) {

        customerEditing = !customerEditing;

    } else {

        customerEditing = state;

    }

    const drawer =
        document.querySelector(".crmGlassV2Drawer");

    if (!drawer) return;

    drawer.querySelectorAll("input").forEach(el => {

        if (
            el.type === "button" ||
            el.type === "submit"
        ) return;

        el.readOnly = !customerEditing;
        el.disabled = !customerEditing;

    });

    drawer.querySelectorAll("textarea").forEach(el => {

        el.readOnly = !customerEditing;
        el.disabled = !customerEditing;

    });

    drawer.querySelectorAll("select").forEach(el => {

        el.disabled = !customerEditing;

    });

    updateEditButton();
    updateSaveButton();
    updateEditBadge();

    const status =
        document.getElementById("customerStatus");

    if (status) {

        status.dispatchEvent(
            new Event("change")
        );

    }

    if (customerEditing) {

        registerDirtyTracking();

    }

    const header =
        document.querySelector(".crmGlassV2Header");

    if (header) {

        header.classList.toggle(
            "crmGlassV2Editing",
            customerEditing
        );

    }

    

    updateRevenueFieldState();

}

function updateRevenueFieldState() {

    const revenue =
        document.getElementById(
            "customerRevenue"
        );

    const status =
        document.getElementById(
            "customerStatus"
        );

    if (!revenue || !status) return;

    const allowRevenue =

        customerEditing &&

        (
            status.value === "Confirmed" ||

            status.value === "Completed"
        );

    revenue.disabled = !allowRevenue;

    if (!allowRevenue) {

        revenue.value = "";

    }

}

function registerDirtyTracking() {

    const drawer =
        document.querySelector(".crmGlassV2Drawer");

    if (!drawer) return;

    drawer

        .querySelectorAll(

            "input, textarea, select"

        )

        .forEach(el => {

            el.removeEventListener(

                "input",

                markCustomerDirty

            );

            el.removeEventListener(

                "change",

                markCustomerDirty

            );

            el.addEventListener(

                "input",

                markCustomerDirty

            );

            el.addEventListener(

                "change",

                markCustomerDirty

            );

        });

}

function markCustomerDirty() {

    if (!customerEditing)
        return;

    customerDirty = true;

    updateSaveButton();

}

function updateEditButton() {

    //----------------------------------------------------
    // Existing CRM Management button
    //----------------------------------------------------

    const btn =
        document.getElementById(
            "toggleEditBtn"
        );

    if (btn) {

        if (customerEditing) {

            btn.innerHTML = `

<span class="crmGlassV2ActionIcon">

🔒

</span>

<span>

Lock Editing

</span>

`;

            btn.classList.add(
                "crmGlassV2Editing"
            );

        }

        else {

            btn.innerHTML = `

<span class="crmGlassV2ActionIcon">

✏

</span>

<span>

Enable Editing

</span>

`;

            btn.classList.remove(
                "crmGlassV2Editing"
            );

        }

    }

    //----------------------------------------------------
    // NEW Header Quick Edit Button
    //----------------------------------------------------

    const quickBtn =
        document.getElementById(
            "crmQuickEditBtn"
        );

    if (!quickBtn) return;

    if (customerEditing) {

        quickBtn.innerHTML =
            "🔒 Lock Editing";

        quickBtn.classList.add(
            "editing"
        );

    }

    else {

        quickBtn.innerHTML =
            "✏ Enable Editing";

        quickBtn.classList.remove(
            "editing"
        );

    }

}

function updateEditBadge() {

    const badge =
        document.getElementById(
            "crmEditBadge"
        );

    if (!badge) return;

    if (customerEditing) {

        badge.textContent =
            "EDITING MODE";

        badge.classList.add(
            "editing"
        );

    }

    else {

        badge.textContent =
            "VIEW MODE";

        badge.classList.remove(
            "editing"
        );

    }

}

function updateSaveButton() {

    const btn =
        document.getElementById("saveCustomerBtn");

    if (!btn)
        return;

    btn.disabled =

        !(customerEditing && customerDirty);

}

function confirmDeleteCustomer() {

    if (!currentCustomerV2) return;

    const ok = confirm(

        `Delete booking ${currentCustomerV2.bookingId} ?

This action cannot be undone.`

    );

    if (!ok) return;

    deleteCustomerBooking(currentCustomerV2);

}

async function deleteCustomerBooking(customer) {

    if (!customer)
        return;

    try {

        const result =
            await deleteCustomerCRM(customer);

        hideDeleteLoader();

        if (!result.success) {

            showDeleteError(result.error);

            return;

        }

        showDeleteSuccess(customer.bookingId);

        animateDrawerClose();

        setTimeout(async () => {

            closeCustomerDrawer();

            await loadDashboardData();

        }, 500);

    }

    catch (err) {

        hideDeleteLoader();

        showDeleteError(err);

    }

}

function attemptCloseDrawer() {

    console.log(
        "Editing:",
        customerEditing,
        "Dirty:",
        customerDirty
    );

    if (customerEditing && customerDirty) {

        console.log("SHOW MODAL");

        showUnsavedChangesModal();

        return;

    }

    console.log("CLOSE DRAWER");

    closeCustomerDrawerV2();

}




