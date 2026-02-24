import { buildDefaultPositions } from "./fieldLayoutService.js";

function withPositions(base, labelWidthMm = 50, labelHeightMm = 30) {
  return {
    ...base,
    positions: buildDefaultPositions(labelWidthMm, labelHeightMm)
  };
}

export const templates = {
  basic: {
    key: "basic",
    name: "Basica",
    fields: withPositions({
      showBarcode: true,
      showProductCode: true,
      showDescription: true,
      showPrice: true,
      showPromoPrice: true,
      showUnit: true,
      showValidUntil: true,
      priceFontSize: 20,
      textFontSize: 10
    })
  },
  compact: {
    key: "compact",
    name: "Compacta",
    fields: withPositions({
      showBarcode: true,
      showProductCode: false,
      showDescription: true,
      showPrice: true,
      showPromoPrice: false,
      showUnit: true,
      showValidUntil: false,
      priceFontSize: 18,
      textFontSize: 9
    })
  },
  promo: {
    key: "promo",
    name: "Promocion",
    fields: withPositions({
      showBarcode: true,
      showProductCode: true,
      showDescription: true,
      showPrice: true,
      showPromoPrice: true,
      showUnit: true,
      showValidUntil: true,
      priceFontSize: 24,
      textFontSize: 10
    })
  }
};

export function getTemplateByKey(key) {
  return templates[key] || templates.basic;
}
