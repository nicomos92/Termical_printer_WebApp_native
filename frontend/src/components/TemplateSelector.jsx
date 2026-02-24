export default function TemplateSelector({ templates, templateKey, onChange }) {
  const selected = templates.find((template) => template.key === templateKey);

  return (
    <div className="panel">
      <div className="section-head">
        <h3>Plantilla</h3>
        <span className="muted">{selected?.name || "Sin seleccion"}</span>
      </div>

      {!templates.length && <p className="muted">Cargando plantillas...</p>}

      <select value={templateKey} onChange={(e) => onChange(e.target.value)} disabled={!templates.length}>
        {templates.map((template) => (
          <option key={template.key} value={template.key}>
            {template.name}
          </option>
        ))}
      </select>
    </div>
  );
}
