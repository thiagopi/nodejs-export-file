import Fastify, {FastifyInstance} from "fastify";
import PDFDocument from 'pdfkit'
import {PassThrough} from 'stream';

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

server.listen({port: 3334}, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})

// Export the server instance for fastify CLI
export default server
