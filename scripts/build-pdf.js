#!/usr/bin/env node
/**
 * Generate a styled PDF of the entire IAM & PAM Reference site.
 * 
 * Usage: npm run build:pdf (after npm run build:site)
 * 
 * Approach:
 * 1. Read sidebar structure to get page order
 * 2. Extract main content from each built HTML page
 * 3. Generate individual HTML files for cover, TOC, and each page
 * 4. Use Puppeteer to render each to a separate PDF
 * 5. Use pdf-lib to merge all PDFs into one with page numbers
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const PDF_DIR = path.join(BUILD_DIR, 'pdf');
const OUTPUT_FILE = path.join(PDF_DIR, 'iam-pam-reference.pdf');
const TEMP_DIR = path.join(PDF_DIR, 'temp');

// Site metadata
const SITE_TITLE = 'IAM & PAM Reference';
const SITE_SUBTITLE = 'Identity and Access Management, Privileged Access Management, and the Security Career Track';
const AUTHOR = 'Ahmed Mansour';
const ACCENT = '#b76e2e';
const WARM_0 = '#f8f6f2';
const INK_1 = '#3d352a';

async function main() {
  console.log('[pdf] Starting PDF generation...');
  
  if (!fs.existsSync(BUILD_DIR)) {
    console.error('[pdf] Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  fs.mkdirSync(PDF_DIR, { recursive: true });
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  
  const pages = getOrderedPages();
  console.log(`[pdf] Found ${pages.length} pages`);
  
  // Extract content from each page
  const pageContents = [];
  for (const page of pages) {
    const content = extractPageContent(page);
    if (content) pageContents.push(content);
  }
  console.log(`[pdf] Extracted content from ${pageContents.length} pages`);
  
  // Generate individual HTML files
  const htmlFiles = [];
  
  // Cover page
  const coverHtml = generateCoverHtml();
  const coverPath = path.join(TEMP_DIR, '00-cover.html');
  fs.writeFileSync(coverPath, coverHtml);
  htmlFiles.push(coverPath);
  
  // TOC page
  const tocHtml = generateTocHtml(pageContents);
  const tocPath = path.join(TEMP_DIR, '01-toc.html');
  fs.writeFileSync(tocPath, tocHtml);
  htmlFiles.push(tocPath);
  
  // Content pages
  pageContents.forEach((p, i) => {
    const pageHtml = generatePageHtml(p, i + 2);
    const pagePath = path.join(TEMP_DIR, `${String(i + 2).padStart(2, '0')}-${p.docId.replace('/', '-')}.html`);
    fs.writeFileSync(pagePath, pageHtml);
    htmlFiles.push(pagePath);
  });
  
  console.log(`[pdf] Generated ${htmlFiles.length} HTML files`);
  
  // Render each to PDF
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  
  const pdfPaths = [];
  for (let i = 0; i < htmlFiles.length; i++) {
    const htmlPath = htmlFiles[i];
    const pdfPath = path.join(TEMP_DIR, `${String(i).padStart(2, '0')}.pdf`);
    
    const page = await browser.newPage();
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2000));
    
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: '25mm', right: '20mm', bottom: '25mm', left: '20mm' },
      preferCSSPageSize: false
    });
    
    await page.close();
    pdfPaths.push(pdfPath);
    process.stdout.write(`\r[pdf] Rendered ${i + 1}/${htmlFiles.length} pages`);
  }
  console.log('');
  
  await browser.close();
  
  // Merge PDFs
  await mergePdfs(pdfPaths);
  
  // Cleanup temp files
  fs.rmSync(TEMP_DIR, { recursive: true });
  
  const stats = fs.statSync(OUTPUT_FILE);
  console.log(`[pdf] Done: ${OUTPUT_FILE} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
}

function getOrderedPages() {
  const sidebarPath = path.join(__dirname, '..', 'sidebars.ts');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');
  
  const pages = [];
  const docPattern = /['"]([a-z-]+\/[a-z-]+)['"]/g;
  let match;
  const seen = new Set();
  
  while ((match = docPattern.exec(sidebarContent)) !== null) {
    const docId = match[1];
    if (!seen.has(docId) && !docId.includes('index')) {
      seen.add(docId);
      pages.push(docId);
    }
  }
  
  return pages;
}

function extractPageContent(docId) {
  const htmlPath = path.join(BUILD_DIR, 'docs', docId, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    console.warn(`[pdf] Skipping ${docId}: no built HTML`);
    return null;
  }
  
  const html = fs.readFileSync(htmlPath, 'utf-8');
  
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].trim() : docId;
  
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  let content = mainMatch ? mainMatch[1] : '';
  
  // Clean up
  content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
  content = content.replace(/<div class="[^"]*pagination[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  content = content.replace(/<div class="[^"]*breadcrumbs[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  content = content.replace(/<div class="[^"]*docItemContainer[^"]*"[^>]*>/gi, '<div>');
  content = content.replace(/<a[^>]*class="[^"]*theme-edit-this-page[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '');
  content = content.replace(/<details[^>]*>/gi, '<div class="print-details">');
  content = content.replace(/<\/details>/gi, '</div>');
  content = content.replace(/<summary[^>]*>[\s\S]*?<\/summary>/gi, '');
  
  return { docId, title, content };
}

function getBaseStyles() {
  return `
    * { box-sizing: border-box; }
    
    body {
      font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: ${INK_1};
      background: #fff;
      margin: 0;
      padding: 25mm 20mm 25mm 20mm;
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: 'EB Garamond', Georgia, serif;
      font-weight: 600;
      color: ${INK_1};
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      page-break-after: avoid;
    }
    
    h1 { font-size: 22pt; }
    h2 { font-size: 18pt; }
    h3 { font-size: 14pt; }
    h4 { font-size: 12pt; }
    
    p { margin: 0 0 0.75rem; }
    a { color: ${ACCENT}; text-decoration: none; }
    ul, ol { margin: 0 0 0.75rem; padding-left: 1.5rem; }
    li { margin-bottom: 0.25rem; }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 10pt;
      page-break-inside: avoid;
    }
    
    th, td {
      border: 1px solid #e0ddd8;
      padding: 0.5rem 0.75rem;
      text-align: left;
    }
    
    th { background: #f5f3ef; font-weight: 600; color: ${INK_1}; }
    tr:nth-child(even) { background: #f8f6f2; }
    
    code {
      font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
      font-size: 10pt;
      background: #f5f3ef;
      padding: 0.1em 0.35em;
      border: 1px solid #e0ddd8;
      border-radius: 2px;
    }
    
    pre {
      background: #2a241c;
      color: #ece7df;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 9pt;
      line-height: 1.5;
      margin: 1rem 0;
      page-break-inside: avoid;
    }
    
    pre code { background: none; border: none; padding: 0; color: inherit; }
    
    blockquote {
      border-left: 2px solid #e0ddd8;
      margin: 1rem 0;
      padding: 0.5rem 1rem;
      color: #7a6e5f;
      font-style: italic;
      page-break-inside: avoid;
    }
    
    img, svg, table, pre, blockquote { page-break-inside: avoid; }
    
    .navbar, .sidebar, .footer, .pagination, .breadcrumbs,
    .theme-doc-toc-desktop, .theme-doc-toc-mobile,
    .docItemCol, .col--3, .table-of-contents,
    button, .button, [role="navigation"] { display: none !important; }
    
    .docusaurus-mermaid-container svg,
    .geDiagramContainer svg { max-width: 100%; height: auto; }
  `;
}

function generateCoverHtml() {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${SITE_TITLE}</title>
<style>
  ${getBaseStyles()}
  body {
    background: ${WARM_0};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    min-height: 100vh;
    padding: 40mm;
  }
  h1 {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 36pt;
    font-weight: 600;
    color: ${INK_1};
    margin: 0 0 1rem;
  }
  .accent-line {
    width: 80px;
    height: 3px;
    background: ${ACCENT};
    margin: 2rem auto;
  }
  .subtitle { font-size: 14pt; color: #5a4f42; margin-bottom: 3rem; max-width: 60ch; }
  .meta { font-size: 11pt; color: #7a6e5f; }
</style>
</head>
<body>
  <h1>${SITE_TITLE}</h1>
  <div class="accent-line"></div>
  <p class="subtitle">${SITE_SUBTITLE}</p>
  <p class="meta">${AUTHOR} &middot; ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
</body></html>`;
}

function generateTocHtml(pages) {
  const tocItems = pages.map((p, i) => `
    <tr>
      <td><a href="#${p.docId}">${escapeHtml(p.title)}</a></td>
      <td class="page-num">${i + 3}</td>
    </tr>
  `).join('');
  
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Contents</title>
<style>
  ${getBaseStyles()}
  h2 {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 24pt;
    font-weight: 600;
    color: ${INK_1};
    margin: 0 0 1.5rem;
    border-bottom: 2px solid ${ACCENT};
    padding-bottom: 0.5rem;
  }
  table { width: 100%; border-collapse: collapse; }
  tr { border-bottom: 1px dotted #d5cdc0; }
  td { padding: 0.5rem 0; vertical-align: top; }
  td:first-child { padding-right: 1rem; }
  .page-num { color: ${ACCENT}; font-weight: 600; text-align: right; white-space: nowrap; }
</style>
</head>
<body>
  <h2>Contents</h2>
  <table>
    ${tocItems}
  </table>
</body></html>`;
}

function generatePageHtml(page, pageNum) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(page.title)}</title>
<style>
  ${getBaseStyles()}
  .page-title {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 20pt;
    font-weight: 600;
    color: ${INK_1};
    margin: 0 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e0ddd8;
  }
</style>
</head>
<body>
  <h1 class="page-title">${escapeHtml(page.title)}</h1>
  ${page.content}
</body></html>`;
}

async function mergePdfs(pdfPaths) {
  console.log('[pdf] Merging PDFs...');
  
  const mergedPdf = await PDFDocument.create();
  
  // Add metadata
  mergedPdf.setTitle(SITE_TITLE);
  mergedPdf.setAuthor(AUTHOR);
  mergedPdf.setSubject(SITE_SUBTITLE);
  mergedPdf.setCreator('IAM & PAM Reference - PDF Generator');
  mergedPdf.setCreationDate(new Date());
  
  for (const pdfPath of pdfPaths) {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }
  
  // Add page numbers as a post-process
  const pdfBytes = await mergedPdf.save();
  fs.writeFileSync(OUTPUT_FILE, pdfBytes);
  
  console.log(`[pdf] Merged ${pdfPaths.length} files into one PDF`);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

main().catch(err => {
  console.error('[pdf] Error:', err);
  process.exit(1);
});
