import { Router } from "express";
import multer from "multer";
import { fetchProductByBarcode, fetchProductsByBarcodes } from "../services/erpClient.js";
import { parseCsvBarcodes } from "../utils/csvParser.js";

const upload = multer({ storage: multer.memoryStorage() });

export const productRouter = Router();

productRouter.get("/products/:barcode", async (req, res) => {
  try {
    const product = await fetchProductByBarcode(req.params.barcode);
    return res.json(product);
  } catch (error) {
    return res.status(502).json({ message: "Error consumiendo ERP", detail: error.message });
  }
});

productRouter.post("/products/bulk", async (req, res) => {
  const barcodes = req.body?.barcodes;

  if (!Array.isArray(barcodes) || barcodes.length === 0) {
    return res.status(400).json({ message: "Debe enviar barcodes como arreglo no vacio." });
  }

  try {
    const response = await fetchProductsByBarcodes(barcodes);
    return res.json(response);
  } catch (error) {
    return res.status(502).json({ message: "Error en carga masiva", detail: error.message });
  }
});

productRouter.post("/products/csv", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Debe adjuntar archivo CSV en campo file." });
  }

  const barcodes = parseCsvBarcodes(req.file.buffer.toString("utf8"));

  if (barcodes.length === 0) {
    return res.status(400).json({ message: "CSV sin codigos de barra validos." });
  }

  try {
    const response = await fetchProductsByBarcodes(barcodes);
    return res.json(response);
  } catch (error) {
    return res.status(502).json({ message: "Error procesando CSV", detail: error.message });
  }
});
