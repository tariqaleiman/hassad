import * as XLSX from "xlsx";

/**
 * دالة عامة لتصدير أي مصفوفة من الكائنات (JSON Data) إلى ملف Excel.
 * @param data المصفوفة المراد تصديرها
 * @param fileName اسم الملف بدون الامتداد
 * @param sheetName اسم الورقة (Sheet)
 */
export function exportToExcel<T>(data: T[], fileName: string, sheetName: string = "Sheet1") {
  // 1. Create a new workbook
  const workbook = XLSX.utils.book_new();

  // 2. Convert data to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 3. Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 4. Generate the Excel file and trigger download
  // xlsx.writeFile handles the download in the browser automatically
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
