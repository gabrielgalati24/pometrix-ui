"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Upload,
  FileText,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  Link2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  FileOutput,
  Trash2,
  MoreVertical,
  X,
  Info,
  Send,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DocumentLogsModal } from "@/components/document-logs-modal"
import { documentsService, type Document, type Organization } from "@/services/documents.service"

type DocumentStatus =
  | "Para revisar"
  | "Procesado"
  | "Error"
  | "Confirmado"
  | "Exportado"
  | "Finalizado"
  | "Rechazado"

type DocumentType = "Factura" | "Remito" | string

type DocumentRow = {
  id: string
  filename: string
  supplier: string
  type: DocumentType
  documentDate: string // dd/mm/yyyy
  uploadDate: string // dd/mm/yyyy
  status: DocumentStatus
  relatedDocuments?: string[]
  usedForTraining?: boolean
  uploadedBy?: string
  logs?: any[]
}

function toDDMMYYYY(value: any): string {
  if (!value) return ""
  if (typeof value === "string") {
    // already dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(value)) {
      const [d, m, y] = value.split("/")
      const yyyy = y.length === 2 ? `20${y}` : y
      return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${yyyy}`
    }
    // iso date
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const [yyyy, mm, dd] = value.slice(0, 10).split("-")
      return `${dd}/${mm}/${yyyy}`
    }
  }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = String(d.getFullYear())
  return `${dd}/${mm}/${yyyy}`
}

function normalizeDoc(raw: Document): DocumentRow {
  const id = String(raw.id)

  // Map backend status to frontend status
  const mapStatus = (status: string): DocumentStatus => {
    const statusMap: Record<string, DocumentStatus> = {
      "review": "Para revisar",
      "processed": "Procesado",
      "error": "Error",
      "confirmed": "Confirmado",
      "exported": "Exportado",
      "finished": "Finalizado",
      "rejected": "Rechazado",
    }
    return statusMap[status.toLowerCase()] || "Procesado"
  }

  // Extract supplier from data or extra_data
  let supplier = "—"
  if (raw.data && typeof raw.data === "object") {
    supplier = (raw.data as any)?.supplier || (raw.data as any)?.emisor || (raw.data as any)?.proveedor || supplier
  }
  if (supplier === "—" && raw.extra_data && typeof raw.extra_data === "object") {
    supplier = (raw.extra_data as any)?.supplier || (raw.extra_data as any)?.emisor || supplier
  }

  return {
    id,
    filename: raw.document_name,
    supplier,
    type: raw.document_type,
    documentDate: toDDMMYYYY(raw.date_document),
    uploadDate: toDDMMYYYY(raw.journal_entries?.[0]?.date_create || ""),
    status: mapStatus(raw.human_status || raw.status),
    relatedDocuments: [],
    usedForTraining: raw.is_trained,
    uploadedBy: raw.uploaded_by_username || "currentUser",
    logs: [],
  }
}



const getStatusBadge = (status: string, onStatusChange: (newStatus: string) => void) => {
  const statusOptions = [
    { value: "Para revisar", label: "Para revisar", icon: AlertCircle },
    { value: "Procesado", label: "Procesado", icon: CheckCircle },
    { value: "Error", label: "Error", icon: XCircle },
    { value: "Confirmado", label: "Confirmado", icon: CheckCircle },
    { value: "Exportado", label: "Exportado", icon: Send },
    { value: "Finalizado", label: "Finalizado", icon: CheckCircle },
    { value: "Rechazado", label: "Rechazado", icon: XCircle },
  ]

  const getBadgeContent = (st: string) => {
    switch (st) {
      case "Para revisar":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-600 text-white flex items-center gap-1.5 cursor-pointer hover:bg-yellow-700"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Para revisar
          </Badge>
        )
      case "Procesado":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-500 text-white flex items-center gap-1.5 cursor-pointer hover:bg-blue-600"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Procesado
          </Badge>
        )
      case "Error":
        return (
          <Badge variant="destructive" className="flex items-center gap-1.5 cursor-pointer hover:bg-destructive/80">
            <XCircle className="h-3.5 w-3.5" />
            Error
          </Badge>
        )
      case "Confirmado":
        return (
          <Badge
            variant="default"
            className="bg-green-600 text-white flex items-center gap-1.5 cursor-pointer hover:bg-green-700"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Confirmado
          </Badge>
        )
      case "Exportado":
        return (
          <Badge
            variant="default"
            className="bg-green-600 text-white flex items-center gap-1.5 cursor-pointer hover:bg-green-700"
          >
            <Send className="h-3.5 w-3.5" />
            Exportado
          </Badge>
        )
      case "Finalizado":
        return (
          <Badge
            variant="default"
            className="bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer hover:bg-emerald-800"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Finalizado
          </Badge>
        )
      case "Rechazado":
        return (
          <Badge variant="destructive" className="flex items-center gap-1.5 cursor-pointer hover:bg-destructive/80">
            <XCircle className="h-3.5 w-3.5" />
            Rechazado
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="cursor-pointer">
            {st}
          </Badge>
        )
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        {getBadgeContent(status)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {statusOptions.map((option) => {
          const Icon = option.icon
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={(e) => {
                e.stopPropagation()
                onStatusChange(option.value)
              }}
              className={status === option.value ? "bg-muted" : ""}
            >
              <Icon className="h-4 w-4 mr-2" />
              {option.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DocumentDashboard() {
  const router = useRouter()
  const { verifyToken, isAuthenticated, isLoading } = useAuthStore()

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("")
  const [organizationsLoading, setOrganizationsLoading] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [emisorFilter, setEmisorFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [trainingFilter, setTrainingFilter] = useState("all")
  const [fechaDocumentoDesde, setFechaDocumentoDesde] = useState("")
  const [fechaDocumentoHasta, setFechaDocumentoHasta] = useState("")
  const [fechaSubidaDesde, setFechaSubidaDesde] = useState("")
  const [fechaSubidaHasta, setFechaSubidaHasta] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [documentsError, setDocumentsError] = useState<string | null>(null)

  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [documentsToDelete, setDocumentsToDelete] = useState<Set<string>>(new Set())
  const [markAsFinished, setMarkAsFinished] = useState(true)

  const [showLogsModal, setShowLogsModal] = useState(false)
  const [selectedDocumentForLogs, setSelectedDocumentForLogs] = useState<{
    id: string
    filename: string
    logs: any[]
  } | null>(null)

  const [bulkBusy, setBulkBusy] = useState<null | "confirm" | "reject" | "export" | "finalize" | "reprocessR" | "reprocessA" | "download" | "delete">(
    null,
  )
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({})

  const fetchAbort = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!isAuthenticated && !isLoading) verifyToken()
  }, [verifyToken, isAuthenticated, isLoading])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login")
  }, [isLoading, isAuthenticated, router])

  const loadOrganizations = async () => {
    setOrganizationsLoading(true)
    try {
      const response = await documentsService.getOrganizations()
      setOrganizations(response.organizations)
      if (response.organizations.length > 0 && !selectedOrganizationId) {
        setSelectedOrganizationId(String(response.organizations[0].id))
      }
    } catch (error) {
      console.error("Error loading organizations:", error)
      setDocumentsError("No se pudieron cargar las organizaciones")
    } finally {
      setOrganizationsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      loadOrganizations()
    }
  }, [isAuthenticated, isLoading])

  const loadDocuments = async () => {
    if (!selectedOrganizationId) return

    setDocumentsError(null)
    setDocumentsLoading(true)
    try {
      fetchAbort.current?.abort()
      fetchAbort.current = new AbortController()

      const response = await documentsService.getDocuments(
        Number(selectedOrganizationId),
        currentPage,
        pageSize,
        {
          search: searchTerm,
          status: statusFilter !== "all" ? statusFilter : undefined,
          type: typeFilter !== "all" ? typeFilter : undefined,
          uploaded_by: userFilter !== "all" && userFilter !== "myDocuments" ? userFilter : undefined,
          is_trained: trainingFilter !== "all" ? (trainingFilter === "training" ? "true" : "false") : undefined,
          date_start: fechaDocumentoDesde || undefined,
          date_end: fechaDocumentoHasta || undefined,
        }
      )

      const rows: DocumentRow[] = response.documents.documents.map(normalizeDoc)
      setDocuments(rows)
    } catch (e: any) {
      if (e?.name !== "AbortError") setDocumentsError(e?.message ?? "No se pudieron cargar los documentos")
    } finally {
      setDocumentsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && !isLoading && selectedOrganizationId) {
      loadDocuments()
    }
    return () => fetchAbort.current?.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, selectedOrganizationId, currentPage, pageSize, searchTerm, statusFilter, typeFilter, userFilter, trainingFilter, fechaDocumentoDesde, fechaDocumentoHasta])

  useEffect(() => {
    if (isAuthenticated && !isLoading) loadDocuments()
    return () => fetchAbort.current?.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading])

  useEffect(() => {
    setCurrentPage(1)
  }, [
    searchTerm,
    statusFilter,
    typeFilter,
    emisorFilter,
    userFilter,
    fechaDocumentoDesde,
    fechaDocumentoHasta,
    fechaSubidaDesde,
    fechaSubidaHasta,
    sortColumn,
    sortDirection,
  ])

  useEffect(() => {
    setSelectedDocuments(new Set())
  }, [currentPage, pageSize])

  if (isLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto p-3 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  const uniqueEmisores = useMemo(() => Array.from(new Set(documents.map((d) => d.supplier))).sort(), [documents])

  const parseDate = (dateStr: string) => {
    const [day, month, year] = (dateStr || "").split("/")
    if (!day || !month || !year) return new Date("invalid")
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const isDateInRange = (dateStr: string, desde: string, hasta: string) => {
    if (!desde && !hasta) return true
    const date = parseDate(dateStr)
    if (Number.isNaN(date.getTime())) return false
    if (desde && !hasta) return date >= new Date(desde)
    if (!desde && hasta) return date <= new Date(hasta)
    return date >= new Date(desde) && date <= new Date(hasta)
  }

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.supplier.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || doc.status === statusFilter
      const matchesType = typeFilter === "all" || doc.type === typeFilter
      const matchesEmisor = emisorFilter === "all" || doc.supplier === emisorFilter

      const matchesUser =
        userFilter === "all" ||
        (userFilter === "myDocuments" && doc.uploadedBy === "currentUser") ||
        (userFilter !== "all" && userFilter !== "myDocuments" && doc.uploadedBy === userFilter)

      const matchesTraining =
        trainingFilter === "all" ||
        (trainingFilter === "training" && doc.usedForTraining === true) ||
        (trainingFilter === "notTraining" && doc.usedForTraining !== true)

      const matchesFechaDocumento = isDateInRange(doc.documentDate, fechaDocumentoDesde, fechaDocumentoHasta)
      const matchesFechaSubida = isDateInRange(doc.uploadDate, fechaSubidaDesde, fechaSubidaHasta)

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesEmisor &&
        matchesUser &&
        matchesTraining &&
        matchesFechaDocumento &&
        matchesFechaSubida
      )
    })
  }, [
    documents,
    emisorFilter,
    fechaDocumentoDesde,
    fechaDocumentoHasta,
    fechaSubidaDesde,
    fechaSubidaHasta,
    searchTerm,
    statusFilter,
    trainingFilter,
    typeFilter,
    userFilter,
  ])

  const totalDocuments = documents.length
  const paraRevisarDocuments = documents.filter((doc) => doc.status === "Para revisar").length
  const procesadoDocuments = documents.filter((doc) => doc.status === "Procesado").length
  const errorDocuments = documents.filter((doc) => doc.status === "Error").length
  const confirmadosDocuments = documents.filter((doc) => doc.status === "Confirmado").length

  const getDocumentsThisWeek = () => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return documents.filter((doc) => {
      const [day, month, year] = (doc.uploadDate || "").split("/")
      const uploadDate = new Date(Number(year), Number(month) - 1, Number(day))
      return !Number.isNaN(uploadDate.getTime()) && uploadDate >= oneWeekAgo
    }).length
  }

  const documentsThisWeek = getDocumentsThisWeek()
  const successPercentage = totalDocuments > 0 ? Math.round((confirmadosDocuments / totalDocuments) * 100) : 0

  const handleMetricClick = (filterValue: string) => {
    setStatusFilter(filterValue)
    setCurrentPage(1)
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4 text-muted-foreground/40" />
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 text-muted-foreground" />
    ) : (
      <ArrowDown className="h-4 w-4 text-muted-foreground" />
    )
  }

  const sortedDocuments = useMemo(() => {
    const base = [...filteredDocuments]
    return base.sort((a, b) => {
      if (!sortColumn) return 0

      let aValue: any
      let bValue: any

      switch (sortColumn) {
        case "id":
          aValue = a.id
          bValue = b.id
          break
        case "tipo":
          aValue = a.type
          bValue = b.type
          break
        case "emisor":
          aValue = a.supplier
          bValue = b.supplier
          break
        case "fechaDocumento":
          aValue = new Date(a.documentDate.split("/").reverse().join("-"))
          bValue = new Date(b.documentDate.split("/").reverse().join("-"))
          break
        case "fechaSubida":
          aValue = new Date(a.uploadDate.split("/").reverse().join("-"))
          bValue = new Date(b.uploadDate.split("/").reverse().join("-"))
          break
        case "estado":
          aValue = a.status
          bValue = b.status
          break
        case "archivo":
          aValue = a.filename
          bValue = b.filename
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredDocuments, sortColumn, sortDirection])

  const totalPages = Math.ceil(sortedDocuments.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedDocuments = sortedDocuments.slice(startIndex, endIndex)

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedDocuments(new Set(paginatedDocuments.map((doc) => doc.id)))
    else setSelectedDocuments(new Set())
  }

  const handleSelectDocument = (docId: string, checked: boolean) => {
    const newSelected = new Set(selectedDocuments)
    if (checked) newSelected.add(docId)
    else newSelected.delete(docId)
    setSelectedDocuments(newSelected)
  }

  const isAllSelected =
    paginatedDocuments.length > 0 && paginatedDocuments.every((doc) => selectedDocuments.has(doc.id))
  const isSomeSelected = selectedDocuments.size > 0 && !isAllSelected

  const handlePageChange = (page: number) => setCurrentPage(page)

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size))
    setCurrentPage(1)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push("...")
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
    setEmisorFilter("all")
    setUserFilter("all")
    setTrainingFilter("all")
    setFechaDocumentoDesde("")
    setFechaDocumentoHasta("")
    setFechaSubidaDesde("")
    setFechaSubidaHasta("")
  }

  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    emisorFilter !== "all" ||
    userFilter !== "all" ||
    trainingFilter !== "all" ||
    fechaDocumentoDesde !== "" ||
    fechaDocumentoHasta !== "" ||
    fechaSubidaDesde !== "" ||
    fechaSubidaHasta !== ""

  const getSelectedDocumentsStatus = () => {
    const docs = documents.filter((doc) => selectedDocuments.has(doc.id))
    if (docs.length === 0) return null
    const firstStatus = docs[0].status
    const allSameStatus = docs.every((doc) => doc.status === firstStatus)
    return allSameStatus ? firstStatus : "mixed"
  }

  const selectedStatus = getSelectedDocumentsStatus()

  const bulkIds = () => Array.from(selectedDocuments)

  const setStatusLocal = (ids: string[], status: DocumentStatus) => {
    setDocuments((prev) => prev.map((d) => (ids.includes(d.id) ? { ...d, status } : d)))
  }

  const handleReprocessReading = async () => {
    // TODO: Implement with correct backend endpoint
    console.log("Reprocess Reading not implemented")
  }

  const handleReprocessOutput = async () => {
    // TODO: Implement with correct backend endpoint
    console.log("Reprocess Output not implemented")
  }

  const handleDelete = () => {
    setDocumentsToDelete(new Set(selectedDocuments))
    setShowDeleteModal(true)
  }

  const handleConfirm = async () => {
    // TODO: Implement with correct backend endpoint
    console.log("Bulk Confirm not implemented")
  }

  const handleReject = async () => {
    // TODO: Implement with correct backend endpoint
    console.log("Bulk Reject not implemented")
  }

  const handleDownload = () => setShowDownloadModal(true)
  const handleExport = () => setShowExportModal(true)

  const handleDownloadFormat = async (format: "excel" | "txt") => {
    // TODO: Implement with correct backend endpoint
    console.log("Download Format not implemented")
    setShowDownloadModal(false)
  }

  const handleExportOption = async (option: "api" | "excel" | "txt") => {
    // TODO: Implement with correct backend endpoint
    console.log("Export Option not implemented")
    setShowExportModal(false)
  }

  const handleFinalize = async () => {
    // TODO: Implement with correct backend endpoint
    console.log("Finalize not implemented")
  }

  const handleIndividualConfirm = async (docId: string) => {
    // TODO: Implement with correct backend endpoint
    console.log("Individual Confirm not implemented")
  }

  const handleIndividualReject = async (docId: string) => {
    // TODO: Implement with correct backend endpoint
    console.log("Individual Reject not implemented")
  }

  const handleIndividualFinalize = async (docId: string) => {
    // TODO: Implement with correct backend endpoint
    console.log("Individual Finalize not implemented")
  }

  const handleIndividualDelete = (docId: string) => {
    setDocumentsToDelete(new Set([docId]))
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    // TODO: Implement with correct backend endpoint
    console.log("Confirm Delete not implemented")
    setShowDeleteModal(false)
  }

  const handleViewLogs = async (doc: DocumentRow) => {
    setSelectedDocumentForLogs({ id: doc.id, filename: doc.filename, logs: [] })
    setShowLogsModal(true)
    // TODO: Implement with correct backend endpoint
    console.log("View Logs not implemented")
  }

  const handleInlineStatusChange = async (docId: string, newStatus: DocumentStatus) => {
    // TODO: Implement with correct backend endpoint
    console.log("Inline Status Change not implemented")
  }

  const bulkDisabled = bulkBusy !== null || documentsLoading

  return (
    <div className="container mx-auto p-3 space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">Procesamiento inteligente de documentos</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {successPercentage}% confirmados · {documentsThisWeek} esta semana
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto items-center">
          <div className="w-[200px]">
            <Select
              value={selectedOrganizationId}
              onValueChange={(val) => setSelectedOrganizationId(val)}
              disabled={organizationsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Organización" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={String(org.id)}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={loadDocuments}
            disabled={documentsLoading || bulkBusy !== null || !selectedOrganizationId}
          >
            {documentsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Actualizar
          </Button>
          <Link href="/upload" className="w-full md:w-auto">
            <Button size="default" className="w-full md:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              Subir Nuevo Documento
            </Button>
          </Link>
        </div>
      </div>

      {documentsError && (
        <div className="p-3 rounded-lg border bg-muted/50 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span>{documentsError}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setDocumentsError(null)}>
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleMetricClick("all")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsLoading ? "—" : totalDocuments}</div>
            <p className="text-xs text-muted-foreground">{documentsLoading ? "Cargando..." : `${documentsThisWeek} esta semana`}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleMetricClick("Procesado")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Procesados</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsLoading ? "—" : procesadoDocuments}</div>
            <p className="text-xs text-muted-foreground">Haz clic para filtrarlos</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleMetricClick("Para revisar")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Para revisar</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsLoading ? "—" : paraRevisarDocuments}</div>
            <p className="text-xs text-muted-foreground">Haz clic para filtrarlos</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleMetricClick("Error")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errores</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsLoading ? "—" : errorDocuments}</div>
            <p className="text-xs text-muted-foreground">Haz clic para filtrarlos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">Documentos</CardTitle>
        </CardHeader>

        <CardContent className="pt-1 space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Buscar</label>
              <div className="relative mt-0.5">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, emisor o nombre de archivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  disabled={documentsLoading}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                <Select value={typeFilter} onValueChange={setTypeFilter} disabled={documentsLoading}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Factura">Facturas</SelectItem>
                    <SelectItem value="Remito">Remitos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter} disabled={documentsLoading}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Para revisar">Para revisar</SelectItem>
                    <SelectItem value="Procesado">Procesado</SelectItem>
                    <SelectItem value="Error">Error</SelectItem>
                    <SelectItem value="Confirmado">Confirmado</SelectItem>
                    <SelectItem value="Exportado">Exportado</SelectItem>
                    <SelectItem value="Finalizado">Finalizado</SelectItem>
                    <SelectItem value="Rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Emisor</label>
                <Select value={emisorFilter} onValueChange={setEmisorFilter} disabled={documentsLoading}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueEmisores.map((emisor) => (
                      <SelectItem key={emisor} value={emisor}>
                        {emisor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  disabled={documentsLoading}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Más filtros
                </Button>
              </div>

              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button variant="ghost" size="default" onClick={clearAllFilters} disabled={documentsLoading}>
                    <X className="mr-2 h-4 w-4" />
                    Limpiar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="grid gap-2 p-3 border rounded-lg bg-muted/50 grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Fecha Doc. (Desde)</label>
                <Input
                  type="date"
                  value={fechaDocumentoDesde}
                  onChange={(e) => setFechaDocumentoDesde(e.target.value)}
                  className="text-sm"
                  disabled={documentsLoading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Fecha Doc. (Hasta)</label>
                <Input
                  type="date"
                  value={fechaDocumentoHasta}
                  onChange={(e) => setFechaDocumentoHasta(e.target.value)}
                  className="text-sm"
                  disabled={documentsLoading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Fecha Subida (Desde)</label>
                <Input
                  type="date"
                  value={fechaSubidaDesde}
                  onChange={(e) => setFechaSubidaDesde(e.target.value)}
                  className="text-sm"
                  disabled={documentsLoading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Fecha Subida (Hasta)</label>
                <Input
                  type="date"
                  value={fechaSubidaHasta}
                  onChange={(e) => setFechaSubidaHasta(e.target.value)}
                  className="text-sm"
                  disabled={documentsLoading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Usuario</label>
                <Select value={userFilter} onValueChange={setUserFilter} disabled={documentsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="myDocuments">Mis documentos</SelectItem>
                    <SelectItem value="user1">Juan Pérez</SelectItem>
                    <SelectItem value="user2">María González</SelectItem>
                    <SelectItem value="user3">Carlos Rodríguez</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Entrenamiento</label>
                <Select value={trainingFilter} onValueChange={setTrainingFilter} disabled={documentsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="training">Usados en entrenamiento</SelectItem>
                    <SelectItem value="notTraining">No usados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {selectedDocuments.size > 0 && (
            <div className="p-2 bg-muted/50 border-b flex items-center justify-between">
              <div className="text-sm font-medium">
                {selectedDocuments.size} documento{selectedDocuments.size > 1 ? "s" : ""} seleccionado
                {selectedDocuments.size > 1 ? "s" : ""}
                {selectedStatus === "mixed" && (
                  <span className="ml-2 text-xs text-destructive">(diferentes estados - no se pueden cambiar)</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedStatus && selectedStatus !== "mixed" && (
                  <>
                    {(selectedStatus === "Procesado" || selectedStatus === "Para revisar") && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleConfirm}
                          disabled={bulkDisabled}
                          className="text-green-600 hover:bg-green-600/10 bg-transparent"
                        >
                          {bulkBusy === "confirm" ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Confirmar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReject}
                          disabled={bulkDisabled}
                          className="text-destructive hover:bg-destructive/10 bg-transparent"
                        >
                          {bulkBusy === "reject" ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Rechazar
                        </Button>
                      </>
                    )}

                    {selectedStatus === "Confirmado" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={bulkDisabled}
                        className="text-green-600 hover:bg-green-600/10 bg-transparent"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    )}

                    {selectedStatus === "Exportado" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFinalize}
                        disabled={bulkDisabled}
                        className="text-green-600 hover:bg-green-600/10 bg-transparent"
                      >
                        {bulkBusy === "finalize" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Finalizar
                      </Button>
                    )}
                  </>
                )}

                <Button variant="outline" size="sm" onClick={handleReprocessReading} disabled={bulkDisabled}>
                  {bulkBusy === "reprocessR" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Reprocesar lectura
                </Button>

                <Button variant="outline" size="sm" onClick={handleReprocessOutput} disabled={bulkDisabled}>
                  {bulkBusy === "reprocessA" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileOutput className="h-4 w-4 mr-2" />
                  )}
                  Reprocesar Asistente
                </Button>

                <Button variant="outline" size="sm" onClick={handleDownload} disabled={bulkDisabled}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={bulkDisabled}
                  className="text-destructive hover:bg-destructive/10 bg-transparent"
                >
                  <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}

          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(v) => handleSelectAll(Boolean(v))}
                      aria-label="Seleccionar todos"
                      className={isSomeSelected ? "data-[state=checked]:bg-primary/50" : ""}
                      disabled={documentsLoading}
                    />
                  </TableHead>

                  <TableHead className="cursor-pointer select-none text-left" onClick={() => handleSort("id")}>
                    <div className="flex items-center gap-2">
                      ID
                      {getSortIcon("id")}
                    </div>
                  </TableHead>

                  <TableHead className="cursor-pointer select-none text-left" onClick={() => handleSort("tipo")}>
                    <div className="flex items-center gap-2">
                      Tipo
                      {getSortIcon("tipo")}
                    </div>
                  </TableHead>

                  <TableHead className="cursor-pointer select-none text-left" onClick={() => handleSort("emisor")}>
                    <div className="flex items-center gap-2">
                      Emisor
                      {getSortIcon("emisor")}
                    </div>
                  </TableHead>

                  <TableHead className="cursor-pointer select-none text-left" onClick={() => handleSort("fechaDocumento")}>
                    <div className="flex items-center gap-2">
                      Fecha Documento
                      {getSortIcon("fechaDocumento")}
                    </div>
                  </TableHead>

                  <TableHead className="cursor-pointer select-none text-left" onClick={() => handleSort("fechaSubida")}>
                    <div className="flex items-center gap-2">
                      Fecha Subida
                      {getSortIcon("fechaSubida")}
                    </div>
                  </TableHead>

                  <TableHead className="cursor-pointer select-none text-left" onClick={() => handleSort("estado")}>
                    <div className="flex items-center gap-2">
                      Estado
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs p-3 space-y-1.5 bg-background text-foreground border shadow-lg">
                          <div className="text-xs">
                            <strong>Para revisar:</strong> Requiere revisión de observaciones
                          </div>
                          <div className="text-xs">
                            <strong>Procesado:</strong> Documento procesado correctamente
                          </div>
                          <div className="text-xs">
                            <strong>Error:</strong> Error durante el procesamiento
                          </div>
                          <div className="text-xs">
                            <strong>Confirmado:</strong> Listo para exportar
                          </div>
                          <div className="text-xs">
                            <strong>Exportado:</strong> Documento exportado correctamente
                          </div>
                          <div className="text-xs">
                            <strong>Finalizado:</strong> Proceso completado
                          </div>
                          <div className="text-xs">
                            <strong>Rechazado:</strong> Documento rechazado
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      {getSortIcon("estado")}
                    </div>
                  </TableHead>

                  <TableHead className="cursor-pointer select-none text-left" onClick={() => handleSort("archivo")}>
                    <div className="flex items-center gap-2">
                      Nombre del Archivo
                      {getSortIcon("archivo")}
                    </div>
                  </TableHead>

                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {documentsLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <TableRow key={`sk-${idx}`} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-20 rounded bg-muted animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-24 rounded bg-muted animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-60 rounded bg-muted animate-pulse" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="h-8 w-10 ml-auto rounded bg-muted animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                      No hay documentos para mostrar.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDocuments.map((doc) => (
                    <TableRow
                      key={doc.id}
                      onClick={() => router.push(`/document/${doc.id}`)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedDocuments.has(doc.id)}
                          onCheckedChange={(checked) => handleSelectDocument(doc.id, Boolean(checked))}
                          aria-label={`Seleccionar ${doc.filename}`}
                          disabled={rowBusy[doc.id]}
                        />
                      </TableCell>

                      <TableCell className="font-mono text-sm text-muted-foreground">{doc.id}</TableCell>

                      <TableCell>
                        <Badge variant="outline">{doc.type}</Badge>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">{doc.supplier}</TableCell>

                      <TableCell className="text-sm">{doc.documentDate}</TableCell>
                      <TableCell className="text-sm">{doc.uploadDate}</TableCell>

                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(doc.status, (newStatus) => handleInlineStatusChange(doc.id, newStatus as DocumentStatus))}
                          {rowBusy[doc.id] && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{doc.filename}</span>
                          {doc.relatedDocuments && doc.relatedDocuments.length > 0 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              <Link2 className="h-3 w-3 mr-1 inline" />
                              {doc.relatedDocuments.length}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={rowBusy[doc.id]}>
                                {rowBusy[doc.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              {(doc.status === "Procesado" || doc.status === "Para revisar") && (
                                <>
                                  <DropdownMenuItem onClick={() => handleIndividualConfirm(doc.id)} className="text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    Confirmar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleIndividualReject(doc.id)} className="text-destructive">
                                    <XCircle className="h-4 w-4 mr-2 text-destructive" />
                                    Rechazar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}

                              {doc.status === "Confirmado" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedDocuments(new Set([doc.id]))
                                      handleExport()
                                    }}
                                    className="text-green-600"
                                  >
                                    <Send className="h-4 w-4 mr-2 text-green-600" />
                                    Exportar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}

                              {doc.status === "Exportado" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleIndividualFinalize(doc.id)} className="text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    Finalizar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}

                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedDocuments(new Set([doc.id]))
                                  handleReprocessReading()
                                }}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reprocesar lectura
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedDocuments(new Set([doc.id]))
                                  handleReprocessOutput()
                                }}
                              >
                                <FileOutput className="h-4 w-4 mr-2" />
                                Reprocesar Asistente
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedDocuments(new Set([doc.id]))
                                  handleDownload()
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem onClick={() => handleViewLogs(doc)}>
                                <Clock className="h-4 w-4 mr-2" />
                                Ver historial
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem onClick={() => handleIndividualDelete(doc.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TooltipProvider>

          {sortedDocuments.length > 0 && (
            <div className="flex items-center justify-between gap-4 p-3 border-t">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, sortedDocuments.length)} de {sortedDocuments.length} resultados
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Filas por página:</span>
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  Anterior
                </Button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                      return (
                        <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                          ...
                        </span>
                      )
                    }
                    return (
                      <Button
                        key={page}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page as number)}
                        className={`w-9 ${currentPage === page ? "bg-muted font-semibold" : ""}`}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDownloadModal} onOpenChange={setShowDownloadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Descargar documentos</DialogTitle>
            <DialogDescription>Selecciona el formato de descarga</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              onClick={() => handleDownloadFormat("excel")}
              variant="outline"
              className="w-full justify-start bg-muted/50 hover:bg-muted"
              disabled={bulkBusy === "download"}
            >
              {bulkBusy === "download" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              Excel
            </Button>
            <Button
              onClick={() => handleDownloadFormat("txt")}
              variant="outline"
              className="w-full justify-start bg-muted/50 hover:bg-muted"
              disabled={bulkBusy === "download"}
            >
              {bulkBusy === "download" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              TXT
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar documentos</DialogTitle>
            <DialogDescription>Selecciona el destino de exportación</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              onClick={() => handleExportOption("api")}
              variant="outline"
              className="w-full justify-start bg-muted/50 hover:bg-muted"
              disabled={bulkBusy === "export"}
            >
              {bulkBusy === "export" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Enviar por API al sistema contable
            </Button>

            <Button
              onClick={() => handleExportOption("excel")}
              variant="outline"
              className="w-full justify-start bg-muted/50 hover:bg-muted"
              disabled={bulkBusy === "export"}
            >
              {bulkBusy === "export" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              Excel
            </Button>

            <Button
              onClick={() => handleExportOption("txt")}
              variant="outline"
              className="w-full justify-start bg-muted/50 hover:bg-muted"
              disabled={bulkBusy === "export"}
            >
              {bulkBusy === "export" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              TXT
            </Button>

            <div className="flex items-center space-x-2 pt-4 border-t">
              <input
                type="checkbox"
                id="markFinished"
                checked={markAsFinished}
                onChange={(e) => setMarkAsFinished(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="markFinished" className="text-sm font-medium">
                Marcar como finalizado
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              {documentsToDelete.size === 1
                ? "¿Estás seguro de que deseas eliminar este documento?"
                : `¿Estás seguro de que deseas eliminar ${documentsToDelete.size} documentos?`}{" "}
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={bulkBusy === "delete"}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={bulkBusy === "delete"}>
              {bulkBusy === "delete" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedDocumentForLogs && (
        <DocumentLogsModal
          isOpen={showLogsModal}
          onClose={() => {
            setShowLogsModal(false)
            setSelectedDocumentForLogs(null)
          }}
          documentId={selectedDocumentForLogs.id}
          documentName={selectedDocumentForLogs.filename}
          logs={selectedDocumentForLogs.logs}
        />
      )}
    </div>
  )
}
