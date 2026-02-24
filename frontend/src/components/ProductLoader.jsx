import { useState } from "react";

export default function ProductLoader({ onLoadOne, onLoadBulk, onUploadCsv, loading }) {
  const [barcode, setBarcode] = useState("");
  const [bulkText, setBulkText] = useState("");

  return (
    <div className="panel">
      <h3>Productos</h3>
      <div className="row">
        <input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Codigo de barras" />
        <button disabled={loading || !barcode} onClick={() => onLoadOne(barcode)}>Agregar</button>
      </div>

      <textarea
        value={bulkText}
        onChange={(e) => setBulkText(e.target.value)}
        placeholder="Codigos separados por coma, espacio o salto de linea"
        rows={4}
      />
      <button
        disabled={loading || !bulkText.trim()}
        onClick={() => onLoadBulk(bulkText.split(/[\s,;]+/).filter(Boolean))}
      >
        Carga masiva
      </button>

      <label className="upload">
        CSV masivo
        <input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && onUploadCsv(e.target.files[0])} />
      </label>
    </div>
  );
}
