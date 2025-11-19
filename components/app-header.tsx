"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, User, LogOut, Users, Database, Building2, Bot } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

export function AppHeader() {
  const router = useRouter()
  const { logout, user } = useAuthStore()
  const [selectedOrg, setSelectedOrg] = useState("org-1")

  const organizations = [
    { id: "org-1", name: "Organización Principal" },
    { id: "org-2", name: "Organización Secundaria" },
    { id: "org-3", name: "Organización de Prueba" },
  ]

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-16 justify-between flex-row items-center gap-0 pl-10 pr-10">
        <div className="flex items-center gap-6">
          <img
            src="/images/design-mode/logo-pometrix-CoEir604.png"
            alt="Pometrix"
            className="h-8 invert"
          />

          <Select value={selectedOrg} onValueChange={setSelectedOrg}>
            <SelectTrigger className="w-[240px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Seleccionar organización" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right side - Settings and Profile dropdowns */}
        <div className="flex items-center gap-2">
          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Configuraciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Configuraciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings/assistants")}>
                <Bot className="mr-2 h-4 w-4" />
                <span>Administrar asistentes</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings/master-data")}>
                <Database className="mr-2 h-4 w-4" />
                <span>Administrar master data</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Perfil de usuario</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || "Usuario"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Mi perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/invite-users")}>
                <Users className="mr-2 h-4 w-4" />
                <span>Invitar usuarios</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
