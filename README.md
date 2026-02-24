# Termical_printer_webApp

Aplicacion web completa para generacion e impresion de etiquetas de gondola integrada a ERP via API REST.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Base de datos: SQLite (better-sqlite3)
- Impresion termica: ZPL (Zebra) y TSPL (TSC)
- Exportacion PDF: PDFKit con medidas exactas en milimetros

## Estructura del proyecto

```text
Termical_printer_webApp/
  backend/
    src/
      config/           # Variables de entorno
      db/               # Conexion y migraciones SQLite
      routes/           # Endpoints REST
      services/         # ERP client, layout engine, templates
      generators/       # ZPL, TSPL, PDF
      utils/            # Conversores mm/px y parser CSV
    storage/            # labels.db
    package.json
  frontend/
    src/
      api/              # Cliente HTTP
      components/       # ConfigForm, ProductLoader, Preview, etc.
      App.jsx
      styles.css
    package.json
  .env.example
  package.json
```

## Funcionalidades implementadas
- Configuracion completa de etiqueta y hoja:
  - ancho/alto etiqueta en mm
  - A4, A5 o rollo personalizado
  - filas/columnas
  - margenes y separaciones
  - orientacion vertical/horizontal
- Vista previa dinamica de etiquetas.
- Editor visual de campos:
  - descripcion
  - codigo de producto
  - precio y precio promocional
  - unidad y vigencia
  - codigo de barras grafico
  - tamano de fuentes
  - posicion de campos por coordenadas X/Y + ancho/alto en mm
  - reposicionamiento visual por drag and drop en la vista previa
- Plantillas predefinidas (`basic`, `compact`, `promo`).
- Guardado de configuraciones en SQLite.
- Integracion ERP configurable:
  - URL base por `.env`
  - Bearer token
  - endpoint configurable (`ERP_PRODUCTS_PATH`)
  - carga por barcode individual
  - carga masiva por lista
  - carga masiva por CSV
- Modo ERP simulado (`USE_MOCK_ERP=true`):
  - endpoint mock local `GET /mock-erp/products/:barcode`
  - catalogo mock `GET /mock-erp/products`
- Motor de layout:
  - calculo automatico de posiciones X/Y
  - soporte multiproducto
  - paginacion automatica
  - deteccion de overflow por etiqueta
- Salidas de impresion/exportacion:
  - `POST /api/labels/export/zpl`
  - `POST /api/labels/export/tspl`
  - `POST /api/labels/export/pdf`

## Endpoints principales
- `GET /api/health`
- `GET /api/templates`
- `GET /api/configs`
- `POST /api/configs`
- `GET /api/products/:barcode`
- `POST /api/products/bulk`
- `POST /api/products/csv`
- `POST /api/labels/layout`
- `POST /api/labels/export/zpl`
- `POST /api/labels/export/tspl`
- `POST /api/labels/export/pdf`
- `GET /mock-erp/products`
- `GET /mock-erp/products/:barcode`

## Ejecutar localmente

### 1) Configurar variables de entorno
Copiar `.env.example` a `backend/.env`.

Para trabajar con ERP simulado:

```bash
PORT=4000
USE_MOCK_ERP=true
ERP_BASE_URL=http://localhost:8080
ERP_PRODUCTS_PATH=/api/products
ERP_BEARER_TOKEN=your_token_here
DB_PATH=./storage/labels.db
PDF_AUTHOR=Termical_printer_webApp
```

Notas:
- Con `USE_MOCK_ERP=true`, la app usa datos simulados y no llama al ERP real.
- Con `USE_MOCK_ERP=false`, usa `ERP_BASE_URL + ERP_PRODUCTS_PATH`.

### 2) Instalar dependencias
Desde la raiz del proyecto:

```bash
npm run install:all
```

### 3) Levantar backend
```bash
npm run dev:backend
```

### 4) Levantar frontend
En otra terminal:

```bash
npm run dev:frontend
```

### 5) Abrir aplicacion
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Barcodes mock de prueba
Podes cargar estos codigos en la UI:

```text
7791234567001
7791234567002
7791234567003
7791234567004
7791234567005
```

Si ingresas otro barcode, el mock genera un producto automatico para ese codigo.

## Notas de impresion
- ZPL/TSPL se exportan como texto listo para enviar a spooler o middleware de impresora.
- PDF se genera con tamano de pagina y etiquetas en milimetros convertidos a puntos (`mm -> pt`) para mantener precision.

## Escalabilidad sugerida
- Agregar cola de trabajos de impresion (BullMQ/RabbitMQ) para alto volumen.
- Integrar autenticacion de usuarios (JWT + roles).
- Agregar versionado de plantillas y editor drag-and-drop.
- Incorporar pruebas unitarias/integracion (Vitest/Jest + Supertest).

