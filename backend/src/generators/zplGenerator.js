import { mmToPx } from "../utils/mm.js";
import { normalizeFieldsConfig } from "../services/fieldLayoutService.js";

export function buildZpl(layout, fields) {
  const lines = ["^XA"];

  layout.pages.flat().forEach((item) => {
    const normalizedFields = normalizeFieldsConfig(fields, item.width, item.height);
    const positions = normalizedFields.positions;

    const x = mmToPx(item.x);
    const y = mmToPx(item.y);
    const labelW = mmToPx(item.width);
    const labelH = mmToPx(item.height);

    const fieldSize = Math.max(18, Math.round(normalizedFields.textFontSize * 2));
    const priceSize = Math.max(26, Math.round(normalizedFields.priceFontSize * 2));

    lines.push(`^FO${x},${y}^GB${labelW},${labelH},2^FS`);

    if (normalizedFields.showDescription) {
      lines.push(textAt(x, y, positions.description, fieldSize, sanitize(item.product.description)));
    }

    if (normalizedFields.showProductCode) {
      lines.push(textAt(x, y, positions.productCode, fieldSize, `Cod: ${sanitize(item.product.productCode)}`));
    }

    if (normalizedFields.showPrice) {
      lines.push(textAt(x, y, positions.price, priceSize, `$ ${Number(item.product.price).toFixed(2)}`));
    }

    if (normalizedFields.showPromoPrice && item.product.promoPrice != null) {
      lines.push(textAt(x, y, positions.promoPrice, fieldSize + 4, `Promo: $ ${Number(item.product.promoPrice).toFixed(2)}`));
    }

    if (normalizedFields.showUnit) {
      lines.push(textAt(x, y, positions.unit, fieldSize, `Unidad: ${sanitize(item.product.unit || "")}`));
    }

    if (normalizedFields.showValidUntil && item.product.validUntil) {
      lines.push(textAt(x, y, positions.validUntil, fieldSize, `Val: ${sanitize(item.product.validUntil)}`));
    }

    if (normalizedFields.showBarcode) {
      const b = positions.barcode;
      lines.push(`^FO${x + mmToPx(b.xMm)},${y + mmToPx(b.yMm)}^BY2^BCN,${Math.max(30, mmToPx(b.heightMm))},N,N,N^FD${sanitize(item.product.barcode)}^FS`);
    }
  });

  lines.push("^XZ");
  return lines.join("\n");
}

function textAt(baseX, baseY, box, fontSize, text) {
  const x = baseX + mmToPx(box.xMm);
  const y = baseY + mmToPx(box.yMm);
  const width = Math.max(20, mmToPx(box.widthMm));

  return `^FO${x},${y}^A0N,${fontSize},${fontSize}^FB${width},2,0,L,0^FD${text}^FS`;
}

function sanitize(input) {
  return String(input || "").replace(/[\^~]/g, " ");
}
