import { useEffect, useRef } from "react";
import Barcode from "react-barcode";

export default function LabelPreview({ layoutResult, fields, onFieldPositionChange, isLoading }) {
  const dragRef = useRef(null);
  const textSize = Math.max(6, Number(fields.textFontSize) || 10);
  const priceSize = Math.max(8, Number(fields.priceFontSize) || 20);
  const baseTextStyle = { fontSize: `${textSize}px`, lineHeight: 1.2 };
  const secondaryTextStyle = { fontSize: `${Math.max(6, textSize - 1)}px`, lineHeight: 1.2 };
  const promoTextStyle = { fontSize: `${Math.max(7, textSize + 1)}px`, lineHeight: 1.2 };
  const priceTextStyle = { fontSize: `${priceSize}px`, lineHeight: 1, fontWeight: 800 };

  useEffect(() => {
    function onMove(event) {
      if (!dragRef.current) return;

      const drag = dragRef.current;
      const deltaXmm = (event.clientX - drag.startClientX) / drag.pxPerMmX;
      const deltaYmm = (event.clientY - drag.startClientY) / drag.pxPerMmY;

      const maxX = Math.max(0, drag.labelWidthMm - drag.boxWidthMm);
      const maxY = Math.max(0, drag.labelHeightMm - drag.boxHeightMm);

      const nextX = round(clamp(drag.startXmm + deltaXmm, 0, maxX));
      const nextY = round(clamp(drag.startYmm + deltaYmm, 0, maxY));

      onFieldPositionChange(drag.fieldKey, { xMm: nextX, yMm: nextY });
    }

    function onUp() {
      dragRef.current = null;
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [onFieldPositionChange]);

  function beginDrag(event, fieldKey, box, labelWidthMm, labelHeightMm) {
    if (!onFieldPositionChange || !box) return;
    if (event.button !== 0) return;

    const labelElement = event.currentTarget.closest(".preview-label");
    if (!labelElement) return;

    const rect = labelElement.getBoundingClientRect();
    const pxPerMmX = rect.width / labelWidthMm;
    const pxPerMmY = rect.height / labelHeightMm;

    dragRef.current = {
      fieldKey,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startXmm: Number(box.xMm) || 0,
      startYmm: Number(box.yMm) || 0,
      boxWidthMm: Number(box.widthMm) || 0,
      boxHeightMm: Number(box.heightMm) || 0,
      labelWidthMm,
      labelHeightMm,
      pxPerMmX,
      pxPerMmY
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  if (!layoutResult?.pages?.length) {
    return (
      <div className="panel preview-panel">
        <div className="section-head">
          <h3>Vista previa dinamica</h3>
          {isLoading && <span className="muted">Actualizando...</span>}
        </div>
        <p className="muted">Cargue productos para visualizar el resultado de layout.</p>
      </div>
    );
  }

  const page = layoutResult.page;
  const positions = fields.positions || {};

  return (
    <div className="panel preview-panel">
      <div className="section-head">
        <h3>Vista previa dinamica</h3>
        <span className="muted">
          {layoutResult.pages.length} pagina(s) {isLoading ? " - actualizando..." : ""}
        </span>
      </div>
      <p className="muted">Arrastre los campos dentro de una etiqueta para reajustar su posicion.</p>
      {layoutResult.pages.map((items, pageIndex) => (
        <div key={pageIndex} className="preview-page" style={{ width: `${page.widthMm}mm`, height: `${page.heightMm}mm` }}>
          <div className="page-badge">Pagina {pageIndex + 1}</div>
          {items.map((item) => (
            <div
              key={`${item.pageIndex}-${item.slot}`}
              className={`preview-label ${item.frameOverflow ? "overflow" : ""}`}
              style={{
                left: `${item.x}mm`,
                top: `${item.y}mm`,
                width: `${item.width}mm`,
                height: `${item.height}mm`
              }}
            >
              {fields.showDescription && (
                <FieldBox
                  fieldKey="description"
                  box={positions.description}
                  item={item}
                  beginDrag={beginDrag}
                >
                  <div className="desc" style={baseTextStyle}>{item.product.description}</div>
                </FieldBox>
              )}
              {fields.showProductCode && (
                <FieldBox
                  fieldKey="productCode"
                  box={positions.productCode}
                  item={item}
                  beginDrag={beginDrag}
                >
                  <div className="small" style={secondaryTextStyle}>Cod: {item.product.productCode}</div>
                </FieldBox>
              )}
              {fields.showPrice && (
                <FieldBox
                  fieldKey="price"
                  box={positions.price}
                  item={item}
                  beginDrag={beginDrag}
                >
                  <div className="price" style={priceTextStyle}>$ {Number(item.product.price).toFixed(2)}</div>
                </FieldBox>
              )}
              {fields.showPromoPrice && item.product.promoPrice != null && (
                <FieldBox
                  fieldKey="promoPrice"
                  box={positions.promoPrice}
                  item={item}
                  beginDrag={beginDrag}
                >
                  <div className="promo" style={promoTextStyle}>Promo: $ {Number(item.product.promoPrice).toFixed(2)}</div>
                </FieldBox>
              )}
              {fields.showUnit && (
                <FieldBox
                  fieldKey="unit"
                  box={positions.unit}
                  item={item}
                  beginDrag={beginDrag}
                >
                  <div className="small" style={secondaryTextStyle}>Unidad: {item.product.unit || ""}</div>
                </FieldBox>
              )}
              {fields.showValidUntil && item.product.validUntil && (
                <FieldBox
                  fieldKey="validUntil"
                  box={positions.validUntil}
                  item={item}
                  beginDrag={beginDrag}
                >
                  <div className="small" style={secondaryTextStyle}>Validez: {item.product.validUntil}</div>
                </FieldBox>
              )}
              {fields.showBarcode && positions.barcode && (
                <FieldBox
                  fieldKey="barcode"
                  box={positions.barcode}
                  item={item}
                  beginDrag={beginDrag}
                >
                  <Barcode
                    value={String(item.product.barcode || "0")}
                    width={1}
                    height={Math.max(16, Number(positions.barcode.heightMm || 4) * 3.2)}
                    fontSize={8}
                    margin={0}
                    displayValue={false}
                  />
                </FieldBox>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function FieldBox({ fieldKey, box, item, beginDrag, children }) {
  if (!box) return null;

  return (
    <div
      className={`field-box ${fieldKey ? "draggable" : ""}`}
      style={{
        left: `${box.xMm}mm`,
        top: `${box.yMm}mm`,
        width: `${box.widthMm}mm`,
        height: `${box.heightMm}mm`
      }}
      onPointerDown={(event) => beginDrag(event, fieldKey, box, item.width, item.height)}
      title="Arrastrar para mover campo"
    >
      {children}
    </div>
  );
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round(value * 100) / 100;
}
