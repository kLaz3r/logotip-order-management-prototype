"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
} from "@/components/ui/table"

interface Customer {
  id: string
  name: string
  company: string | null
  phone: string | null
  email: string | null
  _count: { orders: number }
}

export function CustomersList() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/customers")
        if (!res.ok) throw new Error("Eroare la încărcare")
        setCustomers(await res.json())
      } catch {
        setCustomers([])
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return customers
    const q = search.toLowerCase()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q))
    )
  }, [customers, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clienți</h1>
        <Link href="/customers/new">
          <Button>Client nou</Button>
        </Link>
      </div>

      <Input
        placeholder="Caută după nume sau companie..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="sm:max-w-sm"
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16">
          <p className="text-sm text-gray-500">
            {search.trim() ? "Niciun client găsit" : "Niciun client înregistrat"}
          </p>
          {!search.trim() && (
            <Link
              href="/customers/new"
              className="mt-2 text-sm font-medium text-blue-600 hover:underline"
            >
              Înregistrează primul client
            </Link>
          )}
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Nume</TableHeaderCell>
              <TableHeaderCell>Companie</TableHeaderCell>
              <TableHeaderCell>Telefon</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell className="text-right">Comenzi</TableHeaderCell>
              <TableHeaderCell className="text-right">Acțiuni</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((customer) => (
              <TableRow
                key={customer.id}
                className="cursor-pointer"
                onClick={() => router.push(`/customers/${customer.id}`)}
              >
                <TableCell className="font-medium text-gray-900">
                  {customer.name}
                </TableCell>
                <TableCell className="text-gray-500">
                  {customer.company || "—"}
                </TableCell>
                <TableCell className="text-gray-500">
                  {customer.phone || "—"}
                </TableCell>
                <TableCell className="text-gray-500">
                  {customer.email || "—"}
                </TableCell>
                <TableCell className="text-right">
                  {customer._count.orders}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/customers/${customer.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Editează
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
