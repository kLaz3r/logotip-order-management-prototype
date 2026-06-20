"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  cn,
  formatDate,
  STATUS_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/lib/utils"
import { fuzzyMatch } from "@/lib/search"

interface KanbanOrder {
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

const KANBAN_STATUSES = [
  "NOU",
  "IN_LUCRU",
  "ASTEAPTA_CLIENT",
  "FINALIZAT",
  "RIDICAT",
] as const

const COLUMN_HEADER_COLORS: Record<string, string> = {
  NOU: "bg-blue-500",
  IN_LUCRU: "bg-yellow-500",
  ASTEAPTA_CLIENT: "bg-orange-500",
  FINALIZAT: "bg-green-500",
  RIDICAT: "bg-gray-500",
}

export function KanbanBoard() {
  const [orders, setOrders] = useState<KanbanOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeOrder, setActiveOrder] = useState<KanbanOrder | null>(null)
  const [search, setSearch] = useState("")
  const [myOrdersOnly, setMyOrdersOnly] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const initialised = useRef(false)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((u) => setUserId(u.id))
      .catch(() => {})
  }, [])

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" })
      if (!res.ok) throw new Error("Eroare la încărcarea comenzilor")
      const data = await res.json()
      setOrders(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialised.current) return
    initialised.current = true
    fetchOrders()
  }, [fetchOrders])

  function handleDragStart(event: DragStartEvent) {
    const order = orders.find((o) => o.id === event.active.id)
    if (order) setActiveOrder(order)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveOrder(null)

    const { active, over } = event
    if (!over) return

    const orderId = active.id as string
    const newStatus = over.id as string

    if (!KANBAN_STATUSES.includes(newStatus as typeof KANBAN_STATUSES[number]))
      return

    const order = orders.find((o) => o.id === orderId)
    if (!order || order.status === newStatus) return

    const previousOrders = orders
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      )
    )

    fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Eroare la actualizare")
        return fetchOrders()
      })
      .catch(() => {
        setOrders(previousOrders)
      })
  }

  function getOrdersByStatus(status: string): KanbanOrder[] {
    let filtered = orders.filter((o) => o.status === status)
    if (myOrdersOnly && userId) {
      filtered = filtered.filter((o) => o.createdBy.id === userId)
    }
    if (search.trim()) {
      const q = search.trim()
      filtered = filtered.filter(
        (o) =>
          fuzzyMatch(q, o.title) ||
          fuzzyMatch(q, o.customer.name)
      )
    }
    return filtered
  }

  const displayOrders = myOrdersOnly && userId
    ? orders.filter((o) => o.createdBy.id === userId)
    : orders
  const totalOrders = displayOrders.length
  const statusCounts = KANBAN_STATUSES.reduce(
    (acc, s) => {
      acc[s] = getOrdersByStatus(s).length
      return acc
    },
    {} as Record<string, number>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {KANBAN_STATUSES.map((status) => (
            <div
              key={status}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="mb-3 h-5 w-24 animate-pulse rounded bg-gray-200" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-lg bg-gray-100"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-full bg-red-100 p-4">
          <span className="text-2xl">⚠</span>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          Eroare la încărcare
        </h2>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <Button className="mt-4" onClick={fetchOrders} variant="outline">
          Reîncearcă
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Panou de control</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestionați comenzile prin tragere și plasare
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Caută după titlu sau client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <div className="inline-flex rounded-md border border-gray-300 bg-gray-50 p-0.5">
          <button
            type="button"
            onClick={() => setMyOrdersOnly(false)}
            className={cn(
              "rounded px-3 py-1.5 text-sm font-medium transition-colors",
              !myOrdersOnly
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Toate
          </button>
          <button
            type="button"
            onClick={() => setMyOrdersOnly(true)}
            className={cn(
              "rounded px-3 py-1.5 text-sm font-medium transition-colors",
              myOrdersOnly
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Ale mele
          </button>
        </div>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {KANBAN_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              orders={getOrdersByStatus(status)}
              count={statusCounts[status]}
            />
          ))}
        </div>

        <DragOverlay>
          {activeOrder && (
            <div className="w-72 rotate-1 rounded-lg border-2 border-blue-400 bg-white p-3 shadow-xl">
              <OrderCardContent order={activeOrder} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {totalOrders === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16">
          <span className="text-3xl">📋</span>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nicio comandă
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Creați o comandă nouă pentru a începe
          </p>
          <Link
            href="/orders/new"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Comandă nouă
          </Link>
        </div>
      )}
    </div>
  )
}

function KanbanColumn({
  status,
  orders,
  count,
}: {
  status: string
  orders: KanbanOrder[]
  count: number
}) {
  return (
    <div className="flex min-h-[200px] flex-col rounded-lg border border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2 px-3 py-2">
        <div
          className={cn("h-2.5 w-2.5 rounded-full", COLUMN_HEADER_COLORS[status])}
        />
        <h3 className="text-sm font-semibold text-gray-700">
          {STATUS_LABELS[status]}
        </h3>
        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-xs font-medium text-gray-600">
          {count}
        </span>
      </div>
      <DroppableColumn id={status}>
        <div className="flex-1 space-y-2 p-2">
          {orders.map((order) => (
            <DraggableCard key={order.id} id={order.id} order={order} />
          ))}
          {orders.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 py-8">
              <p className="text-xs text-gray-400">Trageți comenzi aici</p>
            </div>
          )}
        </div>
      </DroppableColumn>
    </div>
  )
}

function DroppableColumn({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 transition-colors",
        isOver && "bg-blue-50"
      )}
    >
      {children}
    </div>
  )
}

function DraggableCard({
  id,
  order,
}: {
  id: string
  order: KanbanOrder
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { order, status: order.status },
    })

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined

  return (
    <Link
      ref={setNodeRef}
      href={`/orders/${order.id}`}
      {...listeners}
      {...attributes}
      style={style}
      className={cn(
        "block touch-none rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <OrderCardContent order={order} />
    </Link>
  )
}

function OrderCardContent({ order }: { order: KanbanOrder }) {
  const isOverdue =
    order.deadline && new Date(order.deadline) < new Date() && order.status !== "FINALIZAT" && order.status !== "RIDICAT"

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium text-gray-900">
          {order.title}
        </p>
        <Badge
          className={cn(
            "shrink-0 text-[10px]",
            PRIORITY_COLORS[order.priority] || "bg-gray-100 text-gray-600"
          )}
        >
          {PRIORITY_LABELS[order.priority] || order.priority}
        </Badge>
      </div>

      <p className="text-xs text-gray-500">{order.customer.name}</p>

      <div className="flex items-center justify-between">
        {order.deadline ? (
          <span
            className={cn(
              "text-xs",
              isOverdue ? "font-medium text-red-600" : "text-gray-500"
            )}
          >
            {isOverdue ? "⚠ " : ""}
            {formatDate(order.deadline)}
          </span>
        ) : (
          <span className="text-xs text-gray-400">Fără termen</span>
        )}
        {order.createdBy.name && (
          <span className="text-xs text-gray-400 truncate max-w-[100px]">
            {order.createdBy.name}
          </span>
        )}
      </div>
    </div>
  )
}
