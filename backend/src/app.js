import express from "express";
import cors from "cors";
import { configRouter } from "./routes/configRoutes.js";
import { productRouter } from "./routes/productRoutes.js";
import { labelRouter } from "./routes/labelRoutes.js";
import { mockErpRouter } from "./routes/mockErpRoutes.js";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "3mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "termical-printer-webapp-backend" });
});

app.use("/mock-erp", mockErpRouter);
app.use("/api", configRouter);
app.use("/api", productRouter);
app.use("/api", labelRouter);
