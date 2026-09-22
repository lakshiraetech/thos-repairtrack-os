// ==============================================================================
// THOS RepairTrack OS + CollectIQ - Interactive Client-Side SaaS Engine
// Dual-View Workshop Command Center & Customer Live Public Tracking Portal
// ==============================================================================

const state = {
  organization: {},
  tickets: [],
  invoices: [],
  payments: [],
  reminders: [],
  messages: [],
  stats: {},
  catalog: {},
  complaintsList: [],
  partsList: [],
  laborList: [],
  activeCategory: "ALL",
  searchQuery: "",
  selectedCustomerTicketId: null,
  activeEstimateTicketId: null,
  configuredEstimateItems: []
};

// ------------------------------------------------------------------------------
// INITIALIZATION & API FETCH
// ------------------------------------------------------------------------------
async function initApp() {
  try {
    const [bootRes, catRes] = await Promise.all([
      fetch("/api/bootstrap").then(r => r.json()),
      fetch("/api/catalog").then(r => r.json())
    ]);

    state.organization = bootRes.organization;
    state.tickets = bootRes.tickets;
    state.invoices = bootRes.invoices;
    state.payments = bootRes.payments;
    state.reminders = bootRes.reminders;
    state.messages = bootRes.messages;
    state.stats = bootRes.stats;

    state.catalog = catRes.catalog;
    state.complaintsList = catRes.complaints;
    state.partsList = catRes.parts;
    state.laborList = catRes.labor;

    // Set initial customer view ticket to the first active or repaired ticket
    if (state.tickets.length > 0) {
      state.selectedCustomerTicketId = state.tickets[0].id;
    }

    renderAll();
    setupIntakeFormCatalog();
    showToast("⚡ THOS RepairTrack OS Loaded - Connected to Live API");
  } catch (err) {
    console.error("Initialization error:", err);
    showToast("⚠️ Error connecting to server backend", "error");
  }
}

// Global Refresh
async function refreshData() {
  try {
    const bootRes = await fetch("/api/bootstrap").then(r => r.json());
    state.organization = bootRes.organization;
    state.tickets = bootRes.tickets;
    state.invoices = bootRes.invoices;
    state.payments = bootRes.payments;
    state.reminders = bootRes.reminders;
    state.messages = bootRes.messages;
    state.stats = bootRes.stats;

    renderAll();
  } catch (err) {
    console.error("Failed to refresh data:", err);
  }
}

function renderAll() {
  renderKpis();
  renderKanban();
  renderCustomerPortal();
  renderCommsDrawer();
}

// ------------------------------------------------------------------------------
// VIEW NAVIGATION
// ------------------------------------------------------------------------------
function switchView(viewName) {
  const btnWorkshop = document.getElementById("btnViewWorkshop");
  const btnCustomer = document.getElementById("btnViewCustomer");
  const viewWorkshop = document.getElementById("viewWorkshop");
  const viewCustomer = document.getElementById("viewCustomer");

  if (viewName === "WORKSHOP") {
    btnWorkshop.classList.add("active");
    btnCustomer.classList.remove("active");
    viewWorkshop.classList.remove("hidden");
    viewCustomer.classList.add("hidden");
  } else {
    btnWorkshop.classList.remove("active");
    btnCustomer.classList.add("active");
    viewWorkshop.classList.add("hidden");
    viewCustomer.classList.remove("hidden");
    renderCustomerPortal();
  }
}

// ------------------------------------------------------------------------------
// KPI RENDERING
// ------------------------------------------------------------------------------
function renderKpis() {
  const stats = state.stats || {};
  document.getElementById("kpiActiveJobs").innerText = stats.activeJobs ?? 0;
  document.getElementById("kpiPendingEstimates").innerText = stats.pendingEstimates ?? 0;
  document.getElementById("kpiRepairedReady").innerText = stats.repairedReady ?? 0;
  document.getElementById("kpiUncollectedRev").innerText = `$${(stats.uncollectedRevenue || 0).toFixed(2)}`;
}

// ------------------------------------------------------------------------------
// KANBAN PIPELINE RENDERING
// ------------------------------------------------------------------------------
function filterCategory(cat) {
  state.activeCategory = cat;
  document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
  event.target.classList.add("active");
  renderKanban();
}

function handleSearch(query) {
  state.searchQuery = query.toLowerCase();
  renderKanban();
}

function renderKanban() {
  const cols = {
    INTAKE_LOGGED: document.getElementById("colIntake"),
    ESTIMATE_PENDING_APPROVAL: document.getElementById("colEstimate"),
    WORK_IN_PROGRESS: document.getElementById("colInProgress"),
    REPAIRED: document.getElementById("colRepaired"),
    DELIVERED: document.getElementById("colDelivered")
  };

  // Clear columns
  Object.values(cols).forEach(col => col.innerHTML = "");

  const counts = { INTAKE: 0, ESTIMATE: 0, IN_PROGRESS: 0, REPAIRED: 0, DELIVERED: 0 };

  const filteredTickets = state.tickets.filter(t => {
    // Category match
    const category = t.vehicle?.category || "MOTORCYCLE";
    const matchesCat = (state.activeCategory === "ALL") ||
      (state.activeCategory === "MOTORCYCLE" && (category === "MOTORCYCLE" || category === "SCOOTER")) ||
      (state.activeCategory === category);

    // Search query match
    const q = state.searchQuery;
    const matchesSearch = !q ||
      (t.ticketNumber?.toLowerCase().includes(q)) ||
      (t.customer?.fullName?.toLowerCase().includes(q)) ||
      (t.vehicle?.licensePlate?.toLowerCase().includes(q)) ||
      (t.vehicle?.brand?.toLowerCase().includes(q)) ||
      (t.vehicle?.model?.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  filteredTickets.forEach(t => {
    let colKey = "INTAKE_LOGGED";
    if (t.status === "ESTIMATE_PENDING_APPROVAL" || t.status === "ESTIMATE_REJECTED") {
      colKey = "ESTIMATE_PENDING_APPROVAL";
      counts.ESTIMATE++;
    } else if (t.status === "WORK_IN_PROGRESS" || t.status === "ESTIMATE_APPROVED" || t.status === "QUALITY_CONTROL_TESTING") {
      colKey = "WORK_IN_PROGRESS";
      counts.IN_PROGRESS++;
    } else if (t.status === "REPAIRED" || t.status === "READY_FOR_PICKUP") {
      colKey = "REPAIRED";
      counts.REPAIRED++;
    } else if (t.status === "DELIVERED") {
      colKey = "DELIVERED";
      counts.DELIVERED++;
    } else {
      counts.INTAKE++;
    }

    const card = document.createElement("div");
    card.className = "ticket-card";
    card.onclick = () => {
      state.selectedCustomerTicketId = t.id;
      switchView("CUSTOMER");
    };

    const vehIcon = (t.vehicle?.category === "MOTORCYCLE" || t.vehicle?.category === "SCOOTER") ? "🏍️" :
      (t.vehicle?.category === "COMMERCIAL_VAN") ? "🚚" : "🚗";

    let footerActionHtml = "";
    if (colKey === "INTAKE_LOGGED") {
      footerActionHtml = `<button class="tkt-action-btn" onclick="event.stopPropagation(); openEstimateModal('${t.id}')">🛠️ Build Estimate</button>`;
    } else if (colKey === "ESTIMATE_PENDING_APPROVAL") {
      footerActionHtml = `
        <span class="tkt-amount-pill">$${t.estimate?.totalEstimatedAmount || "0.00"}</span>
        <button class="tkt-action-btn" onclick="event.stopPropagation(); quickApproveEstimate('${t.estimate?.id}')">✅ Quick Approve</button>
      `;
    } else if (colKey === "WORK_IN_PROGRESS") {
      footerActionHtml = `<button class="tkt-action-btn" onclick="event.stopPropagation(); markTicketRepaired('${t.id}')">🏁 Mark Repaired</button>`;
    } else if (colKey === "REPAIRED") {
      const inv = t.invoice || {};
      footerActionHtml = `
        <span class="tkt-amount-pill">$${inv.balanceDue || "0.00"}</span>
        <button class="tkt-action-btn" onclick="event.stopPropagation(); openDeliveryModal('${t.id}')">🔐 Verify OTP</button>
      `;
    } else if (colKey === "DELIVERED") {
      footerActionHtml = `<span class="chip chip-gold" style="font-size: 10px;">⭐ Google Review Sent</span>`;
    }

    card.innerHTML = `
      <div class="tkt-top">
        <span class="tkt-num">${t.ticketNumber}</span>
        <span class="tkt-category-icon">${vehIcon}</span>
      </div>
      <div class="tkt-veh-name">${t.vehicle?.brand || "Brand"} ${t.vehicle?.model || "Model"}</div>
      <div class="tkt-plate-badge">${t.vehicle?.licensePlate || "N/A"}</div>
      <div class="tkt-customer-row">
        <span>👤</span>
        <strong>${t.customer?.fullName || "Walk-in"}</strong>
        <span style="font-size: 10px; color: var(--accent-cyan)">(${t.customer?.phone || ""})</span>
      </div>
      <div class="tkt-complaint">“${t.customerComplaints || "General service"}”</div>
      <div class="tkt-footer">
        ${footerActionHtml}
      </div>
    `;

    if (cols[colKey]) {
      cols[colKey].appendChild(card);
    }
  });

  // Update counts
  document.getElementById("countIntake").innerText = counts.INTAKE;
  document.getElementById("countEstimate").innerText = counts.ESTIMATE;
  document.getElementById("countInProgress").innerText = counts.IN_PROGRESS;
  document.getElementById("countRepaired").innerText = counts.REPAIRED;
  document.getElementById("countDelivered").innerText = counts.DELIVERED;
}

// ------------------------------------------------------------------------------
// CUSTOMER LIVE TRACKING PORTAL RENDERING
// ------------------------------------------------------------------------------
function renderCustomerPortal() {
  if (!state.selectedCustomerTicketId && state.tickets.length > 0) {
    state.selectedCustomerTicketId = state.tickets[0].id;
  }
  const ticket = state.tickets.find(t => t.id === state.selectedCustomerTicketId);
  if (!ticket) return;

  // Populate ticket selector dropdown
  const sel = document.getElementById("portalTicketSelector");
  sel.innerHTML = state.tickets.map(t => `
    <option value="${t.id}" ${t.id === ticket.id ? "selected" : ""}>
      ${t.ticketNumber} - ${t.vehicle?.brand} ${t.vehicle?.model} (${t.vehicle?.licensePlate})
    </option>
  `).join("");

  document.getElementById("portalShopName").innerText = state.organization.name || "Apex Precision Motors";
  document.getElementById("portalTicketNum").innerText = ticket.ticketNumber;
  document.getElementById("portalVehTitle").innerText = `${ticket.vehicle?.brand} ${ticket.vehicle?.model}`;
  document.getElementById("portalVehPlate").innerText = ticket.vehicle?.licensePlate;
  document.getElementById("portalVehOdo").innerText = `${ticket.intakeOdometerKm?.toLocaleString() || "0"} KM`;
  document.getElementById("portalVehCategory").innerText = ticket.vehicle?.category || "Vehicle";
  document.getElementById("portalCustomerName").innerText = `${ticket.customer?.fullName} ${ticket.customer?.isVip ? "(VIP Member)" : ""}`;

  const vehIcon = (ticket.vehicle?.category === "MOTORCYCLE" || ticket.vehicle?.category === "SCOOTER") ? "🏍️" :
    (ticket.vehicle?.category === "COMMERCIAL_VAN") ? "🚚" : "🚗";
  document.getElementById("portalVehIcon").innerText = vehIcon;

  document.getElementById("portalCustComplaints").innerText = ticket.customerComplaints || "No complaint logged";
  document.getElementById("portalTechDiagnosis").innerText = ticket.technicianDiagnosis || "Inspection in progress on hydraulic ramp. Diagnostic log will update automatically.";

  // Stepper Milestones
  renderStepper(ticket);

  // Dynamic Stage Action Card
  renderStageActionCard(ticket);

  // Items table
  renderPortalItemsTable(ticket);
}

function loadCustomerTicket(ticketId) {
  state.selectedCustomerTicketId = ticketId;
  renderCustomerPortal();
}

function renderStepper(ticket) {
  const steps = [
    { key: "INTAKE_LOGGED", label: "1. Intake" },
    { key: "ESTIMATE_PENDING_APPROVAL", label: "2. Estimate" },
    { key: "WORK_IN_PROGRESS", label: "3. Repairing" },
    { key: "REPAIRED", label: "4. Repaired" },
    { key: "DELIVERED", label: "5. Delivered" }
  ];

  const statusOrder = {
    INTAKE_LOGGED: 1,
    INSPECTION_DIAGNOSIS: 1,
    ESTIMATE_PENDING_APPROVAL: 2,
    ESTIMATE_REJECTED: 2,
    ESTIMATE_APPROVED: 3,
    WORK_IN_PROGRESS: 3,
    WAITING_FOR_PARTS: 3,
    QUALITY_CONTROL_TESTING: 3,
    REPAIRED: 4,
    READY_FOR_PICKUP: 4,
    DELIVERED: 5
  };

  const currentLevel = statusOrder[ticket.status] || 1;

  const track = document.getElementById("portalStepper");
  track.innerHTML = steps.map((s, idx) => {
    const stepLevel = idx + 1;
    let cls = "";
    let icon = stepLevel;

    if (stepLevel < currentLevel) {
      cls = "completed";
      icon = "✓";
    } else if (stepLevel === currentLevel) {
      cls = "active";
    }

    return `
      <div class="step-node ${cls}">
        <div class="step-circle">${icon}</div>
        <div class="step-label">${s.label}</div>
      </div>
    `;
  }).join("");
}

function renderStageActionCard(ticket) {
  const container = document.getElementById("portalActionCard");
  container.className = "portal-card action-stage-card";

  // SCENARIO 1: ESTIMATE PENDING APPROVAL
  if (ticket.status === "ESTIMATE_PENDING_APPROVAL" && ticket.estimate) {
    container.classList.add("estimate-active");
    container.innerHTML = `
      <div class="stage-card-content">
        <div class="stage-title-row">
          <div>
            <h2>1-Click Diagnostic Estimate Approval Required</h2>
            <p>Technician has evaluated your vehicle. Please authorize repair scope below:</p>
          </div>
          <div class="tkt-amount-pill" style="font-size: 22px;">$${ticket.estimate.totalEstimatedAmount}</div>
        </div>
        <div class="diagnostic-grid" style="margin-bottom: 0;">
          <div class="diag-box">
            <h4>Estimated Parts Subtotal:</h4>
            <p>$${ticket.estimate.partsCostSubtotal}</p>
          </div>
          <div class="diag-box">
            <h4>Specialized Labor & Taxes (18%):</h4>
            <p>$${ticket.estimate.laborCostSubtotal} + $${ticket.estimate.taxAmount} GST</p>
          </div>
        </div>
        <div class="actions-row">
          <button class="btn-approve" onclick="customerRespondEstimate('${ticket.estimate.id}', 'APPROVE')">
            ✅ 1-Click Approve Estimate ($${ticket.estimate.totalEstimatedAmount})
          </button>
          <button class="btn-reject" onclick="customerRespondEstimate('${ticket.estimate.id}', 'REJECT')">
            ❌ Decline / Request Callback
          </button>
        </div>
      </div>
    `;
    return;
  }

  // SCENARIO 2: REPAIRED / READY FOR PICKUP & COLLECTIQ INVOICED
  if (ticket.status === "REPAIRED" || ticket.status === "READY_FOR_PICKUP") {
    container.classList.add("repaired-active");
    const inv = ticket.invoice;
    const isPaid = inv && inv.status === "PAID";

    if (!isPaid) {
      container.innerHTML = `
        <div class="stage-card-content">
          <div class="stage-title-row">
            <div>
              <span class="badge-tag" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid #10b981; margin-bottom: 6px;">
                CollectIQ™ Instant Settlement Active
              </span>
              <h2>Vehicle Service Complete - Pay Online for Express Gate Release</h2>
              <p>Invoice #${inv?.invoiceNumber || "INV-001"} generated. Settle online to receive your 6-digit gate clearance code:</p>
            </div>
            <div class="tkt-amount-pill" style="font-size: 28px;">$${inv?.balanceDue || "0.00"}</div>
          </div>
          
          <div class="diagnostic-grid" style="margin-bottom: 8px;">
            <div class="diag-box">
              <h4>CollectIQ Demurrage Reminder Status:</h4>
              <p style="color: var(--accent-amber); font-weight: 600;">Active 24h Polite Notice Dispatched. Free grace storage active.</p>
              <button class="btn-secondary" style="margin-top: 8px; font-size: 11px;" onclick="simulateFastForwardReminder('${inv.id}', 48)">
                ⏩ Fast-Forward: Test T+48h Storage Fee Notice
              </button>
            </div>
            <div class="diag-box">
              <h4>Instant Payment Options:</h4>
              <p>Apple Pay, Google Pay, Credit/Debit Cards, UPI Direct QR</p>
              <button class="btn-approve" style="margin-top: 8px; font-size: 13px;" onclick="simulateInstantPayment('${inv.id}', ${inv.balanceDue})">
                💳 Pay $${inv.balanceDue} Online Instantly
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      // INVOICE PAID -> SHOW DELIVERY OTP BADGE
      container.innerHTML = `
        <div class="stage-card-content">
          <div class="stage-title-row">
            <div>
              <span class="badge-tag" style="background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan); border: 1px solid var(--accent-cyan); margin-bottom: 6px;">
                ✅ Invoice Fully Reconciled
              </span>
              <h2>Ready for Express Handover Pickup</h2>
              <p>Please show this 6-Digit Gate Code to your Service Advisor or Cashier at vehicle pickup:</p>
            </div>
          </div>
          
          <div class="otp-display-badge">
            <div class="otp-title">Your 6-Digit Gate Delivery Passcode</div>
            <div class="otp-huge-code">${ticket.deliveryOtp}</div>
            <p style="font-size: 12px; color: var(--text-dim); margin-top: 6px;">Valid for single-use verification. Stamped receipt will be dispatched upon release.</p>
          </div>
          
          <div class="actions-row">
            <button class="btn-secondary" onclick="openDeliveryModal('${ticket.id}')">
              🔐 Advisor Gate Simulation: Enter & Verify OTP
            </button>
          </div>
        </div>
      `;
    }
    return;
  }

  // SCENARIO 3: DELIVERED -> GOOGLE 5-STAR REVIEW BOOSTER
  if (ticket.status === "DELIVERED") {
    container.classList.add("delivered-active");
    container.innerHTML = `
      <div class="stage-card-content">
        <div class="stage-title-row">
          <div>
            <span class="badge-tag" style="background: rgba(139, 92, 246, 0.15); color: var(--accent-purple); border: 1px solid var(--accent-purple); margin-bottom: 6px;">
              🏁 Service Handover Completed
            </span>
            <h2>Thank You for Choosing ${state.organization.name}!</h2>
            <p>Your vehicle has been safely released. We hope you experienced a 5-star standard today.</p>
          </div>
        </div>

        <div class="diag-box" style="text-align: center; padding: 20px;">
          <h4 style="color: var(--accent-amber);">How would you rate your service experience today?</h4>
          <div class="review-rating-stars" id="portalReviewStars">
            <span class="star-icon filled" onclick="submitGoogleStarRating(1)">★</span>
            <span class="star-icon filled" onclick="submitGoogleStarRating(2)">★</span>
            <span class="star-icon filled" onclick="submitGoogleStarRating(3)">★</span>
            <span class="star-icon filled" onclick="submitGoogleStarRating(4)">★</span>
            <span class="star-icon filled" onclick="submitGoogleStarRating(5)">★</span>
          </div>
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">5-Star Ratings automatically redirect to our official Google Business Profile!</p>
          <a href="${state.organization.googleReviewUrl || 'https://google.com'}" target="_blank" class="btn-primary" style="display: inline-flex; text-decoration: none;">
            ⭐ Post 5-Star Review on Google
          </a>
        </div>
      </div>
    `;
    return;
  }

  // DEFAULT / IN PROGRESS STATE
  container.innerHTML = `
    <div class="stage-card-content">
      <div class="stage-title-row">
        <div>
          <h2>Work Currently Underway on Vehicle</h2>
          <p>Our senior technicians are performing maintenance according to manufacturer specifications.</p>
        </div>
        <div class="live-pulse-tag"><span class="pulse-dot"></span> Stage: ${ticket.status.replace(/_/g, " ")}</div>
      </div>
    </div>
  `;
}

function renderPortalItemsTable(ticket) {
  const tbody = document.getElementById("portalItemsTbody");
  const items = ticket.items || [];

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 20px;">No itemized parts allocated yet. Inspection in progress.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(it => `
    <tr>
      <td><strong>${it.description}</strong></td>
      <td><span class="mono-code">${it.brand || "OEM"}</span></td>
      <td><span class="chip">${it.type.replace(/_/g, " ")}</span></td>
      <td>${it.quantity}</td>
      <td class="text-right">$${Number(it.unitPrice).toFixed(2)}</td>
      <td class="text-right"><strong>$${Number(it.totalAmount).toFixed(2)}</strong></td>
    </tr>
  `).join("");
}

// ------------------------------------------------------------------------------
// INTAKE WIZARD & CATALOG MANAGEMENT
// ------------------------------------------------------------------------------
function setupIntakeFormCatalog() {
  const categorySel = document.getElementById("intakeVehCategory");
  onCategoryChange(categorySel.value);

  // Complaints chips
  const chipsWrap = document.getElementById("complaintsChips");
  chipsWrap.innerHTML = state.complaintsList.map(c => `
    <button type="button" class="chip-btn" onclick="addComplaintText('${c.replace(/'/g, "\\'")}')">
      + ${c}
    </button>
  `).join("");
}

function onCategoryChange(catKey) {
  const brandSel = document.getElementById("intakeVehBrand");
  const catData = state.catalog[catKey];
  if (!catData) return;

  brandSel.innerHTML = catData.brands.map(b => `<option value="${b.name}">${b.name}</option>`).join("");
  onBrandChange(brandSel.value);
}

function onBrandChange(brandName) {
  const catKey = document.getElementById("intakeVehCategory").value;
  const catData = state.catalog[catKey];
  const brand = catData?.brands?.find(b => b.name === brandName);
  const modelSel = document.getElementById("intakeVehModel");

  if (brand && brand.models) {
    modelSel.innerHTML = brand.models.map(m => `<option value="${m}">${m}</option>`).join("");
  } else {
    modelSel.innerHTML = `<option value="Standard">Standard Model</option>`;
  }
}

function addComplaintText(text) {
  const txt = document.getElementById("intakeComplaints");
  txt.value = txt.value ? `${txt.value}, ${text}` : text;
}

function openIntakeModal() {
  document.getElementById("modalIntake").classList.add("open");
}

async function handleIntakeSubmit(e) {
  e.preventDefault();
  const payload = {
    customerName: document.getElementById("intakeCustName").value,
    customerPhone: document.getElementById("intakeCustPhone").value,
    customerEmail: document.getElementById("intakeCustEmail").value,
    vehicleCategory: document.getElementById("intakeVehCategory").value,
    vehicleBrand: document.getElementById("intakeVehBrand").value,
    vehicleModel: document.getElementById("intakeVehModel").value,
    licensePlate: document.getElementById("intakePlate").value,
    odometerKm: document.getElementById("intakeOdometer").value,
    fuelLevel: document.getElementById("intakeFuel").value,
    customerComplaints: document.getElementById("intakeComplaints").value
  };

  try {
    const res = await fetch("/api/tickets/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(r => r.json());

    if (res.success) {
      closeModal("modalIntake");
      document.getElementById("formIntake").reset();
      showToast("✅ Ticket Created & WhatsApp Live Tracking Dispatched!");
      await refreshData();
      state.selectedCustomerTicketId = res.ticket.id;
    } else {
      showToast(res.error || "Failed to create ticket", "error");
    }
  } catch (err) {
    showToast("Server request failed", "error");
  }
}

// ------------------------------------------------------------------------------
// ESTIMATE BUILDER
// ------------------------------------------------------------------------------
function openEstimateModal(ticketId) {
  state.activeEstimateTicketId = ticketId;
  const ticket = state.tickets.find(t => t.id === ticketId);
  document.getElementById("estModalSubtitle").innerText = `Ticket: ${ticket?.ticketNumber} • ${ticket?.vehicle?.brand} ${ticket?.vehicle?.model}`;

  // Quick items chips
  const quickWrap = document.getElementById("quickPartsGrid");
  const allQuick = [...state.partsList, ...state.laborList];
  quickWrap.innerHTML = allQuick.map((it, idx) => `
    <div class="quick-part-chip" onclick="addQuickEstimateItem(${idx})">
      <div class="qp-name">${it.description}</div>
      <div class="qp-meta"><span>${it.brand || "LABOR"}</span><strong>$${it.price.toFixed(2)}</strong></div>
    </div>
  `).join("");

  state.configuredEstimateItems = [];
  // Preload with initial standard service
  addQuickEstimateItem(0);
  addQuickEstimateItem(state.partsList.length); // First labor task

  document.getElementById("modalEstimate").classList.add("open");
}

function addQuickEstimateItem(idx) {
  const allQuick = [...state.partsList, ...state.laborList];
  const item = allQuick[idx];
  if (!item) return;

  state.configuredEstimateItems.push({
    type: item.type,
    brand: item.brand || "OEM",
    description: item.description,
    quantity: 1,
    unitPrice: item.price,
    taxPercent: 18
  });

  renderEstimateTable();
}

function renderEstimateTable() {
  const tbody = document.getElementById("estItemsTbody");
  let partsSub = 0;
  let laborSub = 0;

  tbody.innerHTML = state.configuredEstimateItems.map((it, idx) => {
    const total = it.quantity * it.unitPrice;
    if (it.type.includes("PART") || it.type.includes("FLUID")) {
      partsSub += total;
    } else {
      laborSub += total;
    }

    return `
      <tr>
        <td><span class="chip" style="font-size: 10px;">${it.type.replace(/_/g, " ")}</span></td>
        <td>${it.description}</td>
        <td>${it.brand}</td>
        <td><input type="number" min="1" value="${it.quantity}" style="width: 55px;" onchange="updateEstQty(${idx}, this.value)"></td>
        <td>$${it.unitPrice.toFixed(2)}</td>
        <td><strong>$${total.toFixed(2)}</strong></td>
        <td><button type="button" class="btn-ghost" style="color: red; padding: 2px;" onclick="removeEstItem(${idx})">&times;</button></td>
      </tr>
    `;
  }).join("");

  const tax = (partsSub + laborSub) * 0.18;
  const grandTotal = partsSub + laborSub + tax;

  document.getElementById("estPartsSubtotal").innerText = `$${partsSub.toFixed(2)}`;
  document.getElementById("estLaborSubtotal").innerText = `$${laborSub.toFixed(2)}`;
  document.getElementById("estTaxTotal").innerText = `$${tax.toFixed(2)}`;
  document.getElementById("estGrandTotal").innerText = `$${grandTotal.toFixed(2)}`;
}

function updateEstQty(idx, qty) {
  state.configuredEstimateItems[idx].quantity = Number(qty) || 1;
  renderEstimateTable();
}

function removeEstItem(idx) {
  state.configuredEstimateItems.splice(idx, 1);
  renderEstimateTable();
}

async function submitEstimateForm() {
  if (state.configuredEstimateItems.length === 0) {
    return showToast("Please add at least one line item", "error");
  }

  const payload = {
    ticketId: state.activeEstimateTicketId,
    diagnosisNote: document.getElementById("estDiagnosisNote").value,
    items: state.configuredEstimateItems
  };

  try {
    const res = await fetch("/api/estimates/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(r => r.json());

    if (res.success) {
      closeModal("modalEstimate");
      showToast("📲 Estimate Dispatched to Customer WhatsApp with 1-Click Buttons!");
      await refreshData();
    }
  } catch (err) {
    showToast("Failed to dispatch estimate", "error");
  }
}

// ------------------------------------------------------------------------------
// WORKFLOW ACTIONS: APPROVAL, REPAIR, INVOICE, PAYMENT & DELIVERY
// ------------------------------------------------------------------------------
async function quickApproveEstimate(estimateId) {
  try {
    const res = await fetch("/api/estimates/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estimateId, action: "APPROVE" })
    }).then(r => r.json());

    if (res.success) {
      showToast("✅ Estimate Approved! Ticket advanced to Work In Progress.");
      await refreshData();
    }
  } catch (err) {
    showToast("Error approving estimate", "error");
  }
}

async function customerRespondEstimate(estimateId, action) {
  try {
    const res = await fetch("/api/estimates/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estimateId, action })
    }).then(r => r.json());

    if (res.success) {
      showToast(`Estimate ${action.toLowerCase()}d successfully`);
      await refreshData();
    }
  } catch (err) {
    showToast("Action failed", "error");
  }
}

async function markTicketRepaired(ticketId) {
  try {
    const res = await fetch("/api/tickets/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, status: "REPAIRED" })
    }).then(r => r.json());

    if (res.success) {
      showToast("🏁 Ticket REPAIRED! CollectIQ Invoice generated and WhatsApp link sent.");
      await refreshData();
    }
  } catch (err) {
    showToast("Failed to update status", "error");
  }
}

async function simulateInstantPayment(invoiceId, amount) {
  try {
    const res = await fetch("/api/payments/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, amount, paymentMethod: "UPI_DIRECT" })
    }).then(r => r.json());

    if (res.success) {
      showToast("💰 Payment Reconciled! Gate Delivery OTP Generated.");
      await refreshData();
    }
  } catch (err) {
    showToast("Payment failed", "error");
  }
}

async function simulateFastForwardReminder(invoiceId, hours) {
  try {
    const res = await fetch("/api/reminders/escalate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, hours })
    }).then(r => r.json());

    if (res.success) {
      showToast(`⏩ CollectIQ T+${hours}h Demurrage Reminder Dispatched!`);
      await refreshData();
      toggleCommsDrawer(true);
    }
  } catch (err) {
    showToast("Escalation failed", "error");
  }
}

// Delivery OTP Verification
let activeDeliveryTicketId = null;
function openDeliveryModal(ticketId) {
  activeDeliveryTicketId = ticketId;
  const ticket = state.tickets.find(t => t.id === ticketId);
  document.getElementById("otpHintNotice").innerText = `Hint for testing: Customer OTP is [ ${ticket?.deliveryOtp || "N/A"} ]`;
  document.getElementById("inputDeliveryOtp").value = "";
  document.getElementById("modalDelivery").classList.add("open");
}

async function submitDeliveryOtp() {
  const otp = document.getElementById("inputDeliveryOtp").value;
  if (!otp || otp.length !== 6) {
    return showToast("Please enter a 6-digit OTP", "error");
  }

  try {
    const res = await fetch("/api/delivery/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: activeDeliveryTicketId, otp })
    }).then(r => r.json());

    if (res.success) {
      closeModal("modalDelivery");
      showToast("🚗 OTP Verified! Vehicle Released & Google 5-Star Review Prompt Dispatched!");
      await refreshData();
    } else {
      showToast(res.error || "OTP verification failed", "error");
    }
  } catch (err) {
    showToast("Verification request failed", "error");
  }
}

function submitGoogleStarRating(rating) {
  showToast(`⭐ Thank you for rating ${rating} Stars! Redirecting to Google Business Profile...`);
  setTimeout(() => {
    window.open(state.organization.googleReviewUrl || "https://google.com", "_blank");
  }, 1200);
}

// ------------------------------------------------------------------------------
// COMMS DRAWER (WHATSAPP REAL-TIME SIMULATION)
// ------------------------------------------------------------------------------
function toggleCommsDrawer(forceOpen = false) {
  const drawer = document.getElementById("commsDrawer");
  if (forceOpen) {
    drawer.classList.add("open");
  } else {
    drawer.classList.toggle("open");
  }
}

function renderCommsDrawer() {
  const container = document.getElementById("commsLogContainer");
  const countBadge = document.getElementById("commsBadgeCount");

  countBadge.innerText = state.messages.length;

  container.innerHTML = state.messages.map(m => {
    const buttonsHtml = (m.actionButtons || []).map(b => {
      if (b.action === "APPROVE") {
        return `<button class="wa-btn" style="color: #10b981;" onclick="customerRespondEstimate('${b.estimateId}', 'APPROVE')">${b.text}</button>`;
      }
      if (b.action === "REJECT") {
        return `<button class="wa-btn" style="color: #ef4444;" onclick="customerRespondEstimate('${b.estimateId}', 'REJECT')">${b.text}</button>`;
      }
      return `<a href="${b.url}" target="_blank" class="wa-btn" onclick="handleWaLinkClick(event, '${b.url}')">${b.text}</a>`;
    }).join("");

    return `
      <div class="wa-bubble">
        <div class="wa-badge">
          <span>${m.title}</span>
          <span class="wa-time">${new Date(m.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="wa-text">${m.messageBody}</div>
        <div class="wa-action-btn-group">
          ${buttonsHtml}
        </div>
      </div>
    `;
  }).join("");
}

function handleWaLinkClick(e, link) {
  if (link.includes("/track/")) {
    e.preventDefault();
    switchView("CUSTOMER");
    toggleCommsDrawer(false);
  }
}

// ------------------------------------------------------------------------------
// UTILITIES
// ------------------------------------------------------------------------------
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

function showToast(msg, type = "info") {
  const toast = document.getElementById("appToast");
  toast.innerText = msg;
  toast.style.borderColor = type === "error" ? "var(--accent-crimson)" : "var(--accent-cyan)";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

// Launch app on load
window.addEventListener("DOMContentLoaded", initApp);
