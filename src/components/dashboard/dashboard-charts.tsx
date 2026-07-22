"use client";

import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useCurrency } from "@/lib/hooks/use-currency";

// Common colors for charts
const COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#f43f5e', '#06b6d4'];
const EXPENSE_COLOR = '#ef4444';
const REVENUE_COLOR = '#10b981';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  const { formatMoney } = useCurrency();
  if (active && payload && payload.length) {
    return (
      <div className="bg-paper p-3 border border-border/50 shadow-md rounded-xl text-sm">
        <p className="font-bold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="flex justify-between gap-4 font-mono">
            <span>{entry.name}:</span>
            <span className="font-bold">{formatMoney(entry.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CashflowChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-ink-muted">لا توجد بيانات كافية</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12 }} 
          dy={10} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12 }} 
          tickFormatter={(value) => `${value >= 1000 ? (value / 1000) + 'k' : value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        <Bar dataKey="revenues" name="الإيرادات" fill={REVENUE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="expenses" name="المصروفات" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CropDistributionChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-ink-muted">لا توجد محاصيل</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ExpenseCategoriesChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-ink-muted">لا توجد بيانات</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
