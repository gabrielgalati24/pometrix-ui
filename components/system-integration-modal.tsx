"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Send, Database, CheckCircle, AlertCircle, Settings, Zap } from "lucide-react"

interface SystemIntegrationModalProps {
  documentData: any
  trigger?: React.ReactNode
}

const availableSystems = [
  {
    id: "contable",
    name: "Sistema Contable Principal",
    description: "Integración con el sistema de contabilidad empresarial",
    status: "connected",
    icon: <Database className="h-4 w-4" />,
  },
  {
    id: "erp",
    name: "ERP Empresarial",
    description: "Sincronización con el sistema de gestión integral",
    status: "connected",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    id: "facturacion",
    name: "Sistema de Facturación",
    description: "Envío directo al módulo de facturación",
    status: "disconnected",
    icon: <Zap className="h-4 w-4" />,
  },
]

export function SystemIntegrationModal({ documentData, trigger }: SystemIntegrationModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSystem, setSelectedSystem] = useState("contable")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleSendToSystem = async () => {
    setIsSending(true)

    // Simulate system integration
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const system = availableSystems.find((s) => s.id === selectedSystem)

    toast({
      title: "Datos enviados correctamente",
      description: `Los datos se han integrado exitosamente con ${system?.name}.`,
    })

    setIsSending(false)
    setIsOpen(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="mr-1 h-3 w-3" />
            Conectado
          </Badge>
        )
      case "disconnected":
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Desconectado
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const selectedSystemData = availableSystems.find((s) => s.id === selectedSystem)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Enviar a Sistema
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Integrar con Sistema
          </DialogTitle>
          <DialogDescription>
            Envía los datos extraídos directamente a tu sistema de gestión empresarial.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* System Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sistema de Destino</CardTitle>
              <CardDescription>Selecciona el sistema donde integrar los datos</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableSystems.map((system) => (
                    <SelectItem key={system.id} value={system.id} disabled={system.status === "disconnected"}>
                      <div className="flex items-center gap-2">
                        {system.icon}
                        <span>{system.name}</span>
                        {system.status === "disconnected" && (
                          <span className="text-xs text-muted-foreground">(Desconectado)</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Selected System Info */}
          {selectedSystemData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Información del Sistema</span>
                  {getStatusBadge(selectedSystemData.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {selectedSystemData.icon}
                    <span className="font-medium">{selectedSystemData.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedSystemData.description}</p>
                  {selectedSystemData.status === "connected" && (
                    <div className="text-sm text-success">✓ Sistema configurado y listo para recibir datos</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resumen de Datos</CardTitle>
              <CardDescription>Información que se enviará al sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tipo de documento:</span>
                  <Badge variant="outline">{documentData.documentInfo.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Número:</span>
                  <span className="font-mono">{documentData.documentInfo.number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Proveedor:</span>
                  <span>{documentData.supplier.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{documentData.items.length} productos</span>
                </div>
                {documentData.totals && (
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span className="font-mono">
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(documentData.totals.total)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Integration Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSending}>
              Cancelar
            </Button>
            <Button onClick={handleSendToSystem} disabled={isSending || selectedSystemData?.status === "disconnected"}>
              {isSending ? (
                <>
                  <div className="mr-2 h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Datos
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
