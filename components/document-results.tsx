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
  List,
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
import { documentsService, type Document, type DocumentGroup, type DocumentWithGroup } from "@/services/documents.service"
import { Loader2 } from "lucide-react"

interface ExtractedData {
  documentInfo: {
    type: "Factura" | "Remito" | "Tabla"
    number: string
    date: string
    filename: string
    url?: string
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
  url?: string
}

interface DocumentResultsProps {
  documentId: string
  relatedDocuments?: RelatedDocument[]
}

const mapDocumentToExtractedData = (doc: Document): ExtractedData => {
  // Map journal entries to accounting entry format
  const journalEntry = doc.journal_entries[0]

  // Extract unique fields for headers if normalized_journal_fields exists
  let headers: string[] = []
  let rows: Array<Record<string, string | number>> = []
  let entries: Array<{
    account: string
    name: string
    debit: number
    credit: number
    description: string
    costCenter: string
    project: string
    taxCode?: string
  }> = []

  if (journalEntry && journalEntry.normalized_journal_fields) {
    // Get all unique field names
    const fieldNames = new Set<string>()
    journalEntry.normalized_journal_fields.forEach(field => {
      fieldNames.add(field.field)
    })
    headers = Array.from(fieldNames)

    // Group by line_index to create rows
    const rowsMap = new Map<number, Record<string, any>>()
    journalEntry.normalized_journal_fields.forEach(field => {
      if (!rowsMap.has(field.line_index)) {
        rowsMap.set(field.line_index, { ID: field.line_index })
      }
      const row = rowsMap.get(field.line_index)!
      row[field.field] = field.value
    })
    rows = Array.from(rowsMap.values()) as Array<Record<string, string | number>>
  }

  return {
    documentInfo: {
      type: (doc.document_type as any) || "Documento",
      number: doc.id.toString(),
      date: doc.date_document || new Date().toISOString().split('T')[0],
      filename: doc.document_name || "documento.pdf",
      url: doc.document_url,
    },
    supplier: {
      name: doc.organization_name || "Desconocido",
      cuit: "", // Not directly available in Document interface
      address: "",
    },
    items: [], // TODO: Extract items from doc.data if available
    accountingEntry: {
      dataSources: {
        mainDocument: doc.document_name,
        additionalDocuments: [],
        apiData: "ERP",
        masterData: "Plan de Cuentas",
      },
      outputTable: {
        headers: headers.length > 0 ? headers : ["ID", "Cuenta", "Debe", "Haber", "DescripciÃ³n"],
        rows: rows,
      },
      entries: entries,
    },
    // If doc.data contains table data, map it here
    table: undefined
  }
}




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

export function DocumentResults({
  documentId,
  initialData,
}: {
  documentId: string
  initialData?: DocumentWithGroup
}) {
  const [data, setData] = useState<ExtractedData | null>(null)
  const [editedData, setEditedData] = useState<ExtractedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("main")
  const [columnVisibility, setColumnVisibility] = useState({
    pdf: true,
    extracted: true,
    reasoning: true,
    erp: true,
  })
  const [expandedDataSources, setExpandedDataSources] = useState({
    erp: true,
    masterData: true,
  })
  const [isPdfMaximized, setIsPdfMaximized] = useState(false)
  const [documentGroup, setDocumentGroup] = useState<DocumentGroup | null>(null)
  const [allRelatedDocuments, setAllRelatedDocuments] = useState<Document[]>([])
  const [consolidatedViewDocId, setConsolidatedViewDocId] = useState<number | null>(null)
  const { toast } = useToast()

  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true)
        let response = initialData

        if (!response) {
          response = await documentsService.getDocumentById(Number.parseInt(documentId))
        }

        if (response.document_group) {
          setDocumentGroup(response.document_group)
          const mainDoc = { ...response.document_group.main_document, relationship_type: "main" }
          const relatedDocs = response.document_group.related_documents || []
          setAllRelatedDocuments([mainDoc, ...relatedDocs])

          // Set initial consolidated view doc ID to main document
          setConsolidatedViewDocId(mainDoc.id)
        } else {
          setAllRelatedDocuments([response.document])
        }

        const extractedData = mapDocumentToExtractedData(response.document)
        setData(extractedData)
        setEditedData(extractedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el documento")
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [documentId, initialData])

  // Handle tab changes
  const handleTabChange = async (value: string) => {
    setActiveTab(value)

    if (value === "consolidated") {
      // Load consolidated context if available
      if (documentGroup?.journal_entry_context) {
        // Here we would map the journal_entry_context to ExtractedData
        // For now, we'll keep the current data but maybe show a flag or different view
      }
    } else if (value === "main") {
      if (documentGroup?.main_document) {
        const extractedData = mapDocumentToExtractedData(documentGroup.main_document)
        setData(extractedData)
        setEditedData(extractedData)
        setConsolidatedViewDocId(documentGroup.main_document.id)
      }
    } else if (value.startsWith("doc_")) {
      const docId = Number.parseInt(value.replace("doc_", ""))
      const doc = allRelatedDocuments.find(d => d.id === docId)
      if (doc) {
        const extractedData = mapDocumentToExtractedData(doc)
        setData(extractedData)
        setEditedData(extractedData)
        setConsolidatedViewDocId(doc.id)
      }
    }
  }

  const toggleColumn = (column: keyof typeof columnVisibility) => {
    setColumnVisibility((prev) => ({ ...prev, [column]: !prev[column] }))
  }

  const toggleDataSource = (source: keyof typeof expandedDataSources) => {
    setExpandedDataSources((prev) => ({ ...prev, [source]: !prev[source] }))
  }

  const handleCellEdit = (rowId: string, field: string, value: string | number) => {
    if (!editedData || !editedData.table) return

    const newRows = editedData.table.rows.map((row) => {
      if (row.id === rowId) {
        return { ...row, [field]: value }
      }
      return row
    })

    setEditedData({
      ...editedData,
      table: {
        ...editedData.table,
        rows: newRows,
      },
    })
  }

  const handleConfirm = async () => {
    try {
      await documentsService.confirmDocument(Number(documentId));
      toast({
        title: "Documento confirmado",
        description: "El documento ha sido confirmado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo confirmar el documento.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    try {
      await documentsService.rejectDocument(Number(documentId));
      toast({
        title: "Documento rechazado",
        description: "El documento ha sido rechazado.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo rechazar el documento.",
        variant: "destructive",
      });
    }
  };

  const getPdfUrl = () => {
    if (activeTab === "consolidated") {
      // In consolidated view, show the document selected in the dropdown or the main one by default
      const docId = consolidatedViewDocId;
      const doc = allRelatedDocuments.find(d => d.id === docId);
      return doc?.document_url || "";
    } else if (activeTab === "main") {
      const mainDoc = documentGroup?.main_document || allRelatedDocuments.find(d => d.id === Number(documentId));
      return mainDoc?.document_url || "";
    } else if (activeTab.startsWith("doc_")) {
      const docId = Number(activeTab.replace("doc_", ""));
      const doc = allRelatedDocuments.find(d => d.id === docId);
      return doc?.document_url || "";
    }
    return "";
  };

  const getPdfFilename = () => {
    // Logic to get filename based on active tab and selected doc
    const url = getPdfUrl();
    return url.split('/').pop() || "documento.pdf";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Cargando documento...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-destructive text-lg font-medium">Error: {error || "No se encontraron datos"}</div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Intentar de nuevo
        </Button>
      </div>
    )
  }

  // Helper to determine file type for viewer
  const currentPdfUrl = getPdfUrl();
  const isPdf = currentPdfUrl?.toLowerCase().endsWith('.pdf');
  const isImage = currentPdfUrl?.match(/\.(jpeg|jpg|gif|png)$/i);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">
                {data.documentInfo.type} {data.documentInfo.number}
              </h1>
              <Badge variant="outline" className="text-xs">
                {data.documentInfo.date}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {loading ? "Cargando..." : "Pendiente"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{data.supplier.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center mr-4 border-r pr-4 gap-1">
            <Button
              variant={columnVisibility.pdf ? "secondary" : "ghost"}
              size="sm"
              onClick={() => toggleColumn("pdf")}
              title="Ver Documento Original"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant={columnVisibility.extracted ? "secondary" : "ghost"}
              size="sm"
              onClick={() => toggleColumn("extracted")}
              title="Ver Datos ExtraÃ­dos"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={columnVisibility.reasoning ? "secondary" : "ghost"}
              size="sm"
              onClick={() => toggleColumn("reasoning")}
              title="Ver Razonamiento IA"
            >
              <Brain className="h-4 w-4" />
            </Button>
            <Button
              variant={columnVisibility.erp ? "secondary" : "ghost"}
              size="sm"
              onClick={() => toggleColumn("erp")}
              title="Ver Datos ERP"
            >
              <Database className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" className="gap-2" onClick={handleReject}>
            <Undo2 className="h-4 w-4" />
            Rechazar
          </Button>
          <Button size="sm" className="gap-2" onClick={handleConfirm}>
            <Check className="h-4 w-4" />
            Confirmar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b shrink-0 bg-muted/10">
            <TabsList className="h-9">
              {documentGroup && (
                <TabsTrigger value="consolidated" className="text-xs">
                  Vista Consolidada
                </TabsTrigger>
              )}
              <TabsTrigger value="main" className="text-xs">
                Documento Principal
              </TabsTrigger>
              {allRelatedDocuments.filter(d => d.id !== documentGroup?.main_document?.id).map((doc) => (
                <TabsTrigger key={doc.id} value={`doc_${doc.id}`} className="text-xs">
                  {doc.document_type || `Doc #${doc.id}`}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Document Selector for Consolidated View */}
            {activeTab === "consolidated" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Visualizando:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                      {allRelatedDocuments.find(d => d.id === consolidatedViewDocId)?.document_type || "Seleccionar Documento"}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {allRelatedDocuments.map(doc => (
                      <DropdownMenuItem key={doc.id} onClick={() => setConsolidatedViewDocId(doc.id)}>
                        {doc.document_type || `Documento #${doc.id}`}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* PDF Viewer Column */}
            {columnVisibility.pdf && (
              <div
                className={`${isPdfMaximized ? "w-full absolute inset-0 z-50 bg-background" : "w-[45%]"
                  } flex flex-col border-r transition-all duration-300 relative`}
              >
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {getPdfFilename()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                      <a href={currentPdfUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setIsPdfMaximized(!isPdfMaximized)}
                    >
                      {isPdfMaximized ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex-1 bg-muted/20 relative overflow-hidden">
                  {currentPdfUrl ? (
                    isPdf ? (
                      <iframe
                        src={currentPdfUrl}
                        className="w-full h-full"
                        title="Document Viewer"
                      />
                    ) : isImage ? (
                      <div className="w-full h-full flex items-center justify-center overflow-auto">
                        <img src={currentPdfUrl} alt="Document" className="max-w-full max-h-full object-contain" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
                        <FileStack className="h-16 w-16 text-muted-foreground/50" />
                        <div className="space-y-2">
                          <h3 className="font-medium text-lg">Vista previa no disponible</h3>
                          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            Este tipo de archivo no se puede previsualizar directamente.
                          </p>
                        </div>
                        <Button asChild>
                          <a href={currentPdfUrl} download target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar Archivo
                          </a>
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No hay documento para mostrar
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Extracted Data Column */}
            {columnVisibility.extracted && !isPdfMaximized && (
              <div className="flex-1 flex flex-col min-w-0 bg-card">
                {/* Content for all tabs is basically the same structure, just data changes */}
                <TabsContent value={activeTab} className="flex-1 flex flex-col m-0 p-0 data-[state=active]:flex overflow-hidden">
                  {/* Reasoning Section (Collapsible) */}
                  {columnVisibility.reasoning && (
                    <div className="border-b">
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center gap-2 px-4 py-2 w-full hover:bg-muted/50 transition-colors">
                          <Brain className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Razonamiento IA</span>
                          <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 py-2 bg-muted/10 text-sm text-muted-foreground border-t">
                          <p>
                            El sistema ha identificado este documento como una <strong>{data.documentInfo.type}</strong> basÃ¡ndose en
                            la estructura y palabras clave encontradas. Los Ã­tems fueron extraÃ­dos de la tabla principal.
                          </p>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}

                  {/* Accounting Entry Table */}
                  <div className="flex-1 overflow-auto p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        Asiento Contable Generado
                      </h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                          <RefreshCw className="h-3 w-3" />
                          Regenerar
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                          <Edit3 className="h-3 w-3" />
                          Editar Manualmente
                        </Button>
                      </div>
                    </div>

                    {editedData?.table ? (
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              {editedData.table.headers.map((header) => (
                                <TableHead key={header} className="h-8 text-xs font-medium">
                                  {header}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {editedData.table.rows.map((row, index) => (
                              <TableRow key={row.id || index} className="hover:bg-muted/5">
                                {editedData.table!.headers.map((header) => {
                                  // Map header to key (simple lowercase for now, ideally should be robust)
                                  const key = header.toLowerCase().replace(/ /g, "_");
                                  // Fallback for specific known headers if needed
                                  const val = row[key] || row[header] || "";
                                  return (
                                    <TableCell key={`${row.id}-${header}`} className="py-1.5">
                                      <EditableCell
                                        value={val}
                                        onChange={(newValue) => handleCellEdit(row.id as string, key, newValue)}
                                        type={header.toLowerCase().includes("importe") || header.toLowerCase().includes("debe") || header.toLowerCase().includes("haber") ? "number" : "text"}
                                      />
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground border rounded-md border-dashed">
                        <p>No hay datos de tabla disponibles</p>
                      </div>
                    )}
                  </div>

                  {/* Data Sources / ERP Info (Sidebar-like) */}
                  {columnVisibility.erp && (
                    <div className="border-t bg-muted/10 p-4">
                      <div className="space-y-4">
                        <Collapsible
                          open={expandedDataSources.erp}
                          onOpenChange={() => toggleDataSource("erp")}
                        >
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-start gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded text-xs transition-colors">
                              <Building2 className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0 text-left">
                                <p className="font-medium">ERP: Microsoft Dynamics 365</p>
                                <p className="text-muted-foreground">Conectado - Ãšltima sinc: Hoy 09:30</p>
                              </div>
                              {expandedDataSources.erp ? (
                                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-1 ml-5">
                            <div className="p-2 bg-muted/20 rounded text-xs">
                              <p className="text-muted-foreground">InformaciÃ³n de API no disponible</p>
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
                            <div className="p-2 bg-muted/20 rounded text-xs">
                              <p className="text-muted-foreground">InformaciÃ³n de Master Data no disponible</p>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  )
}
