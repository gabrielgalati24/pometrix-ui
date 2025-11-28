"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle, CheckCircle, Info } from "lucide-react"

interface Log {
    timestamp: string
    message: string
    type: "info" | "success" | "warning" | "error"
}

interface DocumentLogsModalProps {
    isOpen: boolean
    onClose: () => void
    documentId: string
    documentName: string
    logs: Log[]
}

export function DocumentLogsModal({
    isOpen,
    onClose,
    documentId,
    documentName,
    logs,
}: DocumentLogsModalProps) {
    const getIcon = (type: Log["type"]) => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case "warning":
                return <AlertCircle className="h-4 w-4 text-yellow-500" />
            case "error":
                return <AlertCircle className="h-4 w-4 text-red-500" />
            default:
                return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Historial del Documento
                    </DialogTitle>
                    <DialogDescription>
                        Registro de actividad para {documentName}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    {logs.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            No hay registros disponibles
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log, index) => (
                                <div key={index} className="flex gap-3 items-start text-sm">
                                    <div className="mt-0.5">{getIcon(log.type)}</div>
                                    <div className="flex-1 space-y-1">
                                        <p className="leading-none">{log.message}</p>
                                        <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
