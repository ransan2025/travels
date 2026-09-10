function showUnsavedChangesModal() {

    closeUnsavedModal();

    document.body.insertAdjacentHTML(

        "beforeend",

        `

<div id="crmUnsavedModal"

class="crmDeleteOverlay">

<div class="crmDeleteCard">

<div class="crmDeleteHeader">

⚠ Unsaved Changes

</div>

<div class="crmDeleteBody">

You have unsaved changes.

Save before closing?

</div>

<div class="crmDeleteFooter">

<button

class="crmDeleteCancel"

onclick="discardCustomerChanges()">

Discard

</button>

<button

class="crmDeleteCancel"

onclick="closeUnsavedModal()">

Cancel

</button>

<button

class="crmDeleteConfirm"

onclick="saveBeforeClosing()">

💾 Save

</button>

</div>

</div>

</div>

`

    );

}

function closeUnsavedModal() {

    document

        .getElementById(

            "crmUnsavedModal"

        )

        ?.remove();

}

async function saveBeforeClosing() {

    closeUnsavedModal();

    showSavingChanges();

    const result = await saveCustomerUpdate();

    hideSavingChanges();

    if (!result || !result.success) {

        showDeleteError("Unable to save changes.");

        return;

    }

    customerDirty = false;

    toggleCustomerEditing(false);

    showSaveSuccessToast();

    setTimeout(() => {

        closeCustomerDrawerV2();

    }, 800);

}

function discardCustomerChanges() {

customerDirty = false;

toggleCustomerEditing(false);

closeUnsavedModal();

closeCustomerDrawerV2();

}


function showSavingChanges() {

    if (document.getElementById("crmSavingOverlay"))
        return;

    document.body.insertAdjacentHTML(

        "beforeend",

        `

<div id="crmSavingOverlay"
class="crmDeleteOverlay">

<div class="crmDeleteCard">

<div class="crmDeleteSpinner"></div>

<div class="crmDeleteHeader">

Saving Changes...

</div>

<div class="crmDeleteBody">

Please wait while we update the customer.

</div>

</div>

</div>

`

    );

}

function hideSavingChanges(){

    document
        .getElementById("crmSavingOverlay")
        ?.remove();

}

function showSaveSuccessToast(){

    const toast =
        document.createElement("div");

    toast.className =
        "crmDeleteToast success";

    toast.innerHTML = `

<div>

✅ Changes Saved

</div>

<div>

Customer updated successfully

</div>

`;

    document.body.appendChild(toast);

    setTimeout(()=>{

        toast.classList.add("show");

    },30);

    setTimeout(()=>{

        toast.classList.remove("show");

        setTimeout(()=>{

            toast.remove();

        },400);

    },1800);

}
