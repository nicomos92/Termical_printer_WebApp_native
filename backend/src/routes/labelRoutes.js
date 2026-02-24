import { Router } from "express";
import { buildLayout } from "../services/layoutEngine.js";
import { buildZpl } from "../generators/zplGenerator.js";
import { buildTspl } from "../generators/tsplGenerator.js";
import { buildPdfBuffer } from "../generators/pdfGenerator.js";

export const labelRouter = Router();

function validatePayload(req, res) {
  const { layout, fields, products } = req.body;

  if (!layout || !fields || !Array.isArray(products) || products.length === 0) {
    res.status(400).json({ message: "layout, fields y products son obligatorios." });
    return null;
  }

  return { layout, fields, products };
}

labelRouter.post("/labels/layout", (req, res) => {
  const payload = validatePayload(req, res);
  if (!payload) return;

  const layout = buildLayout(payload.layout, payload.products);
  return res.json(layout);
});

labelRouter.post("/labels/export/zpl", (req, res) => {
  const payload = validatePayload(req, res);
  if (!payload) return;

  const layout = buildLayout(payload.layout, payload.products);
  const zpl = buildZpl(layout, payload.fields);

  res.setHeader("Content-Type", "text/plain");
  res.send(zpl);
});

labelRouter.post("/labels/export/tspl", (req, res) => {
  const payload = validatePayload(req, res);
  if (!payload) return;

  const layout = buildLayout(payload.layout, payload.products);
  const tspl = buildTspl(layout, payload.fields);

  res.setHeader("Content-Type", "text/plain");
  res.send(tspl);
});

labelRouter.post("/labels/export/pdf", async (req, res) => {
  const payload = validatePayload(req, res);
  if (!payload) return;

  try {
    const layout = buildLayout(payload.layout, payload.products);
    const pdfBuffer = await buildPdfBuffer(layout, payload.fields);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=etiquetas.pdf");

    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({ message: "Error generando PDF", detail: error.message });
  }
});
