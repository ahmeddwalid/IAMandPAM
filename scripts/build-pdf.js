#!/usr/bin/env node
/**
 * Generate a styled PDF of the entire IAM & PAM Reference site.
 * 
 * Usage:
 *   node scripts/build-pdf.js              # English PDF (build/pdf/iam-pam-reference.pdf)
 *   node scripts/build-pdf.js --locale ar  # Arabic PDF (build/pdf/iam-pam-reference-ar.pdf)
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const args = process.argv.slice(2);
let locale = 'en';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--locale' && args[i + 1]) {
    locale = args[i + 1];
  } else if (args[i].startsWith('--locale=')) {
    locale = args[i].split('=')[1];
  }
}

const isAr = locale === 'ar';

const BUILD_DIR = path.join(__dirname, '..', 'build');
const PDF_DIR = path.join(BUILD_DIR, 'pdf');
const OUTPUT_FILE = path.join(PDF_DIR, isAr ? 'iam-pam-reference-ar.pdf' : 'iam-pam-reference.pdf');
const TEMP_DIR = path.join(PDF_DIR, isAr ? 'temp-ar' : 'temp');

// Site metadata
const SITE_TITLE = isAr 
  ? 'مرجع إدارة الهوية والوصول (IAM) والوصول المميز (PAM)' 
  : 'IAM & PAM Reference';
const SITE_SUBTITLE = isAr
  ? 'المعمارية المتكاملة لإدارة الهوية، آليات الوصول المميز، والمسار المهني في الأمن السيبراني'
  : 'Identity and Access Management, Privileged Access Management, and the Security Career Track';
const AUTHOR = isAr ? 'أحمد وليد (Ahmed Walid)' : 'Ahmed Walid';
const TOC_TITLE = isAr ? 'فهرس المحتويات' : 'Contents';

const ACCENT = '#b76e2e';
const WARM_0 = '#f8f6f2';
const INK_1 = '#3d352a';

// Read fonts to base64 if Arabic
let amiriFontBase64 = '';
let ibmPlexFontBase64 = '';

if (isAr) {
  try {
    const amiriPath = require.resolve('@fontsource/amiri/files/amiri-arabic-400-normal.woff2');
    amiriFontBase64 = fs.readFileSync(amiriPath).toString('base64');
    const ibmPath = require.resolve('@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-400-normal.woff2');
    ibmPlexFontBase64 = fs.readFileSync(ibmPath).toString('base64');
  } catch (e) {
    console.warn('[pdf] Warning: Font files could not be read for base64 embedding:', e.message);
  }
}

async function main() {
  console.log(`[pdf] Starting PDF generation for locale: ${locale}...`);
  
  if (!fs.existsSync(BUILD_DIR)) {
    console.error('[pdf] Build directory not found. Run "npm run build:site" first.');
    process.exit(1);
  }
  
  fs.mkdirSync(PDF_DIR, { recursive: true });
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  
  const pages = getOrderedPages();
  console.log(`[pdf] Found ${pages.length} pages in sidebar order`);
  
  // Extract content from each page
  const pageContents = [];
  for (const page of pages) {
    const content = extractPageContent(page);
    if (content) pageContents.push(content);
  }
  console.log(`[pdf] Extracted content from ${pageContents.length} pages`);
  
  if (pageContents.length === 0) {
    console.error('[pdf] No page contents found. Check build output.');
    process.exit(1);
  }

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
    const sanitizedDocId = p.docId.replace(/[/\\?%*:|"<>]/g, '-');
    const pagePath = path.join(TEMP_DIR, `${String(i + 2).padStart(2, '0')}-${sanitizedDocId}.html`);
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
    await new Promise(r => setTimeout(r, 1000));
    
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
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  
  const stats = fs.statSync(OUTPUT_FILE);
  console.log(`[pdf] Done: ${OUTPUT_FILE} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
}

function getOrderedPages() {
  const sidebarPath = path.join(__dirname, '..', 'sidebars.ts');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');
  
  const pages = [];
  const docPattern = /['"]([a-z-0-9]+\/[a-z-0-9]+)['"]/g;
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
  const relativeSubdir = isAr ? path.join('ar', 'docs', docId) : path.join('docs', docId);
  const htmlPath = path.join(BUILD_DIR, relativeSubdir, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    // Fall back to English if Arabic page not yet built
    const fallbackPath = path.join(BUILD_DIR, 'docs', docId, 'index.html');
    if (!fs.existsSync(fallbackPath)) {
      console.warn(`[pdf] Skipping ${docId}: no built HTML found in ${htmlPath} or ${fallbackPath}`);
      return null;
    }
    return extractFromHtml(fallbackPath, docId);
  }
  
  return extractFromHtml(htmlPath, docId);
}

function extractFromHtml(htmlPath, docId) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : docId;
  
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  let content = mainMatch ? mainMatch[1] : '';
  
  // Clean up Docusaurus navigation elements
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
  const fontFaceCss = isAr && amiriFontBase64 ? `
    @font-face {
      font-family: 'Amiri';
      font-style: normal;
      font-weight: 400 700;
      src: url(data:font/woff2;charset=utf-8;base64,${amiriFontBase64}) format('woff2');
    }
    @font-face {
      font-family: 'IBM Plex Sans Arabic';
      font-style: normal;
      font-weight: 400 600;
      src: url(data:font/woff2;charset=utf-8;base64,${ibmPlexFontBase64}) format('woff2');
    }
  ` : '';

  const bodyFont = isAr 
    ? "'IBM Plex Sans Arabic', 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif" 
    : "'Source Sans 3', 'Helvetica Neue', Arial, sans-serif";
  const headingFont = isAr 
    ? "'Amiri', 'EB Garamond', Georgia, serif" 
    : "'EB Garamond', Georgia, serif";

  const direction = isAr ? 'rtl' : 'ltr';
  const textAlign = isAr ? 'right' : 'left';
  const borderSide = isAr ? 'border-right' : 'border-left';

  return `
    ${fontFaceCss}
    * { box-sizing: border-box; }
    
    html {
      direction: ${direction};
    }

    body {
      font-family: ${bodyFont};
      font-size: 11pt;
      line-height: 1.6;
      color: ${INK_1};
      background: #fff;
      margin: 0;
      padding: 25mm 20mm 25mm 20mm;
      direction: ${direction};
      text-align: ${textAlign};
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: ${headingFont};
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
    ul, ol { margin: 0 0 0.75rem; padding-${isAr ? 'right' : 'left'}: 1.5rem; }
    li { margin-bottom: 0.25rem; }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 10pt;
      page-break-inside: avoid;
      direction: ${direction};
    }
    
    th, td {
      border: 1px solid #e0ddd8;
      padding: 0.5rem 0.75rem;
      text-align: ${textAlign};
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
      direction: ltr !important;
      unicode-bidi: isolate;
      display: inline-block;
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
      direction: ltr !important;
      text-align: left !important;
      unicode-bidi: isolate;
    }
    
    pre code { background: none; border: none; padding: 0; color: inherit; display: block; }
    
    blockquote {
      ${borderSide}: 3px solid ${ACCENT};
      margin: 1rem 0;
      padding: 0.5rem 1rem;
      color: #5a4f42;
      background: #f9f8f5;
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
  const dateStr = new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8"><title>${SITE_TITLE}</title>
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
    font-size: 32pt;
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
  <p class="meta">${AUTHOR} &middot; ${dateStr}</p>
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
<html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8"><title>${TOC_TITLE}</title>
<style>
  ${getBaseStyles()}
  h2 {
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
  td:first-child { padding-${isAr ? 'left' : 'right'}: 1rem; }
  .page-num { color: ${ACCENT}; font-weight: 600; text-align: ${isAr ? 'left' : 'right'}; white-space: nowrap; }
</style>
</head>
<body>
  <h2>${TOC_TITLE}</h2>
  <table>
    ${tocItems}
  </table>
</body></html>`;
}

function generatePageHtml(page, pageNum) {
  return `<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8"><title>${escapeHtml(page.title)}</title>
<style>
  ${getBaseStyles()}
  .page-title {
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
  console.log('[pdf] Merging PDFs into final document...');
  
  const mergedPdf = await PDFDocument.create();
  
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
  
  const pdfBytes = await mergedPdf.save();
  fs.writeFileSync(OUTPUT_FILE, pdfBytes);
  
  console.log(`[pdf] Merged ${pdfPaths.length} pages into ${OUTPUT_FILE}`);
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
