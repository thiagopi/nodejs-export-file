import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs'; // <-- Changed from require
import { fileURLToPath } from 'url'; // <-- New import for ESM

// Define the structure for columns
export type TExcelColumn = {
  header: string;
  key: string;
  width?: number;
  style?: Partial<ExcelJS.Style>;
}

// Define the data type as an array of objects
export type TExcelData = { [key: string]: any }[];

/**
 * Applies styling to the header row of a worksheet.
 * @param worksheet The worksheet to style.
 */
function styleHeader(worksheet: ExcelJS.Worksheet): void {
  const headerRow = worksheet.getRow(1);
  headerRow.font = { name: 'Calibri', bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }, // A nice blue color
  };

  // Add borders to all header cells
  headerRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
}

/**
 * Creates a workbook and worksheet with the given data and columns.
 * @param sheetName The name of the worksheet.
 * @param columns The column definitions.
 * @param data The data to populate the sheet with.
 * @returns A promise that resolves to the generated workbook.
 */
async function createWorkbook(
  sheetName: string,
  columns: TExcelColumn[],
  data: TExcelData
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Gemini Code Assist';
  workbook.lastModifiedBy = 'Gemini Code Assist';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet(sheetName);

  // Set columns and their properties
  worksheet.columns = columns;

  // Style the header row
  styleHeader(worksheet);

  // Add data rows
  worksheet.addRows(data);

  // Auto-fit columns based on content, with a max width
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell!({ includeEmpty: true }, cell => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength < 10 ? 10 : maxLength + 2;
  });

  return workbook;
}

/**
 * Exports data to an XLSX file and saves it to the specified path.
 * @param filePath The full path where the file will be saved (e.g., 'reports/report.xlsx').
 * @param sheetName The name for the worksheet.
 * @param columns The column definitions.
 * @param data The data to export.
 */
export async function exportToExcelFile(
  filePath: string,
  sheetName: string,
  columns: TExcelColumn[],
  data: TExcelData
): Promise<void> {
  try {
    const workbook = await createWorkbook(sheetName, columns, data);
    await workbook.xlsx.writeFile(filePath);
    console.log(`✅ Excel file saved successfully to: ${filePath}`);
  } catch (error) {
    console.error('❌ Error exporting to Excel file:', error);
    throw error;
  }
}

/**
 * Exports data to an XLSX buffer. Useful for sending files via an API.
 * @param sheetName The name for the worksheet.
 * @param columns The column definitions.
 * @param data The data to export.
 * @returns A Promise that resolves to a Buffer containing the XLSX data.
 */
export async function exportToExcelBuffer(
  sheetName: string,
  columns: TExcelColumn[],
  data: TExcelData
): Promise<Buffer> {
  try {
    const workbook = await createWorkbook(sheetName, columns, data);
    // write to a buffer
    const buffer = await workbook.xlsx.writeBuffer();
    console.log('✅ Excel buffer generated successfully.');
    // The explicit cast is needed because writeBuffer can return ArrayBuffer | Buffer
    return buffer as Buffer;
  } catch (error) {
    console.error('❌ Error exporting to Excel buffer:', error);
    throw error;
  }
}


// --- Example Usage ---
// This part demonstrates how to use the functions above.
// You can run this file directly using `ts-node src/excel-exporter.ts`

// This is the ESM-compliant way to check if the module is run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  // This is the ESM-compliant way to get the current directory name
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  async function main() {
    // 1. Define your columns
    const columns: TExcelColumn[] = [
      { header: 'ID', key: 'id' },
      { header: 'Product Name', key: 'name' },
      { header: 'Category', key: 'category' },
      { header: 'Price', key: 'price', style: { numFmt: '$#,##0.00' } },
      { header: 'In Stock', key: 'inStock' },
    ];

    // 2. Define your data
    const data: TExcelData = [
      { id: 1, name: 'Laptop Pro 15"', category: 'Electronics', price: 1499.99, inStock: true },
      { id: 2, name: 'Wireless Ergonomic Mouse', category: 'Accessories', price: 75.50, inStock: true },
      { id: 3, name: 'Mechanical RGB Keyboard', category: 'Accessories', price: 120.00, inStock: false },
      { id: 4, name: '27-inch 4K UHD Monitor', category: 'Monitors', price: 399.00, inStock: true },
      { id: 5, name: 'HD Webcam with Ring Light', category: 'Peripherals', price: 55.25, inStock: false },
    ];

    // 3. Define output path and sheet name
    const outputDir = path.join(__dirname, '..', 'output');
    const outputFilePath = path.join(outputDir, 'products.xlsx');
    const sheetName = 'Products';

    // Create an output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // 4. Call the exporter function
    await exportToExcelFile(outputFilePath, sheetName, columns, data);

    // Example for buffer (you would typically use this in a web server)
    // const buffer = await exportToExcelBuffer(sheetName, columns, data);
    // console.log(`Buffer generated with size: ${buffer.length} bytes`);
  }

  main().catch(console.error);
}
