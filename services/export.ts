import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { MonthlyBonusSummary, MonthlyDepositSummary } from "@/types";
import { formatThaiMonthYear } from "@/lib/thai-date";

export function exportDepositExcel(summary: MonthlyDepositSummary) {
  const rows = summary.days.map((d) => ({
    วันที่: d.dateKey,
    "ยอดฝาก C2C": d.c2cDeposit,
    ยอดฝากรวม: d.totalDeposit,
    "สรุปรวม % ต่อวัน": d.percent,
  }));
  rows.push({
    วันที่: "รวมทั้งเดือน",
    "ยอดฝาก C2C": summary.total.c2cDeposit,
    ยอดฝากรวม: summary.total.totalDeposit,
    "สรุปรวม % ต่อวัน": summary.total.percent,
  });
  rows.push({
    วันที่: "ค่าเฉลี่ย",
    "ยอดฝาก C2C": summary.average.c2cDeposit,
    ยอดฝากรวม: summary.average.totalDeposit,
    "สรุปรวม % ต่อวัน": summary.average.percent,
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "สรุปยอดฝาก");
  const monthLabel = formatThaiMonthYear(summary.year, summary.month);
  XLSX.writeFile(wb, `สรุปยอดฝาก-C2C-${monthLabel}.xlsx`);
}

export function exportBonusExcel(summary: MonthlyBonusSummary) {
  const rows = summary.days.map((d) => ({
    วันที่: d.dateKey,
    "ยอดฝาก C2C": d.c2cDeposit,
    ยอดโบนัส: d.bonusAmount,
    "โบนัส %": d.bonusPercent,
  }));
  rows.push({
    วันที่: "รวมสุทธิ",
    "ยอดฝาก C2C": summary.total.c2cDeposit,
    ยอดโบนัส: summary.total.bonusAmount,
    "โบนัส %": summary.total.bonusPercent,
  });
  rows.push({
    วันที่: "ค่าเฉลี่ย",
    "ยอดฝาก C2C": summary.average.c2cDeposit,
    ยอดโบนัส: summary.average.bonusAmount,
    "โบนัส %": summary.average.bonusPercent,
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "สรุปยอดโบนัส");
  const monthLabel = formatThaiMonthYear(summary.year, summary.month);
  XLSX.writeFile(wb, `สรุปยอดโบนัส-C2C-${monthLabel}.xlsx`);
}

/**
 * Renders a DOM element to a PDF by rasterizing it with html2canvas.
 * We do this (instead of drawing text directly with jsPDF) because jsPDF's
 * built-in fonts don't include Thai glyphs — rasterizing guarantees the
 * Thai labels in the table render correctly in the exported PDF.
 */
export async function exportElementToPDF(element: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: getComputedStyle(document.body).getPropertyValue("--background") || "#ffffff",
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgRatio = canvas.width / canvas.height;

  let renderWidth = pageWidth - 40;
  let renderHeight = renderWidth / imgRatio;

  if (renderHeight > pageHeight - 40) {
    renderHeight = pageHeight - 40;
    renderWidth = renderHeight * imgRatio;
  }

  const x = (pageWidth - renderWidth) / 2;
  const y = 20;

  pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);
  pdf.save(filename);
}

export async function exportElementToJPG(element: HTMLElement, filename: string) {
  const { toJpeg } = await import("html-to-image");
  const isDark = document.documentElement.classList.contains("dark");
  const dataUrl = await toJpeg(element, {
    quality: 0.92,
    pixelRatio: 2,
    backgroundColor: isDark ? "#151821" : "#f7f9fb",
    filter: (node) => !(node instanceof HTMLElement && node.hasAttribute("data-html2canvas-ignore")),
  });
  const blob = await fetch(dataUrl).then((response) => response.blob());
  saveAs(blob, filename);
}

export function downloadBlob(data: BlobPart, filename: string, type: string) {
  const blob = new Blob([data], { type });
  saveAs(blob, filename);
}
