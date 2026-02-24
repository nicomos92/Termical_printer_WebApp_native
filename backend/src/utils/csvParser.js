export function parseCsvBarcodes(content) {
  const rows = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return rows
    .map((line) => line.split(",")[0]?.trim())
    .filter((barcode) => barcode && barcode.toLowerCase() !== "barcode");
}
