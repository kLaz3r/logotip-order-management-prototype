import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"

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
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { category: { contains: search } },
    ]
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  })

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
