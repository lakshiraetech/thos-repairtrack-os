# 🚀 THOS RepairTrack OS + CollectIQ™

> **Enterprise Workshop Operating System & Autonomous Revenue Recovery Engine**  
> Streamline vehicle repair bay execution, automate WhatsApp estimates & approvals, generate tamper-evident invoices, and recover uncollected revenue automatically.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flakshiraetech%2Fthos-repairtrack-os)

---

## 🌟 Key Capabilities & 5-Stage Lifecycle

1. **Stage 1: Multi-Category Vehicle Intake**
   - Instant intake for Motorcycles, Scooters, Sedans, SUVs, Commercial, EV, and Precision Devices.
   - Generates unique Ticket Number (`TK-2026-XXXX`), cryptographic Zero-Login Live Tracking link, and salted 6-digit Delivery OTP.
   - Simulated WhatsApp Cloud API intake notification.

2. **Stage 2: Diagnostic Inspection & 1-Click WhatsApp Approval**
   - OBD-II code logging, mechanical diagnosis notes, OEM/Aftermarket parts selection, and standard labor units.
   - Computes progressive taxes (GST/VAT) with versioned estimates (`EST-v1`).
   - Dispatches interactive WhatsApp 1-Click Approve / Reject links.

3. **Stage 3: Repair Execution to Automated Invoicing**
   - Moving job status to `REPAIRED` instantly compiles line items into a tamper-evident invoice with shop consumable surcharges.
   - Queues the CollectIQ automated escalation reminder schedule (`T+0`, `T+24h`, `T+48h`, `T+72h`).

4. **Stage 4: CollectIQ Autonomous Payment Recovery Engine**
   - Multi-channel simulated payment links (UPI Intent, Cards, Cash/POS).
   - Fast-forward timeline simulator for overdue escalations (`T+24h` courtesy reminder, `T+48h` bay demurrage fee warning, `T+72h` workshop lien legal notice).
   - Real-time balance due calculations and instant payment clearing.

5. **Stage 5: Delivery OTP Gate Clearance & Review Booster**
   - Dual-side security gate verification: customer presents 6-digit OTP, cashier validates against hashed token.
   - Vehicle released to `DELIVERED` status with recorded exit odometer.
   - Automated Google Business Profile Review Booster for ratings $\ge 4$ stars.

---

## 📁 Repository Structure

```
thos-repairtrack-os/
├── api/
│   └── index.js             # Vercel Serverless Function entrypoint
├── public/
│   ├── index.html           # Workshop Command Center & Customer Portal SPA
│   ├── style.css            # Dark Obsidian (#0a0d14) glassmorphic styling
│   └── app.js               # Reactive client-side application logic
├── server/
│   ├── server.js            # Dual-mode HTTP server & API route handler
│   ├── db.js                # Core state transitions, seed data & business logic
│   └── catalog.js           # Vehicle models, complaints, parts & labor catalogs
├── prisma/
│   └── schema.prisma        # Enterprise PostgreSQL Prisma relational schema
├── vercel.json              # Vercel routing rewrites & security headers
├── package.json             # Scripts and engine requirements
├── .gitignore               # Ignored build, OS, and environment files
└── README.md                # Documentation & deployment guide
```

---

## ⚡ Deployment to Vercel

### Option 1: Continuous Deployment via GitHub (Recommended)

1. Push this repository to GitHub (see instructions below).
2. Open your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." > "Project"**.
3. Select your GitHub repository.
4. Keep the default settings (Framework Preset: **Other**).
5. Click **Deploy**. Vercel will automatically build the static assets and deploy the Serverless Functions at `/api/*`.

### Option 2: Direct CLI Deployment

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🐙 Push to GitHub Instructions

If you are pushing this project to your GitHub account:

```bash
# 1. Initialize git repository (if not already done)
git init -b main

# 2. Add all files and commit
git add .
git commit -m "feat: initial commit - THOS RepairTrack OS + CollectIQ engine with Vercel hosting setup"

# 3. Add your GitHub remote repository URL
git remote add origin https://github.com/lakshiraetech/thos-repairtrack-os.git

# 4. Push to GitHub
git push -u origin main
```

---

## 💻 Local Development

Run locally without external dependencies using native Node.js:

```bash
# Start development server
npm start
# or
node server/server.js
```

Open `http://localhost:3000` in your browser to access the Workshop Command Center and Live Customer Portal.

---

## 🛠️ API Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/bootstrap` | Fetch active organization state, tickets, stats & invoices |
| `GET` | `/api/catalog` | Fetch vehicle models, complaints, parts & labor catalogs |
| `POST` | `/api/tickets/intake` | Register new customer & vehicle intake ticket |
| `POST` | `/api/estimates/create` | Submit diagnostic estimate line items |
| `POST` | `/api/estimates/respond` | Customer 1-Click Approve / Reject estimate |
| `PATCH`| `/api/tickets/status` | Advance ticket status (`REPAIRED` triggers CollectIQ) |
| `POST` | `/api/payments/pay` | Record payment & generate Gate Delivery OTP |
| `POST` | `/api/reminders/escalate` | Simulate CollectIQ T+24h, T+48h, T+72h escalations |
| `POST` | `/api/delivery/verify-otp` | Verify gate delivery OTP & trigger Review Booster |
| `GET` | `/api/customer/track/:token` | Public zero-login live vehicle tracking portal |

---

## 📄 License
UNLICENSED - Proprietary commercial software.
