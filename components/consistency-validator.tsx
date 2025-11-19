"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ValidationIssue {
  id: string
  type: "error" | "warning" | "info"
  category: "quantity" | "price" | "description" | "total" | "missing"
  item: string
  description: string
  invoiceValue?: string | number
  remitoValue?: string | number
  severity: "high" | "medium" | "low"
  suggestion?: string
}

interface ValidationResult {
  status: "success" | "warning" | "error"
  score: number
  totalItems: number
  consistentItems: number
  warningItems: number
  errorItems: number
  issues: ValidationIssue[]
  summary: {
    quantityMatches: number
    priceMatches: number
    descriptionMatches: number
    totalMatches: number
  }
}

interface ConsistencyValidatorProps {
  groupData: any
  onValidationComplete?: (result: ValidationResult) => void
}

export function ConsistencyValidator({ groupData, onValidationComplete }: ConsistencyValidatorProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationProgress, setValidationProgress] = useState(0)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [currentStep, setCurrentStep] = useState("")

  const validateConsistency = async () => {
    setIsValidating(true)
    setValidationProgress(0)
    setValidationResult(null)

    const steps = [
      { name: "Analizando estructura de documentos...", duration: 800 },
      { name: "Comparando cantidades...", duration: 1200 },
      { name: "Verificando precios unitarios...", duration: 1000 },
      { name: "Validando descripciones...", duration: 900 },
      { name: "Calculando totales...", duration: 700 },
      { name: "Generando reporte de consistencia...", duration: 600 },
    ]

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i].name)
      await new Promise((resolve) => setTimeout(resolve, steps[i].duration))
      setValidationProgress(((i + 1) / steps.length) * 100)
    }

    // Simulate validation logic
    const mockValidationResult: ValidationResult = {
      status: "warning",
      score: 85,
      totalItems: groupData.consolidatedItems.length,
      consistentItems: 2,
      warningItems: 1,
      errorItems: 0,
      issues: [
        {
          id: "1",
          type: "warning",
          category: "description",
          item: "Tóner HP LaserJet",
          description: "Descripción ligeramente diferente entre factura y remitos",
          invoiceValue: "Tóner HP LaserJet",
          remitoValue: "Tóner HP LaserJet Pro M404/M428",
          severity: "low",
          suggestion: "Verificar que se trate del mismo producto con especificaciones más detalladas",
        },
        {
          id: "2",
          type: "info",
          category: "quantity",
          item: "Resma A4",
          description: "Cantidad coincide perfectamente",
          invoiceValue: 5,
          remitoValue: 5,
          severity: "low",
        },
      ],
      summary: {
        quantityMatches: 2,
        priceMatches: 2,
        descriptionMatches: 1,
        totalMatches: 1,
      },
    }

    setValidationResult(mockValidationResult)
    setIsValidating(false)
    onValidationComplete?.(mockValidationResult)
  }

  const getIssueIcon = (type: ValidationIssue["type"]) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />
      case "info":
        return <CheckCircle className="h-4 w-4 text-success" />
      default:
        return null
    }
  }

  const getIssueBadge = (type: ValidationIssue["type"], severity: ValidationIssue["severity"]) => {
    const baseClasses = "text-xs"
    switch (type) {
      case "error":
        return (
          <Badge variant="destructive" className={baseClasses}>
            Error
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="secondary" className={`${baseClasses} bg-warning text-warning-foreground`}>
            Advertencia
          </Badge>
        )
      case "info":
        return (
          <Badge variant="default" className={`${baseClasses} bg-success text-success-foreground`}>
            OK
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className={baseClasses}>
            -
          </Badge>
        )
    }
  }

  const getComparisonIcon = (invoiceValue: any, remitoValue: any) => {
    if (invoiceValue === remitoValue) {
      return <CheckCircle className="h-4 w-4 text-success" />
    } else if (typeof invoiceValue === "number" && typeof remitoValue === "number") {
      return invoiceValue > remitoValue ? (
        <TrendingUp className="h-4 w-4 text-warning" />
      ) : (
        <TrendingDown className="h-4 w-4 text-warning" />
      )
    } else {
      return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success"
    if (score >= 70) return "text-warning"
    return "text-destructive"
  }

  const getScoreDescription = (score: number) => {
    if (score >= 90) return "Excelente consistencia"
    if (score >= 70) return "Buena consistencia con observaciones menores"
    if (score >= 50) return "Consistencia aceptable con algunas discrepancias"
    return "Requiere revisión - múltiples inconsistencias detectadas"
  }

  return (
    <div className="space-y-6">
      {/* Validation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Validación de Consistencia
          </CardTitle>
          <CardDescription>
            Compara automáticamente los datos de la factura principal con los remitos asociados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isValidating && !validationResult && (
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Ejecuta la validación para verificar la consistencia entre documentos
                </p>
                <Button onClick={validateConsistency}>Iniciar Validación</Button>
              </div>
            )}

            {isValidating && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">{currentStep}</span>
                </div>
                <Progress value={validationProgress} className="w-full" />
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round(validationProgress)}% completado
                </p>
              </div>
            )}

            {validationResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-medium">Validación Completada</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={validateConsistency}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Revalidar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <>
          {/* Score Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Puntuación de Consistencia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(validationResult.score)}`}>
                    {validationResult.score}
                  </div>
                  <div className="text-sm text-muted-foreground">de 100 puntos</div>
                  <p className="text-sm mt-2">{getScoreDescription(validationResult.score)}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{validationResult.consistentItems}</div>
                    <div className="text-xs text-muted-foreground">Items Consistentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">{validationResult.warningItems}</div>
                    <div className="text-xs text-muted-foreground">Advertencias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">{validationResult.errorItems}</div>
                    <div className="text-xs text-muted-foreground">Errores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{validationResult.totalItems}</div>
                    <div className="text-xs text-muted-foreground">Total Items</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis Detallado</CardTitle>
              <CardDescription>Comparación item por item entre factura y remitos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Factura</TableHead>
                    <TableHead>Remitos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationResult.issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">{issue.item}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {issue.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{issue.invoiceValue?.toString() || "-"}</TableCell>
                      <TableCell className="font-mono text-sm">{issue.remitoValue?.toString() || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getComparisonIcon(issue.invoiceValue, issue.remitoValue)}
                          {getIssueIcon(issue.type)}
                        </div>
                      </TableCell>
                      <TableCell>{getIssueBadge(issue.type, issue.severity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Issues and Recommendations */}
          {validationResult.issues.filter((issue) => issue.type !== "info").length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Observaciones y Recomendaciones</CardTitle>
                <CardDescription>Detalles sobre las inconsistencias encontradas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {validationResult.issues
                  .filter((issue) => issue.type !== "info")
                  .map((issue) => (
                    <Alert key={issue.id}>
                      <div className="flex items-start gap-3">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{issue.item}</span>
                            {getIssueBadge(issue.type, issue.severity)}
                          </div>
                          <AlertDescription className="text-sm">
                            {issue.description}
                            {issue.suggestion && (
                              <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                                <strong>Recomendación:</strong> {issue.suggestion}
                              </div>
                            )}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Validación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <span className="text-sm font-medium">Cantidades</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {validationResult.summary.quantityMatches}/{validationResult.totalItems}
                  </div>
                  <div className="text-xs text-muted-foreground">coincidencias</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">Precios</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {validationResult.summary.priceMatches}/{validationResult.totalItems}
                  </div>
                  <div className="text-xs text-muted-foreground">coincidencias</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                    <span className="text-sm font-medium">Descripciones</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {validationResult.summary.descriptionMatches}/{validationResult.totalItems}
                  </div>
                  <div className="text-xs text-muted-foreground">coincidencias</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                    <span className="text-sm font-medium">Totales</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {validationResult.summary.totalMatches}/{validationResult.totalItems}
                  </div>
                  <div className="text-xs text-muted-foreground">coincidencias</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
