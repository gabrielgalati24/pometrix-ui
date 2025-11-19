import type React from "react"

export default function LoginLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    // Layout específico para login sin navbar
    return <>{children}</>
}
