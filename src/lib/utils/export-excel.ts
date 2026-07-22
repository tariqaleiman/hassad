import * as XLSX from 'xlsx';

export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Set RTL direction
  if (!workbook.Workbook) workbook.Workbook = {};
  if (!workbook.Workbook.Views) workbook.Workbook.Views = [];
  if (!workbook.Workbook.Views[0]) workbook.Workbook.Views[0] = {};
  workbook.Workbook.Views[0].RTL = true;

  // Generate file and trigger download
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
