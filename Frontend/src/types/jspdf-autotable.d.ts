declare module "jspdf-autotable" {
  import jsPDF from "jspdf";

  /** Table options */
  interface AutoTableOptions {
    head?: (string | number)[][];
    body?: (string | number)[][];
    startY?: number;
    theme?: "striped" | "grid" | "plain";
    styles?: Record<string, string | number | boolean>;
    headStyles?: Record<string, string | number | boolean>;
    bodyStyles?: Record<string, string | number | boolean>;
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): void;

  /** Extend jsPDF */
  declare module "jspdf" {
    interface jsPDF {
      autoTable: (options: AutoTableOptions) => jsPDF;
    }
  }
}
