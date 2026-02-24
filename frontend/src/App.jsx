import { useEffect, useMemo, useRef, useState } from "react";
import ConfigForm from "./components/ConfigForm.jsx";
import ProductLoader from "./components/ProductLoader.jsx";
import LabelPreview from "./components/LabelPreview.jsx";
import TemplateSelector from "./components/TemplateSelector.jsx";
import { calculateLayout, exportPdf, exportText, getProduct, getProductsBulk, getTemplates, saveConfig, uploadCsv } from "./api/client";

const defaultLayout = {
  labelWidthMm: 50,
  labelHeightMm: 30,
  pageSize: "A4",
  pageWidthMm: 210,
  pageHeightMm: 297,
  columns: 3,
  rows: 8,
  marginTopMm: 6,
  marginLeftMm: 6,
  marginRightMm: 6,
  marginBottomMm: 6,
  gapXmm: 2,
  gapYmm: 2,
  orientation: "vertical"
};

const defaultPositions = {
  description: { xMm: 2, yMm: 2, widthMm: 46, heightMm: 6 },
  productCode: { xMm: 2, yMm: 8.5, widthMm: 28, heightMm: 3 },
  price: { xMm: 2, yMm: 12, widthMm: 26, heightMm: 7 },
  promoPrice: { xMm: 2, yMm: 19.5, widthMm: 28, heightMm: 3 },
  unit: { xMm: 31, yMm: 12, widthMm: 17, heightMm: 3 },
  validUntil: { xMm: 31, yMm: 19.5, widthMm: 17, heightMm: 3 },
  barcode: { xMm: 2, yMm: 23, widthMm: 46, heightMm: 5 }
};

const defaultFields = {
  showBarcode: true,
  showProductCode: true,
  showDescription: true,
  showPrice: true,
  showPromoPrice: true,
  showUnit: true,
  showValidUntil: true,
  textFontSize: 10,
  priceFontSize: 20,
  positions: defaultPositions
};

const PREVIEW_DEBOUNCE_MS = 280;
const NOTICE_TIMEOUT_MS = 4500;

function mergeFields(base, partial) {
  return {
    ...base,
    ...partial,
    positions: {
      ...base.positions,
      ...(partial?.positions || {})
    }
  };
}

function clonePositions(positions) {
  return Object.fromEntries(Object.entries(positions).map(([key, value]) => [key, { ...value }]));
}

function cloneDefaultFields() {
  return {
    ...defaultFields,
    positions: clonePositions(defaultPositions)
  };
}

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "No se pudo completar la operacion.";
}

function barcodeKeyOf(product) {
  return String(product?.barcode || product?.productCode || "");
}

export default function App() {
  const [templates, setTemplates] = useState([]);
  const [templateKey, setTemplateKey] = useState("basic");
  const [layout, setLayout] = useState(() => ({ ...defaultLayout }));
  const [fields, setFields] = useState(cloneDefaultFields);
  const [products, setProducts] = useState([]);
  const [layoutResult, setLayoutResult] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const previewRequestRef = useRef(0);
  const isBusy = loadingProducts || exporting;

  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      try {
        const data = await getTemplates();
        if (cancelled) return;

        setTemplates(data);
        if (data.length && !data.find((template) => template.key === templateKey)) {
          setTemplateKey(data[0].key);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage({ type: "error", text: getErrorMessage(error) });
        }
      }
    }

    void loadTemplates();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const selected = templates.find((template) => template.key === templateKey);
    if (selected) {
      setFields((prev) => mergeFields(prev, selected.fields));
    }
  }, [templateKey, templates]);

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => {
      setMessage(null);
    }, NOTICE_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!isAdvancedOpen) return;

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setIsAdvancedOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAdvancedOpen]);

  const payload = useMemo(() => ({ layout, fields, products }), [layout, fields, products]);
  const duplicateCount = useMemo(() => {
    const seen = new Set();
    let duplicates = 0;

    products.forEach((product) => {
      const key = barcodeKeyOf(product);
      if (!key) return;

      if (seen.has(key)) duplicates += 1;
      else seen.add(key);
    });

    return duplicates;
  }, [products]);
  const listedProducts = useMemo(() => products.slice(0, 18), [products]);

  useEffect(() => {
    if (!products.length) {
      previewRequestRef.current += 1;
      setLayoutResult(null);
      setLoadingPreview(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      void refreshPreview(payload);
    }, PREVIEW_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [payload]);

  function handleFieldPositionDrag(fieldKey, partialPosition) {
    setFields((prev) => ({
      ...prev,
      positions: {
        ...prev.positions,
        [fieldKey]: {
          ...(prev.positions?.[fieldKey] || {}),
          ...partialPosition
        }
      }
    }));
  }

  async function refreshPreview(nextPayload = payload) {
    if (!nextPayload.products.length) {
      previewRequestRef.current += 1;
      setLayoutResult(null);
      setLoadingPreview(false);
      return;
    }

    const requestId = previewRequestRef.current + 1;
    previewRequestRef.current = requestId;
    setLoadingPreview(true);

    try {
      const data = await calculateLayout(nextPayload);
      if (requestId !== previewRequestRef.current) return;
      setLayoutResult(data);
    } catch (error) {
      if (requestId === previewRequestRef.current) {
        setMessage({ type: "error", text: getErrorMessage(error) });
      }
    } finally {
      if (requestId === previewRequestRef.current) {
        setLoadingPreview(false);
      }
    }
  }

  function notify(type, text) {
    setMessage({ type, text });
  }

  async function handleAdd(barcode) {
    const normalizedBarcode = String(barcode || "").trim();
    if (!normalizedBarcode) {
      notify("warning", "Ingresa un codigo de barras valido.");
      return;
    }

    try {
      setLoadingProducts(true);
      const product = await getProduct(normalizedBarcode);
      setProducts((prev) => [...prev, product]);
      notify("success", `Producto ${product.productCode || normalizedBarcode} agregado.`);
    } catch (error) {
      notify("error", getErrorMessage(error));
    } finally {
      setLoadingProducts(false);
    }
  }

  async function handleBulk(barcodes) {
    const normalized = barcodes.map((code) => String(code || "").trim()).filter(Boolean);
    if (!normalized.length) {
      notify("warning", "No hay codigos validos para carga masiva.");
      return;
    }

    try {
      setLoadingProducts(true);
      const result = await getProductsBulk(normalized);
      const loaded = result?.results || [];
      const errors = result?.errors || [];

      setProducts((prev) => [...prev, ...loaded]);

      if (errors.length) {
        notify("warning", `Carga completada: ${loaded.length} ok, ${errors.length} con error.`);
      } else {
        notify("success", `Carga masiva completada: ${loaded.length} productos.`);
      }
    } catch (error) {
      notify("error", getErrorMessage(error));
    } finally {
      setLoadingProducts(false);
    }
  }

  async function handleCsv(file) {
    try {
      setLoadingProducts(true);
      const result = await uploadCsv(file);
      const loaded = result?.results || [];
      const errors = result?.errors || [];
      setProducts((prev) => [...prev, ...loaded]);

      if (errors.length) {
        notify("warning", `CSV procesado: ${loaded.length} ok, ${errors.length} con error.`);
      } else {
        notify("success", `CSV procesado: ${loaded.length} productos cargados.`);
      }
    } catch (error) {
      notify("error", getErrorMessage(error));
    } finally {
      setLoadingProducts(false);
    }
  }

  async function handleExportPdf() {
    if (!products.length) {
      notify("warning", "No hay productos para exportar.");
      return;
    }

    try {
      setExporting(true);
      const blob = await exportPdf(payload);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "etiquetas.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
      notify("success", "PDF exportado correctamente.");
    } catch (error) {
      notify("error", getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  }

  async function handleExportText(kind) {
    if (!products.length) {
      notify("warning", "No hay productos para exportar.");
      return;
    }

    try {
      setExporting(true);
      const content = await exportText(kind, payload);
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `etiquetas.${kind}`;
      a.click();
      window.URL.revokeObjectURL(url);
      notify("success", `${kind.toUpperCase()} exportado correctamente.`);
    } catch (error) {
      notify("error", getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  }

  async function handleSaveConfig() {
    const name = window.prompt("Nombre de configuracion");
    if (!name?.trim()) return;

    try {
      await saveConfig({
        name: name.trim(),
        layout,
        fields,
        templateKey
      });
      notify("success", "Configuracion guardada.");
    } catch (error) {
      notify("error", getErrorMessage(error));
    }
  }

  function handleRemoveProduct(index) {
    setProducts((prev) => prev.filter((_, productIndex) => productIndex !== index));
  }

  function handleClearProducts() {
    setProducts([]);
    setLayoutResult(null);
    notify("success", "Lista de productos limpiada.");
  }

  function handleResetLayout() {
    setLayout({ ...defaultLayout });
    notify("success", "Se restauraron los valores sugeridos del layout.");
  }

  function handleResetFields() {
    const selected = templates.find((template) => template.key === templateKey);
    if (selected) {
      setFields((prev) => mergeFields(cloneDefaultFields(), selected.fields || prev));
    } else {
      setFields(cloneDefaultFields());
    }
    notify("success", "Se restauraron los valores de campos.");
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Termical Printer WebApp</h1>
        <p>Carga productos, valida la vista previa y exporta etiquetas en segundos.</p>
        <div className="status-row">
          <span className="status-pill">Plantilla: {templateKey}</span>
          <span className="status-pill">Productos: {products.length}</span>
          <span className="status-pill">Duplicados: {duplicateCount}</span>
          <span className="status-pill">Vista previa: {loadingPreview ? "actualizando" : "lista"}</span>
        </div>
      </header>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <section className="split-layout">
        <div className="form-pane">
          <section className="single-flow">
            <ProductLoader onLoadOne={handleAdd} onLoadBulk={handleBulk} onUploadCsv={handleCsv} loading={loadingProducts} />

            <div className="actions panel">
              <button className="btn btn-primary" onClick={() => refreshPreview()} disabled={!products.length || loadingPreview}>
                Actualizar vista previa
              </button>
              <button className="btn" onClick={handleExportPdf} disabled={isBusy || !products.length}>
                {exporting ? "Exportando..." : "Exportar PDF"}
              </button>
              <button className="btn" onClick={() => handleExportText("zpl")} disabled={isBusy || !products.length}>
                Exportar ZPL
              </button>
              <button className="btn" onClick={() => handleExportText("tspl")} disabled={isBusy || !products.length}>
                Exportar TSPL
              </button>
              <button className="btn" onClick={handleSaveConfig} disabled={isBusy}>
                Guardar configuracion
              </button>
              <button className="btn btn-ghost" onClick={() => setIsAdvancedOpen(true)}>
                Configuracion avanzada
              </button>
            </div>

            <details className="panel collapsible-panel">
              <summary>
                Productos cargados
                <span className="summary-meta">{products.length}</span>
              </summary>
              <div className="collapsible-body">
                <div className="section-head">
                  <p className="muted">Detalle de productos en esta sesion.</p>
                  <button className="btn btn-ghost" onClick={handleClearProducts} disabled={!products.length || isBusy}>
                    Limpiar
                  </button>
                </div>
                {!!duplicateCount && <p className="muted warning-text">Hay {duplicateCount} codigo(s) repetido(s) en la lista.</p>}
                {!products.length && <p className="muted">Aun no cargaste productos.</p>}
                {!!products.length && (
                  <>
                    <ul className="product-list">
                      {listedProducts.map((product, index) => (
                        <li key={`${product.barcode || product.productCode || "item"}-${index}`}>
                          <div>
                            <strong>{product.description || "Sin descripcion"}</strong>
                            <span>Cod: {product.productCode || "-"}</span>
                            <span>Barcode: {product.barcode || "-"}</span>
                          </div>
                          <button className="btn btn-danger" onClick={() => handleRemoveProduct(index)} disabled={isBusy}>
                            Quitar
                          </button>
                        </li>
                      ))}
                    </ul>
                    {products.length > listedProducts.length && (
                      <p className="muted">Mostrando {listedProducts.length} de {products.length} productos.</p>
                    )}
                  </>
                )}
              </div>
            </details>

          </section>
        </div>

        <div className="preview-pane">
          <LabelPreview
            layoutResult={layoutResult}
            fields={fields}
            onFieldPositionChange={handleFieldPositionDrag}
            isLoading={loadingPreview}
          />
        </div>
      </section>

      {isAdvancedOpen && (
        <button className="drawer-backdrop" onClick={() => setIsAdvancedOpen(false)} aria-label="Cerrar configuracion avanzada" />
      )}
      <aside className={`side-drawer ${isAdvancedOpen ? "open" : ""}`} aria-hidden={!isAdvancedOpen}>
        <div className="side-drawer-head">
          <h3>Configuracion avanzada</h3>
          <button className="btn" onClick={() => setIsAdvancedOpen(false)}>
            Cerrar
          </button>
        </div>
        <div className="side-drawer-body">
          <p className="muted">Ajusta plantilla, layout o posicion de campos desde este panel lateral.</p>
          <TemplateSelector templates={templates} templateKey={templateKey} onChange={setTemplateKey} />
          <ConfigForm
            layout={layout}
            fields={fields}
            setLayout={setLayout}
            setFields={setFields}
            onResetLayout={handleResetLayout}
            onResetFields={handleResetFields}
          />
        </div>
      </aside>
    </main>
  );
}
