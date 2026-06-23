import { describe, it, expect } from "vitest";
import { exportVerifyResultToPDF } from "../../utils/pdfExport";
import type { VerifyBatchResponse } from "../api";

describe("pdfExport utility", () => {
  const mockFullData: VerifyBatchResponse = {
    success: true,
    cached: false,
    tokenId: "0.0.123456",
    serialNumber: "5",
    status: "verified",
    verifiedAt: "2026-06-22T10:00:00.000Z",
    nftMetadata: { name: "Batch #5 NFT" },
    hcsTransactionIds: [
      "0.0.123@1234567890.000000001",
      "0.0.123@1234567890.000000002"
    ],
    hcsMessages: [],
    ai_summary: {
      summary_en: "This batch contains organic premium coffee from Rwanda, fully verified on ledger.",
      summary_fr: "Ce lot contient du café biologique premium du Rwanda, entièrement vérifié sur le registre.",
      trustScore: 92,
      trustExplanation: "All metadata matches the HCS ledger transactions and supply chain checkpoints perfectly.",
      timeline: [
        {
          timestamp: "2026-06-20T08:00:00.000Z",
          event: "Harvested arabica beans in Rwanda",
          txId: "0.0.123@1234567890.000000001"
        },
        {
          timestamp: "2026-06-21T10:00:00.000Z",
          event: "Processed and packaged at cooperative",
          txId: "0.0.123@1234567890.000000002"
        }
      ],
      generatedAt: "2026-06-22T10:00:00.000Z",
      ms: 120
    },
    batch: {
      id: "batch-uuid-111",
      batch_name: "Kigali Select Arabica",
      product_type: "Coffee Beans",
      quantity: "250 kg",
      location: "Kigali, Rwanda",
      harvest_date: "2026-06-20",
      photo_url: "https://example.com/photo.jpg",
      hcs_tx_id: "0.0.123@1234567890.000000001",
      created_at: "2026-06-22T10:00:00.000Z"
    }
  };

  const mockMinimalData: VerifyBatchResponse = {
    success: true,
    cached: true,
    tokenId: "0.0.789",
    serialNumber: "1",
    status: "registered",
    verifiedAt: "2026-06-22T10:30:00.000Z",
    nftMetadata: null,
    hcsTransactionIds: [],
    hcsMessages: []
  };

  it("should successfully generate a PDF document from full verified batch data", () => {
    const doc = exportVerifyResultToPDF(mockFullData, {
      qrCodeDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      language: "en"
    });

    expect(typeof doc.save).toBe("function");
    expect(typeof doc.output).toBe("function");
    expect(doc.internal.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("should successfully generate a PDF document with minimal verified batch data", () => {
    const doc = exportVerifyResultToPDF(mockMinimalData);

    expect(typeof doc.save).toBe("function");
    expect(typeof doc.output).toBe("function");
    expect(doc.internal.getNumberOfPages()).toBe(1);
  });

  it("should support French language summary if selected", () => {
    const doc = exportVerifyResultToPDF(mockFullData, { language: "fr" });
    expect(typeof doc.save).toBe("function");
  });
});
