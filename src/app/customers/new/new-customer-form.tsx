"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export function NewCustomerForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Numele este obligatoriu")
      return
    }

    setLoading(true)
    try {
      const body: Record<string, unknown> = { name: name.trim() }
      if (company.trim()) body.company = company.trim()
      if (phone.trim()) body.phone = phone.trim()
      if (email.trim()) body.email = email.trim()
      if (address.trim()) body.address = address.trim()
      if (notes.trim()) body.notes = notes.trim()

      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Eroare la crearea clientului")
      }
      const customer = await res.json()
      router.push(`/customers/${customer.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la crearea clientului")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-purple">Client nou</h1>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Informații client</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nume <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nume client sau persoană de contact"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Companie
              </label>
              <Input
                placeholder="Denumire firmă"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Telefon
                </label>
                <Input
                  placeholder="07xx xxx xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="email@exemplu.ro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adresă
              </label>
              <Input
                placeholder="Adresa completă"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Note
              </label>
              <Textarea
                placeholder="Observații despre client..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/customers")}
                disabled={loading}
              >
                Anulează
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Se creează..." : "Creează clientul"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
