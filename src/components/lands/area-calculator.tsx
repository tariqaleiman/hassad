"use client";

import { useState, useEffect } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AreaMeasurementUnit, AreaShape, AreaCalculatorData } from "@/lib/types/land";

interface AreaCalculatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCalculate: (result: {
    areaQirat: number;
    areaFeddan: number;
    data: AreaCalculatorData;
  }) => void;
  defaultData?: AreaCalculatorData;
}

export function AreaCalculatorDialog({
  open,
  onOpenChange,
  onCalculate,
  defaultData,
}: AreaCalculatorDialogProps) {
  const [unit, setUnit] = useState<AreaMeasurementUnit>(defaultData?.unit || "nos");
  const [shape, setShape] = useState<AreaShape>(defaultData?.shape || "irregular");

  // Regular dimensions
  const [length, setLength] = useState<string>(defaultData?.length?.toString() || "");
  const [width, setWidth] = useState<string>(defaultData?.width?.toString() || "");

  // Irregular dimensions
  const [north, setNorth] = useState<string>(defaultData?.north?.toString() || "");
  const [south, setSouth] = useState<string>(defaultData?.south?.toString() || "");
  const [east, setEast] = useState<string>(defaultData?.east?.toString() || "");
  const [west, setWest] = useState<string>(defaultData?.west?.toString() || "");

  const [resultQirat, setResultQirat] = useState<number | null>(null);
  const [resultFeddan, setResultFeddan] = useState<number | null>(null);

  useEffect(() => {
    // Calculate area whenever inputs change
    let areaSqUnit = 0;

    if (shape === "regular") {
      const l = parseFloat(length) || 0;
      const w = parseFloat(width) || 0;
      areaSqUnit = l * w;
    } else {
      const n = parseFloat(north) || 0;
      const s = parseFloat(south) || 0;
      const e = parseFloat(east) || 0;
      const w = parseFloat(west) || 0;
      
      // Traditional Egyptian farmer method for irregular land:
      // (North + South) / 2 * (East + West) / 2
      const avgLength = (n + s) / 2;
      const avgWidth = (e + w) / 2;
      areaSqUnit = avgLength * avgWidth;
    }

    if (areaSqUnit > 0) {
      let qirat = 0;
      if (unit === "nos") {
        // 1 Qirat = 14 Sq Qasabas
        // 1 Qasaba = 2 Nos => 1 Sq Qasaba = 4 Sq Nos
        // 1 Qirat = 14 * 4 = 56 Sq Nos
        qirat = areaSqUnit / 56;
      } else {
        // 1 Qirat = 175.035 Sq Meters
        qirat = areaSqUnit / 175.035;
      }
      setResultQirat(qirat);
      setResultFeddan(qirat / 24);
    } else {
      setResultQirat(null);
      setResultFeddan(null);
    }
  }, [shape, unit, length, width, north, south, east, west]);

  const handleApply = () => {
    if (resultQirat !== null && resultFeddan !== null) {
      onCalculate({
        areaQirat: resultQirat,
        areaFeddan: resultFeddan,
        data: {
          unit,
          shape,
          length: shape === "regular" ? parseFloat(length) || 0 : undefined,
          width: shape === "regular" ? parseFloat(width) || 0 : undefined,
          north: shape === "irregular" ? parseFloat(north) || 0 : undefined,
          south: shape === "irregular" ? parseFloat(south) || 0 : undefined,
          east: shape === "irregular" ? parseFloat(east) || 0 : undefined,
          west: shape === "irregular" ? parseFloat(west) || 0 : undefined,
        },
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} title="حاسبة المساحة الفلاحي" className="max-w-md">
      <div className="space-y-6">
        
        {/* Toggle Unit */}
        <div className="flex gap-2 p-1 bg-paper-sunken rounded-lg">
          <button
            type="button"
            onClick={() => setUnit("nos")}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-md transition-all",
              unit === "nos" ? "bg-white text-crop-600 shadow-sm" : "text-ink-muted hover:text-ink"
            )}
          >
            بالنص (نص قصبة)
          </button>
          <button
            type="button"
            onClick={() => setUnit("meter")}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-md transition-all",
              unit === "meter" ? "bg-white text-crop-600 shadow-sm" : "text-ink-muted hover:text-ink"
            )}
          >
            بالمتر
          </button>
        </div>

        {/* Toggle Shape */}
        <div className="flex gap-2 p-1 bg-paper-sunken rounded-lg">
          <button
            type="button"
            onClick={() => setShape("regular")}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-md transition-all",
              shape === "regular" ? "bg-white text-sky-600 shadow-sm" : "text-ink-muted hover:text-ink"
            )}
          >
            أرض منتظمة
          </button>
          <button
            type="button"
            onClick={() => setShape("irregular")}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-md transition-all",
              shape === "irregular" ? "bg-white text-sky-600 shadow-sm" : "text-ink-muted hover:text-ink"
            )}
          >
            أرض غير منتظمة
          </button>
        </div>

        {/* Inputs */}
        <div className="bg-paper-raised border border-border/50 rounded-2xl p-5 shadow-inner">
          {shape === "regular" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الطول ({unit === "nos" ? "أنصاص" : "متر"})</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>العرض ({unit === "nos" ? "أنصاص" : "متر"})</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الحد البحري (الشمالي)</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={north}
                  onChange={(e) => setNorth(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>الحد القبلي (الجنوبي)</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={south}
                  onChange={(e) => setSouth(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>الحد الشرقي</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={east}
                  onChange={(e) => setEast(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>الحد الغربي</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={west}
                  onChange={(e) => setWest(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Results */}
        <div className="bg-crop-50/50 border border-crop-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-crop-700">
            <Calculator className="h-5 w-5" />
            <span className="font-bold text-sm">المساحة التقريبية:</span>
          </div>
          <div className="text-end">
            <p className="font-display font-bold text-lg text-ink" dir="ltr">
              {resultQirat !== null ? resultQirat.toFixed(2) : "0.00"}
              <span className="text-sm font-medium text-ink-muted ms-1">قيراط</span>
            </p>
            <p className="text-xs text-ink-muted mt-0.5" dir="ltr">
              {resultFeddan !== null ? resultFeddan.toFixed(3) : "0.000"} فدان
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleApply} disabled={!resultQirat}>
            اعتماد المساحة
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
