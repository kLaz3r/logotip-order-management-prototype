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
    <aside className="hidden w-60 border-r border-gray-200 bg-brand-purple/[0.02] md:flex md:flex-col dark:border-gray-800 dark:bg-[#111118]">
      <div className="flex h-14 items-center border-b border-gray-200 px-4 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-bold text-brand-purple dark:text-brand-orange">
            LOGOTIP
            <sup className="ml-1 rounded bg-brand-orange/20 px-1 py-px text-[10px] font-semibold text-brand-orange">BETA</sup>
          </span>
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
                ? "bg-brand-purple/10 text-brand-purple dark:bg-brand-purple/20 dark:text-brand-orange"
                : "text-gray-600 hover:bg-brand-purple/5 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
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
