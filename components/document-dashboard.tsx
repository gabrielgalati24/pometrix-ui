"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from 'next/navigation'
import {
  Upload,
  FileText,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
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
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/authStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { documentsService, type Document, type DocumentsResponse } from "@/services/documents.service"
import { useOrganizationStore } from "@/store/organizationStore"

type Pagination = DocumentsResponse["documents"]["pagination"]

interface DocumentRow {
  id: string
  filename: string
  type: string
  documentDate: string
  uploadDate: string
  documentDateRaw: string | null
  uploadDateRaw: string | null
  status: string
  supplier: string
  uploadedBy: string
  relatedDocumentsCount: number
}

const STATUS_MAP: Record<string, string> = {
  READY: "Confirmado",
  EXPORT: "Enviado",
  POSTING: "Para confirmar",
  REVIEW: "Para revisar",
  FAILURE: "Rechazado",
  SENT: "Enviado",
  CONFIRMED: "Confirmado",
}

const parseToDate = (value?: string | null): Date | null => {
  if (!value) return null

  const directDate = new Date(value)
  if (!Number.isNaN(directDate.getTime())) {
    return directDate
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(value)) {
    const [day, month, year] = value.split("/")
    const fullYear = year.length === 2 ? `20${year}` : year
    const parsed = new Date(Number(fullYear), Number(month) - 1, Number(day))
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  return null
}

const formatDate = (value?: string | null): string => {
  const date = parseToDate(value)
  if (!date) {
    return value ?? "—"
  }

  return new Intl.DateTimeFormat("es-AR").format(date)
}

const normalizeStatus = (status?: string | null): string => {
  if (!status) return "Desconocido"
  const normalized = status.toUpperCase()
  return STATUS_MAP[normalized] ?? status
}

const extractSupplier = (doc: Document): string => {
  const data = doc.data ?? {}
  return (
    (data as Record<string, unknown>).proveedor_nombre ||
    (data as Record<string, unknown>).proveedor ||
    (data as Record<string, unknown>).merchantname ||
    doc.organization_name ||
    "Desconocido"
  ) as string
}

const mapDocumentToRow = (doc: Document): DocumentRow => {
  const documentDateRaw = doc.date_document ?? null
  const uploadDateRaw = doc.journal_entries?.[0]?.date_create ?? doc.date_document ?? null

  return {
    id: doc.id.toString(),
    filename: doc.document_name ?? `Documento ${doc.id}`,
    type: doc.document_type ?? "Desconocido",
    documentDate: formatDate(documentDateRaw),
    uploadDate: formatDate(uploadDateRaw),
    documentDateRaw,
    uploadDateRaw,
    status: normalizeStatus(doc.human_status ?? doc.status),
    supplier: extractSupplier(doc),
    uploadedBy: doc.uploaded_by_username ?? "Sin usuario",
    relatedDocumentsCount: doc.journal_entries?.length ?? 0,
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Para revisar":
      return <AlertCircle className="h-4 w-4 text-warning" />
    case "Para confirmar":
      return <Clock className="h-4 w-4 text-info" />
    case "Confirmado":
      return <CheckCircle className="h-4 w-4 text-success" />
    case "Enviado":
      return <Send className="h-4 w-4 text-success" />
    case "Rechazado":
      return <XCircle className="h-4 w-4 text-destructive" />
    default:
      return null
  }
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

export function DocumentDashboard() {
  const router = useRouter()
  const { initialize, isAuthenticated, isLoading, isInitialized } = useAuthStore()
  const fetchOrganizations = useOrganizationStore((state) => state.fetchOrganizations)
  const selectedOrganizationId = useOrganizationStore((state) => state.selectedOrganizationId)
  const isLoadingOrganizations = useOrganizationStore((state) => state.isLoadingOrganizations)
  const organizationsError = useOrganizationStore((state) => state.error)
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [emisorFilter, setEmisorFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
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
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  // Initialize auth on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Redirect to login only after initialization is complete
  useEffect(() => {
    if (isInitialized && !isAuthenticated && !isLoading) {
      router.push("/login")
    }
  }, [isInitialized, isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!isAuthenticated) return
    fetchOrganizations()
  }, [isAuthenticated, fetchOrganizations])

  useEffect(() => {
    if (!organizationsError) return
    toast({
      title: "Error",
      description: organizationsError,
      variant: "destructive",
    })
  }, [organizationsError, toast])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [
    debouncedSearchTerm,
    statusFilter,
    typeFilter,
    emisorFilter,
    userFilter,
    fechaDocumentoDesde,
    fechaDocumentoHasta,
    fechaSubidaDesde,
    fechaSubidaHasta,
    selectedOrganizationId,
    sortColumn,
    sortDirection,
  ])

  useEffect(() => {
    setSelectedDocuments(new Set())
  }, [currentPage, pageSize, documents, sortColumn, sortDirection])

  const loadDocuments = useCallback(
    async (orgId: number, page: number, size: number) => {
      setIsLoadingDocuments(true)
      try {
        const UI_STATUS_TO_API: Record<string, string> = {
          "Para revisar": "REVIEW",
          "Para confirmar": "POSTING",
          "Confirmado": "CONFIRMED",
          "Enviado": "EXPORT",
          "Rechazado": "REJECTED",
        }

        const filters = {
          search: debouncedSearchTerm || undefined,
          status: statusFilter !== "all" ? (UI_STATUS_TO_API[statusFilter] || statusFilter) : undefined,
          type: typeFilter !== "all" ? typeFilter : undefined,
          uploaded_by: userFilter !== "all" && userFilter !== "myDocuments" ? userFilter : undefined, // Adjust based on actual backend requirement for "myDocuments"
          date_start: fechaSubidaDesde || undefined,
          date_end: fechaSubidaHasta || undefined,
          sortCol: sortColumn || undefined,
          sortDir: sortDirection,
        }

        // Handle "myDocuments" special case if needed, or assume userFilter holds the username
        if (userFilter === "myDocuments") {
          // If the backend expects a specific flag or username for "myDocuments", set it here.
          // For now assuming "uploaded_by" takes a username.
          // If "myDocuments" is a UI concept, we might need the current user's username.
          // The auth store might have it.
        }

        const response = await documentsService.getDocuments(orgId, page, size, filters)
        const rows = response.documents.documents.map(mapDocumentToRow)
        setDocuments(rows)
        setPagination(response.documents.pagination)
      } catch (error) {
        console.error("Error loading documents:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los documentos",
          variant: "destructive",
        })
      } finally {
        setIsLoadingDocuments(false)
      }
    },
    [toast, debouncedSearchTerm, statusFilter, typeFilter, userFilter, fechaSubidaDesde, fechaSubidaHasta, sortColumn, sortDirection],
  )

  useEffect(() => {
    if (!isAuthenticated || selectedOrganizationId === null) return
    loadDocuments(selectedOrganizationId, currentPage, pageSize)
  }, [isAuthenticated, selectedOrganizationId, currentPage, pageSize, loadDocuments])



  const uniqueEmisores = useMemo(
    () => Array.from(new Set(documents.map((doc) => doc.supplier))).sort(),
    [documents],
  )

  const isDateInRange = (rawValue: string | null, desde: string, hasta: string) => {
    if (!desde && !hasta) return true
    const date = parseToDate(rawValue)
    if (!date) {
      return false
    }

    if (desde) {
      const from = new Date(desde)
      if (date < from) return false
    }

    if (hasta) {
      const to = new Date(hasta)
      to.setHours(23, 59, 59, 999)
      if (date > to) return false
    }

    return true
  }

  // Client-side filtering removed in favor of backend filtering
  const filteredDocuments = documents



  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground/40" />
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 text-muted-foreground" />
    ) : (
      <ArrowDown className="h-4 w-4 text-muted-foreground" />
    )
  }

  // Client-side sorting removed in favor of backend sorting
  const sortedDocuments = filteredDocuments

  const displayedDocuments = sortedDocuments

  const totalDocuments = pagination?.total_items ?? documents.length
  const paraRevisarDocuments = useMemo(
    () => documents.filter((doc) => doc.status === "Para revisar").length,
    [documents],
  )
  const paraConfirmarDocuments = useMemo(
    () => documents.filter((doc) => doc.status === "Para confirmar").length,
    [documents],
  )
  const enviadosDocuments = useMemo(
    () => documents.filter((doc) => doc.status === "Enviado").length,
    [documents],
  )

  const documentsThisWeek = useMemo(() => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    return documents.filter((doc: DocumentRow) => {
      const uploadDate = parseToDate(doc.uploadDateRaw)
      return uploadDate ? uploadDate >= oneWeekAgo : false
    }).length
  }, [documents])

  const successPercentage = totalDocuments > 0 ? Math.round((enviadosDocuments / totalDocuments) * 100) : 0

  const handleMetricClick = (filterValue: string) => {
    setStatusFilter(filterValue)
    setCurrentPage(1)
  }

  const totalPages = pagination?.total_pages ?? 0
  const paginatedDocuments = displayedDocuments

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(new Set(paginatedDocuments.map((doc) => doc.id)))
    } else {
      setSelectedDocuments(new Set())
    }
  }

  const handleSelectDocument = (docId: string, checked: boolean) => {
    const newSelected = new Set(selectedDocuments)
    if (checked) {
      newSelected.add(docId)
    } else {
      newSelected.delete(docId)
    }
    setSelectedDocuments(newSelected)
  }

  const isAllSelected =
    paginatedDocuments.length > 0 && paginatedDocuments.every((doc) => selectedDocuments.has(doc.id))
  const isSomeSelected = selectedDocuments.size > 0 && !isAllSelected

  const handleReprocessReading = () => {
    console.log("[v0] Reprocesar lectura:", Array.from(selectedDocuments))
    // TODO: Implement reprocess reading logic
  }

  const handleReprocessOutput = () => {
    console.log("[v0] Reprocesar Asistente:", Array.from(selectedDocuments))
    // TODO: Implement reprocess output logic
  }

  const handleExport = () => {
    console.log("[v0] Exportar:", Array.from(selectedDocuments))
    // TODO: Implement export logic
  }

  const handleDelete = () => {
    console.log("[v0] Eliminar:", Array.from(selectedDocuments))
    // TODO: Implement delete logic with confirmation
  }

  const handleIndividualReprocessReading = (docId: string) => {
    console.log("[v0] Reprocesar lectura individual:", docId)
    // TODO: Implement individual reprocess reading logic
  }

  const handleIndividualReprocessOutput = (docId: string) => {
    console.log("[v0] Reprocesar Asistente individual:", docId)
    // TODO: Implement individual reprocess output logic
  }

  const handleIndividualExport = (docId: string) => {
    console.log("[v0] Exportar individual:", docId)
    // TODO: Implement individual export logic
  }

  const handleIndividualDelete = (docId: string) => {
    console.log("[v0] Eliminar individual:", docId)
    // TODO: Implement individual delete logic with confirmation
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size))
    setCurrentPage(1)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
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

  const handleConfirm = () => {
    console.log("[v0] Confirmar:", Array.from(selectedDocuments))
    // TODO: Implement confirm logic - change status to "Confirmado"
  }

  const handleReject = () => {
    console.log("[v0] Rechazar:", Array.from(selectedDocuments))
    // TODO: Implement reject logic - change status to "Rechazado"
  }

  const handleSend = () => {
    console.log("[v0] Enviar:", Array.from(selectedDocuments))
    // TODO: Implement send logic - change status to "Enviado"
  }

  const handleIndividualConfirm = (docId: string) => {
    console.log("[v0] Confirmar individual:", docId)
    // TODO: Implement individual confirm logic
  }

  const handleIndividualReject = (docId: string) => {
    console.log("[v0] Rechazar individual:", docId)
    // TODO: Implement individual reject logic
  }

  const handleIndividualSend = (docId: string) => {
    console.log("[v0] Enviar individual:", docId)
    // TODO: Implement individual send logic
  }

  if (!isInitialized) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoadingOrganizations && selectedOrganizationId === null) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando organizaciones...</p>
        </div>
      </div>
    )
  }

  if (!isLoadingOrganizations && selectedOrganizationId === null) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground text-center max-w-md">
          No se encontraron organizaciones disponibles para tu cuenta. Por favor, contacta al administrador para obtener
          acceso.
        </p>
        <Button variant="outline" onClick={() => fetchOrganizations({ force: true })}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Procesamiento inteligente de documentos</h1>
        </div>
        <Link href="/upload">
          <Button size="lg" className="w-full md:w-auto">
            <Upload className="mr-2 h-4 w-4" />
            Subir Nuevo Documento
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleMetricClick("all")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">{documentsThisWeek} esta semana</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => handleMetricClick("Para revisar")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Para revisar</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paraRevisarDocuments}</div>
            <p className="text-xs text-muted-foreground">Haz clic para filtrarlos</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => handleMetricClick("Para confirmar")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Para confirmar</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paraConfirmarDocuments}</div>
            <p className="text-xs text-muted-foreground">Haz clic para filtrarlos</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => handleMetricClick("Enviado")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviados</CardTitle>
            <Send className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enviadosDocuments}</div>
            <p className="text-xs text-muted-foreground">{successPercentage}% del total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>Gestiona y revisa todos los documentos procesados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por ID, emisor o nombre de archivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Para revisar">Para revisar</SelectItem>
                      <SelectItem value="Para confirmar">Para confirmar</SelectItem>
                      <SelectItem value="Confirmado">Confirmado</SelectItem>
                      <SelectItem value="Enviado">Enviado</SelectItem>
                      <SelectItem value="Rechazado">Rechazado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Emisor</label>
                  <Select value={emisorFilter} onValueChange={setEmisorFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueEmisores.map((emisor: string) => (
                        <SelectItem key={emisor} value={emisor}>
                          {emisor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" size="default" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                    <Filter className="mr-2 h-4 w-4" />
                    Más filtros
                  </Button>
                </div>
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <Button variant="ghost" size="default" onClick={clearAllFilters}>
                      <X className="mr-2 h-4 w-4" />
                      Limpiar
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {showAdvancedFilters && (
              <div className="grid gap-3 p-4 border rounded-lg bg-muted/50 grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Fecha Doc. (Desde)</label>
                  <Input
                    type="date"
                    value={fechaDocumentoDesde}
                    onChange={(e) => setFechaDocumentoDesde(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Fecha Doc. (Hasta)</label>
                  <Input
                    type="date"
                    value={fechaDocumentoHasta}
                    onChange={(e) => setFechaDocumentoHasta(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Fecha Subida (Desde)</label>
                  <Input
                    type="date"
                    value={fechaSubidaDesde}
                    onChange={(e) => setFechaSubidaDesde(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Fecha Subida (Hasta)</label>
                  <Input
                    type="date"
                    value={fechaSubidaHasta}
                    onChange={(e) => setFechaSubidaHasta(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Usuario</label>
                  <Select value={userFilter} onValueChange={setUserFilter}>
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {selectedDocuments.size > 0 && (
            <div className="flex items-center justify-between gap-4 p-4 border-b bg-muted/50">
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
                    {(selectedStatus === "Para revisar" || selectedStatus === "Para confirmar") && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleConfirm}
                          className="text-green-600 hover:bg-green-600/10"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirmar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReject}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                      </>
                    )}
                    {selectedStatus === "Confirmado" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSend}
                        className="text-green-600 hover:bg-green-600/10"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar
                      </Button>
                    )}
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleReprocessReading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reprocesar lectura
                </Button>
                <Button variant="outline" size="sm" onClick={handleReprocessOutput}>
                  <FileOutput className="h-4 w-4 mr-2" />
                  Reprocesar Asistente
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}

          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Seleccionar todos"
                      className={isSomeSelected ? "data-[state=checked]:bg-primary/50" : ""}
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("id")}>
                    <div className="flex items-center gap-2">
                      ID
                      {getSortIcon("id")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("tipo")}>
                    <div className="flex items-center gap-2">
                      Tipo
                      {getSortIcon("tipo")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("emisor")}>
                    <div className="flex items-center gap-2">
                      Emisor
                      {getSortIcon("emisor")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("fechaDocumento")}>
                    <div className="flex items-center gap-2">
                      Fecha Documento
                      {getSortIcon("fechaDocumento")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("fechaSubida")}>
                    <div className="flex items-center gap-2">
                      Fecha Subida
                      {getSortIcon("fechaSubida")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("estado")}>
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
                            <strong>Para confirmar:</strong> Listo para enviar o exportar
                          </div>
                          <div className="text-xs">
                            <strong>Confirmado:</strong> Procesado correctamente
                          </div>
                          <div className="text-xs">
                            <strong>Enviado:</strong> Enviado correctamente a destino
                          </div>
                          <div className="text-xs">
                            <strong>Rechazado:</strong> No será enviado
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      {getSortIcon("estado")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("archivo")}>
                    <div className="flex items-center gap-2">
                      Nombre del Archivo
                      {getSortIcon("archivo")}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingDocuments ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Cargando documentos...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                      No se encontraron documentos
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDocuments.map((doc: DocumentRow) => (
                    <TableRow
                      key={doc.id}
                      onClick={() => router.push(`/document/${doc.id}`)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedDocuments.has(doc.id)}
                          onCheckedChange={(checked) => handleSelectDocument(doc.id, checked as boolean)}
                          aria-label={`Seleccionar ${doc.filename}`}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{doc.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{doc.supplier}</TableCell>
                      <TableCell className="text-sm">{doc.documentDate}</TableCell>
                      <TableCell className="text-sm">{doc.uploadDate}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{doc.filename}</span>
                          {doc.relatedDocumentsCount > 0 && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              <Link2 className="h-3 w-3 mr-1" />
                              {doc.relatedDocumentsCount}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(doc.status === "Para revisar" || doc.status === "Para confirmar") && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleIndividualConfirm(doc.id)}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    Confirmar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleIndividualReject(doc.id)}
                                    className="text-destructive"
                                  >
                                    <XCircle className="h-4 w-4 mr-2 text-destructive" />
                                    Rechazar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              {doc.status === "Confirmado" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleIndividualSend(doc.id)}
                                    className="text-green-600"
                                  >
                                    <Send className="h-4 w-4 mr-2 text-green-600" />
                                    Enviar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem onClick={() => handleIndividualReprocessReading(doc.id)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reprocesar lectura
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleIndividualReprocessOutput(doc.id)}>
                                <FileOutput className="h-4 w-4 mr-2" />
                                Reprocesar Asistente
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleIndividualExport(doc.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                Exportar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleIndividualDelete(doc.id)}
                                className="text-destructive"
                              >
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

          {totalDocuments > 0 && (
            <div className="flex items-center justify-between gap-4 p-4 border-t">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalDocuments)} de {totalDocuments} resultados
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
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
    </div>
  )
}
