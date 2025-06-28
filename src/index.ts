import Fastify, {FastifyInstance} from "fastify";
import PDFDocument from 'pdfkit'
import {PassThrough} from 'node:stream';
import { TExcelColumn, TExcelData, exportToExcelBuffer } from './excel-exporter.js'

const server: FastifyInstance = Fastify({})

server.get('/ping', async () => {
  return 'pong\n'
})

server.get('/export/pdf', async (request, reply) => {
  try {
    // 1. Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: {top: 50, bottom: 50, left: 72, right: 72},
      bufferPages: true, // Good for streaming
    });

    // 2. Create a pass-through stream to pipe the PDF data
    const stream = new PassThrough();

    // 3. Set HTTP headers for PDF download
    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', 'attachment; filename="report.pdf"');

    // 4. Pipe the PDF document to the stream
    doc.pipe(stream);

    // 5. Add content to the PDF
    // Header
    doc
      .fontSize(25)
      .text('Here is your PDF Report', {align: 'center'});

    // Line break
    doc.moveDown();

    // Simple text content
    doc
      .fontSize(12)
      .text(
        'This is a sample PDF file generated on the fly by a Fastify server using the pdfkit library. ' +
        'You can add text, images, tables, and much more to create complex documents.',
        {align: 'justify'}
      );

    // Line break
    doc.moveDown();

    // Add a table
    doc.table({
      // rowStyles: 40,
      rowStyles: (i) => {
        return i < 1
          ? {border: [0, 0, 2, 0], borderColor: "black"}
          : {border: [0, 0, 1, 0], borderColor: "#aaa", padding: [10, 0, 5, 0]};
      },
      data: [
        ['Column 1', 'Column 2', 'Column 3'],
        ['One value goes here', 'Another one here', 'OK?']
      ]
    })

    // Add a new page
    doc.addPage()
      .fontSize(16)
      .text('This is the second page.', {align: 'left'});

    // 6. Finalize the PDF and end the stream
    doc.end();

    // 7. Send the stream as the reply
    reply.send(stream);

  } catch (err) {
    console.error('Failed to generate PDF', err);
    reply.status(500).send({error: 'Failed to generate PDF'});
  }
})

server.get('/export/xlsx', async (request, reply) => {
  try {
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

    // 3. Define the sheet name
    const sheetName = 'Products';

    // 4. Generate the Excel file in memory as a buffer
    const buffer = await exportToExcelBuffer(sheetName, columns, data);

    // 5. Set HTTP headers for XLSX download
    // Note the correct MIME type for .xlsx files
    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    reply.header('Content-Disposition', 'attachment; filename="products.xlsx"');

    // 6. Send the buffer as the reply
    return reply.send(buffer);

  } catch (err) {
    console.error('❌ Failed to generate XLSX file', err);
    reply.status(500).send({ error: 'Failed to generate XLSX file' });
  }
});

server.listen({port: 3334}, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})

// Export the server instance for fastify CLI
export default server
