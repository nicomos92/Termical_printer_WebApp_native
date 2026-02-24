import axios from "axios";
import { env } from "../config/env.js";
import { getMockProductByBarcode } from "./mockErpService.js";

function getClient() {
  return axios.create({
    baseURL: env.erpBaseUrl,
    timeout: 10000,
    headers: env.erpBearerToken
      ? { Authorization: `Bearer ${env.erpBearerToken}` }
      : {}
  });
}

export async function fetchProductByBarcode(barcode) {
  if (env.useMockErp) {
    return getMockProductByBarcode(barcode);
  }

  if (!env.erpBaseUrl) {
    throw new Error("ERP_BASE_URL no configurada.");
  }

  const client = getClient();
  const path = `${env.erpProductsPath.replace(/\/$/, "")}/${encodeURIComponent(barcode)}`;
  const { data } = await client.get(path);

  return {
    barcode: data.barcode || barcode,
    productCode: data.productCode || "",
    description: data.description || "",
    price: Number(data.price || 0),
    promoPrice: data.promoPrice != null ? Number(data.promoPrice) : null,
    unit: data.unit || "",
    validUntil: data.validUntil || ""
  };
}

export async function fetchProductsByBarcodes(barcodes) {
  const results = [];
  const errors = [];

  for (const barcode of barcodes) {
    try {
      const product = await fetchProductByBarcode(barcode);
      results.push(product);
    } catch (error) {
      errors.push({ barcode, message: error.message });
    }
  }

  return { results, errors };
}
