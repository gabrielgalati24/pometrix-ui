// Type definitions
export interface ExtractedData {
  documentInfo: {
    type: "Factura" | "Remito" | "Tabla"
    number: string
    date: string
    filename: string
  }
  supplier: {
    name: string
    cuit: string
    address: string
    phone?: string
    email?: string
  }
  items: Array<{
    id: string
    description: string
    quantity: number
    unitPrice?: number
    subtotal?: number
  }>
  totals?: {
    subtotal: number
    iva: number
    total: number
  }
  table?: {
    headers: string[]
    rows: Array<Record<string, string | number>>
  }
}

export interface RelatedDocument {
  id: string
  filename: string
  type: string
}

export interface DashboardDocument {
  id: string // Now uses format DOC-1001
  backendId?: number // Backend database ID for API calls
  filename: string
  type: string
  uploadDate: string
  documentDate: string // Added document date field
  status: string
  supplier: string
  total: string
  documentNumber: string
  relatedDocuments: RelatedDocument[]
  uploadedBy?: string // User who uploaded the document
  usedForTraining?: boolean // Whether document was used for training
  logs?: Array<{
    timestamp: string
    message: string
    type: "info" | "success" | "warning" | "error"
  }>
}

export const getMockData = (documentId: string): ExtractedData | null => {
  if (documentId === "3") {
    return {
      documentInfo: {
        type: "Tabla",
        number: "TBL-2024-001",
        date: "2024-01-20",
        filename: "factura_oficina_005.pdf",
      },
      supplier: {
        name: "Oficina Total SA",
        cuit: "30-11111111-1",
        address: "Av. Libertador 5000, CABA, Buenos Aires",
      },
      items: [],
      table: {
        headers: [
          "ID",
          "Fecha",
          "Cliente",
          "Producto",
          "Categoría",
          "Cantidad",
          "Precio Unit.",
          "Subtotal",
          "IVA",
          "Total",
        ],
        rows: [
          {
            ID: "V001",
            Fecha: "2024-01-02",
            Cliente: "Comercial Norte SA",
            Producto: "Notebook HP 15",
            Categoría: "Electrónica",
            Cantidad: 5,
            "Precio Unit.": 450000,
            Subtotal: 2250000,
            IVA: 472500,
            Total: 2722500,
          },
          {
            ID: "V002",
            Fecha: "2024-01-03",
            Cliente: "Distribuidora Sur SRL",
            Producto: "Mouse Logitech M185",
            Categoría: "Accesorios",
            Cantidad: 25,
            "Precio Unit.": 8500,
            Subtotal: 212500,
            IVA: 44625,
            Total: 257125,
          },
          {
            ID: "V003",
            Fecha: "2024-01-05",
            Cliente: "Tech Solutions SA",
            Producto: "Teclado Mecánico RGB",
            Categoría: "Accesorios",
            Cantidad: 10,
            "Precio Unit.": 35000,
            Subtotal: 350000,
            IVA: 73500,
            Total: 423500,
          },
          {
            ID: "V004",
            Fecha: "2024-01-08",
            Cliente: "Oficinas Modernas SRL",
            Producto: "Monitor LG 24 pulgadas",
            Categoría: "Electrónica",
            Cantidad: 8,
            "Precio Unit.": 125000,
            Subtotal: 1000000,
            IVA: 210000,
            Total: 1210000,
          },
          {
            ID: "V005",
            Fecha: "2024-01-10",
            Cliente: "Comercial Norte SA",
            Producto: "Impresora HP LaserJet",
            Categoría: "Electrónica",
            Cantidad: 3,
            "Precio Unit.": 280000,
            Subtotal: 840000,
            IVA: 176400,
            Total: 1016400,
          },
          {
            ID: "V006",
            Fecha: "2024-01-12",
            Cliente: "Distribuidora Centro SA",
            Producto: "Webcam Logitech C920",
            Categoría: "Accesorios",
            Cantidad: 15,
            "Precio Unit.": 45000,
            Subtotal: 675000,
            IVA: 141750,
            Total: 816750,
          },
          {
            ID: "V007",
            Fecha: "2024-01-15",
            Cliente: "Tech Solutions SA",
            Producto: "Disco SSD 1TB Samsung",
            Categoría: "Almacenamiento",
            Cantidad: 20,
            "Precio Unit.": 95000,
            Subtotal: 1900000,
            IVA: 399000,
            Total: 2299000,
          },
          {
            ID: "V008",
            Fecha: "2024-01-18",
            Cliente: "Oficinas Modernas SRL",
            Producto: "Router TP-Link AC1750",
            Categoría: "Redes",
            Cantidad: 12,
            "Precio Unit.": 28000,
            Subtotal: 336000,
            IVA: 70560,
            Total: 406560,
          },
          {
            ID: "V009",
            Fecha: "2024-01-22",
            Cliente: "Comercial Norte SA",
            Producto: "Auriculares Sony WH-1000XM4",
            Categoría: "Audio",
            Cantidad: 6,
            "Precio Unit.": 180000,
            Subtotal: 1080000,
            IVA: 226800,
            Total: 1306800,
          },
          {
            ID: "V010",
            Fecha: "2024-01-25",
            Cliente: "Distribuidora Sur SRL",
            Producto: "Cable HDMI 2.0 - 3m",
            Categoría: "Cables",
            Cantidad: 50,
            "Precio Unit.": 3500,
            Subtotal: 175000,
            IVA: 36750,
            Total: 211750,
          },
        ],
      },
    }
  }

  return null
}

export const getRelatedDocumentData = (docId: string): ExtractedData | null => {
  if (docId === "3a") {
    return {
      documentInfo: {
        type: "Remito",
        number: "RM-2024-005",
        date: "2024-01-11",
        filename: "remito_005.pdf",
      },
      supplier: {
        name: "Oficina Total SA",
        cuit: "30-11111111-1",
        address: "Av. Libertador 5000, CABA, Buenos Aires",
      },
      items: [
        {
          id: "1",
          description: "Notebook HP 15",
          quantity: 5,
        },
        {
          id: "2",
          description: "Mouse Logitech M185",
          quantity: 25,
        },
      ],
    }
  }
  return null
}

// API and Master Data
export const apiData = {
  supplier: {
    id: "SUP-12345",
    name: "Oficina Total SA",
    cuit: "30-11111111-1",
    paymentTerms: "30 días",
    creditLimit: 500000,
    lastUpdate: "2024-01-15 10:30:00",
  },
  accounts: {
    purchases: "1105",
    vat: "1110",
    payables: "2101",
  },
}

export const masterData = [
  { code: "1105", name: "Mercaderías", type: "Activo", category: "Inventario" },
  { code: "1110", name: "IVA Crédito Fiscal", type: "Activo", category: "Impuestos" },
  { code: "2101", name: "Proveedores", type: "Pasivo", category: "Cuentas por Pagar" },
]

export const getAccountingEntry = (documentId: string, data: ExtractedData | null) => {
  return {
    dataSources: {
      mainDocument: data?.documentInfo.filename || "documento.pdf",
      additionalDocuments: documentId === "3" ? ["remito_005.pdf"] : [],
      apiData: "ERP Sistema - Proveedor SUP-12345",
      masterData: "Plan de Cuentas 2024",
    },
    outputTable:
      documentId === "3" && data?.table
        ? {
          headers: [
            "ID",
            "Cód. Cuenta",
            "Nombre Cuenta",
            "Debe",
            "Haber",
            "Centro Costo",
            "Proyecto",
            "Cód. Impuesto",
            "Referencia",
            "Notas",
          ],
          rows: [
            {
              ID: "1",
              "Cód. Cuenta": "1105",
              "Nombre Cuenta": "Mercaderías - Electrónica",
              Debe: 8818000,
              Haber: 0,
              "Centro Costo": "CC-VEN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "IVA-21",
              Referencia: "V001-V010",
              Notas: "Ventas período enero 2024",
            },
            {
              ID: "2",
              "Cód. Cuenta": "1110",
              "Nombre Cuenta": "IVA Débito Fiscal",
              Debe: 1851885,
              Haber: 0,
              "Centro Costo": "CC-VEN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "IVA-21",
              Referencia: "V001-V010",
              Notas: "IVA 21% sobre ventas",
            },
            {
              ID: "3",
              "Cód. Cuenta": "4101",
              "Nombre Cuenta": "Ventas - Electrónica",
              Debe: 0,
              Haber: 5340000,
              "Centro Costo": "CC-VEN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "IVA-21",
              Referencia: "V001,V004,V005",
              Notas: "Notebooks, monitores, impresoras",
            },
            {
              ID: "4",
              "Cód. Cuenta": "4102",
              "Nombre Cuenta": "Ventas - Accesorios",
              Debe: 0,
              Haber: 1237500,
              "Centro Costo": "CC-VEN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "IVA-21",
              Referencia: "V002,V003,V006",
              Notas: "Mouse, teclados, webcams",
            },
            {
              ID: "5",
              "Cód. Cuenta": "4103",
              "Nombre Cuenta": "Ventas - Almacenamiento",
              Debe: 0,
              Haber: 1900000,
              "Centro Costo": "CC-VEN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "IVA-21",
              Referencia: "V007",
              Notas: "Discos SSD Samsung 1TB",
            },
            {
              ID: "6",
              "Cód. Cuenta": "4104",
              "Nombre Cuenta": "Ventas - Redes",
              Debe: 0,
              Haber: 336000,
              "Centro Costo": "CC-VEN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "IVA-21",
              Referencia: "V008",
              Notas: "Routers TP-Link",
            },
            {
              ID: "7",
              "Cód. Cuenta": "4105",
              "Nombre Cuenta": "Ventas - Audio",
              Debe: 0,
              Haber: 1080000,
              "Centro Costo": "CC-VEN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "IVA-21",
              Referencia: "V009",
              Notas: "Auriculares Sony",
            },
            {
              ID: "8",
              "Cód. Cuenta": "4106",
              "Nombre Cuenta": "Ventas - Cables",
              Debe: 0,
              Haber: 175000,
              "Centro Costo": "CC-VEN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "IVA-21",
              Referencia: "V010",
              Notas: "Cables HDMI",
            },
            {
              ID: "9",
              "Cód. Cuenta": "1101",
              "Nombre Cuenta": "Caja y Bancos",
              Debe: 0,
              Haber: 10669885,
              "Centro Costo": "CC-VEN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "",
              Referencia: "V001-V010",
              Notas: "Cobros efectivo y transferencias",
            },
            {
              ID: "10",
              "Cód. Cuenta": "5201",
              "Nombre Cuenta": "Comisiones Vendedores",
              Debe: 440900,
              credit: 0,
              description: "Comisión 5% sobre ventas netas",
              costCenter: "CC-VEN",
              project: "PRJ-2024-Q1",
              taxCode: "",
            },
          ],
        }
        : undefined,
    entries: [
      {
        account: "1105",
        name: "Mercaderías",
        debit: 10000,
        credit: 0,
        description: "Compra de mercadería según factura 0001-00012345",
        costCenter: "CC-001",
        project: "PRJ-2024-001",
        taxCode: "IVA-21",
      },
      {
        account: "1110",
        name: "IVA Crédito Fiscal",
        debit: 2100,
        credit: 0,
        description: "IVA 21% sobre compra",
        costCenter: "CC-001",
        project: "PRJ-2024-001",
        taxCode: "IVA-21",
      },
      {
        account: "1115",
        name: "Percepciones IIBB",
        debit: 150,
        credit: 0,
        description: "Percepción IIBB CABA 1.5%",
        costCenter: "CC-001",
        project: "PRJ-2024-001",
        taxCode: "PERC-IIBB",
      },
      {
        account: "1120",
        name: "Retenciones Ganancias",
        debit: 0,
        credit: 300,
        description: "Retención Ganancias 3%",
        costCenter: "CC-001",
        project: "PRJ-2024-001",
        taxCode: "RET-GAN",
      },
      {
        account: "2101",
        name: "Proveedores",
        debit: 0,
        credit: 11950,
        description: "Proveedor: ACME SA - CUIT 30-12345678-9",
        costCenter: "CC-001",
        project: "PRJ-2024-001",
        taxCode: "",
      },
    ],
  }
}

export const mockDocuments: DashboardDocument[] = [
  {
    id: "DOC-2001",
    backendId: 2001,
    filename: "factura_suministros_ind_4523.pdf",
    type: "Factura",
    uploadDate: "2024-01-20",
    documentDate: "2024-01-18",
    status: "Para confirmar",
    supplier: "Suministros Industriales SA",
    total: "$87,450.00",
    documentNumber: "0001-00004523",
    relatedDocuments: [{ id: "2001a", filename: "remito_1847.pdf", type: "Remito" }],
    uploadedBy: "currentUser",
    usedForTraining: false,
    logs: [
      { timestamp: "2024-01-20 10:30:00", message: "Documento cargado exitosamente", type: "success" },
      { timestamp: "2024-01-20 10:31:15", message: "Procesamiento iniciado", type: "info" },
      { timestamp: "2024-01-20 10:32:45", message: "Extracción de datos completada", type: "success" },
    ],
  },
  {
    id: "DOC-2002",
    backendId: 2002,
    filename: "factura_materiales_const_8901.pdf",
    type: "Factura",
    uploadDate: "2024-01-22",
    documentDate: "2024-01-21",
    status: "Para revisar",
    supplier: "Materiales de Construcción Lopez SRL",
    total: "$145,230.00",
    documentNumber: "0002-00008901",
    relatedDocuments: [
      { id: "2002a", filename: "remito_3421.pdf", type: "Remito" },
      { id: "2002b", filename: "certificado_calidad.pdf", type: "Certificado" },
    ],
    uploadedBy: "user1",
    usedForTraining: true,
    logs: [
      { timestamp: "2024-01-22 14:15:00", message: "Documento cargado exitosamente", type: "success" },
      { timestamp: "2024-01-22 14:16:30", message: "Se detectaron observaciones en el documento", type: "warning" },
    ],
  },
  {
    id: "DOC-2003",
    backendId: 2003,
    filename: "nota_credito_devoluciones_152.pdf",
    type: "Nota de Crédito",
    uploadDate: "2024-01-19",
    documentDate: "2024-01-18",
    status: "Confirmado",
    supplier: "Electrónica Central SA",
    total: "-$23,560.00",
    documentNumber: "NC-00000152",
    relatedDocuments: [{ id: "2003a", filename: "factura_original_7845.pdf", type: "Factura" }],
    uploadedBy: "user2",
    usedForTraining: false,
    logs: [
      { timestamp: "2024-01-19 09:00:00", message: "Documento cargado exitosamente", type: "success" },
      { timestamp: "2024-01-19 09:02:00", message: "Procesado correctamente", type: "success" },
      { timestamp: "2024-01-19 09:05:00", message: "Confirmado por usuario", type: "success" },
    ],
  },
  {
    id: "DOC-2004",
    backendId: 2004,
    filename: "factura_servicios_profesionales_245.pdf",
    type: "Factura",
    uploadDate: "2024-01-21",
    documentDate: "2024-01-20",
    status: "Enviado",
    supplier: "Consultoría Empresarial García y Asoc.",
    total: "$198,000.00",
    documentNumber: "FC-B-00000245",
    relatedDocuments: [],
    uploadedBy: "user3",
    usedForTraining: false,
    logs: [
      { timestamp: "2024-01-21 11:20:00", message: "Documento cargado exitosamente", type: "success" },
      { timestamp: "2024-01-21 11:25:00", message: "Exportado al sistema contable", type: "success" },
    ],
  },
  {
    id: "DOC-2005",
    backendId: 2005,
    filename: "factura_alquiler_equipos_1092.pdf",
    type: "Factura",
    uploadDate: "2024-01-18",
    documentDate: "2024-01-15",
    status: "Rechazado",
    supplier: "Alquileres Técnicos del Sur SA",
    total: "$67,890.00",
    documentNumber: "0005-00001092",
    relatedDocuments: [{ id: "2005a", filename: "contrato_alquiler.pdf", type: "Contrato" }],
    uploadedBy: "currentUser",
    usedForTraining: false,
    logs: [
      { timestamp: "2024-01-18 16:45:00", message: "Documento cargado exitosamente", type: "success" },
      { timestamp: "2024-01-18 16:50:00", message: "Error en validación de datos", type: "error" },
      { timestamp: "2024-01-18 16:55:00", message: "Documento rechazado por usuario", type: "warning" },
    ],
  },
  {
    id: "DOC-2006",
    backendId: 2006,
    filename: "factura_combustible_flota_5632.pdf",
    type: "Factura",
    uploadDate: "2024-01-23",
    documentDate: "2024-01-22",
    status: "Para confirmar",
    supplier: "YPF Comercial SA",
    total: "$312,450.00",
    documentNumber: "0003-00005632",
    relatedDocuments: [
      { id: "2006a", filename: "remito_combustible_5632.pdf", type: "Remito" },
      { id: "2006b", filename: "detalle_carga_por_vehiculo.pdf", type: "Detalle" },
    ],
    uploadedBy: "user1",
    usedForTraining: true,
    logs: [
      { timestamp: "2024-01-23 08:30:00", message: "Documento cargado exitosamente", type: "success" },
      { timestamp: "2024-01-23 08:35:00", message: "Procesamiento completado", type: "success" },
    ],
  },
]

export function getSimpleDocumentData(documentId: string) {
  if (documentId === "DOC-2001") {
    return {
      mainDocument: {
        documentInfo: {
          type: "Factura",
          number: "0001-00004523",
          date: "18/01/2024",
          filename: "factura_compra_4523.pdf",
        },
        supplier: {
          name: "Suministros Industriales SA",
          cuit: "30-68745291-4",
          address: "Av. Warnes 2450, CABA, Buenos Aires",
          phone: "+54 11 4856-7890",
          email: "ventas@suministros.com.ar",
        },
        datosGenerales: {
          proveedor: "Suministros Industriales SA",
          numeroFactura: "0001-00004523",
          fecha: "18/01/2024",
          total: "$87,450.00",
        },
        extractedData: {
          headers: ["Código", "Descripción", "Cantidad", "P. Unitario", "Subtotal", "IVA 21%", "Total"],
          rows: [
            ["A-1001", "Tornillos M8 x 50mm", "500", "$25.00", "$12,500.00", "$2,625.00", "$15,125.00"],
            ["B-2034", "Tuercas hexagonales M8", "500", "$18.00", "$9,000.00", "$1,890.00", "$10,890.00"],
            ["C-3045", "Arandelas planas M8", "1000", "$8.50", "$8,500.00", "$1,785.00", "$10,285.00"],
            ["D-4012", "Pernos estructurales M10", "250", "$45.00", "$11,250.00", "$2,362.50", "$13,612.50"],
            ["E-5067", 'Grampas tipo U 3/4"', "200", "$32.00", "$6,400.00", "$1,344.00", "$7,744.00"],
            ["F-6089", 'Abrazaderas metálicas 2"', "150", "$55.00", "$8,250.00", "$1,732.50", "$9,982.50"],
            ["G-7021", "Bulones DIN 933 M12", "180", "$68.00", "$12,240.00", "$2,570.40", "$14,810.40"],
            ["H-8034", 'Clavos de acero 4"', "300", "$15.50", "$4,650.00", "$976.50", "$5,626.50"],
          ],
        },
        outputData: {
          headers: ["Línea", "Cód. Cuenta", "Nombre Cuenta", "Debe", "Haber", "Centro Costo", "Referencia"],
          rows: [
            ["1", "1105-001", "Insumos - Tornillería", "$50,000.00", "$0.00", "CC-PROD", "FC-4523"],
            ["2", "1105-002", "Insumos - Pernería", "$11,250.00", "$0.00", "CC-CONST", "FC-4523"],
            ["3", "1105-003", "Insumos - Sujeción", "$14,650.00", "$0.00", "CC-MANT", "FC-4523"],
            ["4", "1105-004", "Insumos - Bulonería", "$4,650.00", "$0.00", "CC-PROD", "FC-4523"],
            ["5", "1110-001", "IVA Crédito Fiscal 21%", "$16,815.00", "$0.00", "CC-ADM", "FC-4523-IVA"],
            ["6", "2101-003", "Proveedores - Suministros Ind.", "$0.00", "$97,365.00", "CC-ADM", "PRV-68745291"],
          ],
        },
        aiReasoning: {
          summary:
            "Se identificó la factura como documento de compra de insumos industriales. El asistente extrajo los datos de líneas de productos y calculó el asiento contable correspondiente aplicando cuentas contables según el plan de cuentas vigente.",
          steps: [
            "1. Extracción de datos: Se identificaron 8 líneas de productos con códigos, descripciones, cantidades y precios",
            "2. Clasificación de productos: Se agruparon insumos en categorías (tornillería, pernería, sujeción, bulonería)",
            "3. Cálculo de IVA: Se calculó el crédito fiscal del 21% sobre el total de la compra",
            "4. Asignación de cuentas: Se aplicaron las cuentas contables del plan 2024 según tipo de insumo",
            "5. Asignación de centros de costo: Se distribuyeron los gastos entre CC-PROD, CC-CONST y CC-MANT",
            "6. Generación de asiento: Se creó el asiento balanceado con debe = haber",
          ],
          confidence: 92,
          dataQuality: "Alta - Todos los campos requeridos fueron extraídos correctamente",
        },
      },
      relatedDocument: {
        documentInfo: {
          type: "Remito",
          number: "R-2024-1847",
          date: "17/01/2024",
          filename: "remito_1847.pdf",
        },
        supplier: {
          name: "Suministros Industriales SA",
          cuit: "30-68745291-4",
          address: "Av. Warnes 2450, CABA, Buenos Aires",
        },
        datosGenerales: {
          proveedor: "Suministros Industriales SA",
          numeroRemito: "R-2024-1847",
          fecha: "17/01/2024",
          totalBultos: "8 bultos",
        },
        extractedData: {
          headers: ["Código", "Descripción", "Cantidad", "Unidad", "Lote", "Observaciones"],
          rows: [
            ["A-1001", "Tornillos M8 x 50mm", "500", "Unidades", "LT-2401-15", "Caja sellada"],
            ["B-2034", "Tuercas hexagonales M8", "500", "Unidades", "LT-2401-15", "Caja sellada"],
            ["C-3045", "Arandelas planas M8", "1000", "Unidades", "LT-2401-16", "2 cajas"],
            ["D-4012", "Pernos estructurales M10", "250", "Unidades", "LT-2401-17", "Embalaje reforzado"],
            ["E-5067", 'Grampas tipo U 3/4"', "200", "Unidades", "LT-2401-18", ""],
            ["F-6089", 'Abrazaderas metálicas 2"', "150", "Unidades", "LT-2401-18", ""],
            ["G-7021", "Bulones DIN 933 M12", "180", "Unidades", "LT-2401-19", "Certificado incluido"],
            ["H-8034", 'Clavos de acero 4"', "300", "Unidades", "LT-2401-20", "Caja de 300 unid."],
          ],
        },
        outputData: {
          headers: ["Línea", "Cód. Stock", "Descripción", "Cantidad", "Lote", "Ubicación", "Estado"],
          rows: [
            ["1", "A-1001", "Tornillos M8 x 50mm", "500", "LT-2401-15", "A-12-05", "Recibido"],
            ["2", "B-2034", "Tuercas hexagonales M8", "500", "LT-2401-15", "A-12-06", "Recibido"],
            ["3", "C-3045", "Arandelas planas M8", "1000", "LT-2401-16", "A-13-02", "Recibido"],
            ["4", "D-4012", "Pernos estructurales M10", "250", "LT-2401-17", "B-05-08", "Recibido"],
            ["5", "E-5067", 'Grampas tipo U 3/4"', "200", "LT-2401-18", "B-06-03", "Recibido"],
            ["6", "F-6089", 'Abrazaderas metálicas 2"', "150", "Unidades", "LT-2401-18", "B-06-04", "Recibido"],
            ["7", "G-7021", "Bulones DIN 933 M12", "180", "Unidades", "LT-2401-19", "B-07-01", "Recibido"],
            ["8", "H-8034", 'Clavos de acero 4"', "300", "Unidades", "LT-2401-20", "C-02-15", "Recibido"],
          ],
        },
        aiReasoning: {
          summary: "Se procesó el remito de entrega verificando quantities, lotes y ubicaciones de almacén. El asistente generó los registros de control de stock correspondientes.",
          steps: [
            "1. Identificación del remito: Se detectó documento tipo remito con número R-2024-1847",
            "2. Extracción de productos: Se identificaron 8 líneas con códigos, cantidades y lotes",
            "3. Validación de cantidades: Se verificó que las cantidades coincidan con la factura",
            "4. Asignación de ubicaciones: Se determinaron las ubicaciones de almacén según disponibilidad",
            "5. Registro de lotes: Se registraron los números de lote para trazabilidad",
            "6. Actualización de stock: Se preparó la actualización del inventario",
          ],
          confidence: 95,
          dataQuality: "Muy Alta - Coincidencia 100% con factura asociada",
        },
      },
      consolidatedResult: {
        dataSources: {
          mainDocument: "factura_compra_4523.pdf",
          relatedDocuments: ["remito_1847.pdf"],
          apiData: "ERP Sistema - Proveedor PRV-68745291",
          masterData: "Plan de Cuentas 2024 - Versión 3.2",
        },
        datosGenerales: {
          documento: "Asiento Contable - Compra",
          estado: "Listo para enviar",
          totalDebe: "$101,545.90",
          totalHaber: "$101,545.90",
        },
        outputData: {
          headers: [
            "Línea",
            "Cód. Cuenta",
            "Nombre Cuenta",
            "Debe",
            "Haber",
            "Centro Costo",
            "Proyecto",
            "Cód. Fiscal",
            "Referencia",
          ],
          rows: [
            [
              "1",
              "1105-001",
              "Insumos - Tornillería",
              "$29,500.00",
              "$0.00",
              "CC-PROD",
              "PRY-2024-01",
              "IVA-21",
              "FC-4523-L1-L2",
            ],
            [
              "2",
              "1105-001",
              "Insumos - Tornillería",
              "$8,500.00",
              "$0.00",
              "CC-PROD",
              "PRY-2024-01",
              "IVA-21",
              "FC-4523-L3",
            ],
            [
              "3",
              "1105-002",
              "Insumos - Pernería Estructural",
              "$11,250.00",
              "$0.00",
              "CC-CONST",
              "PRY-2024-02",
              "IVA-21",
              "FC-4523-L4",
            ],
            [
              "4",
              "1105-003",
              "Insumos - Sujeción",
              "$14,650.00",
              "$0.00",
              "CC-MANT",
              "PRY-2024-01",
              "IVA-21",
              "FC-4523-L5-L6",
            ],
            [
              "5",
              "1105-004",
              "Insumos - Bulonería Especial",
              "$12,240.00",
              "$0.00",
              "CC-CONST",
              "PRY-2024-02",
              "IVA-21",
              "FC-4523-L7",
            ],
            [
              "6",
              "1105-001",
              "Insumos - Clavos y Fijaciones",
              "$4,650.00",
              "$0.00",
              "CC-MANT",
              "PRY-2024-03",
              "IVA-21",
              "FC-4523-L8",
            ],
            ["7", "1110-001", "IVA Crédito Fiscal 21%", "$14,285.90", "$0.00", "CC-ADM", "", "IVA-21", "FC-4523-IVA"],
            [
              "8",
              "1115-002",
              "Percepciones IIBB CABA",
              "$1,225.00",
              "$0.00",
              "CC-ADM",
              "",
              "PERC-IIBB",
              "FC-4523-PERC",
            ],
            [
              "9",
              "2101-003",
              "Proveedores - Suministros Ind.",
              "$0.00",
              "$96,300.90",
              "CC-ADM",
              "",
              "",
              "PRV-68745291",
            ],
            ["10", "1101-001", "Banco Cuenta Corriente", "$0.00", "$5,245.00", "CC-ADM", "", "RET-GAN", "RET-4523"],
          ],
        },
        aiReasoning: {
          summary: "Se procesó la compra completa integrando factura y remito con datos del Master Data y API del ERP. El asistente generó un asiento contable completo con distribución de costos, proyectos y códigos fiscales, listo para enviar al sistema contable.",
          steps: [
            "1. Consolidación de documentos: Se integraron datos de factura FC-4523 y remito R-2024-1847",
            "2. Consulta Master Data: Se obtuvieron cuentas contables del Plan de Cuentas 2024 v3.2",
            "3. Consulta API ERP: Se recuperó información del proveedor PRV-68745291 (Suministros Industriales SA)",
            "4. Clasificación avanzada: Se aplicó categorización detallada de insumos según destino",
            "5. Distribución de costos: Se asignaron centros de costo (CC-PROD, CC-CONST, CC-MANT) y proyectos",
            "6. Cálculo de impuestos: Se procesaron IVA 21%, percepciones IIBB y retenciones",
            "7. Validación cruzada: Se verificó coincidencia entre factura, remito y cantidades",
            "8. Generación de asiento: Se creó asiento balanceado con referencia cruzada a documentos fuente",
            "9. Preparación para envío: Se formateó la salida según especificaciones del sistema contable",
          ],
          dataSources: [
            { name: "Master Data - Plan de Cuentas 2024 v3.2", status: "OK", recordsUsed: 12 },
            { name: "API ERP - Datos de Proveedor", status: "OK", recordsUsed: 1 },
            { name: "Factura FC-4523", status: "OK", recordsUsed: 8 },
            { name: "Remito R-2024-1847", status: "OK", recordsUsed: 8 },
          ],
          confidence: 96,
          dataQuality: "Muy Alta - Validación cruzada exitosa entre todos los documentos y fuentes externas",
        },
      },
    }
  }

  if (documentId === "DOC-2002") {
    return {
      mainDocument: {
        documentInfo: {
          type: "Factura",
          number: "0002-00008901",
          date: "21/01/2024",
          filename: "factura_materiales_const_8901.pdf",
        },
        supplier: {
          name: "Materiales de Construcción Lopez SRL",
          cuit: "30-71234567-8",
          address: "Ruta 3 Km 45.5, La Matanza, Buenos Aires",
          phone: "+54 11 4488-9900",
          email: "ventas@mlopez.com.ar",
        },
        datosGenerales: {
          proveedor: "Materiales de Construcción Lopez SRL",
          numeroFactura: "0002-00008901",
          fecha: "21/01/2024",
          total: "$145,230.00",
        },
        extractedData: {
          headers: ["Código", "Descripción", "Cantidad", "Unidad", "P. Unitario", "Subtotal", "IVA 21%", "Total"],
          rows: [
            ["MAT-001", "Cemento Portland tipo CPE 50kg", "200", "Bolsas", "$850.00", "$170,000.00", "$35,700.00", "$205,700.00"],
            ["MAT-002", "Arena fina lavada m³", "15", "m³", "$4,200.00", "$63,000.00", "$13,230.00", "$76,230.00"],
            ["MAT-003", "Piedra partida 6-20mm m³", "20", "m³", "$3,800.00", "$76,000.00", "$15,960.00", "$91,960.00"],
            ["MAT-004", "Cal hidráulica 25kg", "50", "Bolsas", "$420.00", "$21,000.00", "$4,410.00", "$25,410.00"],
            ["MAT-005", "Hierro 8mm barra 12m", "80", "Barras", "$2,150.00", "$172,000.00", "$36,120.00", "$208,120.00"],
            ["MAT-006", "Malla sima 15x15cm", "100", "m²", "$890.00", "$89,000.00", "$18,690.00", "$107,690.00"],
          ],
        },
        outputData: {
          headers: ["Línea", "Cód. Cuenta", "Nombre Cuenta", "Debe", "Haber", "Centro Costo", "Referencia"],
          rows: [
            ["1", "1105-010", "Materiales - Cemento", "$170,000.00", "$0.00", "CC-OBRA", "FC-8901"],
            ["2", "1105-011", "Materiales - Áridos", "$139,000.00", "$0.00", "CC-OBRA", "FC-8901"],
            ["3", "1105-012", "Materiales - Aglomerantes", "$21,000.00", "$0.00", "CC-OBRA", "FC-8901"],
            ["4", "1105-013", "Materiales - Hierro", "$172,000.00", "$0.00", "CC-OBRA", "FC-8901"],
            ["5", "1105-014", "Materiales - Malla", "$89,000.00", "$0.00", "CC-OBRA", "FC-8901"],
            ["6", "1110-001", "IVA Crédito Fiscal 21%", "$124,110.00", "$0.00", "CC-ADM", "FC-8901-IVA"],
            ["7", "2101-008", "Proveedores - Mat. Construcción", "$0.00", "$715,110.00", "CC-ADM", "PRV-71234567"],
          ],
        },
        aiReasoning: {
          summary: "Se procesó factura de materiales de construcción con 6 líneas de productos. El asistente clasificó los materiales según categoría y asignó las cuentas contables correspondientes al sector de obras.",
          steps: [
            "1. Identificación de documento: Factura de materiales de construcción",
            "2. Extracción de líneas: 6 productos identificados (cemento, áridos, cal, hierro, malla)",
            "3. Clasificación por categoría: Agrupación en cementos, áridos, aglomerantes, estructuras",
            "4. Asignación contable: Aplicación del plan de cuentas sector construcción",
            "5. Cálculo IVA: Crédito fiscal 21% sobre $591,000",
            "6. Generación de asiento: Creación de asiento balanceado",
          ],
          confidence: 94,
          dataQuality: "Alta - Datos completos y consistentes",
        },
      },
      relatedDocument: {
        documentInfo: {
          type: "Remito",
          number: "R-2024-3421",
          date: "21/01/2024",
          filename: "remito_3421.pdf",
        },
        supplier: {
          name: "Materiales de Construcción Lopez SRL",
          cuit: "30-71234567-8",
          address: "Ruta 3 Km 45.5, La Matanza, Buenos Aires",
        },
        datosGenerales: {
          proveedor: "Materiales de Construcción Lopez SRL",
          numeroRemito: "R-2024-3421",
          fecha: "21/01/2024",
          totalBultos: "465 items",
        },
        extractedData: {
          headers: ["Código", "Descripción", "Cantidad", "Unidad", "Transporte", "Estado"],
          rows: [
            ["MAT-001", "Cemento Portland CPE 50kg", "200", "Bolsas", "Camión 1", "Entregado"],
            ["MAT-002", "Arena fina lavada", "15", "m³", "Camión 2", "Entregado"],
            ["MAT-003", "Piedra partida 6-20mm", "20", "m³", "Camión 2", "Entregado"],
            ["MAT-004", "Cal hidráulica 25kg", "50", "Bolsas", "Camión 1", "Entregado"],
            ["MAT-005", "Hierro 8mm barra 12m", "80", "Barras", "Camión 3", "Entregado"],
            ["MAT-006", "Malla sima 15x15cm", "100", "m²", "Camión 3", "Entregado"],
          ],
        },
        outputData: {
          headers: ["Línea", "Material", "Cantidad", "Ubicación Obra", "Sector", "Responsable"],
          rows: [
            ["1", "Cemento Portland CPE", "200 bolsas", "Depósito A - Obra Central", "Materiales Secos", "Ing. Martínez"],
            ["2", "Arena fina lavada", "15 m³", "Acopio Exterior - Obra Central", "Áridos", "Ing. Martínez"],
            ["3", "Piedra partida 6-20mm", "20 m³", "Acopio Exterior - Obra Central", "Áridos", "Ing. Martínez"],
            ["4", "Cal hidráulica", "50 bolsas", "Depósito A - Obra Central", "Materiales Secos", "Ing. Martínez"],
            ["5", "Hierro 8mm", "80 barras", "Depósito B - Herrería", "Estructuras", "Enc. Rodriguez"],
            ["6", "Malla sima 15x15cm", "100 m²", "Depósito B - Herrería", "Estructuras", "Enc. Rodriguez"],
          ],
        },
        aiReasoning: {
          summary: "Se procesó remito de entrega de materiales de construcción con asignación de ubicaciones en obra y responsables de recepción.",
          steps: [
            "1. Validación de documento: Remito R-2024-3421 coincide con factura 8901",
            "2. Verificación de cantidades: 100% coincidencia con factura",
            "3. Registro de transporte: 3 camiones utilizados para la entrega",
            "4. Asignación de ubicaciones: Distribución en depósitos según tipo de material",
            "5. Designación de responsables: Asignación a Ing. Martínez y Enc. Rodriguez",
          ],
          confidence: 96,
          dataQuality: "Muy Alta - Coincidencia total con factura",
        },
      },
      consolidatedResult: {
        dataSources: {
          mainDocument: "factura_materiales_const_8901.pdf",
          relatedDocuments: ["remito_3421.pdf", "certificado_calidad.pdf"],
          apiData: "ERP Sistema - Proveedor PRV-71234567",
          masterData: "Plan de Cuentas Construcción 2024",
        },
        datosGenerales: {
          documento: "Asiento Contable - Compra Materiales Obra",
          estado: "Para confirmar",
          totalDebe: "$715,110.00",
          totalHaber: "$715,110.00",
        },
        outputData: {
          headers: ["Línea", "Cód. Cuenta", "Nombre Cuenta", "Debe", "Haber", "Centro Costo", "Obra", "Cód. Fiscal", "Ref."],
          rows: [
            ["1", "1105-010", "Materiales - Cemento Portland", "$170,000.00", "$0.00", "CC-OBRA-01", "OB-2024-15", "IVA-21", "FC-8901-L1"],
            ["2", "1105-011", "Materiales - Arena Fina", "$63,000.00", "$0.00", "CC-OBRA-01", "OB-2024-15", "IVA-21", "FC-8901-L2"],
            ["3", "1105-011", "Materiales - Piedra Partida", "$76,000.00", "$0.00", "CC-OBRA-01", "OB-2024-15", "IVA-21", "FC-8901-L3"],
            ["4", "1105-012", "Materiales - Cal Hidráulica", "$21,000.00", "$0.00", "CC-OBRA-01", "OB-2024-15", "IVA-21", "FC-8901-L4"],
            ["5", "1105-013", "Materiales - Hierro Estructura", "$172,000.00", "$0.00", "CC-OBRA-01", "OB-2024-15", "IVA-21", "FC-8901-L5"],
            ["6", "1105-014", "Materiales - Malla Construcción", "$89,000.00", "$0.00", "CC-OBRA-01", "OB-2024-15", "IVA-21", "FC-8901-L6"],
            ["7", "1110-001", "IVA Crédito Fiscal 21%", "$124,110.00", "$0.00", "CC-ADM", "", "IVA-21", "FC-8901-IVA"],
            ["8", "2101-008", "Proveedores - Mat. López SRL", "$0.00", "$715,110.00", "CC-ADM", "", "", "PRV-71234567"],
          ],
        },
        aiReasoning: {
          summary: "Se consolidó la compra de materiales de construcción integrando factura, remito y certificado de calidad. El asistente asignó todos los costos a la obra OB-2024-15 y generó el asiento contable completo.",
          steps: [
            "1. Consolidación documental: Factura + Remito + Certificado de calidad",
            "2. Consulta Master Data: Plan de cuentas sector construcción",
            "3. Consulta API: Datos proveedor López SRL (PRV-71234567)",
            "4. Asignación a obra: Todos los materiales asignados a OB-2024-15",
            "5. Clasificación detallada: Materiales categorizados por tipo",
            "6. Cálculo fiscal: IVA 21% + verificación certificado de calidad",
            "7. Validación cruzada: Coincidencia factura-remito 100%",
            "8. Generación de asiento: Formato listo para sistema contable",
          ],
          dataSources: [
            { name: "Master Data - Plan Construcción 2024", status: "OK", recordsUsed: 8 },
            { name: "API ERP - Proveedor López", status: "OK", recordsUsed: 1 },
            { name: "Factura FC-8901", status: "OK", recordsUsed: 6 },
            { name: "Remito R-3421", status: "OK", recordsUsed: 6 },
            { name: "Certificado Calidad", status: "OK", recordsUsed: 1 },
          ],
          confidence: 95,
          dataQuality: "Muy Alta - Documentación completa con certificación de calidad",
        },
      },
    }
  }

  if (documentId === "DOC-2003") {
    return {
      mainDocument: {
        documentInfo: {
          type: "Nota de Crédito",
          number: "NC-00000152",
          date: "18/01/2024",
          filename: "nota_credito_devoluciones_152.pdf",
        },
        supplier: {
          name: "Electrónica Central SA",
          cuit: "30-68952147-3",
          address: "Av. Corrientes 4567, CABA, Buenos Aires",
          phone: "+54 11 4855-6677",
          email: "administracion@electronicacentral.com",
        },
        datosGenerales: {
          proveedor: "Electrónica Central SA",
          numeroNotaCredito: "NC-00000152",
          fecha: "18/01/2024",
          total: "-$23,560.00",
        },
        extractedData: {
          headers: ["Código", "Descripción", "Cantidad", "P. Unitario", "Subtotal", "IVA 21%", "Total", "Motivo"],
          rows: [
            ["ELEC-045", "Monitor LED 24 pulgadas", "5", "$8,500.00", "$42,500.00", "$8,925.00", "$51,425.00", "Defecto fabricación"],
            ["ELEC-112", "Teclado inalámbrico", "8", "$3,200.00", "$25,600.00", "$5,376.00", "$30,976.00", "No solicitado"],
            ["ELEC-078", "Mouse óptico USB", "15", "$1,850.00", "$27,750.00", "$5,827.50", "$33,577.50", "Pedido duplicado"],
          ],
        },
        outputData: {
          headers: ["Línea", "Cód. Cuenta", "Nombre Cuenta", "Debe", "Haber", "Centro Costo", "Referencia"],
          rows: [
            ["1", "2101-005", "Proveedores - Electrónica Central", "$115,978.50", "$0.00", "CC-ADM", "NC-152"],
            ["2", "1105-020", "Mercadería - Monitores", "$0.00", "$42,500.00", "CC-VEN", "DEV-ELEC-045"],
            ["3", "1105-021", "Mercadería - Teclados", "$0.00", "$25,600.00", "CC-VEN", "DEV-ELEC-112"],
            ["4", "1105-022", "Mercadería - Mouse", "$0.00", "$27,750.00", "CC-VEN", "DEV-ELEC-078"],
            ["5", "1110-001", "IVA Crédito Fiscal 21%", "$0.00", "$20,128.50", "CC-ADM", "NC-152-IVA"],
          ],
        },
        aiReasoning: {
          summary: "Se procesó nota de crédito por devolución de mercadería electrónica. El asistente registró la reducción del pasivo con proveedores y la salida de inventario por los productos devueltos.",
          steps: [
            "1. Identificación: Nota de crédito NC-152 por devoluciones",
            "2. Extracción de productos: 3 líneas con motivos de devolución",
            "3. Clasificación de motivos: Defecto, error pedido, duplicación",
            "4. Reversión de compra: Reducción de cuenta proveedores",
            "5. Ajuste de inventario: Salida de mercadería por devolución",
            "6. Ajuste de IVA: Reversión del crédito fiscal",
          ],
          confidence: 93,
          dataQuality: "Alta - Motivos de devolución claramente identificados",
        },
      },
      relatedDocument: {
        documentInfo: {
          type: "Factura",
          number: "FC-7845",
          date: "10/01/2024",
          filename: "factura_original_7845.pdf",
        },
        supplier: {
          name: "Electrónica Central SA",
          cuit: "30-68952147-3",
          address: "Av. Corrientes 4567, CABA, Buenos Aires",
        },
        datosGenerales: {
          proveedor: "Electrónica Central SA",
          numeroFactura: "FC-7845",
          fecha: "10/01/2024",
          total: "$115,978.50",
        },
        extractedData: {
          headers: ["Código", "Descripción", "Cantidad", "P. Unitario", "Subtotal", "IVA 21%", "Total"],
          rows: [
            ["ELEC-045", "Monitor LED 24 pulgadas", "5", "$8,500.00", "$42,500.00", "$8,925.00", "$51,425.00"],
            ["ELEC-112", "Teclado inalámbrico", "8", "$3,200.00", "$25,600.00", "$5,376.00", "$30,976.00"],
            ["ELEC-078", "Mouse óptico USB", "15", "$1,850.00", "$27,750.00", "$5,827.50", "$33,577.50"],
          ],
        },
        outputData: {
          headers: ["Línea", "Cód. Cuenta", "Nombre Cuenta", "Debe", "Haber", "Centro Costo", "Referencia"],
          rows: [
            ["1", "1105-020", "Mercadería - Monitores", "$42,500.00", "$0.00", "CC-VEN", "FC-7845"],
            ["2", "1105-021", "Mercadería - Teclados", "$25,600.00", "$0.00", "CC-VEN", "FC-7845"],
            ["3", "1105-022", "Mercadería - Mouse", "$27,750.00", "$0.00", "CC-VEN", "FC-7845"],
            ["4", "1110-001", "IVA Crédito Fiscal 21%", "$20,128.50", "$0.00", "CC-ADM", "FC-7845-IVA"],
            ["5", "2101-005", "Proveedores - Electrónica Central", "$0.00", "$115,978.50", "CC-ADM", "PRV-68952147"],
          ],
        },
        aiReasoning: {
          summary: "Factura original de compra de equipos electrónicos que posteriormente generó la nota de crédito NC-152.",
          steps: [
            "1. Factura de compra original",
            "2. Productos recibidos con defectos detectados",
            "3. Generó proceso de devolución",
          ],
          confidence: 95,
          dataQuality: "Alta",
        },
      },
      consolidatedResult: {
        dataSources: {
          mainDocument: "nota_credito_devoluciones_152.pdf",
          relatedDocuments: ["factura_original_7845.pdf"],
          apiData: "ERP Sistema - Proveedor PRV-68952147",
          masterData: "Plan de Cuentas 2024",
        },
        datosGenerales: {
          documento: "Asiento Contable - Nota de Crédito",
          estado: "Confirmado",
          totalDebe: "$115,978.50",
          totalHaber: "$115,978.50",
        },
        outputData: {
          headers: ["Línea", "Cód. Cuenta", "Nombre Cuenta", "Debe", "Haber", "Centro Costo", "Motivo", "Ref."],
          rows: [
            ["1", "2101-005", "Proveedores - Electrónica Central SA", "$115,978.50", "$0.00", "CC-ADM", "Nota Crédito", "NC-152"],
            ["2", "1105-020", "Stock Monitores LED 24\"", "$0.00", "$42,500.00", "CC-VEN", "Defecto fabricación", "FC-7845-DEV"],
            ["3", "1105-021", "Stock Teclados Inalámbricos", "$0.00", "$25,600.00", "CC-VEN", "Error pedido", "FC-7845-DEV"],
            ["4", "1105-022", "Stock Mouse Óptico USB", "$0.00", "$27,750.00", "CC-VEN", "Pedido duplicado", "FC-7845-DEV"],
            ["5", "1110-001", "IVA Crédito Fiscal 21%", "$0.00", "$20,128.50", "CC-ADM", "Reversión IVA", "NC-152-IVA"],
          ],
        },
        aiReasoning: {
          summary: "Se consolidó la nota de crédito verificando contra la factura original FC-7845. El asistente registró la devolución completa con ajustes de inventario, cuentas por pagar e IVA.",
          steps: [
            "1. Validación contra factura original: NC-152 referencia a FC-7845",
            "2. Verificación de productos: Coincidencia con factura original",
            "3. Consulta API: Estado cuenta proveedor PRV-68952147",
            "4. Registro de motivos: Documentación de causas de devolución",
            "5. Ajuste de pasivo: Reducción cuenta proveedores",
            "6. Ajuste de inventario: Salida de stock por devolución",
            "7. Reversión fiscal: Ajuste negativo IVA crédito fiscal",
            "8. Generación de asiento: Formato para sistema contable",
          ],
          dataSources: [
            { name: "Master Data - Plan de Cuentas", status: "OK", recordsUsed: 5 },
            { name: "API ERP - Proveedor Electrónica Central", status: "OK", recordsUsed: 1 },
            { name: "Nota de Crédito NC-152", status: "OK", recordsUsed: 3 },
            { name: "Factura Original FC-7845", status: "OK", recordsUsed: 1 },
          ],
          confidence: 94,
          dataQuality: "Alta - Validación exitosa contra factura original",
        },
      },
    }
  }

  if (documentId === "DOC-2004") {
    return {
      mainDocument: {
        documentInfo: {
          type: "Factura",
          number: "FC-B-00000245",
          date: "20/01/2024",
          filename: "factura_servicios_profesionales_245.pdf",
        },
        supplier: {
          name: "Consultoría Empresarial García y Asoc.",
          cuit: "30-71456892-1",
          address: "Av. Santa Fe 2850 Piso 12, CABA, Buenos Aires",
          phone: "+54 11 4814-5566",
          email: "facturacion@garciaconsultores.com",
        },
        datosGenerales: {
          proveedor: "Consultoría Empresarial García y Asoc.",
          numeroFactura: "FC-B-00000245",
          fecha: "20/01/2024",
          total: "$198,000.00",
        },
        extractedData: {
          headers: ["Concepto", "Descripción", "Horas", "Tarifa/Hora", "Subtotal"],
          rows: [
            ["Consultoría Estratégica", "Análisis de mercado y competencia sector industrial", "40", "$2,500.00", "$100,000.00"],
            ["Consultoría Financiera", "Reestructuración plan financiero 2024-2025", "30", "$2,800.00", "$84,000.00"],
            ["Consultoría Operativa", "Optimización procesos productivos planta Morón", "25", "$2,200.00", "$55,000.00"],
            ["Gastos de movilidad", "Viáticos y traslados equipo consultor", "-", "-", "$9,000.00"],
          ],
        },
        outputData: {
          headers: ["Línea", "Cód. Cuenta", "Nombre Cuenta", "Debe", "Haber", "Centro Costo", "Referencia"],
          rows: [
            ["1", "5101-001", "Honorarios Profesionales - Consultoría", "$198,000.00", "$0.00", "CC-GER", "FC-B-245"],
            ["2", "5101-002", "Gastos de Movilidad", "$9,000.00", "$0.00", "CC-GER", "FC-B-245-MOV"],
            ["3", "1120-002", "Retenciones Ganancias por Pagar", "$0.00", "$5,940.00", "CC-ADM", "RET-GAN-3%"],
            ["4", "2101-012", "Proveedores - Servicios Profesionales", "$0.00", "$201,060.00", "CC-ADM", "PRV-71456892"],
          ],
        },
        aiReasoning: {
          summary: "Se procesó factura de servicios profesionales de consultoría tipo B (exenta de IVA). El asistente calculó la retención de ganancias del 3% y generó el asiento correspondiente.",
          steps: [
            "1. Identificación: Factura de servicios profesionales (sin IVA)",
            "2. Extracción de servicios: 3 conceptos de consultoría + gastos",
            "3. Cálculo de honorarios: Total $248,000 más $9,000 gastos",
            "4. Aplicación de retención: Ganancias 3% sobre honorarios",
            "5. Asignación contable: Cuenta de gastos de administración",
            "6. Generación de asiento: Sin IVA por ser factura tipo B",
          ],
          confidence: 96,
          dataQuality: "Muy Alta - Factura profesional con detalles completos",
        },
      },
      consolidatedResult: {
        dataSources: {
          mainDocument: "factura_servicios_profesionales_245.pdf",
          relatedDocuments: [],
          apiData: "ERP Sistema - Proveedor PRV-71456892",
          masterData: "Plan de Cuentas 2024 - Servicios",
        },
        datosGenerales: {
          documento: "Asiento Contable - Servicios Profesionales",
          estado: "Enviado",
          totalDebe: "$207,000.00",
          totalHaber: "$207,000.00",
        },
        outputData: {
          headers: ["Línea", "Cód. Cuenta", "Nombre Cuenta", "Debe", "Haber", "Proyecto", "Cód. Fiscal", "Ref."],
          rows: [
            ["1", "5101-001", "Hon. Prof. - Consultoría Estratégica", "$100,000.00", "$0.00", "PRY-EST-2024", "EXENTO", "FC-B-245-C1"],
            ["2", "5101-001", "Hon. Prof. - Consultoría Financiera", "$84,000.00", "$0.00", "PRY-FIN-2024", "EXENTO", "FC-B-245-C2"],
            ["3", "5101-001", "Hon. Prof. - Consultoría Operativa", "$55,000.00", "$0.00", "PRY-OPE-2024", "EXENTO", "FC-B-245-C3"],
            ["4", "5102-003", "Gastos Movilidad - Consultores", "$9,000.00", "$0.00", "PRY-VAR-2024", "EXENTO", "FC-B-245-MOV"],
            ["5", "1120-002", "Retenciones Ganancias por Pagar", "$0.00", "$7,440.00", "", "RET-GAN-3%", "RET-245"],
            ["6", "2101-012", "Proveedores - García y Asoc.", "$0.00", "$240,560.00", "", "", "PRV-71456892"],
          ],
        },
        aiReasoning: {
          summary: "Se consolidó la factura de servicios profesionales con distribución por proyecto y cálculo automático de retenciones. El asiento está listo para envío al sistema contable.",
          steps: [
            "1. Validación de factura tipo B: Confirmado exención de IVA",
            "2. Consulta Master Data: Plan de cuentas servicios profesionales",
            "3. Consulta API: Verificación proveedor García y Asoc.",
            "4. Distribución por proyecto: Asignación a 4 proyectos activos",
            "5. Cálculo de retenciones: 3% sobre $248,000 = $7,440",
            "6. Gastos complementarios: Registro separado de movilidad",
            "7. Generación de comprobante: Preparación para pago",
            "8. Validación final: Asiento balanceado y listo para envío",
          ],
          dataSources: [
            { name: "Master Data - Plan Servicios", status: "OK", recordsUsed: 6 },
            { name: "API ERP - Proveedor García", status: "OK", recordsUsed: 1 },
            { name: "Factura FC-B-245", status: "OK", recordsUsed: 4 },
          ],
          confidence: 97,
          dataQuality: "Muy Alta - Factura profesional completa con retenciones correctas",
        },
      },
    }
  }

  if (documentId === "DOC-2005") {
    return {
      mainDocument: {
        documentInfo: {
          type: "Factura",
          number: "0005-00001092",
          date: "15/01/2024",
          filename: "factura_alquiler_equipos_1092.pdf",
        },
        supplier: {
          name: "Alquileres Técnicos del Sur SA",
          cuit: "30-69874521-7",
          address: "Ruta 205 Km 12, Quilmes, Buenos Aires",
          phone: "+54 11 4257-8899",
          email: "cobranzas@alquileressur.com",
        },
        datosGenerales: {
          proveedor: "Alquileres Técnicos del Sur SA",
          numeroFactura: "0005-00001092",
          fecha: "15/01/2024",
          total: "$67,890.00",
        },
        extractedData: {
          headers: ["Equipo", "Código Interno", "Período", "Días", "Tarifa Diaria", "Subtotal", "IVA 21%", "Total"],
          rows: [
            ["Retroexcavadora CAT 420F", "RET-045", "01/01-15/01/2024", "15", "$3,500.00", "$52,500.00", "$11,025.00", "$63,525.00"],
            ["Compresor Atlas Copco 185 CFM", "COMP-012", "01/01-10/01/2024", "10", "$1,200.00", "$12,000.00", "$2,520.00", "$14,520.00"],
            ["Martillo neumático grande", "MART-008", "05/01-15/01/2024", "10", "$850.00", "$8,500.00", "$1,785.00", "$10,285.00"],
          ],
        },
        outputData: {
          headers: ["Línea", "Cód. Cuenta", "Nombre Cuenta", "Debe", "Haber", "Centro Costo", "Referencia"],
          rows: [
            ["1", "5201-005", "Alquileres - Maquinaria Pesada", "$52,500.00", "$0.00", "CC-OBRA-02", "FC-1092"],
            ["2", "5201-006", "Alquileres - Equipos Neumáticos", "$20,500.00", "$0.00", "CC-OBRA-02", "FC-1092"],
            ["3", "1110-001", "IVA Crédito Fiscal 21%", "$15,330.00", "$0.00", "CC-ADM", "FC-1092-IVA"],
            ["4", "2101-015", "Proveedores - Alquileres Técnicos", "$0.00", "$88,330.00", "CC-ADM", "PRV-69874521"],
          ],
        },
        aiReasoning: {
          summary: "Se procesó factura de alquiler de equipos de construcción rechazada por discrepancia en días facturados vs. días reales de uso según registros de obra.",
          steps: [
            "1. Identificación: Factura de alquiler de maquinaria",
            "2. Extracción de equipos: 3 equipos con períodos y tarifas",
            "3. Validación de períodos: ALERTA - Discrepancia detectada",
            "4. Verificación cruzada: Registros obra indican 12 días vs 15 facturados",
            "5. Generación de asiento: Asiento preparado pero marcado para revisión",
            "6. Recomendación: Solicitar corrección de factura antes de aprobar",
          ],
          confidence: 78,
          dataQuality: "Media - Detectada inconsistencia en días facturados",
        },
      },
      relatedDocument: {
        documentInfo: {
          type: "Contrato",
          number: "CONT-2023-0892",
          date: "15/12/2023",
          filename: "contrato_alquiler.pdf",
        },
        supplier: {
          name: "Alquileres Técnicos del Sur SA",
          cuit: "30-69874521-7",
          address: "Ruta 205 Km 12, Quilmes, Buenos Aires",
        },
        datosGenerales: {
          proveedor: "Alquileres Técnicos del Sur SA",
          numeroContrato: "CONT-2023-0892",
          fecha: "15/12/2023",
          vigencia: "01/01/2024 - 31/03/2024",
        },
        extractedData: {
          headers: ["Equipo", "Código", "Tarifa Diaria", "Mantenimiento", "Seguro", "Obs."],
          rows: [
            ["Retroexcavadora CAT 420F", "RET-045", "$3,500.00", "Incluido", "Incluido", "Min. 5 días"],
            ["Compresor Atlas Copco 185", "COMP-012", "$1,200.00", "Incluido", "Incluido", "Min. 3 días"],
            ["Martillo neumático grande", "MART-008", "$850.00", "No incluido", "Incluido", "Min. 2 días"],
          ],
        },
        outputData: {
          headers: ["Equipo", "Tarifa Contrato", "Tarifa Facturada", "Diferencia", "Estado Validación"],
          rows: [
            ["Retroexcavadora CAT 420F", "$3,500.00", "$3,500.00", "$0.00", "✓ Coincide"],
            ["Compresor Atlas Copco", "$1,200.00", "$1,200.00", "$0.00", "✓ Coincide"],
            ["Martillo neumático", "$850.00", "$850.00", "$0.00", "✓ Coincide"],
          ],
        },
        aiReasoning: {
          summary: "Se validó el contrato de alquiler verificando tarifas contra la factura. Las tarifas diarias coinciden pero los días facturados exceden los días registrados de uso.",
          steps: [
            "1. Extracción de cláusulas contractuales",
            "2. Validación de tarifas: Coincidencia 100%",
            "3. Verificación de períodos mínimos: Cumplidos",
            "4. ALERTA: Discrepancia en días reales vs facturados",
          ],
          confidence: 94,
          dataQuality: "Alta - Contrato válido con alertas de uso",
        },
      },
      consolidatedResult: {
        dataSources: {
          mainDocument: "factura_alquiler_equipos_1092.pdf",
          relatedDocuments: ["contrato_alquiler.pdf"],
          apiData: "ERP Sistema - Proveedor PRV-69874521",
          masterData: "Plan de Cuentas 2024 - Alquileres",
        },
        datosGenerales: {
          documento: "Asiento Contable - Alquiler Equipos (RECHAZADO)",
          estado: "Rechazado",
          totalDebe: "$88,330.00",
          totalHaber: "$88,330.00",
        },
        outputData: {
          headers: ["Línea", "Cód. Cuenta", "Nombre Cuenta", "Debe", "Haber", "Obra", "Alerta", "Ref."],
          rows: [
            ["1", "5201-005", "Alq. Retroexcavadora CAT 420F", "$52,500.00", "$0.00", "OB-2024-08", "⚠️ Verificar días", "FC-1092-EQ1"],
            ["2", "5201-006", "Alq. Compresor Atlas Copco", "$12,000.00", "$0.00", "OB-2024-08", "✓ OK", "FC-1092-EQ2"],
            ["3", "5201-006", "Alq. Martillo Neumático", "$8,500.00", "$0.00", "OB-2024-08", "✓ OK", "FC-1092-EQ3"],
            ["4", "1110-001", "IVA Crédito Fiscal 21%", "$15,330.00", "$0.00", "", "", "FC-1092-IVA"],
            ["5", "2101-015", "Proveedores - Alq. del Sur", "$0.00", "$88,330.00", "", "⚠️ No pagar", "PRV-69874521"],
          ],
        },
        aiReasoning: {
          summary: "Se consolidó la factura de alquiler de equipos de construcción, comparándola con el contrato. Se detectó una discrepancia en los días facturados para la retroexcavadora. La factura es marcada como RECHAZADA hasta que se aclare la diferencia. El asiento contable refleja la situación actual pero está pendiente de aprobación.",
          steps: [
            "1. Consolidación de datos: Factura FC-1092 y Contrato CONT-2023-0892",
            "2. Validación de tarifas y condiciones: OK para todos los equipos según contrato",
            "3. Control de días facturados vs. días de uso registrados en obra: ALERTA en Retroexcavadora (15 vs 12 días)",
            "4. Cálculo de la diferencia: $15,750 (IVA incluido) a favor del cliente",
            "5. Consulta API ERP: Historial de reclamos similares con este proveedor",
            "6. Decisión automática: RECHAZAR la factura",
            "7. Notificación: Envío de email a proveedor y área de compras solicitando corrección",
            "8. Asiento contable: Creado con advertencias y pendiente de aprobación.",
          ],
          dataSources: [
            { name: "Master Data - Plan Alquileres", status: "OK", recordsUsed: 5 },
            { name: "API ERP - Control Obra OB-2024-08", status: "ALERTA", recordsUsed: 15 },
            { name: "Factura FC-1092", status: "RECHAZADA", recordsUsed: 3 },
            { name: "Contrato Alquiler", status: "OK", recordsUsed: 1 },
          ],
          confidence: 92,
          dataQuality: "Alta - Detección precisa de inconsistencia mediante validación cruzada",
        },
      },
    }
  }

  if (documentId === "DOC-2006") {
    return {
      mainDocument: {
        documentInfo: {
          type: "Factura",
          number: "0003-00005632",
          date: "22/01/2024",
          filename: "factura_combustible_flota_5632.pdf",
        },
        supplier: {
          name: "YPF Comercial SA",
          cuit: "30-54668997-9",
          address: "Av. Del Libertador 101, Vicente López, Buenos Aires",
          phone: "0810-555-9773",
          email: "empresas@ypf.com",
        },
        datosGenerales: {
          proveedor: "YPF Comercial SA",
          numeroFactura: "0003-00005632",
          fecha: "22/01/2024",
          total: "$312,450.00",
        },
        extractedData: {
          headers: ["Fecha", "Vehículo", "Patente", "Combustible", "Litros", "Precio/L", "Subtotal", "IVA 21%", "Total"],
          rows: [
            ["18/01", "Camión Mercedes", "AB123CD", "Diesel", "350", "$320.00", "$112,000.00", "$23,520.00", "$135,520.00"],
            ["19/01", "Camioneta Toyota", "EF456GH", "Nafta Super", "80", "$450.00", "$36,000.00", "$7,560.00", "$43,560.00"],
            ["20/01", "Camión Iveco", "IJ789KL", "Diesel", "280", "$320.00", "$89,600.00", "$18,816.00", "$108,416.00"],
            ["21/01", "Camioneta Ford", "MN012OP", "Nafta Super", "70", "$450.00", "$31,500.00", "$6,615.00", "$38,115.00"],
            ["22/01", "Utilitario Fiat", "QR345ST", "Nafta Super", "55", "$450.00", "$24,750.00", "$5,197.50", "$29,947.50"],
          ],
        },
        outputData: {
          headers: ["Línea", "Cód. Cuenta", "Nombre Cuenta", "Debe", "Haber", "Centro Costo", "Referencia"],
          rows: [
            ["1", "5301-001", "Combustibles - Diesel Flota", "$201,600.00", "$0.00", "CC-LOG", "FC-5632-DSL"],
            ["2", "5301-002", "Combustibles - Nafta Flota", "$92,250.00", "$0.00", "CC-LOG", "FC-5632-NFT"],
            ["3", "1110-001", "IVA Crédito Fiscal 21%", "$61,708.50", "$0.00", "CC-ADM", "FC-5632-IVA"],
            ["4", "2101-020", "Proveedores - YPF Comercial", "$0.00", "$355,558.50", "CC-ADM", "PRV-54668997"],
          ],
        },
        aiReasoning: {
          summary: "Se procesó factura de combustible para flota vehicular con 5 cargas de diesel y nafta. El asistente clasificó los consumos por tipo de combustible y asignó al centro de costo de logística.",
          steps: [
            "1. Identificación: Factura de combustible flota empresarial",
            "2. Extracción de cargas: 5 cargas identificadas con vehículos y patentes",
            "3. Clasificación por combustible: Diesel (630L) y Nafta (205L)",
            "4. Asignación por vehículo: Distribución en centro costo logística",
            "5. Cálculo de IVA: Crédito fiscal 21% sobre $293,850",
            "6. Generación de asiento: Asiento listo para aprobación",
          ],
          confidence: 95,
          dataQuality: "Alta - Detalle completo con patentes y litros",
        },
      },
      relatedDocument: {
        documentInfo: {
          type: "Remito",
          number: "R-2024-5632",
          date: "22/01/2024",
          filename: "remito_combustible_5632.pdf",
        },
        supplier: {
          name: "YPF Comercial SA",
          cuit: "30-54668997-9",
          address: "Av. Del Libertador 101, Vicente López, Buenos Aires",
        },
        datosGenerales: {
          proveedor: "YPF Comercial SA",
          numeroRemito: "R-2024-5632",
          fecha: "18-22/01/2024",
          totalLitros: "835 litros",
        },
        extractedData: {
          headers: ["Fecha/Hora", "Estación", "Surtidor", "Vehículo", "Combustible", "Litros", "Operador"],
          rows: [
            ["18/01 08:45", "YPF Panamericana Km 28", "Surt. 4", "AB123CD", "Diesel", "350", "Chofer: Gómez J."],
            ["19/01 14:20", "YPF Av. Gral. Paz 5600", "Surt. 2", "EF456GH", "Nafta Super", "80", "Chofer: Pérez M."],
            ["20/01 09:15", "YPF Panamericana Km 28", "Surt. 5", "IJ789KL", "Diesel", "280", "Chofer: Rodríguez A."],
            ["21/01 16:30", "YPF Av. Gral. Paz 5600", "Surt. 3", "MN012OP", "Nafta Super", "70", "Chofer: Fernández C."],
            ["22/01 11:00", "YPF Ruta 3 Km 25", "Surt. 1", "QR345ST", "Nafta Super", "55", "Chofer: López R."],
          ],
        },
        outputData: {
          headers: ["Vehículo", "Patente", "Tipo", "Total Litros", "Costo Total", "Rend. km/L", "Estado"],
          rows: [
            ["Camión Mercedes", "AB123CD", "Diesel", "350", "$135,520.00", "8.5", "Normal"],
            ["Camioneta Toyota", "EF456GH", "Nafta", "80", "$43,560.00", "12.3", "Normal"],
            ["Camión Iveco", "IJ789KL", "Diesel", "280", "$108,416.00", "9.2", "Normal"],
            ["Camioneta Ford", "MN012OP", "Nafta", "70", "$38,115.00", "11.8", "Normal"],
            ["Utilitario Fiat", "QR345ST", "Nafta", "55", "$29,947.50", "13.5", "Normal"],
          ],
        },
        aiReasoning: {
          summary: "Se procesó el detalle de cargas de combustible con información de estaciones, surtidores y operadores. Se validó el rendimiento de cada vehículo dentro de parámetros normales.",
          steps: [
            "1. Validación de remito: Coincidencia 100% con factura",
            "2. Registro de estaciones: 3 estaciones YPF utilizadas",
            "3. Identificación de operadores: 5 choferes registrados",
            "4. Cálculo de rendimiento: Todos los vehículos en rango normal",
            "5. Control de consumo: Sin alertas de consumo excesivo",
          ],
          confidence: 96,
          dataQuality: "Muy Alta - Trazabilidad completa de cargas",
        },
      },
      consolidatedResult: {
        dataSources: {
          mainDocument: "factura_combustible_flota_5632.pdf",
          relatedDocuments: ["remito_combustible_5632.pdf", "detalle_carga_por_vehiculo.pdf"],
          apiData: "ERP Sistema - Control Flota Vehicular",
          masterData: "Plan de Cuentas 2024 - Gastos Operativos",
        },
        datosGenerales: {
          documento: "Asiento Contable - Combustible Flota",
          estado: "Para confirmar",
          totalDebe: "$355,558.50",
          totalHaber: "$355,558.50",
        },
        outputData: {
          headers: ["Línea", "Cód. Cuenta", "Nombre Cuenta", "Debe", "Haber", "Vehículo", "Centro Costo", "Cód. Fiscal", "Ref."],
          rows: [
            ["1", "5301-001", "Combustible Diesel - Flota", "$112,000.00", "$0.00", "AB123CD", "CC-LOG-CAM", "IVA-21", "FC-5632-V1"],
            ["2", "5301-002", "Combustible Nafta - Flota", "$36,000.00", "$0.00", "EF456GH", "CC-LOG-CAM", "IVA-21", "FC-5632-V2"],
            ["3", "5301-001", "Combustible Diesel - Flota", "$89,600.00", "$0.00", "IJ789KL", "CC-LOG-CAM", "IVA-21", "FC-5632-V3"],
            ["4", "5301-002", "Combustible Nafta - Flota", "$31,500.00", "$0.00", "MN012OP", "CC-LOG-CAM", "IVA-21", "FC-5632-V4"],
            ["5", "5301-002", "Combustible Nafta - Flota", "$24,750.00", "$0.00", "QR345ST", "CC-LOG-UTI", "IVA-21", "FC-5632-V5"],
            ["6", "1110-001", "IVA Crédito Fiscal 21%", "$61,708.50", "$0.00", "", "CC-ADM", "IVA-21", "FC-5632-IVA"],
            ["7", "2101-020", "Proveedores - YPF Comercial SA", "$0.00", "$355,558.50", "", "CC-ADM", "", "PRV-54668997"],
          ],
        },
        aiReasoning: {
          summary: "Se consolidó el consumo de combustible de la flota vehicular integrando factura, remito y detalle por vehículo. El asistente distribuyó los costos por vehículo y validó rendimientos normales.",
          steps: [
            "1. Consolidación documental: Factura + Remito + Detalle de cargas",
            "2. Consulta API Control Flota: Verificación de patentes y choferes autorizados",
            "3. Validación de rendimientos: Todos los vehículos dentro de parámetros",
            "4. Distribución por vehículo: Asignación individual de costos",
            "5. Clasificación por tipo: Diesel (2 vehículos) vs Nafta (3 vehículos)",
            "6. Asignación de centros de costo: CC-LOG-CAM (camiones) y CC-LOG-UTI (utilitario)",
            "7. Cálculo fiscal: IVA 21% sobre $293,850",
            "8. Generación de asiento: Formato listo para sistema contable",
          ],
          dataSources: [
            { name: "Master Data - Plan Gastos Operativos", status: "OK", recordsUsed: 7 },
            { name: "API ERP - Control Flota", status: "OK", recordsUsed: 5 },
            { name: "Factura FC-5632", status: "OK", recordsUsed: 5 },
            { name: "Remito R-5632", status: "OK", recordsUsed: 5 },
            { name: "Detalle por Vehículo", status: "OK", recordsUsed: 5 },
          ],
          confidence: 96,
          dataQuality: "Muy Alta - Documentación completa con trazabilidad por vehículo y chofer",
        },
      },
    }
  }

  return null
}
