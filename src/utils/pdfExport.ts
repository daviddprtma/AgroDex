import { jsPDF } from "jspdf";
import type { VerifyBatchResponse } from "@/lib/api";

export interface PDFExportOptions {
  qrCodeDataUrl?: string;
  language?: "en" | "fr";
}

export function exportVerifyResultToPDF(
  data: VerifyBatchResponse,
  options: PDFExportOptions = {}
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
  const contentWidth = pageWidth - 2 * margin; // 170mm
  const marginBottom = 20;
  let y = 15;

  // Helper to check page bounds and auto-add new page
  const checkPageBounds = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      drawPageFooter();
      y = 20;
      return true;
    }
    return false;
  };

  // Helper to draw the standard footer on every page
  const drawPageFooter = () => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // Slate-500
      
      // Bottom border line
      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.setLineWidth(0.2);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      // Footer text
      doc.text("AgroDex Provenance Certificate • Confidential & Verified Registry Record", margin, pageHeight - 10);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
    }
  };

  // 1. PAGE 1 HEADER BANNER
  // Slate dark header banner background
  doc.setFillColor(15, 23, 42); // slate-900 (#0f172a)
  doc.rect(0, 0, pageWidth, 45, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("AGRODEX VERIFICATION CERTIFICATE", margin, 18);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Decentralized Agricultural Provenance & Ledger Registry", margin, 25);

  // Issuance time
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  const issueDateStr = new Date(data.verifiedAt || Date.now()).toLocaleString();
  doc.text(`Verification Issued: ${issueDateStr}`, margin, 34);

  // Status Badge in Banner
  const statusStr = (data.status || "verified").toUpperCase();
  const isVerified = statusStr.includes("VERIFIED") || statusStr.includes("REGISTERED");
  
  // Badge box
  const badgeWidth = 28;
  const badgeHeight = 6;
  const badgeX = margin;
  const badgeY = 37;
  
  if (isVerified) {
    doc.setFillColor(16, 185, 129); // emerald-500 (#10b981)
  } else {
    doc.setFillColor(37, 99, 235); // blue-600 (#2563eb)
  }
  doc.rect(badgeX, badgeY, badgeWidth, badgeHeight, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(statusStr, badgeX + badgeWidth / 2, badgeY + 4.2, { align: "center" });

  // Embed QR Code in Top Right Banner if provided
  if (qrCodeDataUrl) {
    doc.setFillColor(255, 255, 255);
    // Draw white container box
    doc.rect(pageWidth - margin - 26, 8, 26, 26, "F");
    // Draw QR image
    doc.addImage(qrCodeDataUrl, "PNG", pageWidth - margin - 25, 9, 24, 24);
  }

  y = 55;

  // 2. VERIFICATION CREDENTIALS & METADATA
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138); // blue-900 (#1e3a8a)
  doc.text("1. Blockchain Registry Metadata", margin, y);
  
  y += 3;
  doc.setDrawColor(219, 234, 254); // blue-100
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  
  y += 6;
  
  // Metadata 2-column key-value grid
  const col1X = margin;
  const col2X = margin + 85;
  const rowHeight = 6;

  const metadataPairs = [
    { label: "Token ID", value: data.tokenId || "Pending Tokenization (Registered)", isCol2: false },
    { label: "Serial Number", value: data.serialNumber || "N/A", isCol2: false },
    { label: "Status", value: data.status || "Registered", isCol2: false },
    { label: "Registry Database ID", value: data.batch?.id || "N/A", isCol2: true },
    { label: "Verification Ledger", value: "Hedera Testnet HCS", isCol2: true },
    { label: "Verified Timestamp", value: issueDateStr, isCol2: true }
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  let c1Y = y;
  let c2Y = y;

  metadataPairs.forEach((pair) => {
    if (pair.isCol2) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(`${pair.label}:`, col2X, c2Y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(String(pair.value), col2X + 32, c2Y);
      c2Y += rowHeight;
    } else {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(`${pair.label}:`, col1X, c1Y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42); // slate-900
      
      // Handle Token ID wrapping/clipping if it's too long
      const valStr = String(pair.value);
      if (valStr.length > 25) {
        doc.text(valStr.substring(0, 25) + "...", col1X + 26, c1Y);
      } else {
        doc.text(valStr, col1X + 26, c1Y);
      }
      c1Y += rowHeight;
    }
  });

  y = Math.max(c1Y, c2Y) + 4;

  // 3. PRODUCT & HARVEST DETAILS (If batch details exist)
  if (data.batch) {
    checkPageBounds(40);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text("2. Product & Harvest Details", margin, y);
    
    y += 3;
    doc.setDrawColor(219, 234, 254);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 6;

    const batchPairs = [
      { label: "Product/Batch Name", value: data.batch.batch_name || "N/A", isCol2: false },
      { label: "Product Type", value: data.batch.product_type || "N/A", isCol2: false },
      { label: "Quantity / Volume", value: data.batch.quantity || "N/A", isCol2: false },
      { label: "Harvest Location", value: data.batch.location || "N/A", isCol2: true },
      { label: "Harvest Date", value: data.batch.harvest_date || "N/A", isCol2: true },
      { label: "Creation Ledger ID", value: data.batch.hcs_tx_id ? data.batch.hcs_tx_id.substring(0, 20) + "..." : "N/A", isCol2: true }
    ];

    let b1Y = y;
    let b2Y = y;

    batchPairs.forEach((pair) => {
      if (pair.isCol2) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text(`${pair.label}:`, col2X, b2Y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        
        // Wrap location if it's too long
        const valStr = String(pair.value);
        if (pair.label === "Harvest Location" && valStr.length > 25) {
          doc.text(valStr.substring(0, 25) + "...", col2X + 32, b2Y);
        } else {
          doc.text(valStr, col2X + 32, b2Y);
        }
        b2Y += rowHeight;
      } else {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text(`${pair.label}:`, col1X, b1Y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(String(pair.value), col1X + 36, b1Y);
        b1Y += rowHeight;
      }
    });

    y = Math.max(b1Y, b2Y) + 4;
  }

  // 4. AI PROVENANCE & TRUST ANALYSIS
  if (data.ai_summary) {
    const hasTrustScore = data.ai_summary.trustScore !== undefined && data.ai_summary.trustScore !== null;
    let estimateBlockHeight = 45;
    
    // Add size estimation based on text lengths
    const summaryText = language === "en" ? data.ai_summary.summary_en : data.ai_summary.summary_fr;
    const summaryLinesCount = doc.splitTextToSize(summaryText || "", contentWidth).length;
    const explanationLinesCount = doc.splitTextToSize(data.ai_summary.trustExplanation || "", contentWidth).length;
    estimateBlockHeight += (summaryLinesCount + explanationLinesCount) * 5;

    checkPageBounds(estimateBlockHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text("3. AI Provenance & Trust Analysis", margin, y);
    
    y += 3;
    doc.setDrawColor(219, 234, 254);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 6;

    // Trust Score Badge / Meter
    if (hasTrustScore) {
      const score = data.ai_summary.trustScore;
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.3);
      doc.rect(margin, y, contentWidth, 14, "FD");

      // Score Text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      
      // Color code score text
      if (score >= 80) {
        doc.setTextColor(5, 150, 105); // emerald-600
      } else if (score >= 50) {
        doc.setTextColor(217, 119, 6); // amber-600
      } else {
        doc.setTextColor(220, 38, 38); // red-600
      }
      doc.text(`Trust Score: ${score}/100`, margin + 5, y + 9);

      // Trust score visual progress bar
      const barX = margin + 70;
      const barY = y + 5;
      const barWidth = 80;
      const barHeight = 4;
      
      // Gray background bar
      doc.setFillColor(226, 232, 240); // slate-200
      doc.rect(barX, barY, barWidth, barHeight, "F");

      // Filled progress bar
      if (score >= 80) {
        doc.setFillColor(16, 185, 129); // emerald-500
      } else if (score >= 50) {
        doc.setFillColor(245, 158, 11); // amber-500
      } else {
        doc.setFillColor(239, 68, 68); // red-500
      }
      const filledWidth = Math.max(1, Math.min(barWidth, barWidth * (score / 100)));
      doc.rect(barX, barY, filledWidth, barHeight, "F");

      y += 18;

      // Trust Explanation
      if (data.ai_summary.trustExplanation) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text("Analysis Evaluation:", margin, y);
        y += 4;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        
        const explanationText = data.ai_summary.trustExplanation;
        const explanationLines = doc.splitTextToSize(explanationText, contentWidth);
        explanationLines.forEach((line: string) => {
          checkPageBounds(6);
          doc.text(line, margin, y);
          y += 5;
        });
        y += 2;
      }
    }

    // AI Summary Text
    if (summaryText) {
      checkPageBounds(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("AI Generated Provenance Summary:", margin, y);
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

  // 5. SUPPLY CHAIN TIMELINE
  if (data.ai_summary?.timeline && data.ai_summary.timeline.length > 0) {
    const timeline = data.ai_summary.timeline;
    checkPageBounds(30);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text("4. Supply Chain History Trail", margin, y);
    
    y += 3;
    doc.setDrawColor(219, 234, 254);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 8;

    const timelineStartX = margin + 5;
    const contentStartX = margin + 15;

    // Draw events
    timeline.forEach((item, idx) => {
      const itemHeight = 18;
      
      // Check if we need to split page for this event
      checkPageBounds(itemHeight);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(item.event, contentStartX, y);

      // Event Timestamp
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const dateStr = new Date(item.timestamp).toLocaleString();
      doc.text(`Date/Time: ${dateStr}`, contentStartX, y + 4.5);

      // HCS Tx ID
      doc.setFont("courier", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text(`Ledger Tx: ${item.txId}`, contentStartX, y + 8.5);

      // Visual timeline markers (vertical line and circles)
      doc.setDrawColor(191, 219, 254); // blue-200
      doc.setLineWidth(0.6);
      
      // Draw connector line if not the last item
      if (idx < timeline.length - 1) {
        doc.line(timelineStartX, y, timelineStartX, y + itemHeight);
      }

      // Draw node circle
      doc.setFillColor(37, 99, 235); // blue-600
      doc.circle(timelineStartX, y - 1, 2, "FD");

      y += itemHeight;
    });

    y += 2;
  }

  // 6. TRANSACTION TRAIL SUMMARY (If any HCS Transaction IDs exist and timeline is not present/different)
  if (data.hcsTransactionIds && data.hcsTransactionIds.length > 0) {
    checkPageBounds(25);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text("Blockchain HCS Messages Trail", margin, y);
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

  // Draw final footer page numbers
  drawPageFooter();

  return doc;
}
