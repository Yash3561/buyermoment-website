import type { Report } from "../components/WebsiteChecker";
import type { jsPDF } from "jspdf";
export function createReportPdf(
  report: Report,
  options: {
    regularFontBase64: string;
    boldFontBase64: string;
    logoPng: string;
    sample?: boolean;
  },
): {
  doc: jsPDF;
  filename: string;
  layout: { page: number; footerY: number }[];
};
export function downloadReportPdf(
  report: Report,
  sample?: boolean,
): Promise<void>;
