"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Autentificare eșuată")
      }

      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafb] p-4 dark:bg-[#0f0f14]">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <Image
              src="/logotip.png"
              alt="LOGOTIP"
              width={48}
              height={48}
              className="mx-auto mb-3"
            />
            <h1 className="text-2xl font-bold text-brand-purple dark:text-brand-orange">LOGOTIP</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Autentificare sistem management
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplu.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Parolă
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Se încarcă..." : "Autentificare"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
