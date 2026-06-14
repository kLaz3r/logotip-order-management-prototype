import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"

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
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { customer: { name: { contains: search } } },
    ]
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { items: true, files: true } },
    },
    orderBy: { createdAt: "desc" },
  })

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
