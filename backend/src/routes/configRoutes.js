import { Router } from "express";
import { db } from "../db/database.js";
import { templates } from "../services/templateService.js";

export const configRouter = Router();

configRouter.get("/templates", (req, res) => {
  res.json(Object.values(templates));
});

configRouter.get("/configs", (req, res) => {
  const rows = db.prepare("SELECT * FROM label_configs ORDER BY updated_at DESC").all();
  const payload = rows.map((row) => ({
    ...row,
    layout: JSON.parse(row.layout_json),
    fields: JSON.parse(row.fields_json)
  }));

  res.json(payload);
});

configRouter.post("/configs", (req, res) => {
  const { name, layout, fields, templateKey } = req.body;

  if (!name || !layout || !fields) {
    return res.status(400).json({ message: "name, layout y fields son requeridos." });
  }

  const stmt = db.prepare(`
    INSERT INTO label_configs (name, layout_json, fields_json, template_key)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(name, JSON.stringify(layout), JSON.stringify(fields), templateKey || "basic");
  const config = db.prepare("SELECT * FROM label_configs WHERE id = ?").get(result.lastInsertRowid);

  return res.status(201).json({
    ...config,
    layout: JSON.parse(config.layout_json),
    fields: JSON.parse(config.fields_json)
  });
});
