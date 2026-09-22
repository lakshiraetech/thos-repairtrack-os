// ==============================================================================
// THOS RepairTrack OS + CollectIQ - Production Node.js HTTP Backend Server
// Zero-dependency native Node.js REST API & Static Web Engine
// ==============================================================================

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const {
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
} = require("./db");

const {
  VEHICLE_CATALOG,
  COMMON_SERVICE_COMPLAINTS,
  SAMPLE_INVENTORY_PARTS,
  STANDARD_LABOR_TASKS
} = require("./catalog");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "..", "public");

// Helper: JSON Response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  res.end(JSON.stringify(data));
}

// Helper: Parse Request Body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

// Helper: Denormalize ticket for UI view
function enrichTicket(t) {
  const customer = customers.find(c => c.id === t.customerId) || {};
  const vehicle = vehicles.find(v => v.id === t.vehicleId) || {};
  const estimate = estimates.filter(e => e.ticketId === t.id).sort((a, b) => b.versionNumber - a.versionNumber)[0] || null;
  const items = ticketItems.filter(i => i.ticketId === t.id);
  const invoice = invoices.find(inv => inv.ticketId === t.id) || null;
  const verification = deliveryVerifications.find(d => d.ticketId === t.id) || null;

  return {
    ...t,
    customer,
    vehicle,
    estimate,
    items,
    invoice,
    verification
  };
}

// MIME types dictionary for static web assets
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

async function handleRequest(req, res) {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname || "/";

  // Support both /api/... and direct path /... for serverless routing flexibility
  if (!pathname.startsWith("/api") && (
    pathname.startsWith("/bootstrap") ||
    pathname.startsWith("/catalog") ||
    pathname.startsWith("/tickets") ||
    pathname.startsWith("/estimates") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/reminders") ||
    pathname.startsWith("/delivery") ||
    pathname.startsWith("/customer")
  )) {
    pathname = `/api${pathname}`;
  }

  try {
    // --------------------------------------------------------------------------
    // API ROUTE: BOOTSTRAP & CATALOG
    // --------------------------------------------------------------------------
    if (pathname === "/api/bootstrap" && req.method === "GET") {
      const enrichedTickets = tickets.map(enrichTicket);
      return sendJson(res, 200, {
        organization: currentOrg,
        tickets: enrichedTickets,
        invoices,
        payments,
        reminders: reminderSchedules,
        messages: simulatedMessages,
        stats: {
          activeJobs: tickets.filter(t => t.status !== "DELIVERED" && t.status !== "CANCELLED").length,
          pendingEstimates: tickets.filter(t => t.status === "ESTIMATE_PENDING_APPROVAL").length,
          repairedReady: tickets.filter(t => t.status === "REPAIRED" || t.status === "READY_FOR_PICKUP").length,
          deliveredCount: tickets.filter(t => t.status === "DELIVERED").length,
          uncollectedRevenue: invoices.filter(i => i.status !== "PAID").reduce((sum, i) => sum + Number(i.balanceDue), 0)
        }
      });
    }

    if (pathname === "/api/catalog" && req.method === "GET") {
      return sendJson(res, 200, {
        catalog: VEHICLE_CATALOG,
        complaints: COMMON_SERVICE_COMPLAINTS,
        parts: SAMPLE_INVENTORY_PARTS,
        labor: STANDARD_LABOR_TASKS
      });
    }

    // --------------------------------------------------------------------------
    // API ROUTE: STEP 1 - INTAKE TICKET
    // --------------------------------------------------------------------------
    if (pathname === "/api/tickets/intake" && req.method === "POST") {
      const body = await parseBody(req);
      if (!body.customerName || !body.customerPhone || !body.licensePlate || !body.vehicleBrand) {
        return sendJson(res, 400, { error: "Missing required vehicle or customer intake fields" });
      }
      const result = createIntake(body);
      return sendJson(res, 201, {
        success: true,
        message: "Job Ticket registered and WhatsApp live tracking link dispatched",
        ticket: enrichTicket(result.ticket),
        trackingUrl: result.trackingUrl
      });
    }

    // --------------------------------------------------------------------------
    // API ROUTE: STEP 2 - DIAGNOSTIC ESTIMATE
    // --------------------------------------------------------------------------
    if (pathname === "/api/estimates/create" && req.method === "POST") {
      const body = await parseBody(req);
      if (!body.ticketId || !body.items || body.items.length === 0) {
        return sendJson(res, 400, { error: "ticketId and at least one estimate line item are required" });
      }
      const result = submitDiagnosticEstimate(body.ticketId, {
        items: body.items,
        diagnosisNote: body.diagnosisNote
      });
      return sendJson(res, 201, {
        success: true,
        message: "Diagnostic estimate saved and WhatsApp 1-Click approval sent to customer",
        estimate: result.estimate,
        ticket: enrichTicket(result.ticket)
      });
    }

    // Customer 1-Click Approve / Reject callback
    if (pathname === "/api/estimates/respond" && req.method === "POST") {
      const body = await parseBody(req);
      if (!body.estimateId || !body.action) {
        return sendJson(res, 400, { error: "estimateId and action (APPROVE/REJECT) are required" });
      }
      const clientIp = req.socket.remoteAddress;
      const result = respondToEstimate(body.estimateId, {
        action: body.action,
        reason: body.reason,
        clientIp
      });
      return sendJson(res, 200, {
        success: true,
        message: `Estimate ${body.action.toLowerCase()}d successfully`,
        estimate: result.estimate,
        ticket: enrichTicket(result.ticket)
      });
    }

    // --------------------------------------------------------------------------
    // API ROUTE: STEP 3 & 4 - TICKET STATUS & AUTOMATED INVOICING
    // --------------------------------------------------------------------------
    if (pathname === "/api/tickets/status" && req.method === "PATCH") {
      const body = await parseBody(req);
      const ticket = tickets.find(t => t.id === body.ticketId);
      if (!ticket) return sendJson(res, 404, { error: "Ticket not found" });

      if (body.status === "REPAIRED") {
        const result = markJobRepaired(ticket.id);
        return sendJson(res, 200, {
          success: true,
          message: "Ticket marked REPAIRED. CollectIQ Invoice generated & WhatsApp dispatched.",
          ticket: enrichTicket(result.ticket),
          invoice: result.invoice
        });
      } else {
        ticket.status = body.status;
        return sendJson(res, 200, {
          success: true,
          ticket: enrichTicket(ticket)
        });
      }
    }

    // Direct trigger for CollectIQ Invoicing
    if (pathname === "/api/invoices/generate" && req.method === "POST") {
      const body = await parseBody(req);
      const result = markJobRepaired(body.ticketId);
      return sendJson(res, 201, {
        success: true,
        invoice: result.invoice,
        ticket: enrichTicket(result.ticket)
      });
    }

    // --------------------------------------------------------------------------
    // API ROUTE: STEP 4B - RECORD PAYMENT (Simulate instant online payment)
    // --------------------------------------------------------------------------
    if (pathname === "/api/payments/pay" && req.method === "POST") {
      const body = await parseBody(req);
      if (!body.invoiceId) return sendJson(res, 400, { error: "invoiceId is required" });

      const result = recordPayment(body.invoiceId, {
        paymentMethod: body.paymentMethod || "UPI_DIRECT",
        amount: body.amount,
        transactionReference: body.transactionReference
      });

      return sendJson(res, 200, {
        success: true,
        message: "Payment processed successfully. 6-digit Gate Delivery OTP dispatched!",
        payment: result.payment,
        invoice: result.invoice,
        ticket: enrichTicket(result.ticket)
      });
    }

    // --------------------------------------------------------------------------
    // API ROUTE: STEP 4C - COLLECTIQ REMINDER CRON SIMULATOR
    // --------------------------------------------------------------------------
    if (pathname === "/api/reminders/escalate" && req.method === "POST") {
      const body = await parseBody(req);
      if (!body.invoiceId || !body.hours) {
        return sendJson(res, 400, { error: "invoiceId and hours (24, 48, 72) are required" });
      }
      const result = simulateFastForwardEscalation(body.invoiceId, Number(body.hours));
      return sendJson(res, 200, {
        success: true,
        message: `CollectIQ escalated reminder dispatched for T+${body.hours}h`,
        reminder: result.reminder,
        invoice: result.invoice
      });
    }

    // --------------------------------------------------------------------------
    // API ROUTE: STEP 5 - DELIVERY OTP VERIFICATION & GOOGLE REVIEW
    // --------------------------------------------------------------------------
    if (pathname === "/api/delivery/verify-otp" && req.method === "POST") {
      const body = await parseBody(req);
      if (!body.ticketId || !body.otp) {
        return sendJson(res, 400, { error: "ticketId and 6-digit otp are required" });
      }

      try {
        const result = verifyDeliveryOtp(body.ticketId, body.otp);
        return sendJson(res, 200, {
          success: true,
          message: "Delivery OTP verified. Vehicle released and Google Review Booster dispatched!",
          ticket: enrichTicket(result.ticket),
          verification: result.verification,
          reviewPrompt: result.reviewPrompt
        });
      } catch (otpErr) {
        return sendJson(res, 403, { error: otpErr.message });
      }
    }

    // Customer Public Zero-Login Tracking endpoint
    if (pathname.startsWith("/api/customer/track/")) {
      const token = pathname.replace("/api/customer/track/", "");
      const ticket = tickets.find(t => t.publicTrackingToken === token || t.id === token);
      if (!ticket) return sendJson(res, 404, { error: "Invalid tracking link or ticket token" });

      return sendJson(res, 200, {
        ticket: enrichTicket(ticket),
        organization: {
          name: currentOrg.name,
          phone: currentOrg.phoneNumber,
          currency: currentOrg.currency,
          currencySymbol: currentOrg.currencySymbol,
          googleReviewUrl: currentOrg.googleReviewUrl
        }
      });
    }

    // --------------------------------------------------------------------------
    // STATIC FILE SERVING FOR FRONTEND WEB APP
    // --------------------------------------------------------------------------
    let filePath = path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname);

    // If file doesn't exist, fallback to index.html for SPA routes
    if (!fs.existsSync(filePath)) {
      filePath = path.join(PUBLIC_DIR, "index.html");
    }

    const extname = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extname] || "application/octet-stream";

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        return res.end("Server Error Loading Asset");
      }
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    });

  } catch (globalErr) {
    console.error("Unhandled error:", globalErr);
    sendJson(res, 500, { error: globalErr.message || "Internal Server Error" });
  }
}

const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 THOS RepairTrack OS + CollectIQ is LIVE`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔧 Workshop Command OS & Customer Live Portal Active`);
    console.log(`=======================================================`);
  });
}

module.exports = {
  handleRequest,
  server
};
