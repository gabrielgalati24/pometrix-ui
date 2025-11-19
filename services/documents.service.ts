import { config } from "@/lib/config"

const API_BASE_URL = config.apiBaseUrl

type JournalEntry = {
    id: number
    document: number
    status: string
    train: boolean
    ai: boolean
    processed_for_fine_tuning: boolean
    obs: string | null
    human_input: unknown | null
    date_create: string
    normalized_journal_fields: Array<{
        line_index: number
        field: string
        value: unknown
    }>
}

export interface Document {
    id: number
    organization: number
    organization_name: string
    document_type: string
    status: string
    human_status: string
    is_duplicate: boolean
    date_document: string | null
    document_url: string
    document_name: string
    journal_entries: JournalEntry[]
    organization_container_name: string
    data: Record<string, unknown> | null
    extra_data: Record<string, unknown> | null
    is_trained: boolean
    uploaded_by_username: string | null
}

export interface DocumentsResponse {
    message: string
    documents: {
        organization: string
        container_name: string
        organization_id: number
        documents: Document[]
        pagination: {
            current_page: number
            total_pages: number
            page_size: number
            total_items: number
            has_next: boolean
            has_previous: boolean
            next_page: number | null
            previous_page: number | null
        }
    }
}

export interface Organization {
    id: number
    name: string
    enable: boolean
    mail: string
    posting_types: Array<{ id: number; name: string }>
    document_types: Array<{ id: number; name: string; allow_duplicate_documents?: boolean }>
    sas_uri: string | null
    container_name: string
}

export interface OrganizationsResponse {
    message: string
    organizations: Organization[]
}

export interface DocumentGroup {
    group_id: number
    reference_key: string
    created_at: string
    main_document: Document
    related_documents: Document[]
    journal_entry_context: unknown | null
}

export interface DocumentWithGroup {
    message: string
    document: Document
    document_group: DocumentGroup | null
}

const withAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

    if (!token) {
        throw new Error("No hay token de autenticación")
    }

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    }
}

export const documentsService = {
    async getOrganizations(): Promise<OrganizationsResponse> {
        const response = await fetch(`${API_BASE_URL}/organization/`, {
            method: "GET",
            headers: withAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error("Error al obtener organizaciones")
        }

        return response.json()
    },

    async getDocuments(
        organizationId: number,
        page = 1,
        pageSize = 10,
        filters?: {
            search?: string
            date_start?: string
            date_end?: string
            status?: string
            type?: string
            uploaded_by?: string
            is_trained?: string
        },
    ): Promise<DocumentsResponse> {
        let url = `${API_BASE_URL}/document/?page=${page}&organization_id=${organizationId}&page_size=${pageSize}`

        if (filters) {
            if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`
            if (filters.date_start) url += `&date_start=${filters.date_start}`
            if (filters.date_end) url += `&date_end=${filters.date_end}`
            if (filters.status) url += `&status=${filters.status}`
            if (filters.type) url += `&type=${filters.type}`
            if (filters.uploaded_by) url += `&uploaded_by=${filters.uploaded_by}`
            if (filters.is_trained) url += `&is_trained=${filters.is_trained}`
        }

        const response = await fetch(url, {
            method: "GET",
            headers: withAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error("Error al obtener documentos")
        }

        return response.json()
    },

    async getDocumentById(documentId: number): Promise<DocumentWithGroup> {
        const url = `${API_BASE_URL}/document/?document_id=${documentId}`

        const response = await fetch(url, {
            method: "GET",
            headers: withAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error("Error al obtener documento")
        }

        return response.json()
    },
}
