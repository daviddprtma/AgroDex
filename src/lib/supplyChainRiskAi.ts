export type SupplyChainRiskLevel = "low" | "moderate" | "elevated" | "critical";

export interface RiskScoreCard {
  id: "overall" | "delay" | "fraud" | "inventory" | "supplier";
  label: string;
  score: number;
  change: number;
  level: SupplyChainRiskLevel;
  description: string;
}

export interface DelayPrediction {
  lane: string;
  eta: string;
  delayProbability: number;
  predictedDelayHours: number;
  driver: string;
}

export interface FraudIndicator {
  label: string;
  probability: number;
  level: SupplyChainRiskLevel;
  signals: string[];
}

export interface Recommendation {
  id: string;
  priority: "High" | "Medium" | "Low";
  title: string;
  action: string;
  impact: string;
}

export interface HeatmapCell {
  region: string;
  stage: "Farm" | "Processing" | "Cold Chain" | "Port" | "Distributor";
  risk: number;
}

export interface RiskTrendPoint {
  date: string;
  overallRisk: number;
  delayRisk: number;
  fraudRisk: number;
  inventoryRisk: number;
}

export interface InventorySignal {
  sku: string;
  coverageDays: number;
  reorderUrgency: SupplyChainRiskLevel;
  note: string;
}

export interface SupplierReliability {
  supplier: string;
  reliability: number;
  incidents: number;
  trend: "improving" | "stable" | "declining";
}

export interface SupplyChainRiskAssessment {
  generatedAt: string;
  summary: string;
  confidence: number;
  scoreCards: RiskScoreCard[];
  delayPredictions: DelayPrediction[];
  fraudIndicator: FraudIndicator;
  recommendations: Recommendation[];
  heatmap: HeatmapCell[];
  trends: RiskTrendPoint[];
  inventorySignals: InventorySignal[];
  suppliers: SupplierReliability[];
}

const scoreCards: RiskScoreCard[] = [
  {
    id: "overall",
    label: "Overall Risk",
    score: 64,
    change: -7,
    level: "elevated",
    description: "Weighted aggregate across delay, fraud, inventory, and supplier signals.",
  },
  {
    id: "delay",
    label: "Delay Risk",
    score: 71,
    change: 9,
    level: "elevated",
    description: "Weather disruption and port dwell time are pressuring three active lanes.",
  },
  {
    id: "fraud",
    label: "Fraud Risk",
    score: 38,
    change: -4,
    level: "moderate",
    description: "Two document mismatches need review before downstream release.",
  },
  {
    id: "inventory",
    label: "Inventory Risk",
    score: 57,
    change: 6,
    level: "moderate",
    description: "Cold-chain reserve is below policy for high-demand verified lots.",
  },
  {
    id: "supplier",
    label: "Supplier Reliability",
    score: 82,
    change: 3,
    level: "low",
    description: "Primary suppliers remain stable with improved on-time fulfillment.",
  },
];

const trends: RiskTrendPoint[] = [
  { date: "Jun 01", overallRisk: 58, delayRisk: 61, fraudRisk: 42, inventoryRisk: 49 },
  { date: "Jun 05", overallRisk: 55, delayRisk: 57, fraudRisk: 39, inventoryRisk: 52 },
  { date: "Jun 09", overallRisk: 62, delayRisk: 68, fraudRisk: 44, inventoryRisk: 55 },
  { date: "Jun 13", overallRisk: 66, delayRisk: 73, fraudRisk: 46, inventoryRisk: 59 },
  { date: "Jun 17", overallRisk: 69, delayRisk: 77, fraudRisk: 41, inventoryRisk: 63 },
  { date: "Jun 21", overallRisk: 67, delayRisk: 74, fraudRisk: 40, inventoryRisk: 61 },
  { date: "Jun 25", overallRisk: 64, delayRisk: 71, fraudRisk: 38, inventoryRisk: 57 },
];

const heatmap: HeatmapCell[] = [
  { region: "Java", stage: "Farm", risk: 34 },
  { region: "Java", stage: "Processing", risk: 45 },
  { region: "Java", stage: "Cold Chain", risk: 62 },
  { region: "Java", stage: "Port", risk: 68 },
  { region: "Java", stage: "Distributor", risk: 51 },
  { region: "Sumatra", stage: "Farm", risk: 42 },
  { region: "Sumatra", stage: "Processing", risk: 58 },
  { region: "Sumatra", stage: "Cold Chain", risk: 74 },
  { region: "Sumatra", stage: "Port", risk: 79 },
  { region: "Sumatra", stage: "Distributor", risk: 66 },
  { region: "Sulawesi", stage: "Farm", risk: 29 },
  { region: "Sulawesi", stage: "Processing", risk: 37 },
  { region: "Sulawesi", stage: "Cold Chain", risk: 48 },
  { region: "Sulawesi", stage: "Port", risk: 55 },
  { region: "Sulawesi", stage: "Distributor", risk: 46 },
  { region: "Bali", stage: "Farm", risk: 24 },
  { region: "Bali", stage: "Processing", risk: 31 },
  { region: "Bali", stage: "Cold Chain", risk: 43 },
  { region: "Bali", stage: "Port", risk: 52 },
  { region: "Bali", stage: "Distributor", risk: 39 },
];

const assessment: SupplyChainRiskAssessment = {
  generatedAt: "2026-06-27T08:45:00.000Z",
  confidence: 91,
  summary:
    "AI analysis flags elevated logistics exposure driven by port dwell time, rainfall-sensitive lanes, and reduced cold-chain buffer. Fraud probability is moderate and improving after document checks, while supplier reliability remains the strongest stabilizing factor.",
  scoreCards,
  delayPredictions: [
    {
      lane: "West Java Farm Cluster -> Jakarta Port",
      eta: "2026-06-29 14:00",
      delayProbability: 78,
      predictedDelayHours: 18,
      driver: "Heavy rainfall and port gate congestion",
    },
    {
      lane: "North Sumatra Cooperative -> Medan Cold Hub",
      eta: "2026-06-28 09:30",
      delayProbability: 64,
      predictedDelayHours: 11,
      driver: "Truck availability constraint",
    },
    {
      lane: "Sulawesi Processor -> Surabaya Distributor",
      eta: "2026-06-30 18:15",
      delayProbability: 41,
      predictedDelayHours: 5,
      driver: "Low ferry schedule redundancy",
    },
  ],
  fraudIndicator: {
    label: "Fraud Probability",
    probability: 32,
    level: "moderate",
    signals: [
      "Two harvest-date edits after tokenization",
      "One supplier certificate expires within 14 days",
      "No duplicate QR scan clusters in the last 72 hours",
    ],
  },
  recommendations: [
    {
      id: "reroute-java-lane",
      priority: "High",
      title: "Pre-book alternate Jakarta receiving slot",
      action: "Move two high-value lots to the 06:00 cold dock window and reserve overflow storage.",
      impact: "Reduces predicted delay exposure by 12-16 hours.",
    },
    {
      id: "audit-docs",
      priority: "Medium",
      title: "Run targeted document review",
      action: "Request fresh supplier certificate attestations for batches AGX-2194 and AGX-2201.",
      impact: "Lowers fraud confidence interval before distributor release.",
    },
    {
      id: "inventory-buffer",
      priority: "Medium",
      title: "Increase verified stock buffer",
      action: "Shift 8% of verified rice inventory from reserve to active replenishment.",
      impact: "Improves two-day service coverage for premium buyers.",
    },
  ],
  heatmap,
  trends,
  inventorySignals: [
    {
      sku: "Organic Rice AGX-RC-12",
      coverageDays: 3.2,
      reorderUrgency: "elevated",
      note: "Demand spike from verified retail buyers",
    },
    {
      sku: "Cacao Beans AGX-CB-08",
      coverageDays: 6.7,
      reorderUrgency: "moderate",
      note: "Cold hub capacity can absorb one delayed shipment",
    },
    {
      sku: "Arabica Coffee AGX-CF-04",
      coverageDays: 9.4,
      reorderUrgency: "low",
      note: "Healthy buffer and stable producer cadence",
    },
  ],
  suppliers: [
    { supplier: "Nusantara Growers Cooperative", reliability: 91, incidents: 1, trend: "improving" },
    { supplier: "Sari Bumi Processing", reliability: 84, incidents: 2, trend: "stable" },
    { supplier: "Medan Cold Chain Partners", reliability: 73, incidents: 4, trend: "declining" },
  ],
};

export async function getSupplyChainRiskAssessment(): Promise<SupplyChainRiskAssessment> {
  await new Promise((resolve) => setTimeout(resolve, 450));

  if (import.meta.env.VITE_MOCK_RISK_AI_ERROR === "true") {
    throw new Error("Mock AI risk engine is unavailable. Please retry the assessment.");
  }

  return assessment;
}
