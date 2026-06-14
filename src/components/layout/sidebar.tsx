"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Panou", icon: "📋" },
  { href: "/orders", label: "Comenzi", icon: "📦" },
  { href: "/customers", label: "Clienți", icon: "👥" },
  { href: "/pricing", label: "Prețuri", icon: "💰" },
  { href: "/users", label: "Utilizatori", icon: "👤" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 border-r border-gray-200 bg-gray-50 md:flex md:flex-col">
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <Link href="/dashboard" className="text-lg font-bold text-gray-900">
          LOGOTIP
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
