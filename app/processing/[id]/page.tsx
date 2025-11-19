"use client"

import { useRouter } from "next/navigation"
import { ProcessingStatus } from "@/components/processing-status"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ProcessingPageProps {
  params: {
    id: string
  }
}

export default function ProcessingPage({ params }: ProcessingPageProps) {
  const router = useRouter()

  const handleProcessingComplete = () => {
    // Redirect to document results page
    router.push(`/document/${params.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Procesando Documento</h1>
            <span className="text-muted-foreground">•</span>
            <p className="text-muted-foreground">Extrayendo datos automáticamente</p>
          </div>
        </div>

        {/* Processing Status */}
        <ProcessingStatus documentId={params.id} onComplete={handleProcessingComplete} />
      </div>
    </div>
  )
}
