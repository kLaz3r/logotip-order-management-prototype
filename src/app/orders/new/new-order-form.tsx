"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { cn, PRIORITY_LABELS } from "@/lib/utils"

interface Customer {
  id: string
  name: string
  company?: string | null
  email?: string | null
  phone?: string | null
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

  const [showClientForm, setShowClientForm] = useState(false)
  const [clientSaving, setClientSaving] = useState(false)
  const [clientError, setClientError] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientCompany, setClientCompany] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [clientNotes, setClientNotes] = useState("")

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

  useEffect(() => {
    loadCustomers()
  }, [])

  const customerOptions: ComboboxOption[] = [
    { value: "", label: "Niciun client selectat" },
    ...customers.map((c) => ({
      value: c.id,
      label: c.name,
      sublabel: c.company || undefined,
      details: [
        c.email,
        c.phone,
      ].filter(Boolean) as string[],
    })),
  ]

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault()
    setClientError("")

    if (!clientName.trim()) {
      setClientError("Numele clientului este obligatoriu")
      return
    }

    setClientSaving(true)
    try {
      const body: Record<string, string> = { name: clientName.trim() }
      if (clientCompany.trim()) body.company = clientCompany.trim()
      if (clientPhone.trim()) body.phone = clientPhone.trim()
      if (clientEmail.trim()) body.email = clientEmail.trim()
      if (clientAddress.trim()) body.address = clientAddress.trim()
      if (clientNotes.trim()) body.notes = clientNotes.trim()

      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Eroare la crearea clientului")
      }
      const newCustomer: Customer = await res.json()

      await loadCustomers()
      setCustomerId(newCustomer.id)

      setClientName("")
      setClientCompany("")
      setClientPhone("")
      setClientEmail("")
      setClientAddress("")
      setClientNotes("")
      setShowClientForm(false)
    } catch (err) {
      setClientError(err instanceof Error ? err.message : "Eroare la crearea clientului")
    } finally {
      setClientSaving(false)
    }
  }

  function handleCloseClientForm() {
    setShowClientForm(false)
    setClientError("")
    setClientName("")
    setClientCompany("")
    setClientPhone("")
    setClientEmail("")
    setClientAddress("")
    setClientNotes("")
  }

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-purple">Comandă nouă</h1>

      <div
        className={cn(
          "flex justify-center gap-6",
          showClientForm ? "flex-col lg:flex-row" : ""
        )}
      >
        <div className={cn("flex-1", showClientForm ? "max-w-lg" : "mx-auto max-w-2xl")}>
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
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Client <span className="text-red-500">*</span>
                    </label>
                    {!showClientForm && (
                      <button
                        type="button"
                        className="text-sm font-medium text-brand-teal hover:underline"
                        onClick={() => setShowClientForm(true)}
                      >
                        + Client nou
                      </button>
                    )}
                  </div>
                  <Combobox
                    options={customerOptions}
                    value={customerId}
                    placeholder="Caută client după nume, firmă, email, telefon..."
                    disabled={fetchingCustomers}
                    required
                    onChange={(v: string) => setCustomerId(v)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Prioritate
                    </label>
                    <Combobox
                      options={PRIORITY_OPTIONS}
                      value={priority}
                      placeholder="Selectează prioritatea"
                      onChange={(v) => setPriority(v)}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
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

        {showClientForm && (
          <div className="w-full lg:w-96">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Adaugă client nou</h2>
                  <button
                    type="button"
                    className="rounded p-1 text-gray-400 hover:text-gray-600"
                    onClick={handleCloseClientForm}
                  >
                    ✕
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateClient} className="space-y-4">
                  {clientError && (
                    <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {clientError}
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nume <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Nume client sau companie"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Companie
                    </label>
                    <Input
                      placeholder="Denumire firmă"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Telefon
                    </label>
                    <Input
                      placeholder="Număr de telefon"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="Adresă email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Adresă
                    </label>
                    <Input
                      placeholder="Adresa completă"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Note
                    </label>
                    <Textarea
                      placeholder="Observații..."
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseClientForm}
                      disabled={clientSaving}
                    >
                      Anulează
                    </Button>
                    <Button type="submit" disabled={clientSaving}>
                      {clientSaving ? "Se salvează..." : "Salvează clientul"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
