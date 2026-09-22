// ==============================================================================
// THOS RepairTrack OS - Comprehensive Vehicle & Brand Catalog
// Multi-Brand database for Two-Wheelers, Four-Wheelers, EVs & Commercial Fleets
// ==============================================================================

const VEHICLE_CATALOG = {
  MOTORCYCLE: {
    label: "Motorcycle / Two-Wheeler",
    brands: [
      {
        name: "Royal Enfield",
        models: ["Classic 350", "Hunter 350", "Himalayan 450", "Continental GT 650", "Interceptor 650", "Meteor 350", "Shotgun 650", "Bullet 350"]
      },
      {
        name: "Yamaha",
        models: ["YZF R15 V4", "MT-15 V2", "FZ-S FI", "Aerox 155", "YZF R3", "MT-09", "Tenere 700"]
      },
      {
        name: "Honda Two-Wheelers",
        models: ["CB350 H'ness", "CB350RS", "CBR650R", "Hornet 2.0", "SP 125", "Africa Twin CRF1100L", "Transalp XL750"]
      },
      {
        name: "KTM",
        models: ["Duke 390", "RC 390", "390 Adventure", "Duke 250", "RC 200", "Duke 200", "890 Adventure R"]
      },
      {
        name: "Kawasaki",
        models: ["Ninja 300", "Ninja 400", "Ninja 500", "Ninja ZX-10R", "Ninja ZX-6R", "Z900", "Versys 650", "Z650"]
      },
      {
        name: "BMW Motorrad",
        models: ["G 310 R", "G 310 GS", "S 1000 RR", "R 1250 GS Adventure", "R 1300 GS", "M 1000 R", "F 900 XR"]
      },
      {
        name: "Ducati",
        models: ["Panigale V4 S", "Monster 937", "Scrambler Icon", "Multistrada V4 S", "Streetfighter V2", "Diavel V4"]
      },
      {
        name: "Triumph",
        models: ["Speed 400", "Scrambler 400X", "Street Triple 765 RS", "Tiger 900 Rally Pro", "Bonneville T120", "Rocket 3 R"]
      },
      {
        name: "Harley-Davidson",
        models: ["X440", "Nightster", "Sportster S", "Fat Boy 114", "Pan America 1250 Special", "Road Glide"]
      },
      {
        name: "Bajaj",
        models: ["Pulsar NS200", "Pulsar RS200", "Pulsar N250", "Dominar 400", "Dominar 250", "Avenger Cruise 220"]
      },
      {
        name: "TVS",
        models: ["Apache RR 310", "Apache RTR 310", "Apache RTR 200 4V", "Ronin 225", "Raider 125"]
      },
      {
        name: "Suzuki Two-Wheelers",
        models: ["Hayabusa GSX1300R", "Katana", "V-Strom SX 250", "Gixxer SF 250", "Gixxer 150"]
      },
      {
        name: "Hero MotoCorp",
        models: ["Mavrick 440", "Karizma XMR", "Xpulse 200 4V", "Splendor Plus", "Glamour Xtec"]
      }
    ]
  },
  SCOOTER: {
    label: "Scooter / Commuter",
    brands: [
      {
        name: "Honda",
        models: ["Activa 6G", "Activa 125", "Dio 125", "Dio 110"]
      },
      {
        name: "TVS",
        models: ["Jupiter 125", "Jupiter 110", "NTORQ 125", "iQube Electric", "X EV"]
      },
      {
        name: "Suzuki",
        models: ["Access 125", "Burgman Street 125", "Avenis 125"]
      },
      {
        name: "Vespa / Aprilia",
        models: ["Vespa SXL 150", "Vespa VXL 125", "Aprilia SR 160", "Aprilia Storm 125", "Aprilia SXR 160"]
      },
      {
        name: "Ather Energy (EV)",
        models: ["450X Gen 3", "450S", "450 Apex", "Rizta Z"]
      },
      {
        name: "Ola Electric (EV)",
        models: ["S1 Pro Gen 2", "S1 Air", "S1 X+ (3kWh)", "S1 X (2kWh)"]
      }
    ]
  },
  SEDAN: {
    label: "Sedan / Saloon",
    brands: [
      {
        name: "BMW",
        models: ["M340i xDrive", "330Li Gran Limousine", "530Li M Sport", "740i", "M5 Competition", "i4 eDrive40 EV"]
      },
      {
        name: "Mercedes-Benz",
        models: ["C-Class C300d", "E-Class E220d", "S-Class S450", "AMG C43 4MATIC", "AMG E63 S", "EQS 580 EV"]
      },
      {
        name: "Audi",
        models: ["A4 40 TFSI", "A6 45 TFSI", "A8 L 55 TFSI", "S5 Sportback", "RS7 Sportback", "e-tron GT"]
      },
      {
        name: "Honda Cars",
        models: ["City 5th Gen Petrol", "City e:HEV Strong Hybrid", "Civic Type R", "Accord Hybrid"]
      },
      {
        name: "Hyundai",
        models: ["Verna 1.5 Turbo GDi", "Aura", "Elantra"]
      },
      {
        name: "Skoda",
        models: ["Slavia 1.5 TSI", "Octavia RS", "Superb L&K"]
      },
      {
        name: "Volkswagen",
        models: ["Virtus GT Plus 1.5 TSI", "Virtus 1.0 TSI", "Jetta GLI", "Passat"]
      },
      {
        name: "Toyota",
        models: ["Camry Hybrid", "Corolla Altis", "Crown Sedan", "Yaris"]
      },
      {
        name: "Tesla (EV)",
        models: ["Model 3 Long Range", "Model 3 Performance", "Model S Plaid"]
      }
    ]
  },
  SUV: {
    label: "SUV / Crossover / 4x4",
    brands: [
      {
        name: "Toyota",
        models: ["Fortuner 4x4 Legender", "Innova Hycross Strong Hybrid", "Land Cruiser 300 ZX", "Hilux 4x4", "Urban Cruiser Hyryder"]
      },
      {
        name: "Mahindra",
        models: ["Thar Roxx 4x4 (5-Door)", "Thar 3-Door 4x4", "XUV700 AX7L", "Scorpio-N Z8L 4x4", "Scorpio Classic", "XUV 3XO"]
      },
      {
        name: "Tata Motors",
        models: ["Safari Accomplished+ Dark", "Harrier Fearless+", "Nexon Fearless+ PR", "Punch Creative", "Curvv Coupe SUV"]
      },
      {
        name: "Hyundai",
        models: ["Creta 1.5 Turbo SX(O)", "Creta N Line", "Venue N Line", "Tucson Signature AWD", "Alcazar", "Exter"]
      },
      {
        name: "BMW",
        models: ["X1 sDrive18d", "X3 xDrive30d", "X5 xDrive40i M Sport", "X7 xDrive40d M Sport", "XM Hybrid"]
      },
      {
        name: "Mercedes-Benz",
        models: ["GLC 300 4MATIC", "GLE 450d", "GLS 450", "G-Class AMG G63", "EQE 500 4MATIC SUV"]
      },
      {
        name: "Land Rover",
        models: ["Defender 110 V8", "Defender 90", "Range Rover Sport SV", "Range Rover Autobiography", "Velar R-Dynamic"]
      },
      {
        name: "Porsche",
        models: ["Cayenne Turbo GT", "Cayenne E-Hybrid", "Macan GTS", "Macan EV"]
      },
      {
        name: "Ford",
        models: ["Endeavour / Everest 4x4", "Bronco Raptor", "F-150 Raptor", "Explorer ST"]
      },
      {
        name: "Tesla (EV)",
        models: ["Model Y Long Range", "Model Y Performance", "Model X Plaid", "Cybertruck Tri-Motor AWD"]
      },
      {
        name: "Kia",
        models: ["Seltos X-Line 1.5 Turbo", "Sonet X-Line", "EV6 GT-Line AWD", "EV9 Electric SUV"]
      }
    ]
  },
  COMMERCIAL_VAN: {
    label: "Commercial & Fleet Vehicles",
    brands: [
      {
        name: "Tata Commercial",
        models: ["Ace Gold Diesel", "Intra V30", "Winger Passenger Van", "Yodha 2.0 Pickup", "Prima 5530.S"]
      },
      {
        name: "Ashok Leyland",
        models: ["Bada Dost i4", "Dost Strong", "Partner Super", "Ecomet Star"]
      },
      {
        name: "BharatBenz",
        models: ["1917R Medium Duty", "2823R Heavy Rigid", "3528CM Mining Tipper", "5528T Tractor"]
      },
      {
        name: "Isuzu",
        models: ["D-Max V-Cross 4x4", "D-Max S-Cab Commercial", "Hi-Lander", "FTR Truck Series"]
      },
      {
        name: "Volvo Trucks",
        models: ["FM 420 8x4 Tipper", "FH16 Heavy Haulage", "FMX Heavy Construction"]
      }
    ]
  }
};

// Common Diagnostic Failure Symptoms Catalog for Quick Service Advisor Entry
const COMMON_SERVICE_COMPLAINTS = [
  "Engine check light blinking under acceleration",
  "Severe brake squeal & vibrating pedal at highway speed",
  "Clutch slipping when shifting from 2nd to 3rd gear",
  "Engine overheating in stop-and-go traffic; coolant level dropping",
  "Front suspension clunking over speed bumps and uneven surfaces",
  "Periodic 10,000 km Scheduled General Service + Synthetic Oil Change",
  "AC blowing warm ambient air; compressor not engaging",
  "Battery draining overnight; intermittent starter motor clicking",
  "Steering pulling heavily to the left; uneven tire tread wear",
  "ABS warning light continuously illuminated after water crossing"
];

// Pre-configured OEM & Aftermarket Parts Database
const SAMPLE_INVENTORY_PARTS = [
  { sku: "BRK-PAD-F01", brand: "Brembo", description: "Ceramic Front Brake Pad Set (High Performance)", cost: 42.00, price: 78.00, type: "OEM_PART", warrantyMonths: 12 },
  { sku: "OIL-SYN-5W40", brand: "Motul 300V", description: "100% Synthetic 5W-40 Engine Lubricant (4 Litres)", cost: 38.00, price: 65.00, type: "CONSUMABLE_FLUID", warrantyMonths: 6 },
  { sku: "FLT-OIL-OEM", brand: "Bosch", description: "High-Efficiency Spin-On Engine Oil Filter", cost: 8.50, price: 18.00, type: "OEM_PART", warrantyMonths: 6 },
  { sku: "FLT-AIR-KN", brand: "K&N Engineering", description: "High-Flow Conical Replacement Air Filter", cost: 32.00, price: 58.00, type: "AFTERMARKET_PART", warrantyMonths: 24 },
  { sku: "SPK-IRID-NGK", brand: "NGK Laser Iridium", description: "Laser Iridium Spark Plugs (Pack of 4)", cost: 24.00, price: 48.00, type: "OEM_PART", warrantyMonths: 12 },
  { sku: "BAT-AGM-70AH", brand: "Exide / Amaron", description: "Heavy Duty AGM Maintenance-Free 70Ah Battery", cost: 95.00, price: 160.00, type: "OEM_PART", warrantyMonths: 36 },
  { sku: "CLT-PLT-KIT", brand: "Luk / Valeo", description: "Complete Clutch Plate, Pressure Plate & Release Bearing Kit", cost: 110.00, price: 195.00, type: "OEM_PART", warrantyMonths: 12 },
  { sku: "SUS-LNK-ROD", brand: "Lemforder", description: "Heavy Duty Front Stabilizer Sway Bar Link Rod Set", cost: 28.00, price: 54.00, type: "OEM_PART", warrantyMonths: 12 }
];

// Standardized Labor Rate Codes
const STANDARD_LABOR_TASKS = [
  { sku: "LBR-GEN-SRV", description: "Complete 40-Point Comprehensive General Service & Inspection", price: 65.00, type: "LABOR_MECHANICAL" },
  { sku: "LBR-BRK-SRV", description: "Front & Rear Brake Caliper Overhaul, Pad Replacement & Bleed", price: 45.00, type: "LABOR_MECHANICAL" },
  { sku: "LBR-OBD-DIAG", description: "Full ECU Electronic Scan, OBD-II Fault Code Clearing & Calibration", price: 35.00, type: "LABOR_DIAGNOSTIC" },
  { sku: "LBR-CLT-REP", description: "Clutch System Teardown, Flywheel Inspection & Reassembly", price: 90.00, type: "LABOR_MECHANICAL" },
  { sku: "LBR-AC-RECHG", description: "HVAC System Vacuum Leak Test, R134a Refrigerant Gas Recharge", price: 55.00, type: "LABOR_ELECTRICAL" },
  { sku: "LBR-WHL-ALGN", description: "3D Laser Wheel Alignment & High-Speed Dynamic Balancing (4 Wheels)", price: 40.00, type: "LABOR_MECHANICAL" }
];

module.exports = {
  VEHICLE_CATALOG,
  COMMON_SERVICE_COMPLAINTS,
  SAMPLE_INVENTORY_PARTS,
  STANDARD_LABOR_TASKS
};
