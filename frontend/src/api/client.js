import axios from "axios";

const api = axios.create({
  baseURL: "/api"
});

export async function getTemplates() {
  const { data } = await api.get("/templates");
  return data;
}

export async function getProduct(barcode) {
  const { data } = await api.get(`/products/${encodeURIComponent(barcode)}`);
  return data;
}

export async function getProductsBulk(barcodes) {
  const { data } = await api.post("/products/bulk", { barcodes });
  return data;
}

export async function uploadCsv(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/products/csv", form);
  return data;
}

export async function saveConfig(payload) {
  const { data } = await api.post("/configs", payload);
  return data;
}

export async function calculateLayout(payload) {
  const { data } = await api.post("/labels/layout", payload);
  return data;
}

export async function exportPdf(payload) {
  const response = await api.post("/labels/export/pdf", payload, { responseType: "blob" });
  return response.data;
}

export async function exportText(kind, payload) {
  const { data } = await api.post(`/labels/export/${kind}`, payload);
  return data;
}
