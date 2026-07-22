"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { PrintLayout } from "@/components/ui/print-layout";
import type { Voucher } from "@/lib/types/finance";
import { useCurrency } from "@/lib/hooks/use-currency";

interface VoucherViewerProps {
  open: boolean;
  onClose: () => void;
  voucher: Voucher | null;
}

export function VoucherViewer({ voucher, open, onClose }: { voucher: Voucher | null, open: boolean, onClose: () => void }) {
  const { formatMoney } = useCurrency();
  
  if (!open || !voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  const isReceipt = voucher.type === "قبض";
  
  // Try to determine main vs opposite based on logic. 
  // For Receipt (قبض), Main (Cash) is Debit, Opposite is Credit.
  // For Payment (صرف), Main (Cash) is Credit, Opposite is Debit.
  const mainLine = voucher.lines.find(l => isReceipt ? l.debit > 0 : l.credit > 0);
  const oppositeLine = voucher.lines.find(l => isReceipt ? l.credit > 0 : l.debit > 0);

  const VoucherContent = () => (
    <div className="space-y-8 p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm text-ink-muted">التاريخ:</p>
          <p className="font-bold text-ink" dir="ltr">{voucher.date}</p>
        </div>
        <div className="space-y-2 text-left">
          <p className="text-sm text-ink-muted">المبلغ:</p>
          <p className="text-2xl font-bold font-mono text-primary" dir="ltr">
            {formatMoney(voucher.totalAmount)}
          </p>
        </div>
      </div>

      <div className="bg-black/5 dark:bg-white/5 print:bg-gray-50 rounded-xl p-6 space-y-6 border border-black/10 dark:border-white/10 print:border-gray-200">
        <div className="flex gap-4 items-center">
          <div className="w-1/4 font-semibold text-ink-muted">{isReceipt ? "استلمنا من:" : "صرفنا إلى:"}</div>
          <div className="w-3/4 text-lg font-bold text-ink border-b border-black/20 dark:border-white/20 print:border-gray-400 pb-1">
            {oppositeLine?.accountName || "ــــــــــــــــــــ"}
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="w-1/4 font-semibold text-ink-muted">مبلغاً وقدره:</div>
          <div className="w-3/4 text-lg font-bold text-ink border-b border-black/20 dark:border-white/20 print:border-gray-400 pb-1 font-mono" dir="ltr">
            {formatMoney(voucher.totalAmount)}
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="w-1/4 font-semibold text-ink-muted">وذلك عن:</div>
          <div className="w-3/4 text-lg font-bold text-ink border-b border-black/20 dark:border-white/20 print:border-gray-400 pb-1">
            {voucher.description || "ــــــــــــــــــــ"}
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="w-1/4 font-semibold text-ink-muted">نقداً/شيك رقم:</div>
          <div className="w-3/4 text-lg font-bold text-ink border-b border-black/20 dark:border-white/20 print:border-gray-400 pb-1">
            {voucher.reference || "ــــــــــــــــــــ"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 pt-8">
        <div className="text-center space-y-8">
          <p className="font-semibold text-ink-muted">{isReceipt ? "المستلم" : "المستفيد"}</p>
          <p className="border-t border-black/20 dark:border-white/20 print:border-gray-400 pt-2 w-2/3 mx-auto">
            التوقيع
          </p>
        </div>
        <div className="text-center space-y-8">
          <p className="font-semibold text-ink-muted">المدير المالي / المحاسب</p>
          <p className="border-t border-black/20 dark:border-white/20 print:border-gray-400 pt-2 w-2/3 mx-auto">
            التوقيع
          </p>
        </div>
      </div>

      {/* Simplified Ledger info just for reference in print */}
      <div className="mt-8 pt-4 border-t border-black/10 dark:border-white/10 print:border-gray-200 text-xs text-ink-muted flex justify-between">
        <p>التوجيه المحاسبي:</p>
        <div className="flex gap-4">
          <p>من ح/ {oppositeLine?.accountName} ({(oppositeLine?.debit || 0) > 0 ? "مدين" : "دائن"})</p>
          <p>إلى ح/ {mainLine?.accountName} ({(mainLine?.debit || 0) > 0 ? "مدين" : "دائن"})</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* SCREEN UI (Modal) */}
      <Dialog open={open} onClose={onClose} title={`سند ${voucher.type} - ${voucher.serialNumber}`} className="max-w-2xl print:hidden">
        <div className="flex flex-col">
          <div className="flex justify-end items-center mb-4 pb-4 border-b border-border">
            <Button onClick={handlePrint} variant="primary" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Printer className="w-4 h-4" />
              طباعة السند
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-white dark:bg-black/20">
            <VoucherContent />
          </div>
        </div>
      </Dialog>

      {/* PRINT UI (Hidden on screen, full screen on print) */}
      {open && (
        <div id="print-root">
          <PrintLayout title={`سند ${voucher.type}`} documentNo={voucher.serialNumber} date={voucher.date}>
            <VoucherContent />
          </PrintLayout>
        </div>
      )}
    </>
  );
}
