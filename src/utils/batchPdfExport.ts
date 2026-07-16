import { jsPDF } from "jspdf";
import type { RegisterBatchResponse, TokenizeBatchResponse } from "@/lib/api";

export interface RegistrationPDFOptions {
  qrCodeDataUrl?: string;
  language?: "en" | "fr";
  productName?: string;
  harvestBatch?: string;
  quantity?: string;
  unit?: string;
  location?: string;
  harvestDate?: string;
}

export interface TokenizationPDFOptions {
  qrCodeDataUrl?: string;
  language?: "en" | "fr";
}

/**
 * Generate a PDF certificate for a newly registered batch (pre-tokenization).
 * Contains batch metadata, AI analysis, HCS transaction ID, and QR code.
 */
export function exportRegistrationResultToPDF(
  data: RegisterBatchResponse,
  options: RegistrationPDFOptions = {},
) {
  const { qrCodeDataUrl, language = "en", productName, harvestBatch, quantity, unit, location, harvestDate } = options;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageHeight = 297;
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  const marginBottom = 20;
  let y = 15;

  const checkPageBounds = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      drawPageFooter();
      y = 20;
      return true;
    }
    return false;
  };

  const drawPageFooter = () => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.text("AgroDex Registration Certificate • Hedera HCS Registry Record", margin, pageHeight - 10);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
    }
  };

  // PAGE 1 HEADER BANNER
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 45, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("AGRODEX REGISTRATION CERTIFICATE", margin, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text("Indonesian Agricultural Batch Registration • Hedera HCS Anchor", margin, 25);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Certificate Issued: ${new Date().toLocaleString()}`, margin, 34);

  // Status Badge
  doc.setFillColor(16, 185, 129);
  doc.rect(margin, 37, 28, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("REGISTERED", margin + 14, 41.2, { align: "center" });

  // QR code in banner
  if (qrCodeDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.rect(pageWidth - margin - 26, 8, 26, 26, "F");
    doc.addImage(qrCodeDataUrl, "PNG", pageWidth - margin - 25, 9, 24, 24);
  }

  y = 55;

  // SECTION 1: HCS REGISTRATION INFO
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text("1. HCS Registration Metadata", margin, y);
  y += 3;
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  const col1X = margin;
  const col2X = margin + 85;
  const rowHeight = 6;

  const metadataPairs = [
    { label: "HCS Transaction ID", value: data.hcsTransactionId || "N/A", isCol2: false },
    { label: "Batch UUID", value: data.batchId || "N/A", isCol2: false },
    { label: "Ledger", value: "Hedera Testnet HCS", isCol2: false },
    { label: "Registry Network", value: "AgroDex Indonesia", isCol2: true },
    { label: "Issued At", value: new Date().toLocaleString(), isCol2: true },
    { label: "Status", value: "Registered (Pending Tokenization)", isCol2: true },
  ];

  let c1Y = y;
  let c2Y = y;

  metadataPairs.forEach((pair) => {
    const x = pair.isCol2 ? col2X : col1X;
    const curY = pair.isCol2 ? c2Y : c1Y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`${pair.label}:`, x, curY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);

    const valStr = String(pair.value);
    const labelWidth = pair.label.length + 2; // estimated label + space in mm
    if (valStr.length > 30) {
      doc.text(valStr.substring(0, 30) + "...", x + labelWidth * 1.8, curY);
    } else {
      doc.text(valStr, x + labelWidth * 1.8, curY);
    }

    if (pair.isCol2) { c2Y += rowHeight; } else { c1Y += rowHeight; }
  });

  y = Math.max(c1Y, c2Y) + 4;

  // SECTION 2: PRODUCT & HARVEST DETAILS
  checkPageBounds(50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(6, 95, 70);
  doc.text("2. Product & Harvest Details", margin, y);
  y += 3;
  doc.setDrawColor(167, 243, 208);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  const batchPairs = [
    { label: "Product Name", value: productName || "N/A", isCol2: false },
    { label: "Harvest Batch", value: harvestBatch || "N/A", isCol2: false },
    { label: "Quantity", value: quantity ? `${quantity} ${unit || ""}` : "N/A", isCol2: false },
    { label: "Harvest Location", value: location || "N/A", isCol2: true },
    { label: "Harvest Date", value: harvestDate || "N/A", isCol2: true },
    { label: "Certificate Type", value: "Batch Registration Proof", isCol2: true },
  ];

  let b1Y = y;
  let b2Y = y;
  batchPairs.forEach((pair) => {
    const x = pair.isCol2 ? col2X : col1X;
    const curY = pair.isCol2 ? b2Y : b1Y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`${pair.label}:`, x, curY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);

    const valStr = String(pair.value);
    const labelWidth = pair.label.length + 2;
    if (pair.label === "Harvest Location" && valStr.length > 25) {
      doc.text(valStr.substring(0, 25) + "...", x + labelWidth * 1.8, curY);
    } else {
      doc.text(valStr, x + labelWidth * 1.8, curY);
    }

    if (pair.isCol2) { b2Y += rowHeight; } else { b1Y += rowHeight; }
  });

  y = Math.max(b1Y, b2Y) + 4;

  // SECTION 3: AI VERIFICATION ANALYSIS
  if (data.ai_analysis) {
    const analysisBlockHeight = 50;
    checkPageBounds(analysisBlockHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(6, 95, 70);
    doc.text("3. AI Verification Analysis", margin, y);
    y += 3;
    doc.setDrawColor(167, 243, 208);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // Confidence badge
    if (data.ai_analysis.confidence !== undefined) {
      const confidencePct = Math.round(data.ai_analysis.confidence * 100);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(margin, y, contentWidth, 12, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(5, 150, 105);
      doc.text(`AI Confidence: ${confidencePct}%`, margin + 5, y + 8);

      // Progress bar
      const barX = margin + 70;
      const barY = y + 3;
      const barWidth = 80;
      const barHeight = 5;
      doc.setFillColor(226, 232, 240);
      doc.rect(barX, barY, barWidth, barHeight, "F");
      doc.setFillColor(16, 185, 129);
      doc.rect(barX, barY, Math.max(1, barWidth * (confidencePct / 100)), barHeight, "F");

      y += 16;
    }

    // AI caption
    if (data.ai_analysis.caption) {
      checkPageBounds(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("AI Analysis Caption:", margin, y);
      y += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const captionLines = doc.splitTextToSize(data.ai_analysis.caption, contentWidth);
      captionLines.forEach((line: string) => {
        checkPageBounds(6);
        doc.text(line, margin, y);
        y += 5;
      });
      y += 3;
    }

    // Tags
    if (data.ai_analysis.tags && data.ai_analysis.tags.length > 0) {
      checkPageBounds(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Tags: ", margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      const tagsStr = data.ai_analysis.tags.join(", ");
      doc.text(tagsStr, margin + 12, y);
      y += 6;
    }

    // Anomalies
    if (data.ai_analysis.anomalies && data.ai_analysis.anomalies.length > 0) {
      checkPageBounds(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(220, 38, 38);
      doc.text("Detected Issues:", margin, y);
      y += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      data.ai_analysis.anomalies.forEach((anomaly: string) => {
        checkPageBounds(6);
        doc.text(`• ${anomaly}`, margin + 5, y);
        y += 5;
      });
      y += 3;
    }

    // AI Analysis timing
    if (data.ai_analysis.ms) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`AI Analysis completed in ${data.ai_analysis.ms}ms`, margin, y);
      y += 5;
    }
  }

  // SECTION 4: NEXT STEPS
  checkPageBounds(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(6, 95, 70);
  doc.text("4. Next Steps", margin, y);
  y += 3;
  doc.setDrawColor(167, 243, 208);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const steps = [
    "1. Proceed to Tokenization: Use the HCS Transaction ID above to mint an NFT certificate.",
    "2. The tokenization process will generate an AI Trust Score and permanent blockchain proof.",
    "3. Once tokenized, buyers can verify authenticity by scanning the QR code.",
  ];
  steps.forEach((step) => {
    checkPageBounds(6);
    doc.text(step, margin + 3, y);
    y += 5;
  });

  // SECTION 5: REGISTRATION QR CODE
  if (qrCodeDataUrl) {
    checkPageBounds(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(6, 95, 70);
    doc.text("5. Registration QR Code", margin, y);
    y += 3;
    doc.setDrawColor(167, 243, 208);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // Center the QR code
    const qrSize = 50;
    const qrX = (pageWidth - qrSize) / 2;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(209, 213, 219);
    doc.rect(qrX - 3, y - 3, qrSize + 6, qrSize + 6, "FD");
    doc.addImage(qrCodeDataUrl, "PNG", qrX, y, qrSize, qrSize);

    y += qrSize + 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Scan to verify this batch registration", pageWidth / 2, y, { align: "center" });
    y += 4;

    const verifyUrl = `${window.location.origin}/verify/${data.batchId}`;
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.setTextColor(79, 70, 229);
    doc.text(verifyUrl, pageWidth / 2, y, { align: "center" });
  }

  drawPageFooter();
  return doc;
}

/**
 * Generate a PDF certificate for a tokenized batch (with NFT + AI trust score).
 * Contains token info, AI provenance summary, trust score, timeline, and QR code.
 */
export function exportTokenizationResultToPDF(
  data: TokenizeBatchResponse,
  options: TokenizationPDFOptions = {},
) {
  const { qrCodeDataUrl, language = "en" } = options;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageHeight = 297;
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  const marginBottom = 20;
  let y = 15;

  const checkPageBounds = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      drawPageFooter();
      y = 20;
      return true;
    }
    return false;
  };

  const drawPageFooter = () => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.text("AgroDex NFT Certificate • Hedera HTS & HCS Registry Record", margin, pageHeight - 10);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
    }
  };

  // PAGE 1 HEADER BANNER
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 45, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("AGRODEX NFT CERTIFICATE", margin, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text("Tokenized Agricultural Provenance • Hedera HTS & HCS Anchored", margin, 25);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Certificate Issued: ${new Date().toLocaleString()}`, margin, 34);

  // Status Badge
  doc.setFillColor(147, 51, 234); // violet-600
  doc.rect(margin, 37, 28, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("TOKENIZED", margin + 14, 41.2, { align: "center" });

  // QR in banner
  if (qrCodeDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.rect(pageWidth - margin - 26, 8, 26, 26, "F");
    doc.addImage(qrCodeDataUrl, "PNG", pageWidth - margin - 25, 9, 24, 24);
  }

  y = 55;

  // SECTION 1: TOKEN METADATA
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(91, 33, 182); // violet-900
  doc.text("1. NFT Token Metadata", margin, y);
  y += 3;
  doc.setDrawColor(221, 214, 254); // violet-200
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  const col1X = margin;
  const col2X = margin + 85;
  const rowHeight = 6;

  const metadataPairs = [
    { label: "Token ID", value: data.tokenId || "N/A", isCol2: false },
    { label: "Serial Number", value: String(data.serialNumber || "N/A"), isCol2: false },
    { label: "HCS Transactions", value: `${(data.hcsTransactionIds || []).length} linked`, isCol2: false },
    { label: "Blockchain", value: "Hedera Testnet HTS", isCol2: true },
    { label: "Minted At", value: new Date().toLocaleString(), isCol2: true },
    { label: "Status", value: "Tokenized & Verified", isCol2: true },
  ];

  let c1Y = y;
  let c2Y = y;
  metadataPairs.forEach((pair) => {
    const x = pair.isCol2 ? col2X : col1X;
    const curY = pair.isCol2 ? c2Y : c1Y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`${pair.label}:`, x, curY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);

    const valStr = String(pair.value);
    const labelWidth = pair.label.length + 2;
    if (valStr.length > 25) {
      doc.text(valStr.substring(0, 25) + "...", x + labelWidth * 1.8, curY);
    } else {
      doc.text(valStr, x + labelWidth * 1.8, curY);
    }

    if (pair.isCol2) { c2Y += rowHeight; } else { c1Y += rowHeight; }
  });

  y = Math.max(c1Y, c2Y) + 4;

  // SECTION 2: AI PROVENANCE & TRUST SCORE
  if (data.ai_summary) {
    const hasTrustScore = data.ai_summary.trustScore !== undefined && data.ai_summary.trustScore !== null;
    let estimateBlockHeight = 45;

    const summaryText = language === "en" ? data.ai_summary.summary_en : data.ai_summary.summary_fr;
    const summaryLinesCount = doc.splitTextToSize(summaryText || "", contentWidth).length;
    const explanationLinesCount = doc.splitTextToSize(data.ai_summary.trustExplanation || "", contentWidth).length;
    estimateBlockHeight += (summaryLinesCount + explanationLinesCount) * 5;

    checkPageBounds(estimateBlockHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(91, 33, 182);
    doc.text("2. AI Provenance & Trust Analysis", margin, y);
    y += 3;
    doc.setDrawColor(221, 214, 254);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    if (hasTrustScore) {
      const score = data.ai_summary.trustScore;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(margin, y, contentWidth, 14, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      if (score >= 80) {
        doc.setTextColor(5, 150, 105);
      } else if (score >= 50) {
        doc.setTextColor(217, 119, 6);
      } else {
        doc.setTextColor(220, 38, 38);
      }
      doc.text(`Trust Score: ${score}/100`, margin + 5, y + 9);

      const barX = margin + 70;
      const barY = y + 5;
      const barWidth = 80;
      const barHeight = 4;
      doc.setFillColor(226, 232, 240);
      doc.rect(barX, barY, barWidth, barHeight, "F");
      if (score >= 80) {
        doc.setFillColor(16, 185, 129);
      } else if (score >= 50) {
        doc.setFillColor(245, 158, 11);
      } else {
        doc.setFillColor(239, 68, 68);
      }
      doc.rect(barX, barY, Math.max(1, barWidth * (score / 100)), barHeight, "F");

      y += 18;

      // Trust Explanation
      if (data.ai_summary.trustExplanation) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text("Evaluation:", margin, y);
        y += 4;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        const explanationLines = doc.splitTextToSize(data.ai_summary.trustExplanation, contentWidth);
        explanationLines.forEach((line: string) => {
          checkPageBounds(6);
          doc.text(line, margin, y);
          y += 5;
        });
        y += 2;
      }
    }

    // Summary text
    if (summaryText) {
      checkPageBounds(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Provenance Summary:", margin, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
      summaryLines.forEach((line: string) => {
        checkPageBounds(6);
        doc.text(line, margin, y);
        y += 5;
      });
      y += 3;
    }
  }

  // SECTION 3: SUPPLY CHAIN TIMELINE
  if (data.ai_summary?.timeline && data.ai_summary.timeline.length > 0) {
    const timeline = data.ai_summary.timeline;
    checkPageBounds(30);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(91, 33, 182);
    doc.text("3. Supply Chain History Trail", margin, y);
    y += 3;
    doc.setDrawColor(221, 214, 254);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    const timelineStartX = margin + 5;
    const contentStartX = margin + 15;

    timeline.forEach((item, idx) => {
      const itemHeight = 18;
      checkPageBounds(itemHeight);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(item.event, contentStartX, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Date: ${new Date(item.timestamp).toLocaleString()}`, contentStartX, y + 4.5);

      doc.setFont("courier", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(79, 70, 229);
      doc.text(`HCS Tx: ${item.txId}`, contentStartX, y + 8.5);

      doc.setDrawColor(196, 181, 253);
      doc.setLineWidth(0.6);
      if (idx < timeline.length - 1) {
        doc.line(timelineStartX, y, timelineStartX, y + itemHeight);
      }
      doc.setFillColor(124, 58, 237);
      doc.circle(timelineStartX, y - 1, 2, "FD");

      y += itemHeight;
    });
    y += 2;
  }

  // SECTION 4: HCS TRANSACTION TRAIL
  if (data.hcsTransactionIds && data.hcsTransactionIds.length > 0) {
    checkPageBounds(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text("HCS Transaction Trail", margin, y);
    y += 5;

    doc.setFont("courier", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    data.hcsTransactionIds.forEach((txId) => {
      checkPageBounds(5);
      doc.text(`• ${txId}`, margin + 3, y);
      y += 4.5;
    });
  }

  drawPageFooter();
  return doc;
}