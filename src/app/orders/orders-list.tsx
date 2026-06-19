"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
} from "@/components/ui/table"
import { cn, formatDate, formatPrice, STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/utils"

interface Order {
  id: string
  title: string
  status: string
  priority: string
  deadline: string | null
  totalPrice: number
  customer: { id: string; name: string }
  createdBy: { id: string; name: string }
  _count: { items: number; files: number }
}

const STATUS_OPTIONS = [
  { value: "", label: "Toate statusurile" },
  { value: "NOU", label: "Nou" },
  { value: "IN_LUCRU", label: "În lucru" },
  { value: "ASTEAPTA_CLIENT", label: "Așteaptă client" },
  { value: "FINALIZAT", label: "Finalizat" },
  { value: "RIDICAT", label: "Ridicat" },
]

export function OrdersList() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const fetchOrders = useCallback(async (s: string, st: string) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (s) qs.set("search", s)
      if (st) qs.set("status", st)
      const res = await fetch(`/api/orders?${qs.toString()}`)
      if (!res.ok) throw new Error("Eroare la încărcare")
      setOrders(await res.json())
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchOrders(search, status)
    }, 150)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, status, fetchOrders])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Comenzi</h1>
        <Link href="/orders/new">
          <Button>Comandă nouă</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Caută după titlu, client sau produs comandat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <Combobox
          options={STATUS_OPTIONS}
          value={status}
          placeholder="Toate statusurile"
          onChange={(v) => setStatus(v)}
          className="sm:max-w-[200px]"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16">
          <p className="text-sm text-gray-500">Nicio comandă găsită</p>
          <Link
            href="/orders/new"
            className="mt-2 text-sm font-medium text-blue-600 hover:underline"
          >
            Creează prima comandă
          </Link>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Titlu</TableHeaderCell>
              <TableHeaderCell>Client</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Prioritate</TableHeaderCell>
              <TableHeaderCell>Termen</TableHeaderCell>
              <TableHeaderCell className="text-right">Total</TableHeaderCell>
              <TableHeaderCell className="text-right">Acțiuni</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <TableCell className="font-medium text-gray-900">{order.title}</TableCell>
                <TableCell>{order.customer.name}</TableCell>
                <TableCell>
                  <Badge className={cn(STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800 border-gray-300")}>
                    {STATUS_LABELS[order.status] || order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={cn(PRIORITY_COLORS[order.priority] || "bg-gray-100 text-gray-600", "border-transparent")}>
                    {PRIORITY_LABELS[order.priority] || order.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500">
                  {order.deadline ? formatDate(order.deadline) : "—"}
                </TableCell>
                <TableCell className="text-right font-medium text-gray-900">
                  {formatPrice(order.totalPrice)}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/orders/${order.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Detalii
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
