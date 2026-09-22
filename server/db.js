// ==============================================================================
// THOS RepairTrack OS + CollectIQ - Core In-Memory Enterprise Store & Engine
// State Machine, Relational Collections, Real-Time Webhook Simulator
// ==============================================================================

const crypto = require("crypto");
const { VEHICLE_CATALOG, SAMPLE_INVENTORY_PARTS, STANDARD_LABOR_TASKS } = require("./catalog");

// Multi-tenant initial workspace
const currentOrg = {
  id: "org_thos_apex_motors",
  name: "Apex Precision Motors & Superbike Studio",
  slug: "apex-motors",
  phoneNumber: "+1 (555) 019-2834",
  supportEmail: "service@apexprecisionmotors.com",
  currency: "USD",
  currencySymbol: "$",
  defaultTaxRatePercent: 18.0,
  demurrageDailyFee: 15.0,
  demurrageGraceHours: 48,
  googleReviewUrl: "https://g.page/r/apex-precision-motors/review",
  upiId: "apexmotors@okhdfcbank"
};

// Database Tables
let customers = [];
let vehicles = [];
let tickets = [];
let estimates = [];
let ticketItems = [];
let invoices = [];
let payments = [];
let reminderSchedules = [];
let deliveryVerifications = [];
let reviewPrompts = [];
let auditLogs = [];

// Real-time simulated communication logs
let simulatedMessages = []; // Dispatched WhatsApp & Email stream

// Helper ID & Token generator
function generateId(prefix = "id") {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function logAudit(action, entityType, entityId, details) {
  auditLogs.unshift({
    id: generateId("log"),
    action,
    entityType,
    entityId,
    details,
    timestamp: new Date().toISOString()
  });
}

function dispatchCommunication({ channel, recipientPhone, recipientEmail, recipientName, templateName, title, messageBody, actionButtons = [] }) {
  const comm = {
    id: generateId("msg"),
    channel, // "WHATSAPP" | "EMAIL"
    recipientPhone,
    recipientEmail,
    recipientName,
    templateName,
    title,
    messageBody,
    actionButtons,
    dispatchedAt: new Date().toISOString(),
    status: "DELIVERED"
  };
  simulatedMessages.unshift(comm);
  return comm;
}

// ------------------------------------------------------------------------------
// SEED INITIAL PRODUCTION SCENARIOS
// ------------------------------------------------------------------------------
function seedInitialData() {
  // Customer 1: Two-Wheeler Enthusiast
  const cust1 = {
    id: "cust_001",
    organizationId: currentOrg.id,
    fullName: "Vikramaditya Singhania",
    phone: "+91 98201 54321",
    email: "vikram.singh@superbikeclub.org",
    billingAddress: "402 Skyline Boulevard, Indiranagar",
    city: "Bangalore",
    isVip: true,
    totalSpent: 1450.00,
    outstandingBalance: 0.00,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  };
  customers.push(cust1);

  const veh1 = {
    id: "veh_001",
    organizationId: currentOrg.id,
    customerId: cust1.id,
    category: "MOTORCYCLE",
    brand: "Royal Enfield",
    model: "Hunter 350",
    year: 2024,
    color: "Rebel Red",
    licensePlate: "KA-04-MF-8822",
    vinOrChassisNumber: "ME3U3S5C1NC882291",
    fuelType: "Petrol",
    currentOdometerKm: 7850,
    batteryHealthPercent: 96,
    notes: "Owner requested Motul 300V synthetic lube only"
  };
  vehicles.push(veh1);

  // Customer 2: Four-Wheeler Performance Car
  const cust2 = {
    id: "cust_002",
    organizationId: currentOrg.id,
    fullName: "Elena Rostova",
    phone: "+1 (415) 890-3344",
    email: "elena.rostova@techventures.io",
    billingAddress: "742 Evergreen Terrace, Palo Alto",
    city: "San Francisco",
    isVip: true,
    totalSpent: 3800.00,
    outstandingBalance: 328.00,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  };
  customers.push(cust2);

  const veh2 = {
    id: "veh_002",
    organizationId: currentOrg.id,
    customerId: cust2.id,
    category: "SEDAN",
    brand: "BMW",
    model: "M340i xDrive",
    year: 2023,
    color: "Dravit Grey Metallic",
    licensePlate: "CA-9XTR-44",
    vinOrChassisNumber: "WBA5R1C07PFL99214",
    fuelType: "Petrol",
    currentOdometerKm: 18450,
    batteryHealthPercent: 94,
    notes: "M-Sport ceramic brake squeal check required"
  };
  vehicles.push(veh2);

  // Customer 3: Electric Vehicle
  const cust3 = {
    id: "cust_003",
    organizationId: currentOrg.id,
    fullName: "Marcus Vance",
    phone: "+1 (206) 555-0199",
    email: "m.vance@vancemedia.com",
    billingAddress: "1200 Westlake Ave N",
    city: "Seattle",
    isVip: false,
    totalSpent: 920.00,
    outstandingBalance: 0.00,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  };
  customers.push(cust3);

  const veh3 = {
    id: "veh_003",
    organizationId: currentOrg.id,
    customerId: cust3.id,
    category: "SUV",
    brand: "Tesla",
    model: "Model Y Long Range",
    year: 2024,
    color: "Pearl White",
    licensePlate: "WA-EV-9012",
    vinOrChassisNumber: "5YJYGDEF6NF102938",
    fuelType: "Electric",
    currentOdometerKm: 12100,
    batteryHealthPercent: 99,
    notes: "Cabin air HEPA filter + alignment check"
  };
  vehicles.push(veh3);

  // Ticket 1: Active In-Progress Two-Wheeler (Hunter 350)
  const ticket1 = {
    id: "tkt_101",
    ticketNumber: "TK-2026-0419",
    organizationId: currentOrg.id,
    customerId: cust1.id,
    vehicleId: veh1.id,
    advisorName: "Alex Mercer (Master Advisor)",
    technicianName: "Dmitri Volkov",
    status: "WORK_IN_PROGRESS",
    intakeOdometerKm: 7850,
    fuelGaugePercent: 65,
    customerComplaints: "Periodic 8,000 km paid service, engine sound harsh at 4,000 RPM, rear brake spongy",
    technicianDiagnosis: "Spark plug gap out of tolerance; brake line air trapped; rear pads worn to 2.5mm",
    publicTrackingToken: "track_re_hunter350_demo",
    deliveryOtp: "492815",
    deliveryOtpExpiresAt: new Date(Date.now() + 48 * 3600000).toISOString(),
    isOtpVerified: false,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    estimatedCompletionAt: new Date(Date.now() + 5 * 3600000).toISOString()
  };
  tickets.push(ticket1);

  // Estimate for Ticket 1 (Approved)
  const estimate1 = {
    id: "est_101",
    ticketId: ticket1.id,
    versionNumber: 1,
    partsCostSubtotal: 125.00,
    laborCostSubtotal: 80.00,
    taxRatePercent: 18.0,
    taxAmount: 36.90,
    totalEstimatedAmount: 241.90,
    status: "APPROVED",
    approvedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    approvalClientIp: "157.49.20.11",
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
  };
  estimates.push(estimate1);

  ticketItems.push(
    { id: generateId("item"), ticketId: ticket1.id, type: "CONSUMABLE_FLUID", brand: "Motul", description: "Motul 300V Synthetic 15W-50 (2.5L)", unitCost: 28, unitPrice: 52, quantity: 1, taxPercent: 18, totalAmount: 61.36 },
    { id: generateId("item"), ticketId: ticket1.id, type: "OEM_PART", brand: "Royal Enfield OEM", description: "Brembo ByBre Rear Brake Pad Set", unitCost: 18, unitPrice: 38, quantity: 1, taxPercent: 18, totalAmount: 44.84 },
    { id: generateId("item"), ticketId: ticket1.id, type: "OEM_PART", brand: "Bosch", description: "OEM High Flow Oil Filter Cartridge", unitCost: 6, unitPrice: 15, quantity: 1, taxPercent: 18, totalAmount: 17.70 },
    { id: generateId("item"), ticketId: ticket1.id, type: "LABOR_MECHANICAL", brand: "Apex Service", description: "Comprehensive Paid Service + Brake Caliper Bleed", unitCost: 35, unitPrice: 80, quantity: 1, taxPercent: 18, totalAmount: 94.40 }
  );

  // Ticket 2: REPAIRED / READY_FOR_PICKUP with CollectIQ Active Invoice (BMW M340i)
  const ticket2 = {
    id: "tkt_102",
    ticketNumber: "TK-2026-0418",
    organizationId: currentOrg.id,
    customerId: cust2.id,
    vehicleId: veh2.id,
    advisorName: "Alex Mercer (Master Advisor)",
    technicianName: "Kenji Sato",
    status: "REPAIRED",
    intakeOdometerKm: 18450,
    fuelGaugePercent: 45,
    customerComplaints: "High-speed front brake shudder; minor suspension thud over expansion joints",
    technicianDiagnosis: "Front rotors resurfaced within factory spec; Brembo Ceramic pads fitted; stabilizer link torqued",
    publicTrackingToken: "track_bmw_m340i_demo",
    deliveryOtp: "839104",
    deliveryOtpExpiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    isOtpVerified: false,
    completedAt: new Date(Date.now() - 26 * 3600000).toISOString(), // 26 hours ago (CollectIQ T+24h reminder is active!)
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString()
  };
  tickets.push(ticket2);

  const invoice2 = {
    id: "inv_102",
    invoiceNumber: "INV-2026-0182",
    organizationId: currentOrg.id,
    ticketId: ticket2.id,
    customerId: cust2.id,
    status: "ISSUED",
    currency: "USD",
    partsSubtotal: 184.00,
    laborSubtotal: 95.00,
    demurrageStorageFee: 0.00,
    taxAmount: 50.22,
    discountAmount: 0.00,
    grandTotal: 329.22,
    paidAmount: 0.00,
    balanceDue: 329.22,
    publicInvoiceToken: "inv_token_bmw_m340i",
    instantPaymentUrl: "/pay/inv_token_bmw_m340i",
    issuedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    dueDate: new Date(Date.now() - 2 * 3600000).toISOString()
  };
  invoices.push(invoice2);

  ticketItems.push(
    { id: generateId("item"), ticketId: ticket2.id, type: "OEM_PART", brand: "Brembo", description: "Ceramic Front Brake Pads Set", unitCost: 55, unitPrice: 130, quantity: 1, taxPercent: 18, totalAmount: 153.40 },
    { id: generateId("item"), ticketId: ticket2.id, type: "OEM_PART", brand: "Lemforder", description: "Front Sway Bar Stabilizer End Link Rod", unitCost: 28, unitPrice: 54, quantity: 1, taxPercent: 18, totalAmount: 63.72 },
    { id: generateId("item"), ticketId: ticket2.id, type: "LABOR_MECHANICAL", brand: "Apex Service", description: "Front Brake Caliper Overhaul & Rotor True-Up", unitCost: 40, unitPrice: 95, quantity: 1, taxPercent: 18, totalAmount: 112.10 }
  );

  // CollectIQ Escalation Reminders for Ticket 2
  reminderSchedules.push(
    {
      id: generateId("rem"),
      invoiceId: invoice2.id,
      customerId: cust2.id,
      step: "T0_INVOICE_ISSUED",
      channel: "WHATSAPP",
      status: "DISPATCHED",
      scheduledFor: new Date(Date.now() - 26 * 3600000).toISOString(),
      dispatchedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
      messageBody: "Your BMW M340i repair is completed! Total: $329.22. Instant payment link: https://thos.re/pay/inv_token_bmw_m340i"
    },
    {
      id: generateId("rem"),
      invoiceId: invoice2.id,
      customerId: cust2.id,
      step: "T24_POLITE_REMINDER",
      channel: "WHATSAPP",
      status: "DISPATCHED",
      scheduledFor: new Date(Date.now() - 2 * 3600000).toISOString(),
      dispatchedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      messageBody: "Friendly reminder from Apex Motors: Your vehicle is ready for pickup! Settle your invoice ($329.22) online for zero-wait drive-away: https://thos.re/pay/inv_token_bmw_m340i"
    },
    {
      id: generateId("rem"),
      invoiceId: invoice2.id,
      customerId: cust2.id,
      step: "T48_FIRM_REMINDER_WITH_DEMURRAGE",
      channel: "WHATSAPP",
      status: "SCHEDULED",
      scheduledFor: new Date(Date.now() + 22 * 3600000).toISOString(),
      messageBody: "Notice: Per workshop policy, vehicle bay demurrage of $15/day will commence in 22 hours if not picked up. Pay now: https://thos.re/pay/inv_token_bmw_m340i"
    }
  );

  // Dispatch initial simulated WhatsApp log
  dispatchCommunication({
    channel: "WHATSAPP",
    recipientPhone: cust2.phone,
    recipientName: cust2.fullName,
    templateName: "payment_reminder_24h_friendly",
    title: "CollectIQ: 24h Polite Payment Reminder",
    messageBody: `Hi ${cust2.fullName},\n\nYour BMW M340i xDrive (Plate: CA-9XTR-44) is completely serviced & polished at Apex Precision Motors.\n\n📄 Invoice: INV-2026-0182\n💰 Amount Due: $329.22\n\nClick below to pay instantly via Apple Pay, Card, or UPI and receive your 6-Digit Gate OTP for zero-wait vehicle handover:`,
    actionButtons: [
      { text: "💳 Pay Online Now ($329.22)", url: "https://thos.re/pay/inv_token_bmw_m340i" },
      { text: "📍 View Workshop Location", url: "https://maps.google.com" }
    ]
  });
}

seedInitialData();

// ------------------------------------------------------------------------------
// UNIFIED WORKFLOW ENGINE FUNCTIONS
// ------------------------------------------------------------------------------

// STEP 1: INTAKE (Job Ticket creation + Customer Live Tracking link)
function createIntake({
  customerName,
  customerPhone,
  customerEmail,
  vehicleCategory,
  vehicleBrand,
  vehicleModel,
  licensePlate,
  odometerKm,
  fuelLevel,
  customerComplaints
}) {
  let customer = customers.find(c => c.phone.replace(/\D/g, "") === customerPhone.replace(/\D/g, ""));
  if (!customer) {
    customer = {
      id: generateId("cust"),
      organizationId: currentOrg.id,
      fullName: customerName,
      phone: customerPhone,
      email: customerEmail || null,
      isVip: false,
      totalSpent: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString()
    };
    customers.push(customer);
  }

  let vehicle = vehicles.find(v => v.licensePlate.toUpperCase() === licensePlate.toUpperCase());
  if (!vehicle) {
    vehicle = {
      id: generateId("veh"),
      organizationId: currentOrg.id,
      customerId: customer.id,
      category: vehicleCategory || "MOTORCYCLE",
      brand: vehicleBrand,
      model: vehicleModel,
      year: new Date().getFullYear(),
      licensePlate: licensePlate.toUpperCase(),
      currentOdometerKm: Number(odometerKm) || 0,
      notes: "Intake registered via THOS RepairTrack OS"
    };
    vehicles.push(vehicle);
  } else {
    vehicle.currentOdometerKm = Number(odometerKm) || vehicle.currentOdometerKm;
  }

  const ticketSeq = 420 + tickets.length;
  const ticketNumber = `TK-2026-0${ticketSeq}`;
  const trackingToken = `track_${crypto.randomBytes(8).toString("hex")}`;
  const deliveryOtp = generateOtp();

  const newTicket = {
    id: generateId("tkt"),
    ticketNumber,
    organizationId: currentOrg.id,
    customerId: customer.id,
    vehicleId: vehicle.id,
    advisorName: "Service Advisor",
    technicianName: "Assigned Tech",
    status: "INTAKE_LOGGED",
    intakeOdometerKm: Number(odometerKm) || 0,
    fuelGaugePercent: Number(fuelLevel) || 50,
    customerComplaints: customerComplaints || "General inspection and service",
    technicianDiagnosis: null,
    publicTrackingToken: trackingToken,
    deliveryOtp,
    deliveryOtpExpiresAt: new Date(Date.now() + 72 * 3600000).toISOString(),
    isOtpVerified: false,
    createdAt: new Date().toISOString()
  };
  tickets.unshift(newTicket);

  logAudit("TICKET_INTAKE_CREATED", "Ticket", newTicket.id, { ticketNumber, customer: customer.fullName, vehicle: `${vehicleBrand} ${vehicleModel}` });

  // Dispatched WhatsApp message with Live Tracking Link
  const trackingUrl = `https://thos.re/track/${trackingToken}`;
  dispatchCommunication({
    channel: "WHATSAPP",
    recipientPhone: customer.phone,
    recipientEmail: customer.email,
    recipientName: customer.fullName,
    templateName: "repair_intake_confirmed",
    title: "1. Intake: Live Tracking Link Dispatched",
    messageBody: `Hello ${customer.fullName},\n\nYour ${vehicleBrand} ${vehicleModel} (${licensePlate.toUpperCase()}) has been checked in at ${currentOrg.name}.\n\n📋 Ticket Number: ${ticketNumber}\n🔍 Current Stage: Intake Inspection & Diagnostics\n\nTrack your vehicle's live diagnostic photos, estimate approval, and repair progress in real-time below:`,
    actionButtons: [
      { text: "🔴 Live Vehicle Repair Status", url: trackingUrl },
      { text: "📞 Contact Service Advisor", url: `tel:${currentOrg.phoneNumber}` }
    ]
  });

  return { ticket: newTicket, customer, vehicle, trackingUrl };
}

// STEP 2: DIAGNOSTIC ESTIMATE (Technician sets cost -> WhatsApp 1-Click Approve/Reject)
function submitDiagnosticEstimate(ticketId, { items, diagnosisNote }) {
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) throw new Error("Ticket not found");

  const customer = customers.find(c => c.id === ticket.customerId);
  const vehicle = vehicles.find(v => v.id === ticket.vehicleId);

  ticket.technicianDiagnosis = diagnosisNote || ticket.technicianDiagnosis;
  ticket.status = "ESTIMATE_PENDING_APPROVAL";

  // Compute parts vs labor
  let partsSubtotal = 0;
  let laborSubtotal = 0;

  // Clear existing items for this ticket if any and insert new items
  items.forEach(it => {
    const qty = Number(it.quantity) || 1;
    const price = Number(it.unitPrice) || 0;
    const taxRate = Number(it.taxPercent) || 18.0;
    const lineTotal = (qty * price) * (1 + taxRate / 100);

    if (it.type.includes("PART") || it.type.includes("FLUID")) {
      partsSubtotal += qty * price;
    } else {
      laborSubtotal += qty * price;
    }

    ticketItems.push({
      id: generateId("item"),
      ticketId: ticket.id,
      type: it.type || "OEM_PART",
      brand: it.brand || "OEM",
      description: it.description,
      unitCost: price * 0.6,
      unitPrice: price,
      quantity: qty,
      taxPercent: taxRate,
      totalAmount: Math.round(lineTotal * 100) / 100
    });
  });

  const taxAmount = (partsSubtotal + laborSubtotal) * (currentOrg.defaultTaxRatePercent / 100);
  const totalEstimatedAmount = partsSubtotal + laborSubtotal + taxAmount;

  const estimate = {
    id: generateId("est"),
    ticketId: ticket.id,
    versionNumber: estimates.filter(e => e.ticketId === ticket.id).length + 1,
    partsCostSubtotal: Math.round(partsSubtotal * 100) / 100,
    laborCostSubtotal: Math.round(laborSubtotal * 100) / 100,
    taxRatePercent: currentOrg.defaultTaxRatePercent,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalEstimatedAmount: Math.round(totalEstimatedAmount * 100) / 100,
    status: "DISPATCHED_TO_CUSTOMER",
    createdAt: new Date().toISOString()
  };
  estimates.push(estimate);

  logAudit("ESTIMATE_DISPATCHED", "Estimate", estimate.id, { ticketNumber: ticket.ticketNumber, total: estimate.totalEstimatedAmount });

  // Dispatched WhatsApp interactive estimate approval
  dispatchCommunication({
    channel: "WHATSAPP",
    recipientPhone: customer.phone,
    recipientEmail: customer.email,
    recipientName: customer.fullName,
    templateName: "estimate_approval_interactive",
    title: "2. Diagnostic Estimate: 1-Click Approve / Reject",
    messageBody: `Hi ${customer.fullName},\n\nTechnician diagnostic inspection complete for ${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate}).\n\n🔩 Diagnosis: ${ticket.technicianDiagnosis}\n⚙️ Parts Subtotal: $${estimate.partsCostSubtotal}\n🛠️ Labor Subtotal: $${estimate.laborCostSubtotal}\n📊 Taxes (18%): $${estimate.taxAmount}\n💵 Total Estimate: $${estimate.totalEstimatedAmount}\n\nPlease click below to review itemized parts & authorize repair:`,
    actionButtons: [
      { text: "✅ 1-Click Approve ($" + estimate.totalEstimatedAmount + ")", action: "APPROVE", estimateId: estimate.id },
      { text: "❌ Reject Estimate", action: "REJECT", estimateId: estimate.id }
    ]
  });

  return { estimate, ticket };
}

// STEP 2B: CUSTOMER 1-CLICK APPROVAL / REJECTION
function respondToEstimate(estimateId, { action, reason, clientIp }) {
  const estimate = estimates.find(e => e.id === estimateId);
  if (!estimate) throw new Error("Estimate not found");

  const ticket = tickets.find(t => t.id === estimate.ticketId);
  const customer = customers.find(c => c.id === ticket.customerId);
  const vehicle = vehicles.find(v => v.id === ticket.vehicleId);

  if (action === "APPROVE") {
    estimate.status = "APPROVED";
    estimate.approvedAt = new Date().toISOString();
    estimate.approvalClientIp = clientIp || "127.0.0.1";
    ticket.status = "WORK_IN_PROGRESS";

    logAudit("ESTIMATE_APPROVED_BY_CUSTOMER", "Estimate", estimate.id, { ip: clientIp });

    dispatchCommunication({
      channel: "WHATSAPP",
      recipientPhone: customer.phone,
      recipientName: customer.fullName,
      templateName: "estimate_approval_ack",
      title: "Estimate Approved: Work In Progress",
      messageBody: `Thank you, ${customer.fullName}! Your estimate of $${estimate.totalEstimatedAmount} is approved. Our technicians have initiated repairs on your ${vehicle.brand} ${vehicle.model}. We will notify you once quality check is complete.`,
      actionButtons: [
        { text: "🔍 Live Work Progress", url: `https://thos.re/track/${ticket.publicTrackingToken}` }
      ]
    });
  } else {
    estimate.status = "REJECTED";
    estimate.rejectedAt = new Date().toISOString();
    estimate.rejectionReason = reason || "Customer declined estimate scope";
    ticket.status = "ESTIMATE_REJECTED";

    logAudit("ESTIMATE_REJECTED_BY_CUSTOMER", "Estimate", estimate.id, { reason });

    dispatchCommunication({
      channel: "WHATSAPP",
      recipientPhone: customer.phone,
      recipientName: customer.fullName,
      templateName: "estimate_rejected_ack",
      title: "Estimate Declined",
      messageBody: `Hello ${customer.fullName}, we noted your decline of estimate $${estimate.totalEstimatedAmount}. Your Service Advisor will reach out shortly to discuss alternative options or reassembly for vehicle collection.`
    });
  }

  return { estimate, ticket };
}

// STEP 3 & 4: COMPLETION TO INVOICE & AUTOMATED COLLECTIQ ESCALATION
function markJobRepaired(ticketId) {
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) throw new Error("Ticket not found");

  ticket.status = "REPAIRED";
  ticket.completedAt = new Date().toISOString();

  // If invoice already exists, reuse; otherwise generate
  let invoice = invoices.find(inv => inv.ticketId === ticket.id);
  if (!invoice) {
    const items = ticketItems.filter(i => i.ticketId === ticket.id);
    let partsSubtotal = 0;
    let laborSubtotal = 0;

    items.forEach(it => {
      const price = (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1);
      if (it.type.includes("PART") || it.type.includes("FLUID")) {
        partsSubtotal += price;
      } else {
        laborSubtotal += price;
      }
    });

    const taxAmount = (partsSubtotal + laborSubtotal) * (currentOrg.defaultTaxRatePercent / 100);
    const grandTotal = Math.round((partsSubtotal + laborSubtotal + taxAmount) * 100) / 100;

    const invSeq = 180 + invoices.length;
    const invoiceNumber = `INV-2026-0${invSeq}`;
    const invoiceToken = `inv_${crypto.randomBytes(8).toString("hex")}`;

    invoice = {
      id: generateId("inv"),
      invoiceNumber,
      organizationId: currentOrg.id,
      ticketId: ticket.id,
      customerId: ticket.customerId,
      status: "ISSUED",
      currency: currentOrg.currency,
      partsSubtotal: Math.round(partsSubtotal * 100) / 100,
      laborSubtotal: Math.round(laborSubtotal * 100) / 100,
      demurrageStorageFee: 0.00,
      taxAmount: Math.round(taxAmount * 100) / 100,
      discountAmount: 0.00,
      grandTotal,
      paidAmount: 0.00,
      balanceDue: grandTotal,
      publicInvoiceToken: invoiceToken,
      instantPaymentUrl: `https://thos.re/pay/${invoiceToken}`,
      pdfDownloadUrl: `https://thos.re/api/invoices/pdf/${invoiceToken}`,
      issuedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 24 * 3600000).toISOString()
    };
    invoices.unshift(invoice);

    const customer = customers.find(c => c.id === ticket.customerId);
    const vehicle = vehicles.find(v => v.id === ticket.vehicleId);

    // Schedule CollectIQ Escalation Reminders:
    // T+0 (Issued now)
    reminderSchedules.push({
      id: generateId("rem"),
      invoiceId: invoice.id,
      customerId: customer.id,
      step: "T0_INVOICE_ISSUED",
      channel: "WHATSAPP",
      status: "DISPATCHED",
      scheduledFor: new Date().toISOString(),
      dispatchedAt: new Date().toISOString(),
      messageBody: `Invoice ${invoiceNumber} of $${invoice.grandTotal} generated for ${vehicle.brand} ${vehicle.model}.`
    });

    // T+24h (Polite reminder)
    reminderSchedules.push({
      id: generateId("rem"),
      invoiceId: invoice.id,
      customerId: customer.id,
      step: "T24_POLITE_REMINDER",
      channel: "WHATSAPP",
      status: "SCHEDULED",
      scheduledFor: new Date(Date.now() + 24 * 3600000).toISOString(),
      messageBody: `Friendly reminder: Your vehicle is ready. Pay invoice ${invoiceNumber} ($${invoice.grandTotal}) online.`
    });

    // T+48h (Firm reminder with demurrage storage fee warning)
    reminderSchedules.push({
      id: generateId("rem"),
      invoiceId: invoice.id,
      customerId: customer.id,
      step: "T48_FIRM_REMINDER_WITH_DEMURRAGE",
      channel: "WHATSAPP",
      status: "SCHEDULED",
      scheduledFor: new Date(Date.now() + 48 * 3600000).toISOString(),
      messageBody: `Action required: Workshop demurrage fee of $${currentOrg.demurrageDailyFee}/day will apply after 48h for uncollected vehicles. Settle invoice now.`
    });

    // T+72h (Final legal notice)
    reminderSchedules.push({
      id: generateId("rem"),
      invoiceId: invoice.id,
      customerId: customer.id,
      step: "T72_FINAL_LEGAL_NOTICE",
      channel: "WHATSAPP",
      status: "SCHEDULED",
      scheduledFor: new Date(Date.now() + 72 * 3600000).toISOString(),
      messageBody: `Final Notice for ${vehicle.licensePlate}. Immediate payment and retrieval required to prevent garage lien proceedings.`
    });

    logAudit("INVOICE_AUTO_GENERATED", "Invoice", invoice.id, { ticketNumber: ticket.ticketNumber, amount: grandTotal });

    // Dispatched T+0 WhatsApp and Email
    dispatchCommunication({
      channel: "WHATSAPP",
      recipientPhone: customer.phone,
      recipientEmail: customer.email,
      recipientName: customer.fullName,
      templateName: "job_repaired_invoice_t0",
      title: "3. Completion to Invoice: Instant Payment Link Dispatched",
      messageBody: `🎉 Excellent news, ${customer.fullName}!\n\nYour ${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate}) repair & quality audit is COMPLETED at ${currentOrg.name}.\n\n🧾 Itemized Invoice: ${invoice.invoiceNumber}\n💰 Total Balance: $${invoice.grandTotal}\n\nPay online in seconds via WhatsApp / Card / UPI to get your express pickup clearance code:`,
      actionButtons: [
        { text: `💳 Instant Checkout ($${invoice.grandTotal})`, url: invoice.instantPaymentUrl },
        { text: "📥 Download PDF Tax Invoice", url: invoice.pdfDownloadUrl }
      ]
    });
  }

  return { ticket, invoice };
}

// STEP 4B: EXECUTE PAYMENT (Stripe / Razorpay / UPI / Cash)
function recordPayment(invoiceId, { paymentMethod, transactionReference, amount }) {
  const invoice = invoices.find(inv => inv.id === invoiceId);
  if (!invoice) throw new Error("Invoice not found");

  const ticket = tickets.find(t => t.id === invoice.ticketId);
  const customer = customers.find(c => c.id === invoice.customerId);
  const vehicle = vehicles.find(v => v.id === ticket.vehicleId);

  const payAmount = Number(amount) || invoice.balanceDue;

  const payment = {
    id: generateId("pay"),
    invoiceId: invoice.id,
    transactionReference: transactionReference || `TXN-${crypto.randomBytes(5).toString("hex").toUpperCase()}`,
    paymentMethod: paymentMethod || "UPI_DIRECT",
    paymentGateway: "DIRECT_GATEWAY",
    status: "SUCCESS",
    amount: payAmount,
    currency: invoice.currency,
    receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
    paidAt: new Date().toISOString()
  };
  payments.push(payment);

  invoice.paidAmount += payAmount;
  invoice.balanceDue = Math.max(0, invoice.grandTotal - invoice.paidAmount);
  if (invoice.balanceDue <= 0) {
    invoice.status = "PAID";
    invoice.paidAt = new Date().toISOString();
    ticket.status = "READY_FOR_PICKUP";

    // Cancel remaining pending reminders since invoice is paid
    reminderSchedules.filter(r => r.invoiceId === invoice.id && r.status === "SCHEDULED").forEach(r => {
      r.status = "CANCELLED_PAID";
    });
  } else {
    invoice.status = "PARTIALLY_PAID";
  }

  logAudit("PAYMENT_COLLECTED", "Payment", payment.id, { invoiceNumber: invoice.invoiceNumber, amount: payAmount, method: paymentMethod });

  // Dispatched Payment Confirmation + Delivery OTP to Customer
  dispatchCommunication({
    channel: "WHATSAPP",
    recipientPhone: customer.phone,
    recipientEmail: customer.email,
    recipientName: customer.fullName,
    templateName: "payment_reconciled_delivery_otp",
    title: "Payment Received: Delivery OTP Gate Ready",
    messageBody: `✅ Payment of $${payAmount} successfully received for ${vehicle.brand} ${vehicle.model}!\n\nReceipt Number: ${payment.receiptNumber}\nRemaining Balance: $${invoice.balanceDue}\n\n🔐 YOUR 6-DIGIT GATE DELIVERY OTP IS: ${ticket.deliveryOtp}\n\nPlease present this OTP code to the service cashier/technician when collecting your vehicle for release verification.`,
    actionButtons: [
      { text: "🔑 Show Gate Delivery OTP", url: `https://thos.re/track/${ticket.publicTrackingToken}` }
    ]
  });

  return { payment, invoice, ticket };
}

// STEP 5: RECONCILIATION, DELIVERY OTP VERIFICATION & 5-STAR GOOGLE REVIEW
function verifyDeliveryOtp(ticketId, enteredOtp) {
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) throw new Error("Ticket not found");

  if (ticket.deliveryOtp !== enteredOtp.trim()) {
    throw new Error("Invalid Delivery OTP. Security handover verification failed.");
  }

  const invoice = invoices.find(inv => inv.ticketId === ticket.id);
  const customer = customers.find(c => c.id === ticket.customerId);
  const vehicle = vehicles.find(v => v.id === ticket.vehicleId);

  ticket.isOtpVerified = true;
  ticket.status = "DELIVERED";
  ticket.deliveredAt = new Date().toISOString();

  const verification = {
    id: generateId("dlv"),
    ticketId: ticket.id,
    verifiedByUserId: "usr_service_advisor_1",
    enteredOtp,
    isMatched: true,
    handedOverAt: new Date().toISOString()
  };
  deliveryVerifications.push(verification);

  // Initialize Review Prompt
  const reviewPrompt = {
    id: generateId("rev"),
    ticketId: ticket.id,
    customerId: customer.id,
    status: "DISPATCHED",
    dispatchedAt: new Date().toISOString()
  };
  reviewPrompts.push(reviewPrompt);

  logAudit("DELIVERY_OTP_VERIFIED", "Ticket", ticket.id, { enteredOtp, status: "DELIVERED" });

  // Dispatched WhatsApp with PDF Receipt & Google 5-Star Review Prompt
  dispatchCommunication({
    channel: "WHATSAPP",
    recipientPhone: customer.phone,
    recipientEmail: customer.email,
    recipientName: customer.fullName,
    templateName: "delivery_completed_google_review",
    title: "5. Reconciliation & Review: OTP Verified & 5-Star Booster Sent",
    messageBody: `🚗 Vehicle Handover Completed!\n\nThank you for choosing ${currentOrg.name}. Your ${vehicle.brand} ${vehicle.model} has been safely released to you.\n\n📄 Stamped Delivery Receipt: https://thos.re/receipts/${ticket.ticketNumber}.pdf\n\n⭐ Were you satisfied with our service today? Please take 10 seconds to give us a 5-Star rating on Google:`,
    actionButtons: [
      { text: "⭐ ⭐ ⭐ ⭐ ⭐ Rate Us on Google", url: currentOrg.googleReviewUrl },
      { text: "💬 Send Direct Feedback to Manager", url: `https://thos.re/feedback/${ticket.id}` }
    ]
  });

  return { ticket, verification, reviewPrompt };
}

// STEP 4C: COLLECTIQ CRON SIMULATOR (Trigger 24h, 48h, 72h reminders on demand)
function simulateFastForwardEscalation(invoiceId, targetHours) {
  const invoice = invoices.find(i => i.id === invoiceId);
  if (!invoice) throw new Error("Invoice not found");

  const customer = customers.find(c => c.id === invoice.customerId);
  const ticket = tickets.find(t => t.id === invoice.ticketId);
  const vehicle = vehicles.find(v => v.id === ticket.vehicleId);

  let step;
  let title;
  let body;

  if (targetHours >= 72) {
    step = "T72_FINAL_LEGAL_NOTICE";
    title = "CollectIQ T+72h: URGENT Final Legal & Demurrage Notice";
    body = `URGENT LEGAL NOTICE: ${customer.fullName}, invoice ${invoice.invoiceNumber} ($${invoice.balanceDue}) for your ${vehicle.brand} ${vehicle.model} is 72+ hours delinquent. Demurrage charges are active ($${currentOrg.demurrageDailyFee}/day). Please settle immediately to prevent shop lien enforcement.`;
  } else if (targetHours >= 48) {
    step = "T48_FIRM_REMINDER_WITH_DEMURRAGE";
    title = "CollectIQ T+48h: Firm Reminder + Storage Fee Warning";
    body = `Notice from Apex Motors: Your vehicle has been ready for 48 hours. In accordance with service terms, vehicle storage fees of $${currentOrg.demurrageDailyFee}/day will begin accruing. Pay online now: ${invoice.instantPaymentUrl}`;
  } else {
    step = "T24_POLITE_REMINDER";
    title = "CollectIQ T+24h: Polite Pickup & Payment Reminder";
    body = `Friendly reminder: Your ${vehicle.brand} ${vehicle.model} is ready for collection. Pay invoice ${invoice.invoiceNumber} ($${invoice.balanceDue}) online for an instant express gate pass.`;
  }

  const reminder = {
    id: generateId("rem"),
    invoiceId: invoice.id,
    customerId: customer.id,
    step,
    channel: "WHATSAPP",
    status: "DISPATCHED",
    scheduledFor: new Date().toISOString(),
    dispatchedAt: new Date().toISOString(),
    messageBody: body
  };
  reminderSchedules.push(reminder);

  dispatchCommunication({
    channel: "WHATSAPP",
    recipientPhone: customer.phone,
    recipientName: customer.fullName,
    templateName: step.toLowerCase(),
    title,
    messageBody: body,
    actionButtons: [
      { text: `💳 Settle Invoice ($${invoice.balanceDue})`, url: invoice.instantPaymentUrl },
      { text: "📞 Call Manager", url: `tel:${currentOrg.phoneNumber}` }
    ]
  });

  return { reminder, invoice };
}

module.exports = {
  currentOrg,
  customers,
  vehicles,
  tickets,
  estimates,
  ticketItems,
  invoices,
  payments,
  reminderSchedules,
  deliveryVerifications,
  reviewPrompts,
  auditLogs,
  simulatedMessages,
  createIntake,
  submitDiagnosticEstimate,
  respondToEstimate,
  markJobRepaired,
  recordPayment,
  verifyDeliveryOtp,
  simulateFastForwardEscalation
};
