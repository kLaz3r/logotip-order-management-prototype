import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { fuzzyMatch } from "@/lib/search"
import type { Prisma } from "@/generated/prisma/client"

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const customerId = searchParams.get("customerId")
  const sortByParam = searchParams.get("sortBy") || "createdAt"
  const sortOrderParam = searchParams.get("sortOrder") || "desc"

  const ALLOWED_SORT_FIELDS = ["createdAt", "deadline", "totalPrice", "title", "customerName"]
  const sortBy = ALLOWED_SORT_FIELDS.includes(sortByParam) ? sortByParam : "createdAt"
  const sortOrder = (sortOrderParam === "asc" || sortOrderParam === "desc") ? sortOrderParam : "desc"

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (customerId) where.customerId = customerId

  const orderBy =
    sortBy === "customerName"
      ? { customer: { name: sortOrder as "asc" | "desc" } }
      : { [sortBy]: sortOrder }

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      items: {
        select: { product: { select: { name: true, category: true } } },
      },
      _count: { select: { items: true, files: true } },
    },
    orderBy,
  })

  if (search) {
    const filtered = orders.filter((o) => {
      if (fuzzyMatch(search, o.title)) return true
      if (fuzzyMatch(search, o.customer.name)) return true
      if (
        o.items.some(
          (i) =>
            fuzzyMatch(search, i.product.name) ||
            fuzzyMatch(search, i.product.category)
        )
      )
        return true
      return false
    })
    return NextResponse.json(filtered)
  }

  return NextResponse.json(orders)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
  }

  const data = await request.json()

  if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
    return NextResponse.json({ error: "Titlul este obligatoriu" }, { status: 400 })
  }
  if (!data.customerId || typeof data.customerId !== "string") {
    return NextResponse.json({ error: "Clientul este obligatoriu" }, { status: 400 })
  }

  const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"]
  const safeData: Record<string, unknown> = {
    title: data.title.trim(),
    customerId: data.customerId,
    createdById: session.id,
    status: "NOU",
    priority: VALID_PRIORITIES.includes(data.priority) ? data.priority : "MEDIUM",
  }
  if (typeof data.description === "string" && data.description.trim()) {
    safeData.description = data.description.trim()
  }
  if (data.deadline && typeof data.deadline === "string") {
    safeData.deadline = new Date(data.deadline)
  }
  if (typeof data.notes === "string" && data.notes.trim()) {
    safeData.notes = data.notes.trim()
  }

  const order = await prisma.order.create({
    data: safeData as Prisma.OrderCreateInput,
    include: {
      customer: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(order, { status: 201 })
}
