/* =========================================================
   RANSAN TRAVELS — CUSTOMER DATABASE
   FETCH-BASED FRONTEND
   ========================================================= */

/*
 * IMPORTANT:
 * After you deploy the NEW Apps Script project as a Web App,
 * paste the NEW /exec URL below.
 */
const API_URL =
  'https://script.google.com/macros/s/AKfycbxlacGH8VroMEbcp7ZMnrk7zFpa-tl9p96FQoPm4YH62MW_dy59jWkv0oFWQwrLM9RE/exec';

const APP = {
  environment: (() => {
    const saved = String(
      localStorage.getItem('dashboardEnv') || 'TEST'
    ).trim().toUpperCase();

    return saved === 'LIVE' || saved === 'TEST'
      ? saved
      : 'TEST';
  })(),
  familyHeads: [],
  searchResults: [],
  initialized: false,
  travelHistory: [],
  bookings: [],
  currentTravelCustomerId: '',
  editingBookingIndex: -1,
  premiumConfirmResolver: null
};

const $ = id => document.getElementById(id);

document.addEventListener('DOMContentLoaded', initializeApplication);

/* Keep Dashboard, Report and Customer CRM environment synchronized. */
window.addEventListener('storage', event => {
  if (event.key !== 'dashboardEnv') return;

  const next = String(event.newValue || '')
    .trim()
    .toUpperCase();

  if (
    (next === 'TEST' || next === 'LIVE') &&
    next !== APP.environment
  ) {
    APP.environment = next;
    updateEnvironmentUI();
    clearSearch();
    clearFamilySearchResults();
    clearFamilyHeadPickerSelection(false);
    loadFamilyHeads();

    showToast(
      `${next} environment synchronized from Dashboard.`,
      'info'
    );
  }
});

async function initializeApplication() {
  if (APP.initialized) return;
  APP.initialized = true;

  updateEnvironmentUI();
  setupPremiumConfirm();
  setupEnvironmentSwitch();
  setupPersonType();
  setupAgeCalculation();
  setupCustomerButtons();
  setupFamilyHeadSelector();
  setupCustomerSearch();
  setupFamilySearch();
  setupIdNumberFormatting();
  setupPhase5();

  const connected = await testBackendConnection();

  if (!connected) {
    const select = $('familyHeadId');
    if (select) {
      select.innerHTML =
        '<option value="">Backend unavailable</option>';
    }
    return;
  }

  await loadFamilyHeads();
}

/* =========================================================
   FETCH API CLIENT
   Mirrors the working RanSan dashboard pattern:
   - GET for read actions
   - POST text/plain for write actions
   - no JSONP
   - no dynamic external <script> callback
   ========================================================= */
async function callBackend(action, params = {}) {
  const apiUrl = String(API_URL || '').trim();

  if (
    !apiUrl ||
    apiUrl.includes('PASTE_NEW_APPS_SCRIPT_WEB_APP_EXEC_URL_HERE')
  ) {
    throw new Error(
      'Apps Script API URL is not configured in app.js.'
    );
  }

  const cleanAction = String(action || '').trim();
  if (!cleanAction) {
    throw new Error('Backend action is required.');
  }

  const payload = { ...params };

  if (payload.environment !== undefined) {
    payload.environment = normalizeEnvironment(payload.environment);
  }

  const readActions = new Set([
    'health',
    'getFamilyHeads',
    'searchCustomers',
    'searchFamilies',
    'getFamilyDetails',
    'getTravelProfile'
  ]);

  let response;

  try {
    if (readActions.has(cleanAction)) {
      const url = new URL(apiUrl);

      url.searchParams.set('action', cleanAction);

      Object.keys(payload).forEach(key => {
        const value = payload[key];

        if (value === undefined || value === null) return;

        url.searchParams.set(
          key,
          typeof value === 'object'
            ? JSON.stringify(value)
            : String(value)
        );
      });

      url.searchParams.set('_ts', String(Date.now()));

      console.log(
        '[Travel CRM] GET',
        cleanAction,
        url.toString()
      );

      response = await fetch(url.toString(), {
        method: 'GET',
        cache: 'no-store',
        redirect: 'follow'
      });
    } else {
      const body = {
        action: cleanAction,
        ...payload
      };

      console.log(
        '[Travel CRM] POST',
        cleanAction,
        body
      );

      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(body),
        cache: 'no-store',
        redirect: 'follow'
      });
    }
  } catch (networkError) {
    console.error(
      '[Travel CRM] Network error:',
      networkError
    );

    throw new Error(
      'Unable to connect to the Travel CRM backend. ' +
      'Check the Apps Script /exec URL and deployment access.'
    );
  }

  const text = await response.text();

  console.log(
    '[Travel CRM] HTTP',
    response.status,
    cleanAction,
    text
  );

  if (!response.ok) {
    throw new Error(
      'Travel CRM backend returned HTTP ' +
      response.status +
      '.'
    );
  }

  let result;

  try {
    result = JSON.parse(text);
  } catch (parseError) {
    console.error(
      '[Travel CRM] Invalid JSON response:',
      text
    );

    /*
     * A Google login/permission page is HTML, not JSON.
     * Give a useful error instead of "Unexpected token <".
     */
    if (
      /<html|<!doctype|accounts\.google|sign in/i.test(text)
    ) {
      throw new Error(
        'Apps Script returned a Google sign-in or permission page. ' +
        'Deploy the Web App as "Execute as: Me" and allow the intended users.'
      );
    }

    throw new Error(
      'Apps Script returned invalid JSON.'
    );
  }

  if (!result || result.success === false) {
    throw new Error(
      result?.error ||
      result?.message ||
      'Travel CRM backend request failed.'
    );
  }

  return result;
}

async function testBackendConnection() {
  try {
    const response = await callBackend('health');

    if (!response || response.success !== true) {
      throw new Error(
        'Invalid health response from backend.'
      );
    }

    console.log(
      '✅ [Travel CRM] Backend connected:',
      response
    );

    return true;
  } catch (error) {
    console.error(
      '❌ [Travel CRM] Backend connection failed:',
      error
    );

    showToast(
      getErrorMessage(error),
      'error'
    );

    return false;
  }
}

function normalizeEnvironment(environment) {
  const env = String(environment || 'TEST').trim().toUpperCase();
  if (env !== 'TEST' && env !== 'LIVE') {
    throw new Error('Invalid environment. Please use TEST or LIVE.');
  }
  return env;
}


/* =========================================================
   PREMIUM CONFIRMATION MODAL
   ========================================================= */

function setupPremiumConfirm() {
  const overlay = $('premiumConfirmOverlay');
  const modal = $('premiumConfirmModal');
  const cancel = $('premiumConfirmCancel');
  const accept = $('premiumConfirmAccept');
  const close = $('premiumConfirmClose');

  if (!overlay || !modal || !cancel || !accept) return;

  cancel.addEventListener('click', () => resolvePremiumConfirm(false));
  close?.addEventListener('click', () => resolvePremiumConfirm(false));
  accept.addEventListener('click', () => resolvePremiumConfirm(true));

  overlay.addEventListener('click', event => {
    if (event.target === overlay) {
      resolvePremiumConfirm(false);
    }
  });

  document.addEventListener('keydown', event => {
    if (
      event.key === 'Escape' &&
      !overlay.classList.contains('hidden')
    ) {
      event.preventDefault();
      resolvePremiumConfirm(false);
    }
  });
}

function showPremiumConfirm(options = {}) {
  const overlay = $('premiumConfirmOverlay');
  const modal = $('premiumConfirmModal');
  const icon = $('premiumConfirmIcon');
  const eyebrow = $('premiumConfirmEyebrow');
  const title = $('premiumConfirmTitle');
  const message = $('premiumConfirmMessage');
  const details = $('premiumConfirmDetails');
  const cancel = $('premiumConfirmCancel');
  const accept = $('premiumConfirmAccept');

  if (!overlay || !modal || !accept || !cancel) {
    return Promise.resolve(false);
  }

  if (typeof APP.premiumConfirmResolver === 'function') {
    APP.premiumConfirmResolver(false);
    APP.premiumConfirmResolver = null;
  }

  const tone = String(options.tone || 'warning').toLowerCase();

  modal.classList.remove(
    'premium-confirm-danger',
    'premium-confirm-warning',
    'premium-confirm-info'
  );
  modal.classList.add(
    tone === 'danger'
      ? 'premium-confirm-danger'
      : tone === 'info'
        ? 'premium-confirm-info'
        : 'premium-confirm-warning'
  );

  if (icon) {
    icon.textContent =
      options.icon ||
      (tone === 'danger' ? '!' : tone === 'info' ? 'i' : '⚠');
  }

  if (eyebrow) {
    eyebrow.textContent =
      options.eyebrow ||
      (tone === 'danger' ? 'LIVE DATABASE' : 'CONFIRM ACTION');
  }

  if (title) {
    title.textContent = options.title || 'Please Confirm';
  }

  if (message) {
    message.textContent = options.message || 'Please confirm this action.';
  }

  if (details) {
    const rows = Array.isArray(options.details) ? options.details : [];

    if (rows.length) {
      details.innerHTML = rows
        .map(item => {
          const label = escapeHtml(item?.label || '');
          const value = escapeHtml(item?.value || '');

          return `
            <div class="premium-confirm-detail-row">
              <span>${label}</span>
              <strong>${value}</strong>
            </div>
          `;
        })
        .join('');

      details.classList.remove('hidden');
    } else {
      details.innerHTML = '';
      details.classList.add('hidden');
    }
  }

  cancel.textContent = options.cancelText || 'Cancel';
  accept.textContent = options.confirmText || 'Confirm';

  overlay.classList.remove('hidden');
  document.body.classList.add('modal-open');

  requestAnimationFrame(() => {
    overlay.classList.add('active');
    accept.focus();
  });

  return new Promise(resolve => {
    APP.premiumConfirmResolver = resolve;
  });
}

function resolvePremiumConfirm(confirmed) {
  const overlay = $('premiumConfirmOverlay');

  if (overlay) {
    overlay.classList.remove('active');
  }

  document.body.classList.remove('modal-open');

  const resolver = APP.premiumConfirmResolver;
  APP.premiumConfirmResolver = null;

  window.setTimeout(() => {
    overlay?.classList.add('hidden');
  }, 180);

  if (typeof resolver === 'function') {
    resolver(Boolean(confirmed));
  }
}


/* =========================================================
   ENVIRONMENT SWITCH
   ========================================================= */

function setupEnvironmentSwitch() {
  const sw = $('environmentSwitch');
  if (!sw) return;

  sw.checked = APP.environment === 'LIVE';

  sw.addEventListener('change', async function() {
    const next = this.checked ? 'LIVE' : 'TEST';

    if (next === 'LIVE') {
      const confirmed = await showPremiumConfirm({
        tone: 'danger',
        icon: '●',
        eyebrow: 'LIVE DATABASE',
        title: 'Switch to LIVE Environment?',
        message:
          'You are about to enter the production customer database. ' +
          'New saves and profile updates will affect LIVE records.',
        details: [
          { label: 'Current Environment', value: 'TEST' },
          { label: 'Target Environment', value: 'LIVE' },
          { label: 'Database', value: 'Production / LIVE' }
        ],
        cancelText: 'Stay in TEST',
        confirmText: 'Enter LIVE'
      });

      if (!confirmed) {
        this.checked = false;
        return;
      }
    }

    APP.environment = normalizeEnvironment(next);
    updateEnvironmentUI();
    clearSearch();
    clearFamilySearchResults();
    clearFamilyHeadPickerSelection(false);
    await loadFamilyHeads();

    showToast(
      APP.environment === 'LIVE'
        ? 'LIVE environment selected.'
        : 'TEST environment selected.',
      'info'
    );
  });
}

function updateEnvironmentUI() {
  const live = APP.environment === 'LIVE';

  /* Shared with dashboard.html and Dashboard_Report.html. */
  localStorage.setItem('dashboardEnv', APP.environment);

  if ($('environmentText')) {
    $('environmentText').textContent = live ? 'LIVE' : 'TEST';
  }

  if ($('environmentIcon')) {
    $('environmentIcon').textContent = live ? '🔴' : '🧪';
  }

  if ($('bannerIcon')) {
    $('bannerIcon').textContent = live ? '🔴' : '🧪';
  }

  if ($('bannerTitle')) {
    $('bannerTitle').textContent =
      live ? 'LIVE ENVIRONMENT' : 'TEST ENVIRONMENT';
  }

  if ($('bannerMessage')) {
    $('bannerMessage').textContent =
      live
        ? '⚠ Data will be saved to the LIVE database.'
        : 'Data will be saved to the TEST database.';
  }

  $('environmentBanner')?.classList.toggle('test-banner', !live);
  $('environmentBanner')?.classList.toggle('live-banner', live);
}


/* =========================================================
   PERSON TYPE
   ========================================================= */

function setupPersonType() {
  document
    .querySelectorAll('input[name="personType"]')
    .forEach(radio => {
      radio.addEventListener('change', updatePersonTypeUI);
    });

  updatePersonTypeUI();
}

function updatePersonTypeUI() {
  const selected =
    document.querySelector('input[name="personType"]:checked');

  if (!selected) return;

  const member = selected.value === 'Family Member';

  $('headOption')?.classList.toggle('active', !member);
  $('memberOption')?.classList.toggle('active', member);
  $('familyHeadSection')?.classList.toggle('hidden', !member);

  if (member) {
    loadFamilyHeads();
  } else {
    clearFamilyHeadPickerSelection(false);
  }
}


/* =========================================================
   AGE
   ========================================================= */

function setupAgeCalculation() {
  const dob = $('dob');
  if (!dob) return;

  dob.addEventListener('change', calculateAge);
  dob.addEventListener('input', calculateAge);
}

function calculateAge() {
  const value = $('dob')?.value;

  if (!value) {
    if ($('age')) $('age').value = '';
    return;
  }

  const dob = new Date(value + 'T00:00:00');
  const today = new Date();

  if (isNaN(dob.getTime()) || dob > today) {
    if ($('age')) $('age').value = '';
    return;
  }

  let age = today.getFullYear() - dob.getFullYear();
  const month = today.getMonth() - dob.getMonth();

  if (
    month < 0 ||
    (month === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  if ($('age')) $('age').value = age;
}


/* =========================================================
   SEARCHABLE FAMILY HEAD PICKER
   ========================================================= */

function setupFamilyHeadSelector() {
  const search = $('familyHeadSearch');
  const clear = $('clearFamilyHeadSearch');
  const refresh = $('refreshFamilyHeads');
  const results = $('familyHeadPickerResults');

  search?.addEventListener('input', () => {
    const query = search.value.trim();

    clear?.classList.toggle('hidden', !query);
    renderFamilyHeadPicker(query);

    search.setAttribute(
      'aria-expanded',
      query || APP.familyHeads.length ? 'true' : 'false'
    );
  });

  search?.addEventListener('focus', () => {
    renderFamilyHeadPicker(search.value.trim());
  });

  search?.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      results?.classList.add('hidden');
      search.setAttribute('aria-expanded', 'false');
    }
  });

  clear?.addEventListener('click', () => {
    clearFamilyHeadPickerSelection(true);
  });

  refresh?.addEventListener('click', async () => {
    await loadFamilyHeads();

    if (search) {
      search.focus();
    }
  });

  document.addEventListener('click', event => {
    const section = $('familyHeadSection');

    if (
      section &&
      !section.classList.contains('hidden') &&
      !section.contains(event.target)
    ) {
      results?.classList.add('hidden');
      search?.setAttribute('aria-expanded', 'false');
    }
  });
}

async function loadFamilyHeads() {
  const hiddenSelect = $('familyHeadId');
  const meta = $('familyHeadPickerMeta');

  if (hiddenSelect) {
    hiddenSelect.innerHTML =
      '<option value="">Loading Family Heads...</option>';
  }

  if (meta) {
    meta.textContent = 'Loading Family Heads...';
  }

  try {
    const response = await callBackend('getFamilyHeads', {
      environment: APP.environment
    });

    APP.familyHeads = extractFamilyHeads(response);
    populateFamilyHeads();

    if (meta) {
      meta.textContent = APP.familyHeads.length
        ? `${APP.familyHeads.length} family head${
            APP.familyHeads.length === 1 ? '' : 's'
          } available. Search by name, Customer ID or Family ID.`
        : 'No Family Heads found in this environment.';
    }
  } catch (error) {
    if (hiddenSelect) {
      hiddenSelect.innerHTML =
        '<option value="">Unable to load Family Heads</option>';
    }

    if (meta) {
      meta.textContent = 'Unable to load Family Heads.';
    }

    $('familyHeadPickerResults')?.classList.add('hidden');
    showToast(getErrorMessage(error), 'error');
  }
}

function extractFamilyHeads(response) {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.data)) return response.data;
  return [];
}

function populateFamilyHeads() {
  const hiddenSelect = $('familyHeadId');

  if (hiddenSelect) {
    const currentValue = hiddenSelect.value;

    hiddenSelect.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = APP.familyHeads.length
      ? 'Select Family Head'
      : 'No Family Heads Found';

    hiddenSelect.appendChild(placeholder);

    APP.familyHeads.forEach(head => {
      const option = document.createElement('option');

      option.value =
        head.customerId ||
        head.familyHeadId ||
        '';

      option.textContent =
        (head.name || head.familyHeadName || 'Unknown') +
        ' — ' +
        (head.familyId || '') +
        ' (' +
        (head.memberCount || 0) +
        ' people)';

      hiddenSelect.appendChild(option);
    });

    if (
      currentValue &&
      APP.familyHeads.some(
        head =>
          String(head.customerId || head.familyHeadId || '') ===
          String(currentValue)
      )
    ) {
      hiddenSelect.value = currentValue;
    }
  }

  const search = $('familyHeadSearch');

  if (
    search &&
    !$('familyHeadSection')?.classList.contains('hidden') &&
    search.value.trim()
  ) {
    renderFamilyHeadPicker(search.value.trim());
  }
}

function renderFamilyHeadPicker(query = '') {
  const container = $('familyHeadPickerResults');
  const meta = $('familyHeadPickerMeta');

  if (!container) return;

  const normalizedQuery = String(query || '')
    .trim()
    .toLowerCase();

  let matches = APP.familyHeads.slice();

  if (normalizedQuery) {
    matches = matches.filter(head => {
      const haystack = [
        head.name,
        head.familyHeadName,
        head.customerId,
        head.familyHeadId,
        head.familyId
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }

  const visibleMatches = matches.slice(0, 20);

  if (meta) {
    if (!APP.familyHeads.length) {
      meta.textContent = 'No Family Heads found.';
    } else if (normalizedQuery) {
      meta.textContent =
        matches.length
          ? `${matches.length} matching famil${
              matches.length === 1 ? 'y' : 'ies'
            }. Showing ${visibleMatches.length}.`
          : 'No matching family found.';
    } else {
      meta.textContent =
        `${APP.familyHeads.length} family head${
          APP.familyHeads.length === 1 ? '' : 's'
        } available. Showing the first ${visibleMatches.length}.`;
    }
  }

  if (!visibleMatches.length) {
    container.innerHTML = `
      <div class="family-picker-empty">
        <span>⌕</span>
        <strong>No family found</strong>
        <small>Try Family Head name, Customer ID or Family ID.</small>
      </div>
    `;

    container.classList.remove('hidden');
    return;
  }

  container.innerHTML = visibleMatches
    .map((head, index) => {
      const customerId =
        head.customerId ||
        head.familyHeadId ||
        '';

      const name =
        head.name ||
        head.familyHeadName ||
        'Unknown Family Head';

      const familyId = head.familyId || '';
      const count = Number(head.memberCount || 0);

      return `
        <button
          type="button"
          class="family-picker-item"
          data-family-head-id="${escapeHtml(customerId)}"
          role="option"
        >
          <span class="family-picker-avatar">👑</span>

          <span class="family-picker-copy">
            <strong>${escapeHtml(name)}</strong>
            <small>
              ${escapeHtml(familyId || 'No Family ID')}
              ${customerId ? ' • ' + escapeHtml(customerId) : ''}
            </small>
          </span>

          <span class="family-picker-count">
            ${escapeHtml(String(count))}
            <small>people</small>
          </span>
        </button>
      `;
    })
    .join('');

  container
    .querySelectorAll('.family-picker-item')
    .forEach(button => {
      button.addEventListener('click', () => {
        selectFamilyHead(button.dataset.familyHeadId || '');
      });
    });

  container.classList.remove('hidden');
  $('familyHeadSearch')?.setAttribute('aria-expanded', 'true');
}

function selectFamilyHead(customerId) {
  const head = APP.familyHeads.find(item =>
    String(item.customerId || item.familyHeadId || '') ===
    String(customerId)
  );

  if (!head) return;

  const hiddenSelect = $('familyHeadId');
  const search = $('familyHeadSearch');

  if (hiddenSelect) {
    hiddenSelect.value =
      head.customerId ||
      head.familyHeadId ||
      '';
  }

  if (search) {
    search.value =
      head.name ||
      head.familyHeadName ||
      '';

    search.setAttribute('aria-expanded', 'false');
  }

  $('clearFamilyHeadSearch')?.classList.remove('hidden');
  $('familyHeadPickerResults')?.classList.add('hidden');

  showSelectedFamily(head);
}

function clearFamilyHeadPickerSelection(focusSearch = false) {
  const hiddenSelect = $('familyHeadId');
  const search = $('familyHeadSearch');
  const results = $('familyHeadPickerResults');

  if (hiddenSelect) {
    hiddenSelect.value = '';
  }

  if (search) {
    search.value = '';
    search.setAttribute('aria-expanded', 'false');
  }

  $('clearFamilyHeadSearch')?.classList.add('hidden');
  results?.classList.add('hidden');

  hideFamilyInfo();

  if (focusSearch) {
    search?.focus();
    renderFamilyHeadPicker('');
  }
}

function showSelectedFamily(family) {
  const box = $('familyInfo');
  if (!box) return;

  const name =
    family.name ||
    family.familyHeadName ||
    'Family Head';

  const familyId = family.familyId || '';
  const customerId =
    family.customerId ||
    family.familyHeadId ||
    '';

  const count = Number(family.memberCount || 0);

  box.innerHTML = `
    <div class="selected-family-card">
      <div class="selected-family-icon">✓</div>

      <div class="selected-family-copy">
        <small>SELECTED FAMILY</small>
        <strong>${escapeHtml(name)}</strong>
        <span>
          ${escapeHtml(familyId)}
          ${customerId ? ' • ' + escapeHtml(customerId) : ''}
          • ${escapeHtml(String(count))} people
        </span>
      </div>

      <button
        type="button"
        class="selected-family-change"
        id="changeSelectedFamily"
      >
        Change
      </button>
    </div>
  `;

  box.classList.remove('hidden');

  $('changeSelectedFamily')?.addEventListener('click', () => {
    clearFamilyHeadPickerSelection(true);
  });
}

function hideFamilyInfo() {
  const box = $('familyInfo');
  if (!box) return;

  box.innerHTML = '';
  box.classList.add('hidden');
}


function setupCustomerButtons(){$('saveButton')?.addEventListener('click',saveCustomer);$('clearButton')?.addEventListener('click',clearCustomerForm)}
async function saveCustomer() {
  const type =
    document.querySelector('input[name="personType"]:checked');

  if (!type) {
    showToast('Please select Customer Type.', 'error');
    return;
  }

  const data = {
    name: getValue('name'),
    dob: getValue('dob'),
    age: getValue('age'),
    sex: getValue('sex'),
    idProof: getValue('idProof'),
    idNumber: getValue('idNumber'),
    mobileNumber: getValue('mobileNumber'),
    emailId: getValue('emailId'),
    personType: type.value,
    familyHeadId: getValue('familyHeadId')
  };

  if (!validateForm(data)) return;

  if (APP.environment === 'LIVE') {
    const confirmed = await showPremiumConfirm({
      tone: 'danger',
      icon: '●',
      eyebrow: 'LIVE CUSTOMER SAVE',
      title: 'Save Customer to LIVE?',
      message:
        'This customer will be written to the production database. ' +
        'Please verify the details before continuing.',
      details: [
        { label: 'Customer', value: data.name || 'New Customer' },
        { label: 'Type', value: data.personType || '' },
        { label: 'Mobile', value: data.mobileNumber || '' }
      ],
      cancelText: 'Review Details',
      confirmText: 'Save to LIVE'
    });

    if (!confirmed) return;
  }

  setLoading(true, 'Saving customer...');
  disableSaveButton(true);

  try {
    const response = await callBackend('saveCustomer', {
      environment: APP.environment,
      formData: data
    });

    const result = extractResponseData(response);

    if (!result || result.success === false) {
      throw new Error(
        result?.error ||
        result?.message ||
        'Customer could not be saved.'
      );
    }

    showSaveSuccess(result);
    clearCustomerForm(false);
    await loadFamilyHeads();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    setLoading(false);
    disableSaveButton(false);
  }
}

function validateForm(d){const fields=[['name','Please enter the customer name.'],['dob','Please enter Date of Birth.'],['sex','Please select Sex.'],['mobileNumber','Please enter Mobile Number.'],['idProof','Please select ID Proof.'],['idNumber','Please enter ID Number.']];for(const f of fields){if(!d[f[0]]){showToast(f[1],'error');focusElement(f[0]);return false}}if(d.personType==='Family Member'&&!d.familyHeadId){showToast('Please select a Family Head.','error');focusElement('familyHeadSearch');return false}const idError=validateIdNumberFrontend(d.idProof,d.idNumber);if(idError){showToast(idError,'error');focusElement('idNumber');return false}return true}
function setupIdNumberFormatting(){const input=$('idNumber');if(!input)return;input.addEventListener('input',function(){const p=getValue('idProof');this.value=p==='Aadhaar Card'?this.value.replace(/\D/g,'').slice(0,12):this.value.toUpperCase()});$('idProof')?.addEventListener('change',updateIdPlaceholder);updateIdPlaceholder()}
function updateIdPlaceholder(){const p=getValue('idProof'),i=$('idNumber');if(!i)return;i.placeholder=({'Aadhaar Card':'Enter 12-digit Aadhaar number','PAN Card':'Example: ABCDE1234F','Passport':'Example: A1234567','Driving License':'Enter Driving License number','Voter ID':'Example: ABC1234567','Other':'Enter ID number'})[p]||'Enter ID number'}
function validateIdNumberFrontend(proof,id){const p=String(proof||'').trim().toLowerCase(),v=String(id||'').trim().replace(/\s+/g,'').toUpperCase();if(!v)return'ID Number is required.';if(p==='aadhaar card'&&!/^\d{12}$/.test(v))return'Invalid Aadhaar number. Aadhaar must contain exactly 12 digits.';if(p==='pan card'&&!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v))return'Invalid PAN number. Expected format: ABCDE1234F.';if(p==='passport'&&!/^[A-Z][0-9]{7}$/.test(v))return'Invalid Passport number. Expected format: A1234567.';if(p==='driving license'&&!/^[A-Z0-9-]{8,20}$/.test(v))return'Invalid Driving License number.';if(p==='voter id'&&!/^[A-Z]{3}[0-9]{7}$/.test(v))return'Invalid Voter ID. Expected format: ABC1234567.';if(p==='other'&&v.length<3)return'Please enter a valid ID number.';return''}

/* =========================================================
   PHASE 4 — CUSTOMER SEARCH / CARDS
   ========================================================= */
function setupCustomerSearch(){const i=$('customerSearchInput'),b=$('customerSearchButton'),c=$('clearCustomerSearch');if(!i||!b)return;b.addEventListener('click',performCustomerSearch);i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();performCustomerSearch()}});i.addEventListener('input',()=>c?.classList.toggle('hidden',!i.value.trim()));c?.addEventListener('click',clearSearch)}
async function performCustomerSearch(){const i=$('customerSearchInput'),b=$('customerSearchButton');if(!i)return;const q=i.value.trim();if(!q){showSearchStatus('Please enter a name, Customer ID, Family ID, mobile, email or ID number.',true);i.focus();return}clearResultsOnly();showSearchStatus('Searching customer and family database...',false);setLoading(true,'Searching database...');if(b)b.disabled=true;try{const cr=await callBackend('searchCustomers',{searchText:q,environment:APP.environment});const customers=extractResponseData(cr);renderCustomerCards(Array.isArray(customers)?customers:[]);const fr=await callBackend('searchFamilies',{searchText:q,environment:APP.environment});const families=extractResponseData(fr);renderFamilyCards(Array.isArray(families)?families:[]);const cc=Array.isArray(customers)?customers.length:0,fc=Array.isArray(families)?families.length:0;showSearchStatus(cc===0&&fc===0?'No customer or family record found.':`${cc} customer${cc===1?'':'s'} · ${fc} famil${fc===1?'y':'ies'} found.`,cc===0&&fc===0)}catch(e){showSearchStatus(getErrorMessage(e),true)}finally{setLoading(false);if(b)b.disabled=false}}
function renderCustomerCards(customers){const c=$('customerResults'),g=$('customerCardsGrid');if(!c||!g)return;g.innerHTML='';if(!customers.length){c.classList.add('hidden');return}customers.forEach(x=>{const head=String(x.personType||'').toLowerCase()==='family head',card=document.createElement('article');card.className='customer-card';card.innerHTML='<div class="customer-card-head"><div class="customer-identity"><div class="customer-avatar">'+(head?'👑':'👤')+'</div><div><div class="customer-name">'+escapeHtml(x.name||'')+'</div><div class="customer-id">'+escapeHtml(x.customerId||'')+'</div></div></div><div class="customer-badge">'+(head?'FAMILY HEAD':'MEMBER')+'</div></div><div class="customer-details"><div class="customer-detail">👪 '+escapeHtml(x.familyId||'')+'</div><div class="customer-detail">📱 '+escapeHtml(x.mobileNumber||'')+'</div>'+(x.emailId?'<div class="customer-detail">✉ '+escapeHtml(x.emailId)+'</div>':'')+'<div class="customer-detail">🪪 '+escapeHtml(x.idProof||'')+': '+escapeHtml(x.idNumber||'')+'</div></div>';g.appendChild(card)});c.classList.remove('hidden')}
function renderFamilyCards(families){const c=$('familyResults'),g=$('familyCardsGrid');if(!c||!g)return;g.innerHTML='';if(!families.length){c.classList.add('hidden');return}families.forEach(f=>{const h=f.familyHead||{},members=Array.isArray(f.members)?f.members:[],total=f.totalPeople||f.memberCount||(members.length+1),card=document.createElement('article');card.className='family-card';card.innerHTML='<div class="family-card-header"><div class="family-head-info"><div class="family-avatar">👑</div><div><div class="family-head-name">'+escapeHtml(h.name||f.familyHeadName||f.name||'Family')+'</div><div class="family-id-text">Family ID: '+escapeHtml(f.familyId||'')+'</div></div></div><div class="family-count">'+escapeHtml(String(total))+' People</div></div><div class="family-card-meta"><div class="family-meta-box">Head ID<strong>'+escapeHtml(h.customerId||f.familyHeadId||f.customerId||'')+'</strong></div><div class="family-meta-box">Members<strong>'+escapeHtml(String(Math.max(0,Number(total)-1)))+'</strong></div></div><button type="button" class="btn btn-secondary family-view-button">View Family</button>';card.querySelector('.family-view-button')?.addEventListener('click',e=>{e.stopPropagation();showFamilyDetails(f)});g.appendChild(card)});c.classList.remove('hidden')}

/* =========================================================
   FAMILY MANAGEMENT
   ========================================================= */
function setupFamilySearch(){const i=$('familySearchInput'),b=$('familySearchButton'),c=$('clearFamilySearch');if(!i||!b)return;b.addEventListener('click',e=>{e.preventDefault();performFamilySearch()});i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();performFamilySearch()}});i.addEventListener('input',()=>c?.classList.toggle('hidden',!i.value.trim()));c?.addEventListener('click',()=>{i.value='';clearFamilySearchResults();i.focus()})}
async function performFamilySearch(){const i=$('familySearchInput'),b=$('familySearchButton');if(!i)return;const q=i.value.trim();if(!q){showFamilySearchStatus('Please enter a Family Head name, Family ID, Member name, Mobile or Email.',true);i.focus();return}clearFamilyDetails();showFamilySearchStatus('Searching...',false);setLoading(true,'Searching family database...');if(b)b.disabled=true;try{const r=await callBackend('searchFamilies',{searchText:q,environment:APP.environment});APP.searchResults=extractSearchResults(r);renderFamilySearchResults()}catch(e){showFamilySearchStatus(getErrorMessage(e),true)}finally{setLoading(false);if(b)b.disabled=false}}
function extractSearchResults(r){if(Array.isArray(r))return r;if(r&&Array.isArray(r.data))return r.data;if(r&&Array.isArray(r.results))return r.results;if(r?.data&&Array.isArray(r.data.results))return r.data.results;return []}
function renderFamilySearchResults(){const c=$('familySearchResults');if(!c)return;c.innerHTML='';if(!APP.searchResults.length){c.classList.remove('hidden');c.innerHTML='<div class="family-empty-state"><div class="family-empty-icon">🔍</div><strong>No families found</strong><p>Try Family Head name, Family ID, member name, mobile number or email.</p></div>';showFamilySearchStatus('No family found matching your search.',true);return}showFamilySearchStatus(APP.searchResults.length+' family record'+(APP.searchResults.length===1?'':'s')+' found.',false);APP.searchResults.forEach(f=>{const h=f.familyHead||{},item=document.createElement('div'),name=f.familyHeadName||h.name||f.name||'Unknown Family Head',id=f.familyId||'',headId=f.familyHeadId||h.customerId||f.customerId||'',count=f.memberCount||f.totalPeople||0;item.className='family-result';item.innerHTML='<div class="family-result-top"><div><div class="family-result-name">'+escapeHtml(name)+'</div><div class="family-result-meta">Family ID: '+escapeHtml(id)+' · Head ID: '+escapeHtml(headId)+'</div></div><div class="family-count">'+escapeHtml(String(count))+' People</div></div>';item.addEventListener('click',()=>showFamilyDetails(f));c.appendChild(item)});c.classList.remove('hidden')}
async function showFamilyDetails(f){if(!f)return;if(f.familyHead&&Array.isArray(f.members)){renderFamilyDetails(f);return}if(!f.familyId){showToast('Family ID is missing.','error');return}setLoading(true,'Loading family details...');try{const r=await callBackend('getFamilyDetails',{familyId:f.familyId,environment:APP.environment});const d=extractResponseData(r);if(!d)throw new Error('Family could not be found.');renderFamilyDetails(d)}catch(e){showToast(getErrorMessage(e),'error')}finally{setLoading(false)}}
function renderFamilyDetails(f){const c=$('familyDetails');if(!c||!f)return;const h=f.familyHead||{},m=Array.isArray(f.members)?f.members:[],total=f.totalPeople||(m.length+1);let rows=createFamilyRow(h,true);m.forEach(x=>rows+=createFamilyRow(x,false));c.innerHTML='<div class="family-detail-header"><div><h3>'+escapeHtml(h.name||f.familyHeadName||'Family')+'</h3><div class="family-id">Family ID: '+escapeHtml(f.familyId||'')+'</div></div><div class="family-count">'+escapeHtml(String(total))+' People</div></div><div class="family-table-wrapper"><table class="family-table"><thead><tr><th>Type</th><th>Name</th><th>Age</th><th>Sex</th><th>Mobile</th><th>Email</th><th>ID Proof</th><th>ID Number</th></tr></thead><tbody>'+rows+'</tbody></table></div>';c.classList.remove('hidden');c.scrollIntoView({behavior:'smooth',block:'start'})}
function createFamilyRow(p,head){p=p||{};return '<tr class="'+(head?'family-head-row':'')+'"><td>'+(head?'👑 Head':'Member')+'</td><td><strong>'+escapeHtml(p.name||'')+'</strong><br><small>'+escapeHtml(p.customerId||'')+'</small></td><td>'+escapeHtml(String(p.age||''))+'</td><td>'+escapeHtml(p.sex||'')+'</td><td>'+escapeHtml(p.mobileNumber||'')+'</td><td>'+escapeHtml(p.emailId||'')+'</td><td>'+escapeHtml(p.idProof||'')+'</td><td>'+escapeHtml(p.idNumber||'')+'</td></tr>'}

function clearSearch(){if($('customerSearchInput'))$('customerSearchInput').value='';$('clearCustomerSearch')?.classList.add('hidden');clearResultsOnly()}
function clearResultsOnly(){['customerResults','familyResults'].forEach(id=>{$(id)?.classList.add('hidden');const g=$(id)?.querySelectorAll('.customer-cards-grid,.family-cards-grid');g?.forEach(x=>x.innerHTML='')});if($('searchStatus')){$('searchStatus').textContent='';$('searchStatus').classList.add('hidden')}}
function showSearchStatus(m,e){const s=$('searchStatus');if(!s)return;s.textContent=m;s.style.color=e?'#ff7180':'';s.classList.remove('hidden')}
function showFamilySearchStatus(m,e){const s=$('familySearchStatus');if(!s)return;s.textContent=m;s.style.color=e?'#ff7180':'';s.classList.remove('hidden')}
function clearFamilySearchResults(){APP.searchResults=[];if($('familySearchInput'))$('familySearchInput').value='';$('clearFamilySearch')?.classList.add('hidden');if($('familySearchResults')){$('familySearchResults').innerHTML='';$('familySearchResults').classList.add('hidden')}if($('familySearchStatus')){$('familySearchStatus').textContent='';$('familySearchStatus').classList.add('hidden')}clearFamilyDetails()}
function clearFamilyDetails(){if($('familyDetails')){$('familyDetails').innerHTML='';$('familyDetails').classList.add('hidden')}}

function showSaveSuccess(r){const c=$('successCard'),d=$('successDetails');if(!c||!d)return;d.innerHTML='Customer ID: <strong>'+escapeHtml(r.customerId||'')+'</strong><br>Family ID: <strong>'+escapeHtml(r.familyId||'')+'</strong>'+(r.familyHeadName?'<br>Family Head: <strong>'+escapeHtml(r.familyHeadName)+'</strong>':'');c.classList.remove('hidden');c.scrollIntoView({behavior:'smooth',block:'center'});showToast('Customer saved successfully.','success');setTimeout(()=>c.classList.add('hidden'),8000)}
function clearCustomerForm(showMessage=true){['name','dob','age','sex','mobileNumber','emailId','idProof','idNumber'].forEach(id=>{if($(id))$(id).value=''});if($('familyHeadId'))$('familyHeadId').value='';hideFamilyInfo();const r=document.querySelector('input[name="personType"][value="Family Head"]');if(r)r.checked=true;updatePersonTypeUI();updateIdPlaceholder();$('successCard')?.classList.add('hidden');if(showMessage)showToast('Form cleared.','info')}
function setLoading(v,m){const o=$('loadingOverlay');if(!o)return;if(m&&$('loadingText'))$('loadingText').textContent=m;o.classList.toggle('hidden',!v)}
function disableSaveButton(v){const b=$('saveButton');if(!b)return;b.disabled=v;if($('saveText'))$('saveText').textContent=v?'Saving...':'Save Customer'}
let toastTimer=null;function showToast(m,type='info'){const t=$('toast');if(!t)return;if($('toastMessage'))$('toastMessage').textContent=m;if($('toastIcon'))$('toastIcon').textContent=type==='success'?'✓':type==='error'?'⚠':'i';t.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.add('hidden'),5000)}
function extractResponseData(r){return r&&r.data!==undefined?r.data:r}
function getValue(id){const e=$(id);return e?String(e.value||'').trim():''}
function focusElement(id){$(id)?.focus()}
function getErrorMessage(e){if(!e)return'Unknown error occurred.';if(typeof e==='string')return e;return e.message||e.error||'Unexpected error occurred.'}
function escapeHtml(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}


/* =========================================================
   PHASE 5 — TRAVEL CRM EXPANSION
   ========================================================= */

function setupPhase5() {
  $('loadTravelProfileButton')?.addEventListener('click', loadTravelProfile);
  $('saveTravelProfileButton')?.addEventListener('click', saveTravelProfile);
  $('clearTravelProfileButton')?.addEventListener('click', clearTravelProfileForm);
  $('saveTravelHistoryButton')?.addEventListener('click', addTravelHistory);
  $('saveBookingButton')?.addEventListener('click', addBooking);
  $('cancelBookingEditButton')?.addEventListener('click', clearBookingEntry);

  $('travelProfileCustomerId')?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      loadTravelProfile();
    }
  });

  renderTravelHistory();
  renderBookings();
  updateBookingEntryMode();
}

async function loadTravelProfile() {
  const customerId = getValue('travelProfileCustomerId').toUpperCase();
  if (!customerId) {
    showTravelProfileStatus('Please enter a Customer ID.', true);
    focusElement('travelProfileCustomerId');
    return;
  }

  setLoading(true, 'Loading travel profile...');
  try {
    const response = await callBackend('getTravelProfile', {
      customerId,
      environment: APP.environment
    });
    const profile = extractResponseData(response);
    if (!profile || !profile.customerId) {
      throw new Error('Customer travel profile was not found.');
    }
    APP.currentTravelCustomerId = profile.customerId;
    populateTravelProfile(profile);
    showTravelProfileStatus('Travel profile loaded successfully.', false);
  } catch (e) {
    showTravelProfileStatus(getErrorMessage(e), true);
  } finally {
    setLoading(false);
  }
}

function populateTravelProfile(p) {
  const f = p && p.fields && typeof p.fields === 'object' ? p.fields : {};
  const value = h => f[h] == null ? '' : String(f[h]);
  const map = {
    travelMobileNumber: value('Mobile Number'),
    travelEmailId: value('Email ID'),
    addressLine1: value('Address Line 1'),
    addressLine2: value('Address Line 2'),
    city: value('City'),
    state: value('State'),
    postalCode: value('Postal Code'),
    country: value('Country'),
    passportNumber: value('Passport Number'),
    passportIssueDate: value('Passport Issue Date'),
    passportExpiry: value('Passport Expiry'),
    nationality: value('Nationality'),
    passportPlaceOfIssue: value('Passport Place of Issue'),
    visaType: value('Visa Type'),
    visaCountry: value('Visa Country'),
    visaNumber: value('Visa Number'),
    visaIssueDate: value('Visa Issue Date'),
    visaExpiryDate: value('Visa Expiry'),
    visaNotes: value('Visa Notes')
  };
  Object.keys(map).forEach(id => {
    const element = $(id);
    if (!element) return;

    if (id === 'state') {
      ensureStateOption(map[id]);
    }

    element.value = map[id];
  });

  if ($('country') && !getValue('country')) {
    $('country').value = 'India';
  }
  APP.travelHistory = Array.isArray(p.travelHistory) ? p.travelHistory : [];
  APP.bookings = Array.isArray(p.bookings) ? p.bookings : [];
  renderTravelHistory();
  renderBookings();
  $('travelProfileForm')?.classList.remove('hidden');
}


function ensureStateOption(stateValue) {
  const select = $('state');
  const value = String(stateValue || '').trim();

  if (!select || !value) return;

  const exists = Array
    .from(select.options)
    .some(option => option.value === value);

  if (exists) return;

  const group = $('stateOtherOptions') || select;

  const option = document.createElement('option');
  option.value = value;
  option.textContent = value;

  group.appendChild(option);
}

function collectTravelProfile() {
  return {
    customerId: APP.currentTravelCustomerId || getValue('travelProfileCustomerId').toUpperCase(),
    fields: {
      'Mobile Number': getValue('travelMobileNumber'),
      'Email ID': getValue('travelEmailId'),
      'Address Line 1': getValue('addressLine1'),
      'Address Line 2': getValue('addressLine2'),
      'City': getValue('city'),
      'State': getValue('state'),
      'Postal Code': getValue('postalCode'),
      'Country': getValue('country'),
      'Passport Number': getValue('passportNumber').toUpperCase(),
      'Passport Issue Date': getValue('passportIssueDate'),
      'Passport Expiry': getValue('passportExpiry'),
      'Nationality': getValue('nationality'),
      'Passport Place of Issue': getValue('passportPlaceOfIssue'),
      'Visa Type': getValue('visaType'),
      'Visa Country': getValue('visaCountry'),
      'Visa Number': getValue('visaNumber').toUpperCase(),
      'Visa Issue Date': getValue('visaIssueDate'),
      'Visa Expiry': getValue('visaExpiryDate'),
      'Visa Notes': getValue('visaNotes'),
      // Summary fields stored in Customers sheet.
      // Detailed records are also maintained in the dedicated sheets.
      'Travel History': APP.travelHistory.length ? JSON.stringify(APP.travelHistory) : '',
      'Booking Linkage': APP.bookings.length ? JSON.stringify(APP.bookings) : ''
    },
    travelHistory: APP.travelHistory.map(x => ({ fields: {
      'Travel Date': x.travelDate || '',
      'Destination': x.destination || '',
      'Country': x.country || '',
      'Purpose': x.purpose || '',
      'Return Date': x.returnDate || '',
      'Notes': x.notes || ''
    }})),
    bookings: APP.bookings.map(x => ({ fields: {
      'Booking Reference': x.bookingReference || '',
      'Booking Date': x.bookingDate || '',
      'Status': x.status || '',
      'Destination': x.destination || '',
      'Travel Date': x.travelDate || '',
      'Amount': x.amount || '',
      'Notes': x.notes || ''
    }}))
  };
}

async function saveTravelProfile() {
  const data = collectTravelProfile();
  if (!data.customerId) {
    showTravelProfileStatus('Please load or enter a valid Customer ID.', true);
    return;
  }
  const fields = data.fields || {};
  const passportIssueDate = fields['Passport Issue Date'] || '';
  const passportExpiry = fields['Passport Expiry'] || '';
  const visaIssueDate = fields['Visa Issue Date'] || '';
  const visaExpiryDate = fields['Visa Expiry'] || '';

  if (
    passportIssueDate &&
    passportExpiry &&
    passportExpiry < passportIssueDate
  ) {
    showTravelProfileStatus(
      'Passport expiry cannot be before passport issue date.',
      true
    );
    return;
  }

  if (
    visaIssueDate &&
    visaExpiryDate &&
    visaExpiryDate < visaIssueDate
  ) {
    showTravelProfileStatus(
      'Visa expiry cannot be before visa issue date.',
      true
    );
    return;
  }
  if (APP.environment === 'LIVE') {
    const confirmed = await showPremiumConfirm({
      tone: 'danger',
      icon: '●',
      eyebrow: 'LIVE TRAVEL PROFILE',
      title: 'Save Travel Profile to LIVE?',
      message:
        'This will update the production customer profile and replace the ' +
        'customer’s saved travel-history / booking linkage with the records currently shown.',
      details: [
        { label: 'Customer ID', value: data.customerId },
        {
          label: 'Travel History',
          value: `${APP.travelHistory.length} record${
            APP.travelHistory.length === 1 ? '' : 's'
          }`
        },
        {
          label: 'Bookings',
          value: `${APP.bookings.length} booking${
            APP.bookings.length === 1 ? '' : 's'
          }`
        }
      ],
      cancelText: 'Review Profile',
      confirmText: 'Save to LIVE'
    });

    if (!confirmed) return;
  }

  setLoading(true, 'Saving travel profile...');
  const button = $('saveTravelProfileButton');
  if (button) button.disabled = true;
  try {
    const response = await callBackend('saveTravelProfile', {
      formData: data,
      environment: APP.environment
    });
    const result = extractResponseData(response);
    if (!result || result.success === false) {
      throw new Error(result?.error || 'Travel profile could not be saved.');
    }
    showTravelProfileStatus('Travel profile saved successfully.', false);
    showToast('Travel profile saved successfully.', 'success');
  } catch (e) {
    showTravelProfileStatus(getErrorMessage(e), true);
  } finally {
    setLoading(false);
    if (button) button.disabled = false;
  }
}

function addTravelHistory() {
  const item = {
    travelDate: getValue('travelDate'),
    destination: getValue('travelDestination'),
    country: getValue('travelCountry'),
    purpose: getValue('travelPurpose'),
    returnDate: getValue('travelReturnDate'),
    notes: getValue('travelHistoryNotes')
  };
  if (!item.destination && !item.country) {
    showToast('Please enter a travel destination or country.', 'error');
    return;
  }
  APP.travelHistory.push(item);
  ['travelDate','travelDestination','travelCountry','travelPurpose','travelReturnDate','travelHistoryNotes']
    .forEach(id => { if ($(id)) $(id).value = ''; });
  renderTravelHistory();
}

function renderTravelHistory() {
  const c = $('travelHistoryList');
  if (!c) return;
  if (!APP.travelHistory.length) {
    c.innerHTML = '<div class="travel-empty">No travel history added.</div>';
    return;
  }
  c.innerHTML = APP.travelHistory.map((x,i) => `
    <div class="travel-history-card">
      <div>
        <strong>${escapeHtml(x.destination || x.country || 'Travel')}</strong>
        <div class="travel-history-meta">
          ${escapeHtml(x.country || '')}
          ${x.travelDate ? ' • ' + escapeHtml(x.travelDate) : ''}
          ${x.returnDate ? ' → ' + escapeHtml(x.returnDate) : ''}
          ${x.purpose ? ' • ' + escapeHtml(x.purpose) : ''}
          ${x.notes ? '<br>' + escapeHtml(x.notes) : ''}
        </div>
      </div>
      <button type="button" class="travel-remove-button" data-index="${i}">Remove</button>
    </div>`).join('');
  c.querySelectorAll('.travel-remove-button').forEach(btn => {
    btn.addEventListener('click', () => {
      APP.travelHistory.splice(Number(btn.dataset.index), 1);
      renderTravelHistory();
    });
  });
}

function addBooking() {
  const item = {
    bookingReference: getValue('bookingReference'),
    bookingDate: getValue('bookingDate'),
    status: getValue('bookingStatus'),
    destination: getValue('bookingDestination'),
    travelDate: getValue('bookingTravelDate'),
    amount: getValue('bookingAmount'),
    notes: getValue('bookingNotes')
  };

  if (!item.bookingReference) {
    showToast('Please enter a booking reference.', 'error');
    focusElement('bookingReference');
    return;
  }

  const duplicateReference = APP.bookings.findIndex(
    (booking, index) =>
      index !== APP.editingBookingIndex &&
      String(booking.bookingReference || '')
        .trim()
        .toLowerCase() ===
      String(item.bookingReference || '')
        .trim()
        .toLowerCase()
  );

  if (duplicateReference >= 0) {
    showToast(
      'This booking reference is already linked. Edit the existing booking or use a different reference.',
      'error'
    );
    focusElement('bookingReference');
    return;
  }

  if (
    Number.isInteger(APP.editingBookingIndex) &&
    APP.editingBookingIndex >= 0
  ) {
    APP.bookings[APP.editingBookingIndex] = item;
    showToast('Booking updated.', 'success');
  } else {
    APP.bookings.push(item);
    showToast(
      `Booking added. ${APP.bookings.length} booking${
        APP.bookings.length === 1 ? '' : 's'
      } linked.`,
      'success'
    );
  }

  clearBookingEntry();
  renderBookings();
}

function clearBookingEntry() {
  [
    'bookingReference',
    'bookingDate',
    'bookingStatus',
    'bookingDestination',
    'bookingTravelDate',
    'bookingAmount',
    'bookingNotes'
  ].forEach(id => {
    if ($(id)) $(id).value = '';
  });

  APP.editingBookingIndex = -1;
  updateBookingEntryMode();
}

function updateBookingEntryMode() {
  const text = $('saveBookingButtonText');
  const cancel = $('cancelBookingEditButton');
  const editing =
    Number.isInteger(APP.editingBookingIndex) &&
    APP.editingBookingIndex >= 0;

  if (text) {
    text.textContent =
      editing ? '✓ Update Booking' : '＋ Add Booking';
  }

  cancel?.classList.toggle('hidden', !editing);
}

function startBookingEdit(index) {
  const booking = APP.bookings[index];
  if (!booking) return;

  APP.editingBookingIndex = index;

  const values = {
    bookingReference: booking.bookingReference || '',
    bookingDate: booking.bookingDate || '',
    bookingStatus: booking.status || '',
    bookingDestination: booking.destination || '',
    bookingTravelDate: booking.travelDate || '',
    bookingAmount: booking.amount || '',
    bookingNotes: booking.notes || ''
  };

  Object.keys(values).forEach(id => {
    if ($(id)) $(id).value = values[id];
  });

  updateBookingEntryMode();

  $('bookingReference')?.focus();
  $('bookingReference')?.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}

function duplicateBooking(index) {
  const booking = APP.bookings[index];
  if (!booking) return;

  APP.editingBookingIndex = -1;

  const values = {
    bookingReference: '',
    bookingDate: booking.bookingDate || '',
    bookingStatus: booking.status || '',
    bookingDestination: booking.destination || '',
    bookingTravelDate: booking.travelDate || '',
    bookingAmount: booking.amount || '',
    bookingNotes: booking.notes || ''
  };

  Object.keys(values).forEach(id => {
    if ($(id)) $(id).value = values[id];
  });

  updateBookingEntryMode();

  showToast(
    'Booking details copied. Enter a new Booking Reference and add it.',
    'info'
  );

  $('bookingReference')?.focus();
  $('bookingReference')?.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}

async function removeBooking(index) {
  const booking = APP.bookings[index];
  if (!booking) return;

  const confirmed = await showPremiumConfirm({
    tone: 'warning',
    icon: '×',
    eyebrow: 'REMOVE BOOKING',
    title: 'Remove Linked Booking?',
    message:
      'The booking will be removed from the current profile. ' +
      'The change is persisted when you save the Travel Profile.',
    details: [
      {
        label: 'Booking Reference',
        value: booking.bookingReference || 'Booking'
      },
      {
        label: 'Destination',
        value: booking.destination || '—'
      }
    ],
    cancelText: 'Keep Booking',
    confirmText: 'Remove'
  });

  if (!confirmed) return;

  APP.bookings.splice(index, 1);

  if (APP.editingBookingIndex === index) {
    clearBookingEntry();
  } else if (APP.editingBookingIndex > index) {
    APP.editingBookingIndex -= 1;
  }

  renderBookings();
  showToast('Booking removed from current profile.', 'info');
}

function renderBookings() {
  const container = $('bookingList');
  const countBadge = $('bookingCountBadge');

  if (countBadge) {
    countBadge.textContent =
      `${APP.bookings.length} BOOKING${
        APP.bookings.length === 1 ? '' : 'S'
      }`;
  }

  if (!container) return;

  if (!APP.bookings.length) {
    container.innerHTML = `
      <div class="travel-empty booking-empty-state">
        <span class="booking-empty-icon">🎫</span>
        <strong>No bookings linked yet</strong>
        <small>
          Enter booking details above and select “Add Booking”.
          You can link multiple bookings before saving the profile.
        </small>
      </div>
    `;

    return;
  }

  container.innerHTML = APP.bookings
    .map((booking, index) => {
      const amount = booking.amount
        ? escapeHtml(booking.amount)
        : '';

      return `
        <div class="booking-card premium-booking-card">
          <div class="booking-card-main">
            <div class="booking-card-title-row">
              <div class="booking-ticket-icon">🎫</div>

              <div>
                <strong>
                  ${escapeHtml(
                    booking.bookingReference || 'Booking'
                  )}
                </strong>

                <div class="booking-status-line">
                  ${
                    booking.status
                      ? `<span class="booking-status-chip">${escapeHtml(
                          booking.status
                        )}</span>`
                      : ''
                  }

                  ${
                    booking.destination
                      ? `<span>${escapeHtml(
                          booking.destination
                        )}</span>`
                      : ''
                  }
                </div>
              </div>
            </div>

            <div class="booking-meta booking-meta-grid">
              ${
                booking.travelDate
                  ? `<span><small>TRAVEL</small>${escapeHtml(
                      booking.travelDate
                    )}</span>`
                  : ''
              }

              ${
                booking.bookingDate
                  ? `<span><small>BOOKED</small>${escapeHtml(
                      booking.bookingDate
                    )}</span>`
                  : ''
              }

              ${
                amount
                  ? `<span><small>AMOUNT</small>${amount}</span>`
                  : ''
              }
            </div>

            ${
              booking.notes
                ? `<div class="booking-notes">${escapeHtml(
                    booking.notes
                  )}</div>`
                : ''
            }
          </div>

          <div class="booking-card-actions">
            <button
              type="button"
              class="booking-action-button booking-edit-button"
              data-index="${index}"
            >
              Edit
            </button>

            <button
              type="button"
              class="booking-action-button booking-duplicate-button"
              data-index="${index}"
            >
              Duplicate
            </button>

            <button
              type="button"
              class="booking-action-button booking-remove-button"
              data-index="${index}"
            >
              Remove
            </button>
          </div>
        </div>
      `;
    })
    .join('');

  container
    .querySelectorAll('.booking-edit-button')
    .forEach(button => {
      button.addEventListener('click', () => {
        startBookingEdit(Number(button.dataset.index));
      });
    });

  container
    .querySelectorAll('.booking-duplicate-button')
    .forEach(button => {
      button.addEventListener('click', () => {
        duplicateBooking(Number(button.dataset.index));
      });
    });

  container
    .querySelectorAll('.booking-remove-button')
    .forEach(button => {
      button.addEventListener('click', () => {
        removeBooking(Number(button.dataset.index));
      });
    });
}

function clearTravelProfileForm(showMessage=true) {
  const ids = [
    'travelProfileCustomerId','travelMobileNumber','travelEmailId','addressLine1',
    'addressLine2','city','state','postalCode','country','passportNumber',
    'passportIssueDate','passportExpiry','nationality','passportPlaceOfIssue',
    'visaType','visaCountry','visaNumber','visaIssueDate','visaExpiryDate','visaNotes'
  ];
  ids.forEach(id => { if ($(id)) $(id).value = ''; });
  APP.currentTravelCustomerId = '';
  APP.travelHistory = [];
  APP.bookings = [];
  APP.editingBookingIndex = -1;

  if ($('country')) {
    $('country').value = 'India';
  }

  clearBookingEntry();
  renderTravelHistory();
  renderBookings();
  $('travelProfileForm')?.classList.add('hidden');
  $('travelProfileStatus')?.classList.add('hidden');
  if (showMessage) showToast('Travel profile cleared.', 'info');
}

function showTravelProfileStatus(message, isError) {
  const s = $('travelProfileStatus');
  if (!s) return;
  s.textContent = message;
  s.style.color = isError ? '#ff7180' : '';
  s.classList.remove('hidden');
}
