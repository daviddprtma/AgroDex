import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculateProducerTrustScore } from "../../../backend/src/services/trust-score.service.js";

// Mock the database client
const mockFrom = vi.fn();
vi.mock("../../../backend/src/db.js", () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        eq: (col: string, val: any) => {
          return mockFrom(table, col, val);
        },
        in: (col: string, vals: any[]) => {
          return mockFrom(table, col, vals);
        }
      })
    })
  }
}));

describe("Producer Trust Score System Calculations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate score for a brand-new producer (no history)", async () => {
    // Mock database to return empty arrays for everything
    mockFrom.mockImplementation((table) => {
      if (table === "producer_certifications") {
        return Promise.resolve({ data: [], error: null });
      }
      if (table === "batches") {
        return Promise.resolve({ data: [], error: null });
      }
      if (table === "fraud_scores") {
        return Promise.resolve({ data: [], error: null });
      }
      return Promise.resolve({ data: [], error: null });
    });

    const result = await calculateProducerTrustScore("test-farmer-id-1");

    expect(result.trustScore).toBe(70);
    expect(result.hasTrustedBadge).toBe(false);
    expect(result.verificationAnalytics.totalVerifications).toBe(0);
    expect(result.certificationHistory.length).toBe(0);
    expect(result.complianceSummary.totalBatches).toBe(0);
    expect(result.complianceSummary.complianceLevel).toBe("New Producer (No Batch History)");
  });

  it("should calculate score for perfect compliance & active certifications", async () => {
    // Mock database responses
    mockFrom.mockImplementation((table) => {
      if (table === "producer_certifications") {
        return Promise.resolve({
          data: [
            { id: "c1", name: "IndoGAP Organic", issue_date: "2026-01-01", expiry_date: "2027-01-01", status: "Active" }
          ],
          error: null
        });
      }
      if (table === "batches") {
        return Promise.resolve({
          data: [
            { id: "b1", hedera_token_id: "0.0.1", hedera_serial_number: "1" }
          ],
          error: null
        });
      }
      if (table === "verifications") {
        return Promise.resolve({
          data: [
            { token_id: "0.0.1", serial_number: "1", trace: { ai: { trustScore: 95 } } }
          ],
          error: null
        });
      }
      if (table === "fraud_scores") {
        return Promise.resolve({
          data: [
            { risk_score: 0 } // perfect compliance
          ],
          error: null
        });
      }
      return Promise.resolve({ data: [], error: null });
    });

    const result = await calculateProducerTrustScore("test-farmer-id-2");

    // VSR (100%): 30 pts
    // Success count (1 success): +3 pts
    // Certifications (1 active): +15 pts
    // Compliance (avg risk 0): 20 pts
    // Expected: 30 + 3 + 15 + 20 = 68
    expect(result.trustScore).toBe(68);
    expect(result.hasTrustedBadge).toBe(false); // below default threshold 80
  });

  it("should penalize expired certifications and handle failed verifications", async () => {
    mockFrom.mockImplementation((table) => {
      if (table === "producer_certifications") {
        return Promise.resolve({
          data: [
            // Expired in 2025 (current time is 2026)
            { id: "c1", name: "Expired Organic Cert", issue_date: "2024-01-01", expiry_date: "2025-01-01", status: "Expired" }
          ],
          error: null
        });
      }
      if (table === "batches") {
        return Promise.resolve({
          data: [
            { id: "b1", hedera_token_id: "0.0.1", hedera_serial_number: "1" },
            { id: "b2", hedera_token_id: "0.0.2", hedera_serial_number: "1" }
          ],
          error: null
        });
      }
      if (table === "verifications") {
        return Promise.resolve({
          data: [
            { token_id: "0.0.1", serial_number: "1", trace: { ai: { trustScore: 90 } } }, // Success
            { token_id: "0.0.2", serial_number: "1", trace: { ai: { trustScore: 40 } } }  // Failed
          ],
          error: null
        });
      }
      if (table === "fraud_scores") {
        return Promise.resolve({
          data: [
            { risk_score: 60 } // high risk
          ],
          error: null
        });
      }
      return Promise.resolve({ data: [], error: null });
    });

    const result = await calculateProducerTrustScore("test-farmer-id-3");

    // VSR (50%): (50/100) * 30 = 15 pts
    // Success count (1 success): +3 pts
    // Certifications (1 expired): -5 pts
    // Compliance (avg risk 60): ((100-60)/100) * 20 = 8 pts
    // Expected: 15 + 3 - 5 + 8 = 21
    expect(result.trustScore).toBe(21);
    expect(result.hasTrustedBadge).toBe(false);
  });

  it("should grant Trusted Producer Badge when score exceeds threshold", async () => {
    mockFrom.mockImplementation((table) => {
      if (table === "producer_certifications") {
        return Promise.resolve({
          data: [
            { id: "c1", name: "IndoGAP Organic", issue_date: "2026-01-01", expiry_date: "2027-01-01", status: "Active" },
            { id: "c2", name: "Fair Trade Certification", issue_date: "2026-01-01", expiry_date: "2027-01-01", status: "Active" }
          ],
          error: null
        });
      }
      if (table === "batches") {
        return Promise.resolve({
          data: [
            { id: "b1", hedera_token_id: "0.0.1", hedera_serial_number: "1" },
            { id: "b2", hedera_token_id: "0.0.2", hedera_serial_number: "1" },
            { id: "b3", hedera_token_id: "0.0.3", hedera_serial_number: "1" }
          ],
          error: null
        });
      }
      if (table === "verifications") {
        return Promise.resolve({
          data: [
            { token_id: "0.0.1", serial_number: "1", trace: { ai: { trustScore: 90 } } },
            { token_id: "0.0.2", serial_number: "1", trace: { ai: { trustScore: 92 } } },
            { token_id: "0.0.3", serial_number: "1", trace: { ai: { trustScore: 88 } } }
          ],
          error: null
        });
      }
      if (table === "fraud_scores") {
        return Promise.resolve({
          data: [
            { risk_score: 5 } // extremely low risk
          ],
          error: null
        });
      }
      return Promise.resolve({ data: [], error: null });
    });

    const result = await calculateProducerTrustScore("test-farmer-id-4");

    // VSR (100%): 30 pts
    // Success count (3 successes): 3 * 3 = 9 pts
    // Certifications (2 active): 2 * 15 = 30 pts
    // Compliance (avg risk 5): ((100-5)/100) * 20 = 19 pts
    // Expected: 30 + 9 + 30 + 19 = 88
    expect(result.trustScore).toBe(88);
    expect(result.hasTrustedBadge).toBe(true); // >= 80
  });
});
