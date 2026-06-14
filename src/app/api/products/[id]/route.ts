import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 })
  }

  const { id } = await params
  const data = await request.json()
  const product = await prisma.product.update({ where: { id }, data })
  return NextResponse.json(product)
}
