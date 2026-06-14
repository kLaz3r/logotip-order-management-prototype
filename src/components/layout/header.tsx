"use client"

import { useRouter } from "next/navigation"

interface HeaderProps {
  userName: string
  userRole: string
}

export function Header({ userName, userRole }: HeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      <button className="text-gray-500 hover:text-gray-700 md:hidden">
        ☰
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-600">{userName}</span>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
          {userRole}
        </span>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-600 transition-colors"
          title="Deconectare"
        >
          ⏻
        </button>
      </div>
    </header>
  )
}
