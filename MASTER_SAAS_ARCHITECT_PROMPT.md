# MASTER ARCHITECTURAL PROMPT: THOS REPAIRTRACK OS + COLLECTIQ™
## Production Engineering Blueprint & Commercial SaaS Implementation Prompt

---

```markdown
You are a Principal SaaS Architect, Cloud Infrastructure Engineer, and Full-Stack Engineering Lead specializing in high-throughput vertical SaaS platforms for the automotive, motorcycle, fleet logistics, and precision hardware repair industries.

Your objective is to engineer, architect, and deploy "THOS RepairTrack OS" with its proprietary automated revenue recovery engine "CollectIQ" — an enterprise multi-tenant B2B SaaS platform that unifies live repair shop floor management with autonomous, high-retention invoicing and payment collection.

---

### I. CORE PRODUCT VALUE PROPOSITION & UNIFIED 5-STAGE PIPELINE

Every vehicle or device serviced through THOS RepairTrack OS follows an immutable, zero-friction 5-stage lifecycle:

1. STAGE 1: INTAKE & FLEET ONBOARDING
   - Intake Advisor logs customer phone (E.164), vehicle category (Motorcycle, Scooter, Sedan, SUV, Commercial, EV, Device), brand/model from built-in catalogs, license plate, current odometer, fuel/battery gauge (0-100%), and pain point symptoms.
   - System automatically generates:
     * Unique Ticket Number (e.g., `TK-2026-0842`)
     * Cryptographic Public Zero-Login Tracking Token (e.g., `track_9f8a72b...`)
     * Delivery Security OTP (6-digit random code, salted and stored with expiry)
   - Dispatches Meta WhatsApp Cloud API Template `repair_intake_confirmed` containing a 1-click live repair tracking link.

2. STAGE 2: DIAGNOSTIC INSPECTION & 1-CLICK ESTIMATE APPROVAL
   - Senior Technician examines vehicle on bay, enters OBD fault codes, mechanical diagnosis, and compiles parts (OEM/Aftermarket with SKU and warranty) and standard labor hours.
   - System computes subtotal, progressive tax rates (e.g., 18% GST/VAT), and generates Versioned Estimate (`EST-v1`).
   - Dispatches interactive WhatsApp message with two native Action Buttons:
     * Button 1 (Green): "✅ 1-Click Approve ($...)" -> Calls `/api/estimates/respond?action=APPROVE`.
     * Button 2 (Red): "❌ Reject / Request Call" -> Calls `/api/estimates/respond?action=REJECT`.
   - Customer approval captures client IP, timestamp, and audit hash; advances status to `WORK_IN_PROGRESS`.

3. STAGE 3: REPAIR EXECUTION TO AUTOMATIC INVOICING
   - Technicians log parts consumption, fluids, and inspection checkpoints.
   - When status reaches `REPAIRED`, the CollectIQ Invoicing Engine automatically:
     * Aggregates all approved `TicketItems` into an itemized, tamper-evident `Invoice`.
     * Applies organization tax rules, shop consumable surcharges, and creates a unique payment checkout token.
     * Queues the CollectIQ Escalation Reminders Schedule (T+0, T+24h, T+48h, T+72h).
     * Sends WhatsApp & HTML Email notification with instant payment link and downloadable PDF invoice.

4. STAGE 4: COLLECTIQ AUTONOMOUS PAYMENT RECOVERY & DEMURRAGE CRON
   - T+0: Friendly invoice dispatch upon vehicle completion.
   - T+24h Uncollected: Polite automated WhatsApp reminder emphasizing express checkout.
   - T+48h Uncollected: Firm reminder warning of daily shop bay storage fees (e.g., $15/day demurrage grace expiry).
   - T+72h Delinquent: Formal legal notice warning of workshop lien enforcement under local commercial codes.
   - Instant multi-channel payment links supporting: UPI Deep Links (India), Stripe Hosted Checkout (US/EU), Razorpay, Apple Pay, Google Pay, Cards, and Cash/POS.
   - Upon successful payment webhook: Automatically cancels remaining pending reminders, marks invoice `PAID`, and sends vehicle release confirmation containing the 6-Digit Gate Delivery OTP.

5. STAGE 5: RECONCILIATION, OTP GATE CLEARANCE & 5-STAR GOOGLE REVIEW
   - At vehicle collection, customer provides the 6-digit Delivery OTP.
   - Service Advisor / Cashier enters OTP in the POS Handover Terminal.
   - Handover validates against database hash; upon match:
     * Releases vehicle and sets status to `DELIVERED`.
     * Generates immutable delivery verification log with advisor ID and release odometer reading.
     * Automatically dispatches WhatsApp with stamped final PDF receipt.
     * Dispatches the "Review Booster" widget: Prompts customer for a 1-5 star rating. If rating >= 4 stars, seamlessly redirects them to the workshop's official Google Business Profile review link (`https://g.page/r/.../review`). If <= 3 stars, routes internally to the Service Director for resolution.

---

### II. MULTI-TENANT SYSTEM ARCHITECTURE & TECH STACK

- Full-Stack Framework: Next.js 15 (App Router, Server Actions, Route Handlers) or Express/Fastify Node.js.
- Database: PostgreSQL (Neon / Supabase / AWS Aurora) with Prisma ORM.
- Cache & Queues: Redis / Upstash with BullMQ for the CollectIQ reminder escalation scheduler and webhook retries.
- Real-Time Comms:
  * WhatsApp: Meta Cloud API / Twilio WhatsApp API / Gupshup.
  * Email: Resend / SendGrid SMTP with React-Email templates.
- Payment Gateways: Stripe Checkout & Webhooks, Razorpay Payment Links, UPI Intent links.
- Storage: AWS S3 / Cloudflare R2 for vehicle inspection photos, diagnostic OBD logs, and signed PDF receipts.
- Styling & UX: TailwindCSS v4 or Vanilla CSS with custom design tokens, dark glassmorphism (`#0a0d14` obsidian palette), responsive mobile-first layouts, and micro-animations.

---

### III. PRODUCTION PRISMA RELATIONAL SCHEMA SPECIFICATION

Implement the following database schema in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  SUPER_ADMIN
  ORG_OWNER
  SERVICE_ADVISOR
  SENIOR_TECHNICIAN
  JUNIOR_TECHNICIAN
  CASHIER
  INVENTORY_MANAGER
}

enum VehicleCategory {
  MOTORCYCLE
  SCOOTER
  SEDAN
  SUV
  HATCHBACK
  SPORTS_CAR
  ELECTRIC_VEHICLE
  COMMERCIAL_VAN
  HEAVY_TRUCK
  PRECISION_DEVICE
}

enum TicketStatus {
  INTAKE_LOGGED
  INSPECTION_DIAGNOSIS
  ESTIMATE_PENDING_APPROVAL
  ESTIMATE_APPROVED
  ESTIMATE_REJECTED
  WORK_IN_PROGRESS
  WAITING_FOR_PARTS
  QUALITY_CONTROL_TESTING
  REPAIRED
  READY_FOR_PICKUP
  DELIVERED
  CANCELLED
}

enum ItemType {
  OEM_PART
  AFTERMARKET_PART
  LABOR_MECHANICAL
  LABOR_ELECTRICAL
  LABOR_DIAGNOSTIC
  CONSUMABLE_FLUID
  STORAGE_FEE
}

enum InvoiceStatus {
  DRAFT
  ISSUED
  PARTIALLY_PAID
  PAID
  OVERDUE
  ESCALATED_RECOVERY
  VOID
}

enum PaymentMethod {
  STRIPE
  RAZORPAY
  UPI_DIRECT
  CREDIT_DEBIT_CARD
  CASH
  BANK_TRANSFER
  POS_TERMINAL
}

enum ReminderStep {
  T0_INVOICE_ISSUED
  T24_POLITE_REMINDER
  T48_FIRM_REMINDER_WITH_DEMURRAGE
  T72_FINAL_LEGAL_NOTICE
  MANUAL_ESCALATION
}

enum ReminderStatus {
  SCHEDULED
  DISPATCHED
  DELIVERED
  READ
  FAILED
  CANCELLED_PAID
}

model Organization {
  id                    String            @id @default(cuid())
  name                  String
  slug                  String            @unique
  logoUrl               String?
  phoneNumber           String
  supportEmail          String
  currency              String            @default("USD")
  currencySymbol        String            @default("$")
  defaultTaxRatePercent Decimal           @default(18.0) @db.Decimal(5, 2)
  demurrageDailyFee     Decimal           @default(15.0) @db.Decimal(10, 2)
  demurrageGraceHours   Int               @default(48)
  whatsappPhoneNumberId String?
  whatsappAccessToken   String?
  googleReviewUrl       String?
  upiId                 String?
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt

  users                 User[]
  customers             Customer[]
  vehicles              Vehicle[]
  tickets               Ticket[]
  invoices              Invoice[]
  auditLogs             AuditLog[]
}

model User {
  id                    String            @id @default(cuid())
  organizationId        String
  organization          Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  email                 String            @unique
  passwordHash          String
  fullName              String
  role                  UserRole          @default(SERVICE_ADVISOR)
  createdAt             DateTime          @default(now())

  assignedTickets       Ticket[]          @relation("TechnicianTickets")
  createdTickets        Ticket[]          @relation("AdvisorTickets")
}

model Customer {
  id                    String            @id @default(cuid())
  organizationId        String
  organization          Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  fullName              String
  phone                 String            // E.164 formatted
  email                 String?
  isVip                 Boolean           @default(false)
  totalSpent            Decimal           @default(0.0) @db.Decimal(12, 2)
  outstandingBalance    Decimal           @default(0.0) @db.Decimal(12, 2)
  createdAt             DateTime          @default(now())

  vehicles              Vehicle[]
  tickets               Ticket[]
  invoices              Invoice[]
}

model Vehicle {
  id                    String            @id @default(cuid())
  organizationId        String
  organization          Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  customerId            String
  customer              Customer          @relation(fields: [customerId], references: [id], onDelete: Cascade)
  category              VehicleCategory
  brand                 String
  model                 String
  year                  Int?
  licensePlate          String
  currentOdometerKm     Int?
  fuelType              String?

  tickets               Ticket[]
  @@index([organizationId, licensePlate])
}

model Ticket {
  id                    String            @id @default(cuid())
  ticketNumber          String
  organizationId        String
  organization          Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  customerId            String
  customer              Customer          @relation(fields: [customerId], references: [id])
  vehicleId             String
  vehicle               Vehicle           @relation(fields: [vehicleId], references: [id])
  advisorId             String
  advisor               User              @relation("AdvisorTickets", fields: [advisorId], references: [id])
  technicianId          String?
  technician            User?             @relation("TechnicianTickets", fields: [technicianId], references: [id])

  status                TicketStatus      @default(INTAKE_LOGGED)
  intakeOdometerKm      Int?
  fuelGaugePercent      Int?              @default(50)
  customerComplaints    String
  technicianDiagnosis   String?
  publicTrackingToken   String            @unique @default(cuid())
  deliveryOtp           String?
  deliveryOtpExpiresAt  DateTime?
  isOtpVerified         Boolean           @default(false)
  createdAt             DateTime          @default(now())
  completedAt           DateTime?
  deliveredAt           DateTime?

  estimates             Estimate[]
  ticketItems           TicketItem[]
  invoice               Invoice?
}

model Estimate {
  id                    String            @id @default(cuid())
  ticketId              String
  ticket                Ticket            @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  versionNumber         Int               @default(1)
  partsCostSubtotal     Decimal           @db.Decimal(10, 2)
  laborCostSubtotal     Decimal           @db.Decimal(10, 2)
  taxAmount             Decimal           @db.Decimal(10, 2)
  totalEstimatedAmount  Decimal           @db.Decimal(10, 2)
  status                String            @default("DISPATCHED")
  approvalClientIp      String?
  approvedAt            DateTime?
  createdAt             DateTime          @default(now())
}

model TicketItem {
  id                    String            @id @default(cuid())
  ticketId              String
  ticket                Ticket            @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  type                  ItemType
  sku                   String?
  brand                 String?
  description           String
  unitCost              Decimal           @db.Decimal(10, 2)
  unitPrice             Decimal           @db.Decimal(10, 2)
  quantity              Decimal           @default(1.0) @db.Decimal(8, 2)
  taxPercent            Decimal           @default(18.0) @db.Decimal(5, 2)
  totalAmount           Decimal           @db.Decimal(10, 2)
}

model Invoice {
  id                    String            @id @default(cuid())
  invoiceNumber         String
  organizationId        String
  organization          Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  ticketId              String            @unique
  ticket                Ticket            @relation(fields: [ticketId], references: [id])
  customerId            String
  customer              Customer          @relation(fields: [customerId], references: [id])

  status                InvoiceStatus     @default(ISSUED)
  currency              String            @default("USD")
  partsSubtotal         Decimal           @db.Decimal(10, 2)
  laborSubtotal         Decimal           @db.Decimal(10, 2)
  demurrageStorageFee   Decimal           @default(0.0) @db.Decimal(10, 2)
  taxAmount             Decimal           @db.Decimal(10, 2)
  grandTotal            Decimal           @db.Decimal(10, 2)
  paidAmount            Decimal           @default(0.0) @db.Decimal(10, 2)
  balanceDue            Decimal           @db.Decimal(10, 2)
  publicInvoiceToken    String            @unique @default(cuid())
  instantPaymentUrl     String?
  issuedAt              DateTime          @default(now())
  dueDate               DateTime

  payments              Payment[]
  reminderSchedules     ReminderSchedule[]
}

model Payment {
  id                    String            @id @default(cuid())
  invoiceId             String
  invoice               Invoice           @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  transactionReference  String            @unique
  paymentMethod         PaymentMethod
  amount                Decimal           @db.Decimal(10, 2)
  receiptNumber         String?
  paidAt                DateTime          @default(now())
}

model ReminderSchedule {
  id                    String            @id @default(cuid())
  invoiceId             String
  invoice               Invoice           @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  customerId            String
  customer              Customer          @relation(fields: [customerId], references: [id])
  step                  ReminderStep
  channel               String            @default("WHATSAPP")
  status                ReminderStatus    @default(SCHEDULED)
  scheduledFor          DateTime
  dispatchedAt          DateTime?
  messageBody           String?
}

model AuditLog {
  id                    String            @id @default(cuid())
  organizationId        String
  organization          Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  action                String
  entityType            String
  entityId              String
  createdAt             DateTime          @default(now())
}
```

---

### IV. REST API ROUTES & EVENT HANDLERS SPECIFICATION

1. `POST /api/tickets/intake`
   - Input: `{ customerName, customerPhone, customerEmail, vehicleCategory, vehicleBrand, vehicleModel, licensePlate, odometerKm, fuelLevel, customerComplaints }`
   - Logic: Upserts Customer, upserts Vehicle, creates Ticket, issues tracking token, generates 6-digit delivery OTP.
   - Trigger: Calls Meta WhatsApp API with template `repair_intake_confirmed` containing public tracking URL.

2. `POST /api/estimates/create`
   - Input: `{ ticketId, items: [...], diagnosisNote }`
   - Logic: Creates Estimate record, links line items, sets ticket status to `ESTIMATE_PENDING_APPROVAL`.
   - Trigger: Sends WhatsApp interactive estimate with 1-Click Approve / Reject quick buttons.

3. `POST /api/estimates/respond`
   - Input: `{ estimateId, action: "APPROVE" | "REJECT", reason }`
   - Logic: Updates Estimate status. If `APPROVE`: Transitions ticket to `WORK_IN_PROGRESS` and records client IP and timestamp.

4. `PATCH /api/tickets/status`
   - Input: `{ ticketId, status }`
   - Logic: If status is set to `REPAIRED`: Automatically invokes CollectIQ Invoice Generator. Compiles parts + labor + tax, creates `Invoice`, issues checkout link, and enqueues BullMQ delay jobs for T+24h, T+48h, and T+72h payment reminders.

5. `POST /api/payments/pay` & `POST /api/webhooks/payment`
   - Input: Webhook payload from Stripe/Razorpay or internal settlement.
   - Logic: Reconciles invoice balance, sets status to `PAID`, cancels pending BullMQ reminder jobs, transitions ticket to `READY_FOR_PICKUP`, and dispatches the 6-Digit Gate Delivery OTP to the customer's WhatsApp.

6. `POST /api/delivery/verify-otp`
   - Input: `{ ticketId, otp }`
   - Logic: Compares submitted OTP against ticket delivery OTP. On match: Sets status to `DELIVERED`, logs timestamp & advisor ID, dispatches stamped PDF receipt, and sends the 5-Star Google Review conversion link.

7. `POST /api/reminders/cron`
   - Scheduled hourly job inspecting all unpaid invoices older than 24h, 48h, and 72h. Dispatches escalating templates:
     * 24h: Friendly express checkout reminder.
     * 48h: Demurrage surcharge alert ($15/day storage fee notice).
     * 72h: Final urgent legal notice.

---

### V. VEHICLE & BRAND CATALOG INTEGRATION

The platform must support pre-configured dropdowns, trims, and parts catalogs for:
- Two-Wheelers: Royal Enfield (Hunter 350, Classic 350, Himalayan 450, GT 650), Yamaha (R15, MT-15, Aerox), Honda (CB350, CBR650R), KTM (Duke 390, RC 390), Kawasaki (Ninja 300, Z900), BMW Motorrad (G 310, S1000RR), Ducati (Panigale, Monster), Harley-Davidson, Bajaj, TVS, Ather Energy (EV), Ola Electric (EV).
- Four-Wheelers: BMW (M340i, 3 Series, 5 Series, X5), Mercedes-Benz (C-Class, E-Class, GLC, G63), Audi (A4, A6, Q5), Porsche (911, Cayenne, Taycan), Tesla (Model 3, Model Y, Cybertruck), Toyota (Fortuner, Innova Hycross, Land Cruiser), Hyundai (Creta, Verna, Tucson), Tata Motors (Safari, Harrier, Nexon EV), Mahindra (Thar Roxx, XUV700, Scorpio-N), Ford, Volkswagen, Kia.
- Commercial Fleets: Tata Commercial (Ace, Prima), Ashok Leyland (Dost), BharatBenz, Isuzu (D-Max), Volvo Trucks.

---

### VI. PRODUCTION QUALITY CHECKLIST

1. Multi-Tenant Data Isolation: Ensure all Prisma queries filter by `organizationId`.
2. Public Portal Zero-Login Security: Tokenize public tracking links (`publicTrackingToken`) with cuid2/nanoid; do not expose internal database IDs in client URLs.
3. WhatsApp Template Fallbacks: Gracefully fallback to SMS/Email if WhatsApp API returns non-200.
4. Idempotent Payment Webhooks: Enforce unique constraint on `transactionReference` to prevent duplicate crediting.
5. Storage Surcharge Transparency: Demurrage fee calculations must be displayed prominently in estimates and invoice footers.
```
