import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  erpBaseUrl: process.env.ERP_BASE_URL || "",
  erpBearerToken: process.env.ERP_BEARER_TOKEN || "",
  erpProductsPath: process.env.ERP_PRODUCTS_PATH || "/api/products",
  useMockErp: String(process.env.USE_MOCK_ERP || "false").toLowerCase() === "true",
  dbPath: process.env.DB_PATH || "./storage/labels.db",
  pdfAuthor: process.env.PDF_AUTHOR || "Termical_printer_webApp"
};
