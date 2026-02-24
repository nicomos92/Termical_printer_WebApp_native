export const DPI_203 = 203;

export function mmToPx(mm, dpi = DPI_203) {
  return Math.round((mm / 25.4) * dpi);
}

export function mmToPt(mm) {
  return (mm / 25.4) * 72;
}

export function formatMoney(value) {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2
  });
}
