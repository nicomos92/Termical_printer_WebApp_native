import { useMemo, useState } from "react";

function parseBarcodes(text) {
  return text
    .split(/[\s,;]+/)
    .map((code) => code.trim())
    .filter(Boolean);
}

export default function ProductLoader({ onLoadOne, onLoadBulk, onUploadCsv, loading }) {
  const [barcode, setBarcode] = useState("");
  const [bulkText, setBulkText] = useState("");
  const bulkCodes = useMemo(() => parseBarcodes(bulkText), [bulkText]);

  function handleAdd() {
    const normalized = barcode.trim();
    if (!normalized) return;
    onLoadOne(normalized);
    setBarcode("");
  }

  function handleBulk() {
    if (!bulkCodes.length) return;
    onLoadBulk(bulkCodes);
  }

  return (
    <div className="panel">
      <div className="section-head">
        <h3>Carga de productos</h3>
        <span className="muted">Paso 1</span>
      </div>
      <p className="muted">Ingresa un codigo de barras y agrega a la lista.</p>

      <div className="row">
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleAdd();
          }}
          placeholder="Codigo de barras"
          inputMode="numeric"
        />
        <button className="btn btn-primary" disabled={loading || !barcode.trim()} onClick={handleAdd}>
          Agregar
        </button>
      </div>

      <details className="inline-collapse">
        <summary>Carga avanzada (masiva y CSV)</summary>
        <div className="inline-collapse-body">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Codigos separados por coma, espacio o salto de linea"
            rows={5}
          />
          <div className="row">
            <button className="btn" disabled={loading || !bulkCodes.length} onClick={handleBulk}>
              Carga masiva
            </button>
            <span className="muted">{bulkCodes.length} codigo(s) detectado(s)</span>
          </div>

          <label className="upload">
            CSV masivo
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                onUploadCsv(file);
                e.target.value = "";
              }}
            />
          </label>
          <p className="muted upload-tip">Archivo esperado: una columna con barcode por fila.</p>
          <button className="btn btn-ghost" disabled={loading || !bulkText.trim()} onClick={() => setBulkText("")}>
            Limpiar lote
          </button>
        </div>
      </details>
    </div>
  );
}
