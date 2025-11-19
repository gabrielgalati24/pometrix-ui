"use client"

import type React from "react"

import { useState, useEffect, useId, type CSSProperties } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileText, FileStack, Layers, Eye, EyeOff, Database, ArrowLeft, ChevronRight, ChevronLeft, Maximize2, Minimize2, RefreshCw, Loader2, Pencil, BarChart3, GripVertical, Brain, CheckCircle2, FileOutput, Download, Trash2, CheckCircle, XCircle, Send, AlertCircle, Clock } from 'lucide-react'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import type { RelatedDocument } from "@/lib/mock-data"
import { getSimpleDocumentData, mockDocuments } from "@/lib/mock-data"
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers"
import { SortableContext, horizontalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type SimpleDocumentViewProps = {
  documentId: string
  relatedDocuments?: RelatedDocument[]
}

type ViewMode = "documento" | "datos" | "resultado"

const DraggableTableHeader = ({
  header,
  children,
}: {
  header: string
  children: React.ReactNode
}) => {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: header,
  })

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition,
    whiteSpace: "nowrap",
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <th
      ref={setNodeRef}
      className="p-2 text-left font-medium whitespace-nowrap bg-muted border-r last:border-r-0"
      style={style}
    >
      <div className="flex items-center gap-1">
        <button
          className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-muted-foreground/10 rounded"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </button>
        <span className="flex-1">{children}</span>
      </div>
    </th>
  )
}

export function SimpleDocumentView({ documentId, relatedDocuments = [] }: SimpleDocumentViewProps) {
  const [activeTab, setActiveTab] = useState<string>("consolidated")
  const [activeViews, setActiveViews] = useState<Set<ViewMode>>(new Set(["documento", "resultado"]))
  const [selectedConsolidatedDoc, setSelectedConsolidatedDoc] = useState<"main" | "related">("main")
  const [fuentesExpanded, setFuentesExpanded] = useState(false)
  const [expandedView, setExpandedView] = useState<ViewMode | null>(null)
  const [isProcessingData, setIsProcessingData] = useState(false)
  const [isProcessingResult, setIsProcessingResult] = useState(false)

  const [isEditingDatosGenerales, setIsEditingDatosGenerales] = useState(false)
  const [isEditingDatosTable, setIsEditingDatosTable] = useState(false)
  const [isEditingResultadoGenerales, setIsEditingResultadoGenerales] = useState(false)
  const [isEditingResultadoTable, setIsEditingResultadoTable] = useState(false)

  const [assistantInstructions, setAssistantInstructions] = useState("")
  const [useForRetraining, setUseForRetraining] = useState(false)

  const [datosColumnOrder, setDatosColumnOrder] = useState<string[]>([
    "Código",
    "Descripción",
    "Cantidad",
    "P. Unitario",
    "Subtotal",
    "IVA 21%",
    "Total",
  ])
  const [resultadoColumnOrder, setResultadoColumnOrder] = useState<string[]>([
    "Línea",
    "Cód. Cuenta",
    "Nombre Cuenta",
    "Debe",
    "Haber",
    "Centro Costo",
    "Proyecto",
    "Cód. Fiscal",
    "Referencia",
  ])

  const datosDndId = useId()
  const resultadoDndId = useId()

  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}))

  const documentData = getSimpleDocumentData(documentId)

  const [datosTableData, setDatosTableData] = useState<string[][]>([])
  const [resultadoTableData, setResultadoTableData] = useState<string[][]>([])
  const [originalDatosData, setOriginalDatosData] = useState<string[][]>([])
  const [originalResultadoData, setOriginalResultadoData] = useState<string[][]>([])

  const [datosGeneralesDatos, setDatosGeneralesDatos] = useState({
    proveedor: "",
    numeroFactura: "",
    fecha: "",
    total: "",
  })
  const [datosGeneralesResultado, setDatosGeneralesResultado] = useState({
    documento: "",
    estado: "",
    totalDebe: "",
    totalHaber: "",
  })
  const [originalDatosGeneralesDatos, setOriginalDatosGeneralesDatos] = useState(datosGeneralesDatos)
  const [originalDatosGeneralesResultado, setOriginalDatosGeneralesResultado] = useState(datosGeneralesResultado)

  const [showReasoningModal, setShowReasoningModal] = useState(false)
  const [currentReasoning, setCurrentReasoning] = useState<{
    summary: string
    steps: string[]
    dataSources?: Array<{ name: string; status: string; recordsUsed: number }>
    confidence: number
    dataQuality: string
  } | null>(null)

  const [documentStatus, setDocumentStatus] = useState<string>("Para confirmar")
  const router = useRouter()

  const currentDocIndex = mockDocuments.findIndex(doc => doc.id === documentId)
  const hasPreviousDoc = currentDocIndex > 0
  const hasNextDoc = currentDocIndex < mockDocuments.length - 1

  const handlePreviousDocument = () => {
    if (hasPreviousDoc) {
      const prevDoc = mockDocuments[currentDocIndex - 1]
      router.push(`/document/${prevDoc.id}`)
    }
  }

  const handleNextDocument = () => {
    if (hasNextDoc) {
      const nextDoc = mockDocuments[currentDocIndex + 1]
      router.push(`/document/${nextDoc.id}`)
    }
  }

  useEffect(() => {
    // Load document status from mock data
    const doc = mockDocuments.find(d => d.id === documentId)
    if (doc) {
      setDocumentStatus(doc.status)
    }
  }, [documentId])

  const handleConfirm = () => {
    console.log("[v0] Confirmando documento...")
    setDocumentStatus("Confirmado")
  }

  const handleReject = () => {
    console.log("[v0] Rechazando documento...")
    setDocumentStatus("Rechazado")
  }

  const handleSend = () => {
    console.log("[v0] Enviando documento al sistema contable...")
    setDocumentStatus("Enviado")
  }

  const handleExport = () => {
    console.log("[v0] Exportando documento...")
  }

  const handleDelete = () => {
    console.log("[v0] Eliminando documento...")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Para revisar":
        return (
          <Badge variant="secondary" className="bg-yellow-600 text-white flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Para revisar
          </Badge>
        )
      case "Para confirmar":
        return (
          <Badge variant="secondary" className="bg-yellow-600 text-white flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Para confirmar
          </Badge>
        )
      case "Confirmado":
        return (
          <Badge variant="default" className="bg-success text-success-foreground flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            Confirmado
          </Badge>
        )
      case "Enviado":
        return (
          <Badge variant="default" className="bg-success text-success-foreground flex items-center gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Enviado
          </Badge>
        )
      case "Rechazado":
        return (
          <Badge variant="destructive" className="flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5" />
            Rechazado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  useEffect(() => {
    const data = getSimpleDocumentData(documentId)
    if (!data) return

    let datosData: string[][] = []
    let resultadoData: string[][] = []
    let datosGens = { proveedor: "", numeroFactura: "", fecha: "", total: "" }
    let resultadoGens = { documento: "", estado: "", totalDebe: "", totalHaber: "" }

    if (activeTab === "consolidated") {
      datosData = [] // No datos view in consolidated
      resultadoData = data.consolidatedResult.outputData.rows
      resultadoGens = data.consolidatedResult.datosGenerales
    } else if (activeTab === "main") {
      datosData = data.mainDocument.extractedData.rows
      resultadoData = data.mainDocument.outputData.rows
      datosGens = data.mainDocument.datosGenerales
      resultadoGens = {
        documento: "Asiento Contable - Factura",
        estado: "Procesado",
        totalDebe: "$97,365.00",
        totalHaber: "$97,365.00",
      }
    } else {
      datosData = data.relatedDocument.extractedData.rows
      resultadoData = data.relatedDocument.outputData.rows
      datosGens = data.relatedDocument.datosGenerales
      resultadoGens = {
        documento: "Control de Stock - Remito",
        estado: "Procesado",
        totalDebe: "-",
        totalHaber: "-",
      }
    }

    setDatosTableData(datosData)
    setResultadoTableData(resultadoData)
    setDatosGeneralesDatos(datosGens)
    setDatosGeneralesResultado(resultadoGens)
    setOriginalDatosGeneralesDatos(datosGens)
    setOriginalDatosGeneralesResultado(resultadoGens)
  }, [activeTab, documentId]) // Only depend on activeTab and documentId

  const toggleView = (view: ViewMode) => {
    if (activeTab === "consolidated" && view === "datos") {
      return
    }

    setActiveViews((prev) => {
      const newViews = new Set(prev)
      if (newViews.has(view)) {
        if (newViews.size > 1) {
          newViews.delete(view)
        }
      } else {
        newViews.add(view)
      }
      return newViews
    })
  }

  const toggleExpand = (view: ViewMode) => {
    if (expandedView === view) {
      setExpandedView(null)
      setActiveViews(new Set(["documento", "resultado"]))
    } else {
      setExpandedView(view)
      setActiveViews(new Set([view]))
    }
  }

  const handleReprocessData = async () => {
    setIsProcessingData(true)
    console.log("[v0] Reprocesando datos extraídos...")
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessingData(false)
    console.log("[v0] Datos reprocesados")
  }

  const handleReprocessResult = async () => {
    setIsProcessingResult(true)
    console.log("[v0] Reprocesar Asistente...")
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessingResult(false)
    console.log("[v0] Asistente reprocesado")
  }

  const handleEditDatosGenerales = () => {
    setOriginalDatosGeneralesDatos({ ...datosGeneralesDatos })
    setIsEditingDatosGenerales(true)
  }

  const handleSaveDatosGenerales = () => {
    console.log("[v0] Guardando cambios en datos generales...")
    setIsEditingDatosGenerales(false)
  }

  const handleCancelDatosGenerales = () => {
    setDatosGeneralesDatos(originalDatosGeneralesDatos)
    setIsEditingDatosGenerales(false)
  }

  const handleEditDatosTable = () => {
    setOriginalDatosData(JSON.parse(JSON.stringify(datosTableData)))
    setIsEditingDatosTable(true)
  }

  const handleSaveDatosTable = () => {
    console.log("[v0] Guardando cambios en tabla de datos...")
    setIsEditingDatosTable(false)
    setOriginalDatosData([])
  }

  const handleCancelDatosTable = () => {
    setDatosTableData(originalDatosData)
    setIsEditingDatosTable(false)
    setOriginalDatosData([])
  }

  const handleEditResultadoGenerales = () => {
    setOriginalDatosGeneralesResultado({ ...datosGeneralesResultado })
    setIsEditingResultadoGenerales(true)
  }

  const handleSaveResultadoGenerales = () => {
    console.log("[v0] Guardando cambios en datos generales del resultado...")
    setIsEditingResultadoGenerales(false)
  }

  const handleCancelResultadoGenerales = () => {
    setDatosGeneralesResultado(originalDatosGeneralesResultado)
    setIsEditingResultadoGenerales(false)
  }

  const handleEditResultadoTable = () => {
    setOriginalResultadoData(JSON.parse(JSON.stringify(resultadoTableData)))
    setAssistantInstructions("")
    setIsEditingResultadoTable(true)
  }

  const handleSaveResultadoTable = () => {
    if (useForRetraining) {
      console.log("[v0] Guardando cambios y reentrando asistente...")
      console.log("[v0] Instrucciones:", assistantInstructions)
      console.log("[v0] Cambios en tabla:", resultadoTableData)
    } else {
      console.log("[v0] Guardando cambios en tabla de resultado...")
    }
    setIsEditingResultadoTable(false)
    setOriginalResultadoData([])
    setAssistantInstructions("")
    setUseForRetraining(false)
  }

  const handleCancelResultadoTable = () => {
    setResultadoTableData(originalResultadoData)
    setIsEditingResultadoTable(false)
    setOriginalResultadoData([])
    setAssistantInstructions("")
    setUseForRetraining(false)
  }

  const handleCellChangeDatos = (rowIdx: number, colIdx: number, value: string) => {
    setDatosTableData((prev) => {
      const newData = [...prev]
      newData[rowIdx][colIdx] = value
      return newData
    })
  }

  const handleCellChangeResultado = (rowIdx: number, colIdx: number, value: string) => {
    setResultadoTableData((prev) => {
      const newData = [...prev]
      newData[rowIdx][colIdx] = value
      return newData
    })
  }

  const handleDatosColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active && over && active.id !== over.id) {
      setDatosColumnOrder((order) => {
        const oldIndex = order.indexOf(active.id as string)
        const newIndex = order.indexOf(over.id as string)
        return arrayMove(order, oldIndex, newIndex)
      })
    }
  }

  const handleResultadoColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active && over && active.id !== over.id) {
      setResultadoColumnOrder((order) => {
        const oldIndex = order.indexOf(active.id as string)
        const newIndex = order.indexOf(over.id as string)
        return arrayMove(order, oldIndex, newIndex)
      })
    }
  }

  const renderDocumentoView = (context: "consolidated" | "main" | "related", docIndex?: number) => (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documento original
        </CardTitle>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => toggleExpand("documento")}>
              {expandedView === "documento" ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
            {expandedView === "documento" ? "Contraer" : "Ampliar"}
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="space-y-4">
        {context === "consolidated" && (
          <div className="flex gap-2">
            <Button
              variant={selectedConsolidatedDoc === "main" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedConsolidatedDoc("main")}
            >
              Principal
            </Button>
            {relatedDocuments.map((doc, idx) => (
              <Button
                key={doc.id}
                variant={selectedConsolidatedDoc === "related" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedConsolidatedDoc("related")}
              >
                Rel. {idx + 1}
              </Button>
            ))}
          </div>
        )}
        <div className="border rounded-lg p-8 bg-muted/30 min-h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">
            {context === "consolidated" &&
              selectedConsolidatedDoc === "main" &&
              "Vista del documento principal - factura_ejemplo_simple.pdf"}
            {context === "consolidated" &&
              selectedConsolidatedDoc === "related" &&
              relatedDocuments[0] &&
              `Vista del documento relacionado - ${relatedDocuments[0].filename}`}
            {context === "main" && "Vista del documento principal - factura_ejemplo_simple.pdf"}
            {context === "related" &&
              relatedDocuments[docIndex || 0] &&
              `Vista del documento relacionado - ${relatedDocuments[docIndex || 0].filename}`}
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const renderDatosView = (context: "consolidated" | "main" | "related", docIndex?: number) => (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Datos Extraídos
        </CardTitle>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleReprocessData} disabled={isProcessingData}>
                {isProcessingData ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
              Reprocesar lectura
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => toggleExpand("datos")}>
                {expandedView === "datos" ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
              {expandedView === "datos" ? "Contraer" : "Ampliar"}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isProcessingData && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Reprocesando datos...</span>
            </div>
          </div>
        )}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase">Datos Generales</h3>
            <div className="flex gap-1">
              {!isEditingDatosGenerales ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleEditDatosGenerales}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
                    Editar
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancelDatosGenerales}>
                    Cancelar
                  </Button>
                  <Button variant="default" size="sm" onClick={handleSaveDatosGenerales}>
                    Guardar
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Proveedor</p>
              {isEditingDatosGenerales ? (
                <input
                  type="text"
                  value={datosGeneralesDatos.proveedor}
                  onChange={(e) => setDatosGeneralesDatos({ ...datosGeneralesDatos, proveedor: e.target.value })}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-sm">{datosGeneralesDatos.proveedor}</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Número Factura</p>
              {isEditingDatosGenerales ? (
                <input
                  type="text"
                  value={datosGeneralesDatos.numeroFactura}
                  onChange={(e) => setDatosGeneralesDatos({ ...datosGeneralesDatos, numeroFactura: e.target.value })}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-sm">{datosGeneralesDatos.numeroFactura}</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Fecha</p>
              {isEditingDatosGenerales ? (
                <input
                  type="text"
                  value={datosGeneralesDatos.fecha}
                  onChange={(e) => setDatosGeneralesDatos({ ...datosGeneralesDatos, fecha: e.target.value })}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-sm">{datosGeneralesDatos.fecha}</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total</p>
              {isEditingDatosGenerales ? (
                <input
                  type="text"
                  value={datosGeneralesDatos.total}
                  onChange={(e) => setDatosGeneralesDatos({ ...datosGeneralesDatos, total: e.target.value })}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-sm">{datosGeneralesDatos.total}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase">DETALLE</h3>
            <div className="flex gap-1">
              {!isEditingDatosTable ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleEditDatosTable}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
                    Editar
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancelDatosTable}>
                    Cancelar
                  </Button>
                  <Button variant="default" size="sm" onClick={handleSaveDatosTable}>
                    Guardar
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="border rounded-lg overflow-auto">
            <DndContext
              id={datosDndId}
              collisionDetection={closestCenter}
              modifiers={[restrictToHorizontalAxis]}
              onDragEnd={handleDatosColumnDragEnd}
              sensors={sensors}
            >
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <SortableContext items={datosColumnOrder} strategy={horizontalListSortingStrategy}>
                      {datosColumnOrder.map((header) => (
                        <DraggableTableHeader key={header} header={header}>
                          {header}
                        </DraggableTableHeader>
                      ))}
                    </SortableContext>
                  </tr>
                </thead>
                <tbody>
                  {datosTableData.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-t">
                      {datosColumnOrder.map((header, colIdx) => {
                        const originalColIdx = [
                          "Código",
                          "Descripción",
                          "Cantidad",
                          "P. Unitario",
                          "Subtotal",
                          "IVA 21%",
                          "Total",
                        ].indexOf(header)
                        const cell = row[originalColIdx]
                        return (
                          <td key={colIdx} className="p-2 whitespace-nowrap">
                            {isEditingDatosTable ? (
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => handleCellChangeDatos(rowIdx, originalColIdx, e.target.value)}
                                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            ) : (
                              cell
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </DndContext>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderResultadoView = (context: "consolidated" | "main" | "related", docIndex?: number) => {
    const data = getSimpleDocumentData(documentId)
    let aiReasoning = null
    if (context === "consolidated" && data?.consolidatedResult) {
      aiReasoning = data.consolidatedResult.aiReasoning
    } else if (context === "main" && data?.mainDocument) {
      aiReasoning = data.mainDocument.aiReasoning
    } else if (context === "related" && data?.relatedDocument) {
      aiReasoning = data.relatedDocument.aiReasoning
    }

    const handleViewReasoning = () => {
      if (aiReasoning) {
        setCurrentReasoning(aiReasoning)
        setShowReasoningModal(true)
      }
    }

    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <FileOutput className="h-5 w-5" />
            Resultado del Asistente
          </CardTitle>
          <div className="flex gap-1">
            {aiReasoning && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleViewReasoning}>
                    <Brain className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
                  Ver razonamiento del Asistente
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleReprocessResult} disabled={isProcessingResult}>
                  {isProcessingResult ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
                Reprocesar Asistente
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => toggleExpand("resultado")}>
                  {expandedView === "resultado" ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
                {expandedView === "resultado" ? "Contraer" : "Ampliar"}
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isProcessingResult && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Reprocesando asistente...</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">Datos Generales</h3>
              <div className="flex gap-1">
                {!isEditingResultadoGenerales ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={handleEditResultadoGenerales}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
                      Editar
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={handleCancelResultadoGenerales}>
                      Cancelar
                    </Button>
                    <Button variant="default" size="sm" onClick={handleSaveResultadoGenerales}>
                      Guardar
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Documento</p>
                {isEditingResultadoGenerales ? (
                  <input
                    type="text"
                    value={datosGeneralesResultado.documento}
                    onChange={(e) =>
                      setDatosGeneralesResultado({ ...datosGeneralesResultado, documento: e.target.value })
                    }
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-sm">{datosGeneralesResultado.documento}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Estado</p>
                {isEditingResultadoGenerales ? (
                  <input
                    type="text"
                    value={datosGeneralesResultado.estado}
                    onChange={(e) => setDatosGeneralesResultado({ ...datosGeneralesResultado, estado: e.target.value })}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-sm">{datosGeneralesResultado.estado}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Total Debe</p>
                {isEditingResultadoGenerales ? (
                  <input
                    type="text"
                    value={datosGeneralesResultado.totalDebe}
                    onChange={(e) =>
                      setDatosGeneralesResultado({ ...datosGeneralesResultado, totalDebe: e.target.value })
                    }
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-sm">{datosGeneralesResultado.totalDebe}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Total Haber</p>
                {isEditingResultadoGenerales ? (
                  <input
                    type="text"
                    value={datosGeneralesResultado.totalHaber}
                    onChange={(e) =>
                      setDatosGeneralesResultado({ ...datosGeneralesResultado, totalHaber: e.target.value })
                    }
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-sm">{datosGeneralesResultado.totalHaber}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setFuentesExpanded(!fuentesExpanded)}
              className="flex items-center text-sm font-medium hover:text-primary transition-colors gap-2"
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${fuentesExpanded ? "rotate-90" : ""}`} />
              Fuentes de datos adicionales
            </button>
            {fuentesExpanded && (
              <div className="ml-6 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Master Data - Plan de Cuentas 2024</span>
                  <button className="text-primary hover:underline">Ver detalle</button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">API ERP - Datos de Proveedor</span>
                  <button className="text-primary hover:underline">Ver detalle</button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">Datos de salida</h3>
              <div className="flex gap-1">
                {!isEditingResultadoTable ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={handleEditResultadoTable}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
                      Editar
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={handleCancelResultadoTable}>
                      Cancelar
                    </Button>
                    <Button variant="default" size="sm" onClick={handleSaveResultadoTable}>
                      Guardar
                    </Button>
                  </>
                )}
              </div>
            </div>

            {isEditingResultadoTable && (
              <div className="space-y-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Instrucciones para el asistente</label>
                  <textarea
                    value={assistantInstructions}
                    onChange={(e) => setAssistantInstructions(e.target.value)}
                    placeholder="Ej: Redondear siempre a dos decimales, usar formato de fecha DD/MM/YYYY..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-y text-xs"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="retrain"
                    checked={useForRetraining}
                    onCheckedChange={(checked) => setUseForRetraining(checked === true)}
                  />
                  <label
                    htmlFor="retrain"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Utilizar cambios para reentrenar el asistente
                  </label>
                </div>
              </div>
            )}

            <div className="border rounded-lg overflow-auto max-h-[400px]">
              <DndContext
                id={resultadoDndId}
                collisionDetection={closestCenter}
                modifiers={[restrictToHorizontalAxis]}
                onDragEnd={handleResultadoColumnDragEnd}
                sensors={sensors}
              >
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <SortableContext items={resultadoColumnOrder} strategy={horizontalListSortingStrategy}>
                        {resultadoColumnOrder.map((header) => (
                          <DraggableTableHeader key={header} header={header}>
                            {header}
                          </DraggableTableHeader>
                        ))}
                      </SortableContext>
                    </tr>
                  </thead>
                  <tbody>
                    {resultadoTableData.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-t">
                        {resultadoColumnOrder.map((header, colIdx) => {
                          const originalColIdx = [
                            "Línea",
                            "Cód. Cuenta",
                            "Nombre Cuenta",
                            "Debe",
                            "Haber",
                            "Centro Costo",
                            "Proyecto",
                            "Cód. Fiscal",
                            "Referencia",
                          ].indexOf(header)
                          const cell = row[originalColIdx]
                          return (
                            <td key={colIdx} className="p-2 whitespace-nowrap">
                              {isEditingResultadoTable ? (
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => handleCellChangeResultado(rowIdx, originalColIdx, e.target.value)}
                                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              ) : (
                                cell
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DndContext>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderViewColumns = (context: "consolidated" | "main" | "related", docIndex?: number) => {
    const orderedViews: ViewMode[] = ["documento", "datos", "resultado"]
    const visibleViews = expandedView ? [expandedView] : orderedViews.filter((view) => activeViews.has(view))
    const columnCount = visibleViews.length

    return (
      <div className={`grid gap-6 mt-6`} style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
        {visibleViews.map((view) => (
          <div key={view} className="relative">
            {view === "documento" && renderDocumentoView(context, docIndex)}
            {view === "datos" && renderDatosView(context, docIndex)}
            {view === "resultado" && renderResultadoView(context, docIndex)}
          </div>
        ))}
      </div>
    )
  }

  useEffect(() => {
    if (activeTab === "consolidated") {
      setActiveViews((prev) => {
        const newViews = new Set(prev)
        newViews.delete("datos")
        // Ensure at least one view is active
        if (newViews.size === 0) {
          newViews.add("documento")
        }
        return newViews
      })
    }
  }, [activeTab])

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="bg-background sticky top-0 z-10 border-b-0">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Volver al Dashboard
                  </Button>
                </Link>
                <h1 className="text-2xl font-semibold">Documento {documentId}</h1>
                {getStatusBadge(documentStatus)}
              </div>
              
              <div className="flex items-center gap-2">
                {(documentStatus === "Para revisar" || documentStatus === "Para confirmar") && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={handleConfirm} className="text-green-600 hover:bg-green-600/10">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
                        Confirmar
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={handleReject} className="text-destructive hover:bg-destructive/10">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
                        Rechazar
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
                {documentStatus === "Confirmado" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={handleSend} className="text-green-600 hover:bg-green-600/10">
                        <Send className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
                      Enviar
                    </TooltipContent>
                  </Tooltip>
                )}
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleExport}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
                    Exportar
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
                    Eliminar
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handlePreviousDocument}
                      disabled={!hasPreviousDoc}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
                    Documento anterior
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleNextDocument}
                      disabled={!hasNextDoc}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-background text-foreground border shadow-lg" side="top">
                    Documento siguiente
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-1.5 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList
              className="grid w-full"
              style={{ gridTemplateColumns: `repeat(${2 + relatedDocuments.length}, 1fr)` }}
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
                  Doc. Relacionado {idx + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            <Card className="mt-4">
              <CardContent className="py-1.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {activeTab === "consolidated" && "Vista de documentos consolidados"}
                    {activeTab === "main" && "Documento Principal"}
                    {activeTab !== "consolidated" && activeTab !== "main" && "Documento Relacionado"}
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant={activeViews.has("documento") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleView("documento")}
                    >
                      {activeViews.has("documento") ? (
                        <Eye className="h-4 w-4 mr-2" />
                      ) : (
                        <EyeOff className="h-4 w-4 mr-2" />
                      )}
                      Documento
                    </Button>
                    <Button
                      variant={activeViews.has("datos") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleView("datos")}
                      disabled={activeTab === "consolidated"}
                      className={activeTab === "consolidated" ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      {activeViews.has("datos") ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                      Datos
                    </Button>
                    <Button
                      variant={activeViews.has("resultado") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleView("resultado")}
                    >
                      {activeViews.has("resultado") ? (
                        <Eye className="h-4 w-4 mr-2" />
                      ) : (
                        <EyeOff className="h-4 w-4 mr-2" />
                      )}
                      Resultado
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <TabsContent value="consolidated" className="space-y-4">
              {renderViewColumns("consolidated")}
            </TabsContent>

            <TabsContent value="main" className="space-y-4">
              {renderViewColumns("main")}
            </TabsContent>

            {relatedDocuments.map((doc, idx) => (
              <TabsContent key={doc.id} value={doc.id} className="space-y-4">
                {renderViewColumns("related", idx)}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* AI Reasoning Modal */}
        <Dialog open={showReasoningModal} onOpenChange={setShowReasoningModal}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Razonamiento del Asistente IA
              </DialogTitle>
              <DialogDescription>Proceso de análisis y generación del resultado contable</DialogDescription>
            </DialogHeader>

            {currentReasoning && (
              <div className="space-y-6 mt-4">
                {/* Summary Section */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Resumen</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{currentReasoning.summary}</p>
                </div>

                {/* Processing Steps */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Pasos de Procesamiento</h3>
                  <div className="space-y-2">
                    {currentReasoning.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Sources - Only for consolidated view */}
                {currentReasoning.dataSources && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Fuentes de Datos Utilizadas</h3>
                    <div className="space-y-2">
                      {currentReasoning.dataSources.map((source, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">{source.name}</p>
                            <p className="text-xs text-muted-foreground">{source.recordsUsed} registros utilizados</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            {source.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence Score */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Nivel de Confianza</h3>
                    <span className="text-sm font-medium">{currentReasoning.confidence}%</span>
                  </div>
                  <Progress value={currentReasoning.confidence} className="h-2" />
                </div>

                {/* Data Quality */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Calidad de Datos</h3>
                  <p className="text-sm text-muted-foreground">{currentReasoning.dataQuality}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
