"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { exportToExcel } from "@/lib/utils/export-to-excel";
import { PrintLayout } from "./print-layout";

interface Column {
  header: string;
  accessorKey?: string;
  cell?: (row: any) => React.ReactNode;
}

interface ReportViewerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: any[];
  columns: Column[];
  documentNo?: string;
  exportFileName?: string;
  // If data is complex, allow passing pre-formatted Excel export data
  excelData?: any[]; 
}

export function ReportViewer({
  open,
  onClose,
  title,
  data,
  columns,
  documentNo,
  exportFileName,
  excelData
}: ReportViewerProps) {
  
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const dataToExport = excelData || data;
    exportToExcel(dataToExport, exportFileName || title);
  };

  if (!open) return null;

  const TableContent = () => (
    <table className="w-full text-right border-collapse text-sm">
      <thead>
        <tr className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 print:bg-gray-100 print:text-black">
          {columns.map((col, idx) => (
            <th key={idx} className="border border-border print:border-black p-3 font-bold">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={rowIdx} className="hover:bg-black/5 dark:hover:bg-white/5 print:bg-white">
            {columns.map((col, colIdx) => (
              <td key={colIdx} className="border border-border print:border-black p-3">
                {col.cell ? col.cell(row) : col.accessorKey ? row[col.accessorKey] : null}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      {/* SCREEN UI (Modal) */}
      <Dialog open={open} onClose={onClose} title={title} className="max-w-5xl print:hidden">
        <div className="flex flex-col h-[70vh]">
          {/* Toolbar */}
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
            <p className="text-sm text-ink-muted">
              {data.length} سجل
            </p>
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
                <Printer className="w-4 h-4" />
                طباعة التقرير
              </Button>
              <Button onClick={handleExport} variant="primary" className="gap-2">
                <Download className="w-4 h-4" />
                تصدير إكسيل
              </Button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="flex-1 overflow-auto rounded-xl border border-border">
            <TableContent />
          </div>
        </div>
      </Dialog>

      {/* PRINT UI (Hidden on screen, full screen on print) */}
      {open && (
        <div id="print-root">
          <PrintLayout title={title} documentNo={documentNo}>
            <TableContent />
          </PrintLayout>
        </div>
      )}
    </>
  );
}
