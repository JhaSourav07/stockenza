/**
 * generateInvoice({ store, customer, order, taxRate })
 *
 * Produces a Flipkart-style A4 Tax Invoice PDF and triggers a browser download.
 *
 * @param {object} store     – billingInfo from the User profile (Billed From)
 * @param {object} customer  – collected at checkout time (Billed To)
 * @param {object} order     – { _id, items:[{name,qty,price}], subtotal, tax, total, createdAt }
 * @param {number} taxRate   – total tax rate % (e.g. 18)
 *
 * Next.js note: import autoTable as a default import and call autoTable(doc, {...})
 * — NOT doc.autoTable(). This avoids the SSR prototype-patching issue.
 */
export async function generateInvoice({ store, customer, order, taxRate }) {
  // ── Dynamic import keeps jspdf out of the SSR bundle ──────────────────────
  const { jsPDF }   = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  /* ── Palette ── */
  const C = {
    white:    [255, 255, 255],
    black:    [0,   0,   0  ],
    headerBg: [26,  26,  46 ],      // dark navy
    indigo:   [99,  102, 241],      // indigo-500
    border:   [220, 220, 220],
    muted:    [120, 120, 140],
    body:     [30,  30,  30 ],
    subtext:  [100, 100, 120],
    rowAlt:   [248, 248, 252],
  };

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MT     = 10;   // top margin
  const ML     = 12;   // left margin
  const MR     = PAGE_W - 12;
  const usableW = MR - ML;

  let y = MT;

  /* ────────────────────────────────────────────────────────────────────────
     HEADER BAR
  ──────────────────────────────────────────────────────────────────────── */
  doc.setFillColor(...C.headerBg);
  doc.rect(0, 0, PAGE_W, 26, 'F');

  // Left: TAX INVOICE label
  doc.setTextColor(...C.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('TAX INVOICE', ML, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 180, 220);
  doc.text('Original for Recipient', ML, 17);

  // Right: Brand name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...C.white);
  const brand = store.storeName || 'Stockenza';
  doc.text(brand, MR, 12, { align: 'right' });

  // GSTIN under brand
  if (store.gstin) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 220);
    doc.text(`GSTIN: ${store.gstin}`, MR, 18, { align: 'right' });
  }

  // Indigo underline strip
  doc.setFillColor(...C.indigo);
  doc.rect(0, 26, PAGE_W, 1.2, 'F');

  y = 34;

  /* ────────────────────────────────────────────────────────────────────────
     ORDER META ROW  (Invoice No | Date | Order ID)
  ──────────────────────────────────────────────────────────────────────── */
  const orderId     = typeof order._id === 'string' ? order._id : String(order._id);
  const invoiceNo   = orderId.slice(-8).toUpperCase();
  const invoiceDate = new Date(order.createdAt || Date.now())
    .toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const metaCols = [
    { label: 'Invoice No.',  value: `INV-${invoiceNo}` },
    { label: 'Invoice Date', value: invoiceDate         },
    { label: 'Order Ref.',   value: invoiceNo           },
  ];

  const colW = usableW / metaCols.length;
  metaCols.forEach(({ label, value }, i) => {
    const x = ML + i * colW;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.body);
    doc.text(value, x, y + 5);
  });

  y += 14;

  /* ────────────────────────────────────────────────────────────────────────
     DIVIDER
  ──────────────────────────────────────────────────────────────────────── */
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(ML, y, MR, y);
  y += 5;

  /* ────────────────────────────────────────────────────────────────────────
     BILLED FROM | BILLED TO
  ──────────────────────────────────────────────────────────────────────── */
  const halfW = usableW / 2 - 4;

  const drawAddressBlock = (title, lines, xOff) => {
    let ly = y;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.indigo);
    doc.text(title, xOff, ly);
    ly += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.body);

    lines.filter(Boolean).forEach((line) => {
      const wrapped = doc.splitTextToSize(line, halfW);
      doc.text(wrapped, xOff, ly);
      ly += wrapped.length * 4.5;
    });
    return ly;
  };

  const fromLines = [
    store.storeName,
    store.address,
    [store.city, store.state, store.pincode].filter(Boolean).join(', '),
    store.gstin  ? `GSTIN: ${store.gstin}` : null,
    store.pan    ? `PAN:   ${store.pan}`   : null,
    store.phone  ? `Ph:    ${store.phone}` : null,
  ];

  const toLines = [
    customer.name  || 'Walk-in Customer',
    customer.phone ? `Ph: ${customer.phone}` : null,
    customer.address,
    [customer.city, customer.state, customer.pincode].filter(Boolean).join(', '),
  ];

  const leftEnd  = drawAddressBlock('BILLED FROM', fromLines, ML);
  const rightEnd = drawAddressBlock('BILLED TO',   toLines,   ML + halfW + 8);

  y = Math.max(leftEnd, rightEnd) + 6;

  // Vertical divider between the two columns
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.2);
  doc.line(ML + halfW + 4, y - (Math.max(leftEnd, rightEnd) - (y - 12)), ML + halfW + 4, y - 6);

  /* ────────────────────────────────────────────────────────────────────────
     ITEMS TABLE
  ──────────────────────────────────────────────────────────────────────── */
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(ML, y, MR, y);
  y += 1;

  // Determine GST split (CGST+SGST vs IGST)
  const sameState      = store.state && customer.state && store.state === customer.state;
  const halfTax        = taxRate / 2;
  const taxLabel       = sameState ? `CGST + SGST (${halfTax}%+${halfTax}%)` : `IGST (${taxRate}%)`;

  // ── Running accumulators (recomputed from items for accuracy) ──
  // item.price = sellingPrice, which is tax-EXCLUSIVE.
  // Taxable Value = price × qty  (base, excl. GST)
  // Tax Amount    = taxable × (taxRate / 100)
  // Gross Amount  = taxable + taxAmt  (what the customer pays)
  let runningSubtotal = 0;
  let runningTax      = 0;

  const tableBody = order.items.map((item) => {
    const taxable = item.price * item.qty;           // taxable value (excl. tax)
    const taxAmt  = taxable * (taxRate / 100);        // GST on this line
    const gross   = taxable + taxAmt;                // gross total (incl. tax)
    runningSubtotal += taxable;
    runningTax      += taxAmt;
    return [
      item.name,
      item.qty,
      `Rs. ${gross.toFixed(2)}`,
      `Rs. ${taxAmt.toFixed(2)}`,
      `Rs. ${taxable.toFixed(2)}`,
    ];
  });

  const grandTotal = runningSubtotal + runningTax;

  autoTable(doc, {
    startY:     y,
    margin:     { left: ML, right: PAGE_W - MR },
    head: [[
      'Product / Description',
      'Qty',
      'Gross Amount',
      taxLabel,
      'Taxable Value',
    ]],
    body:       tableBody,
    theme:      'plain',
    headStyles: {
      fillColor:  C.headerBg,
      textColor:  C.white,
      fontStyle:  'bold',
      fontSize:   8,
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
    },
    bodyStyles: {
      fontSize:   8.5,
      textColor:  C.body,
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
    },
    alternateRowStyles: { fillColor: C.rowAlt },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'right',  cellWidth: 32 },
      3: { halign: 'right',  cellWidth: 38 },
      4: { halign: 'right',  cellWidth: 32 },
    },
    tableLineColor: C.border,
    tableLineWidth: 0.2,
  });

  y = doc.lastAutoTable.finalY + 6;

  /* ────────────────────────────────────────────────────────────────────────
     TOTALS BLOCK  (right-aligned)
  ──────────────────────────────────────────────────────────────────────── */
  const totW  = 80;
  const totX  = MR - totW;
  const totals = [
    { label: 'Subtotal (excl. tax)', value: `Rs. ${runningSubtotal.toFixed(2)}` },
    { label: taxLabel,               value: `Rs. ${runningTax.toFixed(2)}`      },
  ];

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.25);
  doc.line(totX, y, MR, y);
  y += 4;

  totals.forEach(({ label, value }) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.subtext);
    doc.text(label, totX, y);
    doc.text(value, MR, y, { align: 'right' });
    y += 5;
  });

  y += 1;
  doc.setDrawColor(...C.indigo);
  doc.setLineWidth(0.4);
  doc.line(totX, y, MR, y);
  y += 5;

  // GRAND TOTAL
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.body);
  doc.text('GRAND TOTAL', totX, y);
  doc.setTextColor(...C.indigo);
  doc.text(`Rs. ${grandTotal.toFixed(2)}`, MR, y, { align: 'right' });
  y += 3;

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.25);
  doc.line(totX, y, MR, y);
  y += 10;

  /* ────────────────────────────────────────────────────────────────────────
     AMOUNT IN WORDS
  ──────────────────────────────────────────────────────────────────────── */
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...C.subtext);
  doc.text(`Amount in words: ${numberToWords(Math.round(grandTotal))} Rupees Only`, ML, y);
  y += 12;

  /* ────────────────────────────────────────────────────────────────────────
     FOOTER  (Signature + Note)
  ──────────────────────────────────────────────────────────────────────── */
  // Signature box
  const sigX = MR - 55;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.rect(sigX, y, 55, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text('For ' + (store.storeName || 'Seller'), sigX + 27.5, y + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Authorized Signatory', sigX + 27.5, y + 19, { align: 'center' });

  // Bottom note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  const note = 'This is a computer-generated invoice. No signature required if printed. Thank you for your business!';
  doc.text(note, ML, PAGE_H - 10, { maxWidth: usableW });

  // Bottom rule
  doc.setFillColor(...C.headerBg);
  doc.rect(0, PAGE_H - 6, PAGE_W, 6, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(160, 160, 200);
  doc.text('Generated by Stockenza · stockenza.co.in', PAGE_W / 2, PAGE_H - 2.5, { align: 'center' });

  /* ── Download ── */
  const fname = `Invoice_INV-${invoiceNo}_${invoiceDate.replace(/ /g, '-')}.pdf`;
  doc.save(fname);
}

/* ────────────────────────────────────────────────────────────────────────────
   HELPER: Integer → Indian number system words (up to crores)
──────────────────────────────────────────────────────────────────────────── */
function numberToWords(n) {
  if (n === 0) return 'Zero';
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
                 'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
                 'Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

  function below100(num) {
    if (num < 20) return ones[num];
    return `${tens[Math.floor(num / 10)]}${num % 10 ? ' ' + ones[num % 10] : ''}`;
  }
  function below1000(num) {
    if (num < 100) return below100(num);
    return `${ones[Math.floor(num / 100)]} Hundred${num % 100 ? ' ' + below100(num % 100) : ''}`;
  }

  let result = '';
  if (n >= 10_00_0000) { result += below1000(Math.floor(n / 10_00_0000)) + ' Crore '; n %= 10_00_0000; }
  if (n >=    1_00_000) { result += below100( Math.floor(n /    1_00_000)) + ' Lakh ';  n %=    1_00_000; }
  if (n >=      1_000)  { result += below100( Math.floor(n /      1_000))  + ' Thousand '; n %=    1_000; }
  if (n > 0)             result += below1000(n);

  return result.trim();
}
