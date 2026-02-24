import { Router } from "express";
import { getMockCatalog, getMockProductByBarcode } from "../services/mockErpService.js";

export const mockErpRouter = Router();

mockErpRouter.get("/products", (req, res) => {
  res.json(getMockCatalog());
});

mockErpRouter.get("/products/:barcode", (req, res) => {
  const product = getMockProductByBarcode(req.params.barcode);
  res.json(product);
});
