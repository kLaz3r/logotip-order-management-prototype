import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
  }

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { orders: true } } },
  })

  return NextResponse.json(customers)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
  }

  const data = await request.json()
  const customer = await prisma.customer.create({ data })
  return NextResponse.json(customer, { status: 201 })
}
