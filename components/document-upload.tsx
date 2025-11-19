"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, ArrowLeft, CheckCircle, AlertCircle, X, LinkIcon, FolderPlus } from "lucide-react"
import Link from "next/link"

interface UploadedFile {
  id: string
  file: File
  status: "pending" | "uploading" | "processing" | "completed" | "error"
  progress: number
  detectedType?: "Factura" | "Remito"
  error?: string
  documentNumber?: string
  isMainDocument?: boolean
  groupId?: string
}

interface DocumentGroup {
  id: string
  mainDocumentId: string
  relatedDocumentIds: string[]
  status: "processing" | "completed" | "error"
  detectedInvoiceNumber?: string
}

export function DocumentUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [documentGroups, setDocumentGroups] = useState<DocumentGroup[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadMode, setUploadMode] = useState<"independent" | "group">("independent")
  const [selectedMainDocument, setSelectedMainDocument] = useState<string>("")
  const [isPendingConfirmation, setIsPendingConfirmation] = useState(false)
  const [principalDocumentId, setPrincipalDocumentId] = useState<string>("")
  const [documentTypes, setDocumentTypes] = useState<Map<string, string>>(new Map())
  const [outputAssistant, setOutputAssistant] = useState<string>("Asistente 1")
  const { toast } = useToast()
  const router = useRouter()

  const detectDocumentType = (filename: string): "Factura" | "Remito" => {
    const name = filename.toLowerCase()
    if (name.includes("factura") || name.includes("invoice")) {
      return "Factura"
    } else if (name.includes("remito") || name.includes("delivery")) {
      return "Remito"
    }
    // Default detection based on common patterns
    return Math.random() > 0.5 ? "Factura" : "Remito"
  }

  const detectDocumentNumber = (filename: string, type: "Factura" | "Remito"): string => {
    // Simulate document number detection from filename
    const numbers = filename.match(/\d+/g)
    if (numbers && numbers.length > 0) {
      const prefix = type === "Factura" ? "FC-2024-" : "RM-"
      return prefix + numbers[numbers.length - 1].padStart(3, "0")
    }
    return type === "Factura"
      ? `FC-2024-${Math.floor(Math.random() * 999) + 1}`
      : `RM-${Math.floor(Math.random() * 999) + 1}`
  }

  const findRelatedDocuments = (mainFile: UploadedFile, allFiles: UploadedFile[]): string[] => {
    const mainNumber = mainFile.documentNumber?.match(/\d+/)?.[0]
    if (!mainNumber) return []

    return allFiles
      .filter((file) => {
        if (file.id === mainFile.id || file.detectedType !== "Remito") return false
        const fileNumber = file.documentNumber?.match(/\d+/)?.[0]
        return fileNumber && Math.abs(Number.parseInt(fileNumber) - Number.parseInt(mainNumber)) <= 5
      })
      .map((file) => file.id)
  }

  const simulateProcessing = async (fileId: string) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, progress, status: progress === 100 ? "processing" : "uploading" } : f,
        ),
      )
    }

    // Simulate processing time (3-5 seconds)
    const processingTime = 3000 + Math.random() * 2000
    await new Promise((resolve) => setTimeout(resolve, processingTime))

    // Simulate success/error (90% success rate)
    const isSuccess = Math.random() > 0.1

    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              status: isSuccess ? "completed" : "error",
              error: isSuccess ? undefined : "Error al procesar el documento. Formato no compatible.",
            }
          : f,
      ),
    )

    if (isSuccess) {
      toast({
        title: "Documento procesado",
        description: "El documento se ha procesado correctamente.",
      })

      // Check if this completes a group
      const file = uploadedFiles.find((f) => f.id === fileId)
      if (file?.groupId) {
        const group = documentGroups.find((g) => g.id === file.groupId)
        if (group) {
          const allGroupFiles = uploadedFiles.filter((f) => f.groupId === group.id)
          const allCompleted = allGroupFiles.every((f) => f?.status === "completed")
          if (allCompleted) {
            setDocumentGroups((prev) => prev.map((g) => (g.id === group.id ? { ...g, status: "completed" } : g)))
            toast({
              title: "Grupo de documentos completado",
              description: "Todos los documentos relacionados han sido procesados.",
            })
            // Auto-redirect to group results after 2 seconds
            setTimeout(() => {
              router.push(`/document/group/${group.id}`)
            }, 2000)
          }
        }
      } else {
        // Auto-redirect to individual results after 2 seconds
        setTimeout(() => {
          router.push(`/document/${fileId}`)
        }, 2000)
      }
    } else {
      toast({
        title: "Error de procesamiento",
        description: "No se pudo procesar el documento. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const createDocumentGroup = (mainFileId: string, relatedFileIds: string[]) => {
    const groupId = Math.random().toString(36).substr(2, 9)
    const mainFile = uploadedFiles.find((f) => f.id === mainFileId)

    const newGroup: DocumentGroup = {
      id: groupId,
      mainDocumentId: mainFileId,
      relatedDocumentIds: relatedFileIds,
      status: "processing",
      detectedInvoiceNumber: mainFile?.documentNumber,
    }

    setDocumentGroups((prev) => [...prev, newGroup])

    // Update files to mark them as part of the group
    setUploadedFiles((prev) =>
      prev.map((f) => {
        if (f.id === mainFileId) {
          return { ...f, isMainDocument: true, groupId }
        } else if (relatedFileIds.includes(f.id)) {
          return { ...f, groupId }
        }
        return f
      }),
    )

    toast({
      title: "Grupo de documentos creado",
      description: `Se creó un grupo con 1 factura y ${relatedFileIds.length} remitos relacionados.`,
    })
  }

  const handleFileUpload = useCallback(
    (files: FileList) => {
      const validFiles = Array.from(files).filter((file) => {
        const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/tiff", "image/tif"]

        if (!validTypes.includes(file.type)) {
          toast({
            title: "Formato no válido",
            description: `${file.name} no es un formato soportado. Usa PDF, JPG, PNG o TIFF.`,
            variant: "destructive",
          })
          return false
        }
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          toast({
            title: "Archivo muy grande",
            description: `${file.name} excede el límite de 10MB.`,
            variant: "destructive",
          })
          return false
        }
        return true
      })

      const newFiles: UploadedFile[] = validFiles.map((file) => {
        const detectedType = detectDocumentType(file.name)
        return {
          id: Math.random().toString(36).substr(2, 9),
          file,
          status: "pending",
          progress: 0,
          detectedType,
          documentNumber: detectDocumentNumber(file.name, detectedType),
        }
      })

      setUploadedFiles((prev) => [...prev, ...newFiles])

      setDocumentTypes((prev) => {
        const newMap = new Map(prev)
        newFiles.forEach((file) => {
          newMap.set(file.id, file.detectedType || "Factura")
        })
        return newMap
      })

      if (newFiles.length > 0) {
        setIsPendingConfirmation(true)
        if (!principalDocumentId) {
          setPrincipalDocumentId(newFiles[0].id)
        }
      }
    },
    [toast, principalDocumentId],
  )

  const handleConfirmUpload = () => {
    if (uploadMode === "group" && !principalDocumentId) {
      toast({
        title: "Selecciona documento principal",
        description: "Debes seleccionar cuál es el documento principal antes de confirmar.",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Document types:", Object.fromEntries(documentTypes))
    console.log("[v0] Output assistant:", outputAssistant)
    console.log("[v0] Upload mode:", uploadMode)

    if (uploadMode === "group" && principalDocumentId) {
      setUploadedFiles((prev) => prev.map((f) => (f.id === principalDocumentId ? { ...f, isMainDocument: true } : f)))
    }

    if (uploadMode === "group" && uploadedFiles.length > 1 && principalDocumentId) {
      const relatedIds = uploadedFiles.filter((f) => f.id !== principalDocumentId).map((f) => f.id)
      createDocumentGroup(principalDocumentId, relatedIds)
    }

    uploadedFiles.forEach((file) => {
      simulateProcessing(file.id)
    })

    setIsPendingConfirmation(false)

    toast({
      title: "Procesamiento iniciado",
      // Replace output format with output assistant
      description: `Los documentos están siendo procesados. Asistente: ${outputAssistant}`,
    })
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFileUpload(files)
      }
    },
    [handleFileUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFileUpload(files)
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== fileId)
      if (filtered.length === 0) {
        setIsPendingConfirmation(false)
        setPrincipalDocumentId("")
      } else if (principalDocumentId === fileId && filtered.length > 0) {
        setPrincipalDocumentId(filtered[0].id)
      }
      return filtered
    })
    setDocumentTypes((prev) => {
      const newMap = new Map(prev)
      newMap.delete(fileId)
      return newMap
    })
    setDocumentGroups((prev) =>
      prev
        .map((g) => ({
          ...g,
          relatedDocumentIds: g.relatedDocumentIds.filter((id) => id !== fileId),
        }))
        .filter((g) => g.mainDocumentId !== fileId),
    )
  }

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    }
  }

  const getStatusText = (file: UploadedFile) => {
    switch (file.status) {
      case "uploading":
        return `Subiendo... ${file.progress}%`
      case "processing":
        return uploadMode === "group" && file.groupId ? "Procesando grupo de documentos..." : "Procesando documento..."
      case "completed":
        return "Procesado correctamente"
      case "error":
        return file.error || "Error de procesamiento"
      default:
        return ""
    }
  }

  const mainDocumentOptions = uploadedFiles.filter((f) => f.detectedType === "Factura" && f.status === "completed")

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Subida de documentos</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modo de Subida</CardTitle>
          <CardDescription>Selecciona cómo deseas procesar los documentos</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={uploadMode} onValueChange={(value) => setUploadMode(value as "independent" | "group")}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="independent" id="mode-independent" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="mode-independent" className="cursor-pointer">
                    <div className="font-medium mb-1">Documentos Independientes</div>
                    <p className="text-sm text-muted-foreground">
                      Cada documento se procesa de forma individual y separada
                    </p>
                  </Label>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="group" id="mode-group" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="mode-group" className="cursor-pointer">
                    <div className="font-medium mb-1">Grupo de Documentos Relacionados</div>
                    <p className="text-sm text-muted-foreground">
                      Procesa múltiples documentos relacionados con un documento principal
                    </p>
                  </Label>
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {isPendingConfirmation && uploadedFiles.filter((f) => f.status === "pending").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos Pendientes de Confirmación</CardTitle>
            <CardDescription>
              {uploadMode === "group"
                ? "Selecciona el documento principal, el tipo de cada documento y el asistente de salida"
                : "Selecciona el tipo de cada documento y el asistente de salida"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <Label htmlFor="output-assistant" className="text-sm font-medium">
                Asistente de Salida
              </Label>
              <Select value={outputAssistant} onValueChange={setOutputAssistant}>
                <SelectTrigger id="output-assistant" className="w-[200px]">
                  <SelectValue placeholder="Seleccionar asistente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asistente 1">Asistente 1</SelectItem>
                  <SelectItem value="Asistente 2">Asistente 2</SelectItem>
                  <SelectItem value="Asistente 3">Asistente 3</SelectItem>
                  <SelectItem value="Asistente 4">Asistente 4</SelectItem>
                  <SelectItem value="Asistente 5">Asistente 5</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Este asistente se aplicará a todos los documentos del {uploadMode === "group" ? "grupo" : "lote"}
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Documentos</Label>
              {uploadMode === "group" ? (
                <RadioGroup value={principalDocumentId} onValueChange={setPrincipalDocumentId}>
                  {uploadedFiles
                    .filter((f) => f.status === "pending")
                    .map((file) => (
                      <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <RadioGroupItem value={file.id} id={file.id} />
                        <div className="flex-shrink-0">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <Label htmlFor={file.id} className="cursor-pointer">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">{file.file.name}</p>
                              {file.documentNumber && (
                                <Badge variant="secondary" className="text-xs">
                                  {file.documentNumber}
                                </Badge>
                              )}
                              {principalDocumentId === file.id && <Badge variant="default">Principal</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {(file.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </Label>
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`type-${file.id}`}
                              className="text-sm text-muted-foreground whitespace-nowrap"
                            >
                              Tipo:
                            </Label>
                            <Select
                              value={documentTypes.get(file.id) || "Factura"}
                              onValueChange={(value) => {
                                setDocumentTypes((prev) => {
                                  const newMap = new Map(prev)
                                  newMap.set(file.id, value)
                                  return newMap
                                })
                              }}
                            >
                              <SelectTrigger id={`type-${file.id}`} className="w-[180px] h-8">
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Factura">Factura</SelectItem>
                                <SelectItem value="Remito">Remito</SelectItem>
                                <SelectItem value="Nota de Crédito">Nota de Crédito</SelectItem>
                                <SelectItem value="Nota de Débito">Nota de Débito</SelectItem>
                                <SelectItem value="Orden de Compra">Orden de Compra</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </RadioGroup>
              ) : (
                <div className="space-y-3">
                  {uploadedFiles
                    .filter((f) => f.status === "pending")
                    .map((file) => (
                      <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{file.file.name}</p>
                            {file.documentNumber && (
                              <Badge variant="secondary" className="text-xs">
                                {file.documentNumber}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`type-${file.id}`}
                              className="text-sm text-muted-foreground whitespace-nowrap"
                            >
                              Tipo:
                            </Label>
                            <Select
                              value={documentTypes.get(file.id) || "Factura"}
                              onValueChange={(value) => {
                                setDocumentTypes((prev) => {
                                  const newMap = new Map(prev)
                                  newMap.set(file.id, value)
                                  return newMap
                                })
                              }}
                            >
                              <SelectTrigger id={`type-${file.id}`} className="w-[180px] h-8">
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Factura">Factura</SelectItem>
                                <SelectItem value="Remito">Remito</SelectItem>
                                <SelectItem value="Nota de Crédito">Nota de Crédito</SelectItem>
                                <SelectItem value="Nota de Débito">Nota de Débito</SelectItem>
                                <SelectItem value="Orden de Compra">Orden de Compra</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadedFiles([])
                  setIsPendingConfirmation(false)
                  setPrincipalDocumentId("")
                  setDocumentTypes(new Map())
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleConfirmUpload}>Confirmar y Procesar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Documentos</CardTitle>
          <CardDescription>
            {uploadMode === "group"
              ? "Sube documentos relacionados en formato PDF (máximo 10MB por archivo)"
              : "Sube documentos en formato PDF (máximo 10MB por archivo)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {uploadMode === "group" ? "Arrastra documentos relacionados aquí" : "Arrastra archivos aquí"}
                </p>
                <p className="text-sm text-muted-foreground">o haz clic para seleccionar archivos</p>
              </div>
              <Button variant="outline">Seleccionar Archivos</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadMode === "group" && documentGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Grupos de Documentos
            </CardTitle>
            <CardDescription>Documentos agrupados para procesamiento consolidado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {documentGroups.map((group) => {
              const mainFile = uploadedFiles.find((f) => f.id === group.mainDocumentId)
              const relatedFiles = uploadedFiles.filter((f) => group.relatedDocumentIds.includes(f.id))
              const allCompleted = [mainFile, ...relatedFiles].every((f) => f?.status === "completed")

              return (
                <div key={group.id} className="p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FolderPlus className="h-5 w-5 text-primary" />
                      <span className="font-medium">Grupo: {group.detectedInvoiceNumber}</span>
                      <Badge variant="outline">{1 + relatedFiles.length} documentos</Badge>
                    </div>
                    {allCompleted && (
                      <Link href={`/document/group/${group.id}`}>
                        <Button size="sm">Ver Grupo Consolidado</Button>
                      </Link>
                    )}
                  </div>

                  <div className="space-y-2">
                    {mainFile && (
                      <div className="flex items-center gap-3 p-2 bg-primary/5 rounded">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Principal: {mainFile.file.name}</span>
                        <Badge variant="default">Factura</Badge>
                        {getStatusIcon(mainFile.status)}
                      </div>
                    )}

                    {relatedFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded ml-4">
                        <div className="w-4 h-4 border-l-2 border-b-2 border-muted-foreground/30 rounded-bl-md"></div>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.file.name}</span>
                        <Badge variant="outline">Remito</Badge>
                        {getStatusIcon(file.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {uploadedFiles.filter((f) => !f.groupId && f.status !== "pending").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Archivos {uploadMode === "independent" ? "Individuales" : "en Proceso"}</CardTitle>
            <CardDescription>
              {uploadMode === "independent"
                ? "Documentos procesados individualmente"
                : "Documentos en proceso de subida"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedFiles
              .filter((f) => !f.groupId && f.status !== "pending")
              .map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{file.file.name}</p>
                      <Badge variant="outline">{file.detectedType}</Badge>
                      {file.documentNumber && (
                        <Badge variant="secondary" className="text-xs">
                          {file.documentNumber}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getStatusIcon(file.status)}
                      <span>{getStatusText(file)}</span>
                    </div>
                    {file.status === "uploading" && <Progress value={file.progress} className="mt-2" />}
                  </div>
                  <div className="flex-shrink-0">
                    {file.status === "completed" ? (
                      <Link href={`/document/${file.id}`}>
                        <Button size="sm">Ver Resultados</Button>
                      </Link>
                    ) : file.status === "error" ? (
                      <Button variant="outline" size="sm" onClick={() => simulateProcessing(file.id)}>
                        Reintentar
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Formatos Soportados</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• PDF, JPG, PNG, TIFF</li>
                <li>• Tamaño máximo: 10MB por archivo</li>
                <li>• Calidad mínima: 150 DPI (recomendado)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">
                {uploadMode === "group" ? "Documentos Relacionados" : "Tipos de Documento"}
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {uploadMode === "group" ? (
                  <>
                    <li>• Selecciona un documento principal</li>
                    <li>• Agrega documentos relacionados</li>
                    <li>• Procesamiento consolidado</li>
                  </>
                ) : (
                  <>
                    <li>• Facturas de compra</li>
                    <li>• Remitos de entrega</li>
                    <li>• Procesamiento individual</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
