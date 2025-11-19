"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  MoreVertical,
  Download,
  Unlink,
  Plus,
  Settings,
  FileSpreadsheet,
  FileText,
  Code,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"

interface GroupManagementActionsProps {
  groupId: string
  groupData: any
}

export function GroupManagementActions({ groupId, groupData }: GroupManagementActionsProps) {
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showUngroupDialog, setShowUngroupDialog] = useState(false)
  const [showAddDocumentDialog, setShowAddDocumentDialog] = useState(false)
  const [showValidationDialog, setShowValidationDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState("excel")
  const [selectedFields, setSelectedFields] = useState({
    generalInfo: true,
    items: true,
    totals: true,
    supplierInfo: true,
    documentDetails: true,
  })
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [validationProgress, setValidationProgress] = useState(0)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResults, setValidationResults] = useState<any>(null)
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    // Simulate export progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setExportProgress(i)
    }

    setIsExporting(false)
    setShowExportDialog(false)
    toast({
      title: "Exportación completada",
      description: `Grupo exportado exitosamente en formato ${exportFormat.toUpperCase()}.`,
    })
  }

  const handleUngroup = () => {
    setShowUngroupDialog(false)
    toast({
      title: "Grupo desagrupado",
      description: "Los documentos han sido separados y ahora se procesan individualmente.",
    })
  }

  const handleValidateConsistency = async () => {
    setIsValidating(true)
    setValidationProgress(0)
    setValidationResults(null)

    // Simulate validation process
    const steps = [
      "Analizando cantidades...",
      "Verificando precios...",
      "Comparando descripciones...",
      "Validando totales...",
      "Generando reporte...",
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setValidationProgress(((i + 1) / steps.length) * 100)
    }

    // Mock validation results
    setValidationResults({
      status: "success",
      issues: [
        {
          type: "warning",
          item: "Tóner HP LaserJet",
          description: "Descripción ligeramente diferente entre factura y remito",
          severity: "low",
        },
      ],
      summary: {
        totalItems: 2,
        consistentItems: 2,
        warningItems: 1,
        errorItems: 0,
      },
    })

    setIsValidating(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Grupo Completo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowValidationDialog(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Validar Consistencia
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowAddDocumentDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Remito
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowUngroupDialog(true)} className="text-destructive">
            <Unlink className="mr-2 h-4 w-4" />
            Desagrupar Documentos
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Exportar Grupo Completo</DialogTitle>
            <DialogDescription>Configura las opciones de exportación para el grupo de documentos</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Formato de Exportación</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={exportFormat === "excel" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportFormat("excel")}
                  className="flex flex-col gap-1 h-auto py-3"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="text-xs">Excel</span>
                </Button>
                <Button
                  variant={exportFormat === "csv" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportFormat("csv")}
                  className="flex flex-col gap-1 h-auto py-3"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">CSV</span>
                </Button>
                <Button
                  variant={exportFormat === "json" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportFormat("json")}
                  className="flex flex-col gap-1 h-auto py-3"
                >
                  <Code className="h-4 w-4" />
                  <span className="text-xs">JSON</span>
                </Button>
              </div>
            </div>

            {/* Field Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Campos a Incluir</Label>
              <div className="space-y-2">
                {Object.entries(selectedFields).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) =>
                        setSelectedFields((prev) => ({ ...prev, [key]: checked as boolean }))
                      }
                    />
                    <Label htmlFor={key} className="text-sm">
                      {key === "generalInfo" && "Información General"}
                      {key === "items" && "Items y Detalles"}
                      {key === "totals" && "Totales y Cálculos"}
                      {key === "supplierInfo" && "Datos del Proveedor"}
                      {key === "documentDetails" && "Detalles de Documentos"}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Progress */}
            {isExporting && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Generando exportación...</span>
                </div>
                <Progress value={exportProgress} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)} disabled={isExporting}>
              Cancelar
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? "Exportando..." : "Exportar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validation Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Validación de Consistencia</DialogTitle>
            <DialogDescription>
              Verifica la consistencia entre la factura principal y los remitos asociados
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {!validationResults && !isValidating && (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Haz clic en "Iniciar Validación" para verificar la consistencia</p>
              </div>
            )}

            {isValidating && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Validando consistencia...</span>
                </div>
                <Progress value={validationProgress} />
              </div>
            )}

            {validationResults && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle className="h-5 w-5 text-success" />
                      Validación Completada
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-success">
                          {validationResults.summary.consistentItems}
                        </div>
                        <div className="text-xs text-muted-foreground">Items Consistentes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-warning">{validationResults.summary.warningItems}</div>
                        <div className="text-xs text-muted-foreground">Advertencias</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-destructive">
                          {validationResults.summary.errorItems}
                        </div>
                        <div className="text-xs text-muted-foreground">Errores</div>
                      </div>
                    </div>

                    {validationResults.issues.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Observaciones</Label>
                        {validationResults.issues.map((issue: any, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{issue.item}</p>
                              <p className="text-xs text-muted-foreground">{issue.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {issue.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValidationDialog(false)}>
              Cerrar
            </Button>
            {!validationResults && (
              <Button onClick={handleValidateConsistency} disabled={isValidating}>
                {isValidating ? "Validando..." : "Iniciar Validación"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog open={showAddDocumentDialog} onOpenChange={setShowAddDocumentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Remito al Grupo</DialogTitle>
            <DialogDescription>Sube un remito adicional para asociarlo a este grupo de documentos</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">Arrastra un archivo PDF aquí</p>
              <p className="text-xs text-muted-foreground">o haz clic para seleccionar</p>
              <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                Seleccionar Archivo
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>• Solo archivos PDF</p>
              <p>• Máximo 10MB</p>
              <p>• El documento se asociará automáticamente al grupo actual</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDocumentDialog(false)}>
              Cancelar
            </Button>
            <Button>Subir y Procesar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ungroup Dialog */}
      <Dialog open={showUngroupDialog} onOpenChange={setShowUngroupDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Desagrupar Documentos</DialogTitle>
            <DialogDescription>
              Esta acción separará los documentos del grupo. Cada documento se procesará individualmente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-2">Documentos en el grupo:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {groupData.mainDocument.documentNumber} (Factura Principal)</li>
                {groupData.relatedDocuments.map((doc: any) => (
                  <li key={doc.id}>• {doc.documentNumber} (Remito)</li>
                ))}
              </ul>
            </div>

            <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning">Advertencia</p>
                <p className="text-muted-foreground">Esta acción no se puede deshacer.</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUngroupDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleUngroup}>
              Desagrupar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
