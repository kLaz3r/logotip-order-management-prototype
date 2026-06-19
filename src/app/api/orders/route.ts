import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { fuzzyMatch } from "@/lib/search"

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const customerId = searchParams.get("customerId")

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (customerId) where.customerId = customerId

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
    orderBy: { createdAt: "desc" },
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
  const order = await prisma.order.create({
    data: {
      ...data,
      createdById: session.id,
    },
    include: {
      customer: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(order, { status: 201 })
}
