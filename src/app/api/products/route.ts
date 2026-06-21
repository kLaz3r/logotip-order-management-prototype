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

  if (!data.category || typeof data.category !== "string" || !data.category.trim()) {
    return NextResponse.json({ error: "Categoria este obligatorie" }, { status: 400 })
  }
  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    return NextResponse.json({ error: "Numele este obligatoriu" }, { status: 400 })
  }
  if (!data.unit || typeof data.unit !== "string" || !data.unit.trim()) {
    return NextResponse.json({ error: "Unitatea este obligatorie" }, { status: 400 })
  }
  if (typeof data.basePrice !== "number" || data.basePrice < 0) {
    return NextResponse.json({ error: "Preț invalid" }, { status: 400 })
  }

  const safeData: Record<string, unknown> = {
    category: data.category.trim(),
    name: data.name.trim(),
    unit: data.unit.trim(),
    basePrice: data.basePrice,
    active: data.active !== false,
  }
  if (typeof data.subcategory === "string" && data.subcategory.trim()) safeData.subcategory = data.subcategory.trim()
  if (typeof data.format === "string" && data.format.trim()) safeData.format = data.format.trim()
  if (typeof data.quantityRange === "string" && data.quantityRange.trim()) safeData.quantityRange = data.quantityRange.trim()
  if (typeof data.notes === "string" && data.notes.trim()) safeData.notes = data.notes.trim()
  if (typeof data.optionType === "string") safeData.optionType = data.optionType
  if (Array.isArray(data.options)) safeData.options = data.options

  const product = await prisma.product.create({ data: safeData as Prisma.ProductCreateInput })
  return NextResponse.json(product, { status: 201 })
}
