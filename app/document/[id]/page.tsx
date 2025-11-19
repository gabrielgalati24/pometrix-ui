"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { DocumentResults } from "@/components/document-results"
import { documentsService } from "@/services/documents.service"
import { Loader2 } from "lucide-react"

export default function DocumentPage() {
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<string>("")
  const [relatedDocuments, setRelatedDocuments] = useState<
    Array<{ id: string; filename: string; type: string; url?: string }>
  >([])

  useEffect(() => {
    async function fetchDocumentData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch document with group from backend
        const response = await documentsService.getDocumentById(Number(id))

        // Determine which document to display and related documents
        if (response.document_group) {
          // If there's a document group, use the main document
          const mainDoc = response.document_group.main_document
          setDocumentId(mainDoc.id.toString())

          // Map related documents
          setRelatedDocuments(
            response.document_group.related_documents.map(doc => ({
              id: doc.id.toString(),
              filename: doc.document_name,
              type: doc.document_type,
              url: doc.document_url,
            }))
          )
        } else {
          // Single document without group
          setDocumentId(response.document.id.toString())
          setRelatedDocuments([])
        }
      } catch (err) {
        console.error("Error loading document:", err)
        setError(err instanceof Error ? err.message : "Error al cargar el documento")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchDocumentData()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando documento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error al cargar el documento</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">Documento ID: {id}</p>
        </div>
      </div>
    )
  }

  if (!documentId) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DocumentResults documentId={documentId} relatedDocuments={relatedDocuments} />
    </div>
  )
}
