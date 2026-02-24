import { Fragment } from "react";

const POSITION_FIELDS = [
  { key: "description", label: "Descripcion" },
  { key: "productCode", label: "Codigo" },
  { key: "price", label: "Precio" },
  { key: "promoPrice", label: "Promo" },
  { key: "unit", label: "Unidad" },
  { key: "validUntil", label: "Vigencia" },
  { key: "barcode", label: "Barcode" }
];

function FieldToggle({ label, checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}
    </label>
  );
}

export default function ConfigForm({ layout, fields, setLayout, setFields }) {
  const onLayoutChange = (key, value) => setLayout((prev) => ({ ...prev, [key]: value }));
  const onFieldChange = (key, value) => setFields((prev) => ({ ...prev, [key]: value }));

  const onPositionChange = (fieldKey, axis, value) => {
    setFields((prev) => ({
      ...prev,
      positions: {
        ...prev.positions,
        [fieldKey]: {
          ...(prev.positions?.[fieldKey] || {}),
          [axis]: Number(value)
        }
      }
    }));
  };

  return (
    <div className="panel">
      <h3>Configuracion de hoja/etiqueta</h3>
      <div className="grid2">
        <label>Ancho etiqueta (mm)<input type="number" value={layout.labelWidthMm} onChange={(e) => onLayoutChange("labelWidthMm", Number(e.target.value))} /></label>
        <label>Alto etiqueta (mm)<input type="number" value={layout.labelHeightMm} onChange={(e) => onLayoutChange("labelHeightMm", Number(e.target.value))} /></label>
        <label>Hoja
          <select value={layout.pageSize} onChange={(e) => onLayoutChange("pageSize", e.target.value)}>
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="ROLL">Rollo personalizado</option>
          </select>
        </label>
        <label>Orientacion
          <select value={layout.orientation} onChange={(e) => onLayoutChange("orientation", e.target.value)}>
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </label>
        <label>Columnas<input type="number" value={layout.columns} onChange={(e) => onLayoutChange("columns", Number(e.target.value))} /></label>
        <label>Filas<input type="number" value={layout.rows} onChange={(e) => onLayoutChange("rows", Number(e.target.value))} /></label>
        <label>Margen izq (mm)<input type="number" value={layout.marginLeftMm} onChange={(e) => onLayoutChange("marginLeftMm", Number(e.target.value))} /></label>
        <label>Margen der (mm)<input type="number" value={layout.marginRightMm} onChange={(e) => onLayoutChange("marginRightMm", Number(e.target.value))} /></label>
        <label>Margen sup (mm)<input type="number" value={layout.marginTopMm} onChange={(e) => onLayoutChange("marginTopMm", Number(e.target.value))} /></label>
        <label>Margen inf (mm)<input type="number" value={layout.marginBottomMm} onChange={(e) => onLayoutChange("marginBottomMm", Number(e.target.value))} /></label>
        <label>Separacion X (mm)<input type="number" value={layout.gapXmm} onChange={(e) => onLayoutChange("gapXmm", Number(e.target.value))} /></label>
        <label>Separacion Y (mm)<input type="number" value={layout.gapYmm} onChange={(e) => onLayoutChange("gapYmm", Number(e.target.value))} /></label>
      </div>

      {layout.pageSize === "ROLL" && (
        <div className="grid2">
          <label>Ancho hoja rollo (mm)<input type="number" value={layout.pageWidthMm} onChange={(e) => onLayoutChange("pageWidthMm", Number(e.target.value))} /></label>
          <label>Alto hoja rollo (mm)<input type="number" value={layout.pageHeightMm} onChange={(e) => onLayoutChange("pageHeightMm", Number(e.target.value))} /></label>
        </div>
      )}

      <h3>Editor de campos</h3>
      <div className="grid3">
        <FieldToggle label="Descripcion" checked={fields.showDescription} onChange={(v) => onFieldChange("showDescription", v)} />
        <FieldToggle label="Codigo producto" checked={fields.showProductCode} onChange={(v) => onFieldChange("showProductCode", v)} />
        <FieldToggle label="Precio" checked={fields.showPrice} onChange={(v) => onFieldChange("showPrice", v)} />
        <FieldToggle label="Precio promo" checked={fields.showPromoPrice} onChange={(v) => onFieldChange("showPromoPrice", v)} />
        <FieldToggle label="Unidad" checked={fields.showUnit} onChange={(v) => onFieldChange("showUnit", v)} />
        <FieldToggle label="Vigencia" checked={fields.showValidUntil} onChange={(v) => onFieldChange("showValidUntil", v)} />
        <FieldToggle label="Codigo de barras" checked={fields.showBarcode} onChange={(v) => onFieldChange("showBarcode", v)} />
      </div>

      <div className="grid2">
        <label>Fuente texto<input type="number" value={fields.textFontSize} onChange={(e) => onFieldChange("textFontSize", Number(e.target.value))} /></label>
        <label>Fuente precio<input type="number" value={fields.priceFontSize} onChange={(e) => onFieldChange("priceFontSize", Number(e.target.value))} /></label>
      </div>

      <h3>Layout de campos (mm dentro de la etiqueta)</h3>
      <div className="position-grid">
        <div className="position-header">Campo</div>
        <div className="position-header">X</div>
        <div className="position-header">Y</div>
        <div className="position-header">Ancho</div>
        <div className="position-header">Alto</div>
        {POSITION_FIELDS.map((field) => (
          <Fragment key={field.key}>
            <div className="position-label">{field.label}</div>
            <input type="number" step="0.1" value={fields.positions?.[field.key]?.xMm ?? 0} onChange={(e) => onPositionChange(field.key, "xMm", e.target.value)} />
            <input type="number" step="0.1" value={fields.positions?.[field.key]?.yMm ?? 0} onChange={(e) => onPositionChange(field.key, "yMm", e.target.value)} />
            <input type="number" step="0.1" value={fields.positions?.[field.key]?.widthMm ?? 0} onChange={(e) => onPositionChange(field.key, "widthMm", e.target.value)} />
            <input type="number" step="0.1" value={fields.positions?.[field.key]?.heightMm ?? 0} onChange={(e) => onPositionChange(field.key, "heightMm", e.target.value)} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
