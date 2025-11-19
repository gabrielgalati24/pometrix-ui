"use client"

import type React from "react"
import { useState, useEffect, type CSSProperties, useId } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  FileText,
  Download,
  Send,
  Hash,
  RefreshCw,
  Database,
  FileStack,
  Globe,
  Check,
  Eye,
  EyeOff,
  Building2,
  ChevronDown,
  ChevronRight,
  Save,
  Undo2,
  Edit3,
  Layers,
  Brain,
  Settings,
  Upload,
  Maximize2,
  Minimize2,
  GripVertical,
} from "lucide-react"
import Link from "next/link"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers"
import { arrayMove, horizontalListSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { ColumnDef } from "@tanstack/react-table"
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ExtractedData {
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
  accountingEntry?: {
    dataSources: {
      mainDocument: string
      additionalDocuments: string[]
      apiData: string
      masterData: string
    }
    outputTable?: {
      headers: string[]
      rows: Array<Record<string, string | number>>
    }
    entries: Array<{
      account: string
      name: string
      debit: number
      credit: number
      description: string
      costCenter: string
      project: string
      taxCode?: string
    }>
  }
}

interface RelatedDocument {
  id: string
  filename: string
  type: string
}

interface DocumentResultsProps {
  documentId: string
  relatedDocuments?: RelatedDocument[]
}

const getMockData = (documentId: string): ExtractedData => {
  if (documentId === "3") {
    return {
      documentInfo: {
        type: "Tabla",
        number: "TBL-2024-001",
        date: "2024-01-20",
        filename: "reporte_ventas_mensual.pdf",
      },
      supplier: {
        name: "Sistema de Gestión Comercial",
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
      accountingEntry: {
        dataSources: {
          mainDocument: "reporte_ventas_mensual.pdf",
          additionalDocuments: [],
          apiData: "ERP Sistema - Proveedor Sistema de Gestión Comercial",
          masterData: "Plan de Cuentas 2024",
        },
        outputTable: {
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
              Haber: 0,
              "Centro Costo": "CC-VEN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "",
              Referencia: "COM-ENE-2024",
              Notas: "Comisión 5% sobre ventas netas",
            },
          ],
        },
        entries: [],
      },
    }
  }

  const isInvoice = Math.random() > 0.5

  if (isInvoice) {
    return {
      documentInfo: {
        type: "Factura",
        number: "FC-2024-001234",
        date: "2024-01-15",
        filename: "factura_distribuidora_001.pdf",
      },
      supplier: {
        name: "Distribuidora San Martín SA",
        cuit: "30-12345678-9",
        address: "Av. Corrientes 1234, CABA, Buenos Aires",
        phone: "+54 11 4567-8900",
        email: "ventas@distribuidorasanmartin.com.ar",
      },
      items: [
        {
          id: "1",
          description: "Resma A4 75g - Papel Blanco",
          quantity: 5,
          unitPrice: 2850,
          subtotal: 14250,
        },
        {
          id: "2",
          description: "Tóner HP LaserJet P1102",
          quantity: 2,
          unitPrice: 12500,
          subtotal: 25000,
        },
        {
          id: "3",
          description: "Carpetas Colgantes x50",
          quantity: 10,
          unitPrice: 890,
          subtotal: 8900,
        },
        {
          id: "4",
          description: "Marcadores Permanentes Set x12",
          quantity: 3,
          unitPrice: 1650,
          subtotal: 4950,
        },
      ],
      totals: {
        subtotal: 53100,
        iva: 11151,
        total: 64251,
      },
      accountingEntry: {
        dataSources: {
          mainDocument: "factura_001.pdf",
          additionalDocuments: ["remito_001.pdf", "orden_compra_001.pdf"],
          apiData: "ERP Sistema - Proveedor SUP-12345",
          masterData: "Plan de Cuentas 2024",
        },
        outputTable: {
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
              "Nombre Cuenta": "Mercaderías - Papelería",
              Debe: 14250,
              Haber: 0,
              "Centro Costo": "CC-ADMIN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "IVA-21",
              Referencia: "FC-2024-001234",
              Notas: "Compra de resmas",
            },
            {
              ID: "2",
              "Cód. Cuenta": "1105",
              "Nombre Cuenta": "Mercaderías - Insumos",
              Debe: 25000,
              Haber: 0,
              "Centro Costo": "CC-ADMIN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "IVA-21",
              Referencia: "FC-2024-001234",
              Notas: "Compra de tóner",
            },
            {
              ID: "3",
              "Cód. Cuenta": "1105",
              "Nombre Cuenta": "Mercaderías - Papelería",
              Debe: 8900,
              Haber: 0,
              "Centro Costo": "CC-ADMIN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "IVA-21",
              Referencia: "FC-2024-001234",
              Notas: "Compra de carpetas",
            },
            {
              ID: "4",
              "Cód. Cuenta": "1105",
              "Nombre Cuenta": "Mercaderías - Insumos",
              Debe: 4950,
              Haber: 0,
              "Centro Costo": "CC-ADMIN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "IVA-21",
              Referencia: "FC-2024-001234",
              Notas: "Compra de marcadores",
            },
            {
              ID: "5",
              "Cód. Cuenta": "1110",
              "Nombre Cuenta": "IVA Crédito Fiscal",
              Debe: 11151,
              Haber: 0,
              "Centro Costo": "CC-ADMIN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "IVA-21",
              Referencia: "FC-2024-001234",
              Notas: "IVA 21% sobre compra",
            },
            {
              ID: "6",
              "Cód. Cuenta": "2101",
              "Nombre Cuenta": "Proveedores",
              Debe: 0,
              Haber: 64251,
              "Centro Costo": "CC-ADMIN",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "",
              Referencia: "FC-2024-001234",
              Notas: "Pago a Distribuidora San Martín SA",
            },
          ],
        },
        entries: [
          {
            account: "1105",
            name: "Mercaderías",
            debit: 53100,
            credit: 0,
            description: "Compra de mercadería según factura FC-2024-001234",
            costCenter: "CC-ADMIN",
            project: "PRJ-2024-Q1",
            taxCode: "IVA-21",
          },
          {
            account: "1110",
            name: "IVA Crédito Fiscal",
            debit: 11151,
            credit: 0,
            description: "IVA 21% sobre compra",
            costCenter: "CC-ADMIN",
            project: "PRJ-2024-Q1",
            taxCode: "IVA-21",
          },
          {
            account: "2101",
            name: "Proveedores",
            debit: 0,
            credit: 64251,
            description: "Proveedor: Distribuidora San Martín SA - CUIT 30-12345678-9",
            costCenter: "CC-ADMIN",
            project: "PRJ-2024-Q1",
            taxCode: "",
          },
        ],
      },
    }
  } else {
    return {
      documentInfo: {
        type: "Remito",
        number: "RM-2024-005678",
        date: "2024-01-14",
        filename: "remito_logistica_002.pdf",
      },
      supplier: {
        name: "Logística del Sur SRL",
        cuit: "33-98765432-1",
        address: "Ruta 3 Km 45, Quilmes, Buenos Aires",
        phone: "+54 11 2345-6789",
        email: "operaciones@logisticadelsur.com.ar",
      },
      items: [
        {
          id: "1",
          description: "Cajas de Cartón 40x30x20cm",
          quantity: 50,
        },
        {
          id: "2",
          description: "Papel Bubble Rollo 1.5m x 50m",
          quantity: 3,
        },
        {
          id: "3",
          description: "Cintas Adhesivas Transparentes 48mm",
          quantity: 12,
        },
        {
          id: "4",
          description: "Etiquetas Adhesivas 10x5cm x1000",
          quantity: 5,
        },
      ],
      accountingEntry: {
        dataSources: {
          mainDocument: "remito_logistica_002.pdf",
          additionalDocuments: [],
          apiData: "ERP Sistema - Proveedor Logística del Sur SRL",
          masterData: "Plan de Cuentas 2024",
        },
        outputTable: {
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
              "Nombre Cuenta": "Mercaderías - Embalaje",
              Debe: 15000,
              Haber: 0,
              "Centro Costo": "CC-LOG",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "",
              Referencia: "RM-2024-005678",
              Notas: "Compra de cajas",
            },
            {
              ID: "2",
              "Cód. Cuenta": "1105",
              "Nombre Cuenta": "Mercaderías - Embalaje",
              Debe: 9000,
              Haber: 0,
              "Centro Costo": "CC-LOG",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "",
              Referencia: "RM-2024-005678",
              Notas: "Compra de papel bubble",
            },
            {
              ID: "3",
              "Cód. Cuenta": "1105",
              "Nombre Cuenta": "Mercaderías - Embalaje",
              Debe: 4800,
              Haber: 0,
              "Centro Costo": "CC-LOG",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "",
              Referencia: "RM-2024-005678",
              Notas: "Compra de cintas",
            },
            {
              ID: "4",
              "Cód. Cuenta": "1105",
              "Nombre Cuenta": "Mercaderías - Embalaje",
              Debe: 2500,
              Haber: 0,
              "Centro Costo": "CC-LOG",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "",
              Referencia: "RM-2024-005678",
              Notas: "Compra de etiquetas",
            },
            {
              ID: "5",
              "Cód. Cuenta": "1101",
              "Nombre Cuenta": "Caja y Bancos",
              Debe: 0,
              Haber: 31300,
              "Centro Costo": "CC-LOG",
              Proyecto: "PRJ-2024-Q1",
              "Cód. Impuesto": "",
              Referencia: "RM-2024-005678",
              Notas: "Pago a Logística del Sur SRL",
            },
          ],
        },
        entries: [
          {
            account: "1105",
            name: "Mercaderías",
            debit: 31300,
            credit: 0,
            description: "Compra de materiales de embalaje según remito RM-2024-005678",
            costCenter: "CC-LOG",
            project: "PRJ-2024-Q1",
          },
          {
            account: "1101",
            name: "Caja y Bancos",
            debit: 0,
            credit: 31300,
            description: "Pago a Logística del Sur SRL",
            costCenter: "CC-LOG",
            project: "PRJ-2024-Q1",
          },
        ],
      },
    }
  }
}

const getRelatedDocumentData = (docId: string): ExtractedData => {
  return {
    documentInfo: {
      type: "Remito",
      number: `RM-2024-00${docId}`,
      date: "2024-01-14",
      filename: "remito.pdf",
    },
    supplier: {
      name: "Distribuidora San Martín SA",
      cuit: "30-12345678-9",
      address: "Av. Corrientes 1234, CABA, Buenos Aires",
    },
    items: [
      {
        id: "1",
        description: "Resma A4 75g - Papel Blanco",
        quantity: 3,
      },
      {
        id: "2",
        description: "Tóner HP LaserJet P1102",
        quantity: 1,
      },
    ],
  }
}

const apiData = {
  supplier: {
    id: "SUP-12345",
    name: "Distribuidora San Martín SA",
    cuit: "30-12345678-9",
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

const masterData = [
  { code: "1105", name: "Mercaderías", type: "Activo", category: "Inventario" },
  { code: "1110", name: "IVA Crédito Fiscal", type: "Activo", category: "Impuestos" },
  { code: "2101", name: "Proveedores", type: "Pasivo", category: "Cuentas por Pagar" },
]

const EditableCell = ({
  value,
  rowIndex,
  columnId,
  onUpdate,
  isNumeric = false,
}: {
  value: string | number
  rowIndex: number
  columnId: string
  onUpdate: (rowIndex: number, columnId: string, value: string | number) => void
  isNumeric?: boolean
}) => {
  const [cellValue, setCellValue] = useState(value)
  const [isEditing, setIsEditing] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  useEffect(() => {
    setCellValue(value)
  }, [value])

  const handleBlur = () => {
    setIsEditing(false)
    if (isNumeric) {
      const numValue = typeof cellValue === "string" ? Number.parseFloat(cellValue) : cellValue
      onUpdate(rowIndex, columnId, isNaN(numValue) ? 0 : numValue)
    } else {
      onUpdate(rowIndex, columnId, cellValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur()
    } else if (e.key === "Escape") {
      setCellValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <Input
        type={isNumeric ? "number" : "text"}
        value={cellValue}
        onChange={(e) => setCellValue(isNumeric ? Number.parseFloat(e.target.value) || 0 : e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-7 w-full border-0 bg-transparent p-1 focus-visible:ring-1 focus-visible:ring-ring text-xs"
        autoFocus
      />
    )
  }

  return (
    <div
      className="cursor-pointer hover:bg-muted/50 p-1 rounded min-h-[28px] flex items-center"
      onClick={() => setIsEditing(true)}
      onDoubleClick={() => setIsEditing(true)}
    >
      {isNumeric && typeof value === "number" ? formatCurrency(value) : value}
    </div>
  )
}

const DraggableTableHeader = ({ header }: { header: any }) => {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: header.column.id,
  })

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition,
    whiteSpace: "nowrap",
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <TableHead
      ref={setNodeRef}
      className="before:bg-border relative h-10 border-t before:absolute before:inset-y-0 before:left-0 before:w-px first:before:bg-transparent"
      style={style}
    >
      <div className="flex items-center justify-start gap-0.5">
        <Button
          size="icon"
          variant="ghost"
          className="-ml-2 size-7 shadow-none"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="opacity-60" size={16} aria-hidden="true" />
        </Button>
        <span className="grow truncate text-xs font-medium text-muted-foreground">
          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
        </span>
      </div>
    </TableHead>
  )
}

const DragAlongCell = ({ cell }: { cell: any }) => {
  const { isDragging, setNodeRef, transform, transition } = useSortable({
    id: cell.column.id,
  })

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition,
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <TableCell ref={setNodeRef} className="truncate p-1" style={style}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  )
}

export function DocumentResults({ documentId, relatedDocuments = [] }: DocumentResultsProps) {
  const [activeTab, setActiveTab] = useState<string>(relatedDocuments.length > 0 ? "consolidated" : "main")
  const [data, setData] = useState<ExtractedData>(getMockData(documentId))
  const [editedData, setEditedData] = useState<ExtractedData>(getMockData(documentId))
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [isReprocessing, setIsReprocessing] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState({
    pdf: true,
    extracted: relatedDocuments.length > 0 ? false : true,
    accounting: true,
  })
  const [selectedPdfInConsolidated, setSelectedPdfInConsolidated] = useState<"main" | string>("main")
  const [expandedDataSources, setExpandedDataSources] = useState<Record<string, boolean>>({})
  const [expandedAIReasoning, setExpandedAIReasoning] = useState(false)
  const [isRetrainingDialogOpen, setIsRetrainingDialogOpen] = useState(false)
  const [retrainingInstructions, setRetrainingInstructions] = useState("")
  const [isAddDocumentsDialogOpen, setIsAddDocumentsDialogOpen] = useState(false)
  const { toast } = useToast()
  const [columnOrder, setColumnOrder] = useState<string[]>([])

  const dndContextId = useId()

  const accountingEntry = editedData.accountingEntry || data.accountingEntry

  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}))

  const [tableData, setTableData] = useState<Array<Record<string, string | number>>>(
    accountingEntry?.outputTable?.rows || [],
  )

  useEffect(() => {
    if (accountingEntry?.outputTable?.rows) {
      setTableData(accountingEntry.outputTable.rows)
      // Initialize column order with all headers
      if (columnOrder.length === 0) {
        setColumnOrder(accountingEntry.outputTable.headers)
      }
    }
  }, [accountingEntry?.outputTable?.rows])

  const updateTableData = (rowIndex: number, columnId: string, value: string | number) => {
    setTableData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...row,
            [columnId]: value,
          }
        }
        return row
      }),
    )
    setHasUnsavedChanges(true)
  }

  const columns: ColumnDef<Record<string, string | number>>[] =
    accountingEntry?.outputTable?.headers.map((header) => ({
      id: header,
      header: header,
      accessorKey: header,
      cell: ({ row, column }) => (
        <EditableCell
          value={row.getValue(column.id)}
          rowIndex={row.index}
          columnId={column.id}
          onUpdate={updateTableData}
          isNumeric={header.includes("Debe") || header.includes("Haber")}
        />
      ),
    })) || []

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string)
        const newIndex = columnOrder.indexOf(over.id as string)

        return arrayMove(columnOrder, oldIndex, newIndex)
      })
    }
  }

  // const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

  useEffect(() => {
    if (activeTab === "consolidated") {
      setVisibleColumns((prev) => ({ ...prev, extracted: false }))
    }
  }, [activeTab])

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
  }

  const isFieldEdited = (path: string): boolean => {
    const getNestedValue = (obj: any, path: string) => {
      return path.split(".").reduce((acc, part) => acc?.[part], obj)
    }
    return getNestedValue(data, path) !== getNestedValue(editedData, path)
  }

  const updateEditedData = (path: string, value: any) => {
    const pathParts = path.split(".")
    const newData = JSON.parse(JSON.stringify(editedData))

    let current = newData
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]]
    }
    current[pathParts[pathParts.length - 1]] = value

    setEditedData(newData)
    setHasUnsavedChanges(true)
  }

  const handleSaveChanges = () => {
    setData(editedData)
    setHasUnsavedChanges(false)
    toast({
      title: "Cambios guardados",
      description: "Los datos editados han sido guardados correctamente.",
    })
  }

  const handleRevertChanges = () => {
    setEditedData(data)
    setHasUnsavedChanges(false)
    setEditingField(null)
    toast({
      title: "Cambios revertidos",
      description: "Se han descartado todos los cambios no guardados.",
    })
  }

  const handleRevertField = (path: string) => {
    const pathParts = path.split(".")
    const newData = JSON.parse(JSON.stringify(editedData))
    const originalData = JSON.parse(JSON.stringify(data))

    let current = newData
    let original = originalData
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]]
      original = original[pathParts[i]]
    }
    current[pathParts[pathParts.length - 1]] = original[pathParts[pathParts.length - 1]]

    setEditedData(newData)

    const hasChanges = JSON.stringify(newData) !== JSON.stringify(data)
    setHasUnsavedChanges(hasChanges)
  }

  const handleReprocess = (step: "extraction" | "output") => {
    setIsReprocessing(true)
    toast({
      title: "Reprocesando...",
      description: `Reprocesando ${step === "extraction" ? "lectura del documento" : "salida final"}`,
    })

    setTimeout(() => {
      setIsReprocessing(false)
      const newData = getMockData(documentId)
      setData(newData)
      setEditedData(newData)
      setHasUnsavedChanges(false)
      toast({
        title: "Reprocesamiento completado",
        description: "Los datos han sido actualizados.",
      })
    }, 2000)
  }

  const handleExport = () => {
    toast({
      title: "Exportando a Excel",
      description: "El archivo se descargará en unos momentos.",
    })
  }

  const handleSendToSystem = () => {
    toast({
      title: "Enviando al sistema",
      description: "Los datos se están integrando con el sistema contable.",
    })
  }

  const handleSubmitRetraining = () => {
    if (!retrainingInstructions.trim()) {
      toast({
        title: "Instrucciones requeridas",
        description: "Por favor ingresa instrucciones para reentrenar el modelo.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Reentrenamiento iniciado",
      description: "El modelo se reentrenará con las nuevas instrucciones y se aplicará en el próximo procesamiento.",
    })

    console.log("[v0] Retraining instructions:", retrainingInstructions)

    setIsRetrainingDialogOpen(false)
    setRetrainingInstructions("")
  }

  const handleAddDocuments = () => {
    toast({
      title: "Documentos agregados",
      description: "Los nuevos documentos se procesarán y agregarán a la vista consolidada.",
    })
    setIsAddDocumentsDialogOpen(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  const toggleColumn = (column: "pdf" | "extracted" | "accounting") => {
    if (column === "extracted" && activeTab === "consolidated") {
      return
    }

    const newVisibility = { ...visibleColumns, [column]: !visibleColumns[column] }
    const visibleCount = Object.values(newVisibility).filter(Boolean).length
    if (visibleCount > 0) {
      setVisibleColumns(newVisibility)
    } else {
      toast({
        title: "Al menos una columna debe estar visible",
        variant: "destructive",
      })
    }
  }

  const toggleDataSource = (source: string) => {
    setExpandedDataSources((prev) => ({
      ...prev,
      [source]: !prev[source],
    }))
  }

  const toggleAIReasoning = () => {
    setExpandedAIReasoning((prev) => !prev)
  }

  const getGridCols = () => {
    const count = Object.values(visibleColumns).filter(Boolean).length
    if (count === 1) return "lg:grid-cols-1"
    if (count === 2) return "lg:grid-cols-2"
    return "lg:grid-cols-3"
  }

  const getDataForActiveTab = (): ExtractedData => {
    if (activeTab === "consolidated" || activeTab === "main") {
      return editedData
    }
    // For related document tabs
    return getRelatedDocumentData(activeTab)
  }

  const getPdfFilename = (): string => {
    if (activeTab === "consolidated") {
      if (selectedPdfInConsolidated === "main") {
        return data.documentInfo.filename
      }
      const relatedDoc = relatedDocuments.find((d) => d.id === selectedPdfInConsolidated)
      return relatedDoc?.filename || "documento.pdf"
    } else if (activeTab === "main") {
      return data.documentInfo.filename
    } else {
      // Related document tab
      const relatedDoc = relatedDocuments.find((d) => d.id === activeTab)
      return relatedDoc?.filename || "documento.pdf"
    }
  }

  const currentData = getDataForActiveTab()

  const EditableField = ({
    value,
    path,
    type = "text",
    className = "",
  }: {
    value: string | number
    path: string
    type?: "text" | "number"
    className?: string
  }) => {
    const isEditing = editingField === path
    const isEdited = isFieldEdited(path)

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            type={type}
            value={value}
            onChange={(e) =>
              updateEditedData(path, type === "number" ? Number.parseFloat(e.target.value) : e.target.value)
            }
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setEditingField(null)
              if (e.key === "Escape") {
                handleRevertField(path)
                setEditingField(null)
              }
            }}
            autoFocus
            className="h-6 text-xs"
          />
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1 group">
        <span
          onClick={() => setEditingField(path)}
          className={`cursor-pointer hover:bg-muted/50 px-1 rounded transition-colors ${
            isEdited ? "bg-blue-500/10 border border-blue-500/30" : ""
          } ${className}`}
        >
          {value}
        </span>
        <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        {isEdited && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRevertField(path)}
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
          >
            <Undo2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Documento {documentId}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAddDocumentsDialogOpen} onOpenChange={setIsAddDocumentsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Agregar Documentos
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Agregar Documentos Adicionales
                  </DialogTitle>
                  <DialogDescription>
                    Sube más documentos relacionados para incluirlos en el análisis consolidado.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-3">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-sm font-medium">Arrastra archivos aquí o haz clic para seleccionar</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG hasta 10MB</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Seleccionar Archivos
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDocumentsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddDocuments}>Agregar y Procesar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {hasUnsavedChanges && (
              <>
                <Badge variant="secondary" className="gap-1">
                  <Edit3 className="h-3 w-3" />
                  Cambios sin guardar
                </Badge>
                <Button variant="outline" size="sm" onClick={handleRevertChanges}>
                  <Undo2 className="mr-2 h-4 w-4" />
                  Revertir
                </Button>
                <Button size="sm" onClick={handleSaveChanges}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {relatedDocuments.length > 0 ? (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="pb-0">
                <TabsList
                  className="grid w-full"
                  style={{
                    gridTemplateColumns: `repeat(${2 + relatedDocuments.length}, 1fr)`,
                  }}
                >
                  <TabsTrigger value="consolidated" className="gap-2">
                    <Layers className="h-4 w-4" />
                    Consolidado
                  </TabsTrigger>
                  <TabsTrigger value="main" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Doc. Principal
                  </TabsTrigger>
                  {relatedDocuments.map((doc, idx) => (
                    <TabsTrigger key={doc.id} value={doc.id} className="gap-2">
                      <FileStack className="h-4 w-4" />
                      Relacionado {idx + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Consolidated View */}
              <TabsContent value="consolidated" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between gap-4 items-center">
                      <div>
                        <CardTitle>Documentos originales vs Resultado del Asistente</CardTitle>
                        <CardDescription>Vista consolidada de todos los documentos</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={visibleColumns.pdf ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleColumn("pdf")}
                          className="gap-2"
                        >
                          {visibleColumns.pdf ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          Documento
                        </Button>
                        <Button
                          variant={visibleColumns.extracted ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleColumn("extracted")}
                          className="gap-2"
                          disabled={activeTab === "consolidated"}
                        >
                          {visibleColumns.extracted ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          Datos
                        </Button>
                        <Button
                          variant={visibleColumns.accounting ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleColumn("accounting")}
                          className="gap-2"
                        >
                          {visibleColumns.accounting ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          Resultado
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <div className={`grid gap-4 ${getGridCols()}`}>
                  {/* Column 1: PDF Original - with selector in consolidated view */}
                  {visibleColumns.pdf && (
                    <Card className="lg:col-span-1">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <FileText className="h-4 w-4" />
                          Documentos Originales
                        </CardTitle>
                        <div className="flex gap-1 mt-3">
                          <Button
                            variant={selectedPdfInConsolidated === "main" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedPdfInConsolidated("main")}
                            className="flex-1 text-xs h-8"
                          >
                            Principal
                          </Button>
                          {relatedDocuments.map((doc, idx) => (
                            <Button
                              key={doc.id}
                              variant={selectedPdfInConsolidated === doc.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedPdfInConsolidated(doc.id)}
                              className="flex-1 text-xs h-8"
                            >
                              Rel. {idx + 1}
                            </Button>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                          <div className="text-center space-y-2">
                            <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
                            <p className="text-xs text-muted-foreground px-2">{getPdfFilename()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Column 2: Datos Leídos - always shows consolidated data */}
                  {visibleColumns.extracted && (
                    <Card className="lg:col-span-1">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Hash className="h-4 w-4" />
                            Datos Leídos (Consolidado)
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReprocess("extraction")}
                            disabled={isReprocessing}
                          >
                            <RefreshCw className={`h-3 w-3 ${isReprocessing ? "animate-spin" : ""}`} />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Priorizando información del documento principal
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Add table rendering for extracted data when table exists */}
                        {currentData.table && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">TABLA DE DATOS</p>
                            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                              <table className="w-full text-xs border-collapse">
                                <thead className="sticky top-0 bg-background">
                                  <tr className="border-b">
                                    {currentData.table.headers.map((header, idx) => (
                                      <th
                                        key={idx}
                                        className="text-left p-2 font-medium text-muted-foreground bg-muted/30"
                                      >
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {currentData.table.rows.map((row, rowIdx) => (
                                    <tr key={rowIdx} className="border-b hover:bg-muted/20">
                                      {currentData.table.headers.map((header, colIdx) => (
                                        <td key={colIdx} className="p-2">
                                          {typeof row[header] === "number" &&
                                          (header.includes("Precio") ||
                                            header.includes("Total") ||
                                            header.includes("Subtotal") ||
                                            header.includes("IVA"))
                                            ? formatCurrency(row[header] as number)
                                            : row[header]}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Document Info */}
                        <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tipo:</span>
                            <Badge variant="outline" className="text-xs">
                              {currentData.documentInfo.type}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Número:</span>
                            <EditableField
                              value={currentData.documentInfo.number}
                              path="documentInfo.number"
                              className="font-mono text-xs"
                            />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Fecha:</span>
                            <EditableField
                              value={currentData.documentInfo.date}
                              path="documentInfo.date"
                              className="text-xs"
                            />
                          </div>
                        </div>

                        {/* Supplier */}
                        <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            PROVEEDOR
                          </p>
                          <div className="space-y-1">
                            <EditableField
                              value={currentData.supplier.name}
                              path="supplier.name"
                              className="font-medium text-sm block w-full"
                            />
                            <EditableField
                              value={currentData.supplier.cuit}
                              path="supplier.cuit"
                              className="font-mono text-xs text-muted-foreground block"
                            />
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            ITEMS ({currentData.items.length})
                          </p>
                          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                            {currentData.items.map((item, idx) => (
                              <div key={item.id} className="p-2 bg-muted/30 rounded text-xs space-y-1">
                                <EditableField
                                  value={item.description}
                                  path={`items.${idx}.description`}
                                  className="font-medium leading-tight block w-full"
                                />
                                <div className="flex justify-between text-muted-foreground items-center">
                                  <div className="flex items-center gap-1">
                                    <span>Cant:</span>
                                    <EditableField value={item.quantity} path={`items.${idx}.quantity`} type="number" />
                                  </div>
                                  {item.unitPrice && (
                                    <EditableField
                                      value={formatCurrency(item.unitPrice)}
                                      path={`items.${idx}.unitPrice`}
                                      type="number"
                                      className="font-mono"
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Totals */}
                        {currentData.totals && (
                          <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <div className="flex justify-between text-sm items-center">
                              <span>Subtotal:</span>
                              <EditableField
                                value={formatCurrency(currentData.totals.subtotal)}
                                path="totals.subtotal"
                                type="number"
                                className="font-mono text-xs"
                              />
                            </div>
                            <div className="flex justify-between text-sm items-center">
                              <span>IVA:</span>
                              <EditableField
                                value={formatCurrency(currentData.totals.iva)}
                                path="totals.iva"
                                type="number"
                                className="font-mono text-xs"
                              />
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-sm items-center">
                              <span>Total:</span>
                              <EditableField
                                value={formatCurrency(currentData.totals.total)}
                                path="totals.total"
                                type="number"
                                className="font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Column 3: Salida Final */}
                  {visibleColumns.accounting && (
                    <div className={getGridCols()}>
                      <Card className="h-fit">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between font-semibold">
                            {/* In the consolidated tab, change "Asiento Contable" to "Salida" */}
                            <CardTitle className="text-sm font-medium">Resultado del Asisnte</CardTitle>
                            {accountingEntry.outputTable && activeTab === "consolidated" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (visibleColumns.pdf) {
                                    // Expanding: hide PDF and Datos
                                    setVisibleColumns({
                                      pdf: false,
                                      extracted: false,
                                      accounting: true,
                                    })
                                  } else {
                                    // Minimizing: show PDF again
                                    setVisibleColumns({
                                      pdf: true,
                                      extracted: false,
                                      accounting: true,
                                    })
                                  }
                                }}
                                className="h-8 w-8 p-0"
                              >
                                {visibleColumns.pdf ? (
                                  <Maximize2 className="h-4 w-4" />
                                ) : (
                                  <Minimize2 className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {accountingEntry.outputTable && tableData.length > 0 ? (
                            <div className="space-y-2">
                              <Collapsible
                                open={expandedDataSources.allSources}
                                onOpenChange={() => toggleDataSource("allSources")}
                              >
                                <CollapsibleTrigger className="w-full">
                                  <div className="flex items-start gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded text-xs transition-colors">
                                    <Database className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0 text-left">
                                      <p className="font-medium">Fuentes de datos</p>
                                    </div>
                                    {expandedDataSources.allSources ? (
                                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                    )}
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-2 ml-1 space-y-1.5">
                                  <div className="flex items-start gap-2 p-2 bg-muted/20 rounded text-xs">
                                    <Globe className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                    <div className="min-w-0">
                                      <p className="font-medium">API Externa</p>
                                      <p className="text-muted-foreground">Sistema ERP</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2 p-2 bg-muted/20 rounded text-xs">
                                    <Database className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                    <div className="min-w-0">
                                      <p className="font-medium">Master Data</p>
                                      <p className="text-muted-foreground">Plan de cuentas 2024</p>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>

                              <div className="overflow-x-auto">
                                <DndContext
                                  id={dndContextId}
                                  collisionDetection={closestCenter}
                                  modifiers={[restrictToHorizontalAxis]}
                                  onDragEnd={handleDragEnd}
                                  sensors={sensors}
                                >
                                  <Table>
                                    <TableHeader>
                                      {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id} className="bg-muted/30">
                                          <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                                            {headerGroup.headers.map((header) => (
                                              <DraggableTableHeader key={header.id} header={header} />
                                            ))}
                                          </SortableContext>
                                        </TableRow>
                                      ))}
                                    </TableHeader>
                                    <TableBody>
                                      {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                          <TableRow key={row.id} className="hover:bg-muted/20">
                                            {row.getVisibleCells().map((cell) => (
                                              <SortableContext
                                                key={cell.id}
                                                items={columnOrder}
                                                strategy={horizontalListSortingStrategy}
                                              >
                                                <DragAlongCell key={cell.id} cell={cell} />
                                              </SortableContext>
                                            ))}
                                          </TableRow>
                                        ))
                                      ) : (
                                        <TableRow>
                                          <TableCell colSpan={columns.length} className="h-24 text-center">
                                            No hay datos disponibles.
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </DndContext>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {/* Data Sources */}
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">FUENTES DE DATOS</p>
                                <div className="space-y-1.5">
                                  {/* Main Document */}
                                  <div className="flex items-start gap-2 p-2 bg-muted/30 rounded text-xs">
                                    <FileText className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                    <div className="min-w-0">
                                      <p className="font-medium">Doc. Principal</p>
                                      <p className="text-muted-foreground truncate">
                                        {accountingEntry.dataSources.mainDocument}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Additional Documents - Expandable */}
                                  {accountingEntry.dataSources.additionalDocuments.length > 0 && (
                                    <Collapsible
                                      open={expandedDataSources.additionalDocs}
                                      onOpenChange={() => toggleDataSource("additionalDocs")}
                                    >
                                      <CollapsibleTrigger className="w-full">
                                        <div className="flex items-start gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded text-xs transition-colors">
                                          <FileStack className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                          <div className="flex-1 min-w-0 text-left">
                                            <p className="font-medium">Docs. Adicionales</p>
                                            <p className="text-muted-foreground">
                                              {accountingEntry.dataSources.additionalDocuments.length} archivo
                                              {accountingEntry.dataSources.additionalDocuments.length > 1 ? "s" : ""}
                                            </p>
                                          </div>
                                          {expandedDataSources.additionalDocs ? (
                                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                          ) : (
                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                          )}
                                        </div>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent className="mt-1 ml-5 space-y-1">
                                        {accountingEntry.dataSources.additionalDocuments.map((filename, idx) => (
                                          <button
                                            key={idx}
                                            onClick={() => setSelectedPdfInConsolidated(relatedDocuments[idx]?.id)}
                                            className="w-full p-2 bg-muted/20 hover:bg-muted/40 rounded text-xs flex items-center gap-2 transition-colors"
                                          >
                                            <FileText className="h-3 w-3 text-muted-foreground" />
                                            <span className="flex-1 text-left truncate">{filename}</span>
                                            <Eye className="h-3 w-3 text-primary" />
                                          </button>
                                        ))}
                                      </CollapsibleContent>
                                    </Collapsible>
                                  )}

                                  {/* API Data - Expandable */}
                                  <Collapsible
                                    open={expandedDataSources.api}
                                    onOpenChange={() => toggleDataSource("api")}
                                  >
                                    <CollapsibleTrigger className="w-full">
                                      <div className="flex items-start gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded text-xs transition-colors">
                                        <Globe className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0 text-left">
                                          <p className="font-medium">API Externa</p>
                                          <p className="text-muted-foreground">Sistema ERP</p>
                                        </div>
                                        {expandedDataSources.api ? (
                                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                        )}
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-1 ml-5">
                                      <div className="p-2 bg-muted/20 rounded text-xs space-y-1.5">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">ID Proveedor:</span>
                                          <span className="font-mono">{apiData.supplier.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Condición Pago:</span>
                                          <span>{apiData.supplier.paymentTerms}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Límite Crédito:</span>
                                          <span className="font-mono">
                                            {formatCurrency(apiData.supplier.creditLimit)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Última Act.:</span>
                                          <span className="text-xs">{apiData.supplier.lastUpdate}</span>
                                        </div>
                                        <Separator className="my-1" />
                                        <p className="text-muted-foreground font-medium">Cuentas Asignadas:</p>
                                        <div className="space-y-0.5 pl-2">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Compras:</span>
                                            <span className="font-mono">{apiData.accounts.purchases}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">IVA:</span>
                                            <span className="font-mono">{apiData.accounts.vat}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Proveedores:</span>
                                            <span className="font-mono">{apiData.accounts.payables}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>

                                  {/* Master Data - Expandable */}
                                  <Collapsible
                                    open={expandedDataSources.masterData}
                                    onOpenChange={() => toggleDataSource("masterData")}
                                  >
                                    <CollapsibleTrigger className="w-full">
                                      <div className="flex items-start gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded text-xs transition-colors">
                                        <Database className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0 text-left">
                                          <p className="font-medium">Master Data</p>
                                          <p className="text-muted-foreground">Plan de cuentas 2024</p>
                                        </div>
                                        {expandedDataSources.masterData ? (
                                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                        )}
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-1 ml-5">
                                      <div className="space-y-1">
                                        {masterData.map((account) => (
                                          <div
                                            key={account.code}
                                            className="p-2 bg-muted/20 rounded text-xs space-y-0.5"
                                          >
                                            <div className="flex items-center justify-between">
                                              <span className="font-mono font-medium">{account.code}</span>
                                              <Badge variant="outline" className="text-xs">
                                                {account.type}
                                              </Badge>
                                            </div>
                                            <p className="font-medium">{account.name}</p>
                                            <p className="text-muted-foreground">{account.category}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                </div>
                              </div>

                              {/* AI Reasoning */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  {/* Change "ASIENTO" to "SALIDA" */}
                                  <p className="text-xs font-medium text-muted-foreground">SALIDA</p>
                                  <div className="flex items-center gap-1">
                                    {accountingEntry.outputTable && activeTab === "consolidated" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          if (visibleColumns.pdf) {
                                            // Expanding: hide PDF and Datos
                                            setVisibleColumns({
                                              pdf: false,
                                              extracted: false,
                                              accounting: true,
                                            })
                                          } else {
                                            // Minimizing: show PDF again
                                            setVisibleColumns({
                                              pdf: true,
                                              extracted: false,
                                              accounting: true,
                                            })
                                          }
                                        }}
                                        className="h-8 w-8 p-0"
                                      >
                                        {visibleColumns.pdf ? (
                                          <Maximize2 className="h-4 w-4" />
                                        ) : (
                                          <Minimize2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    )}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                          <Settings className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setExpandedAIReasoning(true)}>
                                          <Brain className="h-4 w-4 mr-2" />
                                          Ver Razonamiento IA
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setIsRetrainingDialogOpen(true)}>
                                          <Settings className="h-4 w-4 mr-2" />
                                          Reentrenar IA
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>

                                <Dialog open={expandedAIReasoning} onOpenChange={setExpandedAIReasoning}>
                                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <Brain className="h-5 w-5 text-primary" />
                                        Razonamiento IA
                                      </DialogTitle>
                                      {/* Update dialog description */}
                                      <DialogDescription>
                                        Proceso de análisis utilizado para generar la salida
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3 py-4">
                                      <p className="text-xs font-medium text-muted-foreground mb-3">
                                        PROCESO DE ANÁLISIS
                                      </p>

                                      {/* Step 1: Field Extraction */}
                                      <div className="space-y-2 pb-3 border-b">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                            1
                                          </span>
                                          Extracción de Campos
                                        </p>
                                        <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                          <div className="flex justify-between">
                                            <span>• Proveedor:</span>
                                            <Badge variant="outline" className="text-xs">
                                              98% confianza
                                            </Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>• Monto Total:</span>
                                            <Badge variant="outline" className="text-xs">
                                              99% confianza
                                            </Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>• Fecha:</span>
                                            <Badge variant="outline" className="text-xs">
                                              95% confianza
                                            </Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>• CUIT:</span>
                                            <Badge variant="outline" className="text-xs">
                                              97% confianza
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Step 2: Validation */}
                                      <div className="space-y-2 pb-3 border-b">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                            2
                                          </span>
                                          Validaciones
                                        </p>
                                        <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                          <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span>Formato de CUIT válido</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span>Fecha dentro del período fiscal</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span>Monto coincide con suma de ítems</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Step 3: Account Mapping */}
                                      <div className="space-y-2 pb-3 border-b">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                            3
                                          </span>
                                          Mapeo de Cuentas
                                        </p>
                                        <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                          <div>
                                            <span className="font-medium">Cuenta 1105 (Mercaderías):</span>
                                            <p className="text-xs mt-1">
                                              Seleccionada por tipo de documento (Factura) y categoría de productos
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium">Cuenta 2101 (Proveedores):</span>
                                            <p className="text-xs mt-1">
                                              Asignada automáticamente para cuentas por pagar a proveedores
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium">Cuenta 1106 (IVA Crédito Fiscal):</span>
                                            <p className="text-xs mt-1">
                                              Calculada según alícuota de IVA detectada (21%)
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Step 4: Data Source Prioritization */}
                                      <div className="space-y-2">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                            4
                                          </span>
                                          Priorización de Fuentes
                                        </p>
                                        <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">1.</span>
                                            <span>Documento principal (mayor confiabilidad)</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">2.</span>
                                            <span>Documentos relacionados (validación cruzada)</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">3.</span>
                                            <span>Datos históricos del proveedor</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Dialog open={isRetrainingDialogOpen} onOpenChange={setIsRetrainingDialogOpen}>
                                  <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-primary" />
                                        Reentrenar Modelo
                                      </DialogTitle>
                                      {/* Update retraining dialog description */}
                                      <DialogDescription>
                                        Ingresa instrucciones para mejorar cómo el modelo genera la salida. Estas
                                        instrucciones se aplicarán en futuros procesamientos.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <Textarea
                                        placeholder="Ejemplo: Siempre usar la cuenta 1105 para compras de mercadería. Priorizar datos del documento principal sobre documentos relacionados..."
                                        value={retrainingInstructions}
                                        onChange={(e) => setRetrainingInstructions(e.target.value)}
                                        className="min-h-[150px]"
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setIsRetrainingDialogOpen(false)}>
                                        Cancelar
                                      </Button>
                                      <Button onClick={handleSubmitRetraining}>Confirmar Reentrenamiento</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          )}

                          {/* Validation */}
                          {currentData.totals && (
                            <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                                <div className="text-xs">
                                  <p className="font-medium text-success">Validación Exitosa</p>
                                  <p className="text-muted-foreground mt-1">
                                    Los totales coinciden con los datos leídos del documento
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Main Document View */}
              <TabsContent value="main" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between gap-4 items-center">
                      <div>
                        <CardTitle>Documento original vs Datos Leídos vs Resultado del Asistente</CardTitle>
                        <CardDescription>{data.documentInfo.filename}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={visibleColumns.pdf ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleColumn("pdf")}
                          className="gap-2"
                        >
                          {visibleColumns.pdf ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          Documento
                        </Button>
                        <Button
                          variant={visibleColumns.extracted ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleColumn("extracted")}
                          className="gap-2"
                        >
                          {visibleColumns.extracted ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          Datos
                        </Button>
                        <Button
                          variant={visibleColumns.accounting ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleColumn("accounting")}
                          className="gap-2"
                        >
                          {visibleColumns.accounting ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          Resultado
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                <div className={`grid gap-4 ${getGridCols()}`}>
                  {visibleColumns.pdf && (
                    <Card className="lg:col-span-1">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <FileText className="h-4 w-4" />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            class="lucide lucide-file-text h-4 w-4"
                          >
                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                            <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                            <path d="M10 9H8"></path>
                            <path d="M16 13H8"></path>
                            <path d="M16 17H8"></path>
                          </svg>
                          Documento original
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                          <div className="text-center space-y-2">
                            <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
                            <p className="text-xs text-muted-foreground px-2">{data.documentInfo.filename}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {visibleColumns.extracted && (
                    <Card className="lg:col-span-1">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Hash className="h-4 w-4" />
                            Datos Leídos (Principal)
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReprocess("extraction")}
                            disabled={isReprocessing}
                          >
                            <RefreshCw className={`h-3 w-3 ${isReprocessing ? "animate-spin" : ""}`} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Add table rendering for extracted data when table exists */}
                        {currentData.table && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">TABLA DE DATOS</p>
                            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                              <table className="w-full text-xs border-collapse">
                                <thead className="sticky top-0 bg-background">
                                  <tr className="border-b">
                                    {currentData.table.headers.map((header, idx) => (
                                      <th
                                        key={idx}
                                        className="text-left p-2 font-medium text-muted-foreground bg-muted/30"
                                      >
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {currentData.table.rows.map((row, rowIdx) => (
                                    <tr key={rowIdx} className="border-b hover:bg-muted/20">
                                      {currentData.table.headers.map((header, colIdx) => (
                                        <td key={colIdx} className="p-2">
                                          {typeof row[header] === "number" &&
                                          (header.includes("Precio") ||
                                            header.includes("Total") ||
                                            header.includes("Subtotal") ||
                                            header.includes("IVA"))
                                            ? formatCurrency(row[header] as number)
                                            : row[header]}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tipo:</span>
                            <Badge variant="outline" className="text-xs">
                              {currentData.documentInfo.type}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Número:</span>
                            <EditableField
                              value={currentData.documentInfo.number}
                              path="documentInfo.number"
                              className="font-mono text-xs"
                            />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Fecha:</span>
                            <EditableField
                              value={currentData.documentInfo.date}
                              path="documentInfo.date"
                              className="text-xs"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> PROVEEDOR
                          </p>
                          <div className="space-y-1">
                            <EditableField
                              value={currentData.supplier.name}
                              path="supplier.name"
                              className="font-medium text-sm block w-full"
                            />
                            <EditableField
                              value={currentData.supplier.cuit}
                              path="supplier.cuit"
                              className="font-mono text-xs text-muted-foreground block"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            ITEMS ({currentData.items.length})
                          </p>
                          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                            {currentData.items.map((item, idx) => (
                              <div key={item.id} className="p-2 bg-muted/30 rounded text-xs space-y-1">
                                <EditableField
                                  value={item.description}
                                  path={`items.${idx}.description`}
                                  className="font-medium leading-tight block w-full"
                                />
                                <div className="flex justify-between text-muted-foreground items-center">
                                  <div className="flex items-center gap-1">
                                    <span>Cant:</span>
                                    <EditableField value={item.quantity} path={`items.${idx}.quantity`} type="number" />
                                  </div>
                                  {item.unitPrice && (
                                    <EditableField
                                      value={formatCurrency(item.unitPrice)}
                                      path={`items.${idx}.unitPrice`}
                                      type="number"
                                      className="font-mono"
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {currentData.totals && (
                          <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <div className="flex justify-between text-sm items-center">
                              <span>Subtotal:</span>
                              <EditableField
                                value={formatCurrency(currentData.totals.subtotal)}
                                path="totals.subtotal"
                                type="number"
                                className="font-mono text-xs"
                              />
                            </div>
                            <div className="flex justify-between text-sm items-center">
                              <span>IVA:</span>
                              <EditableField
                                value={formatCurrency(currentData.totals.iva)}
                                path="totals.iva"
                                type="number"
                                className="font-mono text-xs"
                              />
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-sm items-center">
                              <span>Total:</span>
                              <EditableField
                                value={formatCurrency(currentData.totals.total)}
                                path="totals.total"
                                type="number"
                                className="font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  {visibleColumns.accounting && (
                    <Card className="lg:col-span-1">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Database className="h-4 w-4" />
                            Resultado del Asistente
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReprocess("output")}
                            disabled={isReprocessing}
                          >
                            <RefreshCw className={`h-3 w-3 ${isReprocessing ? "animate-spin" : ""}`} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Data Sources */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">FUENTES DE DATOS</p>
                          <div className="space-y-1.5">
                            <div className="flex items-start gap-2 p-2 bg-muted/30 rounded text-xs">
                              <FileText className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium">Doc. Principal</p>
                                <p className="text-muted-foreground truncate">
                                  {accountingEntry.dataSources.mainDocument}
                                </p>
                              </div>
                            </div>
                            {accountingEntry.dataSources.additionalDocuments.length > 0 && (
                              <Collapsible
                                open={expandedDataSources.additionalDocs}
                                onOpenChange={() => toggleDataSource("additionalDocs")}
                              >
                                <CollapsibleTrigger className="w-full">
                                  <div className="flex items-start gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded text-xs transition-colors">
                                    <FileStack className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0 text-left">
                                      <p className="font-medium">Docs. Adicionales</p>
                                      <p className="text-muted-foreground">
                                        {accountingEntry.dataSources.additionalDocuments.length} archivo
                                        {accountingEntry.dataSources.additionalDocuments.length > 1 ? "s" : ""}
                                      </p>
                                    </div>
                                    {expandedDataSources.additionalDocs ? (
                                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                    )}
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-1 ml-5 space-y-1">
                                  {accountingEntry.dataSources.additionalDocuments.map((filename, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => setSelectedPdfInConsolidated(relatedDocuments[idx]?.id)}
                                      className="w-full p-2 bg-muted/20 hover:bg-muted/40 rounded text-xs flex items-center gap-2 transition-colors"
                                    >
                                      <FileText className="h-3 w-3 text-muted-foreground" />
                                      <span className="flex-1 text-left truncate">{filename}</span>
                                      <Eye className="h-3 w-3 text-primary" />
                                    </button>
                                  ))}
                                </CollapsibleContent>
                              </Collapsible>
                            )}
                            <Collapsible open={expandedDataSources.api} onOpenChange={() => toggleDataSource("api")}>
                              <CollapsibleTrigger className="w-full">
                                <div className="flex items-start gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded text-xs transition-colors">
                                  <Globe className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className="font-medium">API Externa</p>
                                    <p className="text-muted-foreground">Sistema ERP</p>
                                  </div>
                                  {expandedDataSources.api ? (
                                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-1 ml-5">
                                <div className="p-2 bg-muted/20 rounded text-xs space-y-1.5">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">ID Proveedor:</span>
                                    <span className="font-mono">{apiData.supplier.id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Condición Pago:</span>
                                    <span>{apiData.supplier.paymentTerms}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Límite Crédito:</span>
                                    <span className="font-mono">{formatCurrency(apiData.supplier.creditLimit)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Última Act.:</span>
                                    <span className="text-xs">{apiData.supplier.lastUpdate}</span>
                                  </div>
                                  <Separator className="my-1" />
                                  <p className="text-muted-foreground font-medium">Cuentas Asignadas:</p>
                                  <div className="space-y-0.5 pl-2">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Compras:</span>
                                      <span className="font-mono">{apiData.accounts.purchases}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">IVA:</span>
                                      <span className="font-mono">{apiData.accounts.vat}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Proveedores:</span>
                                      <span className="font-mono">{apiData.accounts.payables}</span>
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                            <Collapsible
                              open={expandedDataSources.masterData}
                              onOpenChange={() => toggleDataSource("masterData")}
                            >
                              <CollapsibleTrigger className="w-full">
                                <div className="flex items-start gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded text-xs transition-colors">
                                  <Database className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className="font-medium">Master Data</p>
                                    <p className="text-muted-foreground">Plan de cuentas 2024</p>
                                  </div>
                                  {expandedDataSources.masterData ? (
                                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-1 ml-5">
                                <div className="space-y-1">
                                  {masterData.map((account) => (
                                    <div key={account.code} className="p-2 bg-muted/20 rounded text-xs space-y-0.5">
                                      <div className="flex items-center justify-between">
                                        <span className="font-mono font-medium">{account.code}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {account.type}
                                        </Badge>
                                      </div>
                                      <p className="font-medium">{account.name}</p>
                                      <p className="text-muted-foreground">{account.category}</p>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground">ASIENTO</p>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                                    <Brain className="h-3 w-3 mr-1" />
                                    Ver Razonamiento IA
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <Brain className="h-5 w-5 text-primary" />
                                      Razonamiento IA
                                    </DialogTitle>
                                    <DialogDescription>
                                      Proceso de análisis utilizado para generar el asiento contable
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-3 py-4">
                                    <p className="text-xs font-medium text-muted-foreground mb-3">
                                      PROCESO DE ANÁLISIS
                                    </p>
                                    {/* Step 1: Field Extraction */}
                                    <div className="space-y-2 pb-3 border-b">
                                      <p className="text-sm font-medium flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                          1
                                        </span>
                                        Extracción de Campos
                                      </p>
                                      <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                        <div className="flex justify-between">
                                          <span>• Proveedor:</span>
                                          <Badge variant="outline" className="text-xs">
                                            98% confianza
                                          </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>• Monto Total:</span>
                                          <Badge variant="outline" className="text-xs">
                                            99% confianza
                                          </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>• Fecha:</span>
                                          <Badge variant="outline" className="text-xs">
                                            95% confianza
                                          </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>• CUIT:</span>
                                          <Badge variant="outline" className="text-xs">
                                            97% confianza
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    {/* Step 2: Validation */}
                                    <div className="space-y-2 pb-3 border-b">
                                      <p className="text-sm font-medium flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                          2
                                        </span>
                                        Validaciones
                                      </p>
                                      <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                          <Check className="h-4 w-4 text-green-600" />
                                          <span>Formato de CUIT válido</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Check className="h-4 w-4 text-green-600" />
                                          <span>Fecha dentro del período fiscal</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Check className="h-4 w-4 text-green-600" />
                                          <span>Monto coincide con suma de ítems</span>
                                        </div>
                                      </div>
                                    </div>
                                    {/* Step 3: Account Mapping */}
                                    <div className="space-y-2 pb-3 border-b">
                                      <p className="text-sm font-medium flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                          3
                                        </span>
                                        Mapeo de Cuentas
                                      </p>
                                      <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                        <div>
                                          <span className="font-medium">Cuenta 1105 (Mercaderías):</span>
                                          <p className="text-xs mt-1">
                                            Seleccionada por tipo de documento (Factura) y categoría de productos
                                          </p>
                                        </div>
                                        <div>
                                          <span className="font-medium">Cuenta 2101 (Proveedores):</span>
                                          <p className="text-xs mt-1">
                                            Asignada automáticamente para cuentas por pagar a proveedores
                                          </p>
                                        </div>
                                        <div>
                                          <span className="font-medium">Cuenta 1106 (IVA Crédito Fiscal):</span>
                                          <p className="text-xs mt-1">
                                            Calculada según alícuota de IVA detectada (21%)
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    {/* Step 4: Data Prioritization */}
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                          4
                                        </span>
                                        Priorización de Fuentes
                                      </p>
                                      <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">1.</span>
                                          <span>Documento principal (mayor confiabilidad)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">2.</span>
                                          <span>Documentos relacionados (validación cruzada)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">3.</span>
                                          <span>Datos históricos del proveedor</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                                    <Settings className="h-3 w-3 mr-1" />
                                    Reentrenar
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <Settings className="h-5 w-5 text-primary" />
                                      Reentrenar Modelo
                                    </DialogTitle>
                                    <DialogDescription>
                                      Ingresa instrucciones para mejorar cómo el modelo genera asientos contables. Estas
                                      instrucciones se aplicarán en futuros procesamientos.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <Textarea
                                      placeholder="Ejemplo: Siempre usar la cuenta 1105 para compras de mercadería. Priorizar datos del documento principal sobre documentos relacionados..."
                                      value={retrainingInstructions}
                                      onChange={(e) => setRetrainingInstructions(e.target.value)}
                                      className="min-h-[150px]"
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsRetrainingDialogOpen(false)}>
                                      Cancelar
                                    </Button>
                                    <Button onClick={handleSubmitRetraining}>Confirmar Reentrenamiento</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            {accountingEntry.entries.map((entry, index) => (
                              <div key={index} className="p-2 bg-muted/30 rounded-lg text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-medium">{entry.account}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {entry.debit > 0 ? "Debe" : "Haber"}
                                  </Badge>
                                </div>
                                <p className="font-medium">{entry.name}</p>
                                <p className="text-muted-foreground">{entry.description}</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1 text-[10px] text-muted-foreground">
                                  <div className="flex justify-between">
                                    <span>Centro de Costo:</span>
                                    <span className="font-mono">{entry.costCenter}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Proyecto:</span>
                                    <span className="font-mono">{entry.project}</span>
                                  </div>
                                  {entry.taxCode && (
                                    <div className="flex justify-between col-span-2">
                                      <span>Código Impuesto:</span>
                                      <span className="font-mono">{entry.taxCode}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex justify-between pt-1 border-t">
                                  <span className="text-muted-foreground">Debe:</span>
                                  <span className="font-mono font-medium">{formatCurrency(entry.debit)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Haber:</span>
                                  <span className="font-mono font-medium">{formatCurrency(entry.credit)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {currentData.totals && (
                          <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                              <div className="text-xs">
                                <p className="font-medium text-success">Validación Exitosa</p>
                                <p className="text-muted-foreground mt-1">
                                  Los totales coinciden con los datos leídos del documento
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Related Documents Views */}
              {relatedDocuments.map((doc) => (
                <TabsContent key={doc.id} value={doc.id} className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between gap-4 items-center">
                        <div>
                          <CardTitle>Documento original vs Datos leídos vs Resultado del Asistente</CardTitle>
                          <CardDescription>{doc.filename}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={visibleColumns.pdf ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleColumn("pdf")}
                            className="gap-2"
                          >
                            {visibleColumns.pdf ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            Documento
                          </Button>
                          <Button
                            variant={visibleColumns.extracted ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleColumn("extracted")}
                            className="gap-2"
                          >
                            {visibleColumns.extracted ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            Datos
                          </Button>
                          <Button
                            variant={visibleColumns.accounting ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleColumn("accounting")}
                            className="gap-2"
                          >
                            {visibleColumns.accounting ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            Resultado
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                  <div className={`grid gap-4 ${getGridCols()}`}>
                    {visibleColumns.pdf && (
                      <Card className="lg:col-span-1">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="h-4 w-4" />
                            Documento original
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                            <div className="text-center space-y-2">
                              <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
                              <p className="text-xs text-muted-foreground px-2">{doc.filename}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {visibleColumns.extracted && (
                      <Card className="lg:col-span-1">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                              <Hash className="h-4 w-4" />
                              Datos Leídos ({doc.type})
                            </CardTitle>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReprocess("extraction")}
                              disabled={isReprocessing}
                            >
                              <RefreshCw className={`h-3 w-3 ${isReprocessing ? "animate-spin" : ""}`} />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Add table rendering for extracted data when table exists */}
                          {currentData.table && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">TABLA DE DATOS</p>
                              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                <table className="w-full text-xs border-collapse">
                                  <thead className="sticky top-0 bg-background">
                                    <tr className="border-b">
                                      {currentData.table.headers.map((header, idx) => (
                                        <th
                                          key={idx}
                                          className="text-left p-2 font-medium text-muted-foreground bg-muted/30"
                                        >
                                          {header}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {currentData.table.rows.map((row, rowIdx) => (
                                      <tr key={rowIdx} className="border-b hover:bg-muted/20">
                                        {currentData.table.headers.map((header, colIdx) => (
                                          <td key={colIdx} className="p-2">
                                            {typeof row[header] === "number" &&
                                            (header.includes("Precio") ||
                                              header.includes("Total") ||
                                              header.includes("Subtotal") ||
                                              header.includes("IVA"))
                                              ? formatCurrency(row[header] as number)
                                              : row[header]}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                          <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Tipo:</span>
                              <Badge variant="outline" className="text-xs">
                                {currentData.documentInfo.type}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Número:</span>
                              <EditableField
                                value={currentData.documentInfo.number}
                                path="documentInfo.number"
                                className="font-mono text-xs"
                              />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Fecha:</span>
                              <EditableField
                                value={currentData.documentInfo.date}
                                path="documentInfo.date"
                                className="text-xs"
                              />
                            </div>
                          </div>
                          <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" /> PROVEEDOR
                            </p>
                            <div className="space-y-1">
                              <EditableField
                                value={currentData.supplier.name}
                                path="supplier.name"
                                className="font-medium text-sm block w-full"
                              />
                              <EditableField
                                value={currentData.supplier.cuit}
                                path="supplier.cuit"
                                className="font-mono text-xs text-muted-foreground block"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              ITEMS ({currentData.items.length})
                            </p>
                            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                              {currentData.items.map((item, idx) => (
                                <div key={item.id} className="p-2 bg-muted/30 rounded text-xs space-y-1">
                                  <EditableField
                                    value={item.description}
                                    path={`items.${idx}.description`}
                                    className="font-medium leading-tight block w-full"
                                  />
                                  <div className="flex justify-between text-muted-foreground items-center">
                                    <div className="flex items-center gap-1">
                                      <span>Cant:</span>
                                      <EditableField
                                        value={item.quantity}
                                        path={`items.${idx}.quantity`}
                                        type="number"
                                      />
                                    </div>
                                    {item.unitPrice && (
                                      <EditableField
                                        value={formatCurrency(item.unitPrice)}
                                        path={`items.${idx}.unitPrice`}
                                        type="number"
                                        className="font-mono"
                                      />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {currentData.totals && (
                            <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                              <div className="flex justify-between text-sm items-center">
                                <span>Subtotal:</span>
                                <EditableField
                                  value={formatCurrency(currentData.totals.subtotal)}
                                  path="totals.subtotal"
                                  type="number"
                                  className="font-mono text-xs"
                                />
                              </div>
                              <div className="flex justify-between text-sm items-center">
                                <span>IVA:</span>
                                <EditableField
                                  value={formatCurrency(currentData.totals.iva)}
                                  path="totals.iva"
                                  type="number"
                                  className="font-mono text-xs"
                                />
                              </div>
                              <Separator />
                              <div className="flex justify-between font-bold text-sm items-center">
                                <span>Total:</span>
                                <EditableField
                                  value={formatCurrency(currentData.totals.total)}
                                  path="totals.total"
                                  type="number"
                                  className="font-mono"
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    {visibleColumns.accounting && (
                      <Card className="lg:col-span-1">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                              <Database className="h-4 w-4" />
                              Resultado del Asistente
                            </CardTitle>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReprocess("output")}
                              disabled={isReprocessing}
                            >
                              <RefreshCw className={`h-3 w-3 ${isReprocessing ? "animate-spin" : ""}`} />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Data Sources */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">FUENTES DE DATOS</p>
                            <div className="space-y-1.5">
                              <div className="flex items-start gap-2 p-2 bg-muted/30 rounded text-xs">
                                <FileText className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-medium">Doc. Principal</p>
                                  <p className="text-muted-foreground truncate">
                                    {accountingEntry.dataSources.mainDocument}
                                  </p>
                                </div>
                              </div>
                              {accountingEntry.dataSources.additionalDocuments.length > 0 && (
                                <Collapsible
                                  open={expandedDataSources.additionalDocs}
                                  onOpenChange={() => toggleDataSource("additionalDocs")}
                                >
                                  <CollapsibleTrigger className="w-full">
                                    <div className="flex items-start gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded text-xs transition-colors">
                                      <FileStack className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                      <div className="flex-1 min-w-0 text-left">
                                        <p className="font-medium">Docs. Adicionales</p>
                                        <p className="text-muted-foreground">
                                          {accountingEntry.dataSources.additionalDocuments.length} archivo
                                          {accountingEntry.dataSources.additionalDocuments.length > 1 ? "s" : ""}
                                        </p>
                                      </div>
                                      {expandedDataSources.additionalDocs ? (
                                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                      )}
                                    </div>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-1 ml-5 space-y-1">
                                    {accountingEntry.dataSources.additionalDocuments.map((filename, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => setSelectedPdfInConsolidated(relatedDocuments[idx]?.id)}
                                        className="w-full p-2 bg-muted/20 hover:bg-muted/40 rounded text-xs flex items-center gap-2 transition-colors"
                                      >
                                        <FileText className="h-3 w-3 text-muted-foreground" />
                                        <span className="flex-1 text-left truncate">{filename}</span>
                                        <Eye className="h-3 w-3 text-primary" />
                                      </button>
                                    ))}
                                  </CollapsibleContent>
                                </Collapsible>
                              )}
                              <Collapsible open={expandedDataSources.api} onOpenChange={() => toggleDataSource("api")}>
                                <CollapsibleTrigger className="w-full">
                                  <div className="flex items-start gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded text-xs transition-colors">
                                    <Globe className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0 text-left">
                                      <p className="font-medium">API Externa</p>
                                      <p className="text-muted-foreground">Sistema ERP</p>
                                    </div>
                                    {expandedDataSources.api ? (
                                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                    )}
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-1 ml-5">
                                  <div className="p-2 bg-muted/20 rounded text-xs space-y-1.5">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">ID Proveedor:</span>
                                      <span className="font-mono">{apiData.supplier.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Condición Pago:</span>
                                      <span>{apiData.supplier.paymentTerms}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Límite Crédito:</span>
                                      <span className="font-mono">{formatCurrency(apiData.supplier.creditLimit)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Última Act.:</span>
                                      <span className="text-xs">{apiData.supplier.lastUpdate}</span>
                                    </div>
                                    <Separator className="my-1" />
                                    <p className="text-muted-foreground font-medium">Cuentas Asignadas:</p>
                                    <div className="space-y-0.5 pl-2">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Compras:</span>
                                        <span className="font-mono">{apiData.accounts.purchases}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">IVA:</span>
                                        <span className="font-mono">{apiData.accounts.vat}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Proveedores:</span>
                                        <span className="font-mono">{apiData.accounts.payables}</span>
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                              <Collapsible
                                open={expandedDataSources.masterData}
                                onOpenChange={() => toggleDataSource("masterData")}
                              >
                                <CollapsibleTrigger className="w-full">
                                  <div className="flex items-start gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded text-xs transition-colors">
                                    <Database className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0 text-left">
                                      <p className="font-medium">Master Data</p>
                                      <p className="text-muted-foreground">Plan de cuentas 2024</p>
                                    </div>
                                    {expandedDataSources.masterData ? (
                                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                    )}
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-1 ml-5">
                                  <div className="space-y-1">
                                    {masterData.map((account) => (
                                      <div key={account.code} className="p-2 bg-muted/20 rounded text-xs space-y-0.5">
                                        <div className="flex items-center justify-between">
                                          <span className="font-mono font-medium">{account.code}</span>
                                          <Badge variant="outline" className="text-xs">
                                            {account.type}
                                          </Badge>
                                        </div>
                                        <p className="font-medium">{account.name}</p>
                                        <p className="text-muted-foreground">{account.category}</p>
                                      </div>
                                    ))}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-muted-foreground">ASIENTO</p>
                              <div className="flex items-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                                      <Brain className="h-3 w-3 mr-1" />
                                      Ver Razonamiento IA
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <Brain className="h-5 w-5 text-primary" />
                                        Razonamiento IA
                                      </DialogTitle>
                                      <DialogDescription>
                                        Proceso de análisis utilizado para generar el asiento contable
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3 py-4">
                                      <p className="text-xs font-medium text-muted-foreground mb-3">
                                        PROCESO DE ANÁLISIS
                                      </p>
                                      {/* Step 1: Field Extraction */}
                                      <div className="space-y-2 pb-3 border-b">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                            1
                                          </span>
                                          Extracción de Campos
                                        </p>
                                        <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                          <div className="flex justify-between">
                                            <span>• Proveedor:</span>
                                            <Badge variant="outline" className="text-xs">
                                              98% confianza
                                            </Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>• Monto Total:</span>
                                            <Badge variant="outline" className="text-xs">
                                              99% confianza
                                            </Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>• Fecha:</span>
                                            <Badge variant="outline" className="text-xs">
                                              95% confianza
                                            </Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>• CUIT:</span>
                                            <Badge variant="outline" className="text-xs">
                                              97% confianza
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                      {/* Step 2: Validation */}
                                      <div className="space-y-2 pb-3 border-b">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                            2
                                          </span>
                                          Validaciones
                                        </p>
                                        <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                          <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span>Formato de CUIT válido</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span>Fecha dentro del período fiscal</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span>Monto coincide con suma de ítems</span>
                                          </div>
                                        </div>
                                      </div>
                                      {/* Step 3: Account Mapping */}
                                      <div className="space-y-2 pb-3 border-b">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                            3
                                          </span>
                                          Mapeo de Cuentas
                                        </p>
                                        <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                          <div>
                                            <span className="font-medium">Cuenta 1105 (Mercaderías):</span>
                                            <p className="text-xs mt-1">
                                              Seleccionada por tipo de documento (Factura) y categoría de productos
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium">Cuenta 2101 (Proveedores):</span>
                                            <p className="text-xs mt-1">
                                              Asignada automáticamente para cuentas por pagar a proveedores
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium">Cuenta 1106 (IVA Crédito Fiscal):</span>
                                            <p className="text-xs mt-1">
                                              Calculada según alícuota de IVA detectada (21%)
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      {/* Step 4: Data Prioritization */}
                                      <div className="space-y-2">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                            4
                                          </span>
                                          Priorización de Fuentes
                                        </p>
                                        <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">1.</span>
                                            <span>Documento principal (mayor confiabilidad)</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">2.</span>
                                            <span>Documentos relacionados (validación cruzada)</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">3.</span>
                                            <span>Datos históricos del proveedor</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                                      <Settings className="h-3 w-3 mr-1" />
                                      Reentrenar
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-primary" />
                                        Reentrenar Modelo
                                      </DialogTitle>
                                      <DialogDescription>
                                        Ingresa instrucciones para mejorar cómo el modelo genera asientos contables.
                                        Estas instrucciones se aplicarán en futuros procesamientos.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <Textarea
                                        placeholder="Ejemplo: Siempre usar la cuenta 1105 para compras de mercadería. Priorizar datos del documento principal sobre documentos relacionados..."
                                        value={retrainingInstructions}
                                        onChange={(e) => setRetrainingInstructions(e.target.value)}
                                        className="min-h-[150px]"
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setIsRetrainingDialogOpen(false)}>
                                        Cancelar
                                      </Button>
                                      <Button onClick={handleSubmitRetraining}>Confirmar Reentrenamiento</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              {accountingEntry.entries.map((entry, index) => (
                                <div key={index} className="p-2 bg-muted/30 rounded-lg text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono font-medium">{entry.account}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {entry.debit > 0 ? "Debe" : "Haber"}
                                    </Badge>
                                  </div>
                                  <p className="font-medium">{entry.name}</p>
                                  <p className="text-muted-foreground">{entry.description}</p>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1 text-[10px] text-muted-foreground">
                                    <div className="flex justify-between">
                                      <span>Centro de Costo:</span>
                                      <span className="font-mono">{entry.costCenter}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Proyecto:</span>
                                      <span className="font-mono">{entry.project}</span>
                                    </div>
                                    {entry.taxCode && (
                                      <div className="flex justify-between col-span-2">
                                        <span>Código Impuesto:</span>
                                        <span className="font-mono">{entry.taxCode}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex justify-between pt-1 border-t">
                                    <span className="text-muted-foreground">Debe:</span>
                                    <span className="font-mono font-medium">{formatCurrency(entry.debit)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Haber:</span>
                                    <span className="font-mono font-medium">{formatCurrency(entry.credit)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {currentData.totals && (
                            <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                                <div className="text-xs">
                                  <p className="font-medium text-success">Validación Exitosa</p>
                                  <p className="text-muted-foreground mt-1">
                                    Los totales coinciden con los datos leídos del documento
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              ))}

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleExport} className="flex-1 bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Excel
                </Button>
                <Button onClick={handleSendToSystem} className="flex-1">
                  <Send className="mr-2 h-4 w-4" />
                  Enviar a Sistema Contable
                </Button>
              </div>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>Datos Leídos: Documento Principal</CardTitle>
                      <CardDescription>{data.documentInfo.filename}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={visibleColumns.pdf ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleColumn("pdf")}
                        className="gap-2"
                      >
                        {visibleColumns.pdf ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        PDF
                      </Button>
                      <Button
                        variant={visibleColumns.extracted ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleColumn("extracted")}
                        className="gap-2"
                      >
                        {visibleColumns.extracted ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        Datos
                      </Button>
                      <Button
                        variant={visibleColumns.accounting ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleColumn("accounting")}
                        className="gap-2"
                      >
                        {visibleColumns.accounting ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        Asiento
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
              <div className={`grid gap-4 ${getGridCols()}`}>
                {visibleColumns.pdf && (
                  <Card className="lg:col-span-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4" />
                        PDF Original
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                        <div className="text-center space-y-2">
                          <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
                          <p className="text-xs text-muted-foreground px-2">{data.documentInfo.filename}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {visibleColumns.extracted && (
                  <Card className="lg:col-span-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Hash className="h-4 w-4" />
                          Datos Leídos (Principal)
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReprocess("extraction")}
                          disabled={isReprocessing}
                        >
                          <RefreshCw className={`h-3 w-3 ${isReprocessing ? "animate-spin" : ""}`} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Add table rendering for extracted data when table exists */}
                      {currentData.table && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">TABLA DE DATOS</p>
                          <div className="overflow-x-auto max-h-96 overflow-y-auto">
                            <table className="w-full text-xs border-collapse">
                              <thead className="sticky top-0 bg-background">
                                <tr className="border-b">
                                  {currentData.table.headers.map((header, idx) => (
                                    <th
                                      key={idx}
                                      className="text-left p-2 font-medium text-muted-foreground bg-muted/30"
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {currentData.table.rows.map((row, rowIdx) => (
                                  <tr key={rowIdx} className="border-b hover:bg-muted/20">
                                    {currentData.table.headers.map((header, colIdx) => (
                                      <td key={colIdx} className="p-2">
                                        {typeof row[header] === "number" &&
                                        (header.includes("Precio") ||
                                          header.includes("Total") ||
                                          header.includes("Subtotal") ||
                                          header.includes("IVA"))
                                          ? formatCurrency(row[header] as number)
                                          : row[header]}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Tipo:</span>
                          <Badge variant="outline" className="text-xs">
                            {currentData.documentInfo.type}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Número:</span>
                          <EditableField
                            value={currentData.documentInfo.number}
                            path="documentInfo.number"
                            className="font-mono text-xs"
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Fecha:</span>
                          <EditableField
                            value={currentData.documentInfo.date}
                            path="documentInfo.date"
                            className="text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> PROVEEDOR
                        </p>
                        <div className="space-y-1">
                          <EditableField
                            value={currentData.supplier.name}
                            path="supplier.name"
                            className="font-medium text-sm block w-full"
                          />
                          <EditableField
                            value={currentData.supplier.cuit}
                            path="supplier.cuit"
                            className="font-mono text-xs text-muted-foreground block"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">ITEMS ({currentData.items.length})</p>
                        <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                          {currentData.items.map((item, idx) => (
                            <div key={item.id} className="p-2 bg-muted/30 rounded text-xs space-y-1">
                              <EditableField
                                value={item.description}
                                path={`items.${idx}.description`}
                                className="font-medium leading-tight block w-full"
                              />
                              <div className="flex justify-between text-muted-foreground items-center">
                                <div className="flex items-center gap-1">
                                  <span>Cant:</span>
                                  <EditableField value={item.quantity} path={`items.${idx}.quantity`} type="number" />
                                </div>
                                {item.unitPrice && (
                                  <EditableField
                                    value={formatCurrency(item.unitPrice)}
                                    path={`items.${idx}.unitPrice`}
                                    type="number"
                                    className="font-mono"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {currentData.totals && (
                        <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex justify-between text-sm items-center">
                            <span>Subtotal:</span>
                            <EditableField
                              value={formatCurrency(currentData.totals.subtotal)}
                              path="totals.subtotal"
                              type="number"
                              className="font-mono text-xs"
                            />
                          </div>
                          <div className="flex justify-between text-sm items-center">
                            <span>IVA:</span>
                            <EditableField
                              value={formatCurrency(currentData.totals.iva)}
                              path="totals.iva"
                              type="number"
                              className="font-mono text-xs"
                            />
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-sm items-center">
                            <span>Total:</span>
                            <EditableField
                              value={formatCurrency(currentData.totals.total)}
                              path="totals.total"
                              type="number"
                              className="font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                {visibleColumns.accounting && (
                  <Card className="lg:col-span-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Database className="h-4 w-4" />
                          Asiento Contable
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReprocess("output")}
                          disabled={isReprocessing}
                        >
                          <RefreshCw className={`h-3 w-3 ${isReprocessing ? "animate-spin" : ""}`} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Data Sources */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">FUENTES DE DATOS</p>
                        <div className="space-y-1.5">
                          <div className="flex items-start gap-2 p-2 bg-muted/30 rounded text-xs">
                            <FileText className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium">Doc. Principal</p>
                              <p className="text-muted-foreground truncate">
                                {accountingEntry.dataSources.mainDocument}
                              </p>
                            </div>
                          </div>
                          {accountingEntry.dataSources.additionalDocuments.length > 0 && (
                            <Collapsible
                              open={expandedDataSources.additionalDocs}
                              onOpenChange={() => toggleDataSource("additionalDocs")}
                            >
                              <CollapsibleTrigger className="w-full">
                                <div className="flex items-start gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded text-xs transition-colors">
                                  <FileStack className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className="font-medium">Docs. Adicionales</p>
                                    <p className="text-muted-foreground">
                                      {accountingEntry.dataSources.additionalDocuments.length} archivo
                                      {accountingEntry.dataSources.additionalDocuments.length > 1 ? "s" : ""}
                                    </p>
                                  </div>
                                  {expandedDataSources.additionalDocs ? (
                                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-1 ml-5 space-y-1">
                                {accountingEntry.dataSources.additionalDocuments.map((filename, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setSelectedPdfInConsolidated(relatedDocuments[idx]?.id)}
                                    className="w-full p-2 bg-muted/20 hover:bg-muted/40 rounded text-xs flex items-center gap-2 transition-colors"
                                  >
                                    <FileText className="h-3 w-3 text-muted-foreground" />
                                    <span className="flex-1 text-left truncate">{filename}</span>
                                    <Eye className="h-3 w-3 text-primary" />
                                  </button>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                          <Collapsible open={expandedDataSources.api} onOpenChange={() => toggleDataSource("api")}>
                            <CollapsibleTrigger className="w-full">
                              <div className="flex items-start gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded text-xs transition-colors">
                                <Globe className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0 text-left">
                                  <p className="font-medium">API Externa</p>
                                  <p className="text-muted-foreground">Sistema ERP</p>
                                </div>
                                {expandedDataSources.api ? (
                                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-1 ml-5">
                              <div className="p-2 bg-muted/20 rounded text-xs space-y-1.5">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">ID Proveedor:</span>
                                  <span className="font-mono">{apiData.supplier.id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Condición Pago:</span>
                                  <span>{apiData.supplier.paymentTerms}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Límite Crédito:</span>
                                  <span className="font-mono">{formatCurrency(apiData.supplier.creditLimit)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Última Act.:</span>
                                  <span className="text-xs">{apiData.supplier.lastUpdate}</span>
                                </div>
                                <Separator className="my-1" />
                                <p className="text-muted-foreground font-medium">Cuentas Asignadas:</p>
                                <div className="space-y-0.5 pl-2">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Compras:</span>
                                    <span className="font-mono">{apiData.accounts.purchases}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">IVA:</span>
                                    <span className="font-mono">{apiData.accounts.vat}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Proveedores:</span>
                                    <span className="font-mono">{apiData.accounts.payables}</span>
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                          <Collapsible
                            open={expandedDataSources.masterData}
                            onOpenChange={() => toggleDataSource("masterData")}
                          >
                            <CollapsibleTrigger className="w-full">
                              <div className="flex items-start gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded text-xs transition-colors">
                                <Database className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0 text-left">
                                  <p className="font-medium">Master Data</p>
                                  <p className="text-muted-foreground">Plan de cuentas 2024</p>
                                </div>
                                {expandedDataSources.masterData ? (
                                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-1 ml-5">
                              <div className="space-y-1">
                                {masterData.map((account) => (
                                  <div key={account.code} className="p-2 bg-muted/20 rounded text-xs space-y-0.5">
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono font-medium">{account.code}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {account.type}
                                      </Badge>
                                    </div>
                                    <p className="font-medium">{account.name}</p>
                                    <p className="text-muted-foreground">{account.category}</p>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-muted-foreground">ASIENTO</p>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                                  <Brain className="h-3 w-3 mr-1" />
                                  Ver Razonamiento IA
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-primary" />
                                    Razonamiento IA
                                  </DialogTitle>
                                  <DialogDescription>
                                    Proceso de análisis utilizado para generar el asiento contable
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3 py-4">
                                  <p className="text-xs font-medium text-muted-foreground mb-3">PROCESO DE ANÁLISIS</p>
                                  {/* Step 1: Field Extraction */}
                                  <div className="space-y-2 pb-3 border-b">
                                    <p className="text-sm font-medium flex items-center gap-2">
                                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                        1
                                      </span>
                                      Extracción de Campos
                                    </p>
                                    <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                      <div className="flex justify-between">
                                        <span>• Proveedor:</span>
                                        <Badge variant="outline" className="text-xs">
                                          98% confianza
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>• Monto Total:</span>
                                        <Badge variant="outline" className="text-xs">
                                          99% confianza
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>• Fecha:</span>
                                        <Badge variant="outline" className="text-xs">
                                          95% confianza
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>• CUIT:</span>
                                        <Badge variant="outline" className="text-xs">
                                          97% confianza
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Step 2: Validation */}
                                  <div className="space-y-2 pb-3 border-b">
                                    <p className="text-sm font-medium flex items-center gap-2">
                                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                        2
                                      </span>
                                      Validaciones
                                    </p>
                                    <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-600" />
                                        <span>Formato de CUIT válido</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-600" />
                                        <span>Fecha dentro del período fiscal</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-600" />
                                        <span>Monto coincide con suma de ítems</span>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Step 3: Account Mapping */}
                                  <div className="space-y-2 pb-3 border-b">
                                    <p className="text-sm font-medium flex items-center gap-2">
                                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                        3
                                      </span>
                                      Mapeo de Cuentas
                                    </p>
                                    <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                      <div>
                                        <span className="font-medium">Cuenta 1105 (Mercaderías):</span>
                                        <p className="text-xs mt-1">
                                          Seleccionada por tipo de documento (Factura) y categoría de productos
                                        </p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Cuenta 2101 (Proveedores):</span>
                                        <p className="text-xs mt-1">
                                          Asignada automáticamente para cuentas por pagar a proveedores
                                        </p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Cuenta 1106 (IVA Crédito Fiscal):</span>
                                        <p className="text-xs mt-1">Calculada según alícuota de IVA detectada (21%)</p>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Step 4: Data Prioritization */}
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium flex items-center gap-2">
                                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                        4
                                      </span>
                                      Priorización de Fuentes
                                    </p>
                                    <div className="ml-7 space-y-1.5 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">1.</span>
                                        <span>Documento principal (mayor confiabilidad)</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">2.</span>
                                        <span>Documentos relacionados (validación cruzada)</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">3.</span>
                                        <span>Datos históricos del proveedor</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                                  <Settings className="h-3 w-3 mr-1" />
                                  Reentrenar
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-primary" />
                                    Reentrenar Modelo
                                  </DialogTitle>
                                  <DialogDescription>
                                    Ingresa instrucciones para mejorar cómo el modelo genera asientos contables. Estas
                                    instrucciones se aplicarán en futuros procesamientos.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Textarea
                                    placeholder="Ejemplo: Siempre usar la cuenta 1105 para compras de mercadería. Priorizar datos del documento principal sobre documentos relacionados..."
                                    value={retrainingInstructions}
                                    onChange={(e) => setRetrainingInstructions(e.target.value)}
                                    className="min-h-[150px]"
                                  />
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setIsRetrainingDialogOpen(false)}>
                                    Cancelar
                                  </Button>
                                  <Button onClick={handleSubmitRetraining}>Confirmar Reentrenamiento</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {accountingEntry.entries.map((entry, index) => (
                            <div key={index} className="p-2 bg-muted/30 rounded-lg text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-medium">{entry.account}</span>
                                <Badge variant="outline" className="text-xs">
                                  {entry.debit > 0 ? "Debe" : "Haber"}
                                </Badge>
                              </div>
                              <p className="font-medium">{entry.name}</p>
                              <p className="text-muted-foreground">{entry.description}</p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1 text-[10px] text-muted-foreground">
                                <div className="flex justify-between">
                                  <span>Centro de Costo:</span>
                                  <span className="font-mono">{entry.costCenter}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Proyecto:</span>
                                  <span className="font-mono">{entry.project}</span>
                                </div>
                                {entry.taxCode && (
                                  <div className="flex justify-between col-span-2">
                                    <span>Código Impuesto:</span>
                                    <span className="font-mono">{entry.taxCode}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-between pt-1 border-t">
                                <span className="text-muted-foreground">Debe:</span>
                                <span className="font-mono font-medium">{formatCurrency(entry.debit)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Haber:</span>
                                <span className="font-mono font-medium">{formatCurrency(entry.credit)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {currentData.totals && (
                        <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <div className="text-xs">
                              <p className="font-medium text-success">Validación Exitosa</p>
                              <p className="text-muted-foreground mt-1">
                                Los totales coinciden con los datos leídos del documento
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
