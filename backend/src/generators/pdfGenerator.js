import PDFDocument from "pdfkit";
import { mmToPt, formatMoney } from "../utils/mm.js";
import { generateBarcodePng } from "../services/barcode.js";
import { env } from "../config/env.js";
import { normalizeFieldsConfig } from "../services/fieldLayoutService.js";

export async function buildPdfBuffer(layout, fields) {
  const doc = new PDFDocument({
    size: [mmToPt(layout.page.widthMm), mmToPt(layout.page.heightMm)],
    margin: 0,
    info: {
      Title: "Etiquetas de Gondola",
      Author: env.pdfAuthor
    }
  });

  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  for (let pageIndex = 0; pageIndex < layout.pages.length; pageIndex += 1) {
    if (pageIndex > 0) {
      doc.addPage({ size: [mmToPt(layout.page.widthMm), mmToPt(layout.page.heightMm)], margin: 0 });
    }

    for (const item of layout.pages[pageIndex]) {
      const normalizedFields = normalizeFieldsConfig(fields, item.width, item.height);
      const positions = normalizedFields.positions;

      const x = mmToPt(item.x);
      const y = mmToPt(item.y);
      const w = mmToPt(item.width);
      const h = mmToPt(item.height);

      doc.rect(x, y, w, h).lineWidth(0.8).stroke();

      if (normalizedFields.showDescription) {
        drawText(doc, x, y, positions.description, item.product.description, normalizedFields.textFontSize);
      }

      if (normalizedFields.showProductCode) {
        drawText(doc, x, y, positions.productCode, `Cod: ${item.product.productCode}`, Math.max(7, normalizedFields.textFontSize - 1));
      }

      if (normalizedFields.showPrice) {
        drawText(doc, x, y, positions.price, formatMoney(item.product.price), normalizedFields.priceFontSize);
      }

      if (normalizedFields.showPromoPrice && item.product.promoPrice != null) {
        doc.fillColor("red");
        drawText(doc, x, y, positions.promoPrice, `Promo: ${formatMoney(item.product.promoPrice)}`, normalizedFields.textFontSize + 1);
        doc.fillColor("black");
      }

      if (normalizedFields.showUnit) {
        drawText(doc, x, y, positions.unit, `Unidad: ${item.product.unit || ""}`, Math.max(7, normalizedFields.textFontSize - 1));
      }

      if (normalizedFields.showValidUntil && item.product.validUntil) {
        drawText(doc, x, y, positions.validUntil, `Validez: ${item.product.validUntil}`, Math.max(7, normalizedFields.textFontSize - 1));
      }

      if (normalizedFields.showBarcode) {
        const b = positions.barcode;
        const barcodeBuffer = await generateBarcodePng(item.product.barcode);
        doc.image(barcodeBuffer, x + mmToPt(b.xMm), y + mmToPt(b.yMm), {
          fit: [mmToPt(b.widthMm), mmToPt(b.heightMm)],
          align: "left"
        });
      }
    }
  }

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

function drawText(doc, labelX, labelY, box, value, size) {
  doc.fontSize(size).text(String(value || ""), labelX + mmToPt(box.xMm), labelY + mmToPt(box.yMm), {
    width: mmToPt(box.widthMm),
    height: mmToPt(box.heightMm),
    ellipsis: true
  });
}
