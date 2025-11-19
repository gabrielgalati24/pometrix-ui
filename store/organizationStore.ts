import { create } from "zustand"
import { documentsService, type Organization } from "@/services/documents.service"

interface OrganizationState {
    organizations: Organization[]
    selectedOrganizationId: number | null
    isLoadingOrganizations: boolean
    error: string | null
    hasFetchedOrganizations: boolean
    fetchOrganizations: (options?: { force?: boolean }) => Promise<void>
    setSelectedOrganization: (organizationId: number) => void
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
    organizations: [],
    selectedOrganizationId: null,
    isLoadingOrganizations: false,
    error: null,
    hasFetchedOrganizations: false,
    fetchOrganizations: async (options) => {
        const force = options?.force ?? false
        const { isLoadingOrganizations, hasFetchedOrganizations } = get()
        if (isLoadingOrganizations) return
        if (!force && hasFetchedOrganizations) return

        set({ isLoadingOrganizations: true, error: null })

        try {
            const response = await documentsService.getOrganizations()
            const organizations = response.organizations
            const previousSelection = get().selectedOrganizationId
            const nextSelection = organizations.some((org) => org.id === previousSelection)
                ? previousSelection
                : organizations[0]?.id ?? null

            set({
                organizations,
                selectedOrganizationId: nextSelection,
                isLoadingOrganizations: false,
                error: null,
                hasFetchedOrganizations: true,
            })
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Error al cargar organizaciones",
                isLoadingOrganizations: false,
                hasFetchedOrganizations: false,
            })
        }
    },
    setSelectedOrganization: (organizationId) => set({ selectedOrganizationId: organizationId }),
}))
