const seedProducts = [
  {
    barcode: "7791234567001",
    productCode: "PINT-001",
    description: "Latex Interior Blanco 20L",
    price: 58999,
    promoPrice: 52999,
    unit: "UN",
    validUntil: "2026-12-31"
  },
  {
    barcode: "7791234567002",
    productCode: "PINT-002",
    description: "Esmalte Sintetico Satinado 4L",
    price: 21990,
    promoPrice: null,
    unit: "UN",
    validUntil: "2026-11-30"
  },
  {
    barcode: "7791234567003",
    productCode: "ACC-015",
    description: "Rodillo Antigota 22cm",
    price: 8990,
    promoPrice: 7490,
    unit: "UN",
    validUntil: "2026-10-15"
  },
  {
    barcode: "7791234567004",
    productCode: "ACC-031",
    description: "Cinta Enmascarar 24mm x 40m",
    price: 3250,
    promoPrice: null,
    unit: "UN",
    validUntil: "2026-12-31"
  },
  {
    barcode: "7791234567005",
    productCode: "PINT-088",
    description: "Revestimiento Texturado Exterior 30kg",
    price: 47200,
    promoPrice: 43800,
    unit: "UN",
    validUntil: "2026-09-30"
  }
];

const productMap = new Map(seedProducts.map((p) => [p.barcode, p]));

export function getMockProductByBarcode(barcode) {
  const found = productMap.get(String(barcode));
  if (found) return found;

  const randomPrice = 1000 + (Number(String(barcode).slice(-4)) || 1234);
  return {
    barcode: String(barcode),
    productCode: `AUTO-${String(barcode).slice(-6)}`,
    description: `Producto simulado ${String(barcode).slice(-6)}`,
    price: randomPrice,
    promoPrice: randomPrice % 2 === 0 ? randomPrice - 150 : null,
    unit: "UN",
    validUntil: "2026-12-31"
  };
}

export function getMockCatalog() {
  return seedProducts;
}
