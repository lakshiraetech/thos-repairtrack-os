// ==============================================================================
// THOS RepairTrack OS + CollectIQ™ — Landing Page Interactivity
// Reactive ROI Calculator, Pricing Toggle, Interactive Pipeline, Demo Modal
// ==============================================================================

document.addEventListener("DOMContentLoaded", () => {
  initRoiCalculator();
  initPricingToggle();
  initDemoModal();
});

// ------------------------------------------------------------------------------
// 1. DYNAMIC WORKSHOP ROI & DEMURRAGE RECOVERY CALCULATOR
// ------------------------------------------------------------------------------
function initRoiCalculator() {
  const sliderVolume = document.getElementById("sliderVolume");
  const sliderTicket = document.getElementById("sliderTicket");
  const sliderRate = document.getElementById("sliderRate");

  const valVolume = document.getElementById("valVolume");
  const valTicket = document.getElementById("valTicket");
  const valRate = document.getElementById("valRate");

  const resultAnnual = document.getElementById("calcAnnualVal");
  const resultMonthly = document.getElementById("calcMonthlyVal");
  const resultHours = document.getElementById("calcHoursVal");

  if (!sliderVolume || !sliderTicket || !sliderRate) return;

  function updateCalculations() {
    const volume = Number(sliderVolume.value);
    const ticket = Number(sliderTicket.value);
    const rate = Number(sliderRate.value);

    // Update displayed slider values
    valVolume.textContent = volume + " vehicles";
    valTicket.textContent = "$" + ticket.toLocaleString();
    valRate.textContent = rate + "%";

    // Financial formulas
    const monthlyGross = volume * ticket;
    const atRiskMonthly = monthlyGross * (rate / 100);
    // CollectIQ autonomous recovery baseline: 88% success rate
    const recoveredMonthly = atRiskMonthly * 0.88;
    const recoveredAnnual = recoveredMonthly * 12;
    // Follow-up labor time saved (average 25 minutes saved per uncollected customer invoice)
    const hoursSavedMonthly = Math.round(volume * 0.42);

    // Update results
    resultAnnual.textContent = "$" + Math.round(recoveredAnnual).toLocaleString();
    resultMonthly.textContent = "$" + Math.round(recoveredMonthly).toLocaleString() + "/mo";
    resultHours.textContent = hoursSavedMonthly + " hrs/mo";
  }

  sliderVolume.addEventListener("input", updateCalculations);
  sliderTicket.addEventListener("input", updateCalculations);
  sliderRate.addEventListener("input", updateCalculations);

  updateCalculations();
}

// ------------------------------------------------------------------------------
// 2. PRICING BILLING CYCLE TOGGLE (MONTHLY VS ANNUAL -20%)
// ------------------------------------------------------------------------------
function initPricingToggle() {
  const pricingData = {
    monthly: {
      starter: 79,
      pro: 189,
      enterprise: 449,
      period: "/month"
    },
    annual: {
      starter: 63,
      pro: 149,
      enterprise: 359,
      period: "/month (billed annually)"
    }
  };

  const btnMonthly = document.getElementById("billingMonthly");
  const btnAnnual = document.getElementById("billingAnnual");

  const priceStarter = document.getElementById("priceStarter");
  const pricePro = document.getElementById("pricePro");
  const priceEnterprise = document.getElementById("priceEnterprise");

  const periodStarter = document.getElementById("periodStarter");
  const periodPro = document.getElementById("periodPro");
  const periodEnterprise = document.getElementById("periodEnterprise");

  if (!btnMonthly || !btnAnnual) return;

  window.setBillingCycle = function(cycle) {
    if (cycle === "annual") {
      btnAnnual.classList.add("active");
      btnMonthly.classList.remove("active");

      priceStarter.textContent = pricingData.annual.starter;
      pricePro.textContent = pricingData.annual.pro;
      priceEnterprise.textContent = pricingData.annual.enterprise;

      periodStarter.textContent = pricingData.annual.period;
      periodPro.textContent = pricingData.annual.period;
      periodEnterprise.textContent = pricingData.annual.period;
    } else {
      btnMonthly.classList.add("active");
      btnAnnual.classList.remove("active");

      priceStarter.textContent = pricingData.monthly.starter;
      pricePro.textContent = pricingData.monthly.pro;
      priceEnterprise.textContent = pricingData.monthly.enterprise;

      periodStarter.textContent = pricingData.monthly.period;
      periodPro.textContent = pricingData.monthly.period;
      periodEnterprise.textContent = pricingData.monthly.period;
    }
  };
}

// ------------------------------------------------------------------------------
// 3. BOOK AN ENTERPRISE DEMO MODAL (NATIVE HTML5 <DIALOG>)
// ------------------------------------------------------------------------------
function initDemoModal() {
  const modal = document.getElementById("demoModal");
  if (!modal) return;

  // Light dismiss on backdrop click
  modal.addEventListener("click", (e) => {
    const dialogDimensions = modal.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      modal.close();
    }
  });

  window.openDemoModal = function() {
    modal.showModal();
  };

  window.closeDemoModal = function() {
    modal.close();
  };

  const form = document.getElementById("demoForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const workshopName = document.getElementById("demoWorkshopName").value;
      const contactPhone = document.getElementById("demoPhone").value;

      form.innerHTML = `
        <div style="text-align: center; padding: 24px 0;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🎉</div>
          <h3 style="font-size: 1.4rem; color: #fff; margin-bottom: 8px;">Demo Confirmed!</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 20px;">
            Thank you, <strong>${workshopName}</strong>. Our enterprise solutions architect will connect with you at <strong>${contactPhone}</strong> with your personalized onboarding sandbox.
          </p>
          <a href="/app" class="btn btn-primary" style="width: 100%;">Launch Live Sandbox App Now 🚀</a>
        </div>
      `;
    });
  }
}
