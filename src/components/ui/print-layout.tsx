"use client";

import React from "react";
import { useOwnerProfile } from "@/lib/hooks/use-owner";

interface PrintLayoutProps {
  title: string;
  documentNo?: string;
  date?: string;
  children: React.ReactNode;
}

export function PrintLayout({ title, documentNo, date, children }: PrintLayoutProps) {
  const { data: profile } = useOwnerProfile();

  const printDate = date || new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="hidden print:block bg-white w-full h-full text-black" dir="rtl">
      {/* Print Specific CSS to enforce A4 size, remove margins, and format correctly */}
      <style dangerouslySetInnerHTML={{__html: `
        @page {
          size: A4;
          margin: 1.5cm;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #print-root, #print-root * {
            visibility: visible;
          }
          #print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
          }
        }
      `}} />

      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-emerald-800 pb-4 mb-6">
        <div className="flex flex-col gap-1 w-1/3 text-right">
          <h1 className="text-2xl font-bold text-emerald-900 font-display">
            {profile?.companyName || profile?.name || "نظام إدارة المزارع"}
          </h1>
          {profile?.commercialRegister && (
            <p className="text-sm text-gray-600">س.ت: <span className="font-bold">{profile.commercialRegister}</span></p>
          )}
          {profile?.taxId && (
            <p className="text-sm text-gray-600">رقم ضريبي: <span className="font-bold">{profile.taxId}</span></p>
          )}
          {profile?.phone && (
            <p className="text-sm text-gray-600">هاتف: <span className="font-bold" dir="ltr">{profile.phone}</span></p>
          )}
          {profile?.address && (
            <p className="text-sm text-gray-600">العنوان: {profile.address}</p>
          )}
        </div>

        <div className="w-1/3 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-bold bg-emerald-100 text-emerald-900 px-4 py-2 rounded-xl border border-emerald-300">
            {title}
          </h2>
          {documentNo && (
            <p className="text-sm text-gray-700 mt-2 font-bold">
              رقم المستند: <span className="text-emerald-800">{documentNo}</span>
            </p>
          )}
        </div>

        <div className="w-1/3 flex justify-end items-start">
          {profile?.logo ? (
            <img src={profile.logo} alt="Company Logo" className="h-20 w-auto object-contain" />
          ) : (
            <img src="/icon.png" alt="Hassad Logo" className="h-16 w-16 object-contain opacity-50 grayscale" title="أضف شعار شركتك من الإعدادات" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[60vh]">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between items-center text-xs text-gray-500">
        <p>تاريخ الطباعة: {printDate}</p>
        <p>تم الإنشاء بواسطة نظام حصاد | Hassad ERP</p>
      </div>
    </div>
  );
}
