const FIELD_KEYS = [
  "description",
  "productCode",
  "price",
  "promoPrice",
  "unit",
  "validUntil",
  "barcode"
];

export function buildDefaultPositions(labelWidthMm = 50, labelHeightMm = 30) {
  const w = Number(labelWidthMm) || 50;
  const h = Number(labelHeightMm) || 30;

  const fromRatio = (x, y, width, height) => ({
    xMm: round((x / 100) * w),
    yMm: round((y / 100) * h),
    widthMm: round((width / 100) * w),
    heightMm: round((height / 100) * h)
  });

  return {
    description: fromRatio(4, 6, 92, 20),
    productCode: fromRatio(4, 28, 60, 10),
    price: fromRatio(4, 40, 55, 22),
    promoPrice: fromRatio(4, 64, 60, 10),
    unit: fromRatio(62, 40, 34, 10),
    validUntil: fromRatio(62, 64, 34, 10),
    barcode: fromRatio(4, 76, 92, 18)
  };
}

export function normalizeFieldsConfig(fields, labelWidthMm = 50, labelHeightMm = 30) {
  const defaults = buildDefaultPositions(labelWidthMm, labelHeightMm);
  const incoming = fields?.positions || {};
  const positions = {};

  for (const key of FIELD_KEYS) {
    const merged = { ...defaults[key], ...(incoming[key] || {}) };
    positions[key] = {
      xMm: toPositive(merged.xMm),
      yMm: toPositive(merged.yMm),
      widthMm: toPositive(merged.widthMm),
      heightMm: toPositive(merged.heightMm)
    };
  }

  return {
    ...fields,
    positions
  };
}

function toPositive(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return round(Math.max(0, num));
}

function round(value) {
  return Math.round(value * 100) / 100;
}
