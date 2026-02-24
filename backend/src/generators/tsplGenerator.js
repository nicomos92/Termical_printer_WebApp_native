import { mmToPx } from "../utils/mm.js";
import { normalizeFieldsConfig } from "../services/fieldLayoutService.js";

export function buildTspl(layout, fields) {
  const widthMm = Math.round(layout.page.widthMm);
  const heightMm = Math.round(layout.page.heightMm);

  const lines = [
    `SIZE ${widthMm} mm,${heightMm} mm`,
    "GAP 2 mm,0 mm",
    "DIRECTION 1",
    "CLS"
  ];

  layout.pages.flat().forEach((item) => {
    const normalizedFields = normalizeFieldsConfig(fields, item.width, item.height);
    const positions = normalizedFields.positions;

    const x = mmToPx(item.x);
    const y = mmToPx(item.y);

    lines.push(`BOX ${x},${y},${x + mmToPx(item.width)},${y + mmToPx(item.height)},2`);

    if (normalizedFields.showDescription) {
      lines.push(textAt(x, y, positions.description, sanitize(item.product.description)));
    }

    if (normalizedFields.showProductCode) {
      lines.push(textAt(x, y, positions.productCode, `Cod: ${sanitize(item.product.productCode)}`));
    }

    if (normalizedFields.showPrice) {
      lines.push(textAt(x, y, positions.price, `$ ${Number(item.product.price).toFixed(2)}`, 4));
    }

    if (normalizedFields.showPromoPrice && item.product.promoPrice != null) {
      lines.push(textAt(x, y, positions.promoPrice, `Promo: $ ${Number(item.product.promoPrice).toFixed(2)}`));
    }

    if (normalizedFields.showUnit) {
      lines.push(textAt(x, y, positions.unit, `Unidad: ${sanitize(item.product.unit || "")}`));
    }

    if (normalizedFields.showValidUntil && item.product.validUntil) {
      lines.push(textAt(x, y, positions.validUntil, `Val: ${sanitize(item.product.validUntil)}`));
    }

    if (normalizedFields.showBarcode) {
      const b = positions.barcode;
      lines.push(`BARCODE ${x + mmToPx(b.xMm)},${y + mmToPx(b.yMm)},"128",${Math.max(36, mmToPx(b.heightMm))},1,0,2,2,"${sanitize(item.product.barcode)}"`);
    }
  });

  lines.push("PRINT 1,1");
  return lines.join("\n");
}

function textAt(baseX, baseY, box, text, font = 3) {
  const x = baseX + mmToPx(box.xMm);
  const y = baseY + mmToPx(box.yMm);
  return `TEXT ${x},${y},"${font}",0,1,1,"${text}"`;
}

function sanitize(input) {
  return String(input || "").replace(/"/g, "'");
}
