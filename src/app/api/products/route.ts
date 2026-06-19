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
  const category = searchParams.get("category")
  const activeOnly = searchParams.get("active") !== "false"

  const where: Record<string, unknown> = {}
  if (activeOnly) where.active = true
  if (category) where.category = category

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  })

  if (search) {
    const filtered = products.filter(
      (p) =>
        fuzzyMatch(search, p.name) ||
        fuzzyMatch(search, p.category) ||
        (p.subcategory && fuzzyMatch(search, p.subcategory)) ||
        (p.format && fuzzyMatch(search, p.format)) ||
        (p.quantityRange && fuzzyMatch(search, p.quantityRange)) ||
        fuzzyMatch(search, p.unit) ||
        (p.notes && fuzzyMatch(search, p.notes))
    )
    return NextResponse.json(filtered)
  }

  return NextResponse.json(products)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 })
  }

  const data = await request.json()
  const product = await prisma.product.create({ data })
  return NextResponse.json(product, { status: 201 })
}
