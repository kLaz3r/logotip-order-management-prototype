import { ReactNode } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { getCurrentUser } from "@/lib/auth"

interface AppLayoutProps {
  children: ReactNode
}

export async function AppLayout({ children }: AppLayoutProps) {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header userName={user?.name || ""} userRole={user?.role || ""} />
        <main className="flex-1 overflow-auto bg-[#fafafb] p-4 md:p-6 dark:bg-[#0f0f14]">
          {children}
        </main>
      </div>
    </div>
  )
}
