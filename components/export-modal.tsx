"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Download, FileSpreadsheet, FileText, Database } from "lucide-react"

interface ExportModalProps {
  documentData: any
  trigger?: React.ReactNode
}

export function ExportModal({ documentData, trigger }: ExportModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState("excel")
  const [includeFields, setIncludeFields] = useState({
    documentInfo: true,
    supplierInfo: true,
    itemsDetail: true,
    totals: true,
    metadata: false,
  })
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)

    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const filename = `${documentData.documentInfo.filename.replace(".pdf", "")}_extracted.${
      exportFormat === "excel" ? "xlsx" : exportFormat === "csv" ? "csv" : "json"
    }`

    toast({
      title: "Exportación completada",
      description: `Archivo ${filename} descargado correctamente.`,
    })

    setIsExporting(false)
    setIsOpen(false)
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "excel":
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />
      case "csv":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "json":
        return <Database className="h-4 w-4 text-purple-600" />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Datos Extraídos
          </DialogTitle>
          <DialogDescription>
            Configura las opciones de exportación para descargar los datos en el formato deseado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Formato de Exportación</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      {getFormatIcon("excel")}
                      <span>Excel (.xlsx)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      {getFormatIcon("csv")}
                      <span>CSV (.csv)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      {getFormatIcon("json")}
                      <span>JSON (.json)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Fields Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Campos a Incluir</CardTitle>
              <CardDescription>Selecciona qué información incluir en la exportación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="documentInfo"
                    checked={includeFields.documentInfo}
                    onCheckedChange={(checked) =>
                      setIncludeFields((prev) => ({ ...prev, documentInfo: checked as boolean }))
                    }
                  />
                  <Label htmlFor="documentInfo" className="text-sm font-medium">
                    Información del Documento
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="supplierInfo"
                    checked={includeFields.supplierInfo}
                    onCheckedChange={(checked) =>
                      setIncludeFields((prev) => ({ ...prev, supplierInfo: checked as boolean }))
                    }
                  />
                  <Label htmlFor="supplierInfo" className="text-sm font-medium">
                    Datos del Proveedor
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="itemsDetail"
                    checked={includeFields.itemsDetail}
                    onCheckedChange={(checked) =>
                      setIncludeFields((prev) => ({ ...prev, itemsDetail: checked as boolean }))
                    }
                  />
                  <Label htmlFor="itemsDetail" className="text-sm font-medium">
                    Detalle de Items
                  </Label>
                </div>
                {documentData.totals && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="totals"
                      checked={includeFields.totals}
                      onCheckedChange={(checked) =>
                        setIncludeFields((prev) => ({ ...prev, totals: checked as boolean }))
                      }
                    />
                    <Label htmlFor="totals" className="text-sm font-medium">
                      Totales y Cálculos
                    </Label>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metadata"
                    checked={includeFields.metadata}
                    onCheckedChange={(checked) =>
                      setIncludeFields((prev) => ({ ...prev, metadata: checked as boolean }))
                    }
                  />
                  <Label htmlFor="metadata" className="text-sm font-medium">
                    Metadatos de Procesamiento
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
              Cancelar
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <div className="mr-2 h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
