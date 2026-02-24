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

const TOGGLE_FIELDS = [
  { key: "showDescription", label: "Descripcion" },
  { key: "showProductCode", label: "Codigo producto" },
  { key: "showPrice", label: "Precio" },
  { key: "showPromoPrice", label: "Precio promo" },
  { key: "showUnit", label: "Unidad" },
  { key: "showValidUntil", label: "Vigencia" },
  { key: "showBarcode", label: "Codigo de barras" }
];

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function FieldToggle({ label, checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}
    </label>
  );
}

export default function ConfigForm({ layout, fields, setLayout, setFields, onResetLayout, onResetFields }) {
  const onLayoutChange = (key, value) => setLayout((prev) => ({ ...prev, [key]: value }));
  const onLayoutNumberChange = (key, value) => {
    setLayout((prev) => ({ ...prev, [key]: parseNumber(value, prev[key]) }));
  };
  const onFieldNumberChange = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: parseNumber(value, prev[key]) }));
  };
  const onFieldToggleChange = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const onPositionChange = (fieldKey, axis, value) => {
    setFields((prev) => ({
      ...prev,
      positions: {
        ...prev.positions,
        [fieldKey]: {
          ...(prev.positions?.[fieldKey] || {}),
          [axis]: parseNumber(value, prev.positions?.[fieldKey]?.[axis] || 0)
        }
      }
    }));
  };

  return (
    <div className="panel">
      <div className="section-head">
        <h3>Configuracion de hoja/etiqueta</h3>
        <button className="btn btn-ghost" type="button" onClick={onResetLayout}>
          Restaurar layout
        </button>
      </div>

      <div className="grid2">
        <label>
          Ancho etiqueta (mm)
          <input type="number" min="1" step="0.1" value={layout.labelWidthMm} onChange={(e) => onLayoutNumberChange("labelWidthMm", e.target.value)} />
        </label>
        <label>
          Alto etiqueta (mm)
          <input type="number" min="1" step="0.1" value={layout.labelHeightMm} onChange={(e) => onLayoutNumberChange("labelHeightMm", e.target.value)} />
        </label>
        <label>
          Hoja
          <select value={layout.pageSize} onChange={(e) => onLayoutChange("pageSize", e.target.value)}>
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="ROLL">Rollo personalizado</option>
          </select>
        </label>
        <label>
          Orientacion
          <select value={layout.orientation} onChange={(e) => onLayoutChange("orientation", e.target.value)}>
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </label>
        <label>
          Columnas
          <input type="number" min="1" step="1" value={layout.columns} onChange={(e) => onLayoutNumberChange("columns", e.target.value)} />
        </label>
        <label>
          Filas
          <input type="number" min="1" step="1" value={layout.rows} onChange={(e) => onLayoutNumberChange("rows", e.target.value)} />
        </label>
        <label>
          Margen izq (mm)
          <input type="number" min="0" step="0.1" value={layout.marginLeftMm} onChange={(e) => onLayoutNumberChange("marginLeftMm", e.target.value)} />
        </label>
        <label>
          Margen der (mm)
          <input type="number" min="0" step="0.1" value={layout.marginRightMm} onChange={(e) => onLayoutNumberChange("marginRightMm", e.target.value)} />
        </label>
        <label>
          Margen sup (mm)
          <input type="number" min="0" step="0.1" value={layout.marginTopMm} onChange={(e) => onLayoutNumberChange("marginTopMm", e.target.value)} />
        </label>
        <label>
          Margen inf (mm)
          <input type="number" min="0" step="0.1" value={layout.marginBottomMm} onChange={(e) => onLayoutNumberChange("marginBottomMm", e.target.value)} />
        </label>
        <label>
          Separacion X (mm)
          <input type="number" min="0" step="0.1" value={layout.gapXmm} onChange={(e) => onLayoutNumberChange("gapXmm", e.target.value)} />
        </label>
        <label>
          Separacion Y (mm)
          <input type="number" min="0" step="0.1" value={layout.gapYmm} onChange={(e) => onLayoutNumberChange("gapYmm", e.target.value)} />
        </label>
      </div>

      {layout.pageSize === "ROLL" && (
        <div className="grid2">
          <label>
            Ancho hoja rollo (mm)
            <input type="number" min="1" step="0.1" value={layout.pageWidthMm} onChange={(e) => onLayoutNumberChange("pageWidthMm", e.target.value)} />
          </label>
          <label>
            Alto hoja rollo (mm)
            <input type="number" min="1" step="0.1" value={layout.pageHeightMm} onChange={(e) => onLayoutNumberChange("pageHeightMm", e.target.value)} />
          </label>
        </div>
      )}

      <div className="section-head">
        <h3>Editor de campos</h3>
        <button className="btn btn-ghost" type="button" onClick={onResetFields}>
          Restaurar campos
        </button>
      </div>

      <div className="grid3">
        {TOGGLE_FIELDS.map((field) => (
          <FieldToggle
            key={field.key}
            label={field.label}
            checked={fields[field.key]}
            onChange={(value) => onFieldToggleChange(field.key, value)}
          />
        ))}
      </div>

      <div className="grid2">
        <label>
          Fuente texto
          <input type="number" min="6" max="72" step="1" value={fields.textFontSize} onChange={(e) => onFieldNumberChange("textFontSize", e.target.value)} />
        </label>
        <label>
          Fuente precio
          <input type="number" min="8" max="96" step="1" value={fields.priceFontSize} onChange={(e) => onFieldNumberChange("priceFontSize", e.target.value)} />
        </label>
      </div>

      <h3>Layout de campos (mm dentro de la etiqueta)</h3>
      <p className="muted">Tambien puedes arrastrar campos desde la vista previa.</p>
      <div className="position-grid">
        <div className="position-header">Campo</div>
        <div className="position-header">X</div>
        <div className="position-header">Y</div>
        <div className="position-header">Ancho</div>
        <div className="position-header">Alto</div>
        {POSITION_FIELDS.map((field) => (
          <Fragment key={field.key}>
            <div className="position-label">{field.label}</div>
            <input type="number" min="0" step="0.1" value={fields.positions?.[field.key]?.xMm ?? 0} onChange={(e) => onPositionChange(field.key, "xMm", e.target.value)} />
            <input type="number" min="0" step="0.1" value={fields.positions?.[field.key]?.yMm ?? 0} onChange={(e) => onPositionChange(field.key, "yMm", e.target.value)} />
            <input type="number" min="0" step="0.1" value={fields.positions?.[field.key]?.widthMm ?? 0} onChange={(e) => onPositionChange(field.key, "widthMm", e.target.value)} />
            <input type="number" min="0" step="0.1" value={fields.positions?.[field.key]?.heightMm ?? 0} onChange={(e) => onPositionChange(field.key, "heightMm", e.target.value)} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
