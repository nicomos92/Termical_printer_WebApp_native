import { useEffect, useMemo, useState } from "react";
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

export default function App() {
  const [templates, setTemplates] = useState([]);
  const [templateKey, setTemplateKey] = useState("basic");
  const [layout, setLayout] = useState(defaultLayout);
  const [fields, setFields] = useState({
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
  });
  const [products, setProducts] = useState([]);
  const [layoutResult, setLayoutResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getTemplates().then((data) => setTemplates(data));
  }, []);

  useEffect(() => {
    const selected = templates.find((template) => template.key === templateKey);
    if (selected) {
      setFields((prev) => mergeFields(prev, selected.fields));
    }
  }, [templateKey, templates]);

  const payload = useMemo(() => ({ layout, fields, products }), [layout, fields, products]);

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
      setLayoutResult(null);
      return;
    }

    const data = await calculateLayout(nextPayload);
    setLayoutResult(data);
  }

  async function handleAdd(barcode) {
    try {
      setLoading(true);
      const product = await getProduct(barcode);
      const next = [...products, product];
      setProducts(next);
      await refreshPreview({ ...payload, products: next });
    } catch (error) {
      setMessage(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBulk(barcodes) {
    try {
      setLoading(true);
      const result = await getProductsBulk(barcodes);
      const next = [...products, ...result.results];
      setProducts(next);
      await refreshPreview({ ...payload, products: next });
      if (result.errors.length) {
        setMessage(`Errores: ${result.errors.length}`);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCsv(file) {
    try {
      setLoading(true);
      const result = await uploadCsv(file);
      const next = [...products, ...result.results];
      setProducts(next);
      await refreshPreview({ ...payload, products: next });
      if (result.errors.length) {
        setMessage(`Errores: ${result.errors.length}`);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleExportPdf() {
    const blob = await exportPdf(payload);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "etiquetas.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async function handleExportText(kind) {
    const content = await exportText(kind, payload);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `etiquetas.${kind}`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async function handleSaveConfig() {
    const name = window.prompt("Nombre de configuracion");
    if (!name) return;

    await saveConfig({
      name,
      layout,
      fields,
      templateKey
    });

    setMessage("Configuracion guardada.");
  }

  return (
    <main>
      <header>
        <h1>Termical Printer WebApp</h1>
        <p>Generacion e impresion de etiquetas de gondola (Zebra, TSC y PDF).</p>
      </header>

      <TemplateSelector templates={templates} templateKey={templateKey} onChange={setTemplateKey} />
      <ConfigForm layout={layout} fields={fields} setLayout={setLayout} setFields={setFields} />
      <ProductLoader onLoadOne={handleAdd} onLoadBulk={handleBulk} onUploadCsv={handleCsv} loading={loading} />

      <div className="actions panel">
        <button onClick={() => refreshPreview()} disabled={loading}>Actualizar vista previa</button>
        <button onClick={handleSaveConfig} disabled={loading}>Guardar configuracion</button>
        <button onClick={handleExportPdf} disabled={loading || !products.length}>Exportar PDF</button>
        <button onClick={() => handleExportText("zpl")} disabled={loading || !products.length}>Exportar ZPL</button>
        <button onClick={() => handleExportText("tspl")} disabled={loading || !products.length}>Exportar TSPL</button>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="panel">
        <h3>Resumen</h3>
        <p>Productos cargados: {products.length}</p>
      </div>

      <LabelPreview
        layoutResult={layoutResult}
        fields={fields}
        onFieldPositionChange={handleFieldPositionDrag}
      />
    </main>
  );
}
