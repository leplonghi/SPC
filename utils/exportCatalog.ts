export interface ExportColumn<T> {
  header: string;
  width: number;
  value: (row: T) => string;
}

export interface ExportCatalogOptions<T> {
  title: string;
  subtitle: string;
  filterSummary: string;
  sheetName: string;
  fileNameBase: string;
  rows: T[];
  columns: ExportColumn<T>[];
  sourceUrl?: string;
}

const xmlEscape = (input: string): string =>
  input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const htmlEscape = (input: string): string =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const colLetter = (index: number): string => {
  let n = index + 1;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

// Standard IEEE 802.3 CRC-32 for uncompressed ZIP (STORE)
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes: Uint8Array): number => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const createZipStore = (entries: { name: string; content: string }[]): Uint8Array => {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const dataBytes = encoder.encode(entry.content);
    const crc = crc32(dataBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true); // Local file header signature
    lv.setUint16(4, 20, true); // Version needed
    lv.setUint16(6, 0x0800, true); // UTF-8 filename flag
    lv.setUint16(8, 0, true); // Compression: STORE
    lv.setUint16(10, 0, true); // Mod time
    lv.setUint16(12, 0x5421, true); // Mod date
    lv.setUint32(14, crc, true);
    lv.setUint32(18, dataBytes.length, true);
    lv.setUint32(22, dataBytes.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, dataBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true); // Central directory signature
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x5421, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, dataBytes.length, true);
    cv.setUint32(24, dataBytes.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + dataBytes.length;
  }

  const centralSize = centralParts.reduce((sum, p) => sum + p.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalLength = offset + centralSize + eocd.length;
  const out = new Uint8Array(totalLength);
  let cursor = 0;
  for (const p of localParts) {
    out.set(p, cursor);
    cursor += p.length;
  }
  for (const p of centralParts) {
    out.set(p, cursor);
    cursor += p.length;
  }
  out.set(eocd, cursor);
  return out;
};

const formatNowPtBr = (): string =>
  new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export const buildXlsxBytes = <T,>(opts: ExportCatalogOptions<T>): Uint8Array => {
  const safeSheetName = opts.sheetName.replace(/[\\/?*[\]:]/g, '').slice(0, 31) || 'Dados';
  const lastCol = colLetter(Math.max(opts.columns.length - 1, 0));
  const generatedAt = formatNowPtBr();

  const colsXml = opts.columns
    .map((c, idx) => `<col min="${idx + 1}" max="${idx + 1}" width="${c.width}" customWidth="1"/>`)
    .join('');

  const headerCells = opts.columns
    .map(
      (c, idx) =>
        `<c r="${colLetter(idx)}4" t="inlineStr" s="3"><is><t>${xmlEscape(c.header)}</t></is></c>`
    )
    .join('');

  const dataRowsXml = opts.rows
    .map((row, rIdx) => {
      const excelRow = rIdx + 5;
      const styleId = rIdx % 2 === 1 ? 4 : 5;
      const cells = opts.columns
        .map(
          (col, cIdx) =>
            `<c r="${colLetter(cIdx)}${excelRow}" t="inlineStr" s="${styleId}"><is><t>${xmlEscape(
              col.value(row)
            )}</t></is></c>`
        )
        .join('');
      return `<row r="${excelRow}">${cells}</row>`;
    })
    .join('');

  const lastRow = Math.max(opts.rows.length + 4, 4);

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
  <cols>${colsXml}</cols>
  <sheetData>
    <row r="1" ht="26" customHeight="1">
      <c r="A1" t="inlineStr" s="1"><is><t>${xmlEscape(opts.title)}</t></is></c>
    </row>
    <row r="2" ht="18" customHeight="1">
      <c r="A2" t="inlineStr" s="2"><is><t>${xmlEscape(
        `${opts.subtitle} · ${opts.filterSummary} · Emitido em ${generatedAt}`
      )}</t></is></c>
    </row>
    <row r="3" ht="8" customHeight="1"/>
    <row r="4" ht="24" customHeight="1">${headerCells}</row>
    ${dataRowsXml}
  </sheetData>
  <autoFilter ref="A4:${lastCol}${lastRow}"/>
  <mergeCells count="2">
    <mergeCell ref="A1:${lastCol}1"/>
    <mergeCell ref="A2:${lastCol}2"/>
  </mergeCells>
  <pageSetup orientation="landscape" paperSize="9"/>
</worksheet>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="10"/><color rgb="FF1E293B"/><name val="Calibri"/></font>
    <font><b/><sz val="13"/><color rgb="FF071D33"/><name val="Calibri"/></font>
    <font><i/><sz val="9.5"/><color rgb="FF475569"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF071D33"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFAF8F5"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFE5DDD5"/></left>
      <right style="thin"><color rgb="FFE5DDD5"/></right>
      <top style="thin"><color rgb="FFE5DDD5"/></top>
      <bottom style="thin"><color rgb="FFE5DDD5"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="6">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
  </cellXfs>
</styleSheet>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${xmlEscape(safeSheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  return createZipStore([
    { name: '[Content_Types].xml', content: contentTypesXml },
    { name: '_rels/.rels', content: rootRelsXml },
    { name: 'xl/workbook.xml', content: workbookXml },
    { name: 'xl/_rels/workbook.xml.rels', content: workbookRelsXml },
    { name: 'xl/styles.xml', content: stylesXml },
    { name: 'xl/worksheets/sheet1.xml', content: sheetXml }
  ]);
};

export const downloadCatalogXlsx = <T,>(opts: ExportCatalogOptions<T>): void => {
  const bytes = buildXlsxBytes(opts);
  const blob = new Blob([bytes.buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${opts.fileNameBase}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const printCatalogPdf = <T,>(opts: ExportCatalogOptions<T>): void => {
  const generatedAt = formatNowPtBr();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const sourceLine = opts.sourceUrl || origin;

  const thead = opts.columns
    .map((c) => `<th>${htmlEscape(c.header)}</th>`)
    .join('');

  const tbody = opts.rows
    .map(
      (row) =>
        `<tr>${opts.columns
          .map((c) => `<td>${htmlEscape(c.value(row))}</td>`)
          .join('')}</tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${htmlEscape(opts.title)} — SPC/SECMA</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 0;
      font-size: 10.5px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .doc-header {
      border-bottom: 2.5px solid #071D33;
      padding-bottom: 10px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
    }
    .kicker {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #256B58;
      margin: 0 0 3px 0;
    }
    h1 {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 18px;
      font-weight: 700;
      color: #071D33;
      margin: 0 0 2px 0;
    }
    .subtitle {
      font-size: 10.5px;
      color: #475569;
      margin: 0;
    }
    .meta {
      text-align: right;
      font-size: 9.5px;
      color: #334155;
      white-space: nowrap;
    }
    .meta strong { color: #071D33; }
    .filter-bar {
      background: #FAF8F5;
      border: 1px solid #E5DDD5;
      border-radius: 6px;
      padding: 6px 10px;
      margin-bottom: 10px;
      font-size: 10px;
      color: #334155;
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th {
      background: #071D33;
      color: #FFFFFF;
      text-align: left;
      padding: 6px 7px;
      font-size: 9.5px;
      font-weight: 700;
      border: 1px solid #071D33;
    }
    td {
      padding: 5.5px 7px;
      border: 1px solid #DDD6CE;
      vertical-align: top;
      word-break: break-word;
    }
    tbody tr:nth-child(even) td { background: #FAF8F5; }
    .doc-footer {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 1px solid #CBD5E1;
      font-size: 9px;
      color: #64748B;
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
  </style>
</head>
<body>
  <header class="doc-header">
    <div>
      <p class="kicker">Governo do Estado do Maranhão · SECMA · Superintendência do Patrimônio Cultural</p>
      <h1>${htmlEscape(opts.title)}</h1>
      <p class="subtitle">${htmlEscape(opts.subtitle)}</p>
    </div>
    <div class="meta">
      <div><strong>Registros:</strong> ${opts.rows.length}</div>
      <div><strong>Emitido em:</strong> ${htmlEscape(generatedAt)}</div>
    </div>
  </header>

  <div class="filter-bar">
    <span><strong>Recorte:</strong> ${htmlEscape(opts.filterSummary)}</span>
    <span><strong>Fonte oficial:</strong> ${htmlEscape(sourceLine)}</span>
  </div>

  <table>
    <thead><tr>${thead}</tr></thead>
    <tbody>${tbody}</tbody>
  </table>

  <footer class="doc-footer">
    <span>Superintendência do Patrimônio Cultural do Maranhão (SPC/SECMA) · patrimonioculturalma@gmail.com</span>
    <span>Documento gerado eletronicamente pelo Portal SPC</span>
  </footer>
</body>
</html>`;

  // Hidden iframe avoids popup blockers and opens native Print / Save as PDF directly
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc || !iframe.contentWindow) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 800);
  };

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      cleanup();
    }
  }, 150);
};

