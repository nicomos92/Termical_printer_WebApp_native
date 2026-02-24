export default function TemplateSelector({ templates, templateKey, onChange }) {
  return (
    <div className="panel">
      <h3>Plantilla</h3>
      <select value={templateKey} onChange={(e) => onChange(e.target.value)}>
        {templates.map((template) => (
          <option key={template.key} value={template.key}>
            {template.name}
          </option>
        ))}
      </select>
    </div>
  );
}
