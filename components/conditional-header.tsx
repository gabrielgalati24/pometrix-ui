"use client"

import { usePathname } from "next/navigation"
import { AppHeader } from "@/components/app-header"

export function ConditionalHeader() {
    const pathname = usePathname()

    // No mostrar el header en la página de login
    if (pathname === "/login") {
        return null
    }

    return <AppHeader />
}
