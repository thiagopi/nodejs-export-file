# nodes-export-file

A lightweight Node.js application built with Fastify and TypeScript that provides PDF generation and export functionality on-the-fly.
## 🚀 Features
- **PDF Generation**: Create PDF documents dynamically using PDFKit
- **File Export**: Stream PDF files directly to clients for download
- **Fast API**: Built on Fastify for high performance
- **TypeScript**: Fully typed codebase for better development experience
- **Health Check**: Simple ping endpoint for monitoring

## 📋 Requirements
- Node.js (compatible with v20.10.0+)
- npm package manager

## 🛠️ Installation
1. Clone the repository:
```
git clone <repository-url>
cd nodes-export-file
```

2. Install dependencies:
```
npm install
```

## 🏃‍♂️ Running the Application
### Development Mode
```
npm run dev
```

### Production Mode
```
npm start
```

The server will start on `http://localhost:3334`
## 📚 API Endpoints
### Health Check
- **GET** `/ping`
- **Response**: `pong`
- **Description**: Simple health check endpoint

### PDF Export
- **GET** `/export/pdf`
- **Response**: PDF file download
- **Description**: Generates and downloads a sample PDF report with:
  - Header text
  - Formatted content
  - Data table
  - Multiple pages

## 🏗️ Project Structure
```
src/
├── index.ts          # Main application file with Fastify server setup
```

## 🔧 Technology Stack
- **Framework**: [Fastify](https://www.fastify.io/) v5.4.0
- **PDF Generation**: [PDFKit](https://pdfkit.org/) v0.17.1
- **Language**: TypeScript v5.8.3
- **Runtime**: Node.js
- **Code Quality**: ESLint + Prettier

## 📄 PDF Features
The generated PDF includes:
- Custom page size (A4) with margins
- Header with centered title
- Justified text content
- Data tables with custom styling
- Multi-page support
- Streaming for efficient memory usage

## 🔄 Development
The project uses:
- TypeScript compilation targeting ES2022
- ESLint for code linting
- Prettier for code formatting
- Simple import sorting

Output directory: `./dist`
## 📝 Usage Example
```
# Start the server
npm start

# Download a PDF report
curl -O -J http://localhost:3334/export/pdf
```

This will download a file named containing the generated content. `report.pdf`
## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and formatting
5. Submit a pull request

## 📄 License
[Add your license information here]
