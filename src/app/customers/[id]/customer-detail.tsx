"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
} from "@/components/ui/table"
import {
  cn,
  formatDate,
  formatPrice,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/utils"

interface Order {
  id: string
  title: string
  status: string
  totalPrice: number
  createdAt: string
  deadline: string | null
  createdBy: { name: string }
  _count: { items: number; files: number }
}

interface Customer {
  id: string
  name: string
  company: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  createdAt: string
  orders: Order[]
}

export function CustomerDetail() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const res = await fetch(`/api/customers/${id}`)
        if (!res.ok) {
          if (res.status === 404) {
            router.push("/customers")
            return
          }
          throw new Error("Eroare la încărcare")
        }
        const data: Customer = await res.json()
        setCustomer(data)
        setName(data.name)
        setCompany(data.company || "")
        setPhone(data.phone || "")
        setEmail(data.email || "")
        setAddress(data.address || "")
        setNotes(data.notes || "")
      } catch {
        setError("Nu s-au putut încărca datele clientului")
      } finally {
        setLoading(false)
      }
    }
    fetchCustomer()
  }, [id, router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!name.trim()) {
      setError("Numele este obligatoriu")
      return
    }

    setSaving(true)
    try {
      const body: Record<string, unknown> = { name: name.trim() }
      body.company = company.trim() || null
      body.phone = phone.trim() || null
      body.email = email.trim() || null
      body.address = address.trim() || null
      body.notes = notes.trim() || null

      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Eroare la salvare")
      }
      const updated = await res.json()
      setCustomer(updated)
      setSuccess("Client salvat cu succes")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la salvare")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-gray-500">Client negăsit</p>
        <Link
          href="/customers"
          className="mt-2 text-sm font-medium text-blue-600 hover:underline"
        >
          Înapoi la clienți
        </Link>
      </div>
    )
  }

  const totalOrders = customer.orders.length
  const activeOrders = customer.orders.filter(
    (o) => o.status !== "RIDICAT" && o.status !== "FINALIZAT"
  ).length
  const totalValue = customer.orders.reduce((sum, o) => sum + o.totalPrice, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/customers")}>
          ← Înapoi
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            <p className="text-sm text-gray-500">Total comenzi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{activeOrders}</p>
            <p className="text-sm text-gray-500">Comenzi active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {formatPrice(totalValue)}
            </p>
            <p className="text-sm text-gray-500">Valoare totală</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Detalii client</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nume <span className="text-red-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Companie
              </label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Telefon
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Adresă
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Note
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Se salvează..." : "Salvează"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Istoric comenzi</h2>
        </CardHeader>
        <CardContent>
          {customer.orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Acest client nu are nicio comandă
            </p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Comandă</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell className="text-right">Total</TableHeaderCell>
                  <TableHeaderCell>Creată</TableHeaderCell>
                  <TableHeaderCell>Termen</TableHeaderCell>
                  <TableHeaderCell>Creată de</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customer.orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <TableCell className="font-medium text-gray-900">
                      {order.title}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          STATUS_COLORS[order.status] ||
                            "bg-gray-100 text-gray-800 border-gray-300"
                        )}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(order.totalPrice)}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {order.deadline ? formatDate(order.deadline) : "—"}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {order.createdBy.name}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
