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
  const search = searchParams.get("search")

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { orders: true } } },
  })

  if (search) {
    const filtered = customers.filter(
      (c) =>
        fuzzyMatch(search, c.name) ||
        (c.company && fuzzyMatch(search, c.company)) ||
        (c.phone && fuzzyMatch(search, c.phone)) ||
        (c.email && fuzzyMatch(search, c.email)) ||
        (c.address && fuzzyMatch(search, c.address))
    )
    return NextResponse.json(filtered)
  }

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
