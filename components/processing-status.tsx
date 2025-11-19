"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, FileText, Search, Database, Download } from "lucide-react"

interface ProcessingStep {
  id: string
  title: string
  description: string
  status: "pending" | "processing" | "completed"
  icon: React.ReactNode
  duration?: number
}

interface ProcessingStatusProps {
  documentId: string
  onComplete?: () => void
}

export function ProcessingStatus({ documentId, onComplete }: ProcessingStatusProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const steps: ProcessingStep[] = [
    {
      id: "upload",
      title: "Carga de Documento",
      description: "Validando formato y calidad del archivo PDF",
      status: "completed",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "ocr",
      title: "Reconocimiento de Texto",
      description: "Extrayendo texto mediante tecnología OCR avanzada",
      status: currentStep >= 1 ? "completed" : currentStep === 0 ? "processing" : "pending",
      icon: <Search className="h-4 w-4" />,
      duration: 2000,
    },
    {
      id: "extraction",
      title: "Extracción de Datos",
      description: "Identificando campos clave usando IA especializada",
      status: currentStep >= 2 ? "completed" : currentStep === 1 ? "processing" : "pending",
      icon: <Database className="h-4 w-4" />,
      duration: 3000,
    },
    {
      id: "validation",
      title: "Validación y Estructuración",
      description: "Verificando consistencia y organizando información",
      status: currentStep >= 3 ? "completed" : currentStep === 2 ? "processing" : "pending",
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 1500,
    },
    {
      id: "completion",
      title: "Procesamiento Completo",
      description: "Documento listo para revisión y exportación",
      status: currentStep >= 4 ? "completed" : "pending",
      icon: <Download className="h-4 w-4" />,
    },
  ]

  useEffect(() => {
    const processSteps = async () => {
      for (let i = 0; i < steps.length - 1; i++) {
        const step = steps[i + 1]
        if (step.duration) {
          // Simulate processing time with progress updates
          const stepDuration = step.duration
          const updateInterval = stepDuration / 100

          for (let p = 0; p <= 100; p += 2) {
            await new Promise((resolve) => setTimeout(resolve, updateInterval))
            setProgress(p)
          }

          setCurrentStep(i + 1)
          setProgress(0)
        }
      }

      // Mark as completed
      setCurrentStep(4)
      if (onComplete) {
        setTimeout(onComplete, 1000)
      }
    }

    processSteps()
  }, [documentId, onComplete])

  const getStepStatus = (step: ProcessingStep, index: number) => {
    if (index < currentStep) return "completed"
    if (index === currentStep) return "processing"
    return "pending"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-success" />
      case "processing":
        return <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-success-foreground">Completado</Badge>
      case "processing":
        return (
          <Badge variant="secondary" className="bg-warning text-warning-foreground">
            Procesando
          </Badge>
        )
      default:
        return <Badge variant="outline">Pendiente</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Procesando Documento
          </CardTitle>
          <CardDescription>Extrayendo datos automáticamente del documento subido</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progreso general</span>
              <span>{Math.round((currentStep / (steps.length - 1)) * 100)}%</span>
            </div>
            <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
            {currentStep < steps.length - 1 && progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Paso actual</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Pasos del Procesamiento</CardTitle>
          <CardDescription>Seguimiento detallado del proceso de extracción</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const status = getStepStatus(step, index)
              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    status === "processing"
                      ? "border-primary bg-primary/5"
                      : status === "completed"
                        ? "border-success/20 bg-success/5"
                        : "border-border"
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">{getStatusIcon(status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{step.title}</h4>
                      {getStatusBadge(status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {status === "processing" && (
                      <div className="mt-2 text-xs text-primary font-medium">
                        Procesando... Esto puede tomar unos momentos
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">{step.icon}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles Técnicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Tecnologías Utilizadas</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• OCR con IA para reconocimiento de texto</li>
                <li>• Procesamiento de lenguaje natural</li>
                <li>• Validación automática de datos</li>
                <li>• Detección inteligente de campos</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Información del Proceso</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tiempo estimado: 3-5 minutos</li>
                <li>• Precisión promedio: 95%</li>
                <li>• Campos detectados automáticamente</li>
                <li>• Validación cruzada de datos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
