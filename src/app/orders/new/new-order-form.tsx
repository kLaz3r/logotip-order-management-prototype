"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { PRIORITY_LABELS } from "@/lib/utils"

interface Customer {
  id: string
  name: string
}

const PRIORITY_OPTIONS = [
  { value: "", label: "Selectează prioritatea" },
  { value: "LOW", label: PRIORITY_LABELS.LOW },
  { value: "MEDIUM", label: PRIORITY_LABELS.MEDIUM },
  { value: "HIGH", label: PRIORITY_LABELS.HIGH },
  { value: "URGENT", label: PRIORITY_LABELS.URGENT },
]

export function NewOrderForm() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingCustomers, setFetchingCustomers] = useState(true)
  const [error, setError] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [priority, setPriority] = useState("MEDIUM")
  const [deadline, setDeadline] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch("/api/customers")
        if (!res.ok) throw new Error("Eroare la încărcarea clienților")
        const data = await res.json()
        setCustomers(data)
      } catch {
        setError("Nu s-au putut încărca clienții")
      } finally {
        setFetchingCustomers(false)
      }
    }
    loadCustomers()
  }, [])

  const customerOptions = [
    { value: "", label: "Selectează clientul" },
    ...customers.map((c: Customer) => ({ value: c.id, label: c.name })),
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Titlul este obligatoriu")
      return
    }
    if (!customerId) {
      setError("Clientul este obligatoriu")
      return
    }

    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        customerId,
        priority,
      }
      if (description.trim()) body.description = description.trim()
      if (deadline) body.deadline = new Date(deadline).toISOString()
      if (notes.trim()) body.notes = notes.trim()

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Eroare la crearea comenzii")
      }
      const order = await res.json()
      router.push(`/orders/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la crearea comenzii")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Comandă nouă</h1>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Detalii comandă</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Titlu <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Denumire comandă"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Descriere
              </label>
              <Textarea
                placeholder="Descrierea comenzii..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Client <span className="text-red-500">*</span>
              </label>
              <Select
                options={customerOptions}
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                disabled={fetchingCustomers}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Prioritate
                </label>
                <Select
                  options={PRIORITY_OPTIONS}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Termen limită
                </label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Note interne
              </label>
              <Textarea
                placeholder="Note suplimentare..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/orders")}
                disabled={loading}
              >
                Anulează
              </Button>
              <Button type="submit" disabled={loading || fetchingCustomers}>
                {loading ? "Se creează..." : "Creează comanda"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
