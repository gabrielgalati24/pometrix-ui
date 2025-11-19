import { DocumentResults } from "@/components/document-results"
import { SimpleDocumentView } from "@/components/simple-document-view"

interface DocumentPageProps {
  params: {
    id: string
  }
}

const getRelatedDocuments = (documentId: string) => {
  const relatedDocsMap: Record<string, Array<{ id: string; filename: string; type: string }>> = {
    "DOC-2001": [{ id: "2001a", filename: "remito_1847.pdf", type: "Remito" }],
    "DOC-2002": [
      { id: "2002a", filename: "remito_3421.pdf", type: "Remito" },
      { id: "2002b", filename: "certificado_calidad.pdf", type: "Certificado" },
    ],
    "DOC-2003": [{ id: "2003a", filename: "factura_original_7845.pdf", type: "Factura" }],
    "DOC-2004": [],
    "DOC-2005": [{ id: "2005a", filename: "contrato_alquiler.pdf", type: "Contrato" }],
    "DOC-2006": [
      { id: "2006a", filename: "remito_combustible_5632.pdf", type: "Remito" },
      { id: "2006b", filename: "detalle_carga_por_vehiculo.pdf", type: "Detalle" },
    ],
  }
  return relatedDocsMap[documentId] || []
}

export default function DocumentPage({ params }: DocumentPageProps) {
  const relatedDocuments = getRelatedDocuments(params.id)

  if (params.id.startsWith("DOC-2")) {
    return <SimpleDocumentView documentId={params.id} relatedDocuments={relatedDocuments} />
  }

  return (
    <div className="min-h-screen bg-background">
      <DocumentResults documentId={params.id} relatedDocuments={relatedDocuments} />
    </div>
  )
}
